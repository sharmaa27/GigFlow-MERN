import { Routes, Route } from 'react-router-dom';
import axios from 'axios';
import { Toaster } from 'react-hot-toast';

import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import GigDetails from './pages/GigDetails';
import CreateGig from './pages/CreateGig'; 
import Navbar from './components/Navbar';
import { AuthProvider } from './context/AuthContext';

axios.defaults.withCredentials = true;
axios.defaults.baseURL = 'http://localhost:4000';

function App() {
  return (
    <AuthProvider>
      <Navbar />
      <Toaster position="top-center" />
      
      <Routes>
        {/* THIS IS THE MISSING ROUTE CAUSING YOUR ERROR */}
        <Route path="/" element={<Dashboard />} /> 

        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/create-gig" element={<CreateGig />} />
        <Route path="/gigs/:id" element={<GigDetails />} />
        
        {/* specific catch-all for debugging */}
        <Route path="*" element={<div className="p-10">404 - Page Not Found</div>} />
      </Routes>
    </AuthProvider>
  );
}

export default App;