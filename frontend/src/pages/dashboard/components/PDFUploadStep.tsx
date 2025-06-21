//@ts-nocheck

import { useState, useRef, useMemo } from "react";
import {
  Button,
  Progress,
  Spinner,
  Input,
  Select,
  SelectItem,
  Card,
  CardBody,
  Chip,
} from "@heroui/react";
import {
  FileUp,
  CheckCircle,
  AlertCircle,
  Search,
  BookOpen,
  FileText,
} from "lucide-react";
import { supabase } from "@/supabaseClient";
import { useStudyLibraryContext } from "../context/studyLibraryContext";

interface PDFUploadStepProps {
  onUploadComplete: (
    url: string,
    source?: "upload" | "existing",
    file?: File | null,
    resource?: any
  ) => void;
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
  const [activeTab, setActiveTab] = useState<"upload" | "existing">("upload");
  const [selectedResource, setSelectedResource] = useState<string | null>(null);

  const {
    resources,
    loading: resourcesLoading,
    searchTerm,
    setSearchTerm,
    courseFilter,
    setCourseFilter,
    typeFilter,
    setTypeFilter,
    courses,
    resourceTypes,
    paginatedResources,
    currentPage,
    setCurrentPage,
    totalPages,
  } = useStudyLibraryContext();

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Filter to only PDF resources
  // In your PDFUploadStep component
  const pdfResources = useMemo(() => {
    return resources.filter((resource) =>
      resource.file_url?.toLowerCase().endsWith(".pdf")
    );
  }, [resources]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type !== "application/pdf" && !file.name.match(/\.pdf$/i)) {
        const errorMsg = "Please upload a PDF file";
        setError(errorMsg);
        onError(errorMsg);
        return;
      }

      // Validate file size (50MB max)
      const maxSizeMB = 50;
      if (file.size > maxSizeMB * 1024 * 1024) {
        const errorMsg = `File size exceeds ${maxSizeMB}MB limit`;
        setError(errorMsg);
        onError(errorMsg);
        return;
      }

      setPdfFile(file);
      setSelectedResource(null);
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
      if (file.type !== "application/pdf" && !file.name.match(/\.pdf$/i)) {
        const errorMsg = "Please upload a PDF file";
        setError(errorMsg);
        onError(errorMsg);
        return;
      }
      setPdfFile(file);
      setSelectedResource(null);
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

    setIsUploading(true);
    setUploadProgress(0);
    setError(null);

    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();
      if (authError || !user)
        throw new Error(authError?.message || "User not authenticated");

      const sanitizedFileName = pdfFile.name.replace(/[^a-zA-Z0-9._-]/g, "_");
      const filePath = `${user.id}/${Date.now()}_${sanitizedFileName}`;

      // Simulate upload progress
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

