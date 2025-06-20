import { Routes, Route } from 'react-router-dom';
import { ExamListPage } from './pages/ExamListPage';
import { ExamDetailPage } from './pages/ExamDetailPage';
import { CreateExamPage } from './pages/CreateExamPage';
import { ExaminationPage } from './pages/ExaminationPage'; 
import { HistoryPage } from './pages/HistoryPage'; 


function App() {
  return (
    <Routes>
      <Route path="/" element={<ExamListPage />} />

      <Route path="/exam/:examId" element={<ExamDetailPage />} />

      <Route path="/create" element={<CreateExamPage />} />

      <Route path="/exam/:examId/start" element={<ExaminationPage />} />

      <Route path="/history" element={<HistoryPage />} />
    </Routes>
  );
}

export default App;