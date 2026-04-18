import React, { useState, useEffect } from "react";
import { quizzes } from "../Data/quizzes";
import "../styles/quizes.css";

const Quizes = () => {
  const [level, setLevel] = useState("primary");
  const [subjectFilter, setSubjectFilter] = useState("all");
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [timeLeft, setTimeLeft] = useState(null); 

  const filteredQuizzes = quizzes.filter((quiz) => quiz.level === level);

  const allSubjects = [
    "all",
    ...new Set(filteredQuizzes.map((quiz) => quiz.subject))
  ];

  const displayedQuizzes =
    subjectFilter === "all"
      ? filteredQuizzes
      : filteredQuizzes.filter((quiz) => quiz.subject === subjectFilter);

  const currentQuestion =
    selectedQuiz?.questions[currentQuestionIndex] || null;

  useEffect(() => {
    if (!selectedQuiz || isFinished || timeLeft === null) return;

    if (timeLeft <= 0) {
      setIsFinished(true);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prevTime) => prevTime - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, isFinished, selectedQuiz]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const handleOptionClick = (option) => {
    setSelectedOption(option);
  };

  const handleNext = () => {
    if (selectedOption === currentQuestion.answer) {
      setScore(score + 1);
    }

    if (currentQuestionIndex + 1 < selectedQuiz.questions.length) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedOption(null);
    } else {
      setIsFinished(true);
    }
  };

  const handleQuizSelect = (quiz) => {
    setSelectedQuiz(quiz);
    setShowInstructions(true);
  };

  const handleStartQuiz = () => {
    setShowInstructions(false);
    setCurrentQuestionIndex(0);
    setSelectedOption(null);
    setScore(0);
    setIsFinished(false);
    setTimeLeft(quizDuration()); 
  };

  const handleBackToList = () => {
    setSelectedQuiz(null);
    setCurrentQuestionIndex(0);
    setSelectedOption(null);
    setScore(0);
    setIsFinished(false);
    setTimeLeft(null);
    setShowInstructions(false);
  };

  const quizDuration = () => {
    return selectedQuiz.questions.length * 60; 
  };

  return (
    <div>
      {!selectedQuiz && (
        <>
          <div className="quiz-description">
            <h2>Interactive Quizzes</h2>
            <p>
              Test your knowledge across various subjects. Select your level and subject to get started. Each quiz is timed and provides instant feedback upon completion!
            </p>
          </div>

          <div className="level-tabs">
            <button
              className={level === "primary" ? "active" : ""}
              onClick={() => {
                setLevel("primary");
                setSubjectFilter("all");
              }}
            >
              Primary
            </button>
            <button
              className={level === "secondary" ? "active" : ""}
              onClick={() => {
                setLevel("secondary");
                setSubjectFilter("all");
              }}
            >
              Secondary
            </button>
          </div>

          <div className="filters-container" style={{ textAlign: "center", marginBottom: "1.5rem" }}>
            <select
              value={subjectFilter}
              onChange={(e) => setSubjectFilter(e.target.value)}
              className="subject-select"
            >
              {allSubjects.map((subject) => (
                <option key={subject} value={subject}>
                  {subject === "all" ? "All Subjects" : subject}
                </option>
              ))}
            </select>
          </div>
        </>
      )}

      {!selectedQuiz ? (
        <div className="quiz-list">
          {displayedQuizzes.length === 0 ? (
            <p>No quizzes available for this level and subject.</p>
          ) : (
            displayedQuizzes.map((quiz) => (
              <div key={quiz.id} className="quiz-card">
                <h3>{quiz.title}</h3>
                <p>Subject: {quiz.subject}</p>
                <p>Difficulty: {quiz.difficulty}</p>
                <button onClick={() => handleQuizSelect(quiz)}>Start Quiz</button>
              </div>
            ))
          )}
        </div>
      ) : showInstructions ? (
        <div className="quiz-container">
          <h2 className="quiz-title">{selectedQuiz.title}</h2>
          <div className="instructions">
            <h3>Instructions</h3>
            <ul>
              <li>Read each question carefully before selecting an answer.</li>
              <li>You will have <strong>1 minute</strong> per question.</li>
              <li>Once time runs out, your quiz will automatically end.</li>
              <li>Click "Start" when you are ready.</li>
            </ul>
            <button className="nav-button" onClick={handleStartQuiz}>
              Start Quiz
            </button>
          </div>
        </div>
      ) : (
        <div className="quiz-container">
          <h2 className="quiz-title">{selectedQuiz.title}</h2>

          {!isFinished && (
            <div className="timer">
              ⏰ Time Left: <strong>{formatTime(timeLeft)}</strong>
            </div>
          )}

          {isFinished ? (
            <div>
              <h3>Quiz Completed!</h3>
              <p>
                Your Score: {score} / {selectedQuiz.questions.length}
              </p>
              <div className="quiz-navigation">
                <button className="nav-button" onClick={handleBackToList}>
                  Back to Quiz List
                </button>
              </div>
            </div>
          ) : (
            <>
              <h4 className="question-number">
                Question {currentQuestionIndex + 1} of {selectedQuiz.questions.length}
              </h4>
              <p className="question-text">{currentQuestion.question}</p>

              <ul className="option-list">
                {currentQuestion.options.map((option, index) => (
                  <li key={index}>
                    <button
                      onClick={() => handleOptionClick(option)}
                      className={`option-button ${
                        selectedOption === option ? "selected" : ""
                      }`}
                    >
                      {option}
                    </button>
                  </li>
                ))}
              </ul>

              <div className="quiz-navigation">
                {currentQuestionIndex > 0 && (
                  <button
                    className="nav-button back-button"
                    onClick={() => {
                      setCurrentQuestionIndex(currentQuestionIndex - 1);
                      setSelectedOption(null);
                    }}
                  >
                    Back
                  </button>
                )}

                <button
                  onClick={handleNext}
                  disabled={selectedOption === null}
                  className="nav-button next-button"
                >
                  {currentQuestionIndex + 1 === selectedQuiz.questions.length
                    ? "Finish"
                    : "Next"}
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default Quizes;
