import { useState, useEffect, useRef } from 'react'

// ─── Photo slot: drop a file in /public and it shows up automatically ─────────
// No upload button, no code editing — just place your image file inside the
// project's "public" folder (e.g. public/photo1.jpg) and refresh the browser.
function SmartPhoto({
  src, shape='circle', width, height, placeholder,
}: {
  src: string; shape?:'circle'|'rounded'; width:number; height:number; placeholder: React.ReactNode
}) {
  const [failed, setFailed] = useState(false)
  return (
    <div style={{
      width, height, borderRadius: shape==='circle' ? '50%' : 15,
      overflow:'hidden', position:'relative', display:'flex', alignItems:'center', justifyContent:'center',
    }}>
      {!failed && (
        <img
          src={src} alt="" onError={() => setFailed(true)}
          style={{ width:'100%', height:'100%', objectFit:'cover', display: failed ? 'none' : 'block' }}
        />
      )}
      {failed && placeholder}
    </div>
  )
}

// ─── Scales the fixed-size card design to fit any screen width ────────────────
// The card panels are laid out at a fixed 620×877 design size. On narrow
// phones we shrink the whole thing proportionally (like zooming out) instead
// of letting content overflow or get cut off.
const DESIGN_W = 620
const DESIGN_H = 877

function ScaleToFit({ children, innerRef }: { children: React.ReactNode; innerRef?: React.Ref<HTMLDivElement> }) {
  const outerRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)

  useEffect(() => {
    const el = outerRef.current
    if (!el) return
    const update = () => {
      const w = el.getBoundingClientRect().width
      setScale(Math.min(1, w / DESIGN_W))
    }
    update()
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  return (
    <div ref={outerRef} style={{ width:'100%', height: DESIGN_H * scale, overflow:'hidden' }}>
      <div style={{ width: DESIGN_W, height: DESIGN_H, transform:`scale(${scale})`, transformOrigin:'top left' }}>
        <div ref={innerRef} style={{ width: DESIGN_W, height: DESIGN_H }}>
          {children}
        </div>
      </div>
    </div>
  )
}

// ─── Types ─────────────────────────────────────────────────────────────────────
interface Particle { id: number; x: number; y: number; size: number; delay: number; duration: number; color: string; rotate: number }
interface Star     { id: number; x: number; y: number; size: number; delay: number; duration: number }
interface Shooter  { id: number; x: number; y: number; delay: number }
interface Firefly  { id: number; x: number; y: number; fx: number; fy: number; delay: number; duration: number }

// ─── Background Scene ─────────────────────────────────────────────────────────

// ─── Photo balloon: your photo, floating up like a real balloon ────────────────
function PhotoBalloon({ pb }: { pb: { id:number; x:number; size:number; delay:number; duration:number } }) {
  const [failed, setFailed] = useState(false)
  if (failed) return null
  return (
    <div className="balloon" style={{
      left: `${pb.x}%`, top: '108%', width: pb.size, height: pb.size * 1.3,
      animationDelay: `${pb.delay}s`, animationDuration: `${pb.duration}s`,
    }}>
      <div style={{
        width: pb.size, height: pb.size, borderRadius: '50%', overflow: 'hidden',
        border: '3px solid rgba(255,255,255,0.75)',
        boxShadow: '0 0 22px rgba(232,132,154,0.55), inset 0 0 14px rgba(255,255,255,0.35)',
      }}>
        <img
          src="/photo1.jpg" alt="" onError={() => setFailed(true)}
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        />
      </div>
      <svg width={pb.size} height={pb.size * 0.35} viewBox="0 0 10 30" style={{ display: 'block', margin: '0 auto' }}>
        <path d="M5 0 Q8 15 5 30" stroke="rgba(255,255,255,0.45)" strokeWidth="1" fill="none" />
      </svg>
    </div>
  )
}

function LuxuryBackground() {
  const [balloons,  setBalloons]  = useState<Particle[]>([])
  const [photoBalloons, setPhotoBalloons] = useState<{ id:number; x:number; size:number; delay:number; duration:number }[]>([])
  const [petals,    setPetals]    = useState<Particle[]>([])
  const [stars,     setStars]     = useState<Star[]>([])
  const [shooters,  setShooters]  = useState<Shooter[]>([])
  const [fireflies, setFireflies] = useState<Firefly[]>([])
  const nextId = useRef(0)
  const uid = () => ++nextId.current

  // Rose-gold / blush palette for balloons
  const balloonColors = [
    'radial-gradient(circle at 35% 35%, #f5d0d8, #c9657a)',
    'radial-gradient(circle at 35% 35%, #f5e0c8, #c9956c)',
    'radial-gradient(circle at 35% 35%, #f0d8f0, #b48ec4)',
    'radial-gradient(circle at 35% 35%, #fce4ec, #e8849a)',
    'radial-gradient(circle at 35% 35%, #fff0d8, #d4a847)',
    'radial-gradient(circle at 35% 35%, #fde8ef, #d4708a)',
  ]
  const petalColors = ['#f5c0c8','#e8b4b8','#f0c8d0','#e8c4b0','#f0d8c0','#fce4ec']

  // Build initial arrays once
  useEffect(() => {
    const b: Particle[] = Array.from({ length: 18 }, () => ({
      id: uid(), x: Math.random() * 100, y: 100 + Math.random() * 30,
      size: 28 + Math.random() * 32, delay: Math.random() * 12,
      duration: 14 + Math.random() * 12,
      color: balloonColors[Math.floor(Math.random() * balloonColors.length)],
      rotate: (Math.random() - 0.5) * 20,
    }))

    const p: Particle[] = Array.from({ length: 28 }, () => ({
      id: uid(), x: Math.random() * 100, y: -5 + Math.random() * 10,
      size: 6 + Math.random() * 10, delay: Math.random() * 15,
      duration: 10 + Math.random() * 10,
      color: petalColors[Math.floor(Math.random() * petalColors.length)],
      rotate: Math.random() * 360,
    }))

    const s: Star[] = Array.from({ length: 70 }, () => ({
      id: uid(), x: Math.random() * 100, y: Math.random() * 100,
      size: 1 + Math.random() * 3, delay: Math.random() * 4,
      duration: 1.5 + Math.random() * 3,
    }))

    const sh: Shooter[] = Array.from({ length: 4 }, (_, i) => ({
      id: uid(), x: 5 + Math.random() * 40, y: 5 + Math.random() * 30,
      delay: i * 7 + Math.random() * 5,
    }))

    const ff: Firefly[] = Array.from({ length: 22 }, () => ({
      id: uid(), x: 10 + Math.random() * 80, y: 20 + Math.random() * 70,
      fx: (Math.random() - 0.5) * 80, fy: -20 - Math.random() * 60,
      delay: Math.random() * 8, duration: 3 + Math.random() * 4,
    }))

    const pb = Array.from({ length: 5 }, () => ({
      id: uid(), x: Math.random() * 100,
      size: 58 + Math.random() * 30, delay: Math.random() * 16,
      duration: 20 + Math.random() * 10,
    }))

    setBalloons(b); setPetals(p); setStars(s); setShooters(sh); setFireflies(ff); setPhotoBalloons(pb)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 0, overflow: 'hidden', pointerEvents: 'none' }}>

      {/* Deep gradient base */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(170deg, #0d0510 0%, #1a0820 18%, #200a18 35%, #150618 55%, #1c0a14 70%, #0f0812 100%)',
      }} />

      {/* Aurora bands */}
      {[
        { color: 'rgba(180,80,120,0.18)', width: '160%', height: '180px', top: '15%', left: '-30%', delay: '0s', dur: '12s' },
        { color: 'rgba(140,60,180,0.12)', width: '140%', height: '120px', top: '35%', left: '-20%', delay: '4s', dur: '16s' },
        { color: 'rgba(212,130,80,0.10)', width: '150%', height: '100px', top: '60%', left: '-25%', delay: '8s', dur: '14s' },
      ].map((a, i) => (
        <div key={i} className="aurora" style={{
          background: `linear-gradient(90deg, transparent 0%, ${a.color} 30%, ${a.color} 70%, transparent 100%)`,
          width: a.width, height: a.height, top: a.top, left: a.left,
          animationDelay: a.delay, animationDuration: a.dur,
          filter: 'blur(30px)',
        }} />
      ))}

      {/* Nebula glow blobs */}
      {[
        { x: '15%',  y: '20%',  r: 280, c: 'rgba(183,80,130,0.12)' },
        { x: '80%',  y: '15%',  r: 220, c: 'rgba(140,60,180,0.10)' },
        { x: '50%',  y: '50%',  r: 350, c: 'rgba(212,120,80,0.08)' },
        { x: '20%',  y: '75%',  r: 200, c: 'rgba(183,80,120,0.09)' },
        { x: '85%',  y: '70%',  r: 240, c: 'rgba(130,50,160,0.08)' },
      ].map((g, i) => (
        <div key={i} style={{
          position: 'absolute', left: g.x, top: g.y,
          width: g.r * 2, height: g.r * 2, borderRadius: '50%',
          background: `radial-gradient(circle, ${g.c} 0%, transparent 70%)`,
          transform: 'translate(-50%,-50%)',
          filter: 'blur(40px)',
        }} />
      ))}

      {/* Stars */}
      {stars.map(s => (
        <div key={s.id} className="star" style={{
          left: `${s.x}%`, top: `${s.y}%`,
          width: s.size, height: s.size,
          background: s.size > 2.5
            ? `radial-gradient(circle, #fff 0%, rgba(212,168,71,0.8) 50%, transparent 100%)`
            : `radial-gradient(circle, #fff 0%, rgba(255,220,240,0.9) 100%)`,
          animationDelay: `${s.delay}s`,
          animationDuration: `${s.duration}s`,
          boxShadow: s.size > 2.5 ? `0 0 ${s.size * 3}px rgba(212,168,71,0.6)` : 'none',
        }} />
      ))}

      {/* Shooting stars */}
      {shooters.map(s => (
        <div key={s.id} style={{
          position: 'absolute', left: `${s.x}%`, top: `${s.y}%`,
          width: 80, height: 1.5,
          background: 'linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,220,240,0.9) 60%, white 100%)',
          borderRadius: 2,
          animationName: 'shoot',
          animationDuration: '1.2s',
          animationTimingFunction: 'linear',
          animationDelay: `${s.delay}s`,
          animationIterationCount: 'infinite',
          transform: 'rotate(-25deg)',
          boxShadow: '0 0 6px rgba(255,200,220,0.7)',
          pointerEvents: 'none',
        }} />
      ))}

      {/* Fireflies */}
      {fireflies.map(f => (
        <div key={f.id} className="firefly" style={{
          left: `${f.x}%`, top: `${f.y}%`,
          width: 4, height: 4,
          background: 'radial-gradient(circle, #fde8a0, #e8b060)',
          boxShadow: '0 0 8px 3px rgba(232,176,96,0.6)',
          animationDelay: `${f.delay}s`,
          animationDuration: `${f.duration}s`,
          // @ts-ignore
          '--fx': `${f.fx}px`,
          '--fy': `${f.fy}px`,
        }} />
      ))}

      {/* Rose petals */}
      {petals.map(p => (
        <div key={p.id} className="petal" style={{
          left: `${p.x}%`, top: `${p.y}%`,
          width: p.size, height: p.size * 0.65,
          animationDelay: `${p.delay}s`,
          animationDuration: `${p.duration}s`,
        }}>
          <svg width="100%" height="100%" viewBox="0 0 40 28">
            <ellipse cx="20" cy="14" rx="18" ry="11"
              fill={p.color} opacity="0.75"
              transform={`rotate(${p.rotate} 20 14)`} />
            <ellipse cx="20" cy="10" rx="10" ry="6"
              fill={p.color} opacity="0.45"
              transform={`rotate(${p.rotate + 30} 20 10)`} />
          </svg>
        </div>
      ))}

      {/* Heart Balloons */}
      {balloons.map(b => (
        <div key={b.id} className="balloon" style={{
          left: `${b.x}%`, top: `${b.y}%`,
          width: b.size, height: b.size,
          animationDelay: `${b.delay}s`,
          animationDuration: `${b.duration}s`,
        }}>
          {/* Heart balloon SVG */}
          <svg width={b.size} height={b.size * 1.2} viewBox="0 0 60 72">
            {/* Heart shape */}
            <defs>
              <radialGradient id={`bg${b.id}`} cx="38%" cy="35%" r="60%">
                <stop offset="0%" stopColor="rgba(255,255,255,0.55)" />
                <stop offset="100%" stopColor="rgba(0,0,0,0.0)" />
              </radialGradient>
            </defs>
            <path
              d="M30 52 C22 44 4 38 4 22 C4 12 11 6 19 6 C23.5 6 27.5 8.5 30 12 C32.5 8.5 36.5 6 41 6 C49 6 56 12 56 22 C56 38 38 44 30 52Z"
              fill={b.color}
              opacity="0.82"
            />
            {/* Gloss shine */}
            <path
              d="M30 52 C22 44 4 38 4 22 C4 12 11 6 19 6 C23.5 6 27.5 8.5 30 12 C32.5 8.5 36.5 6 41 6 C49 6 56 12 56 22 C56 38 38 44 30 52Z"
              fill="url(#bg${b.id})"
            />
            {/* Balloon string */}
            <path d="M30 54 Q35 62 30 70" stroke="rgba(255,255,255,0.4)" strokeWidth="1" fill="none" />
            {/* Tiny sparkle on balloon */}
            <circle cx="20" cy="16" r="2.5" fill="rgba(255,255,255,0.55)" />
          </svg>
        </div>
      ))}

      {/* Photo Balloons — your photo floating up like a real balloon */}
      {photoBalloons.map(pb => <PhotoBalloon key={pb.id} pb={pb} />)}

      {/* Bottom mist vignette */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: '35%',
        background: 'linear-gradient(to top, rgba(13,5,16,0.85) 0%, transparent 100%)',
      }} />
      {/* Top vignette */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: '20%',
        background: 'linear-gradient(to bottom, rgba(13,5,16,0.6) 0%, transparent 100%)',
      }} />
    </div>
  )
}

