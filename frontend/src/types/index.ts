import { SVGProps } from "react";

export type IconSvgProps = SVGProps<SVGSVGElement> & {
  size?: number;
};

// Define ProfileData interface
export interface ProfileData {
  user_id: string;
  full_name: string;
  email: string;
  profile_complete: boolean;
  avatar_url?: string;
  date_of_birth?: string;
  gender?: string;
  school_name?: string;
  department?: string;
  level?: string;
  state_of_origin?: string;
  matric_number?: string;
  updated_at?: string;
  [key: string]: any; // Allow for any additional fields
}

// Define types
export type Question = {
  id: string;
  text: string;
  options: { id: string; text: string; isCorrect: boolean }[];
  explanation: string;
};

export type QuizConfig = {
  title: string;
  courseId: string;
  questionCount: number;
  difficultyLevel: "easy" | "medium" | "hard" | "mixed";
  questionTypes: ("multiple-choice" | "true-false" | "short-answer")[];
};

export interface PDFQuizGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onQuizGenerated: (quiz: {
    title: string;
    courseId: string;
    questions: Question[];
  }) => void;
  availableCourses: { id: string; name: string }[];
}

// types/course.ts
export interface Course {
  id: number;
  title: string;
  code: string;
  progress: number;
  instructor: string;
  nextSession: string;
  assignmentsDue: number;
  resources: number;
  color: string;
  thumbnail: string;
}

export type StudyMaterialType = "quiz" | "flashcard" | "pastQuestion";

export interface StudyMaterial {
  id: number;
  course: string;
  type: StudyMaterialType;
  title: string;
  questions?: number;
  completed?: number;
  dueDate?: string;
  cards?: number;
  mastered?: number;
  lastReviewed?: string;
  pages?: number;
  downloads?: number;
  year?: string;
}

export interface OverviewProps {
  courses: Course[];
  studyMaterials: StudyMaterial[];
  setActiveTab: (tab: string) => void;
}

export interface FlashcardDeck {
  id: string;
  title: string;
  course: string;
  description: string;
  cards_count: number;
  mastered_count: number;
  last_reviewed: string;
  user_id: string;
  created_at: string;
}

export interface Flashcard {
  id: string;
  deck_id: string;
  front: string;
  back: string;
  is_mastered: boolean;
  difficulty_level: number;
  review_count: number;
  last_reviewed: string;
  created_at: string;
}

export interface Choice {
  key: string;
  value: string;
}

export interface Task {
  id: string;
  track_id: string;
  category: string;
  complexity: number;
  task: {
    text: string;
    choices: Choice[];
  };
  content: {
    image: {
      url: string;
      filename: string;
    };
  };
  explanation?: string;
}

export interface SessionStats {
  tasksCompleted: number;
  sessionScore: number;
  startTime: Date;
  dataRewards: number;
}

export interface SubmissionResult {
  success: boolean;
  confidence?: number;
  correct_answer?: string;
  explanation?: string;
  [key: string]: any;
}

// Define the StudySession interface - date is a Date object for client-side use
export interface StudySession {
  id: string;
  title: string;
  course: string;
  date: Date; // Stored as string in DB, converted to Date object for React state
  duration: number;
  priority: "high" | "medium" | "low";
  completed: boolean;
  type: "revision" | "reading" | "assignment" | "practice";
  created_at?: string;
}

export interface EditStudySessionModalProps {
  isOpen: boolean;
  onOpenChange: () => void;
  session: StudySession | null;
  onUpdateSession: (session: StudySession) => void;
}

export interface DeckFormData {
  title: string;
  pdfText?: string;
  description: string;
  cardCount: number;
}

export interface CardFormData {
  front: string;
  back: string;
}

export interface LoadingState {
  decks: boolean;
  cards: boolean;
  creating: boolean;
  updating: boolean;
}

export interface StudyMaterialSectionProps {
  title: string;
  icon: React.ReactNode;
  materials: StudyMaterial[];
  courseKey: keyof StudyMaterial;
  onViewAll: () => void;
  progressKey?: keyof StudyMaterial;
  totalKey?: keyof StudyMaterial;
  showLastReviewed?: boolean;
  showYear?: boolean;
  showDownloads?: boolean;
}

// Extend your existing types with these additions
export interface UserStats {
  streak: number;
  max_streak: number;
  total_score: number;
  total_answers: number;
  correct_answers: number;
  data_rewards: number;
  leaderboard_position?: number;
  department_rank?: number;
}

export interface LeaderboardEntry {
  user_id: string;
  name: string;
  avatar_url: string | null;
  department: string;
  total_score: number;
  rank: number;
}

export interface ActivityData {
  day: string;
  minutes_active: number;
  questions_answered: number;
}

export interface RewardsData {
  name: string;
  value: number;
  color: string;
}

export interface DashboardData {
  profile: ProfileData | null;
  stats: UserStats;
  leaderboard: LeaderboardEntry[];
  departmentLeaderboard: LeaderboardEntry[];
  activityData: ActivityData[];
}

//new

// types/dashboard.ts
export interface UserStats2 {
  streak: number;
  minutesActive: number;
  questionsAnswered: number;
  leaderboardPosition: number;
  departmentRank: number;
  points: number;
  dataRewards: number;
  accuracy: number;
}

export interface LeaderboardUser {
  id: string;
  name: string;
  avatar: string;
  points: number;
  department: string;
}

export interface ActivityData {
  day: string;
  minutesActive: number;
  questionsAnswered: number;
}

export interface StudyProgress {
  name: string;
  progress: number;
}

export interface RewardsData {
  name: string;
  value: number;
  color: string;
}

export interface LoadingStates {
  profile: boolean;
  stats: boolean;
  activity: boolean;
  leaderboards: boolean;
  progress: boolean;
}

//
// Types
export interface QuizOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

export interface QuizQuestion {
  id: string;
  quiz_id: string;
  question_text: string;
  options: QuizOption[];
  correct_answer_id: string;
  explanation?: string;
  order: number;
}

export interface Quiz {
  id: string;
  title: string;
  course: string;
  questions: number;
  completed: number;
  due_date: string;
  status: "not-started" | "in-progress" | "completed";
  user_id: string;
}

export interface UserAnswer {
  question_id: string;
  selected_option_id: string;
  is_correct: boolean;
}