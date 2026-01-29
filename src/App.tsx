import { useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import FlightSearchPage from './pages/FlightSearchPage';
import BookingPage from './pages/BookingPage';
import ConfirmationPage from './pages/ConfirmationPage';
import AircraftPage from './pages/AircraftPage';
import AboutPage from './pages/AboutPage';
import MyBookingsPage from './pages/MyBookingsPage';

type Page = 'home' | 'flights' | 'booking' | 'confirmation' | 'aircraft' | 'about' | 'bookings';

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
      case 'booking':
        return <BookingPage bookingData={pageData} onNavigate={handleNavigate} />;
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
    <AuthProvider>
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar currentPage={currentPage} onNavigate={handleNavigate} />
        <main className="flex-1">
          {renderPage()}
        </main>
        <Footer />
      </div>
    </AuthProvider>
  );
}

export default App;
