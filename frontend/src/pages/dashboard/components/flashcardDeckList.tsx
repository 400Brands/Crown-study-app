import React, { useCallback, useState } from "react";
import {
  Card,
  CardBody,
  Button,
  Progress,
  Chip,
  Divider,
  Spinner,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Input,
  Select,
  SelectItem,
  Textarea,
} from "@heroui/react";
import { Plus, Brain, Bookmark, Sparkles } from "lucide-react";

interface FlashcardDeck {
  id: string;
  title: string;
  course: string;
  description: string;
  cards_count: number;
  mastered_count: number;
  last_reviewed: string;
  user_id: string;
  created_at: string;
}

interface DeckFormData {
  title: string;
  course: string;
  description: string;
}

interface FlashcardDeckListProps {
  decks: FlashcardDeck[];
  loading: boolean;
  error?: string | null;
  onSelectDeck: (deck: FlashcardDeck) => void;
  onCreateDeck: (deckData: DeckFormData) => Promise<void>;
  onRefresh?: () => void;
}

const courses = [
  { key: "CSC 101", label: "CSC 101: Introduction to Programming" },
  { key: "CSC 201", label: "CSC 201: Data Structures & Algorithms" },
  { key: "CSC 301", label: "CSC 301: Database Systems" },
  { key: "CSC 305", label: "CSC 305: Artificial Intelligence" },
];

