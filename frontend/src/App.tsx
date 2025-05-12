import { Route, Routes } from "react-router-dom";

import IndexPage from "@/pages/index";
import DocsPage from "@/pages/docs";
import PricingPage from "@/pages/pricing";
import BlogPage from "@/pages/blog";
import AboutPage from "@/pages/about";
import IndexDashboard from "./pages/dashboard";
import MyCourses from "./pages/dashboard/myCourses";

function App() {
  return (
    <Routes>
      <Route element={<IndexPage />} path="/" />
      <Route element={<DocsPage />} path="/docs" />
      <Route element={<PricingPage />} path="/pricing" />
      <Route element={<BlogPage />} path="/blog" />
      <Route element={<AboutPage />} path="/about" />{" "}
      <Route element={<IndexDashboard />} path="/dashboard">
      <Route element={<MyCourses/>} path="/dashboard/myCourses" />
      
      </Route>
    </Routes>
  );
}

export default App;
