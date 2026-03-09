'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { 
  Plus, 
  Trash2, 
  ArrowLeft, 
  Loader2, 
  GripVertical,
  Sparkles,
  Type,
  List,
  Sliders,
  CheckSquare,
  Save,
  X,
  Lightbulb,
  Wand2
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

type QuestionType = 'text' | 'choice' | 'scale' | 'yes_no'

interface Question {
  id: string
  type: QuestionType
  text: string
  options?: string[]
}

const TEMPLATES = {
  decouverte: [
    { type: 'text' as const, text: 'Quel est ton prénom ?' },
    { type: 'text' as const, text: 'Quelle est ta plus grande passion dans la vie ?' },
    { type: 'choice' as const, text: 'Plutôt...', options: ['Plage', 'Montagne', 'Ville', 'Campagne'] },
    { type: 'scale' as const, text: 'À quel point aimes-tu les surprises ? (1-10)' },
    { type: 'yes_no' as const, text: 'Crois-tu au coup de foudre ?' }
  ],
  drague: [
    { type: 'text' as const, text: 'Ton prénom ?' },
    { type: 'text' as const, text: 'Quel est ton meilleur atout selon toi ?' },
    { type: 'choice' as const, text: 'Ton rendez-vous idéal ?', options: ['Dîner romantique', 'Balade nocturne', 'Concert', 'Netflix & chill'] },
    { type: 'scale' as const, text: 'À quel point es-tu aventureux/se ? (1-10)' },
    { type: 'yes_no' as const, text: 'Tu aimerais qu\'on se voie en vrai ?' }
  ],
  amitie: [
    { type: 'text' as const, text: 'Comment tu t\'appelles ?' },
    { type: 'text' as const, text: 'Quelle est ta série préférée ?' },
    { type: 'choice' as const, text: 'Ton passe-temps favori ?', options: ['Sport', 'Jeux vidéo', 'Lecture', 'Sorties'] },
    { type: 'scale' as const, text: 'À quel point es-tu loyal/e en amitié ? (1-10)' },
    { type: 'yes_no' as const, text: 'Tu es prêt/e à sortir ce week-end ?' }
  ]
}

