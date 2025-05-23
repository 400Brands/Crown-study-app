//@ts-nocheck

// src/components/modals/QuizConfigStep.tsx
import { useState } from "react";
import {
  Button,
  Input,
  Select,
  SelectItem,
  Checkbox,
  Spinner,
  Progress,
} from "@heroui/react";
import { Zap } from "lucide-react";
import { QuizConfig, Question } from "@/types";

interface QuizConfigStepProps {
  pdfUrl: string;
  availableCourses: Array<{ id: string; name: string }>;
  onQuizGenerated: (quiz: {
    title: string;
    courseId: string;
    questions: Question[];
  }) => void;
  onError: (error: string) => void;
}

// Mock questions for testing
const MOCK_QUESTIONS: Question[] = [
  {
    id: "1",
    text: "What is the primary purpose of object-oriented programming?",
    options: [
      { id: "1a", text: "To make code more complex", isCorrect: false },
      {
        id: "1b",
        text: "To organize code into reusable objects and classes",
        isCorrect: true,
      },
      { id: "1c", text: "To eliminate all functions", isCorrect: false },
      { id: "1d", text: "To make programming slower", isCorrect: false },
    ],
    explanation:
      "Object-oriented programming helps organize code into reusable, maintainable structures through objects and classes.",
  },
  {
    id: "2",
    text: "Inheritance allows a class to acquire properties from another class.",
    options: [
      { id: "2a", text: "True", isCorrect: true },
      { id: "2b", text: "False", isCorrect: false },
    ],
    explanation:
      "Inheritance is a fundamental OOP concept that allows classes to inherit properties and methods from parent classes.",
  },
  {
    id: "3",
    text: "What does encapsulation mean in object-oriented programming?",
    options: [
      {
        id: "3a",
        text: "Encapsulation is the bundling of data and methods that operate on that data within a single unit or class, and restricting access to some components.",
        isCorrect: true,
      },
    ],
    explanation:
      "Encapsulation helps protect data integrity and provides a clean interface for interacting with objects.",
  },
  {
    id: "4",
    text: "Which of the following is NOT a pillar of object-oriented programming?",
    options: [
      { id: "4a", text: "Encapsulation", isCorrect: false },
      { id: "4b", text: "Inheritance", isCorrect: false },
      { id: "4c", text: "Polymorphism", isCorrect: false },
      { id: "4d", text: "Compilation", isCorrect: true },
    ],
    explanation:
      "The four pillars of OOP are encapsulation, inheritance, polymorphism, and abstraction. Compilation is a process, not a pillar.",
  },
  {
    id: "5",
    text: "Polymorphism allows objects of different types to be treated as objects of a common base type.",
    options: [
      { id: "5a", text: "True", isCorrect: true },
      { id: "5b", text: "False", isCorrect: false },
    ],
    explanation:
      "Polymorphism enables a single interface to represent different underlying forms (data types).",
  },
];

