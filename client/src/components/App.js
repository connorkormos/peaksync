import { BASE_URL } from '../api/fetch.js';

import React, { useEffect, useState } from "react";
import { Switch, Route } from "react-router-dom";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/css/bootstrap.css';

import NavBar from "./NavBar.js";
import Home from "./Home/Home.js";
import EventsCalendar from "./Calendar/EventsCalendar.js"
import Login from "./Account/Login.js"
import SignUp from "./Account/SignUp.js"
import UserDatabase from "./AdminDashboard/UserDatabase.js"
import UserProfile from "./UserProfile/UserProfile.js";
import AdminDashboard from "./AdminDashboard/AdminDashboard.js";
import MembershipOfferings from "./Offerings/MembershipOfferings.js";
import ClassOfferings from "./Offerings/ClassOfferings.js";
import ConfirmMembershipOrderDetails from "./Offerings/ConfirmMembershipOrderDetails.js";
import ConfirmClassSignupDetails from "./Offerings/ConfirmClassSignupDetails.js";
import CancelledSignup from "./Stripe/CancelledSignup.js";
import SuccessfulSignup from "./Stripe/SuccessfulSignup.js";
import EditSignup from './AdminDashboard/Edit/EditSignup.js'
import SuccessfulMembershipPurchase from "./Stripe/SuccessfulMembershipPurchase";
import CancelledMembershipPurchase from "./Stripe/CancelledMembershipPurchase";

export const AllUsersContext = React.createContext()
export const AllEventsContext = React.createContext()
export const AllSessionsContext = React.createContext()
export const AllSignupsContext = React.createContext()
export const AllMembershipsContext = React.createContext()
export const LoggedInUserContext = React.createContext()
export const CurrentTransactionContext = React.createContext()
export const CurrentUserToggleContext = React.createContext()
export const SessionsToggleContext = React.createContext()
export const SignupsToggleContext = React.createContext()
export const MembershipsToggleContext = React.createContext()