export default function NewQuiz() {
  const [title, setTitle] = useState('')
  const [message, setMessage] = useState('')
  const [questions, setQuestions] = useState<Question[]>([
    { id: '1', type: 'text', text: '' }
  ])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showTemplates, setShowTemplates] = useState(false)
  const [activeType, setActiveType] = useState<QuestionType | null>(null)
  const router = useRouter()

  useEffect(() => {
    // Cœurs flottants
    const container = document.getElementById('hearts-container')
    if (container) {
      for (let i = 0; i < 15; i++) {
        const heart = document.createElement('div')
        heart.className = 'floating-heart'
        heart.textContent = ['💕', '💖', '💗', '💓', '💝'][Math.floor(Math.random() * 5)]
        heart.style.left = Math.random() * 100 + '%'
        heart.style.animationDuration = (Math.random() * 10 + 10) + 's'
        heart.style.animationDelay = Math.random() * 5 + 's'
        container.appendChild(heart)
      }
    }
  }, [])

  const addQuestion = (type: QuestionType) => {
    const newQ: Question = {
      id: Date.now().toString(),
      type,
      text: '',
      options: type === 'choice' ? ['Option 1', 'Option 2'] : undefined
    }
    setQuestions([...questions, newQ])
    setActiveType(null)
    
    // Scroll vers la nouvelle question
    setTimeout(() => {
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })
    }, 100)
  }

  const loadTemplate = (templateKey: keyof typeof TEMPLATES) => {
    const template = TEMPLATES[templateKey]
    const newQuestions: Question[] = template.map((q, idx) => ({
      id: Date.now().toString() + idx,
      type: q.type,
      text: q.text,
      options: q.options
    }))
    setQuestions(newQuestions)
    setShowTemplates(false)
  }

  const updateQuestion = (id: string, updates: Partial<Question>) => {
    setQuestions(questions.map(q => q.id === id ? { ...q, ...updates } : q))
  }

  const removeQuestion = (id: string) => {
    if (questions.length === 1) {
      setError('Il faut au moins une question !')
      setTimeout(() => setError(''), 3000)
      return
    }
    setQuestions(questions.filter(q => q.id !== id))
  }

  const moveQuestion = (id: string, direction: 'up' | 'down') => {
    const idx = questions.findIndex(q => q.id === id)
    if (idx === -1) return
    if (direction === 'up' && idx === 0) return
    if (direction === 'down' && idx === questions.length - 1) return
    
    const newQuestions = [...questions]
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1
    ;[newQuestions[idx], newQuestions[swapIdx]] = [newQuestions[swapIdx], newQuestions[idx]]
    setQuestions(newQuestions)
  }

  const addOption = (qId: string) => {
    const q = questions.find(q => q.id === qId)
    if (q) {
      updateQuestion(qId, { options: [...(q.options || []), `Option ${(q.options?.length || 0) + 1}`] })
    }
  }

  const updateOption = (qId: string, optIdx: number, value: string) => {
    const q = questions.find(q => q.id === qId)
    if (q && q.options) {
      const newOpts = [...q.options]
      newOpts[optIdx] = value
      updateQuestion(qId, { options: newOpts })
    }
  }

  const removeOption = (qId: string, optIdx: number) => {
    const q = questions.find(q => q.id === qId)
    if (q && q.options && q.options.length > 2) {
      updateQuestion(qId, { options: q.options.filter((_, i) => i !== optIdx) })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError || !user) {
        throw new Error('Tu dois être connecté !')
      }

      const validQuestions = questions.filter(q => q.text.trim())
      if (validQuestions.length === 0) {
        throw new Error('Ajoute au moins une question avec du texte !')
      }

      for (const q of validQuestions) {
        if (q.type === 'choice') {
          const validOptions = q.options?.filter(o => o.trim())
          if (!validOptions || validOptions.length < 2) {
            throw new Error(`La question "${q.text}" a besoin d'au moins 2 options !`)
          }
        }
      }

      const { data: quiz, error: quizError } = await supabase
        .from('quizzes')
        .insert({ 
          user_id: user.id, 
          title: title.trim(), 
          message: message.trim() || null 
        })
        .select()
        .single()

      if (quizError) throw quizError

      const questionsData = validQuestions.map((q, idx) => ({
        quiz_id: quiz.id,
        type: q.type,
        text: q.text.trim(),
        options: q.type === 'choice' ? q.options?.filter(o => o.trim()) : null,
        order_index: idx
      }))

      const { error: qError } = await supabase.from('questions').insert(questionsData)
      if (qError) throw qError

      // Animation de succès avant redirection
      const btn = document.getElementById('submit-btn')
      if (btn) {
        btn.classList.add('animate-pulse')
      }
      
      setTimeout(() => {
        router.push('/dashboard')
      }, 500)

    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue')
      setLoading(false)
    }
  }

  const getTypeIcon = (type: QuestionType) => {
    switch (type) {
      case 'text': return <Type size={18} />
      case 'choice': return <List size={18} />
      case 'scale': return <Sliders size={18} />
      case 'yes_no': return <CheckSquare size={18} />
    }
  }

  const getTypeLabel = (type: QuestionType) => {
    switch (type) {
      case 'text': return 'Texte libre'
      case 'choice': return 'Choix multiple'
      case 'scale': return 'Échelle 1-10'
      case 'yes_no': return 'Oui / Non'
    }
  }

  return (
    <div className="min-h-screen bg-[#0f0f1a] relative overflow-hidden pb-32">
      <div className="gradient-bg" />
      <div id="hearts-container" className="hearts-container" />

      {/* Header */}
      <header className="relative z-10 border-b border-white/10 bg-black/20 backdrop-blur-lg sticky top-0">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <button 
            onClick={() => router.back()}
            className="flex items-center gap-2 text-white/60 hover:text-white transition-colors mb-2"
          >
            <ArrowLeft size={20} />
            Retour
          </button>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Sparkles className="text-pink-400" />
            Nouveau questionnaire
          </h1>
        </div>
      </header>

      <main className="relative z-10 max-w-4xl mx-auto px-4 py-6">
        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-500/20 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl mb-6 flex items-center gap-2"
          >
            <X size={18} />
            {error}
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Info générales */}
          <div className="glass-card p-6 space-y-5">
            <div>
              <label className="block text-sm font-medium text-white/60 mb-2">
                Titre du questionnaire *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="neon-input w-full px-4 py-4 text-lg"
                placeholder="Ex: Questionnaire pour Marie 💕"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white/60 mb-2">
                Message personnel (optionnel)
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="neon-input w-full px-4 py-4 min-h-[100px] resize-none"
                placeholder="Un petit message pour celui/celle qui va répondre..."
              />
              <p className="text-xs text-white/30 mt-2">
                Ce message sera affiché en haut du questionnaire
              </p>
            </div>
          </div>

          {/* Templates */}
          <div className="glass-card p-4">
            <button
              type="button"
              onClick={() => setShowTemplates(!showTemplates)}
              className="flex items-center gap-2 text-pink-400 hover:text-pink-300 transition-colors w-full"
            >
              <Wand2 size={20} />
              <span className="font-medium">Utiliser un template</span>
              <span className="ml-auto text-white/40 text-sm">
                {showTemplates ? '▼' : '▶'}
              </span>
            </button>
            
            <AnimatePresence>
              {showTemplates && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4 pt-4 border-t border-white/10">
                    <button
                      type="button"
                      onClick={() => loadTemplate('decouverte')}
                      className="p-4 rounded-xl bg-white/5 hover:bg-pink-500/20 border border-white/10 hover:border-pink-500/30 transition-all text-left"
                    >
                      <div className="text-2xl mb-2">🔍</div>
                      <div className="font-semibold text-white text-sm">Découverte</div>
                      <div className="text-xs text-white/40 mt-1">Pour apprendre à se connaître</div>
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => loadTemplate('drague')}
                      className="p-4 rounded-xl bg-white/5 hover:bg-pink-500/20 border border-white/10 hover:border-pink-500/30 transition-all text-left"
                    >
                      <div className="text-2xl mb-2">💕</div>
                      <div className="font-semibold text-white text-sm">Drague</div>
                      <div className="text-xs text-white/40 mt-1">Pour séduire</div>
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => loadTemplate('amitie')}
                      className="p-4 rounded-xl bg-white/5 hover:bg-pink-500/20 border border-white/10 hover:border-pink-500/30 transition-all text-left"
                    >
                      <div className="text-2xl mb-2">🤝</div>
                      <div className="font-semibold text-white text-sm">Amitié</div>
                      <div className="text-xs text-white/40 mt-1">Pour faire connaissance</div>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Questions */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <Lightbulb className="text-yellow-400" size={20} />
                Questions ({questions.length})
              </h2>
            </div>

            <AnimatePresence mode="popLayout">
              {questions.map((q, idx) => (
                <motion.div
                  key={q.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="question-glass p-5"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="flex flex-col gap-1">
                        <button
                          type="button"
                          onClick={() => moveQuestion(q.id, 'up')}
                          disabled={idx === 0}
                          className="text-white/20 hover:text-white disabled:opacity-0 transition-colors"
                        >
                          ▲
                        </button>
                        <button
                          type="button"
                          onClick={() => moveQuestion(q.id, 'down')}
                          disabled={idx === questions.length - 1}
                          className="text-white/20 hover:text-white disabled:opacity-0 transition-colors"
                        >
                          ▼
                        </button>
                      </div>
                      <span className="px-3 py-1 rounded-full bg-pink-500/20 text-pink-400 text-sm font-medium flex items-center gap-2">
                        {getTypeIcon(q.type)}
                        {getTypeLabel(q.type)}
                      </span>
                      <span className="text-white/40 text-sm">#{idx + 1}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeQuestion(q.id)}
                      className="p-2 rounded-lg hover:bg-red-500/20 text-white/40 hover:text-red-400 transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>

                  <input
                    type="text"
                    value={q.text}
                    onChange={(e) => updateQuestion(q.id, { text: e.target.value })}
                    className="neon-input w-full px-4 py-3 mb-4"
                    placeholder="Ta question..."
                    required
                  />

                  {q.type === 'choice' && (
                    <div className="space-y-2">
                      {q.options?.map((opt, i) => (
                        <div key={i} className="flex gap-2">
                          <input
                            type="text"
                            value={opt}
                            onChange={(e) => updateOption(q.id, i, e.target.value)}
                            className="neon-input flex-1 px-3 py-2 text-sm"
                            placeholder={`Option ${i + 1}`}
                          />
                          {q.options!.length > 2 && (
                            <button
                              type="button"
                              onClick={() => removeOption(q.id, i)}
                              className="px-3 rounded-lg hover:bg-red-500/20 text-white/40 hover:text-red-400 transition-colors"
                            >
                              <X size={16} />
                            </button>
                          )}
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => addOption(q.id)}
                        className="text-sm text-pink-400 hover:text-pink-300 flex items-center gap-1 mt-2"
                      >
                        <Plus size={16} />
                        Ajouter une option
                      </button>
                    </div>
                  )}

                  {q.type === 'scale' && (
                    <div className="flex gap-2 pt-2 opacity-50">
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
                        <div key={n} className="flex-1 aspect-square rounded-lg bg-white/5 flex items-center justify-center text-sm text-white/30">
                          {n}
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Add question buttons */}
          <div className="glass-card p-4">
            <p className="text-sm text-white/40 mb-3">Ajouter une question :</p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => addQuestion('text')}
                className="flex items-center gap-2 px-4 py-3 rounded-xl bg-white/5 hover:bg-pink-500/20 border border-white/10 hover:border-pink-500/30 transition-all text-sm text-white/70 hover:text-white"
              >
                <Type size={18} />
                Texte libre
              </button>
              <button
                type="button"
                onClick={() => addQuestion('choice')}
                className="flex items-center gap-2 px-4 py-3 rounded-xl bg-white/5 hover:bg-pink-500/20 border border-white/10 hover:border-pink-500/30 transition-all text-sm text-white/70 hover:text-white"
              >
                <List size={18} />
                QCM
              </button>
              <button
                type="button"
                onClick={() => addQuestion('scale')}
                className="flex items-center gap-2 px-4 py-3 rounded-xl bg-white/5 hover:bg-pink-500/20 border border-white/10 hover:border-pink-500/30 transition-all text-sm text-white/70 hover:text-white"
              >
                <Sliders size={18} />
                Échelle 1-10
              </button>
              <button
                type="button"
                onClick={() => addQuestion('yes_no')}
                className="flex items-center gap-2 px-4 py-3 rounded-xl bg-white/5 hover:bg-pink-500/20 border border-white/10 hover:border-pink-500/30 transition-all text-sm text-white/70 hover:text-white"
              >
                <CheckSquare size={18} />
                Oui / Non
              </button>
            </div>
          </div>
        </form>
      </main>

      {/* Fixed bottom bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-black/80 backdrop-blur-lg border-t border-white/10 p-4 z-50">
        <div className="max-w-4xl mx-auto flex gap-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-3 rounded-xl border-2 border-white/10 text-white/60 hover:text-white hover:border-white/30 transition-colors"
          >
            Annuler
          </button>
          <button
            id="submit-btn"
            onClick={handleSubmit}
            disabled={loading || !title.trim() || questions.filter(q => q.text.trim()).length === 0}
            className="flex-1 neon-button py-3 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <>
                <Save size={20} />
                Créer le questionnaire
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}