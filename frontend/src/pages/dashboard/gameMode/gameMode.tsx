import { useState, useEffect, useCallback } from "react";
import GameInterface from "./gameInterface";
import { Choice, SessionStats, SubmissionResult, Task } from "@/types";
import { supabase } from "@/supabaseClient";

const API_BASE_URL: string = "https://crowdlabel.tii.ae/api/2025.2";
const API_KEY: string = "jAG4usG-LvMn2JyBSgWCIN9YIKbKAEMJ";

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
  const [isCorrect, setIsCorrect] = useState<boolean | "" | undefined>(false);
  const [sessionStats, setSessionStats] = useState<SessionStats>({
    tasksCompleted: 0,
    sessionScore: 0,
    startTime: new Date(),
    dataRewards: 0,
  });

  // Supabase state
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  // Initialize user session
  useEffect(() => {
    const initializeSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session?.user) {
        setUserId(session.user.id);
      }
    };
    initializeSession();
  }, []);

  const getHeaders = useCallback(
    () => ({
      "x-api-key": API_KEY,
      "Content-Type": "application/json",
    }),
    []
  );

  // Calculate accuracy whenever answers change
  useEffect(() => {
    if (totalAnswered > 0) {
      setAccuracy(Math.round((correctAnswers / totalAnswered) * 100));
    } else {
      setAccuracy(0);
    }
  }, [correctAnswers, totalAnswered]);

  // Fetch a new task from the API
  const fetchTask = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setSelectedChoice(null);
    setShowResult(false);

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
          `API Error: ${response.status} - ${response.statusText}`
        );
      }

      const data = await response.json();
      let taskToSet: Task | null = null;

      if (Array.isArray(data) && data.length > 0) {
        taskToSet = data[0];
      } else if (data && typeof data === "object") {
        taskToSet = data;
      } else {
        throw new Error("No tasks available");
      }

      if (taskToSet) {
        setCurrentTask(taskToSet);
      } else {
        throw new Error("Failed to parse task data from API response.");
      }
    } catch (err) {
      console.error("Error fetching task:", err);
      setError(
        err instanceof Error ? err.message : "An unknown error occurred"
      );
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
      const possibleBodyFormats = [
        { solution: solutionKey, tracking_id: trackingId },
        { solution: solutionKey, trackingId: trackingId },
        { solution: solutionKey, track_id: trackingId },
        { solution: solutionKey, id: trackingId },
        { solution: solutionKey, tracking: { id: trackingId } },
      ];

      for (let i = 0; i < possibleBodyFormats.length; i++) {
        const requestBody = possibleBodyFormats[i];

        try {
          const response = await fetch(
            `${API_BASE_URL}/tasks/${taskId}/submit`,
            {
              method: "POST",
              headers: getHeaders(),
              body: JSON.stringify(requestBody),
            }
          );

          if (response.ok) {
            const data = await response.json();
            return data as SubmissionResult;
          } else {
            const errorText = await response.text();
            if (i < possibleBodyFormats.length - 1) continue;
            throw new Error(
              `All submission attempts failed. Last error: ${response.status} - ${response.statusText} - ${errorText}`
            );
          }
        } catch (err) {
          if (i < possibleBodyFormats.length - 1) continue;
          setError(
            err instanceof Error
              ? err.message
              : "All submission attempts failed with unknown errors."
          );
          return null;
        }
      }
      return null;
    },
    [API_BASE_URL, getHeaders]
  );

  // Start game with Supabase session
  const startGame = async () => {
    if (!userId) return;

    try {
      const { data, error } = await supabase.rpc("start_game_session", {
        p_user_id: userId,
      });

      if (error) throw error;

      setSessionId(data);
      setIsPlaying(true);
      setTimeLeft(30);
      setScore(0);
      setStreak(0);
      setTotalAnswered(0);
      setCorrectAnswers(0);
      setSessionStats({
        tasksCompleted: 0,
        sessionScore: 0,
        startTime: new Date(),
        dataRewards: 0,
      });

      fetchTask();
    } catch (error) {
      console.error("Error starting game session:", error);
    }
  };

  // Handle user selection with Supabase integration
  const handleChoiceSelect = async (choice: Choice) => {
    if (!currentTask || showResult || !sessionId || !userId) return;

    const responseStartTime = Date.now();
    setSelectedChoice(choice);

    const result = await submitAnswer(
      currentTask.id,
      choice.key,
      currentTask.track_id
    );

    const responseTime = Date.now() - responseStartTime;

    if (result) {
      const CONFIDENCE_THRESHOLD = 0.5;
      const correct =
        !result.error &&
        result.confidence !== undefined &&
        result.confidence >= CONFIDENCE_THRESHOLD;

      setIsCorrect(correct);
      setShowResult(true);
      setTotalAnswered((prev) => prev + 1);

      let newStreak = streak;
      let pointsEarned = 0;

      if (correct) {
        console.log(
          `✅ Correct answer! Streak increased to ${streak + 1}.`,
          `Score increased by ${10 * (streak + 1)}`
        );
        setCorrectAnswers((prev) => prev + 1);
        newStreak = streak + 1;
        pointsEarned = 10 * newStreak;
        setStreak(newStreak);
        setMaxStreak((prev) => Math.max(prev, newStreak));
        setScore((prev) => prev + pointsEarned);
      } else {
        console.log("❌ Incorrect answer. Streak reset.");
        newStreak = 0;
        setStreak(0);
      }

      // Save to Supabase
      try {
        await supabase.rpc("record_task_submission", {
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
        });

        // Update session stats
        const newSessionStats = {
          tasksCompleted: sessionStats.tasksCompleted + 1,
          sessionScore: sessionStats.sessionScore + pointsEarned,
          startTime: sessionStats.startTime,
          dataRewards: sessionStats.dataRewards + (correct ? 0.1 : 0),
        };

        setSessionStats(newSessionStats);

        await supabase.rpc("update_game_session", {
          p_session_id: sessionId,
          p_score: newSessionStats.sessionScore,
          p_streak: newStreak,
          p_tasks_completed: newSessionStats.tasksCompleted,
          p_correct_answers: correctAnswers + (correct ? 1 : 0),
          p_total_answers: totalAnswered + 1,
          p_data_rewards: newSessionStats.dataRewards,
        });
      } catch (error) {
        console.error("Error saving to Supabase:", error);
      }
    } else {
      console.error("Submission failed or returned null");
      setIsCorrect(false);
      setShowResult(true);
      setTotalAnswered((prev) => prev + 1);
      setStreak(0);
    }

    setTimeout(() => {
      fetchTask();
    }, 2000);
  };

  // End game and finalize session
  const endGame = async () => {
    if (sessionId) {
      try {
        await supabase
          .from("game_sessions")
          .update({
            is_active: false,
            end_time: new Date().toISOString(),
            total_time_seconds: Math.floor(
              (Date.now() - sessionStats.startTime.getTime()) / 1000
            ),
          })
          .eq("id", sessionId);

        // Refresh leaderboards
        await supabase.rpc("refresh_leaderboards");
      } catch (error) {
        console.error("Error ending game session:", error);
      }
    }

    setIsPlaying(false);
    setSessionId(null);
  };

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