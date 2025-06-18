// @ts-nocheck
// components/courses/Overview.tsx
import { useState, useEffect, useCallback, useRef } from "react";
import { OverviewProps, StudyMaterial, StudyMaterialSectionProps } from "@/types";
import {
  Card,
  CardBody,
  Button,
  Chip,
  Divider,
  Progress,
  Badge,
} from "@heroui/react";
import {
  BookOpen,
  Clock,
  ChevronRight,
  FileText,
  Bookmark,
  FileSpreadsheet,
  RefreshCw,
} from "lucide-react";
import { supabase } from "@/supabaseClient";

// Backend data types
interface QuizData {
  id: string;
  title: string;
  course: string;
  questions: number;
  completed: number;
  status: "not-started" | "in-progress" | "completed";
  created_at: string;
}

interface FlashcardDeckData {
  id: string;
  title: string;
  course: string;
  cards_count: number;
  mastered_count: number;
  last_reviewed: string | null;
  created_at: string;
}

interface PastQuestionData {
  id: string;
  title: string;
  course: string;
  year: string;
  pages: number;
  downloads: number;
  uploaded_at: string;
}

// Cache configuration
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const STALE_WHILE_REVALIDATE_DURATION = 10 * 60 * 1000; // 10 minutes

interface CacheEntry {
  data: StudyMaterial[];
  timestamp: number;
  userId: string;
}

// In-memory cache
let studyMaterialsCache: CacheEntry | null = null;

