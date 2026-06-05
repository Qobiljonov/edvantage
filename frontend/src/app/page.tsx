'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion, useScroll, useTransform } from 'framer-motion';
import {
  ArrowRight,
  Brain,
  BarChart3,
  Shield,
  Building2,
  ChevronRight,
  Play,
  Sparkles,
  Target,
  Users,
  BookOpen,
  Timer,
  Award,
} from 'lucide-react';
import { Navbar } from '@/components/landing/navbar';
import { MotionButton } from '@/components/motion/motion-button';
import { Badge } from '@/components/ui/badge';
import { SectionHeader } from '@/components/shared/section-header';
import { Reveal } from '@/components/motion/reveal';
import { FloatingOrb } from '@/components/motion/floating-orb';
import { AnimatedStat } from '@/components/motion/animated-counter';
import { FeatureCard } from '@/components/motion/feature-card';
import { testimonials, pricingPlans } from '@/lib/mock-data';

const metrics = [
  { raw: '250000', suffix: '+', label: "Faol o'quvchi", sub: '14 viloyat' },
  { raw: '1247', suffix: '', label: 'Maktab hamkori', sub: 'Davlat va xususiy' },
  { raw: '94', suffix: '%', label: "Natija o'sishi", sub: "6 oylik o'rtacha" },
  { raw: '99.97', suffix: '%', label: 'Platforma uptime', sub: 'Milliy infratuzilma' },
];

const capabilities = [
  {
    icon: Brain,
    title: 'AI Ustoz',
    desc: "Milliy til va imtihon standartlariga mos sun'iy intellekt yordamchisi — 24 soat, 7 kun.",
  },
  {
    icon: Timer,
    title: 'DTM Simulyatori',
    desc: 'Haqiqiy vaqt, CBT interfeysi va zamonaviy tahlil — imtihon zalidagi tajriba.',
  },
  {
    icon: BarChart3,
    title: 'Milliy analitika',
    desc: "Maktab, hudud va respublika kesimida shaffof ko'rsatkichlar.",
  },
  {
    icon: Target,
    title: 'Shaxsiy reja',
    desc: "Har bir o'quvchi uchun AI tomonidan tuzilgan o'quv yo'li.",
  },
  {
    icon: BookOpen,
    title: 'Kutubxona',
    desc: "Rasmiy o'quv materiallari va AI qayta ishlash.",
  },
  {
    icon: Users,
    title: "Ota-ona va o'qituvchi",
    desc: 'Bir ekotizim — uch tomonlama ishonchli aloqa.',
  },
];

const partners = [
  "O'zbekiston Respublikasi Ta'lim vazirligi",
  'DTM',
  'Cambridge Assessment',
  'Toshkent davlat universiteti',
  'PDP Academy',
  'INHA University',
];

