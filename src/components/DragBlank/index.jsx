import { useDrop } from "react-dnd";
import { ItemTypes } from "../constant";

// Draggable blank component for drag and drop
const DragBlank = ({ blank, onDrop }) => {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: ItemTypes.WORD,
    drop: (item) => onDrop(blank.id, item.word),
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  }));

  return (
    <div
      ref={drop}
      style={{
        height: "20px",
        width: "100px",
        display: "inline-block",
        border: "1px dashed gray",
        textAlign: "center",
        padding: "10px",
        backgroundColor: isOver ? "lightblue" : "white",
      }}
    >
      {blank.answer || "Drag here"}
    </div>
  );
};

export default DragBlank;
