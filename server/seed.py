# #!/usr/bin/env python3

# # Standard library imports
# from random import randint, choice as rc

# # Remote library imports
# from faker import Faker
# from datetime import time, date, datetime
# from sqlalchemy import Date, Time

# # Local imports
# from app import app
# from models import db, User, Membership, Event, Signup, Payment, Session
# import stripe
# stripe.api_key = 'sk_test_51NBMlfBoM5Q6sMKnOSgo4QBNYWSJQS1SZ9KY559Li3ZZDCw2bm95qgKrDQ80LJkBq5paMqGKiF2cATnNJO796srX007Nk47WFY'
# YOUR_DOMAIN = 'https://peaksync-api.up.railway.app'
# LOCAL_DOMAIN = 'https://peaksync.up.railway.app'

# if __name__ == '__main__':
#     fake = Faker()
#     with app.app_context():
#         print("Dropping tables...")
#         db.session.query(User).delete()
#         db.session.query(Membership).delete()
#         db.session.query(Event).delete()
#         db.session.query(Signup).delete()
#         db.session.query(Session).delete()
#         db.session.commit()
#         print("Generating user profiles...")
#         guest = User(
#             first_name="Guest",
#             last_name="Account",
#             email="guest@guest.com",
#             password_hash="password",
#             phone_number=1231231234,
#             address="123 Guest Street",
#             city="Reno",
#             state="Nevada",
#             zipcode=12345,
#             date_of_birth="2000-01-01",
#             emergency_contact_name="Guest Parent",
#             emergency_contact_phone_number=1231231234,
#             membership_id=1,
#             waiver=False
#         )
#         admin = User(
#             first_name="Admin",
#             last_name="Account",
#             email="admin@admin.com",
#             password_hash="password",
#             phone_number=1231231234,
#             address="123 Admin Street",
#             city="Reno",
#             state="Nevada",
#             zipcode=12345,
#             date_of_birth="2000-01-01",
#             emergency_contact_name="Admin Parent",
#             emergency_contact_phone_number=1231231234,
#             waiver=True,
#             admin=True
#         )
#         db.session.add_all([guest, admin])
#         db.session.commit()
#         for i in range(500):
#             phone_number = fake.random_number(digits=10)
#             while len(str(phone_number)) < 10:
#                 phone_number = int("1" + str(phone_number))
#             second_phone_number = fake.random_number(digits=10)
#             while len(str(second_phone_number)) < 10:
#                 second_phone_number = int("1" + str(second_phone_number))
#             zipcode = int(fake.zipcode())
#             while len(str(zipcode)) < 5:
#                 zipcode = int("1" + str(zipcode))
#             new_user = User(
#                 first_name=fake.first_name(),
#                 last_name=fake.last_name(),
#                 email=fake.email(),
#                 password_hash="password",
#                 phone_number=phone_number,
#                 address=fake.street_address(),
#                 city=fake.city(),
#                 state=fake.state(),
#                 zipcode=int(zipcode),
#                 date_of_birth=fake.date_of_birth(),
#                 emergency_contact_name=fake.name(),
#                 emergency_contact_phone_number=second_phone_number,
#                 waiver=fake.boolean()
#             )
#             db.session.add(new_user)
#             db.session.commit()
        
#         print("Generating memberships...")

#         guest = Membership(name="Guest", price=0, description="Guest account.  No membership included.", type="Guest", subtype="Guest")

