import styles from "./EventsCalendar.module.css";

import React, { useEffect, useState, useContext } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "react-big-calendar/lib/addons/dragAndDrop/styles.css";
import {
  AllSessionsContext,
  SessionsToggleContext,
  SignupsToggleContext,
} from "../App";

import EventDetailsModal from "./EventDetailsModal";

import AdminEventDetailsModal from "./AdminEventDetailsModal";
const localizer = momentLocalizer(moment);

const EventsCalendar = () => {
  const [showGuestModal, setShowGuestModal] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);

  const [clickedSession, setClickedSession] = useState({});

  const { allSessions } = useContext(AllSessionsContext);
  const { sessionsToggle } = useContext(SessionsToggleContext);
  const { signupsToggle } = useContext(SignupsToggleContext);

  const [events, setEvents] = useState([]);

  const eventStyleGetter = (event) => {
    const style = {
      backgroundColor: event.color,
      background: event.color,
      borderRadius: "5px",
      opacity: 0.8,
      color: "white",
      border: "0",
      display: "block",
    };
    return {
      style,
    };
  };

  const selectEventColor = (category) => {
    if (category === "Climbing") {
      return "red";
    } else if (category === "Yoga") {
      return "magenta";
    } else if (category === "Fitness") {
      return "green";
    }
  };

  const handleDateAndTimeConversion = (date, time, hours, minutes) => {
    const splitTime = time.split(":");
    let endSplitHours = Number(splitTime[0]) + hours;
    let endSplitMinutes = Number(splitTime[1]) + minutes;
    if (endSplitMinutes >= 60) {
      endSplitHours += Math.floor(endSplitMinutes / 60);
      endSplitMinutes %= 60;
    }
    const finalTime =
      endSplitHours.toString().padStart(2, "0") +
      ":" +
      endSplitMinutes.toString().padStart(2, "0");
    const endDateAndTime = date + " " + finalTime;
    return endDateAndTime;
  };

  useEffect(() => {
    const newEvents = allSessions.map((session) => {
      const { date, time } = session;
      const { name, hours, minutes, category } = session.event;

      const startDateAndTime = moment(
        date + " " + time,
        "YYYY-MM-DD HH:mm",
      ).toDate();
      const endDateAndTime = handleDateAndTimeConversion(
        date,
        time,
        hours,
        minutes,
      );
      const endDate = moment(endDateAndTime, "YYYY-MM-DD HH:mm").toDate();
      const eventColor = selectEventColor(category);

      const dayOfWeek = moment(startDateAndTime).format("dddd");

      return {
        title: name,
        start: startDateAndTime,
        end: endDate,
        color: eventColor,
        values: {
          event_id: session.event.id,
          session_id: session.id,
          name: name,
          day: dayOfWeek,
          date: date,
          time: time,
          description: session.event.description,
          free_for_members: session.event.free_for_members,
          spaces: session.event.capacity - session.signups.length,
          signups: session.signups,
        },
      };
    });

    setEvents(newEvents);
  }, [allSessions, signupsToggle, sessionsToggle]);

  const handleClickedEvent = (event) => {
    console.log("clicked!");

    console.log(event);
    setClickedSession(event);
    setShowGuestModal(true);
  };

  return (
    <div>
      <div className={styles.calendarBackground}></div>
      <div className={styles.calendarOverlay}></div>
      {Object.keys(clickedSession).length > 0 ? (
        <EventDetailsModal
          clickedSession={clickedSession}
          setClickedSession={setClickedSession}
          showGuestModal={showGuestModal}
          setShowGuestModal={setShowGuestModal}
          showAdminModal={showAdminModal}
          setShowAdminModal={setShowAdminModal}
        />
      ) : null}
      {Object.keys(clickedSession).length > 0 ? (
        <AdminEventDetailsModal
          clickedSession={clickedSession}
          setClickedSession={setClickedSession}
          showGuestModal={showGuestModal}
          setShowGuestModal={setShowGuestModal}
          showAdminModal={showAdminModal}
          setShowAdminModal={setShowAdminModal}
        />
      ) : null}
      {/* <h1 className={styles.calendarH1}>Calendar</h1> */}
      <Calendar
        localizer={localizer}
        defaultDate={new Date()}
        defaultView="month"
        events={events}
        timeslots={1}
        className={styles.eventsCalendar}
        // style={{ height: "85vh", width:"85vw", margin:"auto" }}
        eventPropGetter={eventStyleGetter}
        selectable
        onSelectEvent={handleClickedEvent}
        min={new Date(2026, 0, 1, 8, 0)} // Calendar view starts at 8:00 AM
        max={new Date(2026, 0, 1, 20, 0)} // Calendar view ends at 8:00 PM
        step={30}
      />
    </div>
  );
};

export default EventsCalendar;
