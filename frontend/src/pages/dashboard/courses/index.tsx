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
      title: "Imagination is more important than knowledge. - Albert Einstein",
      
      color: "bg-blue-500",
      thumbnail:
        "https://imgs.search.brave.com/XpBNMOML5vHo435XvKl7TySns3Z-zQ3JEmvAo0DbmI8/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9yZW5k/ZXIuZmluZWFydGFt/ZXJpY2EuY29tL2lt/YWdlcy9yZW5kZXJl/ZC9zZWFyY2gvcHJp/bnQvNi41LzgvYnJl/YWsvaW1hZ2VzL2Fy/dHdvcmtpbWFnZXMv/bWVkaXVtLzIvYWxi/ZXJ0LWVpbnN0ZWlu/LXNtb2tpbmctYS1w/aXBlLWJldHRtYW5u/LmpwZw",
    },
    {
      id: 2,
      title:
        "When something is important enough, you do it even if the odds are not in your favor - Elon Musk",
      
      color: "bg-purple-500",
      thumbnail:
        "https://imgs.search.brave.com/hCJenTbgMFuYzM0YXaltkfB5xUMf6fX0_DroEYn4xkY/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9jZG4u/YnJpdGFubmljYS5j/b20vMDUvMjM2NTA1/LTA1MC0xN0I2RTM0/QS9FbG9uLU11c2st/MjAyMi5qcGc_dz0z/ODU",
    },
    {
      id: 3,
      title: "Don’t wait for permission to build the future. - Iyinoluwa A",
      
      color: "bg-purple-500",
      thumbnail:
        "https://imgs.search.brave.com/1lCXzzMITqwXM1JlGA2LfOGx_QZTjkIPKuH87lkSvLA/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9naXN0/ZmxhcmUuY29tLm5n/L3dwLWNvbnRlbnQv/dXBsb2Fkcy8yMDIy/LzA0L0l5aW5vbHV3/YS1BYm95ZWppLmpw/Zw",
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
