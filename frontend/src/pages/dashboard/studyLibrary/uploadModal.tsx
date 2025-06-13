import React, { useState } from "react";
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
  Textarea,
} from "@heroui/react";
import { Plus } from "lucide-react";
import { supabase } from "@/supabaseClient";

interface UploadForm {
  title: string;
  type: string;
  course: string; // Course remains a string
  year: string;
  pages: string;
  duration: string;
  description: string;
  file: File | null;
}

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadSuccess: () => void;
  courses: string[]; // This prop is still defined but won't be used for the course input directly in this component
}

interface FileUploadResponse {
  filePath: string;
  publicUrl: string;
}

const UploadModal: React.FC<UploadModalProps> = ({
  isOpen,
  onClose,
  onUploadSuccess,
  // courses, // No longer destructuring courses here as it's not used for a select
}) => {
  const [uploading, setUploading] = useState(false);
  const [uploadForm, setUploadForm] = useState<UploadForm>({
    title: "",
    type: "textbook",
    course: "", // Initial empty string for free text
    year: "",
    pages: "",
    duration: "",
    description: "",
    file: null,
  });

  const currentYear = new Date().getFullYear();
  const years: string[] = Array.from({ length: 10 }, (_, i) =>
    (currentYear - i).toString()
  );

  // Upload file to Supabase Storage with better error handling
  const uploadFile = async (file: File): Promise<FileUploadResponse> => {
    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`;

    console.log("Uploading file:", fileName, "Size:", file.size);

    const { data, error } = await supabase.storage
      .from("resources")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (error) {
      console.error("Storage upload error:", error);
      throw new Error(`Upload failed: ${error.message}`);
    }

    console.log("Upload successful:", data);

    const {
      data: { publicUrl },
    } = supabase.storage.from("resources").getPublicUrl(filePath);

    return { filePath, publicUrl };
  };

  // Updated handleUpload function with user_id
  const handleUpload = async (): Promise<void> => {
    if (!uploadForm.title || !uploadForm.course || !uploadForm.year) {
      alert("Please fill in all required fields.");
      return;
    }

    try {
      setUploading(true);

      // Get current user
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        alert("You must be logged in to upload resources.");
        return;
      }

      let fileUrl = null;
      let fileSize = null;

      if (uploadForm.file) {
        try {
          const { publicUrl } = await uploadFile(uploadForm.file);
          fileUrl = publicUrl;
          fileSize = uploadForm.file.size;
        } catch (uploadError: any) {
          console.error("File upload failed:", uploadError);
          alert(`File upload failed: ${uploadError.message}`);
          return;
        }
      }

      const resourceData = {
        title: uploadForm.title,
        type: uploadForm.type,
        course: uploadForm.course,
        year: uploadForm.year,
        description: uploadForm.description,
        file_url: fileUrl,
        file_size: fileSize,
        pages: uploadForm.pages ? parseInt(uploadForm.pages) : null,
        duration: uploadForm.duration || null,
        is_new: true,
        rating: 0,
        downloads: 0,
        user_id: user.id, // Add the user_id
      };

      console.log("Inserting resource data:", resourceData);

      const { data, error } = await supabase
        .from("resources")
        .insert([resourceData])
        .select();

      if (error) {
        console.error("Database insert error:", error);
        throw new Error(`Database error: ${error.message}`);
      }

      console.log("Resource created successfully:", data);

      // Reset form
      setUploadForm({
        title: "",
        type: "textbook",
        course: "",
        year: "",
        pages: "",
        duration: "",
        description: "",
        file: null,
      });

      onUploadSuccess();
    } catch (error: any) {
      console.error("Error uploading resource:", error);
      alert(
        `Error uploading resource: ${error.message || "Please try again."}`
      );
    } finally {
      setUploading(false);
    }
  };

  const handleClose = (): void => {
    // Reset form when closing
    setUploadForm({
      title: "",
      type: "textbook",
      course: "",
      year: "",
      pages: "",
      duration: "",
      description: "",
      file: null,
    });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onOpenChange={handleClose} size="2xl">
      <ModalContent>
          <>
            <ModalHeader className="flex flex-col gap-1">
              Upload New Resource
            </ModalHeader>
            <ModalBody>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Title"
                  placeholder="Enter resource title"
                  value={uploadForm.title}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setUploadForm({
                      ...uploadForm,
                      title: e.target.value,
                    })
                  }
                  isRequired
                />
                <Select
                  label="Type"
                  selectedKeys={[uploadForm.type]}
                  onSelectionChange={(keys: any) =>
                    setUploadForm({
                      ...uploadForm,
                      type: Array.from(keys)[0] as string,
                    })
                  }
                  isRequired
                >
                  <SelectItem key="textbook">Textbook</SelectItem>
                  <SelectItem key="notes">Lecture Notes</SelectItem>
                  <SelectItem key="past-paper">Past Paper</SelectItem>
                  <SelectItem key="cheatsheet">Cheat Sheet</SelectItem>
                  <SelectItem key="slides">Slides</SelectItem>
                  <SelectItem key="video">Video</SelectItem>
                </Select>
                {/* Reverted Course to an Input component */}
                <Input
                  label="Course"
                  placeholder="Enter course name (e.g., 'Calculus I', 'CS101')"
                  value={uploadForm.course}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setUploadForm({
                      ...uploadForm,
                      course: e.target.value,
                    })
                  }
                  isRequired
                />
                <Select
                  label="Year"
                  placeholder="Select year"
                  selectedKeys={uploadForm.year ? [uploadForm.year] : []}
                  onSelectionChange={(keys: any) =>
                    setUploadForm({
                      ...uploadForm,
                      year: Array.from(keys)[0] as string,
                    })
                  }
                  isRequired
                >
                  {years.map((year) => (
                    <SelectItem key={year}>{year}</SelectItem>
                  ))}
                </Select>
                {uploadForm.type !== "video" && (
                  <Input
                    label="Pages"
                    type="number"
                    placeholder="Number of pages"
                    value={uploadForm.pages}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setUploadForm({
                        ...uploadForm,
                        pages: e.target.value,
                      })
                    }
                  />
                )}
                {uploadForm.type === "video" && (
                  <Input
                    label="Duration"
                    placeholder="e.g., 2h 30m"
                    value={uploadForm.duration}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setUploadForm({
                        ...uploadForm,
                        duration: e.target.value,
                      })
                    }
                  />
                )}
              </div>
              <Textarea
                label="Description"
                placeholder="Enter resource description (optional)"
                value={uploadForm.description}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setUploadForm({
                    ...uploadForm,
                    description: e.target.value,
                  })
                }
                className="mt-4"
              />
              <div className="mt-4">
                <label className="block text-sm font-medium mb-2">
                  File Upload (Optional)
                </label>
                <input
                  type="file"
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setUploadForm({
                      ...uploadForm,
                      file: e.target.files ? e.target.files[0] : null,
                    })
                  }
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                />
              </div>
            </ModalBody>
            <ModalFooter>
              <Button color="danger" variant="light" onPress={handleClose}>
                Cancel
              </Button>
              <Button
                color="primary"
                onPress={handleUpload}
                isLoading={uploading}
                startContent={!uploading && <Plus size={16} />}
              >
                {uploading ? "Uploading..." : "Upload Resource"}
              </Button>
            </ModalFooter>
          </>
      </ModalContent>
    </Modal>
  );
};

export default UploadModal;