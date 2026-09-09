#!/usr/bin/env python3

# Standard library imports

# Remote library imports
# from flask import request, jsonify
from flask_restful import Resource
from flask import request, make_response, session, redirect
from flask_cors import CORS
from sqlalchemy import desc, or_
# Local imports
from config import app, db, api
from models import User, Membership, Event, Signup, Payment, Session

from datetime import datetime, timedelta

CORS(app)

import stripe
stripe.api_key = 'sk_test_51NBMlfBoM5Q6sMKnOSgo4QBNYWSJQS1SZ9KY559Li3ZZDCw2bm95qgKrDQ80LJkBq5paMqGKiF2cATnNJO796srX007Nk47WFY'
YOUR_DOMAIN = 'http://127.0.0.1:5555'
LOCAL_DOMAIN = 'http://localhost:4000'
# Views go here!

@app.route('/')
def home():
    return ''

@app.route('/create_new_stripe_product', methods=['POST'])
def create_new_stripe_product():
    if request.method == 'POST':
        try:
            form_data = request.get_json()
            name = form_data['name']
            price = form_data['price']

            new_stripe_product = stripe.Product.create(
                name=name,
                default_price_data={
                    'currency': 'usd',
                    'unit_amount_decimal': price
                },
            )

            response = make_response({"success": f"new stripe product of id {new_stripe_product.id} created and posted to database"})

        except:
            response = make_response({"error": "could not create new product or offering"}, 404)
    
    return response

@app.route('/update_stripe_membership_product', methods=['POST'])
def update_stripe_product_price():
    form_data = request.get_json()
    product_id = form_data['stripe_product_id']
    price_id = form_data['stripe_price_id']

    new_name = form_data['name']
    # new_description = form_data['description']
    new_price = form_data['price']

    membership = Membership.query.filter(Membership.stripe_price_id == price_id).one_or_none()
    if membership:
        try:
            new_stripe_price = stripe.Price.create(
                unit_amount=new_price,
                currency='usd',
                product=product_id
            )
            print(new_stripe_price, new_stripe_price.id)
            updated_stripe_product = stripe.Product.retrieve(product_id)
            updated_stripe_product.name = new_name
            # updated_stripe_product.description = new_description
            updated_stripe_product.save()
            # membership.stripe_price_id = new_stripe_price.id
            setattr(membership, 'stripe_price_id', new_stripe_price.id)
            db.session.commit()
            response = make_response({"success": f"stripe price with id {price_id} price updated to new id of {new_stripe_price.id}"}, 200)

        except:
            response = make_response({"error": f"404: could not update stripe product of id {product_id}"}, 404)
    else:
        response = make_response({"error": "404: could not find membership of id {membership.id}"}, 404)

    return response

@app.route('/update_stripe_event_product', methods=['POST'])
def update_stripe_event_product_price():
    form_data = request.get_json()
    product_id = form_data['stripe_product_id']
    price_id = form_data['stripe_price_id']

    # new_name = form_data['name']
    # new_description = form_data['description']
    new_price = form_data['price']

    event = Event.query.filter(Event.stripe_price_id == price_id).one_or_none()
    if event:
        try:
            new_stripe_price = stripe.Price.create(
                unit_amount=new_price,
                currency='usd',
                product=product_id
            )
            print(new_stripe_price, new_stripe_price.id)
            event.stripe_price_id = new_stripe_price.id
            setattr(event, 'stripe_price_id', new_stripe_price.id)
            db.session.commit()
            response = make_response({"success": f"stripe price with id {price_id} price updated with new id of {new_stripe_price.id}"}, 200)

        except:
            response = make_response({"error": f"404: could not update stripe product of id {product_id}"}, 404)
    else:
        response = make_response({"error": "404: could not find event of id {membership.id}"}, 404)

    return response

