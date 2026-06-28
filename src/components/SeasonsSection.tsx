import { FaCompactDisc, FaFeather, FaLeaf, FaSnowflake, FaSun } from "react-icons/fa6";
import type { IconType } from "react-icons";

type Season = {
  id: string;
  label: string;
  labelEn: string;
  labelColor: string;
  icon: IconType;
  iconColor: string;
  title: string;
  subtitle: string;
  items: string[];
};

const seasons: Season[] = [
  {
    id: "spring",
    label: "Spring . 春",
    labelEn: "spring",
    labelColor: "text-emerald-600",
    icon: FaLeaf,
    iconColor: "text-emerald-300",
    title: "春季偏好曲风 / 乐团",
    subtitle: "适合微风沉醉的午后",
    items: ["🍃 乐队 / 某首单曲名称", "🌸 独立流行 Indie Pop"],
  },
  {
    id: "summer",
    label: "Summer . 夏",
    labelEn: "summer",
    labelColor: "text-amber-600",
    icon: FaSun,
    iconColor: "text-amber-300",
    title: "夏季偏好曲风 / 乐团",
    subtitle: "属于海浪与汽水的喧嚣",
    items: ["🌊 城市流行 City Pop", "🎸 摇滚 / 或者是夏日限定"],
  },
  {
    id: "autumn",
    label: "Autumn . 秋",
    labelEn: "autumn",
    labelColor: "text-orange-600",
    icon: FaFeather,
    iconColor: "text-orange-300",
    title: "秋季偏好曲风 / 乐团",
    subtitle: "落叶铺满的民谣感",
    items: ["🍂 民谣 Folk / 或者是轻音乐", "☕ 爵士慵懒旋律"],
  },
  {
    id: "winter",
    label: "Winter . 冬",
    labelEn: "winter",
    labelColor: "text-blue-600",
    icon: FaSnowflake,
    iconColor: "text-blue-300",
    title: "冬季偏好曲风 / 乐团",
    subtitle: "在温暖室内聆听的厚重",
    items: ["❄️ 后摇 Post-Rock 的宏大", "🎻 古典或极简现代乐"],
  },
];

function SeasonCard({ season }: { season: Season }) {
  const Icon = season.icon;

  return (
    <div className="rounded-2xl border border-purple-100 bg-white/50 p-6 shadow-sm backdrop-blur-sm transition-all hover:-translate-y-1 hover:shadow-md">
      <div className="mb-4 flex items-start justify-between">
        <span
          className={`text-xs font-semibold tracking-widest uppercase ${season.labelColor}`}
        >
          {season.label}
        </span>
        <Icon className={season.iconColor} />
      </div>
      <div className="group relative mb-4 flex aspect-square items-center justify-center overflow-hidden rounded-xl bg-purple-100 text-purple-300">
        <FaCompactDisc className="text-4xl transition-transform duration-1000 group-hover:rotate-180" />
      </div>
      <h3 className="mb-1 font-bold text-purple-900">{season.title}</h3>
      <p className="mb-3 text-xs text-purple-700/70">{season.subtitle}</p>
      <ul className="space-y-1 text-xs text-purple-950">
        {season.items.map((item) => (
          <li key={item}>• {item}</li>
        ))}
      </ul>
    </div>
  );
}

export default function SeasonsSection() {
  return (
    <section id="seasons" className="scroll-mt-24">
      <div className="mb-8 flex items-center space-x-3">
        <h2 className="font-title text-2xl font-bold tracking-wider text-purple-900">
          01 / 四季声音印记
        </h2>
        <div className="h-px flex-1 bg-purple-200" />
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
        {seasons.map((season) => (
          <SeasonCard key={season.id} season={season} />
        ))}
      </div>
    </section>
  );
}