// ─── SVG Decorations (Card-internal) ──────────────────────────────────────────

function FloralRose({ x=0,y=0,size=1,opacity=1,color='#c9956c' }:{ x?:number;y?:number;size?:number;opacity?:number;color?:string }) {
  const hi = color === '#c9956c' ? '#e8c4a0' : '#f5ddd0'
  return (
    <g transform={`translate(${x},${y}) scale(${size})`} opacity={opacity}>
      <circle cx="0" cy="0" r="8" fill={color} opacity="0.9" />
      <ellipse cx="-7" cy="-4" rx="6" ry="4" fill={color} opacity="0.7" transform="rotate(-30)" />
      <ellipse cx="7"  cy="-4" rx="6" ry="4" fill={color} opacity="0.7" transform="rotate(30)" />
      <ellipse cx="0"  cy="-9" rx="5" ry="4" fill={color} opacity="0.75" />
      <ellipse cx="-8" cy="4"  rx="5" ry="4" fill={color} opacity="0.65" transform="rotate(20)" />
      <ellipse cx="8"  cy="4"  rx="5" ry="4" fill={color} opacity="0.65" transform="rotate(-20)" />
      <ellipse cx="0"  cy="8"  rx="4" ry="3" fill={color} opacity="0.6" />
      <circle cx="0" cy="0" r="5" fill={hi} opacity="0.9" />
      <circle cx="0" cy="0" r="2.5" fill="#fff5f0" opacity="1" />
    </g>
  )
}

function BabyBreath({ x=0,y=0,size=1,opacity=0.7 }:{ x?:number;y?:number;size?:number;opacity?:number }) {
  const dots=[[0,0],[8,-4],[-6,-6],[12,-10],[-12,-8],[4,-14],[-4,-18],[14,-6],[-14,-12],[6,-20],[0,-24]]
  return (
    <g transform={`translate(${x},${y}) scale(${size})`} opacity={opacity}>
      {dots.map(([dx,dy],i)=><circle key={i} cx={dx} cy={dy} r={i===0?1.5:1.2} fill="#f0e8e8"/>)}
      <line x1="0" y1="0" x2="0" y2="20" stroke="#c4b89a" strokeWidth="0.8" opacity="0.5"/>
      <line x1="0" y1="-8" x2="8" y2="-4" stroke="#c4b89a" strokeWidth="0.6" opacity="0.4"/>
      <line x1="0" y1="-12" x2="-6" y2="-8" stroke="#c4b89a" strokeWidth="0.6" opacity="0.4"/>
    </g>
  )
}

function Butterfly({ x=0,y=0,size=1,opacity=0.8,color='#d4a0a7' }:{ x?:number;y?:number;size?:number;opacity?:number;color?:string }) {
  return (
    <g transform={`translate(${x},${y}) scale(${size})`} opacity={opacity}>
      <ellipse cx="-8" cy="-4" rx="9" ry="6" fill={color} opacity="0.75" transform="rotate(-15)"/>
      <ellipse cx="8"  cy="-4" rx="9" ry="6" fill={color} opacity="0.75" transform="rotate(15)"/>
      <ellipse cx="-6" cy="4"  rx="6" ry="4" fill={color} opacity="0.5"  transform="rotate(20)"/>
      <ellipse cx="6"  cy="4"  rx="6" ry="4" fill={color} opacity="0.5"  transform="rotate(-20)"/>
      <ellipse cx="0"  cy="0"  rx="1.5" ry="6" fill="#8b5e6a" opacity="0.8"/>
      <line x1="-2" y1="-7" x2="-8" y2="-14" stroke="#8b5e6a" strokeWidth="0.8" opacity="0.6"/>
      <line x1="2"  y1="-7" x2="8"  y2="-14" stroke="#8b5e6a" strokeWidth="0.8" opacity="0.6"/>
    </g>
  )
}

function HeartOutline({ x=0,y=0,size=1,opacity=0.5,color='#c9956c' }:{ x?:number;y?:number;size?:number;opacity?:number;color?:string }) {
  return (
    <g transform={`translate(${x},${y}) scale(${size})`} opacity={opacity}>
      <path d="M0 8 C-2 5 -10 0 -10 -5 C-10 -10 -5 -12 0 -7 C5 -12 10 -10 10 -5 C10 0 2 5 0 8Z"
        fill="none" stroke={color} strokeWidth="1.5"/>
    </g>
  )
}

function Sparkle({ x=0,y=0,size=1,opacity=0.8,color='#d4a847' }:{ x?:number;y?:number;size?:number;opacity?:number;color?:string }) {
  return (
    <g transform={`translate(${x},${y}) scale(${size})`} opacity={opacity} className="sparkle-anim">
      <path d="M0 -8 L2 -2 L8 0 L2 2 L0 8 L-2 2 L-8 0 L-2 -2Z" fill={color}/>
    </g>
  )
}

function MiniSparkle({ x=0,y=0,size=0.5,color='#d4a847' }:{ x?:number;y?:number;size?:number;color?:string }) {
  return (
    <g transform={`translate(${x},${y}) scale(${size})`} className="sparkle-delay">
      <path d="M0 -6 L1.5 -1.5 L6 0 L1.5 1.5 L0 6 L-1.5 1.5 L-6 0 L-1.5 -1.5Z" fill={color} opacity="0.7"/>
    </g>
  )
}

// ─── Front Cover ──────────────────────────────────────────────────────────────

// ─── Together Since counter ─────────────────────────────────────────────────────
// Change this to the date you two got together — that's what the live
// counter below counts up from.
const RELATIONSHIP_START = new Date(2024, 0, 1, 0, 0, 0) // Jan 1, 2024 (edit me!)

function TogetherSince() {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  const diff = Math.max(0, now.getTime() - RELATIONSHIP_START.getTime())
  const days    = Math.floor(diff / 86400000)
  const hours   = Math.floor((diff % 86400000) / 3600000)
  const minutes = Math.floor((diff % 3600000) / 60000)

  return (
    <div style={{
      background:'rgba(255,255,255,0.15)',backdropFilter:'blur(10px)',
      border:'1px solid rgba(212,168,71,0.35)',borderRadius:16,
      padding:'8px 16px',marginTop:14,textAlign:'center',
    }}>
      <p style={{ fontFamily:'Poppins,sans-serif',fontSize:8,color:'rgba(140,80,100,0.55)',
        letterSpacing:'0.1em',textTransform:'uppercase',margin:'0 0 3px',
      }}>Together Since 💑</p>
      <p style={{ fontFamily:"'Playfair Display',serif",fontSize:13,color:'#8b3a52',margin:0,fontWeight:600 }}>
        {days} din, {hours} ghante, {minutes} min
      </p>
    </div>
  )
}

