//@ts-nocheck

import React, { useState, useEffect } from "react";
import {
  Spinner,
} from "@heroui/react";
import { supabase } from "@/supabaseClient";
import FlashcardViewer from "../components/flashcardViewer";
import FlashcardDeckList from "../components/flashcardDeckList";
import { CardFormData, DeckFormData, Flashcard, FlashcardDeck } from "@/types";

// Enhanced AI flashcard generation with course-specific content
const generateAIFlashcards = async (
  deckTitle: string,
  course: string,
  count = 5
) => {
  console.log(
    `Generating ${count} AI flashcards for: ${deckTitle} (${course})`
  );

  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 2000));

  // Course-specific question templates
  const questionTemplates = {
    "CSC 101": [
      {
        front: `What is a variable in ${deckTitle}?`,
        back: `A variable is a storage location with an associated name that contains data which can be modified during program execution.`,
      },
      {
        front: `Explain the concept of loops in ${deckTitle}`,
        back: `Loops are control structures that repeat a block of code multiple times based on a condition.`,
      },
      {
        front: `What is the difference between syntax and semantics?`,
        back: `Syntax refers to the rules of the language structure, while semantics refers to the meaning of the code.`,
      },
      {
        front: `Define algorithm in the context of ${deckTitle}`,
        back: `An algorithm is a step-by-step procedure for solving a problem or completing a task.`,
      },
      {
        front: `What is debugging?`,
        back: `Debugging is the process of finding and fixing errors or bugs in computer programs.`,
      },
    ],
    "CSC 201": [
      {
        front: `What is Big O notation in ${deckTitle}?`,
        back: `Big O notation describes the upper bound of time complexity, representing how algorithm performance scales with input size.`,
      },
      {
        front: `Explain the difference between Array and Linked List`,
        back: `Arrays have contiguous memory and O(1) access, while Linked Lists have dynamic memory and O(n) access but efficient insertion/deletion.`,
      },
      {
        front: `What is a Stack data structure?`,
        back: `A Stack is a LIFO (Last In, First Out) data structure where elements are added and removed from the same end (top).`,
      },
      {
        front: `Define Binary Search Tree`,
        back: `A BST is a tree where left child values are less than parent, and right child values are greater than parent.`,
      },
      {
        front: `What is the time complexity of Quick Sort?`,
        back: `Quick Sort has average case O(n log n) and worst case O(n²) time complexity.`,
      },
    ],
    "CSC 301": [
      {
        front: `What is normalization in ${deckTitle}?`,
        back: `Database normalization is the process of organizing data to reduce redundancy and improve data integrity.`,
      },
      {
        front: `Explain ACID properties`,
        back: `ACID stands for Atomicity, Consistency, Isolation, and Durability - key properties ensuring reliable database transactions.`,
      },
      {
        front: `What is a Primary Key?`,
        back: `A Primary Key is a unique identifier for each record in a database table, ensuring no duplicate rows.`,
      },
      {
        front: `Define SQL JOIN operations`,
        back: `JOINs combine rows from multiple tables based on related columns - INNER, LEFT, RIGHT, and FULL OUTER.`,
      },
      {
        front: `What is an Index in databases?`,
        back: `An Index is a data structure that improves query performance by creating shortcuts to data locations.`,
      },
    ],
    "CSC 305": [
      {
        front: `What is Machine Learning in ${deckTitle}?`,
        back: `Machine Learning is a subset of AI that enables systems to learn and improve from data without explicit programming.`,
      },
      {
        front: `Explain the difference between supervised and unsupervised learning`,
        back: `Supervised learning uses labeled data for training, while unsupervised learning finds patterns in unlabeled data.`,
      },
      {
        front: `What is a Neural Network?`,
        back: `A Neural Network is a computing system inspired by biological neural networks, consisting of interconnected nodes (neurons).`,
      },
      {
        front: `Define Natural Language Processing`,
        back: `NLP is a branch of AI that helps computers understand, interpret, and generate human language.`,
      },
      {
        front: `What is the Turing Test?`,
        back: `The Turing Test evaluates a machine's ability to exhibit intelligent behavior indistinguishable from a human.`,
      },
    ],
  };

  // Get templates for the specific course, or use generic ones
  const templates = questionTemplates[course] || questionTemplates["CSC 101"];

  // Generate flashcards with some randomization
  return templates.slice(0, count).map((template, i) => ({
    front: template.front,
    back: template.back,
    is_mastered: false,
    difficulty_level: Math.floor(Math.random() * 3) + 2, // Random difficulty 2-4
  }));
};