export default function QuizConfigStep({
  pdfUrl,
  availableCourses,
  onQuizGenerated,
  onError,
}: QuizConfigStepProps) {
  const [quizConfig, setQuizConfig] = useState<QuizConfig>({
    title: "",
    courseId: "",
    questionCount: 10,
    difficultyLevel: "medium",
    questionTypes: ["multiple-choice"],
  });

  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [processingProgress, setProcessingProgress] = useState<number>(0);

  const generateQuestionsWithAI = async (): Promise<Question[]> => {
    if (!pdfUrl) return [];

    setIsProcessing(true);
    setProcessingProgress(0);

    try {
      // Start progress indicator
      const progressInterval = setInterval(() => {
        setProcessingProgress((prev) => {
          if (prev >= 95) {
            clearInterval(progressInterval);
            return 95;
          }
          return prev + 5;
        });
      }, 500);

      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 3000));

      /* 
      // COMMENTED OUT: Backend API call
      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      // API endpoint to Express backend
      const response = await fetch("http://localhost:3000/api/generate-quiz", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.id}`,
        },
        body: JSON.stringify({
          pdfUrl,
          config: quizConfig,
        }),
      });

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const data = await response.json();
      */

      // Complete progress
      clearInterval(progressInterval);
      setProcessingProgress(100);

      // Return mock questions instead of API response
      return MOCK_QUESTIONS.slice(0, quizConfig.questionCount);
    } catch (error) {
      console.error("Error generating questions:", error);
      onError("Failed to generate questions");
      return [];
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSubmitConfig = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate configuration
    if (
      !quizConfig.title ||
      !quizConfig.courseId ||
      quizConfig.questionCount < 1 ||
      quizConfig.questionTypes.length === 0
    ) {
      onError("Please complete all required fields");
      return;
    }

    // Generate questions
    const questions = await generateQuestionsWithAI();
    if (questions.length > 0) {
      // Pass generated quiz to parent component
      onQuizGenerated({
        title: quizConfig.title,
        courseId: quizConfig.courseId,
        questions: questions,
      });
    }
  };

  return (
    <div className="space-y-6">
      <p className="text-gray-600">
        Configure your quiz settings. Our AI will use these parameters to
        generate appropriate questions.
      </p>

      <form onSubmit={handleSubmitConfig} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Quiz Title"
            placeholder="Enter quiz title"
            value={quizConfig.title}
            onChange={(e) =>
              setQuizConfig({ ...quizConfig, title: e.target.value })
            }
            required
          />

          <Select
            label="Course"
            placeholder="Select course"
            value={quizConfig.courseId}
            onChange={(e) =>
              setQuizConfig({ ...quizConfig, courseId: e.target.value })
            }
            required
          >
            {availableCourses.map((course) => (
              <SelectItem key={course.id}>{course.name}</SelectItem>
            ))}
          </Select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            type="number"
            min={1}
            max={50}
            label="Number of Questions"
            placeholder="Enter number of questions"
            value={quizConfig.questionCount.toString()}
            onChange={(e) =>
              setQuizConfig({
                ...quizConfig,
                questionCount: parseInt(e.target.value) || 10,
              })
            }
            required
          />

          <Select
            label="Difficulty Level"
            placeholder="Select difficulty"
            value={quizConfig.difficultyLevel}
            onChange={(e) =>
              setQuizConfig({
                ...quizConfig,
                difficultyLevel: e.target.value as
                  | "easy"
                  | "medium"
                  | "hard"
                  | "mixed",
              })
            }
            required
          >
            <SelectItem key="easy" value="easy">
              Easy
            </SelectItem>
            <SelectItem key="medium" value="medium">
              Medium
            </SelectItem>
            <SelectItem key="hard" value="hard">
              Hard
            </SelectItem>
            <SelectItem key="mixed" value="mixed">
              Mixed Difficulty
            </SelectItem>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Question Types</label>
          <div className="flex flex-wrap gap-4">
            <Checkbox
              isSelected={quizConfig.questionTypes.includes("multiple-choice")}
              onValueChange={(isSelected) => {
                if (isSelected) {
                  setQuizConfig({
                    ...quizConfig,
                    questionTypes: [
                      ...quizConfig.questionTypes,
                      "multiple-choice",
                    ],
                  });
                } else {
                  setQuizConfig({
                    ...quizConfig,
                    questionTypes: quizConfig.questionTypes.filter(
                      (type) => type !== "multiple-choice"
                    ),
                  });
                }
              }}
            >
              Multiple Choice
            </Checkbox>

            <Checkbox
              isSelected={quizConfig.questionTypes.includes("true-false")}
              onValueChange={(isSelected) => {
                if (isSelected) {
                  setQuizConfig({
                    ...quizConfig,
                    questionTypes: [...quizConfig.questionTypes, "true-false"],
                  });
                } else {
                  setQuizConfig({
                    ...quizConfig,
                    questionTypes: quizConfig.questionTypes.filter(
                      (type) => type !== "true-false"
                    ),
                  });
                }
              }}
            >
              True/False
            </Checkbox>

            <Checkbox
              isSelected={quizConfig.questionTypes.includes("short-answer")}
              onValueChange={(isSelected) => {
                if (isSelected) {
                  setQuizConfig({
                    ...quizConfig,
                    questionTypes: [
                      ...quizConfig.questionTypes,
                      "short-answer",
                    ],
                  });
                } else {
                  setQuizConfig({
                    ...quizConfig,
                    questionTypes: quizConfig.questionTypes.filter(
                      (type) => type !== "short-answer"
                    ),
                  });
                }
              }}
            >
              Short Answer
            </Checkbox>
          </div>
        </div>

        {/* AI Processing Progress */}
        {isProcessing && (
          <div className="space-y-2 mt-6">
            <div className="flex justify-between">
              <div className="flex items-center gap-2">
                <Spinner size="sm" />
                <span className="text-sm text-gray-600">
                  AI Processing PDF Content...
                </span>
              </div>
              <span className="text-sm font-medium">{processingProgress}%</span>
            </div>
            <Progress
              aria-label="Processing progress"
              value={processingProgress}
              className="h-2"
              classNames={{
                indicator: "bg-gradient-to-r from-blue-500 to-indigo-600",
              }}
            />
            <p className="text-sm text-gray-500 italic">
              Our AI is analyzing the document and generating quality questions
              based on your configuration
            </p>
          </div>
        )}

        {/* Submit Button */}
        <div className="flex justify-end pt-4">
          <Button
            type="submit"
            color="primary"
            isDisabled={
              !quizConfig.title ||
              !quizConfig.courseId ||
              quizConfig.questionCount < 1 ||
              quizConfig.questionTypes.length === 0 ||
              isProcessing
            }
          >
            {isProcessing ? (
              <Spinner size="sm" />
            ) : (
              <div className="flex items-center gap-2">
                <span>Generate & Save Quiz</span>
                <Zap size={16} />
              </div>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
