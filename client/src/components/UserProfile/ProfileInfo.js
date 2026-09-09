import { BASE_URL } from '../../api/fetch.js';
import styles from './UserProfile.module.css'

import { useState, useContext, useEffect } from 'react'
import { AllUsersContext, LoggedInUserContext, AllMembershipsContext } from '../App'

import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'
import Dropdown from 'react-bootstrap/Dropdown'

const ProfileInfo = ({ selectedUser }) => {
    
    const { currentUser } = useContext(LoggedInUserContext)
    const { allUsers, setAllUsers } = useContext(AllUsersContext)
    const { allMemberships } = useContext(AllMembershipsContext)
    
    const [selectedMembership, setSelectedMembership] = useState(selectedUser.membership)
    const [membershipName, setMembershipName] = useState(selectedUser.membership.name)
    const [membershipType, setMembershipType] = useState(selectedMembership.type)
    const [membershipSubtype, setMembershipSubtype] = useState(selectedMembership.subtype)
    const [editProfile, setEditProfile] = useState(false)

    const [isAdmin] = useState(selectedUser.admin)
    const [userProfileInfo, setUserProfileInfo] = useState({
        "first_name": selectedUser.first_name,
        "last_name": selectedUser.last_name,
        "email": selectedUser.email,
        "phone_number": selectedUser.phone_number,
        "address": selectedUser.address,
        "city": selectedUser.city,
        "state": selectedUser.state,
        "zipcode": selectedUser.zipcode,
        "date_of_birth": selectedUser.date_of_birth,
        "emergency_contact_name": selectedUser.emergency_contact_name,
        "emergency_contact_phone_number": selectedUser.emergency_contact_phone_number,
        "membership_id": selectedUser.membership_id,
        "admin": selectedUser.admin
    })

    const handleProfileInfoChange = (event) => {
        const {name, value} = event.target
        setUserProfileInfo((prevState) => ({
            ...prevState,
            [name]: value
        }))
    }

    const handleDiscardChanges = () => {
        setUserProfileInfo({
            "first_name": selectedUser.first_name,
            "last_name": selectedUser.last_name,
            "email": selectedUser.email,
            "phone_number": selectedUser.phone_number,
            "address": selectedUser.address,
            "city": selectedUser.city,
            "state": selectedUser.state,
            "zipcode": selectedUser.zipcode,
            "date_of_birth": selectedUser.date_of_birth,
            "emergency_contact_name": selectedUser.emergency_contact_name,
            "emergency_contact_phone_number": selectedUser.emergency_contact_phone_number,
            "membership_id": selectedUser.membership_id,
            "admin": selectedUser.admin
        })
        setEditProfile(false)
    }

    const handleProfileEdit = () => {
        fetch(`${BASE_URL}/users/${selectedUser.id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(userProfileInfo),
        })
        .then((response) => response.json())
        .then((editedUserData) => {
            const updatedAllUsersState = allUsers.map((user) => {
                if (user.id == editedUserData.id) {
                    return editedUserData
                } else {
                    return user
                }
            })
            setAllUsers(updatedAllUsersState)
            setEditProfile(false)
        })
    }

    const handleMembershipChange = (event) => {
        allMemberships.map((membership) => {
            if (membership.name === event.target.name) {
                setUserProfileInfo((prevState) => ({
                    ...prevState,
                    membership_id: membership.id
                }))
                setSelectedMembership(membership)
            }
        })
    }

    useEffect(() => {
        setMembershipName(selectedMembership.name)
        setMembershipType(selectedMembership.type)
        setMembershipSubtype(selectedMembership.subtype)
    }, [selectedMembership])
    
    const allMembershipNames = allMemberships.map((membership) => {
        return (
            <Dropdown.Item name={membership.name} value={membership.id} key={membership.id} onClick={(event) => handleMembershipChange(event)}>{membership.name}</Dropdown.Item>
        )
    })

    
    const setAdminStatus = () => {
        setUserProfileInfo((prevState) => ({
            ...prevState,
            admin: !prevState.admin
        }))
    }

    return (
        <>
        {currentUser.admin && <h2 className={styles.warningH2}>Use caution whenever editing user profile information.  There is no "undo" button once you save them!</h2>}
        <h1 className={styles.profileNameH1}>{selectedUser.first_name} {selectedUser.last_name}'s Profile</h1>
        <div className={styles.outerProfileInfoDiv}>
            <div className={styles.middleProfileInfoDiv}>
                {/* <Card.Img src={myImage} style={{width:"250px", display:"flex", justifyContent:"center"}}></Card.Img> */}
                <div className={styles.innerProfileInfoDiv}>

                    <h4><b>First Name:</b> {editProfile ? <input name="first_name" value={userProfileInfo.first_name} onChange={handleProfileInfoChange}></input> : userProfileInfo.first_name}
                    <br></br>
                    <b>Last Name:</b> {editProfile ? <input name="last_name" value={userProfileInfo.last_name} onChange={handleProfileInfoChange}></input> : userProfileInfo.last_name}</h4>
                    <br></br>
                    <h3><b>Contact Information:</b></h3>
                    <br></br>
                    <span><b>Email:</b> {editProfile ? <input name="email" value={userProfileInfo.email} onChange={handleProfileInfoChange}></input> : userProfileInfo.email}</span>
                    <br></br>
                    <b>Phone Number:</b> {editProfile ? <input name="phone_number" value={userProfileInfo.phone_number} onChange={handleProfileInfoChange}></input> : userProfileInfo.phone_number}
                    <br></br>
                    <b>Address:</b> {editProfile ? <input name="address" value={userProfileInfo.address} onChange={handleProfileInfoChange}></input> : userProfileInfo.address}
                    <br></br>
                    <b>City:</b> {editProfile ? <input name="city" value={userProfileInfo.city} onChange={handleProfileInfoChange}></input> : userProfileInfo.city}
                    <br></br>
                    <b>State:</b> {editProfile ? <input name="state" value={userProfileInfo.state} onChange={handleProfileInfoChange}></input> : userProfileInfo.state}
                    <br></br>
                    <b>Zipcode:</b> {editProfile ? <input name="zipcode" value={userProfileInfo.zipcode} onChange={handleProfileInfoChange}></input> : userProfileInfo.zipcode}
                    <br></br>
                    <b>Date of Birth:</b> {editProfile ? <input name="date_of_birth" value={userProfileInfo.date_of_birth} onChange={handleProfileInfoChange}></input> : userProfileInfo.date_of_birth}
                    <br></br>
                    <b>Emergency Contact Name:</b> {editProfile ? <input name="emergency_contact_name" value={userProfileInfo.emergency_contact_name} onChange={handleProfileInfoChange}></input> : userProfileInfo.emergency_contact_name}
                    <br></br>
                    <b>Emergency Contact Phone Number:</b> {editProfile ? <input name="emergency_contact_phone_number" value={userProfileInfo.emergency_contact_phone_number} onChange={handleProfileInfoChange}></input> : userProfileInfo.emergency_contact_phone_number}
                    <br></br>
                    <b>Waiver Status:</b> {userProfileInfo.waiver ? "Active" : "Inactive"}
                    <br></br>
                    <b>First Contact with Customer:</b> {selectedUser.created_at}
                    <br></br>
                    <b>Most Recent Change to Customer:</b> {selectedUser.updated_at ? selectedUser.updated_at : "N/A"}
                    <br></br>
                    {currentUser.admin && editProfile ?
                    <div className={styles.editMembershipDiv}>
                        <span><b>Membership: </b>
                        <Dropdown className={styles.editMembershipDropdown}>
                            <Dropdown.Toggle>{membershipName}</Dropdown.Toggle>
                            <Dropdown.Menu>
                                {allMembershipNames}
                            </Dropdown.Menu>
                        </Dropdown>
                        </span>
                        <br></br><br></br><br></br>
                    </div>
                    : <span><b>Membership:</b> {membershipName}</span>}
                    <br></br>
                    <b>Type:</b> {membershipType}
                    <br></br>
                    <b>Subtype:</b> {membershipSubtype}
                    <br></br>
                    {currentUser.admin && <Form.Label>Admin?</Form.Label>}
                    {currentUser.admin && <Form.Check value={isAdmin} checked={userProfileInfo.admin} onClick={setAdminStatus}></Form.Check>}
                    <br></br>
                    {editProfile && <Button className={styles.saveChangesButton} onClick={handleProfileEdit}>Save Changes</Button>}
                    {editProfile && <Button className={styles.discardChangesButton} onClick={handleDiscardChanges}>Discard Changes</Button>}
                    {!editProfile ? <Button onClick={() => setEditProfile(true)}>Edit Profile</Button> : null}
                </div>
            </div>
        </div>
        </>
    )
}

export default ProfileInfo



// const [expiration, setExpiration] = useState({
    //     "month": "Month",
    //     "day": "Day",
    //     "year": "Year"
    // })
    
    // const handleExpirationChange = (event) => {
        //     const { name, id } = event.target
        //     setExpiration((prevState) => ({
            //         ...prevState,
            //         [name]: id
            //     }))
            // }
            
            // const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
            // const renderExpirationDays = () => {
                //     let i = 1;
                //     const days = [];
                
                //     if (['January', 'March', 'May', 'July', 'August', 'October', 'December'].includes(String(expiration.month))) {
                    //       while (i <= 31) {
                        //         days.push(<Dropdown.Item name="day" id={i} key={i} onClick={(event) => handleExpirationChange(event)}>{i}</Dropdown.Item>);
                        //         i++;
                        //       }
                        //     } else if (['April', 'June', 'September', 'November'].includes(String(expiration.month))) {
//         while (i <= 30) {
//           days.push(<Dropdown.Item name="day" id={i} key={i} onClick={(event) => handleExpirationChange(event)}>{i}</Dropdown.Item>);
//           i++;
//         }
//     } else if (String(expiration.month) === 'February') {
    //         while (i <= 29) {
        //           days.push(<Dropdown.Item name="day" id={i} key={i} onClick={(event) => handleExpirationChange(event)}>{i}</Dropdown.Item>);
        //           i++;
        //         }
        //     }
        //     return days;
        //   };
        // const renderExpirationMonth = months.map((month) => {
            //     return (
                //         <Dropdown.Item name="month" id={month} key={month} onClick={(event) => handleExpirationChange(event)}>{month}</Dropdown.Item>
                //     )
                // })
                
                // const renderExpirationYears = () => {
                    //     let i = 2023
                    //     let years = []
                    //     while (i <= 2033) {
                        //         years.push(<Dropdown.Item name="year" id={i} key={i} onClick={(event) => handleExpirationChange(event)}>{i}</Dropdown.Item>)
                        //         i++
                        //     }
                        //     return years
                        // }


                        // {/* <Card.Text style={{display:'flex', alignContent:'center', marginRight:'1rem', marginTop:'0.35rem'}}>Expires:</Card.Text> */}
                        // {/* <Dropdown>
                        // <Dropdown.Toggle style={{marginRight:'0.5rem'}}>{expiration.month}</Dropdown.Toggle>
                        // <Dropdown.Menu>
                        // {renderExpirationMonth}
                        // </Dropdown.Menu>
                        // </Dropdown>
                        // <Dropdown>
                        // <Dropdown.Toggle style={{marginRight:'0.5rem'}}>{expiration.day}</Dropdown.Toggle>
                        // <Dropdown.Menu>
                        // {renderExpirationDays()}
                        // </Dropdown.Menu>
                        // </Dropdown>
                        // <Dropdown>
                        // <Dropdown.Toggle>{expiration.year}</Dropdown.Toggle>
                        // <Dropdown.Menu>
                        // {renderExpirationYears()}
                        // </Dropdown.Menu>
                        // </Dropdown> */}