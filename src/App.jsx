import { useState } from 'react';
import './App.css';
import DocumentWindow from './components/DocumentWindow/DocumentWindow';
import StyleToolbar from './components/StyleToolbar/StyleToolbar';
import VirtualKeyboard from './components/VirtualKeyboard/VirtualKeyboard';
import FileManager from './components/FileManager/FileManager';
import LoginScreen from './components/LoginScreen/LoginScreen';

function App() {
  // --- ניהול משתמש ומיקוד ---
  // שם המשתמש הנוכחי במערכת (אם ריק - יוצג מסך לוגין)
  const [currentUser, setCurrentUser] = useState(null);
  
  // מתעד האם הפוקוס כעת נמצא על המסמך לעריכה או על שורת החיפוש
  const [focusedInput, setFocusedInput] = useState("document");
  
  // כותב/קורא מהתיבה כאשר נמצאים במצב 'חיפוש'
  const [findText, setFindText] = useState("");

  // קורא באיזה תו אנחנו צופים (כדי לאפשר להחיל עליו בנפרד כלי עיצוב)
  const [selectedCharId, setSelectedCharId] = useState(null);

  // --- יצירת וניהול מסמכים ---
  // פונקציית-עזר ליצירת מסמך חדש ונקי עם רשימת היסטוריה ריקה הניתן לזיהוי ייחודי ללא DB
  const createDoc = (fileName = '', textData = []) => ({
    id: Date.now().toString() + Math.random().toString(), // יצירת ID ייחודי
    textData, // מערך של תווים - כל תו הוא אובייקט עם שדה סגנון (font, size, color)
    history: [], // היסטוריית מצבים מתועדת של textData המאפשר לשחזר (Undo)
    fileName
  });

  // החזקת הרשימה המרכזית (מערך האובייקטים) של המסמכים הפתוחים כרגע בזיכרון המערכת
  const [documents, setDocuments] = useState(() => [createDoc()]);
  
  // מחזיק את ה-ID של הלשונית הפעילה (המסמך שכרגע בפוקוס, כלומר פתוח על המסך)
  const [activeDocId, setActiveDocId] = useState(documents[0]?.id || null);
  
  // שומר את האובייקט של מסמך שנמצא בתהליך 'סגירה' לפני שמירתו הסופית (בחלון מודאלי)
  const [docToClose, setDocToClose] = useState(null);

  // טריק כדי להכריח את מנהל הקבצים (FileManager) לבנות (לרנדר) את עצמו מחדש עם הרשימה המעודכנת
  const [fileManagerKey, setFileManagerKey] = useState(0);
  
  // מסך התראה פופ-אפ להזנת שם קובץ חדש אם סוגרים מסכת ללא שם שעבר שינויים
  const [fileNamePrompt, setFileNamePrompt] = useState(false);
  const [tempFileName, setTempFileName] = useState("document");
  
  // ממשק חלונות קופצים להתראה כללית (יכול להציג שגיאות או הודעות הצלחה)
  const [appAlert, setAppAlert] = useState(null);

  // --- ניהול עיצוב ועריכת טקסט ---
  // כברירת מחדל סרגל הכלים והתו שנכתוב יהיה בעל צבע שחור,בגודל של 16 ובפונט דיפולטי של המערכת
  const [currentStyle, setCurrentStyle] = useState({
    color: '#000000',
    fontSize: '16px',
    fontFamily: 'system-ui, -apple-system, sans-serif'
  });

  // שליפת המסמך ה"חי" והפעיל כרגע באמצעות ה-activeDocId מתוך מערך המסמכים הכללי
  const activeDoc = documents.find(d => d.id === activeDocId);

  // פונקציה לבחירת תו בודד במסמך שמחיל עליו מניפולציה מהירה
  const handleSelectChar = (charId) => {
    setSelectedCharId(charId);
    if (charId && activeDoc) {
      // אם בחרנו תו, עלינו לעדכן את סרגל העיצוב כך שיציג את התכונות (סגנון) של אותו התו שנבחר
      const charObj = activeDoc.textData.find(c => c.id === charId);
      if (charObj) {
        setCurrentStyle({
          color: charObj.color || '#000000',
          fontSize: charObj.fontSize || '16px',
          fontFamily: charObj.fontFamily || 'system-ui, -apple-system, sans-serif'
        });
      }
    }
  };

  // פונקציה מרכזית למציאת המסמך הפעיל מתוך הרשימה, השמה שלו בסטייט, והחזרתו לאחר העדכון(לפי הפעולה שלחצנו)
  const updateActiveDoc = (updaterFn) => {
    if (!activeDocId) return;
    setDocuments(prevDocs =>
      prevDocs.map(doc => {
        // רצים על כל המסמכים ומי זהה למזהה הפעיל - מפעילים עליו את הפונקציה שמשנה אותו
        if (doc.id === activeDocId) {
          const newDocState = updaterFn(doc);
          return { ...doc, ...newDocState }; // מחליפים את הנתונים הקודמים לחדשים
        }
        return doc;
      })
    );
  };

  // פונקציה שמחזירה למצב הקודם (Undo) על ידי שחזור מרשימת ההסטוריה שנשמרה
  const undo = () => {
    updateActiveDoc(doc => {
      // אם יש לנו זיכרון - שולפים לטקסט את המצב האחרון
      if (doc.history.length > 0) {
        const prevText = doc.history[doc.history.length - 1];
        const newHistory = doc.history.slice(0, -1);
        return { textData: prevText, history: newHistory };
      }
      return {};
    });
  };

  // בכל לחיצה של תו על המקלדת הוירטואלית, התו מוצג על המסך בתוספת מה שהיה קודם על המסך
  // המצב נשמר בהיסטוריה רגע לפני השינוי כדי שיהיה מול מי לשחזר את הצעדים
  const handleKeyPress = (char) => {
    if (selectedCharId) {
      // מצב עריכה שבו בחרנו תו מסוים להחלפה 
      updateActiveDoc(doc => {
        const newHistory = [...doc.history, doc.textData].slice(-10); // שמירת 10 מצבים אחרונים בהיסטוריה
        const newTextData = doc.textData.map(item => {
          if (item.id === selectedCharId) {
            return { ...item, char: char }; // מחליף רק את התו שבחרנו (char) ומשאיר את העיצוב המקורי שלו (id, style)
          }
          return item;
        });
        return { textData: newTextData, history: newHistory };
      });
      setSelectedCharId(null); // מבטל את הבחירה אחרי שהחלפנו את האות
    }
    else if (focusedInput === "find") { 
      // נמצאים במצב חיפוש - הפניית לחיצות המקלדת אל תיבת החיפוש במקום גוף המסמך!
      setFindText(char); 
    }
    else {
      // הקלדה רגילה למסמך הראשי
      updateActiveDoc(doc => {
        const newHistory = [...doc.history, doc.textData].slice(-10);
        // יצירת אובייקט חדש לתו, כולל כל הסטייל שהגדרנו למעלה בסרגל
        const newTextData = [...doc.textData, {
          id: Date.now().toString() + Math.random().toString(),
          char,
          ...currentStyle
        }];
        return { textData: newTextData, history: newHistory };
      });
    }
  };

  // פונקציה למחיקת תו בודד מהמסמך:שומרים מצב בהסטוריה ואז מוחקים תו (את האחרון) ממערך התווים
  const handleDelete = () => {
    updateActiveDoc(doc => ({
      history: [...doc.history, doc.textData].slice(-10),
      textData: doc.textData.slice(0, -1)
    }));
  };

  // פונקציה למחיקת כל תכולת המסמך שלם על ידי היפוך (איפוס) של מערך התווים
  const handleDeleteAll = () => {
    updateActiveDoc(doc => ({
      history: [...doc.history, doc.textData].slice(-10),
      textData: []
    }));
  };

  // פונקציה למחיקת המילה האחרונה בשלמותה 
  const handleDeleteWord = () => {
    updateActiveDoc(doc => {
      if (doc.textData.length === 0) return {};//אין מה למחוק, המסמך ריק
      let i = doc.textData.length - 1;
      while (i >= 0 && doc.textData[i].char === ' ') i--; // ניקוי רווחים מיותרים בסוף (מתעלם מהם במחיקה)
      while (i >= 0 && doc.textData[i].char !== ' ') i--; // כל עוד אנחנו נמצאים על אותיות אמיתיות ולא הגענו לרווח
      return {
        history: [...doc.history, doc.textData].slice(-10),
        textData: doc.textData.slice(0, i + 1)// מחזיר את המסמך נטול המילה האחרונה שחתכנו
      };
    });
  };

  // פונקציה שמשנה את צבע / פונט / גודל נוכחי בזיכרון של סרגל הכלים
  const handleStyleChange = (name, value) => {
    setCurrentStyle(prev => ({ ...prev, [name]: value }));

    // וגם, אם כבר בחרנו תו קיים מהמסמך לחלוטין ולחצנו על הצבע וכו', העיצוב יחול באופן דינאמי ומידי:
    if (selectedCharId) {
      updateActiveDoc(doc => {
        const newHistory = [...doc.history, doc.textData].slice(-10);
        const newTextData = doc.textData.map(item => {
          if (item.id === selectedCharId) {
            return { ...item, [name]: value }; // עדכון של תכונת העיצוב הספציפית דרך שם אירוע דינאמי ללא איבוד כל הסגנון הקודם
          }
          return item;
        });
        return { textData: newTextData, history: newHistory };
      });
    }
  };

  // פונקציה שמכילה את העיצוב הנוכחי על כל המסמך הפעיל - דריסה של שלל האפשרויות על הלקוח כולו
  const handleApplyAll = () => {
    updateActiveDoc(doc => ({
      history: [...doc.history, doc.textData].slice(-10),
      textData: doc.textData.map(item => ({ ...item, ...currentStyle }))
    }));
  };

  // פונקציה ליצירת מסמך חדש שמופעלת ממנהל הקבצים או תפריט למעלה
  const handleNewDocument = () => {
    const newDoc = createDoc();
    setDocuments(prev => [...prev, newDoc]);//שמים את המסמך החדש בסוף המערך של המסמכים הפתוחים בתור 'לשונית'
    setActiveDocId(newDoc.id);// מפנים את הפוקוס (מקלידים שם כרגע) על ידי מעבר ID אליו
  };

  // פונקציה לפתיחת מסמך קיים לפי השם שלו - מהלוקאל לתוך לשונית במערכת
  const handleFileOpened = (fileName, data) => {
    const newDoc = createDoc(fileName, data);
    setDocuments(prev => [...prev, newDoc]);
    setActiveDocId(newDoc.id);
  };

  // פונקציה לסגירת לשונית מסמך
  const handleDocumentClose = (docToRemove) => {
    if (!docToRemove || !docToRemove.id) return;
    
    // אם יש טקסט במסמך הפתוח שעשוי להיות לא שמור, נחשף פופ-אפ אזהרה לשמירה טרם סגירה
    if (docToRemove.textData && docToRemove.textData.length > 0) {
      setDocToClose(docToRemove);
      return;
    }
    
    // סגירה נקייה אם ריק
    performClose(docToRemove.id);
  };

  // ביצוע סגירת מסמך לאחר היציאה הסופית
  const performClose = (docId) => {
    setDocToClose(null);
    setDocuments(prevDocs => {
      // מסננים החוצה את המסמך שנסגר מכלל הרשימה
      const remaining = prevDocs.filter(d => d.id !== docId);
      
      // אם סגרנו את המסמך שהיינו עליו, נחזיר את הפוקוס למסמך האחרון (הימני ביותר)
      if (activeDocId === docId) {
        const nextId = remaining.length > 0 ? remaining[remaining.length - 1].id : null;
        setActiveDocId(nextId);
      }
      return remaining;
    });
  };

  // פונקציה נלווית שמאשרת שמירה+סגירה מחלון אזהרת סגירה. פותחת חלון הזנת שם אם למסמך אין כלל שם מסודר.
  const handleSaveAndClose = () => {
    if (!docToClose) return;

    let nameToSave = docToClose.fileName;
    if (!nameToSave) {
      setTempFileName("document"); 
      setFileNamePrompt(true); // הצג חלון שם מילואי
      return; 
    }

    executeSaveAndClose(nameToSave);
  };

  // פונקציה פרטית של מערכת השמירה שמשלבת בין עדכון רשימות LocalStorage פנימי לשמירת המידע בפועל
  const saveToLocalStorage = (fileName, data) => {
    localStorage.setItem(`editor_file_${currentUser}_${fileName}`, JSON.stringify(data));
    try {
      const filesJson = localStorage.getItem(`editor_files_${currentUser}`);
      let updatedFiles = filesJson ? JSON.parse(filesJson) : [];
      if (!updatedFiles.includes(fileName)) {
        updatedFiles.push(fileName);
        localStorage.setItem(`editor_files_${currentUser}`, JSON.stringify(updatedFiles));
      }
    } catch (e) {
      console.error("Failed to update file list", e);
    }
  };

  // כתיבה ממשית לשלבים והנחת החורבות
  const executeSaveAndClose = (nameToSave) => {
    if (!nameToSave || nameToSave.trim() === "") return;
    const finalName = nameToSave.trim();

    saveToLocalStorage(finalName, docToClose.textData);

    // נכריח את קומפוננטת ניהול הקבצים לקרוא מחדש את השינויים על ידיעדכון ה-Key החיצוני שלה עליו היא בנויה
    setFileManagerKey(prev => prev + 1);

    setAppAlert(`File "${finalName}" saved successfully!`);
    performClose(docToClose.id);
  };

  // פונקציה לשמירת מסמך (כאשר שומרים באופן שגרתי, נשתמש לשם עדכון השם שהמשתמש שם בסרגל המצד במקום "ללא שם")
  const handleDocumentSave = (docId, newFileName) => {
    setDocuments(prev => prev.map(doc => {
      if (doc.id === docId) {
        return { ...doc, fileName: newFileName };
      }
      return doc;
    }));
  };

  // פונקציה להתנתקות מהמערכת - מווסתת את שם המשתמש הנוכחי שבלעדיו הראוט יעבור ל-Login
  const handleLogout = () => {
    setCurrentUser(null);
    const newDoc = createDoc();
    setDocuments([newDoc]);
    setActiveDocId(newDoc.id);
  };

  // רנדור הדף - תנאי בסיסי שמתחיל תמיד במסך לוגין באין משתמש מחובר
  if (!currentUser) {
    return <LoginScreen onLogin={setCurrentUser} />;
  }

  return (
    <div className="app-container">
      {/* הבר במעלה המסך המציג את שם המשתמש וכפתור ההתנתקות המלוטש */}
      <header className="app-header" style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 24px', backgroundColor: '#5799f6', color: 'white' }}>
        <div className="user-info">👤 Logged in as: <strong>{currentUser}</strong></div>
        <button onClick={handleLogout} style={{ background: 'rgba(170, 174, 177, 0.1)', color: 'white', padding: '6px 12px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.2)' }}>
          Logout
        </button>
      </header>

      {/* אזור ניהול הקבצים בשליטה (פתיחה/שמירה/פתיחת חלונית חדש) */}
      {/* שליחת כל הפרמטרים של מנהל הקבצים */}
      <FileManager
        key={fileManagerKey}
        activeDocument={activeDoc}
        onFileOpened={handleFileOpened}
        onNewDocument={handleNewDocument}
        onSaveDocument={handleDocumentSave}
        currentUser={currentUser}
      />
      
      {/* אזור חלוניות המסמכים הפתוחות כרגע וממתינות להקלדה */}
      {/* חלונית המסמך הערוך - כל מסמך מקבל טאב */}
      <div className="documents-container">
        {documents.length === 0 ? (
          <div style={{ margin: 'auto', color: '#9ca3af' }}>No documents open. Create or open one to start.</div>
        ) : (
          documents.map(doc => (
            <DocumentWindow
              key={doc.id}
              document={doc}
              isActive={doc.id === activeDocId}
              onClick={(id) => { setActiveDocId(id); setFocusedInput("document"); }}
              onClose={handleDocumentClose}
              searchTerm={findText}
              selectedCharId={selectedCharId}
              onSelectChar={handleSelectChar}
            />
          ))
        )}
      </div>

      {/* האזור התחתון - פקדי עריכה. מוצג לא פעיל אם כל החלונות סגורים */}
      <div className="editor-controls" style={{ opacity: activeDocId ? 1 : 0.5, pointerEvents: activeDocId ? 'auto' : 'none' }}>
        
        {/* חיפוש - מחזיר תיבת טקסט נפרדת שנוכל ללוות במיקוד של המקלדת אליה */}
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginBottom: '10px' }}>
          <input
            type="text"
            placeholder="🔍 Search..."
            maxLength="1"
            value={findText}
            readOnly //  מונע הקלדה מהמקלדת הפיזית
            onFocus={() => setFocusedInput("find")}
            style={{
              padding: '5px',
              borderRadius: '4px',
              border: focusedInput === "find" ? '2px solid #3b82f6' : '1px solid #ccc',
              cursor: 'pointer',
              textAlign: 'center'
            }}
          />
          <button onClick={() => { setFindText(""); setFocusedInput("document"); }}>X</button>
        </div>
        
        {/* כלי העיצוב - פקדים המשמשים את המשתמש הראשי לבקש עיצוב שמועבר באמצעות props אל currentStyle */}
        <StyleToolbar
          currentStyle={currentStyle}
          onStyleChange={handleStyleChange}
          onApplyAll={handleApplyAll}
          onUndo={undo}
          canUndo={activeDoc?.history?.length > 0} // מאפשר לבטל רק אם ההיסטוריה לא ריקה
        />
        
        {/* המקלדת הוירטואלית שעושה שימוש בפונקציות המחיקה וההקלדה שהוגדרו כאן */}
        <VirtualKeyboard
          onKeyPress={handleKeyPress}
          onDelete={handleDelete}
          onDeleteWord={handleDeleteWord}
          onDeleteAll={handleDeleteAll}
        />
      </div>

      {/* ------ חלוניות מודאליות - מופיעות למעלה כהתראה מעל שאר הלוגיקה ------ */}
      
      {/* פופ אפ ששואל אם לשמור לפני סגירה של קובץ עם תוכן */}
      {docToClose && !fileNamePrompt && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Save Changes?</h3>
            <p>Do you want to save "{docToClose.fileName || 'Untitled Document'}" before closing?</p>
            <div className="modal-buttons">
              <button className="modal-btn modal-btn-save" onClick={handleSaveAndClose}>Save & Close</button>
              <button className="modal-btn modal-btn-close" onClick={() => performClose(docToClose.id)}>Close Without Saving</button>
              <button className="modal-btn modal-btn-cancel" onClick={() => setDocToClose(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* פופ אפ שמאפשר לתת שם לקובץ שעדיין אין לו שם מוגדר כשמבקשים לשמור ולסגור */}
      {fileNamePrompt && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Enter File Name</h3>
            <input 
               type="text" 
               value={tempFileName} 
               onChange={(e) => setTempFileName(e.target.value)}
               autoFocus
               style={{ width: '85%', padding: '12px', marginBottom: '20px', borderRadius: '6px', border: '2px solid var(--primary-blue)', fontSize: '18px', outline: 'none', textAlign: 'center', transition: 'border-color 0.2s', boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.1)' }} 
            />
            <div className="modal-buttons">
              <button className="modal-btn modal-btn-save" onClick={() => {
                setFileNamePrompt(false);
                executeSaveAndClose(tempFileName); // שליחה לפונקצייה שהשהינו כדי לשמור
              }}>Save</button>
              <button className="modal-btn modal-btn-cancel" onClick={() => setFileNamePrompt(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* פופ אפ ירוק ויפה המוכיח הצלחה בשמירה ונותן פידבק למשתמש למנוע בלבול */}
      {appAlert && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ padding: '30px' }}>
            <div style={{ fontSize: '48px', margin: '0 auto 15px', color: '#4caf50' }}>✓</div>
            <h3 style={{ color: '#4caf50', fontSize: '24px', margin: '0 0 10px 0' }}>Success</h3>
            <p style={{ fontSize: '16px', color: '#555', marginBottom: '25px' }}>{appAlert}</p>
            <div className="modal-buttons">
              <button className="modal-btn modal-btn-save" style={{ width: '100%' }} onClick={() => setAppAlert(null)}>OK</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default App;
