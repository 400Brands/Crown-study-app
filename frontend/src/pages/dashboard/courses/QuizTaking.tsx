// src/pages/dashboard/courses/QuizTaking.tsx
import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  CardBody,
  Button,
  RadioGroup,
  Radio,
  Progress,
  Chip,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Spinner,
} from "@heroui/react";
import {
  ArrowLeft,
  Clock,
  CheckCircle,
  XCircle,
  RotateCcw,
  Award,
  BookOpen,
} from "lucide-react";
import { supabase } from "@/supabaseClient";
import DefaultLayout from "@/layouts/default";
import DashboardLayout from "@/layouts/dashboardLayout";
import { Quiz, QuizOption, QuizQuestion, UserAnswer } from "@/types";
import QuizLabelingGame from "../components/labelingGame";

const QuizTaking = () => {
  const { quizId } = useParams<{ quizId: string }>();
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Map<string, string>>(
    new Map()
  );
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [isReviewMode, setIsReviewMode] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState<{ correct: number; total: number } | null>(
    null
  );
  const [showLabelingGame, setShowLabelingGame] = useState(false);
  const [isTimerPaused, setIsTimerPaused] = useState(false);
  const [labelingGameKey, setLabelingGameKey] = useState(0); // Add key to force remount

  const {
    isOpen: isSubmitModalOpen,
    onOpen: onSubmitModalOpen,
    onClose: onSubmitModalClose,
  } = useDisclosure();

  // Compute answered questions count
  const answeredQuestions = userAnswers.size;

  // Fetch quiz and questions
  useEffect(() => {
    const fetchQuizData = async () => {
      if (!quizId) return;

      try {
        setLoading(true);

        // Fetch quiz details
        const { data: quizData, error: quizError } = await supabase
          .from("quizzes")
          .select("*")
          .eq("id", quizId)
          .single();

        if (quizError) throw quizError;

        // Fetch questions
        const { data: questionsData, error: questionsError } = await supabase
          .from("quiz_questions")
          .select("*")
          .eq("quiz_id", quizId)
          .order("order", { ascending: true });

        if (questionsError) throw questionsError;

        setQuiz(quizData);
        setQuestions(questionsData);
        setIsReviewMode(quizData.status === "completed");

        // If it's a review, fetch previous answers
        if (quizData.status === "completed") {
          await fetchUserAnswers();
          setShowResults(true);
        } else {
          // Set timer for active quiz (30 minutes default)
          setTimeLeft(30 * 60);
        }
      } catch (error) {
        console.error("Error fetching quiz data:", error);
        setError("Failed to load quiz");
      } finally {
        setLoading(false);
      }
    };

    fetchQuizData();
  }, [quizId]);

  // Timer effect
  useEffect(() => {
    if (!isReviewMode && timeLeft > 0 && !isTimerPaused) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [isReviewMode, timeLeft, isTimerPaused]);

  // Auto-submit when time runs out
  useEffect(() => {
    if (timeLeft === 0 && !isReviewMode && !submitting && !loading) {
      handleSubmitQuiz();
    }
  }, [timeLeft, isReviewMode, submitting, loading]);

  // Fetch user's previous answers for review mode
  const fetchUserAnswers = useCallback(async () => {
    if (!quizId) return;

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("quiz_attempts")
        .select("question_id, selected_option_id, is_correct")
        .eq("quiz_id", quizId)
        .eq("user_id", user.id);

      if (error) throw error;

      const answersMap = new Map();
      data.forEach((answer: UserAnswer) => {
        answersMap.set(answer.question_id, answer.selected_option_id);
      });

      setUserAnswers(answersMap);

      // Calculate score
      const correctCount = data.filter((answer) => answer.is_correct).length;
      setScore({ correct: correctCount, total: data.length });
    } catch (error) {
      console.error("Error fetching user answers:", error);
    }
  }, [quizId]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleAnswerChange = (questionId: string, optionId: string) => {
    if (isReviewMode) return;

    setUserAnswers((prev) => {
      const newMap = new Map(prev);
      const wasAlreadyAnswered = newMap.has(questionId);
      newMap.set(questionId, optionId);

      // Only trigger for new answers (not updates)
      if (!wasAlreadyAnswered) {
        const newAnsweredCount = newMap.size;
        if (newAnsweredCount % 4 === 0 && newAnsweredCount > 0) {
          setIsTimerPaused(true);
          setLabelingGameKey((prev) => prev + 1); // Increment key to force remount
          setShowLabelingGame(true);
        }
      }

      return newMap;
    });
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  const handleSubmitQuiz = useCallback(async () => {
    if (submitting) return;

    setSubmitting(true);
    onSubmitModalClose();

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      // Prepare answers for submission
      const attempts = questions.map((question) => {
        const selectedOptionId = userAnswers.get(question.id);
        const isCorrect = selectedOptionId === question.correct_answer_id;

        return {
          quiz_id: quizId,
          question_id: question.id,
          user_id: user.id,
          selected_option_id: selectedOptionId,
          is_correct: isCorrect,
        };
      });

      // Save answers
      const { error: attemptsError } = await supabase
        .from("quiz_attempts")
        .insert(attempts);

      if (attemptsError) throw attemptsError;

      // Calculate score
      const correctAnswers = attempts.filter(
        (attempt) => attempt.is_correct
      ).length;
      const totalQuestions = questions.length;

      // Update quiz status
      const { error: updateError } = await supabase
        .from("quizzes")
        .update({
          status: "completed",
          completed: totalQuestions,
        })
        .eq("id", quizId);

      if (updateError) throw updateError;

      // Show results
      setScore({ correct: correctAnswers, total: totalQuestions });
      setShowResults(true);
      setIsReviewMode(true);
    } catch (error) {
      console.error("Error submitting quiz:", error);
      setError("Failed to submit quiz");
    } finally {
      setSubmitting(false);
    }
  }, [quizId, questions, userAnswers, onSubmitModalClose, submitting]);

  const getOptionColor = (
    question: QuizQuestion,
    option: QuizOption
  ): "default" | "success" | "danger" => {
    if (!isReviewMode) return "default";

    const userSelectedId = userAnswers.get(question.id);

    if (option.id === question.correct_answer_id) {
      return "success";
    }

    if (option.id === userSelectedId && !option.isCorrect) {
      return "danger";
    }

    return "default";
  };

  // Reset quiz
  const handleResetQuiz = async () => {
    if (!quizId) return;

    try {
      // Clear user answers in state
      setUserAnswers(new Map());
      setCurrentQuestionIndex(0);
      setScore(null);
      setShowResults(false);
      setIsReviewMode(false);

      // Reset timer (30 minutes)
      setTimeLeft(30 * 60);

      // Update quiz status in database
      const { error } = await supabase
        .from("quizzes")
        .update({
          status: "not-started",
          completed: 0,
        })
        .eq("id", quizId);

      if (error) throw error;

      // Delete previous attempts
      const { error: deleteError } = await supabase
        .from("quiz_attempts")
        .delete()
        .eq("quiz_id", quizId);

      if (deleteError) throw deleteError;
    } catch (error) {
      console.error("Error resetting quiz:", error);
      setError("Failed to reset quiz");
    }
  };

  const handleLabelingComplete = () => {
    setShowLabelingGame(false);
    setIsTimerPaused(false);
    // The labeling game component will handle its own cleanup
    // and fetch a fresh task next time it's shown
  };

  if (loading) {
    return (
      <DefaultLayout>
        <DashboardLayout>
          <div className="flex justify-center items-center min-h-screen">
            <Spinner size="lg" />
          </div>
        </DashboardLayout>
      </DefaultLayout>
    );
  }

  if (error || !quiz || questions.length === 0) {
    return (
      <DefaultLayout>
        <DashboardLayout>
          <div className="flex flex-col items-center justify-center min-h-screen gap-4">
            <div className="text-red-500">{error || "Quiz not found"}</div>
            <Button onPress={() => navigate("/dashboard/courses")}>
              Back to Quizzes
            </Button>
          </div>
        </DashboardLayout>
      </DefaultLayout>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const progressPercentage =
    ((currentQuestionIndex + 1) / questions.length) * 100;

  return (
    <DefaultLayout>
      <DashboardLayout>
        <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-4 space-y-4 sm:space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <Button
              variant="light"
              startContent={<ArrowLeft size={16} />}
              onPress={() => navigate("/dashboard/courses")}
              size="sm"
              className="self-start sm:self-auto"
            >
              Back to Quizzes
            </Button>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-normal">
              {isReviewMode && (
                <Button
                  variant="bordered"
                  color="warning"
                  startContent={<RotateCcw size={16} />}
                  onPress={handleResetQuiz}
                  size="sm"
                  className="shrink-0"
                >
                  Reset Quiz
                </Button>
              )}

              {!isReviewMode && (
                <div className="flex items-center gap-2 text-orange-600 bg-orange-50 px-3 py-1.5 rounded-full">
                  <Clock size={16} />
                  <span className="font-mono text-sm font-medium">
                    {formatTime(timeLeft)}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Quiz Info */}
          <Card className="w-full">
            <CardBody className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row justify-between items-start gap-3 sm:gap-4 mb-4">
                <div className="space-y-1">
                  <h1 className="text-lg sm:text-xl font-bold line-clamp-2">
                    {quiz.title}
                  </h1>
                  <p className="text-gray-600 text-sm">{quiz.course}</p>
                </div>
                <Chip
                  size="sm"
                  variant="flat"
                  color={isReviewMode ? "success" : "primary"}
                  startContent={
                    isReviewMode ? <Award size={16} /> : <BookOpen size={16} />
                  }
                >
                  {isReviewMode ? "Review Mode" : "Taking Quiz"}
                </Chip>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between text-xs">
                  <span>
                    Question {currentQuestionIndex + 1} of {questions.length}
                  </span>
                  <span>
                    {answeredQuestions}/{questions.length} answered
                  </span>
                </div>
                <Progress
                  size="sm"
                  value={progressPercentage}
                  classNames={{
                    indicator: "bg-gradient-to-r from-blue-500 to-indigo-600",
                  }}
                />
              </div>

              {showResults && score && (
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-1">
                    <span className="text-sm font-semibold">Final Score:</span>
                    <span className="text-lg font-bold text-blue-600">
                      {score.correct}/{score.total} (
                      {Math.round((score.correct / score.total) * 100)}%)
                    </span>
                  </div>
                </div>
              )}
            </CardBody>
          </Card>

          {/* Question Card */}
          <Card className="w-full">
            <CardBody className="p-4 sm:p-6">
              <div className="space-y-4">
                <h2 className="text-base sm:text-lg font-semibold leading-relaxed">
                  {currentQuestion.question_text}
                </h2>

                <RadioGroup
                  value={userAnswers.get(currentQuestion.id) || ""}
                  onValueChange={(value) =>
                    handleAnswerChange(currentQuestion.id, value)
                  }
                  isDisabled={isReviewMode}
                  className="gap-2"
                >
                  {currentQuestion.options.map((option) => (
                    <Radio
                      key={option.id}
                      value={option.id}
                      classNames={{
                        base: `max-w-full m-0 p-3 rounded-lg border-2 transition-all ${
                          getOptionColor(currentQuestion, option) === "success"
                            ? "border-green-200 bg-green-50"
                            : getOptionColor(currentQuestion, option) ===
                                "danger"
                              ? "border-red-200 bg-red-50"
                              : "border-gray-200 hover:border-blue-200"
                        }`,
                        label: "text-sm",
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <span>{option.text}</span>
                        {isReviewMode &&
                          option.id === currentQuestion.correct_answer_id && (
                            <CheckCircle
                              size={16}
                              className="text-green-600 shrink-0"
                            />
                          )}
                        {isReviewMode &&
                          option.id === userAnswers.get(currentQuestion.id) &&
                          !option.isCorrect && (
                            <XCircle
                              size={16}
                              className="text-red-600 shrink-0"
                            />
                          )}
                      </div>
                    </Radio>
                  ))}
                </RadioGroup>

                {/* Explanation */}
                {isReviewMode && currentQuestion.explanation && (
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <h4 className="font-semibold text-blue-900 mb-1 text-sm">
                      Explanation:
                    </h4>
                    <p className="text-blue-800 text-sm">
                      {currentQuestion.explanation}
                    </p>
                  </div>
                )}
              </div>
            </CardBody>
          </Card>

          {/* Navigation */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
            <Button
              variant="bordered"
              onPress={handlePreviousQuestion}
              isDisabled={currentQuestionIndex === 0}
              size="sm"
              className="w-full sm:w-auto"
            >
              Previous
            </Button>

            <div className="flex gap-1 overflow-x-auto w-full sm:w-auto px-1 py-2">
              {questions.map((_, index) => (
                <Button
                  key={index}
                  size="sm"
                  isIconOnly
                  variant={
                    index === currentQuestionIndex ? "solid" : "bordered"
                  }
                  color={
                    userAnswers.has(questions[index].id)
                      ? index === currentQuestionIndex
                        ? "primary"
                        : "success"
                      : index === currentQuestionIndex
                        ? "primary"
                        : "default"
                  }
                  onPress={() => setCurrentQuestionIndex(index)}
                >
                  {index + 1}
                </Button>
              ))}
            </div>

            {currentQuestionIndex === questions.length - 1 ? (
              !isReviewMode ? (
                <Button
                  color="primary"
                  onPress={onSubmitModalOpen}
                  isDisabled={answeredQuestions < questions.length}
                  size="sm"
                  className="w-full sm:w-auto"
                >
                  Submit Quiz
                </Button>
              ) : (
                <Button
                  variant="bordered"
                  startContent={<RotateCcw size={16} />}
                  onPress={() => navigate("/dashboard/courses")}
                  size="sm"
                  className="w-full sm:w-auto"
                >
                  Back to Quizzes
                </Button>
              )
            ) : (
              <Button
                color="primary"
                onPress={handleNextQuestion}
                size="sm"
                className="w-full sm:w-auto"
              >
                Next
              </Button>
            )}
          </div>

          {/* Submit Confirmation Modal */}
          <Modal isOpen={isSubmitModalOpen} onClose={onSubmitModalClose}>
            <ModalContent>
              <ModalHeader className="text-lg">Submit Quiz</ModalHeader>
              <ModalBody>
                <p>Are you sure you want to submit your quiz?</p>
                <p className="text-sm text-gray-600">
                  You have answered {answeredQuestions} out of{" "}
                  {questions.length} questions.
                  {answeredQuestions < questions.length &&
                    " Unanswered questions will be marked as incorrect."}
                </p>
              </ModalBody>
              <ModalFooter>
                <Button variant="light" onPress={onSubmitModalClose} size="sm">
                  Cancel
                </Button>
                <Button
                  color="primary"
                  onPress={handleSubmitQuiz}
                  isLoading={submitting}
                  size="sm"
                >
                  Submit
                </Button>
              </ModalFooter>
            </ModalContent>
          </Modal>

          {/* Labeling Game Modal */}
          {showLabelingGame && (
            <QuizLabelingGame
              key={labelingGameKey} // Force remount with new task
              onComplete={handleLabelingComplete}
            />
          )}
        </div>
      </DashboardLayout>
    </DefaultLayout>
  );
};

export default QuizTaking;
