import { Outlet } from 'react-router-dom';
import Header from '../components/header';
import Navbar from '../components/navbar';
import { Footer } from '../components/footer/Footer';
import './MainLayout.css';
import NetMessage from '../features/pwa/components/netMessage';
import { ReservaFlotante } from '../features/turnero/components/cliente/ReservaFlotante';
import { AuthModal } from '../features/auth/components/AuthModal';

export default function Layout() {
  return (
    <>
      <Header />
      <NetMessage />
      <main className="mainPage">
        <Outlet />
      </main>
      <Footer />
      <Navbar />
      <ReservaFlotante />
      <AuthModal />
    </>
  );
}
