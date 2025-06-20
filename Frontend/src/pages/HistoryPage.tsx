import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Exam } from '../types';
import { ExamCard } from '../Components/ExamCard';

export function HistoryPage() {
  const [completedExams, setCompletedExams] = useState<Exam[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterText, setFilterText] = useState('');

  useEffect(() => {
    fetch('http://localhost:3001/exams?isCompleted=true')
      .then(res => res.json())
      .then(data => setCompletedExams(data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()))) // Sorterer efter dato
      .catch(err => setError(err.message))
      .finally(() => setIsLoading(false));
  }, []);

  // useMemo bruges til at undgå at skulle filtrere og gruppere data ved hver re-render
  // Den kører kun, når 'completedExams' eller 'filterText' ændrer sig.
  const groupedAndFilteredExams = useMemo(() => {
    const filtered = completedExams.filter(exam =>
      exam.courseName.toLowerCase().includes(filterText.toLowerCase()) ||
      exam.examtermin.toLowerCase().includes(filterText.toLowerCase())
    );

    return filtered.reduce((acc, exam) => {
      const termin = exam.examtermin;
      if (!acc[termin]) {
        acc[termin] = [];
      }
      acc[termin].push(exam);
      return acc;
    }, {} as Record<string, Exam[]>);
  }, [completedExams, filterText]);

  if (isLoading) return <div>Henter historik...</div>;
  if (error) return <div>Fejl: {error}</div>;

  return (
    <div>
      <header className="page-header">
        <h1>Eksamenshistorik</h1>
        <div className="header-actions">
          <Link to="/" className="button">Tilbage til forsiden</Link>
        </div>
      </header>

      <main className="page-content">
        <div className="form-group">
          <input
            type="text"
            className="form-input"
            placeholder="Filtrer efter kursusnavn eller termin..."
            value={filterText}
            onChange={e => setFilterText(e.target.value)}
          />
        </div>

        {Object.keys(groupedAndFilteredExams).length > 0 ? (
          Object.entries(groupedAndFilteredExams).map(([termin, examsInTerm]) => (
            <section key={termin}>
              <h2 className="history-group-title">{termin}</h2>
              <div className="exam-list">
                {examsInTerm.map(exam => (
                  <ExamCard key={exam.id} exam={exam} />
                ))}
              </div>
            </section>
          ))
        ) : (
          <div className="card" style={{marginTop: '2rem', textAlign: 'center'}}>
            <p>Ingen afsluttede eksamener matchede din filtrering.</p>
          </div>
        )}
      </main>
    </div>
  );
}