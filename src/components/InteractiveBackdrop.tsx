import { useState, useEffect } from "react";

interface RainEmoji {
  id: string;
  char: string;
  x: number; // percentage
  size: number; // px
  duration: number; // seconds
}

interface ShootingStar {
  id: string;
  char: string;
  size: number; // px
  color: string; // rgba shadow color
  startX: number; // percentage
  startY: number; // percentage
  endX: number; // percentage
  endY: number; // percentage
  duration: number; // seconds
}

interface CrossingAnimal {
  id: string;
  char: string;
  y: number; // percentage from top (anywhere on screen)
  direction: "left-to-right" | "right-to-left";
  fleeing: boolean;
  spawnTime: number;
}

const EDUCATIONAL_EMOJIS = [
  "📚", "🖋️", "✏️", "🌟", "📖", "🎓", "🧪", "🧠", "📒", 
  "💡", "🚀", "🎨", "🌍", "🏆", "🧭", "📐", "🔬", "💻", "✨", 
  "🔔", "🎈", "🎁", "🎨", "🧩", "🎯", "🏅"
];
const ANIMALS = [
  { char: "🐌", label: "snail" },
  { char: "🦆", label: "duck" },
  { char: "🐍", label: "snake" },
  { char: "🐟", label: "fish" },
  { char: "🐅", label: "tiger" },
  { char: "🦁", label: "lion" },
  { char: "🐱", label: "cat" },
  { char: "🐶", label: "dog" },
  { char: "🐰", label: "rabbit" },
  { char: "🐿️", label: "squirrel" }
];

