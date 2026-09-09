import styles from './AdminDashboard.module.css'

import { useContext, useState, useEffect } from 'react'
import { useHistory } from 'react-router-dom'
import { LoggedInUserContext, AllEventsContext, AllMembershipsContext, AllSignupsContext } from '../App'

import ProfileInfo from '../UserProfile/ProfileInfo'
import MembershipData from './Data/MembershipData'
import EventData from './Data/EventData'
import Create from './Create/Create'
import SignupData from './Data/SignupData'

import Tabs from 'react-bootstrap/Tabs'
import Tab from 'react-bootstrap/Tab'
import Accordion from 'react-bootstrap/Accordion'
import ListGroup from 'react-bootstrap/esm/ListGroup'
import Form from 'react-bootstrap/Form'
import Dropdown from 'react-bootstrap/Dropdown'
import Button from 'react-bootstrap/Button'
import { BASE_URL } from '../../api/fetch.js'
const AdminDashboard = () => {
    
    const { currentUser } = useContext(LoggedInUserContext)
    const { allEvents } = useContext(AllEventsContext)
    const { allMemberships } = useContext(AllMembershipsContext)
    // const { allSignups, setAllSignups } = useContext(AllSignupsContext)

    
    const history = useHistory()
    
    // useEffect(() => {
        //     fetch(`${BASE_URL}/signups`)
        //     .then((response) => response.json())
        //     .then((signupData) => setAllSignups(signupData))
        //   }, [])
        
    const renderAllMemberships = (type) => allMemberships.map((membership) => {
        if (membership.type === type) {
            return (
                <MembershipData membership={membership} key={membership.id} />
                )
            }
    })
            
    const renderEvents = (category) => allEvents.map((event) => {
        if (event.category === (category)) {
            return (
                <EventData event={event} key={event.id} />
                )
            }
    })
    
    const [signups, setSignups] = useState([])
    const [signupSearch, setSignupSearch] = useState("")
    const signupFilterCategories = ['Event', 'Customer', 'Date', 'Most Recent']
    const [signupFilter, setSignupFilter] = useState("Event")
    const [shouldRenderSignups, setShouldRenderSignups] = useState(false)

    const renderSignupDropdownMenu = signupFilterCategories.map((category) => {
        return <Dropdown.Item key={category} onClick={() => setSignupFilter(category)}>{category}</Dropdown.Item>
    })

    const renderSignups = signups.map((signup) => {
        return <SignupData signup={signup} key={signup.id} />
    })

    const handleSignupSearch = (event) => {
        event.preventDefault()
        const convertedSignupFilter = signupFilter.split(" ").join("_").toLowerCase()
        console.log(convertedSignupFilter)
        // fetch(`${BASE_URL}/signups/filter`, {
        fetch(`${BASE_URL}/signups/filter`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                "search_term": signupSearch,
                "column_to_search": convertedSignupFilter
            })
        })
        .then((response) => response.json())
        .then((signupData) => {
            setSignups(signupData)
            console.log("Signup Data: ", signupData)
        })
    }

    return (
        <>
            <h1 className={styles.adminDashboardH1}>Admin Dashboard</h1>
            <Tabs
                defaultActiveKey="profile"
                id="justify-tab-profile"
                className='mb-3'
                justify
            >
                <Tab eventKey="profile" title="Your Profile">
                    <ProfileInfo selectedUser={currentUser} />
                </Tab>
                <Tab className={styles.dashboardTab} eventKey="memberships" title="Memberships">
                    <Accordion>
                    <Accordion.Item eventKey='0' className={styles.topAccordionItem}>
                            <Accordion.Header>Guest</Accordion.Header>
                            <Accordion.Body>
                                {renderAllMemberships('Guest')}
                            </Accordion.Body>
                        </Accordion.Item>
                        <Accordion.Item eventKey='1' className={styles.accordionItem}>
                            <Accordion.Header>Memberships</Accordion.Header>
                            <Accordion.Body>
                                {renderAllMemberships('Member')}
                            </Accordion.Body>
                        </Accordion.Item>
                        <Accordion.Item eventKey='2' className={styles.accordionItem}>
                            <Accordion.Header>Punch Cards</Accordion.Header>
                            <Accordion.Body>
                                {renderAllMemberships('Punch Card')}
                            </Accordion.Body>
                        </Accordion.Item>
                        <Accordion.Item eventKey='3' className={styles.accordionItem}>
                            <Accordion.Header>Other</Accordion.Header>
                            <Accordion.Body>
                                {renderAllMemberships('Misc')}
                            </Accordion.Body>
                        </Accordion.Item>
                    </Accordion>
                </Tab>
                <Tab className={styles.dashboardTab} eventKey="events" title="Events">
                    <Accordion>
                        <Accordion.Item eventKey='0'className={styles.topAccordionItem}>
                            <Accordion.Header>Climbing Classes</Accordion.Header>
                            <Accordion.Body id="adminEventsListGroup">
                                {renderEvents('Climbing')}
                            </Accordion.Body>
                        </Accordion.Item>
                        <Accordion.Item eventKey='1' className={styles.accordionItem}>
                            <Accordion.Header>Yoga Classes</Accordion.Header>
                            <Accordion.Body id="adminEventsListGroup">
                                {renderEvents('Yoga')}
                            </Accordion.Body>
                        </Accordion.Item>
                        <Accordion.Item eventKey='2' className={styles.accordionItem}>
                            <Accordion.Header>Fitness Classes</Accordion.Header>
                            <Accordion.Body id="adminEventsListGroup">
                                {renderEvents('Fitness')}
                            </Accordion.Body>
                        </Accordion.Item>
                        <Accordion.Item eventKey='3' className={styles.accordionItem}>
                            <Accordion.Header>Events</Accordion.Header>
                            <Accordion.Body id="adminEventsListGroup">
                                {renderEvents('Event')}
                            </Accordion.Body>
                        </Accordion.Item>
                        <Accordion.Item eventKey='4' className={styles.accordionItem}>
                            <Accordion.Header>Other Classes and Events</Accordion.Header>
                            <Accordion.Body id="adminEventsListGroup">
                                {renderEvents('Misc')}
                            </Accordion.Body>
                        </Accordion.Item>
                    </Accordion>
                </Tab>
                <Tab className={styles.dashboardTab} eventKey="signups" title="Signups">
                    <div className={styles.signupTabDiv}>
                        <Form className={styles.signupSearchForm} onSubmit={handleSignupSearch}>
                            <Form.Control className={styles.signupSearchFormControl} value={signupSearch} onChange={(event) => setSignupSearch(event.target.value)}></Form.Control>
                            <Dropdown className={styles.signupSearchDropdown}>
                                <span className={styles.filterSignupsSpan}><b>Filter By:</b></span><Dropdown.Toggle className={styles.signupFilterDropdownToggle}>{signupFilter}</Dropdown.Toggle>
                                <Dropdown.Menu>{renderSignupDropdownMenu}</Dropdown.Menu>
                            </Dropdown>
                            <Button className={styles.signupSearchButton}>Search!</Button>
                        </Form>
                    </div>
                        <ListGroup>
                            {signups.length > 0 ? renderSignups : <span className={styles.noSignupsSpan}>No signups to display.</span>}
                        </ListGroup>
                </Tab>
                <Tab className={`${styles.dashboardTab} ${styles.dashboardTabCentered}`} eventKey="create" title="Create">
                    <Create />
                </Tab>
                <Tab className={styles.dashboardTabCentered} eventKey="userDatabase" title="User Database">
                    <h2 className={styles.userDatabaseH2}>To view and manage the user database, a redirect is required.</h2>
                    <h3>Click the button below to search and edit user profiles.</h3>
                    <Button className={styles.userDatabaseRedirectButton} onClick={() => history.push({pathname:"/database"})}>Go to User Database</Button>
                </Tab>
            </Tabs>
        </>
    )
}

export default AdminDashboard