#!/usr/bin/env python3
"""Copy PeakSync SQLite records to an EMPTY, migrated PostgreSQL database.

Python 3.10+; install psycopg2-binary in an isolated virtual environment.
  python import_peaksync.py --sqlite instance/app.db --check-source
  python import_peaksync.py --sqlite instance/app.db          # dry run, rollback
  python import_peaksync.py --sqlite instance/app.db --apply  # commit

The PostgreSQL URL is requested with hidden input, never saved or printed.
An optional PEAKSYNC_IMPORT_URL environment variable can supply it instead.
This script never imports Flask, calls Stripe, runs seed.py, or writes SQLite.
It does not delete destination records or copy alembic_version.
It locks the six target tables during its transaction, verifies every value,
and transactionally restarts ID sequences. Keep the deployed app idle while
importing. Use the database owner's connection URL from Railway.
"""

import argparse
from datetime import date, datetime, time
from getpass import getpass
import math
import os
from pathlib import Path
import sqlite3
import sys

TABLES = ('memberships', 'events', 'users', 'sessions', 'signups', 'payments')
PG_TYPES = {
    'INTEGER': {'integer'},
    'FLOAT': {'double precision', 'real'},
    'VARCHAR': {'character varying', 'text'},
    'TEXT': {'character varying', 'text'},
    'BOOLEAN': {'boolean'},
    'DATETIME': {'timestamp without time zone'},
    'DATE': {'date'},
    'TIME': {'time without time zone'},
}


class ImportStopped(Exception):
    pass


def convert(value, declared_type):
    if value is None:
        return None
    if declared_type == 'BOOLEAN':
        if type(value) is not int or value not in (0, 1):
            raise ValueError('Expected 0 or 1')
        return bool(value)
    if declared_type == 'INTEGER':
        if type(value) is not int or not -(2**31) <= value < 2**31:
            raise ValueError('Expected a PostgreSQL integer')
        return value
    if declared_type == 'FLOAT':
        if type(value) not in (int, float) or not math.isfinite(value):
            raise ValueError('Expected a finite number')
        return float(value)
    if declared_type in ('VARCHAR', 'TEXT'):
        if not isinstance(value, str) or '\x00' in value:
            raise ValueError('Expected text without null bytes')
        return value
    parser = {'DATETIME': datetime.fromisoformat,
              'DATE': date.fromisoformat, 'TIME': time.fromisoformat}
    if declared_type in parser:
        parsed = parser[declared_type](value)
        if getattr(parsed, 'tzinfo', None) is not None:
            raise ValueError('Timezone-aware source value')
        return parsed
    raise ValueError('Unsupported source type')


def read_source(filename):
    path = Path(filename).expanduser().resolve(strict=True)
    connection = sqlite3.connect(path.as_uri() + '?mode=ro', uri=True)
    try:
        connection.execute('PRAGMA query_only = ON')
        connection.execute('BEGIN')
        if connection.execute('PRAGMA integrity_check').fetchall() != [('ok',)]:
            raise ImportStopped('SQLite integrity check failed.')
        if connection.execute('PRAGMA foreign_key_check').fetchall():
            raise ImportStopped('SQLite contains broken foreign-key references.')
        names = {r[0] for r in connection.execute(
            "SELECT name FROM sqlite_master WHERE type='table' "
            "AND name NOT LIKE 'sqlite_%'")}
        if names != set(TABLES) | {'alembic_version'}:
            raise ImportStopped('Unexpected or missing source tables; review schema first.')
        revisions = connection.execute('SELECT version_num FROM alembic_version').fetchall()
        if len(revisions) != 1:
            raise ImportStopped('Expected one SQLite migration revision.')
        data = {}
        for table in TABLES:
            info = connection.execute(f'PRAGMA table_info("{table}")').fetchall()
            columns = [r[1] for r in info]
            types = [r[2].upper() for r in info]
            if [r[1] for r in info if r[5]] != ['id']:
                raise ImportStopped(f'{table}: expected an id primary key.')
            rows = []
            for row in connection.execute(f'SELECT * FROM "{table}" ORDER BY id'):
                converted = []
                for column, kind, value in zip(columns, types, row):
                    try:
                        converted.append(convert(value, kind))
                    except (ValueError, TypeError, OverflowError):
                        raise ImportStopped(
                            f'{table}.{column}: incompatible value in row id '
                            f'{row[columns.index("id")]}; no values were changed.') from None
                if converted[columns.index('id')] < 1:
                    raise ImportStopped(f'{table}: IDs must be positive.')
                rows.append(tuple(converted))
            data[table] = (columns, types, rows)
        return revisions[0][0], data
    finally:
        connection.close()


