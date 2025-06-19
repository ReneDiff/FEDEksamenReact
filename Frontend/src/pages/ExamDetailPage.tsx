import { useState, useEffect, FormEvent } from "react";
import { useParams } from "react-router-dom";
import { Exam, Student } from "../types";
import { Link } from 'react-router-dom'; 


export function ExamDetailPage() {
  const { examId } = useParams<{ examId: string }>();

  const [exam, setExam] = useState<Exam | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State-variabler til vores 'tilføj studerende'-formular
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentNumber, setNewStudentNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!examId) return; // Stop hvis der ikke er noget ID

    const fetchExamData = fetch(`http://localhost:3001/exams/${examId}`);
    const fetchStudentsData = fetch(`http://localhost:3001/students?examId=${examId}`);

    // Promise.all er en effektiv måde at køre flere fetches på samtidigt
    Promise.all([fetchExamData, fetchStudentsData])
      .then(async ([examResponse, studentsResponse]) => {
        if (!examResponse.ok || !studentsResponse.ok) {
          throw new Error('Netværksfejl ved hentning af data.');
        }
        const examData = await examResponse.json();
        const studentsData = await studentsResponse.json();
        
        setExam(examData);
        setStudents(studentsData);
      })
      .catch(error => {
        setError(error.message);
      })
      .finally(() => {
        setIsLoading(false);
      });

  }, [examId]); // Dependency array: useEffect kører igen hvis examId ændrer sig

  const handleAddStudent = (event: FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);

    const newStudent = {
      name: newStudentName,
      studentNumber: newStudentNumber,
      examId: examId // Kobl student til den korrekte eksamen
  };

    fetch('http://localhost:3001/students', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newStudent)
    })
      .then(res => res.json())
      .then((createdStudent: Student) => {
        setStudents(currentStudents => [...currentStudents, createdStudent]);

        setNewStudentName('');
        setNewStudentNumber('');
      })
      .catch(console.error)
      .finally(() => setIsSubmitting(false));
  };

  const calculateAverageGrade = () => {
    const validGrades = students
      .map(s => parseInt(s.grade || '', 10))
      .filter(g => !isNaN(g) && [-3, 0, 2, 4, 7, 10, 12].includes(g));

    if (validGrades.length === 0) {
      return "Ingen gyldige karakterer at beregne gennemsnit fra.";
    }
    
    const average = validGrades.reduce((sum, g) => sum + g, 0) / validGrades.length;
    return `Gennemsnitskarakter: ${average.toFixed(2)}`;
  };

  // ...og herunder er vores UI...
  if (isLoading) return <div>Henter detaljer...</div>;
  if (error) return <div>Fejl: {error}</div>;
  if (!exam) return <div>Eksamen blev ikke fundet.</div>;

return (
  <div>
    <h1>{exam.courseName}</h1>
    <p>Termin: {exam.examtermin} | Dato: {new Date(exam.date).toLocaleDateString('da-DK')}</p>
    
    <hr style={{ margin: '20px 0' }} />

    {/* ---- Betinget rendering: Viser enten 'Før eksamen'-view eller 'Efter eksamen'-view ---- */}

    {exam.isCompleted ? (
      // VIEW 1: Vises HVIS eksamen er færdig (Historik)
      <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Resultater</h2>
          <Link to="/history">
              <button>Tilbage til historik</button>
          </Link>
        </div>
        <p style={{fontStyle: 'italic'}}>{calculateAverageGrade()}</p>
        
        {students.map(student => {
          const duration = student.actualExamDurationSeconds || 0;
          const minutes = Math.floor(duration / 60);
          const seconds = duration % 60;

          return (
            <div key={student.id} style={{ border: '1px solid #444', padding: '15px', margin: '10px 0' }}>
              <p><strong>{student.name}</strong> ({student.studentNumber})</p>
              <p><strong>Karakter: {student.grade || 'Ikke givet'}</strong></p>
              <ul style={{ margin: 0, paddingLeft: '20px' }}>
                <li>Trukket spørgsmål: {student.questionDrawn || 'N/A'}</li>
                <li>Brugt tid: {minutes} min, {seconds} sek</li>
                <li>Noter: {student.notes || 'Ingen'}</li>
              </ul>
            </div>
          )
        })}
      </div>
    ) : (
      // VIEW 2: Vises HVIS eksamen IKKE er færdig
      <div>
        <h2>Tilmeldte studerende</h2>
        {students.length > 0 ? (
          <ul>{students.map(s => <li key={s.id}>{s.name} ({s.studentNumber})</li>)}</ul>
        ) : (
          <p>Der er endnu ingen studerende tilmeldt denne eksamen.</p>
        )}

        <hr style={{ margin: '20px 0' }} />
        <form onSubmit={handleAddStudent}>
          <h3>Tilføj ny studerende</h3>
          <div style={{ marginBottom: '1rem' }}>
            <label>Fulde navn: <input type="text" value={newStudentName} onChange={e => setNewStudentName(e.target.value)} required /></label>
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label>Studienummer: <input type="text" value={newStudentNumber} onChange={e => setNewStudentNumber(e.target.value)} required /></label>
          </div>
          <button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Tilføjer...' : 'Tilføj studerende'}</button>
        </form>

        <hr style={{ margin: '20px 0' }} />
        <Link to={`/exam/${exam.id}/start`}>
          <button disabled={students.length === 0}>Start Eksamen</button>
        </Link>
      </div>
    )}
  </div>
  );
}