import { useState } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
} from "@heroui/react";
import { FileText } from "lucide-react";
import { PDFQuizGeneratorModalProps, Question } from "@/types";
import PDFUploadStep from "./PDFUploadStep";
import QuizConfigStep from "./quizConfigStep";

export default function PDFQuizGeneratorModal({
  isOpen,
  onClose,
  onQuizGenerated,
  availableCourses,
}: PDFQuizGeneratorModalProps) {
  // State for multi-step process
  const [step, setStep] = useState<number>(1);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null);


  const handleUploadComplete = (url: string) => {
    setPdfUrl(url);
    setStep(2);
  };

  const handleError = (errorMessage: string) => {
    setError(errorMessage);
  };

  const handleQuizGenerated = (quiz: {
    title: string;
    courseId: string;
    questions: Question[];
  }) => {
    // Pass generated quiz to parent component
    onQuizGenerated(quiz);
    // Close modal
    handleClose();
  };

  const resetModal = () => {
    setStep(1);
    setPdfUrl(null);
    setError(null);
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  const handleBack = () => {
    if (step === 2) {
      setStep(1);
    }
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
            <PDFUploadStep
              onUploadComplete={handleUploadComplete}
              pdfFile={pdfFile}
              setPdfFile={setPdfFile}
              onError={handleError}
            />
          )}

          {step === 2 && pdfUrl && (
            <QuizConfigStep
              pdfUrl=""
              pdfFile={pdfFile}
              availableCourses={availableCourses}
              onQuizGenerated={handleQuizGenerated}
              onError={handleError}
            />
          )}

          {/* Error Display */}
          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}
        </ModalBody>

        <ModalFooter>
          <Button
            variant="flat"
            onPress={step === 1 ? handleClose : handleBack}
          >
            {step === 1 ? "Cancel" : "Back"}
          </Button>
          {/* The action buttons are now handled within each step component */}
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
