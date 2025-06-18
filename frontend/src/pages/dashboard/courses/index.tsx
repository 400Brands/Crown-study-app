//@ts-nocheck
import { Tabs, Tab } from "@heroui/react";

import DashboardLayout from "@/layouts/dashboardLayout";
import DefaultLayout from "@/layouts/default";
import { useState } from "react";
import CourseQuizzes from "./quizzes";
import PastQuestions from "./pastQuestions";
import Flashcards from "./flashCards";
import Overview from "./Overview";
import { StudyMaterial } from "@/types";

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
      thumbnail:
        "https://res.cloudinary.com/dgbreoalg/image/upload/v1748253398/360_F_239753981_Z0AGbK5i7v4aIVm1Of8trUYYTWgoQnuq-ezgif.com-webp-to-jpg-converter_abrzyb.jpg",
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
      thumbnail:
        "https://res.cloudinary.com/dgbreoalg/image/upload/v1748253398/360_F_239753981_Z0AGbK5i7v4aIVm1Of8trUYYTWgoQnuq-ezgif.com-webp-to-jpg-converter_abrzyb.jpg",
    },
    {
      id: 3,
      title: "Data Structures and Algorithms",
      code: "CSC 201",
      progress: 45,
      instructor: "Prof. Chukwu",
      nextSession: "Wed, 2:00 PM",
      assignmentsDue: 3,
      resources: 22,
      color: "bg-purple-500",
      thumbnail:
        "https://res.cloudinary.com/dgbreoalg/image/upload/v1748253398/360_F_239753981_Z0AGbK5i7v4aIVm1Of8trUYYTWgoQnuq-ezgif.com-webp-to-jpg-converter_abrzyb.jpg",
    },
  ];

  // Sample study materials
  const studyMaterials: StudyMaterial[] = [
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
        <div className="space-y-6 ml-4">
          {/* Tabs Navigation */}
          <Tabs
            aria-label="Course sections"
            selectedKey={activeTab}
            onSelectionChange={(key) => setActiveTab(key.toString())}
          >
            <Tab key="overview" title="Overview" />
            <Tab key="quizzes" title="Quizzes" />
            <Tab key="flashcards" title="Flashcards" />
          </Tabs>
          {activeTab === "overview" && (
            <Overview
              courses={courses}
              studyMaterials={studyMaterials}
              setActiveTab={setActiveTab}
            />
          )}
          {/* Quizzes Tab */}
          {activeTab === "quizzes" && (
            <div className="space-y-4">
              <CourseQuizzes />
            </div>
          )}
          {/* Flashcards Tab */}
          {activeTab === "flashcards" && <Flashcards />}
        </div>
      </DashboardLayout>
    </DefaultLayout>
  );
};

export default MyCourses;