function FrontCover() {
  return (
    <div style={{
      width:'100%',height:'100%',
      background:'linear-gradient(135deg,#fdf0f3 0%,#fff8f6 20%,#fdf4f7 40%,#fff9f4 60%,#fdf0f0 80%,#fff6f8 100%)',
      position:'relative',overflow:'hidden',
      display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',
    }}>
      <div style={{ position:'absolute',inset:0,
        background:'radial-gradient(ellipse at 20% 20%, rgba(217,175,185,0.18) 0%, transparent 60%), radial-gradient(ellipse at 80% 80%, rgba(201,149,108,0.12) 0%, transparent 55%)',
        pointerEvents:'none',
      }}/>
      {/* Bokeh */}
      {[[8,12,80,0.08],[88,8,60,0.06],[15,85,100,0.07],[82,88,70,0.08],[50,5,50,0.05],[92,50,55,0.06]].map(([lx,ly,s,o],i)=>(
        <div key={i} style={{ position:'absolute',left:`${lx}%`,top:`${ly}%`,width:s,height:s,
          borderRadius:'50%',background:'radial-gradient(circle, rgba(212,168,71,0.7) 0%, transparent 70%)',
          opacity:o,filter:'blur(20px)',transform:'translate(-50%,-50%)',
        }}/>
      ))}
      <svg style={{ position:'absolute',inset:0,width:'100%',height:'100%',pointerEvents:'none' }} viewBox="0 0 595 842" preserveAspectRatio="none">
        <defs>
          <linearGradient id="gf1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#c9956c"/><stop offset="50%" stopColor="#f5d98b"/><stop offset="100%" stopColor="#c9956c"/>
          </linearGradient>
        </defs>
        {/* Border */}
        <rect x="20" y="20" width="555" height="802" rx="8" fill="none" stroke="url(#gf1)" strokeWidth="1.5" opacity="0.5"/>
        <rect x="28" y="28" width="539" height="786" rx="6" fill="none" stroke="rgba(201,149,108,0.25)" strokeWidth="0.8"/>
        {/* Corners */}
        {([[36,36,0],[559,36,90],[559,806,180],[36,806,270]] as [number,number,number][]).map(([cx,cy,rot],i)=>(
          <g key={i} transform={`translate(${cx},${cy}) rotate(${rot})`}>
            <path d="M0 0 L22 0 M0 0 L0 22" stroke="url(#gf1)" strokeWidth="1.5" opacity="0.7"/>
            <circle cx="0" cy="0" r="2.5" fill="#d4a847" opacity="0.85"/>
          </g>
        ))}
        {/* Top-left floral */}
        <g className="float-anim-slow">
          <FloralRose x={62} y={62} size={1.4} color="#c9956c"/><FloralRose x={102} y={46} size={1.0} color="#d4a0a7"/>
          <FloralRose x={36} y={96} size={0.9} color="#e8b4b8"/><BabyBreath x={82} y={30} size={1.1}/>
          <BabyBreath x={122} y={72} size={0.9}/><Butterfly x={142} y={42} size={0.9} color="#d4a0a7"/>
        </g>
        {/* Top-right floral */}
        <g className="float-anim">
          <FloralRose x={534} y={56} size={1.3} color="#d4a0a7"/><FloralRose x={566} y={92} size={1.0} color="#c9956c"/>
          <FloralRose x={506} y={82} size={0.8} color="#e8c4b8"/><BabyBreath x={546} y={30} size={1.0}/>
          <Butterfly x={482} y={50} size={0.85} color="#b88ea0"/>
        </g>
        {/* Bottom floral */}
        <g className="float-anim-delay">
          <FloralRose x={56} y={782} size={1.2} color="#e8b4b8"/><FloralRose x={96} y={802} size={1.0} color="#c9956c"/>
          <BabyBreath x={70} y={812} size={1.0}/><Butterfly x={132} y={772} size={0.8} color="#d4a0a7"/>
        </g>
        <g className="float-anim">
          <FloralRose x={540} y={790} size={1.3} color="#c9956c"/><FloralRose x={510} y={807} size={0.9} color="#d4a0a7"/>
          <BabyBreath x={555} y={812} size={0.9}/><Butterfly x={492} y={767} size={0.9} color="#e8b4b8"/>
        </g>
        {/* Floating hearts */}
        <HeartOutline x={180} y={120} size={1.2} color="#c9956c" opacity={0.35}/>
        <HeartOutline x={415} y={100} size={0.9} color="#d4a0a7" opacity={0.3}/>
        <HeartOutline x={80}  y={420} size={0.8} color="#c9956c" opacity={0.25}/>
        <HeartOutline x={515} y={430} size={1.0} color="#d4a0a7" opacity={0.25}/>
        {/* Sparkles */}
        <Sparkle x={162} y={80} size={0.7} color="#d4a847"/>
        <MiniSparkle x={202} y={60} color="#f5d98b"/>
        <Sparkle x={430} y={76} size={0.6} color="#d4a847"/>
        <MiniSparkle x={462} y={56} color="#f5d98b"/>
        <Sparkle x={40}  y={400} size={0.5} color="#d4a847"/>
        <Sparkle x={556} y={382} size={0.6} color="#d4a847"/>
        <MiniSparkle x={300} y={50} color="#f5d98b"/>
      </svg>

      {/* Photo — put your image at public/photo1.jpg */}
      <div style={{
        width:185,height:185,borderRadius:'50%',
        background:'linear-gradient(135deg, rgba(217,175,185,0.22) 0%, rgba(255,245,250,0.5) 50%, rgba(217,175,185,0.18) 100%)',
        border:'2.5px solid rgba(201,149,108,0.5)',
        display:'flex',alignItems:'center',justifyContent:'center',position:'relative',
        marginBottom:26, animation:'pulse-glow 3s ease-in-out infinite',
        boxShadow:'0 0 40px rgba(183,110,121,0.3), inset 0 0 30px rgba(255,255,255,0.2)',
      }}>
        <div style={{ position:'absolute',inset:-6,borderRadius:'50%',border:'1px solid rgba(212,168,71,0.35)'}}/>
        <div style={{ position:'absolute',inset:-14,borderRadius:'50%',border:'1px dashed rgba(212,168,71,0.2)'}}/>
        <SmartPhoto src="/photo1.jpg" shape="circle" width={178} height={178}
          placeholder={<div style={{ textAlign:'center' }}>
            <div style={{ fontSize:38,marginBottom:4 }}>📸</div>
            <div style={{ fontFamily:'Poppins,sans-serif',fontSize:9,color:'rgba(140,80,100,0.65)',
              fontWeight:300,letterSpacing:'0.12em',textTransform:'uppercase',
            }}>Your Photo Here</div>
          </div>}
        />
      </div>

      {/* Heading */}
      <h1 style={{ fontFamily:"'Great Vibes',cursive",fontSize:66,color:'#8b3a52',
        margin:'0 0 2px',lineHeight:1.15,textShadow:'0 2px 24px rgba(139,58,82,0.25)',textAlign:'center',
      }}>Happy Girlfriend's Day</h1>
      <span style={{ fontSize:40,display:'block',textAlign:'center',marginBottom:10 }}>❤️</span>

      {/* Divider */}
      <div style={{ display:'flex',alignItems:'center',gap:14,margin:'0 0 12px' }}>
        <div style={{ height:1,width:64,background:'linear-gradient(90deg,transparent,rgba(201,149,108,0.6))'}}/>
        <svg width="18" height="16" viewBox="0 0 18 16">
          <path d="M9 15 C7 12 1 10 1 5.5 C1 3 3 1 5.5 1 C7 1 8.2 1.9 9 2.8 C9.8 1.9 11 1 12.5 1 C15 1 17 3 17 5.5 C17 10 11 12 9 15Z" fill="#c9956c" opacity="0.85"/>
        </svg>
        <div style={{ height:1,width:64,background:'linear-gradient(90deg,rgba(201,149,108,0.6),transparent)'}}/>
      </div>

      {/* Subheading */}
      <div style={{ fontFamily:"'Playfair Display',serif",fontSize:26,color:'#8b3a52',
        fontStyle:'italic',letterSpacing:'0.06em',marginBottom:6,
        textShadow:'0 1px 12px rgba(139,58,82,0.15)',textAlign:'center',
      }}>To My Forever Twinkle ✨</div>

      <TogetherSince/>

      <div style={{ height:16 }}/>

      {/* Quote */}
      <div style={{
        background:'rgba(255,255,255,0.22)',backdropFilter:'blur(16px)',
        border:'1px solid rgba(201,149,108,0.3)',borderRadius:16,
        padding:'18px 32px',maxWidth:390,
        boxShadow:'0 8px 32px rgba(139,58,82,0.08), inset 0 1px 0 rgba(255,255,255,0.5)',
      }}>
        <p style={{ fontFamily:"'Lora',serif",fontSize:15,fontStyle:'italic',
          color:'#7a4050',margin:0,lineHeight:1.75,letterSpacing:'0.02em',textAlign:'center',
        }}>
          "Every love story is beautiful,<br/>but ours is my favorite."
        </p>
      </div>
    </div>
  )
}

// ─── Inside Page 1 ────────────────────────────────────────────────────────────

