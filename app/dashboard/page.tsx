'use client'

import { useEffect, useState, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  Plus, 
  LogOut, 
  Copy, 
  MessageCircle, 
  Eye, 
  Heart, 
  TrendingUp,
  Zap,
  Trash2,
  Edit3,
  MoreVertical,
  X,
  Loader2,
  Sparkles,
  Flame,
  ArrowUpRight
} from 'lucide-react'
import { motion, AnimatePresence, useScroll, useTransform, useSpring, useMotionValue } from 'framer-motion'

interface Quiz {
  id: string
  title: string
  share_code: string
  view_count: number
  created_at: string
  questions: { count: number }[]
  responses: { count: number }[]
}

// 🎭 Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 12
    }
  }
}

const cardHoverVariants = {
  rest: { scale: 1, y: 0 },
  hover: { 
    scale: 1.02, 
    y: -5,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 17
    }
  }
}

const pulseVariants = {
  initial: { scale: 1, opacity: 0.5 },
  animate: {
    scale: [1, 1.2, 1],
    opacity: [0.5, 0.8, 0.5],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
}

const floatVariants = {
  animate: {
    y: [-10, 10, -10],
    transition: {
      duration: 6,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
}

const glowVariants = {
  animate: {
    boxShadow: [
      "0 0 20px rgba(236, 72, 153, 0.3)",
      "0 0 40px rgba(236, 72, 153, 0.5)",
      "0 0 20px rgba(236, 72, 153, 0.3)"
    ],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
}

export default function Dashboard() {
  const [user, setUser] = useState<any>(null)
  const [quizzes, setQuizzes] = useState<Quiz[]>([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [activeMenu, setActiveMenu] = useState<string | null>(null)
  const [menuPosition, setMenuPosition] = useState<{ x: number; y: number; placement: 'top' | 'bottom' } | null>(null)
  const menuButtonRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({})
  const router = useRouter()
  
  const { scrollY } = useScroll()
  const headerOpacity = useTransform(scrollY, [0, 100], [0.8, 1])
  const headerY = useTransform(scrollY, [0, 100], [0, -10])
  const springHeaderY = useSpring(headerY, { stiffness: 300, damping: 30 })
  const headerBgColor = useTransform(headerOpacity, v => `rgba(15, 15, 26, ${v})`)

  useEffect(() => {
    loadData()
  }, [])

  // Fermer le menu quand on clique ailleurs
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node
      const isMenuButton = activeMenu && menuButtonRefs.current[activeMenu]?.contains(target)
      const isMenuContent = document.getElementById('quiz-menu-portal')?.contains(target)
      
      if (activeMenu && !isMenuButton && !isMenuContent) {
        setActiveMenu(null)
        setMenuPosition(null)
      }
    }
    
    const handleScroll = () => {
      if (activeMenu) {
        setActiveMenu(null)
        setMenuPosition(null)
      }
    }
    
    const handleResize = () => {
      if (activeMenu) {
        setActiveMenu(null)
        setMenuPosition(null)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    window.addEventListener('scroll', handleScroll)
    window.addEventListener('resize', handleResize)
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', handleResize)
    }
  }, [activeMenu])

  async function loadData() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/')
      return
    }
    setUser(user)

    const { data: quizzesData } = await supabase
      .from('quizzes')
      .select(`
        *,
        questions:questions(count),
        responses:responses(count)
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    setQuizzes(quizzesData || [])
    setLoading(false)
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const copyLink = (code: string) => {
    const link = `${window.location.origin}/q/${code}`
    navigator.clipboard.writeText(link)
    showToast('✨ Lien copié dans le presse-papier !')
  }

  const showToast = (message: string) => {
    const toast = document.createElement('div')
    toast.className = 'fixed bottom-8 left-1/2 -translate-x-1/2 bg-gradient-to-r from-pink-500 to-purple-600 text-white px-6 py-3 rounded-full shadow-2xl z-[9999] font-medium animate-slide-up flex items-center gap-2'
    toast.innerHTML = `<span class="animate-bounce">✨</span> ${message}`
    document.body.appendChild(toast)
    setTimeout(() => {
      toast.style.opacity = '0'
      toast.style.transform = 'translateX(-50%) translateY(20px)'
      setTimeout(() => toast.remove(), 300)
    }, 2500)
  }

  // 🗑️ SUPPRIMER UN QUIZ
  const deleteQuiz = async (quizId: string) => {
    if (!confirm('Es-tu sûr de vouloir supprimer ce quiz ? Cette action est irréversible.')) {
      closeMenu()
      return
    }

    setDeletingId(quizId)
    
    try {
      await supabase.from('questions').delete().eq('quiz_id', quizId)
      await supabase.from('responses').delete().eq('quiz_id', quizId)
      const { error } = await supabase.from('quizzes').delete().eq('id', quizId)
      
      if (error) throw error
      
      setQuizzes(quizzes.filter(q => q.id !== quizId))
      showToast('🗑️ Quiz supprimé avec succès')
    } catch (err) {
      showToast('❌ Erreur lors de la suppression')
    }
    
    setDeletingId(null)
    closeMenu()
  }

  // ✏️ MODIFIER UN QUIZ
  const editQuiz = (quizId: string) => {
    closeMenu()
    router.push(`/dashboard/quiz/${quizId}/edit`)
  }

  // 👁️ VOIR LES RÉPONSES
  const viewResponses = (quizId: string) => {
    closeMenu()
    router.push(`/dashboard/quiz/${quizId}`)
  }

  const closeMenu = () => {
    setActiveMenu(null)
    setMenuPosition(null)
  }

  // 📍 Calculer la position du menu avec position fixed
  const toggleMenu = (quizId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (activeMenu === quizId) {
      closeMenu()
      return
    }

    const button = menuButtonRefs.current[quizId]
    if (!button) return

    const rect = button.getBoundingClientRect()
    const windowHeight = window.innerHeight
    const windowWidth = window.innerWidth
    const menuHeight = 200
    const menuWidth = 208 // w-52 = 13rem = 208px

    // Déterminer si on affiche en haut ou en bas
    const spaceBelow = windowHeight - rect.bottom
    const placement = spaceBelow < menuHeight ? 'top' : 'bottom'

    // Calculer la position
    let x = rect.right - menuWidth
    let y = placement === 'bottom' ? rect.bottom + 8 : rect.top - menuHeight - 8

    // Ajuster si ça dépasse à gauche
    if (x < 8) x = 8
    if (x + menuWidth > windowWidth - 8) x = windowWidth - menuWidth - 8

    setMenuPosition({ x, y, placement })
    setActiveMenu(quizId)
  }

  // Trouver le quiz actif pour le menu
  const activeQuiz = quizzes.find(q => q.id === activeMenu)

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f0f1a] flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0">
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full bg-pink-500/10 blur-3xl"
              style={{
                width: 300 + i * 100,
                height: 300 + i * 100,
                left: `${20 + i * 15}%`,
                top: `${20 + i * 10}%`,
              }}
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.5, 0.3],
                x: [0, 50, 0],
                y: [0, 30, 0],
              }}
              transition={{
                duration: 8 + i * 2,
                repeat: Infinity,
                ease: "easeInOut",
                delay: i * 0.5,
              }}
            />
          ))}
        </div>
        
        <motion.div 
          className="relative z-10 flex flex-col items-center gap-4"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <Loader2 className="w-12 h-12 text-pink-500" />
          </motion.div>
          <motion.p 
            className="text-white/60 font-medium"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            Chargement de ton espace...
          </motion.p>
        </motion.div>
      </div>
    )
  }

  const totalResponses = quizzes.reduce((acc, q) => acc + (q.responses[0]?.count || 0), 0)
  const totalViews = quizzes.reduce((acc, q) => acc + q.view_count, 0)

  return (
    <div className="min-h-screen bg-[#0f0f1a] relative overflow-hidden">
      {/* ✨ Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          className="absolute top-0 left-1/4 w-96 h-96 bg-pink-500/20 rounded-full blur-[128px]"
          animate={{
            scale: [1, 1.2, 1],
            x: [0, 50, 0],
            y: [0, 30, 0],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-[128px]"
          animate={{
            scale: [1.2, 1, 1.2],
            x: [0, -30, 0],
            y: [0, -50, 0],
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[150px]"
          animate={{ rotate: 360 }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
        />
        
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white/20 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [-20, -100],
              opacity: [0, 1, 0],
              scale: [0, 1, 0],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 3,
              ease: "easeOut",
            }}
          />
        ))}
      </div>

      {/* 🎨 Header */}
      <motion.header 
        className="relative z-50 border-b border-white/10 backdrop-blur-xl sticky top-0"
        style={{ 
          backgroundColor: headerBgColor,
          y: springHeaderY
        }}
      >
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <motion.div 
            className="flex items-center gap-3"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ type: "spring", stiffness: 100 }}
          >
            <motion.div 
              className="w-12 h-12 rounded-2xl bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-600 flex items-center justify-center text-2xl shadow-lg shadow-pink-500/30"
              variants={glowVariants}
              animate="animate"
              whileHover={{ scale: 1.1, rotate: 5 }}
            >
              💕
            </motion.div>
            <div>
              <motion.h1 
                className="font-bold text-xl text-white flex items-center gap-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                Cœur à Cœur
                <motion.span
                  animate={{ rotate: [0, 14, -14, 0] }}
                  transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
                >
                  ✨
                </motion.span>
              </motion.h1>
              <motion.p 
                className="text-xs text-white/40"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                Bienvenue, <span className="text-pink-400 font-medium">{user?.email?.split('@')[0]}</span>
              </motion.p>
            </div>
          </motion.div>
          
          <motion.div 
            className="flex items-center gap-4"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ type: "spring", stiffness: 100 }}
          >
            <motion.div 
              className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10"
              whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.1)" }}
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              >
                <Zap size={16} className="text-yellow-400" />
              </motion.div>
              <span className="text-sm text-white/60 font-medium">Gratuit</span>
            </motion.div>
            
            <motion.button 
              onClick={signOut}
              className="p-3 rounded-xl bg-white/5 hover:bg-red-500/20 transition-colors text-white/60 hover:text-red-400 border border-white/10 hover:border-red-500/30"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <LogOut size={20} />
            </motion.button>
          </motion.div>
        </div>
      </motion.header>

      <main className="relative z-10 max-w-6xl mx-auto px-4 py-8">
        {/* 📊 Stats Cards */}
        <motion.div 
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <StatCard 
            icon={<Heart className="text-pink-500" />} 
            value={quizzes.length} 
            label="Quiz créés"
            trend="+1 ce mois"
            color="pink"
            delay={0}
          />
          <StatCard 
            icon={<MessageCircle className="text-blue-400" />} 
            value={totalResponses} 
            label="Réponses"
            color="blue"
            delay={0.1}
          />
          <StatCard 
            icon={<Eye className="text-purple-400" />} 
            value={totalViews} 
            label="Vues totales"
            color="purple"
            delay={0.2}
          />
          <StatCard 
            icon={<TrendingUp className="text-green-400" />} 
            value={`${totalViews > 0 ? Math.round((totalResponses/totalViews)*100) : 0}%`} 
            label="Conversion"
            color="green"
            delay={0.3}
          />
        </motion.div>

        {/* 🎯 Section titre + bouton */}
        <motion.div 
          className="flex justify-between items-center mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div>
            <motion.h2 
              className="text-3xl font-bold text-white mb-1 flex items-center gap-2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              Mes questionnaires
              <motion.span
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Sparkles className="w-6 h-6 text-yellow-400" />
              </motion.span>
            </motion.h2>
            <motion.p 
              className="text-white/40 text-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              Gère tes quiz et vois les réponses en temps réel
            </motion.p>
          </div>
          
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link
              href="/dashboard/new"
              className="group relative bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-600 text-white px-6 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 shadow-lg shadow-pink-500/30 overflow-hidden"
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12"
                animate={{ x: ["-200%", "200%"] }}
                transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
              />
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              >
                <Plus size={20} />
              </motion.div>
              <span className="hidden sm:inline relative z-10">Nouveau quiz</span>
              <span className="sm:hidden relative z-10">Créer</span>
            </Link>
          </motion.div>
        </motion.div>

        {/* 📝 Liste des quiz */}
        <motion.div 
          className="space-y-4"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <AnimatePresence mode="popLayout">
            {quizzes.length === 0 ? (
              <motion.div 
                className="bg-white/5 border border-white/10 rounded-3xl p-12 text-center relative overflow-hidden"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
              >
                <motion.div 
                  className="absolute inset-0 bg-gradient-to-r from-pink-500/10 via-purple-500/10 to-blue-500/10"
                  animate={{ 
                    backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                  }}
                  transition={{ duration: 5, repeat: Infinity }}
                  style={{ backgroundSize: "200% 200%" }}
                />
                
                <motion.div 
                  className="relative z-10"
                  variants={floatVariants}
                  animate="animate"
                >
                  <motion.div 
                    className="text-7xl mb-4 inline-block"
                    animate={{ 
                      scale: [1, 1.1, 1],
                      rotate: [0, 5, -5, 0]
                    }}
                    transition={{ duration: 4, repeat: Infinity }}
                  >
                    💌
                  </motion.div>
                  <h3 className="text-2xl font-bold text-white mb-2">Aucun questionnaire</h3>
                  <p className="text-white/40 mb-6">Crée ton premier quiz et partage-le avec tes proches !</p>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Link
                      href="/dashboard/new"
                      className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold inline-flex items-center gap-2 shadow-lg shadow-pink-500/25"
                    >
                      <Plus size={20} />
                      Créer mon premier quiz
                    </Link>
                  </motion.div>
                </motion.div>
              </motion.div>
            ) : (
              quizzes.map((quiz, idx) => (
                <motion.div
                  key={quiz.id}
                  layout
                  variants={itemVariants}
                  initial="rest"
                  whileHover="hover"
                  exit={{ opacity: 0, scale: 0.9, y: -20 }}
                  className="relative group"
                >
                  <motion.div
                    className="absolute -inset-0.5 bg-gradient-to-r from-pink-500 to-purple-600 rounded-2xl opacity-0 group-hover:opacity-50 blur transition-opacity duration-500"
                    variants={pulseVariants}
                  />
                  
                  <motion.div 
                    className="relative bg-white/5 border border-white/10 hover:border-pink-500/30 rounded-2xl p-6 transition-colors backdrop-blur-sm"
                    variants={cardHoverVariants}
                  >
                    {deletingId === quiz.id && (
                      <motion.div 
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm rounded-2xl flex items-center justify-center z-20"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                      >
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        >
                          <Loader2 className="w-10 h-10 text-pink-500" />
                        </motion.div>
                      </motion.div>
                    )}

                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <motion.h3 
                            onClick={() => viewResponses(quiz.id)}
                            className="font-bold text-xl text-white group-hover:text-pink-400 transition-colors cursor-pointer flex items-center gap-2"
                            whileHover={{ x: 5 }}
                          >
                            {quiz.title}
                            <motion.span
                              initial={{ opacity: 0, x: -10 }}
                              whileHover={{ opacity: 1, x: 0 }}
                              className="text-pink-400"
                            >
                              <ArrowUpRight size={18} />
                            </motion.span>
                          </motion.h3>
                          
                          {quiz.responses[0]?.count > 0 && (
                            <motion.span 
                              className="px-3 py-1 rounded-full bg-pink-500/20 text-pink-400 text-xs font-semibold flex items-center gap-1"
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ type: "spring", stiffness: 500 }}
                            >
                              <motion.div
                                animate={{ scale: [1, 1.2, 1] }}
                                transition={{ duration: 1, repeat: Infinity }}
                              >
                                <Flame size={12} />
                              </motion.div>
                              {quiz.responses[0]?.count} nouvelle{quiz.responses[0]?.count > 1 ? 's' : ''}
                            </motion.span>
                          )}
                        </div>
                        
                        <motion.p 
                          className="text-white/40 text-sm mb-3"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.1 }}
                        >
                          {quiz.questions[0]?.count || 0} questions • 
                          Créé le {new Date(quiz.created_at).toLocaleDateString('fr-FR', { 
                            day: 'numeric', 
                            month: 'long', 
                            year: 'numeric' 
                          })}
                        </motion.p>
                        
                        <div className="flex flex-wrap items-center gap-4 text-sm">
                          <motion.span 
                            className="flex items-center gap-1.5 text-white/60 bg-white/5 px-3 py-1.5 rounded-full"
                            whileHover={{ scale: 1.05, backgroundColor: "rgba(168, 85, 247, 0.2)" }}
                          >
                            <Eye size={16} className="text-purple-400" />
                            {quiz.view_count} vues
                          </motion.span>
                          <motion.span 
                            className="flex items-center gap-1.5 text-white/60 bg-white/5 px-3 py-1.5 rounded-full"
                            whileHover={{ scale: 1.05, backgroundColor: "rgba(59, 130, 246, 0.2)" }}
                          >
                            <MessageCircle size={16} className="text-blue-400" />
                            {quiz.responses[0]?.count || 0} réponses
                          </motion.span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        {/* Lien copiable */}
                        <motion.div 
                          className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 flex items-center gap-2 text-sm group/link"
                          whileHover={{ scale: 1.02, borderColor: "rgba(236, 72, 153, 0.5)" }}
                        >
                          <code className="text-white/60 truncate max-w-[120px] sm:max-w-[180px] font-mono">/q/{quiz.share_code}</code>
                          <motion.button
                            onClick={() => copyLink(quiz.share_code)}
                            className="p-2 rounded-lg hover:bg-white/10 transition-colors text-white/60 hover:text-pink-400"
                            whileHover={{ scale: 1.2 }}
                            whileTap={{ scale: 0.9 }}
                            title="Copier le lien"
                          >
                            <Copy size={16} />
                          </motion.button>
                        </motion.div>

                        {/* Menu Button - sans le menu dedans */}
                        <motion.button
                          ref={el => { menuButtonRefs.current[quiz.id] = el }}
                          onClick={(e) => toggleMenu(quiz.id, e)}
                          className={`p-3 rounded-xl transition-all relative z-10 ${
                            activeMenu === quiz.id 
                              ? 'bg-pink-500/20 text-pink-400' 
                              : 'bg-white/5 text-white/60 hover:text-white hover:bg-white/10'
                          }`}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <AnimatePresence mode="wait">
                            {activeMenu === quiz.id ? (
                              <motion.div
                                key="close"
                                initial={{ rotate: -90, opacity: 0 }}
                                animate={{ rotate: 0, opacity: 1 }}
                                exit={{ rotate: 90, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                              >
                                <X size={20} />
                              </motion.div>
                            ) : (
                              <motion.div
                                key="menu"
                                initial={{ rotate: 90, opacity: 0 }}
                                animate={{ rotate: 0, opacity: 1 }}
                                exit={{ rotate: -90, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                              >
                                <MoreVertical size={20} />
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </motion.div>
      </main>

      {/* 🎊 Footer decoration */}
      <motion.div 
        className="fixed bottom-0 left-0 right-0 h-32 pointer-events-none z-0"
        style={{
          background: "linear-gradient(to top, rgba(15, 15, 26, 1), transparent)"
        }}
      />

      {/* ✅ MENU PORTAL - Affiché en dehors de la liste avec position fixed */}
      <AnimatePresence>
        {activeMenu && menuPosition && activeQuiz && (
          <motion.div
            id="quiz-menu-portal"
            initial={{ opacity: 0, scale: 0.8, y: menuPosition.placement === 'bottom' ? -10 : 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: menuPosition.placement === 'bottom' ? -10 : 10 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="fixed w-52 bg-[#1a1a2e]/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl z-[9999] overflow-hidden"
            style={{
              left: menuPosition.x,
              top: menuPosition.y,
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 30px rgba(236, 72, 153, 0.1)"
            }}
          >
            {/* Header */}
            <div className="px-4 py-3 border-b border-white/5 bg-white/5">
              <p className="text-xs text-white/40 font-medium uppercase tracking-wider">Actions</p>
            </div>

            <div className="p-2">
              <motion.button
                onClick={() => viewResponses(activeQuiz.id)}
                className="w-full px-4 py-3 text-left flex items-center gap-3 rounded-xl hover:bg-white/5 text-white/80 hover:text-white transition-colors group/item"
                whileHover={{ x: 5 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="p-2 rounded-lg bg-purple-500/20 text-purple-400 group-hover/item:bg-purple-500/30 transition-colors">
                  <Eye size={18} />
                </div>
                <span className="font-medium">Voir les réponses</span>
              </motion.button>

              <motion.button
                onClick={() => editQuiz(activeQuiz.id)}
                className="w-full px-4 py-3 text-left flex items-center gap-3 rounded-xl hover:bg-white/5 text-white/80 hover:text-white transition-colors group/item"
                whileHover={{ x: 5 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="p-2 rounded-lg bg-yellow-500/20 text-yellow-400 group-hover/item:bg-yellow-500/30 transition-colors">
                  <Edit3 size={18} />
                </div>
                <span className="font-medium">Modifier</span>
              </motion.button>

              <div className="h-px bg-white/10 my-2" />

              <motion.button
                onClick={() => deleteQuiz(activeQuiz.id)}
                className="w-full px-4 py-3 text-left flex items-center gap-3 rounded-xl hover:bg-red-500/10 text-red-400 transition-colors group/item"
                whileHover={{ x: 5, backgroundColor: "rgba(239, 68, 68, 0.15)" }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="p-2 rounded-lg bg-red-500/20 group-hover/item:bg-red-500/30 transition-colors">
                  <Trash2 size={18} />
                </div>
                <span className="font-medium">Supprimer</span>
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// 🎨 Composant StatCard
function StatCard({ icon, value, label, trend, color = 'pink', delay = 0 }: any) {
  const colors: any = {
    pink: 'from-pink-500/20 to-purple-500/20 border-pink-500/30 text-pink-400',
    blue: 'from-blue-500/20 to-cyan-500/20 border-blue-500/30 text-blue-400',
    purple: 'from-purple-500/20 to-pink-500/20 border-purple-500/30 text-purple-400',
    green: 'from-green-500/20 to-emerald-500/20 border-green-500/30 text-green-400',
  }

  const bgColors: any = {
    pink: 'bg-pink-500/10',
    blue: 'bg-blue-500/10',
    purple: 'bg-purple-500/10',
    green: 'bg-green-500/10',
  }

  return (
    <motion.div
      variants={itemVariants}
      whileHover={{ 
        scale: 1.05, 
        y: -5,
        transition: { type: "spring", stiffness: 400, damping: 17 }
      }}
      className={`relative bg-gradient-to-br ${colors[color]} border rounded-2xl p-5 overflow-hidden group cursor-default`}
    >
      <motion.div
        className={`absolute inset-0 ${bgColors[color]} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
        initial={false}
      />
      
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12"
        initial={{ x: "-100%" }}
        whileHover={{ x: "100%" }}
        transition={{ duration: 0.6 }}
      />

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-3">
          <motion.div 
            className="p-2.5 rounded-xl bg-white/10 backdrop-blur-sm"
            whileHover={{ rotate: 10, scale: 1.1 }}
          >
            {icon}
          </motion.div>
          {trend && (
            <motion.span 
              className="text-xs text-green-400 font-semibold bg-green-500/10 px-2 py-1 rounded-full"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: delay + 0.5 }}
            >
              {trend}
            </motion.span>
          )}
        </div>
        
        <motion.div 
          className="text-4xl font-bold text-white mb-1"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: delay + 0.3, type: "spring" }}
        >
          {value}
        </motion.div>
        
        <div className="text-sm text-white/50 font-medium">{label}</div>
      </div>

      <motion.div
        className={`absolute -bottom-4 -right-4 w-24 h-24 bg-gradient-to-br ${colors[color]} opacity-20 blur-2xl rounded-full`}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.2, 0.3, 0.2],
        }}
        transition={{ duration: 4, repeat: Infinity }}
      />
    </motion.div>
  )
}