import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';
import PwaBanner from '../components/PwaBanner.jsx';

export default function PublicLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <PwaBanner />
      <Navbar />
      <main className="flex-1"><Outlet /></main>
      <Footer />
    </div>
  );
}
