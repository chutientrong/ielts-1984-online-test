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
import "./styles.css";
import { FiRotateCcw } from "react-icons/fi";

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
  const [initialDragWords, setInitialDragWords] = useState([]);
  const [isCorrect, setIsCorrect] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    getValues,
    reset,
  } = useForm({ defaultValues: {} });

  const onSubmit = (data, e) => {
    const blanksClone = [...blanks];
    const keys = Object.keys(data);
    const blanksUpdated = blanksClone.map((blank) => {
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
    const isCorrect = blanksUpdated.every((blank) => blank.isCorrect);
    setBlanks(blanksUpdated);
    setIsCorrect(isCorrect);
  };

  // Reset function to clear answers
  const handleReset = (event) => {
    event.preventDefault();
    reset({}); // reset other form state but keep defaultValues and form values
    setBlanks((prev) =>
      prev.map((blank) => ({ ...blank, answer: "", isCorrect: null }))
    );
    setDragWords(initialDragWords);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    // Check if the item is dropped over a valid drop zone
    if (over && over.id.startsWith("drop-zone")) {
      const dropZoneId = Number(over.id.split("-")[2]); // Extract the drop zone ID
      const dragWordsClone = [...dragWords];
      const draggedWord = dragWordsClone.find((item) => item.id === active.id); // Get the ID of the dragged word

      // Clear the previous value in the previous drop zone if it exists
      const currentValue = getValues(`${dropZoneId}`);
      // Set the value for the new drop zone
      setValue(`${dropZoneId}`, draggedWord.word);
      setActiveId(null); // Reset active ID
      // add new
      if (!currentValue) {
        const draggedWords = dragWordsClone.filter(
          (b) => b.id !== draggedWord.id
        );
        setDragWords(draggedWords);
        return;
      }
      // swap
      if (!draggedWord) {
        return;
      }
      if (draggedWord) {
        if (currentValue && draggedWord.word !== currentValue) {
          const draggedWordIndex = dragWordsClone.findIndex(
            (item) => item.id === draggedWord.id
          );
          dragWordsClone.splice(draggedWordIndex, 1);

          const currentWord = initialDragWords.find(
            (item) => item.word === currentValue
          );
          dragWordsClone.push(currentWord);
          setDragWords((prev) => [...dragWordsClone]);
        } else {
          const draggedWords = dragWordsClone.filter(
            (b) => b.id !== draggedWord.id
          );
          setDragWords(draggedWords);
        }
      }
    }
  };

  const DraggableWord = ({ word, isPlaced }) => {
    const { attributes, listeners, setNodeRef, isDragging, transform } =
      useDraggable({
        id: word.id,
        onDragStart: () => setActiveId(word.id),
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
          opacity: isDragging ? 0.3 : 1,
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
          position: "relative", // Added for positioning
        }}
      >
        {/* {value && (
          <div
            style={{
              position: "absolute", // Added for positioning
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              zIndex: 1, // Added for stacking order
            }}
          >
            <DraggableWord
              word={{
                id: value.id,
                word: value.word,
                color: value?.color || "default",
              }}
              // isPlaced={true}
            />{" "}
          </div>
        )} */}
        {value || "Drop Here!"}
      </div>
    );
  };

  useEffect(() => {
    const data = {
      question: {
        paragraph:
          "The sky is [_input], the grass is [_input], and the hat is [_input]. You should drag the word <span style='color: red;'>green</span> to the correct blank.",
        blanks: [
          { id: 1, correctAnswer: "blue", type: "input" },
          { id: 2, correctAnswer: "green", type: "drag" },
          { id: 3, correctAnswer: "red", type: "drag" },
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
    setInitialDragWords(dragWords);
  }, []);

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <DndContext onDragEnd={handleDragEnd}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            color: isCorrect ? "blue" : "lightcoral",
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
          <FiRotateCcw /> Reset
        </button>
      </DndContext>
    </form>
  );
};

export default DragNDrop;
