// src/pages/Home.jsx
import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './Home.css';
import studentImage from '../assets/student-hero.png';
import placeholderImage1 from '../assets/placeholder1.jpg';
import placeholderImage2 from '../assets/placeholder2.jpg';
import placeholderImage3 from '../assets/placeholder3.jpg';
import placeholderImage4 from '../assets/placeholder4.jpg';
import logo from '../assets/CTTLine.png';
import ProgressBar from '../components/ProgressBar';

const Home = () => {
    const [newEventNotification, setNewEventNotification] = useState(null);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const storedNotification = localStorage.getItem("newEventNotification");
        if (storedNotification) {
            setNewEventNotification(JSON.parse(storedNotification));
        }

        const handleScroll = () => {
            const scrollTop = window.scrollY;
            const image = document.querySelector('.hero-image');
            if (image) {
                image.style.transform = `translateY(${scrollTop * 0.2}px)`;
            }
        };

        window.addEventListener('scroll', handleScroll);

        const observerOptions = {
            threshold: 0.1,
        };

        const observerCallback = (entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('show');
                    observer.unobserve(entry.target);
                }
            });
        };

        const observer = new IntersectionObserver(observerCallback, observerOptions);
        const fadeInElements = document.querySelectorAll('.fade-in-element');
        fadeInElements.forEach(element => observer.observe(element));

        // 🔁 BACK BUTTON HANDLING
        window.history.pushState(null, null, window.location.pathname);
        const handleBack = (e) => {
            if (location.pathname === '/home') {
                e.preventDefault();
                const confirmBack = window.confirm("Are you sure you want to go back to the login page?");
                if (confirmBack) {
                    navigate('/login');
                } else {
                    window.history.pushState(null, null, window.location.pathname);
                }
            }
        };
        window.addEventListener('popstate', handleBack);

        return () => {
            window.removeEventListener('scroll', handleScroll);
            fadeInElements.forEach(element => observer.unobserve(element));
            window.removeEventListener('popstate', handleBack);
        };
    }, [location.pathname, navigate]);

    const handleNotificationClick = () => {
        navigate('/event-calendar');
        localStorage.removeItem("newEventNotification");
        setNewEventNotification(null);
    };

    return (
        <div className="home">
            {newEventNotification && (
                <div className="notification-banner" onClick={handleNotificationClick}>
                    {`New event "${newEventNotification.title}" is now available! Click here to view.`}
                </div>
            )}

            <div className="hero-section">
                <div className="hero-content">
                    <h1>Excel in <span className="title-space">Communication</span></h1>
                    <p>Enhance your skills with our world-class resources.</p>
                    <div className="hero-buttons">
                        <button className="get-started">Get Started</button>
                        <button className="learn-more">Learn More</button>
                    </div>
                </div>
                <div className="hero-image-wrapper">
                    <div className="hero-image-shape"></div>
                    <img src={studentImage} alt="Student Hero" className="hero-image" />
                </div>
            </div>

            <div className="info-section">
                <div className="info-content">
                    <h2>Empowering Your Journey to Success</h2>
                    <p>At CurtinTalentTrack, we’re dedicated to empowering students with the latest insights and practice tools to enhance their communication skills.</p>
                    <div className="stats">
                        <div className="stat">
                            <ProgressBar percentage={90} />
                            <p>Course Completion Rate</p>
                        </div>
                        <div className="separator"></div>
                        <div className="stat">
                            <ProgressBar percentage={95} />
                            <p>Student Satisfaction</p>
                        </div>
                        <div className="separator"></div>
                        <div className="stat">
                            <ProgressBar percentage={85} />
                            <p>Engagement</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="additional-sections">
                <div className="section">
                    <img src={placeholderImage1} alt="Public Speaking" className="section-image" />
                    <div className="section-text fade-in-element">
                        <h3>Master Public Speaking</h3>
                        <p>Boost confidence and effectively engage your audience. Learn essential techniques and practice real-world scenarios to excel in public speaking.</p>
                    </div>
                </div>
                <hr className="section-separator" />
                <div className="section reverse">
                    <div className="section-text fade-in-element">
                        <h3>Ace Your Interviews</h3>
                        <p>Prepare for job interviews with our interactive exercises. Get familiar with common questions and how to present yourself professionally.</p>
                    </div>
                    <img src={placeholderImage2} alt="Interview Practice" className="section-image" />
                </div>
                <hr className="section-separator" />
                <div className="section">
                    <img src={placeholderImage3} alt="Written Communication" className="section-image" />
                    <div className="section-text fade-in-element">
                        <h3>Enhance Written Communication</h3>
                        <p>Improve your writing skills for academic and professional settings. Practice drafting, editing, and refining your communication.</p>
                    </div>
                </div>
                <hr className="section-separator" />
                <div className="section reverse">
                    <div className="section-text fade-in-element">
                        <h3>Sharpen Critical Thinking</h3>
                        <p>Develop critical thinking skills to tackle complex problems and make informed decisions. Engage with challenging exercises and case studies.</p>
                    </div>
                    <img src={placeholderImage4} alt="Critical Thinking" className="section-image" />
                </div>
            </div>

            <footer className="footer">
                <div className="footer-logo">
                    <img src={logo} alt="CurtinTalentTrack Logo" />
                </div>
                <ul className="footer-links">
                    <li><a href="/home">Home</a></li>
                    <li><a href="/public-speaking">Speaking</a></li>
                    <li><a href="/interviews">Interviews</a></li>
                    <li><a href="/writing">Writing</a></li>
                    <li><a href="/thinking">Thinking</a></li>
                    <li><a href="/events">Events</a></li>
                    <li><a href="/dashboard">Dashboard</a></li>
                </ul>
            </footer>
        </div>
    );
};

export default Home;