export default function LandingPage() {
  const { scrollYProgress } = useScroll();
  const heroOpacity = useTransform(scrollYProgress, [0, 0.15], [1, 0.88]);
  const heroY = useTransform(scrollYProgress, [0, 0.2], [0, 48]);
  const previewY = useTransform(scrollYProgress, [0, 0.25], [0, -32]);
  const previewScale = useTransform(scrollYProgress, [0, 0.2], [1, 0.97]);

  return (
    <div className="overflow-x-hidden bg-[hsl(var(--background))]">
      <Navbar />

      {/* HERO */}
      <section className="relative min-h-[100dvh] gradient-mesh noise-overlay pt-28 pb-20 lg:pt-36">
        <FloatingOrb className="left-[-10%] top-[15%] bg-brand-400/30" size={320} delay={0} />
        <FloatingOrb
          className="right-[-5%] top-[25%] bg-teal-500/20"
          size={240}
          delay={1.5}
          duration={10}
        />
        <FloatingOrb
          className="left-[20%] bottom-[20%] bg-violet-500/15"
          size={180}
          delay={0.8}
          duration={12}
        />

        <motion.div
          style={{ opacity: heroOpacity, y: heroY }}
          className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8"
        >
          <Reveal>
            <div className="flex flex-wrap items-center gap-3">
              <Badge variant="gold">Milliy loyiha</Badge>
              <span className="text-2xs font-medium text-ink-tertiary">
                O&apos;zbekiston · 2026
              </span>
            </div>
          </Reveal>

          <Reveal delay={1} className="mt-8 max-w-4xl">
            <h1 className="display-xl text-balance">
              Har bir o&apos;quvchi uchun{' '}
              <span className="gradient-hero-text">shaxsiy intellekt</span>
            </h1>
          </Reveal>

          <Reveal delay={2} className="mt-6 max-w-2xl">
            <p className="body-lg text-balance">
              Edvantage — respublika miqyosidagi AI ta&apos;lim infratuzilmasi. DTM tayyorgarligi,
              shaffof analitika va milliy standartlarga mos o&apos;quv tajribasi.
            </p>
          </Reveal>

          <Reveal delay={3} className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link href="/dashboard">
              <MotionButton variant="primary" size="lg" className="w-full sm:w-auto">
                Platformaga kirish
                <ArrowRight className="h-4 w-4" aria-hidden />
              </MotionButton>
            </Link>
            <MotionButton
              variant="outline"
              size="lg"
              className="border-white/25 text-white hover:bg-white/10"
            >
              <Building2 className="h-4 w-4" aria-hidden />
              Hamkorlik bo&apos;yicha aloqa
            </MotionButton>
          </Reveal>

          <Reveal
            delay={4}
            className="mt-16 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-ink-200 bg-ink-200 lg:grid-cols-4"
          >
            {metrics.map((m) => (
              <div key={m.label} className="bg-white px-5 py-6 sm:px-6">
                <p className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
                  <AnimatedStat raw={m.raw + m.suffix} />
                </p>
                <p className="mt-1 text-sm font-medium text-ink">{m.label}</p>
                <p className="mt-0.5 text-2xs text-ink-tertiary">{m.sub}</p>
              </div>
            ))}
          </Reveal>
        </motion.div>

        {/* Product preview — AI Chat Demo */}
        <motion.div
          style={{ y: previewY, scale: previewScale }}
          className="relative mx-auto mt-20 max-w-5xl px-4 sm:px-6 lg:px-8"
        >
          <Reveal delay={5}>
            <div className="surface-elevated overflow-hidden rounded-3xl ring-1 ring-ink-200/80 bg-white">
              <div className="flex items-center gap-2 border-b border-ink-100 px-5 py-3">
                <div className="h-2.5 w-2.5 rounded-full bg-ink-300" />
                <div className="h-2.5 w-2.5 rounded-full bg-ink-300" />
                <div className="h-2.5 w-2.5 rounded-full bg-ink-300" />
                <span className="ml-2 text-2xs font-medium text-ink-tertiary">edvantage.uz/ai-ustoz</span>
              </div>
              <div className="p-6 md:p-8 space-y-6 bg-ink-50/50">
                <div className="flex justify-end">
                  <div className="rounded-2xl rounded-tr-sm bg-brand-600 px-5 py-3 text-white shadow-soft max-w-[80%]">
                    <p className="text-sm">Assalomu alaykum! Menga Nyutonning 2-qonunini hayotiy misollar bilan tushuntirib bera olasizmi?</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-ink-950 text-white shadow-sm">
                    <Brain className="h-5 w-5" />
                  </div>
                  <div className="rounded-2xl rounded-tl-sm bg-white border border-ink-100 px-5 py-4 text-ink shadow-soft max-w-[85%] space-y-3">
                    <p className="text-sm font-semibold">Va alaykum assalom!</p>
                    <p className="text-sm leading-relaxed">
                      Albatta! Nyutonning 2-qonuni juda sodda: <strong>"Kuch qancha katta bo'lsa, jism shuncha tezlanish oladi, jism qancha og'ir bo'lsa, uni tezlashtirish shuncha qiyin bo'ladi."</strong>
                    </p>
                    <div className="bg-ink-50 rounded-lg p-3 border border-ink-100">
                      <p className="text-sm">Matematik formulasi: <span className="font-mono bg-white px-1 py-0.5 rounded text-brand-600">F = m × a</span></p>
                    </div>
                    <p className="text-sm text-ink-secondary">
                      <strong>Hayotiy misol:</strong> Tasavvur qiling, siz do'stingiz bilan supermarketdasiz. Boshida aravacha bo'sh (massa kichik), uni itarish juda oson (tezlanish katta). Keyin aravachani mahsulotlarga to'ldirdingiz (massa ortdi). Endi uni xuddi avvalgidek tezlikda itarish uchun sizga ko'proq kuch (F) kerak bo'ladi!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        </motion.div>
      </section>

      {/* PLATFORM */}
      <section id="platforma" className="border-t border-ink-200/80 py-24 lg:py-32">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-16 lg:grid-cols-2">
            <SectionHeader
              eyebrow="Muammo va yechim"
              title="Ta'lim tizimini raqamlashtirish — keyingi bosqich"
              description="O'zbekiston yoshlari imtihonlarga tayyorlanishda yagona milliy platforma orqali teng imkoniyatga ega bo'ladi. Edvantage — shaxsiylashtirilgan, shaffof va ishonchli."
            />
            <Reveal className="space-y-4">
              {[
                {
                  n: '01',
                  t: 'Shaffoflik',
                  d: "Ota-ona, o'qituvchi va davlat uchun bir xil haqiqat manbasi.",
                },
                {
                  n: '02',
                  t: 'Shaxsiylashtirish',
                  d: "AI har bir o'quvchining zaif va kuchli tomonlarini aniqlaydi.",
                },
                {
                  n: '03',
                  t: 'Milliy standart',
                  d: 'DTM, maktab va respublika reytingi — bitta ekotizimda.',
                },
              ].map((item) => (
                <div key={item.n} className="flex gap-5 border-b border-ink-100 pb-5 last:border-0">
                  <span className="text-2xs font-semibold tabular-nums text-ink-tertiary">
                    {item.n}
                  </span>
                  <div>
                    <p className="font-semibold text-ink">{item.t}</p>
                    <p className="mt-1 body-md">{item.d}</p>
                  </div>
                </div>
              ))}
            </Reveal>
          </div>
        </div>
      </section>

      {/* CAPABILITIES */}
      <section id="imkoniyatlar" className="bg-ink-950 py-24 text-white lg:py-32">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <SectionHeader
            eyebrow="Imkoniyatlar"
            title="Bitta platforma — to'liq ekotizim"
            description="O'quvchi, ota-ona, o'qituvchi va davlat uchun mo'ljallangan modullar."
            align="center"
            className="text-white [&_h2]:text-white [&_p]:text-white/60 [&_.eyebrow]:text-white/40"
          />
          <div className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {capabilities.map((c, i) => (
              <FeatureCard key={c.title} delay={i * 0.05}>
                <c.icon className="h-6 w-6 text-brand-400" strokeWidth={1.5} aria-hidden />
                <h3 className="mt-4 text-[15px] font-semibold">{c.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/55">{c.desc}</p>
              </FeatureCard>
            ))}
          </div>
        </div>
      </section>

      {/* AI */}
      <section className="py-24 lg:py-32">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="surface-elevated overflow-hidden rounded-3xl">
            <div className="grid lg:grid-cols-2">
              <div className="border-b border-ink-100 p-8 lg:border-b-0 lg:border-r lg:p-12">
                <Badge variant="default" className="mb-4">
                  <Sparkles className="mr-1 inline h-3 w-3" aria-hidden />
                  AI Ustoz
                </Badge>
                <h2 className="display-md text-balance">Savolingiz — javobingiz bir zumda</h2>
                <p className="body-md mt-4">
                  Mavzularni tushuntirish, test yaratish, o&apos;quv rejasi tuzish — barchasi
                  o&apos;zbek tilida, milliy dasturga mos.
                </p>
                <Link href="/dashboard/ai-ustoz" className="mt-8 inline-block">
                  <MotionButton variant="primary">
                    Sinab ko&apos;rish
                    <ChevronRight className="h-4 w-4" />
                  </MotionButton>
                </Link>
              </div>
              <div className="bg-ink-50 p-8 lg:p-12">
                <div className="space-y-3">
                  <div className="rounded-2xl bg-white p-4 shadow-soft">
                    <p className="text-2xs text-ink-tertiary">O&apos;quvchi</p>
                    <p className="mt-1 text-sm text-ink">
                      30 kunlik DTM matematika rejasini tuzing
                    </p>
                  </div>
                  <div className="rounded-2xl bg-ink-950 p-4 text-white">
                    <p className="text-2xs text-white/50">AI Ustoz</p>
                    <p className="mt-1 text-sm leading-relaxed text-white/90">
                      Reja tayyor. 1-hafta: algebra takrorlash (6 soat). 2-hafta: geometriya
                      amaliyoti. Har kuni 45 daqiqa tavsiya etiladi.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* RESULTS */}
      <section id="natijalar" className="border-t border-ink-200/80 py-24 lg:py-32">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <SectionHeader eyebrow="Natijalar" title="Raqamlar gapiradi" align="center" />
          <div className="mt-16 grid gap-6 md:grid-cols-3">
            {testimonials.map((t, i) => (
              <Reveal key={t.name} delay={i}>
                <blockquote className="surface h-full p-6">
                  <p className="text-[15px] leading-relaxed text-ink-secondary">
                    &ldquo;{t.text}&rdquo;
                  </p>
                  <footer className="mt-6 flex items-center gap-3 border-t border-ink-100 pt-6">
                    <div
                      className="flex h-10 w-10 items-center justify-center rounded-full bg-ink-950 text-xs font-bold text-white"
                      aria-hidden
                    >
                      {t.name[0]}
                    </div>
                    <div>
                      <cite className="not-italic font-semibold text-ink text-sm">{t.name}</cite>
                      <p className="text-2xs text-ink-tertiary">
                        {t.role} · {t.school}
                      </p>
                    </div>
                  </footer>
                </blockquote>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* PARTNERS */}
      <section id="hamkorlar" className="border-y border-ink-200/80 bg-white py-16">
        <div className="mx-auto max-w-6xl px-4 text-center sm:px-6 lg:px-8">
          <p className="eyebrow">Rasmiy hamkorlar</p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-x-12 gap-y-6">
            {partners.map((p) => (
              <span key={p} className="text-sm font-semibold tracking-tight text-ink-tertiary">
                {p}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section className="py-24 lg:py-32">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <SectionHeader
            eyebrow="Tariflar"
            title="Maktab va oila uchun mos yechim"
            align="center"
          />
          <div className="mt-16 grid gap-6 lg:grid-cols-3">
            {pricingPlans.map((plan, i) => (
              <Reveal key={plan.name} delay={i}>
                <div
                  className={`surface flex h-full flex-col p-8 ${
                    plan.popular ? 'ring-2 ring-brand-600 shadow-glow' : ''
                  }`}
                >
                  {plan.popular && (
                    <Badge variant="default" className="mb-4 w-fit">
                      Tavsiya etiladi
                    </Badge>
                  )}
                  <h3 className="text-lg font-semibold text-ink">{plan.name}</h3>
                  <p className="mt-4">
                    <span className="text-4xl font-semibold tracking-tight text-ink">
                      {plan.price}
                    </span>
                    {plan.period && (
                      <span className="text-ink-tertiary"> so&apos;m/{plan.period}</span>
                    )}
                  </p>
                  <ul className="mt-8 flex-1 space-y-3">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-sm text-ink-secondary">
                        <Award className="mt-0.5 h-4 w-4 shrink-0 text-teal-600" aria-hidden />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <MotionButton
                    variant={plan.popular ? 'primary' : 'secondary'}
                    className="mt-8 w-full"
                  >
                    {plan.name === 'Maktab' ? 'Murojaat qilish' : 'Boshlash'}
                  </MotionButton>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section id="aloqa" className="pb-24 lg:pb-32">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl bg-ink-950 px-8 py-16 text-center text-white sm:px-16 lg:py-24">
            <div
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(37,99,235,0.25),transparent_60%)]"
              aria-hidden
            />
            <Reveal className="relative">
              <Shield className="mx-auto h-10 w-10 text-gold-400" strokeWidth={1.5} aria-hidden />
              <h2 className="display-md mt-6 text-balance text-white">
                O&apos;zbekiston ta&apos;limining kelajagini birga quramiz
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-white/60">
                Maktablar, investorlar va davlat tashkilotlari uchun maxsus demo va strategik
                hamkorlik dasturi.
              </p>
              <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Link href="/dashboard">
                  <MotionButton
                    variant="secondary"
                    size="lg"
                    className="border-white/20 bg-white text-ink-950 hover:bg-ink-50"
                  >
                    Demo boshlash
                  </MotionButton>
                </Link>
                <MotionButton
                  variant="outline"
                  size="lg"
                  className="border-white/25 text-white hover:bg-white/10"
                >
                  <Building2 className="h-4 w-4" aria-hidden />
                  Hamkorlik bo&apos;yicha aloqa
                </MotionButton>
              </div>
              <p className="mt-8 text-2xs text-white/40">
                info@edvantage.uz · +998 71 200 00 00 · Toshkent
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      <footer className="border-t border-ink-200 py-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 sm:flex-row sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <Image src="/images/icon-dark.png" alt="Edvantage Logo" width={32} height={32} className="h-8 w-8 object-contain" />
            <span className="font-semibold text-ink">Edvantage</span>
          </div>
          <p className="text-2xs text-ink-tertiary">
            © 2026 Edvantage. Milliy AI ta&apos;lim platformasi.
          </p>
        </div>
      </footer>
    </div>
  );
}
