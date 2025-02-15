import { Zap } from "lucide-react";
import Link from "next/link";

export default function UpgradeButton() {
  const CHEKOUT_URL =
    "https://coder011.lemonsqueezy.com/buy/374c212a-d638-4998-b79a-38e3607cdaf0";

  return (
    <Link
      href={CHEKOUT_URL}
      className="inline-flex items-center justify-center gap-2 px-8 py-4 text-white 
        bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg 
        hover:from-violet-600 hover:to-violet-700 transition-all"
    >
      <Zap className="w-5 h-5" />
      Upgrade to Pro
    </Link>
  );
}