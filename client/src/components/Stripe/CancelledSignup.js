import { BASE_URL } from '../../api/fetch.js';
import { useContext } from 'react'
import { LoggedInUserContext, SignupsToggleContext } from '../App'
import styles from './Stripe.module.css'

const CancelledSignup = () => {

    const { currentUser } = useContext(LoggedInUserContext)
    // const { signupsToggle, setSignupsToggle } = useContext(SignupsToggleContext)

    // if (currentUser.id !== undefined) {
    //     fetch(`${BASE_URL}/last_user_signup/${currentUser.id}`)
    //     .then((response) => response.json())
    //     .then((userData) => {
    //         const signup_id = userData.signups.reverse()[0].id
    //         console.log(signup_id)
    //         deleteUnpaidSignup(signup_id)
    //     })
    // }

    // const deleteUnpaidSignup = (signup_id) => {
    //     fetch(`${BASE_URL}/signups/${signup_id}`, {
    //         method: 'DELETE',
    //         headers: {
    //             'Content-Type': 'application/json',
    //         }
    //     })
    //     .then((response) => response.json())
    //     .then((deletedSignupData) => {
    //         console.log(deletedSignupData)
    //         setSignupsToggle(!signupsToggle)
    //     })
    // }

    return (
        <div className={styles.stripeResponseContainer}>
            <h1>Hi{currentUser.first_name ? ` ${currentUser.first_name}` : ''}, it seems like your payment did not go through, so your signup was cancelled.</h1>
            <h2>If you'd still like to create this booking, please navigate back to the calendar page and try again!</h2>
        </div>
    )
}

export default CancelledSignup