import React from 'react';
import TextDisplay from '../TextDisplay/TextDisplay';
import './DocumentWindow.css';

/**
 * רכיב חלון המסמך (DocumentWindow)
 * מייצג חלונית בודדת של מסמך פתוח. 
 * מציג את כותרת המסמך, כפתור סגירה ואת תוכן המסמך באמצעות רכיב TextDisplay לתוכו נכנס קלט המקלדת.
 */
const DocumentWindow = ({ document, isActive, onClick, onClose, searchTerm, selectedCharId, onSelectChar }) => {
  const { fileName, textData } = document;
  
  // פונקציה לטיפול בלחיצה על סגירת המסמך
  const handleClose = (e) => {
    // מניעת בועת אירועים (Event Bubbling) כדי שלחיצה על כפתור הסגירה לא תעבור גם ללחיצה על החלון עצמו ותבחר אותו
    e.stopPropagation(); 
    // קריאה לפונקציה המועברת מרכיב האב כדי לבצע את סגירת המסמך בפועל
    onClose(document);
  };

  return (
    <div 
      // הוספת קלאס CSS מחלקה 'active' אם זהו המסמך שכרגע במיקוד
      className={`document-window ${isActive ? 'active' : ''}`}
      // לחיצה על המסמך הופכת אותו למסמך הפעיל
      onClick={() => onClick(document.id)}
    >
      <div className="document-header">
        {/* שם המסמך - אם ריק יציג 'Untitled Document' */}
        <span className="document-title">
          {fileName ? fileName : 'Untitled Document'}
        </span>
        <button className="btn-close-doc" onClick={handleClose} title="Close Document">
          ✕
        </button>
      </div>
      <div className="document-body">
        {/* קריאה לרכיב שמציג את רשימת התווים של המסמך */}
        <TextDisplay
         text={textData}
         searchTerm={searchTerm}
         selectedCharId={selectedCharId} 
         onSelectChar={onSelectChar}
         isActive={isActive}
        />
      </div>
    </div>
  );
};

export default DocumentWindow;
