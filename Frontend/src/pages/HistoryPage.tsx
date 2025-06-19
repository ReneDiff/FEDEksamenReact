import { useState, useEffect } from 'react';
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
      .then(setCompletedExams)
      .catch(err => setError(err.message))
      .finally(() => setIsLoading(false));
  }, []);

    const filteredExams = completedExams.filter(exam =>
    exam.courseName.toLowerCase().includes(filterText.toLowerCase()) ||
    exam.examtermin.toLowerCase().includes(filterText.toLowerCase())
  );

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
      {/*  input-feltet til at styre filteret */}
      <input
        type="text"
        placeholder="Filtrer efter kursusnavn eller termin..."
        value={filterText}
        onChange={e => setFilterText(e.target.value)}
        style={{ width: '100%', padding: '10px', marginBottom: '20px' }}
      />
      {filteredExams.length > 0 ? (
        filteredExams.map(exam => (
          <div key={exam.id} className="card">
          <ExamCard key={exam.id} exam={exam} />
          </div>
        ))
      ) : (
        <p>Der er endnu ingen afsluttede eksamener i historikken.</p>
      )}
    </div>
  );
}