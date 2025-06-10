// components/study-planner/AddStudySessionModal.tsx
import { StudySession } from "@/types";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Select,
  SelectItem,
} from "@heroui/react";
import { BookOpen, Flame } from "lucide-react";
import { useState } from "react";

// Props interface for AddStudySessionModal
interface AddStudySessionModalProps {
  isOpen: boolean;
  onOpenChange: () => void;
  // Callback function to add a new session. Omit 'id', 'completed', 'created_at' as they are handled by backend/defaults.
  onAddSession: (
    session: Omit<StudySession, "id" | "completed" | "created_at">
  ) => void;
}

export const AddStudySessionModal = ({
  isOpen,
  onOpenChange,
  onAddSession,
}: AddStudySessionModalProps) => {
  // Form state variables
  const [title, setTitle] = useState<string>("");
  const [course, setCourse] = useState<string>("");
  const [date, setDate] = useState<string>(""); // YYYY-MM-DD format
  const [time, setTime] = useState<string>(""); // HH:MM format
  const [duration, setDuration] = useState<string>(""); // Number as string for input
  const [priority, setPriority] = useState<"high" | "medium" | "low">("medium");
  const [type, setType] = useState<
    "revision" | "reading" | "assignment" | "practice"
  >("revision");
  const [formError, setFormError] = useState<string | null>(null); // State for form validation error

  // Static data for dropdowns
  const courses: string[] = ["CSC 101", "CSC 201", "CSC 301", "CSC 305"];
  const sessionTypes = [
    { key: "reading", label: "Reading", icon: <BookOpen size={16} /> },
    { key: "revision", label: "Revision", icon: <BookOpen size={16} /> },
    { key: "assignment", label: "Assignment", icon: <BookOpen size={16} /> },
    { key: "practice", label: "Practice", icon: <BookOpen size={16} /> },
  ];
  const priorities = [
    {
      key: "high",
      label: "High Priority",
      icon: <Flame className="text-red-500" />,
    },
    {
      key: "medium",
      label: "Medium Priority",
      icon: <Flame className="text-orange-400" />,
    },
    {
      key: "low",
      label: "Low Priority",
      icon: <Flame className="text-yellow-400" />,
    },
  ];

  /**
   * Resets all form fields to their initial empty or default values.
   */
  const resetForm = () => {
    setTitle("");
    setCourse("");
    setDate("");
    setTime("");
    setDuration("");
    setPriority("medium");
    setType("revision");
    setFormError(null);
  };

  /**
   * Handles the submission of the Add Study Session form.
   * Performs basic client-side validation and calls the onAddSession prop.
   */
  const handleSubmit = () => {
    // Basic validation
    if (!title || !course || !date || !time || !duration) {
      setFormError("Please fill in all required fields.");
      return;
    }

    const parsedDuration = parseInt(duration);
    if (isNaN(parsedDuration) || parsedDuration <= 0) {
      setFormError("Duration must be a positive number.");
      return;
    }

    // Combine date and time inputs into a single Date object
    const sessionDateTime = new Date(`${date}T${time}`);

    // Ensure the date is valid
    if (isNaN(sessionDateTime.getTime())) {
      setFormError("Invalid date or time provided.");
      return;
    }

    // Construct the new session object, omitting fields handled by Supabase
    const newSession: Omit<StudySession, "id" | "completed" | "created_at"> = {
      title,
      course,
      date: sessionDateTime, // Pass Date object; parent will convert to ISO string
      duration: parsedDuration,
      priority,
      type,
    };

    onAddSession(newSession); // Call the parent's add handler
    resetForm(); // Reset form fields
    onOpenChange(); // Close the modal
  };

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange} placement="center">
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              Add Study Session
            </ModalHeader>
            <ModalBody>
              {formError && (
                <div className="p-3 bg-red-100 text-red-700 rounded-md text-sm">
                  {formError}
                </div>
              )}
              <Input
                autoFocus
                label="Session Title"
                placeholder="e.g. Calculus Chapter 2 Review"
                variant="bordered"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              <Select
                label="Course"
                placeholder="Select course"
                variant="bordered"
                selectedKeys={course ? new Set([course]) : new Set()} // Use Set for selectedKeys
                onSelectionChange={(keys) => {
                  const selectedCourse = Array.from(keys)[0] as string;
                  setCourse(selectedCourse || "");
                }}
              >
                {courses.map((c) => (
                  <SelectItem key={c} >
                    {c}
                  </SelectItem>
                ))}
              </Select>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  type="date"
                  label="Date"
                  variant="bordered"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
                <Input
                  type="time"
                  label="Time"
                  variant="bordered"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                />
              </div>
              <Input
                type="number"
                label="Duration (minutes)"
                placeholder="e.g. 90"
                variant="bordered"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
              />
              <Select
                label="Priority"
                variant="bordered"
                selectedKeys={new Set([priority])} // Use Set for selectedKeys
                onSelectionChange={(keys) => {
                  const selectedPriority = Array.from(keys)[0] as
                    | "high"
                    | "medium"
                    | "low";
                  setPriority(selectedPriority);
                }}
              >
                {priorities.map((p) => (
                  <SelectItem key={p.key}  startContent={p.icon}>
                    {p.label}
                  </SelectItem>
                ))}
              </Select>
              <Select
                label="Session Type"
                variant="bordered"
                selectedKeys={new Set([type])} // Use Set for selectedKeys
                onSelectionChange={(keys) => {
                  const selectedType = Array.from(keys)[0] as
                    | "revision"
                    | "reading"
                    | "assignment"
                    | "practice";
                  setType(selectedType);
                }}
              >
                {sessionTypes.map((st) => (
                  <SelectItem
                    key={st.key}
                    
                    startContent={st.icon}
                  >
                    {st.label}
                  </SelectItem>
                ))}
              </Select>
            </ModalBody>
            <ModalFooter>
              <Button
                color="danger"
                variant="flat"
                onPress={() => {
                  onClose();
                  resetForm();
                }}
              >
                Cancel
              </Button>
              <Button color="primary" onPress={handleSubmit}>
                Add Session
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};
