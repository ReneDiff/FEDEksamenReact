import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom'; 
import { Exam } from '../types';

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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
      <h1>Aktive Eksamener</h1>
        <div style={{ display: 'flex', gap: '10px' }}>
          {/* Link/knap til at oprette en ny eksamen */}
          <Link to="/create">
            <button>Opret ny eksamen</button>
          </Link>
          {/* Link/knap til den nye historik-side */}
          <Link to="/history">
            <button>Se Historik</button>
          </Link>
        </div>
      </div>
      <div>
        {exams.map(exam => (
            <Link to={`/exam/${exam.id}`} key={exam.id} style={{ textDecoration: 'none', color: 'inherit' }}>
                <div key={exam.id} style={{ border: '1px solid grey', padding: '10px', margin: '10px' }}>
                    <h2>{exam.courseName}</h2>
                    <p>{exam.examtermin} - {new Date(exam.date).toLocaleDateString('da-DK')}</p>
                </div>
            </Link>
        ))}
      </div>
    </div>
  );
}