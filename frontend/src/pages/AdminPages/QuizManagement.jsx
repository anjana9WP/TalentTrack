import { useState, useEffect } from 'react';
import './QuizManagement.css';
import {
  TextField,
  Button,
  Typography,
  IconButton,
  Paper,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';

const SUBJECTS = ['Maths', 'English', 'Science', 'General'];

const QuizManagement = () => {
  const [title, setTitle] = useState('');
  const [reference, setReference] = useState('');
  const [paragraph, setParagraph] = useState('');
  const [subject, setSubject] = useState('Maths');
  const [questions, setQuestions] = useState([{ question: '', options: ['', '', '', ''], answer: '' }]);
  const [activeScenarios, setActiveScenarios] = useState([]);
  const [editScenario, setEditScenario] = useState(null);
  const [viewScenario, setViewScenario] = useState(null);

  const handleQuestionChange = (index, field, value) => {
    const updated = [...questions];
    if (field === 'question') updated[index].question = value;
    else if (field === 'answer') updated[index].answer = value;
    else {
      const newOptions = [...updated[index].options];
      newOptions[field] = value;
      updated[index].options = newOptions;
    }
    setQuestions(updated);
  };

  const handleAddQuestion = () => {
    setQuestions([...questions, { question: '', options: ['', '', '', ''], answer: '' }]);
  };

  const handleRemoveQuestion = (index) => {
    const updated = questions.filter((_, i) => i !== index);
    setQuestions(updated);
  };

  const handleSubmit = async () => {
    const scenario = { title, reference, paragraph, subject, questions };
    try {
      const token = localStorage.getItem('token');
      await fetch('http://localhost:5000/api/critical-thinking/scenarios', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(scenario),
      });
      alert('Scenario submitted successfully');
      setTitle(''); setReference(''); setParagraph('');
      setSubject('Maths');
      setQuestions([{ question: '', options: ['', '', '', ''], answer: '' }]);
      fetchScenarios();
    } catch (error) {
      console.error('Error submitting scenario:', error);
      alert('Failed to submit scenario');
    }
  };

  const handleUpdate = async () => {
    const updated = {
      title: editScenario.title,
      reference: editScenario.reference,
      paragraph: editScenario.paragraph,
      subject: editScenario.subject,
      questions: editScenario.questions
    };
    try {
      const token = localStorage.getItem('token');
      await fetch(`http://localhost:5000/api/critical-thinking/scenarios/${editScenario._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updated),
      });
      alert('Scenario updated successfully');
      setEditScenario(null);
      fetchScenarios();
    } catch (error) {
      console.error('Error updating scenario:', error);
      alert('Failed to update scenario');
    }
  };

  const fetchScenarios = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/critical-thinking/scenarios', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setActiveScenarios(data.scenarios.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
    } catch (err) {
      console.error('Error fetching scenarios:', err);
    }
  };

  const handleDeleteScenario = async (id) => {
    if (!window.confirm('Are you sure you want to delete this quiz?')) return;
    try {
      const token = localStorage.getItem('token');
      await fetch(`http://localhost:5000/api/critical-thinking/scenarios/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchScenarios();
    } catch (error) {
      console.error('Error deleting scenario:', error);
      alert('Failed to delete scenario');
    }
  };

  const handleAIGenerate = async () => {
   if (!paragraph.trim()) {
    alert("Please enter a paragraph first.");
    return;
   }

   try {
    const token = localStorage.getItem("token");
    const res = await fetch("http://localhost:5000/api/ai/generate-quiz", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ paragraph }),
    });

    // Check if response is OK
    if (!res.ok) {
      const errorText = await res.text();
      console.error(" AI response not OK:", errorText);
      alert("AI quiz generation failed: Server returned error.");
      return;
    }

    const data = await res.json();

    if (!data.questions || !Array.isArray(data.questions) || data.questions.length === 0) {
      console.error(" AI returned invalid or empty questions:", data);
      alert("AI - Open Router busy at the moment, try manual");
      return;
    }

    setQuestions(data.questions);
   } catch (error) {
    console.error("AI quiz generation failed:", error);
    alert("AI - Open Router busy at the moment, try manual");
   }
  };


  useEffect(() => {
    fetchScenarios();
  }, []);

  return (
    <div className="quiz-management">
      <Typography variant="h4" className="qm-title">Quiz Management</Typography>

      <TextField label="Scenario Title" fullWidth margin="normal" value={title} onChange={(e) => setTitle(e.target.value)} />
      <TextField label="Reference" fullWidth margin="normal" value={reference} onChange={(e) => setReference(e.target.value)} />
      <TextField label="Scenario Paragraph" fullWidth margin="normal" multiline minRows={4} value={paragraph} onChange={(e) => setParagraph(e.target.value)} />

      <FormControl fullWidth margin="normal" variant="outlined">
        <InputLabel id="subject-label">Subject</InputLabel>
        <Select labelId="subject-label" id="subject" value={subject} label="Subject" onChange={(e) => setSubject(e.target.value)}>
          {SUBJECTS.map((subj) => <MenuItem key={subj} value={subj}>{subj}</MenuItem>)}
        </Select>
      </FormControl>

      {questions.map((q, index) => (
        <Paper key={index} elevation={2} className="question-block">
          <TextField label={`Question ${index + 1}`} fullWidth margin="normal" value={q.question} onChange={(e) => handleQuestionChange(index, 'question', e.target.value)} />
          {q.options.map((opt, i) => (
            <TextField key={i} label={`Option ${i + 1}`} fullWidth margin="normal" value={opt} onChange={(e) => handleQuestionChange(index, i, e.target.value)} />
          ))}
          <FormControl fullWidth margin="normal" variant="outlined">
            <InputLabel shrink>Correct Answer</InputLabel>
            <Select value={q.options.indexOf(q.answer)} label="Correct Answer" onChange={(e) => {
              const selectedOptionText = q.options[e.target.value];
              handleQuestionChange(index, 'answer', selectedOptionText);
            }}>
              {q.options.map((opt, i) => <MenuItem key={i} value={i}>Option {i + 1}</MenuItem>)}
            </Select>
          </FormControl>
          <IconButton onClick={() => handleRemoveQuestion(index)} className="delete-btn"><DeleteIcon /></IconButton>
        </Paper>
      ))}

      <div className="qm-actions">
        <Button onClick={handleAddQuestion} variant="outlined" className="add-btn">Add Question</Button>
        <Button onClick={handleAIGenerate} variant="outlined" className="ai-btn">Generate with AI</Button>
        <Button onClick={handleSubmit} variant="contained" className="submit-btn">Submit Scenario</Button>
      </div>

      <Typography variant="h5" className="qm-active-title">Currently Active Quizzes</Typography>
      {activeScenarios.map((scenario) => (
        <Paper key={scenario._id} className="scenario-preview" elevation={1}>
          <div>
            <Typography variant="subtitle1" fontWeight="bold">{scenario.title}</Typography>
            <Typography variant="body2" color="textSecondary">{scenario.reference}</Typography>
            <Typography variant="body2" className="paragraph-preview">{scenario.paragraph.slice(0, 120)}...</Typography>
            <Typography variant="caption">Questions: {scenario.questions.length}</Typography>
          </div>
          <div>
            <IconButton color="primary" onClick={() => setViewScenario(scenario)}><VisibilityIcon /></IconButton>
            <IconButton color="primary" onClick={() => setEditScenario(scenario)}><EditIcon /></IconButton>
            <IconButton onClick={() => handleDeleteScenario(scenario._id)} color="error"><DeleteIcon /></IconButton>
          </div>
        </Paper>
      ))}

      {viewScenario && (
        <Dialog open onClose={() => setViewScenario(null)} maxWidth="md" fullWidth>
          <DialogTitle>View Scenario</DialogTitle>
          <DialogContent>
            <Typography variant="h6">{viewScenario.title}</Typography>
            <Typography variant="subtitle1" color="textSecondary">{viewScenario.reference}</Typography>
            <Typography variant="body1" sx={{ marginTop: 2 }}>{viewScenario.paragraph}</Typography>
            <Typography variant="subtitle2" sx={{ marginTop: 2 }}>Subject: {viewScenario.subject}</Typography>
            {viewScenario.questions.map((q, index) => (
              <Paper key={index} className="question-block" elevation={1} sx={{ padding: 2, marginTop: 2 }}>
                <Typography variant="body1"><b>Q{index + 1}:</b> {q.question}</Typography>
                {q.options.map((opt, i) => (
                  <Typography key={i} variant="body2">- {opt}</Typography>
                ))}
                <Typography variant="caption">Correct Answer: {q.answer}</Typography>
              </Paper>
            ))}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setViewScenario(null)}>Close</Button>
          </DialogActions>
        </Dialog>
      )}

      {editScenario && (
        <Dialog open onClose={() => setEditScenario(null)} maxWidth="md" fullWidth>
          <DialogTitle>Edit Scenario</DialogTitle>
          <DialogContent>
            <TextField label="Title" fullWidth margin="normal" value={editScenario.title} onChange={(e) => setEditScenario({ ...editScenario, title: e.target.value })} />
            <TextField label="Reference" fullWidth margin="normal" value={editScenario.reference} onChange={(e) => setEditScenario({ ...editScenario, reference: e.target.value })} />
            <TextField label="Paragraph" fullWidth margin="normal" multiline minRows={3} value={editScenario.paragraph} onChange={(e) => setEditScenario({ ...editScenario, paragraph: e.target.value })} />
            <FormControl fullWidth margin="normal" variant="outlined">
              <InputLabel>Subject</InputLabel>
              <Select value={editScenario.subject} label="Subject" onChange={(e) => setEditScenario({ ...editScenario, subject: e.target.value })}>
                {SUBJECTS.map((subj) => <MenuItem key={subj} value={subj}>{subj}</MenuItem>)}
              </Select>
            </FormControl>
            {editScenario.questions.map((q, index) => (
              <Paper key={index} className="question-block">
                <TextField label={`Question ${index + 1}`} fullWidth margin="normal" value={q.question} onChange={(e) => {
                  const qs = [...editScenario.questions];
                  qs[index] = { ...qs[index], question: e.target.value };
                  setEditScenario({ ...editScenario, questions: qs });
                }} />
                {q.options.map((opt, i) => (
                  <TextField key={i} label={`Option ${i + 1}`} fullWidth margin="normal" value={opt} onChange={(e) => {
                    const qs = [...editScenario.questions];
                    const updatedOpts = [...qs[index].options];
                    updatedOpts[i] = e.target.value;
                    qs[index] = { ...qs[index], options: updatedOpts };
                    setEditScenario({ ...editScenario, questions: qs });
                  }} />
                ))}
                <FormControl fullWidth margin="normal" variant="outlined">
                  <InputLabel id={`correct-label-${index}`} shrink>Correct Answer</InputLabel>
                  <Select
                    labelId={`correct-label-${index}`}
                    label="Correct Answer"
                    value={q.options.indexOf(q.answer)}
                    onChange={(e) => {
                      const qs = [...editScenario.questions];
                      qs[index] = { ...qs[index], answer: qs[index].options[e.target.value] };
                      setEditScenario({ ...editScenario, questions: qs });
                    }}
                  >
                    {q.options.map((opt, i) => <MenuItem key={i} value={i}>Option {i + 1}</MenuItem>)}
                  </Select>
                </FormControl>
              </Paper>
            ))}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEditScenario(null)}>Cancel</Button>
            <Button variant="contained" onClick={handleUpdate}>Save</Button>
          </DialogActions>
        </Dialog>
      )}
    </div>
  );
};

export default QuizManagement;
