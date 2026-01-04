"use client";

import { ReactNode, createContext, useContext, useEffect, useMemo, useState } from "react";

import { defaultCityTemplate } from "@/lib/cityTemplates";
import { generatePlan } from "@/lib/planEngine";
import { PlanInput, PlanLevel, PlanOutput, ScenarioCode } from "@/lib/schema";

type PlanContextValue = {
  input: PlanInput;
  plan: PlanOutput;
  isRegenerating: boolean;
  lowInkMode: boolean;
  toggleLowInkMode: () => void;
  lastSavedAt: string | null;
  persistProfile: () => void;
  updateInput: <K extends keyof PlanInput>(key: K, value: PlanInput[K]) => void;
  updatePreference: (key: keyof PlanInput["preferences"], value: boolean) => void;
  addResourceNode: (node: Omit<PlanInput["resourceNodes"][number], "id">) => void;
  updateResourceNode: (
    id: string,
    update: Partial<Omit<PlanInput["resourceNodes"][number], "id">>,
  ) => void;
  removeResourceNode: (id: string) => void;
};

const PlanContext = createContext<PlanContextValue | undefined>(undefined);

const STORAGE_KEY = "plan72:last-profile";
const LOW_INK_KEY = "plan72:low-ink";

export function PlanProvider({ children }: { children: ReactNode }) {
  const [input, setInput] = useState<PlanInput>(defaultCityTemplate);
  const [plan, setPlan] = useState<PlanOutput>(() => generatePlan(defaultCityTemplate));
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [lowInkMode, setLowInkMode] = useState(false);
  const [hasHydrated, setHasHydrated] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);

  useEffect(() => {
    const savedProfile = typeof window !== "undefined" ? window.localStorage.getItem(STORAGE_KEY) : null;
    if (savedProfile) {
      try {
        const parsed = JSON.parse(savedProfile) as { input: PlanInput; savedAt?: string };
        setInput(parsed.input);
        setPlan(generatePlan(parsed.input));
        setLastSavedAt(parsed.savedAt ?? null);
      } catch (error) {
        console.warn("Failed to parse saved Plan72 profile", error);
      }
    }

    const savedLowInk = typeof window !== "undefined" ? window.localStorage.getItem(LOW_INK_KEY) : null;
    if (savedLowInk) {
      setLowInkMode(savedLowInk === "on");
    }

    setHasHydrated(true);
  }, []);

  useEffect(() => {
    if (typeof document === "undefined") return;
    document.body.dataset.lowInk = lowInkMode ? "on" : "off";

    try {
      localStorage.setItem(LOW_INK_KEY, lowInkMode ? "on" : "off");
    } catch (error) {
      console.warn("Low ink preference could not be saved", error);
    }
  }, [lowInkMode]);

  useEffect(() => {
    if (!hasHydrated) return;
    setIsRegenerating(true);
    const handle = setTimeout(() => {
      const nextPlan = generatePlan(input);
      setPlan(nextPlan);
      const savedAt = new Date().toISOString();
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ input, savedAt }));
        setLastSavedAt(savedAt);
      } catch (error) {
        console.warn("Plan72 profile could not be persisted", error);
      }
      setIsRegenerating(false);
    }, 350);

    return () => clearTimeout(handle);
  }, [input, hasHydrated]);

  const updateInput = <K extends keyof PlanInput>(key: K, value: PlanInput[K]) => {
    setInput((prev) => ({ ...prev, [key]: value }));
  };

  const updatePreference = (key: keyof PlanInput["preferences"], value: boolean) => {
    setInput((prev) => ({
      ...prev,
      preferences: { ...prev.preferences, [key]: value },
    }));
  };

  const addResourceNode = (node: Omit<PlanInput["resourceNodes"][number], "id">) => {
    const id = crypto.randomUUID ? crypto.randomUUID() : `N-${Date.now()}`;
    setInput((prev) => ({
      ...prev,
      resourceNodes: [...prev.resourceNodes, { ...node, id }],
    }));
  };

  const updateResourceNode = (
    id: string,
    update: Partial<Omit<PlanInput["resourceNodes"][number], "id">>,
  ) => {
    setInput((prev) => ({
      ...prev,
      resourceNodes: prev.resourceNodes.map((node) =>
        node.id === id ? { ...node, ...update } : node,
      ),
    }));
  };

  const removeResourceNode = (id: string) => {
    setInput((prev) => ({
      ...prev,
      resourceNodes: prev.resourceNodes.filter((node) => node.id !== id),
    }));
  };

  const toggleLowInkMode = () => setLowInkMode((prev) => !prev);

  const persistProfile = () => {
    const savedAt = new Date().toISOString();
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ input, savedAt }));
      setLastSavedAt(savedAt);
    } catch (error) {
      console.warn("Manual profile save failed", error);
    }
  };

  const value = useMemo(
    () => ({
      input,
      plan,
      isRegenerating,
      lowInkMode,
      toggleLowInkMode,
      lastSavedAt,
      persistProfile,
      updateInput,
      updatePreference,
      addResourceNode,
      updateResourceNode,
      removeResourceNode,
    }),
    [input, plan, isRegenerating, lowInkMode, lastSavedAt],
  );

  return <PlanContext.Provider value={value}>{children}</PlanContext.Provider>;
}

export function usePlan() {
  const ctx = useContext(PlanContext);
  if (!ctx) {
    throw new Error("usePlan must be used within a PlanProvider");
  }
  return ctx;
}

export function humanizeScenario(scenario: ScenarioCode) {
  const map: Record<ScenarioCode, string> = {
    AIR: "Air",
    NUK: "Nuclear",
    CIV: "Civil",
    EQK: "Quake",
    UNK: "Unknown",
  };
  return map[scenario];
}

export function humanizeLevel(level: PlanLevel) {
  const map: Record<PlanLevel, string> = {
    BASIC: "Basic",
    STANDARD: "Standard",
    ADVANCED: "Advanced",
  };
  return map[level];
}
