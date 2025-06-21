import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { supabase } from "@/supabaseClient";

// Types
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

interface StudyLibraryContextType {
  // Resource state
  resources: Resource[];
  loading: boolean;
  fetchError: string | null;

  // Filter and search state
  searchTerm: string;
  courseFilter: string;
  typeFilter: string;
  sortBy: string;

  // Pagination state
  currentPage: number;
  itemsPerPage: number;
  totalPages: number;
  paginatedResources: Resource[];

  // Featured resources
  featuredResources: Resource[];

  // Download state
  downloadingIds: Set<string>;
  downloadErrors: DownloadError[];

  // Modal state
  isUploadModalOpen: boolean;

  // Static data
  courses: string[];
  resourceTypes: ResourceType[];

  // Actions
  fetchResources: () => Promise<void>;
  handleDownload: (resource: Resource) => Promise<void>;
  setSearchTerm: (term: string) => void;
  setCourseFilter: (course: string) => void;
  setTypeFilter: (type: string) => void;
  setSortBy: (sort: string) => void;
  setCurrentPage: (page: number) => void;
  setIsUploadModalOpen: (open: boolean) => void;
  handleUploadSuccess: () => void;
  showUserError: (message: string, details?: string) => void;
}

// Create Context
const StudyLibraryContext = createContext<StudyLibraryContextType | undefined>(
  undefined
);

// Custom hook to use StudyLibrary Context
export const useStudyLibraryContext = () => {
  const context = useContext(StudyLibraryContext);
  if (context === undefined) {
    throw new Error(
      "useStudyLibraryContext must be used within a StudyLibraryProvider"
    );
  }
  return context;
};

// Provider Props
interface StudyLibraryProviderProps {
  children: ReactNode;
}

// StudyLibrary Provider Component
export const StudyLibraryProvider: React.FC<StudyLibraryProviderProps> = ({
  children,
}) => {
  // Resource state
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Filter and search state
  const [searchTerm, setSearchTerm] = useState("");
  const [courseFilter, setCourseFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [sortBy, setSortBy] = useState("popular");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Download state
  const [downloadingIds, setDownloadingIds] = useState<Set<string>>(new Set());
  const [downloadErrors, setDownloadErrors] = useState<DownloadError[]>([]);

  // Modal state
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  // Static data
  const courses: string[] = [
    "CSC 101",
    "CSC 201",
    "CSC 301",
    "CSC 305",
    "CSC 401",
    "CSC 501",
  ];

  // This would need to be imported from lucide-react in your actual implementation
  const resourceTypes: ResourceType[] = [
    { label: "All Resources", value: "all", icon: null }, // Replace with actual icons
    { label: "Textbooks", value: "textbook", icon: null },
    { label: "Lecture Notes", value: "notes", icon: null },
    { label: "Past Papers", value: "past-paper", icon: null },
    { label: "Cheat Sheets", value: "cheatsheet", icon: null },
  ];

  // Enhanced error handling for user notifications
  const showUserError = useCallback((message: string, details?: string) => {
    const fullMessage = details ? `${message}\n\nDetails: ${details}` : message;
    alert(fullMessage);
  }, []);

  // Enhanced fetch resources with comprehensive error handling
  const fetchResources = useCallback(async (): Promise<void> => {
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
        console.warn("Sorting failed, using unsorted data:", sortError);
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
  }, [searchTerm, courseFilter, typeFilter, sortBy, showUserError]);

  // Enhanced download handler with comprehensive logging and error handling
  const handleDownload = useCallback(
    async (resource: Resource): Promise<void> => {
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

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

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
          userMessage =
            "File server is not responding. Please try again later.";
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
    },
    [downloadingIds, showUserError, fetchResources]
  );

  // Handle successful upload with logging
  const handleUploadSuccess = useCallback((): void => {
    setIsUploadModalOpen(false);
    fetchResources();
  }, [fetchResources]);

  // Enhanced useEffect with error handling
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchResources();
    }, 300); // Debounce to avoid too many API calls

    return () => {
      clearTimeout(timeoutId);
    };
  }, [fetchResources]);

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

  // Computed values
  const totalPages = Math.max(1, Math.ceil(resources.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedResources: Resource[] = resources.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const featuredResources: Resource[] = resources
    .filter((resource) => resource.is_featured)
    .sort(() => 0.5 - Math.random())
    .slice(0, 3);

  const contextValue: StudyLibraryContextType = {
    // Resource state
    resources,
    loading,
    fetchError,

    // Filter and search state
    searchTerm,
    courseFilter,
    typeFilter,
    sortBy,

    // Pagination state
    currentPage,
    itemsPerPage,
    totalPages,
    paginatedResources,

    // Featured resources
    featuredResources,

    // Download state
    downloadingIds,
    downloadErrors,

    // Modal state
    isUploadModalOpen,

    // Static data
    courses,
    resourceTypes,

    // Actions
    fetchResources,
    handleDownload,
    setSearchTerm,
    setCourseFilter,
    setTypeFilter,
    setSortBy,
    setCurrentPage,
    setIsUploadModalOpen,
    handleUploadSuccess,
    showUserError,
  };

  return (
    <StudyLibraryContext.Provider value={contextValue}>
      {children}
    </StudyLibraryContext.Provider>
  );
};
