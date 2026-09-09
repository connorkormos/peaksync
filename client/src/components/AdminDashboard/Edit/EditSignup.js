import { BASE_URL } from '../../../api/fetch.js';
import styles from './EditSignup.module.css'

import { useState, useEffect, useContext } from 'react'
import { useLocation, useHistory } from 'react-router-dom'
import { AllSessionsContext, SessionsToggleContext, CurrentUserToggleContext, SignupsToggleContext } from '../../App'

import moment from 'moment'

import ListGroup from 'react-bootstrap/ListGroup'
import Button from 'react-bootstrap/Button'
import Modal from 'react-bootstrap/Modal'

const EditSignup = () => {

    const location = useLocation()
    const history = useHistory()
    const signupToEdit = location.state
    console.log("SIGNUP TO EDIT", signupToEdit)
    const { allSessions } = useContext(AllSessionsContext)
    const { sessionsToggle, setSessionsToggle } = useContext(SessionsToggleContext)
    const { signupsToggle, setSignupsToggle } = useContext(SignupsToggleContext)
    const { currentUserToggle, setCurrentUserToggle} = useContext(CurrentUserToggleContext)

    const eventStart = moment(signupToEdit.session.date + " " + signupToEdit.session.time, "YYYY-MM-DD HH:mm").toDate()
    const currentDate = new Date()
    
    const handleEditSignup = (event) => {
        if (window.confirm("Are you sure you want to relocate this signup?") === true) {
            fetch(`${BASE_URL}/signups/${signupToEdit.id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({session_id: event.target.value}),
            })
            .then((response) => response.json())
            .then((editedSignupData) => console.log(editedSignupData))
            setSessionsToggle(!sessionsToggle)
            setSignupsToggle(!signupsToggle)
            setCurrentUserToggle(!currentUserToggle)
            history.push({pathname:'/'})
        } else {
            window.alert("Okay, your signup will remain unchanged.")
        }
    }

    const handleDeleteSignup = () => {
        if (window.confirm("Are you sure you want to cancel this signup?  This cannot be undone!") === true) {
            fetch(`${BASE_URL}/signups/${signupToEdit.id}`, {
                method: 'DELETE',
            })
            .then((response) => response.json())
            .then((deletedSignupData) => console.log(deletedSignupData))
            setSessionsToggle(!sessionsToggle)
            setSignupsToggle(!signupsToggle)
            history.push({pathname:'/'})
        } else {
            window.alert("Okay, the signup will not be deleted.")
        }
    }

    const renderAllAvailableSessions = allSessions.map((session) => {
        const availableSpaces = session.event.capacity - session.signups
        const availableSession = session.event.capacity > session.signups
        const sameEventName = session.event.name === signupToEdit.session.event.name
        const eventStart = moment(session.date + " " + session.time, "YYYY-MM-DD HH:mm").toDate()
        const isFutureDate = eventStart > currentDate
        if (availableSession && sameEventName && isFutureDate) {
            return (
                <ListGroup.Item className='inlineListGroupItemWithEndButtons'>
                    {session.event.name} - 
                    {session.date} - 
                    {session.time} - 
                    Spaces Remaining: {availableSpaces} 
                    <Button className='listGroupEndButton' value={session.id} onClick={handleEditSignup}>
                        Move Signup to this Event
                    </Button>
                </ListGroup.Item>
            )
        }
    })

    const [showWarning, setShowWarning] = useState(false)

    useEffect(() => {
        if (eventStart < currentDate) {
            setShowWarning(true)
        }
    }, [])
    
    return (
        <div>
            <Modal show={showWarning}>
                <Modal.Header closeButton>
                    <Modal.Title>Warning!</Modal.Title>
                </Modal.Header>
                <Modal.Body>This event has already passed.
                    <br></br><br></br>
                    Unless you are making an intentional exception, do not move this signup from it's original booking.
                </Modal.Body>
                <Modal.Footer>
                    <Button className={styles.proceedButton} onClick={() => setShowWarning(false)}>I understand and wish to proceed.</Button>
                    <Button onClick={() => history.goBack()}>Whoops, take me back!</Button>
                </Modal.Footer>
            </Modal>
            <h1>Edit Signup Page</h1>
            <div className={styles.editSignupDiv}>
                <h4>Current Signup:</h4>
                <p>{signupToEdit.session.event.name} - Date: {signupToEdit.session.date} Time: {signupToEdit.session.time}</p>
                <h2 className={styles.editSignupDivH2}>Available Classes/Events to Relocate Signup:</h2>
            </div>
            <ListGroup>
                {renderAllAvailableSessions}
            </ListGroup>
            <br></br>
            {eventStart > currentDate ?
            <h2>Or you can cancel your booking (refunds/credits not functional):
                <br></br><br></br>
                <Button className={styles.cancelBookingButton} onClick={handleDeleteSignup}>Cancel Booking (not functional)</Button>
            </h2>
            : null}
        </div>
    )
}

export default EditSignup