//@ts-nocheck

import React, { useState, useEffect } from "react";
import {
  Trophy,
  Target,
  Zap,
  Award,
  Clock,
  TrendingUp,
  Users,
  Medal,
} from "lucide-react";

// Mock data - replace with your actual Supabase queries
const mockUserStats = {
  totalSubmissions: 1247,
  correctAnswers: 1089,
  accuracy: 87.3,
  totalScore: 15420,
  maxStreak: 23,
  currentStreak: 8,
  averageConfidence: 0.78,
  totalTimeSpent: 14520, // in seconds
  dataRewards: 124.7,
  sessionsCompleted: 42,
  averageResponseTime: 2.3, // in seconds
  rank: 5,
  level: "Expert",
};

const mockLeaderboard = [
  {
    id: 1,
    name: "Sarah Chen",
    score: 18500,
    accuracy: 92.1,
    submissions: 1520,
    level: "Master",
    streak: 31,
  },
  {
    id: 2,
    name: "Alex Rodriguez",
    score: 17800,
    accuracy: 89.7,
    submissions: 1430,
    level: "Expert",
    streak: 28,
  },
  {
    id: 3,
    name: "Jordan Kim",
    score: 16200,
    accuracy: 91.2,
    submissions: 1280,
    level: "Expert",
    streak: 19,
  },
  {
    id: 4,
    name: "Taylor Johnson",
    score: 15900,
    accuracy: 88.4,
    submissions: 1340,
    level: "Expert",
    streak: 22,
  },
  {
    id: 5,
    name: "You",
    score: 15420,
    accuracy: 87.3,
    submissions: 1247,
    level: "Expert",
    streak: 8,
    isCurrentUser: true,
  },
  {
    id: 6,
    name: "Morgan Davis",
    score: 14800,
    accuracy: 86.1,
    submissions: 1190,
    level: "Advanced",
    streak: 15,
  },
  {
    id: 7,
    name: "Casey Wilson",
    score: 13500,
    accuracy: 84.8,
    submissions: 1080,
    level: "Advanced",
    streak: 12,
  },
  {
    id: 8,
    name: "Riley Brown",
    score: 12900,
    accuracy: 83.2,
    submissions: 1020,
    level: "Advanced",
    streak: 9,
  },
];

