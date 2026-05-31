import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import CartToast from './components/CartToast';
import HermesAssistant from './components/HermesAssistant';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import PerfumeDetails from './pages/PerfumeDetails';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderConfirmation from './pages/OrderConfirmation';
import Profile from './pages/Profile';
import WishlistPage from './pages/WishlistPage';
import AddEditPerfume from './pages/AddEditPerfume';
import CollectionsPage from './pages/CollectionsPage';
import CollectionDetailPage from './pages/CollectionDetailPage';
import EditorDashboard from './pages/EditorDashboard';
import NotFoundPage from './pages/NotFoundPage';

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <CartToast />
      <main>
        <Routes>
          {/* Publice — oricine */}
          <Route path="/" element={<Home />} />
          <Route path="/perfume/:id" element={<PerfumeDetails />} />
          <Route path="/collections" element={<CollectionsPage />} />
          <Route path="/collections/:id" element={<CollectionDetailPage />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />

          {/* Protejate — doar user autentificat */}
          <Route path="/cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
          <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
          <Route path="/order-confirmation/:id" element={<ProtectedRoute><OrderConfirmation /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/wishlist" element={<ProtectedRoute><WishlistPage /></ProtectedRoute>} />

          {/* Protejate — doar editor */}
          <Route path="/editor/dashboard" element={<ProtectedRoute requiredRole="editor"><EditorDashboard /></ProtectedRoute>} />
          <Route path="/editor/add" element={<ProtectedRoute requiredRole="editor"><AddEditPerfume /></ProtectedRoute>} />
          <Route path="/editor/edit/:id" element={<ProtectedRoute requiredRole="editor"><AddEditPerfume /></ProtectedRoute>} />

          {/* 404 */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
      <HermesAssistant />
    </BrowserRouter>
  );
}

export default App;
