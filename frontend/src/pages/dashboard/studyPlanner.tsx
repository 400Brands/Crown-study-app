import {
  Card,
  CardBody,
  Button,
  Chip,
  Divider,
  Input,
  Select,
  SelectItem,
  Tabs,
  Tab,
  Calendar,
  Progress,
  Popover,
  PopoverTrigger,
  PopoverContent,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from "@heroui/react";
import { DateValue } from "@internationalized/date";
import {
  CalendarDays,
  Clock,
  Plus,
  BookOpen,
  AlarmClock,
  Bell,
  ChevronRight,
  ChevronLeft,
  MoreVertical,
  CheckCircle2,
  Flame,
} from "lucide-react";
import DashboardLayout from "@/layouts/dashboardLayout";
import DefaultLayout from "@/layouts/default";
import { useState } from "react";
import { parseDate, getLocalTimeZone } from "@internationalized/date";

// Define type for study sessions
interface StudySession {
  id: number;
  title: string;
  course: string;
  date: Date;
  duration: number;
  priority: "high" | "medium" | "low";
  completed: boolean;
  type: "revision" | "reading" | "assignment" | "practice";
}

const StudyPlanner = () => {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [selectedDate, setSelectedDate] = useState<DateValue>(
    parseDate(new Date().toISOString().split("T")[0])
  );
  const [activeTab, setActiveTab] = useState<string>("weekly");

  // Sample study sessions data
  const studySessions: StudySession[] = [
    {
      id: 1,
      title: "Data Structures Review",
      course: "CSC 201",
      date: new Date(2024, 5, 15, 14, 0),
      duration: 90,
      priority: "high",
      completed: false,
      type: "revision",
    },
    {
      id: 2,
      title: "AI Chapter 3 Reading",
      course: "CSC 305",
      date: new Date(2024, 5, 16, 10, 30),
      duration: 60,
      priority: "medium",
      completed: true,
      type: "reading",
    },
    {
      id: 3,
      title: "Database Systems Assignment",
      course: "CSC 301",
      date: new Date(2024, 5, 17, 16, 0),
      duration: 120,
      priority: "high",
      completed: false,
      type: "assignment",
    },
    {
      id: 4,
      title: "Algorithms Practice",
      course: "CSC 201",
      date: new Date(2024, 5, 18, 9, 0),
      duration: 45,
      priority: "low",
      completed: false,
      type: "practice",
    },
  ];

  // Courses for dropdown
  const courses = ["CSC 101", "CSC 201", "CSC 301", "CSC 305"];

  // Calculate weekly progress
  const totalSessions = studySessions.length;
  const completedSessions = studySessions.filter((s) => s.completed).length;
  const progressPercentage = Math.round(
    (completedSessions / totalSessions) * 100
  );

  // Get sessions for selected date
  const getSessionsForDate = (date: DateValue): StudySession[] => {
    // Convert DateValue to JS Date for comparison
    const year = date.year;
    const month = date.month - 1; // JS Date months are 0-indexed
    const day = date.day;

    const jsDate = new Date(year, month, day);

    return studySessions.filter((session) => {
      const sessionDate = new Date(session.date);
      return (
        sessionDate.getFullYear() === jsDate.getFullYear() &&
        sessionDate.getMonth() === jsDate.getMonth() &&
        sessionDate.getDate() === jsDate.getDate()
      );
    });
  };

  // Get upcoming sessions
  const upcomingSessions = studySessions
    .filter((session) => !session.completed && session.date > new Date())
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .slice(0, 3);

  return (
    <DefaultLayout>
      <DashboardLayout>
        <div className="space-y-6">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <CalendarDays className="text-indigo-600" size={24} />
                Study Planner
              </h1>
              <p className="text-gray-500">
                Organize your study sessions and track progress
              </p>
            </div>
            <Button
              color="primary"
              variant="shadow"
              startContent={<Plus size={18} />}
              onPress={onOpen}
            >
              Add Session
            </Button>
          </div>

          {/* Progress Overview */}
          <Card className="bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-100">
            <CardBody className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 mb-1">
                    Weekly Progress
                  </h3>
                  <Progress
                    aria-label="Weekly progress"
                    value={progressPercentage}
                    classNames={{
                      base: "h-3",
                      indicator: "bg-gradient-to-r from-blue-500 to-indigo-600",
                    }}
                  />
                  <div className="flex justify-between mt-1">
                    <span className="text-sm text-gray-500">
                      {completedSessions} of {totalSessions} sessions
                    </span>
                    <span className="text-sm font-medium">
                      {progressPercentage}%
                    </span>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 mb-1">
                    Upcoming Focus
                  </h3>
                  <div className="flex items-center gap-2">
                    <Flame
                      className={`h-5 w-5 ${
                        studySessions.filter(
                          (s) => s.priority === "high" && !s.completed
                        ).length > 2
                          ? "text-red-500"
                          : "text-orange-400"
                      }`}
                    />
                    <span className="font-medium">
                      {
                        studySessions.filter(
                          (s) => s.priority === "high" && !s.completed
                        ).length
                      }{" "}
                      high priority
                    </span>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 mb-1">
                    Next Session
                  </h3>
                  {upcomingSessions.length > 0 ? (
                    <div className="flex items-center gap-2">
                      <Clock className="h-5 w-5 text-blue-500" />
                      <span className="font-medium">
                        {upcomingSessions[0].title} (
                        {upcomingSessions[0].course})
                      </span>
                    </div>
                  ) : (
                    <span className="text-gray-400">No upcoming sessions</span>
                  )}
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Main Content Area */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Calendar Section */}
            <div className="lg:col-span-1">
              <Card className="border border-gray-200">
                <CardBody className="p-4">
                  <Calendar
                    aria-label="Study planner calendar"
                    value={selectedDate}
                    onChange={setSelectedDate}
                    bottomContent={
                      <div className="mt-4">
                        <h3 className="font-semibold mb-2">Today's Sessions</h3>
                        {getSessionsForDate(selectedDate).length > 0 ? (
                          <div className="space-y-2">
                            {getSessionsForDate(selectedDate).map((session) => (
                              <div
                                key={session.id}
                                className={`p-2 rounded-lg border ${
                                  session.completed
                                    ? "border-green-200 bg-green-50"
                                    : "border-gray-200"
                                }`}
                              >
                                <div className="flex justify-between">
                                  <span className="font-medium">
                                    {session.title}
                                  </span>
                                  {session.completed && (
                                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                                  )}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {session.date.toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}{" "}
                                  • {session.duration} mins
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-gray-400 text-sm">
                            No study sessions scheduled
                          </p>
                        )}
                      </div>
                    }
                  />
                </CardBody>
              </Card>
            </div>

            {/* Sessions List */}
            <div className="lg:col-span-2">
              <Card className="border border-gray-200">
                <CardBody className="p-0">
                  <Tabs
                    aria-label="View options"
                    selectedKey={activeTab}
                    onSelectionChange={(key) => setActiveTab(key.toString())}
                    className="px-4 pt-4"
                  >
                    <Tab key="weekly" title="This Week" />
                    <Tab key="upcoming" title="Upcoming" />
                    <Tab key="completed" title="Completed" />
                  </Tabs>

                  <Divider />

                  <div className="p-4">
                    {activeTab === "weekly" && (
                      <div className="space-y-4">
                        {studySessions
                          .filter((session) => {
                            const today = new Date();
                            const nextWeek = new Date(
                              today.getTime() + 7 * 24 * 60 * 60 * 1000
                            );
                            return (
                              session.date >= today && session.date <= nextWeek
                            );
                          })
                          .sort((a, b) => a.date.getTime() - b.date.getTime())
                          .map((session) => (
                            <SessionCard key={session.id} session={session} />
                          ))}
                      </div>
                    )}
                    {activeTab === "upcoming" && (
                      <div className="space-y-4">
                        {studySessions
                          .filter(
                            (session) =>
                              !session.completed && session.date > new Date()
                          )
                          .sort((a, b) => a.date.getTime() - b.date.getTime())
                          .map((session) => (
                            <SessionCard key={session.id} session={session} />
                          ))}
                      </div>
                    )}
                    {activeTab === "completed" && (
                      <div className="space-y-4">
                        {studySessions
                          .filter((session) => session.completed)
                          .sort((a, b) => b.date.getTime() - a.date.getTime())
                          .map((session) => (
                            <SessionCard key={session.id} session={session} />
                          ))}
                      </div>
                    )}
                  </div>
                </CardBody>
              </Card>
            </div>
          </div>

          {/* Add Session Modal */}
          <Modal isOpen={isOpen} onOpenChange={onOpenChange} placement="center">
            <ModalContent>
              {(onClose) => (
                <>
                  <ModalHeader className="flex flex-col gap-1">
                    Add Study Session
                  </ModalHeader>
                  <ModalBody>
                    <Input
                      autoFocus
                      label="Session Title"
                      placeholder="e.g. Calculus Chapter 2 Review"
                      variant="bordered"
                    />
                    <Select
                      label="Course"
                      placeholder="Select course"
                      variant="bordered"
                    >
                      {courses.map((course) => (
                        <SelectItem key={course} >
                          {course}
                        </SelectItem>
                      ))}
                    </Select>
                    <div className="grid grid-cols-2 gap-4">
                      <Input type="date" label="Date" variant="bordered" />
                      <Input type="time" label="Time" variant="bordered" />
                    </div>
                    <Input
                      type="number"
                      label="Duration (minutes)"
                      placeholder="e.g. 90"
                      variant="bordered"
                    />
                    <Select
                      label="Priority"
                      variant="bordered"
                      defaultSelectedKeys={["medium"]}
                    >
                      <SelectItem
                        key="high"
                      
                        startContent={<Flame className="text-red-500" />}
                      >
                        High Priority
                      </SelectItem>
                      <SelectItem
                        key="medium"
                       
                        startContent={<Flame className="text-orange-400" />}
                      >
                        Medium Priority
                      </SelectItem>
                      <SelectItem
                        key="low"
                       
                        startContent={<Flame className="text-yellow-400" />}
                      >
                        Low Priority
                      </SelectItem>
                    </Select>
                    <Select
                      label="Session Type"
                      variant="bordered"
                      defaultSelectedKeys={["revision"]}
                    >
                      <SelectItem
                        key="reading"
                       
                        startContent={<BookOpen size={16} />}
                      >
                        Reading
                      </SelectItem>
                      <SelectItem
                        key="revision"
                        
                        startContent={<BookOpen size={16} />}
                      >
                        Revision
                      </SelectItem>
                      <SelectItem
                        key="assignment"
                       
                        startContent={<BookOpen size={16} />}
                      >
                        Assignment
                      </SelectItem>
                      <SelectItem
                        key="practice"
                        
                        startContent={<BookOpen size={16} />}
                      >
                        Practice
                      </SelectItem>
                    </Select>
                  </ModalBody>
                  <ModalFooter>
                    <Button color="danger" variant="flat" onPress={onClose}>
                      Cancel
                    </Button>
                    <Button color="primary" onPress={onClose}>
                      Add Session
                    </Button>
                  </ModalFooter>
                </>
              )}
            </ModalContent>
          </Modal>
        </div>
      </DashboardLayout>
    </DefaultLayout>
  );
};

// Session Card Component
interface SessionCardProps {
  session: StudySession;
}

const SessionCard = ({ session }: SessionCardProps) => {
  const [isHovered, setIsHovered] = useState<boolean>(false);

  return (
    <div
      className={`p-4 rounded-lg border transition-all ${
        session.completed
          ? "border-green-200 bg-green-50"
          : session.priority === "high"
            ? "border-red-200 bg-red-50"
            : session.priority === "medium"
              ? "border-orange-200 bg-orange-50"
              : "border-gray-200"
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-bold">{session.title}</h3>
            <Chip size="sm" variant="flat">
              {session.course}
            </Chip>
          </div>
          <div className="flex items-center gap-3 mt-2 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <CalendarDays className="h-4 w-4" />
              <span>{session.date.toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>
                {session.date.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}{" "}
                • {session.duration} mins
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {session.completed ? (
            <CheckCircle2 className="h-5 w-5 text-green-500" />
          ) : (
            <Button
              size="sm"
              variant={isHovered ? "solid" : "light"}
              color={
                session.priority === "high"
                  ? "danger"
                  : session.priority === "medium"
                    ? "warning"
                    : "default"
              }
            >
              {isHovered ? "Mark Complete" : <Flame className="h-4 w-4" />}
            </Button>
          )}
          <Popover placement="bottom-end">
            <PopoverTrigger>
              <Button isIconOnly size="sm" variant="light">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent>
              <div className="px-1 py-2">
                <Button variant="light" className="w-full justify-start">
                  Edit
                </Button>
                <Button variant="light" className="w-full justify-start">
                  Reschedule
                </Button>
                <Button
                  variant="light"
                  className="w-full justify-start text-red-500"
                >
                  Delete
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </div>
  );
};

export default StudyPlanner;
