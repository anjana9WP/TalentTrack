// components/eventCalendar.jsx
import { useState, useEffect } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import {
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Card,
    CardContent,
    Snackbar,
    Alert,
    Backdrop,
    Typography
} from '@mui/material';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import './EventCalendar.css';
import { format, parse, startOfWeek, getDay, differenceInDays } from 'date-fns';
import enUS from 'date-fns/locale/en-US';
import axios from 'axios';
import Lottie from 'lottie-react'; // Import Lottie for animations
import heroImage from '../assets/placeholder1.jpg'; // Replace with your hero image
import loadingAnimation from '../animations/H1fScGdVvy.json'; // Your Lottie JSON animation

const locales = { 'en-US': enUS };
const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek: () => startOfWeek(new Date()),
    getDay,
    locales,
});

const API_BASE_URL = "http://localhost:5000/api/events";

// Retrieve the authentication token
const getAuthConfig = () => {
    const token = localStorage.getItem("token");
    return { headers: { Authorization: `Bearer ${token}` } };
};

const EventCalendar = () => {
    const [events, setEvents] = useState([]);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [registeredEvents, setRegisteredEvents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState("");
    const [snackbarSeverity, setSnackbarSeverity] = useState("success");

    // Fetch all events from backend
    const fetchEvents = async () => {
        try {
            const response = await axios.get(API_BASE_URL, getAuthConfig());
            const fetchedEvents = response.data.map(event => ({
                ...event,
                start: new Date(event.start),
                end: new Date(event.end),
            }));
            setEvents(fetchedEvents);
        } catch (error) {
            console.error("AxiosError - Error fetching events:", error);
        }
    };

    // Fetch events that the current user has registered for
    const fetchRegisteredEvents = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/my-registrations`, getAuthConfig());
            const fetchedEvents = response.data.map(event => ({
                ...event,
                start: new Date(event.start),
                end: new Date(event.end),
            }));
            setRegisteredEvents(fetchedEvents);
        } catch (error) {
            console.error("AxiosError - Error fetching registered events:", error);
        }
    };

    useEffect(() => {
        fetchEvents();
        fetchRegisteredEvents();
    }, []);

    const handleEventSelect = (event) => {
        setSelectedEvent(event);
    };

    const isRegistered = selectedEvent
        ? registeredEvents.some(event => event._id === selectedEvent._id)
        : false;

    const isEventFull = selectedEvent
        ? selectedEvent.participants?.length >= selectedEvent.maxParticipants
        : false;

    const handleRegister = async () => {
        if (selectedEvent && !isEventFull && !loading) {
            try {
                setLoading(true);
                await axios.post(`${API_BASE_URL}/register/${selectedEvent._id}`, {}, getAuthConfig());
                await fetchRegisteredEvents();
                await fetchEvents();
                setSelectedEvent(null); // Close dialog after registration
                setSnackbarMessage("✅ Successfully registered for the event!");
                setSnackbarSeverity("success");
            } catch (error) {
                console.error("AxiosError - Error registering for event:", error);
                setSnackbarMessage("❌ Error registering for event.");
                setSnackbarSeverity("error");
            } finally {
                setSnackbarOpen(true);
                setLoading(false);
            }
        }
    };

    const handleUnregister = async () => {
        if (selectedEvent && !loading) {
            try {
                setLoading(true);
                await axios.delete(`${API_BASE_URL}/register/${selectedEvent._id}`, getAuthConfig());
                await fetchRegisteredEvents();
                await fetchEvents();
                setSelectedEvent(null); // Close dialog after unregistration
                setSnackbarMessage("✅ Successfully unregistered from the event!");
                setSnackbarSeverity("success");
            } catch (error) {
                console.error("AxiosError - Error unregistering for event:", error);
                setSnackbarMessage("❌ Error unregistering for event.");
                setSnackbarSeverity("error");
            } finally {
                setSnackbarOpen(true);
                setLoading(false);
            }
        }
    };

    const handleClose = () => {
        setSelectedEvent(null);
    };

    const handleSnackbarClose = () => {
        setSnackbarOpen(false);
    };

    const calculateDaysLeft = (eventDate) => {
        const currentDate = new Date();
        return differenceInDays(eventDate, currentDate);
    };

    return (
        <div className="event-calendar">
            {/* Full-screen Backdrop with Lottie Loading Animation */}
            <Backdrop sx={{ color: '#fff', zIndex: 9999 }} open={loading}>
                <Lottie
                    animationData={loadingAnimation}
                    style={{ width: 200, height: 200 }}
                    loop
                    autoplay
                />
                <Typography variant="h6" sx={{ mt: 2 }}>Processing your registration...</Typography>
            </Backdrop>

            {/* Hero Section */}
            <div className="hero-section">
                <div className="hero-content">
                    <h1 className="hero-title">Event Calendar</h1>
                    <p className="hero-subtitle">Stay up-to-date with our latest workshops and webinars.</p>
                </div>
                <div className="hero-image-wrapper">
                    <img src={heroImage} alt="Events Hero" className="hero-image" />
                </div>
            </div>

            {/* Calendar Container */}
            <div className="calendar-container">
                <Calendar
                    localizer={localizer}
                    events={events}
                    startAccessor="start"
                    endAccessor="end"
                    style={{ height: 600, margin: '20px', borderRadius: '12px' }}
                    onSelectEvent={handleEventSelect}
                    className="custom-calendar"
                    eventPropGetter={(event) => {
                        const fullEvent = event.participants && (event.participants.length >= event.maxParticipants);
                        return {
                            style: {
                                backgroundColor: event.eventType === "Online" ? "#1e88e5" : "#43a047",
                                color: "#fff",
                                border: fullEvent ? "2px solid red" : undefined,
                            },
                        };
                    }}
                />
            </div>

            {/* Registered Events Section */}
            <div className="registered-events">
                <h2 className="registered-title">Registered Events</h2>
                {registeredEvents.length > 0 ? (
                    <div className="registered-list">
                        {registeredEvents
                            .sort((a, b) => new Date(a.start) - new Date(b.start)) // Sort by earliest event date
                            .map((event, index) => (
                                <Card
                                    key={index}
                                    className="event-card"
                                    style={{ border: event.participants?.length >= event.maxParticipants ? "2px solid red" : "none" }}
                                >
                                    <CardContent>
                                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                            <h3 className="event-title">{event.title}</h3>
                                            {event.participants?.length >= event.maxParticipants && (
                                                <span className="full-tag" style={{
                                                    background: "red",
                                                    color: "white",
                                                    padding: "5px 10px",
                                                    borderRadius: "8px",
                                                    fontSize: "0.8rem"
                                                }}>
                                                    FULL
                                                </span>
                                            )}
                                        </div>
                                        <p className="event-date">📅 Date: {format(event.start, 'MMMM d, yyyy')}</p>
                                        <p className="days-left">
                                            {calculateDaysLeft(event.start) > 0
                                                ? `${calculateDaysLeft(event.start)} days left`
                                                : 'Today'}
                                        </p>
                                        <p className="event-type">
                                            {event.eventType === "Online" && event.eventLink ? (
                                                <>🌍 Online Event - <a href={event.eventLink} target="_blank" rel="noopener noreferrer">Join Here</a></>
                                            ) : (
                                                <>📍 Location: {event.location}</>
                                            )}
                                        </p>
                                        <p className="participants">
                                            👥 Registered: {event.participants?.length || 0}/{event.maxParticipants}
                                        </p>
                                    </CardContent>
                                </Card>
                            ))
                        }
                    </div>
                ) : (
                    <p className="no-events">You have not registered for any events yet.</p>
                )}
            </div>

            {/* Event Details Dialog */}
            {selectedEvent && (
                <Dialog open={Boolean(selectedEvent)} onClose={handleClose}>
                    <DialogTitle>{selectedEvent.title}</DialogTitle>
                    <DialogContent>
                        <p>{selectedEvent.description}</p>
                        <p>Start: {format(selectedEvent.start, 'MMMM d, yyyy h:mm a')}</p>
                        <p>End: {format(selectedEvent.end, 'MMMM d, yyyy h:mm a')}</p>
                        <p>Event Type: {selectedEvent.eventType}</p>
                        {selectedEvent.eventType === "Online" && (
                            <p>
                                Event Link: <a href={selectedEvent.eventLink} target="_blank" rel="noopener noreferrer">{selectedEvent.eventLink}</a>
                            </p>
                        )}
                        {selectedEvent.eventType === "Offline" && (
                            <p>Location: {selectedEvent.location}</p>
                        )}
                        <p>Max Participants: {selectedEvent.maxParticipants}</p>
                        <p>Registered: {selectedEvent.participants?.length || 0}/{selectedEvent.maxParticipants}</p>
                    </DialogContent>
                    <DialogActions>
                        {isRegistered ? (
                            <Button
                                onClick={handleUnregister}
                                variant="contained"
                                color="primary"
                                disabled={loading}
                            >
                                {loading ? 'Processing...' : 'Unregister'}
                            </Button>
                        ) : isEventFull ? (
                            <Button variant="contained" disabled>
                                Event Full
                            </Button>
                        ) : (
                            <Button
                                onClick={handleRegister}
                                variant="contained"
                                color="primary"
                                disabled={loading}
                            >
                                {loading ? 'Processing...' : 'Register'}
                            </Button>
                        )}
                        <Button onClick={handleClose} variant="outlined" disabled={loading}>
                            Close
                        </Button>
                    </DialogActions>
                </Dialog>
            )}

            {/* Snackbar for notifications */}
            <Snackbar
                open={snackbarOpen}
                autoHideDuration={4000}
                onClose={handleSnackbarClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: '100%' }}>
                    {snackbarMessage}
                </Alert>
            </Snackbar>
        </div>
    );
};

export default EventCalendar;