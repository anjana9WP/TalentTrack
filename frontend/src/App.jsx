// src/App.jsx
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Home from './pages/Home';
import Navbar from './components/Navbar';
import PublicSpeaking from './pages/PublicSpeaking';
import InterviewPractice from './pages/InterviewPractice';
import WrittenCommunication from './pages/WrittenCommunication';
import CriticalThinking from './pages/CriticalThinking';
import EventCalendar from './pages/EventCalendar';
import Feedback from './pages/Feedback';
import UserProfile from './pages/UserProfile.jsx';

// Import admin pages from the AdminPages folder
import AdminDashboard from './pages/AdminPages/AdminDashboard';
import UserManagement from './pages/AdminPages/UserManagement';
import EvaluatorManagement from './pages/AdminPages/EvaluatorManagement';
import EventManagement from './pages/AdminPages/EventManagement';
import QuizManagement from './pages/AdminPages/QuizManagement';
import DashboardSelection from './pages/DashboardSelection';
import AdminLayout from './components/AdminLayout';

// Import evaluator pages from the EvaluatorPages folder
import EvaluatorDashboard from './pages/EvaluatorPages/EvaluatorDashboard';
import PublicSpeakingReviews from './pages/EvaluatorPages/PublicSpeakingReviews.jsx';
import InterviewPracticeReviews from './pages/EvaluatorPages/InterviewPracticeReviews';
import WrittenCommunicationReviews from './pages/EvaluatorPages/WrittenCommunicationReviews';
import CriticalThinkingReviews from './pages/EvaluatorPages/CriticalThinkingReviews';
import FeedbackLogs from './pages/EvaluatorPages/FeedbackLogs';
import EvaluatorLayout from './components/EvaluatorLayout';

function App() {
  return (
    <Router>
      <ConditionalNavbar />
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/home" element={<Home />} />
        <Route path="/public-speaking" element={<PublicSpeaking />} />
        <Route path="/interview-practice" element={<InterviewPractice />} />
        <Route path="/written-communication" element={<WrittenCommunication />} />
        <Route path="/critical-thinking" element={<CriticalThinking />} />
        <Route path="/event-calendar" element={<EventCalendar />} />
        <Route path="/feedback" element={<Feedback />} />
        <Route path="/user-profile" element={<UserProfile />} />
        <Route path="/dashboard" element={<DashboardSelection />} />

        {/* Admin routes wrapped with AdminLayout */}
        <Route path="/admin-dashboard" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="users" element={<UserManagement />} />
          <Route path="evaluators" element={<EvaluatorManagement />} />
          <Route path="events" element={<EventManagement />} />
          <Route path="quiz-management" element={<QuizManagement />} />
        </Route>

        {/* Evaluator routes wrapped with EvaluatorLayout */}
        <Route path="/evaluator-dashboard" element={<EvaluatorLayout />}>
          <Route index element={<EvaluatorDashboard />} />
          <Route path="public-speaking-reviews" element={<PublicSpeakingReviews />} />
          <Route path="interview-practice-reviews" element={<InterviewPracticeReviews />} />
          <Route path="written-communication-reviews" element={<WrittenCommunicationReviews />} />
          <Route path="critical-thinking-reviews" element={<CriticalThinkingReviews />} />
          <Route path="feedback-logs" element={<FeedbackLogs />} />
        </Route>
      </Routes>
    </Router>
  );
}

function ConditionalNavbar() {
  const location = useLocation();
  if (location.pathname === '/login' || location.pathname === '/signup' || location.pathname === '/') {
    return null;
  }
  return <Navbar />;
}

export default App;
