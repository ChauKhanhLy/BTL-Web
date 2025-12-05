import React, { useState } from 'react';
import LoginForm from './LoginForm';
import Home from "./pages/Home";
import ProfilePage from './pages/ProfilePage';

function App() {
  // Simple state to toggle pages for testing
  const [currentPage, setCurrentPage] = useState('home');

  return (
    <div className="App">
      {/* Temporary Navigation Buttons for Testing */}
      <div style={{ position: 'fixed', bottom: 10, right: 10, zIndex: 9999, display: 'flex', gap: '10px' }}>
        <button 
          onClick={() => setCurrentPage('home')}
          style={{ padding: '10px', background: 'gray', color: 'white' }}
        >
          Go to Home
        </button>
        <button 
          onClick={() => setCurrentPage('profile')}
          style={{ padding: '10px', background: 'blue', color: 'white' }}
        >
          Go to Profile
        </button>
      </div>

      {/* Conditional Rendering */}
      {currentPage === 'home' && <Home />}
      {currentPage === 'profile' && <ProfilePage />}
    </div>
  );
}

export default App;