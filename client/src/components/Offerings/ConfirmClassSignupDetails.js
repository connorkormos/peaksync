import { BASE_URL } from '../../api/fetch.js'
import { useContext } from 'react'
import { LoggedInUserContext } from '../App'
import { useLocation } from 'react-router-dom'

import Button from 'react-bootstrap/Button'

const ConfirmClassSignupDetails = () => {

    const { currentUser } = useContext(LoggedInUserContext)

    const location = useLocation()
    const event = location.state
    console.log(event)

    return (
        <>
            <h1>Order Confirmation Page</h1>
            <div>
                <h2>Hi {currentUser.first_name}!</h2>
                <p>Please take a moment to make sure this is the event you want to purchase before proceeding to checkout.</p>
            </div>
            <div>
                <p>You are signup up for a {event.name} on for ${event.price}{event.name.toLowerCase().includes("monthly") ? " per month" : null}.</p>
                <p>This purchase includes:</p>
                <p>{event.description}</p>
                <p>If this sounds good to you, proceed to checkout!</p>
                {currentUser.membership.type !== 'Member' ?
                <form action={`${BASE_URL}/create-event-checkout-session/${event.id}`} method="POST">
                    <Button type="submit">Sounds good! Take me to Checkout.</Button>
                </form>
                : null}
            </div>
        </>
    )
}

export default ConfirmClassSignupDetails
