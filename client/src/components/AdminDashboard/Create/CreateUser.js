import { BASE_URL } from '../../../api/fetch.js';
import styles from './CreateUser.module.css'

import { useState, useContext } from 'react'
import { AllUsersContext } from '../../App'

import Card from 'react-bootstrap/Card'
import Button from 'react-bootstrap/Button'
import Form from 'react-bootstrap/Form'

const CreateUser = () => {

    const { setAllUsers } = useContext(AllUsersContext)

    const [newUser, setNewUser] = useState({
        "first_name": "",
        "last_name": "",
        "email": "",
        "password": "",
        "phone_number": "",
        "address": "",
        "city": "",
        "state": "",
        "zipcode": null,
        "date_of_birth": "",
        "emergency_contact_name": "",
        "emergency_contact_phone_number": "null",
        "waiver": false,
        "admin": false,
        "membership_id": 1
    })

    const handleProfileInfoChange = (event) => {
        const {name, value} = event.target
        setNewUser((prevState) => ({
            ...prevState,
            [name]: value
        }))
    }

    const handleDiscardChanges = () => {
        setNewUser({
            "first_name": "",
            "last_name": "",
            "email": "",
            "password": "",
            "phone_number": "",
            "address": "",
            "city": "",
            "state": "",
            "zipcode": "",
            "date_of_birth": "",
            "emergency_contact_name": "",
            "emergency_contact_phone_number": "",
            "membership_id": 1,
            "waiver": false,
            "admin": false
        })
    }

    const handleWaiverChange = () => {
        setNewUser((prevState) => (
            {...prevState, waiver: !prevState.waiver}
        ))
    }

    const handleAdminChange = () => {
        setNewUser((prevState) => ({
            ...prevState,
            admin: !prevState.admin
        }))
    }
    
    const handleCreateUser = () => {
        console.log(newUser)
        fetch(`${BASE_URL}/users`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(newUser)
        })
        .then((response) => response.json())
        .then((newUserData) => {
            setAllUsers((prevState) => [...prevState, newUserData])
        })
    }

    return (
        <div className={styles.userInfoDiv}>
            <Card className={styles.userInfoCard}>
                {/* <Card.Img src={myImage} style={{width:"250px", display:"flex", justifyContent:"center"}}></Card.Img> */}
                <Card.Body>
                    <Card.Text>First Name: <input name="first_name" value={newUser.first_name} onChange={handleProfileInfoChange}></input></Card.Text>
                    <Card.Text>Last Name: <input name="last_name" value={newUser.last_name} onChange={handleProfileInfoChange}></input></Card.Text>
                    <Card.Text>Email: <input name="email" value={newUser.email} onChange={handleProfileInfoChange}></input></Card.Text>
                    <Card.Text>password: <input name="password" type="password" value={newUser.password} onChange={handleProfileInfoChange}></input></Card.Text>
                    <Card.Text>Phone Number: <input name="phone_number" type="number" value={newUser.phone_number} onChange={handleProfileInfoChange}></input></Card.Text>
                    <Card.Text>Address: <input name="address" value={newUser.address} onChange={handleProfileInfoChange}></input></Card.Text>
                    <Card.Text>City: <input name="city" value={newUser.city} onChange={handleProfileInfoChange}></input> State: <input name="state" value={newUser.state} onChange={handleProfileInfoChange}></input> Zipcode: <input name="zipcode" value={newUser.zipcode} onChange={handleProfileInfoChange}></input></Card.Text>
                    <Card.Text>Date of Birth: <input name="date_of_birth" value={newUser.date_of_birth} onChange={handleProfileInfoChange}></input></Card.Text>
                    <Card.Text>Emergency Contact (Full Name): <input name="emergency_contact_name" value={newUser.emergency_contact_name} onChange={handleProfileInfoChange}></input></Card.Text>
                    <Card.Text>Emergency Contact Phone Number: <input name="emergency_contact_phone_number" type="number" value={newUser.emergency_contact_phone_number} onChange={handleProfileInfoChange}></input></Card.Text>
                    <Card.Text>Waiver Status: <Form.Check name="waiver" value={newUser.waiver} onChange={handleWaiverChange}></Form.Check>{newUser.waiver ? "Active" : "Inactive"}</Card.Text>
                    <Card.Text>Membership ID: {newUser.membership_id}</Card.Text>
                    <Card.Text>Grant Admin Priveledges?<Form.Check name="admin" value={newUser.admin} onChange={handleAdminChange}></Form.Check></Card.Text>
                    <Button className={styles.submitUserButton} onClick={handleCreateUser}>Create User</Button>
                    <Button className={styles.discardUserButton} onClick={handleDiscardChanges}>Discard User</Button>
                </Card.Body>
            </Card>
        </div>
    )
}

export default CreateUser