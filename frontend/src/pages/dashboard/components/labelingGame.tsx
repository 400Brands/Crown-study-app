// src/components/QuizLabelingGame.tsx
import { useState, useEffect } from "react";
import { Button, Card, Spinner } from "@heroui/react";
import { CheckCircle, XCircle, Award, Flame } from "lucide-react";
import { Choice, Task } from "@/types"; // Import Choice and Task types
import { useGameContext } from "../context/GameProvider";

interface QuizLabelingGameProps {
  onComplete: () => void;
}

const QuizLabelingGame = ({ onComplete }: QuizLabelingGameProps) => {
  const {
    currentTask,
    isLoading,
    error,
    handleChoiceSelect,
    fetchTask,
    selectedChoice,
    showResult,
    isCorrect,
    score,
    streak,
  } = useGameContext();

  const [localAnswered, setLocalAnswered] = useState(false);
  const [pointsEarned, setPointsEarned] = useState(0);
  const [isComponentMounted, setIsComponentMounted] = useState(false);

  // Reset state when component is shown
  useEffect(() => {
    setLocalAnswered(false);
    setPointsEarned(0);
    setIsComponentMounted(true);

    // Always fetch a fresh task when the component mounts
    fetchTask();

    return () => {
      setIsComponentMounted(false);
    };
  }, []); // Empty dependency array ensures this runs once when component mounts

  const handleSelect = (choice: Choice) => {
    if (localAnswered) return;

    handleChoiceSelect(choice);
    setLocalAnswered(true);
  };

  // Calculate points when result becomes available
  useEffect(() => {
    if (showResult && localAnswered) {
      const earned = isCorrect ? 10 * Math.max(1, streak) : 0;
      setPointsEarned(earned);
    }
  }, [showResult, localAnswered, isCorrect, streak]);

  const handleContinue = () => {
    // Reset local state before closing
    setLocalAnswered(false);
    setPointsEarned(0);

    // Call the completion handler
    onComplete();
  };

  const getChoiceColor = (choice: Choice) => {
    if (!showResult) return "default";
    if (choice.key === selectedChoice?.key) {
      return isCorrect ? "success" : "danger";
    }
    return "default";
  };

  // Show loading state initially or when fetching
  if (!isComponentMounted || isLoading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4">
        <Card className="w-full max-w-2xl">
          <div className="p-6">
            <div className="flex flex-col items-center justify-center py-12">
              <Spinner size="lg" className="mb-4" />
              <p>Loading labeling task...</p>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-hidden">
        <div className="p-6 max-h-[90vh] overflow-y-auto">
          <div className="text-center mb-6">
            <span className="inline-block px-4 py-2 text-md font-bold text-yellow-800 bg-yellow-100 rounded-full">
              MIND SHUFFLE GAME
            </span>
            
            <p className="text-gray-600 mt-2">
              Taking a break while studying is essential for maintaining focus
              and productivity
            </p>
          </div>

          {error && (
            <div className="text-center py-8 text-red-500">
              <p className="font-medium">Error loading task: {error}</p>
              <Button
                color="primary"
                className="mt-4"
                onClick={() => fetchTask()}
              >
                Try Again
              </Button>
            </div>
          )}

          {currentTask && !error && (
            <div className="space-y-6">
              {/* Hide image when result is shown */}
              {!showResult && (
                <div className="bg-gray-100 rounded-xl p-4 flex items-center justify-center max-h-80 overflow-y-auto">
                  {currentTask.content?.image?.url ? (
                    <img
                      src={currentTask.content.image.url}
                      alt="Labeling task"
                      className="max-h-72 rounded-lg shadow-md"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          "https://via.placeholder.com/400x300?text=Image+Not+Available";
                      }}
                    />
                  ) : (
                    <div className="text-gray-400 py-16 text-center">
                      <div className="bg-gray-200 border-2 border-dashed rounded-xl w-full h-64 flex items-center justify-center">
                        <span>No image available</span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <h3 className="text-xl font-medium text-center px-4">
                {currentTask.task?.text}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {currentTask.task?.choices?.map((choice: Choice) => (
                  <Button
                    key={choice.key}
                    fullWidth
                    variant={
                      getChoiceColor(choice) === "default" ? "flat" : "solid"
                    }
                    color={getChoiceColor(choice)}
                    onPress={() => handleSelect(choice)}
                    disabled={showResult && localAnswered}
                    className="py-5 justify-start text-md"
                  >
                    {choice.value}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Results Panel */}
          {showResult && localAnswered && (
            <div className="mt-6 p-5 rounded-xl border-2 bg-gradient-to-br from-blue-50 to-indigo-50">
              <div className="flex flex-col items-center text-center">
                <div
                  className={`text-2xl font-bold mb-3 ${isCorrect ? "text-green-600" : "text-red-600"}`}
                >
                  {isCorrect ? (
                    <div className="flex items-center gap-2">
                      <CheckCircle size={28} className="text-green-600" />
                      Correct Answer!
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <XCircle size={28} className="text-red-600" />
                      Incorrect
                    </div>
                  )}
                </div>

                {isCorrect && (
                  <div className="bg-yellow-100 border border-yellow-200 rounded-lg p-3 mb-3">
                    <div className="flex items-center justify-center gap-2">
                      <Award className="text-yellow-600" />
                      <span className="font-bold">+{pointsEarned} points</span>
                      <span className="mx-2">•</span>
                      <Flame className="text-orange-500" />
                      <span>Streak: {streak}</span>
                    </div>
                  </div>
                )}

                {currentTask?.explanation && (
                  <div className="mt-3 p-3 bg-blue-50 rounded-lg w-full">
                    <p className="text-blue-800 font-medium">
                      {currentTask.explanation}
                    </p>
                  </div>
                )}

                <Button
                  color={isCorrect ? "success" : "primary"}
                  className="mt-4 px-8 py-3 font-bold"
                  onPress={handleContinue}
                >
                  Continue Quiz
                </Button>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default QuizLabelingGame;
