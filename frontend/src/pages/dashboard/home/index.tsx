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

interface UserStats {
  totalScore: number;
  currentStreak: number;
  maxStreak: number;
  accuracy: number;
  totalAnswers: number;
  correctAnswers: number;
  dataRewards: number;
  sessionScore: number;
  tasksCompleted: number;
  leaderboardPosition: number;
  departmentRank: number;
}

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
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<UserStats>({
    totalScore: 0,
    currentStreak: 0,
    maxStreak: 0,
    accuracy: 0,
    totalAnswers: 0,
    correctAnswers: 0,
    dataRewards: 0,
    sessionScore: 0,
    tasksCompleted: 0,
    leaderboardPosition: 0,
    departmentRank: 0,
  });
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [departmentLeaderboard, setDepartmentLeaderboard] = useState<
    LeaderboardUser[]
  >([]);
  const [activityData, setActivityData] = useState<ActivityData[]>([]);
  const [studyProgress, setStudyProgress] = useState<StudyProgress[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);

  const rewardsData: RewardsData[] = [
    {
      name: "Data",
      value: Math.round(stats.dataRewards * 10),
      color: "#3B82F6",
    },
    {
      name: "Streak Bonus",
      value: Math.round(stats.currentStreak * 2),
      color: "#10B981",
    },
    {
      name: "Leaderboard",
      value: Math.max(0, 100 - stats.leaderboardPosition),
      color: "#F59E0B",
    },
    {
      name: "Accuracy",
      value: Math.round(stats.accuracy / 2),
      color: "#EC4899",
    },
  ];

  // Initialize user session and load stats (similar to GameMode)
  useEffect(() => {
    const initializeSession = async () => {
      try {
        setLoading(true);
        const {
          data: { session },
          error: authError,
        } = await supabase.auth.getSession();

        if (authError) {
          console.error("Error getting session:", authError);
          setError("Authentication error");
          setIsInitialized(true);
          return;
        }

        if (!session?.user) {
          window.location.href = "/auth/login";
          return;
        }

        const currentUserId = session.user.id;
        setUserId(currentUserId);

        // Load all user data
        await Promise.all([
          loadUserStats(currentUserId),
          fetchProfile(currentUserId),
          fetchActivityData(currentUserId),
          fetchLeaderboards(currentUserId),
          fetchStudyProgress(currentUserId),
        ]);
      } catch (error) {
        console.error("Initialization error:", error);
        setError(
          error instanceof Error ? error.message : "Failed to load dashboard"
        );
      } finally {
        setLoading(false);
        setIsInitialized(true);
      }
    };

    initializeSession();
  }, []);

  // Load user stats from Supabase (similar to GameMode approach)
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

      // Get user's recent active session data
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

      // Get leaderboard position
      const { data: leaderboardData, error: leaderboardError } =
        await supabase.rpc("get_user_leaderboard_position", {
          p_user_id: userId,
        });

      // Set stats from backend or defaults
      const totalScore = userStats?.total_score || 0;
      const totalAnswers = userStats?.total_answers || 0;
      const correctAnswers = userStats?.correct_answers || 0;
      const maxStreak = userStats?.max_streak || 0;
      const currentStreak = recentSession?.current_streak || 0;
      const sessionScore = recentSession?.score || 0;
      const tasksCompleted = recentSession?.tasks_completed || 0;
      const dataRewards =
        recentSession?.data_rewards || userStats?.data_rewards || 0;

      setStats({
        totalScore,
        currentStreak,
        maxStreak,
        accuracy:
          totalAnswers > 0
            ? Math.round((correctAnswers / totalAnswers) * 100)
            : 0,
        totalAnswers,
        correctAnswers,
        dataRewards,
        sessionScore,
        tasksCompleted,
        leaderboardPosition: leaderboardData?.[0]?.position || 999,
        departmentRank: leaderboardData?.[0]?.department_rank || 999,
      });
    } catch (error) {
      console.error("Error loading user stats:", error);
    }
  };

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
      const [globalResult, deptResult] = await Promise.allSettled([
        supabase.rpc("get_global_leaderboard", { p_limit: 10 }),
        supabase.rpc("get_department_leaderboard", {
          p_user_id: userId,
          p_limit: 5,
        }),
      ]);

      if (globalResult.status === "fulfilled" && !globalResult.value.error) {
        setLeaderboard(globalResult.value.data || []);
      }

      if (deptResult.status === "fulfilled" && !deptResult.value.error) {
        setDepartmentLeaderboard(deptResult.value.data || []);
      }
    } catch (error) {
      console.error("Leaderboard fetch error:", error);
    }
  };

  const fetchStudyProgress = async (userId: string) => {
    try {
      const { data: progressData, error: progressError } = await supabase.rpc(
        "get_study_progress",
        { p_user_id: userId }
      );

      if (progressError) {
        // Fallback data
        setStudyProgress([
          {
            name: `${profile?.department || "Computer Science"} Core`,
            progress: 65,
          },
          { name: "General Studies", progress: 42 },
          {
            name: "TII Labeling Tasks",
            progress: Math.min(100, stats.accuracy),
          },
        ]);
        return;
      }

      setStudyProgress(progressData || []);
    } catch (error) {
      console.error("Error fetching study progress:", error);
    }
  };

  // Calculate time active (mock implementation)
  const getTimeActive = () => {
    // This would be calculated from session data in a real implementation
    return `${Math.floor(stats.tasksCompleted * 1.5)} mins`;
  };

  if (!isInitialized || loading) {
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

  if (error) {
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
              <p className="text-red-600 mb-4">{error}</p>
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
          {/* Main Stats Cards - Similar to Game Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Score Card */}
            <Card className="border border-blue-200 bg-blue-50">
              <CardBody className="p-4">
                <h3 className="text-sm font-medium text-blue-800">Score</h3>
                <p className="text-2xl font-bold">{stats.totalScore}</p>
                <Progress
                  value={Math.min(100, (stats.totalScore / 1000) * 100)}
                  className="mt-2"
                  color="primary"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {Math.max(0, 1000 - stats.totalScore)} to next milestone
                </p>
              </CardBody>
            </Card>

            {/* Current Streak Card */}
            <Card className="border border-green-200 bg-green-50">
              <CardBody className="p-4">
                <h3 className="text-sm font-medium text-green-800">Streak</h3>
                <p className="text-2xl font-bold">{stats.currentStreak}</p>
                <Progress
                  value={Math.min(100, (stats.currentStreak / 10) * 100)}
                  className="mt-2"
                  color="success"
                />
                <p className="text-xs text-gray-500 mt-1">Current streak</p>
              </CardBody>
            </Card>

            {/* Accuracy Card */}
            <Card className="border border-purple-200 bg-purple-50">
              <CardBody className="p-4">
                <h3 className="text-sm font-medium text-purple-800">
                  Accuracy
                </h3>
                <p className="text-2xl font-bold">{stats.accuracy}%</p>
                <Progress
                  value={stats.accuracy}
                  className="mt-2"
                  color="secondary"
                />
                <p className="text-xs text-gray-500 mt-1">{getTimeActive()}</p>
              </CardBody>
            </Card>

            {/* Max Streak Card */}
            <Card className="border border-orange-200 bg-orange-50">
              <CardBody className="p-4">
                <h3 className="text-sm font-medium text-orange-800">
                  Max Streak
                </h3>
                <p className="text-2xl font-bold">{stats.maxStreak}</p>
                <Progress
                  value={Math.min(100, (stats.maxStreak / 20) * 100)}
                  className="mt-2"
                  color="warning"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {stats.totalAnswers} questions answered
                </p>
              </CardBody>
            </Card>
          </div>

          {/* Charts and Additional Info */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Activity Chart */}
            <Card className="lg:col-span-2">
              <CardBody>
                <h3 className="font-semibold text-lg mb-4">Weekly Activity</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={activityData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="day" />
                      <YAxis />
                      <Tooltip />
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
            <Card>
              <CardBody>
                <h3 className="font-semibold text-lg mb-4">Rewards Summary</h3>
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
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <Divider className="my-4" />
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Total Points:</span>
                    <span className="font-medium">{stats.totalScore}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Data Rewards:</span>
                    <span className="font-medium">
                      {stats.dataRewards.toFixed(1)} GB
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Tasks Completed:</span>
                    <span className="font-medium">{stats.tasksCompleted}</span>
                  </div>
                  <Button
                    color="primary"
                    size="sm"
                    className="w-full mt-4"
                    onClick={() => {
                      // Handle reward claiming
                    }}
                  >
                    Claim Rewards
                  </Button>
                </div>
              </CardBody>
            </Card>
          </div>

          {/* Additional sections can be added here for leaderboards, study progress, etc. */}
          {leaderboard.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Global Leaderboard */}
              <Card>
                <CardBody>
                  <h3 className="font-semibold text-lg mb-4">
                    Global Leaderboard
                  </h3>
                  <div className="space-y-3">
                    {leaderboard.slice(0, 5).map((user, index) => (
                      <div
                        key={user.id}
                        className="flex items-center justify-between p-2 rounded-lg bg-gray-50"
                      >
                        <div className="flex items-center space-x-3">
                          <span className="text-sm font-medium w-6">
                            #{index + 1}
                          </span>
                          <Avatar size="sm" src={user.avatar} />
                          <div>
                            <p className="text-sm font-medium">{user.name}</p>
                            <p className="text-xs text-gray-500">
                              {user.department}
                            </p>
                          </div>
                        </div>
                        <span className="font-bold text-blue-600">
                          {user.points}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardBody>
              </Card>

              {/* Department Leaderboard */}
              <Card>
                <CardBody>
                  <h3 className="font-semibold text-lg mb-4">
                    Department Ranking
                  </h3>
                  <div className="space-y-3">
                    {departmentLeaderboard.slice(0, 5).map((user, index) => (
                      <div
                        key={user.id}
                        className="flex items-center justify-between p-2 rounded-lg bg-gray-50"
                      >
                        <div className="flex items-center space-x-3">
                          <span className="text-sm font-medium w-6">
                            #{index + 1}
                          </span>
                          <Avatar size="sm" src={user.avatar} />
                          <div>
                            <p className="text-sm font-medium">{user.name}</p>
                            <p className="text-xs text-gray-500">
                              {user.department}
                            </p>
                          </div>
                        </div>
                        <span className="font-bold text-green-600">
                          {user.points}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardBody>
              </Card>
            </div>
          )}
        </div>
      </DashboardLayout>
    </DefaultLayout>
  );
};

export default DashboardPage;