const StudyMaterialSection = ({
  title,
  icon,
  materials,
  courseKey,
  onViewAll,
  progressKey,
  totalKey,
  showLastReviewed,
  showYear,
  showDownloads,
}: StudyMaterialSectionProps) => {
  return (
    <Card className="border border-gray-200">
      <CardBody className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold flex items-center gap-2">
            {icon}
            {title}
          </h3>
          <Button variant="light" size="sm" onPress={onViewAll}>
            View All
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {materials.length === 0 ? (
            <div className="col-span-2 text-center py-8 text-gray-500">
              No {title.toLowerCase()} available yet
            </div>
          ) : (
            materials.map((material) => (
              <div
                key={material.id}
                className="flex flex-col justify-between space-y-6 border border-gray-200 rounded-lg overflow-hidden hover:bg-gray-50 transition-colors"
              >
                {/* Image placeholder */}
                <div className="w-full h-32 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                  <div className="text-gray-400 text-xs font-medium">
                    {material.image ? (
                      <img
                        src={material.image}
                        alt={material.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <img
                        src={
                          "https://res.cloudinary.com/dgbreoalg/image/upload/v1749817594/bookcover_dzo6fl.jpg"
                        }
                        alt={material.title}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                </div>

                <div className="p-4">
                  <div className="flex justify-between items-start">
                    <h4 className="font-medium">{material.title}</h4>
                    <Chip size="sm" variant="flat">
                      {material[courseKey] as string}
                    </Chip>
                  </div>

                  {progressKey && totalKey && (
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-sm text-gray-500">
                        {material[progressKey]}/{material[totalKey]} mastered
                      </span>
                      <Progress
                        size="sm"
                        value={
                          (Number(material[progressKey]) /
                            Number(material[totalKey])) *
                          100
                        }
                        color="secondary"
                        className="max-w-[100px]"
                      />
                    </div>
                  )}

                  {showLastReviewed && material.lastReviewed && (
                    <div className="text-xs text-gray-400 mt-2">
                      Last reviewed:{" "}
                      {new Date(material.lastReviewed).toLocaleDateString()}
                    </div>
                  )}

                  {showYear && (
                    <div className="flex items-center gap-4 mt-3">
                      {material.pages && (
                        <span className="text-sm text-gray-500">
                          {material.pages} pages
                        </span>
                      )}
                      <span className="text-sm text-gray-500">
                        {material.year}
                      </span>
                    </div>
                  )}

                  {showDownloads && (
                    <div className="text-xs text-gray-400 mt-2">
                      Downloaded {material.downloads} times
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </CardBody>
    </Card>
  );
};

const Overview = ({
  courses,
  setActiveTab,
}: Omit<OverviewProps, "studyMaterials">) => {
  const [studyMaterials, setStudyMaterials] = useState<StudyMaterial[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isStale, setIsStale] = useState<boolean>(false);
  const [lastFetch, setLastFetch] = useState<Date | null>(null);

  // Refs to prevent unnecessary API calls
  const fetchingRef = useRef<boolean>(false);
  const currentUserRef = useRef<string | null>(null);

  // Helper function to check if cache is valid
  const isCacheValid = useCallback((userId: string): boolean => {
    if (!studyMaterialsCache || studyMaterialsCache.userId !== userId) {
      return false;
    }

    const now = Date.now();
    const cacheAge = now - studyMaterialsCache.timestamp;
    return cacheAge < CACHE_DURATION;
  }, []);

  // Helper function to check if cache is stale but usable
  const isCacheStale = useCallback((userId: string): boolean => {
    if (!studyMaterialsCache || studyMaterialsCache.userId !== userId) {
      return false;
    }

    const now = Date.now();
    const cacheAge = now - studyMaterialsCache.timestamp;
    return (
      cacheAge >= CACHE_DURATION && cacheAge < STALE_WHILE_REVALIDATE_DURATION
    );
  }, []);

  // Optimized fetch function with caching
  const fetchStudyMaterials = useCallback(
    async (forceRefresh: boolean = false, showLoading: boolean = true) => {
      // Prevent concurrent fetches
      if (fetchingRef.current) {
        return;
      }

      try {
        // Check authentication
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
          console.log("User not authenticated, clearing data");
          setStudyMaterials([]);
          studyMaterialsCache = null;
          currentUserRef.current = null;
          return;
        }

        const userId = user.id;
        currentUserRef.current = userId;

        // Check cache first (unless force refresh)
        if (!forceRefresh && isCacheValid(userId)) {
          console.log("Using cached data");
          setStudyMaterials(studyMaterialsCache!.data);
          setLastFetch(new Date(studyMaterialsCache!.timestamp));
          setIsStale(false);
          return;
        }

        // Use stale cache while revalidating
        if (!forceRefresh && isCacheStale(userId)) {
          console.log("Using stale cache while revalidating");
          setStudyMaterials(studyMaterialsCache!.data);
          setIsStale(true);
          showLoading = false; // Don't show loading spinner for background refresh
        }

        fetchingRef.current = true;
        if (showLoading) {
          setLoading(true);
        }
        setError(null);

        // Fetch data in parallel for better performance
        const [quizzesResult, decksResult, pastQuestionsResult] =
          await Promise.allSettled([
            supabase
              .from("quizzes")
              .select(
                "id, title, course, questions, completed, status, created_at"
              )
              .order("created_at", { ascending: false })
              .limit(10), // Fetch a few more for variety

            supabase
              .from("decks")
              .select(
                "id, title, course, cards_count, mastered_count, last_reviewed, created_at"
              )
              .order("created_at", { ascending: false })
              .limit(10),

            supabase
              .from("past_questions")
              .select("id, title, course, year, pages, downloads, uploaded_at")
              .order("uploaded_at", { ascending: false })
              .limit(10),
          ]);

        // Handle results and errors
        const quizzesData =
          quizzesResult.status === "fulfilled"
            ? quizzesResult.value.data || []
            : [];
        const decksData =
          decksResult.status === "fulfilled"
            ? decksResult.value.data || []
            : [];
        const pastQuestionsData =
          pastQuestionsResult.status === "fulfilled"
            ? pastQuestionsResult.value.data || []
            : [];

        // Log any errors but don't fail completely
        if (quizzesResult.status === "rejected") {
          console.error("Error fetching quizzes:", quizzesResult.reason);
        }
        if (decksResult.status === "rejected") {
          console.error("Error fetching decks:", decksResult.reason);
        }
        if (pastQuestionsResult.status === "rejected") {
          console.error(
            "Error fetching past questions:",
            pastQuestionsResult.reason
          );
        }

        // Transform data to unified format
        const transformedMaterials: StudyMaterial[] = [
          // Transform quizzes
          ...quizzesData.map((quiz: QuizData) => ({
            id: quiz.id,
            title: quiz.title,
            type: "quiz" as const,
            course: quiz.course,
            questions: quiz.questions,
            completed: quiz.completed,
            status: quiz.status,
            createdAt: quiz.created_at,
          })),
          // Transform flashcard decks
          ...decksData.map((deck: FlashcardDeckData) => ({
            id: deck.id,
            title: deck.title,
            type: "flashcard" as const,
            course: deck.course,
            cards: deck.cards_count,
            mastered: deck.mastered_count,
            lastReviewed: deck.last_reviewed,
            createdAt: deck.created_at,
          })),
          // Transform past questions
          ...pastQuestionsData.map((pq: PastQuestionData) => ({
            id: pq.id,
            title: pq.title,
            type: "pastQuestion" as const,
            course: pq.course,
            year: pq.year,
            pages: pq.pages,
            downloads: pq.downloads,
            createdAt: pq.uploaded_at,
          })),
        ];

        // Sort all materials by creation date
        transformedMaterials.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

        // Update cache
        const now = Date.now();
        studyMaterialsCache = {
          data: transformedMaterials,
          timestamp: now,
          userId: userId,
        };

        setStudyMaterials(transformedMaterials);
        setLastFetch(new Date(now));
        setIsStale(false);
      } catch (err) {
        console.error("Error fetching study materials:", err);

        // If we have stale cache, use it instead of showing error
        if (
          currentUserRef.current &&
          studyMaterialsCache &&
          studyMaterialsCache.userId === currentUserRef.current
        ) {
          console.log("Using stale cache due to error");
          setStudyMaterials(studyMaterialsCache.data);
          setIsStale(true);
        } else {
          setError("Failed to load study materials");
        }
      } finally {
        setLoading(false);
        fetchingRef.current = false;
      }
    },
    [isCacheValid, isCacheStale]
  );

  // Manual refresh function
  const handleRefresh = useCallback(() => {
    fetchStudyMaterials(true, true);
  }, [fetchStudyMaterials]);

  // Initial load - check cache first
  useEffect(() => {
    const loadInitialData = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user && isCacheValid(user.id)) {
        // Use cache immediately
        setStudyMaterials(studyMaterialsCache!.data);
        setLastFetch(new Date(studyMaterialsCache!.timestamp));
        setIsStale(false);
        return;
      }

      // Fetch fresh data
      fetchStudyMaterials(false, true);
    };

    loadInitialData();
  }, [fetchStudyMaterials, isCacheValid]);

  // Listen to auth state changes
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT") {
        setStudyMaterials([]);
        studyMaterialsCache = null;
        currentUserRef.current = null;
        setLastFetch(null);
        setIsStale(false);
      } else if (event === "SIGNED_IN" && session) {
        currentUserRef.current = session.user.id;
        fetchStudyMaterials(false, true);
      }
    });

    return () => subscription.unsubscribe();
  }, [fetchStudyMaterials]);

  // Auto-refresh stale data in background (optional)
  useEffect(() => {
    if (!isStale || loading) return;

    const refreshTimer = setTimeout(() => {
      fetchStudyMaterials(false, false); // Background refresh
    }, 2000);

    return () => clearTimeout(refreshTimer);
  }, [isStale, loading, fetchStudyMaterials]);

  // Filter materials by type
  const quizzes = studyMaterials.filter((m) => m.type === "quiz");
  const flashcards = studyMaterials.filter((m) => m.type === "flashcard");
  const pastQuestions = studyMaterials.filter((m) => m.type === "pastQuestion");

  return (
    <>
      {/* Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-6">
        {courses.map((course) => (
          <Card
            key={course.id}
            className="border border-gray-200 hover:shadow-md transition-shadow"
          >
            <CardBody className="p-0 overflow-hidden">
              <div className="relative">
                <img
                  src={course.thumbnail}
                  alt={course.title}
                  className="w-full object-cover"
                />
                <div className="absolute top-4 left-4 z-1">
                  <div
                    className={`${course.color} w-10 h-10 rounded-lg flex items-center justify-center text-white`}
                  >
                    <BookOpen size={18} />
                  </div>
                </div>
              </div>
              <div className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-lg">{course.title}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-gray-500 text-sm">
                        {course.code}
                      </span>
                      <Chip size="sm" variant="flat" color="success">
                        Active
                      </Chip>
                    </div>
                  </div>
                  <Badge
                    content={course.assignmentsDue}
                    color="danger"
                    shape="circle"
                  >
                    <Button isIconOnly variant="light" radius="full">
                      <Clock className="text-gray-500" size={16} />
                    </Button>
                  </Badge>
                </div>

                <div className="my-4">
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

                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Clock size={16} className="text-gray-400" />
                    <span className="text-sm text-gray-500">
                      {course.nextSession}
                    </span>
                  </div>
                  <Button
                    size="sm"
                    radius="full"
                    variant="flat"
                    color="primary"
                    endContent={<ChevronRight size={16} />}
                  >
                    View Details
                  </Button>
                </div>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      {/* Study Materials Preview */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Recent Study Materials</h2>
          <div className="flex items-center gap-2">
            {loading && (
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                Loading...
              </div>
            )}
            {isStale && !loading && (
              <div className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded">
                Updating...
              </div>
            )}
            {lastFetch && (
              <div className="text-xs text-gray-400">
                Updated {lastFetch.toLocaleTimeString()}
              </div>
            )}
            <Button
              isIconOnly
              size="sm"
              variant="light"
              onPress={handleRefresh}
              isDisabled={loading}
              className="text-gray-500 hover:text-gray-700"
            >
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            </Button>
          </div>
        </div>

        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardBody className="p-4">
              <div className="flex items-center justify-between">
                <div className="text-red-600 text-sm">
                  {error}. Please try refreshing.
                </div>
                <Button
                  size="sm"
                  variant="light"
                  onPress={handleRefresh}
                  className="text-red-600"
                >
                  Retry
                </Button>
              </div>
            </CardBody>
          </Card>
        )}

        {/* Quizzes Preview */}
        <StudyMaterialSection
          title="Recent Quizzes"
          icon={<FileText className="text-blue-500" size={18} />}
          materials={quizzes.slice(0, 3)}
          courseKey="course"
          onViewAll={() => setActiveTab("quizzes")}
        />

        {/* Flashcards Preview */}
        <StudyMaterialSection
          title="Recent Flashcards"
          icon={<Bookmark className="text-purple-500" size={18} />}
          materials={flashcards.slice(0, 2)}
          courseKey="course"
          onViewAll={() => setActiveTab("flashcards")}
          progressKey="mastered"
          totalKey="cards"
          showLastReviewed
        />

        {/* Past Questions Preview */}
        <StudyMaterialSection
          title="Recent Past Questions"
          icon={<FileSpreadsheet className="text-green-500" size={18} />}
          materials={pastQuestions.slice(0, 2)}
          courseKey="course"
          onViewAll={() => setActiveTab("pastQuestions")}
          showYear
          showDownloads
        />

        {/* Empty State */}
        {!loading && !error && studyMaterials.length === 0 && (
          <Card className="border-dashed border-2 border-gray-300">
            <CardBody className="p-8 text-center">
              <div className="text-gray-400 mb-4">
                <BookOpen size={48} className="mx-auto" />
              </div>
              <h3 className="font-semibold text-gray-600 mb-2">
                No Study Materials Yet
              </h3>
              <p className="text-gray-500 mb-4">
                Start creating quizzes, flashcards, or uploading past questions
                to see them here.
              </p>
              <div className="flex gap-2 justify-center">
                <Button
                  size="sm"
                  color="primary"
                  variant="flat"
                  onPress={() => setActiveTab("quizzes")}
                >
                  Create Quiz
                </Button>
                <Button
                  size="sm"
                  color="secondary"
                  variant="flat"
                  onPress={() => setActiveTab("flashcards")}
                >
                  Create Flashcards
                </Button>
              </div>
            </CardBody>
          </Card>
        )}
      </div>
    </>
  );
};

export default Overview;
