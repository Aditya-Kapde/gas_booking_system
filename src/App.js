import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import home from './pages/home';
import AuthPage from './pages/AuthPage';


const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<AuthPage />} />
        <Route path="/home" element={<home />} />
      </Routes>
    </Router>
  );
};

export default App;
