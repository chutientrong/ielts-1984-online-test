import { useDrag } from "react-dnd";
import { ItemTypes } from "../constant";

const boxShadowBorder =
  "0 0 0 calc(1px / var(--scale-x, 1)) rgba(63, 63, 68, 0.05)";
const boxShadowCommon =
  "0 1px calc(3px / var(--scale-x, 1)) 0 rgba(34, 33, 81, 0.15)";
const boxShadow = `${boxShadowBorder}, ${boxShadowCommon}`;

function getItemStyles(dragging) {
  if (dragging) {
    return {
      opacity: "var(--dragging-opacity, 0.25)",
      zIndex: 0,

      "&:focus": {
        boxShadow,
      },
    };
  }
}

// Draggable word component
const DraggableWord = ({ word, isPlaced }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: ItemTypes.WORD,
    item: { id: word.id, word: word.word },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  if (isPlaced) return null;

  return (
    <div
      style={{
        touchAction: "manipulation",
      }}
    >
      <div
        ref={drag}
        draggable={true}
        style={{
          width: "100px",
          padding: "10px",
          margin: "5px",
          backgroundColor: word.color === "red" ? "lightcoral" : "lightgray",
          opacity: isDragging ? 0.5 : 1,
          cursor: isDragging ? "grabbing" : "grab",
          borderRadius: "5px",
          ...getItemStyles(isDragging),
        }}
      >
        {word.word}
      </div>
    </div>
  );
};

export default DraggableWord;
