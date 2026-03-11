import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import Spinner from './components/common/Spinner';
import ProtectedRoute from './components/common/ProtectedRoute';
import { useAuth } from './context/AuthContext';

// Lazy load pages for code splitting
const Home         = lazy(() => import('./pages/Home'));
const Browse       = lazy(() => import('./pages/Browse'));
const ResourceDetail = lazy(() => import('./pages/ResourceDetail'));
const PostResource = lazy(() => import('./pages/PostResource'));
const Dashboard    = lazy(() => import('./pages/Dashboard'));
const Profile      = lazy(() => import('./pages/Profile'));
const Chat         = lazy(() => import('./pages/Chat'));
const Bookmarks    = lazy(() => import('./pages/Bookmarks'));
const Login        = lazy(() => import('./pages/Login'));
const Register     = lazy(() => import('./pages/Register'));

const PageLoader = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
    <Spinner size={48} />
  </div>
);

const AppLayout = ({ children }) => (
  <>
    <Navbar />
    <main style={{ minHeight: 'calc(100vh - 64px)' }}>
      {children}
    </main>
    <Footer />
  </>
);

export default function App() {
  const { isLoading } = useAuth();

  if (isLoading) return <PageLoader />;

  return (
    <BrowserRouter>
      <Toaster
        position="bottom-center"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#1E293B',
            color: '#F1F5F9',
            border: '1px solid #334155',
            borderRadius: '12px',
            fontFamily: "'DM Sans', sans-serif",
            fontSize: '14px',
          },
          success: { iconTheme: { primary: '#10B981', secondary: '#fff' } },
          error:   { iconTheme: { primary: '#EF4444', secondary: '#fff' } },
        }}
      />

      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<AppLayout><Home /></AppLayout>} />
          <Route path="/browse" element={<AppLayout><Browse /></AppLayout>} />
          <Route path="/resources/:id" element={<AppLayout><ResourceDetail /></AppLayout>} />
          <Route path="/profile/:id" element={<AppLayout><Profile /></AppLayout>} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/post" element={<AppLayout><PostResource /></AppLayout>} />
            <Route path="/dashboard" element={<AppLayout><Dashboard /></AppLayout>} />
            <Route path="/messages" element={<AppLayout><Chat /></AppLayout>} />
            <Route path="/messages/:conversationId" element={<AppLayout><Chat /></AppLayout>} />
            <Route path="/bookmarks" element={<AppLayout><Bookmarks /></AppLayout>} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
