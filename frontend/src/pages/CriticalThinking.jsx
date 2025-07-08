// src/pages/CriticalThinking.jsx
import { useEffect, useState } from 'react';
import { Typography, Button, Dialog, DialogTitle, DialogContent, DialogActions, RadioGroup, Radio, FormControlLabel, Paper, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import axios from 'axios';
import './CriticalThinking.css';
import heroImage from '../assets/placeholder3.jpg';

const staticScenarios = [
  {
    title: 'Scenario 1: "Pride and Prejudice" by Jane Austen',
    reference: 'Jane Austen, Pride and Prejudice, Chapter 2',
    paragraph: 'It is a truth universally acknowledged, that a single man in possession of a good fortune, must be in want of a wife...',
    createdAt: new Date('2001-01-01'),
    subject: 'English',
    questions: [
      {
        question: 'What is universally acknowledged in the paragraph?',
        options: [
          'A wealthy man must be looking for a wife.',
          'A wealthy man dislikes being in a neighbourhood.',
          'Every family has a daughter.',
          'Feelings and views are not important.'
        ],
        answer: 'A wealthy man must be looking for a wife.'
      },
      {
        question: 'What is the attitude of the surrounding families towards the wealthy man?',
        options: [
          'They ignore him.',
          'They consider him as a match for their daughters.',
          'They dislike him.',
          'They feel threatened by him.'
        ],
        answer: 'They consider him as a match for their daughters.'
      }
    ]
  },
  {
    title: 'Scenario 2: "Moby-Dick" by Herman Melville',
    reference: 'Herman Melville, Moby-Dick, Chapter 1',
    paragraph: 'Call me Ishmael. Some years ago—never mind how long precisely...',
    createdAt: new Date('2002-01-01'),
    subject: 'English',
    questions: [
      {
        question: 'What is the narrator\'s name in this paragraph?',
        options: ['Ahab', 'Ishmael', 'Queequeg', 'Stubb'],
        answer: 'Ishmael'
      },
      {
        question: 'Why does the narrator decide to sail?',
        options: [
          'To find treasure',
          'To escape from responsibilities',
          'To see the watery part of the world',
          'To join a fishing expedition'
        ],
        answer: 'To see the watery part of the world'
      }
    ]
  }
];

const CriticalThinking = () => {
  const [selectedScenario, setSelectedScenario] = useState(null);
  const [answers, setAnswers] = useState({});
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [scenarios, setScenarios] = useState([]);
  const [filter, setFilter] = useState('All');
  const [subject, setSubject] = useState('All');

  useEffect(() => {
    const fetchScenarios = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:5000/api/critical-thinking/scenarios', {
          headers: { Authorization: `Bearer ${token}` }
        });

        const dbScenarios = response.data.scenarios || [];

        const dbScenariosWithDate = dbScenarios.map(s => ({
          ...s,
          createdAt: s.createdAt ? new Date(s.createdAt) : new Date()
        }));

        setScenarios([...staticScenarios, ...dbScenariosWithDate]);
      } catch (error) {
        console.error('Error fetching scenarios:', error);
      }
    };

    fetchScenarios();
  }, []);

  const handleScenarioSelect = (scenario) => {
    setSelectedScenario(scenario);
    setAnswers({});
  };

  const handleAnswerChange = (questionIndex, answer) => {
    setAnswers(prev => ({ ...prev, [questionIndex]: answer }));
  };

  const handleSubmit = async () => {
    let correctAnswers = 0;
    selectedScenario.questions.forEach((q, index) => {
      if (answers[index] === q.answer) correctAnswers += 1;
    });

    setScore(correctAnswers);
    setFeedback(correctAnswers === selectedScenario.questions.length ? 'Excellent!' : 'Try again!');
    setShowResult(true);

    try {
      await axios.post('http://localhost:5000/api/critical-thinking/submit', {
        question: selectedScenario.title,
        answer: JSON.stringify(answers),
        score: correctAnswers
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
    } catch (error) {
      console.error('Error submitting exercise:', error);
    }
  };

  const handleCloseResult = () => {
    setShowResult(false);
    setSelectedScenario(null);
  };

  const filteredScenarios = scenarios.filter(s => {
    if (subject === 'All') return true;
    return s.subject === subject;
  });

  const sortedScenarios = [...filteredScenarios].sort((a, b) => {
    if (filter === 'Newest') {
      return new Date(b.createdAt) - new Date(a.createdAt);
    } else if (filter === 'Oldest') {
      return new Date(a.createdAt) - new Date(b.createdAt);
    }
    return 0;
  });

  return (
    <div className="critical-thinking">
      <div className="cthero-section">
        <div className="cthero-content">
          <h1 className="cthero-title">Critical Thinking Practice</h1>
          <p className="cthero-subtitle">Sharpen your problem-solving skills with challenging scenarios.</p>
        </div>
        <div className="cthero-image-wrapper">
          <img src={heroImage} alt="Critical Thinking Hero" className="cthero-image" />
        </div>
      </div>

      <div className="ct-card-box">
        <div className="ct-subject-box">
          <Typography variant="h6" gutterBottom style={{ color: '#d4af37', fontWeight: 'bold' }}>Select a Subject</Typography>
          <FormControl fullWidth margin="normal">
            <InputLabel>Subject</InputLabel>
            <Select value={subject} onChange={(e) => setSubject(e.target.value)} label="Subject">
              <MenuItem value="All">All</MenuItem>
              <MenuItem value="Maths">Maths</MenuItem>
              <MenuItem value="English">English</MenuItem>
              <MenuItem value="Science">Science</MenuItem>
              <MenuItem value="General">General</MenuItem>
            </Select>
          </FormControl>
        </div>

        <div className="ct-scenario-box">
          <div className="ct-scenario-header">
            <Typography variant="h6" style={{ color: '#d4af37', fontWeight: 'bold' }}>Choose a Scenario</Typography>
            <FormControl variant="outlined" size="small">
              <InputLabel>Filter</InputLabel>
              <Select value={filter} onChange={(e) => setFilter(e.target.value)} label="Filter">
                <MenuItem value="All">All</MenuItem>
                <MenuItem value="Newest">Newest</MenuItem>
                <MenuItem value="Oldest">Oldest</MenuItem>
              </Select>
            </FormControl>
          </div>

          {sortedScenarios.map((scenario, index) => (
            <Paper className="scenario-card" key={index} onClick={() => handleScenarioSelect(scenario)}>
              <Typography variant="h6" fontFamily={'Poppins'}>{scenario.title}</Typography>
            </Paper>
          ))}
        </div>
      </div>

      {selectedScenario && (
        <div className="quiz-section">
          <Typography variant="h5" fontFamily={'Poppins'} fontWeight="bold" color="#e8b028" gutterBottom>
            {selectedScenario.title}
          </Typography>
          <Typography variant="body2" fontFamily={'Poppins'} color="#777" gutterBottom>
            {selectedScenario.reference}
          </Typography>
          <Typography variant="body1" fontFamily={'Poppins'} className="scenario-paragraph">
            &ldquo;{selectedScenario.paragraph}&rdquo;
          </Typography>
          {selectedScenario.questions.map((q, index) => (
            <div key={index} className="quiz-question">
              <Typography variant="h6">{q.question}</Typography>
              <RadioGroup value={answers[index] || ''} onChange={(e) => handleAnswerChange(index, e.target.value)}>
                {q.options.map((option, i) => (
                  <FormControlLabel key={i} value={option} control={<Radio />} label={option} />
                ))}
              </RadioGroup>
            </div>
          ))}
          <Button variant="contained" color="primary" onClick={handleSubmit}>Submit Answers</Button>
        </div>
      )}

      <Dialog open={showResult} onClose={handleCloseResult}>
        <DialogTitle>Quiz Result</DialogTitle>
        <DialogContent>
          <Typography variant="h6">You scored {score} out of {selectedScenario?.questions.length}</Typography>
          <Typography>{feedback}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseResult} color="primary">Close</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default CriticalThinking;
