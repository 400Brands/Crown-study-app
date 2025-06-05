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
import { Zap, AlertCircle } from "lucide-react";
import { QuizConfig, Question } from "@/types";
import { GoogleGenAI } from "@google/genai";

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
    courseId: "",
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
      throw new Error(`Failed to extract text: ${error.message}`);
    }
  };

  // Fetch PDF from URL and extract text with CORS handling
  const fetchAndExtractPdf = async (url: string): Promise<string> => {
    try {
      // First try direct fetch
      let response;
      try {
        response = await fetch(url, {
          mode: "cors",
          headers: {
            Accept: "application/pdf",
          },
        });
      } catch (corsError) {
        console.warn("Direct fetch failed, trying proxy approach:", corsError);

        // Try with a CORS proxy as fallback
        const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;
        response = await fetch(proxyUrl);
      }

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const arrayBuffer = await response.arrayBuffer();

      // Check if we actually got a PDF
      const uint8Array = new Uint8Array(arrayBuffer);
      const pdfSignature = uint8Array.slice(0, 4);
      const isPdf =
        pdfSignature[0] === 0x25 && // %
        pdfSignature[1] === 0x50 && // P
        pdfSignature[2] === 0x44 && // D
        pdfSignature[3] === 0x46; // F

      if (!isPdf) {
        throw new Error("The fetched file is not a valid PDF");
      }

      const pdfParse = await import("pdf-parse");
      const data = await pdfParse.default(Buffer.from(arrayBuffer));

      if (!data.text || data.text.trim().length === 0) {
        throw new Error(
          "No text could be extracted from this PDF. It may be image-based or password-protected."
        );
      }

      return data.text;
    } catch (error) {
      console.error("PDF fetch/extraction error:", error);

      // Provide more specific error messages
      if (
        error instanceof TypeError &&
        error.message.includes("Failed to fetch")
      ) {
        throw new Error(
          "Unable to access PDF due to CORS restrictions. Please upload the PDF file directly instead of using a URL."
        );
      } else if (error.message.includes("HTTP 400")) {
        throw new Error(
          "PDF URL is invalid or the file is not accessible. Please check the URL or try uploading the file directly."
        );
      } else if (error.message.includes("HTTP 403")) {
        throw new Error(
          "Access denied to the PDF file. Please check permissions or upload the file directly."
        );
      } else if (error.message.includes("HTTP 404")) {
        throw new Error(
          "PDF file not found at the provided URL. Please verify the URL is correct."
        );
      } else {
        throw new Error(`Failed to process PDF: ${error.message}`);
      }
    }
  };

  // Improved JSON cleaning function
  const cleanAndParseJSON = (text: string): any => {
    let jsonText = text.trim();

    // Remove markdown code blocks
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

      if (!pdfText.trim()) {
        throw new Error("No text could be extracted from the PDF");
      }

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

      const prompt = `You are an expert quiz generator. Analyze the following document text and create ${quizConfig.questionCount} questions based on these requirements:
- Difficulty: ${quizConfig.difficultyLevel}
- Question types: ${questionTypesText}

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

      let lastError: Error | null = null;

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
      let errorMessage = "An unexpected error occurred";

      if (error instanceof Error) {
        if (
          error.message.includes("overloaded") ||
          error.message.includes("503")
        ) {
          errorMessage =
            "The AI service is currently overloaded. Please try again in a few moments.";
        } else if (error.message.includes("API key")) {
          errorMessage =
            "AI service configuration error. Please contact support.";
        } else {
          errorMessage = error.message;
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
      !quizConfig.courseId ||
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
        courseId: quizConfig.courseId,
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

          <Select
            label="Course"
            placeholder="Select course"
            selectedKeys={quizConfig.courseId ? [quizConfig.courseId] : []}
            onSelectionChange={(keys) => {
              const selectedKey = Array.from(keys)[0] as string;
              setQuizConfig({ ...quizConfig, courseId: selectedKey || "" });
            }}
            required
            isDisabled={isProcessing}
          >
            {availableCourses.map((course) => (
              <SelectItem key={course.id} value={course.id}>
                {course.name}
              </SelectItem>
            ))}
          </Select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            type="number"
            min={1}
            max={50}
            label="Number of Questions"
            placeholder="10"
            value={quizConfig.questionCount.toString()}
            onChange={(e) =>
              setQuizConfig({
                ...quizConfig,
                questionCount: Math.min(
                  50,
                  Math.max(1, parseInt(e.target.value) || 10)
                ),
              })
            }
            required
            isDisabled={isProcessing}
          />

          <Select
            label="Difficulty Level"
            placeholder="Select difficulty"
            selectedKeys={[quizConfig.difficultyLevel]}
            onSelectionChange={(keys) => {
              const selectedKey = Array.from(keys)[0] as string;
              setQuizConfig({
                ...quizConfig,
                difficultyLevel: selectedKey as any,
              });
            }}
            required
            isDisabled={isProcessing}
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
                <p className="text-red-700 text-sm mt-1">{processingError}</p>
                {processingError.includes("overloaded") && (
                  <button
                    onClick={handleSubmitConfig}
                    className="mt-2 text-sm text-red-600 underline hover:text-red-800"
                  >
                    Click here to try again
                  </button>
                )}
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
              !quizConfig.courseId ||
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