@app.route('/create-event-checkout-session/<int:event_id>/<int:session_id>/<int:user_id>', methods=['POST'])
def create_event_checkout_session(event_id, session_id, user_id):
    event = Event.query.filter(Event.id == event_id).one_or_none()

    try:
        checkout_session = stripe.checkout.Session.create(
            line_items=[
                {
                    'price': event.stripe_price_id,
                    'quantity': 1,
                },
            ],
            mode='payment',
            success_url=LOCAL_DOMAIN + '/signup/success',
            cancel_url=LOCAL_DOMAIN + '/signup/cancelled'
        )
        new_signup = Signup(
            user_id=user_id,
            session_id=session_id
            # paid ?
        )
        db.session.add(new_signup)
        db.session.commit()
        new_payment = Payment(
            user_id=user_id,
            # signup_id=new_signup.id,
            stripe_payment_id=checkout_session.id,
            successful=True
        )
        db.session.add(new_payment)
        db.session.commit()
    except Exception as e:
        return str(e)
    
    return redirect(checkout_session.url, code=303)

@app.route('/create-membership-checkout-session/<int:membership_id>/<int:user_id>', methods=['POST'])
def create_membership_checkout_session(membership_id, user_id):
    membership = Membership.query.filter(Membership.id == membership_id).one_or_none()
    user = User.query.filter(User.id == user_id).one_or_none()

    try:
        checkout_session = stripe.checkout.Session.create(
            line_items=[
                {
                    'price': membership.stripe_price_id,
                    'quantity': 1,
                },
            ],
            mode='payment',
            success_url = LOCAL_DOMAIN + '/purchase/membership/success',
            cancel_url=LOCAL_DOMAIN + '/purchase/membership/cancelled'
        )
        print(checkout_session.id)
        new_payment = Payment(
            user_id=user.id,
            membership_id=membership.id,
            stripe_payment_id=checkout_session.id
        )
        db.session.add(new_payment)
        db.session.commit()
    except Exception as e:
        return str(e)

    return redirect(checkout_session.url, code=303)

@app.route('/last_user_signup/<int:id>', methods=['GET'])
def last_user_signup(id):
    if request.method == 'GET':
        user = User.query.filter(User.id == id).first()
        if user:
            user_dict = user.to_dict()
            response = make_response(user_dict, 200)
        else:
            response = {"error": f"user of id {id} not found"}
    return response

@app.route('/last-user-membership-purchase/<int:user_id>', methods=['GET'])
def last_user_membership_purchase(user_id):
    # user = User.query.filter(User.id == session['user_id']).one_or_none() ==> Using session cookies to search instead us waiting on state
    last_membership_payment = Payment.query.filter_by(user_id=user_id).order_by(Payment.id.desc()).first()
    user = User.query.filter(User.id == user_id).first()
    if last_membership_payment:
        if request.method == 'GET':
            try:
                setattr(user, 'membership_id', last_membership_payment.membership_id)
                db.session.add(user)
                setattr(last_membership_payment, 'successful', True)
                db.session.commit()
                response = make_response(user.to_dict(), 200)
            except:
                response = make_response({"error": f"could not find last membership purchase with user ID of {user_id}"}, 404)

    return response

@app.route('/users', methods=['GET', 'POST'])
def users():
    if request.method == 'GET':

        print("Fetching all user profiles...")

        all_users_dict = [user.to_dict() for user in User.query.all()]
        
        if all_users_dict:
            response = make_response(all_users_dict, 200)
        
        else:
            response = make_response({"error": "Users not found."}, 404)
    
    if request.method == 'POST':

        print("Creating new user...")

        try:
            form_data = request.get_json()
            new_user = User(
                first_name=form_data['first_name'],
                last_name=form_data['last_name'],
                email=form_data['email'],
                password_hash=form_data['password'],
                phone_number=form_data['phone_number'],
                address=form_data['address'],
                city=form_data['city'],
                state=form_data['state'],
                zipcode=int(form_data['zipcode']),
                date_of_birth=form_data['date_of_birth'],
                emergency_contact_name=form_data['emergency_contact_name'],
                emergency_contact_phone_number=form_data['emergency_contact_phone_number'],
                waiver=form_data['waiver'],
                admin=bool(form_data['admin'])
            )
            db.session.add(new_user)
            db.session.commit()
            response = make_response(new_user.to_dict(), 201)
        
        except:
            response = make_response({"error": "Unsuccessful creation of new user"}, 404)

    return response

