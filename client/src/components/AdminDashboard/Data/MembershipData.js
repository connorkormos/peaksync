import { BASE_URL } from '../../../api/fetch.js';
import styles from './MembershipData.module.css'

import { useState, useContext } from 'react'
import { AllMembershipsContext } from '../../App'

import ListGroup from 'react-bootstrap/ListGroup'
import Button from 'react-bootstrap/esm/Button'

const MembershipData = ({ membership }) => {
    
    const { allMemberships, setAllMemberships } = useContext(AllMembershipsContext)

    const [editMembershipToggle, setEditMembershipToggle] = useState(false)

    const [editedMembership, setEditedMembership] = useState({
        "id": membership.id,
        "name": membership.name,
        "price": membership.price,
        "type": membership.type,
        "subtype": membership.subtype,
        "description": membership.description,
        "stripe_product_id": membership.stripe_product_id,
        "stripe_price_id": membership.stripe_price_id
    })

    const handleDiscardMembershipChanges = (event) => {
        setEditedMembership({
            "id": membership.id,
            "name": membership.name,
            "price": membership.price,
            "type": membership.type,
            "subtype": membership.subtype,
            "description": membership.description,
            "stripe_product_id": membership.stripe_product_id,
            "stripe_price_id": membership.stripe_price_id
          });
        setEditMembershipToggle(false)
    }
    const handleMembershipDetailChange = (event) => {
        const {name, value} = event.target
        setEditedMembership((prevState) => ({
            ...prevState,
            [name]: value
        }))
    }

    const handleMembershipChangeSubmit = (membership_id) => {
        fetch(`${BASE_URL}/memberships/${membership_id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(editedMembership)
        })
        .then((response) => response.json())
        .then((editedMembershipData) => {
            console.log(editedMembershipData)
            setEditMembershipToggle(!editMembershipToggle)
        })
        console.log(editedMembership.price, typeof editedMembership.price)
        console.log(membership.price, typeof membership.price)
        if (Number(editedMembership.price) !== Number(membership.price) || editedMembership.name !== membership.name || editedMembership.description !== membership.description) {
            console.log("Editing Stripe product price...")
            fetch(`${BASE_URL}/update_stripe_membership_product`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: editedMembership.name,
                    description: editedMembership.description,
                    stripe_product_id: membership.stripe_product_id,
                    stripe_price_id: membership.stripe_price_id,
                    price: Number(editedMembership.price) * 100
                })
            })
            .then((response) => response.json())
            .then((updatedStripeProductPriceData) => console.log(updatedStripeProductPriceData))
        }
    }
    const handleMembershipDelete = (membership_id) => {
        if (window.confirm("Are you sure you want to delete this membership?  This action cannot be undone.") === true) {
            if (membership.users.length === 0) {
                console.log(membership.users.length)
                fetch(`${BASE_URL}/memberships/${membership_id}`, {
                        method: 'DELETE'
                    })
                    const updatedMemberships = allMemberships.filter((memb) => memb.id != membership_id)
            setAllMemberships(updatedMemberships)
            } else {
                window.alert(`Sorry, but there are ${membership.users.length} users with this type of membership or offering. Make sure their profiles are adjusted to a new membership type before deleting this offering.`)
            }
        } else {
            window.alert("Okay, the membership has not been deleted.")
        }
    }

    return (
        <ListGroup.Item className={styles.listGroupItem}>
            <b>Name:</b> {editMembershipToggle ? <input name="name" value={editedMembership.name} onChange={handleMembershipDetailChange}></input> : <span>{editedMembership.name}</span>} 
            <br></br>
            <b>Price:</b> ${editMembershipToggle ? <input name="price" value={editedMembership.price} onChange={handleMembershipDetailChange}></input> : <span>{editedMembership.price}</span>} 
            <br></br>
            <b>Type:</b> {editMembershipToggle ? <input name="type" value={editedMembership.type} onChange={handleMembershipDetailChange}></input> : <span>{editedMembership.type}</span>} 
            <br></br>
            <b>Subtype:</b> {editMembershipToggle ? <input name="subtype" value={editedMembership.subtype} onChange={handleMembershipDetailChange}></input> : <span>{editedMembership.subtype}</span>} 
            <br></br>
            <b>Description:</b> {editMembershipToggle ? <input className={styles.listGroupInput} name="description" value={editedMembership.description} onChange={handleMembershipDetailChange}></input> : <span>{editedMembership.description}</span>}
            <br></br>
            {editMembershipToggle ? null : <><br></br><Button onClick={() => setEditMembershipToggle(!editMembershipToggle)}>Edit Membership</Button></>}
            {editMembershipToggle ?
            <Button onClick={() => handleMembershipChangeSubmit(membership.id)}>Save Changes</Button>
            : null}
            {editMembershipToggle ?
            <Button className={styles.discardMembershipChangeButton} onClick={handleDiscardMembershipChanges}>Discard Changes</Button>
            : null}
            {!editMembershipToggle && <Button className={styles.deleteMembershipButton} onClick={() => handleMembershipDelete(membership.id)}>Delete Membership</Button>}
        </ListGroup.Item>
    )
}

export default MembershipData