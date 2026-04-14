import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Feed from './pages/Feed';
import { Button } from './components/ui/button';
const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="flex h-screen items-center justify-center text-zinc-400">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  return <>{children}</>;
};

const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="border-b border-zinc-800 bg-black/50 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="text-xl font-black tracking-tighter bg-gradient-to-r from-violet-500 to-fuchsia-500 bg-clip-text text-transparent">
              MEME APP
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <div className="flex items-center gap-2 rounded-full bg-zinc-900/80 border border-zinc-800 p-1">
                  <Link to="/feed">
                    <Button
                      variant="ghost"
                      className={`h-8 px-3 text-sm ${isActive('/feed') ? 'bg-zinc-800 text-zinc-100' : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/70'}`}
                    >
                      Feed
                    </Button>
                  </Link>
                  <Link to="/profile">
                    <Button
                      variant="ghost"
                      className={`h-8 px-3 text-sm ${isActive('/profile') ? 'bg-zinc-800 text-zinc-100' : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/70'}`}
                    >
                      Profile
                    </Button>
                  </Link>
                </div>
                <span className="text-sm font-medium text-zinc-400 hidden sm:block">
                  Hello, <span className="text-zinc-100">{user.username}</span>
                </span>
                <Button variant="ghost" onClick={logout} className="text-zinc-300 hover:text-white hover:bg-white/10">
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost" className="text-zinc-300 hover:text-white hover:bg-white/10">
                    Login
                  </Button>
                </Link>
                <Link to="/register">
                  <Button className="bg-violet-600 hover:bg-violet-500 text-white">
                    Register
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

const AppRoutes = () => {
  return (
    <div className="min-h-screen bg-black text-zinc-100 selection:bg-violet-500/30">
      <Navbar />
      <main className="max-w-7xl mx-auto py-8">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<PrivateRoute><Navigate to="/feed" replace /></PrivateRoute>} />
          <Route path="/feed" element={<PrivateRoute><Feed /></PrivateRoute>} />
          <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
        </Routes>
      </main>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;
