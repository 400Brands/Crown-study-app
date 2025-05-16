//@ts-nocheck

import {
  Card,
  CardBody,
  Button,
  Chip,
  Divider,
  Avatar,
  Input,
  Select,
  SelectItem,
  Tabs,
  Tab,
  Pagination,
  Badge,
  Image,
} from "@heroui/react";
import {
  BookOpen,
  FileText,
  FileSpreadsheet,
  FileImage,
  Search,
  Filter,
  Download,
  Bookmark,
  Clock,
  Star,
  LibraryBig,
  UploadCloud,
} from "lucide-react";
import DashboardLayout from "@/layouts/dashboardLayout";
import DefaultLayout from "@/layouts/default";

const StudyLibrary = () => {
  // Sample resource data
  const resources = [
    {
      id: 1,
      title: "Computer Science 101 Textbook",
      type: "textbook",
      course: "CSC 101",
      year: "2023",
      pages: 245,
      downloads: 1243,
      rating: 4.8,
      thumbnail:
        "https://imgs.search.brave.com/vXmnKh72ckf3x4CjZY4NAekzxi0I4dZGwGOo3xTceNY/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9sZWFy/bmluZy5vcmVpbGx5/LmNvbS9jb3ZlcnMv/dXJuOm9ybTpib29r/Ojk3ODEwOTgxNTI2/MDQvNDAwdy8",
      isNew: true,
    },
    {
      id: 2,
      title: "Data Structures Cheat Sheet",
      type: "cheatsheet",
      course: "CSC 201",
      year: "2024",
      pages: 12,
      downloads: 892,
      rating: 4.9,
      thumbnail:
        "https://imgs.search.brave.com/vXmnKh72ckf3x4CjZY4NAekzxi0I4dZGwGOo3xTceNY/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9sZWFy/bmluZy5vcmVpbGx5/LmNvbS9jb3ZlcnMv/dXJuOm9ybTpib29r/Ojk3ODEwOTgxNTI2/MDQvNDAwdy8",
    },
    {
      id: 3,
      title: "AI Lecture Notes (Complete Set)",
      type: "notes",
      course: "CSC 305",
      year: "2022",
      pages: 78,
      downloads: 567,
      rating: 4.7,
      thumbnail:
        "https://imgs.search.brave.com/vXmnKh72ckf3x4CjZY4NAekzxi0I4dZGwGOo3xTceNY/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9sZWFy/bmluZy5vcmVpbGx5/LmNvbS9jb3ZlcnMv/dXJuOm9ybTpib29r/Ojk3ODEwOTgxNTI2/MDQvNDAwdy8",
    },
    {
      id: 4,
      title: "Past Exam Papers 2018-2023",
      type: "past-paper",
      course: "CSC 101",
      year: "2023",
      pages: 42,
      downloads: 1024,
      rating: 4.6,
      thumbnail:
        "https://imgs.search.brave.com/vXmnKh72ckf3x4CjZY4NAekzxi0I4dZGwGOo3xTceNY/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9sZWFy/bmluZy5vcmVpbGx5/LmNvbS9jb3ZlcnMv/dXJuOm9ybTpib29r/Ojk3ODEwOTgxNTI2/MDQvNDAwdy8",
      isFeatured: true,
    },
    {
      id: 5,
      title: "Database Systems Slides",
      type: "slides",
      course: "CSC 301",
      year: "2024",
      pages: 36,
      downloads: 456,
      rating: 4.5,
      thumbnail:
        "https://imgs.search.brave.com/vXmnKh72ckf3x4CjZY4NAekzxi0I4dZGwGOo3xTceNY/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9sZWFy/bmluZy5vcmVpbGx5/LmNvbS9jb3ZlcnMv/dXJuOm9ybTpib29r/Ojk3ODEwOTgxNTI2/MDQvNDAwdy8",
    },
    {
      id: 6,
      title: "Algorithms Video Tutorials",
      type: "video",
      course: "CSC 201",
      year: "2023",
      duration: "3h 24m",
      downloads: 789,
      rating: 4.9,
      thumbnail:
        "https://imgs.search.brave.com/vXmnKh72ckf3x4CjZY4NAekzxi0I4dZGwGOo3xTceNY/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9sZWFy/bmluZy5vcmVpbGx5/LmNvbS9jb3ZlcnMv/dXJuOm9ybTpib29r/Ojk3ODEwOTgxNTI2/MDQvNDAwdy8",
    },
  ];

  const resourceTypes = [
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

  return (
    <DefaultLayout>
      <DashboardLayout>
        <div className="space-y-6">
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
            >
              Upload Resources
            </Button>
          </div>

          {/* Filters and Search */}
          <Card className="bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-100">
            <CardBody className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Input
                  placeholder="Search resources..."
                  startContent={<Search size={18} className="text-gray-400" />}
                  className="md:col-span-2"
                />
                <Select
                  placeholder="Filter by course"
                  startContent={
                    <BookOpen size={18} className="text-gray-400" />
                  }
                >
                  {["CSC 101", "CSC 201", "CSC 301", "CSC 305"].map(
                    (course) => (
                      <SelectItem key={course} value={course}>
                        {course}
                      </SelectItem>
                    )
                  )}
                </Select>
                <Select
                  placeholder="Filter by type"
                  startContent={<Filter size={18} className="text-gray-400" />}
                >
                  {resourceTypes.map((type) => (
                    <SelectItem
                      key={type.value}
                      value={type.value}
                      startContent={type.icon}
                    >
                      {type.label}
                    </SelectItem>
                  ))}
                </Select>
              </div>
            </CardBody>
          </Card>

          {/* Featured Resources */}
          <div>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Star className="text-yellow-500" size={20} />
              Featured Resources
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {resources
                .filter((r) => r.isFeatured)
                .map((resource) => (
                  <Card
                    key={resource.id}
                    className="border border-gray-200 group hover:shadow-lg transition-shadow"
                  >
                    <CardBody className="p-0 overflow-hidden">
                      <div className="relative">
                        {/* <Image
                          src={resource.thumbnail}
                          alt={resource.title}
                          className="w-full h-48 object-cover"
                        /> */}
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
                              {resource.rating}
                            </span>
                            <span className="text-gray-500 text-sm ml-1">
                              ({resource.downloads})
                            </span>
                          </div>
                          <Button size="sm" color="primary" variant="flat">
                            Download
                          </Button>
                        </div>
                      </div>
                    </CardBody>
                  </Card>
                ))}
            </div>
          </div>

          {/* All Resources */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">All Resources</h2>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">Sort by:</span>
                <Select
                  size="sm"
                  variant="bordered"
                  defaultSelectedKeys={["popular"]}
                  className="w-40"
                >
                  <SelectItem key="popular" value="popular">
                    Most Popular
                  </SelectItem>
                  <SelectItem key="recent" value="recent">
                    Most Recent
                  </SelectItem>
                  <SelectItem key="rating" value="rating">
                    Highest Rating
                  </SelectItem>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {resources.map((resource) => (
                <Card
                  key={resource.id}
                  className="border border-gray-200 hover:shadow-md transition-shadow"
                >
                  <CardBody className="p-4">
                    <div className="flex gap-4">
                      <div className="relative">
                        <Image
                          src={resource.thumbnail}
                          alt={resource.title}
                          className="w-24 h-24 object-cover rounded-lg"
                        />
                        {resource.isNew && (
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
                            <Bookmark size={16} className="text-gray-400" />
                          </Button>
                        </div>
                        <Chip size="sm" variant="flat" className="mt-1">
                          {resource.course}
                        </Chip>
                        <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                          {resource.type === "video" ? (
                            <>
                              <Clock size={14} /> {resource.duration}
                            </>
                          ) : (
                            <>{resource.pages} pages</>
                          )}
                        </div>
                        <div className="flex justify-between items-center mt-3">
                          <div className="flex items-center gap-1">
                            <Star
                              className="text-yellow-500 fill-yellow-500"
                              size={14}
                            />
                            <span className="text-sm font-medium">
                              {resource.rating}
                            </span>
                          </div>
                          <Button
                            size="sm"
                            variant="flat"
                            startContent={<Download size={16} />}
                          >
                            {resource.downloads.toLocaleString()}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              ))}
            </div>

            <div className="flex justify-center mt-8 p-4 ">
              <Pagination total={5} initialPage={1} />
            </div>
          </div>

          {/* Resource Types Tabs */}
          <div className="mt-8">
            <Tabs aria-label="Resource types" variant="underlined">
              {resourceTypes.map((type) => (
                <Tab
                  key={type.value}
                  title={
                    <div className="flex items-center gap-2">
                      {type.icon}
                      {type.label}
                    </div>
                  }
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
                    {resources
                      .filter(
                        (r) => type.value === "all" || r.type === type.value
                      )
                      .slice(0, 3)
                      .map((resource) => (
                        <Card
                          key={resource.id}
                          className="border border-gray-200"
                        >
                          <CardBody className="p-4">
                            <div className="flex gap-4">
                              <Image
                                src={resource.thumbnail}
                                alt={resource.title}
                                className="w-16 h-16 object-cover rounded-lg"
                              />
                              <div>
                                <h3 className="font-bold line-clamp-1">
                                  {resource.title}
                                </h3>
                                <div className="flex items-center gap-2 mt-1">
                                  <Chip size="sm" variant="flat">
                                    {resource.course}
                                  </Chip>
                                  <span className="text-sm text-gray-500">
                                    {resource.year}
                                  </span>
                                </div>
                                <Button size="sm" className="mt-2" fullWidth>
                                  View Details
                                </Button>
                              </div>
                            </div>
                          </CardBody>
                        </Card>
                      ))}
                  </div>
                </Tab>
              ))}
            </Tabs>
          </div>
        </div>
      </DashboardLayout>
    </DefaultLayout>
  );
};

export default StudyLibrary;
