'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, Send, Loader2 } from 'lucide-react'

interface Question {
  id: string
  question_text: string
  question_type: 'text' | 'choice' | 'rating'
  options?: string[]
}

interface Quiz {
  id: string
  title: string
  description?: string
  questions: Question[]
}

export default function QuizPage({ params }: { params: { code: string } }) {
  const [quiz, setQuiz] = useState<Quiz | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    loadQuiz()
  }, [params.code])

  async function loadQuiz() {
    // Charger le quiz
    const { data, error } = await supabase
      .from('quizzes')
      .select(`
        *,
        questions(*)
      `)
      .eq('share_code', params.code)
      .single()

    if (error || !data) {
      setError('Ce quiz n\'existe pas ou a été supprimé.')
      setLoading(false)
      return
    }

    setQuiz(data)
    setLoading(false)
    
    // Incrémenter les vues (nouvelle fonction)
    await supabase.rpc('increment_quiz_views', { quiz_code: params.code })
  }

  const handleSubmit = async () => {
    if (!quiz) return
    
    // Vérifier que toutes les questions sont répondues
    const unanswered = quiz.questions.filter(q => !answers[q.id])
    if (unanswered.length > 0) {
      alert('Veuillez répondre à toutes les questions')
      return
    }

    setSubmitting(true)

    // Insérer les réponses
    const { error } = await supabase.from('responses').insert(
      Object.entries(answers).map(([questionId, answer]) => ({
        quiz_id: quiz.id,
        question_id: questionId,
        answer: answer
      }))
    )

    if (!error) {
      setSubmitted(true)
    } else {
      alert('Erreur lors de l\'envoi')
    }
    
    setSubmitting(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f0f1a] flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          <Loader2 className="w-12 h-12 text-pink-500" />
        </motion.div>
      </div>
    )
  }

  if (error || !quiz) {
    return (
      <div className="min-h-screen bg-[#0f0f1a] flex items-center justify-center px-4">
        <div className="text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="text-6xl mb-4"
          >
            🔍
          </motion.div>
          <h1 className="text-2xl font-bold text-white mb-2">Quiz non trouvé</h1>
          <p className="text-white/60 mb-6">{error}</p>
          <a href="/" className="text-pink-400 hover:underline">
            Retour à l'accueil
          </a>
        </div>
      </div>
    )
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#0f0f1a] flex items-center justify-center px-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center"
        >
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-6xl mb-4"
          >
            💕
          </motion.div>
          <h1 className="text-3xl font-bold text-white mb-2">Merci !</h1>
          <p className="text-white/60">Tes réponses ont été envoyées 💌</p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0f0f1a] relative overflow-hidden">
      {/* Background animé */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-0 left-1/4 w-96 h-96 bg-pink-500/20 rounded-full blur-[128px]"
          animate={{
            scale: [1, 1.2, 1],
            x: [0, 50, 0],
          }}
          transition={{ duration: 10, repeat: Infinity }}
        />
      </div>

      <main className="relative z-10 max-w-2xl mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl font-bold text-white mb-2">{quiz.title}</h1>
          {quiz.description && (
            <p className="text-white/60">{quiz.description}</p>
          )}
        </motion.div>

        <div className="space-y-6">
          {quiz.questions.map((question, idx) => (
            <motion.div
              key={question.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white/5 border border-white/10 rounded-2xl p-6"
            >
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-pink-500/20 text-pink-400 flex items-center justify-center text-sm">
                  {idx + 1}
                </span>
                {question.question_text}
              </h3>

              {question.question_type === 'text' && (
                <textarea
                  value={answers[question.id] || ''}
                  onChange={(e) => setAnswers({ ...answers, [question.id]: e.target.value })}
                  placeholder="Ta réponse..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white placeholder-white/30 focus:border-pink-500/50 focus:outline-none transition-colors resize-none h-32"
                />
              )}

              {question.question_type === 'rating' && (
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setAnswers({ ...answers, [question.id]: String(star) })}
                      className={`w-12 h-12 rounded-xl text-2xl transition-all ${
                        Number(answers[question.id]) >= star
                          ? 'bg-pink-500/20 text-pink-400 scale-110'
                          : 'bg-white/5 text-white/30 hover:bg-white/10'
                      }`}
                    >
                      ⭐
                    </button>
                  ))}
                </div>
              )}

              {question.question_type === 'choice' && question.options && (
                <div className="space-y-2">
                  {question.options.map((option, optIdx) => (
                    <button
                      key={optIdx}
                      onClick={() => setAnswers({ ...answers, [question.id]: option })}
                      className={`w-full text-left p-4 rounded-xl border transition-all ${
                        answers[question.id] === option
                          ? 'border-pink-500/50 bg-pink-500/10 text-white'
                          : 'border-white/10 bg-white/5 text-white/70 hover:bg-white/10'
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              )}
            </motion.div>
          ))}
        </div>

        <motion.button
          onClick={handleSubmit}
          disabled={submitting}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
                    className="w-full mt-8 bg-gradient-to-r from-pink-500 to-purple-600 text-white py-4 rounded-xl font-semibold flex items-center justify-center gap-2 shadow-lg shadow-pink-500/25 disabled:opacity-50"
        >
          {submitting ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              <Send size={20} />
              Envoyer mes réponses
            </>
          )}
        </motion.button>

        <p className="text-center text-white/30 text-sm mt-6">
          Réponses anonymes • Cœur à Cœur 💕
        </p>
      </main>
    </div>
  )
}