function App() {

  const [currentUser, setCurrentUser] = useState({})
  const [allUsers, setAllUsers] = useState([])
  const [allEvents, setAllEvents] = useState([])
  const [allSessions, setAllSessions] = useState([])
  const [allSignups, setAllSignups] = useState([])
  const [allMemberships, setAllMemberships] = useState([])
  const [currentTransaction, setCurrentTransaction] = useState({})

  const [currentUserToggle, setCurrentUserToggle] = useState(false)
  const [sessionsToggle, setSessionsToggle] = useState(false)
  const [signupsToggle, setSignupsToggle] = useState(false)
  const [membershipsToggle, setMembershipsToggle] = useState(false)

  const allUsersContextObject = {
    allUsers,
    setAllUsers
  }

  const allEventsContextObject = {
    allEvents,
    setAllEvents
  }

  const allSessionsContextObject = {
    allSessions,
    setAllSessions
  }

  const allSignupsContextObject = {
    allSignups,
    setAllSignups
  }

  const allMembershipsContextObject = {
    allMemberships,
    setAllMemberships
  }
  
  const loggedInUserContextObject = {
    currentUser,
    setCurrentUser
  }
  
  const currentTransactionContextObject = {
    currentTransaction,
    setCurrentTransaction
  }
  
  
  const currentUserToggleContextObject = {
    currentUserToggle,
    setCurrentUserToggle
  }

  const sessionsToggleContextObject = {
    sessionsToggle,
    setSessionsToggle
  }

  const signupsToggleContextObject = {
    signupsToggle,
    setSignupsToggle
  }

  const membershipsToggleContextObject = {
    membershipsToggle,
    setMembershipsToggle
  }
        
  // const fetchLoggedInUser = (sessionData) => {
  //   fetch(`${BASE_URL}/users/${sessionData}`)
  //   .then((response) => response.json())
  //   .then((userData) => {
  //       setCurrentUser(userData)
  //   })
  // }

  useEffect(() => {
    // fetch(`${BASE_URL}/check-session`)
    // .then((response) => response.json())
    // .then((sessionData) => {
    //   console.log(sessionData)
    //   fetchLoggedInUser(sessionData)
    // })
    const userId = localStorage.getItem("user_id")
    if (userId) {
        fetch(`${BASE_URL}/users/${userId}`)
        .then((response) => response.json())
        .then((loggedInUserData) => setCurrentUser(loggedInUserData))
    }
  }, [currentUserToggle])

  useEffect(() => {
    fetch(`${BASE_URL}/events`)
    .then((response) => response.json())
    .then((eventData) => {
      setAllEvents(eventData)
    })
  }, [sessionsToggle])
  
  useEffect(() => {
    fetch(`${BASE_URL}/memberships`)
    .then((response) => response.json())
    .then((membershipData) => {
      setAllMemberships(membershipData)
    })
  }, [membershipsToggle])

  useEffect(() => {
    fetch(`${BASE_URL}/sessions`)
    .then((response) => response.json())
    .then((allSessionsData) => {
      setAllSessions(allSessionsData)
    })
  }, [sessionsToggle])

  // useEffect(() => {
  //   if (currentUser.admin === true) {
     fetch(`${BASE_URL}/signups`)
  //     .then((response) => response.json())
  //     .then((signupData) => setAllSignups(signupData))
  //   }
  // }, [signupsToggle, currentUser])

  return (
    <>
    <AllUsersContext.Provider value={allUsersContextObject}>
      <AllEventsContext.Provider value={allEventsContextObject}>
        <AllSessionsContext.Provider value={allSessionsContextObject}>
          <AllMembershipsContext.Provider value={allMembershipsContextObject}>
            <AllSignupsContext.Provider value={allSignupsContextObject}>
              <CurrentUserToggleContext.Provider value={currentUserToggleContextObject}>
                <LoggedInUserContext.Provider value={loggedInUserContextObject}>
                  <CurrentTransactionContext.Provider value={currentTransactionContextObject}>
                    <SessionsToggleContext.Provider value={sessionsToggleContextObject}>
                      <SignupsToggleContext.Provider value={signupsToggleContextObject}>
                        <MembershipsToggleContext.Provider value={membershipsToggleContextObject}>
                          <NavBar/>
                          <Switch>
                            <Route exact path='/'>
                              <Home currentUser={currentUser} />
                            </Route>
                            <Route exact path='/calendar'>
                              <EventsCalendar />
                            </Route>
                            <Route exact path='/account'>
                              <Login />
                            </Route>
                            <Route exact path='/signup'>
                              <SignUp />
                            </Route>
                            <Route exact path='/admin-dashboard'>
                              {currentUser.admin ? 
                              <AdminDashboard />
                              : <Home />}
                            </Route>
                            <Route exact path='/database'>
                              <UserDatabase />
                            </Route>
                            <Route exact path='/profile'>
                              <UserProfile />
                            </Route>
                            <Route exact path='/offerings/memberships'>
                              <MembershipOfferings />
                            </Route>
                            <Route exact path='/offerings/classes'>
                              <ClassOfferings />
                            </Route>
                            <Route exact path='/edit/signup'>
                              <EditSignup />
                            </Route>
                            <Route exact path='/confirm-membership-order'>
                              <ConfirmMembershipOrderDetails />
                            </Route>
                            <Route exact path='/confirm-event-order'>
                              <ConfirmClassSignupDetails />
                            </Route>
                            <Route exact path='/signup/cancelled'>
                              <CancelledSignup />
                            </Route>
                            <Route exact path='/signup/success'>
                              <SuccessfulSignup />
                            </Route>
                            <Route exact path='/purchase/membership/success'>
                              <SuccessfulMembershipPurchase />
                            </Route>
                            <Route exact path='/purchase/membership/cancelled'>
                              <CancelledMembershipPurchase />
                            </Route>
                          </Switch>
                        </MembershipsToggleContext.Provider>
                      </SignupsToggleContext.Provider>
                    </SessionsToggleContext.Provider>
                  </CurrentTransactionContext.Provider>
                </LoggedInUserContext.Provider>
              </CurrentUserToggleContext.Provider>
            </AllSignupsContext.Provider>
          </AllMembershipsContext.Provider>
        </AllSessionsContext.Provider>
      </AllEventsContext.Provider>
    </AllUsersContext.Provider>
    </>
  )
}

export default App;