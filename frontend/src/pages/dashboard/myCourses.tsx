import {
  Card,
  CardBody,
  Button,
  Chip,
  Divider,
  Avatar,
  Progress,
  Badge,
} from "@heroui/react";
import { BookOpen, Clock, Award, BarChart2, CheckCircle } from "lucide-react";
import DashboardLayout from "@/layouts/dashboardLayout";
import DefaultLayout from "@/layouts/default";

const MyCourses = () => {
  // Sample course data
  const courses = [
    {
      id: 1,
      title: "Introduction to Computer Science",
      code: "CSC 101",
      progress: 78,
      instructor: "Dr. Adebayo",
      nextSession: "Mon, 10:00 AM",
      assignmentsDue: 2,
      resources: 15,
      color: "bg-blue-500",
    },
    {
      id: 2,
      title: "Data Structures and Algorithms",
      code: "CSC 201",
      progress: 45,
      instructor: "Prof. Chukwu",
      nextSession: "Wed, 2:00 PM",
      assignmentsDue: 3,
      resources: 22,
      color: "bg-purple-500",
    },
    {
      id: 3,
      title: "Artificial Intelligence Fundamentals",
      code: "CSC 305",
      progress: 32,
      instructor: "Dr. Okafor",
      nextSession: "Fri, 11:30 AM",
      assignmentsDue: 1,
      resources: 18,
      color: "bg-emerald-500",
    },
  ];

  return (
    <DefaultLayout>
      <DashboardLayout>
        <div className="space-y-6">
          {/* Header Section */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">My Courses</h1>
              <p className="text-gray-500">
                Your current academic courses and progress
              </p>
            </div>
            <Button color="primary" variant="shadow">
              Add Course
            </Button>
          </div>

          {/* Courses Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <Card
                key={course.id}
                className="border border-gray-200 hover:shadow-md transition-shadow"
              >
                <CardBody className="p-6">
                  {/* Course Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div
                      className={`${course.color} w-12 h-12 rounded-lg flex items-center justify-center text-white`}
                    >
                      <BookOpen size={24} />
                    </div>
                    <div className="flex space-x-2">
                      <Badge content={course.assignmentsDue} color="danger">
                        <Button isIconOnly variant="light" radius="full">
                          <Clock className="text-gray-500" size={18} />
                        </Button>
                      </Badge>
                      <Button isIconOnly variant="light" radius="full">
                        <BarChart2 className="text-gray-500" size={18} />
                      </Button>
                    </div>
                  </div>

                  {/* Course Info */}
                  <div className="mb-4">
                    <h3 className="font-bold text-lg">{course.title}</h3>
                    <div className="flex justify-between items-center mt-1">
                      <span className="text-gray-500 text-sm">
                        {course.code}
                      </span>
                      <Chip size="sm" variant="flat" color="success">
                        Active
                      </Chip>
                    </div>
                    <p className="text-gray-600 text-sm mt-2">
                      Instructor: {course.instructor}
                    </p>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-500">Progress</span>
                      <span className="font-medium">{course.progress}%</span>
                    </div>
                    <Progress
                      aria-label="Course progress"
                      value={course.progress}
                      classNames={{
                        base: "h-2",
                        indicator:
                          course.color.replace("bg", "bg-gradient-to-r from") +
                          "-400 to" +
                          course.color.replace("bg", "-600"),
                      }}
                    />
                  </div>

                  <Divider className="my-4" />

                  {/* Course Footer */}
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <Clock size={16} className="text-gray-400" />
                      <span className="text-sm text-gray-500">
                        {course.nextSession}
                      </span>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        isIconOnly
                        variant="light"
                        size="sm"
                        radius="full"
                      >
                        <CheckCircle size={16} className="text-green-500" />
                      </Button>
                      <Button
                        size="sm"
                        radius="full"
                        variant="flat"
                        color="primary"
                      >
                        View
                      </Button>
                    </div>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>

          {/* Statistics Section */}
          <Card className="bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-100">
            <CardBody className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold">3</div>
                  <div className="text-gray-600 text-sm">Active Courses</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">6</div>
                  <div className="text-gray-600 text-sm">
                    Pending Assignments
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">78%</div>
                  <div className="text-gray-600 text-sm">Average Progress</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">55</div>
                  <div className="text-gray-600 text-sm">Study Resources</div>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Recent Activity */}
          <Card className="border border-gray-200">
            <CardBody className="p-6">
              <h3 className="font-bold text-lg mb-4">Recent Activity</h3>
              <div className="space-y-4">
                {[
                  {
                    course: "CSC 101",
                    action: "Completed Quiz 3",
                    time: "2 hours ago",
                    icon: <Award className="text-blue-500" />,
                  },
                  {
                    course: "CSC 201",
                    action: "Submitted Assignment 2",
                    time: "1 day ago",
                    icon: <CheckCircle className="text-green-500" />,
                  },
                  {
                    course: "CSC 305",
                    action: "Viewed Lecture 4",
                    time: "2 days ago",
                    icon: <BookOpen className="text-purple-500" />,
                  },
                ].map((activity, index) => (
                  <div key={index} className="flex items-start">
                    <div className="p-2 bg-blue-50 rounded-lg mr-4">
                      {activity.icon}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">{activity.action}</div>
                      <div className="text-sm text-gray-500">
                        {activity.course} • {activity.time}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>
        </div>
      </DashboardLayout>
    </DefaultLayout>
  );
};

export default MyCourses;
