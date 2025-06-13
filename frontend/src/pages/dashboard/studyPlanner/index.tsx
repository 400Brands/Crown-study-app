// app/study-planner/page.tsx
import {
  Card,
  CardBody,
  Button,
  Divider,
  Tabs,
  Tab,
  Calendar,
  Progress,
  useDisclosure,
} from "@heroui/react";
import { DateValue } from "@internationalized/date";
import { CalendarDays, Clock, Plus, Flame, CheckCircle2 } from "lucide-react";
import DashboardLayout from "@/layouts/dashboardLayout"; // Assuming these layouts exist
import DefaultLayout from "@/layouts/default"; // Assuming these layouts exist
import { useState, useEffect, useCallback } from "react";
import { parseDate } from "@internationalized/date";

// Import sub-components
import { StudySessionCard } from "./StudySessionCard";
import { AddStudySessionModal } from "./AddStudySessionModal";
import { supabase } from "@/supabaseClient";
import { StudySession } from "@/types";



const StudyPlanner = () => {
  // State for the Add Session Modal
  const {
    isOpen: isAddModalOpen,
    onOpen: onAddModalOpen,
    onOpenChange: onAddModalOpenChange,
  } = useDisclosure();

  // State for the selected date on the calendar
  const [selectedDate, setSelectedDate] = useState<DateValue>(
    parseDate(new Date().toISOString().split("T")[0])
  );

  // State for controlling the active tab (Weekly, Upcoming, Completed)
  const [activeTab, setActiveTab] = useState<string>("weekly");

  // State for storing all study sessions fetched from Supabase
  const [studySessions, setStudySessions] = useState<StudySession[]>([]);

  // State for loading indicator
  const [loading, setLoading] = useState<boolean>(true);

  // State for displaying errors
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetches all study sessions from the Supabase database.
   * Converts date strings from the database into Date objects for client-side use.
   */
  const fetchStudySessions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await supabase
        .from("study_sessions")
        .select("*")
        .order("date", { ascending: true }); // Order sessions by date

      if (fetchError) {
        console.error("Error fetching study sessions:", fetchError);
        setError("Failed to load study sessions. Please try again.");
      } else {
        // Map fetched data to StudySession interface, converting date string to Date object
        const sessions: StudySession[] = data.map((session) => ({
          ...session,
          date: new Date(session.date),
        }));
        setStudySessions(sessions);
      }
    } catch (err) {
      console.error("Unexpected error during fetch:", err);
      setError("An unexpected error occurred while fetching data.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Effect hook to fetch study sessions when the component mounts
  useEffect(() => {
    fetchStudySessions();
  }, [fetchStudySessions]);

  /**
   * Adds a new study session to the Supabase database.
   * @param newSessionData The data for the new session, excluding 'id', 'completed', and 'created_at'.
   */
  const handleAddSession = async (
    newSessionData: Omit<StudySession, "id" | "completed" | "created_at">
  ) => {
    setLoading(true);
    setError(null);
    try {
      // Supabase expects the date as an ISO string for 'timestamp with time zone'
      const { data, error: insertError } = await supabase
        .from("study_sessions")
        .insert({
          ...newSessionData,
          date: newSessionData.date.toISOString(), // Convert Date object to ISO string
        })
        .select(); // Select the newly inserted row to get its generated ID and default values

      if (insertError) {
        console.error("Error adding study session:", insertError);
        setError("Failed to add study session.");
      } else if (data && data.length > 0) {
        // Convert the fetched date string back to a Date object
        const addedSession: StudySession = {
          ...data[0],
          date: new Date(data[0].date),
        };
        setStudySessions((prev) => [...prev, addedSession]);
      }
    } catch (err) {
      console.error("Unexpected error during add operation:", err);
      setError("An unexpected error occurred while adding the session.");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Updates an existing study session in the Supabase database.
   * @param updatedSession The updated session object, including its ID.
   */
  const handleUpdateSession = async (updatedSession: StudySession) => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: updateError } = await supabase
        .from("study_sessions")
        .update({
          ...updatedSession,
          date: updatedSession.date.toISOString(), // Convert Date object to ISO string
        })
        .eq("id", updatedSession.id) // Identify the record to update by its ID
        .select();

      if (updateError) {
        console.error("Error updating study session:", updateError);
        setError("Failed to update study session.");
      } else if (data && data.length > 0) {
        const updatedItem: StudySession = {
          ...data[0],
          date: new Date(data[0].date),
        };
        setStudySessions((prev) =>
          prev.map((s) => (s.id === updatedItem.id ? updatedItem : s))
        );
      }
    } catch (err) {
      console.error("Unexpected error during update operation:", err);
      setError("An unexpected error occurred while updating the session.");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Deletes a study session from the Supabase database.
   * @param id The ID of the session to delete.
   */
  const handleDeleteSession = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const { error: deleteError } = await supabase
        .from("study_sessions")
        .delete()
        .eq("id", id); // Identify the record to delete by its ID

      if (deleteError) {
        console.error("Error deleting study session:", deleteError);
        setError("Failed to delete study session.");
      } else {
        setStudySessions((prev) => prev.filter((s) => s.id !== id));
      }
    } catch (err) {
      console.error("Unexpected error during delete operation:", err);
      setError("An unexpected error occurred while deleting the session.");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Toggles the 'completed' status of a study session.
   * @param id The ID of the session to update.
   * @param completed The new completed status.
   */
  const handleMarkComplete = async (id: string, completed: boolean) => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: updateError } = await supabase
        .from("study_sessions")
        .update({ completed: completed })
        .eq("id", id)
        .select();

      if (updateError) {
        console.error("Error marking session complete:", updateError);
        setError("Failed to update session status.");
      } else if (data && data.length > 0) {
        const updatedItem: StudySession = {
          ...data[0],
          date: new Date(data[0].date),
        };
        setStudySessions((prev) =>
          prev.map((s) => (s.id === updatedItem.id ? updatedItem : s))
        );
      }
    } catch (err) {
      console.error("Unexpected error during mark complete operation:", err);
      setError("An unexpected error occurred while updating session status.");
    } finally {
      setLoading(false);
    }
  };

  // Calculate weekly progress based on current study sessions
  const totalSessions = studySessions.length;
  const completedSessions = studySessions.filter((s) => s.completed).length;
  const progressPercentage = totalSessions
    ? Math.round((completedSessions / totalSessions) * 100)
    : 0; // Avoid division by zero

  /**
   * Filters study sessions to get those scheduled for a specific date.
   * @param date The date to filter by (DateValue from @internationalized/date).
   * @returns An array of StudySession objects for the given date.
   */
  const getSessionsForDate = (date: DateValue): StudySession[] => {
    // Convert DateValue to standard JavaScript Date components for comparison
    const year = date.year;
    const month = date.month - 1; // JS Date months are 0-indexed
    const day = date.day;

    return studySessions.filter((session) => {
      const sessionDate = session.date; // This is already a Date object
      return (
        sessionDate.getFullYear() === year &&
        sessionDate.getMonth() === month &&
        sessionDate.getDate() === day
      );
    });
  };

  // Get up to 3 upcoming, incomplete study sessions, sorted by date
  const upcomingSessions = studySessions
    .filter((session) => !session.completed && session.date > new Date())
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .slice(0, 3);

  return (
    <DefaultLayout>
      <DashboardLayout>
        <div className="space-y-6 ml-4">
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
              onPress={onAddModalOpen}
            >
              Add Session
            </Button>
          </div>

          {/* Progress Overview Card */}
          <Card className="bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-100">
            <CardBody className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Weekly Progress */}
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
                {/* Upcoming Focus */}
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
                          ? "text-red-500" // More than 2 high priority
                          : "text-orange-400" // Some high priority
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
                {/* Next Session */}
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

            {/* Sessions List Section */}
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
                    {loading && (
                      <p className="text-center text-gray-500">
                        Loading sessions...
                      </p>
                    )}
                    {error && (
                      <p className="text-center text-red-500">{error}</p>
                    )}
                    {!loading && !error && studySessions.length === 0 && (
                      <p className="text-center text-gray-400">
                        No study sessions found. Add one!
                      </p>
                    )}

                    {activeTab === "weekly" && (
                      <div className="space-y-4">
                        {studySessions
                          .filter((session) => {
                            const today = new Date();
                            // Set today to start of day for accurate comparison
                            today.setHours(0, 0, 0, 0);
                            const nextWeek = new Date(today);
                            nextWeek.setDate(today.getDate() + 7);
                            // Set nextWeek to end of day for accurate comparison
                            nextWeek.setHours(23, 59, 59, 999);

                            return (
                              session.date >= today && session.date <= nextWeek
                            );
                          })
                          .sort((a, b) => a.date.getTime() - b.date.getTime())
                          .map((session) => (
                            <StudySessionCard
                              key={session.id}
                              session={session}
                              onMarkComplete={handleMarkComplete}
                              onDelete={handleDeleteSession}
                              onUpdate={handleUpdateSession}
                            />
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
                            <StudySessionCard
                              key={session.id}
                              session={session}
                              onMarkComplete={handleMarkComplete}
                              onDelete={handleDeleteSession}
                              onUpdate={handleUpdateSession}
                            />
                          ))}
                      </div>
                    )}
                    {activeTab === "completed" && (
                      <div className="space-y-4">
                        {studySessions
                          .filter((session) => session.completed)
                          .sort((a, b) => b.date.getTime() - a.date.getTime()) // Sort descending for completed
                          .map((session) => (
                            <StudySessionCard
                              key={session.id}
                              session={session}
                              onMarkComplete={handleMarkComplete}
                              onDelete={handleDeleteSession}
                              onUpdate={handleUpdateSession}
                            />
                          ))}
                      </div>
                    )}
                  </div>
                </CardBody>
              </Card>
            </div>
          </div>

          {/* Add Session Modal (rendered separately) */}
          <AddStudySessionModal
            isOpen={isAddModalOpen}
            onOpenChange={onAddModalOpenChange}
            onAddSession={handleAddSession}
          />
        </div>
      </DashboardLayout>
    </DefaultLayout>
  );
};

export default StudyPlanner;
