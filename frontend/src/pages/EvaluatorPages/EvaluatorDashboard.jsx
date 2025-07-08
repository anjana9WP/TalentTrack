import { useEffect, useState } from 'react';
import axios from 'axios';
import SubmissionReviewChart from '../../components/Charts/SubmissionReviewChart';
import FeedbackTurnaroundChart from '../../components/Charts/FeedbackTurnaroundChart';
import AverageScoresChart from '../../components/Charts/AverageScoresChart';
import './EvaluatorDashboard.css';

const EvaluatorDashboard = () => {
    const [scheduledInterviews, setScheduledInterviews] = useState([]);
    const [allInterviews, setAllInterviews] = useState([]);
    const [loading, setLoading] = useState(false);
    const [confirming, setConfirming] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [links, setLinks] = useState({});

    useEffect(() => {
        fetchScheduledInterviews();
        fetchAllInterviews();
    }, []);

    const fetchScheduledInterviews = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:5000/api/interviews/scheduled', {
                headers: { Authorization: `Bearer ${token}` },
            });
            setScheduledInterviews(response.data);
        } catch (error) {
            console.error("Error fetching scheduled interviews:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchAllInterviews = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:5000/api/interviews/all', {
                headers: { Authorization: `Bearer ${token}` },
            });
            setAllInterviews(response.data);
        } catch (error) {
            console.error("Error fetching all interviews:", error);
        }
    };

    const confirmedInterviews = allInterviews.filter(interview => interview.status === "Confirmed");

    const handleLinkChange = (interviewId, value) => {
        setLinks(prev => ({
            ...prev,
            [interviewId]: value
        }));
    };

    const handleConfirm = async (interviewId) => {
        setConfirming(true);
        try {
            const token = localStorage.getItem('token');
            const interviewLink = links[interviewId] || '';
            await axios.post(
                `http://localhost:5000/api/interviews/confirm/${interviewId}`,
                { interviewLink },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            fetchScheduledInterviews();
            fetchAllInterviews();
        } catch (error) {
            console.error("Error confirming interview:", error);
        } finally {
            setConfirming(false);
            setLinks(prev => ({
                ...prev,
                [interviewId]: ''
            }));
        }
    };

    const handleDeleteInterview = async (interviewId) => {
        setDeleting(true);
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`http://localhost:5000/api/interviews/${interviewId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            fetchScheduledInterviews();
            fetchAllInterviews();
        } catch (error) {
            console.error("Error deleting interview:", error);
        } finally {
            setDeleting(false);
        }
    };

    return (
        <div className="evaluator-dashboard">
            <div className="dashboard-content">
                <h1 className="dashboard-title">Evaluator Overview</h1>

                {/* Overview Cards */}
                <div className="overview-cards">
                    <div className="card">
                        <h2>Total Reviews</h2>
                        <p>342</p>
                    </div>
                    <div className="card">
                        <h2>Pending Feedback</h2>
                        <p>24</p>
                    </div>
                    <div className="card">
                        <h2>Average Score Given</h2>
                        <p>4.2</p>
                    </div>
                    <div className="card">
                        <h2>Critical Reviews</h2>
                        <p>58</p>
                    </div>
                </div>

                {/* Charts Section */}
                <div className="charts-section">
                    <div className="chart-card">
                        <h3>Monthly Submission Reviews</h3>
                        <SubmissionReviewChart />
                    </div>
                    <div className="chart-card">
                        <h3>Feedback Turnaround Time</h3>
                        <FeedbackTurnaroundChart />
                    </div>
                    <div className="chart-card">
                        <h3>Average Scores by Practice Area</h3>
                        <AverageScoresChart />
                    </div>
                </div>

                {/* New Interview Requests Section */}
                <div className="scheduled-interviews-section">
                    <h2>New Interview Requests</h2>
                    {loading ? (
                        <p>Loading new interview requests...</p>
                    ) : scheduledInterviews.length === 0 ? (
                        <p>No new interview requests found.</p>
                    ) : (
                        <ul>
                            {scheduledInterviews.map((interview) => (
                                <li key={interview._id} style={{ margin: '20px 0' }}>
                                    <p>
                                        <strong>User:</strong> {interview.userId?.name} ({interview.userId?.email})
                                    </p>
                                    <p>
                                        <strong>Slot:</strong> {interview.slot}
                                    </p>
                                    <p>
                                        <strong>Date:</strong> {interview.scheduledAt ? new Date(interview.scheduledAt).toLocaleDateString() : "N/A"}
                                    </p>
                                    <p>
                                        <strong>Status:</strong> {interview.status}
                                    </p>
                                    {interview.interviewLink ? (
                                        <p>
                                            <strong>Interview Link:</strong>{' '}
                                            <a href={interview.interviewLink} target="_blank" rel="noopener noreferrer">
                                                {interview.interviewLink}
                                            </a>
                                        </p>
                                    ) : (
                                        <p style={{ color: 'orange', fontWeight: 'bold' }}>
                                            Request Pending – Needs meeting link
                                        </p>
                                    )}
                                    <input
                                        type="text"
                                        placeholder="Enter meeting link"
                                        value={links[interview._id] || ''}
                                        onChange={(e) => handleLinkChange(interview._id, e.target.value)}
                                        style={{ marginRight: '10px' }}
                                    />
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '10px' }}>
                                        <button
                                            onClick={() => handleConfirm(interview._id)}
                                            disabled={confirming || !links[interview._id]}
                                        >
                                            {confirming ? 'Confirming...' : 'Confirm'}
                                        </button>
                                        <button
                                            onClick={() => handleDeleteInterview(interview._id)}
                                            disabled={deleting}
                                            style={{ backgroundColor: 'red', color: 'white', border: 'none', padding: '5px 10px' }}
                                        >
                                            {deleting ? 'Deleting...' : 'Delete'}
                                        </button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                {/* Confirmed Interviews Section */}
                <div className="confirmed-interviews-section">
                    <h2>Confirmed Interviews</h2>
                    {confirmedInterviews.length === 0 ? (
                        <p>No confirmed interviews found.</p>
                    ) : (
                        <ul>
                            {confirmedInterviews.map((interview) => (
                                <li key={interview._id} style={{ margin: '20px 0', borderBottom: '1px solid #ccc', paddingBottom: '10px' }}>
                                    <p>
                                        <strong>User:</strong> {interview.userId?.name} ({interview.userId?.email})
                                    </p>
                                    <p>
                                        <strong>Slot:</strong> {interview.slot}
                                    </p>
                                    <p>
                                        <strong>Date:</strong> {interview.scheduledAt ? new Date(interview.scheduledAt).toLocaleDateString() : "N/A"}
                                    </p>
                                    <p>
                                        <strong>Status:</strong> {interview.status}
                                    </p>
                                    {interview.interviewLink && (
                                        <p>
                                            <strong>Interview Link:</strong>{' '}
                                            <a href={interview.interviewLink} target="_blank" rel="noopener noreferrer">
                                                {interview.interviewLink}
                                            </a>
                                        </p>
                                    )}
                                    <button
                                        onClick={() => handleDeleteInterview(interview._id)}
                                        disabled={deleting}
                                        style={{ backgroundColor: 'red', color: 'white', border: 'none', padding: '5px 10px' }}
                                    >
                                        {deleting ? 'Deleting...' : 'Delete'}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
};

export default EvaluatorDashboard;
