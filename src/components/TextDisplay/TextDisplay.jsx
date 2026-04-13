/**
 * רכיב התצוגה של הטקסט (TextDisplay)
 * מקבל מערך של אובייקטים (שכל אחד מהם מייצג תו בודד במסמך עם עיצוב משלו) ומציג אותם.
 * מאפשר גם בחירת תו בודד לעריכה ספציפית וכן סימון של תו אם הוא תואם למילה שמחפשים בתיבת החיפוש.
 */
export default function TextDisplay({ text, searchTerm, selectedCharId, onSelectChar, isActive }) {
  return (
    // תצוגה שגולשת לשורות לפי מילים ומציגה רווחים רצופים
    <div className="text-display-area" dir="auto" style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
      {/* עוברים בלולאה על כל מערך התווים */}
      {text.map((charObj) => (
        <span
          key={charObj.id} // מזהה ייחודי עבור React לביצועים בעדכונים
          onClick={() => onSelectChar(charObj.id)} // בחירת התו המבוקש במערך לצורך שינוי עיצוב
          style={{
            // חלת העיצוב (צבע, גודל, גופן) של התו הספציפי 
            color: charObj.color,
            fontSize: charObj.fontSize,
            fontFamily: charObj.fontFamily,
            // מסגרת בולטת אם התו כרגע נבחר לעריכת עיצוב
            outline: selectedCharId === charObj.id ? '2px solid #3b82f6' : 'none',
            // צבע רקע: כחול חלש לתו שנבחר, אחרת צהוב אם הוא מתאים לחיפוש הנוכחי, אחרת שקוף
            backgroundColor: selectedCharId === charObj.id ? '#dbeafe' : (searchTerm && charObj.char === searchTerm ? 'yellow' : 'transparent'),
            borderRadius: '2px',
            padding: '0 1px'
          }}
        >
          {charObj.char}
        </span>
      ))}
      {/* סמן מהבהב המראה באיזה מסמך אנו מקלידים רק כאשר המסמך הוא הפעיל (במיקוד) */}
      {isActive && <span className="blinking-cursor">|</span>}
    </div>
  );
}
