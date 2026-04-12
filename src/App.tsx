import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import LibraryPage from './pages/LibraryPage';
import FavoritesPage from './pages/FavoritesPage';
import UploadPage from './pages/UploadPage';
import EditTonePage from './pages/EditTonePage';
import ToneDetailPage from './pages/ToneDetailPage';
import AuthCallbackPage from './pages/AuthCallbackPage';
import { SelectedToneProvider } from './context/SelectedToneProvider';

function AppShell() {
  const { pathname } = useLocation();
  const hideTopBar = pathname === '/auth/callback';

  return (
    <div className="flex h-screen overflow-hidden bg-brand-bg">
      {!hideTopBar ? <TopBar /> : null}
      <Sidebar />
          <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden pt-14 lg:pt-0">
            <Routes>
              <Route path="/" element={<LibraryPage />} />
              <Route path="/favorites" element={<FavoritesPage />} />
              <Route path="/upload" element={<UploadPage />} />
              <Route path="/tone/:id/edit" element={<EditTonePage />} />
              <Route path="/tone/:id" element={<ToneDetailPage />} />
              <Route path="/auth/callback" element={<AuthCallbackPage />} />
            </Routes>
          </div>
    </div>
  );
}

export default function App() {
  return (
    <SelectedToneProvider>
      <BrowserRouter>
        <AppShell />
      </BrowserRouter>
    </SelectedToneProvider>
  );
}