def transfer(connection, revision, data, apply):
    from psycopg2 import sql
    from psycopg2.extras import execute_values

    qualified = lambda table: sql.Identifier('public', table)
    try:
        with connection.cursor() as cursor:
            cursor.execute("SET LOCAL lock_timeout = '10s'")
            cursor.execute("SET LOCAL statement_timeout = '120s'")
            cursor.execute("SET LOCAL search_path = public, pg_catalog")
            cursor.execute(sql.SQL('LOCK TABLE {} IN ACCESS EXCLUSIVE MODE').format(
                sql.SQL(', ').join(qualified(t) for t in TABLES)))
            cursor.execute('SELECT version_num FROM public.alembic_version')
            if cursor.fetchall() != [(revision,)]:
                raise ImportStopped('Source and destination migration revisions differ.')

            sequences = []
            for table in TABLES:
                columns, types, rows = data[table]
                cursor.execute(sql.SQL('SELECT COUNT(*) FROM {}').format(qualified(table)))
                if cursor.fetchone()[0] != 0:
                    raise ImportStopped(f'{table} already contains records. Import refused.')
                cursor.execute(
                    'SELECT column_name, data_type FROM information_schema.columns '
                    "WHERE table_schema='public' AND table_name=%s", (table,))
                target_types = dict(cursor.fetchall())
                if set(target_types) != set(columns):
                    raise ImportStopped(f'{table}: source and destination columns differ.')
                for column, kind in zip(columns, types):
                    if target_types[column] not in PG_TYPES.get(kind, set()):
                        raise ImportStopped(f'{table}.{column}: destination type differs.')

                cursor.execute(
                    "SELECT n.nspname, c.relname FROM pg_class c "
                    "JOIN pg_namespace n ON n.oid=c.relnamespace "
                    "WHERE c.oid=pg_get_serial_sequence(%s, 'id')::regclass "
                    "AND c.relkind='S'", ('public.' + table,))
                sequence = cursor.fetchone()
                if sequence is None:
                    raise ImportStopped(f'{table}: could not find the automatic ID sequence.')
                id_index = columns.index('id')
                next_id = max((r[id_index] for r in rows), default=0) + 1
                if next_id >= 2**31:
                    raise ImportStopped(f'{table}: ID sequence exceeds integer range.')
                sequences.append((sequence, next_id))

            for table in TABLES:
                columns, _, rows = data[table]
                identifiers = sql.SQL(', ').join(map(sql.Identifier, columns))
                if rows:
                    statement = sql.SQL('INSERT INTO {} ({}) VALUES %s').format(
                        qualified(table), identifiers)
                    execute_values(cursor, statement, rows, page_size=200)
                cursor.execute(sql.SQL('SELECT {} FROM {} ORDER BY id').format(
                    identifiers, qualified(table)))
                if cursor.fetchall() != rows:
                    raise ImportStopped(f'{table}: imported values did not match SQLite.')
                print(f'  Verified {table}: {len(rows)} rows (all column values match)')

            cursor.execute('SET CONSTRAINTS ALL IMMEDIATE')
            for (schema, name), next_id in sequences:
                # ALTER ... RESTART is transactional; unlike setval, rollback
                # restores its previous state if this is a dry run or failure.
                cursor.execute(sql.SQL('ALTER SEQUENCE {} RESTART WITH {}').format(
                    sql.Identifier(schema, name), sql.Literal(next_id)))
            if apply:
                connection.commit()
            else:
                connection.rollback()
    except BaseException:
        connection.rollback()
        raise


