"use client";

// Access this page at /generator/step-1-1

import { useEffect, useMemo, useState } from "react";

import SimpleMap2D from "@/components/SimpleMap2D";
import { geocodeAddress, type GeocodeResult } from "@/lib/geocode";

type SelectedResult = {
  lat: number;
  lng: number;
  label: string;
};

const MIN_QUERY_LENGTH = 3;
const DEBOUNCE_MS = 350;
const SUGGESTION_LIMIT = 8;

export default function StepOneOnePage() {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<GeocodeResult[]>([]);
  const [selectedResult, setSelectedResult] = useState<SelectedResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const trimmed = query.trim();

    if (trimmed.length < MIN_QUERY_LENGTH) {
      setSuggestions([]);
      setIsLoading(false);
      setErrorMessage(null);
      return;
    }

    let active = true;
    setIsLoading(true);
    setErrorMessage(null);

    const handle = window.setTimeout(async () => {
      try {
        const results = await geocodeAddress(trimmed, { limit: SUGGESTION_LIMIT });
        if (!active) return;
        setSuggestions(results);
      } catch (error) {
        if (!active) return;
        console.warn("Geocoding failed", error);
        setSuggestions([]);
        setErrorMessage("Unable to load address suggestions right now.");
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }, DEBOUNCE_MS);

    return () => {
      active = false;
      window.clearTimeout(handle);
    };
  }, [query]);

  const selectedSummary = useMemo(() => {
    if (!selectedResult) return null;
    return {
      ...selectedResult,
      latText: selectedResult.lat.toFixed(5),
      lngText: selectedResult.lng.toFixed(5),
    };
  }, [selectedResult]);

  const handleSelect = (result: GeocodeResult) => {
    const selection = {
      lat: result.lat,
      lng: result.lng,
      label: result.displayName,
    } satisfies SelectedResult;

    setSelectedResult(selection);
    setQuery(result.displayName);
    setSuggestions([]);
  };

  return (
    <main className="flex min-h-screen flex-col gap-6 bg-paper px-6 py-10 text-ink">
      <header className="space-y-2">
        <p className="font-mono text-xs uppercase tracking-[0.25em] text-olive">Generator Sandbox</p>
        <h1 className="font-display text-3xl">STEP 1.1 — Address → 2D Map Test</h1>
        <p className="max-w-2xl text-sm text-ink/80">
          This isolated page validates address autocomplete with a MapLibre-powered 2D map preview.
        </p>
      </header>

      <section className="grid gap-6 lg:grid-cols-[1fr_1.4fr]">
        <div className="card-frame space-y-4 p-5">
          <div className="space-y-2">
            <label className="text-sm font-semibold" htmlFor="address-input">
              Address
            </label>
            <input
              id="address-input"
              className="w-full rounded-xl border-2 border-ink bg-white px-3 py-2 text-sm shadow-[6px_6px_0_rgba(27,26,20,0.12)]"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Start typing an address..."
            />
          </div>

          <div className="space-y-2">
            <div className="text-xs font-mono uppercase tracking-[0.2em] text-olive">Suggestions</div>
            <div className="rounded-xl border-2 border-ink bg-white/80">
              {isLoading ? (
                <div className="px-3 py-2 text-sm text-ink/70">Searching...</div>
              ) : errorMessage ? (
                <div className="px-3 py-2 text-sm text-ink/70">{errorMessage}</div>
              ) : suggestions.length === 0 ? (
                <div className="px-3 py-2 text-sm text-ink/50">
                  {query.trim().length >= MIN_QUERY_LENGTH
                    ? "No matches yet."
                    : "Type at least 3 characters to see suggestions."}
                </div>
              ) : (
                <ul className="max-h-64 divide-y divide-ink/10 overflow-y-auto">
                  {suggestions.map((result) => (
                    <li key={`${result.lat}-${result.lng}-${result.displayName}`}>
                      <button
                        type="button"
                        className="w-full px-3 py-2 text-left text-sm transition hover:bg-ink/5"
                        onClick={() => handleSelect(result)}
                      >
                        {result.displayName}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <div className="rounded-xl border-2 border-ink bg-white/80 p-3 text-sm">
            <div className="text-xs font-mono uppercase tracking-[0.2em] text-olive">Selected address</div>
            {selectedSummary ? (
              <div className="mt-2 space-y-1">
                <div className="font-semibold">{selectedSummary.label}</div>
                <div className="text-ink/70">
                  Lat {selectedSummary.latText} · Lng {selectedSummary.lngText}
                </div>
              </div>
            ) : (
              <div className="mt-2 text-ink/60">No address selected yet.</div>
            )}
          </div>
        </div>

        <div className="card-frame space-y-4 p-5">
          <div>
            <div className="text-sm font-semibold">2D Map Preview</div>
            <p className="text-xs text-ink/70">Neighborhood zoom (14–16). Marker updates on selection.</p>
          </div>
          {selectedResult ? (
            <SimpleMap2D center={{ lat: selectedResult.lat, lng: selectedResult.lng }} zoom={15} />
          ) : (
            <div className="flex h-96 w-full items-center justify-center rounded-xl border-2 border-dashed border-ink/40 bg-white/70 text-sm text-ink/60">
              Select an address to preview the map.
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
