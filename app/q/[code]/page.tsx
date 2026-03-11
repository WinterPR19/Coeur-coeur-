'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { motion } from 'framer-motion'
import { Send, Loader2 } from 'lucide-react'

interface Question {
  id: string
  text: string           // ← Changé de question_text à text
  type: string           // ← Changé de question_type à type
  options?: any          // ← jsonb dans ta DB
}

interface Quiz {
  id: string
  title: string
  message?: string
  questions: Question[]
}

export default function QuizPage({ params }: { params: { code: string } }) {
  const [quiz, setQuiz] = useState<Quiz | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [answers, setAnswers] = useState<Record<string, any>>({})
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    loadQuiz()
  }, [params.code])

  async function loadQuiz() {
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
    
    // Incrémenter les vues
    await supabase.rpc('increment_quiz_views', { quiz_code: params.code })
  }

  const handleSubmit = async () => {
    if (!quiz) return
    
    const unanswered = quiz.questions.filter(q => !answers[q.id])
    if (unanswered.length > 0) {
      alert('Veuillez répondre à toutes les questions')
      return
    }

    setSubmitting(true)

    // Adapter au format de ta table responses
    const { error } = await supabase.from('responses').insert({
      quiz_id: quiz.id,
      answers: answers,           // ← jsonb dans ta DB
      responder_name: answers['name'] || 'Anonyme'
    })

    if (!error) {
      setSubmitted(true)
    } else {
      console.error(error)
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
          <div className="text-6xl mb-4">🔍</div>
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
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-0 left-1/4 w-96 h-96 bg-pink-500/20 rounded-full blur-[128px]"
          animate={{ scale: [1, 1.2, 1], x: [0, 50, 0] }}
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
          {quiz.message && (
            <p className="text-white/60">{quiz.message}</p>
          )}
        </motion.div>

        <div className="space-y-6">
          {quiz.questions?.sort((a, b) => a.order_index - b.order_index).map((question, idx) => (
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
                {question.text}  {/* ← Affiche le texte de la question */}
              </h3>

              {/* Type: text */}
              {question.type === 'text' && (
                <textarea
                  value={answers[question.id] || ''}
                  onChange={(e) => setAnswers({ ...answers, [question.id]: e.target.value })}
                  placeholder="Ta réponse..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white placeholder-white/30 focus:border-pink-500/50 focus:outline-none transition-colors resize-none h-32"
                />
              )}

              {/* Type: scale (1-5) */}
              {question.type === 'scale' && (
                <div className="flex gap-2 justify-center">
                  {[1, 2, 3, 4, 5].map((num) => (
                    <button
                      key={num}
                      onClick={() => setAnswers({ ...answers, [question.id]: num })}
                      className={`w-12 h-12 rounded-xl text-lg font-bold transition-all ${
                        answers[question.id] === num
                          ? 'bg-pink-500/20 text-pink-400 scale-110 border border-pink-500/50'
                          : 'bg-white/5 text-white/60 hover:bg-white/10'
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              )}

              {/* Type: yes_no */}
              {question.type === 'yes_no' && (
                <div className="flex gap-4">
                  {['Oui', 'Non'].map((option) => (
                    <button
                      key={option}
                      onClick={() => setAnswers({ ...answers, [question.id]: option })}
                      className={`flex-1 p-4 rounded-xl border transition-all ${
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

              {/* Type: choice */}
              {question.type === 'choice' && question.options && (
                <div className="space-y-2">
                  {(Array.isArray(question.options) ? question.options : []).map((option: string, optIdx: number) => (
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