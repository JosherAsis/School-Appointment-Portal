import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import BookAppointment from './pages/BookAppointment';
import MyAppointments from './pages/MyAppointments';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Navbar />
        <div className="container">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/book" element={<BookAppointment />} />
            <Route path="/my-appointments" element={<MyAppointments />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;