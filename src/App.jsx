import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Welcome from './pages/Welcome';
import Login from './pages/Login';
import Onboarding from './pages/Onboarding';
import FamilyMembers from './pages/FamilyMembers';
import Introduction from './pages/Introduction';
import Home from './pages/Home';
import Meals from './pages/Meals';
import Calendar from './pages/Calendar';
import Profile from './pages/Profile';
import Stock from './pages/Stock';
import Market from './pages/Market';
import MarketList from './pages/MarketList';
import Markets from './pages/Markets';
import Recommendations from './pages/Recommendations';
import Chatbot from './pages/Chatbot'; // Ajout du Chatbot
import { UserProvider } from './pages/UserContext';

function App() {
  return (
    <UserProvider>
      <AnimatePresence mode="wait">
        <Routes>
          <Route path="/" element={<Welcome />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/login" element={<Login />} />
          <Route path="/family-members" element={<FamilyMembers />} />
          <Route path="/introduction" element={<Introduction />} />
          <Route path="/home" element={<Home />} />
          <Route path="/marketlist" element={<MarketList />} />
          <Route path="/meals" element={<Meals />} />
          <Route path="/calendar/:type" element={<Calendar />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/stock" element={<Stock />} />
          <Route path="/market" element={<Market />} />
          <Route path="/marketall" element={<Markets />} />
          <Route path="/market/:city" element={<Market />} />
          <Route path="/recommendations" element={<Recommendations />} />
          <Route path="/chatbot" element={<Chatbot />} /> {/* Nouvelle route pour le Chatbot */}
        </Routes>
      </AnimatePresence>
    </UserProvider>
  );
}

export default App;