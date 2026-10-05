import { useContext } from 'react'
import { LoggedInUserContext } from '../App'
import styles from './Stripe.module.css'

const SuccessfulSignup = () => {

    const { currentUser } = useContext(LoggedInUserContext)

    return (
        <div className={styles.stripeResponseContainer}>
            <h1>Thanks for your purchase, {currentUser.first_name}!</h1>
        </div>
    )
}

export default SuccessfulSignup