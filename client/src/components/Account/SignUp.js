import styles from './SignUp.module.css'

import { useState, useContext } from "react"
import { useHistory } from 'react-router-dom'
import { LoggedInUserContext } from "../App"
import { BASE_URL } from '../../api/fetch.js'

import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'

const SignUp = () => {

    const history = useHistory()

    const { setCurrentUser } = useContext(LoggedInUserContext)

    const [newUser, setNewUser] = useState({
        "firstName": "",
        "lastName": "",
        "email": "",
        "password": "",
        "phoneNumber": "",
        "address": "",
        "city": "",
        "state": "",
        "zipcode": "",
        "dateOfBirth": "",
        "emergencyContactName": "",
        "emergencyContactPhoneNumber": "",
        "waiver": false
    })

    const [confirmPassword, setConfirmPassword] = useState("")

    const handleSignUpInputChange = (event) => {
        const {name, value} = event.target
        if (name !== "waiver") {
            setNewUser((prevState) => ({
                ...prevState,
                [name]: value
            }))
        } else {
            setNewUser((prevState) => ({
                ...prevState,
                [name]: event.target.checked
              }));
        }
    }

    const handleCreateAccount = (event) => {
        event.preventDefault()
        if (newUser.password === confirmPassword) {
            // fetch(`${BASE_URL}/create-account`, {
            fetch(`${BASE_URL}/create-account`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(newUser),
            })
            .then((response) => response.json())
            .then((newUserData) => {
                setCurrentUser(newUserData)
            })
            history.push({pathname:'/login'})
            
        } else {
            window.alert("Please make sure your passwords match.")
        }
    }

    return (
        <>
        <div className={styles.signupBackground}></div>
        <div className={styles.signupOverlay}></div>
        <div className={styles.signupWrapperDiv}>
            <h1 className={styles.signUpPageH1}>Create Account</h1>
            {/* <div className={styles.signupHeaderDiv}> */}
                {/* <h4>If you already have an account, go back to the login page.</h4> */}
                {/* <h4>Otherwise, create your account here to sign up for classes, memberships, and access your profile information!</h4> */}
            {/* </div> */}
            <div className={styles.signupFormDiv}>
                <Form className={styles.signupForm} onSubmit={handleCreateAccount}>
                    <div className={styles.multipleInRowDiv}>
                    <div className={`${styles.labelInputWrapper} ${styles.firstNameInput}`}>
                            <Form.Label className={styles.formLabel}>First Name:</Form.Label>
                            <Form.Control
                                className={styles.nameInput}
                                type="text"
                                name="firstName"
                                value={newUser.firstName}
                                placeholder="John"
                                required
                                onChange={handleSignUpInputChange}
                                >
                            </Form.Control>
                        </div>
                        <div className={`${styles.labelInputWrapper} ${styles.lastNameInput}`}>
                            <Form.Label className={styles.formLabel}>Last Name:</Form.Label>
                            <Form.Control
                                className={styles.nameInput}
                                type="text"
                                name="lastName"
                                value={newUser.lastName}
                                placeholder="Doe"
                                required
                                onChange={handleSignUpInputChange}
                            >
                            </Form.Control>
                        </div>
                        <div className={`${styles.labelInputWrapper} ${styles.dateOfBirthInput}`}>
                            <Form.Label className={styles.formLabel}>Date of Birth:</Form.Label>
                            <Form.Control
                                type="text"
                                name="dateOfBirth"
                                value={newUser.dateOfBirth}
                                placeholder="YYYY-MM-DD"
                                required onChange={handleSignUpInputChange}
                                >
                            </Form.Control>
                        </div>
                    </div>
                    <br></br><br></br><br></br>
                    <div className={styles.multipleInRowDiv}>
                        <div className={`${styles.labelInputWrapper} ${styles.phoneNumberInput}`}>
                            <Form.Label className={styles.formLabel}>Phone Number:</Form.Label>
                            <Form.Control
                                type="number"
                                name="phoneNumber"
                                value={newUser.phoneNumber}
                                placeholder="Phone Number"
                                required
                                onChange={handleSignUpInputChange}
                                >
                            </Form.Control>
                        </div>
                        <div className={`${styles.labelInputWrapper} ${styles.emailInput}`}>
                            <Form.Label className={styles.formLabel}>Email:</Form.Label>
                            <Form.Control
                                type="email"
                                name="email"
                                value={newUser.email}
                                placeholder="address@mail.com"
                                required
                                onChange={handleSignUpInputChange}
                                >
                                </Form.Control>
                        </div>
                    </div>
                    <Form.Label className={styles.formLabel}>Password:</Form.Label>
                    <div className={styles.multipleInRowDiv}>
                        <Form.Control
                            className={styles.phoneNumberInput}
                            type="password"
                            name="password"
                            value={newUser.password}
                            placeholder="Password"
                            required
                            onChange={handleSignUpInputChange}
                            >
                        </Form.Control>
                        <Form.Control
                            className={styles.emailInput}
                            type="password"
                            name="confirmPassword"
                            value={confirmPassword}
                            placeholder="Confirm Password"
                            required
                            onChange={(event) => setConfirmPassword(event.target.value)}
                            >
                        </Form.Control>
                    </div>
                    <Form.Label className={styles.formLabel}>Address:</Form.Label>
                    <div className={styles.multipleInRowDiv}>
                        <Form.Control
                            className={styles.streetAddressInput}
                            type="text"
                            name="address"
                            value={newUser.address}
                            placeholder="Your Street"
                            required
                            onChange={handleSignUpInputChange}
                            >
                        </Form.Control>
                        <Form.Control
                            className={styles.cityInput}
                            type="text"
                            name="city"
                            value={newUser.city}
                            placeholder="City"
                            required
                            onChange={handleSignUpInputChange}
                            >
                        </Form.Control>
                        <Form.Control
                            className={styles.stateInput}
                            type="text"
                            name="state"
                            value={newUser.state}
                            placeholder="State"
                            required
                            onChange={handleSignUpInputChange}
                            >
                        </Form.Control>
                        <Form.Control
                            className={styles.zipcodeInput}
                            type="number"
                            name="zipcode"
                            value={newUser.zipcode}
                            placeholder="Zip Code"
                            required
                            onChange={handleSignUpInputChange}
                            >
                        </Form.Control>
                    </div>
                    <Form.Label className={styles.formLabel}>Emergency Contact:</Form.Label>
                    <div className={styles.multipleInRowDiv}>
                        <div className={`${styles.labelInputWrapper} ${styles.emergencyNameInput}`}>
                            <Form.Control
                                type="text"
                                name="emergencyContactName"
                                value={newUser.emergencyContactName}
                                required
                                placeholder="Full Name"
                                onChange={handleSignUpInputChange}
                                >
                            </Form.Control>
                        </div>
                        <div className={`${styles.labelInputWrapper} ${styles.emergencyPhoneInput}`}>
                            {/* <Form.Label>Emergency Contact Phone Number:</Form.Label> */}
                            <Form.Control
                                type="number"
                                name="emergencyContactPhoneNumber"
                                value={newUser.emergencyContactPhoneNumber}
                                required
                                placeholder="Phone Number"
                                onChange={handleSignUpInputChange}
                                >
                            </Form.Control>
                        </div>
                    </div>
                    <span className={styles.waiverSpan}>
                    <Form.Label className={styles.waiverFormLabel}>Click to Acknowledge Release of Liability:</Form.Label>
                    <Form.Check
                        className={styles.waiverFormCheck}
                        type="checkbox"
                        name="waiver"
                        value={newUser.waiver}
                        required
                        onChange={handleSignUpInputChange}>
                    </Form.Check>
                    </span>
                    <Button className={styles.signupSubmitButton} type="submit">Create Account!</Button>
                </Form>
            </div>
        </div>
    </>
    )
}

export default SignUp