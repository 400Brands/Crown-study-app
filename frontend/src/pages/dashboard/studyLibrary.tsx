//@ts-nocheck

import React, { useState, useEffect } from "react";
import {
  Card,
  CardBody,
  Button,
  Chip,
  Input,
  Select,
  SelectItem,
  Pagination,
  Spinner,
} from "@heroui/react";
import {
  BookOpen,
  Search,
  Filter,
  Download,
  Bookmark,
  Star,
  LibraryBig,
  UploadCloud,
  Clock,
  FileText,
  FileSpreadsheet,
  FileImage,
  AlertTriangle,
} from "lucide-react";
import { supabase } from "@/supabaseClient";
import DefaultLayout from "@/layouts/default";
import DashboardLayout from "@/layouts/dashboardLayout";
import UploadModal from "./studyLibrary/uploadModal";

interface Resource {
  id: string;
  title: string;
  type: string;
  course: string;
  year: string;
  description?: string;
  file_url?: string;
  file_size?: number;
  pages?: number;
  duration?: string;
  is_new: boolean;
  is_featured?: boolean;
  rating: number;
  downloads: number;
  created_at: string;
}

interface ResourceType {
  label: string;
  value: string;
  icon: React.ReactNode;
}

interface DownloadError {
  resourceId: string;
  error: string;
  timestamp: Date;
}

