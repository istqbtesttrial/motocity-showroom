import { useEffect, useMemo, useRef, useState } from 'react'
import { gsap } from 'gsap'
import motoCityLogo from '../assets/motocity-logo.jpg'
import scooterOverlay from './assets/scooter-overlay.svg'
import { createIntroScene } from './scene'

type IntroExperienceProps = {
  onComplete: () => void
}

const INTRO_SEEN_KEY = 'motocity-intro-three-seen'

const canUseWebGL = () => {
  try {
    const canvas = document.createElement('canvas')
    return !!(window.WebGLRenderingContext && (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')))
  } catch {
    return false
  }
}

export function IntroExperience({ onComplete }: IntroExperienceProps) {
  const [phase, setPhase] = useState<'playing' | 'exiting'>('playing')
  const [useFallback, setUseFallback] = useState(false)
  const [reducedMotion, setReducedMotion] = useState(false)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const rootRef = useRef<HTMLDivElement | null>(null)
  const completeRef = useRef(false)

  const device = useMemo(() => {
    const width = typeof window !== 'undefined' ? window.innerWidth : 1280
    const coarse = typeof window !== 'undefined' && window.matchMedia?.('(pointer: coarse)').matches
    const mobile = width < 860 || coarse
    const lowPower = mobile || (typeof navigator !== 'undefined' && navigator.hardwareConcurrency <= 4)
    return { mobile, lowPower }
  }, [])

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    const apply = () => setReducedMotion(media.matches)
    apply()
    media.addEventListener?.('change', apply)
    return () => media.removeEventListener?.('change', apply)
  }, [])

  useEffect(() => {
    if (reducedMotion || !canUseWebGL()) {
      setUseFallback(true)
      return
    }
    if (!containerRef.current) return

    const scene = createIntroScene(containerRef.current, device)
    const timeline = gsap.timeline({ paused: true, defaults: { ease: 'power2.inOut' } })
    const state = { progress: 0 }

    timeline
      .to(state, { progress: 0.18, duration: 1.6, ease: 'power1.out' })
      .to(state, { progress: 0.58, duration: 3.1, ease: 'power2.inOut' })
      .to(state, { progress: 0.82, duration: 2.0, ease: 'power2.out' })
      .to(state, { progress: 1, duration: 1.5, ease: 'power1.out' })

    const renderLoop = () => {
      scene.updateProgress(state.progress)
      scene.render()
    }

    gsap.ticker.add(renderLoop)
    timeline.play()

    const content = rootRef.current
    const textTl = gsap.timeline()
    if (content) {
      textTl
        .fromTo('.intro-skip', { opacity: 0 }, { opacity: 0.72, duration: 0.6, delay: 0.45 })
        .fromTo('.intro-scooter-overlay', { x: -140, y: 20, opacity: 0, scale: 0.34, rotation: -4, filter: 'blur(18px)' }, { x: 0, y: 0, opacity: 0.98, scale: 1, rotation: 0, filter: 'blur(0px)', duration: 3.4, ease: 'power3.out', delay: 0.9 }, 0)
        .fromTo('.intro-brand-block', { x: 20, opacity: 0, scale: 0.98 }, { x: 0, opacity: 1, scale: 1, duration: 1.25, ease: 'power3.out' }, '+=1.75')
        .fromTo('.intro-logo-shell', { y: 18, opacity: 0, scale: 0.95 }, { y: 0, opacity: 1, scale: 1, duration: 0.9, ease: 'power3.out' }, '-=0.75')
        .fromTo('.intro-logo-sweep', { xPercent: -140, opacity: 0 }, { xPercent: 145, opacity: 0.38, duration: 1.0, ease: 'power2.inOut' }, '-=0.08')
        .fromTo('.intro-brand', { y: 14, opacity: 0, letterSpacing: '0.24em' }, { y: 0, opacity: 1, letterSpacing: '0.16em', duration: 0.9, ease: 'power3.out' }, '-=0.44')
        .fromTo('.intro-divider', { scaleX: 0.5, opacity: 0 }, { scaleX: 1, opacity: 0.56, duration: 0.65, ease: 'power2.out' }, '-=0.45')
        .fromTo('.intro-subcopy', { y: 10, opacity: 0 }, { y: 0, opacity: 0.72, duration: 0.8, ease: 'power2.out' }, '-=0.16')
        .to({}, { duration: 1.4 })
    }

    const handleResize = () => scene.resize()
    window.addEventListener('resize', handleResize)

    const finish = () => {
      if (completeRef.current) return
      completeRef.current = true
      sessionStorage.setItem(INTRO_SEEN_KEY, '1')
      setPhase('exiting')
      gsap.to(rootRef.current, {
        autoAlpha: 0,
        duration: 0.65,
        ease: 'power2.out',
        onComplete,
      })
    }

    timeline.eventCallback('onComplete', finish)

    return () => {
      window.removeEventListener('resize', handleResize)
      gsap.ticker.remove(renderLoop)
      timeline.kill()
      textTl.kill()
      scene.dispose()
    }
  }, [device, onComplete, reducedMotion])

  useEffect(() => {
    if (!useFallback || !rootRef.current) return

    const timeline = gsap.timeline({
      onComplete: () => {
        sessionStorage.setItem(INTRO_SEEN_KEY, '1')
        setPhase('exiting')
        gsap.to(rootRef.current, {
          autoAlpha: 0,
          duration: 0.7,
          ease: 'power2.out',
          onComplete,
        })
      },
    })

    timeline
      .fromTo('.intro-fallback-halo', { opacity: 0.08, scale: 0.92 }, { opacity: 0.28, scale: 1, duration: 1.3, ease: 'power2.out' })
      .fromTo('.intro-brand', { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 1, ease: 'power3.out' }, '-=0.7')
      .fromTo('.intro-subcopy', { opacity: 0, y: 8 }, { opacity: 0.78, y: 0, duration: 0.9, ease: 'power2.out' }, '-=0.55')
      .to('.intro-fallback-shell', { opacity: 1, duration: 1.2 }, 0)
      .to({}, { duration: 1.1 })

    return () => {
      timeline.kill()
    }
  }, [onComplete, useFallback])

  const handleSkip = () => {
    if (completeRef.current) return
    completeRef.current = true
    sessionStorage.setItem(INTRO_SEEN_KEY, '1')
    setPhase('exiting')
    gsap.to(rootRef.current, {
      autoAlpha: 0,
      duration: 0.55,
      ease: 'power2.out',
      onComplete,
    })
  }

  if (typeof window !== 'undefined' && sessionStorage.getItem(INTRO_SEEN_KEY)) {
    return null
  }

  return (
    <div ref={rootRef} className={`intro-experience ${phase === 'exiting' ? 'is-exiting' : ''}`}>
      <div className="intro-blackframe" />
      {useFallback ? (
        <div className="intro-fallback-shell">
          <div className="intro-fallback-halo" />
          <div className="intro-fallback-floor" />
          <div className="intro-fallback-hero" />
        </div>
      ) : (
        <div ref={containerRef} className="intro-canvas-shell" aria-hidden="true" />
      )}

      <div className="intro-overlay">
        <div className="intro-scooter-stage" aria-hidden="true">
          <div className="intro-scooter-overlay">
            <img src={scooterOverlay} alt="" className="intro-scooter-image" />
            <div className="intro-scooter-glow" />
          </div>
        </div>

        <div className="intro-brand-block">
          <p className="intro-kicker">Showroom opening sequence</p>
          <div className="intro-logo-shell">
            <div className="intro-logo-badge">
              <img src={motoCityLogo} alt="MotoCity" className="intro-logo-image" />
              <div className="intro-logo-sweep" aria-hidden="true" />
            </div>
          </div>
          <h1 className="intro-brand">MotoCity</h1>
          <div className="intro-divider" aria-hidden="true" />
          <p className="intro-subcopy">Le scooter surgit de la profondeur, prend sa place dans le showroom, puis la marque s’impose avec calme.</p>
        </div>
      </div>

      <button type="button" className="intro-skip" onClick={handleSkip} aria-label="Passer l’introduction">
        Skip
      </button>
    </div>
  )
}
