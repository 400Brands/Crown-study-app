//@ts-nocheck

import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Card,
  CardBody,
  Button,
  Progress,
  Chip,
  Select,
  SelectItem,
  Spinner,
} from "@heroui/react";
import {
  ChevronLeft,
  ChevronRight,
  RotateCw,
  Brain,
  Target,
  Plus,
  RefreshCw,
} from "lucide-react";

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

interface Flashcard {
  id: string;
  deck_id: string;
  front: string;
  back: string;
  is_mastered: boolean;
  difficulty_level: number;
  review_count: number;
  last_reviewed: string;
  created_at: string;
}

interface FlashcardViewerProps {
  deck: FlashcardDeck;
  cards: Flashcard[];
  loading: boolean;
  error?: string | null;
  onBack: () => void;
  onEditCard?: (card: Flashcard) => void;
  onDeleteCard?: (cardId: string) => void;
  onMasterCard?: (
    cardId: string,
    isMastered: boolean,
    difficulty?: number
  ) => void;
  onAddCard?: () => void;
  onRefresh?: () => void;
}

type ReviewMode = "all" | "unmastered" | "random";

const FlashcardViewer: React.FC<FlashcardViewerProps> = ({
  deck,
  cards,
  loading,
  error,
  onBack,
  onMasterCard,
  onAddCard,
  onRefresh,
}) => {
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [reviewMode, setReviewMode] = useState<ReviewMode>("all");

  const filteredCards = useMemo(() => {
    switch (reviewMode) {
      case "unmastered":
        return cards.filter((card) => !card.is_mastered);
      case "random":
        return [...cards].sort(() => Math.random() - 0.5);
      default:
        return cards;
    }
  }, [cards, reviewMode]);

  const currentCard = filteredCards[currentCardIndex] || null;

  const masteryPercentage = useMemo(() => {
    if (deck.cards_count === 0) return 0;
    return Math.round((deck.mastered_count / deck.cards_count) * 100);
  }, [deck]);

  const handleNextCard = useCallback(() => {
    if (currentCardIndex < filteredCards.length - 1) {
      setCurrentCardIndex((prev) => prev + 1);
      setIsFlipped(false);
    }
  }, [currentCardIndex, filteredCards.length]);

  const handlePrevCard = useCallback(() => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex((prev) => prev - 1);
      setIsFlipped(false);
    }
  }, [currentCardIndex]);

  const handleReviewModeChange = useCallback((mode: ReviewMode) => {
    setReviewMode(mode);
    setCurrentCardIndex(0);
    setIsFlipped(false);
  }, []);

  const handleMasterCard = useCallback(
    (cardId: string, isMastered: boolean, difficulty?: number) => {
      if (onMasterCard) {
        onMasterCard(cardId, isMastered, difficulty);
      }
    },
    [onMasterCard]
  );

  const handleAddCard = useCallback(() => {
    if (onAddCard) {
      onAddCard();
    }
  }, [onAddCard]);

  const handleRefresh = useCallback(() => {
    if (onRefresh) {
      onRefresh();
    }
  }, [onRefresh]);

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (!currentCard) return;

      switch (event.key) {
        case "ArrowLeft":
          event.preventDefault();
          handlePrevCard();
          break;
        case "ArrowRight":
          event.preventDefault();
          handleNextCard();
          break;
        case " ":
          event.preventDefault();
          setIsFlipped((prev) => !prev);
          break;
        case "Enter":
          event.preventDefault();
          if (isFlipped && onMasterCard) {
            handleMasterCard(currentCard.id, !currentCard.is_mastered);
          }
          break;
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [
    currentCard,
    isFlipped,
    handleNextCard,
    handlePrevCard,
    handleMasterCard,
  ]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Spinner size="lg" label="Loading flashcards..." />
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border border-danger-200">
        <CardBody className="text-center py-16">
          <div className="space-y-4">
            <div className="text-danger-500">
              <Brain size={48} className="mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-danger-600">
              Error Loading Cards
            </h3>
            <p className="text-default-600">{error}</p>
            {onRefresh && (
              <Button
                color="primary"
                variant="flat"
                onPress={handleRefresh}
                startContent={<RefreshCw size={16} />}
              >
                Try Again
              </Button>
            )}
          </div>
        </CardBody>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div className="flex items-center gap-4">
          <Button
            variant="light"
            onPress={onBack}
            startContent={<ChevronLeft size={16} />}
          >
            Back to Decks
          </Button>
          <div className="hidden sm:block">
            <h3 className="font-semibold text-lg">{deck.title}</h3>
            <p className="text-sm text-default-600">{deck.course}</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Select
            size="sm"
            selectedKeys={[reviewMode]}
            onChange={(e) =>
              handleReviewModeChange(e.target.value as ReviewMode)
            }
            className="w-40"
          >
            <SelectItem key="all">All Cards</SelectItem>
            <SelectItem key="unmastered">Unmastered</SelectItem>
            <SelectItem key="random">Random Order</SelectItem>
          </Select>

          <div className="flex items-center gap-2">
            <Progress
              size="sm"
              value={masteryPercentage}
              color="secondary"
              className="w-32"
            />
            <span className="text-sm font-medium min-w-fit">
              {deck.mastered_count}/{deck.cards_count}
            </span>
          </div>

          {onRefresh && (
            <Button
              variant="light"
              size="sm"
              onPress={handleRefresh}
              startContent={<RefreshCw size={16} />}
            >
              Refresh
            </Button>
          )}
        </div>
      </div>

      {filteredCards.length > 0 && currentCard ? (
        <div className="space-y-6">
          <Card
            className="border w-full border-default-200 min-h-96 cursor-pointer transition-transform hover:scale-[1.02]"
            isPressable
            onPress={() => setIsFlipped(!isFlipped)}
          >
            <CardBody className="p-8 flex items-center justify-center">
              <div className={`flip-card w-full ${isFlipped ? "flipped" : ""}`}>
                <div className="flip-card-inner">
                  <div className="flip-card-front">
                    <div className="text-center space-y-4">
                      <div className="flex justify-center items-center gap-2 mb-6">
                        <Chip size="sm" variant="dot" color="primary">
                          Question
                        </Chip>
                        {currentCard.is_mastered && (
                          <Chip size="sm" color="success" variant="flat">
                            Mastered
                          </Chip>
                        )}
                      </div>
                      <p className="text-2xl font-medium leading-relaxed">
                        {currentCard.front}
                      </p>
                      <div className="flex items-center justify-center gap-2 text-default-500 mt-8">
                        <RotateCw size={16} />
                        <span className="text-sm">Click to reveal answer</span>
                      </div>
                    </div>
                  </div>
                  <div className="flip-card-back">
                    <div className="text-center space-y-4">
                      <div className="flex justify-center items-center gap-2 mb-6">
                        <Chip size="sm" variant="dot" color="secondary">
                          Answer
                        </Chip>
                        <Chip size="sm" variant="flat" color="default">
                          Level {currentCard.difficulty_level}/5
                        </Chip>
                      </div>
                      <p className="text-2xl font-medium leading-relaxed whitespace-pre-line">
                        {currentCard.back}
                      </p>
                      <div className="text-sm text-default-500 mt-8">
                        Reviewed {currentCard.review_count} times
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>

          <div className="flex justify-between items-center">
            <Button
              variant="light"
              onPress={handlePrevCard}
              isDisabled={currentCardIndex === 0}
              startContent={<ChevronLeft size={16} />}
            >
              Previous
            </Button>

            <div className="flex items-center gap-4">
              <span className="text-sm text-default-600">
                {currentCardIndex + 1} of {filteredCards.length}
              </span>
            </div>

            <Button
              variant="light"
              onPress={handleNextCard}
              isDisabled={currentCardIndex === filteredCards.length - 1}
              endContent={<ChevronRight size={16} />}
            >
              Next
            </Button>
          </div>

          {isFlipped && onMasterCard && (
            <div className="flex justify-center gap-4 flex-wrap">
              <Button
                color="danger"
                variant="flat"
                onPress={() => handleMasterCard(currentCard.id, false, 1)}
                startContent={<Target size={16} />}
              >
                Hard - Need Review
              </Button>
              <Button
                color="warning"
                variant="flat"
                onPress={() => handleMasterCard(currentCard.id, false, 3)}
                startContent={<Brain size={16} />}
              >
                Medium - OK
              </Button>
              <Button
                color="success"
                onPress={() => handleMasterCard(currentCard.id, true, 5)}
                startContent={<Target size={16} />}
              >
                Easy - Mastered!
              </Button>
            </div>
          )}

          <div className="text-center text-xs text-default-400">
            <p>
              💡 Use arrow keys to navigate • Space to flip • Enter to mark as
              mastered
            </p>
          </div>
        </div>
      ) : (
        <Card className="border border-default-200">
          <CardBody className="text-center py-16">
            <div className="space-y-4">
              <Brain size={48} className="mx-auto text-default-400" />
              <h3 className="text-lg font-medium">
                {reviewMode === "unmastered"
                  ? "All cards mastered!"
                  : "No cards in this deck yet"}
              </h3>
              <p className="text-default-600">
                {reviewMode === "unmastered"
                  ? "Great job! Try reviewing all cards or switch to random mode."
                  : "Add your first flashcard to start studying."}
              </p>
              {reviewMode !== "unmastered" && onAddCard && (
                <Button
                  color="primary"
                  onPress={handleAddCard}
                  startContent={<Plus size={16} />}
                >
                  Add First Card
                </Button>
              )}
            </div>
          </CardBody>
        </Card>
      )}

      <style jsx>{`
        .flip-card {
          background-color: transparent;
          perspective: 1000px;
          height: 300px;
        }

        .flip-card-inner {
          position: relative;
          width: 100%;
          height: 100%;
          text-align: center;
          transition: transform 0.6s;
          transform-style: preserve-3d;
        }

        .flip-card.flipped .flip-card-inner {
          transform: rotateY(180deg);
        }

        .flip-card-front,
        .flip-card-back {
          position: absolute;
          width: 100%;
          height: 100%;
          -webkit-backface-visibility: hidden;
          backface-visibility: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .flip-card-back {
          transform: rotateY(180deg);
        }
      `}</style>
    </div>
  );
};

export default FlashcardViewer;
