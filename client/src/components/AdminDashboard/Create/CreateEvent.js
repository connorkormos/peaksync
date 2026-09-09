import styles from './CreateEvent.module.css'

import { useState, useContext } from 'react'
import { AllEventsContext } from '../../App'

import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'
import { BASE_URL } from '../../../api/fetch.js'

const CreateEvent = () => {

    const { allEvents, setAllEvents } = useContext(AllEventsContext)

    const [newEvent, setNewEvent] = useState({
        "name": "",
        "price": "",
        "day": "",
        "time": "",
        "category": "",
        "description": "",
        "capacity": 0,
        "hours": 0,
        "minutes": 0,
        "free_for_members": false
    })

    const handleDiscardEvent = () => {
        setNewEvent({
            "name": "",
            "price": "",
            "day": "",
            "time": "",
            "category": "",
            "description": "",
            "capacity": 0,
            "hours": 0,
            "minutes": 0,
            "free_for_members": false
        })
    }

    const handleNewEventChange = (event) => {
        const {name, value} = event.target
        setNewEvent((prevState) => ({
            ...prevState,
            [name]: value
        }))
    }

    const handleMakeFreeForMembers = () => {
        setNewEvent((prevState) => ({
            ...prevState,
            free_for_members: true
        }))
        console.log(newEvent.free_for_members)
    }

    const handleMakePaidForMembers = () => {
        setNewEvent((prevState) => ({
            ...prevState,
            free_for_members: false
        }))
    }

    const handleEventSubmit = (event) => {
        event.preventDefault()
        // fetch(`${BASE_URL}/events`, {
        fetch(`${BASE_URL}/events`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(newEvent)
        })
        .then((response) => response.json())
        .then((newEventData) => {
            console.log(newEventData)
            const updatedAllEvents = [...allEvents, newEventData]
            setAllEvents(updatedAllEvents)
        })
    }

    return (
        <div id='adminCreateEventDiv'>
            <div className={styles.createEventHeaderDiv}>
                <h4 className={styles.headerDivH4}>Note! This is NOT for adding existing classes to the calendar. This is for creating brand new offerings.</h4>
                <h4>Please navigate to "Create New Calendar Item" below in order to create specific occurances of a class.</h4>
            </div>
            <Form id="createEventForm" onSubmit={handleEventSubmit}>
                <Form.Label>Name:</Form.Label>
                    <Form.Control
                        className={styles.formControl}
                        name="name"
                        type="text"
                        value={newEvent.name}
                        onChange={handleNewEventChange}
                >
                    </Form.Control>
                <br></br>
                <Form.Label>Price:</Form.Label>
                    <Form.Control
                        className={styles.formControl}
                        name="price"
                        type="text"
                        value={newEvent.price}
                        onChange={handleNewEventChange}
                    >
                    </Form.Control>
                <br></br>
                <Form.Label>Category:</Form.Label>
                    <Form.Control
                        className={styles.formControl}
                        name="category"
                        type="text"
                        value={newEvent.category}
                        onChange={handleNewEventChange}
                    >
                    </Form.Control>
                    <Form.Text>Ex: "Climing", "Yoga", "Fitness", "Event", etc</Form.Text>
                <br></br><br></br>
                <Form.Label>Capacity:</Form.Label>
                    <Form.Control
                        className={styles.formControl}
                        name="capacity"
                        type="number"
                        value={newEvent.capacity}
                        onChange={handleNewEventChange}
                    >
                    </Form.Control>
                <br></br>
                <Form.Label>Hours:</Form.Label>
                    <Form.Control
                        className={styles.formControl}
                        name="hours"
                        type="number"
                        value={newEvent.hours}
                        onChange={handleNewEventChange}
                    >
                    </Form.Control>
                <br></br>
                <Form.Label>Minutes:</Form.Label>
                    <Form.Control
                        className={styles.formControl}
                        name="minutes"
                        type="number"
                        value={newEvent.minutes}
                        onChange={handleNewEventChange}
                    >
                    </Form.Control>
                <br></br>
                <Form.Label>Description:</Form.Label>
                    <Form.Control
                        className={styles.formControl}
                        name="description"
                        type="text"
                        value={newEvent.description}
                        onChange={handleNewEventChange}
                    >
                    </Form.Control>
                <br></br>
                <Form.Label>Free for Members?</Form.Label>
                    <span className={styles.freeForMembersSpan}>
                        <span className={styles.freeSpan}>Yes
                            <Form.Check
                                value={true}
                                checked={newEvent.free_for_members == true ? true : false}
                                type='radio'
                                onChange={handleMakeFreeForMembers}
                            >
                            </Form.Check>
                        </span>
                        <span className={styles.notFreeSpan}> No
                            <Form.Check
                                value={false}
                                checked={newEvent.free_for_members == false ? true : false}
                                type='radio'
                                onChange={handleMakePaidForMembers}
                            >
                            </Form.Check>
                        </span>
                    </span>
                <br></br>
                <Button className={styles.submitEventButton} type="submit">Create Event</Button>
                <Button className={styles.discardEventButton} onClick={handleDiscardEvent}>Discard Event</Button>
                <br></br><br></br>
            </Form>
        </div>
    )
}

export default CreateEvent