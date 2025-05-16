import {
  Card,
  CardBody,
  Button,
  Chip,
  Divider,
  Progress,
  Tabs,
  Tab,
  Avatar,
  Badge,
  Tooltip,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from "@heroui/react";
import {
  Tag,
  Bolt,
  BarChart2,
  Trophy,
  Clock,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ChevronRight,
  ChevronLeft,
  Flame,
  Zap,
  Timer,
  Award,
  Users,
} from "lucide-react";
import DashboardLayout from "@/layouts/dashboardLayout";
import DefaultLayout from "@/layouts/default";
import { useState, useEffect } from "react";

const GameMode = () => {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [activeTab, setActiveTab] = useState("quick");
  const [timeLeft, setTimeLeft] = useState(30); // 30 seconds per question
  const [isPlaying, setIsPlaying] = useState(false);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [accuracy, setAccuracy] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(0);

  // Sample TII labeling questions
  const questions = [
    {
      id: 1,
      question: "What is the main object in this image?",
      image: "/images/sample-1.jpg",
      options: ["Book", "Notebook", "Textbook", "Journal"],
      correctAnswer: "Textbook",
      difficulty: "medium",
      domain: "Education",
    },
    {
      id: 2,
      question: "Identify the primary color scheme",
      image: "/images/sample-2.jpg",
      options: ["Monochromatic", "Analogous", "Complementary", "Triadic"],
      correctAnswer: "Complementary",
      difficulty: "hard",
      domain: "Design",
    },
    {
      id: 3,
      question: "What type of content is this?",
      image: "/images/sample-3.jpg",
      options: ["Academic", "Advertisement", "News", "Entertainment"],
      correctAnswer: "Academic",
      difficulty: "easy",
      domain: "Classification",
    },
  ];

  // Leaderboard data
  const leaderboard = [
    { rank: 1, name: "Alex Johnson", score: 2450, accuracy: 98, streak: 15 },
    { rank: 2, name: "Sarah Williams", score: 2310, accuracy: 96, streak: 12 },
    { rank: 3, name: "Mohammed Ali", score: 2180, accuracy: 94, streak: 9 },
    { rank: 4, name: "Emily Chen", score: 2050, accuracy: 92, streak: 8 },
    { rank: 5, name: "David Kim", score: 1920, accuracy: 90, streak: 7 },
  ];

  // Start the labeling session
  const startSession = () => {
    setIsPlaying(true);
    setCurrentQuestion(0);
    setScore(0);
    setStreak(0);
    setAccuracy(0);
    setTimeLeft(30);
  };

  // Handle answer selection
  const handleAnswer = (answer: string) => {
    const isCorrect = answer === questions[currentQuestion].correctAnswer;

    if (isCorrect) {
      setScore((prev) => prev + 100);
      setStreak((prev) => prev + 1);
    } else {
      setStreak(0);
    }

    // Calculate new accuracy
    const newAccuracy =
      ((score + (isCorrect ? 100 : 0)) / ((currentQuestion + 1) * 100)) * 100;
    setAccuracy(Math.round(newAccuracy));

    // Move to next question or end session
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion((prev) => prev + 1);
      setTimeLeft(30);
    } else {
      endSession();
    }
  };

  // End the session
  const endSession = () => {
    setIsPlaying(false);
  };

  // Timer effect
  useEffect(() => {
    if (!isPlaying) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleAnswer(""); // Timeout counts as wrong answer
          return 30;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isPlaying, currentQuestion]);

  return (
    <DefaultLayout>
      <DashboardLayout>
        <div className="space-y-6 py-2">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Tag className="text-indigo-600" size={24} />
                TII Labeling
              </h1>
              <p className="text-gray-500">
                Help improve AI by labeling educational content
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="flat"
                startContent={<HelpCircle size={16} />}
                onPress={onOpen}
              >
                Guidelines
              </Button>
              <Button
                color="primary"
                variant="shadow"
                startContent={<Bolt size={16} />}
                onPress={startSession}
                isDisabled={isPlaying}
              >
                Start Labeling
              </Button>
            </div>
          </div>

          {/* Main Content Area */}
          <Tabs
            aria-label="TII Labeling modes"
            selectedKey={activeTab}
            onSelectionChange={(key) => setActiveTab(key.toString())}
            className="justify-center"
          >
            <Tab
              key="quick"
              title={
                <div className="flex items-center gap-2">
                  <Zap size={16} />
                  Quick-Label Mode
                </div>
              }
            />
            <Tab
              key="analytics"
              title={
                <div className="flex items-center gap-2">
                  <BarChart2 size={16} />
                  Labeling Analytics
                </div>
              }
            />
          </Tabs>

          <Divider />

          {activeTab === "quick" ? (
            <div className="flex flex-col items-center">
              {isPlaying ? (
                <>
                  {/* Game Session UI */}
                  <Card className="w-full max-w-3xl border border-gray-200">
                    <CardBody className="p-6">
                      {/* Session Header */}
                      <div className="flex justify-between items-center mb-6">
                        <div className="flex items-center gap-4">
                          <Badge content={streak} color="danger" shape="circle">
                            <Flame className="h-6 w-6 text-orange-500" />
                          </Badge>
                          <div>
                            <div className="text-sm text-gray-500">Score</div>
                            <div className="font-bold text-xl">{score}</div>
                          </div>
                          <div>
                            <div className="text-sm text-gray-500">
                              Accuracy
                            </div>
                            <div className="font-bold text-xl">{accuracy}%</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 bg-blue-50 px-3 py-1 rounded-full">
                          <Timer className="h-5 w-5 text-blue-600" />
                          <span className="font-medium">{timeLeft}s</span>
                        </div>
                      </div>

                      {/* Question Area */}
                      <div className="mb-6">
                        <div className="flex items-center gap-2 mb-2">
                          <Chip size="sm" variant="flat" color="primary">
                            {questions[currentQuestion].domain}
                          </Chip>
                          <Chip
                            size="sm"
                            variant="flat"
                            color={
                              questions[currentQuestion].difficulty === "easy"
                                ? "success"
                                : questions[currentQuestion].difficulty ===
                                    "medium"
                                  ? "warning"
                                  : "danger"
                            }
                          >
                            {questions[currentQuestion].difficulty}
                          </Chip>
                        </div>
                        <h2 className="text-xl font-bold mb-4">
                          {questions[currentQuestion].question}
                        </h2>
                        <div className="bg-gray-100 rounded-lg overflow-hidden mb-4">
                          <img
                            src={questions[currentQuestion].image}
                            alt="Labeling sample"
                            className="w-full h-48 object-contain"
                          />
                        </div>
                      </div>

                      {/* Answer Options */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {questions[currentQuestion].options.map(
                          (option, index) => (
                            <Button
                              key={index}
                              variant="flat"
                              className="h-16 justify-start px-4 text-lg"
                              onPress={() => handleAnswer(option)}
                            >
                              {option}
                            </Button>
                          )
                        )}
                      </div>
                    </CardBody>
                  </Card>

                  <Button
                    color="danger"
                    variant="light"
                    className="mt-4"
                    onPress={endSession}
                  >
                    End Session
                  </Button>
                </>
              ) : (
                /* Start Screen */
                <Card className="w-full max-w-2xl border border-gray-200">
                  <CardBody className="p-6 text-center">
                    <div className="bg-indigo-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Tag className="h-10 w-10 text-indigo-600" />
                    </div>
                    <h2 className="text-2xl font-bold mb-2">
                      TII Quick-Label Mode
                    </h2>
                    <p className="text-gray-600 mb-6">
                      Label educational content quickly and accurately. Earn
                      points for each correct label and compete on the
                      leaderboard.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <div className="flex items-center justify-center gap-2 mb-2">
                          <Zap className="h-5 w-5 text-blue-600" />
                          <span className="font-semibold">Fast-Paced</span>
                        </div>
                        <p className="text-sm text-gray-600">
                          30 seconds per question
                        </p>
                      </div>
                      <div className="bg-purple-50 p-4 rounded-lg">
                        <div className="flex items-center justify-center gap-2 mb-2">
                          <Award className="h-5 w-5 text-purple-600" />
                          <span className="font-semibold">Earn Points</span>
                        </div>
                        <p className="text-sm text-gray-600">
                          100 points per correct answer
                        </p>
                      </div>
                      <div className="bg-green-50 p-4 rounded-lg">
                        <div className="flex items-center justify-center gap-2 mb-2">
                          <Flame className="h-5 w-5 text-green-600" />
                          <span className="font-semibold">Streaks</span>
                        </div>
                        <p className="text-sm text-gray-600">
                          Bonus for consecutive correct answers
                        </p>
                      </div>
                    </div>
                    <Button
                      color="primary"
                      size="lg"
                      startContent={<Bolt size={20} />}
                      onPress={startSession}
                    >
                      Start Labeling
                    </Button>
                  </CardBody>
                </Card>
              )}
            </div>
          ) : (
            /* Analytics Tab */
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Stats Overview */}
              <div className="lg:col-span-1 space-y-6">
                <Card className="border border-gray-200">
                  <CardBody className="p-6">
                    <h3 className="font-semibold mb-4">Your Labeling Stats</h3>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-gray-600">Total Points</span>
                          <span className="font-bold">1,850</span>
                        </div>
                        <Progress
                          value={65}
                          classNames={{
                            indicator:
                              "bg-gradient-to-r from-blue-500 to-indigo-600",
                          }}
                        />
                      </div>
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-gray-600">Accuracy</span>
                          <span className="font-bold">92%</span>
                        </div>
                        <Progress value={92} color="success" />
                      </div>
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-gray-600">Current Streak</span>
                          <span className="font-bold">8 days</span>
                        </div>
                        <Progress value={80} color="warning" />
                      </div>
                    </div>
                  </CardBody>
                </Card>

                <Card className="border border-gray-200">
                  <CardBody className="p-6">
                    <h3 className="font-semibold mb-4">Recent Activity</h3>
                    <div className="space-y-3">
                      {[
                        {
                          label: "50 Textbook labels",
                          correct: true,
                          time: "2 min ago",
                        },
                        {
                          label: "10 Diagram tags",
                          correct: false,
                          time: "15 min ago",
                        },
                        {
                          label: "30 Lecture notes",
                          correct: true,
                          time: "1 hour ago",
                        },
                      ].map((activity, index) => (
                        <div key={index} className="flex items-center gap-3">
                          {activity.correct ? (
                            <CheckCircle2 className="h-5 w-5 text-green-500" />
                          ) : (
                            <XCircle className="h-5 w-5 text-red-500" />
                          )}
                          <div>
                            <div className="font-medium">{activity.label}</div>
                            <div className="text-sm text-gray-500">
                              {activity.time}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardBody>
                </Card>
              </div>

              {/* Leaderboard */}
              <div className="lg:col-span-2">
                <Card className="border border-gray-200">
                  <CardBody className="p-6">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="font-semibold text-lg">
                        Labeling Leaderboard
                      </h3>
                      <Chip color="primary" variant="flat">
                        This Week
                      </Chip>
                    </div>
                    <div className="space-y-3">
                      {leaderboard.map((user) => (
                        <div
                          key={user.rank}
                          className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-lg"
                        >
                          <div
                            className={`flex items-center justify-center w-8 h-8 rounded-full ${
                              user.rank === 1
                                ? "bg-yellow-100 text-yellow-800"
                                : user.rank === 2
                                  ? "bg-gray-200 text-gray-800"
                                  : user.rank === 3
                                    ? "bg-amber-100 text-amber-800"
                                    : "bg-gray-100"
                            }`}
                          >
                            {user.rank}
                          </div>
                          <Avatar name={user.name} className="flex-shrink-0" />
                          <div className="flex-1">
                            <div className="font-medium">{user.name}</div>
                            <div className="text-sm text-gray-500">
                              Accuracy: {user.accuracy}% • Streak: {user.streak}
                            </div>
                          </div>
                          <div className="font-bold">
                            {user.score.toLocaleString()}
                          </div>
                          {user.rank <= 3 && (
                            <Trophy
                              className={`h-5 w-5 ${
                                user.rank === 1
                                  ? "text-yellow-500"
                                  : user.rank === 2
                                    ? "text-gray-500"
                                    : "text-amber-500"
                              }`}
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  </CardBody>
                </Card>
              </div>
            </div>
          )}
        </div>

        {/* Guidelines Modal */}
        <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="2xl">
          <ModalContent>
            {(onClose) => (
              <>
                <ModalHeader className="flex flex-col gap-1">
                  TII Labeling Guidelines
                </ModalHeader>
                <ModalBody>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2">
                        What is TII Labeling?
                      </h4>
                      <p className="text-gray-600">
                        TII (Tagging for Intelligent Indexing) helps improve
                        educational AI systems by having humans label content.
                        Your labels train algorithms to better understand
                        academic materials.
                      </p>
                    </div>
                    <Divider />
                    <div>
                      <h4 className="font-semibold mb-2">
                        Labeling Best Practices
                      </h4>
                      <ul className="list-disc pl-5 space-y-2 text-gray-600">
                        <li>Choose the most specific label that applies</li>
                        <li>
                          When unsure, select the best option and flag for
                          review
                        </li>
                        <li>Maintain consistency with similar items</li>
                        <li>Focus on accuracy rather than speed</li>
                      </ul>
                    </div>
                    <Divider />
                    <div>
                      <h4 className="font-semibold mb-2">Scoring System</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-blue-50 p-3 rounded-lg">
                          <div className="font-medium">Correct Label</div>
                          <div className="text-2xl font-bold text-blue-600">
                            +100 pts
                          </div>
                        </div>
                        <div className="bg-purple-50 p-3 rounded-lg">
                          <div className="font-medium">5-Day Streak</div>
                          <div className="text-2xl font-bold text-purple-600">
                            +500 pts
                          </div>
                        </div>
                        <div className="bg-green-50 p-3 rounded-lg">
                          <div className="font-medium">95%+ Accuracy</div>
                          <div className="text-2xl font-bold text-green-600">
                            +1000 pts
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </ModalBody>
                <ModalFooter>
                  <Button color="primary" onPress={onClose}>
                    I Understand
                  </Button>
                </ModalFooter>
              </>
            )}
          </ModalContent>
        </Modal>
      </DashboardLayout>
    </DefaultLayout>
  );
};

export default GameMode;
