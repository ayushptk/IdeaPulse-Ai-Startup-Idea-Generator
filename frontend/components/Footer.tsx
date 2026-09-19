import Link from "next/link";
import Image from "next/image";
const logoSrc = "/logo.png";

export function Footer() {
  return (
    <footer className="border-t border-white/5 py-12 bg-black">
      <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-4 gap-8">
        <div className="col-span-1 md:col-span-2">
          <Link href="/" className="flex items-center gap-3 mb-4">
            <Image src={logoSrc} alt="Logo" width={32} height={32} className="rounded-lg shadow-sm" unoptimized />
            <span className="font-bold text-lg tracking-tight text-white">IdeaForge AI</span>
          </Link>
          <p className="text-neutral-400 text-sm max-w-sm mb-6">
            Stop guessing. Start building validated ideas. We help developers and founders find ideas people actually want to pay for.
          </p>
          <div className="text-neutral-500 text-xs" suppressHydrationWarning>
            © {new Date().getFullYear()} IdeaForge AI. All rights reserved.
          </div>
        </div>
        
        <div>
          <h4 className="text-white font-semibold mb-4">Product</h4>
          <ul className="space-y-2 text-sm text-neutral-400">
            <li><Link href="#features" className="hover:text-white transition">Features</Link></li>
            <li><Link href="#pricing" className="hover:text-white transition">Pricing</Link></li>
            <li><Link href="#" className="hover:text-white transition">Blog</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-4">Legal</h4>
          <ul className="space-y-2 text-sm text-neutral-400">
            <li><Link href="#" className="hover:text-white transition">Privacy Policy</Link></li>
            <li><Link href="#" className="hover:text-white transition">Terms of Service</Link></li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
