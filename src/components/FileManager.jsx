import React, { useState, useEffect } from 'react';
import './FileManager.css';

const FileManager = ({ activeDocument, onFileOpened, onNewDocument, onSaveDocument, currentUser }) => {
  const [savedFiles, setSavedFiles] = useState([]);
  const [fileNameInput, setFileNameInput] = useState('');
  const [selectedFile, setSelectedFile] = useState('');

  // Load available files from localStorage for the current user
  useEffect(() => {
    if (!currentUser) return;
    
    const filesJson = localStorage.getItem(`editor_files_${currentUser}`);
    if (filesJson) {
      try {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setSavedFiles(JSON.parse(filesJson));
      } catch (e) {
        console.error("Failed to parse editor files", e);
      }
    } else {
      setSavedFiles([]); // Reset if new user has no files
    }
  }, [currentUser]);

  // Update input when active document changes
  useEffect(() => {
    if (activeDocument) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFileNameInput(activeDocument.fileName || '');
    } else {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFileNameInput('');
    }
  }, [activeDocument]);

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
