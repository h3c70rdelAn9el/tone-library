import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import LibraryPage from './pages/LibraryPage';
import UploadPage from './pages/UploadPage';
import ToneDetailPage from './pages/ToneDetailPage';

export default function App() {
  return (
    <BrowserRouter>
      <div className="flex min-h-screen bg-brand-bg">
        <Sidebar />
        <main className="flex-1 overflow-y-auto">
          <Routes>
            <Route path="/" element={<LibraryPage />} />
            <Route path="/upload" element={<UploadPage />} />
            <Route path="/tone/:id" element={<ToneDetailPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
