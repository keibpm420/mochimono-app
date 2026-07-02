import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import SetListPage from './pages/SetListPage';
import SetDetailPage from './pages/SetDetailPage';
import SetEditPage from './pages/SetEditPage';
import { getToken } from './api/client';

function RequireAuth({ children }) {
  if (!getToken()) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/sets"
          element={
            <RequireAuth>
              <SetListPage />
            </RequireAuth>
          }
        />
        <Route
          path="/sets/:id"
          element={
            <RequireAuth>
              <SetDetailPage />
            </RequireAuth>
          }
        />
        <Route
          path="/sets/:id/edit"
          element={
            <RequireAuth>
              <SetEditPage />
            </RequireAuth>
          }
        />
        <Route path="/" element={<Navigate to="/sets" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
