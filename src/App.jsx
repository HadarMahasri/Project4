import { useState } from 'react';
import './App.css';
import DocumentWindow from './components/DocumentWindow/DocumentWindow';
import StyleToolbar from './components/StyleToolbar/StyleToolbar';
import VirtualKeyboard from './components/VirtualKeyboard/VirtualKeyboard';
import FileManager from './components/FileManager/FileManager';
import LoginScreen from './components/LoginScreen/LoginScreen';

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [focusedInput, setFocusedInput] = useState("document");
  const [selectedCharId, setSelectedCharId] = useState(null);
  const [findText, setFindText] = useState("");

  const [documents, setDocuments] = useState(() => [{
    id: Date.now().toString() + Math.random().toString(),
    textData: [],
    history: [],
    fileName: ''
  }]);
  const [activeDocId, setActiveDocId] = useState(documents[0].id);

//כברירת מחדל סרגל הכלים והתו שנכתוב יהיה בעל צבע שחור,בגודל של 16 ובפונט דיפולטי

  const [currentStyle, setCurrentStyle] = useState({
    color: '#000000',
    fontSize: '16px',
    fontFamily: 'system-ui, -apple-system, sans-serif'
  });

  const activeDoc = documents.find(d => d.id === activeDocId);

//פונקציה למציאת המסמך הפעיל,והחזרתו לאחר העדכון(לפי הפעולה שלחצנו)

  const updateActiveDoc = (updaterFn) => {
    if (!activeDocId) return;
    setDocuments(prevDocs => 
      prevDocs.map(doc => {
        if (doc.id === activeDocId) {
          const newDocState = updaterFn(doc);
          return { ...doc, ...newDocState };
        }
        return doc;
      })
    );
  };

//פונקציה שמחזירה למצב הקודם על ידי שיחזור ההסטוריה
  const undo = () => {
    updateActiveDoc(doc => {
      if (doc.history.length > 0) {
        const prevText = doc.history[doc.history.length - 1];
        const newHistory = doc.history.slice(0, -1);
        return { textData: prevText, history: newHistory };
      }
      return {};
    });
  };
//בכל לחיצה של תו על המקלדת הוירטואלית,התו מוצג על המסך בתוספת מה שהיה קודם על המסך
//והמצב נשמר בהסטוריה רגע לפני השינוי כדי שיהיה ניתו לחזור אליו אחורה

 
  const handleKeyPress = (char) => {
    if (selectedCharId) {
    updateActiveDoc(doc => {
      console.log(doc);
      const newHistory = [...doc.history, doc.textData].slice(-10);
      const newTextData = doc.textData.map(item => {
        
        if (item.id === selectedCharId) {
          return { ...item, char: char }; //מחליף רק את התו שבחרנו ומשאיר את העיצוב
        }
        return item;
      });
      return { textData: newTextData,history: newHistory };
    });
    setSelectedCharId(null); //מבטל את הבחירה אחרי שהחלפנו
  }
   else if (focusedInput === "find") { //נמצאים במצב חיפוש
    setFindText(char); //כותבים לתיבת החיפוש
  }
   else {//הקלדה רגילה למסמך
    updateActiveDoc(doc => {
      const newHistory = [...doc.history, doc.textData].slice(-10);
      const newTextData = [...doc.textData, {
        id: Date.now().toString() + Math.random().toString(),
        char,
        ...currentStyle
      }];
      return { textData: newTextData, history: newHistory };
    });

    }
  };
//פונקציה למחיקת תו בודד מהמסמך:שומרים מצב בהסטוריה ואז מוחקים תו ממערך התווים
  const handleDelete = () => {
    updateActiveDoc(doc => ({
      history: [...doc.history, doc.textData].slice(-10),
      textData: doc.textData.slice(0, -1)
    }));
  };
//פונקציה למחיקת מסמך שלם על ידי איפוס מערך התווים
  const handleDeleteAll = () => {
    updateActiveDoc(doc => ({
      history: [...doc.history, doc.textData].slice(-10),
      textData: []
    }));
  };

//פונקציה למחיקת מילה
  const handleDeleteWord = () => {
    updateActiveDoc(doc => {
      if (doc.textData.length === 0) return {};//אין מה למחוק
      let i = doc.textData.length - 1;
      while(i >= 0 && doc.textData[i].char === ' ') i--;//ניקוי רווחים מיותרים בסוף
      while(i >= 0 && doc.textData[i].char !== ' ') i--;//כל עוד אנחנו נמצאים על תו ולא הגענו לרווח
      return {
        history: [...doc.history, doc.textData].slice(-10),
        textData: doc.textData.slice(0, i + 1)//מחזיר את המסמך ללא המילה שמחקנו
      };
    });
  };

//פונקציה שמכילה את העיצוב הנוכחי על כל המסמך
  const handleApplyAll = () => {

    updateActiveDoc(doc => ({
      history: [...doc.history, doc.textData].slice(-10),
      textData: doc.textData.map(item => ({ ...item, ...currentStyle }))
    }));
  };

//פונקציה ליצירת מסמך חדש
  const handleNewDocument = () => {
    const newDoc = {
      id: Date.now().toString() + Math.random().toString(),
      textData: [],
      history: [],
      fileName: ''
    };
    setDocuments(prev => [...prev, newDoc]);//שמים את המסמך החדש בסוף המערך
    setActiveDocId(newDoc.id);//שמים את הפוקוס על המסמך החדש שנוצר
  };