# @app.route('/users/filter', methods=['GET'])
# def filter_users():
#     if request.method == 'GET':
#         form_data = request.get_json()
#         id = int(form_data['id'])
#         first_name = form_data['first_name']
#         last_name = form_data['last_name']
#         email = form_data['email']
#         phone_number = form_data['phone_number']
#         address = form_data['address']
#         city=form_data['city'],
#         state=form_data['state'],
#         zipcode=int(form_data['zipcode']),
#         date_of_birth=form_data['date_of_birth'],
#         emergency_contact_name=form_data['emergency_contact_name'],
#         emergency_contact_phone_number=form_data['emergency_contact_phone_number'],
#         waiver=form_data['waiver']
# @app.route('/users/filter', methods=['POST'])
# def filter_users():
#     if request.method == 'POST':
#         try:
#             form_data = request.get_json()
#             search_term = form_data['search_term']

#             user_query = User.query.filter(
#                 or_(
#                     User.id == int(search_term),
#                     User.first_name.ilike(f"%{search_term}%"),
#                     User.last_name.ilike(f"%{search_term}%"),
#                     User.email.ilike(f"%{search_term}%"),
#                     User.phone_number.ilike(f"%{search_term}%"),
#                     User.address.ilike(f"%{search_term}%"),
#                     User.city.ilike(f"%{search_term}%"),
#                     User.state.ilike(f"%{search_term}%"),
#                     User.zipcode == int(search_term),
#                     User.date_of_birth.ilike(f"%{search_term}%"),
#                     User.emergency_contact_name.ilike(f"%{search_term}%"),
#                     User.emergency_contact_phone_number.ilike(f"%{search_term}%"),
#                     User.waiver.ilike(f"%{search_term}%")
#                 )
#             )

#             results = [user.to_dict() for user in user_query.all()]
#             response = make_response(jsonify(results), 200)
#         except Exception as e:
#             response = make_response({"error": f"404: could not complete query for users. {str(e)}"}, 404)
#         return response
@app.route('/users/filter', methods=['POST'])
def filter_users():
    if request.method == 'POST':
        try:
            form_data = request.get_json()
            search_term = form_data['search_term']
            column_to_search = form_data['column_to_search']

            if column_to_search == 'id':
                user_query = User.query.filter(User.id == int(search_term))
            elif column_to_search == 'customer':
                user_query = User.query.filter(
                    or_(
                        User.first_name.ilike(f"%{search_term}%"),
                        User.last_name.ilike(f"%{search_term}%")
                    )
                )
            elif column_to_search == 'email':
                user_query = User.query.filter(User.email.ilike(f"%{search_term}%"))
            elif column_to_search == 'phone_number':
                user_query = User.query.filter(User.phone_number.ilike(f"%{search_term}%"))
            elif column_to_search == 'address':
                user_query = User.query.filter(User.address.ilike(f"%{search_term}%"))
            elif column_to_search == 'city':
                user_query = User.query.filter(User.city.ilike(f"%{search_term}%"))
            elif column_to_search == 'state':
                user_query = User.query.filter(User.state.ilike(f"%{search_term}%"))
            elif column_to_search == 'zipcode':
                user_query = User.query.filter(User.zipcode == int(search_term))
            elif column_to_search == 'date_of_birth':
                user_query = User.query.filter(User.date_of_birth.ilike(f"%{search_term}%"))
            elif column_to_search == 'emergency_contact_name':
                user_query = User.query.filter(User.emergency_contact_name.ilike(f"%{search_term}%"))
            elif column_to_search == 'emergency_contact_phone_number':
                user_query = User.query.filter(User.emergency_contact_phone_number.ilike(f"%{search_term}%"))
            elif column_to_search == 'waiver':
                if search_term.lower().startswith('t'):
                    user_query = User.query.filter(User.waiver == True)
                elif search_term.lower().startswith('f'):
                    user_query = User.query.filter(User.waiver == False)
            elif column_to_search == 'admin':
                if search_term.lower().startswith('t'):
                    user_query = User.query.filter(User.waiver == True)
                elif search_term.lower().startswith('f'):
                    user_query = User.query.filter(User.waiver == False)
            else:
                user_query = {"error": "Invalid column_to_search value"}
                return make_response(user_query, 400)

            if user_query is not None:
                results = [user.to_dict() for user in user_query.all()]
                response = make_response(results, 200)
        except Exception as e:
            response = make_response({"error": f"404: could not complete query for users. {str(e)}"}, 404)
        return response

