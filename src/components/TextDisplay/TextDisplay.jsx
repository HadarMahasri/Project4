export default function TextDisplay({ text }) {
  return (
    <div className="text-display-area" dir="auto">
      {text.map((charObj) => (
        <span
          key={charObj.id}
          style={{
            color: charObj.color,
            fontSize: charObj.fontSize,
            fontFamily: charObj.fontFamily,
          }}
        >
          {charObj.char}
        </span>
      ))}
      <span className="blinking-cursor">|</span>
    </div>
  );
}
