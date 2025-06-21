//@ts-nocheck

// src/components/modals/QuizConfigStep.tsx
import { useEffect, useState } from "react";
import {
  Button,
  Input,
  Select,
  SelectItem,
  Checkbox,
  Spinner,
  Progress,
} from "@heroui/react";
import { Zap, AlertCircle } from "lucide-react";
import { QuizConfig, Question } from "@/types";
import { GoogleGenAI } from "@google/genai";
import { supabase } from "@/supabaseClient";

interface QuizConfigStepProps {
  pdfUrl: string;
  pdfFile?: File | null;
  availableCourses: Array<{ id: string; name: string }>;
  onQuizGenerated: (quiz: {
    title: string;
    courseId: string;
    questions: Question[];
  }) => void;
  onError: (error: string) => void;
}

interface ProcessingStage {
  stage: "extracting" | "analyzing" | "generating" | "formatting";
  message: string;
  progress: number;
}

const PROCESSING_STAGES: ProcessingStage[] = [
  { stage: "extracting", message: "Extracting text from PDF...", progress: 25 },
  {
    stage: "analyzing",
    message: "Analyzing document content...",
    progress: 50,
  },
  {
    stage: "generating",
    message: "Generating quiz questions...",
    progress: 75,
  },
  {
    stage: "formatting",
    message: "Formatting and validating...",
    progress: 100,
  },
];