//פונקציה לפתיחת מסמך קיים לפי השם שלו
  const handleFileOpened = (fileName, data) => {
    const newDoc = {
      id: Date.now().toString() + Math.random().toString(),
      textData: data,
      history: [],
      fileName: fileName
    };
    setDocuments(prev => [...prev, newDoc]);
    setActiveDocId(newDoc.id);
  };
//פונקציה לסגירת מסמך
  const handleDocumentClose = (docToRemove) => {
    if (docToRemove.textData.length > 0 && !window.confirm("Close this document? Unsaved changes may be lost.")) {//המסמך לא ריק וגם לא אישרנו למחוק אז לא יקרה כלום
      return;
    }
    setDocuments(prev => {
      const remaining = prev.filter(d => d.id !== docToRemove.id);//משאירים את כל המסמכים חוץ מהמסמך שמחקנו
      if (activeDocId === docToRemove.id) {//אם הפוקוס היה על המסמך שרוצים למחוק
        if (remaining.length > 0) {//אם נשארו מסמכים בדף
          setActiveDocId(remaining[remaining.length - 1].id);//נשים פוקוס על המסמך האחרון במערך
        } else {
          setActiveDocId(null);
        }
      }
      return remaining;
    });
  };
  
//פונקציה לשמירת מסמך
  const handleDocumentSave = (docId, newFileName) => {
    setDocuments(prev => prev.map(doc => {
      if (doc.id === docId) {
        return { ...doc, fileName: newFileName };
      }
      console.log(doc);
      return doc;
    }));
  };

  //פונקציה לשמירת מסמך במחשב בשם שרוצים
  const handleSaveAsDownload = () => {
  const activeDoc = documents.find(d => d.id === activeDocId);
  if (!activeDoc) return;
  const customName = prompt("Enter a name for your file:", activeDoc.fileName || "document");//חלון קופץ ששואל את המשתמש באיזה שם לשמור את המסמך
  
  if (customName === null || customName.trim() === "") {//אם המשתמש לחץ על ביטול אז לא שומרים
    return; 
  } 
  const textContent = activeDoc.textData.map(item => item.char).join('');//לוקחים את התווים והופכים למחרוזת ארוכה
  const blob = new Blob([textContent], { type: 'text/plain' });//הגדרת סוג הנתונים בתור קובץ טקסט
  const url = URL.createObjectURL(blob);//הגדרת כתובת זמנית שמצביעה על הקובץ שיצרנו בזיכרון
  const link = document.createElement('a');//יוצר תגית a עם הקישור לכתובת
  link.href = url;
 
  link.download = `${activeDoc.fileName || 'document'}.txt`; //מוריד את המסמך למחשב
  
  link.click();//ככה המשתמש רואה את הקובץ שיורד ישירות להורדות
  URL.revokeObjectURL(url);//ניקוי הזיכרון
};

//פונקציה להתנתקות מהמערכת
  const handleLogout = () => {
    setCurrentUser(null);
    const newDocId = Date.now().toString() + Math.random().toString();
    setDocuments([{
      id: newDocId,
      textData: [],
      history: [],
      fileName: ''
    }]);
    setActiveDocId(newDocId);
  };

  if (!currentUser) {
    return <LoginScreen onLogin={setCurrentUser} />;
  }

  return (
    <div className="app-container">
      {/*הבר למעלה*/}
      <header className="app-header" style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 24px', backgroundColor: '#1f2937', color: 'white' }}>
        <div className="user-info">👤 Logged in as: <strong>{currentUser}</strong></div>
        <button onClick={handleLogout} style={{ background: 'rgba(255,255,255,0.1)', color: 'white', padding: '6px 12px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.2)' }}>
          Logout
        </button>
      </header>

      {/*שליחת כל הפרמטרים של מנהל הקבצים*/}
      <FileManager 
        activeDocument={activeDoc}
        onFileOpened={handleFileOpened}
        onNewDocument={handleNewDocument}
        onSaveDocument={handleDocumentSave}
        currentUser={currentUser}
        onSaveAs={handleSaveAsDownload}
      />
      {/*/ חלונית המסמך הערוך*/}
      <div className="documents-container">
        {documents.length === 0 ? (
          <div style={{ margin: 'auto', color: '#9ca3af' }}>No documents open. Create or open one to start.</div>
        ) : (
          documents.map(doc => (
            <DocumentWindow 
              key={doc.id}
              document={doc}
              isActive={doc.id === activeDocId}
              onClick={setActiveDocId}
              onClose={handleDocumentClose}
              searchTerm={findText}
              selectedCharId={selectedCharId} 
              onSelectChar={setSelectedCharId}
            />
          ))
        )}
      </div>
      
      <div className="editor-controls" style={{ opacity: activeDocId ? 1 : 0.5, pointerEvents: activeDocId ? 'auto' : 'none' }}>
        {/* חיפוש */} 
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
            <button onClick={() => {setFindText(""); setFocusedInput("document");}}>X</button>
            
       </div>
       {/*/כלי העיצוב*/}
        <StyleToolbar 
          currentStyle={currentStyle} 
          setCurrentStyle={setCurrentStyle} 
          onApplyAll={handleApplyAll}
          onUndo={undo}
          canUndo={activeDoc?.history?.length > 0}
        />
        {/*המקלדת הוירטואלית*/ }
        <VirtualKeyboard 
          onKeyPress={handleKeyPress} 
          onDelete={handleDelete}
          onDeleteWord={handleDeleteWord}
          onDeleteAll={handleDeleteAll}
        />
      </div>
    </div>
  );
}

export default App;
