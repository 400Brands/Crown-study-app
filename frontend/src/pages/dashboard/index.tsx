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
  streak: number;
  minutesActive: number;
  questionsAnswered: number;
  leaderboardPosition: number;
  departmentRank: number;
  points: number;
  dataRewards: number;
}

interface LeaderboardUser {
  id: number;
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

interface RewardsData {
  name: string;
  value: number;
  color: string;
}

const DashboardPage: React.FC = () => {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [stats, setStats] = useState<UserStats>({
    streak: 0,
    minutesActive: 0,
    questionsAnswered: 0,
    leaderboardPosition: 0,
    departmentRank: 0,
    points: 0,
    dataRewards: 0,
  });
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [departmentLeaderboard, setDepartmentLeaderboard] = useState<
    LeaderboardUser[]
  >([]);

  // Demo data for charts
  const activityData: ActivityData[] = [
    { day: "Mon", minutesActive: 45, questionsAnswered: 12 },
    { day: "Tue", minutesActive: 60, questionsAnswered: 18 },
    { day: "Wed", minutesActive: 30, questionsAnswered: 8 },
    { day: "Thu", minutesActive: 75, questionsAnswered: 22 },
    { day: "Fri", minutesActive: 50, questionsAnswered: 15 },
    { day: "Sat", minutesActive: 20, questionsAnswered: 5 },
    { day: "Sun", minutesActive: 15, questionsAnswered: 3 },
  ];

  const rewardsData: RewardsData[] = [
    { name: "Data", value: 65, color: "#3B82F6" },
    { name: "Streak Bonus", value: 15, color: "#10B981" },
    { name: "Leaderboard", value: 10, color: "#F59E0B" },
    { name: "Referrals", value: 10, color: "#EC4899" },
  ];

  useEffect(() => {
    fetchProfileAndStats();
  }, []);

  const fetchProfileAndStats = async (): Promise<void> => {
    try {
      setLoading(true);
      const { data: session, error: sessionError } =
        await supabase.auth.getSession();
      if (sessionError) throw sessionError;
      if (!session.session) {
        window.location.href = "/auth/login";
        return;
      }

      // Fetch profile
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", session.session.user.id)
        .single();

      if (profileError) throw profileError;
      setProfile(profileData as ProfileData);

      // Demo user stats
      const userStats: UserStats = {
        streak: 7,
        minutesActive: 245,
        questionsAnswered: 132,
        leaderboardPosition: 42,
        departmentRank: 3,
        points: 1250,
        dataRewards: 5.5,
      };
      setStats(userStats);

      // Demo leaderboard data
      const mockLeaderboard: LeaderboardUser[] = Array.from(
        { length: 10 },
        (_, i) => ({
          id: i + 1,
          name: `User ${i + 1}`,
          avatar: `https://i.pravatar.cc/150?img=${i + 1}`,
          points: 2000 - i * 100,
          department:
            i % 2 === 0
              ? profileData?.department || "Computer Science"
              : "Mathematics",
        })
      );
      setLeaderboard(mockLeaderboard);

      // Filter for department leaderboard
      if (profileData?.department) {
        const deptLeaderboard = mockLeaderboard
          .filter((user) => user.department === profileData.department)
          .slice(0, 5);
        setDepartmentLeaderboard(deptLeaderboard);
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DefaultLayout>
        <DashboardLayout>
          <div className="flex justify-center items-center h-64">
            <p>Loading dashboard...</p>
          </div>
        </DashboardLayout>
      </DefaultLayout>
    );
  }

  return (
    <DefaultLayout>
      <DashboardLayout>
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Stats Cards */}
            <Card className="border border-blue-200 bg-blue-50">
              <CardBody className="p-4">
                <h3 className="text-sm font-medium text-blue-800">
                  Current Streak
                </h3>
                <p className="text-2xl font-bold">{stats.streak} days</p>
                <Progress
                  value={(stats.streak / 30) * 100}
                  className="mt-2"
                  color="primary"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {30 - stats.streak} days to next reward
                </p>
              </CardBody>
            </Card>

            <Card className="border border-green-200 bg-green-50">
              <CardBody className="p-4">
                <h3 className="text-sm font-medium text-green-800">
                  Minutes Active
                </h3>
                <p className="text-2xl font-bold">{stats.minutesActive} mins</p>
                <div className="h-2 w-full bg-gray-200 rounded-full mt-2">
                  <div
                    className="h-full bg-green-500 rounded-full"
                    style={{
                      width: `${Math.min(100, stats.minutesActive / 5)}%`,
                    }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {Math.floor(stats.minutesActive / 60)} hours this week
                </p>
              </CardBody>
            </Card>

            <Card className="border border-purple-200 bg-purple-50">
              <CardBody className="p-4">
                <h3 className="text-sm font-medium text-purple-800">
                  Questions Answered
                </h3>
                <p className="text-2xl font-bold">{stats.questionsAnswered}</p>
                <div className="h-2 w-full bg-gray-200 rounded-full mt-2">
                  <div
                    className="h-full bg-purple-500 rounded-full"
                    style={{
                      width: `${Math.min(100, stats.questionsAnswered / 2)}%`,
                    }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {Math.floor(stats.questionsAnswered / 20)} data rewards earned
                </p>
              </CardBody>
            </Card>

            <Card className="border border-yellow-200 bg-yellow-50">
              <CardBody className="p-4">
                <h3 className="text-sm font-medium text-yellow-800">
                  Leaderboard Position
                </h3>
                <p className="text-2xl font-bold">
                  #{stats.leaderboardPosition}
                </p>
                <div className="h-2 w-full bg-gray-200 rounded-full mt-2">
                  <div
                    className="h-full bg-yellow-500 rounded-full"
                    style={{
                      width: `${Math.min(100, 100 - stats.leaderboardPosition)}%`,
                    }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  #{stats.departmentRank} in {profile?.department}
                </p>
              </CardBody>
            </Card>
          </div>

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
                    <span className="font-medium">{stats.points}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Data Rewards:</span>
                    <span className="font-medium">{stats.dataRewards} GB</span>
                  </div>
                  <Button color="primary" size="sm" className="w-full mt-4">
                    Claim Rewards
                  </Button>
                </div>
              </CardBody>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Global Leaderboard */}
            <Card>
              <CardBody>
                <h3 className="font-semibold text-lg mb-4">
                  Global Leaderboard
                </h3>
                <div className="space-y-4">
                  {leaderboard.map((user, index) => (
                    <div
                      key={user.id}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-3">
                        <span className="font-medium text-gray-500 w-6 text-right">
                          {index + 1}
                        </span>
                        <Avatar src={user.avatar} size="sm" />
                        <div>
                          <p className="font-medium">{user.name}</p>
                          <p className="text-xs text-gray-500">
                            {user.department}
                          </p>
                        </div>
                      </div>
                      <span className="font-bold">{user.points} pts</span>
                    </div>
                  ))}
                </div>
                <Divider className="my-4" />
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">
                    Your position: #{stats.leaderboardPosition}
                  </span>
                  <Button variant="flat" size="sm">
                    View All
                  </Button>
                </div>
              </CardBody>
            </Card>

            {/* Department Leaderboard */}
            <Card>
              <CardBody>
                <h3 className="font-semibold text-lg mb-4">
                  {profile?.department || "Your Department"} Leaderboard
                </h3>
                <div className="space-y-4">
                  {departmentLeaderboard.map((user, index) => (
                    <div
                      key={user.id}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-3">
                        <span className="font-medium text-gray-500 w-6 text-right">
                          {index + 1}
                        </span>
                        <Avatar src={user.avatar} size="sm" />
                        <div>
                          <p className="font-medium">{user.name}</p>
                          <p className="text-xs text-gray-500">
                            {user.department}
                          </p>
                        </div>
                      </div>
                      <span className="font-bold">{user.points} pts</span>
                    </div>
                  ))}
                  {stats.departmentRank > 5 && (
                    <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                      <div className="flex items-center space-x-3">
                        <span className="font-medium text-gray-500 w-6 text-right">
                          {stats.departmentRank}
                        </span>
                        <Avatar
                          src={
                            profile?.avatar_url ||
                            `https://i.pravatar.cc/150?img=30`
                          }
                          size="sm"
                        />
                        <div>
                          <p className="font-medium">You</p>
                          <p className="text-xs text-gray-500">
                            {profile?.department}
                          </p>
                        </div>
                      </div>
                      <span className="font-bold">{stats.points} pts</span>
                    </div>
                  )}
                </div>
                <Divider className="my-4" />
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">
                    Your position: #{stats.departmentRank}
                  </span>
                  <Button variant="flat" size="sm">
                    View All
                  </Button>
                </div>
              </CardBody>
            </Card>
          </div>

          {/* Study Progress Section */}
          <Card>
            <CardBody>
              <h3 className="font-semibold text-lg mb-4">Study Progress</h3>
              <div className="space-y-6">
                {profile?.department && (
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium">
                        {profile.department} Core
                      </span>
                      <span className="text-sm text-gray-500">65%</span>
                    </div>
                    <Progress value={65} color="primary" />
                  </div>
                )}
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">General Studies</span>
                    <span className="text-sm text-gray-500">42%</span>
                  </div>
                  <Progress value={42} color="secondary" />
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">
                      TII Labeling Tasks
                    </span>
                    <span className="text-sm text-gray-500">88%</span>
                  </div>
                  <Progress value={88} color="success" />
                </div>
              </div>
              <Divider className="my-4" />
              <Button color="primary" className="w-full">
                Continue Studying
              </Button>
            </CardBody>
          </Card>
        </div>
      </DashboardLayout>
    </DefaultLayout>
  );
};

export default DashboardPage;
