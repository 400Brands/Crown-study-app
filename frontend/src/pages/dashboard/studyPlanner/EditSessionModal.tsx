// components/study-planner/EditStudySessionModal.tsx
import { EditStudySessionModalProps, StudySession } from "@/types";
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
import { useState, useEffect } from "react";


export const EditStudySessionModal = ({
  isOpen,
  onOpenChange,
  session,
  onUpdateSession,
}: EditStudySessionModalProps) => {
  const [title, setTitle] = useState(session?.title || "");
  const [course, setCourse] = useState(session?.course || "");
  const [date, setDate] = useState(Date);
  const [time, setTime] = useState("");
  const [duration, setDuration] = useState(session?.duration.toString() || "");
  const [priority, setPriority] = useState<"high" | "medium" | "low">(
    session?.priority || "medium"
  );
  const [type, setType] = useState<
    "revision" | "reading" | "assignment" | "practice"
  >(session?.type || "revision");

  useEffect(() => {
    if (session) {
      setTitle(session.title);
      setCourse(session.course);
      const sessionDate = new Date(session.date);
      setDate(sessionDate.toISOString().split("T")[0]); // YYYY-MM-DD
      setTime(sessionDate.toTimeString().split(" ")[0].substring(0, 5)); // HH:MM
      setDuration(session.duration.toString());
      setPriority(session.priority);
      setType(session.type);
    }
  }, [session]);

  const courses = ["CSC 101", "CSC 201", "CSC 301", "CSC 305"];
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

  const handleSubmit = () => {
    if (!session || !title || !course || !date || !time || !duration) {
      alert("Please fill in all fields.");
      return;
    }

    const sessionDateTime = new Date(`${date}T${time}`);

    const updatedSession: StudySession = {
      ...session,
      title,
      course,
      date: sessionDateTime,
      duration: parseInt(duration),
      priority,
      type,
    };

    onUpdateSession(updatedSession);
    onOpenChange(); // Close modal
  };

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange} placement="center">
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              Edit Study Session
            </ModalHeader>
            <ModalBody>
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
                selectedKeys={[course]}
                onSelectionChange={(keys) =>
                  setCourse(Array.from(keys).join(""))
                }
              >
                {courses.map((c) => (
                  <SelectItem key={c}>{c}</SelectItem>
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
                selectedKeys={[priority]}
                onSelectionChange={(keys) =>
                  setPriority(Array.from(keys)[0] as "high" | "medium" | "low")
                }
              >
                {priorities.map((p) => (
                  <SelectItem key={p.key} startContent={p.icon}>
                    {p.label}
                  </SelectItem>
                ))}
              </Select>
              <Select
                label="Session Type"
                variant="bordered"
                selectedKeys={[type]}
                onSelectionChange={(keys) =>
                  setType(
                    Array.from(keys)[0] as
                      | "revision"
                      | "reading"
                      | "assignment"
                      | "practice"
                  )
                }
              >
                {sessionTypes.map((st) => (
                  <SelectItem key={st.key} startContent={st.icon}>
                    {st.label}
                  </SelectItem>
                ))}
              </Select>
            </ModalBody>
            <ModalFooter>
              <Button color="danger" variant="flat" onPress={onClose}>
                Cancel
              </Button>
              <Button color="primary" onPress={handleSubmit}>
                Save Changes
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};
