'use client'

import { useState, useEffect } from 'react'
import Header from './components/Header'
import Article from './components/Article'
import Footer from './components/Footer'

export default function SedichampionsPage() {
  const [article, setArticle] = useState('')
  const [timeout, setTimeoutState] = useState(false)
  const [articleTimeout, setArticleTimeout] = useState(false)
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 100)
    return () => clearTimeout(timer)
  }, [])

  // Control del scroll de la página
  useEffect(() => {
    if (isModalOpen) {
      // Modal abierto: deshabilitar scroll en el body
      document.body.style.overflow = 'hidden'
      document.body.style.position = 'fixed'
      document.body.style.width = '100%'
      document.body.style.top = `-${window.scrollY}px`
    } else {
      // Modal cerrado: restaurar scroll
      const scrollY = document.body.style.top
      document.body.style.overflow = ''
      document.body.style.position = ''
      document.body.style.width = ''
      document.body.style.top = ''
      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY || '0', 10) * -1)
      }
    }
  }, [isModalOpen])

  const handleOpenArticle = (id) => {
    if (article === id) {
      handleCloseArticle()
      return
    }
    setIsModalOpen(true)
    setArticle(id)
    setTimeout(() => setTimeoutState(true), 325)
    setTimeout(() => setArticleTimeout(true), 350)
  }

  const handleCloseArticle = () => {
    setIsModalOpen(false)
    setArticleTimeout(false)
    setTimeout(() => setTimeoutState(false), 325)
    setTimeout(() => { setArticle('') }, 350)
  }

  const isArticleVisible = article !== ''

  return (
    <div
      className="min-h-screen min-h-[100dvh] w-full overflow-x-hidden"
      style={{ background: '#1b1f22' }}
    >
      {/* BACKGROUND FIJO */}
      <div className="fixed inset-0 w-full h-full pointer-events-none" style={{ zIndex: 1 }}>
        <div
          className="absolute inset-0 transition-transform duration-[0.325s] ease-in-out"
          style={{
            backgroundImage: "url('/sedichampions/bg.webp')",
            backgroundPosition: 'center',
            backgroundSize: 'cover',
            backgroundRepeat: 'no-repeat',
            transform: isArticleVisible ? 'scale(1.0825)' : 'scale(1.125)',
            filter: isArticleVisible ? 'blur(0.2rem)' : 'none',
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(to top, rgba(19,21,25,0.5), rgba(19,21,25,0.5)), url('/sedichampions/overlay.png')",
            backgroundSize: 'auto, 256px 256px',
            backgroundPosition: 'center, center',
            backgroundRepeat: 'no-repeat, repeat',
          }}
        />
      </div>

      {/* CONTENIDO - Centrado verticalmente */}
      <div
        className={`
          relative flex flex-col items-center justify-center
          min-h-screen min-h-[100dvh] w-full p-16 max-2xl:p-12 max-xl:p-8
          max-md:p-6 max-sm:p-4 max-[400px]:p-2
          transition-opacity duration-500
          ${loading ? 'opacity-0' : 'opacity-100'}
        `}
        style={{ zIndex: 2 }}
      >
        <Header
          onOpenArticle={handleOpenArticle}
          timeout={timeout}
          isArticleVisible={isArticleVisible}
        />

        <Article
          article={article}
          articleTimeout={articleTimeout}
          onCloseArticle={handleCloseArticle}
          isOpen={isModalOpen}
        />

        <Footer timeout={timeout} isArticleVisible={isArticleVisible} />
      </div>
    </div>
  )
}