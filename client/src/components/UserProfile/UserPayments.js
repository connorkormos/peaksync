import styles from './UserProfile.module.css'

import ListGroup from 'react-bootstrap/ListGroup'

const UserPayments = ({ selectedUser }) => {
    const renderUserPayments = selectedUser.payments.map((payment) => {

        if (payment.membership) {

            return (
                <ListGroup.Item>
                    {payment.created_at} - {payment.membership.name} - ${payment.membership.price}
                </ListGroup.Item>
            )
        } else if (payment.signup) {
            return (
                <ListGroup.Item>
                    {payment.created_at} - {payment.signup.session.event.name} - ${payment.signup.session.event.price}
                </ListGroup.Item>
            )
        }
        return null;
    })
    
    return (
        <>
        <h1>{selectedUser.first_name} {selectedUser.last_name}'s Payment History</h1>
        <div>
            {/* <h1 id="userBalanceH1">Balance: <span id="userBalanceSpan"></span></h1> */}
            {/* <h1 id="userCreditH1">Credit: <span id="userCreditSpan"></span></h1> */}
        </div>
            <ListGroup className={styles.listGroup}>
                {renderUserPayments}
            </ListGroup>
        </>
    )
}

export default UserPayments