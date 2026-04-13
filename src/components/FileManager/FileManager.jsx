import React, { useState } from 'react';
import './FileManager.css';

const FileManager = ({ activeDocument, onFileOpened, onNewDocument, onSaveDocument, currentUser,onSaveAs }) => {
  const [savedFiles, setSavedFiles] = useState(() => {
    if (!currentUser) return [];
    try {
      const filesJson = localStorage.getItem(`editor_files_${currentUser}`);
      return filesJson ? JSON.parse(filesJson) : [];
    } catch {
      return [];
    }
  });

  const [fileNameInput, setFileNameInput] = useState('');
  const [selectedFile, setSelectedFile] = useState('');
  const [prevActiveId, setPrevActiveId] = useState('');

  if (activeDocument && activeDocument.id !== prevActiveId) {
    setPrevActiveId(activeDocument.id);
    setFileNameInput(activeDocument.fileName || '');
  } else if (!activeDocument && prevActiveId !== '') {
    setPrevActiveId('');
    setFileNameInput('');
  }

  const handleSave = () => {
    if (!activeDocument || !fileNameInput.trim() || !currentUser) return;
    
    const name = fileNameInput.trim();
    // Save the actual data scoped to the current user
    localStorage.setItem(`editor_file_${currentUser}_${name}`, JSON.stringify(activeDocument.textData));
    
    // Update master list if new
    let updatedFiles = [...savedFiles];
    if (!updatedFiles.includes(name)) {
      updatedFiles.push(name);
      localStorage.setItem(`editor_files_${currentUser}`, JSON.stringify(updatedFiles));
      setSavedFiles(updatedFiles);
    }
    
    onSaveDocument(activeDocument.id, name);
    alert(`File "${name}" saved successfully!`);
  };

  const handleLoad = () => {
    if (!selectedFile || !currentUser) return;
    
    const dataJson = localStorage.getItem(`editor_file_${currentUser}_${selectedFile}`);
    if (dataJson) {
      try {
        const data = JSON.parse(dataJson);
        onFileOpened(selectedFile, data);
        setSelectedFile(''); // Reset the dropdown
      } catch (e) {
        console.error("Failed to load file", e);
        alert("Corrupted file data.");
      }
    }
  };

  const hasActive = !!activeDocument;

  return (
    <div className="file-manager">
      <div className="file-group">
        <span className="file-manager-title">📁 File Manager</span>
        <button className="btn-load" style={{ padding: '6px 12px', fontSize: '12px' }} onClick={onNewDocument}>
          ➕ New Document
        </button>
      </div>
      
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
        <button 
          className="btn-save" 
          onClick={onSaveAs} 
          disabled={!hasActive}
          style={{ marginLeft: '5px', backgroundColor: '#2196F3' }} 
        >
          📥 Save As
        </button>
      </div>

      <div className="file-group">
        <select 
          className="file-select"
          value={selectedFile}
          onChange={(e) => setSelectedFile(e.target.value)}
        >
          <option value="" disabled>Select a file to open...</option>
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
    </div>
  );
};

export default FileManager;
