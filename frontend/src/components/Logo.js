import Link from 'next/link';

export default function Logo({ onClick, className = '' }) {
  return (
    <Link
      href="/"
      onClick={onClick}
      className={`flex items-center gap-2 ${className}`}
    >
      <img src="/logo.svg" alt="SkillSwap" className="w-9 h-9 rounded-xl" />
      <span className="text-lg font-extrabold tracking-tight">
        Skill<span className="text-brand">Swap</span>
      </span>
    </Link>
  );
}
