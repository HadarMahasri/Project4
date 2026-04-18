import React, { useState } from 'react';
import './FileManager.css';

/**
 * רכיב מנהל הקבצים (FileManager)
 * אחראי על הצגת הקבצים השמורים, שמירת קובץ נוכחי, טעינת קובץ קיים ויצירת מסמך חדש.
 * מנהל את הרשימה מול ה-LocalStorage.
 */
const FileManager = ({ activeDocument, onFileOpened, onNewDocument, onSaveDocument, currentUser }) => {
  // סטייט להצגת התראות בממשק של מנהל הקבצים (הצלחה/שגיאה)
  const [fmAlert, setFmAlert] = useState(null);

  // טעינה ראשונית של רשימת הקבצים השמורים עבור המשתמש הנוכחי מתוך ה-LocalStorage
  const [savedFiles, setSavedFiles] = useState(() => {
    if (!currentUser) return [];
    try {
      const filesJson = localStorage.getItem(`editor_files_${currentUser}`);
      return filesJson ? JSON.parse(filesJson) : [];
    } catch {
      return [];
    }
  });

  // החזקת מצב לשם הקובץ שאותו עורכים עכשיו בתיבת הטקסט
  const [fileNameInput, setFileNameInput] = useState('');

  // החזקת שם הקובץ שנבחר מתוך רשימת הגלילה (Dropdown)
  const [selectedFile, setSelectedFile] = useState('');

  // מעקב אחרי המסמך האחרון שהיה פעיל כדי לעדכן את תיבת הטקסט בהתאם כשעוברים מסמך
  const [prevActiveId, setPrevActiveId] = useState('');

  // סנכרון תיבת שם הקובץ כאשר משתנה המסמך הפעיל - גישה זו עוקפת את הצורך ב-useEffect
  if (activeDocument?.id && activeDocument.id !== prevActiveId) {
    setPrevActiveId(activeDocument.id);
    setFileNameInput(activeDocument.fileName || '');
  } else if (!activeDocument && prevActiveId !== '') {
    setPrevActiveId('');
    setFileNameInput('');
  }

  // פונקציה לטיפול בלחיצה על 'שמור' ממנהל הקבצים
  const handleSave = () => {
    if (!activeDocument || !fileNameInput.trim() || !currentUser) return;

    const name = fileNameInput.trim();
    // שמירת תוכן הטקסט ב-LocalStorage תחת מפתח ייחודי למשתמש ושם הקובץ
    localStorage.setItem(`editor_file_${currentUser}_${name}`, JSON.stringify(activeDocument.textData));

    // עדכון הרשימה המרכזית של שמות הקבצים אם מדובר בקובץ חדש
    let updatedFiles = [...savedFiles];
    if (!updatedFiles.includes(name)) {
      updatedFiles.push(name);
      localStorage.setItem(`editor_files_${currentUser}`, JSON.stringify(updatedFiles));
      // עדכון הסטייט המקומי כך שהתפריט הנגלל יכיל את הקובץ שיצרנו
      setSavedFiles(updatedFiles);
    }

    // קריאה לפונקציה מרכיב האב (App) כדי לעדכן את שם הקובץ במבנה הנתונים הראשי של המסמך
    onSaveDocument(activeDocument.id, name);
    // הקפצת הודעת הצלחה
    setFmAlert({ message: `File "${name}" saved successfully!`, isError: false });
  };

  // פונקציה לטיפול בלחיצה על 'פתח' (טעינת קובץ)
  const handleLoad = () => {
    if (!selectedFile || !currentUser) return;

    // שליפת הנתונים של הקובץ הנבחר מתוך ה-LocalStorage
    const dataJson = localStorage.getItem(`editor_file_${currentUser}_${selectedFile}`);
    if (dataJson) {
      try {
        const data = JSON.parse(dataJson);
        // שליחת הנתונים ל-App כדי לייצר לפתוח חלון מסמך עם התוכן
        onFileOpened(selectedFile, data);
        setSelectedFile(''); // איפוס הבחירה כדי למנוע טעינה חוזרת בטעות
      } catch (e) {
        console.error("Failed to load file", e);
        setFmAlert({ message: "Corrupted file.", isError: true });
      }
    }
  };

  // בדיקה האם יש מסמך פעיל כרגע - משמש להשבתת/אפשור של כפתורים
  const hasActive = !!activeDocument;

  return (
    <div className="file-manager">
      <div className="file-group">
        <span className="file-manager-title">📁 File Manager</span>
        <button className="btn-load" style={{ padding: '6px 12px', fontSize: '12px' }} onClick={onNewDocument}>
          ➕ New Document
        </button>
      </div>

      {/* אזור המיועד לשמירת מסמך חדש/ערוך, הופך שקוף חלקית אם אין מסמך פעיל */}
      <div className="file-group" style={{ opacity: hasActive ? 1 : 0.5 }}>
        <input
          type="text"
          className="file-input"
          placeholder="Enter file name..."
          value={fileNameInput}
          onChange={(e) => setFileNameInput(e.target.value)}
          disabled={!hasActive}
        />
        <button
          className="btn-save"
          onClick={handleSave}
          disabled={!hasActive || !fileNameInput.trim()}
        >
          💾 Save
        </button>
      </div>

      {/* אזור טעינת מסמך קיים מתוך הרשימה */}
      <div className="file-group">
        <select
          className="file-select"
          value={selectedFile}
          onChange={(e) => setSelectedFile(e.target.value)}
        >
          <option value="" disabled>Choose file to open...</option>
          {savedFiles.map(file => (
            <option key={file} value={file}>{file}</option>
          ))}
        </select>
        <button
          className="btn-load"
          onClick={handleLoad}
          disabled={!selectedFile}
        >
          📂 Open
        </button>
      </div>

      {/* הודעת פופ-אפ (מודאל) להצגת ההתראה */}
      {fmAlert && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ padding: '30px' }}>
            <div style={{ fontSize: '48px', margin: '0 auto 15px', color: fmAlert.isError ? '#f44336' : '#4caf50' }}>
              {fmAlert.isError ? '✖' : '✓'}
            </div>
            <h3 style={{ color: fmAlert.isError ? '#f44336' : '#4caf50', fontSize: '24px', margin: '0 0 10px 0' }}>
              {fmAlert.isError ? 'Error' : 'Success'}
            </h3>
            <p style={{ fontSize: '16px', color: '#555', marginBottom: '25px' }}>{fmAlert.message}</p>
            <div className="modal-buttons">
              <button
                className="modal-btn modal-btn-save"
                style={{ width: '100%', backgroundColor: fmAlert.isError ? '#f44336' : 'var(--primary-blue)' }}
                onClick={() => setFmAlert(null)}
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default FileManager;
