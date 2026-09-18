import dynamic from "next/dynamic";
import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";

const Mission = dynamic(() => import("@/components/Mission").then((mod) => mod.Mission));
const Features = dynamic(() => import("@/components/Features").then((mod) => mod.Features));
const LiveIdeaPreview = dynamic(() => import("@/components/LiveIdeaPreview").then((mod) => mod.LiveIdeaPreview));
const Pricing = dynamic(() => import("@/components/Pricing").then((mod) => mod.Pricing));
const CTA = dynamic(() => import("@/components/CTA").then((mod) => mod.CTA));
const Footer = dynamic(() => import("@/components/Footer").then((mod) => mod.Footer));

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white overflow-x-hidden">
      <Navbar />
      <Hero />
      <Mission />
      <Features />
      <LiveIdeaPreview />
      <Pricing />
      <CTA />
      <Footer />
    </main>
  );
}
