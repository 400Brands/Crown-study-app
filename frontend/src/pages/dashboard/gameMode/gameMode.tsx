import { useState, useEffect, useCallback } from "react";
import GameInterface from "./gameInterface";
import { Choice, SessionStats, SubmissionResult, Task } from "@/types";
import { supabase } from "@/supabaseClient";
import DefaultLayout from "@/layouts/default";
import DashboardLayout from "@/layouts/dashboardLayout";

const API_BASE_URL: string = "https://crowdlabel.tii.ae/api/2025.2";
const API_KEY = "jAG4usG-LvMn2JyBSgWCIN9YIKbKAEMJ";

const GameMode = () => {
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

  // Supabase state
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);

  // Initialize user session and load existing stats
  useEffect(() => {
    const initializeSession = async () => {
      try {
        const {
          data: { session },
          error: authError,
        } = await supabase.auth.getSession();

        if (authError) {
          console.error("Error getting session:", authError);
          setIsInitialized(true);
          return;
        }

        if (session?.user) {
          setUserId(session.user.id);
          await loadUserStats(session.user.id);
        }
      } catch (error) {
        console.error("Initialization error:", error);
      } finally {
        setIsInitialized(true);
      }
    };

    initializeSession();
  }, []);

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
          sessionScore: recentSession.score + userStats.total_score,
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
    [API_KEY]
  );

  // Calculate accuracy
  useEffect(() => {
    setAccuracy(
      totalAnswered > 0 ? Math.round((correctAnswers / totalAnswered) * 100) : 0
    );
  }, [correctAnswers, totalAnswered]);

  // Fetch a new task from the API
  const fetchTask = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setSelectedChoice(null);
    setShowResult(false);
    setIsCorrect(false);

    try {
      const response = await fetch(
        `${API_BASE_URL}/tasks/pick?lang=en&category=vqa&complexity=2`,
        {
          method: "GET",
          headers: getHeaders(),
        }
      );

      if (!response.ok) {
        throw new Error(
          `API Error: ${response.status} - ${await response.text()}`
        );
      }

      const data = await response.json();
      const taskToSet = Array.isArray(data) ? data[0] : data;

      if (!taskToSet?.id) {
        throw new Error("Invalid task data received");
      }

      setCurrentTask(taskToSet);
    } catch (err) {
      console.error("Error fetching task:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch task");
      setTimeout(() => fetchTask(), 2000); // Retry after 2 seconds
    } finally {
      setIsLoading(false);
    }
  }, [API_BASE_URL, getHeaders]);

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
    [API_BASE_URL, getHeaders]
  );

  // Start game with Supabase session
  const startGame = async () => {
    if (!userId) {
      setError("User not authenticated");
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
      setSessionStats({
        tasksCompleted: 0,
        sessionScore: 0,
        startTime: new Date(),
        dataRewards: 0,
      });

      await fetchTask();
    } catch (error) {
      console.error("Error starting game session:", error);
      setError("Failed to start game session");
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
      const pointsEarned = correct ? 10 * newStreak : 0;

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
    } catch (error) {
      console.error("Error handling choice:", error);
      setError("Failed to process answer");
    } finally {
      setIsLoading(false);
      setTimeout(fetchTask, 2000);
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
  };

  if (!isInitialized) {
    return (
      <DefaultLayout>
        <DashboardLayout>
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading dashboard...</p>
            </div>
          </div>
        </DashboardLayout>
      </DefaultLayout>
    );
  }

  return (
    <GameInterface
      timeLeft={timeLeft}
      isPlaying={isPlaying}
      score={score}
      streak={streak}
      maxStreak={maxStreak}
      accuracy={accuracy}
      currentTask={currentTask}
      isLoading={isLoading}
      error={error}
      selectedChoice={selectedChoice}
      showResult={showResult}
      isCorrect={isCorrect}
      sessionStats={sessionStats}
      onChoiceSelect={handleChoiceSelect}
      onStartGame={startGame}
      onEndGame={endGame}
      onRetry={fetchTask}
    />
  );
};

export default GameMode;
