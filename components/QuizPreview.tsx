'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Eye, ArrowRight, CheckCircle2, Send } from 'lucide-react'

interface Question {
  id: string
  type: 'text' | 'choice' | 'scale' | 'yes_no'
  text: string
  options?: string[]
}

interface QuizPreviewProps {
  isOpen: boolean
  onClose: () => void
  title: string
  message: string
  questions: Question[]
  onConfirm: () => void
}

export default function QuizPreview({ 
  isOpen, 
  onClose, 
  title, 
  message, 
  questions,
  onConfirm 
}: QuizPreviewProps) {
  const [previewStep, setPreviewStep] = useState(0)
  const [previewAnswers, setPreviewAnswers] = useState<Record<string, string>>({})

  const resetPreview = () => {
    setPreviewStep(0)
    setPreviewAnswers({})
  }

  const handleClose = () => {
    resetPreview()
    onClose()
  }

  const handleConfirm = () => {
    resetPreview()
    onConfirm()
  }

  if (!isOpen) return null

  const validQuestions = questions.filter(q => q.text.trim())
  const progress = ((previewStep) / (validQuestions.length + 1)) * 100

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={handleClose}
      />
      
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto"
      >
        <div className="glass-card p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Eye className="text-pink-400" size={24} />
              <div>
                <h2 className="text-xl font-bold text-white">Prévisualisation</h2>
                <p className="text-sm text-white/40">Voici ce que verra ton crush</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors"
            >
              <X size={20} className="text-white/60" />
            </button>
          </div>

          {/* Badge preview */}
          <div className="mb-6 p-3 rounded-xl bg-yellow-500/10 border border-yellow-500/20 flex items-center gap-2">
            <span className="text-yellow-400 text-sm">⚠️ Mode aperçu - Les réponses ne sont pas enregistrées</span>
          </div>

          {/* Progress bar */}
          <div className="neon-progress h-2 mb-6">
            <motion.div 
              className="neon-progress-fill h-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
            />
          </div>

          {/* Content */}
          <AnimatePresence mode="wait">
            {previewStep === 0 ? (
              <motion.div
                key="intro"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="text-center py-8"
              >
                <div className="text-6xl mb-4">💌</div>
                <h3 className="text-2xl font-bold text-white mb-2">{title}</h3>
                {message && (
                  <p className="text-white/60 italic mb-6">"{message}"</p>
                )}
                <p className="text-white/40 mb-6">Questionnaire anonyme • {validQuestions.length} questions</p>
                
                <button
                  onClick={() => setPreviewStep(1)}
                  className="neon-button px-8 py-3 flex items-center gap-2 mx-auto"
                >
                  Commencer l'aperçu
                  <ArrowRight size={18} />
                </button>
              </motion.div>
            ) : previewStep <= validQuestions.length ? (
              <motion.div
                key={`question-${previewStep}`}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
              >
                {(() => {
                  const q = validQuestions[previewStep - 1]
                  return (
                    <>
                      <div className="flex items-center gap-2 mb-4">
                        <span className="px-3 py-1 rounded-full bg-pink-500/20 text-pink-400 text-sm">
                          Question {previewStep} / {validQuestions.length}
                        </span>
                      </div>
                      
                      <h3 className="text-xl font-bold text-white mb-6">{q.text}</h3>

                      {q.type === 'text' && (
                        <textarea
                          className="neon-input w-full px-4 py-4 min-h-[120px] resize-none"
                          placeholder="Ta réponse..."
                          value={previewAnswers[q.id] || ''}
                          onChange={(e) => setPreviewAnswers({...previewAnswers, [q.id]: e.target.value})}
                        />
                      )}

                      {q.type === 'choice' && q.options && (
                        <div className="space-y-3">
                          {q.options.filter(o => o.trim()).map((opt, i) => (
                            <button
                              key={i}
                              onClick={() => setPreviewAnswers({...previewAnswers, [q.id]: opt})}
                              className={`choice-neon w-full p-4 text-left flex items-center gap-3 ${
                                previewAnswers[q.id] === opt ? 'selected' : ''
                              }`}
                            >
                              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                                previewAnswers[q.id] === opt ? 'border-pink-500 bg-pink-500' : 'border-white/20'
                              }`}>
                                {previewAnswers[q.id] === opt && <CheckCircle2 size={14} className="text-white" />}
                              </div>
                              <span>{opt}</span>
                            </button>
                          ))}
                        </div>
                      )}

                      {q.type === 'scale' && (
                        <div className="flex justify-between gap-2">
                          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                            <button
                              key={num}
                              onClick={() => setPreviewAnswers({...previewAnswers, [q.id]: num.toString()})}
                              className={`scale-neon flex-1 aspect-square ${
                                previewAnswers[q.id] === num.toString() ? 'selected' : ''
                              }`}
                            >
                              {num}
                            </button>
                          ))}
                        </div>
                      )}

                      {q.type === 'yes_no' && (
                        <div className="flex gap-4">
                          <button
                            onClick={() => setPreviewAnswers({...previewAnswers, [q.id]: 'yes'})}
                            className={`flex-1 p-6 rounded-2xl border-2 text-xl font-bold transition-all ${
                              previewAnswers[q.id] === 'yes'
                                ? 'border-green-500 bg-green-500/20 text-green-400'
                                : 'border-white/10 bg-white/5 text-white/60'
                            }`}
                          >
                            👍 Oui
                          </button>
                          <button
                            onClick={() => setPreviewAnswers({...previewAnswers, [q.id]: 'no'})}
                            className={`flex-1 p-6 rounded-2xl border-2 text-xl font-bold transition-all ${
                              previewAnswers[q.id] === 'no'
                                ? 'border-red-500 bg-red-500/20 text-red-400'
                                : 'border-white/10 bg-white/5 text-white/60'
                            }`}
                          >
                            👎 Non
                          </button>
                        </div>
                      )}
                    </>
                  )
                })()}

                <div className="flex gap-4 mt-8">
                  <button
                    onClick={() => setPreviewStep(previewStep - 1)}
                    className="px-6 py-3 rounded-xl border-2 border-white/10 text-white/60 hover:text-white"
                  >
                    ←
                  </button>
                  <button
                    onClick={() => setPreviewStep(previewStep + 1)}
                    className="flex-1 neon-button py-3"
                  >
                    {previewStep === validQuestions.length ? 'Terminer' : 'Suivant'}
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="complete"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-8"
              >
                <div className="text-6xl mb-4">🎉</div>
                <h3 className="text-2xl font-bold text-white mb-2">Aperçu terminé !</h3>
                <p className="text-white/60 mb-6">Le questionnaire est prêt à être publié</p>
                
                <div className="flex gap-4">
                  <button
                    onClick={handleClose}
                    className="flex-1 px-6 py-3 rounded-xl border-2 border-white/10 text-white/60 hover:text-white hover:border-white/30 transition-colors"
                  >
                    Modifier
                  </button>
                  <button
                    onClick={handleConfirm}
                    className="flex-1 neon-button py-3 flex items-center justify-center gap-2"
                  >
                    <Send size={18} />
                    Publier
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  )
}