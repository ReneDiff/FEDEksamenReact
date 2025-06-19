import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';

export function CreateExamPage() {
  // useNavigate-hook lader os programmatisk sende brugeren til en ny side
  const navigate = useNavigate();

  // Opret state for hvert input-felt i formularen
  const [courseName, setCourseName] = useState('');
  const [examTerm, setExamTerm] = useState('');
  const [date, setDate] = useState('');
  const [numberOfQuestions, setNumberOfQuestions] = useState(10);
  const [examDurationMinutes, setExamDurationMinutes] = useState(20);
  const [startTime, setStartTime] = useState('09:00');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Denne funktion kører, når formularen submittes
  const handleSubmit = (event: FormEvent) => {
    event.preventDefault(); // Forhindrer at siden genindlæses
    setIsSubmitting(true);

    const newExam = {
      courseName,
      examtermin: examTerm,
      date,
      numberOfQuestions,
      examDurationMinutes,
      startTime,
      isCompleted: false // Nye eksamener er aldrig færdige
    };

    fetch('http://localhost:3001/exams', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newExam),
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Der opstod en fejl ved oprettelse af eksamen.');
        }
        return response.json();
      })
      .then(() => {
        // Når eksamen er oprettet, send brugeren tilbage til forsiden
        navigate('/');
      })
      .catch(error => {
        console.error(error);
        setIsSubmitting(false);
      });
  };

  return (
    <div>
      <h1>Opret ny eksamen</h1>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '1rem' }}>
          <label>
            Kursusnavn:
            <input type="text" value={courseName} onChange={e => setCourseName(e.target.value)} required />
          </label>
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <label>
            Eksamenstermin:
            <input type="text" value={examTerm} onChange={e => setExamTerm(e.target.value)} required />
          </label>
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <label>
            Dato:
            <input type="date" value={date} onChange={e => setDate(e.target.value)} required />
          </label>
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <label>
            Starttidspunkt:
            <input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} required />
          </label>
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <label>
            Antal spørgsmål:
            <input type="number" value={numberOfQuestions} onChange={e => setNumberOfQuestions(parseInt(e.target.value, 10))} required />
          </label>
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <label>
            Eksaminationstid (minutter):
            <input type="number" value={examDurationMinutes} onChange={e => setExamDurationMinutes(parseInt(e.target.value, 10))} required />
          </label>
        </div>
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Opretter...' : 'Opret Eksamen'}
        </button>
      </form>
    </div>
  );
}