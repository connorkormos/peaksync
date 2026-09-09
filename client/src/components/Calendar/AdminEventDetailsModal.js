import { BASE_URL } from '../../api/fetch.js';
import { useContext } from 'react'
import { useHistory } from 'react-router-dom'
import { SessionsToggleContext } from '../App';

import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button'
import ListGroup from 'react-bootstrap/ListGroup'

const AdminEventDetailsModal = ({ clickedSession, setClickedSession, showGuestModal, setShowGuestModal, showAdminModal, setShowAdminModal }) => {
    
    const history = useHistory()

    console.log(clickedSession)

    const { sessionsToggle, setSessionsToggle } = useContext(SessionsToggleContext)

    const handleEditSignupClick = (event) => {
        console.log(clickedSession.values.id)
        console.log(event.target.value)
        fetch(`${BASE_URL}/signups/${event.target.value}`)
        .then((response) => response.json())
        .then((signupData) => history.push({pathname:'/edit/signup', state:signupData}))
    }
    console.log(clickedSession.values.signups.length)

    const renderClickedSessionDetails = clickedSession.values.signups.map((signup) => {
        return (
            <ListGroup.Item className='modalListGroupWithButton'>{signup.user.first_name} {signup.user.last_name} <Button className="modalButton" value={signup.id} onClick={handleEditSignupClick}>Edit Signup</Button></ListGroup.Item>
        )
    })

    const handleDeleteSession = () => {
        if (clickedSession.values.signups.length === 0 && window.confirm("Are you sure you want to delete this session?  This cannot be undone.") === true) {
            fetch(`${BASE_URL}/sessions/${clickedSession.values.session_id}`, {
                method: 'DELETE',
            })
            .then((response) => response.json())
            .then((deletedSessionData) => {
                console.log(deletedSessionData)
                setSessionsToggle(!sessionsToggle)
                // history.push({pathname: '/calendar'})
                setShowAdminModal(false)
            })
        } else if (clickedSession.values.signups.length > 0) {
            window.alert("This session has people signed up!  Make sure to relocate their bookings before deleting the event.")
        } else {
            window.alert("Okay, this session will remain on the calendar.")
        }
    }

    return (
        <Modal id="adminSessionDetailsModal" show={showAdminModal} onHide={() => setShowAdminModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>{clickedSession.values.name}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                <div className="adminModalDiv">
                    {clickedSession.values.signups.length > 0 ?
                    <ListGroup>
                        {renderClickedSessionDetails}
                    </ListGroup>
                    : <ListGroup.Item>There are no signups for this event yet.</ListGroup.Item>}
                </div>
                </Modal.Body>
                <Modal.Footer>
                    <Button onClick={handleDeleteSession} style={{background:'grey'}}>Delete Session</Button>
                </Modal.Footer>
            </Modal>
    )
}

export default AdminEventDetailsModal