const StudyLibrary: React.FC = () => {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [courseFilter, setCourseFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [sortBy, setSortBy] = useState("popular");
  const [currentPage, setCurrentPage] = useState(1);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [downloadingIds, setDownloadingIds] = useState<Set<string>>(new Set());
  const [downloadErrors, setDownloadErrors] = useState<DownloadError[]>([]);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const itemsPerPage = 6;

  const resourceTypes: ResourceType[] = [
    { label: "All Resources", value: "all", icon: <LibraryBig size={16} /> },
    { label: "Textbooks", value: "textbook", icon: <BookOpen size={16} /> },
    { label: "Lecture Notes", value: "notes", icon: <FileText size={16} /> },
    {
      label: "Past Papers",
      value: "past-paper",
      icon: <FileSpreadsheet size={16} />,
    },
    {
      label: "Cheat Sheets",
      value: "cheatsheet",
      icon: <FileImage size={16} />,
    },
  ];

  const courses: string[] = [
    "CSC 101",
    "CSC 201",
    "CSC 301",
    "CSC 305",
    "CSC 401",
    "CSC 501",
  ];

  // Enhanced error handling for user notifications
  const showUserError = (message: string, details?: string) => {
    const fullMessage = details ? `${message}\n\nDetails: ${details}` : message;
    alert(fullMessage);
  };

  // Enhanced fetch resources with comprehensive error handling
  const fetchResources = async (): Promise<void> => {
    setFetchError(null);

    try {
      setLoading(true);

      let query = supabase
        .from("resources")
        .select("*")
        .order("created_at", { ascending: false });

      // Apply filters with logging
      if (courseFilter !== "all") {
        query = query.eq("course", courseFilter);
      }

      if (typeFilter !== "all") {
        query = query.eq("type", typeFilter);
      }

      if (searchTerm.trim()) {
        query = query.ilike("title", `%${searchTerm.trim()}%`);
      }

      const { data } = await query;

      if (!data) {
        setResources([]);
        return;
      }

      // Sort the data with error handling
      let sortedData: Resource[] = [...data];
      try {
        switch (sortBy) {
          case "recent":
            sortedData.sort(
              (a, b) =>
                new Date(b.created_at).getTime() -
                new Date(a.created_at).getTime()
            );
            break;
          case "rating":
            sortedData.sort((a, b) => (b.rating || 0) - (a.rating || 0));
            break;
          case "popular":
          default:
            sortedData.sort((a, b) => (b.downloads || 0) - (a.downloads || 0));
            break;
        }
      } catch (sortError) {
        // Continue with unsorted data rather than failing completely
      }

      setResources(sortedData);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";

      setFetchError(errorMessage);
      setResources([]);
      showUserError("Failed to load resources", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Enhanced download handler with comprehensive logging and error handling
  const handleDownload = async (resource: Resource): Promise<void> => {
    // Validate resource data
    if (!resource.file_url) {
      const errorMsg = "No file URL available for download";
      showUserError(errorMsg);
      return;
    }

    if (!resource.id) {
      const errorMsg = "Invalid resource ID";
      showUserError(errorMsg);
      return;
    }

    // Check if already downloading
    if (downloadingIds.has(resource.id)) {
      return;
    }

    try {
      // Set downloading state
      setDownloadingIds((prev) => {
        const newSet = new Set(prev);
        newSet.add(resource.id);
        return newSet;
      });

      // Step 1: Update download counter in database
      const newDownloadCount = (resource.downloads || 0) + 1;

      await supabase
        .from("resources")
        .update({ downloads: newDownloadCount })
        .eq("id", resource.id);

      // Step 2: Fetch the file

      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        controller.abort();
      }, 30000); // 30 second timeout

      const response = await fetch(resource.file_url, {
        method: "GET",
        signal: controller.signal,
        headers: {
          Accept: "*/*",
        },
      });

      clearTimeout(timeoutId);

      // Check content type
      const contentType = response.headers.get("content-type");

      // Step 3: Convert to blob
      const blob = await response.blob();

      if (blob.size === 0) {
        throw new Error("Downloaded file is empty");
      }

      // Step 4: Create download link and trigger download
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;

      // Extract filename from URL or use title with proper extension
      let filename: string;
      try {
        const urlParts = resource.file_url.split("/");
        const urlFilename = urlParts[urlParts.length - 1];

        if (urlFilename && urlFilename.includes(".")) {
          filename = decodeURIComponent(urlFilename);
        } else {
          // Determine extension based on content type or default to PDF
          let extension = ".pdf";
          if (contentType) {
            if (contentType.includes("image")) extension = ".jpg";
            else if (contentType.includes("text")) extension = ".txt";
            else if (
              contentType.includes("excel") ||
              contentType.includes("spreadsheet")
            )
              extension = ".xlsx";
            else if (contentType.includes("word")) extension = ".docx";
          }
          filename = `${resource.title.replace(/[^a-zA-Z0-9\s]/g, "")}${extension}`;
        }
      } catch (filenameError) {
        filename = `${resource.title.replace(/[^a-zA-Z0-9\s]/g, "")}.pdf`;
      }

      link.download = filename;

      // Trigger download
      document.body.appendChild(link);
      link.click();

      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      // Step 5: Refresh resources to show updated download count
      await fetchResources();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown download error";
      const downloadError: DownloadError = {
        resourceId: resource.id,
        error: errorMessage,
        timestamp: new Date(),
      };

      setDownloadErrors((prev) => [...prev, downloadError]);

      // Provide specific error messages based on error type
      let userMessage = "Failed to download file";
      if (errorMessage.includes("HTTP")) {
        userMessage = "File server is not responding. Please try again later.";
      } else if (
        errorMessage.includes("timeout") ||
        errorMessage.includes("aborted")
      ) {
        userMessage =
          "Download timed out. Please check your connection and try again.";
      } else if (
        errorMessage.includes("network") ||
        errorMessage.includes("fetch")
      ) {
        userMessage =
          "Network error occurred. Please check your internet connection.";
      }

      showUserError(userMessage, errorMessage);
    } finally {
      // Always remove from downloading set
      setDownloadingIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(resource.id);
        return newSet;
      });
    }
  };

  // Handle successful upload with logging
  const handleUploadSuccess = (): void => {
    setIsUploadModalOpen(false);
    fetchResources();
  };

  // Enhanced useEffect with error handling
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchResources();
    }, 300); // Debounce to avoid too many API calls

    return () => {
      clearTimeout(timeoutId);
    };
  }, [searchTerm, courseFilter, typeFilter, sortBy]);

  // Clear old download errors periodically
  useEffect(() => {
    const cleanup = setInterval(() => {
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      setDownloadErrors((prev) =>
        prev.filter((error) => error.timestamp > oneHourAgo)
      );
    }, 60000); // Check every minute

    return () => clearInterval(cleanup);
  }, []);

  // Pagination calculations with error handling
  const totalPages = Math.max(1, Math.ceil(resources.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedResources: Resource[] = resources.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const featuredResources: Resource[] = resources
    .sort(() => 0.5 - Math.random())
    .slice(0, 3);

  // Placeholder image URL
  const placeholderImage: string =
    "https://imgs.search.brave.com/vXmnKh72ckf3x4CjZY4NAekzxi0I4dZGwGOo3xTceNY/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9sZWFy/bmluZy5vcmVpbGx5/LmNvbS9jb3ZlcnMv/dXJuOm9ybTpib29r/Ojk3ODEwOTgxNTI2/MDQvNDAwdy8";

  const placeholderImage1: string =
    "https://res.cloudinary.com/dgbreoalg/image/upload/v1725004015/samples/cup-on-a-table.jpg";

  return (
    <DefaultLayout>
      <DashboardLayout>
        <div className="space-y-6 ml-4">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <LibraryBig className="text-indigo-600" size={24} />
                Study Library
              </h1>
              <p className="text-gray-500">
                Access course materials, textbooks, and past papers
              </p>
            </div>
            <Button
              color="primary"
              variant="shadow"
              startContent={<UploadCloud size={18} />}
              onPress={() => setIsUploadModalOpen(true)}
            >
              Upload Resources
            </Button>
          </div>

          {/* Recent Download Errors */}
          {downloadErrors.length > 0 && (
            <Card className="border-yellow-200 bg-yellow-50">
              <CardBody className="p-4">
                <div className="flex items-center gap-2 text-yellow-700 mb-2">
                  <AlertTriangle size={16} />
                  <span className="font-medium">Recent Download Issues:</span>
                </div>
                <div className="space-y-1 text-sm">
                  {downloadErrors.slice(-3).map((error, index) => (
                    <div key={index} className="text-yellow-600">
                      {error.timestamp.toLocaleTimeString()}: {error.error}
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>
          )}

          {/* Filters and Search */}
          <Card className="bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-100">
            <CardBody className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Input
                  placeholder="Search resources..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  startContent={<Search size={18} className="text-gray-400" />}
                  className="md:col-span-2"
                />
                <Select
                  placeholder="Filter by course"
                  selectedKeys={courseFilter !== "all" ? [courseFilter] : []}
                  onSelectionChange={(keys) =>
                    setCourseFilter(Array.from(keys)[0] || "all")
                  }
                  startContent={
                    <BookOpen size={18} className="text-gray-400" />
                  }
                >
                  <SelectItem key="all">All Courses</SelectItem>
                  {courses.map((course) => (
                    <SelectItem key={course}>{course}</SelectItem>
                  ))}
                </Select>
                <Select
                  placeholder="Filter by type"
                  selectedKeys={typeFilter !== "all" ? [typeFilter] : []}
                  onSelectionChange={(keys) =>
                    setTypeFilter(Array.from(keys)[0] || "all")
                  }
                  startContent={<Filter size={18} className="text-gray-400" />}
                >
                  {resourceTypes.map((type) => (
                    <SelectItem key={type.value} startContent={type.icon}>
                      {type.label}
                    </SelectItem>
                  ))}
                </Select>
              </div>
            </CardBody>
          </Card>

          {loading ? (
            <div className="flex justify-center py-8">
              <Spinner size="lg" />
            </div>
          ) : (
            <>
              {/* Featured Resources */}
              {featuredResources.length > 0 && (
                <div>
                  <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <Star className="text-yellow-500" size={20} />
                    Featured Resources
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {featuredResources.map((resource) => (
                      <Card
                        key={resource.id}
                        className="border border-gray-200 group hover:shadow-lg transition-shadow"
                      >
                        <CardBody className="p-0 overflow-hidden">
                          <div className="relative">
                            <img
                              src={placeholderImage1}
                              alt={resource.title}
                              className="w-full h-48 object-cover"
                            />
                            <div className="absolute top-0 left-0 bg-indigo-600 text-white px-3 py-1 text-xs font-bold">
                              FEATURED
                            </div>
                          </div>
                          <div className="p-4">
                            <div className="flex justify-between items-start mb-2">
                              <h3 className="font-bold text-lg line-clamp-1">
                                {resource.title}
                              </h3>
                              <Chip size="sm" color="primary" variant="flat">
                                {resource.course}
                              </Chip>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                              <span>{resource.year}</span>
                              {resource.pages && (
                                <span>{resource.pages} pages</span>
                              )}
                              {resource.duration && (
                                <span>{resource.duration}</span>
                              )}
                            </div>
                            <div className="flex justify-between items-center">
                              <div className="flex items-center gap-1">
                                <Star
                                  className="text-yellow-500 fill-yellow-500"
                                  size={16}
                                />
                                <span className="font-medium">
                                  {resource.rating || 0}
                                </span>
                                <span className="text-gray-500 text-sm ml-1">
                                  ({resource.downloads || 0})
                                </span>
                              </div>
                              <Button
                                size="sm"
                                color="primary"
                                variant="flat"
                                isLoading={downloadingIds.has(resource.id)}
                                isDisabled={
                                  !resource.file_url ||
                                  downloadingIds.has(resource.id)
                                }
                                onPress={() => handleDownload(resource)}
                                startContent={
                                  !downloadingIds.has(resource.id) && (
                                    <Download size={16} />
                                  )
                                }
                              >
                                {downloadingIds.has(resource.id)
                                  ? "Downloading..."
                                  : "Download"}
                              </Button>
                            </div>
                          </div>
                        </CardBody>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* All Resources */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">
                    All Resources ({resources.length})
                  </h2>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">Sort by:</span>
                    <Select
                      size="sm"
                      variant="bordered"
                      selectedKeys={[sortBy]}
                      onSelectionChange={(keys) =>
                        setSortBy(Array.from(keys)[0])
                      }
                      className="w-40"
                    >
                      <SelectItem key="popular">Most Popular</SelectItem>
                      <SelectItem key="recent">Most Recent</SelectItem>
                      <SelectItem key="rating">Highest Rating</SelectItem>
                    </Select>
                  </div>
                </div>

                {resources.length === 0 ? (
                  <Card className="p-8 text-center">
                    <CardBody>
                      <LibraryBig
                        size={48}
                        className="text-gray-300 mx-auto mb-4"
                      />
                      <p className="text-gray-500">
                        {fetchError
                          ? "Unable to load resources due to an error."
                          : "No resources found. Try adjusting your filters or upload the first resource!"}
                      </p>
                    </CardBody>
                  </Card>
                ) : (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {paginatedResources.map((resource) => (
                        <Card
                          key={resource.id}
                          className="border border-gray-200 hover:shadow-md transition-shadow"
                        >
                          <CardBody className="p-4">
                            <div className="flex gap-4">
                              <div className="relative">
                                <img
                                  src={placeholderImage}
                                  alt={resource.title}
                                  className="w-24 h-24 object-cover rounded-lg"
                                />
                                {resource.is_new && (
                                  <Chip
                                    size="sm"
                                    color="success"
                                    className="absolute -top-2 -right-2"
                                  >
                                    NEW
                                  </Chip>
                                )}
                              </div>
                              <div className="flex-1">
                                <div className="flex justify-between items-start">
                                  <h3 className="font-bold line-clamp-2">
                                    {resource.title}
                                  </h3>
                                  <Button isIconOnly size="sm" variant="light">
                                    <Bookmark
                                      size={16}
                                      className="text-gray-400"
                                    />
                                  </Button>
                                </div>
                                <Chip size="sm" variant="flat" className="mt-1">
                                  {resource.course}
                                </Chip>
                                <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                                  {resource.type === "video" ? (
                                    <>
                                      <Clock size={14} />{" "}
                                      {resource.duration || "N/A"}
                                    </>
                                  ) : (
                                    <>{resource.pages || 0} pages</>
                                  )}
                                </div>
                                <div className="flex justify-between items-center mt-3">
                                  <div className="flex items-center gap-1">
                                    <Star
                                      className="text-yellow-500 fill-yellow-500"
                                      size={14}
                                    />
                                    <span className="text-sm font-medium">
                                      {resource.rating || 0}
                                    </span>
                                  </div>
                                  <Button
                                    size="sm"
                                    variant="flat"
                                    isLoading={downloadingIds.has(resource.id)}
                                    isDisabled={
                                      !resource.file_url ||
                                      downloadingIds.has(resource.id)
                                    }
                                    startContent={
                                      !downloadingIds.has(resource.id) && (
                                        <Download size={16} />
                                      )
                                    }
                                    onPress={() => handleDownload(resource)}
                                  >
                                    {downloadingIds.has(resource.id)
                                      ? "..."
                                      : (
                                          resource.downloads || 0
                                        ).toLocaleString()}
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </CardBody>
                        </Card>
                      ))}
                    </div>

                    {totalPages > 1 && (
                      <div className="flex justify-center mt-8 p-4">
                        <Pagination
                          total={totalPages}
                          page={currentPage}
                          onChange={setCurrentPage}
                        />
                      </div>
                    )}
                  </>
                )}
              </div>
            </>
          )}

          {/* Upload Modal */}
          <UploadModal
            isOpen={isUploadModalOpen}
            onClose={() => setIsUploadModalOpen(false)}
            onUploadSuccess={handleUploadSuccess}
            courses={courses}
          />
        </div>
      </DashboardLayout>
    </DefaultLayout>
  );
};

export default StudyLibrary;
