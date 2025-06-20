import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import {
  Choice,
  SessionStats,
  SubmissionResult,
  Task,
  ProfileData,
} from "@/types";
import { supabase } from "@/supabaseClient";
import { Session } from "@supabase/supabase-js";

const API_BASE_URL: string = "https://crowdlabel.tii.ae/api/2025.2";
const API_KEY = "jAG4usG-LvMn2JyBSgWCIN9YIKbKAEMJ";

// Game Context Types
export interface GameContextType {
  // Game state
  timeLeft: number;
  isPlaying: boolean;
  score: number;
  streak: number;
  maxStreak: number;
  accuracy: number;
  currentTask: Task | null;
  isLoading: boolean;
  error: string | null;
  totalAnswered: number;
  correctAnswers: number;
  selectedChoice: Choice | null;
  showResult: boolean;
  isCorrect: boolean | "" | undefined;
  sessionStats: SessionStats;

  //
  session: Session | null | undefined;

  // Profile-based state
  userProfile: ProfileData | null;
  profileLoading: boolean;
  profileError: string | null;
  complexity: number;

  // Supabase state
  sessionId: string | null;
  userId: string | null;
  isInitialized: boolean;

  // Actions
  startGame: () => Promise<void>;
  endGame: () => Promise<void>;
  handleChoiceSelect: (choice: Choice) => Promise<void>;
  fetchTask: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  setTimeLeft: React.Dispatch<React.SetStateAction<number>>;
  setError: React.Dispatch<React.SetStateAction<string | null>>;
}

// Create Context
const GameContext = createContext<GameContextType | undefined>(undefined);

// Custom hook to use Game Context
export const useGameContext = () => {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error("useGameContext must be used within a GameProvider");
  }
  return context;
};

// Provider Props
interface GameProviderProps {
  children: ReactNode;
}

// Helper function to calculate complexity based on level
const calculateComplexity = (level: string | null | undefined): number => {
  if (!level) return 4; // Default complexity for empty/null level

  const levelNum = parseInt(level, 10);
  if (isNaN(levelNum)) return 4;

  if (levelNum >= 400) return 4;
  if (levelNum >= 300) return 3;
  if (levelNum >= 200) return 2;
  if (levelNum >= 100) return 1;

  return 4; // Default for any other case
};

