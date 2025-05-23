import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Bookmark,
  Plus,
  RotateCw,
  Trash2,
  Edit,
  ChevronRight,
  ChevronLeft,
  Brain,
  Target,
} from "lucide-react";
import {
  Card,
  CardBody,
  Button,
  Input,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Select,
  SelectItem,
  Chip,
  Divider,
  Progress,
  Spinner,
  Textarea,
  Tooltip,
} from "@heroui/react";
import { supabase } from "@/supabaseClient";

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
  difficulty_level: number; // 1-5 scale
  review_count: number;
  last_reviewed: string;
  created_at: string;
}

interface DeckFormData {
  title: string;
  course: string;
  description: string;
}

interface CardFormData {
  front: string;
  back: string;
}

interface LoadingState {
  decks: boolean;
  cards: boolean;
  creating: boolean;
  updating: boolean;
}

const Flashcards = () => {
  // State for decks and cards
  const [decks, setDecks] = useState<FlashcardDeck[]>([]);
  const [currentDeck, setCurrentDeck] = useState<FlashcardDeck | null>(null);
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [reviewMode, setReviewMode] = useState<'all' | 'unmastered' | 'random'>('all');

  // Loading states
  const [loading, setLoading] = useState<LoadingState>({
    decks: true,
    cards: false,
    creating: false,
    updating: false,
  });
  const [error, setError] = useState<string | null>(null);

  // Modal states
  const {
    isOpen: isDeckModalOpen,
    onOpen: onDeckModalOpen,
    onClose: onDeckModalClose,
  } = useDisclosure();
  const {
    isOpen: isCardModalOpen,
    onOpen: onCardModalOpen,
    onClose: onCardModalClose,
  } = useDisclosure();
  const {
    isOpen: isEditCardModalOpen,
    onOpen: onEditCardModalOpen,
    onClose: onEditCardModalClose,
  } = useDisclosure();

  // Form states
  const [deckForm, setDeckForm] = useState<DeckFormData>({
    title: "",
    course: "CSC 101",
    description: "",
  });
  const [cardForm, setCardForm] = useState<CardFormData>({
    front: "",
    back: "",
  });
  const [editingCard, setEditingCard] = useState<Flashcard | null>(null);

  // Available courses - optimized as constant
  const courses = useMemo(() => [
    { key: "CSC 101", label: "CSC 101: Introduction to Programming" },
    { key: "CSC 201", label: "CSC 201: Data Structures & Algorithms" },
    { key: "CSC 301", label: "CSC 301: Database Systems" },
    { key: "CSC 305", label: "CSC 305: Artificial Intelligence" },
  ], []);

  // Memoized filtered cards based on review mode
  const filteredCards = useMemo(() => {
    switch (reviewMode) {
      case 'unmastered':
        return cards.filter(card => !card.is_mastered);
      case 'random':
        return [...cards].sort(() => Math.random() - 0.5);
      default:
        return cards;
    }
  }, [cards, reviewMode]);

  // Memoized current card
  const currentCard = useMemo(() => {
    return filteredCards[currentCardIndex] || null;
  }, [filteredCards, currentCardIndex]);

  // Fetch all flashcard decks with optimized query
  const fetchDecks = useCallback(async () => {
    try {
      setLoading(prev => ({ ...prev, decks: true }));
      setError(null);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("flashcard_decks")
        .select("*")
        .eq("user_id", user.id)
        .order("last_reviewed", { ascending: false, nullsLast: true })
        .order("created_at", { ascending: false });

      if (error) throw error;
      setDecks(data || []);
    } catch (error) {
      console.error("Error fetching decks:", error);
      setError("Failed to load flashcard decks");
    } finally {
      setLoading(prev => ({ ...prev, decks: false }));
    }
  }, []);

  // Fetch cards for a specific deck with enhanced data
  const fetchCards = useCallback(async (deckId: string) => {
    try {
      setLoading(prev => ({ ...prev, cards: true }));
      setError(null);

      const { data, error } = await supabase
        .from("flashcards")
        .select("*")
        .eq("deck_id", deckId)
        .order("created_at", { ascending: true });

      if (error) throw error;
      
      const cardsData = data || [];
      setCards(cardsData);
      setCurrentCardIndex(0);
      setIsFlipped(false);
      
      // Update deck's last_reviewed timestamp
      if (cardsData.length > 0) {
        await supabase
          .from("flashcard_decks")
          .update({ last_reviewed: new Date().toISOString() })
          .eq("id", deckId);
      }
    } catch (error) {
      console.error("Error fetching cards:", error);
      setError("Failed to load flashcards");
    } finally {
      setLoading(prev => ({ ...prev, cards: false }));
    }
  }, []);

  // Load decks on component mount
  useEffect(() => {
    fetchDecks();
  }, [fetchDecks]);

  // Handle deck selection
  const handleSelectDeck = useCallback((deck: FlashcardDeck) => {
    setCurrentDeck(deck);
    fetchCards(deck.id);
    setReviewMode('all');
  }, [fetchCards]);

  // Handle creating a new deck with validation
  const handleCreateDeck = useCallback(async () => {
    if (!deckForm.title.trim()) {
      setError("Please enter a title for the deck");
      return;
    }

    try {
      setLoading(prev => ({ ...prev, creating: true }));
      setError(null);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("flashcard_decks")
        .insert([
          {
            title: deckForm.title.trim(),
            course: deckForm.course,
            description: deckForm.description.trim(),
            cards_count: 0,
            mastered_count: 0,
            user_id: user.id,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      setDecks(prev => [data, ...prev]);
      onDeckModalClose();
      resetDeckForm();
    } catch (error) {
      console.error("Error creating deck:", error);
      setError("Failed to create flashcard deck");
    } finally {
      setLoading(prev => ({ ...prev, creating: false }));
    }
  }, [deckForm, onDeckModalClose]);

  // Handle creating a new card with enhanced features
  const handleCreateCard = useCallback(async () => {
    if (!currentDeck || !cardForm.front.trim() || !cardForm.back.trim()) {
      setError("Please fill both front and back of the card");
      return;
    }

    try {
      setLoading(prev => ({ ...prev, creating: true }));
      setError(null);

      const { data, error } = await supabase
        .from("flashcards")
        .insert([
          {
            deck_id: currentDeck.id,
            front: cardForm.front.trim(),
            back: cardForm.back.trim(),
            is_mastered: false,
            difficulty_level: 3, // Default medium difficulty
            review_count: 0,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      // Update deck's card count using RPC for consistency
      const { error: updateError } = await supabase.rpc('update_deck_stats', {
        deck_id: currentDeck.id,
        cards_increment: 1,
        mastered_increment: 0
      });

      if (updateError) {
        console.warn("Failed to update deck stats:", updateError);
        // Fallback to direct update
        await supabase
          .from("flashcard_decks")
          .update({ cards_count: currentDeck.cards_count + 1 })
          .eq("id", currentDeck.id);
      }

      // Update local state
      setCards(prev => [...prev, data]);
      setCurrentDeck(prev => prev ? {
        ...prev,
        cards_count: prev.cards_count + 1,
      } : null);

      onCardModalClose();
      resetCardForm();
    } catch (error) {
      console.error("Error creating card:", error);
      setError("Failed to create flashcard");
    } finally {
      setLoading(prev => ({ ...prev, creating: false }));
    }
  }, [currentDeck, cardForm, onCardModalClose]);

  // Handle editing an existing card
  const handleEditCard = useCallback(async () => {
    if (!editingCard || !cardForm.front.trim() || !cardForm.back.trim()) {
      setError("Please fill both front and back of the card");
      return;
    }

    try {
      setLoading(prev => ({ ...prev, updating: true }));
      setError(null);

      const { error } = await supabase
        .from("flashcards")
        .update({
          front: cardForm.front.trim(),
          back: cardForm.back.trim(),
        })
        .eq("id", editingCard.id);

      if (error) throw error;

      // Update local state
      setCards(prev => prev.map(card => 
        card.id === editingCard.id 
          ? { ...card, front: cardForm.front.trim(), back: cardForm.back.trim() }
          : card
      ));

      onEditCardModalClose();
      setEditingCard(null);
      resetCardForm();
    } catch (error) {
      console.error("Error updating card:", error);
      setError("Failed to update flashcard");
    } finally {
      setLoading(prev => ({ ...prev, updating: false }));
    }
  }, [editingCard, cardForm, onEditCardModalClose]);

  // Handle deleting a card
  const handleDeleteCard = useCallback(async (cardId: string) => {
    if (!currentDeck || !confirm("Are you sure you want to delete this card?")) return;

    try {
      setLoading(prev => ({ ...prev, updating: true }));
      
      const cardToDelete = cards.find(c => c.id === cardId);
      if (!cardToDelete) return;

      const { error } = await supabase
        .from("flashcards")
        .delete()
        .eq("id", cardId);

      if (error) throw error;

      // Update deck stats
      const masteredDecrement = cardToDelete.is_mastered ? 1 : 0;
      await supabase.rpc('update_deck_stats', {
        deck_id: currentDeck.id,
        cards_increment: -1,
        mastered_increment: -masteredDecrement
      });

      // Update local state
      const newCards = cards.filter(c => c.id !== cardId);
      setCards(newCards);
      setCurrentDeck(prev => prev ? {
        ...prev,
        cards_count: prev.cards_count - 1,
        mastered_count: prev.mastered_count - masteredDecrement,
      } : null);

      // Adjust current card index if necessary
      if (currentCardIndex >= newCards.length && newCards.length > 0) {
        setCurrentCardIndex(newCards.length - 1);
      }
    } catch (error) {
      console.error("Error deleting card:", error);
      setError("Failed to delete card");
    } finally {
      setLoading(prev => ({ ...prev, updating: false }));
    }
  }, [currentDeck, cards, currentCardIndex]);

  // Handle marking card as mastered with difficulty tracking
  const handleMasterCard = useCallback(async (cardId: string, isMastered: boolean, difficultyRating?: number) => {
    if (!currentDeck) return;

    try {
      setLoading(prev => ({ ...prev, updating: true }));

      const updateData: Partial<Flashcard> = {
        is_mastered: isMastered,
        last_reviewed: new Date().toISOString(),
        review_count: (cards.find(c => c.id === cardId)?.review_count || 0) + 1,
      };

      if (difficultyRating) {
        updateData.difficulty_level = difficultyRating;
      }

      const { error: cardError } = await supabase
        .from("flashcards")
        .update(updateData)
        .eq("id", cardId);

      if (cardError) throw cardError;

      // Update deck's mastered count and last reviewed
      const masteredChange = isMastered ? 1 : -1;
      await supabase.rpc('update_deck_stats', {
        deck_id: currentDeck.id,
        cards_increment: 0,
        mastered_increment: masteredChange
      });

      // Update local state
      setCards(prev => prev.map(card => 
        card.id === cardId 
          ? { ...card, ...updateData } as Flashcard
          : card
      ));
      
      setCurrentDeck(prev => prev ? {
        ...prev,
        mastered_count: Math.max(0, prev.mastered_count + masteredChange),
        last_reviewed: new Date().toISOString(),
      } : null);

    } catch (error) {
      console.error("Error updating card mastery:", error);
      setError("Failed to update card status");
    } finally {
      setLoading(prev => ({ ...prev, updating: false }));
    }
  }, [currentDeck, cards]);

  // Navigation between cards with bounds checking
  const handleNextCard = useCallback(() => {
    if (currentCardIndex < filteredCards.length - 1) {
      setCurrentCardIndex(prev => prev + 1);
      setIsFlipped(false);
    }
  }, [currentCardIndex, filteredCards.length]);

  const handlePrevCard = useCallback(() => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex(prev => prev - 1);
      setIsFlipped(false);
    }
  }, [currentCardIndex]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (!currentDeck || !currentCard) return;

      switch (event.key) {
        case 'ArrowLeft':
          event.preventDefault();
          handlePrevCard();
          break;
        case 'ArrowRight':
          event.preventDefault();
          handleNextCard();
          break;
        case ' ':
          event.preventDefault();
          setIsFlipped(prev => !prev);
          break;
        case 'Enter':
          event.preventDefault();
          if (isFlipped) {
            handleMasterCard(currentCard.id, !currentCard.is_mastered);
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentDeck, currentCard, isFlipped, handleNextCard, handlePrevCard, handleMasterCard]);

  // Reset forms
  const resetDeckForm = useCallback(() => {
    setDeckForm({
      title: "",
      course: "CSC 101",
      description: "",
    });
  }, []);

  const resetCardForm = useCallback(() => {
    setCardForm({
      front: "",
      back: "",
    });
  }, []);

  // Format date
  const formatDate = useCallback((dateString: string) => {
    return new Date(dateString).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }, []);

  // Calculate mastery percentage
  const masteryPercentage = useMemo(() => {
    if (!currentDeck || currentDeck.cards_count === 0) return 0;
    return Math.round((currentDeck.mastered_count / currentDeck.cards_count) * 100);
  }, [currentDeck]);

  // Handle opening edit modal
  const openEditModal = useCallback((card: Flashcard) => {
    setEditingCard(card);
    setCardForm({
      front: card.front,
      back: card.back,
    });
    onEditCardModalOpen();
  }, [onEditCardModalOpen]);

  if (loading.decks && decks.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="lg" label="Loading flashcard decks..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Bookmark className="text-purple-500" size={24} />
          Flashcard Decks
        </h2>
        <Button 
          color="primary" 
          size="md" 
          onPress={onDeckModalOpen}
          startContent={<Plus size={16} />}
        >
          Create Deck
        </Button>
      </div>

      {/* Error Display */}
      {error && !loading.decks && (
        <div className="bg-danger-50 border border-danger-200 text-danger-700 px-4 py-3 rounded-lg flex items-center justify-between">
          <span>{error}</span>
          <Button
            size="sm"
            color="danger"
            variant="flat"
            onPress={() => {
              setError(null);
              if (currentDeck) {
                fetchCards(currentDeck.id);
              } else {
                fetchDecks();
              }
            }}
          >
            Retry
          </Button>
        </div>
      )}

      {/* Main Content */}
      {!currentDeck ? (
        /* Deck List View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {decks.map((deck) => {
            const deckMastery = deck.cards_count > 0 
              ? Math.round((deck.mastered_count / deck.cards_count) * 100) 
              : 0;
            
            return (
              <Card
                key={deck.id}
                className="border border-default-200 hover:shadow-lg transition-all duration-200 cursor-pointer hover:scale-105"
                isPressable
                onPress={() => handleSelectDeck(deck)}
              >
                <CardBody className="p-6">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-semibold text-lg line-clamp-2">{deck.title}</h3>
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
                          : "Never reviewed"
                        }
                      </span>
                      <div className="flex items-center gap-1">
                        <Brain size={14} className="text-secondary" />
                        <span className="text-xs font-medium">{deck.cards_count}</span>
                      </div>
                    </div>
                  </div>
                </CardBody>
              </Card>
            );
          })}
        </div>
      ) : (
        /* Card Review View */
        <div className="space-y-6">
          {/* Deck Header with Controls */}
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
            <div className="flex items-center gap-4">
              <Button
                variant="light"
                onPress={() => {
                  setCurrentDeck(null);
                  setCards([]);
                  setCurrentCardIndex(0);
                }}
                startContent={<ChevronLeft size={16} />}
              >
                Back to Decks
              </Button>
              <div className="hidden sm:block">
                <h3 className="font-semibold text-lg">{currentDeck.title}</h3>
                <p className="text-sm text-default-600">{currentDeck.course}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <Select
                size="sm"
                value={reviewMode}
                onChange={(e) => {
                  setReviewMode(e.target.value as typeof reviewMode);
                  setCurrentCardIndex(0);
                  setIsFlipped(false);
                }}
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
                  {currentDeck.mastered_count}/{currentDeck.cards_count}
                </span>
              </div>
            </div>
          </div>

          {/* Card Display Area */}
          {loading.cards ? (
            <div className="flex justify-center items-center h-96">
              <Spinner size="lg" label="Loading flashcards..." />
            </div>
          ) : filteredCards.length > 0 && currentCard ? (
            <div className="space-y-6">
              {/* Flashcard */}
              <Card
                className="border border-default-200 min-h-96 cursor-pointer transition-transform hover:scale-[1.02]"
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
                          <p className="text-2xl font-medium leading-relaxed">
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

              {/* Card Navigation */}
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
                  <div className="flex gap-1">
                    <Tooltip content="Edit Card">
                      <Button
                        size="sm"
                        variant="light"
                        isIconOnly
                        onPress={() => openEditModal(currentCard)}
                      >
                        <Edit size={16} />
                      </Button>
                    </Tooltip>
                    <Tooltip content="Delete Card">
                      <Button
                        size="sm"
                        variant="light"
                        color="danger"
                        isIconOnly
                        onPress={() => handleDeleteCard(currentCard.id)}
                        isLoading={loading.updating}
                      >
                        <Trash2 size={16} />
                      </Button>
                    </Tooltip>
                  </div>
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

              {/* Mastery Controls */}
              {isFlipped && (
                <div className="flex justify-center gap-4 flex-wrap">
                  <Button
                    color="danger"
                    variant="flat"
                    onPress={() => handleMasterCard(currentCard.id, false, 1)}
                    isDisabled={!currentCard.is_mastered}
                    isLoading={loading.updating}
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
                    isLoading={loading.updating}
                    startContent={<Target size={16} />}
                  >
                    Easy - Mastered!
                  </Button>
                </div>
              )}

              {/* Keyboard Shortcuts Hint */}
              <div className="text-center text-xs text-default-400">
                <p>💡 Use arrow keys to navigate • Space to flip • Enter to mark as mastered</p>
              </div>
            </div>
          ) : (
            <Card className="border border-default-200">
              <CardBody className="text-center py-16">
                <div className="space-y-4">
                  <Brain size={48} className="mx-auto text-default-400" />
                  <h3 className="text-lg font-medium">
                    {reviewMode === 'unmastered' ? 'All cards mastered!' : 'No cards in this deck yet'}
                  </h3>
                  <p className="text-default-600">
                    {reviewMode === 'unmastered' 
                      ? 'Great job! Try reviewing all cards or switch to random mode.'
                      : 'Add your first flashcard to start studying.'
                    }
                  </p>
                  {reviewMode !== 'unmastered' && (
                    <Button 
                      color="primary" 
                      onPress={onCardModalOpen}
                      startContent={<Plus size={16} />}
                    >                      Add First Card
                    </Button>
                  )}
                </div>
              </CardBody>
            </Card>
          )}

          {/* Add Card Button */}
          <div className="flex justify-end">
            <Button
              color="primary"
              onPress={onCardModalOpen}
              startContent={<Plus size={16} />}
            >
              Add Card
            </Button>
          </div>
        </div>
      )}

      {/* Create Deck Modal */}
      <Modal isOpen={isDeckModalOpen} onClose={onDeckModalClose}>
        <ModalContent>
          <ModalHeader className="text-lg font-semibold">Create Flashcard Deck</ModalHeader>
          <ModalBody>
            {error && <div className="text-danger-500 mb-4 text-sm">{error}</div>}
            <div className="space-y-4">
              <Input
                label="Title"
                value={deckForm.title}
                onChange={(e) =>
                  setDeckForm({ ...deckForm, title: e.target.value })
                }
                placeholder="e.g. Data Structures Terms"
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
                  <SelectItem key={course.key} value={course.key}>
                    {course.label}
                  </SelectItem>
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
            <Button variant="light" onPress={onDeckModalClose}>
              Cancel
            </Button>
            <Button
              color="primary"
              onPress={handleCreateDeck}
              isDisabled={!deckForm.title.trim()}
              isLoading={loading.creating}
            >
              Create Deck
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Create Card Modal */}
      <Modal isOpen={isCardModalOpen} onClose={onCardModalClose}>
        <ModalContent>
          <ModalHeader className="text-lg font-semibold">Add Flashcard</ModalHeader>
          <ModalBody>
            {error && <div className="text-danger-500 mb-4 text-sm">{error}</div>}
            <div className="space-y-4">
              <Textarea
                label="Front"
                value={cardForm.front}
                onChange={(e) =>
                  setCardForm({ ...cardForm, front: e.target.value })
                }
                placeholder="Question or term"
                isRequired
                minRows={3}
              />
              <Textarea
                label="Back"
                value={cardForm.back}
                onChange={(e) =>
                  setCardForm({ ...cardForm, back: e.target.value })
                }
                placeholder="Answer or definition"
                isRequired
                minRows={3}
              />
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={onCardModalClose}>
              Cancel
            </Button>
            <Button
              color="primary"
              onPress={handleCreateCard}
              isDisabled={!cardForm.front.trim() || !cardForm.back.trim()}
              isLoading={loading.creating}
            >
              Add Card
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Edit Card Modal */}
      <Modal isOpen={isEditCardModalOpen} onClose={onEditCardModalClose}>
        <ModalContent>
          <ModalHeader className="text-lg font-semibold">Edit Flashcard</ModalHeader>
          <ModalBody>
            {error && <div className="text-danger-500 mb-4 text-sm">{error}</div>}
            <div className="space-y-4">
              <Textarea
                label="Front"
                value={cardForm.front}
                onChange={(e) =>
                  setCardForm({ ...cardForm, front: e.target.value })
                }
                placeholder="Question or term"
                isRequired
                minRows={3}
              />
              <Textarea
                label="Back"
                value={cardForm.back}
                onChange={(e) =>
                  setCardForm({ ...cardForm, back: e.target.value })
                }
                placeholder="Answer or definition"
                isRequired
                minRows={3}
              />
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={onEditCardModalClose}>
              Cancel
            </Button>
            <Button
              color="primary"
              onPress={handleEditCard}
              isDisabled={!cardForm.front.trim() || !cardForm.back.trim()}
              isLoading={loading.updating}
            >
              Save Changes
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
};

export default Flashcards;