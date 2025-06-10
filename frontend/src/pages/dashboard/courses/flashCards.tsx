//@ts-nocheck

import React, { useState, useEffect } from "react";
import { Spinner } from "@heroui/react";
import { supabase } from "@/supabaseClient";
import FlashcardViewer from "../components/flashcardViewer";
import FlashcardDeckList from "../components/flashcardDeckList";
import { DeckFormData, Flashcard, FlashcardDeck } from "@/types";
import { GoogleGenAI } from "@google/genai";

const apiKey = "AIzaSyDouCzIB0-ZRJyLL38nhNsiXavYmNvJQkw";

// Initialize Google GenAI
const ai = new GoogleGenAI({
  apiKey,
});

const generateAIFlashcards = async (
  deckTitle: string,
  pdfText: string,
  cardCount: number
): Promise<Flashcard[]> => {
  try {
    const prompt = `You are an expert flashcard generator. Create ${cardCount} high-quality flashcards based on the following content.
    
Deck Title: ${deckTitle}
Content: ${pdfText || "General knowledge about " + deckTitle}

CRITICAL FORMATTING REQUIREMENTS:
1. Return ONLY a valid JSON array - no explanatory text before or after
2. Each flashcard object must have this EXACT structure:
{
  "front": "question or term here",
  "back": "answer or definition here"
}

3. Ensure proper JSON syntax - use double quotes, proper commas, no trailing commas
4. Questions should be specific and test understanding
5. Answers should be concise but complete
6. Cover key concepts from the content

Generate the JSON array now:`;

    // Use the same API pattern as the working function
    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: prompt,
    });

    // Access the text property directly like in the working function
    const text = response.text;

    // Check if text is defined and not empty
    if (!text || typeof text !== "string") {
      throw new Error("No text content received from AI service");
    }

    console.log("AI Response:", text); // Debug log

    // Clean and parse JSON using similar logic to the working function
    let jsonString = text.trim();

    // Remove any markdown formatting
    jsonString = jsonString.replace(/```json\n?/g, "").replace(/```\n?/g, "");

    // Find JSON array bounds
    const jsonStart = jsonString.indexOf("[");
    const jsonEnd = jsonString.lastIndexOf("]") + 1;

    if (jsonStart === -1 || jsonEnd === 0) {
      throw new Error("No valid JSON array found in AI response");
    }

    jsonString = jsonString.slice(jsonStart, jsonEnd);

    try {
      const parsedCards = JSON.parse(jsonString) as Flashcard[];

      // Validate that we have an array
      if (!Array.isArray(parsedCards)) {
        throw new Error(
          "Expected an array of flashcards but got something else."
        );
      }

      // Validate and format flashcards similar to the working function
      const validatedCards = parsedCards
        .map((card, index) => {
          // Ensure card has required properties
          if (!card || typeof card !== "object") {
            console.warn(`Card ${index} is not a valid object, skipping`);
            return null;
          }

          return {
            front: card.front || `Question ${index + 1}`,
            back: card.back || `Answer ${index + 1}`,
          };
        })
        .filter(
          (card) =>
            card !== null && card.front.trim() !== "" && card.back.trim() !== ""
        );

      if (validatedCards.length === 0) {
        throw new Error(
          "No valid flashcards were generated. Please try again."
        );
      }

      console.log("Successfully generated flashcards:", validatedCards);
      return validatedCards;
    } catch (parseError) {
      console.error("JSON parsing error:", parseError);
      console.error("Attempted to parse:", jsonString);
      throw new Error(
        "The AI returned an invalid JSON format. Please try again."
      );
    }
  } catch (error) {
    console.error("AI generation error:", error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Failed to generate flashcards. Please try again.");
  }
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
  const [error, setError] = useState<string | null>(null);

  const loadDecks = async () => {
    setLoading((prev) => ({ ...prev, decks: true }));
    setError(null);
    try {
      const { data, error } = await supabase
        .from("decks")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setDecks(data || []);
    } catch (err) {
      setError("Failed to load decks. Please try again.");
      console.error("Load decks error:", err);
    } finally {
      setLoading((prev) => ({ ...prev, decks: false }));
    }
  };

  const loadCards = async (deckId: string) => {
    setLoading((prev) => ({ ...prev, cards: true }));
    setError(null);
    try {
      const { data, error } = await supabase
        .from("cards")
        .select("*")
        .eq("deck_id", deckId);

      if (error) throw error;
      setCards(data || []);
    } catch (err) {
      setError("Failed to load cards. Please try again.");
      console.error("Load cards error:", err);
    } finally {
      setLoading((prev) => ({ ...prev, cards: false }));
    }
  };

  // Load decks on mount
  useEffect(() => {
    loadDecks();
  }, []);

  // Load cards when deck is selected
  useEffect(() => {
    if (currentDeck) {
      loadCards(currentDeck.id);
    }
  }, [currentDeck]);

  const handleCreateDeck = async (deckData: DeckFormData) => {
    try {
      setLoading((prev) => ({ ...prev, aiGenerating: true }));
      setError(null);

      // Verify authentication
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();
      if (authError) throw authError;
      if (!user) throw new Error("Not authenticated");

      // Generate AI flashcards first
      const aiCards = await generateAIFlashcards(
        deckData.title,
        deckData.pdfText || "",
        deckData.cardCount
      );

      console.log("Generated cards:", aiCards); // Debug log

      // Create the deck with accurate card count
      const { data: newDeck, error: deckError } = await supabase
        .from("decks")
        .insert({
          title: deckData.title,
          description: deckData.description,
          user_id: user.id,
          cards_count: aiCards.length,
          mastered_count: 0,
          course: "general", // Provide default if needed
        })
        .select()
        .single();

      if (deckError) {
        console.error("Deck creation error details:", deckError);
        throw deckError;
      }

      console.log("Created deck:", newDeck); // Debug log

      // Insert the generated cards
      const cardsToInsert = aiCards.map((card) => ({
        ...card,
        deck_id: newDeck.id,
        is_mastered: false,
        difficulty_level: 1,
        review_count: 0,
        created_at: new Date().toISOString(),
      }));

      console.log("Cards to insert:", cardsToInsert); // Debug log

      const { error: cardsError } = await supabase
        .from("cards")
        .insert(cardsToInsert);

      if (cardsError) {
        console.error("Cards insertion error details:", cardsError);
        throw cardsError;
      }

      // Update local state
      setDecks((prev) => [newDeck, ...prev]);
      setCurrentDeck(newDeck);
      setCards(cardsToInsert);

      return newDeck;
    } catch (err) {
      console.error("Full error details:", err);
      setError(err instanceof Error ? err.message : "Failed to create deck");
      throw err;
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
      setError(null);
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
        masteryChange = 1;
      } else if (!isMastered && wasAlreadyMastered) {
        masteryChange = -1;
      }

      // Update deck mastery count if changed
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

        // Update local state
        setCurrentDeck((prev) =>
          prev ? { ...prev, mastered_count: newMasteredCount } : null
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
    } catch (err) {
      setError("Failed to update card. Please try again.");
      console.error("Error updating card mastery:", err);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {loading.aiGenerating && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg text-center max-w-sm mx-4">
            <Spinner size="lg" className="mb-4" />
            <h3 className="text-lg font-semibold mb-2">Creating Your Deck</h3>
            <p className="text-gray-600">Generating AI-powered flashcards...</p>
          </div>
        </div>
      )}

      {currentDeck ? (
        <FlashcardViewer
          deck={currentDeck}
          cards={cards}
          loading={loading.cards}
          error={error}
          onBack={() => setCurrentDeck(null)}
          onMasterCard={handleMasterCard}
          onRefresh={() => currentDeck && loadCards(currentDeck.id)}
        />
      ) : (
        <FlashcardDeckList
          decks={decks}
          loading={loading.decks}
          error={error}
          onSelectDeck={setCurrentDeck}
          onCreateDeck={handleCreateDeck}
          onRefresh={loadDecks}
        />
      )}
    </div>
  );
};

export default Flashcards;