// Game Provider Component
export const GameProvider: React.FC<GameProviderProps> = ({ children }) => {
  // Game state
  const [timeLeft, setTimeLeft] = useState<number>(30);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);
  const [maxStreak, setMaxStreak] = useState<number>(0);
  const [accuracy, setAccuracy] = useState<number>(0);
  const [currentTask, setCurrentTask] = useState<Task | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [totalAnswered, setTotalAnswered] = useState<number>(0);
  const [correctAnswers, setCorrectAnswers] = useState<number>(0);
  const [selectedChoice, setSelectedChoice] = useState<Choice | null>(null);
  const [showResult, setShowResult] = useState<boolean>(false);
  const [isCorrect, setIsCorrect] = useState<boolean | "" | undefined>();
  const [sessionStats, setSessionStats] = useState<SessionStats>({
    tasksCompleted: 0,
    sessionScore: 0,
    startTime: new Date(),
    dataRewards: 0,
  });

  // Profile-based state
  const [userProfile, setUserProfile] = useState<ProfileData | null>(null);
  const [profileLoading, setProfileLoading] = useState<boolean>(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [complexity, setComplexity] = useState<number>(4);

  // Supabase state
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);
  const [session, setSession] = useState<Session | null>();
  

  // Initialize user session and load profile
  useEffect(() => {
    const initializeSession = async () => {
      try {
        const {
          data: { session },
          error: authError,
        } = await supabase.auth.getSession();

        setSession;(session);

        if (authError) {
          console.error("Error getting session:", authError);
          setError("Authentication error occurred");
          setIsInitialized(true);
          return;
        }

        if (session?.user) {
          setUserId(session.user.id);
          await Promise.all([
            loadUserProfile(session.user.id),
            loadUserStats(session.user.id),
          ]);
        } else {
          setError("User not authenticated");
        }
      } catch (error) {
        console.error("Initialization error:", error);
        setError("Failed to initialize session");
      } finally {
        setIsInitialized(true);
      }
    };

    initializeSession();
  }, []);

  // Load user profile from Supabase
  const loadUserProfile = async (userId: string) => {
    try {
      setProfileLoading(true);
      setProfileError(null);

      const { data: userData, error: userError } =
        await supabase.auth.getUser();
      if (userError) throw userError;
      if (!userData.user) throw new Error("User not found");

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (profileError) {
        if (profileError.code === "PGRST116") {
          // Profile doesn't exist, create a new one
          const newProfileData: Partial<ProfileData> = {
            user_id: userId,
            full_name: userData.user.user_metadata?.full_name || "",
            email: userData.user.email || "",
            profile_complete: false,
          };

          const { data: newProfile, error: insertError } = await supabase
            .from("profiles")
            .insert(newProfileData)
            .select("*")
            .single();

          if (insertError) throw insertError;

          setUserProfile(newProfile as ProfileData);
          setComplexity(calculateComplexity(newProfile.level));
        } else {
          throw profileError;
        }
      } else {
        setUserProfile(profile as ProfileData);
        setComplexity(calculateComplexity(profile.level));
      }
    } catch (error: any) {
      console.error("Error loading user profile:", error);
      setProfileError(error?.message || "Failed to load profile");

      // If it's an auth error, redirect to login
      if (error?.message?.includes("auth") || error?.message?.includes("JWT")) {
        window.location.href = "/auth/login?error=session_expired";
      }
    } finally {
      setProfileLoading(false);
    }
  };

  // Refresh profile data
  const refreshProfile = useCallback(async () => {
    if (userId) {
      await loadUserProfile(userId);
    }
  }, [userId]);

  // Load user stats from Supabase
  const loadUserStats = async (userId: string) => {
    try {
      // Get user's overall stats
      const { data: userStats, error: userError } = await supabase
        .from("user_stats")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (userError && userError.code !== "PGRST116") {
        console.error("Error loading user stats:", userError);
        return;
      }

      // Get user's recent session data
      const { data: recentSession, error: sessionError } = await supabase
        .from("game_sessions")
        .select("*")
        .eq("user_id", userId)
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (sessionError && sessionError.code !== "PGRST116") {
        console.error("Error loading recent session:", sessionError);
      }

      // Set stats from backend or defaults
      if (userStats) {
        setScore(userStats.total_score || 0);
        setMaxStreak(userStats.max_streak || 0);
        setTotalAnswered(userStats.total_answers || 0);
        setCorrectAnswers(userStats.correct_answers || 0);
        setAccuracy(
          userStats.total_answers > 0
            ? Math.round(
                (userStats.correct_answers / userStats.total_answers) * 100
              )
            : 0
        );
      }

      // Set current streak from active session
      if (recentSession) {
        setStreak(recentSession.current_streak || 0);
        setSessionId(recentSession.id);
        setSessionStats({
          tasksCompleted: recentSession.tasks_completed || 0,
          sessionScore: recentSession.score + (userStats?.total_score || 0),
          startTime: new Date(recentSession.created_at),
          dataRewards: recentSession.data_rewards || 0,
        });
      }
    } catch (error) {
      console.error("Error loading user stats:", error);
    }
  };

  const getHeaders = useCallback(
    () => ({
      "x-api-key": API_KEY,
      "Content-Type": "application/json",
    }),
    []
  );

  // Calculate accuracy when stats change
  useEffect(() => {
    setAccuracy(
      totalAnswered > 0 ? Math.round((correctAnswers / totalAnswered) * 100) : 0
    );
  }, [correctAnswers, totalAnswered]);

  // Fetch a new task from the API using profile-based complexity
  const fetchTask = useCallback(async () => {
    if (!isInitialized) return;

    setIsLoading(true);
    setError(null);
    setSelectedChoice(null);
    setShowResult(false);
    setIsCorrect(false);

    try {
      const response = await fetch(
        `${API_BASE_URL}/tasks/pick?lang=en&category=vqa&complexity=${complexity}`,
        {
          method: "GET",
          headers: getHeaders(),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API Error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      const taskToSet = Array.isArray(data) ? data[0] : data;

      if (!taskToSet?.id) {
        throw new Error("Invalid task data received");
      }

      setCurrentTask(taskToSet);
    } catch (err) {
      console.error("Error fetching task:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch task";
      setError(errorMessage);

      // Retry after 3 seconds with exponential backoff
      setTimeout(() => {
        if (!isPlaying) return; // Don't retry if game is stopped
        fetchTask();
      }, 3000);
    } finally {
      setIsLoading(false);
    }
  }, [getHeaders, complexity, isInitialized, isPlaying]);

  // Submit answer to the API
  const submitAnswer = useCallback(
    async (
      taskId: string,
      solutionKey: string,
      trackingId: string
    ): Promise<SubmissionResult | null> => {
      const requestBodies = [
        { solution: solutionKey, tracking_id: trackingId },
        { solution: solutionKey, trackingId: trackingId },
        { solution: solutionKey, track_id: trackingId },
        { solution: solutionKey, id: trackingId },
      ];

      for (const body of requestBodies) {
        try {
          const response = await fetch(
            `${API_BASE_URL}/tasks/${taskId}/submit`,
            {
              method: "POST",
              headers: getHeaders(),
              body: JSON.stringify(body),
            }
          );

          if (response.ok) {
            return await response.json();
          }
        } catch (err) {
          console.error("Submission attempt failed:", err);
        }
      }

      return null;
    },
    [getHeaders]
  );

  // Start game with Supabase session
  const startGame = async () => {
    if (!userId) {
      setError("User not authenticated");
      return;
    }

    if (!userProfile) {
      setError("User profile not loaded");
      return;
    }

    try {
      const { data: sessionId, error } = await supabase.rpc(
        "start_game_session",
        {
          p_user_id: userId,
        }
      );

      if (error) throw error;

      setSessionId(sessionId);
      setIsPlaying(true);
      setTimeLeft(30);
      setError(null);
      setSessionStats({
        tasksCompleted: 0,
        sessionScore: 0,
        startTime: new Date(),
        dataRewards: 0,
      });

      await fetchTask();
    } catch (error: any) {
      console.error("Error starting game session:", error);
      setError(error?.message || "Failed to start game session");
    }
  };

  // Handle user selection
  const handleChoiceSelect = async (choice: Choice) => {
    if (!currentTask || showResult || !sessionId || !userId || isLoading)
      return;

    const responseStartTime = Date.now();
    setSelectedChoice(choice);
    setIsLoading(true);

    try {
      const result = await submitAnswer(
        currentTask.id,
        choice.key,
        currentTask.track_id
      );

      const responseTime = Date.now() - responseStartTime;
      const correct =
        result?.confidence !== undefined && result.confidence >= 0.5;

      // Update local state
      setIsCorrect(correct);
      setShowResult(true);
      setTotalAnswered((prev) => prev + 1);

      let newStreak = correct ? streak + 1 : 0;
      const pointsEarned = correct ? 10 * Math.max(1, newStreak) : 0;

      if (correct) {
        setCorrectAnswers((prev) => prev + 1);
        setScore((prev) => prev + pointsEarned);
        setMaxStreak((prev) => Math.max(prev, newStreak));
      }
      setStreak(newStreak);

      // Update session stats
      const newSessionStats = {
        tasksCompleted: sessionStats.tasksCompleted + 1,
        sessionScore: sessionStats.sessionScore + pointsEarned,
        startTime: sessionStats.startTime,
        dataRewards: sessionStats.dataRewards + (correct ? 0.1 : 0),
      };
      setSessionStats(newSessionStats);

      // Save to Supabase
      if (result) {
        await Promise.all([
          supabase.rpc("record_task_submission", {
            p_user_id: userId,
            p_session_id: sessionId,
            p_task_id: currentTask.id,
            p_tracking_id: currentTask.track_id,
            p_choice_key: choice.key,
            p_choice_value: choice.value,
            p_is_correct: correct,
            p_confidence: result.confidence || 0,
            p_response_time: responseTime,
            p_points_earned: pointsEarned,
            p_streak: newStreak,
            p_api_response: result,
          }),
          supabase.rpc("update_game_session", {
            p_session_id: sessionId,
            p_score: newSessionStats.sessionScore,
            p_streak: newStreak,
            p_tasks_completed: newSessionStats.tasksCompleted,
            p_correct_answers: correctAnswers + (correct ? 1 : 0),
            p_total_answers: totalAnswered + 1,
            p_data_rewards: newSessionStats.dataRewards,
          }),
          supabase.rpc("update_user_stats", {
            p_user_id: userId,
            p_points_earned: pointsEarned,
            p_is_correct: correct,
            p_new_streak: newStreak,
          }),
        ]);
      }
    } catch (error: any) {
      console.error("Error handling choice:", error);
      setError(error?.message || "Failed to process answer");
    } finally {
      setIsLoading(false);
      // Auto-fetch next task after 2 seconds
      setTimeout(() => {
        if (isPlaying) fetchTask();
      }, 2000);
    }
  };

  // End game and finalize session
  const endGame = async () => {
    if (sessionId) {
      try {
        await Promise.all([
          supabase
            .from("game_sessions")
            .update({
              is_active: false,
              end_time: new Date().toISOString(),
              total_time_seconds: Math.floor(
                (Date.now() - sessionStats.startTime.getTime()) / 1000
              ),
            })
            .eq("id", sessionId),
          supabase.rpc("refresh_leaderboards"),
        ]);
      } catch (error) {
        console.error("Error ending game session:", error);
      }
    }

    setIsPlaying(false);
    setSessionId(null);
    setCurrentTask(null);
    setSelectedChoice(null);
    setShowResult(false);
    setIsCorrect(false);
  };

  const contextValue: GameContextType = {
    // Game state
    timeLeft,
    isPlaying,
    score,
    streak,
    maxStreak,
    accuracy,
    currentTask,
    isLoading,
    error,
    totalAnswered,
    correctAnswers,
    selectedChoice,
    showResult,
    isCorrect,
    sessionStats,

    //
    session,

    // Profile-based state
    userProfile,
    profileLoading,
    profileError,
    complexity,

    // Supabase state
    sessionId,
    userId,
    isInitialized,

    // Actions
    startGame,
    endGame,
    handleChoiceSelect,
    fetchTask,
    refreshProfile,
    setTimeLeft,
    setError,
  };

  return (
    <GameContext.Provider value={contextValue}>{children}</GameContext.Provider>
  );
};
