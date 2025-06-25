import { useState, useEffect } from "react";
import { supabase } from "@/supabaseClient";
import {
  Card,
  CardBody,
  Button,
  Divider,
  Progress,
  Avatar,
} from "@heroui/react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from "recharts";
import { ProfileData } from "@/types";
import DefaultLayout from "@/layouts/default";
import DashboardLayout from "@/layouts/dashboardLayout";
import { useGameContext } from "../context/GameProvider";

interface LeaderboardUser {
  id: string;
  name: string;
  avatar: string;
  points: number;
  department: string;
}

interface ActivityData {
  day: string;
  minutesActive: number;
  questionsAnswered: number;
}

interface StudyProgress {
  name: string;
  progress: number;
}

interface RewardsData {
  name: string;
  value: number;
  color: string;
}

const DashboardPage: React.FC = () => {
  // Use GameContext for all game-related data
  const {
    score,
    streak,
    maxStreak,
    accuracy,
    totalAnswered,
    sessionStats,
    userId,
    isInitialized,
    error: gameError,
  } = useGameContext();

  // Local state for additional dashboard data
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [departmentLeaderboard, setDepartmentLeaderboard] = useState<
    LeaderboardUser[]
  >([]);
  const [activityData, setActivityData] = useState<ActivityData[]>([]);
  const [studyProgress, setStudyProgress] = useState<StudyProgress[]>([]);
  const [leaderboardPosition, setLeaderboardPosition] = useState<number>(999);
  const [departmentRank, setDepartmentRank] = useState<number>(999);

  // Calculate rewards data from context
  const rewardsData: RewardsData[] = [
    {
      name: "Data",
      value: Math.round(sessionStats.dataRewards * 10),
      color: "#3B82F6",
    },
    {
      name: "Streak Bonus",
      value: Math.round(streak * 2),
      color: "#10B981",
    },
    {
      name: "Leaderboard",
      value: Math.max(0, 100 - leaderboardPosition),
      color: "#F59E0B",
    },
    {
      name: "Accuracy",
      value: Math.round(accuracy / 2),
      color: "#EC4899",
    },
  ];

  // Initialize dashboard data when GameContext is ready
  useEffect(() => {
    const initializeDashboard = async () => {
      if (!isInitialized || !userId) return;

      try {
        setLoading(true);
        await Promise.all([
          fetchProfile(userId),
          fetchActivityData(userId),
          fetchLeaderboards(userId),
          fetchStudyProgress(userId),
        ]);
      } catch (error) {
        console.error("Dashboard initialization error:", error);
        setError(
          error instanceof Error ? error.message : "Failed to load dashboard"
        );
      } finally {
        setLoading(false);
      }
    };

    initializeDashboard();
  }, [isInitialized, userId]);

  const fetchProfile = async (userId: string) => {
    try {
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (profileError && profileError.code !== "PGRST116") {
        console.error("Error fetching profile:", profileError);
        return;
      }

      setProfile(profileData as ProfileData);
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  };

  const fetchActivityData = async (userId: string) => {
    try {
      const { data: activityData, error: activityError } = await supabase.rpc(
        "get_weekly_activity",
        { p_user_id: userId }
      );

      if (activityError) {
        // Fallback data
        const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
        setActivityData(
          days.map((day) => ({
            day,
            minutesActive: Math.floor(Math.random() * 60),
            questionsAnswered: Math.floor(Math.random() * 20),
          }))
        );
        return;
      }

      setActivityData(activityData || []);
    } catch (error) {
      console.error("Error fetching activity data:", error);
    }
  };

  const fetchLeaderboards = async (userId: string) => {
    try {
      const [globalResult, deptResult, positionResult] =
        await Promise.allSettled([
          supabase.rpc("get_global_leaderboard", { p_limit: 10 }),
          supabase.rpc("get_department_leaderboard", {
            p_user_id: userId,
            p_limit: 5,
          }),
          supabase.rpc("get_user_leaderboard_position", {
            p_user_id: userId,
          }),
        ]);

      if (globalResult.status === "fulfilled" && !globalResult.value.error) {
        setLeaderboard(globalResult.value.data || []);
      }

      if (deptResult.status === "fulfilled" && !deptResult.value.error) {
        setDepartmentLeaderboard(deptResult.value.data || []);
      }

      if (
        positionResult.status === "fulfilled" &&
        !positionResult.value.error
      ) {
        const positionData = positionResult.value.data?.[0];
        setLeaderboardPosition(positionData?.position || 999);
        setDepartmentRank(positionData?.department_rank || 999);
      }
    } catch (error) {
      console.error("Leaderboard fetch error:", error);
    }
  };

  const fetchStudyProgress = async (userId: string) => {
    try {
      const { data: progressData } = await supabase.rpc("get_study_progress", {
        p_user_id: userId,
      });

      if (progressData) {
        // Fallback data using context data
        setStudyProgress([
          {
            name: `${profile?.department || "Computer Science"} Core`,
            progress: 65,
          },
          { name: "General Studies", progress: 42 },
          {
            name: "Mind Games",
            progress: Math.min(100, accuracy),
          },
        ]);
        return;
      }

      setStudyProgress(progressData || []);
    } catch (error) {
      console.error("Error fetching study progress:", error);
    }
  };

  // Calculate time active from session stats
  const getTimeActive = () => {
    if (sessionStats.startTime) {
      const timeDiff = Date.now() - sessionStats.startTime.getTime();
      const minutes = Math.floor(timeDiff / (1000 * 60));
      return `${minutes} mins`;
    }
    return `${Math.floor(sessionStats.tasksCompleted * 1.5)} mins`;
  };

  // Handle loading states
  if (!isInitialized || loading) {
    return (
      <DefaultLayout>
        <DashboardLayout>
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">
                Loading dashboard...
              </p>
            </div>
          </div>
        </DashboardLayout>
      </DefaultLayout>
    );
  }

  // Handle error states
  if (error || gameError) {
    return (
      <DefaultLayout>
        <DashboardLayout>
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <div className="text-red-500 mb-4">
                <svg
                  className="w-12 h-12 mx-auto"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>
              <p className="text-red-600 dark:text-red-400 mb-4">
                {error || gameError}
              </p>
              <Button color="primary" onClick={() => window.location.reload()}>
                Retry
              </Button>
            </div>
          </div>
        </DashboardLayout>
      </DefaultLayout>
    );
  }

  return (
    <DefaultLayout>
      <DashboardLayout>
        <div className="space-y-6 ml-4">
          {/* Main Stats Cards - Using GameContext data */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Score Card */}
            <Card className="border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/50">
              <CardBody className="p-4">
                <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">
                  Total Score
                </h3>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {score}
                </p>
                <Progress
                  value={Math.min(100, (score / 1000) * 100)}
                  className="mt-2"
                  color="primary"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {Math.max(0, 1000 - score)} to next milestone
                </p>
              </CardBody>
            </Card>

            {/* Current Streak Card */}
            <Card className="border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/50">
              <CardBody className="p-4">
                <h3 className="text-sm font-medium text-green-800 dark:text-green-200">
                  Current Streak
                </h3>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {streak}
                </p>
                <Progress
                  value={Math.min(100, (streak / 10) * 100)}
                  className="mt-2"
                  color="success"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Session: {sessionStats.tasksCompleted} tasks
                </p>
              </CardBody>
            </Card>

            {/* Accuracy Card */}
            <Card className="border border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-950/50">
              <CardBody className="p-4">
                <h3 className="text-sm font-medium text-purple-800 dark:text-purple-200">
                  Accuracy
                </h3>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {accuracy}%
                </p>
                <Progress value={accuracy} className="mt-2" color="secondary" />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {getTimeActive()}
                </p>
              </CardBody>
            </Card>

            {/* Max Streak Card */}
            <Card className="border border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-950/50">
              <CardBody className="p-4">
                <h3 className="text-sm font-medium text-orange-800 dark:text-orange-200">
                  Max Streak
                </h3>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {maxStreak}
                </p>
                <Progress
                  value={Math.min(100, (maxStreak / 20) * 100)}
                  className="mt-2"
                  color="warning"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {totalAnswered} questions answered
                </p>
              </CardBody>
            </Card>
          </div>

          {/* Charts and Additional Info */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Activity Chart */}
            <Card className="lg:col-span-2 dark:bg-gray-900/50">
              <CardBody>
                <h3 className="font-semibold text-lg mb-4 text-gray-900 dark:text-white">
                  Weekly Activity
                </h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={activityData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="day" stroke="#6B7280" />
                      <YAxis stroke="#6B7280" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "rgb(31 41 55)",
                          border: "1px solid rgb(75 85 99)",
                          borderRadius: "8px",
                          color: "white",
                        }}
                      />
                      <Legend />
                      <Bar
                        dataKey="minutesActive"
                        name="Minutes Active"
                        fill="#3B82F6"
                        fillOpacity={0.7}
                      />
                      <Bar
                        dataKey="questionsAnswered"
                        name="Questions Answered"
                        fill="#8B5CF6"
                        fillOpacity={0.7}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardBody>
            </Card>

            {/* Rewards Summary */}
            <Card className="dark:bg-gray-900/50">
              <CardBody>
                <h3 className="font-semibold text-lg mb-4 text-gray-900 dark:text-white">
                  Rewards Summary
                </h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={rewardsData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        label={({ name, percent }) =>
                          `${name} ${(percent * 100).toFixed(0)}%`
                        }
                      >
                        {rewardsData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "rgb(31 41 55)",
                          border: "1px solid rgb(75 85 99)",
                          borderRadius: "8px",
                          color: "white",
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <Divider className="my-4" />
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Total Points:
                    </span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {score}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Data Rewards:
                    </span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {sessionStats.dataRewards.toFixed(1)} GB
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Tasks Completed:
                    </span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {sessionStats.tasksCompleted}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Session Score:
                    </span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {sessionStats.sessionScore}
                    </span>
                  </div>
                  <Button
                    color="primary"
                    size="sm"
                    className="w-full mt-4"
                    onClick={() => {
                      // Handle reward claiming
                      console.log("Claiming rewards...");
                    }}
                  >
                    Claim Rewards
                  </Button>
                </div>
              </CardBody>
            </Card>
          </div>

          {/* Leaderboards */}
          {leaderboard.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Global Leaderboard */}
              <Card className="dark:bg-gray-900/50">
                <CardBody>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-semibold text-lg text-gray-900 dark:text-white">
                      Global Leaderboard
                    </h3>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      Your rank: #{leaderboardPosition}
                    </span>
                  </div>
                  <div className="space-y-3">
                    {leaderboard.slice(0, 5).map((user, index) => (
                      <div
                        key={user.id}
                        className={`flex items-center justify-between p-2 rounded-lg ${
                          user.id === userId
                            ? "bg-blue-100 dark:bg-blue-900/50"
                            : "bg-gray-50 dark:bg-gray-800/50"
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <span className="text-sm font-medium w-6 text-gray-900 dark:text-white">
                            #{index + 1}
                          </span>
                          <Avatar size="sm" src={user.avatar} />
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {user.id === userId ? "You" : user.name}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {user.department}
                            </p>
                          </div>
                        </div>
                        <span className="font-bold text-blue-600 dark:text-blue-400">
                          {user.points}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardBody>
              </Card>

              {/* Department Leaderboard */}
              <Card className="dark:bg-gray-900/50">
                <CardBody>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-semibold text-lg text-gray-900 dark:text-white">
                      Department Ranking
                    </h3>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      Dept rank: #{departmentRank}
                    </span>
                  </div>
                  <div className="space-y-3">
                    {departmentLeaderboard.slice(0, 5).map((user, index) => (
                      <div
                        key={user.id}
                        className={`flex items-center justify-between p-2 rounded-lg ${
                          user.id === userId
                            ? "bg-green-100 dark:bg-green-900/50"
                            : "bg-gray-50 dark:bg-gray-800/50"
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <span className="text-sm font-medium w-6 text-gray-900 dark:text-white">
                            #{index + 1}
                          </span>
                          <Avatar size="sm" src={user.avatar} />
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {user.id === userId ? "You" : user.name}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {user.department}
                            </p>
                          </div>
                        </div>
                        <span className="font-bold text-green-600 dark:text-green-400">
                          {user.points}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardBody>
              </Card>
            </div>
          )}

          {/* Study Progress */}
          {studyProgress.length > 0 && (
            <Card className="dark:bg-gray-900/50">
              <CardBody>
                <h3 className="font-semibold text-lg mb-4 text-gray-900 dark:text-white">
                  Study Progress
                </h3>
                <div className="space-y-4">
                  {studyProgress.map((item, index) => (
                    <div key={index}>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {item.name}
                        </span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {item.progress}%
                        </span>
                      </div>
                      <Progress
                        value={item.progress}
                        color={
                          item.progress >= 80
                            ? "success"
                            : item.progress >= 50
                              ? "warning"
                              : "danger"
                        }
                      />
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>
          )}
        </div>
      </DashboardLayout>
    </DefaultLayout>
  );
};

export default DashboardPage;
