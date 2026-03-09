'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Loader2, Heart, Sparkles, ArrowRight, CheckCircle2 } from 'lucide-react'

export default function AnswerPage() {
  const { code } = useParams()
  const [quiz, setQuiz] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [step, setStep] = useState(0)
  const [name, setName] = useState('')
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [submitted, setSubmitted] = useState(false)
  const [score, setScore] = useState(0)
  const [direction, setDirection] = useState(0)

  useEffect(() => {
    // Cœurs flottants
    const container = document.getElementById('hearts-container')
    if (container) {
      const emojis = ['💕', '💖', '💗', '💓', '💝', '💘', '💞', '💕']
      for (let i = 0; i < 20; i++) {
        const heart = document.createElement('div')
        heart.className = 'floating-heart'
        heart.textContent = emojis[Math.floor(Math.random() * emojis.length)]
        heart.style.left = Math.random() * 100 + '%'
        heart.style.animationDuration = (Math.random() * 10 + 10) + 's'
        heart.style.animationDelay = Math.random() * 5 + 's'
        heart.style.fontSize = (Math.random() * 25 + 15) + 'px'
        container.appendChild(heart)
      }
    }

    loadQuiz()
  }, [code])

  async function loadQuiz() {
    const { data } = await supabase
      .from('quizzes')
      .select('*, questions(*)')
      .eq('share_code', code)
      .eq('is_active', true)
      .single()

    if (data) {
      setQuiz(data)
      await supabase.rpc('increment_views', { quiz_id: data.id })
    }
    setLoading(false)
  }

  const handleAnswer = (qId: string, val: string) => {
    setAnswers({ ...answers, [qId]: val })
  }

  const nextStep = () => {
    if (step === 0 && !name.trim()) return
    if (step > 0 && !answers[quiz.questions[step - 1]?.id]) return
    
    setDirection(1)
    setStep(step + 1)
  }

  const prevStep = () => {
    setDirection(-1)
    setStep(step - 1)
  }

  const submit = async () => {
    const currentQ = quiz.questions[step - 1]
    if (!answers[currentQ.id]) return

    const compatibility = Math.floor(Math.random() * 35) + 65
    setScore(compatibility)

    await supabase.from('responses').insert({
      quiz_id: quiz.id,
      responder_name: name,
      answers,
      compatibility_score: compatibility
    })

    setSubmitted(true)
  }

  if (loading) return (
    <div className="min-h-screen bg-[#0f0f1a] flex items-center justify-center relative overflow-hidden">
      <div className="gradient-bg" />
      <div className="text-4xl animate-pulse z-10">💕</div>
    </div>
  )

  if (!quiz) return (
    <div className="min-h-screen bg-[#0f0f1a] flex items-center justify-center relative overflow-hidden">
      <div className="gradient-bg" />
      <div className="glass-card p-8 text-center z-10">
        <div className="text-6xl mb-4">😢</div>
        <h1 className="text-2xl font-bold text-white mb-2">Questionnaire introuvable</h1>
        <p className="text-white/40">Ce lien n'existe plus ou a été désactivé.</p>
      </div>
    </div>
  )

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#0f0f1a] flex items-center justify-center p-4 relative overflow-hidden">
        <div className="gradient-bg" />
        <div id="hearts-container" className="hearts-container" />
        
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="glass-card p-8 max-w-md w-full text-center z-10"
        >
          <motion.div
            animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="text-6xl mb-4"
          >
            🎉
          </motion.div>
          
          <h1 className="text-3xl font-bold glow-text mb-2">C'est envoyé !</h1>
          <p className="text-white/60 mb-6">
            {quiz.user?.username || 'Ton crush'} va découvrir tes réponses.
          </p>

          <div className="relative mb-6">
            <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-purple-500 blur-xl opacity-50" />
            <div className="relative bg-gradient-to-br from-pink-500/20 to-purple-500/20 border border-pink-500/30 rounded-3xl p-8">
              <div className="text-sm text-white/60 mb-2">Compatibilité estimée</div>
              <div className="text-6xl font-bold text-white mb-2">{score}%</div>
              <div className="text-pink-400 font-medium">
                {score >= 90 ? '🔥 Âmes sœurs !' :
                 score >= 75 ? '💕 Très bon match !' :
                 score >= 60 ? '😊 Ça peut le faire' :
                 '🤔 À creuser...'}
              </div>
            </div>
          </div>

          <div className="space-y-3 text-sm text-white/40">
            <p>Bonne chance à vous deux ! ✨</p>
            <p className="text-xs">Tu peux fermer cette page</p>
          </div>
        </motion.div>
      </div>
    )
  }

  const progress = ((step) / (quiz.questions.length + 1)) * 100

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 50 : -50,
      opacity: 0
    }),
    center: {
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 50 : -50,
      opacity: 0
    })
  }

  return (
    <div className="min-h-screen bg-[#0f0f1a] relative overflow-hidden">
      <div className="gradient-bg" />
      <div id="hearts-container" className="hearts-container" />

      {/* Header */}
      <div className="relative z-10 pt-8 pb-4 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-6">
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-4"
            >
              <Sparkles className="text-yellow-400 w-4 h-4" />
              <span className="text-sm text-white/60">Questionnaire anonyme</span>
            </motion.div>
            
            <h1 className="text-3xl font-bold text-white mb-2">
              💌 Questionnaire de <span className="text-pink-400">{quiz.user?.username || 'quelqu\'un de spécial'}</span>
            </h1>
            
            {quiz.message && (
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-white/60 italic text-lg max-w-lg mx-auto"
              >
                "{quiz.message}"
              </motion.p>
            )}
          </div>

          {/* Progress bar */}
          <div className="neon-progress h-2 mb-8">
            <motion.div 
              className="neon-progress-fill h-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-2xl mx-auto px-4 pb-8">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={step}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="glass-card p-8"
          >
            {/* Step 0: Name */}
            {step === 0 && (
              <div className="text-center">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center text-4xl mx-auto mb-6 animate-pulse-glow">
                  👋
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Comment tu t'appelles ?</h2>
                <p className="text-white/40 mb-6">Pour que {quiz.user?.username || 'cette personne'} sache qui a répondu</p>
                
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="neon-input w-full px-6 py-4 text-center text-lg mb-6"
                  placeholder="Ton prénom"
                  onKeyPress={(e) => e.key === 'Enter' && name.trim() && nextStep()}
                />
                
                <button
                  onClick={nextStep}
                  disabled={!name.trim()}
                  className="neon-button w-full py-4 text-lg flex items-center justify-center gap-2"
                >
                  Commencer
                  <ArrowRight size={20} />
                </button>
              </div>
            )}

            {/* Questions */}
            {step > 0 && step <= quiz.questions.length && (
              <div>
                {(() => {
                  const q = quiz.questions[step - 1]
                  return (
                    <>
                      <div className="flex items-center gap-2 mb-4">
                        <span className="px-3 py-1 rounded-full bg-pink-500/20 text-pink-400 text-sm font-medium">
                          Question {step} / {quiz.questions.length}
                        </span>
                      </div>
                      
                      <h2 className="text-2xl font-bold text-white mb-8">{q.text}</h2>

                      {/* Text input */}
                      {q.type === 'text' && (
                        <textarea
                          className="neon-input w-full px-4 py-4 min-h-[150px] resize-none"
                          placeholder="Écris ta réponse ici..."
                          value={answers[q.id] || ''}
                          onChange={(e) => handleAnswer(q.id, e.target.value)}
                        />
                      )}

                      {/* Choice */}
                      {q.type === 'choice' && (
                        <div className="space-y-3">
                          {q.options.map((opt: string, i: number) => (
                            <button
                              key={i}
                              onClick={() => handleAnswer(q.id, opt)}
                              className={`choice-neon w-full p-4 text-left flex items-center gap-3 ${
                                answers[q.id] === opt ? 'selected' : ''
                              }`}
                            >
                              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                                answers[q.id] === opt 
                                  ? 'border-pink-500 bg-pink-500' 
                                  : 'border-white/20'
                              }`}>
                                {answers[q.id] === opt && <CheckCircle2 size={14} className="text-white" />}
                              </div>
                              <span className={answers[q.id] === opt ? 'text-white' : 'text-white/70'}>
                                {opt}
                              </span>
                            </button>
                          ))}
                        </div>
                      )}

                      {/* Scale */}
                      {q.type === 'scale' && (
                        <div className="flex justify-between gap-2">
                          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                            <button
                              key={num}
                              onClick={() => handleAnswer(q.id, num.toString())}
                              className={`scale-neon flex-1 aspect-square text-lg ${
                                answers[q.id] === num.toString() ? 'selected' : ''
                              }`}
                            >
                              {num}
                            </button>
                          ))}
                        </div>
                      )}

                      {/* Yes/No */}
                      {q.type === 'yes_no' && (
                        <div className="flex gap-4">
                          <button
                            onClick={() => handleAnswer(q.id, 'yes')}
                            className={`flex-1 p-6 rounded-2xl border-2 text-xl font-bold transition-all ${
                              answers[q.id] === 'yes'
                                ? 'border-green-500 bg-green-500/20 text-green-400'
                                : 'border-white/10 bg-white/5 text-white/60 hover:border-green-500/50'
                            }`}
                          >
                            👍 Oui
                          </button>
                          <button
                            onClick={() => handleAnswer(q.id, 'no')}
                            className={`flex-1 p-6 rounded-2xl border-2 text-xl font-bold transition-all ${
                              answers[q.id] === 'no'
                                ? 'border-red-500 bg-red-500/20 text-red-400'
                                : 'border-white/10 bg-white/5 text-white/60 hover:border-red-500/50'
                            }`}
                          >
                            👎 Non
                          </button>
                        </div>
                      )}
                    </>
                  )
                })()}
              </div>
            )}

            {/* Navigation */}
            <div className="flex gap-4 mt-8">
              {step > 0 && (
                <button
                  onClick={prevStep}
                  className="px-6 py-3 rounded-xl border-2 border-white/10 text-white/60 hover:text-white hover:border-white/30 transition-colors"
                >
                  ←
                </button>
              )}
              
              {step <= quiz.questions.length ? (
                <button
                  onClick={nextStep}
                  disabled={!answers[quiz.questions[step - 1]?.id]}
                  className="flex-1 neon-button py-3 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  Suivant
                  <ArrowRight size={18} />
                </button>
              ) : (
                <button
                  onClick={submit}
                  className="flex-1 neon-button py-3 flex items-center justify-center gap-2"
                >
                  <Send size={18} />
                  Envoyer
                </button>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}