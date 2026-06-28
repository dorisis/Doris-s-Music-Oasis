import { FaMicrophone } from "react-icons/fa6";

type KtvSong = {
  id: string;
  title: string;
  artist: string;
  tag: string;
  tagColor: string;
};

const songs: KtvSong[] = [
  {
    id: "01",
    title: "歌曲名称占位",
    artist: "原唱歌手名字",
    tag: "高音必点",
    tagColor: "bg-fuchsia-100 text-fuchsia-800",
  },
  {
    id: "02",
    title: "下一首开场曲",
    artist: "经典粤语 / 热烈摇滚",
    tag: "气氛组暖场",
    tagColor: "bg-purple-100 text-purple-800",
  },
];

export default function KtvSection() {
  return (
    <section id="ktv" className="scroll-mt-24">
      <div className="mb-8 flex items-center space-x-3">
        <h2 className="font-title text-2xl font-bold tracking-wider text-purple-900">
          03 / KTV 麦克风专属麦霸歌单
        </h2>
        <div className="h-px flex-1 bg-purple-200" />
      </div>

      <div className="rounded-3xl border border-purple-100 bg-white/60 p-6 backdrop-blur-sm md:p-8">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {songs.map((song) => (
            <div
              key={song.id}
              className="group flex items-center justify-between rounded-xl border border-purple-50 bg-white/40 p-4 transition-colors hover:bg-white/80"
            >
              <div className="flex items-center space-x-4">
                <span className="font-title font-bold text-purple-300 transition-colors group-hover:text-purple-500">
                  {song.id}
                </span>
                <div>
                  <h4 className="text-sm font-bold text-purple-950">{song.title}</h4>
                  <p className="text-xs text-purple-500">{song.artist}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] ${song.tagColor}`}
                >
                  {song.tag}
                </span>
                <FaMicrophone className="text-xs text-purple-300 transition-colors group-hover:text-purple-600" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
