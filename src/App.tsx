import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import LibraryPage from './pages/LibraryPage';
import FavoritesPage from './pages/FavoritesPage';
import UploadPage from './pages/UploadPage';
import ToneDetailPage from './pages/ToneDetailPage';
import { SelectedToneProvider } from './hooks/useSelectedTone';

export default function App() {
  return (
    <SelectedToneProvider>
      <BrowserRouter>
        <div className="flex h-screen overflow-hidden bg-brand-bg">
          <Sidebar />
          <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden pt-14 lg:pt-0">
            <Routes>
              <Route path="/" element={<LibraryPage />} />
              <Route path="/favorites" element={<FavoritesPage />} />
              <Route path="/upload" element={<UploadPage />} />
              <Route path="/tone/:id" element={<ToneDetailPage />} />
            </Routes>
          </div>
        </div>
      </BrowserRouter>
    </SelectedToneProvider>
  );
}