const StatCard = ({ icon: Icon, title, value, subtitle, color = "blue" }) => (
  <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className={`text-2xl font-bold text-${color}-600 mt-1`}>{value}</p>
        {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
      </div>
      <div className={`p-3 rounded-lg bg-${color}-50`}>
        <Icon className={`h-6 w-6 text-${color}-600`} />
      </div>
    </div>
  </div>
);

const LabelingStatsDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [userStats, setUserStats] = useState(mockUserStats);
  const [leaderboard, setLeaderboard] = useState(mockLeaderboard);
  const [loading, setLoading] = useState(false);

  // Format time helper
  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  // Format number helper
  const formatNumber = (num) => {
    return new Intl.NumberFormat().format(num);
  };

  const getRankSuffix = (rank) => {
    if (rank === 1) return "st";
    if (rank === 2) return "nd";
    if (rank === 3) return "rd";
    return "th";
  };

  const getRankIcon = (position) => {
    if (position === 1) return <Trophy className="h-5 w-5 text-yellow-500" />;
    if (position === 2) return <Medal className="h-5 w-5 text-gray-400" />;
    if (position === 3) return <Medal className="h-5 w-5 text-amber-600" />;
    return (
      <span className="text-sm font-semibold text-gray-600">#{position}</span>
    );
  };

  return (
    <div className="max-w-7xl mx-auto p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Data Labeling Statistics
        </h1>
        <p className="text-gray-600">
          Track your progress and compare with other labelers
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab("overview")}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "overview"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab("leaderboard")}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "leaderboard"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Leaderboard
          </button>
        </nav>
      </div>

      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Current Rank Card */}
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Your Current Rank</h2>
                <p className="text-blue-100 mt-1">Keep up the great work!</p>
              </div>
              <div className="text-right">
                <div className="text-4xl font-bold">#{userStats.rank}</div>
                <div className="text-blue-100">{userStats.level} Level</div>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              icon={Target}
              title="Total Submissions"
              value={formatNumber(userStats.totalSubmissions)}
              subtitle="Labels completed"
              color="blue"
            />
            <StatCard
              icon={Award}
              title="Accuracy Rate"
              value={`${userStats.accuracy}%`}
              subtitle={`${formatNumber(userStats.correctAnswers)} correct answers`}
              color="green"
            />
            <StatCard
              icon={Zap}
              title="Current Streak"
              value={userStats.currentStreak}
              subtitle={`Max streak: ${userStats.maxStreak}`}
              color="orange"
            />
            <StatCard
              icon={TrendingUp}
              title="Total Score"
              value={formatNumber(userStats.totalScore)}
              subtitle="Points earned"
              color="purple"
            />
          </div>

          {/* Additional Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              icon={Clock}
              title="Time Spent"
              value={formatTime(userStats.totalTimeSpent)}
              subtitle={`Avg: ${userStats.averageResponseTime}s per task`}
              color="indigo"
            />
            <StatCard
              icon={Target}
              title="Confidence Score"
              value={`${(userStats.averageConfidence * 100).toFixed(1)}%`}
              subtitle="Average confidence level"
              color="teal"
            />
            <StatCard
              icon={Award}
              title="Data Rewards"
              value={userStats.dataRewards.toFixed(1)}
              subtitle="Contribution points"
              color="emerald"
            />
            <StatCard
              icon={Users}
              title="Sessions"
              value={userStats.sessionsCompleted}
              subtitle="Completed sessions"
              color="rose"
            />
          </div>

          {/* Progress Section */}
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Recent Performance
            </h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>Accuracy Rate</span>
                  <span>{userStats.accuracy}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${userStats.accuracy}%` }}
                  ></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>Confidence Level</span>
                  <span>{(userStats.averageConfidence * 100).toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${userStats.averageConfidence * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "leaderboard" && (
        <div className="space-y-6">
          {/* Leaderboard */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Top Labelers
              </h3>
              <p className="text-sm text-gray-600">
                Based on total score and accuracy
              </p>
            </div>
            <div className="divide-y divide-gray-200">
              {leaderboard.map((user, index) => (
                <div
                  key={user.id}
                  className={`px-6 py-4 hover:bg-gray-50 transition-colors ${
                    user.isCurrentUser
                      ? "bg-blue-50 border-l-4 border-l-blue-500"
                      : ""
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center">
                        {getRankIcon(index + 1)}
                      </div>
                      <div>
                        <h4
                          className={`font-medium ${user.isCurrentUser ? "text-blue-900" : "text-gray-900"}`}
                        >
                          {user.name}
                          {user.isCurrentUser && (
                            <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              You
                            </span>
                          )}
                        </h4>
                        <p className="text-sm text-gray-500">
                          {user.level} • {formatNumber(user.submissions)}{" "}
                          submissions
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold text-gray-900">
                        {formatNumber(user.score)}
                      </p>
                      <p className="text-sm text-gray-500">
                        {user.accuracy}% accuracy
                      </p>
                    </div>
                  </div>
                  <div className="mt-2 flex items-center space-x-4 text-sm text-gray-600">
                    <span className="flex items-center">
                      <Zap className="h-4 w-4 mr-1 text-orange-500" />
                      {user.streak} streak
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Your Position */}
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold">Your Position</h3>
                <p className="text-blue-100 mt-1">
                  You're in the top 15% of all labelers!
                </p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold">#{userStats.rank}</div>
                <div className="text-blue-100">out of 2,847 labelers</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LabelingStatsDashboard;
