import styles from './Login.module.css'
// import styles from './Login.css';
import { useState, useContext, useEffect } from "react"
import { useHistory } from "react-router-dom"
import { BASE_URL } from '../../api/fetch.js'

import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'
import { Link } from 'react-router-dom'
import { LoggedInUserContext, AllUsersContext } from "../App"

const Login = () => {

    const history = useHistory()

    const { currentUser, setCurrentUser } = useContext(LoggedInUserContext)
    const { setAllUsers } = useContext(AllUsersContext)

    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")

    const fetchUserBySessionData = (sessionData) => {
        // fetch(`${BASE_URL}/users/${sessionData}`)
        fetch(`${BASE_URL}/users/${sessionData}`)
        .then((response) => response.json())
        .then((userData) => {
            setCurrentUser(userData)
            // fetchAllUsers(currentUser)
        })
    }

    useEffect(() => {
        // fetch(`${BASE_URL}/check-session`)
        // .then((response) => response.json())
        // .then((sessionData) => fetchUserBySessionData(sessionData))
        const userId = localStorage.getItem("user_id")
        if (userId) {
            // fetch(`${BASE_URL}/users/${userId}`)
            fetch(`${BASE_URL}/users/${userId}`)
            .then((response) => response.json())
            .then((loggedInUserData) => setCurrentUser(loggedInUserData))
        }
    }, [])
    
    const handleUserLogin = (event) => {
        event.preventDefault()
        // fetch(`${BASE_URL}/login`, {
        fetch(`${BASE_URL}/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                "email": email,
                "password": password
            }),
        })
        .then((response) => response.json())
        .then((userData) => {
            setCurrentUser(userData)
            localStorage.setItem("user_id", userData.id)
        })
    }

    const handleLogout = () => {
        // fetch(`${BASE_URL}/logout`, {
        fetch(`${BASE_URL}/logout`, {
            method: 'DELETE'
        })
        localStorage.removeItem("user_id")
        setCurrentUser({})
        setAllUsers([])
        history.push({pathname:"/"})
    }

    return (
        <>
            <div className={styles.loginBackground}></div>
            <div className={styles.loginOverlay}></div>
        <div className={styles.mainDiv}>
            {Object.keys(currentUser).length > 0 ?
            <div className={styles.loggedInDiv}>
                <h1 className={styles.loggedInH1}>Hi {currentUser.first_name}, thanks for logging in!</h1>
                <h3 className={styles.loggedInH3}>To view or edit your profile information, <Link className={styles.accountInfoLink} to="/profile">click here</Link>.</h3>
                <Button className={styles.logoutButton} onClick={() => handleLogout()}>Logout</Button>
            </div>
            :
            // <div class="w-users-userformpagewrap full-page-wrapper"><a href="/" class="form-page-logo-link w-inline-block"><img src="https://assets.website-files.com/62aee78456e4207786ac4d18/62b0f8678a35c23b4437f273_Memberbase%20White%20Logo.svg" loading="lazy" alt="Memberbase Logo" class="form-page-logo"></img></a><div class="w-users-userloginformwrapper admin-form-card">
            //     <form data-wf-user-form-type="login" data-wf-user-form-redirect="/resources" method="post">
            //         <div class="w-users-userformheader form-card-header">
            //         <h2 class="heading h3">Log in</h2>
            //         <p class="paragraph small">Fill in your log in details below.</p>
            //         </div>
            //         <input type="email" maxlength="256" placeholder="Your email" name="Email" id="wf-log-in-email" class="text-field w-input" required="" data-wf-user-form-input-type="email"></input>
            //         <input type="password" maxlength="256" placeholder="Your password" name="Password" id="wf-log-in-password" class="text-field w-input" required="" data-wf-user-form-input-type="password"></input>
            //         <input type="submit" value="Log In" data-wait="Please wait..." class="w-users-userformbutton button w-button"></input>
            //                 <div class="w-users-userformfooter form-card-footer"><span>Don't have an account? </span><a href="/sign-up">Sign Up</a></div>
            //     </form>
            // <div style={{display: 'none'}} data-wf-user-form-error="true" class="w-users-userformerrorstate form-error w-form-fail"><div class="user-form-error-msg" wf-login-form-general-error-error="We're having trouble logging you in. Please try again, or contact us if you continue to have problems." wf-login-form-invalid-email_or_password-error="Invalid email or password. Please try again.">We're having trouble logging you in. Please try again, or contact us if you continue to have problems.</div></div></div><a href="/reset-password" class="below-card-link">Forgot your password?</a></div>            // 
            <>
                <h1 className={styles.loggedInH1}>Login Here:</h1>
                <div className={styles.loginDiv}>
                    <br></br>
                    <Form className={styles.loginForm} onSubmit={handleUserLogin}>
                        <Form.Control
                            type="email"
                            name="email"
                            value={email}
                            placeholder="address@email.com"
                            onChange={(event) => setEmail(event.target.value)}>
                        </Form.Control>
                        <br></br><br></br>
                        <Form.Control
                            type="password"
                            name="password"
                            value={password}
                            placeholder="Password"
                            onChange={(event) => setPassword(event.target.value)}>
                        </Form.Control>
                        <br></br><br></br>
                        <Button className={styles.loginButton} type="submit">Login!</Button>
                    </Form>
                </div>
                <div>
                    {/* <h3 className={styles.loginH3}>Don't have an account yet?  Sign up for one here!</h3> */}
                    <br></br>
                    <Button className={styles.createAccountButton} onClick={() => history.push({pathname: "/signup"})}>I want to create an account</Button>
                    <br></br><br></br>
                </div>
            </>
            }
        </div>
            </>
    )
}

export default Login