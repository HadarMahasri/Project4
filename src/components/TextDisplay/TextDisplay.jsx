export default function TextDisplay({ text,searchTerm,selectedCharId, onSelectChar }) {
  return (
    <div className="text-display-area" dir="auto">
      {text.map((charObj) => (
        <span
          key={charObj.id}
          onClick={() => onSelectChar(charObj.id)}
          style={{
            color: charObj.color,
            fontSize: charObj.fontSize,
            fontFamily: charObj.fontFamily,
            outline: selectedCharId === charObj.id ? '2px solid #3b82f6' : 'none',
            backgroundColor: selectedCharId === charObj.id ? '#dbeafe' : (searchTerm && charObj.char === searchTerm ? 'yellow' : 'transparent'),
            borderRadius: '2px',
            padding: '0 1px'
          }}
        >
          {charObj.char}
        </span>
      ))}
      <span className="blinking-cursor">|</span>
    </div>
  );
}
