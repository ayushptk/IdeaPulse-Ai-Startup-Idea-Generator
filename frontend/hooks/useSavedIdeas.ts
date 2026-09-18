"use client";

import { useState, useCallback, useEffect } from "react";
import { useSession } from "next-auth/react";

export interface SavedIdea {
  id?: number | string;
  platform?: string;
  problem?: string;
  users?: string;
  idea?: string;
  features?: string[];
  core_features?: string[];
  monetization?: string;
  score?: number;
  created_at?: string;
  savedAt?: string;
  idea_name?: string;
  solution?: string;
  target_customer?: string;
  why_this_will_work?: string;
  monetization_model?: string;
  competitor_gap?: string;
  [key: string]: unknown;
}

const getIdeaKey = (idea: SavedIdea): string =>
  idea.id ? String(idea.id) : encodeURIComponent(idea.problem?.slice(0, 60) || "unknown");

export function useSavedIdeas() {
  const { data: session, status } = useSession();
  const [savedIdeas, setSavedIdeas] = useState<SavedIdea[]>([]);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);

  const fetchSavedIdeas = useCallback(async () => {
    if (status !== "authenticated") return;
    setIsLoading(true);
    try {
      const res = await fetch("/api/saved-ideas");
      if (res.ok) {
        const data: SavedIdea[] = await res.json();
        setSavedIdeas(data);
        setSavedIds(new Set(data.map(getIdeaKey)));
      }
    } catch (e) {
      console.error("Failed to fetch saved ideas", e);
    } finally {
      setIsLoading(false);
    }
  }, [status]);

  useEffect(() => {
    if (status === "authenticated") {
      fetchSavedIdeas();
    } else {
      setSavedIdeas([]);
      setSavedIds(new Set());
    }
  }, [status, fetchSavedIdeas]);

  const saveIdea = useCallback(async (idea: SavedIdea) => {
    if (status !== "authenticated") {
      alert("Please log in to save ideas.");
      return;
    }
    const key = getIdeaKey(idea);
    
    // Optimistic update
    setSavedIdeas((prev) => {
      if (prev.some((s) => getIdeaKey(s) === key)) return prev;
      return [{ ...idea, savedAt: new Date().toISOString() }, ...prev];
    });
    setSavedIds((prev) => {
      const next = new Set(prev);
      next.add(key);
      return next;
    });

    try {
      const res = await fetch("/api/saved-ideas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idea_key: key,
          idea_data: idea,
        }),
      });
      if (!res.ok) throw new Error("Failed to save");
    } catch (e) {
      // Revert optimistic update
      setSavedIdeas((prev) => prev.filter((s) => getIdeaKey(s) !== key));
      setSavedIds((prev) => {
        const next = new Set(prev);
        next.delete(key);
        return next;
      });
    }
  }, [status]);

  const unsaveIdea = useCallback(async (idea: SavedIdea) => {
    if (status !== "authenticated") return;
    const key = getIdeaKey(idea);
    
    // Optimistic update
    const previousIdeas = savedIdeas;
    const previousIds = savedIds;
    
    setSavedIdeas((prev) => prev.filter((s) => getIdeaKey(s) !== key));
    setSavedIds((prev) => {
      const next = new Set(prev);
      next.delete(key);
      return next;
    });

    try {
      const res = await fetch("/api/saved-ideas", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idea_key: key }),
      });
      if (!res.ok) throw new Error("Failed to unsave");
    } catch (e) {
      // Revert optimistic update
      setSavedIdeas(previousIdeas);
      setSavedIds(previousIds);
    }
  }, [status, savedIdeas, savedIds]);

  const toggleSave = useCallback(
    (idea: SavedIdea) => {
      const key = getIdeaKey(idea);
      if (savedIds.has(key)) {
        unsaveIdea(idea);
      } else {
        saveIdea(idea);
      }
    },
    [savedIds, saveIdea, unsaveIdea]
  );

  const isSaved = useCallback(
    (idea: SavedIdea) => savedIds.has(getIdeaKey(idea)),
    [savedIds]
  );

  return { savedIdeas, savedIds, saveIdea, unsaveIdea, toggleSave, isSaved, isLoading };
}
