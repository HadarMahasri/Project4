export default function StyleToolbar({ currentStyle, onStyleChange, onApplyAll, onUndo, canUndo }) {
  const handleLocalStyleChange = (e) => {
    const { name, value } = e.target;
    onStyleChange(name, value);
  };

  return (
    <div className="toolbar">
      <label>
        Color:
        <input 
          type="color" 
          name="color" 
          value={currentStyle.color} 
          onChange={handleLocalStyleChange} 
        />
      </label>
      
      <label>
        Size:
        <select name="fontSize" value={currentStyle.fontSize} onChange={handleLocalStyleChange}>
          <option value="12px">Small (12px)</option>
          <option value="16px">Normal (16px)</option>
          <option value="24px">Large (24px)</option>
          <option value="32px">Huge (32px)</option>
        </select>
      </label>

      <label>
        Font:
        <select name="fontFamily" value={currentStyle.fontFamily} onChange={handleLocalStyleChange}>
          <option value="system-ui, -apple-system, sans-serif">System Default</option>
          <option value="Arial, sans-serif">Arial</option>
          <option value="'Courier New', Courier, monospace">Courier New</option>
          <option value="Georgia, serif">Georgia</option>
        </select>
      </label>

      <button onClick={onApplyAll} title="Apply current style to all text">
        Apply to All
      </button>

      <button onClick={onUndo} disabled={!canUndo} title="Undo last action">
        Undo ↩
      </button>
    </div>
  );
}