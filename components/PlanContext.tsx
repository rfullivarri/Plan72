"use client";

import { ReactNode, createContext, useContext, useEffect, useMemo, useState } from "react";

import { defaultCityTemplate } from "@/lib/cityTemplates";
import { generatePlan } from "@/lib/planEngine";
import { PlanInput, PlanLevel, PlanOutput, ScenarioCode } from "@/lib/schema";

type PlanContextValue = {
  input: PlanInput;
  plan: PlanOutput;
  isRegenerating: boolean;
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

export function PlanProvider({ children }: { children: ReactNode }) {
  const [input, setInput] = useState<PlanInput>(defaultCityTemplate);
  const [plan, setPlan] = useState<PlanOutput>(() => generatePlan(defaultCityTemplate));
  const [isRegenerating, setIsRegenerating] = useState(false);

  useEffect(() => {
    setIsRegenerating(true);
    const handle = setTimeout(() => {
      setPlan(generatePlan(input));
      setIsRegenerating(false);
    }, 350);

    return () => clearTimeout(handle);
  }, [input]);

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

  const value = useMemo(
    () => ({
      input,
      plan,
      isRegenerating,
      updateInput,
      updatePreference,
      addResourceNode,
      updateResourceNode,
      removeResourceNode,
    }),
    [input, plan, isRegenerating],
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
