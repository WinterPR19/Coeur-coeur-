'use client'

import { useEffect, useState } from 'react'
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
  Sparkles,
  Zap,
  Trash2,
  Edit3,
  Share2,
  MoreVertical,
  X
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface Quiz {
  id: string
  title: string
  share_code: string
  view_count: number
  created_at: string
  questions: { count: number }[]
  responses: { count: number }[]
}

export default function Dashboard() {
  const [user, setUser] = useState<any>(null)
  const [quizzes, setQuizzes] = useState<Quiz[]>([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [activeMenu, setActiveMenu] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    document.body.style.opacity = '0'
    setTimeout(() => {
      document.body.style.transition = 'opacity 0.5s'
      document.body.style.opacity = '1'
    }, 100)

    loadData()
  }, [])

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
    showToast('✨ Lien copié !')
  }

  const showToast = (message: string) => {
    const toast = document.createElement('div')
    toast.className = 'fixed bottom-8 left-1/2 -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded-full shadow-lg z-50 animate-slide-up'
    toast.textContent = message
    document.body.appendChild(toast)
    setTimeout(() => toast.remove(), 2000)
  }

  const deleteQuiz = async (quizId: string) => {
    if (!confirm('Es-tu sûr de vouloir supprimer ce quiz ? Cette action est irréversible.')) {
      setActiveMenu(null)
      return
    }

    setDeletingId(quizId)
    const { error } = await supabase.from('quizzes').delete().eq('id', quizId)
    
    if (!error) {
      setQuizzes(quizzes.filter(q => q.id !== quizId))
      showToast('🗑️ Quiz supprimé')
    } else {
      showToast('❌ Erreur lors de la suppression')
    }
    
    setDeletingId(null)
    setActiveMenu(null)
  }

  const shareQuiz = async (quiz: Quiz) => {
    const link = `${window.location.origin}/q/${quiz.share_code}`
    const text = `Réponds à mon questionnaire "${quiz.title}" 💕\n\n${link}`

    // Web Share API
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Questionnaire: ${quiz.title}`,
          text: `Réponds à mon questionnaire anonyme 💕`,
          url: link
        })
        return
      } catch (err) {
        // Fallback si l'utilisateur annule
      }
    }

    // Fallback WhatsApp
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`
    window.open(whatsappUrl, '_blank')
  }

  const shareViaSMS = (quiz: Quiz) => {
    const link = `${window.location.origin}/q/${quiz.share_code}`
    const text = `Réponds à mon questionnaire "${quiz.title}" 💕 ${link}`
    
    const smsUrl = `sms:?body=${encodeURIComponent(text)}`
    window.open(smsUrl, '_blank')
  }

  if (loading) return (
    <div className="min-h-screen bg-[#0f0f1a] flex items-center justify-center">
      <div className="text-4xl animate-pulse">💕</div>
    </div>
  )

  const totalResponses = quizzes.reduce((acc, q) => acc + (q.responses[0]?.count || 0), 0)
  const totalViews = quizzes.reduce((acc, q) => acc + q.view_count, 0)

  return (
    <div className="min-h-screen bg-[#0f0f1a] relative overflow-hidden">
      <div className="gradient-bg" />
      <div id="hearts-container" className="hearts-container" />

      <header className="relative z-10 border-b border-white/10 bg-black/20 backdrop-blur-lg sticky top-0">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center text-xl">
              💕
            </div>
            <div>
              <h1 className="font-bold text-lg text-white">Cœur à Cœur</h1>
              <p className="text-xs text-white/40">Bienvenue, {user?.email?.split('@')[0]}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10">
              <Zap size={16} className="text-yellow-400" />
              <span className="text-sm text-white/60">Gratuit</span>
            </div>
            <button 
              onClick={signOut}
              className="p-2 rounded-xl hover:bg-white/10 transition-colors text-white/60 hover:text-white"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-6xl mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard 
            icon={<Heart className="text-pink-500" />} 
            value={quizzes.length} 
            label="Quiz créés"
            trend="+1 ce mois"
          />
          <StatCard 
            icon={<MessageCircle className="text-blue-400" />} 
            value={totalResponses} 
            label="Réponses"
            color="blue"
          />
          <StatCard 
            icon={<Eye className="text-purple-400" />} 
            value={totalViews} 
            label="Vues totales"
            color="purple"
          />
          <StatCard 
            icon={<TrendingUp className="text-green-400" />} 
            value={`${totalViews > 0 ? Math.round((totalResponses/totalViews)*100) : 0}%`} 
            label="Conversion"
            color="green"
          />
        </div>

        {/* Actions */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white mb-1">Mes questionnaires</h2>
            <p className="text-white/40 text-sm">Gère tes quiz et vois les réponses</p>
          </div>
          <Link
            href="/dashboard/new"
            className="neon-button px-6 py-3 flex items-center gap-2"
          >
            <Plus size={20} />
            <span className="hidden sm:inline">Nouveau quiz</span>
            <span className="sm:hidden">Créer</span>
          </Link>
        </div>

        {/* Quiz list */}
        <div className="space-y-4">
          {quizzes.length === 0 ? (
            <div className="glass-card p-12 text-center">
              <div className="text-6xl mb-4 animate-bounce">💌</div>
              <h3 className="text-xl font-bold text-white mb-2">Aucun questionnaire</h3>
              <p className="text-white/40 mb-6">Crée ton premier quiz et partage-le !</p>
              <Link
                href="/dashboard/new"
                className="neon-button inline-flex items-center gap-2 px-6 py-3"
              >
                <Plus size={20} />
                Créer un quiz
              </Link>
            </div>
          ) : (
            quizzes.map((quiz, idx) => (
              <motion.div
                key={quiz.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="glass-card p-6 hover:border-pink-500/30 transition-all group relative"
              >
                {deletingId === quiz.id && (
                  <div className="absolute inset-0 bg-black/50 backdrop-blur-sm rounded-2xl flex items-center justify-center z-10">
                    <Loader2 className="w-8 h-8 text-pink-500 animate-spin" />
                  </div>
                )}

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-bold text-xl text-white group-hover:text-pink-400 transition-colors">
                        {quiz.title}
                      </h3>
                      {quiz.responses[0]?.count > 0 && (
                        <span className="px-2 py-1 rounded-full bg-pink-500/20 text-pink-400 text-xs font-semibold">
                          {quiz.responses[0]?.count} nouvelle{quiz.responses[0]?.count > 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
                    <p className="text-white/40 text-sm mb-3">
                      {quiz.questions[0]?.count || 0} questions • 
                      Créé le {new Date(quiz.created_at).toLocaleDateString('fr-FR', { 
                        day: 'numeric', 
                        month: 'long',
                        year: 'numeric'
                      })}
                    </p>
                    
                    <div className="flex flex-wrap items-center gap-4 text-sm">
                      <span className="flex items-center gap-1.5 text-white/60">
                        <Eye size={16} className="text-purple-400" />
                        {quiz.view_count} vues
                      </span>
                      <span className="flex items-center gap-1.5 text-white/60">
                        <MessageCircle size={16} className="text-blue-400" />
                        {quiz.responses[0]?.count || 0} réponses
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="glass-card px-4 py-2 flex items-center gap-2 text-sm">
                      <code className="text-white/60 truncate max-w-[150px] sm:max-w-[200px]">
                        /q/{quiz.share_code}
                      </code>
                      <button
                        onClick={() => copyLink(quiz.share_code)}
                        className="p-2 rounded-lg hover:bg-white/10 transition-colors text-white/60 hover:text-white"
                        title="Copier le lien"
                      >
                        <Copy size={16} />
                      </button>
                    </div>

                    {/* Menu d'actions */}
                    <div className="relative">
                      <button
                        onClick={() => setActiveMenu(activeMenu === quiz.id ? null : quiz.id)}
                        className="p-2 rounded-lg hover:bg-white/10 transition-colors text-white/60 hover:text-white"
                      >
                        {activeMenu === quiz.id ? <X size={20} /> : <MoreVertical size={20} />}
                      </button>

                      <AnimatePresence>
                        {activeMenu === quiz.id && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="absolute right-0 top-full mt-2 w-48 glass-card z-50 overflow-hidden"
                          >
                            <button
                              onClick={() => {
                                shareQuiz(quiz)
                                setActiveMenu(null)
                              }}
                              className="w-full px-4 py-3 text-left flex items-center gap-3 hover:bg-white/5 text-white/80 hover:text-white transition-colors"
                            >
                              <Share2 size={18} className="text-green-400" />
                              Partager
                            </button>
                            <button
                              onClick={() => {
                                shareViaSMS(quiz)
                                setActiveMenu(null)
                              }}
                              className="w-full px-4 py-3 text-left flex items-center gap-3 hover:bg-white/5 text-white/80 hover:text-white transition-colors"
                            >
                              <MessageCircle size={18} className="text-blue-400" />
                              Envoyer par SMS
                            </button>
                            <Link
                              href={`/dashboard/quiz/${quiz.id}/edit`}
                              onClick={() => setActiveMenu(null)}
                              className="w-full px-4 py-3 text-left flex items-center gap-3 hover:bg-white/5 text-white/80 hover:text-white transition-colors"
                            >
                              <Edit3 size={18} className="text-yellow-400" />
                              Modifier
                            </Link>
                            <button
                              onClick={() => router.push(`/dashboard/quiz/${quiz.id}`)}
                              className="w-full px-4 py-3 text-left flex items-center gap-3 hover:bg-white/5 text-white/80 hover:text-white transition-colors"
                            >
                              <Eye size={18} className="text-purple-400" />
                              Voir les réponses
                            </button>
                            <div className="border-t border-white/10" />
                            <button
                              onClick={() => deleteQuiz(quiz.id)}
                              className="w-full px-4 py-3 text-left flex items-center gap-3 hover:bg-red-500/20 text-red-400 transition-colors"
                            >
                              <Trash2 size={18} />
                              Supprimer
                            </button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </main>
    </div>
  )
}

function StatCard({ icon, value, label, trend, color = 'pink' }: any) {
  const colors: any = {
    pink: 'from-pink-500/20 to-purple-500/20 border-pink-500/30',
    blue: 'from-blue-500/20 to-cyan-500/20 border-blue-500/30',
    purple: 'from-purple-500/20 to-pink-500/20 border-purple-500/30',
    green: 'from-green-500/20 to-emerald-500/20 border-green-500/30',
  }

  return (
    <div className={`stat-glass p-5 bg-gradient-to-br ${colors[color]} border`}>
      <div className="flex items-center justify-between mb-3">
        <div className="p-2 rounded-lg bg-white/5">{icon}</div>
        {trend && (
          <span className="text-xs text-green-400 font-medium">{trend}</span>
        )}
      </div>
      <div className="text-3xl font-bold text-white mb-1">{value}</div>
      <div className="text-sm text-white/40">{label}</div>
    </div>
  )
}