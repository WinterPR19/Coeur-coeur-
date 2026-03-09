'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { ArrowLeft, Heart, User, Calendar } from 'lucide-react'
import Link from 'next/link'

export default function QuizResponses() {
  const { id } = useParams()
  const [quiz, setQuiz] = useState<any>(null)
  const [responses, setResponses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [id])

  async function loadData() {
    const { data: quizData } = await supabase
      .from('quizzes')
      .select('*, questions(*)')
      .eq('id', id)
      .single()

    const { data: responsesData } = await supabase
      .from('responses')
      .select('*')
      .eq('quiz_id', id)
      .order('created_at', { ascending: false })

    setQuiz(quizData)
    setResponses(responsesData || [])
    setLoading(false)
  }

  if (loading) return <div className="min-h-screen bg-[#0f0f1a] flex items-center justify-center"><div className="text-4xl animate-pulse">💕</div></div>

  return (
    <div className="min-h-screen bg-[#0f0f1a] relative overflow-hidden">
      <div className="gradient-bg" />
      
      <header className="relative z-10 border-b border-white/10 bg-black/20 backdrop-blur-lg sticky top-0">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <Link href="/dashboard" className="flex items-center gap-2 text-white/60 hover:text-white transition-colors mb-4">
            <ArrowLeft size={20} />
            Retour
          </Link>
          <h1 className="text-2xl font-bold text-white">{quiz.title}</h1>
          <p className="text-white/40">{responses.length} réponse{responses.length > 1 ? 's' : ''}</p>
        </div>
      </header>

      <main className="relative z-10 max-w-4xl mx-auto px-4 py-8">
        <div className="space-y-4">
          {responses.map((response, idx) => (
            <div key={response.id} className="glass-card p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center text-xl">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-lg">{response.responder_name || 'Anonyme'}</h3>
                    <div className="flex items-center gap-2 text-sm text-white/40">
                      <Calendar size={14} />
                      {new Date(response.created_at).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'long',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>
                </div>
                
                <div className="text-center">
                  <div className="text-3xl font-bold text-pink-400">{response.compatibility_score}%</div>
                  <div className="text-xs text-white/40">compatibilité</div>
                </div>
              </div>

              <div className="space-y-4">
                {quiz.questions.map((q: any) => (
                  <div key={q.id} className="bg-white/5 rounded-xl p-4">
                    <p className="text-white/60 text-sm mb-2">{q.text}</p>
                    <p className="text-white font-medium text-lg">
                      {response.answers[q.id] || 'Pas de réponse'}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}