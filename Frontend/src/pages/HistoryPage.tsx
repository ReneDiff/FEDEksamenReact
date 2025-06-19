import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Exam } from '../types';
import { ExamCard } from '../Components/ExamCard'; 

export function HistoryPage() {
  const [completedExams, setCompletedExams] = useState<Exam[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('http://localhost:3001/exams?isCompleted=true')
      .then(res => res.json())
      .then(setCompletedExams)
      .catch(err => setError(err.message))
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) return <div>Henter historik...</div>;
  if (error) return <div>Fejl: {error}</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <h1>Eksamenshistorik</h1>
        <Link to="/">
            <button>Tilbage til forsiden</button>
        </Link>
      </div>
      {completedExams.length > 0 ? (
        completedExams.map(exam => (
          <ExamCard key={exam.id} exam={exam} />
        ))
      ) : (
        <p>Der er endnu ingen afsluttede eksamener i historikken.</p>
      )}
    </div>
  );
}