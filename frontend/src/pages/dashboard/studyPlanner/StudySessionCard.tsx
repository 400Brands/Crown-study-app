// components/study-planner/StudySessionCard.tsx
import {
  Button,
  Chip,
  Popover,
  PopoverTrigger,
  PopoverContent,
  useDisclosure,
} from "@heroui/react";
import {
  CalendarDays,
  Clock,
  Flame,
  CheckCircle2,
  MoreVertical,
} from "lucide-react";
import { useState } from "react";
import { StudySession } from "@/types";
import { EditStudySessionModal } from "./EditSessionModal";

// Props interface for StudySessionCard component
interface StudySessionCardProps {
  session: StudySession;
  onMarkComplete: (id: string, completed: boolean) => void;
  onDelete: (id: string) => void;
  onUpdate: (session: StudySession) => void;
}

export const StudySessionCard = ({
  session,
  onMarkComplete,
  onDelete,
  onUpdate,
}: StudySessionCardProps) => {
  // State to track hover for "Mark Complete" button
  const [isHovered, setIsHovered] = useState<boolean>(false);

  // useDisclosure hook for managing the Edit Session Modal's state
  const {
    isOpen: isEditModalOpen,
    onOpen: onEditModalOpen,
    onOpenChange: onEditModalOpenChange,
  } = useDisclosure();

  /**
   * Determines the Tailwind CSS color class for the Flame icon based on priority.
   * @param priority The priority level of the study session.
   * @returns A Tailwind CSS text color class string.
   */
  const getPriorityColorClass = (
    priority: "high" | "medium" | "low"
  ): string => {
    switch (priority) {
      case "high":
        return "text-red-500";
      case "medium":
        return "text-orange-400";
      case "low":
        return "text-yellow-400";
      default:
        return "text-gray-500";
    }
  };

  /**
   * Determines the background and border color classes for the session card.
   * @returns A Tailwind CSS class string for background and border.
   */
  const getCardColorClass = (): string => {
    if (session.completed) {
      return "border-green-200 bg-green-50";
    }
    switch (session.priority) {
      case "high":
        return "border-red-200 bg-red-50";
      case "medium":
        return "border-orange-200 bg-orange-50";
      case "low":
        return "border-gray-200 bg-white"; // Default for low priority
      default:
        return "border-gray-200 bg-white";
    }
  };

  return (
    <>
      <div
        className={`p-4 rounded-lg border transition-all ${getCardColorClass()}`}
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
              // Display checkmark if session is completed
              <CheckCircle2 className="h-5 w-5 text-green-500" />
            ) : (
              // Display "Mark Complete" button if not completed
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
                onPress={() => onMarkComplete(session.id, true)}
              >
                {isHovered ? (
                  "Mark Complete"
                ) : (
                  <Flame
                    className={`h-4 w-4 ${getPriorityColorClass(session.priority)}`}
                  />
                )}
              </Button>
            )}
            {/* Popover for More Options (Edit, Reschedule, Delete) */}
            <Popover placement="bottom-end">
              <PopoverTrigger>
                <Button isIconOnly size="sm" variant="light">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent>
                <div className="px-1 py-2">
                  <Button
                    variant="light"
                    className="w-full justify-start"
                    onPress={onEditModalOpen} // Open edit modal on click
                  >
                    Edit
                  </Button>
                  {/* Reschedule functionality can be implemented here or within EditModal */}
                  <Button variant="light" className="w-full justify-start">
                    Reschedule
                  </Button>
                  <Button
                    variant="light"
                    className="w-full justify-start text-red-500"
                    onPress={() => onDelete(session.id)} // Call onDelete prop
                  >
                    Delete
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </div>

      {/* Edit Session Modal */}
      <EditStudySessionModal
        isOpen={isEditModalOpen}
        onOpenChange={onEditModalOpenChange}
        session={session} // Pass the current session data to the edit modal
        onUpdateSession={onUpdate} // Pass the update handler
      />
    </>
  );
};
