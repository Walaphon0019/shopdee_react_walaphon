import './App.css';
import SignIn from './components/SignIn';
import SignUp from './components/SignUp';
import HomePage from './components/HomePage';
import Profile from './components/Profile';
import ProductDetail from './components/ProductDetail';
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './AuthContext';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path='/' element={<Navigate to="/homepage" />} />
          <Route path='/homepage' element={<HomePage />} />
          <Route path='/signin' element={<SignIn />} />
          <Route path='/signup' element={<SignUp />} />
          <Route path='/profile/:id' element={<Profile />} />
          <Route path='/product/:id' element={<ProductDetail />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;