import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
    <div>
      <h2>Eksaminand: {currentStudent.name}</h2>
        <p style={{ marginTop: '-10px', color: 'grey' }}>
        Studienr: {currentStudent.studentNumber}
        </p>

      {/* Vis kun relevant UI baseret på den nuværende tilstand */}
      {flowState === 'awaiting_question' && (
        <button onClick={handleDrawQuestion}>Træk Spørgsmål</button>
      )}

      {flowState === 'awaiting_start' && (
        <div>
          <p>Spørgsmål trukket: <strong>{drawnQuestion}</strong></p>
          <button onClick={handleStartTimer}>Start Eksamination</button>
        </div>
      )}

      {(flowState === 'timer_running' || flowState === 'grading') && (
        <div>
          <h3>Noter</h3>
          <textarea 
            value={notes} 
            onChange={e => setNotes(e.target.value)} 
            rows={5} 
            style={{ width: '100%' }}
          />
        </div>
      )}

      {flowState === 'timer_running' && (
        <div>
          <h3>Tid tilbage: {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}</h3>
          <button onClick={handleStopTimer}>Slut Eksamination</button>
        </div>
      )}

      {flowState === 'grading' && (
        <div>
          <h3>Resultat</h3>
          <p>Faktisk brugt tid: {Math.floor(timeElapsed / 60)} minutter og {timeElapsed % 60} sekunder.</p>
          <div>
            <label>Karakter: </label>
            <input type="text" value={grade} onChange={e => setGrade(e.target.value)} />
          </div>
          <button onClick={handleSaveAndNext}>Gem og Næste Studerende</button>
        </div>
      )}
      <Modal isOpen={isExamFinishedModalOpen} onClose={handleCloseModalAndNavigate}>
        <h2>Eksamen er afsluttet!</h2>
        <p>Alle studerende er blevet eksamineret.</p>
        <button onClick={handleCloseModalAndNavigate}>Se resultater</button>
      </Modal>
    </div>
  );
}