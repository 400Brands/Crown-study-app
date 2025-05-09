import { Link } from "@heroui/link";
import { button as buttonStyles } from "@heroui/theme";
import { siteConfig } from "@/config/site";
import { title, subtitle } from "@/components/primitives";
import DefaultLayout from "@/layouts/default";
import { Card, CardBody, CardFooter, CardHeader, Image, Tab, Tabs } from "@heroui/react";
import { CheckIcon } from "lucide-react";

export default function IndexPage() {
  return (
    <DefaultLayout>
      {/* Hero Section */}
      <main className="flex flex-col w-full space-y-8">
        <section className="flex flex-col md:flex-row w-full min-h-[80vh] items-center justify-between gap-8 py-6">
          <div className="w-full md:w-1/2 flex items-center justify-center">
            <Image
              src={"https://distinction.app/images/hero-image.png"}
              width={600}
              alt="CrownStudy App Screenshot"
              className="w-full h-auto object-cover rounded-lg"
            />
          </div>

          <div className="w-full md:w-1/2 flex flex-col items-start justify-center gap-4">
            <div>
              <span className={title()}>Introducing</span>
              <br />
              <span className={title({ size: "lg", color: "blue" })}>
                <b>CrownStudy!</b>
              </span>
              <div className={subtitle({ class: "mt-4" })}>
                <p className="text-md">
                  Ready to take your academic journey to the next level? Look no
                  further! Tailored for students determined to reach their full
                  potential and excel in university exams, CrownStudy App is
                  your ultimate companion for academic success.
                </p>
              </div>
            </div>

            <div className="mt-6 flex gap-4">
              <Link
                isExternal
                className={buttonStyles({
                  color: "primary",
                  radius: "md",
                  variant: "shadow",
                  size: "lg",
                })}
                href={siteConfig.links.docs}
              >
                Get Started
              </Link>
              <Image
                src="https://distinction.app/try-for-free.svg"
                width={100}
                alt="Screenshot"
                className="w-full h-auto object-cover rounded-lg mt-5"
              />
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="w-full bg-blue-900 py-8 text-white border-1 border-gray-900 rounded-md">
          <div className="container mx-auto max-w-7xl px-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
              <div className="flex flex-col items-center">
                <span className="text-5xl font-bold mb-2">10k+</span>
                <span className="text-lg opacity-80">Students Empowered</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-5xl font-bold mb-2">25k+</span>
                <span className="text-lg opacity-80">Past Questions</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-5xl font-bold mb-2">98%</span>
                <span className="text-lg opacity-80">Improved Performance</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-5xl font-bold mb-2">20+</span>
                <span className="text-lg opacity-80">University Onboarded</span>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="w-full py-20">
          <div className="container mx-auto max-w-7xl px-6">
            <div className="text-center mb-16">
              <h2 className={title({ size: "md" })}>
                <b>
                    Powerful Features
                </b>
              
              </h2>
              <p className={subtitle({ class: "mt-4 mx-auto max-w-2xl" })}>
                CrownStudy combines cutting-edge AI technology with
                collaborative learning to create the ultimate academic
                companion.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <Card className="border border-neutral-200 dark:border-neutral-800">
                <CardHeader className="flex gap-3">
                  <div className="p-2 rounded-full bg-primary-100 text-primary">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                      <circle cx="9" cy="7" r="4"></circle>
                      <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                      <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                    </svg>
                  </div>
                  <div className="flex flex-col">
                    <h3 className="text-lg font-medium">
                      Personalized Learning
                    </h3>
                  </div>
                </CardHeader>
                <CardBody>
                  <p>
                    Create your academic profile with course details, interests,
                    and learning preferences for a tailored study experience
                    that adapts to your needs.
                  </p>
                </CardBody>
              </Card>

              {/* Feature 2 */}
              <Card className="border border-neutral-200 dark:border-neutral-800">
                <CardHeader className="flex gap-3">
                  <div className="p-2 rounded-full bg-primary-100 text-primary">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                      <polyline points="14 2 14 8 20 8"></polyline>
                      <line x1="16" y1="13" x2="8" y2="13"></line>
                      <line x1="16" y1="17" x2="8" y2="17"></line>
                      <polyline points="10 9 9 9 8 9"></polyline>
                    </svg>
                  </div>
                  <div className="flex flex-col">
                    <h3 className="text-lg font-medium">
                      Crowdsourced Past Questions
                    </h3>
                  </div>
                </CardHeader>
                <CardBody>
                  <p>
                    Access and contribute to our extensive library of past
                    questions across various courses and institutions, building
                    a collaborative knowledge base.
                  </p>
                </CardBody>
              </Card>

              {/* Feature 3 */}
              <Card className="border border-neutral-200 dark:border-neutral-800">
                <CardHeader className="flex gap-3">
                  <div className="p-2 rounded-full bg-primary-100 text-primary">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <circle cx="12" cy="12" r="10"></circle>
                      <polyline points="12 6 12 12 16 14"></polyline>
                    </svg>
                  </div>
                  <div className="flex flex-col">
                    <h3 className="text-lg font-medium">
                      AI-powered Study Planner
                    </h3>
                  </div>
                </CardHeader>
                <CardBody>
                  <p>
                    Get customized study schedules based on your courses, exam
                    dates, strengths, and weaknesses, with timely push
                    notifications to keep you on track.
                  </p>
                </CardBody>
              </Card>

              {/* Feature 4 */}
              <Card className="border border-neutral-200 dark:border-neutral-800">
                <CardHeader className="flex gap-3">
                  <div className="p-2 rounded-full bg-primary-100 text-primary">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                    </svg>
                  </div>
                  <div className="flex flex-col">
                    <h3 className="text-lg font-medium">Community Q&A</h3>
                  </div>
                </CardHeader>
                <CardBody>
                  <p>
                    Connect with peers in your department and institution for
                    collaborative learning, with a point-based system that
                    rewards helpful contributions.
                  </p>
                </CardBody>
              </Card>

              {/* Feature 5 */}
              <Card className="border border-neutral-200 dark:border-neutral-800">
                <CardHeader className="flex gap-3">
                  <div className="p-2 rounded-full bg-primary-100 text-primary">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                    </svg>
                  </div>
                  <div className="flex flex-col">
                    <h3 className="text-lg font-medium">
                      AI-generated Flashcards
                    </h3>
                  </div>
                </CardHeader>
                <CardBody>
                  <p>
                    Automatically extract key points and generate flashcards
                    from your study materials for quick revision and better
                    retention.
                  </p>
                </CardBody>
              </Card>

              {/* Feature 6 */}
              <Card className="border border-neutral-200 dark:border-neutral-800">
                <CardHeader className="flex gap-3">
                  <div className="p-2 rounded-full bg-primary-100 text-primary">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M3 18v-6a9 9 0 0 1 18 0v6"></path>
                      <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"></path>
                    </svg>
                  </div>
                  <div className="flex flex-col">
                    <h3 className="text-lg font-medium">Audio Lectures</h3>
                  </div>
                </CardHeader>
                <CardBody>
                  <p>
                    Convert your study materials into audio lectures with
                    synchronized text highlighting for an enhanced learning
                    experience.
                  </p>
                </CardBody>
              </Card>
            </div>

            <div className="mt-12 text-center">
              <Link
                className={buttonStyles({
                  color: "primary",
                  radius: "md",
                  variant: "flat",
                  size: "lg",
                })}
                href="#all-features"
              >
                View All Features
              </Link>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="w-full bg-neutral-50 dark:bg-neutral-900 py-20">
          <div className="container mx-auto max-w-7xl px-6">
            <div className="text-center mb-16">
              <h2 className={title({ size: "md" })}>How CrownStudy Works</h2>
              <p className={subtitle({ class: "mt-4 mx-auto max-w-2xl" })}>
                A simple but powerful approach to transform your academic
                performance
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-400 text-2xl font-bold mb-6">
                  1
                </div>
                <h3 className="text-xl font-semibold mb-3">
                  Create Your Profile
                </h3>
                <p className="text-neutral-600 dark:text-neutral-400">
                  Sign up and set up your academic profile with your
                  institution, department, courses, and interests.
                </p>
              </div>

              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-400 text-2xl font-bold mb-6">
                  2
                </div>
                <h3 className="text-xl font-semibold mb-3">
                  Upload Study Materials
                </h3>
                <p className="text-neutral-600 dark:text-neutral-400">
                  Contribute past questions, personal notes, and study materials
                  to build your knowledge base.
                </p>
              </div>

              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-400 text-2xl font-bold mb-6">
                  3
                </div>
                <h3 className="text-xl font-semibold mb-3">Learn & Earn</h3>
                <p className="text-neutral-600 dark:text-neutral-400">
                  Study with AI-generated quizzes, earn points for
                  participation, and climb the leaderboard while improving your
                  grades.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* All Features Section */}
        <section id="all-features" className="w-full py-20">
          <div className="container mx-auto max-w-7xl px-6">
            <div className="text-center mb-16">
              <h2 className={title({ size: "md" })}>
                Comprehensive Feature Set
              </h2>
              <p className={subtitle({ class: "mt-4 mx-auto max-w-2xl" })}>
                Everything you need to excel in your academic journey
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-start gap-4">
                <div className="p-2 rounded-full bg-green-100 text-green-600">
                  <CheckIcon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-medium mb-2">
                    Personalized User Profiles
                  </h3>
                  <p className="text-neutral-600 dark:text-neutral-400">
                    Create detailed academic profiles with your institution,
                    department, level, and interests to receive tailored
                    content.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-2 rounded-full bg-green-100 text-green-600">
                  <CheckIcon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-medium mb-2">
                    Crowd-sourced Past Questions
                  </h3>
                  <p className="text-neutral-600 dark:text-neutral-400">
                    Access and contribute to a growing repository of past
                    questions in various formats (PDF, image, text).
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-2 rounded-full bg-green-100 text-green-600">
                  <CheckIcon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-medium mb-2">
                    Adaptive Course Quizzes
                  </h3>
                  <p className="text-neutral-600 dark:text-neutral-400">
                    Practice with AI-generated quizzes based on your study
                    materials with integrated VQA challenges for reinforced
                    learning.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-2 rounded-full bg-green-100 text-green-600">
                  <CheckIcon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-medium mb-2">
                    PDF-driven Audio Lectures
                  </h3>
                  <p className="text-neutral-600 dark:text-neutral-400">
                    Convert study materials into audio lectures with optional
                    synchronized text highlighting for auditory learners.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-2 rounded-full bg-green-100 text-green-600">
                  <CheckIcon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-medium mb-2">
                    AI-generated Study Aids
                  </h3>
                  <p className="text-neutral-600 dark:text-neutral-400">
                    Automatically generate flashcards and key points from your
                    study materials for quick revision.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-2 rounded-full bg-green-100 text-green-600">
                  <CheckIcon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-medium mb-2">
                    Personal Notes Feed
                  </h3>
                  <p className="text-neutral-600 dark:text-neutral-400">
                    Create and share notes with options for public or private
                    visibility, earning points for engagement.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-2 rounded-full bg-green-100 text-green-600">
                  <CheckIcon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-medium mb-2">Q&A Community</h3>
                  <p className="text-neutral-600 dark:text-neutral-400">
                    Collaborate with peers through department-specific group
                    chats with peer verification for accurate information.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-2 rounded-full bg-green-100 text-green-600">
                  <CheckIcon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-medium mb-2">
                    Lecturer Escalation
                  </h3>
                  <p className="text-neutral-600 dark:text-neutral-400">
                    Request additional clarification from lecturers through
                    automated email or WhatsApp reminders when concepts remain
                    unclear.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-2 rounded-full bg-green-100 text-green-600">
                  <CheckIcon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-medium mb-2">
                    AI-powered Study Planner
                  </h3>
                  <p className="text-neutral-600 dark:text-neutral-400">
                    Get personalized study schedules with push notifications
                    based on your course load and exam dates.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-2 rounded-full bg-green-100 text-green-600">
                  <CheckIcon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-medium mb-2">
                    Department/Year Leaderboards
                  </h3>
                  <p className="text-neutral-600 dark:text-neutral-400">
                    Track your progress and compare with peers on departmental
                    leaderboards with privacy options.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-2 rounded-full bg-green-100 text-green-600">
                  <CheckIcon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-medium mb-2">Quick-Label Mode</h3>
                  <p className="text-neutral-600 dark:text-neutral-400">
                    Earn additional points by participating in TII VQA labeling
                    sessions separate from your academic content.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-2 rounded-full bg-green-100 text-green-600">
                  <CheckIcon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-medium mb-2">
                    Cross-Institution Chatrooms
                  </h3>
                  <p className="text-neutral-600 dark:text-neutral-400">
                    Connect with students from the same department across
                    different institutions for broader knowledge sharing.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="w-full bg-neutral-50 dark:bg-neutral-900 py-20">
          <div className="container mx-auto max-w-7xl px-6">
            <div className="text-center mb-16">
              <h2 className={title({ size: "md" })}>What Students Say</h2>
              <p className={subtitle({ class: "mt-4 mx-auto max-w-2xl" })}>
                Hear from students who have transformed their academic
                performance with CrownStudy
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="border border-neutral-200 dark:border-neutral-800">
                <CardBody>
                  <p className="italic mb-6">
                    "CrownStudy completely changed my approach to studying. The
                    AI-generated quizzes and flashcards helped me retain
                    information better, and I improved my GPA from 3.2 to 3.8 in
                    just one semester!"
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
                      O
                    </div>
                    <div>
                      <p className="font-medium">Oluwaseun A.</p>
                      <p className="text-sm text-neutral-500">
                        Computer Science, UniLag
                      </p>
                    </div>
                  </div>
                </CardBody>
              </Card>

              <Card className="border border-neutral-200 dark:border-neutral-800">
                <CardBody>
                  <p className="italic mb-6">
                    "The community aspect is incredible! Getting help from
                    senior students in my department made complex engineering
                    concepts so much clearer. The leaderboard also motivated me
                    to study consistently."
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white font-bold">
                      C
                    </div>
                    <div>
                      <p className="font-medium">Chioma N.</p>
                      <p className="text-sm text-neutral-500">
                        Mechanical Engineering, ABU
                      </p>
                    </div>
                  </div>
                </CardBody>
              </Card>

              <Card className="border border-neutral-200 dark:border-neutral-800">
                <CardBody>
                  <p className="italic mb-6">
                    "As a medical student with a packed schedule, the AI study
                    planner has been a game-changer. It optimizes my study time,
                    and the audio lectures let me learn while commuting. Truly
                    essential!"
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-purple-500 flex items-center justify-center text-white font-bold">
                      I
                    </div>
                    <div>
                      <p className="font-medium">Ibrahim M.</p>
                      <p className="text-sm text-neutral-500">Medicine, UI</p>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="w-full bg-gradient-to-r from-blue-600 to-purple-600 py-20 text-white">
          <div className="container mx-auto max-w-7xl px-6 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to Transform Your Academic Journey?
            </h2>
            <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
              Join thousands of students achieving academic excellence with
              CrownStudy today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                className={buttonStyles({
                  color: "primary",
                  radius: "md",
                  variant: "shadow",
                  size: "lg",
                })}
                href={siteConfig.links.docs}
              >
                Sign Up Now - It's Free!
              </Link>
              <Link
                className={buttonStyles({
                  color: "primary",
                  radius: "md",
                  variant: "bordered",
                  size: "lg",
                })}
                href="#demo"
              >
                Request a Demo
              </Link>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section id="faq" className="w-full py-20">
          <div className="container mx-auto max-w-7xl px-6">
            <div className="text-center mb-16">
              <h2 className={title({ size: "md" })}>
                Frequently Asked Questions
              </h2>
              <p className={subtitle({ class: "mt-4 mx-auto max-w-2xl" })}>
                Everything you need to know about CrownStudy
              </p>
            </div>

            <div className="max-w-3xl mx-auto divide-y divide-neutral-200 dark:divide-neutral-800">
              <div className="py-6">
                <details className="group">
                  <summary className="flex justify-between items-center font-medium cursor-pointer list-none">
                    <span className="text-lg">Is CrownStudy free to use?</span>
                    <span className="transition group-open:rotate-180">
                      <svg
                        fill="none"
                        height="24"
                        width="24"
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                      >
                        <polyline points="6 9 12 15 18 9"></polyline>
                      </svg>
                    </span>
                  </summary>
                  <p className="text-neutral-600 dark:text-neutral-400 mt-3 group-open:animate-fadeIn">
                    Yes, CrownStudy offers a free basic plan for all students.
                    Premium features that provide additional study tools and
                    resources are available through our affordable subscription
                    plans.
                  </p>
                </details>
              </div>

              <div className="py-6">
                <details className="group">
                  <summary className="flex justify-between items-center font-medium cursor-pointer list-none">
                    <span className="text-lg">
                      How does the points system work?
                    </span>
                    <span className="transition group-open:rotate-180">
                      <svg
                        fill="none"
                        height="24"
                        width="24"
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                      >
                        <polyline points="6 9 12 15 18 9"></polyline>
                      </svg>
                    </span>
                  </summary>
                  <p className="text-neutral-600 dark:text-neutral-400 mt-3 group-open:animate-fadeIn">
                    You earn points by uploading study materials, answering
                    questions from other students, participating in TII VQA
                    labeling, and regular engagement with the platform. These
                    points can be redeemed for rewards or used to unlock premium
                    features.
                  </p>
                </details>
              </div>

              <div className="py-6">
                <details className="group">
                  <summary className="flex justify-between items-center font-medium cursor-pointer list-none">
                    <span className="text-lg">
                      Which institutions are supported?
                    </span>
                    <span className="transition group-open:rotate-180">
                      <svg
                        fill="none"
                        height="24"
                        width="24"
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                      >
                        <polyline points="6 9 12 15 18 9"></polyline>
                      </svg>
                    </span>
                  </summary>
                  <p className="text-neutral-600 dark:text-neutral-400 mt-3 group-open:animate-fadeIn">
                    CrownStudy currently supports all major universities and
                    polytechnics across Nigeria, with plans to expand to more
                    institutions across Africa. If your institution isn't
                    listed, you can request to add it during signup.
                  </p>
                </details>
              </div>

              <div className="py-6">
                <details className="group">
                  <summary className="flex justify-between items-center font-medium cursor-pointer list-none">
                    <span className="text-lg">
                      How does the VQA system work?
                    </span>
                    <span className="transition group-open:rotate-180">
                      <svg
                        fill="none"
                        height="24"
                        width="24"
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                      >
                        <polyline points="6 9 12 15 18 9"></polyline>
                      </svg>
                    </span>
                  </summary>
                  <p className="text-neutral-600 dark:text-neutral-400 mt-3 group-open:animate-fadeIn">
                    When you take quizzes on CrownStudy, we incorporate Visual
                    Question Answering (VQA) questions related to your academic
                    interests. This helps both reinforce your learning and
                    contribute to AI research. You earn points for each VQA
                    question you answer.
                  </p>
                </details>
              </div>

              <div className="py-6">
                <details className="group">
                  <summary className="flex justify-between items-center font-medium cursor-pointer list-none">
                    <span className="text-lg">
                      Can I access my materials offline?
                    </span>
                    <span className="transition group-open:rotate-180">
                      <svg
                        fill="none"
                        height="24"
                        width="24"
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                      >
                        <polyline points="6 9 12 15 18 9"></polyline>
                      </svg>
                    </span>
                  </summary>
                  <p className="text-neutral-600 dark:text-neutral-400 mt-3 group-open:animate-fadeIn">
                    Yes, CrownStudy allows you to download your study materials,
                    flashcards, and notes for offline use. Audio lectures can
                    also be downloaded for listening on the go.
                  </p>
                </details>
              </div>

              <div className="py-6">
                <details className="group">
                  <summary className="flex justify-between items-center font-medium cursor-pointer list-none">
                    <span className="text-lg">Is my data secure?</span>
                    <span className="transition group-open:rotate-180">
                      <svg
                        fill="none"
                        height="24"
                        width="24"
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                      >
                        <polyline points="6 9 12 15 18 9"></polyline>
                      </svg>
                    </span>
                  </summary>
                  <p className="text-neutral-600 dark:text-neutral-400 mt-3 group-open:animate-fadeIn">
                    Absolutely! We take data security seriously. All your
                    personal information and uploaded materials are encrypted
                    and securely stored. We never share your data with third
                    parties without your explicit consent.
                  </p>
                </details>
              </div>
            </div>

            <div className="text-center mt-12">
              <Link
                className={buttonStyles({
                  color: "primary",
                  radius: "md",
                  variant: "flat",
                  size: "md",
                })}
                href="#more-faq"
              >
                View More FAQs
              </Link>
            </div>
          </div>
        </section>

        {/* Pre-Footer CTA */}
        <section className="w-full py-20">
          <div className="container mx-auto max-w-7xl px-6">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 md:p-12 shadow-xl">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div className="text-white">
                  <h2 className="text-3xl font-bold mb-4">
                    Download CrownStudy Today
                  </h2>
                  <p className="text-xl opacity-90 mb-8">
                    Take your academic success into your own hands with the most
                    comprehensive study companion.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Link
                      className={buttonStyles({
                        color: "primary",
                        radius: "md",
                        variant: "shadow",
                        size: "lg",
                      })}
                      href="#app-store"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        fill="currentColor"
                        className="mr-2"
                        viewBox="0 0 16 16"
                      >
                        <path d="M11.182.008C11.148-.03 9.923.023 8.857 1.18c-1.066 1.156-.902 2.482-.878 2.516.024.034 1.52.087 2.475-1.258.955-1.345.762-2.391.728-2.43zm3.314 11.733c-.048-.096-2.325-1.234-2.113-3.422.212-2.189 1.675-2.789 1.698-2.854.023-.065-.597-.79-1.254-1.157a3.692 3.692 0 0 0-1.563-.434c-.108-.003-.483-.095-1.254.116-.508.139-1.653.589-1.968.607-.316.018-1.256-.522-2.267-.665-.647-.125-1.333.131-1.824.328-.49.196-1.422.754-2.074 2.237-.652 1.482-.311 3.83-.067 4.56.244.729.625 1.924 1.273 2.796.576.984 1.34 1.667 1.659 1.899.319.232 1.219.386 1.843.067.502-.308 1.408-.485 1.766-.472.357.013 1.061.154 1.782.539.571.197 1.111.115 1.652-.105.541-.221 1.324-1.059 2.238-2.758.347-.79.505-1.217.473-1.282z" />
                        <path d="M11.182.008C11.148-.03 9.923.023 8.857 1.18c-1.066 1.156-.902 2.482-.878 2.516.024.034 1.52.087 2.475-1.258.955-1.345.762-2.391.728-2.43zm3.314 11.733c-.048-.096-2.325-1.234-2.113-3.422.212-2.189 1.675-2.789 1.698-2.854.023-.065-.597-.79-1.254-1.157a3.692 3.692 0 0 0-1.563-.434c-.108-.003-.483-.095-1.254.116-.508.139-1.653.589-1.968.607-.316.018-1.256-.522-2.267-.665-.647-.125-1.333.131-1.824.328-.49.196-1.422.754-2.074 2.237-.652 1.482-.311 3.83-.067 4.56.244.729.625 1.924 1.273 2.796.576.984 1.34 1.667 1.659 1.899.319.232 1.219.386 1.843.067.502-.308 1.408-.485 1.766-.472.357.013 1.061.154 1.782.539.571.197 1.111.115 1.652-.105.541-.221 1.324-1.059 2.238-2.758.347-.79.505-1.217.473-1.282z" />
                      </svg>
                      App Store
                    </Link>
                    <Link
                      className={buttonStyles({
                        color: "primary",
                        radius: "md",
                        variant: "bordered",
                        size: "lg",
                      })}
                      href="#google-play"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        fill="currentColor"
                        className="mr-2"
                        viewBox="0 0 16 16"
                      >
                        <path d="M14.222 9.374c1.037-.61 1.037-2.137 0-2.748L11.528 5.04 8.32 8l3.207 2.96 2.694-1.586Zm-3.595 2.116L7.583 8.68 1.03 14.73c.201 1.029 1.36 1.61 2.303 1.055l7.294-4.295ZM1 13.396V2.603L6.846 8 1 13.396ZM1.03 1.27l6.553 6.05 3.044-2.81L3.333.215C2.39-.341 1.231.24 1.03 1.27Z" />
                      </svg>
                      Google Play
                    </Link>
                  </div>
                </div>
                <div className="hidden md:flex justify-end">
                  <Image
                    alt="CrownStudy Mobile App"
                    className="h-auto max-h-80 rounded-xl"
                    src="https://distinction.app/images/hero-image.png"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </DefaultLayout>
  );
}
