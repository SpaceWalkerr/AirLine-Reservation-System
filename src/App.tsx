import { useState, lazy, Suspense } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import ErrorBoundary from './components/ErrorBoundary';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Lazy-loaded pages for code splitting
const HomePage = lazy(() => import('./pages/HomePage'));
const FlightSearchPage = lazy(() => import('./pages/FlightSearchPage'));
const SeatSelectionPage = lazy(() => import('./pages/SeatSelectionPage'));
const BookingPage = lazy(() => import('./pages/BookingPage'));
const ConfirmationPage = lazy(() => import('./pages/ConfirmationPage'));
const AircraftPage = lazy(() => import('./pages/AircraftPage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const MyBookingsPage = lazy(() => import('./pages/MyBookingsPage'));
const PaymentPage = lazy(() => import('./pages/PaymentPage'));

type Page = 'home' | 'flights' | 'seatSelection' | 'booking' | 'payment' | 'confirmation' | 'aircraft' | 'about' | 'bookings';

function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="spinner w-8 h-8 mx-auto mb-4" />
        <p className="text-sm" style={{ color: 'var(--color-text-4)' }}>Loading...</p>
      </div>
    </div>
  );
}

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [pageData, setPageData] = useState<any>(null);

  const handleNavigate = (page: string, data?: any) => {
    setCurrentPage(page as Page);
    setPageData(data);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage onNavigate={handleNavigate} />;
      case 'flights':
        return <FlightSearchPage searchParams={pageData} onNavigate={handleNavigate} />;
      case 'seatSelection':
        return <SeatSelectionPage bookingData={pageData} onNavigate={handleNavigate} />;
      case 'booking':
        return <BookingPage bookingData={pageData} onNavigate={handleNavigate} />;
      case 'payment':
        return (
          <PaymentPage
            bookingData={pageData}
            onSuccess={() => handleNavigate('confirmation', pageData)}
            onCancel={() => handleNavigate('home')}
          />
        );
      case 'confirmation':
        return <ConfirmationPage confirmationData={pageData} onNavigate={handleNavigate} />;
      case 'aircraft':
        return <AircraftPage />;
      case 'about':
        return <AboutPage />;
      case 'bookings':
        return <MyBookingsPage onNavigate={handleNavigate} />;
      default:
        return <HomePage onNavigate={handleNavigate} />;
    }
  };

  return (
    <ThemeProvider>
      <AuthProvider>
        <ErrorBoundary>
          <div className="min-h-screen flex flex-col relative">
            {/* Animated background mesh */}
            <div className="bg-mesh" />

            <Navbar currentPage={currentPage} onNavigate={handleNavigate} />
            <main className="flex-1 relative z-10">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentPage}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                >
                  <Suspense fallback={<PageLoader />}>
                    {renderPage()}
                  </Suspense>
                </motion.div>
              </AnimatePresence>
            </main>
            <Footer onNavigate={handleNavigate} />
          </div>
        </ErrorBoundary>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
