"use client";

import Image from "next/image";
import Link from "next/link";
import {
  AnimatePresence,
  motion,
  useScroll,
  useTransform,
} from "framer-motion";
import {
  Calendar,
  ChevronDown,
  Disc3,
  Heart,
  ImagePlus,
  MapPin,
  Mic,
  Music2,
  PanelRightClose,
  PanelRightOpen,
  Pause,
  PenLine,
  Play,
  Plus,
  Search,
  Ticket,
  Trash2,
  Upload,
  X,
  Check,
  Pencil,
  AlertTriangle,
  AlertCircle,
  Info,
  ZoomIn,
} from "lucide-react";
import AmbientMixer from "@/components/AmbientMixer";
import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type MouseEvent as ReactMouseEvent,
} from "react";

type SeasonTheme = "spring" | "summer" | "autumn" | "winter" | "dream";
type ConcertStatus = "attended" | "wishlist";

type Season = {
  id: string;
  theme: SeasonTheme;
  title: string;
  subtitle: string;
  genre: string;
  items: string[];
  favorite: boolean;
};

type ConcertPhoto = {
  id: string;
  caption: string;
  gradient: string;
  image?: string;
};

type Concert = {
  id: string;
  artist: string;
  tour: string;
  date: string;
  venue: string;
  seat: string;
  quote: string;
  status: ConcertStatus;
  photos: ConcertPhoto[];
};

type KtvSong = {
  id: string;
  title: string;
  artist: string;
  tag: string;
  plays: number;
};

type TrailParticle = {
  id: number;
  x: number;
  y: number;
  scale: number;
  rotation: number;
  driftX: number;
};

type FloatBurst = {
  id: number;
  x: number;
  type: "heart" | "note";
};

type ThemeMeta = {
  label: string;
  labelBackground: string;
  glowColor: string;
  waveColor: string;
  metalTint: string;
};

const MAX_PARTICLES = 40;
const PARTICLE_LIFETIME = 2000;
const STORAGE_KEYS = {
  seasons: "music-oasis-seasons",
  concerts: "music-oasis-concerts",
  ktv: "music-oasis-ktv",
  diary: "lilac-diary-entries",
  version: "music-oasis-version",
};
const DATA_VERSION = "2.0";

type Mood = "happy" | "calm" | "excited" | "sad" | "nostalgic" | "hopeful";

type DiaryEntry = {
  id: string;
  date: string;
  mood: Mood;
  message: string;
  songTitle: string;
  songArtist: string;
};

const moodConfig: Record<Mood, { label: string; color: string; emoji: string }> = {
  happy: { label: "开心", color: "from-amber-400 to-orange-400", emoji: "☀️" },
  calm: { label: "平静", color: "from-blue-400 to-cyan-400", emoji: "🌊" },
  excited: { label: "兴奋", color: "from-pink-400 to-rose-400", emoji: "✨" },
  sad: { label: "伤感", color: "from-indigo-400 to-violet-400", emoji: "🌙" },
  nostalgic: { label: "怀旧", color: "from-purple-400 to-fuchsia-400", emoji: "📜" },
  hopeful: { label: "期待", color: "from-green-400 to-emerald-400", emoji: "🌱" },
};

const PHOTO_GRADIENTS = [
  "from-violet-700 via-purple-500 to-fuchsia-400",
  "from-indigo-700 via-violet-500 to-purple-300",
  "from-purple-800 via-fuchsia-600 to-pink-400",
  "from-violet-600 via-purple-400 to-sky-300",
  "from-fuchsia-700 via-purple-500 to-violet-300",
];

const themeMeta: Record<SeasonTheme, ThemeMeta> = {
  spring: {
    label: "Spring · 春",
    labelBackground:
      "linear-gradient(135deg, rgba(157, 243, 196, 1), rgba(102, 223, 180, 0.95), rgba(205, 250, 233, 0.95))",
    glowColor: "#4ade80",
    waveColor: "#86efac",
    metalTint: "#d1fae5",
  },
  summer: {
    label: "Summer · 夏",
    labelBackground:
      "linear-gradient(135deg, rgba(59, 130, 246, 0.96), rgba(14, 165, 233, 0.95), rgba(125, 211, 252, 0.92))",
    glowColor: "#38bdf8",
    waveColor: "#7dd3fc",
    metalTint: "#dbeafe",
  },
  autumn: {
    label: "Autumn · 秋",
    labelBackground:
      "linear-gradient(135deg, rgba(251, 146, 60, 0.96), rgba(249, 115, 22, 0.94), rgba(253, 186, 116, 0.92))",
    glowColor: "#fb923c",
    waveColor: "#fdba74",
    metalTint: "#ffedd5",
  },
  winter: {
    label: "Winter · 冬",
    labelBackground:
      "linear-gradient(135deg, rgba(168, 85, 247, 0.96), rgba(99, 102, 241, 0.94), rgba(196, 181, 253, 0.92))",
    glowColor: "#a78bfa",
    waveColor: "#c4b5fd",
    metalTint: "#ede9fe",
  },
  dream: {
    label: "Lilac Dream · 幻紫",
    labelBackground:
      "linear-gradient(135deg, rgba(216, 180, 254, 0.98), rgba(244, 114, 182, 0.84), rgba(255, 255, 255, 0.88))",
    glowColor: "#e879f9",
    waveColor: "#f0abfc",
    metalTint: "#f5d0fe",
  },
};

const DEFAULT_SEASONS: Season[] = [
  {
    id: "season-spring",
    theme: "spring",
    title: "春季偏好曲风",
    subtitle: "适合微风沉醉的午后",
    genre: "Pop Rock · 流行摇滚",
    items: ["泰妍 - I", "aespa - Live My Life", "少女时代 - Lion Heart", "IU - Blueming", "Oh My Girl - Nonstop"],
    favorite: true,
  },
  {
    id: "season-summer",
    theme: "summer",
    title: "夏季偏好曲风",
    subtitle: "属于海浪与汽水的喧嚣",
    genre: "K-Pop · 华语流行",
    items: ["fromis_9 - Supersonic", "林忆莲 - 归零", "蔡依林 - 妥协", "NewJeans - Hype Boy", "IVE - After Like"],
    favorite: false,
  },
  {
    id: "season-autumn",
    theme: "autumn",
    title: "秋季偏好曲风",
    subtitle: "落叶铺满的氛围感",
    genre: "K-Pop · 华语抒情",
    items: ["张碧晨 - 舍离断", "袁娅维 - 讨厌", "Red Velvet - Psycho", "Red Velvet - Peek-a-Boo", "Heize - Star"],
    favorite: false,
  },
  {
    id: "season-winter",
    theme: "winter",
    title: "冬季偏好曲风",
    subtitle: "在温暖室内聆听的治愈",
    genre: "K-Pop · 清新抒情",
    items: ["NewJeans - Ditto", "泰妍 - 一半一半", "IU - Winter Sleep", "Oh My Girl - Secret Garden", "脸红的思春期 - 给你宇宙"],
    favorite: false,
  },
];

const DEFAULT_CONCERTS: Concert[] = [
  {
    id: "concert-1",
    artist: "泰妍 (Taeyeon)",
    tour: "The Tense 澳门演唱会",
    date: "2025.08.23",
    venue: "澳门 · 银河综艺馆",
    seat: "内场 A 区 · 8 排",
    quote:
      "当 I 的前奏响起，全场亮起的灯海像银河一样璀璨。",
    status: "attended",
    photos: [
      {
        id: "photo-1",
        caption: "开场前的紫色灯海",
        gradient: PHOTO_GRADIENTS[0],
      },
      {
        id: "photo-2",
        caption: "Encore 安可时刻",
        gradient: PHOTO_GRADIENTS[1],
      },
      {
        id: "photo-3",
        caption: "票根与手环",
        gradient: PHOTO_GRADIENTS[2],
      },
    ],
  },
  {
    id: "concert-2",
    artist: "Red Velvet",
    tour: "Next Asia Tour",
    date: "待公布",
    venue: "待定",
    seat: "等待开票",
    quote: "期待 Psycho 和 Peek-a-Boo 的现场！",
    status: "wishlist",
    photos: [],
  },
];

const DEFAULT_KTV_SONGS: KtvSong[] = [
  {
    id: "song-1",
    title: "归零",
    artist: "林忆莲",
    tag: "抒情必点",
    plays: 4,
  },
  {
    id: "song-2",
    title: "妥协",
    artist: "蔡依林",
    tag: "高音挑战",
    plays: 6,
  },
  {
    id: "song-3",
    title: "舍离断",
    artist: "张碧晨",
    tag: "古风抒情",
    plays: 3,
  },
  {
    id: "song-4",
    title: "讨厌",
    artist: "袁娅维",
    tag: "R&B 氛围",
    plays: 5,
  },
];

const navLinks = [
  { href: "#seasons", label: "四季偏好" },
  { href: "#concerts", label: "演唱会 & 票根" },
  { href: "#ktv", label: "KTV 必点" },
  { href: "/diary", label: "心情日记", external: true },
  { href: "#editor", label: "站内编辑台" },
];

const emptySeasonForm = {
  theme: "dream" as SeasonTheme,
  title: "",
  subtitle: "",
  genre: "",
  items: "",
};

const emptyConcertForm = {
  artist: "",
  tour: "",
  date: "",
  venue: "",
  seat: "",
  quote: "",
  status: "attended" as ConcertStatus,
};

const emptyKtvForm = {
  title: "",
  artist: "",
  tag: "",
};

function createId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function safeParse<T>(raw: string | null, fallback: T) {
  if (!raw) return fallback;

  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function pickGradient(index: number) {
  return PHOTO_GRADIENTS[index % PHOTO_GRADIENTS.length];
}

function fileNameToCaption(name: string) {
  return name.replace(/\.[^/.]+$/, "").replace(/[-_]+/g, " ");
}

async function filesToPhotos(files: FileList | File[]) {
  const selectedFiles = Array.from(files);

  return Promise.all(
    selectedFiles.map(
      (file, index) =>
        new Promise<ConcertPhoto>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
            resolve({
              id: createId("photo"),
              caption: fileNameToCaption(file.name),
              image: typeof reader.result === "string" ? reader.result : undefined,
              gradient: pickGradient(index),
            });
          };
          reader.onerror = () => reject(reader.error);
          reader.readAsDataURL(file);
        }),
    ),
  );
}

