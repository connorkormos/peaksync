import { BASE_URL } from '../../api/fetch.js'
import { useContext, useEffect } from 'react'
import { LoggedInUserContext, CurrentTransactionContext } from '../App'
import { useLocation } from 'react-router-dom'

import styles from "./Offerings.module.css";

import Button from 'react-bootstrap/Button'

const ConfirmMembershipOrderDetails = () => {

    const { currentUser } = useContext(LoggedInUserContext)
    const { currentTransaction, setCurrentTransaction } = useContext(CurrentTransactionContext)

    const location = useLocation()
    const membership = location.state
    console.log(membership)

    useEffect(() => {
        setCurrentTransaction({
            'user_id': currentUser.id,
            'membership_id': membership.id
        })
    }, [])

    return (
        <div className={styles.orderConfirmationPage}>
            <h1>Order Confirmation Page</h1>
            <div className={styles.orderConfirmationContent}>
                <div>
                    <h2>Hi {currentUser.first_name}!</h2>
                    <p>Please take a moment to make sure this is the membership you want to purchase before proceeding to checkout.</p>
                </div>
                <div>
                    <p>You are purchasing a(n) <strong><em><u>{membership.name} for ${membership.price}{membership.name.toLowerCase().includes("monthly") ? " per month" : null}</u></em></strong>.</p>
                    <p>This purchase includes:</p>
                    <p>{membership.description}</p>
                    <p>If this sounds good to you, proceed to checkout!</p>
                    <form action={`${BASE_URL}/create-membership-checkout-session/${membership.id}/${currentUser.id}`} method="POST">
                        <Button type="submit">Sounds good! Take me to Checkout.</Button>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default ConfirmMembershipOrderDetails
