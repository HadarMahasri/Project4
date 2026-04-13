import { useState } from 'react';

// הגדרת מערך מקלדת אנגלית
const EN_LAYOUT = [
  ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
  ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
  ['z', 'x', 'c', 'v', 'b', 'n', 'm']
];

// הגדרת מערך מקלדת סימנים ומספרים
const SYMBOL_LAYOUT = [
  ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],
  ['@', '#', '$', '_', '&', '-', '+', '(', ')', '/'],
  ['*', '"', "'", ':', ';', '!', '?', ',']
];

// הגדרת מערך מקלדת עברית
const HE_LAYOUT = [
  ['/', "'", 'ק', 'ר', 'א', 'ט', 'ו', 'ן', 'ם', 'פ'],
  ['ש', 'ד', 'ג', 'כ', 'ע', 'י', 'ח', 'ל', 'ך', 'ף'],
  ['ז', 'ס', 'ב', 'ה', 'נ', 'מ', 'צ', 'ת', 'ץ']
];

// הגדרת מערך מקלדת אימוג'י
const EMOJI_LAYOUT = [
  ['😀', '😂', '🥰', '😎', '🤔', '😭', '😡', '👍', '🙏', '🔥'],
  ['❤️', '🎉', '🌟', '🚀', '🐶', '🐱', '🍕', '☕', '⚽', '🚗']
];

/**
 * רכיב המקלדת הוירטואלית (VirtualKeyboard)
 * מדמה מקלדת מלאה הניתנת ללחיצה, ומציעה מספר סוגי פריסות: אנגלית, עברית, סימנים ואימוג'י.
 * מקבל מהורה (App) את פעולות ההקלדה, מחיקה ומחיקת מילה.
 */
export default function VirtualKeyboard({ onKeyPress, onDelete, onDeleteWord, onDeleteAll }) {
  // סטייט לניהול השפה הנוכחית שמוצגת במקלדת
  const [lang, setLang] = useState('EN'); 

  // פונקציה לבחירת מערך התווים (הפריסה) המתאים לשפה הנוכחית
  const getLayout = () => {
    if (lang === 'EN') return EN_LAYOUT;
    if (lang === 'HE') return HE_LAYOUT;
    if (lang === 'SYMBOL') return SYMBOL_LAYOUT;
    return EMOJI_LAYOUT;
  };

  // פונקציה להחלפת השפה בסבב מובנה
  // אנגלית -> סימנים -> אימוג'י -> עברית -> אנגלית
  const toggleLang = () => {
    if (lang === 'HE') setLang('EN');
    else if (lang === 'EN') setLang('SYMBOL'); 
    else if (lang === 'SYMBOL') setLang('EMOJI'); 
    else setLang('HE'); 
  };

  return (
    <div className="keyboard" dir="ltr">
      {/* שורת הפקודות והשליטה העליונה במקלדת */}
      <div className="keyboard-row">
        {/* כפתור החלפת שפה שמפעיל את הרנדור מחדש של הפריסה בתצוגה */}
        <button className="key-btn action-key" onClick={toggleLang}>
          🌐 {lang}
        </button>
        {/* כתיבה למחיקת תו יחיד לאחור */}
        <button className="key-btn action-key" onClick={onDelete}>
          ⌫ Del
        </button>
        {/* מחיקת המילה האחרונה השלמה */}
        <button className="key-btn action-key" onClick={onDeleteWord}>
          Del Word
        </button>
        {/* מחיקת כל המסמך תוך השארתו פתוח */}
        <button className="key-btn action-key" onClick={onDeleteAll}>
          Clear All
        </button>
      </div>
      
      {/* רינדור הפריסה הנוכחית של המקלדת בעזרת ריצה על המערך הדו-מימדי */}
      {getLayout().map((row, i) => (
        <div key={i} className="keyboard-row">
          {row.map(char => (
            <button 
              key={char} 
              className="key-btn" 
              onClick={() => onKeyPress(char)} // בזמן לחיצה מעביר אל האפליקציה את התו שהוקלד
            >
              {char}
            </button>
          ))}
        </div>
      ))}
      
      {/* מקשי רווח ומעבר שורה בתחתית המקלדת */}
      <div className="keyboard-row">
        <button className="key-btn key-spc" onClick={() => onKeyPress(' ')}>
          Space
        </button>
        <button className="key-btn action-key" onClick={() => onKeyPress('\n')}>
          Enter ↵
        </button>
      </div>
    </div>
  );
}