export default function InteractiveBackdrop() {
  const [rainItems, setRainItems] = useState<RainEmoji[]>([]);
  const [shootingStars, setShootingStars] = useState<ShootingStar[]>([]);
  const [animals, setAnimals] = useState<CrossingAnimal[]>([]);

  // 1. Gentle Emoji Rain Spawning (Waterfall of slow falling items every 5 seconds)
  useEffect(() => {
    const spawnRain = () => {
      setRainItems((prev) => {
        if (prev.length >= 6) return prev; // Keep screen extremely neat and clear

        const newId = Math.random().toString(36).substring(2, 9);
        const randomChar = EDUCATIONAL_EMOJIS[Math.floor(Math.random() * EDUCATIONAL_EMOJIS.length)];
        const randomX = Math.random() * 90 + 5; // Stay away from extreme edges
        const randomSize = Math.floor(Math.random() * 18) + 36; // Big visible size: 36px to 54px
        const randomDuration = Math.random() * 30 + 60; // Incredibly slow and peaceful descent: 60 to 90 seconds slow majestic drift!

        const newItem: RainEmoji = {
          id: newId,
          char: randomChar,
          x: randomX,
          size: randomSize,
          duration: randomDuration
        };

        // Auto remove when descent finishes
        setTimeout(() => {
          setRainItems((current) => current.filter((item) => item.id !== newId));
        }, randomDuration * 1000);

        return [...prev, newItem];
      });
    };

    // Falling emojis spawn exactly every 5 seconds (5000ms)
    const interval = setInterval(spawnRain, 5000);
    // Initial spawn on load
    spawnRain();

    return () => clearInterval(interval);
  }, []);

  // 2. Shooting Stars & Meteorites Scheduler (Creates highly magical blinking celestial events!)
  useEffect(() => {
    const triggerShootingStar = () => {
      setShootingStars((prev) => {
        if (prev.length >= 2) return prev; // Clean and sparse: limit concurrent active stars to 2

        const id = Math.random().toString(36).substring(2, 9);
        const directionLeftToRight = Math.random() > 0.5;
        const randomDuration = Math.random() * 3 + 5; // Extremely slow and elegant flight speed: 5 to 8 seconds

        const celestialChars = ["☄️", "🌟", "✨", "💫", "🌠"];
        const randomChar = celestialChars[Math.floor(Math.random() * celestialChars.length)];

        // Random starting/ending positions to spread across the sky
        const startX = directionLeftToRight ? -10 : 110;
        const startY = Math.random() * 40; // Top 40% of the screen
        const endX = directionLeftToRight ? (Math.random() * 40 + 70) : (Math.random() * 40 - 10);
        const endY = Math.random() * 50 + 40; // Diagonally down to 40% to 90%
        const size = Math.floor(Math.random() * 14) + 18; // 18px to 32px

        const glowColors = [
          "rgba(245, 166, 35, 0.9)", // Gold
          "rgba(255, 255, 255, 0.9)", // White
          "rgba(0, 240, 255, 0.9)",  // Cyan
          "rgba(255, 0, 180, 0.9)",  // Magenta / Pink
          "rgba(140, 80, 255, 0.9)",  // Indigo
        ];
        const randomColor = glowColors[Math.floor(Math.random() * glowColors.length)];

        const star: ShootingStar = {
          id,
          char: randomChar,
          size,
          color: randomColor,
          startX,
          startY,
          endX,
          endY,
          duration: randomDuration
        };

        // Remove after animation ends completely
        setTimeout(() => {
          setShootingStars((current) => current.filter((s) => s.id !== id));
        }, (randomDuration + 0.2) * 1000);

        return [...prev, star];
      });
    };

    // Spawn a magical shooting star/meteorite gently every 12 seconds to keep the sky uncluttered
    const interval = setInterval(triggerShootingStar, 12000);
    // Initial spawn to populate with a gentle delay
    setTimeout(triggerShootingStar, 4000);

    return () => clearInterval(interval);
  }, []);

  // 3. Animal Crossing Logic (Spawn game-like creatures one by one every 10 seconds)
  useEffect(() => {
    const trySpawningAnimal = () => {
      setAnimals((prev) => {
        if (prev.length >= 1) return prev; // Strictly come one by one (maximum 1 active animal on screen)

        const randomAnimal = ANIMALS[Math.floor(Math.random() * ANIMALS.length)];
        const direction = Math.random() > 0.5 ? "left-to-right" : "right-to-left";
        
        // Spawn EVERYWHERE vertically (from 5% top header zone to 88% above footer zone)
        const randomY = Math.random() * 83 + 5;

        const newId = Math.random().toString(36).substring(2, 9);
        const newAnimal: CrossingAnimal = {
          id: newId,
          char: randomAnimal.char,
          y: randomY,
          direction,
          fleeing: false,
          spawnTime: Date.now()
        };

        // Auto-remove individual animal after 32s if user never clicked it (regular walk complete)
        setTimeout(() => {
          setAnimals((current) => current.filter((a) => a.id !== newId || a.fleeing));
        }, 32000);

        return [...prev, newAnimal];
      });
    };

    // Spawn a creature one by one every 10 seconds (10000ms)
    const interval = setInterval(trySpawningAnimal, 10000);
    // Initial spawn on load
    trySpawningAnimal();

    return () => clearInterval(interval);
  }, []);

  // Handle click / tap on specific crossing animal
  const handleAnimalClick = (id: string, e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    e.preventDefault();

    setAnimals((prev) =>
      prev.map((animal) => {
        if (animal.id === id && !animal.fleeing) {
          // Trigger fast escape flight
          setTimeout(() => {
            // Completely remove the animal node after flight animation finishes (400ms)
            setAnimals((current) => current.filter((a) => a.id !== id));
          }, 400);
          return { ...animal, fleeing: true };
        }
        return animal;
      })
    );
  };

  return (
    <div 
      className="absolute inset-0 w-full h-full pointer-events-none select-none z-[9998]"
      style={{ overflow: "visible" }}
      aria-hidden="true"
    >
      {/* 4. Self-Contained High-Performance CSS Stylesheet */}
      <style>{`
        /* Rain Items Animation spanning entire document from absolute top to just above deep blue footer */
        .emoji-rain-node {
          position: absolute;
          top: -100px;
          z-index: 9998 !important;
          will-change: transform;
          animation-name: gentleFall;
          animation-timing-function: linear;
          animation-fill-mode: forwards;
          user-select: none;
          pointer-events: none;
          opacity: 0;
        }

        @keyframes gentleFall {
          0% {
            top: -100px;
            transform: rotate(0deg) translateX(0px);
            opacity: 0;
          }
          5% {
            opacity: 0.85;
          }
          95% {
            opacity: 0.85;
          }
          100% {
            top: calc(100% - 60px); /* gracefully stop at the absolute bottom above deep blue footer */
            transform: rotate(360deg) translateX(25px);
            opacity: 0;
          }
        }

        /* Diagonal Shooting Star Animation base style */
        .shooting-star-node {
          position: absolute;
          will-change: transform;
          user-select: none;
          pointer-events: none;
          z-index: 6;
          opacity: 0;
        }

        /* Interactive Crossing Animal Animation in Absolute Foreground overlay */
        .crossing-animal-node {
          position: absolute;
          font-size: 38px;
          cursor: pointer;
          pointer-events: auto !important; /* Highly critical so students can tap it! */
          user-select: none;
          z-index: 9999 !important; /* Render in absolute foreground layer */
          width: 60px !important;
          height: 60px !important;
          opacity: 1 !important; /* Strict initialization opacity */
          will-change: transform;
          transition: transform 0.4s ease-in-out, opacity 0.4s ease-in-out;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 9999px;
        }

        /* Slow horizontal walking/swimming cycles depending on direction (no mirror/transform flip on parent) */
        .walk-ltr {
          animation: walkLtrAnim 32s linear forwards; /* Decreased speed walk */
        }

        .walk-rtl {
          animation: walkRtlAnim 32s linear forwards; /* Decreased speed walk */
        }

        @keyframes walkLtrAnim {
          0% {
            left: -10vw;
          }
          100% {
            left: 110vw;
          }
        }

        @keyframes walkRtlAnim {
          0% {
            right: -10vw;
          }
          100% {
            right: 110vw;
          }
        }

        /* Active fleeing visual overlay (fast escape in same direction they look and disappear) */
        .flee-ltr {
          transform: translate3d(120vw, 0, 0) scale(0.3) rotate(720deg) !important;
          opacity: 0 !important;
          pointer-events: none !important;
          transition: transform 0.4s ease-in-out, opacity 0.4s ease-in-out !important;
        }

        .flee-rtl {
          transform: translate3d(-120vw, 0, 0) scale(0.3) rotate(-720deg) !important;
          opacity: 0 !important;
          pointer-events: none !important;
          transition: transform 0.4s ease-in-out, opacity 0.4s ease-in-out !important;
        }
      `}</style>

      {/* RENDER 1: Waterfall of Educational Emojis (Book 📚, Pen 🖋️, Pencil ✏️, Notebook 📒, Star 🌟) */}
      {rainItems.map((item) => (
        <div
          key={item.id}
          className="emoji-rain-node"
          style={{
            left: `${item.x}%`,
            fontSize: `${item.size}px`,
            animationDuration: `${item.duration}s`,
          }}
        >
          {item.char}
        </div>
      ))}

      {/* RENDER 2: Multiple Diagonal Blinking Shooting Stars and Meteorites */}
      {shootingStars.map((star) => (
        <div
          key={star.id}
          className="shooting-star-node"
          style={{
            fontSize: `${star.size}px`,
            filter: `drop-shadow(0 0 10px ${star.color})`,
            animation: `shootingStarAnim-${star.id} ${star.duration}s cubic-bezier(0.25, 1, 0.5, 1) forwards`,
          }}
        >
          {star.char}
          <style>{`
            @keyframes shootingStarAnim-${star.id} {
              0% {
                left: ${star.startX}vw;
                top: ${star.startY}vh;
                transform: scale(0.6) rotate(0deg);
                opacity: 0;
              }
              20% {
                opacity: 1;
                transform: scale(1.2) rotate(180deg);
              }
              50% {
                /* Elegant blinking effect mid-flight */
                opacity: 0.35;
              }
              75% {
                opacity: 1;
              }
              100% {
                left: ${star.endX}vw;
                top: ${star.endY}vh;
                transform: scale(0.6) rotate(360deg);
                opacity: 0;
              }
            }
          `}</style>
        </div>
      ))}

      {/* RENDER 3: Interactive Cartoon Crossing Animals crossing one by one! */}
      {animals.map((animalItem) => (
        <div
          key={animalItem.id}
          className={`crossing-animal-node select-none ${
            animalItem.fleeing 
              ? animalItem.direction === "left-to-right" ? "flee-ltr" : "flee-rtl"
              : animalItem.direction === "left-to-right" 
              ? "walk-ltr" 
              : "walk-rtl"
          }`}
          style={{
            top: `${animalItem.y}%`,
          }}
          onClick={(e) => handleAnimalClick(animalItem.id, e)}
          onTouchStart={(e) => handleAnimalClick(animalItem.id, e)}
          title="তীব্র গতিতে পালাতে আমাকে স্পর্শ করুন! (Tap me to escape!)"
        >
          <div className="relative group flex items-center justify-center w-full h-full">
            {/* Soft background bubble ring feedback when hovering/pointing on the animal */}
            <span className="absolute inset-0 bg-amber-400/20 group-hover:bg-amber-400/35 rounded-full scale-125 transition-transform duration-300 pointer-events-none blur-xs" />
            
            {/* The primary cartoon emoji avatar - we flip only the emoji itself so the speech label stays upright! */}
            <span 
              className="relative transform hover:scale-125 transition-transform duration-200 text-3xl inline-block"
              style={{
                transform: animalItem.direction === "left-to-right" ? "scaleX(-1)" : "scaleX(1)"
              }}
            >
              {animalItem.char}
            </span>

            {/* Micro speech bubble overlay with premium Bengali and English guidance - ALWAYS perfectly legible and upright! */}
            {!animalItem.fleeing && (
              <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-indigo-950/90 text-amber-300 font-sans text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none border border-amber-500/40">
                ধরো আমাকে! (Tap Me!)
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
