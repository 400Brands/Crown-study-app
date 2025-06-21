//@ts-nocheck

import React from "react";
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
import DefaultLayout from "@/layouts/default";
import DashboardLayout from "@/layouts/dashboardLayout";
import UploadModal from "./studyLibrary/uploadModal";
import { useStudyLibraryContext } from "./context/studyLibraryContext";

const StudyLibrary: React.FC = () => {
  // Get all state and functions from context
  const {
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
    handleDownload,
    setSearchTerm,
    setCourseFilter,
    setTypeFilter,
    setSortBy,
    setCurrentPage,
    setIsUploadModalOpen,
    handleUploadSuccess,
  } = useStudyLibraryContext();

  // Placeholder image URLs
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