      const {
        data: { publicUrl },
      } = supabase.storage
        .from("quiz-pdfs")
        .getPublicUrl(filePath, { download: false });

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
      onUploadComplete(url, "upload", pdfFile);
    }
  };

  const handleResourceSelect = (resourceId: string) => {
    console.log("Selecting resource:", resourceId);
    const resource = resources.find((r) => r.id === resourceId);
    console.log("Found resource:", resource);
    if (resource) {
      setSelectedResource(resourceId);
      setPdfFile(null);
      setError(null);
    }
  };

  // In your PDFUploadStep component
  const handleUseSelectedResource = () => {
    const resource = resources.find((r) => r.id === selectedResource);
    if (resource?.file_url) {
      // Verify the URL looks like a Supabase storage URL
      if (!resource.file_url.includes("supabase.co/storage/v1/object")) {
        onError("Invalid resource URL format");
        return;
      }
      onUploadComplete(resource.file_url, "existing", null, resource);
    }
  };

  return (
    <div className="space-y-6">
      <p className="text-gray-600">
        Upload a new PDF document or select from your existing resources to
        generate quiz questions automatically using AI.
      </p>

      {/* Tab Selection */}
      <div className="flex border-b border-gray-200">
        <button
          className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
            activeTab === "upload"
              ? "border-blue-500 text-blue-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
          onClick={() => setActiveTab("upload")}
        >
          <div className="flex items-center gap-2">
            <FileUp size={16} />
            Upload New PDF
          </div>
        </button>
        <button
          className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
            activeTab === "existing"
              ? "border-blue-500 text-blue-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
          onClick={() => setActiveTab("existing")}
        >
          <div className="flex items-center gap-2">
            <BookOpen size={16} />
            Use Existing Resource ({pdfResources.length})
          </div>
        </button>
      </div>

      {/* Upload Tab */}
      {activeTab === "upload" && (
        <div className="space-y-4">
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

          {isUploading && (
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Uploading...</span>
                <span className="text-sm font-medium">{uploadProgress}%</span>
              </div>
              <Progress
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

      {/* Existing Resources Tab */}
      {activeTab === "existing" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              placeholder="Search resources..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              startContent={<Search size={16} className="text-gray-400" />}
              size="sm"
            />
            <Select
              placeholder="Filter by course"
              selectedKeys={courseFilter === "all" ? [] : [courseFilter]}
              onSelectionChange={(keys) => {
                const selected = Array.from(keys)[0] as string;
                setCourseFilter(selected || "all");
              }}
              size="sm"
            >
              <SelectItem key="all">All Courses</SelectItem>
              {courses.map((course) => (
                <SelectItem key={course}>{course}</SelectItem>
              ))}
            </Select>
            <Select
              placeholder="Filter by type"
              selectedKeys={typeFilter === "all" ? [] : [typeFilter]}
              onSelectionChange={(keys) => {
                const selected = Array.from(keys)[0] as string;
                setTypeFilter(selected || "all");
              }}
              size="sm"
            >
              {resourceTypes.map((type) => (
                <SelectItem key={type.value}>{type.label}</SelectItem>
              ))}
            </Select>
          </div>

          {resourcesLoading ? (
            <div className="flex justify-center py-8">
              <Spinner size="lg" />
            </div>
          ) : pdfResources.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <FileText size={48} className="mx-auto mb-4 text-gray-300" />
              <p>No PDF resources found</p>
              <p className="text-sm">Try adjusting your search or filters</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto p-2">
                {paginatedResources
                  .filter((resource) =>
                    pdfResources.some((pdf) => pdf.id === resource.id)
                  )
                  .map((resource) => (
                    <Card
                      key={resource.id}
                      className={`cursor-pointer transition-all hover:shadow-md ${
                        selectedResource === resource.id
                          ? "ring-2 ring-blue-500 bg-blue-50"
                          : "hover:bg-gray-50"
                      }`}
                      isPressable
                      onPress={() => handleResourceSelect(resource.id)}
                    >
                      <CardBody className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h3 className="font-medium truncate">
                                {resource.title}
                              </h3>
                              {resource.is_new && (
                                <Chip size="sm" color="success" variant="flat">
                                  New
                                </Chip>
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                              <BookOpen size={14} />
                              <span>{resource.course}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                              <span className="capitalize">
                                {resource.type}
                              </span>
                              {resource.file_size && (
                                <span>
                                  {(resource.file_size / (1024 * 1024)).toFixed(
                                    1
                                  )}{" "}
                                  MB
                                </span>
                              )}
                            </div>
                          </div>
                          {selectedResource === resource.id && (
                            <CheckCircle className="text-blue-500" size={20} />
                          )}
                        </div>
                      </CardBody>
                    </Card>
                  ))}
              </div>

              {totalPages > 1 && (
                <div className="flex justify-center gap-2">
                  <Button
                    size="sm"
                    variant="flat"
                    isDisabled={currentPage === 1}
                    onPress={() => setCurrentPage(currentPage - 1)}
                  >
                    Previous
                  </Button>
                  <span className="flex items-center px-3 text-sm text-gray-600">
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    size="sm"
                    variant="flat"
                    isDisabled={currentPage === totalPages}
                    onPress={() => setCurrentPage(currentPage + 1)}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 text-red-500">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      <div className="flex justify-end">
        {activeTab === "upload" ? (
          <Button
            color="primary"
            isDisabled={!pdfFile || isUploading}
            onPress={handleUpload}
          >
            {isUploading ? <Spinner size="sm" /> : "Upload & Continue"}
          </Button>
        ) : (
          <Button
            color="primary"
            isDisabled={!selectedResource}
            onPress={handleUseSelectedResource}
          >
            Use Selected Resource
          </Button>
        )}
      </div>
    </div>
  );
}
