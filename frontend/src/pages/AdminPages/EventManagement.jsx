import { useState, useEffect } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import enUS from 'date-fns/locale/en-US';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import './EventManagement.css';
import { Button, Modal, Box, TextField } from '@mui/material';
import Datetime from 'react-datetime';
import 'react-datetime/css/react-datetime.css';
import axios from 'axios';

const locales = { 'en-US': enUS };
const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek,
    getDay,
    locales,
});

// Backend API Base URL
const API_BASE_URL = "http://localhost:5000/api/events";

// Function to retrieve the authentication token
const getAuthConfig = () => {
    const token = localStorage.getItem("token");
    return { headers: { Authorization: `Bearer ${token}` } };
};

const EventManagement = () => {
    const [events, setEvents] = useState([]);
    const [newEvent, setNewEvent] = useState({
        title: '',
        start: '',
        end: '',
        eventType: 'Online', // Default event type
        eventLink: '',
        location: '',
        maxParticipants: 50,
    });
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [participants, setParticipants] = useState([]);
    const [isParticipantsModalOpen, setIsParticipantsModalOpen] = useState(false);

    // Fetch events from backend on component mount
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

    useEffect(() => {
        fetchEvents();
    }, []);

    const handleSelectSlot = (slotInfo) => {
        setNewEvent({
            title: '',
            start: slotInfo.start,
            end: slotInfo.start,
            eventType: 'Online',
            eventLink: '',
            location: '',
            maxParticipants: 50,
        });
        setIsModalOpen(true);
        setIsEditing(false);
        setSelectedEvent(null);
    };

    const handleAddEvent = async () => {
        if (!newEvent.title || !newEvent.start || !newEvent.end) return;

        // Validate required fields based on event type
        if (
            (newEvent.eventType === "Online" && !newEvent.eventLink) ||
            (newEvent.eventType === "Offline" && !newEvent.location)
        ) {
            alert("Please provide the required event details for the selected event type.");
            return;
        }

        try {
            const payload = {
                title: newEvent.title,
                description: '',
                start: newEvent.start,
                end: newEvent.end,
                eventType: newEvent.eventType,
                eventLink: newEvent.eventType === "Online" ? newEvent.eventLink : null,
                location: newEvent.eventType === "Offline" ? newEvent.location : null,
                maxParticipants: newEvent.maxParticipants,
            };

            const response = await axios.post(`${API_BASE_URL}/create`, payload, getAuthConfig());
            const createdEvent = response.data.event;
            createdEvent.start = new Date(createdEvent.start);
            createdEvent.end = new Date(createdEvent.end);
            setEvents([...events, createdEvent]);
            localStorage.setItem(
                "newEventNotification",
                JSON.stringify({ eventId: createdEvent._id, title: createdEvent.title })
            );
            setIsModalOpen(false);
            setNewEvent({
                title: '',
                start: '',
                end: '',
                eventType: 'Online',
                eventLink: '',
                location: '',
                maxParticipants: 50,
            });
        } catch (error) {
            console.error("AxiosError - Error adding event:", error);
        }
    };

    const handleEventSelect = (event) => {
        setSelectedEvent(event);
        setNewEvent({
            title: event.title,
            start: event.start,
            end: event.end,
            eventType: event.eventType,
            eventLink: event.eventLink || '',
            location: event.location || '',
            maxParticipants: event.maxParticipants,
        });
        setIsModalOpen(true);
        setIsEditing(true);
    };

    const handleEventEdit = async () => {
        if (selectedEvent && newEvent.title && newEvent.start && newEvent.end) {
            try {
                const payload = {
                    title: newEvent.title,
                    description: '',
                    start: newEvent.start,
                    end: newEvent.end,
                    eventType: newEvent.eventType,
                    eventLink: newEvent.eventType === "Online" ? newEvent.eventLink : null,
                    location: newEvent.eventType === "Offline" ? newEvent.location : null,
                    maxParticipants: newEvent.maxParticipants,
                };

                const response = await axios.put(`${API_BASE_URL}/${selectedEvent._id}`, payload, getAuthConfig());
                const updatedEvent = response.data.event;
                updatedEvent.start = new Date(updatedEvent.start);
                updatedEvent.end = new Date(updatedEvent.end);
                setEvents(events.map(event => event._id === selectedEvent._id ? updatedEvent : event));
                setIsModalOpen(false);
                setSelectedEvent(null);
                setNewEvent({
                    title: '',
                    start: '',
                    end: '',
                    eventType: 'Online',
                    eventLink: '',
                    location: '',
                    maxParticipants: 50,
                });
            } catch (error) {
                console.error("AxiosError - Error editing event:", error);
            }
        }
    };

    const handleEventDelete = async () => {
        if (selectedEvent) {
            try {
                await axios.delete(`${API_BASE_URL}/${selectedEvent._id}`, getAuthConfig());
                setEvents(events.filter(event => event._id !== selectedEvent._id));
                setIsModalOpen(false);
                setSelectedEvent(null);
                setNewEvent({
                    title: '',
                    start: '',
                    end: '',
                    eventType: 'Online',
                    eventLink: '',
                    location: '',
                    maxParticipants: 50,
                });
            } catch (error) {
                console.error("AxiosError - Error deleting event:", error);
            }
        }
    };

    const handleViewParticipants = async () => {
        if (selectedEvent) {
            try {
                const response = await axios.get(`${API_BASE_URL}/${selectedEvent._id}/registrations`, getAuthConfig());
                setParticipants(response.data.participants);
                setIsParticipantsModalOpen(true);
            } catch (error) {
                console.error("AxiosError - Error fetching participants:", error);
            }
        }
    };

    return (
        <div className="event-management">
            <h1 className="page-title">Event Management</h1>
            <div className="event-content">
                <div className="calendar-card">
                    <Calendar
                        localizer={localizer}
                        events={events}
                        startAccessor="start"
                        endAccessor="end"
                        style={{ height: 500 }}
                        selectable
                        onSelectSlot={handleSelectSlot}
                        onSelectEvent={handleEventSelect}
                        eventPropGetter={(event) => {
                            const isFull = event.participants && (event.participants.length >= event.maxParticipants);
                            return {
                                style: {
                                    backgroundColor: event.eventType === "Online" ? "#1e88e5" : "#43a047",
                                    color: "#fff",
                                    border: isFull ? "2px solid red" : undefined,
                                },
                            };
                        }}
                    />
                </div>
            </div>

            <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)}>
                <Box className="modal-box">
                    <h2>{isEditing ? 'Edit Event' : 'Add Event'}</h2>
                    <TextField
                        label="Event Title"
                        value={newEvent.title}
                        onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                        fullWidth
                        margin="normal"
                    />
                    <div className="date-time-pickers">
                        <label>Start Date & Time</label>
                        <Datetime
                            value={newEvent.start}
                            onChange={(date) => setNewEvent({ ...newEvent, start: date })}
                            inputProps={{ placeholder: 'Select start date and time' }}
                        />
                        <label>End Date & Time</label>
                        <Datetime
                            value={newEvent.end}
                            onChange={(date) => setNewEvent({ ...newEvent, end: date })}
                            inputProps={{ placeholder: 'Select end date and time' }}
                        />
                    </div>
                    <TextField
                        label="Event Type (Online/Offline)"
                        value={newEvent.eventType}
                        onChange={(e) => setNewEvent({ ...newEvent, eventType: e.target.value })}
                        fullWidth
                        margin="normal"
                        select
                        SelectProps={{ native: true }}
                    >
                        <option value="Online">Online</option>
                        <option value="Offline">Offline</option>
                    </TextField>
                    {newEvent.eventType === "Online" && (
                        <TextField
                            label="Event Link"
                            value={newEvent.eventLink}
                            onChange={(e) => setNewEvent({ ...newEvent, eventLink: e.target.value })}
                            fullWidth
                            margin="normal"
                        />
                    )}
                    {newEvent.eventType === "Offline" && (
                        <TextField
                            label="Location"
                            value={newEvent.location}
                            onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                            fullWidth
                            margin="normal"
                        />
                    )}
                    <TextField
                        label="Max Participants"
                        type="number"
                        value={newEvent.maxParticipants}
                        onChange={(e) => setNewEvent({ ...newEvent, maxParticipants: parseInt(e.target.value, 10) })}
                        fullWidth
                        margin="normal"
                    />
                    {/* Display participant count if editing an existing event */}
                    {isEditing && selectedEvent && (
                        <p style={{ marginTop: '10px', fontWeight: 'bold' }}>
                            Registered: {selectedEvent.participants?.length || 0} / {newEvent.maxParticipants}
                            {selectedEvent.participants && (selectedEvent.participants.length >= newEvent.maxParticipants) && " (Full)"}
                        </p>
                    )}
                    <div className="modal-buttons">
                        {isEditing ? (
                            <>
                                <Button
                                    variant="contained"
                                    sx={{ backgroundColor: '#e8b028', color: '#fff' }}
                                    onClick={handleEventEdit}
                                >
                                    Save Changes
                                </Button>
                                <Button
                                    variant="contained"
                                    sx={{ backgroundColor: '#c58123', color: '#fff' }}
                                    onClick={handleEventDelete}
                                >
                                    Delete Event
                                </Button>
                                <Button
                                    variant="outlined"
                                    sx={{ color: '#e8b028', borderColor: '#e8b028' }}
                                    onClick={handleViewParticipants}
                                >
                                    View Participants
                                </Button>
                            </>
                        ) : (
                            <Button
                                variant="contained"
                                sx={{ backgroundColor: '#e8b028', color: '#fff' }}
                                onClick={handleAddEvent}
                            >
                                Add Event
                            </Button>
                        )}
                        <Button
                            variant="outlined"
                            sx={{ color: '#e8b028', borderColor: '#e8b028' }}
                            onClick={() => setIsModalOpen(false)}
                        >
                            Cancel
                        </Button>
                    </div>
                </Box>
            </Modal>

            <Modal open={isParticipantsModalOpen} onClose={() => setIsParticipantsModalOpen(false)}>
                <Box className="modal-box">
                    <h2>Registered Participants</h2>
                    {participants.length > 0 ? (
                        <ul>
                            {participants.map((participant) => (
                                <li key={participant._id}>
                                    {participant.name} ({participant.email})
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p>No participants registered for this event.</p>
                    )}
                    <Button
                        variant="outlined"
                        sx={{ marginTop: '10px', color: '#e8b028', borderColor: '#e8b028' }}
                        onClick={() => setIsParticipantsModalOpen(false)}
                    >
                        Close
                    </Button>
                </Box>
            </Modal>
        </div>
    );
};

export default EventManagement;
