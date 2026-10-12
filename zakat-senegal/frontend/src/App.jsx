import { Navigate, Route, Routes } from 'react-router-dom';
import PublicLayout from './layouts/PublicLayout.jsx';
import AdminLayout from './layouts/AdminLayout.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import { useAuth } from './context/AuthContext.jsx';
import Home from './pages/Home.jsx';
import Calculator from './pages/Calculator.jsx';
import Donate from './pages/Donate.jsx';
import PaymentSandbox from './pages/PaymentSandbox.jsx';
import DonationResult from './pages/DonationResult.jsx';
import { Login, Register, ForgotPassword, ResetPassword } from './pages/Auth.jsx';
import { AccountHome, MyTransactions, Receipt } from './pages/Account.jsx';
import { AidRequestForm, MyAidRequests } from './pages/AidRequests.jsx';
import { About, Faq, Contact, Transparency, NotFound, Forbidden } from './pages/Static.jsx';
import Dashboard from './pages/admin/Dashboard.jsx';
import AdminAidRequests from './pages/admin/AidRequests.jsx';
import Transactions from './pages/admin/Transactions.jsx';
import Distributions from './pages/admin/Distributions.jsx';
import Users from './pages/admin/Users.jsx';
import Settings from './pages/admin/Settings.jsx';
import Audit from './pages/admin/Audit.jsx';

const FINANCE = ['admin', 'distribution_manager'];

// Page d'accueil de l'espace équipe selon le rôle.
function AdminHome() {
  const { user } = useAuth();
  if (user.role === 'agent') return <Navigate to="/admin/demandes" replace />;
  return <Dashboard />;
}

export default function App() {
  const guard = (el, roles) => <ProtectedRoute roles={roles}>{el}</ProtectedRoute>;
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route index element={<Home />} />
        <Route path="a-propos" element={<About />} />
        <Route path="faq" element={<Faq />} />
        <Route path="contact" element={<Contact />} />
        <Route path="transparence" element={<Transparency />} />
        <Route path="calculateur" element={<Calculator />} />
        <Route path="connexion" element={<Login />} />
        <Route path="inscription" element={<Register />} />
        <Route path="mot-de-passe-oublie" element={<ForgotPassword />} />
        <Route path="reinitialiser-mot-de-passe" element={<ResetPassword />} />

        <Route path="don" element={guard(<Donate />)} />
        <Route path="paiement/sandbox/:reference" element={guard(<PaymentSandbox />)} />
        <Route path="don/confirmation/:reference" element={guard(<DonationResult />)} />
        <Route path="demande-aide" element={guard(<AidRequestForm />)} />
        <Route path="compte" element={guard(<AccountHome />)} />
        <Route path="compte/dons" element={guard(<MyTransactions />)} />
        <Route path="compte/recu/:reference" element={guard(<Receipt />)} />
        <Route path="compte/demandes" element={guard(<MyAidRequests />)} />
        <Route path="acces-refuse" element={<Forbidden />} />
        <Route path="*" element={<NotFound />} />
      </Route>

      <Route path="admin" element={guard(<AdminLayout />, ['agent', 'distribution_manager', 'admin'])}>
        <Route index element={<AdminHome />} />
        <Route path="demandes" element={guard(<AdminAidRequests />, ['agent', ...FINANCE])} />
        <Route path="paiements" element={guard(<Transactions />, FINANCE)} />
        <Route path="distributions" element={guard(<Distributions />, FINANCE)} />
        <Route path="utilisateurs" element={guard(<Users />, ['admin'])} />
        <Route path="parametres" element={guard(<Settings />, ['admin'])} />
        <Route path="audit" element={guard(<Audit />, [])} />
      </Route>
    </Routes>
  );
}
