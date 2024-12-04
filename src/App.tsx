import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import BottomNav from './components/BottomNav';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Home from './pages/Home';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import Security from './pages/Security';
import Earnings from './pages/Earnings';
import Help from './pages/Help';

import Contact from './pages/Contact';
import Chat from './pages/Chat';
import Explore from './pages/Explore';
import CreatePost from './pages/CreatePost';
import ManageProfile from './pages/ManageProfile';
import Wallet from './pages/Wallet';

function AppContent() {
  const { isAuthenticated } = useAuth();

  return (
    <>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/" element={<PrivateRoute><Home /></PrivateRoute>} />
        <Route path="/profile/:userId" element={<PrivateRoute><Profile /></PrivateRoute>} />
        <Route path="/settings" element={<PrivateRoute><Settings /></PrivateRoute>} />
        <Route path="/settings/security" element={<PrivateRoute><Security /></PrivateRoute>} />
        <Route path="/settings/earnings" element={<PrivateRoute><Earnings /></PrivateRoute>} />
        <Route path="/settings/help" element={<PrivateRoute><Help /></PrivateRoute>} />
        <Route path="/settings/contact" element={<PrivateRoute><Contact /></PrivateRoute>} />
        <Route path="/manage-profile" element={<PrivateRoute><ManageProfile /></PrivateRoute>} />
        <Route path="/chat" element={<PrivateRoute><Chat /></PrivateRoute>} />
        <Route path="/chat/:userId" element={<PrivateRoute><Chat /></PrivateRoute>} />
        <Route path="/explore" element={<PrivateRoute><Explore /></PrivateRoute>} />
        <Route path="/create" element={<PrivateRoute><CreatePost /></PrivateRoute>} />
        <Route path="/wallet" element={<Wallet />} />
      </Routes>
      {isAuthenticated && <BottomNav />}
    </>
  );
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}