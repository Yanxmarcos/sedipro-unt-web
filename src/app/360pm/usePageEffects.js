'use client'

import { useEffect } from 'react'

export function usePageEffects() {
  useEffect(() => {
    const RM = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    /* ── Hero load sequence ──────────────────────────────────────── */
    if (RM) {
      document.querySelectorAll('.hv').forEach((e) => e.classList.add('on'))
    } else {
      const order = ['h1', 'hm', 'h2', 'h3']
      order.forEach((id, i) => {
        const el = document.getElementById(id)
        if (el) setTimeout(() => el.classList.add('on'), 120 + i * 140)
      })
    }

    /* ── Scroll: parallax hero ───────────────────────────────────── */
    let ticking = false
    function parallax() {
      ticking = false
      const y = window.scrollY
      if (y > window.innerHeight * 1.2) return
      const back = document.querySelector('#hero .wordBack')
      const model = document.getElementById('hm')
      if (model) model.style.transform = `translateY(${y * -0.06}px) scale(${1 + y * 0.00006})`
      if (back) back.style.transform = `translateY(${y * 0.14}px)`
      const si = document.getElementById('seasonImg')
      if (si) {
        const r = si.parentElement.getBoundingClientRect()
        if (r.bottom > 0 && r.top < window.innerHeight) {
          si.style.transform = `scale(1.12) translateY(${(r.top / window.innerHeight) * -26}px)`
        }
      }
    }
    if (!RM) {
      window.addEventListener(
        'scroll',
        () => {
          if (!ticking) {
            ticking = true
            requestAnimationFrame(parallax)
          }
        },
        { passive: true }
      )
    }

    /* ── Reveal on scroll ────────────────────────────────────────── */
    const pending = new Set(document.querySelectorAll('.rv'))
    const io = new IntersectionObserver(
      (es) => {
        es.forEach((e) => {
          if (e.isIntersecting || e.boundingClientRect.top < 0) show(e.target)
        })
      },
      { threshold: 0.12, rootMargin: '0px 0px -6% 0px' }
    )
    function show(el) {
      el.classList.add('in')
      pending.delete(el)
      io.unobserve(el)
    }
    ;[...pending].forEach((el, i) => {
      el.style.transitionDelay = (i % 4) * 70 + 'ms'
      io.observe(el)
    })

    let sweeping = false
    function sweep() {
      sweeping = false
      ;[...pending].forEach((el) => {
        if (el.getBoundingClientRect().top < window.innerHeight * 0.94) show(el)
      })
      if (!pending.size) window.removeEventListener('scroll', queue)
    }
    function queue() {
      if (!sweeping) {
        sweeping = true
        requestAnimationFrame(sweep)
      }
    }
    window.addEventListener('scroll', queue, { passive: true })
    sweep()

    /* ── Scroll system: progress bar, parallax speeds, scrub ─────── */
    if (!RM) {
      const bar = document.getElementById('prog-bar')
      const speeds = [...document.querySelectorAll('[data-speed]')]
      const scrubs = [...document.querySelectorAll('[data-scrub]')]
      let sq = false

      function pass() {
        sq = false
        const h = document.documentElement.scrollHeight - window.innerHeight
        if (bar) bar.style.transform = `scaleX(${h > 0 ? window.scrollY / h : 0})`

        for (const el of speeds) {
          const r = el.getBoundingClientRect()
          if (r.bottom < -200 || r.top > window.innerHeight + 200) continue
          const c = (r.top + r.height / 2 - window.innerHeight / 2) / window.innerHeight
          el.style.transform = `translate3d(0, ${c * -parseFloat(el.dataset.speed) * 100}px, 0)`
        }
        for (const el of scrubs) {
          const r = el.getBoundingClientRect()
          if (r.bottom < 0 || r.top > window.innerHeight) continue
          const p = Math.max(
            0,
            Math.min(1, 1 - (r.top - window.innerHeight * 0.25) / (window.innerHeight * 0.6))
          )
          el.style.setProperty('--p', p.toFixed(3))
        }
      }
      window.addEventListener(
        'scroll',
        () => {
          if (!sq) {
            sq = true
            requestAnimationFrame(pass)
          }
        },
        { passive: true }
      )
      window.addEventListener('resize', pass)
      pass()
    }

    /* ── Video bands: lazy load on intersection ──────────────────── */
    const vids = [...document.querySelectorAll('.vband video')]
    if (vids.length && !RM) {
      const vo = new IntersectionObserver(
        (es) =>
          es.forEach((e) => {
            const v = e.target
            if (e.isIntersecting) {
              if (!v.src && v.dataset.src) v.src = v.dataset.src
              v.play().catch(() => {})
            } else if (v.src) {
              v.pause()
            }
          }),
        { threshold: 0.2 }
      )
      vids.forEach((v) => vo.observe(v))
    }

    /* ── Atelier counter animation ───────────────────────────────── */
    const nums = [...document.querySelectorAll('#atelier .acount b')]
    if (nums.length) {
      if (RM) {
        nums.forEach((n) => (n.textContent = n.dataset.to))
      } else {
        const run = (n) => {
          const to = +n.dataset.to
          const t0 = performance.now()
          const D = 1100
          ;(function step(now) {
            const p = Math.min(1, (now - t0) / D)
            const e = 1 - Math.pow(1 - p, 3)
            n.textContent = Math.round(to * e)
            if (p < 1) requestAnimationFrame(step)
          })(t0)
        }
        const co = new IntersectionObserver(
          (es) =>
            es.forEach((e) => {
              if (e.isIntersecting) {
                run(e.target)
                co.unobserve(e.target)
              }
            }),
          { threshold: 0.6 }
        )
        nums.forEach((n) => co.observe(n))
      }
    }

    /* ── Placeholder links ───────────────────────────────────────── */
    const onClick = (e) => {
      const a = e.target.closest('a')
      if (a && a.getAttribute('href') === '#') e.preventDefault()
    }
    document.addEventListener('click', onClick)

    return () => {
      io.disconnect()
      document.removeEventListener('click', onClick)
      window.removeEventListener('scroll', queue)
    }
  }, [])
}
