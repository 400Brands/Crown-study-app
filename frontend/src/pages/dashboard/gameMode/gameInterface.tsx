import {
  Zap,
  BarChart2,
  Trophy,
  Timer,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Flame,
  AlertCircle,
  RefreshCw,
  Bolt,
} from "lucide-react";
import { Button, Card, Progress, Badge } from "@heroui/react";
import DefaultLayout from "@/layouts/default";
import DashboardLayout from "@/layouts/dashboardLayout";
import { Choice, SessionStats, Task } from "@/types";

interface GameInterfaceProps {
  timeLeft: number;
  isPlaying: boolean;
  score: number;
  streak: number;
  maxStreak: number;
  accuracy: number;
  currentTask: Task | null;
  isLoading: boolean;
  error: string | null;
  selectedChoice: Choice | null;
  showResult: boolean;
  isCorrect: boolean | "" | undefined;
  sessionStats: SessionStats;
  onChoiceSelect: (choice: Choice) => void;
  onStartGame: () => void;
  onEndGame: () => void;
  onRetry: () => void; // Add this prop type
}

const GameInterface = ({
  timeLeft,
  isPlaying,
  score,
  streak,
  maxStreak,
  accuracy,
  currentTask,
  isLoading,
  error,
  selectedChoice,
  showResult,
  isCorrect,
  sessionStats,
  onChoiceSelect,
  onStartGame,
  onEndGame,
  onRetry
}: GameInterfaceProps) => {
  const getChoiceColor = (choice: Choice) => {
    if (!showResult) return "default";
    if (choice.key === selectedChoice?.key) {
      return isCorrect ? "success" : "danger";
    }
    return "default";
  };

  const CardBody = ({
    children,
    className = "",
  }: {
    children: React.ReactNode;
    className?: string;
  }) => <div className={`p-6 ${className}`}>{children}</div>;

  return (
    <DefaultLayout>
      <DashboardLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Game Stats */}
            <div className="space-y-6">
              <Card>
                <CardBody className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                      <Zap className="text-yellow-500" /> Game Stats
                    </h2>
                    {isPlaying && (
                      <Button size="sm" color="danger" onClick={onEndGame}>
                        End Game
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="text-sm text-blue-600">Score</div>
                      <div className="text-2xl font-bold">{score}</div>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <div className="text-sm text-green-600">Streak</div>
                      <div className="text-2xl font-bold flex items-center gap-1">
                        {streak} <Flame className="text-orange-500" />
                      </div>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <div className="text-sm text-purple-600">Accuracy</div>
                      <div className="text-2xl font-bold">{accuracy}%</div>
                    </div>
                    <div className="bg-amber-50 p-4 rounded-lg">
                      <div className="text-sm text-amber-600">Time Left</div>
                      <div className="text-2xl font-bold flex items-center gap-1">
                        {timeLeft}s <Timer className="text-amber-500" />
                      </div>
                    </div>
                  </div>

                  <Progress
                    value={(timeLeft / 30) * 100}
                    color={
                      timeLeft > 15
                        ? "primary"
                        : timeLeft > 5
                          ? "warning"
                          : "danger"
                    }
                  />
                </CardBody>
              </Card>

              <Card>
                <CardBody>
                  <h2 className="text-xl font-bold flex items-center gap-2 mb-4">
                    <BarChart2 className="text-blue-500" /> Session Summary
                  </h2>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tasks Completed:</span>
                      <span className="font-medium">
                        {sessionStats.tasksCompleted}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Session Score:</span>
                      <span className="font-medium">
                        {sessionStats.sessionScore}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Data Rewards:</span>
                      <span className="font-medium">
                        {sessionStats.dataRewards.toFixed(1)} GB
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Duration:</span>
                      <span className="font-medium">
                        {Math.floor(
                          (new Date().getTime() -
                            sessionStats.startTime.getTime()) /
                            60000
                        )}{" "}
                        mins
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Max Streak:</span>
                      <span className="font-medium flex items-center gap-1">
                        {maxStreak} <Flame className="text-orange-500" />
                      </span>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </div>

            {/* Middle Column - Game Area */}
            <div className="lg:col-span-2 space-y-6">
              {!isPlaying ? (
                <Card className="text-center py-12">
                  <CardBody className="space-y-6">
                    <div className="flex justify-center">
                      <div className="bg-blue-100 p-4 rounded-full">
                        <Trophy className="w-12 h-12 text-blue-600" />
                      </div>
                    </div>
                    <h2 className="text-2xl font-bold">Labeling Challenge</h2>
                    <p className="text-gray-600 max-w-md mx-auto">
                      Answer visual questions correctly to earn points, build
                      streaks, and win data rewards. Each correct answer gives
                      you 0.1GB data.
                    </p>
                    <div className="pt-4">
                      <Button
                        size="lg"
                        color="primary"
                        onClick={onStartGame}
                        className="px-8"
                      >
                        Start Game
                      </Button>
                    </div>
                  </CardBody>
                </Card>
              ) : isLoading ? (
                <Card className="text-center py-12">
                  <CardBody>
                    <div className="flex justify-center">
                      <RefreshCw className="w-10 h-10 text-blue-500 animate-spin" />
                    </div>
                    <p className="mt-4 text-gray-600">
                      Loading next question...
                    </p>
                  </CardBody>
                </Card>
              ) : error ? (
                <Card className="text-center py-12">
                  <CardBody>
                    <div className="flex justify-center">
                      <AlertCircle className="w-10 h-10 text-red-500" />
                    </div>
                    <h3 className="text-xl font-medium mt-4">
                      Error Loading Task
                    </h3>
                    <p className="text-gray-600 mt-2">{error}</p>
                    <Button
                      color="primary"
                      onPress={onRetry} // Changed from fetchTask to onRetry
                      className="mt-4"
                    >
                      Try Again
                    </Button>
                  </CardBody>
                </Card>
              ) : currentTask ? (
                <Card>
                  <CardBody className="space-y-6">
                    <div className="flex justify-between items-start">
                      <Badge color="success" variant="flat">
                        {currentTask.category.toUpperCase()}
                      </Badge>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Bolt className="w-4 h-4 text-yellow-500" />
                        <span>Complexity: {currentTask.complexity}/4</span>
                      </div>
                    </div>

                    <div className="bg-gray-100 rounded-lg p-4 min-h-48 flex items-center justify-center">
                      {currentTask.content?.image?.url ? (
                        <img
                          src={currentTask.content.image.url}
                          alt="Task visual"
                          className="max-h-64 rounded"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              "https://via.placeholder.com/400x300?text=Image+Not+Available";
                          }}
                        />
                      ) : (
                        <div className="text-gray-400">No image available</div>
                      )}
                    </div>

                    <h3 className="text-xl font-medium">
                      {currentTask.task?.text}
                    </h3>

                    <div className="space-y-3">
                      {currentTask.task?.choices &&
                      currentTask.task.choices.length > 0 ? (
                        currentTask.task.choices.map((choice) => (
                          <Button
                            key={choice.key}
                            fullWidth
                            variant={
                              getChoiceColor(choice) === "default"
                                ? "flat"
                                : "solid"
                            }
                            color={getChoiceColor(choice)}
                            onPress={() => onChoiceSelect(choice)}
                            disabled={showResult}
                            className="justify-start py-6"
                          >
                            {showResult &&
                            choice.key === selectedChoice?.key ? (
                              isCorrect ? (
                                <CheckCircle2 className="mr-2" />
                              ) : (
                                <XCircle className="mr-2" />
                              )
                            ) : (
                              <HelpCircle className="mr-2" />
                            )}
                            {choice.value}
                          </Button>
                        ))
                      ) : (
                        <div className="text-center text-gray-500 py-8">
                          No choices available for this task
                        </div>
                      )}
                    </div>

                    {showResult && (
                      <div
                        className={`p-4 rounded-lg ${
                          isCorrect
                            ? "bg-green-50 text-green-800"
                            : "bg-red-50 text-red-800"
                        }`}
                      >
                        <div className="font-medium">
                          {isCorrect ? "Correct!" : "Incorrect!"}
                        </div>
                        {currentTask.explanation && (
                          <p className="mt-1 text-sm">
                            {currentTask.explanation}
                          </p>
                        )}
                      </div>
                    )}
                  </CardBody>
                </Card>
              ) : null}
            </div>
          </div>
        </div>
      </DashboardLayout>
    </DefaultLayout>
  );
};

export default GameInterface;