@app.route('/create-account', methods=['POST'])
def create_account():
    if request.method == 'POST':

        print("Creating new user...")

        try:
            form_data = request.get_json()
            new_user = User(
                first_name=form_data['firstName'],
                last_name=form_data['lastName'],
                email=form_data['email'],
                password_hash=form_data['password'],
                phone_number=form_data['phoneNumber'],
                address=form_data['address'],
                city=form_data['city'],
                state=form_data['state'],
                zipcode=int(form_data['zipcode']),
                date_of_birth=form_data['dateOfBirth'],
                emergency_contact_name=form_data['emergencyContactName'],
                emergency_contact_phone_number=form_data['emergencyContactPhoneNumber'],
                waiver=form_data['waiver']
                # admin=form_data['admin']
            )
            db.session.add(new_user)
            db.session.commit()
            response = make_response(new_user.to_dict(), 201)
            # response.set_cookie('user_email', new_user.email)
            session['user_id'] = new_user.id
    
        except:
            response = make_response({"error": "Unsuccessful creation of new user"}, 404)
    
    return response

@app.route('/users/<int:id>', methods=['GET', 'PATCH', 'DELETE'])
def user_by_id(id):

    user = User.query.filter(User.id == id).one_or_none()
    
    if user:

        if request.method == 'GET':
            response = make_response(user.to_dict(), 200)

        if request.method == 'PATCH':
            try:
                form_data = request.get_json()
                for attr in form_data:
                    setattr(user, attr, form_data[attr])
                db.session.add(user)
                db.session.commit()
                response = make_response(user.to_dict(), 200)
            except:
                response = make_response({"error": f"404: Could not update user of id {id}."}, 404)

        if request.method == 'DELETE':
            try:
                db.session.delete(user)
                db.session.commit()
                response = make_response({"success": f"User of id {id} deleted."}, 200)
            except:
                response = make_response({"error": f"User of id {id} not deleted"}, 404)
    
    else:
        response = make_response({"error": f"404: User of id {id} not found."})

    return response

        
@app.route('/memberships', methods=['GET', 'POST'])
def memberships():

    if request.method == 'GET':
        print("Fetching all memberships...")
        all_memberships_dict = [membership.to_dict() for membership in Membership.query.all()]
        if all_memberships_dict:
            response = make_response(all_memberships_dict, 200)
        else:
            response = make_response({"error": "Memberships not found."}, 404)

    if request.method == 'POST':
        print("Creating new memberhip...")
        try:
            form_data = request.get_json()
            if form_data['price'] != 0 and form_data['price'] != '0':
                new_stripe_product = stripe.Product.create(
                    name=form_data['name'],
                    default_price_data={
                        'currency': 'usd',
                        'unit_amount_decimal': float(int(form_data['price']) * 100)
                    },
                    # description=form_data['description']
                )
            new_membership = Membership(
                name=form_data['name'],
                price=form_data['price'],
                type=form_data['type'],
                subtype=form_data['subtype'],
                description=form_data['description'],
                stripe_product_id=new_stripe_product.id,
                stripe_price_id=new_stripe_product.default_price
            )
            db.session.add(new_membership)
            db.session.commit()
            response = make_response(new_membership.to_dict(), 200)
        except:
            response = make_response({"error": "Unsuccessful creation of new membership."}, 404)

    return response

@app.route('/memberships/<int:id>', methods=['GET', 'PATCH', 'DELETE'])
def membership_by_id(id):

    membership = Membership.query.filter(Membership.id == id).one_or_none()
    
    if membership:
    
        if request.method == 'GET':
            response = make_response(membership.to_dict(), 200)

        if request.method == 'PATCH':
            try:
                form_data = request.get_json()
                for attr in form_data:
                    setattr(membership, attr, form_data[attr])
                db.session.add(membership)
                db.session.commit()
                response = make_response(membership.to_dict(), 200)
            except:
                response = make_response({"error": f"404: Could not update user of id {id}."}, 404)

        if request.method == 'DELETE':
            print(f"Deleting membership of id {id}...")
            try:
                db.session.delete(membership)
                db.session.commit()
                response = make_response({"success": f"Membership of id {id} deleted."}, 200)
            except:
                response = make_response({"error": f"Membership of id {id} not deleted"}, 404)

    else:
        response = make_response({"error": f"404: Membership of id {id} not found."})

    return response

