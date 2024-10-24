import React, { useEffect, useState } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import DragBlank from "../DragBlank";
import DraggableWord from "../DraggableWord";
import InputBlank from "../InputBlank";

const DragAndDropFillInTheBlank = () => {
  const [paragraph, setParagraph] = useState("");
  const [blanks, setBlanks] = useState([]);
  const [dragWords, setDragWords] = useState([]);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [feedback, setFeedback] = useState({ message: "", color: "" });

  const handleDropOrInputChange = (blankId, word) => {
    setBlanks((prev) =>
      prev.map((blank) =>
        blank.id === blankId
          ? { ...blank, answer: word, isCorrect: word === blank.correctAnswer }
          : blank
      )
    );
    // setDragWords((prev) => prev.filter((item) => item.word !== word));
  };

  const handleSubmit = () => {
    const feedbackMessage = [];

    blanks.forEach((blank) => {
      if (blank.isCorrect) {
        feedbackMessage.push(`Blank ${blank.id}: Chính xác`);
      } else {
        feedbackMessage.push(`Blank ${blank.id}: Sai`);
      }
    });

    setFeedback({
      message: feedbackMessage.join(" | "),
      color: blanks.every((blank) => blank.isCorrect) ? "green" : "red",
    });

    setIsSubmitted(true);
  };

  // Reset function to clear answers
  const handleReset = () => {
    setBlanks(
      blanks.map((blank) => ({ ...blank, answer: "", isCorrect: false }))
    );
    setIsSubmitted(false);
    setFeedback({ message: "", color: "" });
  };

  // Fetch data from the API
  useEffect(() => {
    const fetchData = async () => {
      try {
        // const response = await axios.get('YOUR_API_URL_HERE'); // Replace with your API URL
        // Sample data from the backend
        const data = {
          question: {
            paragraph:
              "The sky is [_input] and the grass is [_input]. You should drag the word <span style='color: red;'>green</span> to the correct blank.",
            blanks: [
              {
                id: 1,
                position: "first",
                correctAnswer: "blue",
                type: "input",
              }, // Input for the first blank
              {
                id: 2,
                position: "second",
                correctAnswer: "green",
                type: "drag",
              }, // Drag for the second blank
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
        // Initialize blanks with answer and isCorrect properties
        const initializedBlanks = blanks.map((blank) => ({
          ...blank,
          answer: "",
          isCorrect: false,
        }));
        setParagraph(paragraph);
        setBlanks(initializedBlanks);
        setDragWords(dragWords);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  return (
    <DndProvider backend={HTML5Backend}>
      <div>
        <h2>Fill in the blanks:</h2>
        <div style={{ marginBottom: "10px" }}>
          {paragraph.split("[_input]").map((part, index) => (
            <React.Fragment key={index}>
              <span key={index} dangerouslySetInnerHTML={{ __html: part }} />
              {index < blanks.length &&
                (blanks[index].type === "input" ? (
                  <InputBlank
                    blank={blanks[index]}
                    onChange={handleDropOrInputChange}
                  />
                ) : (
                  <DragBlank
                    blank={blanks[index]}
                    onDrop={handleDropOrInputChange}
                  />
                ))}
            </React.Fragment>
          ))}
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "10px",
            marginTop: "20px",
            border: "1px solid black",
            padding: "10px",
            width: "fit-content",
          }}
        >
          <div>Drag items from the box to the blanks above</div>
          <div style={{ display: "flex" }}>
            {dragWords.map((word) => (
              <DraggableWord
                key={word.id}
                word={word}
                isPlaced={blanks.some((blank) => blank.answer === word.word)} // Hide word if placed
              />
            ))}
          </div>
        </div>

        <button onClick={handleSubmit} style={{ marginTop: "20px" }}>
          Submit
        </button>
        <button
          onClick={handleReset}
          style={{ marginTop: "10px", marginLeft: "10px" }}
        >
          Reset
        </button>

        {isSubmitted && (
          <div style={{ marginTop: "20px", color: feedback.color }}>
            <h3>Results:</h3>
            <p>{feedback.message}</p>
          </div>
        )}
      </div>
    </DndProvider>
  );
};

export default DragAndDropFillInTheBlank;
