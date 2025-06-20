import { useState, useEffect, FormEvent } from "react";
import { useParams, Link, useNavigate, useLocation } from "react-router-dom";
import { Exam, Student } from "../types";


export function ExamDetailPage() {
  const { examId } = useParams<{ examId: string }>();
  const navigate = useNavigate();
  const location = useLocation(); 

  const [exam, setExam] = useState<Exam | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State-variabler til vores 'tilføj studerende'-formular
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentNumber, setNewStudentNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!examId) return; 

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

  }, [examId,location.key]); 

  const handleAddStudent = (event: FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);

    const newStudent = {
      name: newStudentName,
      studentNumber: newStudentNumber,
      examId: examId 
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
      <header className="page-header">
        <h1>{exam.courseName}</h1>
        <div className="header-actions">
          {/* RETTET: Bruger nu en knap med navigate(-1) for at gå "tilbage" dynamisk */}
          <button onClick={() => navigate(-1)} className="button">
            Tilbage
          </button>
        </div>
      </header>
  
      <main className="page-content">
        <div className="card">
          <h2>Eksamensdetaljer</h2>
          <p><strong>Termin:</strong> {exam.examtermin}</p>
          <p><strong>Dato:</strong> {new Date(exam.date).toLocaleDateString('da-DK', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
          <p><strong>Starttidspunkt:</strong> {exam.startTime}</p>
          <p><strong>Varighed:</strong> {exam.examDurationMinutes} minutter</p>
          <p><strong>Antal spørgsmål:</strong> {exam.numberOfQuestions}</p>
        </div>
  
        {exam.isCompleted ? (
          <div className="card">
            <h2>Resultater</h2>
            <p style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--primary-color)' }}>
                {calculateAverageGrade()}
            </p>
            <hr style={{ margin: '1rem 0', border: 'none', borderBottom: '1px solid var(--border-color)' }}/>
            <div className="student-list">
                {students.map(student => (
                    <div key={student.id} className="student-list-item">
                        <div style={{ flexGrow: 1 }}>
                            <div>
                                <span className="list-item-label">Navn:</span>
                                <span>{student.name}</span>
                            </div>
                            <div>
                                <span className="list-item-label">Studienummer:</span>
                                <span>{student.studentNumber}</span>
                            </div>
                        </div>
                        <div style={{ textAlign: 'left' }}>
                            <span className="list-item-label">Karakter</span>
                            <p style={{ margin: 0, fontSize: '1.3rem', fontWeight: 'bold' }}>
                                {student.grade || '-'}
                            </p> 
                        </div>
                    </div>
              ))}
            </div>
          </div>
        ) : (
          // View hvis eksamen IKKE er færdig
          <>
            <div className="card">
              <h2>Tilmeldte Studerende</h2>
              {students.length > 0 ? (
                <div className="student-list">
                  {students.map(s => (
                    <div key={s.id} className="student-list-item">
                      {/* Container for Navn + Label */}
                      <div>
                        <span className="list-item-label">Navn:</span>
                        <span>{s.name}</span>
                      </div>
                      {/* Container for Studienummer + Label */}
                      <div>
                        <span className="list-item-label">Studienummer:</span>
                        <span>{s.studentNumber}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p>Ingen studerende er tilmeldt endnu.</p>
              )}
            </div>

            <div className="card">
              <h2>Tilføj ny studerende</h2>
              <form onSubmit={handleAddStudent}>
                <div className="form-group">
                  <label htmlFor="studentName">Fulde navn</label>
                  <input id="studentName" type="text" className="form-input" value={newStudentName} onChange={e => setNewStudentName(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label htmlFor="studentNumber">Studienummer</label>
                  <input id="studentNumber" type="text" className="form-input" value={newStudentNumber} onChange={e => setNewStudentNumber(e.target.value)} required />
                </div>
                <button type="submit" className="button" disabled={isSubmitting}>
                  {isSubmitting ? 'Tilføjer...' : 'Tilføj studerende'}
                </button>
              </form>
            </div>
            
            <Link to={`/exam/${examId}/start`} className="button" style={{textAlign: 'center', fontSize: '1.2rem', padding: '15px'}}>
              Start Eksamen
            </Link>
          </>
        )}
      </main>
    </div>
  );
}