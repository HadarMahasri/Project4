import { useState } from 'react';

const EN_LAYOUT = [
  ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
  ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
  ['z', 'x', 'c', 'v', 'b', 'n', 'm']
];
const SYMBOL_LAYOUT = [
  ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],
  ['@', '#', '$', '_', '&', '-', '+', '(', ')', '/'],
  ['*', '"', "'", ':', ';', '!', '?', ',']
];

const HE_LAYOUT = [
  ['/', "'", 'ק', 'ר', 'א', 'ט', 'ו', 'ן', 'ם', 'פ'],
  ['ש', 'ד', 'ג', 'כ', 'ע', 'י', 'ח', 'ל', 'ך', 'ף'],
  ['ז', 'ס', 'ב', 'ה', 'נ', 'מ', 'צ', 'ת', 'ץ']
];

const EMOJI_LAYOUT = [
  ['😀', '😂', '🥰', '😎', '🤔', '😭', '😡', '👍', '🙏', '🔥'],
  ['❤️', '🎉', '🌟', '🚀', '🐶', '🐱', '🍕', '☕', '⚽', '🚗']
];

export default function VirtualKeyboard({ onKeyPress, onDelete, onDeleteWord, onDeleteAll }) {
  const [lang, setLang] = useState('EN'); 

  const getLayout = () => {
    if (lang === 'EN') return EN_LAYOUT;
    if (lang === 'HE') return HE_LAYOUT;
    if (lang === 'SYMBOL') return SYMBOL_LAYOUT;
    return EMOJI_LAYOUT;
  };

  const toggleLang = () => {
    if (lang === 'HE') setLang('EN');
    else if (lang === 'EN') setLang('SYMBOL'); 
    else if (lang === 'SYMBOL') setLang('EMOJI'); 
    else setLang('HE'); 
  };

  return (
    <div className="keyboard" dir="ltr">
      <div className="keyboard-row">
        <button className="key-btn action-key" onClick={toggleLang}>
          🌐 {lang}
        </button>
        <button className="key-btn action-key" onClick={onDelete}>
          ⌫ Del
        </button>
        <button className="key-btn action-key" onClick={onDeleteWord}>
          Del Word
        </button>
        <button className="key-btn action-key" onClick={onDeleteAll}>
          Clear All
        </button>
      </div>
      
      {getLayout().map((row, i) => (
        <div key={i} className="keyboard-row">
          {row.map(char => (
            <button 
              key={char} 
              className="key-btn" 
              onClick={() => onKeyPress(char)}
            >
              {char}
            </button>
          ))}
        </div>
      ))}
      
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
