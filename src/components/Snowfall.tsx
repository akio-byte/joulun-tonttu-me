import { useMemo } from "react";

interface Snowflake {
  id: number;
  left: number;
  size: number;
  duration: number;
  delay: number;
  opacity: number;
  drift: number;
}

export const Snowfall = () => {
  const snowflakes = useMemo<Snowflake[]>(() => {
    return Array.from({ length: 80 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      size: Math.random() * 5 + 2,
      duration: Math.random() * 8 + 8,
      delay: Math.random() * 8,
      opacity: Math.random() * 0.6 + 0.3,
      drift: Math.random() * 30 - 15,
    }));
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-10" aria-hidden="true">
      {snowflakes.map((flake) => (
        <div
          key={flake.id}
          className="absolute rounded-full bg-christmas-snow"
          style={{
            left: `${flake.left}%`,
            width: `${flake.size}px`,
            height: `${flake.size}px`,
            opacity: flake.opacity,
            animation: `snowfall-custom ${flake.duration}s linear infinite`,
            animationDelay: `${flake.delay}s`,
            boxShadow: `0 0 ${flake.size}px rgba(255, 255, 255, 0.5)`,
            ["--drift" as string]: `${flake.drift}px`,
          }}
        />
      ))}
      <style>{`
        @keyframes snowfall-custom {
          0% {
            transform: translateY(-10vh) translateX(0);
            opacity: 1;
          }
          50% {
            transform: translateY(50vh) translateX(var(--drift));
          }
          100% {
            transform: translateY(110vh) translateX(calc(var(--drift) * -1));
            opacity: 0.3;
          }
        }
      `}</style>
    </div>
  );
};