def main():
    parser = argparse.ArgumentParser(description=__doc__,
                                     formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument('--sqlite', required=True, help='Path to your SQLite app.db copy')
    mode = parser.add_mutually_exclusive_group()
    mode.add_argument('--check-source', action='store_true', help='Validate SQLite only')
    mode.add_argument('--apply', action='store_true', help='Commit import (default: dry run)')
    args = parser.parse_args()
    revision, data = read_source(args.sqlite)
    print(f'SQLite checks passed. Migration revision: {revision}')
    for table in TABLES:
        print(f'  {table}: {len(data[table][2])} rows')
    if args.check_source:
        print('Source is readable and consistent. No destination connection was made.')
        return
    try:
        import psycopg2
    except ImportError:
        raise ImportStopped('Install psycopg2-binary in your virtual environment first.')

    url = os.environ.get('PEAKSYNC_IMPORT_URL')
    if not url:
        if not sys.stdin.isatty():
            raise ImportStopped('Run in an interactive terminal for the hidden URL prompt.')
        url = getpass('Paste Railway DATABASE_PUBLIC_URL (hidden), then press Enter: ').strip()
    if not url.startswith(('postgresql://', 'postgres://')):
        raise ImportStopped('Expected a complete postgresql:// connection URL.')
    parameters = psycopg2.extensions.parse_dsn(url)
    if not all(parameters.get(k) for k in ('host', 'user', 'password', 'dbname')):
        raise ImportStopped('The connection URL is missing required fields.')
    if parameters['host'].endswith('.railway.internal'):
        raise ImportStopped('Use DATABASE_PUBLIC_URL when running from your computer.')
    print('Target host:', parameters['host'])
    print('Target database:', parameters['dbname'])
    print('Mode:', 'APPLY: save imported records' if args.apply else 'DRY RUN: roll back all writes')
    if args.apply and input('Type IMPORT to confirm this destination: ').strip() != 'IMPORT':
        raise ImportStopped('Import cancelled.')
    # Railway public connections should use TLS. Local SSH tunnels can use the
    # same script; their URLs may specify sslmode separately.
    if parameters['host'] not in ('localhost', '127.0.0.1', '::1'):
        parameters['sslmode'] = 'require'
    parameters.update(connect_timeout=15, application_name='peaksync-sqlite-import')
    connection = psycopg2.connect(**parameters)
    try:
        transfer(connection, revision, data, args.apply)
    finally:
        connection.close()
    if args.apply:
        print('SUCCESS: all records committed and ID counters reset. SQLite was not modified.')
    else:
        print('DRY RUN PASSED: all records verified, then rolled back; nothing saved.')
        print('Run the same command with --apply to save the import.')


if __name__ == '__main__':
    try:
        main()
    except ImportStopped as error:
        print('STOPPED:', error, file=sys.stderr)
        sys.exit(1)
    except (KeyboardInterrupt, EOFError):
        print('\nCancelled.', file=sys.stderr)
        sys.exit(1)
    except Exception as error:
        # Driver errors can include passwords or full imported records. Do not
        # print their raw messages, SQL parameters, or tracebacks.
        print(f'FAILED: {type(error).__name__}; SQLSTATE '
              f'{getattr(error, "pgcode", None) or "n/a"}.', file=sys.stderr)
        print('No successful import was confirmed. No source data was modified. '
              'Check connectivity/schema before retrying; a nonempty destination '
              'will be refused. Share only this error code, never the URL.', file=sys.stderr)
        sys.exit(1)
