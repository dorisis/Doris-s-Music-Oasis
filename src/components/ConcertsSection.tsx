import { FaCalendar, FaCompactDisc, FaLocationDot, FaTicket } from "react-icons/fa6";

export default function ConcertsSection() {
  return (
    <section id="concerts" className="scroll-mt-24">
      <div className="mb-8 flex items-center space-x-3">
        <h2 className="font-title text-2xl font-bold tracking-wider text-purple-900">
          02 / 现场震动与票根收集
        </h2>
        <div className="h-px flex-1 bg-purple-200" />
      </div>

      <div className="space-y-6">
        <div className="flex flex-col overflow-hidden rounded-2xl border border-purple-100 bg-white/70 shadow-sm backdrop-blur-sm transition-shadow hover:shadow-md md:flex-row">
          <div className="relative flex min-h-[150px] flex-col items-center justify-center overflow-hidden bg-purple-900 p-6 text-center text-white md:w-1/4">
            <div className="absolute -top-8 -right-8 h-24 w-24 rounded-full bg-white/10" />
            <FaTicket className="mb-2 text-3xl opacity-80" />
            <span className="text-xs tracking-widest uppercase opacity-60">
              LIVE CONCERT
            </span>
          </div>

          <div className="flex flex-1 flex-col justify-between border-b border-dashed border-purple-200 p-6 md:border-r md:border-b-0">
            <div>
              <div className="mb-2 flex items-start justify-between">
                <h3 className="text-lg font-bold text-purple-900">
                  某某乐队 2026「巡演名称」演唱会
                </h3>
                <span className="rounded-full bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-800">
                  已观演
                </span>
              </div>
              <p className="mb-4 text-xs text-purple-700/80">
                <FaCalendar className="mr-1 inline" /> 2026.XX.XX &nbsp;|&nbsp;
                <FaLocationDot className="mr-1 inline" /> 上海 / 或者是某个 Livehouse
              </p>
            </div>
            <p className="rounded-lg border border-purple-100/50 bg-purple-50/50 p-3 text-xs text-purple-950 italic">
              “当全场大合唱的声音响起来的时候，感觉灵魂里有一百只蝴蝶同时在振翅。”
            </p>
          </div>

          <div className="flex flex-col items-center justify-center bg-purple-50/40 p-6 text-center md:w-48">
            <span className="mb-1 text-[10px] font-bold tracking-widest text-purple-400 uppercase">
              SEAT / 区域
            </span>
            <span className="font-title mb-3 text-base font-bold text-purple-900">
              内场 A区
            </span>
            <button
              type="button"
              className="w-full cursor-pointer rounded bg-purple-900 py-1.5 text-xs text-white transition-colors hover:bg-purple-800"
            >
              查看纪念相册
            </button>
          </div>
        </div>

        <div className="flex flex-col overflow-hidden rounded-2xl border border-purple-100 bg-white/40 opacity-70 backdrop-blur-sm md:flex-row">
          <div className="flex min-h-[120px] flex-col items-center justify-center bg-purple-800/40 p-6 text-white md:w-1/4">
            <FaCompactDisc className="text-3xl opacity-50" />
          </div>
          <div className="flex flex-1 items-center p-6">
            <p className="text-sm text-purple-700 italic">
              下一个等待被点亮的演出现场...
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
