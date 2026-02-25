import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plane, Menu, X, User, LogOut, Ticket, Sun, Moon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import Button from './Button';
import Modal from './Modal';
import AuthModal from './AuthModal';

interface NavbarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

const navLinks = [
  { id: 'home', label: 'Home' },
  { id: 'aircraft', label: 'Fleet' },
  { id: 'about', label: 'About' },
];

export default function Navbar({ currentPage, onNavigate }: NavbarProps) {
  const { user, signOut } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNav = (page: string) => {
    onNavigate(page);
    setMobileOpen(false);
    setUserMenuOpen(false);
  };

  return (
    <>
      <nav className={`navbar ${scrolled ? 'navbar-scrolled' : ''}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <button
              onClick={() => handleNav('home')}
              className="flex items-center gap-2.5 group"
            >
              <div className="w-9 h-9 rounded-lg bg-brand-500 flex items-center justify-center group-hover:bg-brand-600 transition-colors">
                <Plane className="w-5 h-5 text-white -rotate-45" />
              </div>
              <span className="text-lg font-bold font-display" style={{ color: 'var(--color-text)' }}>
                SkyWings
              </span>
            </button>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <button
                  key={link.id}
                  onClick={() => handleNav(link.id)}
                  className="relative px-4 py-2 text-sm font-medium rounded-lg transition-colors"
                  style={{ color: currentPage === link.id ? 'var(--color-primary)' : 'var(--color-text-3)' }}
                >
                  {link.label}
                  {currentPage === link.id && (
                    <motion.div
                      layoutId="nav-indicator"
                      className="absolute bottom-0 left-2 right-2 h-0.5 rounded-full bg-brand-500"
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                </button>
              ))}
            </div>

            {/* Right side */}
            <div className="flex items-center gap-3">
              {/* Theme toggle */}
              <button
                onClick={toggleTheme}
                className="theme-toggle"
                aria-label="Toggle theme"
              >
                <div className={`theme-toggle-knob ${isDark ? 'dark' : 'light'}`}>
                  {isDark ? (
                    <Moon className="w-3 h-3 text-white m-auto mt-[3.5px]" />
                  ) : (
                    <Sun className="w-3 h-3 text-white m-auto mt-[3.5px]" />
                  )}
                </div>
              </button>

              {/* User area */}
              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors"
                    style={{ background: 'var(--color-surface)', color: 'var(--color-text)' }}
                  >
                    <div className="w-7 h-7 rounded-full bg-brand-500 flex items-center justify-center">
                      <User className="w-3.5 h-3.5 text-white" />
                    </div>
                    <span className="hidden sm:block text-sm font-medium truncate max-w-[120px]">
                      {user.email?.split('@')[0]}
                    </span>
                  </button>

                  <AnimatePresence>
                    {userMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 top-full mt-2 w-48 rounded-xl overflow-hidden shadow-lg"
                        style={{ background: 'var(--color-bg-soft)', border: '1px solid var(--color-border)' }}
                      >
                        <button
                          onClick={() => handleNav('bookings')}
                          className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors"
                          style={{ color: 'var(--color-text-2)' }}
                          onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--color-surface)')}
                          onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                        >
                          <Ticket className="w-4 h-4" /> My Bookings
                        </button>
                        <div style={{ height: 1, background: 'var(--color-border)' }} />
                        <button
                          onClick={() => { signOut(); setUserMenuOpen(false); }}
                          className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-500 transition-colors"
                          onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--color-surface)')}
                          onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                        >
                          <LogOut className="w-4 h-4" /> Sign Out
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <Button size="sm" onClick={() => setAuthOpen(true)}>
                  Sign In
                </Button>
              )}

              {/* Mobile menu button */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="md:hidden w-9 h-9 rounded-lg flex items-center justify-center transition-colors"
                style={{ color: 'var(--color-text-3)', background: 'var(--color-surface)' }}
              >
                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden overflow-hidden border-t"
              style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg-soft)' }}
            >
              <div className="px-4 py-3 space-y-1">
                {navLinks.map((link) => (
                  <button
                    key={link.id}
                    onClick={() => handleNav(link.id)}
                    className="block w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-colors"
                    style={{
                      color: currentPage === link.id ? 'var(--color-primary)' : 'var(--color-text-2)',
                      background: currentPage === link.id ? 'var(--color-surface)' : 'transparent',
                    }}
                  >
                    {link.label}
                  </button>
                ))}
                {user && (
                  <button
                    onClick={() => handleNav('bookings')}
                    className="block w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-colors"
                    style={{ color: 'var(--color-text-2)' }}
                  >
                    My Bookings
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Auth Modal */}
      <Modal isOpen={authOpen} onClose={() => setAuthOpen(false)}>
        <AuthModal onClose={() => setAuthOpen(false)} />
      </Modal>
    </>
  );
}