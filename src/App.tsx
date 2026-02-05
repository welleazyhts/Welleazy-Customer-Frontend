import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import './App.css';

// Context
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppProvider } from './context/AppContext';

// Components
import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';
import AIChatbot from './components/AIChatbot/AIChatbot';
import LoadingSpinner from './components/LoadingSpinner/LoadingSpinner';

// Pages
import Login from './pages/login/login';
import Home from './pages/Home/Home';
import Services from './pages/Services/Services';
import Consultation from './pages/Consultation/Consultation';
import DoctorListing from './pages/DoctorListing/DoctorListing';
import LabTests from './pages/Services/LabTests';
import AppointmentPage from './pages/Services/AppointmentPage';
import HealthRecords from './pages/HealthRecords/HealthRecords';
import Pharmacy from './pages/Pharmacy/Pharmacy';
import PharmacyCart from './pages/Pharmacy/PharmacyCart';
import PharmacyUpload from './pages/Pharmacy/PharmacyUpload';
import HealthAssessment from './pages/HealthAssessment/HealthAssessment';
import MedicineReminder from './pages/MedicineReminder/MedicineReminder';
import GymServices from './pages/GymServices/GymServices';
import GymVocher from './pages/GymServices/GymVocher';
import EyeCareDentalCare from './pages/EyeCareDentalCare/EyeCareDentalCare';
import EyeCareVocher from './pages/EyeCareDentalCare/EyeCareVocher';
import HomeElderlyCare from './pages/HomeElderlyCare/HomeElderlyCare';
import InsuranceRecords from './pages/InsuranceRecords/InsuranceRecords';
import InsuranceRecord from './pages/InsuranceRecords/InsuranceRecord';
import ViewDocuments from './pages/InsuranceRecords/ViewDocuments';
import MyBookings from './pages/MyBookings/MyBookings';
import HealthAssessmentDocument from './pages/HealthAssessment/HealthAssessmentDocument';
import PharmacyOfflineMedicine from './pages/Pharmacy/PharmacyOfflineMedicine';
import PharmacyCouponSuccess from './pages/Pharmacy/PharmacyCouponSuccess';
import ProductDetails  from './pages/Pharmacy/ProductDetails ';
import DiagnosticCenters from  './pages/Services/DiagnosticCenters';
import DiagnosticCart from './pages/Services/DiagnosticCart';
import ManageProfile from './pages/Profile/ManageProfile';
import Dependants from './pages/Profile/Dependants';
import AddressBook from './pages/Profile/AddressBook';
import CheckOut from './pages/CheckOut/CheckOut';
import CommonCartDcAndConsultation from './pages/CheckOut/CommonCartDcAndConsultation';
import AppointmentVoucher from "./pages/Consultation/AppointmentVoucher";
import TermsAndConditions from './pages/terms/TermsofService';
import PrivacyPolicy from './pages/terms/PrivacyPolicy';
import Welcome from './pages/Welcome/Welcome';
// Protected Route
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <LoadingSpinner />;
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

// Public Route
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <LoadingSpinner />;
  return !isAuthenticated ? <>{children}</> : <Navigate to="/" />;
};

// Add this new route component
const ProfileCompletionRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, loading, needsProfileCompletion } = useAuth();
  if (loading) return <LoadingSpinner />;
  if (!isAuthenticated) return <Navigate to="/login" />;  
  if (needsProfileCompletion) return <Navigate to="/welcome" />;
  
  return <>{children}</>;
};


const AppContent: React.FC = () => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <LoadingSpinner />;

  return (
    <div className="App">
      {isAuthenticated && <Header />}
      <main className="main-content">
        <Routes>
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />

          <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} /> 
          
          <Route path="/services" element={<ProtectedRoute><Services /></ProtectedRoute>} />
          <Route path="/consultation" element={<ProtectedRoute><Consultation /></ProtectedRoute>} />
          <Route path="/doctors" element={<ProtectedRoute><DoctorListing /></ProtectedRoute>} />
          <Route path="/lab-test" element={<ProtectedRoute><LabTests /></ProtectedRoute>} />
          <Route path="/appointment-cart" element={<ProtectedRoute><AppointmentPage /></ProtectedRoute>} />
          <Route path="/health-records" element={<ProtectedRoute><HealthRecords /></ProtectedRoute>} />
          <Route path="/insurance-record" element={<ProtectedRoute><InsuranceRecords /></ProtectedRoute>} />
          <Route path="/insurance-records/add" element={<ProtectedRoute><InsuranceRecord /></ProtectedRoute>} />
          <Route path="/insurance-records/view-documents" element={<ProtectedRoute><ViewDocuments /></ProtectedRoute>} />
          <Route path="/pharmacy" element={<ProtectedRoute><Pharmacy /></ProtectedRoute>} />
          <Route path="/pharmacy/cart" element={<ProtectedRoute><PharmacyCart /></ProtectedRoute>} />
          <Route path="/upload-prescription" element={<ProtectedRoute><PharmacyUpload /></ProtectedRoute>} />
          <Route path="/health-assessment" element={<ProtectedRoute><HealthAssessment /></ProtectedRoute>} />
          <Route path="/medicinereminder" element={<ProtectedRoute><MedicineReminder /></ProtectedRoute>} />
          <Route path="/gymservices" element={<ProtectedRoute><GymServices /></ProtectedRoute>} />
          <Route path="/eyecare-dentalcare" element={<ProtectedRoute><EyeCareDentalCare /></ProtectedRoute>} />
          <Route path="/home-elderly-care" element={<ProtectedRoute><HomeElderlyCare /></ProtectedRoute>} />
          <Route path="/my-bookings" element={<ProtectedRoute><MyBookings /></ProtectedRoute>} />
          <Route path="/gym-voucher" element={<GymVocher />} />
          <Route path='/Eye-voucher' element={<EyeCareVocher/>}/>
        <Route path="/health-assessment/document" element={<HealthAssessmentDocument />} />
         <Route path="/pharmacy/offline-medicine" element={< PharmacyOfflineMedicine/>} />
             <Route path="/pharmacy/coupon-success" element={< PharmacyCouponSuccess/>} />
             <Route path="/pharmacy/product" element={<ProductDetails />} />

        <Route path="/diagnostic-centers" element={< DiagnosticCenters/>} />
 <Route path="/diagnostic-cart" element={< DiagnosticCart/>} />
  <Route path="/MangeProfile" element={< ManageProfile/>} />
  <Route path="/dependants" element={<Dependants />} />
   <Route path="/my-address" element={<AddressBook />} />
    <Route path="/CheckOut" element={<CheckOut />} />
    <Route path="/CommonCartDcAndConsultation" element={<CommonCartDcAndConsultation />} />
    <Route path="/appointment-voucher" element={<AppointmentVoucher />} />
    <Route path="/terms-and-conditions" element={<TermsAndConditions />} />
    <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/welcome" element={<ProtectedRoute><Welcome /></ProtectedRoute>} />




          <Route path="*" element={<Navigate to={isAuthenticated ? "/" : "/login"} />} />
        </Routes>
      </main>
      {isAuthenticated && <Footer />}
      {isAuthenticated && <AIChatbot />}
    </div>
  );
};

const AppProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AuthProvider>
    <AppProvider>{children}</AppProvider>
  </AuthProvider>
);

const App: React.FC = () => {
  return (
    <AppProviders>
      <Router>
        <AppContent />
        <ToastContainer
          
          autoClose={2000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          pauseOnHover
          draggable
        />
      </Router>
    </AppProviders>
  );
};

export default App;