export default function QuizConfigStep({
  pdfUrl,
  pdfFile,
  availableCourses,
  onQuizGenerated,
  onError,
}: QuizConfigStepProps) {
  const [quizConfig, setQuizConfig] = useState<QuizConfig>({
    title: "",
    course: "",
    questionCount: 10,
    difficultyLevel: "medium",
    questionTypes: ["multiple-choice"],
  });

  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [currentStage, setCurrentStage] = useState<ProcessingStage | null>(
    null
  );
  const [processingError, setProcessingError] = useState<string>("");

  // Initialize Gemini AI
  const initializeGemini = () => {
    const apiKey = "AIzaSyDouCzIB0-ZRJyLL38nhNsiXavYmNvJQkw";
    if (!apiKey) {
      throw new Error(
        "Gemini API key not found. Please set NEXT_PUBLIC_GEMINI_API_KEY or GEMINI_API_KEY in your environment variables."
      );
    }
    return new GoogleGenAI({ apiKey });
  };

  // Extract text from PDF with enhanced error handling
  const extractPdfText = async (file: File): Promise<string> => {
    try {
      // Use PDF.js which is browser-compatible
      const pdfjs = await import("pdfjs-dist");
      pdfjs.GlobalWorkerOptions.workerSrc =
        "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js";

      const arrayBuffer = await file.arrayBuffer();
      const loadingTask = pdfjs.getDocument(arrayBuffer);
      const pdf = await loadingTask.promise;

      let fullText = "";
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        fullText += textContent.items.map((item) => item.str).join(" ") + "\n";
      }

      console.log(fullText);

      return fullText;
    } catch (error) {
      console.error("PDF extraction error:", error);
    }
  };

  // Fetch PDF from URL and extract text with CORS handling
  const fetchAndExtractPdf = async (url: string): Promise<string> => {
    try {
      // First verify it's a PDF URL
      if (!url.toLowerCase().endsWith(".pdf")) {
        throw new Error("Only PDF files are supported");
      }

      // Improved URL parsing for Supabase storage
      const parseSupabaseUrl = (url: string) => {
        try {
          const urlObj = new URL(url);
          const pathParts = urlObj.pathname.split("/").filter(Boolean);

          if (
            pathParts.length >= 4 &&
            pathParts[0] === "storage" &&
            pathParts[1] === "v1" &&
            pathParts[2] === "object"
          ) {
            const bucketName =
              pathParts[3] === "sign" || pathParts[3] === "public"
                ? pathParts[4]
                : pathParts[3];
            const filePath = pathParts
              .slice(
                pathParts[3] === "sign" || pathParts[3] === "public" ? 5 : 4
              )
              .join("/");
            return { bucketName, filePath };
          }
          throw new Error("URL does not match Supabase storage pattern");
        } catch (e) {
          throw new Error("Invalid Supabase storage URL");
        }
      };

      const { bucketName, filePath } = parseSupabaseUrl(url);

      // Download the file via Supabase Storage
      const { data, error } = await supabase.storage
        .from(bucketName)
        .download(filePath);

      if (error) {
        throw error;
      }

      // Continue with PDF processing...
      const arrayBuffer = await data.arrayBuffer();
      const pdfjs = await import("pdfjs-dist");
      pdfjs.GlobalWorkerOptions.workerSrc =
        "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js";

      const pdf = await pdfjs.getDocument(arrayBuffer).promise;
      let fullText = "";

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        fullText += textContent.items.map((item) => item.str).join(" ") + "\n";
      }

      if (!fullText.trim()) {
        throw new Error("No text could be extracted from this PDF");
      }

      return fullText;
    } catch (error) {
      console.error("PDF fetch/extraction error:", error);
      throw new Error(
        error instanceof Error ? error.message : "Failed to process PDF"
      );
    }
  };

  // Improved JSON cleaning function
  const cleanAndParseJSON = (text: string | undefined): any => {
    // First check if we have any text to work with
    if (text === undefined || text === null) {
      throw new Error("No text provided to parse");
    }

    // Ensure it's a string
    if (typeof text !== "string") {
      throw new Error(`Expected string but got ${typeof text}`);
    }

    let jsonText = text.trim();

    // If we got an empty string after trimming
    if (jsonText.length === 0) {
      throw new Error("Empty text provided to parse");
    }

    // Rest of your existing cleaning logic...
    const codeBlockMatch = jsonText.match(/```(?:json)?\n?([\s\S]*?)\n?```/);
    if (codeBlockMatch) {
      jsonText = codeBlockMatch[1].trim();
    }

    // Find JSON array bounds
    const startIndex = jsonText.indexOf("[");
    const lastIndex = jsonText.lastIndexOf("]");

    if (startIndex !== -1 && lastIndex !== -1 && lastIndex > startIndex) {
      jsonText = jsonText.substring(startIndex, lastIndex + 1);
    }

    // Fix common JSON syntax errors
    jsonText = jsonText
      // Fix malformed object properties like {"id": "a": "text"} to {"id": "a", "text": "text"}
      .replace(/("id":\s*"[^"]*"):\s*([^,}]+)/g, '$1, "text": $2')
      // Fix trailing commas before closing brackets/braces
      .replace(/,(\s*[}\]])/g, "$1")
      // Fix missing commas between objects
      .replace(/}(\s*){/g, "},\n$1{")
      // Fix missing commas between array elements
      .replace(/](\s*)\[/g, "],\n$1[");

    try {
      return JSON.parse(jsonText);
    } catch (error) {
      console.error("JSON parsing failed, attempting manual cleanup:", error);

      // More aggressive cleanup for malformed JSON
      try {
        // Try to fix specific pattern from your error: {"id": "a": "MongoDB"}
        jsonText = jsonText.replace(
          /"id":\s*"([^"]*)":\s*"([^"]*)"/g,
          '"id": "$1", "text": "$2"'
        );

        return JSON.parse(jsonText);
      } catch (secondError) {
        console.error("Second parsing attempt failed:", secondError);
        throw new Error("Unable to parse AI response as valid JSON");
      }
    }
  };

  // Add this useEffect to auto-populate title and course when pdfFile/pdfUrl changes
  // Update the useEffect for auto-populating
  useEffect(() => {
    const extractTitleFromPdf = () => {
      let title = "";
      let course = "";

      if (pdfFile) {
        const fileName = pdfFile.name.replace(/\.pdf$/i, "");
        title = fileName
          .split(/[_\-\s]+/)
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" ");

        const words = fileName.split(/[_\-\s]+/);
        course = words.length > 1 ? words.slice(0, 2).join(" ") : words[0];
      } else if (pdfUrl) {
        const urlParts = pdfUrl.split("/");
        const lastPart = urlParts[urlParts.length - 1].replace(/\.pdf$/i, "");
        title = lastPart
          .split(/[_\-\s]+/)
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" ");

        const words = lastPart.split(/[_\-\s]+/);
        course = words.length > 1 ? words[0] : "General";
      }

      setQuizConfig((prev) => ({
        ...prev,
        title: title || "PDF Quiz",
        course: course || "General", // Directly set course name
      }));
    };

    if (pdfFile || pdfUrl) {
      extractTitleFromPdf();
    }
  }, [pdfFile, pdfUrl]);

  // Generate questions using Gemini AI
  const MAX_RETRIES = 3;
  const INITIAL_RETRY_DELAY = 1000; // 1 second
  const MODEL_FALLBACK_ORDER = ["gemini-2.0-flash", "gemini-1.5-flash"];

  const generateQuestionsWithAI = async (): Promise<Question[]> => {
    setIsProcessing(true);
    setProcessingError("");

    try {
      // Stage 1: Extract PDF text
      setCurrentStage(PROCESSING_STAGES[0]);
      let pdfText: string;

      if (pdfFile) {
        pdfText = await extractPdfText(pdfFile);
      } else if (pdfUrl) {
        pdfText = await fetchAndExtractPdf(pdfUrl);
      } else {
        throw new Error("No PDF file or URL provided");
      }

      // Add explicit check for extracted text
      if (!pdfText?.trim()) {
        throw new Error("No text could be extracted from the PDF");
      }

      console.log("PDF text length:", pdfText?.length);
      

      // Stage 2: Analyze content
      setCurrentStage(PROCESSING_STAGES[1]);
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Stage 3: Generate questions with retry logic
      setCurrentStage(PROCESSING_STAGES[2]);
      const ai = initializeGemini();

      const questionTypesText = quizConfig.questionTypes
        .map((type) => {
          switch (type) {
            case "multiple-choice":
              return "multiple choice questions with 4 options each";
            case "true-false":
              return "true/false questions";
            case "short-answer":
              return "short answer questions";
            default:
              return type;
          }
        })
        .join(", ");

      // In the generateQuestionsWithAI function
      const prompt = `You are an expert quiz generator. Analyze the following document titled "${quizConfig.title}" and create ${quizConfig.questionCount} questions based on these requirements:
- Course: ${quizConfig.course || "General"}
- Difficulty: ${quizConfig.difficultyLevel}
- Question types: ${questionTypesText}

// ... rest of the prompt

CRITICAL FORMATTING REQUIREMENTS:
1. Return ONLY a valid JSON array - no explanatory text before or after
2. Each question object must have this EXACT structure:
{
  "id": "unique_string_id",
  "text": "question text here",
  "options": [
    {"id": "a", "text": "option text", "isCorrect": true},
    {"id": "b", "text": "option text", "isCorrect": false},
    {"id": "c", "text": "option text", "isCorrect": false},
    {"id": "d", "text": "option text", "isCorrect": false}
  ],
  "explanation": "brief explanation text"
}

3. Ensure proper JSON syntax - use double quotes, proper commas, no trailing commas
4. Each option must have "id", "text", and "isCorrect" properties
5. Only one option per question should have "isCorrect": true

DOCUMENT TEXT:
${pdfText}

Generate the JSON array now:`;

      let lastError: any;

      for (
        let modelIndex = 0;
        modelIndex < MODEL_FALLBACK_ORDER.length;
        modelIndex++
      ) {
        const model = MODEL_FALLBACK_ORDER[modelIndex];

        for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
          try {
            const response = await ai.models.generateContent({
              model: model,
              contents: prompt,
            });

            // Add this check
            if (!response?.text) {
              throw new Error("AI returned an empty response");
            }

            const text = response.text;

            // Stage 4: Format and validate
            setCurrentStage(PROCESSING_STAGES[3]);

            // Parse and clean JSON
            let questions;
            try {
              questions = cleanAndParseJSON(text);
            } catch (parseError) {
              console.error(
                "JSON parsing error:",
                parseError,
                "Original text:",
                text
              );
              throw new Error(
                "The AI returned an invalid JSON format. Please try again."
              );
            }

            // Validate that we have an array
            if (!Array.isArray(questions)) {
              throw new Error(
                "Expected an array of questions but got something else."
              );
            }

            // Validate and format questions
            const validatedQuestions = questions
              .map((q, index) => {
                // Ensure question has required properties
                if (!q || typeof q !== "object") {
                  console.warn(
                    `Question ${index} is not a valid object, skipping`
                  );
                  return null;
                }

                // Fix options if they're malformed
                let options = [];
                if (Array.isArray(q.options)) {
                  options = q.options.map((opt, optIndex) => {
                    if (!opt || typeof opt !== "object") {
                      return {
                        id: `${q.id || index}_${optIndex}`,
                        text: `Option ${optIndex + 1}`,
                        isCorrect: false,
                      };
                    }
                    return {
                      id: opt.id || `${q.id || index}_${optIndex}`,
                      text: opt.text || `Option ${optIndex + 1}`,
                      isCorrect: Boolean(opt.isCorrect),
                    };
                  });
                }

                return {
                  id: q.id || `q_${index + 1}`,
                  text: q.text || `Question ${index + 1}`,
                  options: options,
                  explanation: q.explanation || "No explanation provided",
                };
              })
              .filter((q) => q !== null && q.text && q.options.length > 0);

            if (validatedQuestions.length === 0) {
              throw new Error(
                "No valid questions were generated. Please try again."
              );
            }

            console.log(
              "Successfully generated questions:",
              validatedQuestions
            );
            return validatedQuestions;
          } catch (error) {
            lastError = error;
            console.error(
              `Attempt ${attempt + 1} failed with model ${model}:`,
              error
            );

            if (
              error instanceof Error &&
              error.message.includes("overloaded")
            ) {
              // Calculate exponential backoff delay
              const delay = INITIAL_RETRY_DELAY * Math.pow(2, attempt);
              console.log(`Waiting ${delay}ms before retry...`);
              await new Promise((resolve) => setTimeout(resolve, delay));
            } else {
              // For non-retryable errors, break the retry loop
              break;
            }
          }
        }
      }

      throw (
        lastError ||
        new Error("Failed to generate questions after multiple attempts")
      );
    } catch (error) {
      console.error("Error generating questions:", error);
      let errorMessage = "Failed to process PDF";
      
      if (error instanceof Error) {
        errorMessage = error.message;
        if (error.message.includes("No text could be extracted")) {
          errorMessage = "The PDF appears to be image-based or empty. Please try a different PDF.";
        }
      }
  
      setProcessingError(errorMessage);
      onError(errorMessage);
      return [];
    } finally {
      setIsProcessing(false);
      setCurrentStage(null);
    }
  };

  const handleSubmitConfig = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate configuration
    if (
      !quizConfig.title ||
      !quizConfig.course ||
      quizConfig.questionCount < 1 ||
      quizConfig.questionCount > 50 ||
      quizConfig.questionTypes.length === 0
    ) {
      onError(
        "Please complete all required fields and ensure question count is between 1-50"
      );
      return;
    }

    if (!pdfFile && !pdfUrl) {
      onError("No PDF file or URL provided");
      return;
    }

    // Generate questions
    const questions = await generateQuestionsWithAI();
    if (questions.length > 0) {
      onQuizGenerated({
        title: quizConfig.title,
        courseId: quizConfig.course,
        questions: questions,
      });
    }
  };

  const handleQuestionTypeChange = (type: string, isSelected: boolean) => {
    if (isSelected) {
      setQuizConfig({
        ...quizConfig,
        questionTypes: [...quizConfig.questionTypes, type as any],
      });
    } else {
      // Ensure at least one question type is selected
      const newTypes = quizConfig.questionTypes.filter((t) => t !== type);
      if (newTypes.length > 0) {
        setQuizConfig({
          ...quizConfig,
          questionTypes: newTypes,
        });
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
        <div className="flex items-start gap-3">
          <Zap className="text-blue-600 mt-0.5" size={20} />
          <div>
            <h4 className="font-medium text-blue-900">
              AI-Powered Quiz Generation
            </h4>
            <p className="text-blue-700 text-sm mt-1">
              Our AI will analyze your PDF content and generate high-quality
              questions based on your specifications.
            </p>
            {pdfUrl && !pdfFile && (
              <div className="mt-2 p-2 bg-yellow-100 border border-yellow-300 rounded text-xs text-yellow-800">
                <strong>Note:</strong> Using PDF URL. If you encounter access
                issues, try uploading the file directly for better reliability.
              </div>
            )}
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmitConfig} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Quiz Title"
            placeholder="e.g., Chapter 5 Review Quiz"
            value={quizConfig.title}
            onChange={(e) =>
              setQuizConfig({ ...quizConfig, title: e.target.value })
            }
            required
            isDisabled={isProcessing}
          />
          {/* // In the form section of QuizConfigStep.tsx */}
          <Input
            label="Course"
            placeholder="Enter course name"
            value={quizConfig.course}
            onChange={(e) =>
              setQuizConfig({ ...quizConfig, course: e.target.value })
            }
            required
            isDisabled={isProcessing}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Number of Questions Select - Styled to match */}
          <div className="flex flex-col bg-gray-100 rounded-lg transition-all duration-200 hover:bg-gray-50 focus-within:bg-gray-50">
            <label
              htmlFor="questionCount"
              className="text-tiny text-gray-700 px-3 pt-2"
            >
              Number of Questions
            </label>
            <select
              id="questionCount"
              value={quizConfig.questionCount}
              onChange={(e) =>
                setQuizConfig({
                  ...quizConfig,
                  questionCount: parseInt(e.target.value),
                })
              }
              disabled={isProcessing}
              required
              className="w-full px-3 pb-2 bg-transparent text-sm text-gray-900 focus:outline-none disabled:opacity-50 appearance-none"
            >
              {[...Array(10)].map((_, i) => {
                const value = (i + 1) * 5;
                return (
                  <option key={value} value={value}>
                    {value}
                  </option>
                );
              })}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
          </div>

          {/* Difficulty Level Select */}
          <div className="flex flex-col p-1 bg-gray-200 rounded-lg transition-all duration-200 hover:bg-gray-50 focus-within:bg-gray-50">
            <label
              htmlFor="difficultyLevel"
              className="text-tiny text-gray-700 px-3 pt-1"
            >
              Difficulty Level
            </label>
            <select
              id="difficultyLevel"
              value={quizConfig.difficultyLevel}
              onChange={(e) =>
                setQuizConfig({
                  ...quizConfig,
                  difficultyLevel: e.target.value as any,
                })
              }
              disabled={isProcessing}
              required
              className="w-full px-3 pb-2 bg-transparent text-sm text-gray-900 focus:outline-none disabled:opacity-50 appearance-none"
            >
              <option value="">Select difficulty</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
              <option value="mixed">Mixed Difficulty</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
          </div>
        </div>
        <div className="space-y-3">
          <label className="text-sm font-medium text-gray-700">
            Question Types <span className="text-red-500">*</span>
          </label>
          <div className="flex flex-wrap gap-4">
            <Checkbox
              isSelected={quizConfig.questionTypes.includes("multiple-choice")}
              onValueChange={(isSelected) =>
                handleQuestionTypeChange("multiple-choice", isSelected)
              }
              isDisabled={isProcessing}
            >
              Multiple Choice
            </Checkbox>

            <Checkbox
              isSelected={quizConfig.questionTypes.includes("true-false")}
              onValueChange={(isSelected) =>
                handleQuestionTypeChange("true-false", isSelected)
              }
              isDisabled={isProcessing}
            >
              True/False
            </Checkbox>

            <Checkbox
              isSelected={quizConfig.questionTypes.includes("short-answer")}
              onValueChange={(isSelected) =>
                handleQuestionTypeChange("short-answer", isSelected)
              }
              isDisabled={isProcessing}
            >
              Short Answer
            </Checkbox>
          </div>
          {quizConfig.questionTypes.length === 0 && (
            <p className="text-red-500 text-sm">
              Please select at least one question type
            </p>
          )}
        </div>
        {/* Processing Status */}
        {isProcessing && currentStage && (
          <div className="bg-gray-50 p-4 rounded-lg border space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Spinner size="sm" color="primary" />
                <span className="text-sm font-medium text-gray-700">
                  {currentStage.message}
                </span>
              </div>
              <span className="text-sm font-medium text-gray-600">
                {currentStage.progress}%
              </span>
            </div>
            <Progress
              aria-label="Processing progress"
              value={currentStage.progress}
              className="h-2"
              classNames={{
                indicator: "bg-gradient-to-r from-blue-500 to-indigo-600",
              }}
            />
            <p className="text-xs text-gray-500">
              Please wait while our AI processes your document and generates
              questions...
            </p>
          </div>
        )}
        {/* Error Display */}
        {processingError && (
          <div className="bg-red-50 p-4 rounded-lg border border-red-200">
            <div className="flex items-start gap-3">
              <AlertCircle className="text-red-600 mt-0.5" size={20} />
              <div>
                <h4 className="font-medium text-red-900">Processing Error</h4>
                <p className="text-red-700 text-sm mt-1">
                  {processingError.includes("Invalid Supabase storage URL") ? (
                    <>
                      The resource URL format is invalid. Please contact
                      support.
                      <br />
                      <span className="text-xs text-red-600">
                        (Expected format:
                        https://[project].supabase.co/storage/v1/object/[bucket]/[path])
                      </span>
                    </>
                  ) : (
                    processingError
                  )}
                </p>
              </div>
            </div>
          </div>
        )}
        {/* Submit Button */}
        <div className="flex justify-end pt-4 border-t">
          <Button
            type="submit"
            color="primary"
            size="lg"
            isDisabled={
              !quizConfig.title ||
              !quizConfig.course ||
              quizConfig.questionCount < 1 ||
              quizConfig.questionTypes.length === 0 ||
              isProcessing ||
              (!pdfFile && !pdfUrl)
            }
            className="min-w-[200px]"
          >
            {isProcessing ? (
              <div className="flex items-center gap-2">
                <Spinner size="sm" color="white" />
                <span>Processing...</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Zap size={18} />
                <span>Generate Quiz with AI</span>
              </div>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
