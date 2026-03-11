'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { 
  ArrowLeft, 
  Loader2, 
  Save, 
  Plus, 
  Trash2, 
  Type,
  List,
  Sliders,
  CheckSquare,
  X,
  AlertCircle
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

type QuestionType = 'text' | 'choice' | 'scale' | 'yes_no'

interface Question {
  id: string
  type: QuestionType
  text: string
  options?: string[]
  order_index: number
}

export default function EditQuiz() {
  const { id } = useParams()
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [message, setMessage] = useState('')
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    loadQuiz()
  }, [id])

  async function loadQuiz() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/')
      return
    }

    const { data: quiz } = await supabase
      .from('quizzes')
      .select('*, questions(*)')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (!quiz) {
      router.push('/dashboard')
      return
    }

    setTitle(quiz.title)
    setMessage(quiz.message || '')
    setQuestions(quiz.questions.sort((a: any, b: any) => a.order_index - b.order_index))
    setLoading(false)
  }

  const updateQuestion = (qId: string, updates: Partial<Question>) => {
    setQuestions(questions.map(q => q.id === qId ? { ...q, ...updates } : q))
  }

  const removeQuestion = (qId: string) => {
    if (questions.length === 1) {
      setError('Il faut au moins une question !')
      setTimeout(() => setError(''), 3000)
      return
    }
    setQuestions(questions.filter(q => q.id !== qId))
  }

  const addQuestion = (type: QuestionType) => {
    const newQ: Question = {
      id: 'temp_' + Date.now().toString(),
      type,
      text: '',
      options: type === 'choice' ? ['Option 1', 'Option 2'] : undefined,
      order_index: questions.length
    }
    setQuestions([...questions, newQ])
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

  const moveQuestion = (qId: string, direction: 'up' | 'down') => {
    const idx = questions.findIndex(q => q.id === qId)
    if (idx === -1) return
    if (direction === 'up' && idx === 0) return
    if (direction === 'down' && idx === questions.length - 1) return
    
    const newQuestions = [...questions]
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1
    ;[newQuestions[idx], newQuestions[swapIdx]] = [newQuestions[swapIdx], newQuestions[idx]]
    setQuestions(newQuestions.map((q, i) => ({ ...q, order_index: i })))
  }

  const handleSave = async () => {
    setSaving(true)
    setError('')

    try {
      const validQuestions = questions.filter(q => q.text.trim())
      if (validQuestions.length === 0) {
        throw new Error('Ajoute au moins une question avec du texte !')
      }

      // Mise à jour du quiz
      const { error: quizError } = await supabase
        .from('quizzes')
        .update({ 
          title: title.trim(), 
          message: message.trim() || null 
        })
        .eq('id', id)

      if (quizError) throw quizError

      // Suppression des anciennes questions
      await supabase.from('questions').delete().eq('quiz_id', id)

      // Insertion des nouvelles questions
      const questionsData = validQuestions.map((q, idx) => ({
        quiz_id: id,
        type: q.type,
        text: q.text.trim(),
        options: q.type === 'choice' ? q.options?.filter(o => o.trim()) : null,
        order_index: idx
      }))

      const { error: qError } = await supabase.from('questions').insert(questionsData)
      if (qError) throw qError

      router.push('/dashboard')
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue')
      setSaving(false)
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

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f0f1a] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-pink-500 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0f0f1a] relative overflow-hidden pb-32">
      <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 via-purple-500/5 to-blue-500/5" />

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
            ✏️ Modifier le questionnaire
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
            <AlertCircle size={18} />
            {error}
          </motion.div>
        )}

        <div className="space-y-6">
          {/* Info générales */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-5">
            <div>
              <label className="block text-sm font-medium text-white/60 mb-2">
                Titre du questionnaire *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-lg text-white placeholder-white/30 focus:outline-none focus:border-pink-500/50 transition-colors"
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
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 min-h-[100px] resize-none text-white placeholder-white/30 focus:outline-none focus:border-pink-500/50 transition-colors"
                placeholder="Un petit message pour celui/celle qui va répondre..."
              />
            </div>
          </div>

          {/* Questions */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">
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
                  className="bg-white/5 border border-white/10 rounded-2xl p-5"
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
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 mb-4 text-white placeholder-white/30 focus:outline-none focus:border-pink-500/50 transition-colors"
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
                            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-pink-500/50 transition-colors"
                            placeholder={`Option ${i + 1}`}
                          />
                          {q.options!.length > 2 && (
                            <button
                              type="button"
                              onClick={() => removeOption(q.id, i)}
                              className="px-3 rounded-xl hover:bg-red-500/20 text-white/40 hover:text-red-400 transition-colors"
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
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
            <p className="text-sm text-white/40 mb-3">Ajouter une question :</p>
            <div className="flex flex-wrap gap-2">
              {(['text', 'choice', 'scale', 'yes_no'] as const).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => addQuestion(type)}
                  className="flex items-center gap-2 px-4 py-3 rounded-xl bg-white/5 hover:bg-pink-500/20 border border-white/10 hover:border-pink-500/30 transition-all text-sm text-white/70 hover:text-white"
                >
                  {getTypeIcon(type)}
                  {getTypeLabel(type)}
                </button>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Fixed bottom bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-black/80 backdrop-blur-lg border-t border-white/10 p-4 z-50">
        <div className="max-w-4xl mx-auto flex gap-4">
          <button
            type="button"
            onClick={() => router.push('/dashboard')}
            className="px-6 py-3 rounded-xl border-2 border-white/10 text-white/60 hover:text-white hover:border-white/30 transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !title.trim()}
            className="flex-1 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all"
          >
            {saving ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                <span>Sauvegarde...</span>
              </>
            ) : (
              <>
                <Save size={20} />
                Sauvegarder les modifications
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}