import { useState, useEffect, useCallback } from "react";
import {
  FileSpreadsheet,
  Upload,
  X,
  Download,
  Calendar,
  FileText,
} from "lucide-react";
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
  useDisclosure,
} from "@heroui/react";
import { supabase } from "@/supabaseClient";

interface PastQuestion {
  id: string;
  title: string;
  course: string;
  year: string;
  pages: number;
  downloads: number;
  file_url: string;
  thumbnail_url?: string;
  uploaded_at: string;
  user_id: string;
}

interface FormData {
  title: string;
  course: string;
  year: string;
}

const PastQuestions = () => {
  const [pastQuestions, setPastQuestions] = useState<PastQuestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // NextUI Modal hook
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  // Form state
  const [formData, setFormData] = useState<FormData>({
    title: "",
    course: "CSC 101",
    year: new Date().getFullYear().toString(),
  });

  // Available courses - optimized as constant
  const courses = [
    { key: "CSC 101", label: "CSC 101: Introduction to Programming" },
    { key: "CSC 201", label: "CSC 201: Data Structures & Algorithms" },
    { key: "CSC 301", label: "CSC 301: Database Systems" },
    { key: "CSC 305", label: "CSC 305: Artificial Intelligence" },
  ];

  // Memoized fetch function to prevent unnecessary re-renders
  const fetchPastQuestions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from("past_questions")
        .select("*")
        .order("uploaded_at", { ascending: false });

      if (error) throw error;
      setPastQuestions(data || []);
    } catch (error) {
      console.error("Error fetching past questions:", error);
      setError("Failed to load past questions. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPastQuestions();
  }, [fetchPastQuestions]);

  // Optimized file handler with cleanup
  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
        const selectedFile = e.target.files[0];

        // Validate file size (10MB limit)
        if (selectedFile.size > 10 * 1024 * 1024) {
          setError("File size must be less than 10MB");
          return;
        }

        // Cleanup previous preview URL
        if (previewUrl) {
          URL.revokeObjectURL(previewUrl);
        }

        setFile(selectedFile);

        // Create preview for images
        if (selectedFile.type.startsWith("image/")) {
          setPreviewUrl(URL.createObjectURL(selectedFile));
        } else {
          setPreviewUrl(null);
        }
      }
    },
    [previewUrl]
  );

  // Optimized form submission
  const handleSubmit = useCallback(async () => {
    if (!file || !formData.title.trim()) {
      setError("Please fill all fields and select a file");
      return;
    }

    try {
      setUploading(true);
      setError(null);

      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("User not authenticated");
      }

      // Upload file to Supabase Storage
      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `past-questions/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("past-questions")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get public URL for the uploaded file
      const {
        data: { publicUrl },
      } = supabase.storage.from("past-questions").getPublicUrl(filePath);

      // Generate thumbnail URL based on file type
      const getThumbnailUrl = (fileType: string) => {
        if (fileType === "application/pdf") {
          return "https://via.placeholder.com/200x150/f3f4f6/6b7280?text=PDF";
        } else if (fileType.startsWith("image/")) {
          return publicUrl;
        } else {
          return "https://via.placeholder.com/200x150/f3f4f6/6b7280?text=DOC";
        }
      };

      // Save metadata to database
      const { error: dbError } = await supabase.from("past_questions").insert([
        {
          title: formData.title.trim(),
          course: formData.course,
          year: formData.year,
          pages: 1, // You might want to extract actual page count for PDFs
          downloads: 0,
          file_url: publicUrl,
          thumbnail_url: getThumbnailUrl(file.type),
          user_id: user.id,
        },
      ]);

      if (dbError) throw dbError;

      // Refresh the list to show the new upload
      await fetchPastQuestions();

      // Close modal and reset form
      onOpenChange();
      resetForm();
    } catch (error) {
      console.error("Error uploading past question:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Failed to upload past question"
      );
    } finally {
      setUploading(false);
    }
  }, [file, formData, onOpenChange, fetchPastQuestions]);

  // Optimized reset form function
  const resetForm = useCallback(() => {
    setFormData({
      title: "",
      course: "CSC 101",
      year: new Date().getFullYear().toString(),
    });
    setFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    setError(null);
  }, [previewUrl]);

  // Optimized download handler
  const handleDownload = useCallback(async (fileUrl: string, id: string) => {
    try {
      // Increment download count in database
      const { error } = await supabase.rpc("increment_downloads", {
        question_id: id,
      });

      if (error) {
        console.error("Error updating download count:", error);
      }

      // Update local state optimistically
      setPastQuestions((prev) =>
        prev.map((pq) =>
          pq.id === id ? { ...pq, downloads: pq.downloads + 1 } : pq
        )
      );

      // Open file in new tab for download
      window.open(fileUrl, "_blank");
    } catch (error) {
      console.error("Error downloading file:", error);
      setError("Failed to download file");
    }
  }, []);

  // Optimized date formatter
  const formatDate = useCallback((dateString: string) => {
    return new Date(dateString).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }, []);

  // Cleanup effect
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <FileSpreadsheet className="text-green-500" size={20} />
          Past Questions
        </h2>
        <Button
          onPress={onOpen}
          color="primary"
          startContent={<Upload size={16} />}
        >
          Upload Questions
        </Button>
      </div>

      {/* Error Display */}
      {error && !loading && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center justify-between">
          <span>{error}</span>
          <Button
            size="sm"
            color="danger"
            variant="flat"
            onPress={() => {
              setError(null);
              fetchPastQuestions();
            }}
          >
            Retry
          </Button>
        </div>
      )}

      {/* Past Questions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {pastQuestions.map((pq) => (
          <div
            key={pq.id}
            className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow bg-white"
          >
            <div className="flex justify-between items-start mb-3">
              <h3 className="font-medium text-gray-900 line-clamp-2">
                {pq.title}
              </h3>
              <div className="flex gap-2 flex-shrink-0">
                <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                  {pq.course}
                </span>
                <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs">
                  {pq.year}
                </span>
              </div>
            </div>

            {pq.thumbnail_url && (
              <div className="mb-3">
                <img
                  src={pq.thumbnail_url}
                  alt={pq.title}
                  className="w-full h-32 object-cover rounded-lg bg-gray-100"
                  loading="lazy"
                />
              </div>
            )}

            <div className="flex items-center gap-4 mb-3 text-sm text-gray-600">
              <span>{pq.pages} pages</span>
              <span>Downloads: {pq.downloads}</span>
            </div>

            <hr className="my-3 border-gray-200" />

            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-400 flex items-center gap-1">
                <Calendar size={14} />
                {formatDate(pq.uploaded_at)}
              </span>
              <Button
                size="sm"
                color="success"
                variant="flat"
                startContent={<Download size={14} />}
                onPress={() => handleDownload(pq.file_url, pq.id)}
              >
                Download
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* NextUI Modal */}
      <Modal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        size="2xl"
        scrollBehavior="inside"
        classNames={{
          base: "max-h-[90vh]",
          body: "py-6",
        }}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Upload Past Questions
              </ModalHeader>
              <ModalBody>
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
                    {error}
                  </div>
                )}

                <div className="space-y-4">
                  {/* Title Input */}
                  <Input
                    label="Title"
                    placeholder="e.g. Final Exam 2022"
                    value={formData.title}
                    onValueChange={(value) =>
                      setFormData({ ...formData, title: value })
                    }
                    isRequired
                  />

                  {/* Course Select */}
                  <Select
                    label="Course"
                    selectedKeys={[formData.course]}
                    onSelectionChange={(keys) => {
                      const selected = Array.from(keys)[0] as string;
                      setFormData({ ...formData, course: selected });
                    }}
                    isRequired
                  >
                    {courses.map((course) => (
                      <SelectItem key={course.key} >
                        {course.label}
                      </SelectItem>
                    ))}
                  </Select>

                  {/* Year Input */}
                  <Input
                    type="number"
                    label="Year"
                    value={formData.year}
                    onValueChange={(value) =>
                      setFormData({ ...formData, year: value })
                    }
                    isRequired
                  />

                  {/* File Upload */}
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    {file ? (
                      <div className="flex flex-col items-center">
                        {previewUrl ? (
                          <img
                            src={previewUrl}
                            alt="Preview"
                            className="h-32 mb-4 rounded object-cover"
                          />
                        ) : (
                          <FileText className="text-gray-400 h-16 w-16 mb-4" />
                        )}
                        <p className="font-medium text-gray-900">{file.name}</p>
                        <p className="text-sm text-gray-500">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                        <Button
                          size="sm"
                          color="danger"
                          variant="light"
                          startContent={<X size={16} />}
                          onPress={() => {
                            setFile(null);
                            if (previewUrl) {
                              URL.revokeObjectURL(previewUrl);
                              setPreviewUrl(null);
                            }
                          }}
                          className="mt-2"
                        >
                          Remove
                        </Button>
                      </div>
                    ) : (
                      <label className="cursor-pointer">
                        <div className="flex flex-col items-center">
                          <Upload className="text-gray-400 h-16 w-16 mb-4" />
                          <p className="font-medium text-gray-900">
                            Click to upload file
                          </p>
                          <p className="text-sm text-gray-500">
                            PDF, JPG, PNG (Max 10MB)
                          </p>
                        </div>
                        <input
                          type="file"
                          className="hidden"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={handleFileChange}
                        />
                      </label>
                    )}
                  </div>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Cancel
                </Button>
                <Button
                  color="primary"
                  onPress={handleSubmit}
                  isDisabled={!file || !formData.title.trim()}
                  isLoading={uploading}
                >
                  {uploading ? "Uploading..." : "Upload"}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
};

export default PastQuestions;
