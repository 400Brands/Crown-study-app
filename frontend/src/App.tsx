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
import CourseQuizzes from "./pages/dashboard/courses/quiz/quizzes";
import QuizTaking from "./pages/dashboard/courses/quiz/QuizTaking";
import StudyLibrary from "./pages/dashboard/studyLibrary";
import DashboardPage from "@/pages/dashboard/home";
import NotesFeed from "./pages/dashboard/notesFeed";
import ProfileComponent from "./pages/dashboard/profile";
import Settings from "./pages/dashboard/settings";
import Opportunities from "./pages/dashboard/opportunities";
import { GameProvider } from "./pages/dashboard/context/GameProvider";
import LabelingStatsDashboard from "./pages/admin";
import { StudyLibraryProvider } from "./pages/dashboard/context/studyLibraryContext";

function App() {
  return (
    <GameProvider>
      <StudyLibraryProvider>
        <Routes>
        {/* Public Routes */}
        <Route path="/" element={<IndexPage />} />
        <Route path="/docs" element={<DocsPage />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/blog" element={<BlogPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/admin" element={<LabelingStatsDashboard />} />

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
          <Route path="note-feed" element={<NotesFeed />} />
          <Route path="focused-mode" element={<GameMode />} />
          <Route path="opportunities" element={<Opportunities />} />

          <Route path="profile" element={<ProfileComponent />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
      </StudyLibraryProvider>
      
    </GameProvider>
  );
}

export default App;
