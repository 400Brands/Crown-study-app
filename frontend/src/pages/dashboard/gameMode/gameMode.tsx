import GameInterface from "./gameInterface";
import DefaultLayout from "@/layouts/default";
import DashboardLayout from "@/layouts/dashboardLayout";
import { useGameContext } from "../context/GameProvider";

const GameMode = () => {
  const {
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
    isInitialized,
    handleChoiceSelect: handleChoiceSelect,
    startGame: startGame,
    endGame: endGame,
    fetchTask,
  } = useGameContext();

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
