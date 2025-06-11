// utils/activityTracker.ts
import { supabase } from "@/supabaseClient";

export const trackUserActivity = async (
  minutes: number,
  questions: number,
  points: number
) => {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const today = new Date().toISOString().split("T")[0];

    const { data, error } = await supabase.from("user_activity").upsert(
      {
        user_id: user.id,
        date: today,
        minutes_active: minutes,
        questions_answered: questions,
        points_earned: points,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: "user_id,date",
      }
    );

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error tracking activity:", error);
  }
};
