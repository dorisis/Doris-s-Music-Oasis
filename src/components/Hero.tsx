import ButterflyIcon from "@/components/ButterflyIcon";

export default function Hero() {
  return (
    <header className="relative mx-auto max-w-6xl overflow-hidden px-6 pt-20 pb-16 text-center">
      <div
        className="butterfly-float absolute top-10 left-10 text-6xl text-purple-300/30"
        style={{ animationDelay: "0.5s" }}
      >
        <ButterflyIcon />
      </div>
      <div
        className="butterfly-float absolute right-10 bottom-10 text-8xl text-purple-300/20"
        style={{ animationDelay: "1.5s" }}
      >
        <ButterflyIcon />
      </div>

      <p className="font-cursive mb-3 text-lg text-purple-500 md:text-xl">
        Fluttering through the soundscapes
      </p>
      <h1 className="font-title mb-6 text-4xl font-bold tracking-tight text-purple-900 md:text-6xl">
        我的私人音乐编年史
      </h1>
      <p className="mx-auto max-w-xl text-sm leading-relaxed text-purple-800/80 md:text-base">
        这里记录着各个时期的耳朵偏好，散落在各地的演唱会票根，以及那些在 KTV
        深夜里被唱响的旋律。每一个音符，都是一只停留在时间里的淡紫色蝴蝶。
      </p>
    </header>
  );
}
