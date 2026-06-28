"use client";

import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  Heart,
  Music2,
  PenLine,
  ChevronLeft,
  Sparkles,
  Trash2,
  Check,
} from "lucide-react";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import ButterflyIcon from "@/components/ButterflyIcon";

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

const STORAGE_KEY = "lilac-diary-entries";

function createId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export default function DiaryPage() {
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [isWriting, setIsWriting] = useState(false);
  const [selectedMood, setSelectedMood] = useState<Mood>("calm");
  const [message, setMessage] = useState("");
  const [songTitle, setSongTitle] = useState("");
  const [songArtist, setSongArtist] = useState("");
  const [filterMood, setFilterMood] = useState<Mood | "all">("all");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  const todayStr = useMemo(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setEntries(JSON.parse(stored));
      } catch {
        // ignore parse errors
      }
    }
  }, []);

  const saveToStorage = useCallback((newEntries: DiaryEntry[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newEntries));
  }, []);

  const filteredEntries = useMemo(() => {
    if (filterMood === "all") return entries;
    return entries.filter((e) => e.mood === filterMood);
  }, [entries, filterMood]);

  const sortedEntries = useMemo(() => {
    return [...filteredEntries].sort((a, b) => b.date.localeCompare(a.date));
  }, [filteredEntries]);

  const todayEntry = useMemo(() => {
    return entries.find((e) => e.date === todayStr);
  }, [entries, todayStr]);

  const canSubmit = message.trim().length > 0 && songTitle.trim().length > 0;

  const handleSubmit = () => {
    if (!canSubmit) return;

    const newEntry: DiaryEntry = {
      id: createId("diary"),
      date: todayStr,
      mood: selectedMood,
      message: message.trim(),
      songTitle: songTitle.trim(),
      songArtist: songArtist.trim() || "未知歌手",
    };

    // Check if already has entry for today, replace it
    const existingIndex = entries.findIndex((e) => e.date === todayStr);
    let newEntries: DiaryEntry[];
    if (existingIndex >= 0) {
      newEntries = [...entries];
      newEntries[existingIndex] = newEntry;
    } else {
      newEntries = [newEntry, ...entries];
    }

    setEntries(newEntries);
    saveToStorage(newEntries);
    setIsWriting(false);
    setMessage("");
    setSongTitle("");
    setSongArtist("");
    setSelectedMood("calm");
  };

  const handleDelete = (id: string) => {
    const newEntries = entries.filter((e) => e.id !== id);
    setEntries(newEntries);
    saveToStorage(newEntries);
    setShowDeleteConfirm(null);
  };

  const formatDate = (dateStr: string) => {
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-fuchsia-50">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-purple-100 bg-white/40 backdrop-blur-md">
        <div className="mx-auto max-w-4xl px-6 py-4 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-purple-600 hover:text-purple-800 transition-colors"
          >
            <ChevronLeft className="h-5 w-5" />
            <span className="text-sm font-medium">返回主页</span>
          </Link>
          <div className="flex items-center gap-2">
            <span className="font-title text-lg font-semibold tracking-widest text-purple-800">
              心情日记
            </span>
            <ButterflyIcon className="butterfly-float text-sm text-purple-400" />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-4xl px-6 py-8">
        {/* Today's Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="rounded-2xl border border-purple-200 bg-white/60 p-6 shadow-lg backdrop-blur-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-purple-500" />
                <span className="text-sm font-medium text-purple-700">
                  {formatDate(todayStr).year}年{formatDate(todayStr).month}月{formatDate(todayStr).day}日 · {formatDate(todayStr).weekday}
                </span>
              </div>
              {!todayEntry && (
                <motion.button
                  type="button"
                  onClick={() => setIsWriting(true)}
                  className="flex items-center gap-2 rounded-full bg-gradient-to-r from-purple-500 to-fuchsia-500 px-4 py-2 text-sm font-medium text-white shadow-lg hover:shadow-xl transition-shadow"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <PenLine className="h-4 w-4" />
                  写今日心情
                </motion.button>
              )}
            </div>

            {todayEntry ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="rounded-xl bg-gradient-to-br from-purple-100/50 to-fuchsia-100/50 p-4"
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{moodConfig[todayEntry.mood].emoji}</span>
                  <div className="flex-1">
                    <p className="text-sm text-purple-800 leading-relaxed">{todayEntry.message}</p>
                    <div className="mt-2 flex items-center gap-2 text-xs text-purple-500">
                      <Music2 className="h-3 w-3" />
                      <span>{todayEntry.songTitle} · {todayEntry.songArtist}</span>
                    </div>
                  </div>
                  <motion.button
                    type="button"
                    onClick={() => {
                      setSelectedMood(todayEntry.mood);
                      setMessage(todayEntry.message);
                      setSongTitle(todayEntry.songTitle);
                      setSongArtist(todayEntry.songArtist);
                      setIsWriting(true);
                    }}
                    className="rounded-full p-2 text-purple-400 hover:text-purple-600 hover:bg-purple-100/50 transition-colors"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <PenLine className="h-4 w-4" />
                  </motion.button>
                </div>
              </motion.div>
            ) : (
              <div className="text-center py-8 text-purple-400/70">
                <Sparkles className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">今天还没有记录，写下你的心情吧</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Writing Modal */}
        <AnimatePresence>
          {isWriting && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-100 flex items-center justify-center p-4"
              onClick={() => setIsWriting(false)}
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
                    今日心情签到
                  </h3>
                  <p className="text-sm text-white/80 mt-1">
                    写一句话，选一首歌，记录此刻的自己
                  </p>
                </div>

                <div className="p-6 space-y-5">
                  {/* Mood Selector */}
                  <div>
                    <label className="text-sm font-medium text-purple-700 mb-3 block">
                      今天的心情
                    </label>
                    <div className="flex gap-2 flex-wrap">
                      {(Object.keys(moodConfig) as Mood[]).map((mood) => (
                        <motion.button
                          key={mood}
                          type="button"
                          onClick={() => setSelectedMood(mood)}
                          className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm transition-all ${
                            selectedMood === mood
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

                  {/* Message */}
                  <div>
                    <label className="text-sm font-medium text-purple-700 mb-2 block">
                      一句话心情
                    </label>
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="今天发生了什么？有什么感受？"
                      className="w-full rounded-xl border border-purple-200 bg-white/80 px-4 py-3 text-sm text-purple-800 placeholder-purple-400/50 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent resize-none"
                      rows={3}
                    />
                  </div>

                  {/* Song */}
                  <div>
                    <label className="text-sm font-medium text-purple-700 mb-2 block">
                      今日 BGM
                    </label>
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={songTitle}
                        onChange={(e) => setSongTitle(e.target.value)}
                        placeholder="歌曲名称"
                        className="w-full rounded-xl border border-purple-200 bg-white/80 px-4 py-2.5 text-sm text-purple-800 placeholder-purple-400/50 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent"
                      />
                      <input
                        type="text"
                        value={songArtist}
                        onChange={(e) => setSongArtist(e.target.value)}
                        placeholder="歌手/艺人"
                        className="w-full rounded-xl border border-purple-200 bg-white/80 px-4 py-2.5 text-sm text-purple-800 placeholder-purple-400/50 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent"
                      />
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3 pt-2">
                    <motion.button
                      type="button"
                      onClick={() => setIsWriting(false)}
                      className="flex-1 rounded-xl border border-purple-200 bg-white/80 px-4 py-2.5 text-sm font-medium text-purple-600 hover:bg-purple-100/50 transition-colors"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      取消
                    </motion.button>
                    <motion.button
                      type="button"
                      onClick={handleSubmit}
                      disabled={!canSubmit}
                      className={`flex-1 rounded-xl px-4 py-2.5 text-sm font-medium text-white transition-all ${
                        canSubmit
                          ? "bg-gradient-to-r from-purple-500 to-fuchsia-500 shadow-lg hover:shadow-xl"
                          : "bg-purple-300/50 cursor-not-allowed"
                      }`}
                      whileHover={canSubmit ? { scale: 1.02 } : {}}
                      whileTap={canSubmit ? { scale: 0.98 } : {}}
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

        {/* Filter */}
        <div className="mb-6 flex items-center gap-3">
          <span className="text-sm text-purple-500">筛选心情：</span>
          <div className="flex gap-2 flex-wrap">
            <motion.button
              type="button"
              onClick={() => setFilterMood("all")}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-all ${
                filterMood === "all"
                  ? "bg-purple-900 text-white"
                  : "bg-white/70 text-purple-600 hover:bg-white"
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              全部
            </motion.button>
            {(Object.keys(moodConfig) as Mood[]).map((mood) => (
              <motion.button
                key={mood}
                type="button"
                onClick={() => setFilterMood(mood)}
                className={`flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium transition-all ${
                  filterMood === mood
                    ? `bg-gradient-to-r ${moodConfig[mood].color} text-white`
                    : "bg-white/70 text-purple-600 hover:bg-white"
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

        {/* Timeline */}
        <div className="space-y-6">
          {sortedEntries.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16"
            >
              <Heart className="h-12 w-12 mx-auto mb-4 text-purple-300/50" />
              <p className="text-purple-400/70 text-sm">
                还没有日记记录，开始写下你的第一篇吧
              </p>
            </motion.div>
          ) : (
            sortedEntries.map((entry, index) => {
              const { year, month, day, weekday } = formatDate(entry.date);
              const moodInfo = moodConfig[entry.mood];

              return (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.5, delay: index * 0.05 }}
                  className="relative"
                >
                  {/* Timeline Line */}
                  <div className="absolute left-6 top-0 bottom-0 w-px bg-gradient-to-b from-purple-200 to-fuchsia-200" />

                  {/* Entry Card */}
                  <div className="relative pl-16">
                    {/* Date Badge */}
                    <div className="absolute left-0 top-0 flex flex-col items-center">
                      <div className={`rounded-full bg-gradient-to-br ${moodInfo.color} w-12 h-12 flex items-center justify-center text-white shadow-md`}>
                        <span className="text-lg">{moodInfo.emoji}</span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="rounded-2xl border border-purple-100 bg-white/60 p-5 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2 text-xs text-purple-500">
                          <Calendar className="h-3.5 w-3.5" />
                          <span>{year}年{month}月{day}日</span>
                          <span className="text-purple-400">·</span>
                          <span>{weekday}</span>
                        </div>
                        <motion.button
                          type="button"
                          onClick={() => setShowDeleteConfirm(entry.id)}
                          className="rounded-full p-1.5 text-purple-300 hover:text-purple-500 hover:bg-purple-100/50 transition-colors"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </motion.button>
                      </div>

                      <p className="text-sm text-purple-800 leading-relaxed mb-3">
                        {entry.message}
                      </p>

                      <div className="flex items-center gap-2 text-xs text-purple-500">
                        <Music2 className="h-3.5 w-3.5" />
                        <span className="font-medium">{entry.songTitle}</span>
                        <span className="text-purple-400">·</span>
                        <span>{entry.songArtist}</span>
                      </div>
                    </div>
                  </div>

                  {/* Delete Confirmation */}
                  <AnimatePresence>
                    {showDeleteConfirm === entry.id && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute right-0 top-4 z-20"
                      >
                        <motion.div
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          className="rounded-xl border border-red-200 bg-white/95 p-3 shadow-lg"
                        >
                          <p className="text-xs text-red-600 mb-2">确定删除这篇日记？</p>
                          <div className="flex gap-2">
                            <motion.button
                              type="button"
                              onClick={() => setShowDeleteConfirm(null)}
                              className="flex-1 rounded-lg bg-gray-100 px-2 py-1 text-xs text-gray-600"
                              whileTap={{ scale: 0.95 }}
                            >
                              取消
                            </motion.button>
                            <motion.button
                              type="button"
                              onClick={() => handleDelete(entry.id)}
                              className="flex-1 rounded-lg bg-red-500 px-2 py-1 text-xs text-white"
                              whileTap={{ scale: 0.95 }}
                            >
                              删除
                            </motion.button>
                          </div>
                        </motion.div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })
          )}
        </div>

        {/* Stats */}
        {entries.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-12 rounded-2xl border border-purple-100 bg-white/60 p-6 shadow-sm"
          >
            <h3 className="font-title text-lg font-semibold text-purple-800 mb-4">
              心情统计
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="rounded-xl bg-purple-100/50 p-4 text-center">
                <p className="text-2xl font-bold text-purple-700">{entries.length}</p>
                <p className="text-xs text-purple-500">总记录</p>
              </div>
              {(Object.keys(moodConfig) as Mood[]).map((mood) => {
                const count = entries.filter((e) => e.mood === mood).length;
                if (count === 0) return null;
                return (
                  <div
                    key={mood}
                    className={`rounded-xl bg-gradient-to-br ${moodConfig[mood].color} p-4 text-center`}
                  >
                    <p className="text-2xl font-bold text-white">{count}</p>
                    <p className="text-xs text-white/80">{moodConfig[mood].emoji} {moodConfig[mood].label}</p>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
}