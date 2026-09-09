// import { BASE_URL } from '../../api/fetch.js';
import styles from './UserProfile.module.css'

import { useState, useContext } from 'react'
import { useHistory } from 'react-router-dom'

import { LoggedInUserContext } from '../App'

import ListGroup from 'react-bootstrap/ListGroup'
import Button from 'react-bootstrap/Button'

const UserBookings = ({ selectedUser }) => {

    const history = useHistory()
    const { currentUser } = useContext(LoggedInUserContext)
    const [selectedUserBookings, setSelectedUserBookings] = useState(selectedUser.signups)
    
    console.log(selectedUser)
    console.log(currentUser)
    console.log("UserBookings", selectedUserBookings)


    // const handleCancelBooking = (signup) => {
    //     if (window.confirm("Are you sure you want to cancel this booking?") == true) {
    //         fetch(`${BASE_URL}/signups/${signup.id}`, {
    //             method: 'DELETE',
    //         })
    //         .then((response) => response.json())
    //         .then((deletedSignupData) => console.log(deletedSignupData))
    //         window.alert("Booking cancelled.")
    //         setSelectedUserBookings(selectedUserBookings.filter((booking) => booking.id !== signup.id))
    //     } else {
    //         window.alert("Okay. Your booking is still active.")
    //     }
    // }

    // const renderBookings = () => {
    //     console.log(selectedUserBookings)
    //     if (selectedUserBookings === undefined) {
    //         setSelectedUserBookings(currentUser.signups)
    //     }
    //     if (selectedUserBookings.length > 0) {
    //         selectedUserBookings.reverse().map((signup) => {
    //             const datetimeString = `${signup.session.date}T${signup.session.time}:00`
    //             const datetime = new Date(datetimeString)
    //             const options = {
    //                 weekday: 'long',
    //                 month: 'long',
    //                 day: 'numeric',
    //                 hour: 'numeric',
    //                 minute: 'numeric',
    //                 hour12: true
    //             }
        
    //             const formattedDateTime = datetime.toLocaleString('en-US', options)
    //             console.log(signup)
    //             return (
    //                 <ListGroup.Item className='listGroupItemWithEndButtons' style={{display:"flex"}}>
    //                     {signup.session.event.name} - {formattedDateTime} - {signup.session.event.free_for_members === true && selectedUser.membership.type === 'Member' ? "Paid" : <Button style={{color:"white", backgroundColor:"red", borderRadius:"15px"}}>Payment Owed</Button>}
    //                     <Button onClick={() => history.push({pathname:'/edit/signup', state:signup})} style={{marginLeft:"auto"}}>Edit Booking</Button>
    //                 </ListGroup.Item>
    //             )
    //         })
    //     }
    // }
    
    const renderSignups = selectedUserBookings.map((signup) => {
        // if (selectedUserBookings.length > 0) {
            // selectedUserBookings.reverse().map((signup) => {
            const datetimeString = `${signup.session.date}T${signup.session.time}:00`
            const datetime = new Date(datetimeString)
            console.log(datetimeString)
            console.log(datetime)
            console.log(datetime < new Date())
            const options = {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
                hour: 'numeric',
                minute: 'numeric',
                hour12: true
            }
    
            const formattedDateTime = datetime.toLocaleString('en-US', options)
            console.log(signup)
            return (
                <ListGroup.Item className={styles.userBookingListGroupItem}>
                    {signup.session.event.name} - {formattedDateTime} - {signup.session.event.free_for_members === true && selectedUser.membership.type === 'Member' ? "Paid" : <Button className={styles.paymentOwedButton}>Payment Owed</Button>}
                    {(currentUser.admin || datetime > new Date()) ? <Button className={styles.editSignupButton} onClick={() => history.push({pathname:'/edit/signup', state:signup})}>Edit Booking</Button> : <span className={styles.startDatePassedSpan}>Event start date already passed.</span>}
                </ListGroup.Item>
            )
        })
        // }
    // })
    return (
        <>
            <h1>{selectedUser.first_name} {selectedUser.last_name}'s Booking History</h1>
            <ListGroup className={styles.listGroup}>
                {/* {Object.keys(currentUser)?.length > 0 ? renderBookings() : null} */}
                {/* {renderBookings()} */}
                {renderSignups}
            </ListGroup>
        </>
    )
}

export default UserBookings