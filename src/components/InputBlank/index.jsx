// Fillable blank component for input
const InputBlank = ({ blank, onChange }) => {
  return (
    <input
      type="text"
      value={blank.answer || ""}
      onChange={(e) => onChange(blank.id, e.target.value)}
      style={{
        height: "30px",
        margin: "0 5px",
        border: "1px solid gray",
        padding: "5px",
        // backgroundColor: blank.isCorrect ? 'lightgreen' : 'lightcoral',
      }}
      placeholder="Type your answer..."
    />
  );
};
export default InputBlank;
