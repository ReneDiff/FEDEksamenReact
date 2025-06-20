import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Exam, Student } from '../types';
import { Modal } from '../Components/Modal'; // Importer Modal

// Definerer de forskellige trin i eksamensflowet
type ExamFlowState = 'loading' | 'awaiting_question' | 'awaiting_start' | 'timer_running' | 'grading';

export function ExaminationPage() {
  const { examId } = useParams<{ examId: string }>();
  const navigate = useNavigate();

  // State til at holde data
  const [exam, setExam] = useState<Exam | null>(null);
  const [studentQueue, setStudentQueue] = useState<Student[]>([]);
  const [currentStudentIndex, setCurrentStudentIndex] = useState(0);

  // State til at styre UI og flow
  const [flowState, setFlowState] = useState<ExamFlowState>('loading');
  const [drawnQuestion, setDrawnQuestion] = useState<number | null>(null);
  const [notes, setNotes] = useState('');
  const [grade, setGrade] = useState('');
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [timeElapsed, setTimeElapsed] = useState(0);

  const [isExamFinishedModalOpen, setIsExamFinishedModalOpen] = useState(false);

  const gradeOptions = [-3, 0, 2, 4, 7, 10, 12];

  // Hent data ved start
  useEffect(() => {
    if (!examId) return;
    Promise.all([
      fetch(`http://localhost:3001/exams/${examId}`),
      fetch(`http://localhost:3001/students?examId=${examId}`)
    ]).then(async ([examRes, studentsRes]) => {
      const examData = await examRes.json();
      const studentsData = await studentsRes.json();
      setExam(examData);
      setStudentQueue(studentsData);
      setTimeRemaining(examData.examDurationMinutes * 60);
      setFlowState('awaiting_question');
    }).catch(console.error);
  }, [examId]);

  // Effekt til at håndtere timeren
  useEffect(() => {
    if (flowState !== 'timer_running') return;

    const timerId = setInterval(() => {
      setTimeRemaining(prev => prev - 1);
      setTimeElapsed(prev => prev + 1);
    }, 1000);

    // Stop timeren hvis tiden løber ud
    if (timeRemaining <= 0) {
      clearInterval(timerId);
      setFlowState('grading');
    }

    // Ryd op efter timeren, når komponenten forsvinder eller state ændres
    return () => clearInterval(timerId);
  }, [flowState, timeRemaining]);


  const handleDrawQuestion = () => {
    if (!exam) return;
    const question = Math.floor(Math.random() * exam.numberOfQuestions) + 1; // 
    setDrawnQuestion(question);
    setFlowState('awaiting_start');
  };

  const handleStartTimer = () => {
    setTimeElapsed(0); // Nulstil den forløbne tid
    setFlowState('timer_running'); // 
  };

  const handleStopTimer = () => {
    setFlowState('grading'); // 
  };

  const handleSaveAndNext = async () => {
    const student = studentQueue[currentStudentIndex];
    if (!student || !grade) {
        alert('Indtast venligst en karakter.');
        return;
    }

    const updatedStudentPayload = {
        notes: notes,
        grade: grade,
        questionDrawn: drawnQuestion,
        actualExamDurationSeconds: timeElapsed
    };

    // Gem opdateringer for den aktuelle studerende
    const updateStudentPromise = fetch(`http://localhost:3001/students/${student.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedStudentPayload)
    });

    // Tjek om det er den sidste studerende i køen
    const isLastStudent = currentStudentIndex >= studentQueue.length - 1;

    if (isLastStudent) {
        // Hvis det er den sidste, opdater selve eksamenen til at være "færdig"
        const updateExamPromise = fetch(`http://localhost:3001/exams/${examId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isCompleted: true })
        });

        // Vent på at BÅDE den studerende OG eksamenen er blevet gemt
        await Promise.all([updateStudentPromise, updateExamPromise]);

        setIsExamFinishedModalOpen(true);
    } else {
        // Hvis det IKKE er den sidste, skal vi kun vente på at studenten er gemt
        await updateStudentPromise;

        // Gør klar til næste studerende
        setCurrentStudentIndex(prev => prev + 1);
        setFlowState('awaiting_question');
        setDrawnQuestion(null);
        setNotes('');
        setGrade('');
        setTimeRemaining(exam ? exam.examDurationMinutes * 60 : 0);
    }
  };

  const handleCloseModalAndNavigate = () => {
    setIsExamFinishedModalOpen(false); 
    navigate(`/exam/${examId}`); 
  };

  const currentStudent = studentQueue[currentStudentIndex];

  if (flowState === 'loading' || !currentStudent) return <div>Indlæser eksamen...</div>;

  return (
    <div className="examination-layout">
      {/* --- HEADER: Viser eksamensnavn og en "Afslut"-knap --- */}
      <header className="page-header">
        <h1>{exam?.courseName}</h1>
        <div className="header-actions">
          {/* Navigerer tilbage til detaljesiden, hvis man afbryder */}
          <Link to={`/exam/${examId}`} className="button button-danger">Afslut</Link>
        </div>
      </header>

      {/* --- KORT 1: Viser altid den nuværende studerende --- */}
      <div className="card">
        <p style={{ margin: 0, color: 'var(--text-color-secondary)' }}>
          Eksaminand {currentStudentIndex + 1} af {studentQueue.length}
        </p>
        <h2 style={{ margin: '0 0 5px 0' }}>{currentStudent.name}</h2>
        <p style={{ margin: 0, color: 'var(--text-color-secondary)' }}>
          Studienummer: {currentStudent.studentNumber}
        </p>
      </div>

      {/* --- KORT 2: Dynamisk indhold baseret på flowState --- */}

      {/* Tilstand: Træk Spørgsmål */}
      {flowState === 'awaiting_question' && (
        <div className="card" style={{ textAlign: 'center', padding: '2rem' }}>
          <h2>Klar til at trække spørgsmål</h2>
          <button className="button" style={{ marginTop: '1rem' }} onClick={handleDrawQuestion}>
            Træk Spørgsmål
          </button>
        </div>
      )}

      {/* Tilstand: Start Timer */}
      {flowState === 'awaiting_start' && (
        <div className="card" style={{ textAlign: 'center', padding: '2rem' }}>
          <p style={{ color: 'var(--text-color-secondary)' }}>Spørgsmål trukket</p>
          <h2 className="drawn-question-display">{drawnQuestion}</h2>
          <button className="button" style={{ padding: '15px 30px', fontSize: '1.2rem' }} onClick={handleStartTimer}>
            Start Eksamination
          </button>
        </div>
      )}

      {/* Tilstand: Timeren kører */}
      {flowState === 'timer_running' && (
        <div className="card" style={{ padding: '2rem' }}>
          <div style={{ textAlign: 'center' }}>
            <p style={{ color: 'var(--text-color-secondary)' }}>Resterende tid</p>
            <h2 className="timer-display">{new Date(timeRemaining * 1000).toISOString().substr(14, 5)}</h2>
            <button className="button button-danger" onClick={handleStopTimer}>
              Afslut Præsentation
            </button>
          </div>
          <div className="form-group" style={{ marginTop: '2rem' }}>
            <label htmlFor="notes-running">Noter</label>
            <textarea id="notes-running" className="form-input" rows={6} value={notes} onChange={e => setNotes(e.target.value)} placeholder="Dine noter undervejs..."></textarea>
          </div>
        </div>
      )}

      {/* Tilstand: Karaktergivning */}
      {flowState === 'grading' && (
        <div className="card" style={{ padding: '2rem' }}>
          <h2>Votering og Karakter</h2>
          <p style={{ color: 'var(--text-color-secondary)', textAlign: 'center' }}>
            Faktisk brugt tid: {Math.floor(timeElapsed / 60)} minutter og {timeElapsed % 60} sekunder.
          </p>
          {/* Vi bruger en form for korrekt semantik og håndtering */}
          <form onSubmit={(e) => { e.preventDefault(); handleSaveAndNext(); }}>
            <div className="form-group" style={{ marginTop: '1rem' }}>
              <label htmlFor="notes-final">Endelige noter</label>
              <textarea id="notes-final" className="form-input" rows={4} value={notes} onChange={e => setNotes(e.target.value)}></textarea>
            </div>
            <div className="form-group">
              <label htmlFor="grade-select">Karakter</label>
              <select id="grade-select" className="form-input" value={grade} onChange={e => setGrade(e.target.value)} required>
                <option value="" disabled>Vælg karakter</option>
                {gradeOptions.map(g => (
                  <option key={g} value={g}>{g === 0 ? '00' : g}</option>
                ))}
              </select>
            </div>
            <button type="submit" className="button" style={{ width: '100%', padding: '15px', fontSize: '1.2rem' }}>
              Gem og Næste Studerende
            </button>
          </form>
        </div>
      )}

      {/* Modal-vindue til når eksamen er helt slut */}
      <Modal isOpen={isExamFinishedModalOpen} onClose={handleCloseModalAndNavigate}>
        <h2>Eksamen er slut</h2>
        <p>Alle studerende er blevet eksamineret.</p>
        <button className="button" onClick={handleCloseModalAndNavigate} style={{ marginTop: '1rem' }}>
          Gå til resultatsiden
        </button>
      </Modal>
    </div>
  );
}