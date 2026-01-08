"use client";

import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef } from "react";

export type Globe3DHandle = {
  focusCountry: (countryCode: string) => void;
  focusCity: (lat: number, lng: number) => void;
};

type Globe3DProps = {
  selectedCountry?: string;
  selectedCity?: { name?: string; lat: number; lng: number };
};

type GlobePoint = { x: number; y: number; z: number };

const degToRad = (deg: number) => (deg * Math.PI) / 180;

const Globe3D = forwardRef<Globe3DHandle, Globe3DProps>(({ selectedCountry, selectedCity }, ref) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationRef = useRef<number | null>(null);
  const rotationRef = useRef(0);
  const targetRotationRef = useRef(0);
  const tilt = useMemo(() => degToRad(18), []);

  useImperativeHandle(
    ref,
    () => ({
      focusCountry: () => {
        targetRotationRef.current = 0;
      },
      focusCity: (_lat, lng) => {
        targetRotationRef.current = -degToRad(lng);
      },
    }),
    []
  );

  useEffect(() => {
    if (!selectedCity) return;
    targetRotationRef.current = -degToRad(selectedCity.lng);
  }, [selectedCity]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const setCanvasSize = () => {
      const { width, height } = canvas.getBoundingClientRect();
      const pixelRatio = window.devicePixelRatio || 1;
      canvas.width = Math.max(1, Math.floor(width * pixelRatio));
      canvas.height = Math.max(1, Math.floor(height * pixelRatio));
      ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    };

    const projectPoint = (lat: number, lng: number, radius: number): GlobePoint => {
      const latRad = degToRad(lat);
      const lngRad = degToRad(lng) + rotationRef.current;
      const x = Math.cos(latRad) * Math.sin(lngRad);
      const y = Math.sin(latRad);
      const z = Math.cos(latRad) * Math.cos(lngRad);
      const tiltedY = y * Math.cos(tilt) - z * Math.sin(tilt);
      const tiltedZ = y * Math.sin(tilt) + z * Math.cos(tilt);
      return { x: x * radius, y: -tiltedY * radius, z: tiltedZ };
    };

    const drawGraticule = (centerX: number, centerY: number, radius: number) => {
      ctx.strokeStyle = "rgba(27, 26, 20, 0.18)";
      ctx.lineWidth = 1;

      for (let lat = -60; lat <= 60; lat += 30) {
        ctx.beginPath();
        let started = false;
        for (let lng = -180; lng <= 180; lng += 6) {
          const point = projectPoint(lat, lng, radius);
          if (point.z <= 0) {
            started = false;
            continue;
          }
          const x = centerX + point.x;
          const y = centerY + point.y;
          if (!started) {
            ctx.moveTo(x, y);
            started = true;
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.stroke();
      }

      for (let lng = -150; lng <= 150; lng += 30) {
        ctx.beginPath();
        let started = false;
        for (let lat = -90; lat <= 90; lat += 6) {
          const point = projectPoint(lat, lng, radius);
          if (point.z <= 0) {
            started = false;
            continue;
          }
          const x = centerX + point.x;
          const y = centerY + point.y;
          if (!started) {
            ctx.moveTo(x, y);
            started = true;
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.stroke();
      }
    };

    const drawCityMarker = (centerX: number, centerY: number, radius: number) => {
      if (!selectedCity) return;
      const point = projectPoint(selectedCity.lat, selectedCity.lng, radius);
      if (point.z <= 0) return;
      const x = centerX + point.x;
      const y = centerY + point.y;
      ctx.fillStyle = "rgba(179, 90, 42, 0.9)";
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = "rgba(27, 26, 20, 0.35)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(x, y, 8, 0, Math.PI * 2);
      ctx.stroke();
    };

    const drawFrame = () => {
      setCanvasSize();
      const { width, height } = canvas.getBoundingClientRect();
      const centerX = width / 2;
      const centerY = height / 2;
      const radius = Math.min(width, height) * 0.36;

      ctx.clearRect(0, 0, width, height);

      const gradient = ctx.createRadialGradient(
        centerX - radius * 0.3,
        centerY - radius * 0.3,
        radius * 0.2,
        centerX,
        centerY,
        radius * 1.2
      );
      gradient.addColorStop(0, "rgba(248, 240, 220, 0.9)");
      gradient.addColorStop(1, "rgba(216, 222, 198, 0.85)");

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.fill();

      drawGraticule(centerX, centerY, radius);
      drawCityMarker(centerX, centerY, radius);

      ctx.strokeStyle = "rgba(27, 26, 20, 0.5)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.stroke();

      rotationRef.current += 0.003;
      const diff = targetRotationRef.current - rotationRef.current;
      rotationRef.current += diff * 0.04;

      animationRef.current = window.requestAnimationFrame(drawFrame);
    };

    const handleResize = () => setCanvasSize();
    window.addEventListener("resize", handleResize);
    animationRef.current = window.requestAnimationFrame(drawFrame);

    return () => {
      window.removeEventListener("resize", handleResize);
      if (animationRef.current) {
        window.cancelAnimationFrame(animationRef.current);
      }
    };
  }, [selectedCity, tilt]);

  const title = selectedCountry ?? selectedCity?.name ?? "Globe3D";
  const location = selectedCity ? `${selectedCity.lat.toFixed(2)}, ${selectedCity.lng.toFixed(2)}` : "—";

  return (
    <div className="relative h-64 w-full overflow-hidden rounded-xl border-2 border-ink bg-[rgba(255,255,255,0.6)]">
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" aria-label="Mapa globo 3D" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-[rgba(248,240,220,0.9)] via-[rgba(248,240,220,0.6)] to-transparent p-3 text-center text-xs text-ink/80">
        <div className="text-sm font-semibold text-ink">{title}</div>
        <div className="font-mono text-[11px] text-ink/60">Selected city: {location}</div>
      </div>
      <div className="pointer-events-none absolute left-4 top-4 rounded-full border-2 border-ink/60 bg-[rgba(255,255,255,0.85)] px-3 py-1 text-[10px] font-mono uppercase tracking-[0.2em] text-olive">
        Globe3D
      </div>
    </div>
  );
});

Globe3D.displayName = "Globe3D";

export default Globe3D;
