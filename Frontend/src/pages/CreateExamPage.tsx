import { useState, FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';

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
      {/* --- STANDARD SIDE-HEADER --- */}
      <header className="page-header">
        <h1>Opret Ny Eksamen</h1>
        <div className="header-actions">
          <Link to="/" className="button">Tilbage</Link>
        </div>
      </header>

      {/* --- FORMULAREN PAKKET IND I ET KORT --- */}
      <main className="page-content">
        <div className="card">
          <form onSubmit={handleSubmit}>
            
            <div className="form-group">
              <label htmlFor="courseName">Kursusnavn</label>
              <input id="courseName" type="text" className="form-input" value={courseName} onChange={e => setCourseName(e.target.value)} required />
            </div>

            <div className="form-group">
              <label htmlFor="examTerm">Eksamenstermin</label>
              <input id="examTerm" type="text" className="form-input" value={examTerm} onChange={e => setExamTerm(e.target.value)} required />
            </div>

            <div className="form-group">
              <label htmlFor="date">Dato</label>
              <input id="date" type="date" className="form-input" value={date} onChange={e => setDate(e.target.value)} required />
            </div>

            <div className="form-group">
              <label htmlFor="startTime">Starttidspunkt</label>
              <input id="startTime" type="time" className="form-input" value={startTime} onChange={e => setStartTime(e.target.value)} required />
            </div>

            <div className="form-group">
              <label htmlFor="numberOfQuestions">Antal spørgsmål</label>
              <input id="numberOfQuestions" type="number" className="form-input" value={numberOfQuestions} onChange={e => setNumberOfQuestions(parseInt(e.target.value, 10))} required />
            </div>

            <div className="form-group">
              <label htmlFor="examDurationMinutes">Eksaminationstid (minutter)</label>
              <input id="examDurationMinutes" type="number" className="form-input" value={examDurationMinutes} onChange={e => setExamDurationMinutes(parseInt(e.target.value, 10))} required />
            </div>

            {/* Knappen bruger nu vores standard .button klasse */}
            <button type="submit" className="button" disabled={isSubmitting} style={{ width: '100%', padding: '15px', fontSize: '1.2rem' }}>
              {isSubmitting ? 'Opretter...' : 'Opret Eksamen'}
            </button>
            
          </form>
        </div>
      </main>
    </div>
  );
}