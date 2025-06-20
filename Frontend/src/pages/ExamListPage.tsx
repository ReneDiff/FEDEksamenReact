import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom'; 
import { Exam } from '../types';
import { ExamCard } from '../Components/ExamCard'; 
 

export function ExamListPage() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('http://localhost:3001/exams?isCompleted=false')
      .then(response => {
        if (!response.ok) {
          throw new Error('Netværksfejl: Kunne ikke hente data.');
        }
        return response.json();
      })
      .then(data => {
        setExams(data);
        setIsLoading(false);
      })
      .catch(error => {
        setError(error.message);
        setIsLoading(false);
      });
  }, []);

  if (isLoading) return <div>Henter data...</div>;
  if (error) return <div>Fejl: {error}</div>;

  return (
    <div>
      <header className="page-header">
        <h1>Aktive Eksamener</h1>
        <div className="header-actions">
          <Link to="/create" className="button">Opret ny eksamen</Link>
          <Link to="/history" className="button">Historik</Link>
        </div>
      </header>

      <main>
        {exams.length > 0 ? (
          <div className="exam-list">
            {exams.map(exam => (
              <ExamCard key={exam.id} exam={exam} />
            ))}
          </div>
        ) : (
          <p>Der er ingen aktive eksamener i øjeblikket.</p>
        )}
      </main>
    </div>
  );
}