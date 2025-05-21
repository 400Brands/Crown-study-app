//@ts-nocheck

import {
  Card,
  CardBody,
  Button,
  Chip,
  Divider,
  Avatar,
  Progress,
  Badge,
  Tabs,
  Tab,
  Image,
  Spacer,
} from "@heroui/react";
import {
  BookOpen,
  Clock,
  Award,
  BarChart2,
  CheckCircle,
  FileText,
  Layers,
  Bookmark,
  FileSpreadsheet,
  FileImage,
  ChevronRight,
} from "lucide-react";
import DashboardLayout from "@/layouts/dashboardLayout";
import DefaultLayout from "@/layouts/default";
import { useState } from "react";
import { Link } from "react-router-dom";
import CourseQuizzes from "./quizzes";

const MyCourses = () => {
  const [activeTab, setActiveTab] = useState("overview");

  // Sample course data
  const courses = [
    {
      id: 1,
      title: "Introduction to Computer Science",
      code: "CSC 101",
      progress: 78,
      instructor: "Dr. Adebayo",
      nextSession: "Mon, 10:00 AM",
      assignmentsDue: 2,
      resources: 15,
      color: "bg-blue-500",
      thumbnail: "/images/cs-course.jpg",
    },
    {
      id: 2,
      title: "Data Structures and Algorithms",
      code: "CSC 201",
      progress: 45,
      instructor: "Prof. Chukwu",
      nextSession: "Wed, 2:00 PM",
      assignmentsDue: 3,
      resources: 22,
      color: "bg-purple-500",
      thumbnail: "/images/dsa-course.jpg",
    },
  ];

  // Sample study materials
  const studyMaterials = [
    {
      id: 1,
      course: "CSC 101",
      type: "quiz",
      title: "Midterm Quiz 1",
      questions: 15,
      completed: 8,
      dueDate: "2023-11-15",
    },
    {
      id: 2,
      course: "CSC 101",
      type: "flashcard",
      title: "Programming Terms",
      cards: 42,
      mastered: 18,
      lastReviewed: "2 days ago",
    },
    {
      id: 3,
      course: "CSC 201",
      type: "pastQuestion",
      title: "2022 Final Exam",
      pages: 12,
      downloads: 45,
      year: "2022",
    },
    {
      id: 4,
      course: "CSC 201",
      type: "quiz",
      title: "Algorithm Analysis Quiz",
      questions: 10,
      completed: 3,
      dueDate: "2023-11-20",
    },
    {
      id: 5,
      course: "CSC 101",
      type: "flashcard",
      title: "OOP Concepts",
      cards: 36,
      mastered: 22,
      lastReviewed: "1 day ago",
    },
  ];

  return (
    <DefaultLayout>
      <DashboardLayout>
        <div className="space-y-6">
          {/* Tabs Navigation */}
          <Tabs
            aria-label="Course sections"
            selectedKey={activeTab}
            onSelectionChange={(key) => setActiveTab(key.toString())}
           
          >
            <Tab key="overview" title="Overview" />
            <Tab key="quizzes" title="Quizzes" />
            <Tab key="flashcards" title="Flashcards" />
            <Tab key="pastQuestions" title="Past Questions" />
          </Tabs>

          {activeTab === "overview" && (
            <>
              {/* Courses Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                {courses.map((course) => (
                  <Card
                    key={course.id}
                    className="border border-gray-200 hover:shadow-md transition-shadow"
                  >
                    <CardBody className="p-0 overflow-hidden">
                      <div className="relative">
                        <Image
                          src={course.thumbnail}
                          alt={course.title}
                          className="w-full h-40 object-cover"
                        />
                        <div className="absolute top-4 left-4">
                          <div
                            className={`${course.color} w-10 h-10 rounded-lg flex items-center justify-center text-white`}
                          >
                            <BookOpen size={18} />
                          </div>
                        </div>
                      </div>
                      <div className="p-6">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-bold text-lg">
                              {course.title}
                            </h3>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-gray-500 text-sm">
                                {course.code}
                              </span>
                              <Chip size="sm" variant="flat" color="success">
                                Active
                              </Chip>
                            </div>
                          </div>
                          <Badge
                            content={course.assignmentsDue}
                            color="danger"
                            shape="circle"
                          >
                            <Button isIconOnly variant="light" radius="full">
                              <Clock className="text-gray-500" size={16} />
                            </Button>
                          </Badge>
                        </div>

                        <div className="my-4">
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-500">Progress</span>
                            <span className="font-medium">
                              {course.progress}%
                            </span>
                          </div>
                          <Progress
                            aria-label="Course progress"
                            value={course.progress}
                            classNames={{
                              base: "h-2",
                              indicator:
                                course.color.replace(
                                  "bg",
                                  "bg-gradient-to-r from"
                                ) +
                                "-400 to" +
                                course.color.replace("bg", "-600"),
                            }}
                          />
                        </div>

                        <Divider className="my-4" />

                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <Clock size={16} className="text-gray-400" />
                            <span className="text-sm text-gray-500">
                              {course.nextSession}
                            </span>
                          </div>
                          <Button
                            size="sm"
                            radius="full"
                            variant="flat"
                            color="primary"
                            endContent={<ChevronRight size={16} />}
                          >
                            View Details
                          </Button>
                        </div>
                      </div>
                    </CardBody>
                  </Card>
                ))}
              </div>

              {/* Study Materials Preview */}
              <div className="space-y-6">
                <h2 className="text-xl font-semibold">
                  Recent Study Materials
                </h2>

                {/* Quizzes Preview */}
                <Card className="border border-gray-200">
                  <CardBody className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold flex items-center gap-2">
                        <FileText className="text-blue-500" size={18} />
                        Quizzes
                      </h3>
                      <Button
                        variant="light"
                        size="sm"
                        onPress={() => setActiveTab("quizzes")}
                      >
                        View All
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {studyMaterials
                        .filter((m) => m.type === "quiz")
                        .slice(0, 2)
                        .map((quiz) => (
                          <div
                            key={quiz.id}
                            className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                          >
                            <div className="flex justify-between items-start">
                              <h4 className="font-medium">{quiz.title}</h4>
                              <Chip size="sm" variant="flat">
                                {quiz.course}
                              </Chip>
                            </div>
                            <div className="flex items-center justify-between mt-3">
                              <span className="text-sm text-gray-500">
                                {quiz.completed}/{quiz.questions} questions
                              </span>
                              <Progress
                                size="sm"
                                value={(quiz.completed / quiz.questions) * 100}
                                className="max-w-[100px]"
                              />
                            </div>
                            <div className="text-xs text-gray-400 mt-2">
                              Due: {quiz.dueDate}
                            </div>
                          </div>
                        ))}
                    </div>
                  </CardBody>
                </Card>

                {/* Flashcards Preview */}
                <Card className="border border-gray-200">
                  <CardBody className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold flex items-center gap-2">
                        <Bookmark className="text-purple-500" size={18} />
                        Flashcards
                      </h3>
                      <Button
                        variant="light"
                        size="sm"
                        onPress={() => setActiveTab("flashcards")}
                      >
                        View All
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {studyMaterials
                        .filter((m) => m.type === "flashcard")
                        .slice(0, 2)
                        .map((deck) => (
                          <div
                            key={deck.id}
                            className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                          >
                            <div className="flex justify-between items-start">
                              <h4 className="font-medium">{deck.title}</h4>
                              <Chip size="sm" variant="flat">
                                {deck.course}
                              </Chip>
                            </div>
                            <div className="flex items-center justify-between mt-3">
                              <span className="text-sm text-gray-500">
                                {deck.mastered}/{deck.cards} mastered
                              </span>
                              <Progress
                                size="sm"
                                value={(deck.mastered / deck.cards) * 100}
                                color="secondary"
                                className="max-w-[100px]"
                              />
                            </div>
                            <div className="text-xs text-gray-400 mt-2">
                              Last reviewed: {deck.lastReviewed}
                            </div>
                          </div>
                        ))}
                    </div>
                  </CardBody>
                </Card>

                {/* Past Questions Preview */}
                <Card className="border border-gray-200">
                  <CardBody className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold flex items-center gap-2">
                        <FileSpreadsheet className="text-green-500" size={18} />
                        Past Questions
                      </h3>
                      <Button
                        variant="light"
                        size="sm"
                        onPress={() => setActiveTab("pastQuestions")}
                      >
                        View All
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {studyMaterials
                        .filter((m) => m.type === "pastQuestion")
                        .slice(0, 2)
                        .map((pq) => (
                          <div
                            key={pq.id}
                            className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                          >
                            <div className="flex justify-between items-start">
                              <h4 className="font-medium">{pq.title}</h4>
                              <Chip size="sm" variant="flat">
                                {pq.course}
                              </Chip>
                            </div>
                            <div className="flex items-center gap-4 mt-3">
                              <span className="text-sm text-gray-500">
                                {pq.pages} pages
                              </span>
                              <span className="text-sm text-gray-500">
                                {pq.year}
                              </span>
                            </div>
                            <div className="text-xs text-gray-400 mt-2">
                              Downloaded {pq.downloads} times
                            </div>
                          </div>
                        ))}
                    </div>
                  </CardBody>
                </Card>
              </div>
            </>
          )}

          {/* Quizzes Tab */}
          {activeTab === "quizzes" && (
            <div className="space-y-4">

              <CourseQuizzes/>
            </div>
          )}

          {/* Flashcards Tab */}
          {activeTab === "flashcards" && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <Bookmark className="text-purple-500" size={20} />
                  Flashcard Decks
                </h2>
                <Button color="primary" size="sm">
                  Create Deck
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {studyMaterials
                  .filter((m) => m.type === "flashcard")
                  .map((deck) => (
                    <Card
                      key={deck.id}
                      className="border border-gray-200 hover:shadow-md transition-shadow"
                    >
                      <CardBody className="p-4">
                        <div className="flex justify-between items-start">
                          <h3 className="font-medium">{deck.title}</h3>
                          <Chip size="sm" variant="flat">
                            {deck.course}
                          </Chip>
                        </div>
                        <div className="my-3">
                          <Progress
                            value={(deck.mastered / deck.cards) * 100}
                            color="secondary"
                          />
                          <div className="flex justify-between text-xs text-gray-500 mt-1">
                            <span>
                              {deck.mastered}/{deck.cards} mastered
                            </span>
                            <span>
                              {Math.round((deck.mastered / deck.cards) * 100)}%
                            </span>
                          </div>
                        </div>
                        <Divider className="my-2" />
                        <div className="flex justify-between items-center pt-2">
                          <span className="text-xs text-gray-400">
                            Last reviewed: {deck.lastReviewed}
                          </span>
                          <Button size="sm" variant="flat" color="secondary">
                            Review
                          </Button>
                        </div>
                      </CardBody>
                    </Card>
                  ))}
              </div>
            </div>
          )}

          {/* Past Questions Tab */}
          {activeTab === "pastQuestions" && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <FileSpreadsheet className="text-green-500" size={20} />
                  Past Questions
                </h2>
                <Button color="primary" size="sm">
                  Upload Questions
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {studyMaterials
                  .filter((m) => m.type === "pastQuestion")
                  .map((pq) => (
                    <Card
                      key={pq.id}
                      className="border border-gray-200 hover:shadow-md transition-shadow"
                    >
                      <CardBody className="p-4">
                        <div className="flex justify-between items-start">
                          <h3 className="font-medium">{pq.title}</h3>
                          <div className="flex gap-2">
                            <Chip size="sm" variant="flat">
                              {pq.course}
                            </Chip>
                            <Chip size="sm" variant="flat">
                              {pq.year}
                            </Chip>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 my-3 text-sm text-gray-600">
                          <span>{pq.pages} pages</span>
                          <span>Downloads: {pq.downloads}</span>
                        </div>
                        <Divider className="my-2" />
                        <div className="flex justify-between items-center pt-2">
                          <span className="text-xs text-gray-400">
                            Uploaded 2 weeks ago
                          </span>
                          <Button size="sm" variant="flat" color="success">
                            Download
                          </Button>
                        </div>
                      </CardBody>
                    </Card>
                  ))}
              </div>
            </div>
          )}
        </div>
      </DashboardLayout>
    </DefaultLayout>
  );
};

export default MyCourses;
