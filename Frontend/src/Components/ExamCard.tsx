import { Link } from 'react-router-dom';
import { Exam } from '../types';

interface ExamCardProps {
  exam: Exam;
}

export function ExamCard({ exam }: ExamCardProps) {
  return (
    <Link to={`/exam/${exam.id}`} key={exam.id} style={{ textDecoration: 'none', color: 'inherit' }}>
      <div className="card">
        {/* Hvis eksamen er færdig, vis et "FÆRDIG"-mærkat */}
        {exam.isCompleted && (
           <p style={{ color: 'var(--success-color)', fontWeight: 'bold', margin: 0 }}>FÆRDIG</p>
        )}
        <h2>{exam.courseName}</h2>
        <p>{exam.examtermin} - {new Date(exam.date).toLocaleDateString('da-DK')}</p>
      </div>
    </Link>
  );
}