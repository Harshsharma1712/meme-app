import { motion } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../ui/button';

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 border-b border-white/10 bg-[#0A0A0A]/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="text-lg font-semibold tracking-tight text-[#E5E5E5]">
          Meme Hub
        </Link>
        <div className="flex items-center gap-2">
          {user ? (
            <>
              <div className="hidden items-center gap-5 sm:flex">
                <Link to="/feed" className="relative px-1 py-1 text-sm text-[#E5E5E5]/80 hover:text-[#E5E5E5]">
                  Feed
                  {isActive('/feed') && (
                    <motion.span
                      layoutId="active-nav-link"
                      className="absolute -bottom-[7px] left-0 h-[2px] w-full bg-[#3B82F6]"
                    />
                  )}
                </Link>
                <Link
                  to="/profile"
                  className="relative px-1 py-1 text-sm text-[#E5E5E5]/80 hover:text-[#E5E5E5]"
                >
                  Profile
                  {isActive('/profile') && (
                    <motion.span
                      layoutId="active-nav-link"
                      className="absolute -bottom-[7px] left-0 h-[2px] w-full bg-[#3B82F6]"
                    />
                  )}
                </Link>
              </div>
              <span className="hidden text-sm text-[#E5E5E5]/60 md:block">{user.username}</span>
              <Button
                variant="ghost"
                onClick={logout}
                className="text-[#E5E5E5]/80 hover:bg-white/10 hover:text-[#E5E5E5]"
              >
                Logout
              </Button>
            </>
          ) : (
            <>
              <Link to="/login">
                <Button variant="ghost" className="text-[#E5E5E5]/80 hover:bg-white/10 hover:text-[#E5E5E5]">
                  Login
                </Button>
              </Link>
              <Link to="/register">
                <Button className="bg-[#3B82F6] text-white hover:bg-[#2563EB]">Get Started</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
