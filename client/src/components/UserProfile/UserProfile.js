import { useContext } from 'react'
import { LoggedInUserContext } from '../App'
import { useLocation } from 'react-router-dom'

import ProfileInfo from "./ProfileInfo"
import UserBookings from './UserBookings'
import UserPayments from './UserPayments'

import Tabs from 'react-bootstrap/Tabs'
import Tab from 'react-bootstrap/Tab'

const UserProfile = () => {

    const location = useLocation()
    
    const { currentUser } = useContext(LoggedInUserContext)

    let selectedUser
    if (currentUser.admin && location.state) {
        selectedUser = location.state
    } else {
        selectedUser = currentUser
    }

    return (
        // {selectedUser &&
        <div className="navBarOffsetContainer">
        <Tabs
            defaultActiveKey="profile"
            id="justify-tab-example"
            className="mb-3"
            justify
        >
            <Tab eventKey="profile" title="Profile">
                {Object.keys(selectedUser).length > 0 && <ProfileInfo selectedUser={selectedUser} />}
            </Tab>
            <Tab eventKey="bookings" title="Bookings">
                {Object.keys(selectedUser).length > 0 && <UserBookings selectedUser={selectedUser} />}
            </Tab>
            <Tab eventKey="payments" title="Payments">
                {Object.keys(selectedUser).length > 0 && <UserPayments selectedUser={selectedUser} />}
            </Tab>
        </Tabs>
        </div>
        // }
    )
}

export default UserProfile