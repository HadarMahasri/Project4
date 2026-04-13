import React, { useState } from 'react';
import './LoginScreen.css';

/**
 * מסך ההתחברות (LoginScreen)
 * מופיע תמיד בתחילת הריצה במידה ושם המשתמש ריק.
 * קולט את שם המשתמש ושולח אותו להמשך האפליקציה באמצעות פונקציה חיצונית.
 */
const LoginScreen = ({ onLogin }) => {
  // החזקת שם המשתמש בעת ההקלדה
  const [username, setUsername] = useState('');

  // שליחת הטופס - הפעלת פונקציית לוגין שנשלחה מרכיב האב
  const handleSubmit = (e) => {
    e.preventDefault(); // מניעת רענון אוטומטי של הדף (התנהגות ברירת מחדל של טופס בדפדפן)
    if (username.trim()) {
      onLogin(username.trim()); // מעביר את שם המשתמש נקי מרווחים אל ה-App
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2>Welcome to React Editor</h2>
        <p>Please enter your username to continue to your workspace.</p>
        <form onSubmit={handleSubmit} className="login-form">
          <input 
            type="text" 
            placeholder="Username" 
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            // גורם לתיבת הטקסט להיות מסומנת אוטומטית מיד כשהעמוד עולה כדי להתחיל להקליד
            autoFocus
          />
          {/* הכפתור משותק (disabled) אם השדה ריק או מכיל רק רווחים כדי למנוע כניסות לא תקינות */}
          <button type="submit" disabled={!username.trim()}>
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginScreen;
