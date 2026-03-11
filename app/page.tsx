// app/page.tsx - Page d'accueil qui redirige vers /login pour l'auth
'use client'

import { motion, useScroll, useTransform } from 'framer-motion'
import { 
  Heart, 
  Sparkles, 
  ArrowRight, 
  Zap, 
  Shield, 
  Star,
  Lock,
  ChevronDown,
  Instagram,
  Twitter,
  Github
} from 'lucide-react'
import Link from 'next/link'

// 🎭 Variantes d'animation
const fadeInUp = {
  hidden: { opacity: 0, y: 60 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] }
  }
}

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.2 }
  }
}

const pulseGlow = {
  boxShadow: [
    "0 0 20px rgba(236, 72, 153, 0.3)",
    "0 0 60px rgba(236, 72, 153, 0.6)",
    "0 0 20px rgba(236, 72, 153, 0.3)"
  ],
  transition: { duration: 2, repeat: Infinity }
}

export default function LandingPage() {
  const { scrollYProgress } = useScroll()
  const opacity = useTransform(scrollYProgress, [0, 0.3], [1, 0])

  const features = [
    {
      icon: <Heart className="w-8 h-8 text-pink-500" />,
      title: "Quiz Personnalisés",
      description: "Crée des questionnaires uniques sur vos relations, vos souvenirs et vos sentiments."
    },
    {
      icon: <Sparkles className="w-8 h-8 text-purple-500" />,
      title: "Design Magique",
      description: "Une interface enchanteresse avec des animations fluides et des couleurs vibrantes."
    },
    {
      icon: <Shield className="w-8 h-8 text-blue-500" />,
      title: "100% Privé",
      description: "Vos données sont sécurisées. Partagez uniquement avec ceux que vous choisissez."
    },
    {
      icon: <Zap className="w-8 h-8 text-yellow-500" />,
      title: "Instantané",
      description: "Créez et partagez en quelques secondes. Pas d'inscription compliquée."
    }
  ]

  const steps = [
    {
      number: "01",
      title: "Crée ton Quiz",
      description: "Choisis tes questions, personnalise le design et ajoute ta touche magique.",
      image: "🎨"
    },
    {
      number: "02",
      title: "Partage le Lien",
      description: "Envoie ton quiz unique à tes proches par message, réseaux sociaux ou email.",
      image: "🔗"
    },
    {
      number: "03",
      title: "Découvre les Réponses",
      description: "Reçois les réponses en temps réel et partage des moments inoubliables.",
      image: "💝"
    }
  ]

  const testimonials = [
    {
      name: "Sophie & Thomas",
      role: "En couple depuis 2 ans",
      content: "On a découvert des choses sur nous qu'on ne savait même pas ! Cœur à Cœur a rendu notre anniversaire magique.",
      avatar: "💑"
    },
    {
      name: "Marie L.",
      role: "Amie de longue date",
      content: "J'ai envoyé un quiz à mes 5 meilleures amies. Les réponses étaient hilarantes et touchantes à la fois !",
      avatar: "👯‍♀️"
    },
    {
      name: "Lucas & Famille",
      role: "Pour la fête des mères",
      content: "Toute la famille a participé au quiz pour la fête des mères. Ma mère a pleuré de joie en lisant les réponses.",
      avatar: "👨‍👩‍👧‍👦"
    }
  ]

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white overflow-x-hidden">
      {/* 🌟 Navigation */}
      <motion.nav 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-[#0a0a0f]/80 border-b border-white/5"
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <motion.div 
            className="flex items-center gap-3"
            whileHover={{ scale: 1.05 }}
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center text-xl">
              💕
            </div>
            <span className="font-bold text-xl bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
              Cœur à Cœur
            </span>
          </motion.div>

          <div className="hidden md:flex items-center gap-8">
            {['Fonctionnalités', 'Comment ça marche', 'Témoignages'].map((item) => (
              <motion.a
                key={item}
                href={`#${item.toLowerCase().replace(/ /g, '-')}`}
                className="text-sm text-white/60 hover:text-white transition-colors"
                whileHover={{ y: -2 }}
              >
                {item}
              </motion.a>
            ))}
          </div>

          <motion.div>
            {/* ✅ CORRECTION : lien vers /login au lieu de /dashboard */}
            <Link href="/login">
              <motion.button
                className="px-5 py-2.5 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 text-sm font-semibold shadow-lg shadow-pink-500/25"
                whileHover={{ scale: 1.05, boxShadow: "0 20px 40px rgba(236, 72, 153, 0.4)" }}
                whileTap={{ scale: 0.95 }}
              >
                Commencer
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </motion.nav>

      {/* 🎨 Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div 
            className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-pink-500/20 rounded-full blur-[120px]"
            animate={{
              scale: [1, 1.2, 1],
              x: [0, 50, 0],
              y: [0, 30, 0],
            }}
            transition={{ duration: 10, repeat: Infinity }}
          />
          <motion.div 
            className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-purple-500/20 rounded-full blur-[100px]"
            animate={{
              scale: [1.2, 1, 1.2],
              x: [0, -30, 0],
              y: [0, -50, 0],
            }}
            transition={{ duration: 12, repeat: Infinity }}
          />
          
          {/* Floating Elements */}
          {[...Array(15)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute text-2xl"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [-30, 30, -30],
                opacity: [0.2, 0.5, 0.2],
              }}
              transition={{
                duration: 5 + Math.random() * 5,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            >
              {['💕', '✨', '💫', '💖', '🌟', '💝'][i % 6]}
            </motion.div>
          ))}
        </div>

        {/* Hero Content */}
        <motion.div 
          className="relative z-10 max-w-6xl mx-auto px-6 text-center"
          style={{ opacity }}
        >
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8"
          >
            <span className="flex h-2 w-2 rounded-full bg-pink-500 animate-pulse"></span>
            <span className="text-sm text-white/70">Plus de 10 000 quiz créés ce mois</span>
          </motion.div>

          <motion.h1 
            className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6 leading-tight"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <span className="bg-gradient-to-r from-white via-pink-200 to-purple-200 bg-clip-text text-transparent">
              Connecte les cœurs
            </span>
            <br />
            <span className="bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">
              un quiz à la fois
            </span>
          </motion.h1>

          <motion.p 
            className="text-lg md:text-xl text-white/60 max-w-2xl mx-auto mb-10"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            Crée des questionnaires magiques pour découvrir ce que tes proches pensent vraiment. 
            Parfait pour les couples, les amis et la famille.
          </motion.p>

          <motion.div 
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            {/* ✅ CORRECTION : lien vers /login au lieu de /dashboard */}
            <Link href="/login">
              <motion.button
                className="group relative px-8 py-4 rounded-full bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-600 text-lg font-semibold shadow-2xl shadow-pink-500/30 overflow-hidden"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                animate={pulseGlow}
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12"
                  animate={{ x: ["-200%", "200%"] }}
                  transition={{ duration: 3, repeat: Infinity, repeatDelay: 1 }}
                />
                <span className="relative flex items-center gap-2">
                  Créer mon premier quiz
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
              </motion.button>
            </Link>
          </motion.div>

          {/* Stats */}
          <motion.div 
            className="mt-20 grid grid-cols-3 gap-8 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            {[
              { value: "50K+", label: "Quiz créés" },
              { value: "1M+", label: "Réponses" },
              { value: "4.9★", label: "Note moyenne" },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
                  {stat.value}
                </div>
                <div className="text-sm text-white/50 mt-1">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div 
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <ChevronDown className="w-6 h-6 text-white/30" />
        </motion.div>
      </section>

      {/* 🎯 Features Section */}
      <section id="fonctionnalités" className="py-32 relative">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div 
            className="text-center mb-20"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
          >
            <span className="text-pink-400 font-semibold text-sm uppercase tracking-wider">Fonctionnalités</span>
            <h2 className="text-4xl md:text-5xl font-bold mt-4 mb-6">
              Tout ce qu'il faut pour créer<br />
              <span className="bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
                des moments magiques
              </span>
            </h2>
          </motion.div>

          <motion.div 
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {features.map((feature, i) => (
              <motion.div
                key={i}
                variants={fadeInUp}
                className="group relative p-8 rounded-3xl bg-white/[0.02] border border-white/5 hover:border-pink-500/30 transition-all duration-500"
                whileHover={{ y: -10, scale: 1.02 }}
              >
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-pink-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                <motion.div 
                  className="relative w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform"
                  whileHover={{ rotate: 10 }}
                >
                  {feature.icon}
                </motion.div>
                
                <h3 className="relative text-xl font-bold mb-3">{feature.title}</h3>
                <p className="relative text-white/50 text-sm leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* 📱 How it Works */}
      <section id="comment-ça-marche" className="py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-500/5 to-transparent" />
        
        <div className="max-w-7xl mx-auto px-6 relative">
          <motion.div 
            className="text-center mb-20"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
          >
            <span className="text-purple-400 font-semibold text-sm uppercase tracking-wider">Comment ça marche</span>
            <h2 className="text-4xl md:text-5xl font-bold mt-4">
              En 3 étapes simples
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2 }}
                className="relative"
              >
                <div className="text-8xl font-bold text-white/5 absolute -top-8 -left-4 select-none">
                  {step.number}
                </div>
                
                <motion.div 
                  className="relative bg-white/[0.03] border border-white/10 rounded-3xl p-8 h-full"
                  whileHover={{ scale: 1.02, borderColor: "rgba(236, 72, 153, 0.3)" }}
                >
                  <div className="text-6xl mb-6">{step.image}</div>
                  <h3 className="text-2xl font-bold mb-4">{step.title}</h3>
                  <p className="text-white/50 leading-relaxed">{step.description}</p>
                </motion.div>

                {i < 2 && (
                  <motion.div 
                    className="hidden md:block absolute top-1/2 -right-4 w-8 h-0.5 bg-gradient-to-r from-pink-500 to-purple-500"
                    initial={{ scaleX: 0 }}
                    whileInView={{ scaleX: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.5 }}
                  />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ⭐ Testimonials */}
      <section id="témoignages" className="py-32 relative">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div 
            className="text-center mb-20"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
          >
            <span className="text-indigo-400 font-semibold text-sm uppercase tracking-wider">Témoignages</span>
            <h2 className="text-4xl md:text-5xl font-bold mt-4">
              Ils ont vécu la magie
            </h2>
          </motion.div>

          <motion.div 
            className="grid md:grid-cols-3 gap-8"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {testimonials.map((testimonial, i) => (
              <motion.div
                key={i}
                variants={fadeInUp}
                className="relative p-8 rounded-3xl bg-gradient-to-br from-white/[0.05] to-white/[0.02] border border-white/10"
                whileHover={{ y: -5, scale: 1.02 }}
              >
                <div className="flex gap-1 mb-6">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                
                <p className="text-white/70 mb-6 leading-relaxed italic">
                  "{testimonial.content}"
                </p>
                
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-500/20 to-purple-500/20 flex items-center justify-center text-2xl">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <div className="font-semibold">{testimonial.name}</div>
                    <div className="text-sm text-white/50">{testimonial.role}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* 🎁 CTA Section */}
      <section className="py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-pink-500/10 via-purple-500/10 to-indigo-500/10" />
        
        <motion.div 
          className="max-w-4xl mx-auto px-6 text-center relative"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-5xl md:text-6xl font-bold mb-6">
            Prêt à créer votre<br />
            <span className="bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">
              premier quiz ?
            </span>
          </h2>
          
          <p className="text-xl text-white/60 mb-10 max-w-2xl mx-auto">
            Rejoignez des milliers de personnes qui créent des moments magiques 
            avec leurs proches. C'est gratuit et ça prend moins d'une minute.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {/* ✅ CORRECTION : lien vers /login au lieu de /dashboard */}
            <Link href="/login">
              <motion.button
                className="px-10 py-5 rounded-full bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-600 text-lg font-bold shadow-2xl shadow-pink-500/30"
                whileHover={{ scale: 1.05, boxShadow: "0 30px 60px rgba(236, 72, 153, 0.4)" }}
                whileTap={{ scale: 0.95 }}
              >
                Créer mon quiz gratuitement
              </motion.button>
            </Link>
          </div>

          <div className="mt-8 flex items-center justify-center gap-6 text-sm text-white/40">
            <span className="flex items-center gap-2">
              <Lock className="w-4 h-4" />
              Sécurisé
            </span>
            <span className="flex items-center gap-2">
              <Zap className="w-4 h-4" />
              Instantané
            </span>
            <span className="flex items-center gap-2">
              <Heart className="w-4 h-4" />
              Sans pub
            </span>
          </div>
        </motion.div>
      </section>

      {/* 🦶 Footer */}
      <footer className="border-t border-white/5 py-16 bg-[#050508]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-3 mb-4 md:mb-0">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center text-xl">
                💕
              </div>
              <span className="font-bold text-xl">Cœur à Cœur</span>
            </div>

            <p className="text-white/30 text-sm">
              © 2026 Cœur à Cœur. Fait avec 💕 en France.
            </p>
            
            <div className="flex gap-4 mt-4 md:mt-0">
              {[Instagram, Twitter, Github].map((Icon, i) => (
                <motion.a
                  key={i}
                  href="#"
                  className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-colors"
                  whileHover={{ scale: 1.1 }}
                >
                  <Icon className="w-5 h-5" />
                </motion.a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}