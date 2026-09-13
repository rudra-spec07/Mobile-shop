import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  ArrowRight,
  Headphones,
  Sparkles,
  Layers,
  Wrench,
  Zap,
  Star,
  CheckCircle2,
  PhoneCall,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import heroShowcaseImg from '../../assets/images/hero_showcase.jpg';

const HeroSection = () => {
  const [loaded, setLoaded] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [activeSlide, setActiveSlide] = useState(0);
  const sectionRef = useRef(null);

  // Trigger entry animations on mount
  useEffect(() => {
    const t = requestAnimationFrame(() => setLoaded(true));
    return () => cancelAnimationFrame(t);
  }, []);

  // Subtle parallax on mouse move (desktop only)
  const handleMouseMove = useCallback((e) => {
    if (window.innerWidth < 1024) return; // disable on mobile/tablet
    const rect = sectionRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;  // -1 to 1
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    setMousePos({ x, y });
  }, []);

  // Parallax transform helpers
  const parallax = (depth) => ({
    transform: `translate(${mousePos.x * depth}px, ${mousePos.y * depth}px)`,
    transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
  });

  return (
    <section
      ref={sectionRef}
      onMouseMove={handleMouseMove}
      className="relative rounded-3xl overflow-hidden shadow-xl shadow-blue-500/5 bg-gradient-to-br from-[#dbeafe]/90 via-[#e0f2fe]/95 to-[#f0f7ff] text-slate-900 border border-blue-200/70"
    >
      {/* Ambient Floating 3D Orbs / Glow Spheres in background */}
      <div
        className="absolute -top-24 -left-24 w-80 h-80 bg-blue-400/25 rounded-full blur-3xl pointer-events-none anim-glow-pulse"
        style={parallax(2)}
      />
      <div
        className="absolute top-1/2 -right-24 w-96 h-96 bg-sky-300/30 rounded-full blur-3xl pointer-events-none anim-glow-pulse anim-delay-2000"
        style={parallax(2)}
      />
      <div
        className="absolute bottom-4 left-1/3 w-64 h-64 bg-indigo-300/20 rounded-full blur-2xl pointer-events-none anim-glow-pulse anim-delay-1000"
      />

      {/* Subtle floating 3D glass bubbles */}
      <div
        className="hidden md:block absolute top-8 left-8 w-12 h-12 rounded-full bg-white/40 backdrop-blur-md border border-white/60 shadow-inner anim-float"
        style={parallax(4)}
      />
      <div
        className="hidden md:block absolute bottom-12 left-1/4 w-8 h-8 rounded-full bg-blue-200/50 backdrop-blur-sm border border-white/50 shadow-inner anim-float-sm"
        style={parallax(6)}
      />
      <div
        className="hidden lg:block absolute top-12 right-12 w-14 h-14 rounded-full bg-white/30 backdrop-blur-md border border-white/60 shadow-inner anim-float-lg"
        style={parallax(5)}
      />

      <div className="relative z-10 px-6 sm:px-10 lg:px-12 py-10 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-6 items-center">
          {/* Left Column: Headline, Description & Trust Strip */}
          <div className="lg:col-span-7 space-y-6 max-w-2xl">
            {/* Pill Badge — stagger: 100ms */}
            <div
              className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/90 backdrop-blur-md border border-blue-200/80 text-xs font-bold text-blue-900 shadow-xs
                ${loaded ? 'anim-fade-up anim-delay-100' : 'opacity-0'}`}
            >
              <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-3.5 h-3.5" />
              </span>
              <span>Certified Mobile Service Centre</span>
            </div>

            {/* Main Headline — stagger: 200ms */}
            <h1
              className={`text-3xl sm:text-5xl lg:text-[52px] font-black tracking-tight leading-[1.12] text-slate-900
                ${loaded ? 'anim-fade-up anim-delay-200' : 'opacity-0'}`}
            >
              Your trusted destination for{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-600">
                mobiles, parts & repairs.
              </span>
            </h1>

            {/* Description — stagger: 300ms */}
            <p
              className={`text-slate-600 text-sm sm:text-base leading-relaxed font-normal max-w-xl
                ${loaded ? 'anim-fade-up anim-delay-300' : 'opacity-0'}`}
            >
              Explore genuine smartphones, quality spare parts and expert mobile services — all in one place.
            </p>

            {/* Action Buttons — stagger: 400ms */}
            <div
              className={`flex flex-wrap items-center gap-3.5 pt-2
                ${loaded ? 'anim-fade-up anim-delay-400' : 'opacity-0'}`}
            >
              <Link
                to="/mobiles"
                className="group inline-flex items-center gap-2 px-7 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-lg shadow-blue-600/25 hover:shadow-blue-600/35 transition-all duration-200 active:scale-[0.98] hover:scale-[1.02]"
              >
                <span>Explore Mobiles</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>

              <Link
                to="/parts"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-2xl bg-white hover:bg-slate-50 text-slate-800 font-bold text-sm border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200 active:scale-[0.98] hover:scale-[1.02]"
              >
                <span>Browse Parts</span>
              </Link>
            </div>

            {/* Trust Strip Items in Hero — stagger: 500–700ms */}
            <div className="pt-6 border-t border-blue-200/60 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-slate-700">
              {[
                { icon: PhoneCall, label: 'Free Consultation', subtext: 'For all devices', color: 'text-blue-600', bg: 'bg-blue-100/80' },
                { icon: ShieldCheck, label: 'Genuine Products', subtext: 'Original & verified', color: 'text-blue-600', bg: 'bg-blue-100/80' },
                { icon: Headphones, label: 'Expert Support', subtext: 'Professional help', color: 'text-blue-600', bg: 'bg-blue-100/80' },
                { icon: Star, label: 'Trusted by 10K+', subtext: 'Happy customers', color: 'text-amber-500 fill-amber-400', bg: 'bg-amber-100/80' },
              ].map((item, i) => (
                <div
                  key={i}
                  className={`flex items-start gap-2.5
                    ${loaded ? `anim-fade-up-sm anim-delay-${500 + i * 75}` : 'opacity-0'}`}
                  style={loaded ? { animationDelay: `${500 + i * 75}ms` } : undefined}
                >
                  <div className={`p-1.5 rounded-lg ${item.bg} ${item.color} shrink-0 mt-0.5`}>
                    <item.icon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-extrabold text-slate-900 leading-tight">{item.label}</div>
                    <div className="text-[10px] text-slate-500 font-medium">{item.subtext}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: 3D Smartphone Podium Visual & Floating Badges */}
          <div
            className={`lg:col-span-5 relative flex items-center justify-center pt-6 lg:pt-0
              ${loaded ? 'anim-scale-in anim-delay-300' : 'opacity-0'}`}
          >
            <div className="relative w-full max-w-md lg:max-w-none" style={parallax(4)}>
              {/* Product Showcase Visual with Neon Glow */}
              <div className="relative rounded-3xl overflow-hidden border border-white/60 shadow-2xl bg-white/40 backdrop-blur-md anim-float">
                <img
                  src={heroShowcaseImg}
                  alt="Flagship Smartphone Collection & Service"
                  className="w-full h-auto object-cover rounded-3xl transition-transform duration-500 hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-blue-900/20 via-transparent to-transparent pointer-events-none" />
              </div>

              {/* Floating Badge 1: 500+ Products (Top Left) */}
              <div
                className={`absolute -top-3 -left-3 sm:-top-4 sm:-left-4 bg-white/95 backdrop-blur-md text-slate-900 px-3.5 py-2 rounded-2xl shadow-xl border border-white/90 flex items-center gap-2.5 anim-float-sm
                  ${loaded ? 'anim-fade-up anim-delay-600' : 'opacity-0'}`}
                style={{ ...parallax(8), animationDelay: undefined }}
              >
                <div className="p-1.5 bg-blue-100 text-blue-600 rounded-xl">
                  <Layers className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <div className="text-xs font-extrabold leading-none">500+</div>
                  <div className="text-[10px] text-slate-500 font-medium">Products</div>
                </div>
              </div>

              {/* Floating Badge 2: Original Parts Guaranteed (Mid Left) */}
              <div
                className={`hidden sm:flex absolute top-1/2 -left-5 -translate-y-1/2 bg-white/95 backdrop-blur-md text-slate-900 px-3.5 py-2 rounded-2xl shadow-xl border border-white/90 items-center gap-2.5 anim-float
                  ${loaded ? 'anim-fade-up anim-delay-700' : 'opacity-0'}`}
                style={{ ...parallax(10), animationDelay: undefined }}
              >
                <div className="p-1.5 bg-blue-600 text-white rounded-xl">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <div className="text-xs font-extrabold leading-none">Original Parts</div>
                  <div className="text-[10px] text-slate-500 font-medium">Guaranteed</div>
                </div>
              </div>

              {/* Floating Badge 3: Expert Service (Top Right) */}
              <div
                className={`absolute -top-3 -right-3 sm:-top-4 sm:-right-4 bg-white/95 backdrop-blur-md text-slate-900 px-3.5 py-2 rounded-2xl shadow-xl border border-white/90 flex items-center gap-2.5 anim-float-lg
                  ${loaded ? 'anim-fade-up anim-delay-500' : 'opacity-0'}`}
                style={{ ...parallax(8), animationDelay: undefined }}
              >
                <div className="p-1.5 bg-blue-100 text-blue-600 rounded-xl">
                  <Wrench className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <div className="text-xs font-extrabold leading-none">Expert Service</div>
                  <div className="text-[10px] text-slate-500 font-medium">By Professionals</div>
                </div>
              </div>

              {/* Floating Badge 4: Quick Turnaround (Mid Right) */}
              <div
                className={`hidden sm:flex absolute top-1/2 -right-5 -translate-y-1/2 bg-white/95 backdrop-blur-md text-slate-900 px-3.5 py-2 rounded-2xl shadow-xl border border-white/90 items-center gap-2.5 anim-float-sm
                  ${loaded ? 'anim-fade-up anim-delay-800' : 'opacity-0'}`}
                style={{ ...parallax(10), animationDelay: undefined }}
              >
                <div className="p-1.5 bg-amber-100 text-amber-600 rounded-xl">
                  <Zap className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <div className="text-xs font-extrabold leading-none">Quick Turnaround</div>
                  <div className="text-[10px] text-slate-500 font-medium">Get back to what you love</div>
                </div>
              </div>

              {/* Bottom Script Accent & Carousel Controls */}
              <div
                className={`absolute -bottom-4 right-4 flex items-center gap-3
                  ${loaded ? 'anim-fade-in anim-delay-800' : 'opacity-0'}`}
              >
                <span className="italic font-serif text-blue-900/80 text-xs sm:text-sm tracking-wide font-medium">
                  Keep Your World Connected
                </span>

                {/* Micro Carousel Nav Arrows */}
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setActiveSlide((prev) => (prev > 0 ? prev - 1 : 2))}
                    className="w-7 h-7 rounded-full bg-white/90 hover:bg-white text-slate-700 shadow-md border border-slate-200/80 flex items-center justify-center transition-transform active:scale-90"
                    aria-label="Previous slide"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setActiveSlide((prev) => (prev < 2 ? prev + 1 : 0))}
                    className="w-7 h-7 rounded-full bg-white/90 hover:bg-white text-slate-700 shadow-md border border-slate-200/80 flex items-center justify-center transition-transform active:scale-90"
                    aria-label="Next slide"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
