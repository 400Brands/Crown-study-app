import React, { useCallback, useState, useRef } from "react";
import {
  Card,
  CardBody,
  Button,
  Progress,
  Divider,
  Spinner,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Input,
  Textarea,
  Select,
  SelectItem,
} from "@heroui/react";
import {
  Plus,
  Brain,
  Bookmark,
  Sparkles,
  Upload,
  FileText,
} from "lucide-react";
import { DeckFormData, FlashcardDeck } from "@/types";

// Import PDF.js
import * as pdfjsLib from "pdfjs-dist";
import "pdfjs-dist/build/pdf.worker.entry";



interface FlashcardDeckListProps {
  decks: FlashcardDeck[];
  loading: boolean;
  error?: string | null;
  onSelectDeck: (deck: FlashcardDeck) => void;
  onCreateDeck: (deckData: DeckFormData) => void;
  onRefresh?: () => void;
}

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
  const [extractingPdf, setExtractingPdf] = useState(false);
  const [pdfFileName, setPdfFileName] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [deckForm, setDeckForm] = useState<DeckFormData>({
    title: "",
    description: "",
    pdfText: "",
    cardCount: 5,
  });

  const {
    isOpen: isDeckModalOpen,
    onOpen: onDeckModalOpen,
    onClose: onDeckModalClose,
  } = useDisclosure();

  const cardCountOptions = [
    { value: 5, label: "5 cards" },
    { value: 10, label: "10 cards" },
    { value: 15, label: "15 cards" },
    { value: 20, label: "20 cards" },
    { value: 25, label: "25 cards" },
  ];

  const extractTextFromPDF = useCallback(
    async (file: File): Promise<string> => {
      try {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        let fullText = "";

        for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
          const page = await pdf.getPage(pageNum);
          const textContent = await page.getTextContent();
          const pageText = textContent.items
            .map((item: any) => item.str)
            .join(" ");
          fullText += pageText + "\n";
        }

        return fullText.trim();
      } catch (error) {
        throw new Error("Failed to extract text from PDF");
      }
    },
    []
  );

  const handleFileUpload = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      if (file.type !== "application/pdf") {
        setFormError("Please select a PDF file");
        return;
      }

      setExtractingPdf(true);
      setFormError(null);
      setPdfFileName(file.name);

      try {
        const extractedText = await extractTextFromPDF(file);
        setDeckForm((prev) => ({
          ...prev,
          pdfText: extractedText,
          title: prev.title || file.name.replace(".pdf", ""),
          description: prev.description || `Generated from ${file.name}`,
        }));
      } catch (error) {
        setFormError("Failed to extract text from PDF. Please try again.");
        setPdfFileName("");
      } finally {
        setExtractingPdf(false);
      }
    },
    [extractTextFromPDF]
  );

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
      setDeckForm({ title: "", description: "", pdfText: "", cardCount: 5 });
      setPdfFileName("");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      setFormError("Failed to create deck");
    } finally {
      setCreating(false);
    }
  }, [deckForm, onCreateDeck, onDeckModalClose]);

  const handleModalClose = useCallback(() => {
    onDeckModalClose();
    setDeckForm({ title: "", description: "", pdfText: "", cardCount: 5 });
    setPdfFileName("");
    setFormError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, [onDeckModalClose]);

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
            Create decks with AI-generated flashcards
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
                Create your first deck and get started with automatically
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

      <Modal isOpen={isDeckModalOpen} onClose={handleModalClose} size="2xl">
        <ModalContent>
          <ModalHeader className="text-lg font-semibold flex items-center gap-2">
            <Sparkles size={20} className="text-yellow-500" />
            Create Flashcard Deck
          </ModalHeader>
          <ModalBody>
            {formError && (
              <div className="text-danger-500 mb-4 text-sm">{formError}</div>
            )}

            <div className="space-y-4">
              {/* PDF Upload Section */}
              <div className="border-2 border-dashed border-default-300 rounded-lg p-6">
                <div className="text-center">
                  <FileText
                    size={32}
                    className="mx-auto text-default-400 mb-2"
                  />
                  <h4 className="font-medium mb-2">Upload PDF (Optional)</h4>
                  <p className="text-sm text-default-600 mb-4">
                    Upload course materials to generate more relevant flashcards
                  </p>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="pdf-upload"
                  />

                  <Button
                    color="secondary"
                    variant="bordered"
                    startContent={<Upload size={16} />}
                    onPress={() => fileInputRef.current?.click()}
                    isDisabled={extractingPdf}
                    isLoading={extractingPdf}
                  >
                    {extractingPdf ? "Extracting..." : "Choose PDF File"}
                  </Button>

                  {pdfFileName && (
                    <div className="mt-3 text-sm text-success-600 flex items-center justify-center gap-2">
                      <FileText size={16} />
                      <span>✓ {pdfFileName}</span>
                    </div>
                  )}
                </div>
              </div>

              <Input
                label="Deck Title"
                value={deckForm.title}
                onChange={(e) =>
                  setDeckForm({ ...deckForm, title: e.target.value })
                }
                placeholder="e.g., Data Structures Terms"
                isRequired
              />

              <Textarea
                label="Description (Optional)"
                value={deckForm.description}
                onChange={(e) =>
                  setDeckForm({ ...deckForm, description: e.target.value })
                }
                placeholder="Brief description of this deck"
              />

              <Select
                label="Number of Cards"
                placeholder="Select number of cards to generate"
                selectedKeys={[deckForm.cardCount.toString()]}
                onChange={(e) =>
                  setDeckForm({
                    ...deckForm,
                    cardCount: parseInt(e.target.value),
                  })
                }
                classNames={{
                  trigger: "min-h-unit-12",
                }}
              >
                {cardCountOptions.map((option) => (
                  <SelectItem
                    key={option.value.toString()}
                  >
                    {option.label}
                  </SelectItem>
                ))}
              </Select>

              {deckForm.pdfText && (
                <div className="bg-default-100 p-3 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText size={16} className="text-success-600" />
                    <span className="text-sm font-medium">
                      PDF Content Extracted
                    </span>
                  </div>
                  <p className="text-xs text-default-600">
                    {deckForm.pdfText.length} characters extracted from PDF
                  </p>
                </div>
              )}
            </div>
          </ModalBody>
          <ModalFooter>
            <Button
              variant="light"
              onPress={handleModalClose}
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
              {creating
                ? "Generating..."
                : `Create ${deckForm.cardCount} AI Cards`}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
};

export default FlashcardDeckList;