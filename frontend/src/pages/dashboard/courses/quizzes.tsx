import { useEffect, useState } from "react";
import {
  Card,
  CardBody,
  Button,
  Chip,
  Divider,
  Progress,
  Pagination,
  useDisclosure,
  Spinner,
} from "@heroui/react";
import { FileText, Clock, ChevronRight, FileUp, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import PDFQuizGeneratorModal from "../components/PDFQuizGeneratorModal";
import { supabase } from "@/supabaseClient";
import { Question } from "@/types";

// Define types
type Quiz = {
  id: string;
  title: string;
  course: string;
  questions: number;
  completed: number;
  due_date: string;
  status: "not-started" | "in-progress" | "completed";
  user_id?: string;
};

type Course = {
  id: string;
  name: string;
};

const CourseQuizzes = () => {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 6;

  const availableCourses: Course[] = [
    { id: "CSC101", name: "CSC 101: Introduction to Programming" },
    { id: "CSC201", name: "CSC 201: Data Structures & Algorithms" },
    { id: "CSC301", name: "CSC 301: Database Systems" },
    { id: "CSC305", name: "CSC 305: Artificial Intelligence" },
  ];

  const { isOpen, onOpen, onClose } = useDisclosure();

  // Fetch quizzes from Supabase
  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const { data, error } = await supabase
          .from("quizzes")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) throw error;

        // Transform data to match our Quiz type (removed dueDate field that wasn't in type)
        const formattedQuizzes =
          data?.map((quiz: any) => ({
            id: quiz.id,
            title: quiz.title,
            course: quiz.course,
            questions: quiz.questions,
            completed: quiz.completed,
            due_date: quiz.due_date,
            status: quiz.status,
            user_id: quiz.user_id,
          })) || [];

        setQuizzes(formattedQuizzes);
      } catch (error) {
        console.error("Error fetching quizzes:", error);
        setError("Failed to load quizzes");
      } finally {
        setLoading(false);
      }
    };

    fetchQuizzes();
  }, []);

  const handleQuizGenerated = async (newQuiz: {
    title: string;
    courseId: string;
    questions: Question[];
  }) => {
    try {
      const courseName =
        availableCourses
          .find((c) => c.id === newQuiz.courseId)
          ?.name.split(":")[0] || "";

      // Get current user
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) throw userError;
      if (!user) throw new Error("User not authenticated");

      // Start transaction
      const { data: quizData, error: quizError } = await supabase
        .from("quizzes")
        .insert([
          {
            title: newQuiz.title,
            course: courseName,
            questions: newQuiz.questions.length,
            completed: 0,
            due_date: new Date(
              Date.now() + 7 * 24 * 60 * 60 * 1000
            ).toISOString(),
            status: "not-started",
            user_id: user.id,
          },
        ])
        .select()
        .single();

      if (quizError) throw quizError;

      // Prepare questions for insertion
      const questionsToInsert = newQuiz.questions.map((question, index) => ({
        quiz_id: quizData.id,
        question_text: question.text, // Map from text to question_text for database
        options: question.options,
        correct_answer_id:
          question.options.find((opt) => opt.isCorrect)?.id || null,
        explanation: question.explanation,
        order: index,
      }));

      // Save all questions
      const { error: questionsError } = await supabase
        .from("quiz_questions")
        .insert(questionsToInsert);

      if (questionsError) throw questionsError;

      // Update local state with the new quiz (removed dueDate field)
      setQuizzes((prev) => [
        {
          id: quizData.id,
          title: quizData.title,
          course: quizData.course,
          questions: quizData.questions,
          completed: quizData.completed,
          due_date: quizData.due_date,
          status: quizData.status,
          user_id: quizData.user_id,
        },
        ...prev,
      ]);
    } catch (error) {
      console.error("Error saving quiz:", error);
      setError("Failed to create quiz");
    } finally {
      onClose();
    }
  };

  // Calculate pagination
  const totalPages = Math.ceil(quizzes.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentQuizzes = quizzes.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="lg" label="Loading flashcard decks..." />
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <div className="space-y-6 min-h-screen">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <FileText className="text-blue-500" size={20} />
            My Course Quizzes
          </h2>
        </div>
        <div className="flex flex-col md:flex-row gap-2">
          <Button
            color="secondary"
            startContent={<FileUp size={16} />}
            endContent={<Zap size={16} />}
            onPress={onOpen}
          >
            New Quiz
          </Button>
        </div>
      </div>

      {/* Quizzes Grid */}
      {quizzes.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-gray-500">No quizzes found</p>
          <Button className="mt-4" onPress={onOpen}>
            Create Your First Quiz
          </Button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentQuizzes.map((quiz) => (
              <Card
                key={quiz.id}
                className="border border-gray-200 hover:shadow-md transition-shadow"
              >
                <CardBody className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="font-bold text-lg">{quiz.title}</h3>
                    <Chip
                      size="sm"
                      variant="flat"
                      color={
                        quiz.status === "completed"
                          ? "success"
                          : quiz.status === "in-progress"
                            ? "warning"
                            : "default"
                      }
                    >
                      {quiz.status.replace("-", " ")}
                    </Chip>
                  </div>

                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-gray-500 text-sm">{quiz.course}</span>
                    <span className="text-gray-500 text-sm">•</span>
                    <span className="text-gray-500 text-sm">
                      {quiz.questions} questions
                    </span>
                  </div>

                  <div className="my-4">
                    <Progress
                      aria-label="Quiz progress"
                      value={
                        quiz.questions > 0
                          ? (quiz.completed / quiz.questions) * 100
                          : 0
                      }
                      classNames={{
                        indicator:
                          "bg-gradient-to-r from-blue-500 to-indigo-600",
                      }}
                    />
                    <div className="flex justify-between text-sm text-gray-500 mt-1">
                      <span>
                        {quiz.completed}/{quiz.questions} completed
                      </span>
                      <span className="font-medium">
                        {quiz.questions > 0
                          ? Math.round((quiz.completed / quiz.questions) * 100)
                          : 0}
                        %
                      </span>
                    </div>
                  </div>

                  <Divider className="my-4" />

                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Clock size={16} className="text-gray-400" />
                      <span className="text-sm text-gray-500">
                        Due: {new Date(quiz.due_date).toLocaleDateString()}
                      </span>
                    </div>
                    <Link to={`/dashboard/courses/quizzes/${quiz.id}`}>
                      <Button
                        size="sm"
                        variant="flat"
                        color="primary"
                        endContent={<ChevronRight size={16} />}
                      >
                        {quiz.status === "completed" ? "Review" : "Continue"}
                      </Button>
                    </Link>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>

          {/* Pagination - Only show if there are multiple pages */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-8">
              <Pagination
                total={totalPages}
                page={currentPage}
                onChange={handlePageChange}
              />
            </div>
          )}
        </>
      )}

      {/* PDF Quiz Generator Modal */}
      <PDFQuizGeneratorModal
        isOpen={isOpen}
        onClose={onClose}
        onQuizGenerated={handleQuizGenerated}
        availableCourses={availableCourses}
      />
    </div>
  );
};

export default CourseQuizzes;