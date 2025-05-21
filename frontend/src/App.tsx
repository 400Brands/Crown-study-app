import { Route, Routes } from "react-router-dom";

// Public pages
import IndexPage from "@/pages/index";
import DocsPage from "@/pages/docs";
import PricingPage from "@/pages/pricing";
import BlogPage from "@/pages/blog";
import AboutPage from "@/pages/about";

// Dashboard layout and index page
// import DashboardLayout from "@/layouts/DashboardLayout";
import DashboardPage from "@/pages/dashboard";

// Main dashboard sections
import MyCourses from "@/pages/dashboard/courses";
// import NotesFeed from "@/pages/dashboard/notes";
// import UploadCenter from "@/pages/dashboard/upload";
// import FocusedMode from "@/pages/dashboard/focused-mode";
// import GamesAnalytics from "@/pages/dashboard/analytics";
// import Profile from "@/pages/dashboard/profile";
// import Settings from "@/pages/dashboard/settings";
// import Help from "@/pages/dashboard/help";

// Course sub-pages
// import CourseQuizzes from "@/pages/dashboard/courses/quizzes";
// import CourseFlashcards from "@/pages/dashboard/courses/flashcards";
// import CoursePastQuestions from "@/pages/dashboard/courses/past-questions";
import DashboardLayout from "./layouts/dashboardLayout";
import IndexDashboard from "@/pages/dashboard";
import StudyLibrary from "./pages/dashboard/studyLibrary";
import StudyPlanner from "./pages/dashboard/studyPlanner";
import GameMode from "./pages/dashboard/gameMode";
import CourseQuizzes from "./pages/dashboard/courses/quizzes";

function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<IndexPage />} />
      <Route path="/docs" element={<DocsPage />} />
      <Route path="/pricing" element={<PricingPage />} />
      <Route path="/blog" element={<BlogPage />} />
      <Route path="/about" element={<AboutPage />} />

      {/* Dashboard Routes with proper nesting */}
      <Route path="/dashboard">
        <Route index element={<IndexDashboard />} />

        {/* Courses section with nested routes */}
        <Route path="courses">
          <Route index element={<MyCourses />} />
          <Route path="quizzes" element={<CourseQuizzes />} />
        </Route>

        {/* Other dashboard routes */}
        <Route path="library" element={<StudyLibrary />} />
        <Route path="planner" element={<StudyPlanner />} />
        <Route path="focused-mode" element={<GameMode />} />
        {/*
        
        <Route path="notes" element={<NotesFeed />} />
        <Route path="upload" element={<UploadCenter />} />
        <Route path="focused-mode" element={<FocusedMode />} />
        <Route path="analytics" element={<GamesAnalytics />} />
        <Route path="profile" element={<Profile />} />
        <Route path="settings" element={<Settings />} />
        <Route path="help" element={<Help />} /> */}
      </Route>
    </Routes>
  );
}

export default App;
