"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Volume2, VolumeX, CloudRain, Flame, TreePine, Waves, X, Sparkles } from "lucide-react";

type SoundType = "rain" | "fire" | "forest" | "ocean";

interface SoundTrack {
  id: SoundType;
  name: string;
  icon: React.ReactNode;
  volume: number;
  enabled: boolean;
}

const createNoiseBuffer = (audioContext: AudioContext, duration: number = 2): AudioBuffer => {
  const sampleRate = audioContext.sampleRate;
  const bufferSize = sampleRate * duration;
  const buffer = audioContext.createBuffer(2, bufferSize, sampleRate);

  for (let channel = 0; channel < 2; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < bufferSize; i++) {
      channelData[i] = Math.random() * 2 - 1;
    }
  }

  return buffer;
};

export default function AmbientMixer() {
  const [isOpen, setIsOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [tracks, setTracks] = useState<SoundTrack[]>([
    { id: "rain", name: "雨声", icon: <CloudRain className="w-5 h-5" />, volume: 0.5, enabled: false },
    { id: "fire", name: "篝火", icon: <Flame className="w-5 h-5" />, volume: 0.4, enabled: false },
    { id: "forest", name: "森林", icon: <TreePine className="w-5 h-5" />, volume: 0.3, enabled: false },
    { id: "ocean", name: "海浪", icon: <Waves className="w-5 h-5" />, volume: 0.5, enabled: false },
  ]);

  const audioContextRef = useRef<AudioContext | null>(null);
  const sourcesRef = useRef<Map<SoundType, { nodes: AudioNode[]; timers: number[] }>>(new Map());
  const masterGainRef = useRef<GainNode | null>(null);

  const initAudio = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext();
      masterGainRef.current = audioContextRef.current.createGain();
      masterGainRef.current.connect(audioContextRef.current.destination);
      masterGainRef.current.gain.value = 0.35;
    }
    return audioContextRef.current;
  }, []);

  const createRainSound = useCallback((ctx: AudioContext, volume: number) => {
    const nodes: AudioNode[] = [];

    // 细雨底噪 - 非常柔和的白噪声
    const noiseBuffer = createNoiseBuffer(ctx, 4);
    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = noiseBuffer;
    noiseSource.loop = true;
    nodes.push(noiseSource);

    // 低通滤波 - 去除高频，让雨声更柔和
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 800;
    nodes.push(filter);

    // 第二个滤波器进一步平滑
    const filter2 = ctx.createBiquadFilter();
    filter2.type = "highpass";
    filter2.frequency.value = 200;
    nodes.push(filter2);

    const gainNode = ctx.createGain();
    gainNode.gain.value = volume * 0.4;
    nodes.push(gainNode);

    noiseSource.connect(filter);
    filter.connect(filter2);
    filter2.connect(gainNode);
    gainNode.connect(masterGainRef.current!);
    noiseSource.start();

    return { nodes, timers: [] };
  }, []);

  const createFireSound = useCallback((ctx: AudioContext, volume: number) => {
    const nodes: AudioNode[] = [];
    const timers: number[] = [];

    const noiseBuffer = createNoiseBuffer(ctx, 4);
    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = noiseBuffer;
    noiseSource.loop = true;
    nodes.push(noiseSource);

    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 300;
    nodes.push(filter);

    const gainNode = ctx.createGain();
    gainNode.gain.value = volume * 0.7;
    nodes.push(gainNode);

    noiseSource.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(masterGainRef.current!);
    noiseSource.start();

    const createCrackle = () => {
      const osc = ctx.createOscillator();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(100 + Math.random() * 200, ctx.currentTime);

      const crackleGain = ctx.createGain();
      crackleGain.gain.setValueAtTime(0, ctx.currentTime);
      crackleGain.gain.linearRampToValueAtTime(volume * 0.08, ctx.currentTime + 0.01);
      crackleGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);

      osc.connect(crackleGain);
      crackleGain.connect(masterGainRef.current!);

      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.1);

      timers.push(window.setTimeout(createCrackle, 100 + Math.random() * 300));
    };

    for (let i = 0; i < 3; i++) {
      timers.push(window.setTimeout(createCrackle, Math.random() * 800));
    }

    return { nodes, timers };
  }, []);

  const createForestSound = useCallback((ctx: AudioContext, volume: number) => {
    const nodes: AudioNode[] = [];
    const timers: number[] = [];

    const noiseBuffer = createNoiseBuffer(ctx, 4);
    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = noiseBuffer;
    noiseSource.loop = true;
    nodes.push(noiseSource);

    const filter = ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.value = 600;
    filter.Q.value = 0.8;
    nodes.push(filter);

    const gainNode = ctx.createGain();
    gainNode.gain.value = volume * 0.4;
    nodes.push(gainNode);

    noiseSource.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(masterGainRef.current!);
    noiseSource.start();

    const createBirdChirp = () => {
      const osc = ctx.createOscillator();
      osc.type = "sine";

      const chirpGain = ctx.createGain();
      chirpGain.gain.setValueAtTime(0, ctx.currentTime);

      const now = ctx.currentTime;
      const chirps = 2 + Math.floor(Math.random() * 3);

      for (let i = 0; i < chirps; i++) {
        const t = now + i * 0.12;
        const freq = 2000 + Math.random() * 1500;
        osc.frequency.setValueAtTime(freq, t);
        osc.frequency.setValueAtTime(freq * 1.3, t + 0.03);
        osc.frequency.setValueAtTime(freq, t + 0.06);

        chirpGain.gain.setValueAtTime(0, t);
        chirpGain.gain.linearRampToValueAtTime(volume * 0.12, t + 0.01);
        chirpGain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
      }

      osc.connect(chirpGain);
      chirpGain.connect(masterGainRef.current!);

      osc.start(now);
      osc.stop(now + chirps * 0.12 + 0.1);

      timers.push(window.setTimeout(createBirdChirp, 2000 + Math.random() * 5000));
    };

    timers.push(window.setTimeout(createBirdChirp, 1000 + Math.random() * 3000));

    return { nodes, timers };
  }, []);

  const createOceanSound = useCallback((ctx: AudioContext, volume: number) => {
    const nodes: AudioNode[] = [];

    const noiseBuffer = createNoiseBuffer(ctx, 4);
    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = noiseBuffer;
    noiseSource.loop = true;
    nodes.push(noiseSource);

    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 400;
    nodes.push(filter);

    const gainNode = ctx.createGain();
    gainNode.gain.value = volume * 0.5;
    nodes.push(gainNode);

    const lfo = ctx.createOscillator();
    lfo.type = "sine";
    lfo.frequency.value = 0.15;
    nodes.push(lfo);

    const lfoGain = ctx.createGain();
    lfoGain.gain.value = volume * 0.3;
    nodes.push(lfoGain);

    noiseSource.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(masterGainRef.current!);
    noiseSource.start();

    lfo.connect(lfoGain);
    lfoGain.connect(gainNode.gain);
    lfo.start();

    return { nodes, timers: [] };
  }, []);

  const createSoundSource = useCallback((type: SoundType, volume: number) => {
    const ctx = initAudio();
    if (!ctx || !masterGainRef.current) return;

    let soundData: { nodes: AudioNode[]; timers: number[] };

    switch (type) {
      case "rain":
        soundData = createRainSound(ctx, volume);
        break;
      case "fire":
        soundData = createFireSound(ctx, volume);
        break;
      case "forest":
        soundData = createForestSound(ctx, volume);
        break;
      case "ocean":
        soundData = createOceanSound(ctx, volume);
        break;
    }

    sourcesRef.current.set(type, soundData);
  }, [initAudio, createRainSound, createFireSound, createForestSound, createOceanSound]);

  const stopSoundSource = useCallback((type: SoundType) => {
    const soundData = sourcesRef.current.get(type);
    if (soundData) {
      soundData.nodes.forEach((node) => {
        if ("stop" in node) {
          try {
            (node as AudioBufferSourceNode).stop();
          } catch {
            // ignore
          }
        }
      });
      soundData.timers.forEach((timer) => clearTimeout(timer));
      sourcesRef.current.delete(type);
    }
  }, []);

  const toggleTrack = useCallback((trackId: SoundType) => {
    setTracks((prev) =>
      prev.map((track) =>
        track.id === trackId ? { ...track, enabled: !track.enabled } : track,
      ),
    );
  }, []);

  const updateVolume = useCallback((trackId: SoundType, volume: number) => {
    setTracks((prev) =>
      prev.map((track) =>
        track.id === trackId ? { ...track, volume } : track,
      ),
    );
  }, []);

  useEffect(() => {
    tracks.forEach((track) => {
      if (track.enabled && !sourcesRef.current.has(track.id)) {
        createSoundSource(track.id, track.volume);
      } else if (!track.enabled && sourcesRef.current.has(track.id)) {
        stopSoundSource(track.id);
      }
    });
  }, [tracks, createSoundSource, stopSoundSource]);

  useEffect(() => {
    return () => {
      sourcesRef.current.forEach((_, type) => {
        stopSoundSource(type);
      });
      if (audioContextRef.current && audioContextRef.current.state !== "closed") {
        audioContextRef.current.close();
      }
    };
  }, [stopSoundSource]);

  const handleToggleAll = async () => {
    const ctx = initAudio();
    if (ctx.state === "suspended") {
      await ctx.resume();
    }

    if (isPlaying) {
      sourcesRef.current.forEach((_, type) => {
        stopSoundSource(type);
      });
      setTracks((prev) => prev.map((t) => ({ ...t, enabled: false })));
    } else {
      tracks.forEach((track) => {
        if (track.enabled && !sourcesRef.current.has(track.id)) {
          createSoundSource(track.id, track.volume);
        }
      });
    }
    setIsPlaying(!isPlaying);
  };

  const anyEnabled = tracks.some((t) => t.enabled);

  return (
    <>
      <motion.button
        type="button"
        onClick={() => setIsOpen(true)}
        className="fixed left-6 bottom-16 z-[80] flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-blue-400 via-cyan-400 to-teal-400 text-white shadow-lg shadow-cyan-500/30"
        whileHover={{ scale: 1.1, rotate: 5 }}
        whileTap={{ scale: 0.95 }}
        animate={anyEnabled ? {
          boxShadow: [
            "0 8px 32px rgba(34, 211, 238, 0.4)",
            "0 12px 40px rgba(34, 211, 238, 0.6)",
            "0 8px 32px rgba(34, 211, 238, 0.4)",
          ],
        } : {}}
        transition={{ duration: 2, repeat: Infinity }}
      >
        {anyEnabled ? <Volume2 className="h-6 w-6" /> : <Sparkles className="h-6 w-6" />}
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="fixed left-6 bottom-40 z-[85] w-80 overflow-hidden rounded-3xl border border-white/30 bg-white/90 shadow-2xl backdrop-blur-xl"
          >
            <div className="bg-gradient-to-r from-blue-500 via-cyan-500 to-teal-500 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-white" />
                  <h3 className="font-title text-lg font-semibold text-white">
                    环境音混音器
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="rounded-full p-1.5 text-white/80 hover:bg-white/20 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <p className="mt-1 text-sm text-white/80">
                配制属于你的专属声学空间
              </p>
            </div>

            <div className="space-y-3 p-4">
              {tracks.map((track) => (
                <motion.div
                  key={track.id}
                  className={`rounded-2xl p-4 transition-colors ${
                    track.enabled
                      ? "bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200/50"
                      : "bg-gray-50/80"
                  }`}
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <motion.button
                        type="button"
                        onClick={() => toggleTrack(track.id)}
                        className={`flex h-10 w-10 items-center justify-center rounded-full transition-colors ${
                          track.enabled
                            ? "bg-gradient-to-br from-blue-500 to-cyan-500 text-white"
                            : "bg-gray-200 text-gray-500"
                        }`}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        {track.icon}
                      </motion.button>
                      <div>
                        <p className={`font-medium ${track.enabled ? "text-blue-800" : "text-gray-600"}`}>
                          {track.name}
                        </p>
                        <p className="text-xs text-gray-400">
                          {track.enabled ? "已开启" : "已关闭"}
                        </p>
                      </div>
                    </div>

                    <motion.button
                      type="button"
                      onClick={() => toggleTrack(track.id)}
                      className={`rounded-full p-2 transition-colors ${
                        track.enabled
                          ? "text-blue-500 hover:bg-blue-100"
                          : "text-gray-400 hover:bg-gray-100"
                      }`}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      {track.enabled ? (
                        <Volume2 className="h-5 w-5" />
                      ) : (
                        <VolumeX className="h-5 w-5" />
                      )}
                    </motion.button>
                  </div>

                  <div className="relative">
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={track.volume}
                      onChange={(e) => updateVolume(track.id, parseFloat(e.target.value))}
                      className="h-2 w-full appearance-none rounded-full bg-gray-200 outline-none"
                      style={{
                        background: track.enabled
                          ? `linear-gradient(to right, #06b6d4 ${track.volume * 100}%, #e5e7eb ${track.volume * 100}%)`
                          : "#e5e7eb",
                      }}
                    />
                    <style jsx>{`
                      input[type="range"]::-webkit-slider-thumb {
                        appearance: none;
                        width: 18px;
                        height: 18px;
                        border-radius: 50%;
                        background: ${track.enabled ? "linear-gradient(135deg, #06b6d4, #0891b2)" : "#9ca3af"};
                        cursor: pointer;
                        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
                      }
                      input[type="range"]::-moz-range-thumb {
                        width: 18px;
                        height: 18px;
                        border-radius: 50%;
                        background: ${track.enabled ? "linear-gradient(135deg, #06b6d4, #0891b2)" : "#9ca3af"};
                        cursor: pointer;
                        border: none;
                        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
                      }
                    `}</style>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="border-t border-gray-100 p-4">
              <motion.button
                type="button"
                onClick={handleToggleAll}
                className={`w-full rounded-2xl py-3 font-medium text-white transition-all ${
                  anyEnabled
                    ? "bg-gradient-to-r from-red-400 to-orange-400 hover:shadow-lg"
                    : "bg-gradient-to-r from-blue-500 to-cyan-500 hover:shadow-lg"
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {anyEnabled ? "停止所有声音" : "开启专注模式"}
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
