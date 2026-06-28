import ButterflyIcon from "@/components/ButterflyIcon";
import { BookHeart } from "lucide-react";

const navLinks = [
  { href: "#seasons", label: "四季偏好" },
  { href: "#concerts", label: "演唱会 & 票根" },
  { href: "#ktv", label: "KTV必点" },
];

export default function Nav() {
  return (
    <nav className="sticky top-0 z-50 flex items-center justify-between border-b border-purple-100 bg-white/40 px-6 py-4 backdrop-blur-md">
      <div className="flex items-center space-x-2">
        <span className="font-title text-xl font-semibold tracking-widest text-purple-800">
          MELODY & FLY
        </span>
        <ButterflyIcon className="butterfly-float text-sm text-purple-400" />
      </div>
      <div className="hidden items-center space-x-8 text-sm font-medium tracking-wide md:flex">
        {navLinks.map((link) => (
          <a
            key={link.href}
            href={link.href}
            className="transition-colors hover:text-purple-600"
          >
            {link.label}
          </a>
        ))}
        <a
          href="/diary"
          className="flex items-center gap-1.5 rounded-full bg-gradient-to-r from-purple-500 to-fuchsia-500 px-3 py-1 text-white transition-all hover:shadow-md"
        >
          <BookHeart className="h-3.5 w-3.5" />
          <span>心情日记</span>
        </a>
      </div>
    </nav>
  );
}