@app.route('/events', methods=['GET', 'POST'])
def events():

    if request.method == 'GET':
        print("Fetching all events...")
        all_events_dict = [event.to_dict() for event in Event.query.all()]
        if all_events_dict:
            response = make_response(all_events_dict, 200)
        else:
            response = make_response({"error": "eventses not found."}, 404)
    
    if request.method == 'POST':
        print("Creating new events...")
        try:
            form_data = request.get_json()
            if form_data['price'] != 0 and form_data['price'] != '0':
                new_stripe_product = stripe.Product.create(
                    name=form_data['name'],
                    default_price_data={
                        'currency': 'usd',
                        'unit_amount_decimal': float(int(form_data['price']) * 100)
                    },
                )
            print(form_data['price'], type(form_data['price']))
            new_event = Event(
                name=form_data['name'],
                price=float(form_data['price']),
                category=form_data['category'],
                capacity=int(form_data['capacity']),
                hours=int(form_data['hours']),
                minutes=int(form_data['minutes']),
                description=form_data['description'],
                free_for_members=bool(form_data['free_for_members']),
                stripe_product_id=new_stripe_product.id,
                stripe_price_id=new_stripe_product.default_price
            )
            db.session.add(new_event)
            db.session.commit()
            response = make_response(new_event.to_dict(), 200)
        except Exception as e:
            db.session.rollback()
            response = make_response({"error": str(e)}, 500)

    return response

@app.route('/events/<int:id>', methods=['GET', 'PATCH', 'DELETE'])
def events_by_id(id):

    one_event = Event.query.filter(Event.id == id).one_or_none()

    if one_event:
    
        if request.method == 'GET':
            response = make_response(one_event.to_dict(), 200)
    
        if request.method == 'PATCH':        
            try:
                form_data = request.get_json()
                for attr in form_data:
                    setattr(one_event, attr, form_data[attr])
                db.session.add(one_event)
                db.session.commit()
                response = make_response(one_event.to_dict(), 200)
            except:
                response = make_response({"error": f"404: Could not update user of id {id}."}, 404)
    
        if request.method == 'DELETE':
            try:
                db.session.delete(one_event)
                db.session.commit()
                response = make_response({"success": f"events of id {id} deleted."}, 200)
            except:
                response = make_response({"error": f"events of id {id} not deleted"}, 404)

    else:
        response = make_response({"error": f"404: events of id {id} not found."})

    return response

@app.route('/signups', methods=['GET', 'POST'])
def signups():

    if request.method == 'GET':
        print("Fetching all signups...")
        
        signups_dict = [signup.to_dict() for signup in Signup.query.all()]

        if signups_dict:
            response = make_response(signups_dict, 200)        
        else:
            response = make_response({"error": "404: Signups not found."})
    
    if request.method == 'POST':
        print("Creating new signup...")
        form_data = request.get_json()
        new_signup = Signup(
            user_id=form_data['user_id'],
            session_id=form_data['session_id']
            # paid ?
        )
        db.session.add(new_signup)
        db.session.commit()
        response = make_response(new_signup.to_dict(), 201)

    return response

@app.route('/signups/filter', methods=['POST'])
def filter_signups():
    if request.method == 'POST':
        try:
            form_data = request.get_json()
            search_term = form_data['search_term']
            column_to_search = form_data['column_to_search']

            if column_to_search == 'event':
                # signup_query = Signup.query.join(Signup.session).join(Session.event).join(Event.name.ilike(f"%{search_term}%"))
                signup_query = Signup.query.join(Signup.session).join(Session.event).filter(Event.name.ilike(f"%{search_term}%")).limit(50)
            elif column_to_search == 'customer':
                signup_query = (
                    Signup.query
                    .join(Signup.user)
                    .filter(
                        or_(
                            User.first_name.ilike(f"%{search_term}%"),
                            User.last_name.ilike(f"%{search_term}%")
                        )
                    )
                    .limit(50)
                )
                
                # signup_query = Signup.query.join(Signup.user).filter(User.first_name.ilike(f"%{search_term}%")).all()
                # signup_query = Signup.query.filter(
                #     or_(
                #         Signup.user.first_name.ilike(f"%{search_term}%"),
                #         Signup.user.last_name.ilike(f"%{search_term}%")
                #     )
                # )
            elif column_to_search == 'date':
                # signup_query = Signup.query.order_by(Signup.session.date.desc())
                signup_query = Signup.query.join(Signup.session).order_by(Session.date.desc())

            elif column_to_search == 'most_recent':
                signup_query = Signup.query.order_by(Signup.created_at.desc()).limit(50)
            else:
                signup_query = {"error": "Invalid column_to_search value"}
                return make_response(signup_query, 400)

            if signup_query is not None:
                results = [signup.to_dict() for signup in signup_query.all()]
                response = make_response(results, 200)
        except Exception as e:
            response = make_response({"error": f"404: could not complete query for signups. {str(e)}"}, 404)
        return response

