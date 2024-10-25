import {
  DndContext,
  DragOverlay,
  useDraggable,
  useDroppable,
} from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { RiDragDropLine } from "react-icons/ri";
import './styles.css'

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

const DragNDrop = () => {
  const [activeId, setActiveId] = useState(null);
  const [paragraph, setParagraph] = useState("");
  const [blanks, setBlanks] = useState([]);
  const [dragWords, setDragWords] = useState([]);
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    getValues,
    reset,
  } = useForm({ defaultValues: {} });

  const onSubmit = (data, e) => {
    const keys = Object.keys(data);
    setBlanks((prevBlanks) => {
      return prevBlanks.map((blank) => {
        const key = keys.find((k) => parseInt(k) === blank.id);
        if (key >= 0 && data[key]) {
          if (data[key] === blank.correctAnswer) {
            return {
              ...blank,
              isCorrect: true,
            };
          } else {
            return {
              ...blank,
              isCorrect: false,
            };
          }
        }
        return {
          ...blank,
          isCorrect: false,
        };
      });
    });
  };

  // Reset function to clear answers
  const handleReset = (event) => {
    event.preventDefault();
    reset({}); // reset other form state but keep defaultValues and form values
    setBlanks(blanks.map((blank) => ({ ...blank, isCorrect: null })));
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (over) {
      const dropZoneId = Number(over.id.split("-")[2]); // Get the drop zone number
      const draggedWord = active.id; // Get the dragged word
      console.log(dropZoneId, draggedWord);
      setValue(`${dropZoneId}`, draggedWord);
    }
    setActiveId(null);
  };

  const DraggableWord = ({ word, isPlaced }) => {
    const { attributes, listeners, setNodeRef, isDragging, transform } =
      useDraggable({
        id: word.word,
        onDragStart: () => setActiveId(word.word),
      });

    if (isPlaced) return null;

    return (
      <div
        ref={setNodeRef}
        {...listeners}
        {...attributes}
        style={{
          transform: CSS.Translate.toString(transform),
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
    );
  };

  // Fillable blank component for input
  const InputBlank = ({ name, blank, onChange, register }) => {
    return (
      <input
        type="text"
        name={name}
        style={{
          height: "30px",
          margin: "0 5px",
          border: "1px solid gray",
          borderRadius: "5px",
          padding: "5px",
          paddingLeft: "10px",
          backgroundColor:
            typeof blank.isCorrect === "boolean"
              ? blank.isCorrect
                ? "lightgreen"
                : "lightcoral"
              : "white",
        }}
        placeholder="Type your answer..."
        {...register(`${blank.id}`)}
      />
    );
  };

  const DropZone = ({ blank }) => {
    const { setNodeRef, isOver } = useDroppable({
      id: `drop-zone-${blank.id}`,
    });
    const value = getValues(`${blank.id}`);
    return (
      <div
        ref={setNodeRef}
        style={{
          display: "inline-block",
          border: "1px dashed black",
          padding: "10px",
          margin: "5px",
          minWidth: "100px",
          borderRadius: "5px",
          backgroundColor:
            typeof blank.isCorrect === "boolean"
              ? blank.isCorrect
                ? "lightgreen"
                : "lightcoral"
              : isOver
              ? "lightblue"
              : "white",
        }}
      >
        {value || "Drop Here!"} {/* Show the answer or prompt */}
      </div>
    );
  };

  useEffect(() => {
    const data = {
      question: {
        paragraph:
          "The sky is [_input] and the grass is [_input]. You should drag the word <span style='color: red;'>green</span> to the correct blank.",
        blanks: [
          { id: 1, correctAnswer: "blue", type: "input" },
          { id: 2, correctAnswer: "green", type: "drag" },
        ],
        dragWords: [
          { word: "blue", color: "default", id: 1 },
          { word: "green", color: "red", id: 2 },
          { word: "yellow", color: "default", id: 3 },
          { word: "red", color: "default", id: 4 },
        ],
      },
    };

    const { paragraph, blanks, dragWords } = data.question;
    setParagraph(paragraph);
    setBlanks(() => blanks.map((blank) => ({ ...blank, isCorrect: null })));
    setDragWords(dragWords);
  }, []);

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <DndContext onDragEnd={handleDragEnd}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            color: "blue",
            fontSize: "24px",
            fontWeight: "bold",
          }}
        >
          <RiDragDropLine></RiDragDropLine>
          <span>Fill in the Blanks</span>
        </div>
        <div style={{ marginBottom: "10px" }}>
          {paragraph.split("[_input]").map((part, index) => (
            <React.Fragment key={index}>
              <span dangerouslySetInnerHTML={{ __html: part }} />
              {index < blanks.length &&
                (blanks[index].type === "input" ? (
                  <InputBlank
                    name={`${blanks[index].id}`}
                    blank={blanks[index]}
                    register={register}
                  />
                ) : (
                  <DropZone blank={blanks[index]} />
                ))}
            </React.Fragment>
          ))}
        </div>
        <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
          {dragWords.map((word) => (
            <DraggableWord
              key={word.id}
              word={word}
              isPlaced={blanks.some((blank) => blank.answer === word.word)} // Hide word if placed
            />
          ))}
        </div>
        <DragOverlay>
          {activeId ? <div style={{ opacity: 0.5 }}>{activeId}</div> : null}
        </DragOverlay>
        <button
          className="button"
          onClick={handleSubmit}
          style={{ marginTop: "20px" }}
        >
          Submit
        </button>
        <button
          className="button reset"
          onClick={handleReset}
          style={{ marginTop: "10px", marginLeft: "10px" }}
        >
          Reset
        </button>
      </DndContext>
    </form>
  );
};

export default DragNDrop;
