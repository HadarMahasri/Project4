import { useState } from 'react';
import './App.css';
import DocumentWindow from './components/DocumentWindow';
import StyleToolbar from './components/StyleToolbar';
import VirtualKeyboard from './components/VirtualKeyboard';
import FileManager from './components/FileManager';
import LoginScreen from './components/LoginScreen';

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [documents, setDocuments] = useState(() => [{
    id: Date.now().toString() + Math.random().toString(),
    textData: [],
    history: [],
    fileName: ''
  }]);
  const [activeDocId, setActiveDocId] = useState(documents[0].id);

  const [currentStyle, setCurrentStyle] = useState({
    color: '#000000',
    fontSize: '16px',
    fontFamily: 'system-ui, -apple-system, sans-serif'
  });

  const activeDoc = documents.find(d => d.id === activeDocId);

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

  const handleKeyPress = (char) => {
    updateActiveDoc(doc => {
      const newHistory = [...doc.history, doc.textData].slice(-10);
      const newTextData = [...doc.textData, {
        id: Date.now().toString() + Math.random().toString(),
        char,
        ...currentStyle
      }];
      return { textData: newTextData, history: newHistory };
    });
  };

  const handleDelete = () => {
    updateActiveDoc(doc => ({
      history: [...doc.history, doc.textData].slice(-10),
      textData: doc.textData.slice(0, -1)
    }));
  };

  const handleDeleteAll = () => {
    updateActiveDoc(doc => ({
      history: [...doc.history, doc.textData].slice(-10),
      textData: []
    }));
  };

  const handleDeleteWord = () => {
    updateActiveDoc(doc => {
      if (doc.textData.length === 0) return {};
      let i = doc.textData.length - 1;
      while(i >= 0 && doc.textData[i].char === ' ') i--;
      while(i >= 0 && doc.textData[i].char !== ' ') i--;
      return {
        history: [...doc.history, doc.textData].slice(-10),
        textData: doc.textData.slice(0, i + 1)
      };
    });
  };

  const handleApplyAll = () => {
    updateActiveDoc(doc => ({
      history: [...doc.history, doc.textData].slice(-10),
      textData: doc.textData.map(item => ({ ...item, ...currentStyle }))
    }));
  };

  const handleNewDocument = () => {
    const newDoc = {
      id: Date.now().toString() + Math.random().toString(),
      textData: [],
      history: [],
      fileName: ''
    };
    setDocuments(prev => [...prev, newDoc]);
    setActiveDocId(newDoc.id);
  };

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

  const handleDocumentClose = (docToRemove) => {
    if (docToRemove.textData.length > 0 && !window.confirm("Close this document? Unsaved changes may be lost.")) {
      return;
    }
    setDocuments(prev => {
      const remaining = prev.filter(d => d.id !== docToRemove.id);
      if (activeDocId === docToRemove.id) {
        if (remaining.length > 0) {
          setActiveDocId(remaining[remaining.length - 1].id);
        } else {
          setActiveDocId(null);
        }
      }
      return remaining;
    });
  };

  const handleDocumentSave = (docId, newFileName) => {
    setDocuments(prev => prev.map(doc => {
      if (doc.id === docId) {
        return { ...doc, fileName: newFileName };
      }
      return doc;
    }));
  };

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
      <header className="app-header" style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 24px', backgroundColor: '#1f2937', color: 'white' }}>
        <div className="user-info">👤 Logged in as: <strong>{currentUser}</strong></div>
        <button onClick={handleLogout} style={{ background: 'rgba(255,255,255,0.1)', color: 'white', padding: '6px 12px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.2)' }}>
          Logout
        </button>
      </header>
      
      <FileManager 
        activeDocument={activeDoc}
        onFileOpened={handleFileOpened}
        onNewDocument={handleNewDocument}
        onSaveDocument={handleDocumentSave}
        currentUser={currentUser}
      />
      
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
            />
          ))
        )}
      </div>

      <div className="editor-controls" style={{ opacity: activeDocId ? 1 : 0.5, pointerEvents: activeDocId ? 'auto' : 'none' }}>
        <StyleToolbar 
          currentStyle={currentStyle} 
          setCurrentStyle={setCurrentStyle} 
          onApplyAll={handleApplyAll}
          onUndo={undo}
          canUndo={activeDoc?.history?.length > 0}
        />
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