@app.route('/signups/<int:id>', methods=['GET', 'PATCH', 'DELETE'])
def signup_by_id(id):

    signup = Signup.query.filter(Signup.id == id).one_or_none()

    if signup:

        if request.method == 'GET':
            response = make_response(signup.to_dict(), 200)
    
        if request.method == 'PATCH':
            form_data = request.get_json()
            try:
                for attr in form_data:
                    setattr(signup, attr, form_data[attr])
                db.session.add(signup)
                db.session.commit()
                response = make_response(signup.to_dict(), 200)
            except:
                response = make_response({"error": f"404: could not change information for signup of id {id}"}, 404)

        if request.method == 'DELETE':
            try:
                db.session.delete(signup)
                db.session.commit()
                response = make_response({"success": f"204: Signup of id {id} deleted."})
            except:
                response = make_response({"error": f"404: Signup of {id} not deleted."})

    else:
        response = make_response({"error": f"404: Signup of id {id} not found."})

    return response

@app.route('/sessions', methods=['GET', 'POST'])
def sessions():
    
    if request.method == 'GET':
        all_sessions_dict = [session.to_dict() for session in Session.query.all()]
    
        if all_sessions_dict:
            response = make_response(all_sessions_dict, 200)
        else:
            response = make_response({"error": "404: Sessions not found."})

    if request.method == 'POST':


        form_data = request.get_json()
        frequency = form_data['frequency']
        if frequency == 'Once':
            try:

                date_string = form_data['date']
                time_string = form_data['time']
                event_id = form_data['event_id']
                start_date_obj = datetime.strptime(date_string, "%Y-%m-%d")
                start_time_obj = datetime.strptime(time_string, "%H:%M").time()
                new_session = Session(
                    date=start_date_obj,
                    time=start_time_obj,
                    event_id=event_id
                )
                db.session.add(new_session)
                db.session.commit()
                response = make_response({"success": f"200: You have created events on a {frequency} basis starting on {date_string} at {time_string}"}, 200)

            except:
                response = make_response({"error": "404: Could not create new session"})

        else:
            try:
                date_string = form_data['date']
                time_string = form_data['time']
                event_id = form_data['event_id']
                start_date_obj = datetime.strptime(date_string, "%Y-%m-%d")
                start_time_obj = datetime.strptime(time_string, "%H:%M").time()
                current_date = start_date_obj
                end_date = start_date_obj + timedelta(days=365)
                current_date = start_date_obj
                add_30_days = ['04', '06', '09', '11']
                add_31_days = ['01', '03', '05', '07', '08', '10', '10']

                while current_date <= end_date:
                    new_session = Session(
                        date=current_date,
                        time=start_time_obj,
                        event_id=event_id
                    )
                    db.session.add(new_session)

                    if frequency == 'Daily':
                        current_date += timedelta(days=1)
                    elif frequency == 'Weekly':
                        current_date += timedelta(weeks=1)
                    elif frequency == 'Biweekly':
                        current_date += timedelta(weeks=2)
                    elif frequency == 'Monthly':
                        if date_string.split('-')[1] in add_30_days:
                            current_date += timedelta(weeks=4)
                        elif date_string.split('-')[1] in add_31_days:
                            current_date += timedelta(weeks=4)
                        elif date_string.split('-')[1] == '02':
                            current_date += timedelta(weeks=4)

                db.session.commit()

                response = make_response({"success": f"200: You have created events on a {frequency} basis starting on {date_string} at {time_string}"}, 200)

            except:
                response = make_response({"error": "404: Could not create new session"})

    return response

