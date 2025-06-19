import { Link } from 'react-router-dom';
import { Exam } from '../types';

interface ExamCardProps {
  exam: Exam;
}

export function ExamCard({ exam }: ExamCardProps) {
    const examDate = new Date(exam.date).toLocaleDateString('da-DK', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  return (
      <Link to={`/exam/${exam.id}`} className="card">
        {/* Hvis eksamen er færdig, vis et "FÆRDIG"-mærkat */}
        {exam.isCompleted && (
          <p className="status-completed">FÆRDIG</p>
        )}
        <h2>{exam.courseName}</h2>
        <p>{exam.examtermin} - {examDate}</p>
      </Link>
  );
}