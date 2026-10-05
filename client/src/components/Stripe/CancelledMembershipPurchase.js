import { useContext, useEffect } from 'react'
import { LoggedInUserContext, CurrentTransactionContext } from '../App'
import styles from './Stripe.module.css'

const CancelledMembershipPurchase = () => {

    const { currentUser } = useContext(LoggedInUserContext)
    const { setCurrentTransaction } = useContext(CurrentTransactionContext)
    
    useEffect(() => {
        setCurrentTransaction({})
    }, [])

    return (
        <div className={styles.stripeResponseContainer}>
            <h1>Unsuccessful Membership Purchase Page</h1>
            <h2>Hi {currentUser.first_name}. Looks like your transaction was unsuccessful, so your purchase did not go through. Please try again.</h2>
        </div>
    )
}

export default CancelledMembershipPurchase