# @app.route('/sessions', methods=['GET', 'POST'])
# def sessions():
    
#     if request.method == 'GET':
#         all_sessions_dict = [session.to_dict() for session in Session.query.all()]
    
#         if all_sessions_dict:
#             response = make_response(all_sessions_dict, 200)
#         else:
#             response = make_response({"error": "404: Sessions not found."})

#     if request.method == 'POST':
#         try:
#             form_data = request.get_json()

#             date_string = form_data['date']
#             time_string = form_data['time']
#             frequency = form_data['frequency']
#             event_id = form_data['event_id']
#             start_date_obj = datetime.strptime(date_string, "%Y-%m-%d")
#             start_time_obj = datetime.strptime(time_string, "%H:%M").time()
#             current_date = start_date_obj
#             end_date = start_date_obj + timedelta(days=365)
#             current_date = start_date_obj
#             add_30_days = ['04', '06', '09', '11']
#             add_31_days = ['01', '03', '05', '07', '08', '10', '10']


#             if frequency == 'Daily' or 'Weekly' or 'Biweekly' or 'Monthly':
#                 while current_date <= end_date:
#                     new_session = Session(
#                         date=current_date,
#                         time=start_time_obj,
#                         event_id=event_id
#                     )
#                     db.session.add(new_session)

#                     if frequency == 'Daily':
#                         current_date += timedelta(days=1)
#                     elif frequency == 'Weekly':
#                         current_date += timedelta(weeks=1)
#                     elif frequency == 'Biweekly':
#                         current_date += timedelta(weeks=2)
#                     elif frequency == 'Monthly':
#                         if date_string.split('-')[1] in add_30_days:
#                             current_date += timedelta(days=30)
#                         elif date_string.split('-')[1] in add_31_days:
#                             current_date += timedelta(days=31)
#                         elif date_string.split('-')[1] == '02':
#                             current_date += timedelta(days=28)

#                     db.session.commit()
                    
#             else:
#                 new_session = Session(
#                     date=current_date,
#                     time=start_time_obj,
#                     event_id=event_id
#                 )
#                 db.session.add(new_session)
#                 db.session.commit()

#             response = make_response({"success": f"200: You have created events on a {frequency} basis starting on {date_string} at {time_string}"}, 200)

#         except:
#             response = make_response({"error": "404: Could not create new session"})

#     return response

@app.route('/sessions/<int:id>', methods=['GET', 'DELETE'])
def session_by_id(id):

    session = Session.query.filter(Session.id == id).one_or_none()

    if session:

        if request.method == 'GET':
            response = make_response(session.to_dict(), 200)

        if request.method == 'DELETE':
            db.session.delete(session)
            db.session.commit()
            response = make_response({"success": f"session of id {id} successfully deleted."})
    
    else:
        response = make_response({"error": f"Could not find session of id {id}"})
    
    return response

@app.route('/payments', methods=['GET'])
def payments():

    if request.method == 'GET':
        print("Fetching all payments...")
        payments_dict = [payment.to_dict() for payment in Payment.query.all()]
        
        if payments_dict:
            response = make_response(payments_dict, 200)
        
        else:
            response = make_response({"error": "404: Payments not found."})

    return response

@app.route('/login', methods=['POST'])
def login():

    if request.method == 'POST':
        print("Logging in user...")
        try:
            form_data = request.get_json()
            email = form_data['email']
            password = form_data['password']

            user = User.query.filter(User.email == email).one_or_none()

            if user and user.authenticate(password):
                response = make_response(user.to_dict(), 200)
                session['user_id'] = user.id

        except:
            response = make_response({"error": "Unable to authenticate user login."}, 404)

    return response

@app.route('/logout', methods=['DELETE'])
def logout():
    if request.method == 'DELETE':
        print("Logging out user...")
        try:
            session.pop('user_id', None)
            response = make_response({"success": "Logged out and cookies cleared."})
        except:
            response = make_response({"error": "No user or cookies to logout or clear."})

    return response

@app.route('/check-session')
def check_session():
    user_session_id = session.get('user_id')
    if user_session_id:
        response = f"{user_session_id}"
    else:
        response = make_response({"error": "no session cookie for user id found"}, 404)
    return response

if __name__ == '__main__':
    app.run(port=5555, debug=True)