function ButterflySvg({
  className = "",
  size = 220,
  animated = true,
}: {
  className?: string;
  size?: number;
  animated?: boolean;
}) {
  const gradientId = useId().replace(/:/g, "");
  const lowerWing = `url(#${gradientId}-lower-wing)`;
  const upperWing = `url(#${gradientId}-upper-wing)`;
  const bodyGradient = `url(#${gradientId}-body)`;

  const leftUpperWing =
    "M 98 95 C 86 49 56 18 24 24 C 10 34 8 70 28 98 C 44 120 74 116 98 100 Z";
  const rightUpperWing =
    "M 102 95 C 114 49 144 18 176 24 C 190 34 192 70 172 98 C 156 120 126 116 102 100 Z";
  const leftLowerWing =
    "M 100 107 C 72 114 46 132 48 163 C 52 183 74 191 94 182 C 104 176 107 149 101 116 Z";
  const rightLowerWing =
    "M 100 107 C 128 114 154 132 152 163 C 148 183 126 191 106 182 C 96 176 93 149 99 116 Z";
  const leftUpperOverlay =
    "M 98 98 C 89 62 62 35 36 40 C 22 47 22 76 38 93 C 52 107 76 107 97 101 Z";
  const rightUpperOverlay =
    "M 102 98 C 111 62 138 35 164 40 C 178 47 178 76 162 93 C 148 107 124 107 103 101 Z";
  const leftLowerOverlay =
    "M 100 110 C 80 118 62 133 64 156 C 67 171 82 177 96 171 C 103 166 105 144 101 120 Z";
  const rightLowerOverlay =
    "M 100 110 C 120 118 138 133 136 156 C 133 171 118 177 104 171 C 97 166 95 144 99 120 Z";

  const slowTransition = {
    duration: 3.9,
    repeat: Infinity,
    ease: "easeInOut" as const,
  };
  const fastTransition = {
    duration: 3.2,
    repeat: Infinity,
    ease: "easeInOut" as const,
  };

  return (
    <motion.div
      className={`butterfly-breathe ${className}`.trim()}
      animate={
        animated
          ? {
              y: [0, -5, 0],
              scale: [1, 1.018, 1],
              filter: [
                "drop-shadow(0 0 10px rgba(196,181,253,0.15))",
                "drop-shadow(0 0 28px rgba(216,180,254,0.32))",
                "drop-shadow(0 0 10px rgba(196,181,253,0.15))",
              ],
            }
          : undefined
      }
      transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
    >
      <svg
        viewBox="0 0 200 200"
        width={size}
        height={size}
        className={className}
        aria-hidden
      >
        <defs>
          <linearGradient
            id={`${gradientId}-lower-wing`}
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            <stop offset="0%" stopColor="#f0e7ff" />
            <stop offset="45%" stopColor="#d8b4fe" />
            <stop offset="100%" stopColor="#9f67dc" />
          </linearGradient>
          <linearGradient
            id={`${gradientId}-upper-wing`}
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
            <stop offset="55%" stopColor="#f8f4ff" stopOpacity="0.62" />
            <stop offset="100%" stopColor="#eadcff" stopOpacity="0.28" />
          </linearGradient>
          <linearGradient
            id={`${gradientId}-body`}
            x1="0%"
            y1="0%"
            x2="0%"
            y2="100%"
          >
            <stop offset="0%" stopColor="#9c7ae5" />
            <stop offset="100%" stopColor="#4c1d95" />
          </linearGradient>
          <radialGradient id={`${gradientId}-highlight`} cx="50%" cy="45%" r="55%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </radialGradient>
        </defs>

        <motion.g
          style={{ transformOrigin: "100px 100px", transformBox: "view-box" }}
          animate={animated ? { y: [0, -1, 0] } : undefined}
          transition={{ duration: 4.4, repeat: Infinity, ease: "easeInOut" }}
        >
          <motion.g
            style={{ transformOrigin: "100px 100px", transformBox: "view-box" }}
            animate={animated ? { rotate: [-7, 4, -7] } : undefined}
            transition={slowTransition}
          >
            <path d={leftUpperWing} fill={lowerWing} opacity="0.96" />
            <path d={leftLowerWing} fill={lowerWing} opacity="0.92" />
            <path
              d="M 99 100 C 88 85 70 67 38 51 M 99 100 C 80 103 65 111 49 130 M 100 110 C 90 128 84 149 84 176"
              fill="none"
              stroke="#7c3aed"
              strokeWidth="1.15"
              strokeOpacity="0.34"
              strokeLinecap="round"
            />
            <path
              d="M 52 44 C 63 40 79 42 88 54"
              fill="none"
              stroke="#8b5cf6"
              strokeWidth="1.3"
              strokeOpacity="0.4"
            />
            <path
              d="M 58 145 C 68 157 81 164 93 166"
              fill="none"
              stroke="#8b5cf6"
              strokeWidth="1"
              strokeOpacity="0.35"
            />
            <path
              d="M 35 37 C 43 31 58 30 68 35"
              fill="none"
              stroke={`url(#${gradientId}-highlight)`}
              strokeWidth="6"
              strokeOpacity="0.32"
            />
          </motion.g>

          <motion.g
            style={{ transformOrigin: "100px 100px", transformBox: "view-box" }}
            animate={animated ? { rotate: [7, -4, 7] } : undefined}
            transition={slowTransition}
          >
            <path d={rightUpperWing} fill={lowerWing} opacity="0.96" />
            <path d={rightLowerWing} fill={lowerWing} opacity="0.92" />
            <path
              d="M 101 100 C 112 85 130 67 162 51 M 101 100 C 120 103 135 111 151 130 M 100 110 C 110 128 116 149 116 176"
              fill="none"
              stroke="#7c3aed"
              strokeWidth="1.15"
              strokeOpacity="0.34"
              strokeLinecap="round"
            />
            <path
              d="M 148 44 C 137 40 121 42 112 54"
              fill="none"
              stroke="#8b5cf6"
              strokeWidth="1.3"
              strokeOpacity="0.4"
            />
            <path
              d="M 142 145 C 132 157 119 164 107 166"
              fill="none"
              stroke="#8b5cf6"
              strokeWidth="1"
              strokeOpacity="0.35"
            />
            <path
              d="M 165 37 C 157 31 142 30 132 35"
              fill="none"
              stroke={`url(#${gradientId}-highlight)`}
              strokeWidth="6"
              strokeOpacity="0.32"
            />
          </motion.g>

          <motion.g
            style={{ transformOrigin: "100px 100px", transformBox: "view-box" }}
            animate={animated ? { rotate: [-10, 6, -10], y: [0, -1, 0] } : undefined}
            transition={fastTransition}
          >
            <path d={leftUpperOverlay} fill={upperWing} opacity="0.76" />
            <path d={leftLowerOverlay} fill={upperWing} opacity="0.58" />
          </motion.g>

          <motion.g
            style={{ transformOrigin: "100px 100px", transformBox: "view-box" }}
            animate={animated ? { rotate: [10, -6, 10], y: [0, -1, 0] } : undefined}
            transition={fastTransition}
          >
            <path d={rightUpperOverlay} fill={upperWing} opacity="0.76" />
            <path d={rightLowerOverlay} fill={upperWing} opacity="0.58" />
          </motion.g>

          <motion.g
            animate={animated ? { y: [0, -1, 0] } : undefined}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          >
            <ellipse cx="100" cy="98" rx="9" ry="25" fill={bodyGradient} />
            <ellipse cx="100" cy="74" rx="7.5" ry="8.5" fill="#7c3aed" />
            <ellipse cx="100" cy="78" rx="4.2" ry="14" fill="#ffffff" opacity="0.2" />
            <path
              d="M 96 69 Q 83 40 70 27"
              fill="none"
              stroke="#5b2aa7"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
            <path
              d="M 104 69 Q 117 40 130 27"
              fill="none"
              stroke="#5b2aa7"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
            <circle cx="69" cy="27" r="2.6" fill="#7c3aed" opacity="0.8" />
            <circle cx="131" cy="27" r="2.6" fill="#7c3aed" opacity="0.8" />
          </motion.g>
        </motion.g>
      </svg>
    </motion.div>
  );
}

function ButterflyTrail() {
  const [particles, setParticles] = useState<(TrailParticle & { born: number })[]>([]);
  const idRef = useRef(0);
  const lastSpawnRef = useRef(0);

  const handleMouseMove = useCallback((event: MouseEvent) => {
    const now = Date.now();
    if (now - lastSpawnRef.current < 45) return;
    lastSpawnRef.current = now;

    const particle: TrailParticle & { born: number } = {
      id: idRef.current++,
      x: event.clientX,
      y: event.clientY,
      scale: 0.35 + Math.random() * 0.45,
      rotation: Math.random() * 360,
      driftX: (Math.random() - 0.5) * 70,
      born: now,
    };

    setParticles((prev) => {
      const next = [...prev, particle];
      return next.length > MAX_PARTICLES ? next.slice(next.length - MAX_PARTICLES) : next;
    });
  }, []);

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [handleMouseMove]);

  useEffect(() => {
    const interval = window.setInterval(() => {
      const now = Date.now();
      setParticles((prev) => prev.filter((particle) => now - particle.born < PARTICLE_LIFETIME));
    }, 160);

    return () => window.clearInterval(interval);
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 z-[60] overflow-hidden">
      <AnimatePresence>
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            initial={{ opacity: 0.75, y: 0, x: 0, scale: particle.scale }}
            animate={{
              opacity: 0,
              y: -80 - Math.random() * 40,
              x: particle.driftX,
              rotate: particle.rotation + 20,
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: PARTICLE_LIFETIME / 1000, ease: "easeOut" }}
            className="absolute"
            style={{ left: particle.x - 18, top: particle.y - 18 }}
          >
            <ButterflySvg size={36} animated={false} />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

function IntroOverlay({
  opacity,
  pointerEvents,
}: {
  opacity: ReturnType<typeof useTransform<number, number>>;
  pointerEvents: "auto" | "none";
}) {
  return (
    <motion.div
      style={{ opacity, pointerEvents }}
      className="fixed inset-0 z-40 flex flex-col items-center justify-center"
      aria-hidden={pointerEvents === "none"}
    >
      <div
        className="absolute inset-0 aurora-panel bg-[linear-gradient(180deg,rgba(255,255,255,0.95),rgba(245,232,255,0.9),rgba(203,172,255,0.55))]"
        style={{ pointerEvents }}
      />
      <div
        className="relative z-10 flex flex-col items-center px-6 text-center"
        style={{ pointerEvents }}
      >
        <ButterflySvg size={240} className="md:hidden" />
        <ButterflySvg size={340} className="hidden md:block" />
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 1 }}
          className="font-cursive mt-4 max-w-2xl text-2xl leading-relaxed text-purple-800 md:text-4xl md:leading-snug"
        >
          每个音符，都是一只
          <br className="hidden sm:block" />
          停留在一瞬的淡紫色蝴蝶。
        </motion.p>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.8 }}
          className="mt-4 text-sm tracking-[0.35em] text-purple-500/70 uppercase"
        >
          Doris&apos;s Music Oasis
        </motion.p>
      </div>
      <div
        className="absolute bottom-10 flex flex-col items-center gap-1 text-purple-400"
        style={{ pointerEvents }}
      >
        <span className="text-xs tracking-widest">向下探索</span>
        <ChevronDown className="bounce-soft h-6 w-6" />
      </div>
    </motion.div>
  );
}

function AudioBars({
  active,
  color,
  compact = false,
}: {
  active: boolean;
  color: string;
  compact?: boolean;
}) {
  const heights = compact ? [10, 15, 8, 12, 6] : [18, 28, 14, 24, 10];

  return (
    <div className={`flex items-end gap-1 ${compact ? "h-4" : "h-7"}`}>
      {heights.map((height, index) => (
        <motion.span
          key={`${height}-${index}`}
          className="block w-1 rounded-full"
          style={{
            backgroundColor: active ? color : "rgba(255,255,255,0.18)",
            boxShadow: active ? `0 0 12px ${color}` : "none",
          }}
          animate={
            active
              ? {
                  height: [height * 0.45, height, height * 0.6, height * 0.88],
                  opacity: [0.75, 1, 0.82, 0.95],
                }
              : { height: compact ? 5 : 7, opacity: 0.38 }
          }
          transition={{
            duration: 1.15,
            repeat: active ? Infinity : 0,
            ease: "easeInOut",
            delay: index * 0.08,
          }}
        />
      ))}
    </div>
  );
}

