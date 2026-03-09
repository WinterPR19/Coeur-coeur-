'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { Heart, Loader2, Sparkles, Lock, Mail } from 'lucide-react'

export default function HomePage() {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    // Créer les cœurs flottants
    const container = document.getElementById('hearts-container')
    if (container) {
      const emojis = ['💕', '💖', '💗', '💓', '💝', '💘', '💞']
      for (let i = 0; i < 15; i++) {
        const heart = document.createElement('div')
        heart.className = 'floating-heart'
        heart.textContent = emojis[Math.floor(Math.random() * emojis.length)]
        heart.style.left = Math.random() * 100 + '%'
        heart.style.animationDuration = (Math.random() * 10 + 10) + 's'
        heart.style.animationDelay = Math.random() * 5 + 's'
        heart.style.fontSize = (Math.random() * 20 + 15) + 'px'
        container.appendChild(heart)
      }
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        router.push('/dashboard')
      } else {
        const { error } = await supabase.auth.signUp({ 
          email, 
          password,
          options: { emailRedirectTo: `${window.location.origin}/dashboard` }
        })
        if (error) throw error
        setMessage('✅ Compte créé ! Vérifie tes emails.')
      }
    } catch (error: any) {
      setMessage(`❌ ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const router = useRouter()

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden">
      {/* Background effects */}
      <div className="gradient-bg" />
      <div id="hearts-container" className="hearts-container" />
      
      {/* Main card */}
      <div className="glass-card w-full max-w-md p-8 animate-slide-up relative z-10">
        {/* Logo area */}
        <div className="text-center mb-8">
          <div className="relative inline-block">
            <div className="text-6xl mb-4 animate-pulse-glow">💕</div>
            <Sparkles className="absolute -top-2 -right-2 text-yellow-400 w-6 h-6 animate-pulse" />
          </div>
          <h1 className="text-4xl font-bold glow-text mb-2">Cœur à Cœur</h1>
          <p className="text-white/60 text-sm tracking-wider uppercase">
            {isLogin ? 'Connecte-toi pour continuer' : 'Crée ton compte'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email input */}
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 w-5 h-5" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="neon-input w-full pl-12 pr-4 py-4"
              placeholder="ton@email.com"
              required
            />
          </div>

          {/* Password input */}
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 w-5 h-5" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="neon-input w-full pl-12 pr-4 py-4"
              placeholder="••••••••"
              required
              minLength={6}
            />
          </div>

          {/* Message */}
          {message && (
            <div className={`p-4 rounded-xl text-sm flex items-center gap-2 ${
              message.includes('✅') 
                ? 'bg-green-500/20 border border-green-500/30 text-green-400' 
                : 'bg-red-500/20 border border-red-500/30 text-red-400'
            }`}>
              {message.includes('✅') ? '✨' : '⚠️'}
              {message.replace(/[✅❌]/g, '')}
            </div>
          )}

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading}
            className="neon-button w-full py-4 text-lg flex items-center justify-center gap-2"
          >
            {loading && <Loader2 className="animate-spin" size={20} />}
            {isLogin ? 'Se connecter' : 'Créer mon compte'}
            {!loading && <Heart size={18} className="fill-current" />}
          </button>
        </form>

        {/* Toggle */}
        <div className="mt-6 text-center">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-white/60 hover:text-white transition-colors text-sm"
          >
            {isLogin ? (
              <>Pas encore de compte ? <span className="text-pink-400 font-semibold">S'inscrire</span></>
            ) : (
              <>Déjà un compte ? <span className="text-pink-400 font-semibold">Se connecter</span></>
            )}
          </button>
        </div>

        {/* Features */}
        <div className="mt-8 pt-6 border-t border-white/10 grid grid-cols-3 gap-4 text-center text-xs text-white/40">
          <div>
            <div className="text-2xl mb-1">💌</div>
            Quiz illimités
          </div>
          <div>
            <div className="text-2xl mb-1">🔒</div>
            100% Anonyme
          </div>
          <div>
            <div className="text-2xl mb-1">⚡</div>
            Temps réel
          </div>
        </div>
      </div>

      {/* Version badge */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/20 text-xs">
        v1.0 • Gratuit
      </div>
    </div>
  )
}