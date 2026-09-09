import { BASE_URL } from '../../api/fetch.js';
import { useContext, useState } from 'react'
import { LoggedInUserContext, CurrentUserToggleContext } from '../App'

const SuccessfulMembershipPurchase = () => {

    const { currentUser } = useContext(LoggedInUserContext)
    const { currentUserToggle, setCurrentUserToggle } = useContext(CurrentUserToggleContext)
    
    const [fetchCompleted, setFetchCompleted] = useState(false)

    if (!fetchCompleted && Object.keys(currentUser).length > 0) {
        fetch(`${BASE_URL}/last-user-membership-purchase/${currentUser.id}`)
        .then((response) => response.json())
        .then((updatedUserData) => {
            console.log(updatedUserData)
            setCurrentUserToggle(!currentUserToggle)
            setFetchCompleted(true)
        })
    }

    return (
        <>
            <h1 style={{marginTop:'3rem', marginBottom:'2rem'}}>Success!</h1>
            <h2 style={{textAlign:'center'}}>Hi {currentUser.first_name}. Thanks for making your purchase!</h2>
        </>
    )
}

export default SuccessfulMembershipPurchase