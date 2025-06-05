// src/components/modals/PDFUploadStep.tsx
import { useState, useRef } from "react";
import { Button, Progress, Spinner } from "@heroui/react";
import { FileUp, CheckCircle, AlertCircle } from "lucide-react";
import { supabase } from "@/supabaseClient";

interface PDFUploadStepProps {
  onUploadComplete: (url: string) => void;
  onError: (error: string) => void;
  pdfFile: File | null;
  setPdfFile: (file: File | null) => void;
}

export default function PDFUploadStep({
  onUploadComplete,
  onError,
  pdfFile,
  setPdfFile,
}: PDFUploadStepProps) {
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      // Check if file is PDF
      if (file.type !== "application/pdf") {
        const errorMsg = "Please upload a PDF file";
        setError(errorMsg);
        onError(errorMsg);
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
        const errorMsg = "Please upload a PDF file";
        setError(errorMsg);
        onError(errorMsg);
        return;
      }

      setPdfFile(file);
      setError(null);
    }
  };

  const uploadPdfToStorage = async (): Promise<string | null> => {
    if (!pdfFile) {
      const errorMsg = "No file selected";
      setError(errorMsg);
      onError(errorMsg);
      return null;
    }

    // Validate file type and size
    if (!pdfFile.type.match(/pdf$/) && !pdfFile.name.match(/\.pdf$/i)) {
      const errorMsg = "Only PDF files are allowed";
      setError(errorMsg);
      onError(errorMsg);
      return null;
    }

    const maxSizeMB = 50;
    if (pdfFile.size > maxSizeMB * 1024 * 1024) {
      const errorMsg = `File size exceeds ${maxSizeMB}MB limit`;
      setError(errorMsg);
      onError(errorMsg);
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
      const errorMsg = `Upload failed: ${(error as Error).message}`;
      setError(errorMsg);
      onError(errorMsg);
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const handleUpload = async () => {
    const url = await uploadPdfToStorage();
    if (url) {
      onUploadComplete(url);
    }
  };

  return (
    <div className="space-y-6">
      <p className="text-gray-600">
        Upload a PDF document to generate quiz questions automatically using AI.
        Our system will analyze the content and create relevant questions.
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
              <p className="font-medium text-gray-800">{pdfFile.name}</p>
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
                if (fileInputRef.current) fileInputRef.current.value = "";
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
              <p className="text-sm text-gray-500">Max file size: 50MB</p>
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
            <span className="text-sm font-medium">{uploadProgress}%</span>
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

      {/* Upload Button */}
      <div className="flex justify-end">
        <Button
          color="primary"
          isDisabled={!pdfFile || isUploading}
          onClick={handleUpload}
        >
          {isUploading ? <Spinner size="sm" /> : "Upload & Continue"}
        </Button>
      </div>
    </div>
  );
}
