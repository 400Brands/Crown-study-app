import { Route, Routes } from "react-router-dom";

// Public pages
import IndexPage from "@/pages/index";
import DocsPage from "@/pages/docs";
import PricingPage from "@/pages/pricing";
import BlogPage from "@/pages/blog";
import AboutPage from "@/pages/about";

// Main dashboard sections
import MyCourses from "@/pages/dashboard/courses";
import StudyPlanner from "./pages/dashboard/studyPlanner";
import GameMode from "./pages/dashboard/gameMode/gameMode";
import CourseQuizzes from "./pages/dashboard/courses/quizzes";
import QuizTaking from "./pages/dashboard/courses/QuizTaking";
import StudyLibrary from "./pages/dashboard/studyLibrary";
import DashboardPage from "@/pages/dashboard";

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
        <Route index element={<DashboardPage />} />

        {/* Courses section with nested routes */}
        <Route path="courses">
          <Route index element={<MyCourses />} />
          <Route path="quizzes">
            <Route index element={<CourseQuizzes />} />
            <Route path=":quizId" element={<QuizTaking />} />
          </Route>
        </Route>

        {/* Other dashboard routes */}
        <Route path="library" element={<StudyLibrary />} />
        <Route path="planner" element={<StudyPlanner />} />
        <Route path="focused-mode" element={<GameMode />} />
        <Route path="focused-mode" element={<GameMode />} />
      </Route>
    </Routes>
  );
}

export default App;