function InsidePage1() {
  const letter = `Twinkle...

Kuch rishte aur pyaar itna special hota hai na ki unhe shabdon me bayaan karna mushkil hota hai.... 💯❤️

Aap mere liye sirf important nahi ho, aap is poori duniya me mere liye sabse khaas ho betuuu... 🫂💗

Pata nahi kyu par aap se baatein karke aur aapka wo pyaara sa masoom chehra dekh kar dil ko jo sukoon milta hai na, wo kahi aur mil hi nahi sakta aap ke pyaruu ko...

Mai khud ko bohot lucky manta hun ki aap jaisi pyaari, masoom aur nakhreli rani sahiba meri life me aayi hai.... 🥰🫀

Aap mere liye sabse bada aur sabse best tohfa ho mere betuuu! 🎁❤️

Thankuuu aap ke un saari shararato, nakhro, ka aur dher saare pyaar ke liye bas aisee hi hamesh rahna kabhi bhi khud ko mat badalna aap jaise bhi ho best ho betuuu..

Jab aap itne haq se bolti ho na ki "My Man" aur pyaruu par itna andha trust karti ho... 🙈 sach me mera dil vahi pighal jata hain 🥰✨

Mujhe pata hai mai kabhi-kabhi meri Twinkle ko pareshan bhi kar deta hun, ya aapki safety ko lekar thoda zyada tok deta hun, bas aap bache ki parwah samajh kar maaf kar diya karooo betuu but kabhi bhi mere pyaruu aap se dur nahi hoga chahe kitni hi ladaai ho jayee.... 😜

Ladaai jhagda toh chalta rahega par un ladaai main bhi pyarr hota hain bas aap hamesha meri Twinkle rahoge aur mai hamesha aapka Kanu rahunga... 🫂💗

Aap mere liye kya ho, ye bas mera dil janta hai aur isko mai bayaan nahi kar sakta.

Duniya chahe jo soche, meri Twinkle mere liye best, best, best hai aur hamesha rahegi.

Aapki har smile par 100% haq sirf mera hai. 💯💋`

  const timeline=[
    { icon:'💬', label:'First Conversation' },
    { icon:'😊', label:'First Smile'        },
    { icon:'❤️', label:'Fell In Love'       },
    { icon:'🫂', label:'Beautiful Memories' },
    { icon:'♾',  label:'Forever Together'   },
  ]

  return (
    <div style={{
      width:'100%',height:'100%',
      background:'linear-gradient(160deg,#fdf0f3 0%,#fff9f6 35%,#fdf4f7 65%,#fff8f5 100%)',
      display:'flex',overflow:'hidden',position:'relative',
    }}>
      <div style={{ position:'absolute',inset:0,pointerEvents:'none',
        background:'radial-gradient(ellipse at 15% 50%, rgba(217,175,185,0.15) 0%, transparent 50%), radial-gradient(ellipse at 85% 30%, rgba(201,149,108,0.1) 0%, transparent 50%)',
      }}/>
      <svg style={{ position:'absolute',inset:0,width:'100%',height:'100%',pointerEvents:'none' }} viewBox="0 0 595 842" preserveAspectRatio="none">
        <defs>
          <linearGradient id="divG" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="transparent"/><stop offset="30%" stopColor="#c9956c"/>
            <stop offset="70%" stopColor="#c9956c"/><stop offset="100%" stopColor="transparent"/>
          </linearGradient>
        </defs>
        <g className="float-anim-slow">
          <FloralRose x={28} y={80}  size={0.9} color="#d4a0a7" opacity={0.55}/>
          <FloralRose x={28} y={420} size={0.7} color="#c9956c" opacity={0.4}/>
          <FloralRose x={28} y={760} size={0.8} color="#d4a0a7" opacity={0.5}/>
        </g>
        <g className="float-anim">
          <FloralRose x={567} y={100} size={0.8} color="#c9956c" opacity={0.5}/>
          <FloralRose x={570} y={450} size={0.7} color="#d4a0a7" opacity={0.4}/>
          <FloralRose x={560} y={782} size={0.9} color="#c9956c" opacity={0.5}/>
        </g>
        <Butterfly x={280} y={28}  size={0.7} color="#d4a0a7" opacity={0.5}/>
        <Butterfly x={310} y={812} size={0.6} color="#c9956c" opacity={0.4}/>
        <Sparkle x={48} y={200}  size={0.5} color="#d4a847"/>
        <MiniSparkle x={540} y={300} color="#f5d98b"/>
        <HeartOutline x={290} y={58} size={0.75} color="#c9956c" opacity={0.28}/>
        <line x1="268" y1="40" x2="268" y2="802" stroke="url(#divG)" strokeWidth="0.8" opacity="0.4"/>
      </svg>

      {/* LEFT */}
      <div style={{ width:'45%',padding:'36px 22px 36px 34px',display:'flex',flexDirection:'column',alignItems:'center',position:'relative',zIndex:2 }}>
        {/* Photo frame */}
        <div style={{ position:'relative',marginBottom:18 }}>
          <div style={{ position:'absolute',inset:-12,borderRadius:26,
            background:'radial-gradient(ellipse, rgba(183,110,121,0.22) 0%, transparent 70%)',filter:'blur(14px)',
          }}/>
          <div style={{
            width:202,height:224,borderRadius:22,
            background:'linear-gradient(145deg, rgba(255,248,250,0.92), rgba(253,240,245,0.97))',
            border:'2px solid rgba(201,149,108,0.45)',
            boxShadow:'0 22px 64px rgba(139,58,82,0.15), 0 4px 20px rgba(139,58,82,0.08), inset 0 1px 0 rgba(255,255,255,0.8)',
            display:'flex',alignItems:'center',justifyContent:'center',position:'relative',overflow:'hidden',
          }}>
            <div style={{ position:'absolute',inset:7,borderRadius:15,border:'1px dashed rgba(212,168,71,0.32)'}}/>
            <svg style={{ position:'absolute',inset:0,width:'100%',height:'100%',pointerEvents:'none' }} viewBox="0 0 202 224">
              <FloralRose x={18} y={18}  size={0.7} color="#d4a0a7" opacity={0.7}/>
              <FloralRose x={184} y={18}  size={0.65} color="#c9956c" opacity={0.65}/>
              <FloralRose x={18}  y={206} size={0.65} color="#c9956c" opacity={0.65}/>
              <FloralRose x={184} y={206} size={0.7} color="#d4a0a7" opacity={0.7}/>
              <Sparkle x={101} y={12}  size={0.45} color="#d4a847"/>
              <HeartOutline x={101} y={213} size={0.7} color="#c9956c" opacity={0.38}/>
            </svg>
            <SmartPhoto src="/photo2.jpg" shape="rounded" width={192} height={214}
              placeholder={<div style={{ textAlign:'center',zIndex:1 }}>
                <div style={{ fontSize:44,marginBottom:6 }}>📸</div>
                <div style={{ fontFamily:'Poppins,sans-serif',fontSize:9,color:'rgba(140,80,100,0.6)',
                  letterSpacing:'0.12em',textTransform:'uppercase',fontWeight:300,
                }}>Add Your Photo</div>
              </div>}
            />
          </div>
          <div style={{ position:'absolute',top:-10,right:-22 }} className="drift-anim">
            <svg width="38" height="32" viewBox="-18 -15 36 30"><Butterfly x={0} y={0} size={0.85} color="#d4a0a7"/></svg>
          </div>
          <div style={{ position:'absolute',bottom:8,left:-24 }} className="drift-delay">
            <svg width="32" height="26" viewBox="-16 -13 32 26"><Butterfly x={0} y={0} size={0.75} color="#c9956c"/></svg>
          </div>
        </div>

        <div style={{ fontFamily:"'Great Vibes',cursive",fontSize:28,color:'#8b3a52',marginBottom:22,textAlign:'center' }}>
          Our Beautiful Journey ❤️
        </div>

        {/* Timeline */}
        <div style={{ display:'flex',flexDirection:'column',alignItems:'center',gap:0 }}>
          {timeline.map((item,i)=>(
            <div key={i} style={{ display:'flex',flexDirection:'column',alignItems:'center' }}>
              <div style={{
                background:'rgba(255,255,255,0.58)',backdropFilter:'blur(8px)',
                border:'1px solid rgba(201,149,108,0.3)',borderRadius:40,
                padding:'7px 18px',display:'flex',alignItems:'center',gap:8,
                boxShadow:'0 4px 16px rgba(139,58,82,0.07)',minWidth:152,justifyContent:'center',
              }}>
                <span style={{ fontSize:14 }}>{item.icon}</span>
                <span style={{ fontFamily:"'Lora',serif",fontSize:12,color:'#7a4050',fontStyle:'italic' }}>{item.label}</span>
              </div>
              {i<timeline.length-1 && (
                <div style={{ display:'flex',flexDirection:'column',alignItems:'center',padding:'2px 0' }}>
                  <div style={{ width:1,height:8,background:'rgba(201,149,108,0.5)'}}/>
                  <span style={{ fontSize:10,color:'rgba(201,149,108,0.7)' }}>↓</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT */}
      <div style={{ width:'55%',padding:'36px 34px 36px 26px',overflowY:'auto',position:'relative',zIndex:2,display:'flex',flexDirection:'column' }}>
        <h2 style={{ fontFamily:"'Great Vibes',cursive",fontSize:48,color:'#8b3a52',margin:'0 0 6px',lineHeight:1.2,textShadow:'0 2px 12px rgba(139,58,82,0.15)' }}>
          To My Twinkle ❤️
        </h2>
        <div style={{ height:1,background:'linear-gradient(90deg,rgba(201,149,108,0.5),transparent)',marginBottom:14 }}/>
        <p style={{ fontFamily:"'Playfair Display',serif",fontSize:16,fontStyle:'italic',color:'#9b5060',margin:'0 0 12px',letterSpacing:'0.03em' }}>
          Dear Twinkle,
        </p>
        <div style={{
          background:'rgba(255,255,255,0.18)',backdropFilter:'blur(12px)',
          border:'1px solid rgba(201,149,108,0.2)',borderRadius:16,
          padding:'20px 24px',flex:1,
          boxShadow:'0 8px 32px rgba(139,58,82,0.06), inset 0 1px 0 rgba(255,255,255,0.5)',
        }}>
          {letter.split('\n\n').map((para,i)=>(
            <p key={i} style={{ fontFamily:"'Lora',serif",fontSize:13,lineHeight:1.88,color:'#5c2d3a',margin:'0 0 12px',whiteSpace:'pre-wrap' }}>
              {para}
            </p>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Inside Page 2 ────────────────────────────────────────────────────────────

function InsidePage2() {
  const reasons=[
    'Your innocent smile','Your cute anger','Your caring nature','Your trust','Your late-night talks',
    'Your beautiful heart','Your endless support','Your cute nakhre','The peace I feel with you','Simply... You',
  ]
  return (
    <div style={{
      width:'100%',height:'100%',
      background:'linear-gradient(150deg,#fdf0f3 0%,#fff8f5 30%,#fdf4f7 60%,#fff9f0 100%)',
      overflowY:'auto',position:'relative',padding:'36px 44px',
    }}>
      <div style={{ position:'absolute',inset:0,pointerEvents:'none',
        background:'radial-gradient(ellipse at 80% 20%, rgba(217,175,185,0.18) 0%, transparent 55%), radial-gradient(ellipse at 20% 80%, rgba(201,149,108,0.12) 0%, transparent 50%)',
      }}/>
      <svg style={{ position:'absolute',inset:0,width:'100%',height:'100%',pointerEvents:'none' }} viewBox="0 0 595 842" preserveAspectRatio="none">
        <g className="float-anim-slow">
          <FloralRose x={28} y={60} size={0.8} color="#d4a0a7" opacity={0.5}/>
          <FloralRose x={567} y={55} size={0.8} color="#c9956c" opacity={0.5}/>
        </g>
        <g className="float-anim-delay">
          <FloralRose x={25} y={790} size={0.7} color="#c9956c" opacity={0.45}/>
          <FloralRose x={570} y={785} size={0.8} color="#d4a0a7" opacity={0.5}/>
        </g>
        <Butterfly x={118} y={28} size={0.65} color="#d4a0a7" opacity={0.5}/>
        <Butterfly x={468} y={818} size={0.65} color="#c9956c" opacity={0.45}/>
        <Sparkle x={48}  y={400} size={0.5} color="#d4a847"/>
        <Sparkle x={544} y={352} size={0.45} color="#d4a847"/>
        <MiniSparkle x={290} y={24} color="#f5d98b"/>
        <HeartOutline x={297} y={38} size={0.8} color="#c9956c" opacity={0.28}/>
      </svg>

      <div style={{ position:'relative',zIndex:2 }}>
        <div style={{ textAlign:'center',marginBottom:28 }}>
          <h2 style={{ fontFamily:"'Great Vibes',cursive",fontSize:52,color:'#8b3a52',margin:'0 0 6px',lineHeight:1.2 }}>
            10 Reasons Why I Love You ❤️
          </h2>
          <div style={{ display:'flex',alignItems:'center',justifyContent:'center',gap:12 }}>
            <div style={{ height:1,width:80,background:'linear-gradient(90deg,transparent,rgba(201,149,108,0.5))'}}/>
            <svg width="14" height="12" viewBox="0 0 14 12">
              <path d="M7 11 C5.5 8.5 1 7 1 4 C1 2 2.5 1 4 1 C5.2 1 6.2 1.7 7 2.5 C7.8 1.7 8.8 1 10 1 C11.5 1 13 2 13 4 C13 7 8.5 8.5 7 11Z" fill="#c9956c" opacity="0.7"/>
            </svg>
            <div style={{ height:1,width:80,background:'linear-gradient(90deg,rgba(201,149,108,0.5),transparent)'}}/>
          </div>
        </div>

        <div style={{ display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:10,marginBottom:24 }}>
          {reasons.map((r,i)=>(
            <div key={i} style={{
              background:'rgba(255,255,255,0.25)',backdropFilter:'blur(12px)',
              border:'1px solid rgba(201,149,108,0.28)',borderRadius:16,
              padding:'14px 10px',textAlign:'center',
              boxShadow:'0 6px 24px rgba(139,58,82,0.08), inset 0 1px 0 rgba(255,255,255,0.6)',
              transition:'transform 0.2s, box-shadow 0.2s',cursor:'default',
              display:'flex',flexDirection:'column',alignItems:'center',gap:8,
            }}
              onMouseEnter={e=>{ const el=e.currentTarget as HTMLDivElement; el.style.transform='translateY(-5px)'; el.style.boxShadow='0 14px 40px rgba(139,58,82,0.18), inset 0 1px 0 rgba(255,255,255,0.7)' }}
              onMouseLeave={e=>{ const el=e.currentTarget as HTMLDivElement; el.style.transform='translateY(0)'; el.style.boxShadow='0 6px 24px rgba(139,58,82,0.08), inset 0 1px 0 rgba(255,255,255,0.6)' }}
            >
              <svg width="32" height="28" viewBox="0 0 32 28">
                <defs>
                  <linearGradient id={`hf${i}`} x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#e8b4b8" stopOpacity="0.7"/>
                    <stop offset="100%" stopColor="#c9956c" stopOpacity="0.5"/>
                  </linearGradient>
                </defs>
                <path d="M16 26 C12 20 2 16 2 8 C2 4 5 2 9 2 C12 2 14.5 3.5 16 5.5 C17.5 3.5 20 2 23 2 C27 2 30 4 30 8 C30 16 20 20 16 26Z" fill={`url(#hf${i})`} opacity="0.9"/>
                <path d="M16 26 C12 20 2 16 2 8 C2 4 5 2 9 2 C12 2 14.5 3.5 16 5.5 C17.5 3.5 20 2 23 2 C27 2 30 4 30 8 C30 16 20 20 16 26Z" fill="none" stroke="rgba(201,149,108,0.45)" strokeWidth="0.8"/>
              </svg>
              <span style={{ fontFamily:"'Lora',serif",fontSize:11,fontStyle:'italic',color:'#5c2d3a',lineHeight:1.4 }}>{r}</span>
            </div>
          ))}
        </div>

        {/* Quote */}
        <div style={{
          background:'rgba(255,255,255,0.2)',backdropFilter:'blur(20px)',
          border:'1px solid rgba(212,168,71,0.3)',borderRadius:20,
          padding:'22px 36px',textAlign:'center',marginBottom:20,
          boxShadow:'0 12px 40px rgba(139,58,82,0.1), inset 0 1px 0 rgba(255,255,255,0.6)',
          position:'relative',overflow:'hidden',
        }}>
          <p style={{ fontFamily:"'Playfair Display',serif",fontSize:15,fontStyle:'italic',color:'#7a4050',margin:0,lineHeight:1.78,letterSpacing:'0.02em' }}>
            "You are my peace, my happiness, my safest place<br/>and my forever home."
          </p>
        </div>

        {/* QR */}
        <div style={{ display:'flex',justifyContent:'center' }}>
          <div style={{
            background:'rgba(255,255,255,0.2)',backdropFilter:'blur(12px)',
            border:'1px solid rgba(201,149,108,0.3)',borderRadius:20,
            padding:'18px 28px',textAlign:'center',
            boxShadow:'0 8px 24px rgba(139,58,82,0.08)',
            display:'flex',flexDirection:'column',alignItems:'center',gap:10,
          }}>
            <div style={{ fontFamily:"'Playfair Display',serif",fontSize:16,color:'#8b3a52',fontWeight:600,letterSpacing:'0.04em' }}>Scan This ❤️</div>
            <div style={{
              width:88,height:88,
              background:'linear-gradient(135deg, rgba(255,248,250,0.8), rgba(253,240,245,0.9))',
              border:'2px dashed rgba(201,149,108,0.5)',borderRadius:12,
              display:'flex',alignItems:'center',justifyContent:'center',
            }}>
              <svg width="58" height="58" viewBox="0 0 60 60" opacity="0.32">
                <rect x="4"  y="4"  width="20" height="20" rx="2" fill="none" stroke="#8b3a52" strokeWidth="1.5"/>
                <rect x="8"  y="8"  width="12" height="12" rx="1" fill="#8b3a52"/>
                <rect x="36" y="4"  width="20" height="20" rx="2" fill="none" stroke="#8b3a52" strokeWidth="1.5"/>
                <rect x="40" y="8"  width="12" height="12" rx="1" fill="#8b3a52"/>
                <rect x="4"  y="36" width="20" height="20" rx="2" fill="none" stroke="#8b3a52" strokeWidth="1.5"/>
                <rect x="8"  y="40" width="12" height="12" rx="1" fill="#8b3a52"/>
                <rect x="36" y="36" width="4" height="4" rx="1" fill="#8b3a52"/>
                <rect x="42" y="36" width="4" height="4" rx="1" fill="#8b3a52"/>
                <rect x="48" y="36" width="8" height="4" rx="1" fill="#8b3a52"/>
                <rect x="36" y="42" width="8" height="4" rx="1" fill="#8b3a52"/>
                <rect x="46" y="42" width="10" height="4" rx="1" fill="#8b3a52"/>
                <rect x="36" y="48" width="4" height="8" rx="1" fill="#8b3a52"/>
                <rect x="42" y="50" width="8" height="6" rx="1" fill="#8b3a52"/>
                <rect x="52" y="48" width="4" height="8" rx="1" fill="#8b3a52"/>
              </svg>
            </div>
            <p style={{ fontFamily:"'Lora',serif",fontSize:11,fontStyle:'italic',color:'#9b6070',margin:0 }}>
              One more surprise is waiting for you...
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Back Cover ───────────────────────────────────────────────────────────────

// ─── Love Countdown ────────────────────────────────────────────────────────────
// Counts down to the next Girlfriend's Day (Aug 1). To count down to a
// different date instead (e.g. your anniversary), just change the line below:
//   return new Date(2026, 7, 14)   // month is 0-indexed, so 7 = August
function getCountdownTarget(): Date {
  const now = new Date()
  let year = now.getFullYear()
  const aug1ThisYear = new Date(year, 7, 1, 0, 0, 0)
  if (now.getTime() > aug1ThisYear.getTime()) year += 1
  return new Date(year, 7, 1, 0, 0, 0)
}

function LoveCountdown() {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  const target = getCountdownTarget()
  const diff = Math.max(0, target.getTime() - now.getTime())
  const days    = Math.floor(diff / 86400000)
  const hours   = Math.floor((diff % 86400000) / 3600000)
  const minutes = Math.floor((diff % 3600000) / 60000)
  const seconds = Math.floor((diff % 60000) / 1000)

  const Box = ({ value, label }: { value: number; label: string }) => (
    <div style={{
      background:'rgba(255,255,255,0.5)', borderRadius:12, padding:'8px 4px', minWidth:52,
      border:'1px solid rgba(201,149,108,0.3)',
    }}>
      <div style={{ fontFamily:"'Playfair Display',serif", fontSize:20, fontWeight:700, color:'#8b3a52' }}>
        {String(value).padStart(2,'0')}
      </div>
      <div style={{ fontFamily:'Poppins,sans-serif', fontSize:8, color:'rgba(122,64,80,0.6)', letterSpacing:'0.08em', textTransform:'uppercase' }}>
        {label}
      </div>
    </div>
  )

  return (
    <div style={{
      background:'rgba(255,255,255,0.15)',backdropFilter:'blur(12px)',
      border:'1px solid rgba(212,168,71,0.3)',borderRadius:20,
      padding:'18px 20px',marginBottom:26,
      boxShadow:'0 8px 32px rgba(139,58,82,0.08)',
    }}>
      <p style={{ fontFamily:'Poppins,sans-serif',fontSize:9,color:'rgba(122,64,80,0.65)',
        letterSpacing:'0.1em',textTransform:'uppercase',margin:'0 0 10px',
      }}>
        💕 Next Girlfriend's Day mein baaki hai
      </p>
      <div style={{ display:'flex', gap:8, justifyContent:'center' }}>
        <Box value={days} label="Din"/><Box value={hours} label="Ghante"/>
        <Box value={minutes} label="Min"/><Box value={seconds} label="Sec"/>
      </div>
    </div>
  )
}

function BackCover() {
  return (
    <div style={{
      width:'100%',height:'100%',
      background:'linear-gradient(145deg,#fdf0f3 0%,#fff9f6 25%,#fdf4f7 50%,#fff8f0 75%,#fdf0f3 100%)',
      display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',
      position:'relative',overflow:'hidden',textAlign:'center',
    }}>
      <div style={{ position:'absolute',inset:0,pointerEvents:'none',
        background:'radial-gradient(ellipse at 50% 30%, rgba(217,175,185,0.22) 0%, transparent 60%), radial-gradient(ellipse at 50% 80%, rgba(201,149,108,0.15) 0%, transparent 55%)',
      }}/>
      {[[10,15,80],[85,12,70],[20,85,90],[78,82,75],[50,8,50],[50,92,55]].map(([lx,ly,s],i)=>(
        <div key={i} style={{ position:'absolute',left:`${lx}%`,top:`${ly}%`,
          width:s,height:s,borderRadius:'50%',
          background:'radial-gradient(circle, rgba(212,168,71,0.5) 0%, transparent 70%)',
          opacity:0.08,filter:'blur(18px)',transform:'translate(-50%,-50%)',
        }}/>
      ))}
      <svg style={{ position:'absolute',inset:0,width:'100%',height:'100%',pointerEvents:'none' }} viewBox="0 0 595 842" preserveAspectRatio="none">
        <defs>
          <linearGradient id="gb1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#c9956c"/><stop offset="50%" stopColor="#f5d98b"/><stop offset="100%" stopColor="#c9956c"/>
          </linearGradient>
        </defs>
        <rect x="20" y="20" width="555" height="802" rx="8" fill="none" stroke="url(#gb1)" strokeWidth="1.5" opacity="0.45"/>
        <rect x="30" y="30" width="535" height="782" rx="6" fill="none" stroke="rgba(201,149,108,0.22)" strokeWidth="0.7"/>
        {([[36,36,0],[559,36,90],[559,806,180],[36,806,270]] as [number,number,number][]).map(([cx,cy,rot],i)=>(
          <g key={i} transform={`translate(${cx},${cy}) rotate(${rot})`}>
            <path d="M0 0 L22 0 M0 0 L0 22" stroke="url(#gb1)" strokeWidth="1.5" opacity="0.65"/>
            <circle cx="0" cy="0" r="2.5" fill="#d4a847" opacity="0.75"/>
          </g>
        ))}
        <g className="float-anim-slow">
          <FloralRose x={80}  y={80}  size={1.2} color="#d4a0a7"/><FloralRose x={50}  y={110} size={0.9} color="#c9956c"/>
          <FloralRose x={115} y={60}  size={0.85} color="#e8b4b8"/><BabyBreath x={90}  y={45} size={1.0}/>
          <Butterfly x={145} y={56} size={0.85} color="#d4a0a7"/>
        </g>
        <g className="float-anim">
          <FloralRose x={515} y={78}  size={1.1} color="#c9956c"/><FloralRose x={550} y={110} size={0.9} color="#d4a0a7"/>
          <BabyBreath x={540} y={45} size={0.9}/><Butterfly x={482} y={60} size={0.8} color="#e8b4b8"/>
        </g>
        <g className="float-anim-delay">
          <FloralRose x={70}  y={762} size={1.0} color="#d4a0a7"/><FloralRose x={105} y={792} size={0.85} color="#c9956c"/>
          <BabyBreath x={80}  y={802} size={0.85}/>
        </g>
        <g className="float-anim">
          <FloralRose x={526} y={762} size={1.0} color="#c9956c"/><FloralRose x={556} y={794} size={0.8} color="#d4a0a7"/>
          <BabyBreath x={540} y={802} size={0.8}/>
        </g>
        <Sparkle x={200} y={90}  size={0.6} color="#d4a847"/>
        <MiniSparkle x={252} y={70} color="#f5d98b"/>
        <Sparkle x={380} y={85}  size={0.55} color="#d4a847"/>
        <MiniSparkle x={345} y={68} color="#f0c060"/>
        <Sparkle x={48}  y={421} size={0.5} color="#d4a847"/>
        <Sparkle x={548} y={440} size={0.5} color="#d4a847"/>
        <HeartOutline x={180} y={200} size={0.8} color="#c9956c" opacity={0.22}/>
        <HeartOutline x={415} y={180} size={0.7} color="#d4a0a7" opacity={0.2}/>
        <HeartOutline x={300} y={130} size={1.0} color="#c9956c" opacity={0.18}/>
      </svg>

      <div style={{ position:'relative',zIndex:10,padding:'0 56px',maxWidth:530 }}>
        {/* Message */}
        <div style={{
          background:'rgba(255,255,255,0.2)',backdropFilter:'blur(18px)',
          border:'1px solid rgba(201,149,108,0.28)',borderRadius:24,
          padding:'32px 36px',marginBottom:30,
          boxShadow:'0 20px 60px rgba(139,58,82,0.1), inset 0 1px 0 rgba(255,255,255,0.6)',
        }}>
          <p style={{ fontFamily:"'Playfair Display',serif",fontSize:14,fontStyle:'italic',color:'#7a3a4a',lineHeight:1.9,margin:'0 0 6px' }}>
            Aur haa Twinkle...
          </p>
          <p style={{ fontFamily:"'Playfair Display',serif",fontSize:14,fontStyle:'italic',color:'#7a3a4a',lineHeight:1.9,margin:'0 0 16px' }}>
            Happy Girlfriend's Day meri jaan, meri rani sahiba, meri Twinkleee, mere bacche, meri pookieeeee, meri rasmalai, meri jaaneman, sweetheartttt, babuuuu, kuchhupuchuuuu, bas aise hi mere sath rahena hamesha hamesh betuuu...
          </p>
          <p style={{ margin:0,fontSize:22,letterSpacing:2 }}>
            😜💞💕💓💖💝🩷👑🫀🫰🏻🤞🏻🤝🥹😚🫂🤌🏻🥰😍🔥
          </p>
        </div>

        {/* Countdown */}
        <LoveCountdown/>

        {/* Signature */}
        <div style={{
          background:'rgba(255,255,255,0.15)',backdropFilter:'blur(12px)',
          border:'1px solid rgba(212,168,71,0.3)',borderRadius:20,
          padding:'22px 32px',marginBottom:26,
          boxShadow:'0 8px 32px rgba(139,58,82,0.08)',
        }}>
          <p style={{ fontFamily:"'Playfair Display',serif",fontSize:14,color:'#9b6070',fontStyle:'italic',margin:'0 0 2px' }}>
            Forever Yours,
          </p>
          <div style={{ fontFamily:"'Great Vibes',cursive",fontSize:54,color:'#8b3a52',lineHeight:1.2,textShadow:'0 2px 16px rgba(139,58,82,0.22)' }}>
            Kanu ❤️
          </div>
        </div>

        {/* Footer */}
        <div style={{ display:'flex',alignItems:'center',justifyContent:'center',gap:14 }}>
          <div style={{ height:1,width:50,background:'linear-gradient(90deg,transparent,rgba(201,149,108,0.4))'}}/>
          <p style={{ fontFamily:"'Lora',serif",fontSize:11,fontStyle:'italic',color:'rgba(122,64,80,0.6)',margin:0,letterSpacing:'0.04em' }}>
            "Every heartbeat of mine belongs to you."
          </p>
          <div style={{ height:1,width:50,background:'linear-gradient(90deg,rgba(201,149,108,0.4),transparent)'}}/>
        </div>
      </div>
    </div>
  )
}

// ─── Gallery panel ─────────────────────────────────────────────────────────────
// Drop numbered files (1.jpg, 2.jpg ... 20.jpg) inside public/gallery/ and each
// one appears automatically here. Missing numbers are simply skipped — no need
// to fill all 20 slots.
const GALLERY_COUNT = 20
const GALLERY_CAPTIONS = [
  'Mera favourite pal 💕', 'Tumhare saath har lamha khaas 🥰', 'Yeh smile hi toh sab kuch hai ✨',
  'I love you, Twinkle 💗', 'Yaadon ka sabse pyaara panna 📖', 'Forever & always 💍',
  'Tumhari aankhon ka jaadu 😍', 'Best memory ever 🎞️', 'Mera dil, hamesha tumhare naam ❤️',
  'Chhoti si baat, badi si khushi 🌸', 'Tumhare bina adhoora 🥺', 'My whole world 🌍💕',
]

function GalleryPhoto({ n }: { n: number }) {
  const [failed, setFailed] = useState(false)
  const [flipped, setFlipped] = useState(false)
  const rotations = [-4, 3, -2, 5, -3, 2, 4, -5]
  const rotate = rotations[n % rotations.length]
  const caption = GALLERY_CAPTIONS[n % GALLERY_CAPTIONS.length]

  if (failed) return null

  return (
    <div
      onClick={() => setFlipped(f => !f)}
      style={{
        aspectRatio:'1/1', cursor:'pointer', perspective:800,
        transform:`rotate(${rotate}deg)`,
      }}
    >
      <div style={{
        position:'relative', width:'100%', height:'100%',
        transition:'transform 0.6s cubic-bezier(0.4,0.2,0.2,1)',
        transformStyle:'preserve-3d',
        transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
      }}>
        {/* Front — the photo */}
        <div style={{
          position:'absolute', inset:0, backfaceVisibility:'hidden', WebkitBackfaceVisibility:'hidden',
          background:'#fff', padding:6, borderRadius:10,
          border:'1px solid rgba(201,149,108,0.35)',
          boxShadow:'0 8px 20px rgba(139,58,82,0.18)',
        }}>
          <div style={{ width:'100%', height:'100%', borderRadius:6, overflow:'hidden', background:'#f6e9ec' }}>
            <img
              src={`/gallery/${n}.jpg`} alt=""
              onError={() => setFailed(true)}
              style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }}
            />
          </div>
        </div>

        {/* Back — sweet caption, like writing on the back of a photo */}
        <div style={{
          position:'absolute', inset:0, backfaceVisibility:'hidden', WebkitBackfaceVisibility:'hidden',
          transform:'rotateY(180deg)',
          background:'linear-gradient(135deg,#8b3a52,#b76e79)',
          borderRadius:10, border:'1px solid rgba(212,168,71,0.4)',
          boxShadow:'0 8px 20px rgba(139,58,82,0.25)',
          display:'flex', alignItems:'center', justifyContent:'center',
          padding:8, textAlign:'center',
        }}>
          <p style={{
            fontFamily:"'Lora',serif", fontStyle:'italic', color:'#fff',
            fontSize:10, lineHeight:1.4, margin:0,
          }}>{caption}</p>
        </div>
      </div>
    </div>
  )
}

function Gallery() {
  return (
    <div style={{
      width:'100%',height:'100%',
      background:'linear-gradient(145deg,#fdf0f3 0%,#fff9f6 25%,#fdf4f7 50%,#fff8f0 75%,#fdf0f3 100%)',
      position:'relative',overflow:'hidden',
      display:'flex',flexDirection:'column',alignItems:'center',
      padding:'30px 26px',
    }}>
      <div style={{ position:'absolute',inset:0,
        background:'radial-gradient(ellipse at 15% 10%, rgba(217,175,185,0.18) 0%, transparent 55%), radial-gradient(ellipse at 85% 90%, rgba(201,149,108,0.14) 0%, transparent 55%)',
        pointerEvents:'none',
      }}/>

      <h2 style={{ fontFamily:"'Great Vibes',cursive",fontSize:42,color:'#8b3a52',margin:'0 0 2px',textAlign:'center' }}>
        Our Little Moments Twinkle
      </h2>
      <span style={{ fontSize:22,marginBottom:2 }}>📷💕</span>
      <p style={{ fontFamily:'Poppins,sans-serif',fontSize:9,color:'rgba(140,80,100,0.55)',
        letterSpacing:'0.06em',marginBottom:10,textAlign:'center',
      }}>
        Tap any photo to flip it ✨
      </p>

      <div style={{
        display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:14,
        width:'100%', maxWidth:520, overflowY:'auto', paddingBottom:12,
      }}>
        {Array.from({ length: GALLERY_COUNT }, (_, i) => (
          <GalleryPhoto key={i+1} n={i+1} />
        ))}
      </div>
    </div>
  )
}

// ─── Main App ─────────────────────────────────────────────────────────────────

// ─── Scratch & Reveal Love Coupons ──────────────────────────────────────────────
interface CouponType { title: string; emoji: string }
const COUPONS: CouponType[] = [
  { title: '1 Free Hug',              emoji: '🤗' },
  { title: 'Movie Night, My Treat',   emoji: '🎬' },
  { title: 'No Questions Pass',       emoji: '🙈' },
  { title: '1 Free kiss',       emoji: '🙈' },
  { title: 'Surprise Date Night',     emoji: '🌹' },
  { title: 'Aapke sath dance',   emoji: '💃' },
{ title: 'Aapke sath mandir', emoji: '🛕' },
{ title: 'Aapke sath har festival', emoji: '🎉' },
{ title: 'Aapke sath har subah', emoji: '🌞' },
{ title: 'Aapke sath har shaam', emoji: '🌙' },

]

function ScratchCard({ coupon }: { coupon: CouponType }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [revealed, setRevealed] = useState(false)
  const isDrawing = useRef(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const w = canvas.width, h = canvas.height
    const grad = ctx.createLinearGradient(0, 0, w, h)
    grad.addColorStop(0, '#c9956c'); grad.addColorStop(1, '#8b3a52')
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, w, h)
    ctx.fillStyle = 'rgba(255,255,255,0.9)'
    ctx.font = 'bold 22px sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('SCRATCH ME ✨', w / 2, h / 2)
  }, [])

  const scratch = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const x = (clientX - rect.left) * (canvas.width / rect.width)
    const y = (clientY - rect.top) * (canvas.height / rect.height)
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.globalCompositeOperation = 'destination-out'
    ctx.beginPath(); ctx.arc(x, y, 26, 0, Math.PI * 2); ctx.fill()
  }

  const checkRevealPercent = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data
    let cleared = 0, sampled = 0
    for (let i = 3; i < data.length; i += 4 * 15) { sampled++; if (data[i] === 0) cleared++ }
    if (cleared / sampled > 0.45) setRevealed(true)
  }

  const handleDown = (e: React.PointerEvent) => { isDrawing.current = true; scratch(e.clientX, e.clientY) }
  const handleMove = (e: React.PointerEvent) => { if (isDrawing.current) { scratch(e.clientX, e.clientY); checkRevealPercent() } }
  const handleUp = () => { isDrawing.current = false }

  return (
    <div style={{ position:'relative', width:'100%', aspectRatio:'5/3', borderRadius:14, overflow:'hidden', boxShadow:'0 8px 20px rgba(139,58,82,0.2)' }}>
      <div style={{ position:'absolute', inset:0, background:'#fff', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:8 }}>
        <div style={{ fontSize:28 }}>{coupon.emoji}</div>
        <div style={{ fontFamily:'Poppins,sans-serif', fontSize:11, fontWeight:600, color:'#8b3a52', textAlign:'center' }}>{coupon.title}</div>
      </div>
      {!revealed && (
        <canvas
          ref={canvasRef} width={300} height={180}
          style={{ position:'absolute', inset:0, width:'100%', height:'100%', cursor:'pointer', touchAction:'none' }}
          onPointerDown={handleDown} onPointerMove={handleMove} onPointerUp={handleUp} onPointerLeave={handleUp}
        />
      )}
    </div>
  )
}

function Coupons() {
  return (
    <div style={{
      width:'100%',height:'100%',
      background:'linear-gradient(145deg,#fdf0f3 0%,#fff9f6 50%,#fdf0f3 100%)',
      display:'flex',flexDirection:'column',alignItems:'center',
      padding:'30px 26px',overflow:'hidden',
    }}>
      <h2 style={{ fontFamily:"'Great Vibes',cursive",fontSize:40,color:'#8b3a52',margin:'0 0 2px',textAlign:'center' }}>Love Coupons</h2>
      <p style={{ fontFamily:'Poppins,sans-serif',fontSize:9,color:'rgba(140,80,100,0.55)',
        letterSpacing:'0.08em',textTransform:'uppercase',marginBottom:18,textAlign:'center',
      }}>Scratch karke reveal karein 🎟️</p>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(2, 1fr)', gap:16, width:'100%', maxWidth:420 }}>
        {COUPONS.map((c, i) => <ScratchCard key={i} coupon={c} />)}
      </div>
    </div>
  )
}

// ─── Love Quiz ───────────────────────────────────────────────────────────────────
// Edit the questions/options below to make it truly personal — put the correct
// answer's position (0, 1, 2...) in `correctIndex`.
interface QuizQ { q: string; options: string[]; correctIndex: number }
const QUIZ_QUESTIONS: QuizQ[] = [
  {
    q: 'Agar Pyaru kisi aur ladki se 10 minute baat kare to Twinkle...? 😏',
    options: ['Ignore 😌', 'Muh Tod Degi 😂', 'Breakup Kar Degi 😤'],
    correctIndex: 1,
  },
  {
    q: 'Twinkle agar bole "Main moti lag rahi hu?" to Pyaru...? 🤭',
    options: ['Haan 😂', 'Bilkul Nahi ❤️', 'Jaisi Bhi Ho, Meri Ho 🥹❤️'],
    correctIndex: 2,
  },
  {
    q: 'Agar Pyaru gusse main 5 din reply na kare to Twinkle...? 📱',
    options: ['chhood degi 😴', 'manane ki koshish😂', 'Dusra Pyaru Dhund Legi 🤣'],
    correctIndex: 1,
  },
  {
    q: 'Pehle "Sorry" kaun bolega? 😅',
    options: ['Pyaru ❤️', 'Twinkle ❤️', 'Jo Zyada Pyaar Karta Hai 🫶🏻'],
    correctIndex: 2,
  },
  {
    q: 'Agar sirf ek chocolate bachi ho...? 🍫',
    options: ['Pyaru Khayega 😋', 'Twinkle Khayegi 🤭', 'Half-Half ❤️'],
    correctIndex: 2,
  },
  {
    q: 'Sabse zyada jealous kaun hota hai? 😏',
    options: ['Pyaru 😂', 'Twinkle 😂', 'Dono 🤭❤️'],
    correctIndex: 2,
  },
  {
    q: 'Agar Pyaru bole "Ek Hug Chahiye"... 🤗',
    options: ['Mana Kar Dungi 😝', 'Thoda Tadpaungi 😂', 'Seedha Hug De Dungi ❤️'],
    correctIndex: 2,
  },
  {
    q: 'Pyaru ki favourite addiction kya hai? 😌',
    options: ['Phone 📱', 'Chocolate 🍫', 'Twinkle ❤️'],
    correctIndex: 2,
  },
  {
    q: 'Twinkle agar gussa ho jaye to Pyaru...? 😭',
    options: ['Bhag Jayega 😂', 'kiss kar ke manaye ❤️', 'chhod de 😴'],
    correctIndex: 1,
  },
  {
    q: 'Relationship mein sabse zyada drama kaun karta hai? 🤣',
    options: ['Pyaru 😂', 'Twinkle 😂', 'Dono Milke 🎭❤️'],
    correctIndex: 2,
  },
];

function LoveQuiz() {
  const [idx, setIdx] = useState(0)
  const [score, setScore] = useState(0)
  const [selected, setSelected] = useState<number|null>(null)
  const [done, setDone] = useState(false)

  const handleAnswer = (i: number) => {
    if (selected !== null) return
    setSelected(i)
    const correct = i === QUIZ_QUESTIONS[idx].correctIndex
    setTimeout(() => {
      if (correct) setScore(s => s + 1)
      if (idx < QUIZ_QUESTIONS.length - 1) { setIdx(idx + 1); setSelected(null) }
      else setDone(true)
    }, 700)
  }
  const restart = () => { setIdx(0); setScore(0); setSelected(null); setDone(false) }

  const resultMsg = score === QUIZ_QUESTIONS.length
    ? 'Wow! Aap mujhe pura jaanti ho 😍 Perfect Score!'
    : score >= QUIZ_QUESTIONS.length / 2
    ? 'Not bad! Thoda aur time saath bitate hain 😜'
    : 'Haha koi baat nahi, pyaar toh full hai na! 🥰'

  return (
    <div style={{
      width:'100%',height:'100%',
      background:'linear-gradient(145deg,#fdf0f3,#fff9f6)',
      display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',
      padding:'30px 30px',textAlign:'center',
    }}>
      <h2 style={{ fontFamily:"'Great Vibes',cursive",fontSize:38,color:'#8b3a52',margin:'0 0 16px' }}>How Well You Know Me?</h2>
      {!done ? (
        <>
          <p style={{ fontFamily:'Poppins,sans-serif',fontSize:9,color:'rgba(140,80,100,0.5)',
            letterSpacing:'0.08em',textTransform:'uppercase',marginBottom:6,
          }}>Question {idx+1} / {QUIZ_QUESTIONS.length}</p>
          <p style={{ fontFamily:"'Playfair Display',serif",fontSize:16,color:'#7a3a4a',marginBottom:20,maxWidth:320 }}>
            {QUIZ_QUESTIONS[idx].q}
          </p>
          <div style={{ display:'flex',flexDirection:'column',gap:10,width:'100%',maxWidth:280 }}>
            {QUIZ_QUESTIONS[idx].options.map((opt, i) => (
              <button key={i} onClick={() => handleAnswer(i)} disabled={selected!==null} style={{
                padding:'12px 16px', borderRadius:14, border:'1px solid rgba(201,149,108,0.4)',
                background: selected===null ? 'rgba(255,255,255,0.5)'
                  : i === QUIZ_QUESTIONS[idx].correctIndex ? 'rgba(140,200,140,0.45)'
                  : i === selected ? 'rgba(220,120,120,0.4)' : 'rgba(255,255,255,0.3)',
                fontFamily:'Poppins,sans-serif', fontSize:13, color:'#7a3a4a', cursor:'pointer',
              }}>{opt}</button>
            ))}
          </div>
        </>
      ) : (
        <>
          <div style={{ fontSize:44,marginBottom:12 }}>🏆</div>
          <p style={{ fontFamily:"'Playfair Display',serif",fontSize:16,color:'#7a3a4a',marginBottom:8 }}>
            Score: {score} / {QUIZ_QUESTIONS.length}
          </p>
          <p style={{ fontFamily:'Poppins,sans-serif',fontSize:13,color:'#8b3a52',marginBottom:20,maxWidth:280 }}>{resultMsg}</p>
          <button onClick={restart} style={{
            background:'linear-gradient(135deg,#b76e79,#d4a0a7)',border:'none',borderRadius:30,
            padding:'10px 24px',color:'#fff',fontFamily:'Poppins,sans-serif',fontSize:13,cursor:'pointer',
          }}>Try Again 🔄</button>
        </>
      )}
    </div>
  )
}

const panels = [
  { id:'front',   label:'Front Cover',   emoji:'💌', component: FrontCover   },
  { id:'inside1', label:'Inside Left',   emoji:'💌', component: InsidePage1  },
  { id:'inside2', label:'Inside Right',  emoji:'💌', component: InsidePage2  },
  { id:'gallery', label:'Gallery',       emoji:'💕', component: Gallery      },
  { id:'coupons', label:'Coupons',       emoji:'🎟️', component: Coupons     },
  { id:'quiz',    label:'Quiz',          emoji:'❓', component: LoveQuiz    },
  { id:'back',    label:'Back Cover',    emoji:'💌', component: BackCover    },
]

// ─── Lock Screen ───────────────────────────────────────────────────────────────
// Change CORRECT_PIN below to any 4-digit code you like (e.g. your special
// date as DDMM) — that's what needs to be typed in to unlock the card.
const CORRECT_PIN = '1707'

function LockScreen({ onUnlock }: { onUnlock: () => void }) {
  const [pin, setPin] = useState('')
  const [error, setError] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (pin === CORRECT_PIN) {
      onUnlock()
    } else {
      setError(true)
      setPin('')
      setTimeout(() => setError(false), 1200)
    }
  }

  return (
    <div style={{ minHeight:'100vh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:20, textAlign:'center' }}>
      <div style={{ fontSize:48, marginBottom:12, animation: error ? 'shake 0.4s ease' : undefined }}>🔒</div>
      <h1 style={{ fontFamily:"'Great Vibes',cursive", fontSize:44, color:'#e8849a', margin:'0 0 6px' }}>For Twinkle</h1>
      <p style={{ fontFamily:'Poppins,sans-serif', fontSize:12, color:'rgba(240,200,208,0.6)', marginBottom:24, maxWidth:260 }}>
        Hamari khaas date daalo (DDMM format) card kholne ke liye 💕
      </p>
      <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:14 }}>
        <input
          type="tel" inputMode="numeric" maxLength={4} value={pin} autoFocus
          onChange={e => setPin(e.target.value.replace(/\D/g,''))}
          placeholder="••••"
          style={{
            width:160, textAlign:'center', fontSize:28, letterSpacing:12,
            padding:'12px 0', borderRadius:14, border:'1px solid rgba(201,149,108,0.4)',
            background:'rgba(255,255,255,0.08)', color:'#fff', outline:'none',
          }}
        />
        {error && <p style={{ color:'#e88899', fontSize:12, margin:0, fontFamily:'Poppins,sans-serif' }}>Galat code, dobara try karein 💔</p>}
        <button type="submit" style={{
          background:'linear-gradient(135deg,#b76e79,#d4a0a7)', border:'none', borderRadius:30,
          padding:'10px 28px', color:'#fff', fontFamily:'Poppins,sans-serif', fontSize:14, cursor:'pointer', fontWeight:500,
        }}>Unlock 🔓</button>
      </form>
    </div>
  )
}

// ─── Envelope opening intro ─────────────────────────────────────────────────────
function EnvelopeIntro({ onOpen }: { onOpen: () => void }) {
  const [opening, setOpening] = useState(false)
  const handleClick = () => { setOpening(true); setTimeout(onOpen, 850) }

  return (
    <div
      onClick={handleClick}
      style={{ minHeight:'100vh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', cursor:'pointer' }}
    >
      <div style={{
        width:220, height:150, position:'relative',
        transform: opening ? 'scale(1.15) rotate(-4deg)' : 'scale(1)',
        opacity: opening ? 0 : 1,
        transition:'all 0.85s ease',
      }}>
        <div style={{ position:'absolute', inset:0, background:'linear-gradient(135deg,#f5e3d3,#fff9f2)', borderRadius:8, boxShadow:'0 20px 50px rgba(0,0,0,0.5)' }}/>
        <div style={{
          position:'absolute', top:0, left:0, width:'100%', height:'100%',
          clipPath:'polygon(0 0, 50% 55%, 100% 0)',
          background:'linear-gradient(135deg,#e8c8ac,#f5e3d3)',
        }}/>
        <div style={{
          position:'absolute', top:'42%', left:'50%', transform:'translate(-50%,-50%)',
          width:44, height:44, borderRadius:'50%',
          background:'radial-gradient(circle,#c9424f,#8b2030)',
          display:'flex', alignItems:'center', justifyContent:'center',
          fontSize:20, boxShadow:'0 4px 10px rgba(0,0,0,0.4)',
        }}>💌</div>
      </div>
      <p style={{ fontFamily:'Poppins,sans-serif', fontSize:12, color:'rgba(240,200,208,0.7)', marginTop:24, letterSpacing:'0.1em', textTransform:'uppercase' }}>
        Tap to open ✨
      </p>
    </div>
  )
}

// ─── Confetti burst ─────────────────────────────────────────────────────────────
function ConfettiOverlay({ trigger }: { trigger: number }) {
  const [hearts, setHearts] = useState<{ id:number; left:number; delay:number; size:number; emoji:string }[]>([])

  useEffect(() => {
    if (trigger === 0) return
    const emojis = ['💕','❤️','💖','✨','💗']
    const newHearts = Array.from({ length: 26 }, (_, i) => ({
      id: Date.now() + i,
      left: Math.random() * 100,
      delay: Math.random() * 0.5,
      size: 16 + Math.random() * 20,
      emoji: emojis[Math.floor(Math.random() * emojis.length)],
    }))
    setHearts(newHearts)
    const t = setTimeout(() => setHearts([]), 3000)
    return () => clearTimeout(t)
  }, [trigger])

  if (hearts.length === 0) return null
  return (
    <div style={{ position:'fixed', inset:0, pointerEvents:'none', zIndex:9999, overflow:'hidden' }}>
      {hearts.map(h => (
        <span key={h.id} style={{
          position:'absolute', left:`${h.left}%`, top:-40, fontSize:h.size,
          animation:`confetti-fall 2.5s ease-in ${h.delay}s forwards`,
        }}>{h.emoji}</span>
      ))}
    </div>
  )
}

// ─── Touch Heart Trail ──────────────────────────────────────────────────────────
function HeartTrail() {
  const [trail, setTrail] = useState<{ id:number; x:number; y:number }[]>([])
  const lastSpawn = useRef(0)
  const nextId = useRef(0)

  useEffect(() => {
    const spawn = (x: number, y: number) => {
      const t = Date.now()
      if (t - lastSpawn.current < 90) return
      lastSpawn.current = t
      const id = ++nextId.current
      setTrail(prev => [...prev.slice(-14), { id, x, y }])
      setTimeout(() => setTrail(prev => prev.filter(h => h.id !== id)), 900)
    }
    const onMove = (e: MouseEvent) => spawn(e.clientX, e.clientY)
    const onTouch = (e: TouchEvent) => { const t = e.touches[0]; if (t) spawn(t.clientX, t.clientY) }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('touchmove', onTouch)
    return () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('touchmove', onTouch) }
  }, [])

  return (
    <div style={{ position:'fixed', inset:0, pointerEvents:'none', zIndex:9998, overflow:'hidden' }}>
      {trail.map(h => (
        <span key={h.id} style={{
          position:'absolute', left:h.x-8, top:h.y-8, fontSize:14,
          animation:'heart-trail-fade 0.9s ease-out forwards',
        }}>💗</span>
      ))}
    </div>
  )
}

export default function App() {
  const [stage, setStage] = useState<'lock'|'envelope'|'card'>('lock')
  const [confettiTrigger, setConfettiTrigger] = useState(0)

  const [active, setActive] = useState('front')
  const ActivePanel = panels.find(p=>p.id===active)?.component ?? FrontCover
  const activeIdx   = panels.findIndex(p=>p.id===active)

  const captureRef = useRef<HTMLDivElement>(null)
  const audioRef = useRef<HTMLAudioElement>(null)
  const [musicPlaying, setMusicPlaying] = useState(false)
  const [musicMissing, setMusicMissing] = useState(false)
  const [downloading, setDownloading] = useState(false)

  const toggleMusic = () => {
    const audio = audioRef.current
    if (!audio) return
    if (musicPlaying) {
      audio.pause()
      setMusicPlaying(false)
    } else {
      audio.play().then(() => setMusicPlaying(true)).catch(() => setMusicMissing(true))
    }
  }

  const handleDownload = async () => {
    if (!captureRef.current) return
    setDownloading(true)
    try {
      const html2canvas = (await import('html2canvas')).default
      // Capture the fixed 620×877 design element directly (no CSS transform on
      // it), so the downloaded image is always sharp and correctly framed —
      // regardless of how small the on-screen card is scaled down on a phone.
      const canvas = await html2canvas(captureRef.current, {
        useCORS: true, scale: 2, backgroundColor: null,
        width: DESIGN_W, height: DESIGN_H, windowWidth: DESIGN_W, windowHeight: DESIGN_H,
      })
      const link = document.createElement('a')
      link.download = `greeting-card-${active}.png`
      link.href = canvas.toDataURL('image/png')
      link.click()
    } catch {
      // ignore — button simply won't produce a file if capture fails
    } finally {
      setDownloading(false)
    }
  }

  const goPrev = () => { if (activeIdx > 0) setActive(panels[activeIdx-1].id) }
  const goNext = () => { if (activeIdx < panels.length-1) setActive(panels[activeIdx+1].id) }

  const touchStartX = useRef<number | null>(null)
  const handleTouchStart = (e: React.TouchEvent) => { touchStartX.current = e.touches[0].clientX }
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return
    const delta = e.changedTouches[0].clientX - touchStartX.current
    if (delta > 50) goPrev()
    else if (delta < -50) goNext()
    touchStartX.current = null
  }

  if (stage === 'lock') return <LockScreen onUnlock={() => setStage('envelope')} />
  if (stage === 'envelope') return <EnvelopeIntro onOpen={() => setStage('card')} />

  return (
    <div style={{ minHeight:'100vh',position:'relative',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'flex-start',padding:'28px 20px 44px' }}>

      <ConfettiOverlay trigger={confettiTrigger}/>
      <HeartTrail/>

      {/* Background music — put a file at public/music.mp3 to enable */}
      <audio ref={audioRef} src="/music.mp3" loop onError={() => setMusicMissing(true)} />

      {/* ★ LUXURY BACKGROUND ★ */}
      <LuxuryBackground/>

      {/* Content above bg */}
      <div style={{ position:'relative',zIndex:10,width:'100%',display:'flex',flexDirection:'column',alignItems:'center' }}>

        {/* Header */}
        <div style={{ textAlign:'center',marginBottom:18 }}>
          <h1 style={{ fontFamily:"'Great Vibes',cursive",fontSize:42,margin:'0 0 4px',
            color:'#f0c8d0',textShadow:'0 0 40px rgba(255,180,200,0.5), 0 0 80px rgba(183,110,121,0.3)',
          }}>
            Luxury Greeting Card
          </h1>
          <p style={{ fontFamily:'Poppins,sans-serif',fontSize:10,
            color:'rgba(240,200,208,0.45)',margin:0,letterSpacing:'0.18em',textTransform:'uppercase',fontWeight:300,
          }}>
            Happy Girlfriend's Day — My Loveee ✨
          </p>
        </div>

        {/* Music + Download controls */}
        <div style={{ display:'flex',gap:10,marginBottom:16 }}>
          {!musicMissing && (
            <button onClick={toggleMusic} style={{
              display:'flex',alignItems:'center',gap:6,
              background:'rgba(20,6,14,0.55)',backdropFilter:'blur(12px)',
              border:'1px solid rgba(201,149,108,0.25)',borderRadius:30,
              padding:'8px 16px',color:'rgba(240,200,208,0.8)',fontSize:12,
              fontFamily:'Poppins,sans-serif',cursor:'pointer',
            }}>
              {musicPlaying ? '🔊 Music On' : '🔈 Play Music'}
            </button>
          )}
          <button onClick={handleDownload} disabled={downloading} style={{
            display:'flex',alignItems:'center',gap:6,
            background:'linear-gradient(135deg,#b76e79,#d4a0a7)',
            border:'none',borderRadius:30,
            padding:'8px 16px',color:'#fff',fontSize:12,
            fontFamily:'Poppins,sans-serif',cursor:'pointer',fontWeight:500,
            opacity: downloading ? 0.7 : 1,
          }}>
            {downloading ? '⏳ Saving...' : '⬇️ Download as Image'}
          </button>
          <button onClick={() => setConfettiTrigger(t => t + 1)} style={{
            display:'flex',alignItems:'center',gap:6,
            background:'rgba(20,6,14,0.55)',backdropFilter:'blur(12px)',
            border:'1px solid rgba(201,149,108,0.25)',borderRadius:30,
            padding:'8px 16px',color:'rgba(240,200,208,0.8)',fontSize:12,
            fontFamily:'Poppins,sans-serif',cursor:'pointer',
          }}>
            💕 I Love You
          </button>
        </div>

        {/* Tabs */}
        <div style={{
          display:'flex',gap:8,marginBottom:18,
          background:'rgba(20,6,14,0.55)',backdropFilter:'blur(20px)',
          border:'1px solid rgba(201,149,108,0.2)',borderRadius:50,padding:'5px',
          boxShadow:'0 8px 32px rgba(0,0,0,0.4)',
        }}>
          {panels.map(p=>(
            <button key={p.id} onClick={()=>setActive(p.id)}
              className={`panel-tab${active===p.id?' active':''}`}
              style={{
                fontFamily:'Poppins,sans-serif',fontSize:12,fontWeight:500,
                padding:'8px 16px',borderRadius:40,border:'none',cursor:'pointer',
                background:active===p.id?'':'transparent',
                color:active===p.id?'':'rgba(240,200,208,0.55)',
                letterSpacing:'0.04em',whiteSpace:'nowrap',
              }}
            >{p.label}</button>
          ))}
        </div>

        {/* Card */}
        <div
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          style={{
          width:'100%',maxWidth:620,
          borderRadius:22,overflow:'hidden',
          boxShadow:'0 50px 140px rgba(0,0,0,0.7), 0 10px 40px rgba(139,58,82,0.35), 0 0 0 1px rgba(201,149,108,0.22)',
          position:'relative',animation:'fadeInUp 0.5s ease-out',
        }}>
          {/* Page turn shimmer on edge */}
          <div style={{
            position:'absolute',top:0,left:0,width:3,bottom:0,
            background:'linear-gradient(180deg, rgba(212,168,71,0.15) 0%, rgba(212,168,71,0.4) 50%, rgba(212,168,71,0.15) 100%)',
            zIndex:100,pointerEvents:'none',
          }}/>
          <ScaleToFit innerRef={captureRef}>
            <ActivePanel/>
          </ScaleToFit>
        </div>

        {/* Navigation */}
        <div style={{ display:'flex',gap:14,marginTop:18,alignItems:'center' }}>
          <button
            onClick={()=>{ if(activeIdx>0) setActive(panels[activeIdx-1].id) }}
            disabled={activeIdx===0}
            style={{
              width:44,height:44,borderRadius:'50%',
              background:'rgba(20,6,14,0.6)',backdropFilter:'blur(12px)',
              border:'1px solid rgba(201,149,108,0.25)',
              color:'rgba(240,200,208,0.7)',fontSize:20,cursor:'pointer',
              display:'flex',alignItems:'center',justifyContent:'center',
              transition:'all 0.2s',opacity:activeIdx===0?0.25:1,
            }}
          >‹</button>

          {/* Dot indicators */}
          <div style={{ display:'flex',gap:8 }}>
            {panels.map((p,i)=>(
              <div key={p.id} onClick={()=>setActive(p.id)} style={{
                width:active===p.id?28:8,height:8,borderRadius:4,cursor:'pointer',
                background:active===p.id
                  ?'linear-gradient(90deg,#c9956c,#e8849a)'
                  :'rgba(201,149,108,0.28)',
                transition:'all 0.35s ease',
                boxShadow:active===p.id?'0 2px 10px rgba(201,149,108,0.5)':'none',
              }}/>
            ))}
          </div>

          <button
            onClick={()=>{ if(activeIdx<panels.length-1) setActive(panels[activeIdx+1].id) }}
            disabled={activeIdx===panels.length-1}
            style={{
              width:44,height:44,borderRadius:'50%',
              background:'rgba(20,6,14,0.6)',backdropFilter:'blur(12px)',
              border:'1px solid rgba(201,149,108,0.25)',
              color:'rgba(240,200,208,0.7)',fontSize:20,cursor:'pointer',
              display:'flex',alignItems:'center',justifyContent:'center',
              transition:'all 0.2s',opacity:activeIdx===panels.length-1?0.25:1,
            }}
          >›</button>
        </div>

        <p style={{
          fontFamily:'Poppins,sans-serif',fontSize:10,
          color:'rgba(240,200,208,0.25)',marginTop:10,
          letterSpacing:'0.12em',textTransform:'uppercase',
        }}>
          Click tabs or arrows to explore all 4 panels
        </p>
      </div>
    </div>
  )
}
