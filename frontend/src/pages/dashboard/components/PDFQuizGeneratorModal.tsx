// src/components/modals/PDFQuizGeneratorModal.tsx
import { useState, useRef } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Select,
  SelectItem,
  Checkbox,
  Spinner,
  Progress,
} from "@heroui/react";
import { FileUp, FileText, CheckCircle, AlertCircle, Zap } from "lucide-react";
import { supabase } from "@/supabaseClient";
import { PDFQuizGeneratorModalProps, Question, QuizConfig } from "@/types";

export default function PDFQuizGeneratorModal({
  isOpen,
  onClose,
  onQuizGenerated,
  availableCourses,
}: PDFQuizGeneratorModalProps) {
  // State for multi-step process
  const [step, setStep] = useState<number>(1);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [processingProgress, setProcessingProgress] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  // State for quiz configuration
  const [quizConfig, setQuizConfig] = useState<QuizConfig>({
    title: "",
    courseId: "",
    questionCount: 10,
    difficultyLevel: "medium",
    questionTypes: ["multiple-choice"],
  });

  // State for generated questions
  const [generatedQuestions, setGeneratedQuestions] = useState<Question[]>([]);

  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handlers
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      // Check if file is PDF
      if (file.type !== "application/pdf") {
        setError("Please upload a PDF file");
        return;
      }

      setPdfFile(file);
      setError(null);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      // Check if file is PDF
      if (file.type !== "application/pdf") {
        setError("Please upload a PDF file");
        return;
      }

      setPdfFile(file);
      setError(null);
    }
  };

  // Update the uploadPdfToStorage function in PDFQuizGeneratorModal.tsx
  const uploadPdfToStorage = async (): Promise<string | null> => {
    if (!pdfFile) {
      setError("No file selected");
      return null;
    }

    // Validate file type and size
    if (!pdfFile.type.match(/pdf$/) && !pdfFile.name.match(/\.pdf$/i)) {
      setError("Only PDF files are allowed");
      return null;
    }

    const maxSizeMB = 50;
    if (pdfFile.size > maxSizeMB * 1024 * 1024) {
      setError(`File size exceeds ${maxSizeMB}MB limit`);
      return null;
    }

    setIsUploading(true);
    setUploadProgress(0);
    setError(null);

    try {
      // Get current authenticated user
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        throw new Error(authError?.message || "User not authenticated");
      }

      // Create user-specific folder path
      const sanitizedFileName = pdfFile.name.replace(/[^a-zA-Z0-9._-]/g, "_");
      const filePath = `${user.id}/${Date.now()}_${sanitizedFileName}`;

      // Simulate upload progress (Supabase doesn't provide real progress)
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => Math.min(prev + 10, 90));
      }, 300);

      // Upload with retry logic
      let uploadAttempts = 0;
      const maxAttempts = 3;
      let uploadError: Error | null = null;

      while (uploadAttempts < maxAttempts) {
        try {
          const { error: uploadError } = await supabase.storage
            .from("quiz-pdfs")
            .upload(filePath, pdfFile, {
              cacheControl: "3600",
              upsert: false,
              contentType: "application/pdf",
            });

          if (!uploadError) break;
          throw uploadError;
        } catch (error) {
          uploadAttempts++;
          uploadError = error as Error;
          if (uploadAttempts >= maxAttempts) break;
          await new Promise((resolve) =>
            setTimeout(resolve, 1000 * uploadAttempts)
          );
        }
      }

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (uploadError) throw uploadError;

      // Get public URL (or signed URL if files should be private)
      const {
        data: { publicUrl },
      } = supabase.storage.from("quiz-pdfs").getPublicUrl(filePath, {
        download: false,
      });

      return publicUrl;
    } catch (error) {
      console.error("Upload failed:", error);
      setError(`Upload failed: ${(error as Error).message}`);
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const handleUpload = async () => {
    const url = await uploadPdfToStorage();
    if (url) {
      setPdfUrl(url);
      setStep(2);
    }
  };

  const generateQuestionsWithAI = async () => {
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

      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      // Fix: Update API endpoint to point to Express backend
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

      // Complete progress
      clearInterval(progressInterval);
      setProcessingProgress(100);

      return data.questions;
    } catch (error) {
      console.error("Error generating questions:", error);
      setError("Failed to generate questions");
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
      setError("Please complete all required fields");
      return;
    }

    // Generate questions
    const questions = await generateQuestionsWithAI();
    if (questions.length > 0) {
      setGeneratedQuestions(questions);

      // Skip step 3 (preview) and directly finalize quiz
      handleFinalize();
    }
  };

  const handleFinalize = () => {
    // Pass generated quiz to parent component
    onQuizGenerated({
      title: quizConfig.title,
      courseId: quizConfig.courseId,
      questions: generatedQuestions,
    });

    // Close modal
    handleClose();
  };

  const resetModal = () => {
    setStep(1);
    setPdfFile(null);
    setPdfUrl(null);
    setError(null);
    setIsUploading(false);
    setUploadProgress(0);
    setIsProcessing(false);
    setProcessingProgress(0);
    setQuizConfig({
      title: "",
      courseId: "",
      questionCount: 10,
      difficultyLevel: "medium",
      questionTypes: ["multiple-choice"],
    });
    setGeneratedQuestions([]);
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      size="4xl"
      scrollBehavior="inside"
    >
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <FileText className="text-blue-500" size={24} />
            <span>Generate Quiz from PDF</span>
          </div>
          {/* Stepper */}
          <div className="w-full flex items-center mt-4">
            <div
              className={`flex-1 h-1 ${step >= 1 ? "bg-blue-500" : "bg-gray-200"}`}
            ></div>
            <div
              className={`w-8 h-8 flex items-center justify-center rounded-full ${
                step >= 1
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 text-gray-500"
              }`}
            >
              1
            </div>
            <div
              className={`flex-1 h-1 ${step >= 2 ? "bg-blue-500" : "bg-gray-200"}`}
            ></div>
            <div
              className={`w-8 h-8 flex items-center justify-center rounded-full ${
                step >= 2
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 text-gray-500"
              }`}
            >
              2
            </div>
            <div className="flex-1 h-1 bg-gray-200"></div>
          </div>
        </ModalHeader>

        <ModalBody>
          {step === 1 && (
            <div className="space-y-6">
              <p className="text-gray-600">
                Upload a PDF document to generate quiz questions automatically
                using AI. Our system will analyze the content and create
                relevant questions.
              </p>

              {/* Upload Area */}
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                  pdfFile
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-300 hover:border-blue-400 hover:bg-blue-50"
                }`}
                onClick={() => fileInputRef.current?.click()}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="application/pdf"
                  className="hidden"
                />

                {pdfFile ? (
                  <div className="flex flex-col items-center gap-3">
                    <CheckCircle size={40} className="text-green-500" />
                    <div>
                      <p className="font-medium text-gray-800">
                        {pdfFile.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {(pdfFile.size / (1024 * 1024)).toFixed(2)} MB
                      </p>
                    </div>
                    <Button
                      size="sm"
                      color="danger"
                      variant="flat"
                      onClick={(e) => {
                        e.stopPropagation();
                        setPdfFile(null);
                        if (fileInputRef.current)
                          fileInputRef.current.value = "";
                      }}
                    >
                      Remove File
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-3">
                    <FileUp size={40} className="text-gray-400" />
                    <div>
                      <p className="font-medium text-gray-800">
                        Drop your PDF file here or click to browse
                      </p>
                      <p className="text-sm text-gray-500">
                        Max file size: 50MB
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Error Message */}
              {error && (
                <div className="flex items-center gap-2 text-red-500">
                  <AlertCircle size={16} />
                  <span>{error}</span>
                </div>
              )}

              {/* Upload Progress */}
              {isUploading && (
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">
                      Uploading to server...
                    </span>
                    <span className="text-sm font-medium">
                      {uploadProgress}%
                    </span>
                  </div>
                  <Progress
                    aria-label="Upload progress"
                    value={uploadProgress}
                    className="h-2"
                    classNames={{
                      indicator: "bg-gradient-to-r from-blue-500 to-indigo-600",
                    }}
                  />
                </div>
              )}
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <p className="text-gray-600">
                Configure your quiz settings. Our AI will use these parameters
                to generate appropriate questions.
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
                    <SelectItem>Easy</SelectItem>
                    <SelectItem>Medium</SelectItem>
                    <SelectItem>Hard</SelectItem>
                    <SelectItem>Mixed Difficulty</SelectItem>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Question Types</label>
                  <div className="flex flex-wrap gap-4">
                    <Checkbox
                      isSelected={quizConfig.questionTypes.includes(
                        "multiple-choice"
                      )}
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
                      isSelected={quizConfig.questionTypes.includes(
                        "true-false"
                      )}
                      onValueChange={(isSelected) => {
                        if (isSelected) {
                          setQuizConfig({
                            ...quizConfig,
                            questionTypes: [
                              ...quizConfig.questionTypes,
                              "true-false",
                            ],
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
                      isSelected={quizConfig.questionTypes.includes(
                        "short-answer"
                      )}
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
                          OpenAI Processing PDF Content...
                        </span>
                      </div>
                      <span className="text-sm font-medium">
                        {processingProgress}%
                      </span>
                    </div>
                    <Progress
                      aria-label="Processing progress"
                      value={processingProgress}
                      className="h-2"
                      classNames={{
                        indicator:
                          "bg-gradient-to-r from-blue-500 to-indigo-600",
                      }}
                    />
                    <p className="text-sm text-gray-500 italic">
                      Our AI is analyzing the document and generating quality
                      questions based on your configuration
                    </p>
                  </div>
                )}
              </form>
            </div>
          )}
        </ModalBody>

        <ModalFooter>
          {step === 1 && (
            <>
              <Button variant="flat" onClick={handleClose}>
                Cancel
              </Button>
              <Button
                color="primary"
                isDisabled={!pdfFile || isUploading}
                onClick={handleUpload}
              >
                {isUploading ? <Spinner size="sm" /> : "Upload & Continue"}
              </Button>
            </>
          )}

          {step === 2 && (
            <>
              <Button variant="flat" onClick={() => setStep(1)}>
                Back
              </Button>
              <Button
                color="primary"
                isDisabled={
                  !quizConfig.title ||
                  !quizConfig.courseId ||
                  quizConfig.questionCount < 1 ||
                  quizConfig.questionTypes.length === 0 ||
                  isProcessing
                }
                onClick={handleSubmitConfig}
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
            </>
          )}
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
