import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../ui/button';

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  return (
    <nav className="sticky top-0 z-50 border-b border-white/10 bg-[#0A0A0A]/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        <Link to="/" className="text-lg font-semibold tracking-tight text-[#E5E5E5]">
          Meme Hub
        </Link>
        <div className="hidden items-center gap-2 sm:flex">
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

        <Button
          type="button"
          variant="ghost"
          className="sm:hidden text-[#E5E5E5]/80 hover:bg-white/10 hover:text-[#E5E5E5]"
          onClick={() => setMenuOpen((prev) => !prev)}
          aria-label="Toggle navigation menu"
        >
          {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="border-t border-white/10 bg-[#111111]/95 px-4 py-3 sm:hidden"
          >
            {user ? (
              <div className="space-y-2">
                <p className="text-sm text-[#E5E5E5]/55">{user.username}</p>
                <Link to="/feed" className="block rounded-md px-3 py-2 text-sm text-[#E5E5E5] hover:bg-white/10">
                  Feed
                </Link>
                <Link
                  to="/profile"
                  className="block rounded-md px-3 py-2 text-sm text-[#E5E5E5] hover:bg-white/10"
                >
                  Profile
                </Link>
                <Button
                  variant="ghost"
                  onClick={logout}
                  className="w-full justify-start px-3 text-[#E5E5E5]/80 hover:bg-white/10 hover:text-[#E5E5E5]"
                >
                  Logout
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link to="/login">
                  <Button variant="ghost" className="w-full text-[#E5E5E5]/80 hover:bg-white/10 hover:text-[#E5E5E5]">
                    Login
                  </Button>
                </Link>
                <Link to="/register">
                  <Button className="w-full bg-[#3B82F6] text-white hover:bg-[#2563EB]">Get Started</Button>
                </Link>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