function SeasonTurntable({
  seasons,
  selectedSeason,
  selectedSeasonId,
  activeTrackId,
  interactionTick,
  onSelectSeason,
  onToggleFavorite,
  onPlayTrack,
  onDeleteTrack,
  onAddTrack,
}: {
  seasons: Season[];
  selectedSeason: Season;
  selectedSeasonId: string | null;
  activeTrackId: string | null;
  interactionTick: number;
  onSelectSeason: (seasonId: string) => void;
  onToggleFavorite: (seasonId: string) => void;
  onPlayTrack: (seasonId: string, trackIndex: number) => void;
  onDeleteTrack: (seasonId: string, trackIndex: number) => void;
  onAddTrack: (seasonId: string, songTitle: string) => void;
}) {
  const meta = themeMeta[selectedSeason.theme];
  const selectedIndex = Math.max(
    0,
    seasons.findIndex((season) => season.id === selectedSeasonId),
  );
  const addTrackInputRef = useRef<HTMLInputElement>(null);
  const angleStep = seasons.length > 1 ? 360 / seasons.length : 0;
  const discAngle = selectedIndex * angleStep;
  const tonearmBase = 25 + Math.min(selectedIndex, 6) * 3;
  const isSeasonPlaying = activeTrackId?.startsWith(`${selectedSeason.id}-`) ?? false;

  return (
    <div className="relative overflow-hidden rounded-[2.5rem] border border-white/60 bg-[linear-gradient(140deg,rgba(255,255,255,0.5),rgba(245,238,255,0.74),rgba(227,215,255,0.5))] p-4 shadow-[0_30px_120px_rgba(17,24,39,0.12)] backdrop-blur-xl md:p-6">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.58),transparent_32%),radial-gradient(circle_at_bottom_left,rgba(196,181,253,0.3),transparent_28%)]" />
      <div className="relative grid gap-6 lg:grid-cols-[1.12fr_0.88fr]">
        <div className="relative overflow-hidden rounded-[2rem] border border-white/50 bg-[linear-gradient(160deg,rgba(255,255,255,0.42),rgba(229,231,235,0.36),rgba(255,255,255,0.24))] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.7),0_28px_70px_rgba(15,23,42,0.16)] backdrop-blur-xl md:p-8">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.6),transparent_36%),linear-gradient(180deg,rgba(255,255,255,0.24),transparent_46%)]" />

          <div className="relative mb-8 flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs tracking-[0.34em] text-slate-500 uppercase">
                Interactive Vinyl Turntable
              </p>
              <h3 className="font-title mt-3 text-3xl font-bold tracking-wide text-slate-900 md:text-4xl">
                巨幅黑胶四季唱机
              </h3>
              <p className="mt-3 max-w-xl text-sm leading-7 text-slate-700/80">
                点击季节切换唱片，唱针会随之抬起落下。
              </p>
            </div>

            <div className="flex flex-col items-end gap-3">
              <div className="flex items-center gap-2 rounded-full border border-white/60 bg-white/55 px-4 py-2 shadow-sm backdrop-blur-md">
                {seasons.map((season) => {
                  const lightMeta = themeMeta[season.theme];
                  const active = season.id === selectedSeason.id;

                  return (
                    <motion.button
                      key={season.id}
                      type="button"
                      onClick={() => onSelectSeason(season.id)}
                      className="group flex items-center gap-2 rounded-full px-3 py-1.5 transition-colors"
                      aria-label={`切换到 ${season.title}`}
                      whileHover={{ scale: 1.08 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <motion.span
                        className="h-4 w-4 rounded-full border border-white/70"
                        style={{
                          backgroundColor: lightMeta.glowColor,
                          boxShadow: active
                            ? `0 0 18px ${lightMeta.glowColor}, 0 0 30px ${lightMeta.glowColor}`
                            : `0 0 8px ${lightMeta.glowColor}55`,
                          opacity: active ? 1 : 0.55,
                        }}
                        animate={
                          active
                            ? {
                                scale: [1, 1.12, 1],
                                boxShadow: [
                                  `0 0 18px ${lightMeta.glowColor}, 0 0 30px ${lightMeta.glowColor}`,
                                  `0 0 24px ${lightMeta.glowColor}, 0 0 40px ${lightMeta.glowColor}`,
                                  `0 0 18px ${lightMeta.glowColor}, 0 0 30px ${lightMeta.glowColor}`,
                                ],
                              }
                            : undefined
                        }
                        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                      />
                      <span className={`text-[10px] font-medium tracking-wider ${active ? "text-slate-900" : "text-slate-500"}`}>
                        {lightMeta.label.split(" · ")[0]}
                      </span>
                    </motion.button>
                  );
                })}
              </div>

              <div className="flex items-center gap-3">
                <div
                  className="h-12 w-12 rounded-full border border-white/60 shadow-[inset_0_2px_8px_rgba(255,255,255,0.7),0_8px_20px_rgba(15,23,42,0.15)]"
                  style={{
                    background: `radial-gradient(circle at 30% 30%, #ffffff 0%, ${meta.metalTint} 42%, #cbd5e1 100%)`,
                  }}
                />
                <div
                  className="h-9 w-9 rounded-full border border-white/60 shadow-[inset_0_2px_8px_rgba(255,255,255,0.65),0_8px_18px_rgba(15,23,42,0.12)]"
                  style={{
                    background: `radial-gradient(circle at 30% 30%, #ffffff 0%, ${meta.metalTint} 46%, #94a3b8 100%)`,
                  }}
                />
                <div className="rounded-full border border-white/60 bg-slate-900/90 px-3 py-1 text-[11px] tracking-[0.3em] text-white uppercase shadow-lg">
                  {meta.label.split(" · ")[0]}
                </div>
              </div>
            </div>
          </div>

          <div className="relative flex min-h-[430px] items-center justify-center px-2 py-4">
            <motion.div
              className="pointer-events-none absolute inset-x-8 bottom-6 h-12 rounded-full blur-2xl"
              animate={{ opacity: isSeasonPlaying ? [0.42, 0.82, 0.5] : [0.28, 0.38, 0.28] }}
              transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
              style={{
                background: `radial-gradient(circle, ${meta.glowColor}90 0%, transparent 72%)`,
              }}
            />

            <div className="relative aspect-square w-full max-w-[560px]">
              <div className="absolute inset-[4%] rounded-full border border-white/35 bg-[radial-gradient(circle_at_35%_28%,rgba(255,255,255,0.45),rgba(148,163,184,0.14)_38%,rgba(15,23,42,0.22)_82%,rgba(15,23,42,0.45)_100%)] shadow-[inset_0_10px_20px_rgba(255,255,255,0.18),0_35px_80px_rgba(15,23,42,0.28)]" />

              <motion.div
                className="absolute inset-[10%]"
                animate={{ rotate: discAngle }}
                transition={{ type: "spring", stiffness: 90, damping: 18, mass: 1.3 }}
                style={{ transformOrigin: "50% 50%" }}
              >
                <div
                  className={`absolute inset-0 ${isSeasonPlaying ? "vinyl-spin-fast" : ""}`}
                  style={{ transformOrigin: "50% 50%" }}
                >
                  <motion.div
                    className="absolute inset-0 rounded-full border border-white/10 bg-[radial-gradient(circle_at_center,#161616_0%,#0a0a0a_58%,#000000_100%)] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06),inset_0_0_80px_rgba(255,255,255,0.03),0_45px_80px_rgba(0,0,0,0.42)]"
                    animate={{
                      boxShadow: isSeasonPlaying
                        ? [
                            "inset 0 0 0 1px rgba(255,255,255,0.06), inset 0 0 80px rgba(255,255,255,0.03), 0 0 40px rgba(255,255,255,0.04)",
                            `inset 0 0 0 1px rgba(255,255,255,0.06), inset 0 0 80px rgba(255,255,255,0.03), 0 0 58px ${meta.glowColor}55`,
                            "inset 0 0 0 1px rgba(255,255,255,0.06), inset 0 0 80px rgba(255,255,255,0.03), 0 0 40px rgba(255,255,255,0.04)",
                          ]
                        : undefined,
                    }}
                    transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
                  >
                  <div className="absolute inset-[2.8%] rounded-full border border-white/6 bg-[radial-gradient(circle,#0d0d0d_0%,#090909_62%,#050505_100%)]" />
                  <div className="absolute inset-[6%] rounded-full opacity-80 [background:repeating-radial-gradient(circle_at_center,rgba(255,255,255,0.08)_0_1px,rgba(0,0,0,0)_2px_9px)]" />
                  <div className="absolute inset-[10%] rounded-full opacity-55 [background:radial-gradient(circle_at_28%_22%,rgba(255,255,255,0.14),transparent_16%),radial-gradient(circle_at_70%_72%,rgba(255,255,255,0.08),transparent_18%)]" />

                  <svg
                    viewBox="0 0 100 100"
                    className="pointer-events-none absolute inset-[8%] -rotate-90"
                  >
                    <motion.circle
                      cx="50"
                      cy="50"
                      r="35"
                      fill="none"
                      stroke={meta.waveColor}
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeDasharray="72 220"
                      animate={
                        isSeasonPlaying
                          ? {
                              opacity: [0.55, 1, 0.55],
                              strokeDashoffset: [0, -20, -40],
                            }
                          : { opacity: 0.22, strokeDashoffset: 0 }
                      }
                      transition={{
                        duration: 2.2,
                        repeat: isSeasonPlaying ? Infinity : 0,
                        ease: "linear",
                      }}
                    />
                  </svg>

                  <div className="absolute inset-[31%] rounded-full border border-white/15" />
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={selectedSeason.id}
                      initial={{ opacity: 0.55, scale: 0.92 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0.45, scale: 1.04 }}
                      transition={{ duration: 0.45, ease: "easeInOut" }}
                      className="absolute inset-[32%] rounded-full border border-white/35 shadow-[0_20px_40px_rgba(0,0,0,0.22)]"
                      style={{ background: meta.labelBackground }}
                    >
                      <div className="absolute inset-[10%] rounded-full border border-white/35 bg-white/12" />
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                        <span className="text-[10px] font-semibold tracking-[0.38em] text-white/90 uppercase">
                          {meta.label.split(" · ")[0]}
                        </span>
                        <span className="font-title mt-2 text-2xl font-bold text-white drop-shadow-sm">
                          {selectedSeason.title.slice(0, 2)}
                        </span>
                        <span className="mt-2 max-w-[70%] text-[11px] leading-4 text-white/80">
                          {selectedSeason.genre}
                        </span>
                      </div>
                    </motion.div>
                  </AnimatePresence>
                  <div className="absolute inset-[46%] rounded-full bg-white/90 shadow-[0_0_20px_rgba(255,255,255,0.3)]" />
                  </motion.div>
                </div>
              </motion.div>

              <motion.div
                key={`${selectedSeason.id}-${interactionTick}`}
                className="pointer-events-none absolute right-[7%] top-[8%] h-[45%] w-[28%] origin-[82%_14%]"
                initial={{ rotate: tonearmBase - 25 }}
                animate={{
                  rotate: [
                    tonearmBase - 25,
                    tonearmBase - 48,
                    tonearmBase - 48,
                    tonearmBase + 8,
                    tonearmBase - 3,
                    tonearmBase + 1,
                    tonearmBase,
                  ],
                }}
                transition={{
                  duration: 1.15,
                  times: [0, 0.18, 0.26, 0.52, 0.65, 0.78, 1],
                  ease: [0.25, 0.1, 0.25, 1],
                }}
              >
                <div className="absolute right-[6%] top-[2%] h-6 w-6 rounded-full border border-white/60 bg-[radial-gradient(circle,#ffffff_0%,#d1d5db_48%,#94a3b8_100%)] shadow-[0_8px_20px_rgba(15,23,42,0.24)]" />
                <div
                  className="absolute left-[8%] top-[15%] h-4 w-4 rounded-full border border-white/50"
                  style={{
                    background: `radial-gradient(circle, #ffffff 0%, ${meta.metalTint} 55%, #94a3b8 100%)`,
                  }}
                />
                <div
                  className="absolute right-[13%] top-[14%] h-[10px] w-[78%] rounded-full"
                  style={{
                    background:
                      "linear-gradient(90deg, rgba(255,255,255,0.78), rgba(226,232,240,0.92), rgba(100,116,139,0.96))",
                    boxShadow: "0 6px 14px rgba(15,23,42,0.18)",
                  }}
                />
                <div
                  className="absolute left-[6%] top-[11%] h-[18px] w-[26px] rounded-full"
                  style={{
                    background: `linear-gradient(180deg, #ffffff, ${meta.metalTint}, #94a3b8)`,
                  }}
                />
                <motion.div
                  className="absolute left-[0%] top-[10%] h-[20px] w-[34px] rounded-[999px_999px_12px_12px] border border-white/35 bg-slate-900/95"
                  animate={{
                    y: [0, -3, -3, 4, -2, 1, 0],
                    rotate: [0, -4, -4, 6, -3, 1, 0],
                    scale: [1, 1, 1, 1.08, 0.98, 1.01, 1],
                  }}
                  transition={{
                    duration: 1.15,
                    times: [0, 0.18, 0.26, 0.52, 0.65, 0.78, 1],
                    ease: [0.25, 0.1, 0.25, 1],
                  }}
                />
              </motion.div>

              <div className="pointer-events-none absolute right-[2%] top-1/2 flex -translate-y-1/2 flex-col gap-2">
                <AudioBars active={isSeasonPlaying} color={meta.waveColor} />
                <span className="text-[10px] tracking-[0.34em] text-slate-500 uppercase">
                  Wave
                </span>
              </div>
            </div>
          </div>

          <div className="relative mt-2 flex flex-wrap gap-3">
            {seasons.map((season, index) => {
              const seasonMeta = themeMeta[season.theme];
              const active = season.id === selectedSeason.id;
              const angle = Math.round(index * angleStep);

              return (
                <motion.button
                  key={season.id}
                  type="button"
                  onClick={() => onSelectSeason(season.id)}
                  className={`group inline-flex items-center gap-3 rounded-full border px-4 py-2 text-left transition-all ${
                    active
                      ? "border-slate-900 bg-slate-950 text-white shadow-lg"
                      : "border-white/60 bg-white/65 text-slate-700 hover:border-slate-300 hover:bg-white"
                  }`}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <motion.span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{
                      backgroundColor: seasonMeta.glowColor,
                      boxShadow: `0 0 12px ${seasonMeta.glowColor}`,
                    }}
                    animate={{
                      scale: [1, 1.2, 1],
                      opacity: [0.8, 1, 0.8],
                    }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  />
                  <span className="text-sm font-medium">{season.title}</span>
                  <span className={`text-[10px] tracking-[0.3em] uppercase ${active ? "text-white/65" : "text-slate-400"}`}>
                    {angle}°
                  </span>
                </motion.button>
              );
            })}
          </div>
        </div>

        <div className="relative flex min-h-[560px] items-stretch">
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedSeason.id}
              initial={{ opacity: 0, x: 36, scale: 0.98 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 20, scale: 0.98 }}
              transition={{ duration: 0.42, ease: "easeInOut" }}
              className="relative w-full rounded-[2rem] border border-white/45 bg-[linear-gradient(160deg,rgba(17,24,39,0.92),rgba(30,41,59,0.88),rgba(15,23,42,0.95))] p-6 shadow-[0_35px_90px_rgba(15,23,42,0.28)]"
            >
              <div
                className="pointer-events-none absolute inset-0 rounded-[2rem] opacity-75"
                style={{
                  background: `radial-gradient(circle at top right, ${meta.glowColor}28 0%, transparent 34%), linear-gradient(180deg, rgba(255,255,255,0.06), transparent 24%)`,
                }}
              />

              <div className="relative flex h-full flex-col">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p
                      className="text-xs font-semibold tracking-[0.32em] uppercase"
                      style={{ color: meta.waveColor }}
                    >
                      {meta.label}
                    </p>
                    <h3 className="font-title mt-3 text-3xl font-bold text-white md:text-[2.1rem]">
                      {selectedSeason.title}
                    </h3>
                    <p className="mt-3 max-w-xl text-sm leading-7 text-slate-300/85">
                      {selectedSeason.subtitle}
                    </p>
                  </div>
                  <motion.button
                    type="button"
                    onClick={() => onToggleFavorite(selectedSeason.id)}
                    className={`rounded-full border px-3 py-2 text-xs tracking-[0.24em] uppercase transition-all ${
                      selectedSeason.favorite
                        ? "border-fuchsia-300/50 bg-fuchsia-400/18 text-fuchsia-100"
                        : "border-white/15 bg-white/6 text-slate-300 hover:border-white/30 hover:bg-white/10"
                    }`}
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.95 }}
                    animate={
                      selectedSeason.favorite
                        ? {
                            boxShadow: [
                              "0 0 12px rgba(244,114,182,0.3)",
                              "0 0 24px rgba(244,114,182,0.5)",
                              "0 0 12px rgba(244,114,182,0.3)",
                            ],
                          }
                        : undefined
                    }
                    transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
                  >
                    {selectedSeason.favorite ? "Fav On" : "收藏"}
                  </motion.button>
                </div>

                <div className="mt-6 flex items-center justify-between gap-4 rounded-[1.6rem] border border-white/10 bg-white/6 px-4 py-3">
                  <div>
                    <p className="text-xs tracking-[0.28em] text-slate-400 uppercase">Record Sleeve</p>
                    <p className="mt-2 text-sm text-white/85">{selectedSeason.genre}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <AudioBars active={isSeasonPlaying} color={meta.waveColor} compact />
                    <span className="text-[11px] tracking-[0.3em] text-slate-400 uppercase">
                      On Air
                    </span>
                  </div>
                </div>

                <div className="mt-6 space-y-3">
                  {selectedSeason.items.map((item, index) => {
                    const trackKey = `${selectedSeason.id}-${index}`;
                    const playing = activeTrackId === trackKey;

                    return (
                      <motion.div
                        key={trackKey}
                        layout
                        className={`rounded-[1.4rem] border px-4 py-4 transition-all ${
                          playing
                            ? "border-white/25 bg-white/12 shadow-[0_0_30px_rgba(255,255,255,0.08)]"
                            : "border-white/10 bg-black/12 hover:border-white/20 hover:bg-white/8"
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <motion.button
                            type="button"
                            onClick={() => onPlayTrack(selectedSeason.id, index)}
                            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/8 text-white transition-colors hover:bg-white/14"
                            aria-label={playing ? `暂停 ${item}` : `播放 ${item}`}
                            whileHover={{ scale: 1.1, boxShadow: "0 0 20px rgba(255,255,255,0.3)" }}
                            whileTap={{ scale: 0.9 }}
                          >
                            {playing ? (
                              <Pause className="h-4 w-4" />
                            ) : (
                              <Play className="h-4 w-4" />
                            )}
                          </motion.button>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-3">
                              <div className="min-w-0">
                                <p className="truncate text-sm font-semibold text-white">{item}</p>
                                <p className="mt-1 text-xs text-slate-400">
                                  {selectedSeason.title} · Track {String(index + 1).padStart(2, "0")}
                                </p>
                              </div>
                              <div className="flex items-center gap-3">
                                <AudioBars active={playing} color={meta.waveColor} compact />
                                <span className={`text-[10px] tracking-[0.32em] uppercase ${playing ? "text-white/75" : "text-slate-500"}`}>
                                  {playing ? "Playing" : "Ready"}
                                </span>
                              </div>
                            </div>
                          </div>

                          <motion.button
                            type="button"
                            onClick={() => onDeleteTrack(selectedSeason.id, index)}
                            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/4 text-slate-400 transition-colors hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-400"
                            aria-label={`删除 ${item}`}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </motion.button>
                        </div>
                      </motion.div>
                    );
                  })}

                  <motion.div
                    layout
                    className="rounded-[1.4rem] border border-dashed border-white/20 bg-white/6 px-4 py-3"
                  >
                    <div className="flex items-center gap-3">
                      <input
                        ref={addTrackInputRef}
                        type="text"
                        placeholder="添加新歌曲（格式：歌手 - 歌名）"
                        className="flex-1 bg-transparent text-sm text-white placeholder:text-slate-500 outline-none"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            onAddTrack(selectedSeason.id, e.currentTarget.value);
                            e.currentTarget.value = "";
                          }
                        }}
                      />
                      <motion.button
                        type="button"
                        onClick={() => {
                          const input = addTrackInputRef.current;
                          if (input) {
                            onAddTrack(selectedSeason.id, input.value);
                            input.value = "";
                            input.focus();
                          }
                        }}
                        className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white hover:bg-white/20"
                        aria-label="添加歌曲"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <Plus className="h-4 w-4" />
                      </motion.button>
                    </div>
                  </motion.div>
                </div>

                <div className="mt-6 flex flex-wrap items-center gap-3">
                  {seasons.map((season) => {
                    const seasonMeta = themeMeta[season.theme];
                    const active = season.id === selectedSeason.id;

                    return (
                      <motion.button
                        key={season.id}
                        type="button"
                        onClick={() => onSelectSeason(season.id)}
                        className={`rounded-full border px-4 py-2 text-xs tracking-[0.28em] uppercase transition-all ${
                          active
                            ? "border-white/35 bg-white/15 text-white"
                            : "border-white/10 bg-white/5 text-slate-400 hover:border-white/20 hover:text-white"
                        }`}
                        style={
                          active
                            ? {
                                boxShadow: `0 0 24px ${seasonMeta.glowColor}33`,
                              }
                            : undefined
                        }
                        whileHover={{ scale: 1.08 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {seasonMeta.label.split(" · ")[0]}
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function ConcertTicket({
  concert,
  onOpenAlbum,
}: {
  concert: Concert;
  onOpenAlbum: () => void;
}) {
  const attended = concert.status === "attended";

  return (
    <motion.div
      whileHover={{ y: -3 }}
      className="relative flex flex-col overflow-hidden rounded-sm shadow-lg md:flex-row"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-white to-violet-50" />
      <div className="relative flex flex-1 flex-col border border-purple-200/80 md:flex-row">
        <div className="relative flex min-h-[110px] flex-col items-center justify-center bg-gradient-to-b from-purple-900 to-violet-800 p-5 text-white md:w-28">
          <Ticket className="mb-2 h-8 w-8 opacity-80" />
          <span className="text-[9px] tracking-[0.25em] uppercase opacity-70">Live</span>
          <span className="font-title text-lg font-bold">{concert.date.slice(0, 4)}</span>
        </div>

        <div className="relative hidden w-px md:block">
          <div className="absolute inset-y-0 left-0 w-px border-l-2 border-dashed border-purple-300" />
          <div className="absolute -top-3 left-1/2 h-6 w-6 -translate-x-1/2 rounded-full bg-[#f5f3ff]" />
          <div className="absolute top-1/2 left-1/2 h-6 w-6 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#f5f3ff]" />
          <div className="absolute -bottom-3 left-1/2 h-6 w-6 -translate-x-1/2 rounded-full bg-[#f5f3ff]" />
        </div>

        <div className="relative flex flex-1 flex-col justify-between border-b border-dashed border-purple-200 p-6 md:border-r md:border-b-0">
          <div>
            <div className="mb-2 flex flex-wrap items-start justify-between gap-3">
              <h3 className="text-lg font-bold text-purple-900">
                {concert.artist} {concert.tour}
              </h3>
              <span
                className={`rounded-full px-2.5 py-0.5 text-[10px] font-medium ${
                  attended
                    ? "bg-purple-100 text-purple-800"
                    : "bg-amber-100 text-amber-700"
                }`}
              >
                {attended ? "已观演" : "想去现场"}
              </span>
            </div>
            <p className="mb-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-purple-700/80">
              <span className="inline-flex items-center gap-1">
                <Calendar className="h-3 w-3" /> {concert.date}
              </span>
              <span className="inline-flex items-center gap-1">
                <MapPin className="h-3 w-3" /> {concert.venue}
              </span>
            </p>
          </div>
          <p className="rounded-lg border border-purple-100/60 bg-white/70 p-3 text-xs text-purple-950 italic">
            &ldquo;{concert.quote}&rdquo;
          </p>
        </div>

        <div className="relative flex flex-col items-center justify-center border-t border-dashed border-purple-200 bg-purple-50/60 p-5 text-center md:w-48 md:border-t-0">
          <div className="absolute -left-3 top-1/2 hidden h-6 w-6 -translate-y-1/2 rounded-full bg-[#f5f3ff] md:block" />
          <span className="mb-0.5 text-[9px] font-bold tracking-[0.3em] text-purple-400 uppercase">
            副券 Stub
          </span>
          <span className="mb-0.5 text-[10px] tracking-widest text-purple-400 uppercase">
            Seat / 区域
          </span>
          <span className="font-title mb-3 text-sm font-bold text-purple-900">
            {concert.seat}
          </span>
          <span className="mb-4 text-[11px] text-purple-500/80">相册 {concert.photos.length} 张</span>
          <button
            type="button"
            onClick={onOpenAlbum}
            className="w-full cursor-pointer rounded-sm bg-purple-900 py-2 text-xs text-white transition-colors hover:bg-purple-800"
          >
            {concert.photos.length > 0 ? "查看纪念相册" : "上传后可预览相册"}
          </button>
        </div>
      </div>
    </motion.div>
  );
}

type ToastType = "success" | "error" | "info" | "warning";

type Toast = {
  id: string;
  message: string;
  type: ToastType;
};

function ToastContainer({ toasts, removeToast }: { toasts: Toast[]; removeToast: (id: string) => void }) {
  return (
    <div className="fixed bottom-6 right-6 z-[200] flex flex-col gap-3">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, x: 100, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            onClick={() => removeToast(toast.id)}
            className={`flex items-center gap-3 rounded-xl px-4 py-3 shadow-lg backdrop-blur-md cursor-pointer ${
              toast.type === "success"
                ? "bg-green-500/90 text-white"
                : toast.type === "error"
                ? "bg-red-500/90 text-white"
                : toast.type === "warning"
                ? "bg-amber-500/90 text-white"
                : "bg-purple-500/90 text-white"
            }`}
          >
            {toast.type === "success" && <Check className="h-5 w-5" />}
            {toast.type === "error" && <X className="h-5 w-5" />}
            {toast.type === "warning" && <AlertTriangle className="h-5 w-5" />}
            {toast.type === "info" && <Info className="h-5 w-5" />}
            <span className="text-sm font-medium">{toast.message}</span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

function ConfirmDialog({
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "确认",
  cancelText = "取消",
}: {
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[150] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ type: "spring", stiffness: 260, damping: 24 }}
        className="relative z-10 w-full max-w-sm overflow-hidden rounded-2xl border border-white/20 bg-white/95 shadow-2xl backdrop-blur-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="p-6">
          <div className="mb-4 flex justify-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
              <AlertCircle className="h-6 w-6 text-red-500" />
            </div>
          </div>
          <h3 className="text-center text-lg font-semibold text-gray-900">{title}</h3>
          <p className="mt-2 text-center text-sm text-gray-600">{message}</p>
        </div>
        <div className="flex border-t border-gray-100">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-3 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="flex-1 border-l border-gray-100 px-4 py-3 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
          >
            {confirmText}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function AlbumModal({
  concert,
  onClose,
  onRemovePhoto,
  onUpdatePhoto,
  onReplacePhoto,
}: {
  concert: Concert;
  onClose: () => void;
  onRemovePhoto: (photoId: string) => void;
  onUpdatePhoto: (photoId: string, updates: Partial<ConcertPhoto>) => void;
  onReplacePhoto: (photoId: string, file: File) => void;
}) {
  const [selectedPhotoId, setSelectedPhotoId] = useState<string | null>(concert.photos[0]?.id ?? null);
  const [editingCaptionId, setEditingCaptionId] = useState<string | null>(null);
  const [editCaptionValue, setEditCaptionValue] = useState("");
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  useEffect(() => {
    setSelectedPhotoId(concert.photos[0]?.id ?? null);
  }, [concert]);

  const startEditCaption = (photoId: string, caption: string) => {
    setEditingCaptionId(photoId);
    setEditCaptionValue(caption);
  };

  const saveEditCaption = (photoId: string) => {
    onUpdatePhoto(photoId, { caption: editCaptionValue });
    setEditingCaptionId(null);
    setEditCaptionValue("");
  };

  const handleReplacePhoto = (event: ChangeEvent<HTMLInputElement>, photoId: string) => {
    const file = event.target.files?.[0];
    if (file) {
      onReplacePhoto(photoId, file);
    }
    event.target.value = "";
  };

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [onClose]);

  const selectedPhoto = concert.photos.find((photo) => photo.id === selectedPhotoId) ?? concert.photos[0];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-purple-950/50 backdrop-blur-md" />
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 24 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 24 }}
        transition={{ type: "spring", stiffness: 260, damping: 24 }}
        className="relative z-10 w-full max-w-4xl overflow-hidden rounded-[2rem] border border-white/15 bg-[#16082b]/85 shadow-2xl backdrop-blur-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
          <div>
            <h3 className="font-title text-lg font-bold text-white">{concert.artist} · 纪念相册</h3>
            <p className="text-xs text-purple-200/70">{concert.date}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-purple-200 transition-colors hover:bg-white/10 hover:text-white"
            aria-label="关闭"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="grid gap-4 p-6 lg:grid-cols-[1.4fr_0.8fr]">
          <div className="space-y-4">
            <div
              className="relative aspect-[16/10] overflow-hidden rounded-[1.5rem] border border-white/10 bg-white/5 cursor-pointer"
              onClick={() => selectedPhoto && selectedPhoto.image && setIsLightboxOpen(true)}
            >
              {selectedPhoto ? (
                selectedPhoto.image ? (
                  <>
                    <Image
                      src={selectedPhoto.image}
                      alt={selectedPhoto.caption}
                      fill
                      unoptimized
                      className="object-cover"
                    />
                    <div className="absolute bottom-3 right-3 flex items-center gap-1.5 rounded-full bg-black/50 px-2.5 py-1 text-xs text-white/80 backdrop-blur-sm">
                      <ZoomIn className="h-3.5 w-3.5" /> 点击放大
                    </div>
                  </>
                ) : (
                  <div className={`absolute inset-0 bg-gradient-to-br ${selectedPhoto.gradient}`} />
                )
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-gradient-to-br from-violet-900/80 via-purple-950 to-black text-center text-purple-200">
                  <ImagePlus className="h-8 w-8" />
                  <p className="text-sm">这场演出还没有上传照片</p>
                </div>
              )}
              {selectedPhoto && <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />}
            </div>

            <AnimatePresence>
              {isLightboxOpen && selectedPhoto && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-[200] flex items-center justify-center"
                  onClick={() => setIsLightboxOpen(false)}
                >
                  <div className="absolute inset-0 bg-black/90 backdrop-blur-md" />
                  <motion.button
                    type="button"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    onClick={() => setIsLightboxOpen(false)}
                    className="absolute right-4 top-4 z-10 rounded-full p-2 text-white transition-colors hover:bg-white/20"
                    aria-label="关闭全屏"
                  >
                    <X className="h-6 w-6" />
                  </motion.button>
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 200, damping: 20 }}
                    onClick={(event) => event.stopPropagation()}
                    className="relative z-10 max-h-[90vh] max-w-[90vw] flex items-center justify-center"
                  >
                    {selectedPhoto.image && (
                      <div className="relative max-h-[90vh] max-w-[90vw]">
                        <Image
                          src={selectedPhoto.image}
                          alt={selectedPhoto.caption}
                          fill
                          className="rounded-lg shadow-2xl object-contain"
                          unoptimized
                        />
                      </div>
                    )}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-black/60 px-4 py-2 text-sm text-white backdrop-blur-sm">
                      {selectedPhoto.caption}
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
              <div className="mb-3 flex items-center justify-between gap-3">
                {editingCaptionId === selectedPhoto?.id ? (
                  <div className="flex items-center gap-2">
                    <input
                      value={editCaptionValue}
                      onChange={(event) => setEditCaptionValue(event.target.value)}
                      onBlur={() => saveEditCaption(selectedPhoto.id)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") saveEditCaption(selectedPhoto.id);
                        if (event.key === "Escape") setEditingCaptionId(null);
                      }}
                      className="w-48 rounded-xl border border-fuchsia-400/50 bg-white/10 px-3 py-1.5 text-sm text-white outline-none"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => saveEditCaption(selectedPhoto.id)}
                      className="rounded-full p-1.5 text-fuchsia-300 transition-colors hover:bg-white/10"
                    >
                      <Check className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <p className="text-sm text-white/90">{selectedPhoto?.caption ?? "等待新的现场照片"}</p>
                    {selectedPhoto && (
                      <button
                        type="button"
                        onClick={() => startEditCaption(selectedPhoto.id, selectedPhoto.caption)}
                        className="rounded-full p-1 text-purple-300/70 transition-colors hover:text-fuchsia-300"
                        aria-label="编辑标题"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                )}
                {selectedPhoto && (
                  <div className="flex items-center gap-2">
                    <label className="inline-flex items-center gap-1 rounded-full border border-purple-300/30 bg-purple-500/10 px-3 py-1 text-xs text-purple-200 transition-colors hover:bg-purple-500/20 cursor-pointer">
                      <Upload className="h-3.5 w-3.5" /> 替换
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(event) => handleReplacePhoto(event, selectedPhoto.id)}
                        className="hidden"
                      />
                    </label>
                    <button
                      type="button"
                      onClick={() => onRemovePhoto(selectedPhoto.id)}
                      className="inline-flex items-center gap-1 rounded-full border border-red-300/30 bg-red-500/10 px-3 py-1 text-xs text-red-200 transition-colors hover:bg-red-500/20"
                    >
                      <Trash2 className="h-3.5 w-3.5" /> 删除
                    </button>
                  </div>
                )}
              </div>
              <p className="text-xs leading-6 text-purple-200/75">
                点击缩略图切换预览
              </p>
            </div>
          </div>

          <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-semibold text-white">现场缩略图</p>
              <span className="text-xs text-purple-200/60">{concert.photos.length} 张</span>
            </div>
            <div className="grid max-h-[460px] gap-3 overflow-y-auto pr-1 sm:grid-cols-2 lg:grid-cols-1">
              {concert.photos.map((photo) => {
                const active = photo.id === selectedPhoto?.id;
                return (
                  <button
                    key={photo.id}
                    type="button"
                    onClick={() => setSelectedPhotoId(photo.id)}
                    className={`relative aspect-[4/3] overflow-hidden rounded-2xl border text-left transition-all ${
                      active
                        ? "border-fuchsia-300 shadow-[0_0_20px_rgba(244,114,182,0.3)]"
                        : "border-white/10 hover:border-purple-200/60"
                    }`}
                  >
                    {photo.image ? (
                      <Image
                        src={photo.image}
                        alt={photo.caption}
                        fill
                        unoptimized
                        className="object-cover"
                      />
                    ) : (
                      <div className={`absolute inset-0 bg-gradient-to-br ${photo.gradient}`} />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />
                    <div className="absolute inset-x-0 bottom-0 p-3">
                      <p className="text-xs text-white/90">{photo.caption}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function KtvSongRow({
  song,
  isActive,
  onSing,
  bursts,
  onDelete,
}: {
  song: KtvSong;
  isActive: boolean;
  onSing: (event: ReactMouseEvent) => void;
  bursts: FloatBurst[];
  onDelete: () => void;
}) {
  return (
    <div className="relative overflow-visible rounded-3xl border border-purple-800/50 bg-purple-950/45 p-4 transition-all hover:border-fuchsia-500/40 hover:bg-purple-900/35">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-4">
          <span className="font-title text-lg font-bold text-purple-600/60">{song.plays}</span>
          <div>
            <h4 className="text-sm font-bold text-purple-100">{song.title}</h4>
            <p className="text-xs text-purple-400">{song.artist}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isActive && (
            <motion.span
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="neon-pulse rounded-full border border-fuchsia-400/50 bg-fuchsia-500/20 px-2.5 py-0.5 text-[10px] font-bold tracking-wider text-fuchsia-300"
            >
              当前热唱
            </motion.span>
          )}
          <span className="hidden rounded-full bg-purple-800/60 px-2 py-0.5 text-[10px] text-purple-300 sm:inline">
            {song.tag}
          </span>
          <motion.button
            type="button"
            onClick={onDelete}
            className="rounded-full p-2 text-purple-500 transition-colors hover:bg-purple-800/50 hover:text-red-300"
            aria-label={`删除 ${song.title}`}
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
          >
            <Trash2 className="h-4 w-4" />
          </motion.button>
          <motion.button
            type="button"
            onClick={onSing}
            className={`rounded-full p-2 transition-all ${
              isActive
                ? "bg-fuchsia-500/30 text-fuchsia-300 shadow-[0_0_15px_rgba(236,72,153,0.5)]"
                : "text-purple-500 hover:bg-purple-800/50 hover:text-fuchsia-300"
            }`}
            aria-label={`点唱 ${song.title}`}
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.9 }}
            animate={
              isActive
                ? {
                    scale: [1, 1.1, 1],
                    boxShadow: [
                      "0 0 15px rgba(236,72,153,0.5)",
                      "0 0 25px rgba(236,72,153,0.7)",
                      "0 0 15px rgba(236,72,153,0.5)",
                    ],
                  }
                : undefined
            }
            transition={{ duration: 0.8, repeat: Infinity, ease: "easeInOut" }}
          >
            <Mic className="h-4 w-4" />
          </motion.button>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between text-xs text-purple-300/70">
        <span>{song.tag}</span>
        <span>已点唱 {song.plays} 次</span>
      </div>

      <AnimatePresence>
        {bursts.map((burst) => (
          <motion.div
            key={burst.id}
            initial={{ opacity: 1, y: 0, scale: 0.6 }}
            animate={{ opacity: 0, y: -50, scale: 1.2 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="pointer-events-none absolute top-2 text-fuchsia-400"
            style={{ left: burst.x }}
          >
            {burst.type === "heart" ? (
              <Heart className="h-5 w-5 fill-fuchsia-400/60" />
            ) : (
              <Music2 className="h-5 w-5" />
            )}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

export default function HomePage() {
  const { scrollY } = useScroll();
  const introOpacity = useTransform(scrollY, [0, 200, 450], [1, 0.6, 0]);
  const mainY = useTransform(scrollY, [0, 500], [80, 0]);
  const navOpacity = useTransform(scrollY, [300, 500], [0, 1]);

  const [seasons, setSeasons] = useState<Season[]>(DEFAULT_SEASONS);
  const [concerts, setConcerts] = useState<Concert[]>(DEFAULT_CONCERTS);
  const [ktvSongs, setKtvSongs] = useState<KtvSong[]>(DEFAULT_KTV_SONGS);
  const [isHydrated, setIsHydrated] = useState(false);

  const [selectedSeasonId, setSelectedSeasonId] = useState<string | null>(
    DEFAULT_SEASONS[0]?.id ?? null,
  );
  const [openConcertId, setOpenConcertId] = useState<string | null>(null);
  const [activeSongId, setActiveSongId] = useState<string | null>(null);
  const [activeSeasonTrackId, setActiveSeasonTrackId] = useState<string | null>(null);
  const [floatBursts, setFloatBursts] = useState<Record<string, FloatBurst[]>>({});
  const [pointerEvents, setPointerEvents] = useState<"auto" | "none">("auto");
  const [concertFilter, setConcertFilter] = useState<ConcertStatus | "all">("all");
  const [songQuery, setSongQuery] = useState("");
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editorTab, setEditorTab] = useState<"seasons" | "concerts" | "ktv">("seasons");
  const [seasonForm, setSeasonForm] = useState(emptySeasonForm);
  const [concertForm, setConcertForm] = useState(emptyConcertForm);
  const [concertDraftPhotos, setConcertDraftPhotos] = useState<ConcertPhoto[]>([]);
  const [photoTargetConcertId, setPhotoTargetConcertId] = useState<string>(
    DEFAULT_CONCERTS[0]?.id ?? "",
  );
  const [ktvForm, setKtvForm] = useState(emptyKtvForm);
  const [seasonInteractionTick, setSeasonInteractionTick] = useState(0);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  } | null>(null);
  const [editingConcertId, setEditingConcertId] = useState<string | null>(null);
  const [concertSearchQuery, setConcertSearchQuery] = useState("");
  const [diaryEntries, setDiaryEntries] = useState<DiaryEntry[]>([]);
  const [isDiaryWriting, setIsDiaryWriting] = useState(false);
  const [diaryMood, setDiaryMood] = useState<Mood>("calm");
  const [diaryMessage, setDiaryMessage] = useState("");
  const [diarySongTitle, setDiarySongTitle] = useState("");
  const [diarySongArtist, setDiarySongArtist] = useState("");
  const [diaryDeleteConfirm, setDiaryDeleteConfirm] = useState<string | null>(null);
  const burstIdRef = useRef(0);

  useEffect(() => {
    const storedVersion = window.localStorage.getItem(STORAGE_KEYS.version);
    if (storedVersion !== DATA_VERSION) {
      window.localStorage.removeItem(STORAGE_KEYS.seasons);
      window.localStorage.removeItem(STORAGE_KEYS.concerts);
      window.localStorage.removeItem(STORAGE_KEYS.ktv);
      window.localStorage.setItem(STORAGE_KEYS.version, DATA_VERSION);
    }

    setSeasons(
      safeParse<Season[]>(
        window.localStorage.getItem(STORAGE_KEYS.seasons),
        DEFAULT_SEASONS,
      ),
    );
    setConcerts(
      safeParse<Concert[]>(
        window.localStorage.getItem(STORAGE_KEYS.concerts),
        DEFAULT_CONCERTS,
      ),
    );
    setKtvSongs(
      safeParse<KtvSong[]>(window.localStorage.getItem(STORAGE_KEYS.ktv), DEFAULT_KTV_SONGS),
    );
    setDiaryEntries(
      safeParse<DiaryEntry[]>(window.localStorage.getItem(STORAGE_KEYS.diary), []),
    );
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!isHydrated) return;

    window.localStorage.setItem(STORAGE_KEYS.seasons, JSON.stringify(seasons));
    window.localStorage.setItem(STORAGE_KEYS.concerts, JSON.stringify(concerts));
    window.localStorage.setItem(STORAGE_KEYS.ktv, JSON.stringify(ktvSongs));
    window.localStorage.setItem(STORAGE_KEYS.diary, JSON.stringify(diaryEntries));
  }, [concerts, diaryEntries, isHydrated, ktvSongs, seasons]);

  useEffect(() => {
    const unsubscribe = introOpacity.on("change", (value) => {
      setPointerEvents(value < 0.3 ? "none" : "auto");
    });

    return unsubscribe;
  }, [introOpacity]);

  useEffect(() => {
    if (!selectedSeasonId || seasons.some((season) => season.id === selectedSeasonId)) return;
    setSelectedSeasonId(seasons[0]?.id ?? null);
  }, [selectedSeasonId, seasons]);

  useEffect(() => {
    if (!photoTargetConcertId || concerts.some((concert) => concert.id === photoTargetConcertId)) {
      return;
    }
    setPhotoTargetConcertId(concerts[0]?.id ?? "");
  }, [concerts, photoTargetConcertId]);

  const filteredConcerts = useMemo(() => {
    let result = concerts;
    if (concertFilter !== "all") {
      result = result.filter((concert) => concert.status === concertFilter);
    }
    const searchKeyword = concertSearchQuery.trim().toLowerCase();
    if (searchKeyword) {
      result = result.filter(
        (concert) =>
          concert.artist.toLowerCase().includes(searchKeyword) ||
          concert.tour.toLowerCase().includes(searchKeyword),
      );
    }
    return result;
  }, [concertFilter, concerts, concertSearchQuery]);

  const formatDiaryDate = (dateStr: string) => {
    const [year, month, day] = dateStr.split("-");
    const date = new Date(Number(year), Number(month) - 1, Number(day));
    const weekdays = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];
    return {
      year,
      month,
      day,
      weekday: weekdays[date.getDay()],
    };
  };

  const sortedDiaryEntries = useMemo(() => {
    return [...diaryEntries].sort((a, b) => b.date.localeCompare(a.date));
  }, [diaryEntries]);

  const todayDiaryEntry = useMemo(() => {
    const todayStr = new Date().toISOString().split("T")[0];
    return diaryEntries.find((e) => e.date === todayStr);
  }, [diaryEntries]);

  const handleDiarySubmit = () => {
    if (!diaryMessage.trim() || !diarySongTitle.trim()) return;

    const todayStr = new Date().toISOString().split("T")[0];
    const newEntry: DiaryEntry = {
      id: `diary-${Date.now()}`,
      date: todayStr,
      mood: diaryMood,
      message: diaryMessage.trim(),
      songTitle: diarySongTitle.trim(),
      songArtist: diarySongArtist.trim() || "未知歌手",
    };

    const existingIndex = diaryEntries.findIndex((e) => e.date === todayStr);
    let newEntries: DiaryEntry[];
    if (existingIndex >= 0) {
      newEntries = [...diaryEntries];
      newEntries[existingIndex] = newEntry;
    } else {
      newEntries = [newEntry, ...diaryEntries];
    }

    setDiaryEntries(newEntries);
    setIsDiaryWriting(false);
    setDiaryMessage("");
    setDiarySongTitle("");
    setDiarySongArtist("");
    setDiaryMood("calm");
  };

  const handleDiaryDelete = (id: string) => {
    setDiaryEntries((prev) => prev.filter((e) => e.id !== id));
    setDiaryDeleteConfirm(null);
  };

  const filteredSongs = useMemo(() => {
    const keyword = songQuery.trim().toLowerCase();

    return [...ktvSongs]
      .filter((song) => {
        if (!keyword) return true;
        return [song.title, song.artist, song.tag].some((value) =>
          value.toLowerCase().includes(keyword),
        );
      })
      .sort((first, second) => second.plays - first.plays);
  }, [ktvSongs, songQuery]);

  const selectedSeason = seasons.find((season) => season.id === selectedSeasonId) ?? seasons[0];
  const openConcert = concerts.find((concert) => concert.id === openConcertId);
  const attendedCount = concerts.filter((concert) => concert.status === "attended").length;
  const totalPhotoCount = concerts.reduce((count, concert) => count + concert.photos.length, 0);
  const favoriteCount = seasons.filter((season) => season.favorite).length;

  const handleSelectSeason = (seasonId: string) => {
    setSelectedSeasonId(seasonId);
    setSeasonInteractionTick((prev) => prev + 1);
    playTonearmClick();
  };

  const handlePlaySeasonTrack = (seasonId: string, trackIndex: number) => {
    const trackKey = `${seasonId}-${trackIndex}`;
    if (activeSeasonTrackId === trackKey) {
      setActiveSeasonTrackId(null);
    } else {
      setActiveSeasonTrackId(trackKey);
      handleSelectSeason(seasonId);
      setTimeout(playVinylCrackle, 150);
    }
  };

  const handleDeleteSeasonTrack = (seasonId: string, trackIndex: number) => {
    setSeasons((prev) =>
      prev.map((season) =>
        season.id === seasonId
          ? {
              ...season,
              items: season.items.filter((_, i) => i !== trackIndex),
            }
          : season,
      ),
    );
    if (activeSeasonTrackId === `${seasonId}-${trackIndex}`) {
      setActiveSeasonTrackId(null);
    }
  };

  const handleAddSeasonTrack = (seasonId: string, songTitle: string) => {
    if (!songTitle.trim()) return;
    setSeasons((prev) =>
      prev.map((season) =>
        season.id === seasonId
          ? {
              ...season,
              items: [...season.items, songTitle.trim()],
            }
          : season,
      ),
    );
  };

  const audioContextRef = useRef<AudioContext | null>(null);

  const getAudioContext = async () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext();
    }
    if (audioContextRef.current.state === "suspended") {
      await audioContextRef.current.resume();
    }
    return audioContextRef.current;
  };

  const playTonearmClick = useCallback(async () => {
    try {
      const ctx = await getAudioContext();
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.type = "triangle";
      oscillator.frequency.setValueAtTime(800, ctx.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.08);

      gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);

      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.1);
    } catch {
      // Audio not supported
    }
  }, []);

  const playVinylCrackle = useCallback(async () => {
    try {
      const ctx = await getAudioContext();
      const bufferSize = ctx.sampleRate * 2;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);

      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * 0.05;
        if (Math.random() > 0.98) {
          data[i] *= Math.random() * 5 + 1;
        }
      }

      const source = ctx.createBufferSource();
      const gainNode = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      source.buffer = buffer;
      filter.type = "highpass";
      filter.frequency.value = 2000;

      source.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(ctx.destination);

      gainNode.gain.setValueAtTime(0.08, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 2);

      source.start(ctx.currentTime);
    } catch {
      // Audio not supported
    }
  }, []);

  const showToast = useCallback((message: string, type: ToastType = "success") => {
    const id = createId("toast");
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 3000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const showConfirmDialog = useCallback((
    title: string,
    message: string,
    onConfirm: () => void,
  ) => {
    setConfirmDialog({ isOpen: true, title, message, onConfirm });
  }, []);

  const closeConfirmDialog = useCallback(() => {
    setConfirmDialog(null);
  }, []);

  const handleSing = (songId: string, event: ReactMouseEvent) => {
    setActiveSongId(songId);
    setKtvSongs((prev) =>
      prev.map((song) => (song.id === songId ? { ...song, plays: song.plays + 1 } : song)),
    );
    showToast("已记录点唱！");

    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    const parent = (event.currentTarget as HTMLElement).closest(".relative");
    const parentRect = parent?.getBoundingClientRect();
    const x = rect.left - (parentRect?.left ?? 0) - 12;

    const burst: FloatBurst = {
      id: burstIdRef.current++,
      x,
      type: Math.random() > 0.5 ? "heart" : "note",
    };

    setFloatBursts((prev) => ({
      ...prev,
      [songId]: [...(prev[songId] ?? []), burst],
    }));

    window.setTimeout(() => {
      setFloatBursts((prev) => ({
        ...prev,
        [songId]: (prev[songId] ?? []).filter((item) => item.id !== burst.id),
      }));
    }, 1300);
  };

  const handleSeasonSubmit = () => {
    if (!seasonForm.title.trim() || !seasonForm.genre.trim()) return;

    const items = seasonForm.items
      .split(/\n+/)
      .map((item) => item.trim())
      .filter(Boolean);

    const season: Season = {
      id: createId("season"),
      theme: seasonForm.theme,
      title: seasonForm.title.trim(),
      subtitle: seasonForm.subtitle.trim() || "新的季节感已经被写下",
      genre: seasonForm.genre.trim(),
      items: items.length > 0 ? items : ["等待继续补充你的曲风关键词"],
      favorite: false,
    };

    setSeasons((prev) => [season, ...prev]);
    setSelectedSeasonId(season.id);
    setSeasonForm(emptySeasonForm);
  };

  const handleConcertSubmit = () => {
    if (!concertForm.artist.trim() || !concertForm.tour.trim()) return;

    if (editingConcertId) {
      setConcerts((prev) =>
        prev.map((concert) =>
          concert.id === editingConcertId
            ? {
                ...concert,
                artist: concertForm.artist.trim(),
                tour: concertForm.tour.trim(),
                date: concertForm.date.trim() || "待定",
                venue: concertForm.venue.trim() || "待定",
                seat: concertForm.seat.trim() || "待定",
                quote: concertForm.quote.trim() || "先把期待留在这里，等现场真的发生。",
                status: concertForm.status,
                photos: [...concert.photos, ...concertDraftPhotos],
              }
            : concert,
        ),
      );
      showToast("已更新演唱会记录");
      setEditingConcertId(null);
    } else {
      const concert: Concert = {
        id: createId("concert"),
        artist: concertForm.artist.trim(),
        tour: concertForm.tour.trim(),
        date: concertForm.date.trim() || "待定",
        venue: concertForm.venue.trim() || "待定",
        seat: concertForm.seat.trim() || "待定",
        quote: concertForm.quote.trim() || "先把期待留在这里，等现场真的发生。",
        status: concertForm.status,
        photos: concertDraftPhotos,
      };

      setConcerts((prev) => [concert, ...prev]);
      setPhotoTargetConcertId(concert.id);
      showToast("已添加新演唱会记录");
    }
    setConcertForm(emptyConcertForm);
    setConcertDraftPhotos([]);
  };

  const startEditConcert = (concert: Concert) => {
    setEditingConcertId(concert.id);
    setConcertForm({
      artist: concert.artist,
      tour: concert.tour,
      date: concert.date,
      venue: concert.venue,
      seat: concert.seat,
      quote: concert.quote,
      status: concert.status,
    });
    setConcertDraftPhotos([]);
  };

  const cancelEditConcert = () => {
    setEditingConcertId(null);
    setConcertForm(emptyConcertForm);
    setConcertDraftPhotos([]);
  };

  const handleKtvSubmit = () => {
    if (!ktvForm.title.trim()) return;

    const song: KtvSong = {
      id: createId("song"),
      title: ktvForm.title.trim(),
      artist: ktvForm.artist.trim() || "待补充歌手",
      tag: ktvForm.tag.trim() || "新加入",
      plays: 0,
    };

    setKtvSongs((prev) => [song, ...prev]);
    setKtvForm(emptyKtvForm);
  };

  const handleDraftPhotoUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files?.length) return;

    const photos = await filesToPhotos(event.target.files);
    setConcertDraftPhotos((prev) => [...prev, ...photos]);
    event.target.value = "";
  };

  const handleAppendPhotosToConcert = async (event: ChangeEvent<HTMLInputElement>) => {
    if (!photoTargetConcertId || !event.target.files?.length) return;

    const photos = await filesToPhotos(event.target.files);
    setConcerts((prev) =>
      prev.map((concert) =>
        concert.id === photoTargetConcertId
          ? { ...concert, photos: [...concert.photos, ...photos] }
          : concert,
      ),
    );
    event.target.value = "";
  };

  const updateDraftPhotoCaption = (photoId: string, caption: string) => {
    setConcertDraftPhotos((prev) =>
      prev.map((photo) => (photo.id === photoId ? { ...photo, caption } : photo)),
    );
  };

  const removeConcertPhoto = (concertId: string, photoId: string) => {
    setConcerts((prev) =>
      prev.map((concert) =>
        concert.id === concertId
          ? { ...concert, photos: concert.photos.filter((photo) => photo.id !== photoId) }
          : concert,
      ),
    );
    showToast("已删除照片", "info");
  };

  const updateConcertPhoto = (concertId: string, photoId: string, updates: Partial<ConcertPhoto>) => {
    setConcerts((prev) =>
      prev.map((concert) =>
        concert.id === concertId
          ? {
              ...concert,
              photos: concert.photos.map((photo) =>
                photo.id === photoId ? { ...photo, ...updates } : photo,
              ),
            }
          : concert,
      ),
    );
  };

  const replaceConcertPhoto = async (concertId: string, photoId: string, file: File) => {
    const photos = await filesToPhotos([file]);
    if (photos.length === 0) return;
    const newPhoto = photos[0];
    updateConcertPhoto(concertId, photoId, {
      image: newPhoto.image,
      gradient: newPhoto.gradient,
    });
  };

  return (
    <>
      <ButterflyTrail />
      <IntroOverlay opacity={introOpacity} pointerEvents={pointerEvents} />

      <motion.nav
        style={{ opacity: navOpacity }}
        className="sticky top-0 z-50 flex items-center justify-between border-b border-purple-100/60 bg-white/50 px-6 py-4 backdrop-blur-md"
      >
        <div className="flex items-center gap-2">
          <span className="font-title text-lg font-semibold tracking-widest text-purple-800 md:text-xl">
            Doris&apos;s Music Oasis
          </span>
          <Disc3 className="h-4 w-4 animate-spin text-purple-400 [animation-duration:6s]" />
        </div>
        <div className="hidden gap-8 text-sm font-medium tracking-wide text-purple-800/80 md:flex">
          {navLinks.map((link) => (
            link.external ? (
              <Link key={link.href} href={link.href} className="transition-colors hover:text-purple-600">
                {link.label}
              </Link>
            ) : (
              <a key={link.href} href={link.href} className="transition-colors hover:text-purple-600">
                {link.label}
              </a>
            )
          ))}
        </div>
      </motion.nav>

      <div className="h-screen" aria-hidden />

      <motion.main
        style={{ y: mainY }}
        className="relative z-10 mx-auto max-w-6xl space-y-24 px-6 pb-24"
      >
        <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-[2rem] border border-white/60 bg-white/50 p-8 shadow-[0_20px_70px_rgba(126,34,206,0.08)] backdrop-blur-xl">
            <p className="text-sm tracking-[0.28em] text-purple-500/70 uppercase">
              Fluttering Through Soundscapes
            </p>
            <h1 className="font-title mt-4 text-4xl font-bold tracking-tight text-purple-950 md:text-6xl">
              我的私人音乐编年史
            </h1>
            <p className="mt-6 max-w-2xl text-sm leading-7 text-purple-900/75 md:text-base">
              记录属于我的音乐时光，从四季歌单到演唱会记忆。
            </p>
            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              <div className="rounded-3xl border border-white/60 bg-white/70 p-4">
                <p className="text-xs tracking-[0.2em] text-purple-400 uppercase">四季卡片</p>
                <p className="mt-2 text-2xl font-bold text-purple-900">{seasons.length}</p>
                <p className="mt-1 text-xs text-purple-700/70">收藏 {favoriteCount} 个</p>
              </div>
              <div className="rounded-3xl border border-white/60 bg-white/70 p-4">
                <p className="text-xs tracking-[0.2em] text-purple-400 uppercase">演出记录</p>
                <p className="mt-2 text-2xl font-bold text-purple-900">{concerts.length}</p>
                <p className="mt-1 text-xs text-purple-700/70">已观演 {attendedCount} 场</p>
              </div>
              <div className="rounded-3xl border border-white/60 bg-white/70 p-4">
                <p className="text-xs tracking-[0.2em] text-purple-400 uppercase">现场相册</p>
                <p className="mt-2 text-2xl font-bold text-purple-900">{totalPhotoCount}</p>
                <p className="mt-1 text-xs text-purple-700/70">张照片</p>
              </div>
            </div>
          </div>

          <div className="aurora-panel relative overflow-hidden rounded-[2rem] border border-white/60 bg-[linear-gradient(135deg,rgba(255,255,255,0.45),rgba(237,233,254,0.55),rgba(221,214,254,0.42))] p-8 shadow-[0_20px_70px_rgba(126,34,206,0.1)] backdrop-blur-xl">
            <div className="absolute -right-10 -top-10 h-36 w-36 rounded-full bg-fuchsia-200/40 blur-3xl" />
            <div className="absolute -left-10 bottom-0 h-32 w-32 rounded-full bg-violet-200/50 blur-3xl" />
            <div className="relative flex min-h-[320px] items-center justify-center">
              <ButterflySvg size={300} />
            </div>
            <p className="relative text-center text-sm leading-6 text-purple-800/75">
              蝴蝶轻舞，音符相伴
            </p>
          </div>
        </section>

        <section id="seasons" className="scroll-mt-24">
          <div className="mb-8 flex items-center gap-3">
            <h2 className="font-title text-2xl font-bold tracking-wider text-purple-900">
              01 / 四季声音印记
            </h2>
            <div className="h-px flex-1 bg-gradient-to-r from-purple-200 to-transparent" />
          </div>
          {seasons.length > 0 ? (
            <SeasonTurntable
              seasons={seasons}
              selectedSeason={selectedSeason}
              selectedSeasonId={selectedSeasonId}
              activeTrackId={activeSeasonTrackId}
              interactionTick={seasonInteractionTick}
              onSelectSeason={handleSelectSeason}
              onToggleFavorite={(seasonId) =>
                setSeasons((prev) =>
                  prev.map((item) =>
                    item.id === seasonId ? { ...item, favorite: !item.favorite } : item,
                  ),
                )
              }
              onPlayTrack={handlePlaySeasonTrack}
              onDeleteTrack={handleDeleteSeasonTrack}
              onAddTrack={handleAddSeasonTrack}
            />
          ) : (
            <div className="rounded-[2rem] border border-dashed border-purple-300 bg-white/45 p-10 text-center text-sm text-purple-700/75 backdrop-blur-sm">
              暂无四季歌单
            </div>
          )}
        </section>

        <section id="concerts" className="scroll-mt-24">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="mb-8 flex items-center gap-3"
          >
            <h2 className="font-title text-2xl font-bold tracking-wider text-purple-900">
              02 / 现场震动与票根收集
            </h2>
            <div className="h-px flex-1 bg-gradient-to-r from-purple-200 to-transparent" />
          </motion.div>

          <div className="mb-4 flex gap-3">
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-purple-400" />
              <input
                type="text"
                value={concertSearchQuery}
                onChange={(event) => setConcertSearchQuery(event.target.value)}
                className="w-full rounded-full border border-purple-100 bg-white/70 py-2 pl-9 pr-4 text-sm text-purple-900 outline-none transition-colors placeholder:text-purple-400/60 focus:border-purple-300 focus:bg-white"
                placeholder="搜索艺人或巡演名称"
              />
            </div>
          </div>

          <div className="mb-6 flex flex-wrap items-center gap-3">
            {[
              { value: "all", label: "全部现场" },
              { value: "attended", label: "已观演" },
              { value: "wishlist", label: "想去清单" },
            ].map((filter) => (
              <motion.button
                key={filter.value}
                type="button"
                onClick={() => setConcertFilter(filter.value as ConcertStatus | "all")}
                className={`rounded-full px-4 py-2 text-sm transition-all ${
                  concertFilter === filter.value
                    ? "bg-purple-900 text-white shadow-lg"
                    : "bg-white/70 text-purple-700 hover:bg-white"
                }`}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                {filter.label}
              </motion.button>
            ))}
          </div>

          <div className="space-y-8">
            {filteredConcerts.map((concert, index) => (
              <motion.div
                key={concert.id}
                initial={{ opacity: 0, x: -40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, ease: "easeOut", delay: index * 0.1 }}
              >
                <ConcertTicket
                  concert={concert}
                  onOpenAlbum={() => setOpenConcertId(concert.id)}
                />
              </motion.div>
            ))}
            {filteredConcerts.length === 0 && (
              <div className="rounded-[2rem] border border-dashed border-purple-300 bg-white/35 p-8 text-center text-sm text-purple-700/70 backdrop-blur-sm">
                暂无演出记录
              </div>
            )}
          </div>
        </section>

        <section id="ktv" className="scroll-mt-24">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="mb-8 flex items-center gap-3"
          >
            <h2 className="font-title text-2xl font-bold tracking-wider text-purple-900">
              03 / 深夜 KTV 点唱互动
            </h2>
            <div className="h-px flex-1 bg-gradient-to-r from-purple-200 to-transparent" />
          </motion.div>
          <div className="rounded-[2rem] border border-fuchsia-500/25 bg-[#0f0520] p-6 shadow-[0_0_40px_rgba(139,92,246,0.15)] md:p-8">
            <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xs tracking-[0.4em] text-purple-400/60 uppercase">
                  Midnight Karaoke · 深夜歌单
                </p>
              </div>
              <label className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-purple-200/70">
                <Search className="h-4 w-4" />
                <input
                  value={songQuery}
                  onChange={(event) => setSongQuery(event.target.value)}
                  placeholder="搜索歌名 / 歌手 / 标签"
                  className="w-52 bg-transparent outline-none placeholder:text-purple-300/40"
                />
              </label>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {filteredSongs.map((song) => (
                <KtvSongRow
                  key={song.id}
                  song={song}
                  isActive={activeSongId === song.id}
                  onSing={(event) => handleSing(song.id, event)}
                  bursts={floatBursts[song.id] ?? []}
                  onDelete={() => setKtvSongs((prev) => prev.filter((item) => item.id !== song.id))}
                />
              ))}
            </div>
            {filteredSongs.length === 0 && (
              <p className="mt-6 text-center text-sm text-purple-300/70">没有找到匹配的歌曲。</p>
            )}
          </div>
        </section>

        <section id="diary" className="scroll-mt-24">
          <div className="mb-8 flex items-center gap-3">
            <h2 className="font-title text-2xl font-bold tracking-wider text-purple-900">
              04 / 音乐心情日记
            </h2>
            <div className="h-px flex-1 bg-gradient-to-r from-purple-200 to-transparent" />
          </div>

          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="rounded-[2rem] border border-white/60 bg-white/55 p-6 shadow-lg backdrop-blur-xl"
            >
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                <p className="text-sm text-purple-900/80">
                  记录每一天的心情和陪伴你的 BGM。
                </p>
                {todayDiaryEntry && (
                  <p className="mt-2 text-xs text-green-600 font-medium">
                    ✓ 今日已记录 · {todayDiaryEntry.songTitle}
                  </p>
                )}
              </div>
                <motion.button
                  type="button"
                  onClick={() => {
                    if (todayDiaryEntry) {
                      setDiaryMood(todayDiaryEntry.mood);
                      setDiaryMessage(todayDiaryEntry.message);
                      setDiarySongTitle(todayDiaryEntry.songTitle);
                      setDiarySongArtist(todayDiaryEntry.songArtist);
                    }
                    setIsDiaryWriting(true);
                  }}
                  className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-purple-500 to-fuchsia-500 px-5 py-3 text-sm font-medium text-white shadow-lg transition-shadow hover:shadow-xl"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <PenLine className="h-4 w-4" />
                  {todayDiaryEntry ? "编辑今日日记" : "写今日心情"}
                </motion.button>
              </div>
            </motion.div>

            <div className="space-y-4">
              {sortedDiaryEntries.length === 0 ? (
                <div className="rounded-[2rem] border border-white/60 bg-white/55 p-8 text-center shadow-lg backdrop-blur-xl">
                  <Heart className="h-12 w-12 mx-auto mb-4 text-purple-300/50" />
                  <p className="text-sm text-purple-400/70">
                    还没有日记记录，写下你的第一篇心情吧
                  </p>
                </div>
              ) : (
                sortedDiaryEntries.slice(0, 5).map((entry, index) => {
                  const { year, month, day, weekday } = formatDiaryDate(entry.date);
                  const moodInfo = moodConfig[entry.mood];

                  return (
                    <motion.div
                      key={entry.id}
                      initial={{ opacity: 0, x: -30 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true, margin: "-50px" }}
                      transition={{ duration: 0.5, delay: index * 0.05 }}
                      className="rounded-[1.5rem] border border-white/60 bg-white/55 p-5 shadow-lg backdrop-blur-xl hover:shadow-xl transition-shadow"
                    >
                      <div className="flex items-start gap-4">
                        <div className={`rounded-full bg-gradient-to-br ${moodInfo.color} w-10 h-10 flex items-center justify-center text-white shadow-md flex-shrink-0`}>
                          <span className="text-sm">{moodInfo.emoji}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 text-xs text-purple-500 mb-1">
                            <Calendar className="h-3.5 w-3.5" />
                            <span>{year}年{month}月{day}日</span>
                            <span className="text-purple-400">·</span>
                            <span>{weekday}</span>
                          </div>
                          <p className="text-sm text-purple-800 leading-relaxed mb-2 line-clamp-2">
                            {entry.message}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-purple-500">
                            <Music2 className="h-3.5 w-3.5" />
                            <span className="font-medium">{entry.songTitle}</span>
                            {entry.songArtist && (
                              <>
                                <span className="text-purple-400">·</span>
                                <span>{entry.songArtist}</span>
                              </>
                            )}
                          </div>
                        </div>
                        <motion.button
                          type="button"
                          onClick={() => setDiaryDeleteConfirm(entry.id)}
                          className="rounded-full p-2 text-purple-300 hover:text-red-500 hover:bg-red-100/50 transition-colors flex-shrink-0"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </motion.button>
                      </div>

                      <AnimatePresence>
                        {diaryDeleteConfirm === entry.id && (
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="mt-4 rounded-xl border border-red-200 bg-white/95 p-3 shadow-lg"
                          >
                            <p className="text-xs text-red-600 mb-2">确定删除这篇日记？</p>
                            <div className="flex gap-2">
                              <motion.button
                                type="button"
                                onClick={() => setDiaryDeleteConfirm(null)}
                                className="flex-1 rounded-lg bg-gray-100 px-3 py-1.5 text-xs text-gray-600"
                                whileTap={{ scale: 0.95 }}
                              >
                                取消
                              </motion.button>
                              <motion.button
                                type="button"
                                onClick={() => handleDiaryDelete(entry.id)}
                                className="flex-1 rounded-lg bg-red-500 px-3 py-1.5 text-xs text-white"
                                whileTap={{ scale: 0.95 }}
                              >
                                删除
                              </motion.button>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })
              )}
            </div>
          </div>
        </section>

        </motion.main>

      <footer className="relative z-10 border-t border-purple-100/60 bg-white/20 py-8 text-center text-xs text-purple-600/60 backdrop-blur-sm">
        <p>© 2026 Doris&apos;s Music Oasis · Made with lilac memories and AI Vibe Coding</p>
      </footer>

      <motion.button
        type="button"
        onClick={() => setIsEditorOpen((prev) => !prev)}
        className="fixed right-6 bottom-6 z-[80] inline-flex items-center gap-2 rounded-full bg-purple-900 px-5 py-3 text-sm text-white shadow-[0_14px_40px_rgba(76,29,149,0.35)] transition-colors hover:bg-purple-800"
        whileHover={{ scale: 1.08, y: -4 }}
        whileTap={{ scale: 0.95 }}
        animate={{
          boxShadow: [
            "0 14px 40px rgba(76,29,149,0.35)",
            "0 20px 50px rgba(76,29,149,0.45)",
            "0 14px 40px rgba(76,29,149,0.35)",
          ],
        }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      >
        {isEditorOpen ? <PanelRightClose className="h-4 w-4" /> : <PanelRightOpen className="h-4 w-4" />}
        {isEditorOpen ? "收起编辑台" : "添加内容"}
      </motion.button>

      <AnimatePresence>
        {isEditorOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[75] bg-purple-950/20 backdrop-blur-sm"
              onClick={() => setIsEditorOpen(false)}
            />
            <motion.aside
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 280, damping: 30 }}
              className="editor-scroll fixed top-0 right-0 z-[90] h-full w-full max-w-xl overflow-y-auto border-l border-white/50 bg-[rgba(255,250,255,0.88)] p-6 shadow-2xl backdrop-blur-2xl"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs tracking-[0.3em] text-purple-400 uppercase">Music Archive Studio</p>
                  <h3 className="font-title mt-2 text-2xl font-bold text-purple-950">站内编辑面板</h3>
                  <p className="mt-2 text-sm leading-6 text-purple-800/70">
                    数据自动保存在浏览器中。
                  </p>
                </div>
                <motion.button
                  type="button"
                  onClick={() => setIsEditorOpen(false)}
                  className="rounded-full p-2 text-purple-500 transition-colors hover:bg-white/70 hover:text-purple-800"
                  aria-label="关闭编辑面板"
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <X className="h-5 w-5" />
                </motion.button>
              </div>

              <div className="mt-6 flex gap-2 rounded-full bg-white/70 p-1 shadow-sm">
                {[
                  { id: "seasons", label: "四季" },
                  { id: "concerts", label: "演唱会" },
                  { id: "ktv", label: "KTV" },
                ].map((tab) => (
                  <motion.button
                  key={tab.id}
                  type="button"
                  onClick={() => setEditorTab(tab.id as typeof editorTab)}
                  className={`flex-1 rounded-full px-4 py-2 text-sm transition-colors ${
                    editorTab === tab.id ? "bg-purple-900 text-white" : "text-purple-700 hover:bg-white"
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {tab.label}
                </motion.button>
                ))}
              </div>

              {editorTab === "seasons" && (
                <div className="mt-6 space-y-6">
                  <div className="rounded-[1.75rem] border border-white/70 bg-white/70 p-5 shadow-sm">
                    <div className="mb-4 flex items-center gap-2 text-purple-900">
                      <Plus className="h-4 w-4" />
                      <p className="font-semibold">新增四季声音卡片</p>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <label className="text-sm text-purple-700">
                        主题
                        <select
                          value={seasonForm.theme}
                          onChange={(event) =>
                            setSeasonForm((prev) => ({ ...prev, theme: event.target.value as SeasonTheme }))
                          }
                          className="mt-1 w-full rounded-2xl border border-purple-100 bg-white px-4 py-3 outline-none"
                        >
                          {Object.entries(themeMeta).map(([key, meta]) => (
                            <option key={key} value={key}>
                              {meta.label}
                            </option>
                          ))}
                        </select>
                      </label>
                      <label className="text-sm text-purple-700">
                        曲风标题
                        <input
                          value={seasonForm.title}
                          onChange={(event) => setSeasonForm((prev) => ({ ...prev, title: event.target.value }))}
                          className="mt-1 w-full rounded-2xl border border-purple-100 bg-white px-4 py-3 outline-none"
                          placeholder="例如：雨天循环曲风"
                        />
                      </label>
                      <label className="text-sm text-purple-700 sm:col-span-2">
                        副标题
                        <input
                          value={seasonForm.subtitle}
                          onChange={(event) => setSeasonForm((prev) => ({ ...prev, subtitle: event.target.value }))}
                          className="mt-1 w-full rounded-2xl border border-purple-100 bg-white px-4 py-3 outline-none"
                          placeholder="一句描述这个季节的听感"
                        />
                      </label>
                      <label className="text-sm text-purple-700 sm:col-span-2">
                        曲风关键词
                        <input
                          value={seasonForm.genre}
                          onChange={(event) => setSeasonForm((prev) => ({ ...prev, genre: event.target.value }))}
                          className="mt-1 w-full rounded-2xl border border-purple-100 bg-white px-4 py-3 outline-none"
                          placeholder="例如：Dream Pop · 氤氲流行"
                        />
                      </label>
                      <label className="text-sm text-purple-700 sm:col-span-2">
                        内容条目
                        <textarea
                          value={seasonForm.items}
                          onChange={(event) => setSeasonForm((prev) => ({ ...prev, items: event.target.value }))}
                          rows={4}
                          className="mt-1 w-full rounded-2xl border border-purple-100 bg-white px-4 py-3 outline-none"
                          placeholder={"每行写一条，例如：\n雨夜合成器\n轻柔女声\n木吉他开场"}
                        />
                      </label>
                    </div>
                    <button
                      type="button"
                      onClick={handleSeasonSubmit}
                      className="mt-4 inline-flex items-center gap-2 rounded-full bg-purple-900 px-5 py-3 text-sm text-white transition-colors hover:bg-purple-800"
                    >
                      <Plus className="h-4 w-4" /> 添加四季卡片
                    </button>
                  </div>

                  <div className="space-y-3">
                    {seasons.map((season) => (
                      <div
                        key={season.id}
                        className="flex items-center justify-between gap-3 rounded-3xl border border-white/70 bg-white/70 p-4 shadow-sm"
                      >
                        <div>
                          <p className="text-xs tracking-[0.2em] text-purple-400 uppercase">
                            {themeMeta[season.theme].label}
                          </p>
                          <p className="mt-1 font-semibold text-purple-950">{season.title}</p>
                          <p className="text-sm text-purple-700/70">{season.genre}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setSeasons((prev) => prev.filter((item) => item.id !== season.id))}
                          className="rounded-full p-2 text-purple-500 transition-colors hover:bg-red-50 hover:text-red-400"
                          aria-label={`删除 ${season.title}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {editorTab === "concerts" && (
                <div className="mt-6 space-y-6">
                  <div className="rounded-[1.75rem] border border-white/70 bg-white/70 p-5 shadow-sm">
                    <div className="mb-4 flex items-center gap-2 text-purple-900">
                      <Plus className="h-4 w-4" />
                      <p className="font-semibold">新增演唱会记录</p>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <label className="text-sm text-purple-700">
                        艺人 / 乐队
                        <input
                          value={concertForm.artist}
                          onChange={(event) => setConcertForm((prev) => ({ ...prev, artist: event.target.value }))}
                          className="mt-1 w-full rounded-2xl border border-purple-100 bg-white px-4 py-3 outline-none"
                          placeholder="例如：Lilac Echo"
                        />
                      </label>
                      <label className="text-sm text-purple-700">
                        演出名称
                        <input
                          value={concertForm.tour}
                          onChange={(event) => setConcertForm((prev) => ({ ...prev, tour: event.target.value }))}
                          className="mt-1 w-full rounded-2xl border border-purple-100 bg-white px-4 py-3 outline-none"
                          placeholder="例如：2026 巡演终场"
                        />
                      </label>
                      <label className="text-sm text-purple-700">
                        日期
                        <input
                          value={concertForm.date}
                          onChange={(event) => setConcertForm((prev) => ({ ...prev, date: event.target.value }))}
                          className="mt-1 w-full rounded-2xl border border-purple-100 bg-white px-4 py-3 outline-none"
                          placeholder="2026.11.08"
                        />
                      </label>
                      <label className="text-sm text-purple-700">
                        状态
                        <select
                          value={concertForm.status}
                          onChange={(event) =>
                            setConcertForm((prev) => ({ ...prev, status: event.target.value as ConcertStatus }))
                          }
                          className="mt-1 w-full rounded-2xl border border-purple-100 bg-white px-4 py-3 outline-none"
                        >
                          <option value="attended">已观演</option>
                          <option value="wishlist">想去现场</option>
                        </select>
                      </label>
                      <label className="text-sm text-purple-700 sm:col-span-2">
                        场馆
                        <input
                          value={concertForm.venue}
                          onChange={(event) => setConcertForm((prev) => ({ ...prev, venue: event.target.value }))}
                          className="mt-1 w-full rounded-2xl border border-purple-100 bg-white px-4 py-3 outline-none"
                          placeholder="例如：上海 · 梅奔"
                        />
                      </label>
                      <label className="text-sm text-purple-700">
                        座位 / 区域
                        <input
                          value={concertForm.seat}
                          onChange={(event) => setConcertForm((prev) => ({ ...prev, seat: event.target.value }))}
                          className="mt-1 w-full rounded-2xl border border-purple-100 bg-white px-4 py-3 outline-none"
                          placeholder="内场 B 区 · 8 排"
                        />
                      </label>
                      <label className="text-sm text-purple-700 sm:col-span-2">
                        现场记忆
                        <textarea
                          value={concertForm.quote}
                          onChange={(event) => setConcertForm((prev) => ({ ...prev, quote: event.target.value }))}
                          rows={3}
                          className="mt-1 w-full rounded-2xl border border-purple-100 bg-white px-4 py-3 outline-none"
                          placeholder="写下一句现场印象"
                        />
                      </label>
                    </div>

                    <div className="mt-4 rounded-3xl border border-dashed border-purple-200 bg-purple-50/50 p-4">
                      <label className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-white px-4 py-2 text-sm text-purple-700 shadow-sm transition-colors hover:bg-purple-100">
                        <Upload className="h-4 w-4" />
                        给这场演出上传图片
                        <input type="file" accept="image/*" multiple onChange={handleDraftPhotoUpload} className="hidden" />
                      </label>
                      <p className="mt-3 text-xs text-purple-600/70">
                        上传后可以先在这里修改图片说明，再一起创建演唱会记录。
                      </p>
                      <div className="mt-4 grid gap-3 sm:grid-cols-2">
                        {concertDraftPhotos.map((photo) => (
                          <div
                            key={photo.id}
                            className="overflow-hidden rounded-3xl border border-white/70 bg-white/80 shadow-sm"
                          >
                            <div className="relative aspect-[4/3]">
                              {photo.image ? (
                                <Image src={photo.image} alt={photo.caption} fill unoptimized className="object-cover" />
                              ) : (
                                <div className={`absolute inset-0 bg-gradient-to-br ${photo.gradient}`} />
                              )}
                            </div>
                            <div className="p-3">
                              <input
                                value={photo.caption}
                                onChange={(event) => updateDraftPhotoCaption(photo.id, event.target.value)}
                                className="w-full rounded-2xl border border-purple-100 bg-white px-3 py-2 text-sm outline-none"
                              />
                              <button
                                type="button"
                                onClick={() =>
                                  setConcertDraftPhotos((prev) => prev.filter((item) => item.id !== photo.id))
                                }
                                className="mt-2 text-xs text-red-400"
                              >
                                删除这张
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="mt-4 flex items-center gap-3">
                      <button
                        type="button"
                        onClick={handleConcertSubmit}
                        className="inline-flex items-center gap-2 rounded-full bg-purple-900 px-5 py-3 text-sm text-white transition-colors hover:bg-purple-800"
                      >
                        <Plus className="h-4 w-4" /> {editingConcertId ? "保存修改" : "添加演唱会记录"}
                      </button>
                      {editingConcertId && (
                        <button
                          type="button"
                          onClick={cancelEditConcert}
                          className="inline-flex items-center gap-2 rounded-full border border-purple-200 bg-white px-5 py-3 text-sm text-purple-700 transition-colors hover:bg-purple-50"
                        >
                          <X className="h-4 w-4" /> 取消
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="rounded-[1.75rem] border border-white/70 bg-white/70 p-5 shadow-sm">
                    <div className="mb-4 flex items-center gap-2 text-purple-900">
                      <ImagePlus className="h-4 w-4" />
                      <p className="font-semibold">给已有演出继续补图</p>
                    </div>
                    <div className="flex flex-col gap-3 sm:flex-row">
                      <select
                        value={photoTargetConcertId}
                        onChange={(event) => setPhotoTargetConcertId(event.target.value)}
                        className="flex-1 rounded-2xl border border-purple-100 bg-white px-4 py-3 outline-none"
                      >
                        {concerts.map((concert) => (
                          <option key={concert.id} value={concert.id}>
                            {concert.artist} · {concert.tour}
                          </option>
                        ))}
                      </select>
                      <label className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-2xl bg-purple-100 px-4 py-3 text-sm text-purple-800 transition-colors hover:bg-purple-200">
                        <Upload className="h-4 w-4" /> 追加图片
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={handleAppendPhotosToConcert}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {concerts.map((concert) => (
                      <div
                        key={concert.id}
                        className="rounded-3xl border border-white/70 bg-white/70 p-4 shadow-sm"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="font-semibold text-purple-950">{concert.artist}</p>
                            <p className="text-sm text-purple-700/70">{concert.tour}</p>
                            <p className="mt-1 text-xs text-purple-500/70">相册 {concert.photos.length} 张</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => startEditConcert(concert)}
                              className="rounded-full p-2 text-purple-500 transition-colors hover:bg-blue-50 hover:text-blue-400"
                              aria-label={`编辑 ${concert.artist}`}
                            >
                              <Pencil className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                showConfirmDialog(
                                  "删除演唱会记录",
                                  `确定要删除 "${concert.artist}" 的演出记录吗？此操作无法撤销。`,
                                  () => {
                                    setConcerts((prev) => prev.filter((item) => item.id !== concert.id));
                                    showToast("已删除演出记录", "info");
                                  },
                                )
                              }
                              className="rounded-full p-2 text-purple-500 transition-colors hover:bg-red-50 hover:text-red-400"
                              aria-label={`删除 ${concert.artist}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                        {concert.photos.length > 0 && (
                          <div className="mt-3 flex flex-wrap gap-2">
                            {concert.photos.map((photo) => (
                              <button
                                key={photo.id}
                                type="button"
                                onClick={() => removeConcertPhoto(concert.id, photo.id)}
                                className="rounded-full border border-white/70 bg-white px-3 py-1 text-xs text-purple-700 transition-colors hover:border-red-200 hover:text-red-400"
                              >
                                删除图片 · {photo.caption}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {editorTab === "ktv" && (
                <div className="mt-6 space-y-6">
                  <div className="rounded-[1.75rem] border border-white/70 bg-white/70 p-5 shadow-sm">
                    <div className="mb-4 flex items-center gap-2 text-purple-900">
                      <Plus className="h-4 w-4" />
                      <p className="font-semibold">新增 KTV 歌曲</p>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <label className="text-sm text-purple-700 sm:col-span-2">
                        歌名
                        <input
                          value={ktvForm.title}
                          onChange={(event) => setKtvForm((prev) => ({ ...prev, title: event.target.value }))}
                          className="mt-1 w-full rounded-2xl border border-purple-100 bg-white px-4 py-3 outline-none"
                          placeholder="例如：适合深夜合唱的那首歌"
                        />
                      </label>
                      <label className="text-sm text-purple-700">
                        歌手 / 版本
                        <input
                          value={ktvForm.artist}
                          onChange={(event) => setKtvForm((prev) => ({ ...prev, artist: event.target.value }))}
                          className="mt-1 w-full rounded-2xl border border-purple-100 bg-white px-4 py-3 outline-none"
                          placeholder="原唱歌手"
                        />
                      </label>
                      <label className="text-sm text-purple-700">
                        标签
                        <input
                          value={ktvForm.tag}
                          onChange={(event) => setKtvForm((prev) => ({ ...prev, tag: event.target.value }))}
                          className="mt-1 w-full rounded-2xl border border-purple-100 bg-white px-4 py-3 outline-none"
                          placeholder="例如：高音试炼"
                        />
                      </label>
                    </div>
                    <button
                      type="button"
                      onClick={handleKtvSubmit}
                      className="mt-4 inline-flex items-center gap-2 rounded-full bg-purple-900 px-5 py-3 text-sm text-white transition-colors hover:bg-purple-800"
                    >
                      <Plus className="h-4 w-4" /> 添加 KTV 歌曲
                    </button>
                  </div>

                  <div className="space-y-3">
                    {ktvSongs
                      .slice()
                      .sort((first, second) => second.plays - first.plays)
                      .map((song) => (
                        <div
                          key={song.id}
                          className="flex items-center justify-between gap-3 rounded-3xl border border-white/70 bg-white/70 p-4 shadow-sm"
                        >
                          <div>
                            <p className="font-semibold text-purple-950">{song.title}</p>
                            <p className="text-sm text-purple-700/70">{song.artist}</p>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-xs text-purple-500/70">{song.plays} 次点唱</span>
                            <button
                              type="button"
                              onClick={() => setKtvSongs((prev) => prev.filter((item) => item.id !== song.id))}
                              className="rounded-full p-2 text-purple-500 transition-colors hover:bg-red-50 hover:text-red-400"
                              aria-label={`删除 ${song.title}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {openConcert && (
          <AlbumModal
            concert={openConcert}
            onClose={() => setOpenConcertId(null)}
            onRemovePhoto={(photoId) => removeConcertPhoto(openConcert.id, photoId)}
            onUpdatePhoto={(photoId, updates) => updateConcertPhoto(openConcert.id, photoId, updates)}
            onReplacePhoto={(photoId, file) => replaceConcertPhoto(openConcert.id, photoId, file)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isDiaryWriting && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4"
            onClick={() => setIsDiaryWriting(false)}
          >
            <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="relative z-10 w-full max-w-md rounded-2xl border border-purple-200 bg-white/95 shadow-2xl backdrop-blur-xl overflow-hidden"
            >
              <div className="bg-gradient-to-r from-purple-500 to-fuchsia-500 px-6 py-4">
                <h3 className="font-title text-lg font-semibold text-white">
                  {todayDiaryEntry ? "编辑今日日记" : "今日心情签到"}
                </h3>
                <p className="text-sm text-white/80 mt-1">
                  {todayDiaryEntry ? "修改今天的心情记录" : "写一句话，选一首歌，记录此刻的自己"}
                </p>
              </div>

              <div className="p-6 space-y-5">
                <div>
                  <label className="text-sm font-medium text-purple-700 mb-3 block">
                    今天的心情
                  </label>
                  <div className="flex gap-2 flex-wrap">
                    {(Object.keys(moodConfig) as Mood[]).map((mood) => (
                      <motion.button
                        key={mood}
                        type="button"
                        onClick={() => setDiaryMood(mood)}
                        className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm transition-all ${
                          diaryMood === mood
                            ? `bg-gradient-to-r ${moodConfig[mood].color} text-white shadow-md`
                            : "bg-purple-100/50 text-purple-600 hover:bg-purple-100"
                        }`}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <span>{moodConfig[mood].emoji}</span>
                        <span>{moodConfig[mood].label}</span>
                      </motion.button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-purple-700 mb-2 block">
                    一句话心情
                  </label>
                  <textarea
                    value={diaryMessage}
                    onChange={(e) => setDiaryMessage(e.target.value)}
                    placeholder="今天发生了什么？有什么感受？"
                    className="w-full rounded-xl border border-purple-200 bg-white/80 px-4 py-3 text-sm text-purple-800 placeholder-purple-400/50 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent resize-none"
                    rows={3}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-purple-700 mb-2 block">
                    今日 BGM
                  </label>
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={diarySongTitle}
                      onChange={(e) => setDiarySongTitle(e.target.value)}
                      placeholder="歌曲名称"
                      className="w-full rounded-xl border border-purple-200 bg-white/80 px-4 py-2.5 text-sm text-purple-800 placeholder-purple-400/50 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent"
                    />
                    <input
                      type="text"
                      value={diarySongArtist}
                      onChange={(e) => setDiarySongArtist(e.target.value)}
                      placeholder="歌手/艺人"
                      className="w-full rounded-xl border border-purple-200 bg-white/80 px-4 py-2.5 text-sm text-purple-800 placeholder-purple-400/50 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <motion.button
                    type="button"
                    onClick={() => setIsDiaryWriting(false)}
                    className="flex-1 rounded-xl border border-purple-200 bg-white/80 px-4 py-2.5 text-sm font-medium text-purple-600 hover:bg-purple-100/50 transition-colors"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    取消
                  </motion.button>
                  <motion.button
                    type="button"
                    onClick={handleDiarySubmit}
                    disabled={!diaryMessage.trim() || !diarySongTitle.trim()}
                    className={`flex-1 rounded-xl px-4 py-2.5 text-sm font-medium text-white transition-all ${
                      diaryMessage.trim() && diarySongTitle.trim()
                        ? "bg-gradient-to-r from-purple-500 to-fuchsia-500 shadow-lg hover:shadow-xl"
                        : "bg-purple-300/50 cursor-not-allowed"
                    }`}
                    whileHover={diaryMessage.trim() && diarySongTitle.trim() ? { scale: 1.02 } : {}}
                    whileTap={diaryMessage.trim() && diarySongTitle.trim() ? { scale: 0.98 } : {}}
                  >
                    <span className="flex items-center justify-center gap-2">
                      <Check className="h-4 w-4" />
                      保存
                    </span>
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <ToastContainer toasts={toasts} removeToast={removeToast} />

      <AnimatePresence>
        {confirmDialog && (
          <ConfirmDialog
            onClose={closeConfirmDialog}
            onConfirm={confirmDialog.onConfirm}
            title={confirmDialog.title}
            message={confirmDialog.message}
          />
        )}
      </AnimatePresence>

      <AmbientMixer />
    </>
  );
}