#         # stripe_monthly_membership = stripe.Product.create(
#         #     name="Monthly Membership",
#         #     default_price_data={
#         #         'currency': 'usd',
#         #         'unit_amount_decimal': 6600
#         #     },
#         #     description="Unlimited facility access, discounts on classes and merchandise, and more! Automatically renews on the first of each month."
#         # )
#         # stripe_annual_membership = stripe.Product.create(
#         #     name="Annual Membership",
#         #     default_price_data={
#         #         'currency': 'usd',
#         #         'unit_amount_decimal': 69900
#         #     },
#         #     description="All of the same perks as the monthly membership, but with a month and a half's worth of savings!"
#         # )
#         # stripe_one_month_membership = stripe.Product.create(
#         #     name="One Month Prepaid Membership",
#         #     default_price_data={
#         #         'currency': 'usd',
#         #         'unit_amount_decimal': 8000
#         #     },
#         #     description="30 day long membership.  Can be purchased as many times as one likes."
#         # )
#         # stripe_six_month_membership = stripe.Product.create(
#         #     name="Six Month Prepaid Membership",
#         #     default_price_data={
#         #         'currency': 'usd',
#         #         'unit_amount_decimal': 37500
#         #     },
#         #     description="Six month long membership.  Can be purchased as many times as one likes."
#         # )
#         # stripe_ten_punch_card = stripe.Product.create(
#         #     name="Ten Punch Card",
#         #     default_price_data={
#         #         'currency': 'usd',
#         #         'unit_amount_decimal': 17000
#         #     },
#         #     description="Save $30 by purchasing this punch card, with no expiration date."
#         # )

#         monthly_membership = Membership(name="Monthly Membership", price=66, description="Unlimited facility access, discounts on classes and merchandise, and more! Automatically renews on the first of each month.", type="Member", subtype="Monthly", stripe_product_id="prod_NxgXejhjr33K8u", stripe_price_id="price_1NBlAOBoM5Q6sMKn7tPkxDa2")
#         annual_membership = Membership(name="Annual Membership", price=699, description="All of the same perks as the monthly membership, but with a month and a half's worth of savings!", type="Member", subtype="Annual Prepaid", stripe_product_id="prod_NxgXUYRfVbShY7", stripe_price_id="price_1NBlAPBoM5Q6sMKn53afBcaM")
#         one_month_prepaid = Membership(name="One Month Prepaid Membership", price=80, description="30 day long membership.  Can be purchased as many times as one likes.", type="Member", subtype="Prepaid", stripe_product_id="prod_NxgXh0bcUVGHzj", stripe_price_id="price_1NBlAPBoM5Q6sMKnf7FHaajk")
#         six_month_prepaid = Membership(name="Six Month Prepaid Membership", price=375, description="Six month long membership.  Can be purchased as many times as one likes.", type="Member", subtype="Prepaid", stripe_product_id="prod_NxgXhBNnX15jkA", stripe_price_id="price_1NBlAPBoM5Q6sMKnwRrJPpFW")

#         ten_punch_card = Membership(name="Ten Punch Card", price=170, description="Save $30 by purchasing this punch card, with no expiration date.", type="Punch Card", subtype="Punch Card", stripe_product_id="prod_NxgXT4jw0eBuMV", stripe_price_id="price_1NBlAPBoM5Q6sMKnjxEIYeHm")

#         db.session.add_all([guest, monthly_membership, annual_membership, one_month_prepaid, six_month_prepaid, ten_punch_card])
#         db.session.commit()

#         print("Generating events...")
#         # stripe_belay_lesson = stripe.Product.create(
#         #     name="Top Rope Belay Lesson",
#         #     default_price_data={
#         #         'currency': 'usd',
#         #         'unit_amount_decimal': 1500
#         #     },
#         #     description="One hour class that teaches basic top rope belay safety skills. Without prior experience this class is required to climb in the roped section of the gym.  Free for members."
#         # )
#         # stripe_lead_belay_lesson = stripe.Product.create(
#         #     name="Lead Belay Lesson",
#         #     default_price_data={
#         #         'currency': 'usd',
#         #         'unit_amount_decimal': 10000
#         #     },
#         #     description="Learn how to lead belay and lead climb in this 4 hour course!"
#         # )
#         # stripe_yoga_class = stripe.Product.create(
#         #     name="All Levels Yoga Classes",
#         #     default_price_data={
#         #         'currency': 'usd',
#         #         'unit_amount_decimal': 1500
#         #     },
#         #     description="Pricing for general yoga classes, regardless of level."
#         # )

#         core_stripe = stripe.Product.create(
#             name="General Fitness Classes",
#             default_price_data={
#                 'currency': 'usd',
#                 'unit_amount_decimal': 1000
#             },
#         )

