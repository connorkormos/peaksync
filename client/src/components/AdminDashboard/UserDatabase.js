import styles from './UserDatabase.module.css'

import { useState, useContext } from "react"
import { useHistory } from 'react-router-dom'
import { AllUsersContext } from "../App.js"

import Table from 'react-bootstrap/Table'
import Dropdown from "react-bootstrap/Dropdown"
import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'

import { BASE_URL } from '../../api/fetch.js'

const UserDatabase = () => {

    const { allUsers, setAllUsers } = useContext(AllUsersContext)

    const history = useHistory()

    const [searchParams, setSearchParams] = useState("")
    const [searchCategory, setSearchCategory] = useState("Customer")
    const [activeLi, setActiveLi] = useState("")
    const [selectedUserProfile, setSelectedUserProfile] = useState(null)

    const columnLabels = ["ID", "Customer", "Email", "Phone Number", "Waiver", "Address", "City", "State", "Zipcode", "Date of Birth", "Created At", "Admin"]

    const renderColumnLabels = columnLabels.map((label) => {
        if (label === 'Date of Birth') {
            return <th key={label}>{"D.O.B"}</th>
        } else {
            return <th key={label}>{label}</th>
        }
    })

    const renderDropdownItems = columnLabels.map((label) => {
        return (
            <Dropdown.Item name={label} key={label} onClick={(event) => setSearchCategory(event.target.name)}>{label}</Dropdown.Item>
        )
    })

    let convertedSearchCategory = searchCategory.split(" ").join("_").toLowerCase()
    const handleUserClick = (user) => {
        setActiveLi(user.id)
        setSelectedUserProfile(user)
    }

    const handleUserDoubleClick = (user) => {
        setSelectedUserProfile(user)
        history.push({pathname:"/profile", state:selectedUserProfile})
    }

    const filterUsers = allUsers.map((user) => {
            return (
                <tr key={user.id} onClick={() => handleUserClick(user)} onDoubleClick={() => handleUserDoubleClick(user)} style={{background: activeLi === user.id ? "lightblue" : null}}>
                    <td>{user.id}</td>
                    <td>{user.last_name}, {user.first_name}</td>
                    <td>{user.email}</td>
                    <td>{user.phone_number}</td>
                    <td>{user.waiver ? "True" : "False"}</td>
                    <td>{user.address}</td>
                    <td>{user.city}</td>
                    <td>{user.state}</td>
                    <td>{user.zipcode}</td>
                    <td>{user.date_of_birth}</td>
                    <td>{user.created_at}</td>
                    <td>{user.admin ? "True" : "False"}</td>
                </tr>
            )
    })

    const handleFetchUsers = (event) => {
        event.preventDefault()
        // fetch(`${BASE_URL}/users/filter`, {
        fetch(`${BASE_URL}/users/filter`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                "search_term": searchParams,
                "column_to_search": convertedSearchCategory
            })
        })
        .then((response) => response.json())
        .then((userData) => {
            setAllUsers(userData)
            console.log(userData)
        })
    }

    return (
        <div className="navBarOffsetContainer">
            <h1 className={styles.userDatabaseH1}>User Database</h1>
            <div className={styles.searchDiv}>
            <Form className={styles.searchForm} onSubmit={handleFetchUsers}>
                <Form.Control
                    className={styles.searchFormControl}
                    type="text"
                    value={searchParams}
                    onChange={(event) => setSearchParams(event.target.value)}
                >
                </Form.Control>
                <Button type="submit">Search</Button>
            </Form>
            <Dropdown className={styles.filterDropdown}>
                <span className={styles.filterSpan}><b>Filter By:</b></span>
                <Dropdown.Toggle>
                    {searchCategory}
                </Dropdown.Toggle>
                <Dropdown.Menu>
                    {renderDropdownItems}
                </Dropdown.Menu>
            </Dropdown>
            </div>
            <div className={styles.userResultsDiv}>
            <Table className={styles.userResultsTable}>
                <thead>
                    <tr>
                        {renderColumnLabels}
                    </tr>
                </thead>
                <tbody>
                    {filterUsers}
                </tbody>
            </Table>
            </div>
        </div>
    )
}

export default UserDatabase