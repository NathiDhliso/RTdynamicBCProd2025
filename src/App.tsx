import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { motion } from 'framer-motion';
import Header from '@/components/Header';
import HomePage from '@/pages/HomePage';
import AboutPage from '@/pages/AboutPage';
import ServicesPage from '@/pages/ServicesPage';
import ContactPage from '@/pages/ContactPage';
import QuestionnairePage from '@/pages/QuestionnairePage';
import DebugPanel from '@/components/DebugPanel';
import { pageTransition } from '@/lib/animations';

function App() {
  return (
    <Router>
      <div className="min-h-screen">
        <Header />
        <Routes>
          <Route path="/" element={
            <motion.div {...pageTransition}>
              <HomePage />
            </motion.div>
          } />
          <Route path="/about" element={
            <motion.div {...pageTransition}>
              <AboutPage />
            </motion.div>
          } />
          <Route path="/services" element={
            <motion.div {...pageTransition}>
              <ServicesPage />
            </motion.div>
          } />
          <Route path="/contact" element={
            <motion.div {...pageTransition}>
              <ContactPage />
            </motion.div>
          } />
          <Route path="/questionnaire" element={
            <motion.div {...pageTransition}>
              <QuestionnairePage />
            </motion.div>
          } />
        </Routes>
        {(import.meta.env.DEV || import.meta.env.VITE_SHOW_DEBUG_PANEL === 'true') && <DebugPanel />}
      </div>
    </Router>
  );
}

export default App;