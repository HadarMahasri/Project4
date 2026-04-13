/**
 * רכיב סרגל העיצוב (StyleToolbar)
 * מספק ממשק משתמש לבחירת צבע, גודל גופן וסוג גופן.
 * כאשר משנים בחירה באחד מהאפשרויות, הרכיב דוחף את העדכון חזרה לאפליקציה הראשית.
 */
export default function StyleToolbar({ currentStyle, onStyleChange, onApplyAll, onUndo, canUndo }) {
  // פונקציה מקומית שמופעלת כאשר משנים ערך באחד ה-inputs בסרגל (color/font/size)
  const handleLocalStyleChange = (e) => {
    // משיכת השם של השדה וצורת הערך החדש מתוך אירוע השינוי (למשל name="color", value="#ff0000")
    const { name, value } = e.target;
    // הפעלת פונקציית העדכון שעברה בתור Prop מהאבא (App.jsx)
    onStyleChange(name, value);
  };

  return (
    <div className="toolbar">
      {/* בחירת צבע טקסט באמצעות כלי הצבעים של הדפדפן */}
      <label>
        Color:
        <input 
          type="color" 
          name="color" 
          value={currentStyle.color} 
          onChange={handleLocalStyleChange} 
        />
      </label>
      
      {/* Dropdown לבחירת גודל הגופן המורכב ממספר אפשרויות קבועות מראש */}
      <label>
        Size:
        <select name="fontSize" value={currentStyle.fontSize} onChange={handleLocalStyleChange}>
          <option value="12px">Small (12px)</option>
          <option value="16px">Normal (16px)</option>
          <option value="24px">Large (24px)</option>
          <option value="32px">Huge (32px)</option>
        </select>
      </label>

      {/* Dropdown לבחירת משפחת הגופן (Font Family) */}
      <label>
        Font:
        <select name="fontFamily" value={currentStyle.fontFamily} onChange={handleLocalStyleChange}>
          <option value="system-ui, -apple-system, sans-serif">System Default</option>
          <option value="Arial, sans-serif">Arial</option>
          <option value="'Courier New', Courier, monospace">Courier New</option>
          <option value="Georgia, serif">Georgia</option>
        </select>
      </label>

      {/* כפתור למריחת העיצוב הנוכחי על כל התווים במסמך כולו */}
      <button onClick={onApplyAll} title="Apply current style to all text">
        Apply to All
      </button>

      {/* כפתור ביטול פעולה (Undo) - מופעל רק אם קיימת היסטוריה לשחזור */}
      <button onClick={onUndo} disabled={!canUndo} title="Undo last action">
        Undo ↩
      </button>
    </div>
  );
}