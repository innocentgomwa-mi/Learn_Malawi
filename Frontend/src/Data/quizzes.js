/*
export const quizzes = [
  {
    id: 1,
    title: "Mathematics Standard 1",
    level: "primary",
    subject: "Mathematics",
    difficulty: "easy",
    class: "Standard 1",
    questions: [
      {
        question: "What is 1 + 1?",
        options: ["1", "2", "3", "4"],
        answer: "2",
        timeLimit: 30,
        completionTimePerQuestion: 0
      },
      {
        question: "Count the apples: 🍎 🍎 🍎",
        options: ["2", "3", "4", "5"],
        answer: "3",
        timeLimit: 25,
        completionTimePerQuestion: 0
      }
    ],
    totalTime: 55
  },
  {
    id: 2,
    title: "Mathematics Standard 2",
    level: "primary",
    subject: "Mathematics",
    difficulty: "easy",
    class: "Standard 2",
    questions: [
      {
        question: "What is 5 + 3?",
        options: ["6", "7", "8", "9"],
        answer: "8",
        timeLimit: 35,
        completionTimePerQuestion: 0
      },
      {
        question: "What is 10 - 4?",
        options: ["4", "5", "6", "7"],
        answer: "6",
        timeLimit: 30,
        completionTimePerQuestion: 0
      }
    ],
    totalTime: 65
  },
  {
    id: 3,
    title: "English Standard 3",
    level: "primary",
    subject: "English",
    difficulty: "medium",
    class: "Standard 3",
    questions: [
      {
        question: "Which word is a noun?",
        options: ["run", "happy", "cat", "quickly"],
        answer: "cat",
        timeLimit: 40,
        completionTimePerQuestion: 0
      },
      {
        question: "Choose the correct spelling:",
        options: ["skool", "school", "scholl", "scool"],
        answer: "school",
        timeLimit: 45,
        completionTimePerQuestion: 0
      }
    ],
    totalTime: 85
  },
  {
    id: 4,
    title: "Science Standard 4",
    level: "primary",
    subject: "Science",
    difficulty: "medium",
    class: "Standard 4",
    questions: [
      {
        question: "What do plants need to grow?",
        options: ["Water only", "Sunlight only", "Water and Sunlight", "None"],
        answer: "Water and Sunlight",
        timeLimit: 50,
        completionTimePerQuestion: 0
      },
      {
        question: "Which animal lays eggs?",
        options: ["Cat", "Dog", "Bird", "Cow"],
        answer: "Bird",
        timeLimit: 45,
        completionTimePerQuestion: 0
      }
    ],
    totalTime: 95
  },
  {
    id: 5,
    title: "Mathematics Standard 5",
    level: "primary",
    subject: "Mathematics",
    difficulty: "medium",
    class: "Standard 5",
    questions: [
      {
        question: "What is 12 × 3?",
        options: ["24", "36", "48", "12"],
        answer: "36",
        timeLimit: 60,
        completionTimePerQuestion: 0
      },
      {
        question: "What is 48 ÷ 4?",
        options: ["10", "12", "14", "16"],
        answer: "12",
        timeLimit: 55,
        completionTimePerQuestion: 0
      }
    ],
    totalTime: 115
  },
  {
    id: 6,
    title: "Social Studies Standard 6",
    level: "primary",
    subject: "Social Studies",
    difficulty: "medium",
    class: "Standard 6",
    questions: [
      {
        question: "What is the capital city of Malawi?",
        options: ["Blantyre", "Lilongwe", "Mzuzu", "Zomba"],
        answer: "Lilongwe",
        timeLimit: 50,
        completionTimePerQuestion: 0
      },
      {
        question: "Who was the first President of Malawi?",
        options: ["Kamuzu Banda", "Bakili Muluzi", "Joyce Banda", "Peter Mutharika"],
        answer: "Kamuzu Banda",
        timeLimit: 60,
        completionTimePerQuestion: 0
      }
    ],
    totalTime: 110
  },
  {
    id: 7,
    title: "Science Standard 7",
    level: "primary",
    subject: "Science",
    difficulty: "hard",
    class: "Standard 7",
    questions: [
      {
        question: "What is the process by which plants make food?",
        options: ["Respiration", "Photosynthesis", "Digestion", "Transpiration"],
        answer: "Photosynthesis",
        timeLimit: 70,
        completionTimePerQuestion: 0
      },
      {
        question: "Which organ pumps blood in the human body?",
        options: ["Lungs", "Liver", "Heart", "Kidney"],
        answer: "Heart",
        timeLimit: 65,
        completionTimePerQuestion: 0
      }
    ],
    totalTime: 135
  },
  {
    id: 8,
    title: "Mathematics Form 1",
    level: "secondary",
    subject: "Mathematics",
    difficulty: "easy",
    class: "Form 1",
    questions: [
      {
        question: "Solve: 2x + 5 = 15",
        options: ["x = 3", "x = 5", "x = 7", "x = 10"],
        answer: "x = 5",
        timeLimit: 75,
        completionTimePerQuestion: 0
      },
      {
        question: "What is the area of a square with side 4cm?",
        options: ["8cm²", "12cm²", "16cm²", "20cm²"],
        answer: "16cm²",
        timeLimit: 70,
        completionTimePerQuestion: 0
      }
    ],
    totalTime: 145
  },
  {
    id: 9,
    title: "Biology Form 1",
    level: "secondary",
    subject: "Biology",
    difficulty: "medium",
    class: "Form 1",
    questions: [
      {
        question: "What is the powerhouse of the cell?",
        options: ["Nucleus", "Mitochondria", "Ribosome", "Chloroplast"],
        answer: "Mitochondria",
        timeLimit: 80,
        completionTimePerQuestion: 0
      },
      {
        question: "Which process do plants use to make food?",
        options: ["Respiration", "Photosynthesis", "Transpiration", "Digestion"],
        answer: "Photosynthesis",
        timeLimit: 85,
        completionTimePerQuestion: 0
      }
    ],
    totalTime: 165
  },
  {
    id: 10,
    title: "Physics Form 2",
    level: "secondary",
    subject: "Physics",
    difficulty: "medium",
    class: "Form 2",
    questions: [
      {
        question: "What is the unit of force?",
        options: ["Joule", "Watt", "Newton", "Pascal"],
        answer: "Newton",
        timeLimit: 90,
        completionTimePerQuestion: 0
      },
      {
        question: "Which law states F = ma?",
        options: ["Newton's First Law", "Newton's Second Law", "Newton's Third Law", "Ohm's Law"],
        answer: "Newton's Second Law",
        timeLimit: 95,
        completionTimePerQuestion: 0
      }
    ],
    totalTime: 185
  },
  {
    id: 11,
    title: "Chemistry Form 3",
    level: "secondary",
    subject: "Chemistry",
    difficulty: "hard",
    class: "Form 3",
    questions: [
      {
        question: "What is the chemical formula for water?",
        options: ["HO", "H2O", "HO2", "H2O2"],
        answer: "H2O",
        timeLimit: 100,
        completionTimePerQuestion: 0
      },
      {
        question: "What is the pH of a neutral solution?",
        options: ["0", "7", "14", "10"],
        answer: "7",
        timeLimit: 105,
        completionTimePerQuestion: 0
      }
    ],
    totalTime: 205
  },
  {
    id: 12,
    title: "Geography Form 4",
    level: "secondary",
    subject: "Geography",
    difficulty: "hard",
    class: "Form 4",
    questions: [
      {
        question: "What is the longest river in the world?",
        options: ["Amazon", "Nile", "Yangtze", "Mississippi"],
        answer: "Nile",
        timeLimit: 110,
        completionTimePerQuestion: 0
      },
      {
        question: "Which is the largest continent?",
        options: ["Africa", "Asia", "North America", "Antarctica"],
        answer: "Asia",
        timeLimit: 115,
        completionTimePerQuestion: 0
      }
    ],
    totalTime: 225
  }
];

*/