#         "Entry level yoga class for beginners or more experienced yogis who want a more mellow session.  Free for members."
#         belay_lesson = Event(name="Top Rope Belay Lesson", price=15, capacity=4, category="Climbing", hours=1, minutes=0, description="One hour class that teaches basic top rope belay safety skills. Without prior experience this class is required to climb in the roped section of the gym.  Free for members.", stripe_product_id="prod_Nxgnsr6bLEWzgD", stripe_price_id="price_1NBlPgBoM5Q6sMKnNKzR6CZf", free_for_members=True)

#         lead_belay_lesson = Event(name="Lead Belay Lesson", price=100, category="Climbing", capacity=4, hours=4, minutes=0, description="Learn how to lead belay and lead climb in this 4 hour course!", stripe_product_id="prod_NxgnJmHblsAZr8", stripe_price_id="price_1NBlPgBoM5Q6sMKnMB14OAzR", free_for_members=False)
#         beginner_yoga = Event(name="Beginner Yoga Class", price=15, category="Yoga", capacity=20, hours=1, minutes=0, description="Entry level yoga class for beginners or more experienced yogis who want a more mellow session.  Free for members.", stripe_product_id="prod_NxgnBE0sOFrH4K", stripe_price_id="price_1NBlPhBoM5Q6sMKnuL9YMa66", free_for_members=True)
#         intermediate_yoga = Event(name="Intemediate Yoga Class", price=15, category="Yoga", capacity=20, hours=1, minutes=0, description="Intemediate level yoga class for slightly to well experienced yogis.  Free for members.", stripe_product_id="prod_NxgnBE0sOFrH4K", stripe_price_id="price_1NBlPhBoM5Q6sMKnuL9YMa66", free_for_members=True)
#         advanced_yoga = Event(name="Advanced Yoga Class", category="Yoga", capacity=20, hours=1, minutes=0, price=15, description="Advanced level yoga class for experienced yogis.  Beginners not advised.  Free for members.", stripe_product_id="prod_NxgnBE0sOFrH4K", stripe_price_id="price_1NBlPhBoM5Q6sMKnuL9YMa66", free_for_members=True)

#         core_class = Event(name="Core Class", price=10, category="Fitness", capacity=20, hours=0, minutes=30, description="30 minute long intense core workout lead by experienced instructor.  Get ready to feel the burn!", stripe_product_id="prod_NxgnNhpVFsYVwS", stripe_price_id="price_1NBlPhBoM5Q6sMKn1ua2lXDS", free_for_members=True)
        
#         flexibility_class = Event(name="Flexibility Class", price=10, category="Fitness", capacity=20, hours=0, minutes=30, description="Work on your flexibility regardless of your current level!", stripe_product_id="prod_NxgnNhpVFsYVwS", stripe_price_id="price_1NBlPhBoM5Q6sMKn1ua2lXDS", free_for_members=True)
#         db.session.add_all([belay_lesson, lead_belay_lesson, beginner_yoga, intermediate_yoga, advanced_yoga, core_class, flexibility_class])

#         print("Generating signups...")

#         for i in range(50):
#             new_signup = Signup(
#                 user_id=randint(1, 100),
#                 session_id=randint(1, 7),
#                 # paid=fake.boolean()
#             )
#             db.session.add(new_signup)
#             db.session.commit()

#         print("Generating sessions...")
#         date_value = datetime(2023, 5, 23)
#         time_value = time(14, 30)
#         date_value2 = datetime(2023, 5, 24)
#         time_value2 = time(10, 00)
#         date_value3 = datetime(2023, 5, 25)
#         time_value3 = time(18, 00)
#         print(time_value)
#         session1 = Session(date=date_value, time=time_value, event_id=1)
#         session2 = Session(date=date_value, time=time_value, event_id=2)
#         session3 = Session(date=date_value3, time=time_value3, event_id=3)
#         session4 = Session(date=date_value3, time=time_value3, event_id=4)
#         session5 = Session(date=date_value2, time=time_value2, event_id=5)
#         session6 = Session(date=date_value2, time=time_value2, event_id=6)
#         session7 = Session(date=date_value, time=time_value, event_id=7)
#         db.session.add_all([session1, session2, session3, session4, session5, session6, session7])
#         db.session.commit()