const FlashcardDeckList: React.FC<FlashcardDeckListProps> = ({
  decks,
  loading,
  error,
  onSelectDeck,
  onCreateDeck,
  onRefresh,
}) => {
  const [creating, setCreating] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [deckForm, setDeckForm] = useState<DeckFormData>({
    title: "",
    course: "CSC 101",
    description: "",
  });

  const {
    isOpen: isDeckModalOpen,
    onOpen: onDeckModalOpen,
    onClose: onDeckModalClose,
  } = useDisclosure();

  const handleCreateDeck = useCallback(async () => {
    if (!deckForm.title.trim()) {
      setFormError("Please enter a title for the deck");
      return;
    }

    try {
      setCreating(true);
      setFormError(null);
      await onCreateDeck(deckForm);
      onDeckModalClose();
      setDeckForm({ title: "", course: "CSC 101", description: "" });
    } catch (error) {
      setFormError("Failed to create deck");
    } finally {
      setCreating(false);
    }
  }, [deckForm, onCreateDeck, onDeckModalClose]);

  const formatDate = useCallback((dateString: string) => {
    return new Date(dateString).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }, []);

  if (loading && decks.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="lg" label="Loading flashcard decks..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Bookmark className="text-purple-500" size={24} />
            Flashcard Decks
          </h2>
          <p className="text-sm text-gray-600 mt-1 flex items-center gap-2">
            <Sparkles size={16} className="text-yellow-500" />
            Each deck comes with 5 AI-generated flashcards
          </p>
        </div>
        <Button
          color="primary"
          size="md"
          onPress={onDeckModalOpen}
          startContent={<Plus size={16} />}
          className="whitespace-nowrap"
        >
          Create Deck
        </Button>
      </div>

      {error && (
        <div className="bg-danger-50 border border-danger-200 text-danger-700 px-4 py-3 rounded-lg flex items-center justify-between">
          <span>{error}</span>
          <Button size="sm" color="danger" variant="flat" onPress={onRefresh}>
            Retry
          </Button>
        </div>
      )}

      {decks.length === 0 && !loading ? (
        <Card className="border border-default-200">
          <CardBody className="text-center py-16">
            <div className="space-y-4">
              <div className="flex justify-center">
                <div className="relative">
                  <Brain size={48} className="text-default-400" />
                  <Sparkles
                    size={20}
                    className="absolute -top-1 -right-1 text-yellow-500"
                  />
                </div>
              </div>
              <h3 className="text-lg font-medium">No flashcard decks yet</h3>
              <p className="text-default-600 max-w-md mx-auto">
                Create your first deck and get started with 5 automatically
                generated flashcards tailored to your course content.
              </p>
              <Button
                color="primary"
                size="lg"
                onPress={onDeckModalOpen}
                startContent={<Plus size={20} />}
              >
                Create Your First Deck
              </Button>
            </div>
          </CardBody>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {decks.map((deck) => {
            const deckMastery =
              deck.cards_count > 0
                ? Math.round((deck.mastered_count / deck.cards_count) * 100)
                : 0;

            return (
              <Card
                key={deck.id}
                className="border border-default-200 hover:shadow-lg transition-all duration-200 cursor-pointer hover:scale-105"
                isPressable
                onPress={() => onSelectDeck(deck)}
              >
                <CardBody className="p-6">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-semibold text-lg line-clamp-2">
                      {deck.title}
                    </h3>
                    <Chip
                      size="sm"
                      variant="flat"
                      color="secondary"
                      className="ml-2 flex-shrink-0"
                    >
                      {deck.course}
                    </Chip>
                  </div>

                  <p className="text-sm text-default-600 mb-4 line-clamp-2 min-h-[2.5rem]">
                    {deck.description || "No description"}
                  </p>

                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-default-600">Progress</span>
                        <span className="font-medium">{deckMastery}%</span>
                      </div>
                      <Progress
                        value={deckMastery}
                        color="secondary"
                        size="sm"
                        className="mb-1"
                      />
                      <div className="text-xs text-default-500">
                        {deck.mastered_count}/{deck.cards_count} cards mastered
                      </div>
                    </div>

                    <Divider />

                    <div className="flex justify-between items-center">
                      <span className="text-xs text-default-400">
                        {deck.last_reviewed
                          ? `Reviewed ${formatDate(deck.last_reviewed)}`
                          : "Never reviewed"}
                      </span>
                      <div className="flex items-center gap-1">
                        <Brain size={14} className="text-secondary" />
                        <span className="text-xs font-medium">
                          {deck.cards_count}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardBody>
              </Card>
            );
          })}
        </div>
      )}

      <Modal isOpen={isDeckModalOpen} onClose={onDeckModalClose}>
        <ModalContent>
          <ModalHeader className="text-lg font-semibold flex items-center gap-2">
            <Sparkles size={20} className="text-yellow-500" />
            Create Flashcard Deck
          </ModalHeader>
          <ModalBody>
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg mb-4">
              <div className="flex items-center gap-2 mb-2">
                <Brain size={16} className="text-purple-600" />
                <span className="text-sm font-medium text-purple-800">
                  AI-Powered Generation
                </span>
              </div>
              <p className="text-xs text-purple-700">
                Your new deck will automatically include 5 course-specific
                flashcards generated by AI to help you get started immediately.
              </p>
            </div>

            {formError && (
              <div className="text-danger-500 mb-4 text-sm">{formError}</div>
            )}

            <div className="space-y-4">
              <Input
                label="Deck Title"
                value={deckForm.title}
                onChange={(e) =>
                  setDeckForm({ ...deckForm, title: e.target.value })
                }
                placeholder="e.g., Data Structures Terms"
                isRequired
              />
              <Select
                label="Course"
                selectedKeys={[deckForm.course]}
                onChange={(e) =>
                  setDeckForm({ ...deckForm, course: e.target.value })
                }
                isRequired
              >
                {courses.map((course) => (
                  <SelectItem key={course.key}>{course.label}</SelectItem>
                ))}
              </Select>
              <Textarea
                label="Description (Optional)"
                value={deckForm.description}
                onChange={(e) =>
                  setDeckForm({ ...deckForm, description: e.target.value })
                }
                placeholder="Brief description of this deck"
              />
            </div>
          </ModalBody>
          <ModalFooter>
            <Button
              variant="light"
              onPress={onDeckModalClose}
              isDisabled={creating}
            >
              Cancel
            </Button>
            <Button
              color="primary"
              onPress={handleCreateDeck}
              isDisabled={!deckForm.title.trim()}
              isLoading={creating}
              startContent={!creating && <Sparkles size={16} />}
            >
              {creating ? "Generating..." : "Create with AI Cards"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
};

export default FlashcardDeckList;