const Flashcards: React.FC = () => {
  const [decks, setDecks] = useState<FlashcardDeck[]>([]);
  const [currentDeck, setCurrentDeck] = useState<FlashcardDeck | null>(null);
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [loading, setLoading] = useState({
    decks: false,
    cards: false,
    aiGenerating: false,
  });
  const [cardForm, setCardForm] = useState<CardFormData>({
    front: "",
    back: "",
  });


  // Load decks on mount
  useEffect(() => {
    const loadDecks = async () => {
      setLoading((prev) => ({ ...prev, decks: true }));
      try {
        const { data, error } = await supabase
          .from("decks")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) throw error;
        setDecks(data || []);
      } finally {
        setLoading((prev) => ({ ...prev, decks: false }));
      }
    };
    loadDecks();
  }, []);

  // Load cards when deck is selected
  useEffect(() => {
    if (!currentDeck) return;

    const loadCards = async () => {
      setLoading((prev) => ({ ...prev, cards: true }));
      try {
        const { data, error } = await supabase
          .from("cards")
          .select("*")
          .eq("deck_id", currentDeck.id);

        if (error) throw error;
        setCards(data || []);
      } finally {
        setLoading((prev) => ({ ...prev, cards: false }));
      }
    };
    loadCards();
  }, [currentDeck]);

  const handleCreateDeck = async (deckData: DeckFormData) => {
    try {
      setLoading((prev) => ({ ...prev, aiGenerating: true }));

      // 1. Verify authentication
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // 2. Create the deck
      const { data: newDeck, error: deckError } = await supabase
        .from("decks")
        .insert([
          {
            ...deckData,
            user_id: user.id,
          },
        ])
        .select()
        .single();

      if (deckError) throw deckError;

      // 3. Generate AI flashcards
      const aiCards = await generateAIFlashcards(
        deckData.title,
        deckData.course,
        5
      );

      // 4. Insert the generated cards
      const cardsToInsert = aiCards.map((card) => ({
        ...card,
        deck_id: newDeck.id,
      }));

      const { error: cardsError } = await supabase
        .from("cards")
        .insert(cardsToInsert);

      if (cardsError) throw cardsError;

      // 5. Update deck with card count
      const { error: updateError } = await supabase
        .from("decks")
        .update({
          cards_count: aiCards.length,
          mastered_count: 0,
        })
        .eq("id", newDeck.id);

      if (updateError) throw updateError;

      // 6. Update local state
      const updatedDeck = {
        ...newDeck,
        cards_count: aiCards.length,
        mastered_count: 0,
      };

      setDecks((prev) => [updatedDeck, ...prev]);

      return updatedDeck;
    } catch (error) {
      console.error("Create deck error:", error);
      throw error;
    } finally {
      setLoading((prev) => ({ ...prev, aiGenerating: false }));
    }
  };

  const handleMasterCard = async (
    cardId: string,
    isMastered: boolean,
    difficulty?: number
  ) => {
    if (!currentDeck) return;

    try {
      // Get current card state
      const currentCard = cards.find((card) => card.id === cardId);
      if (!currentCard) return;

      const wasAlreadyMastered = currentCard.is_mastered;

      // Update the card
      const { error: cardError } = await supabase
        .from("cards")
        .update({
          is_mastered: isMastered,
          difficulty_level: difficulty || currentCard.difficulty_level,
          review_count: currentCard.review_count + 1,
          last_reviewed: new Date().toISOString(),
        })
        .eq("id", cardId);

      if (cardError) throw cardError;

      // Calculate mastery count change
      let masteryChange = 0;
      if (isMastered && !wasAlreadyMastered) {
        masteryChange = 1; // Card became mastered
      } else if (!isMastered && wasAlreadyMastered) {
        masteryChange = -1; // Card became unmastered
      }

      // Update deck mastery count only if there's a change
      if (masteryChange !== 0) {
        const newMasteredCount = Math.max(
          0,
          currentDeck.mastered_count + masteryChange
        );

        const { error: deckError } = await supabase
          .from("decks")
          .update({
            mastered_count: newMasteredCount,
            last_reviewed: new Date().toISOString(),
          })
          .eq("id", currentDeck.id);

        if (deckError) throw deckError;

        // Update local deck state
        setCurrentDeck((prev) =>
          prev
            ? {
                ...prev,
                mastered_count: newMasteredCount,
                last_reviewed: new Date().toISOString(),
              }
            : null
        );
      }

      // Update local cards state
      setCards((prev) =>
        prev.map((card) =>
          card.id === cardId
            ? {
                ...card,
                is_mastered: isMastered,
                difficulty_level: difficulty || card.difficulty_level,
                review_count: card.review_count + 1,
                last_reviewed: new Date().toISOString(),
              }
            : card
        )
      );
    } catch (error) {
      console.error("Error updating card mastery:", error);
      // You might want to show a toast or error message to the user here
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {loading.aiGenerating && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg text-center max-w-sm mx-4">
            <Spinner size="lg" className="mb-4" />
            <h3 className="text-lg font-semibold mb-2">Creating Your Deck</h3>
            <p className="text-gray-600">
              Generating 5 AI-powered flashcards...
            </p>
            <div className="mt-4 text-sm text-gray-500">
              This usually takes a few seconds
            </div>
          </div>
        </div>
      )}

      {currentDeck ? (
        <FlashcardViewer
          deck={currentDeck}
          cards={cards}
          loading={loading.cards}
          onBack={() => setCurrentDeck(null)}
          onMasterCard={handleMasterCard}
          onAddCard={() => {
            setCardForm({ front: "", back: "" });
          }}
        />
      ) : (
        <FlashcardDeckList
          decks={decks}
          loading={loading.decks}
          onSelectDeck={setCurrentDeck}
          onCreateDeck={handleCreateDeck}
        />
      )}
    </div>
  );
};

export default Flashcards;