import React, { useState, useEffect, useCallback, useRef } from 'react'

// ─── CHAVE DA API (configure VITE_ANTHROPIC_API_KEY no Vercel) ───────────────
const API_KEY = import.meta.env.VITE_ANTHROPIC_API_KEY || ''

// ─── THEME ───────────────────────────────────────────────────────────────────
const T = {
  green:   '#00D672',
  black:   '#111111',
  white:   '#FFFFFF',
  bg:      '#F7F7F7',
  border:  '#EBEBEB',
  gray1:   '#8A8A8A',
  gray2:   '#F0F0F0',
  gray3:   '#D4D4D4',
  red:     '#E53935',
  blue:    '#1565C0',

  // category accent colours (muted, no neon)
  cat: {
    loterias: '#1A7A4A',
    futebol:  '#1A7A4A',
    basquete: '#B45309',
    volei:    '#5B21B6',
    mma:      '#B91C1C',
    tenis:    '#0369A1',
    esports:  '#6D28D9',
  },

  radius: {
    sm: 10,
    md: 16,
    lg: 20,
    pill: 999,
  },
}


// ─── DATA ────────────────────────────────────────────────────────────────────
const LOTERIAS = [
  {
    id: 'mega',
    nome: 'Mega-Sena',
    concurso: '2987',
    data: '21/03/2026',
    dias: 'Ter · Qui · Sáb',
    premio: 'R$ 8.000.000',
    acumulado: false,
    ultimoResultado: [1, 5, 13, 26, 41, 53],
    aposta: 'R$ 6,00',
    descricao: '6 de 60 números',
    regras: 'Acerte 4, 5 ou 6',
    guruNums: [10, 53, 37, 5, 34, 33],
    guruConf: 18,
    guruAnalise: 'Baseado em 2.986 sorteios. Dezenas 10 (352×), 53 (339×) e 37 (324×) lideram o histórico geral.',
  },
  {
    id: 'lotofacil',
    nome: 'Lotofácil',
    concurso: '3642',
    data: '21/03/2026',
    dias: 'Seg a Sáb',
    premio: 'R$ 3.000.000',
    acumulado: false,
    ultimoResultado: [1, 2, 3, 5, 6, 9, 10, 13, 14, 16, 19, 20, 21, 22, 25],
    aposta: 'R$ 3,00',
    descricao: '15 de 25 números',
    regras: 'Acerte 11 a 15',
    guruNums: [20, 25, 10, 11, 13, 2, 5, 3, 7, 8, 14, 17, 19, 21, 23],
    guruConf: 34,
    guruAnalise: 'Top 5 históricos: 20, 25, 10, 11, 13. Conc. 3641: 7 pares / 8 ímpares — padrão mais frequente (65%).',
  },
  {
    id: 'quina',
    nome: 'Quina',
    concurso: '6982',
    data: '21/03/2026',
    dias: 'Seg a Sáb',
    premio: 'R$ 2.500.000',
    acumulado: false,
    ultimoResultado: [14, 22, 31, 44, 57],
    aposta: 'R$ 3,00',
    descricao: '5 de 80 números',
    regras: 'Acerte 2 a 5',
    guruNums: [4, 13, 47, 55, 25],
    guruConf: 22,
    guruAnalise: 'Mais de 6.800 concursos analisados. Frequentes: 04, 13, 47, 55, 25.',
  },
  {
    id: 'timemania',
    nome: 'Timemania',
    concurso: '2371',
    data: '22/03/2026',
    dias: 'Ter · Qui · Sáb',
    premio: 'R$ 12.500.000',
    acumulado: true,
    ultimoResultado: [8, 14, 27, 33, 42, 51, 68],
    aposta: 'R$ 3,50',
    descricao: '7 de 80 + Time do Coração',
    regras: 'Acerte 3 a 7',
    guruNums: [14, 27, 38, 42, 55, 61, 70],
    guruConf: 12,
    guruAnalise: 'Acumulado. Conc. 2369 sem ganhador: 5 acertaram 6 dezenas. Ciclo de atraso favorece extremos.',
  },
  {
    id: 'duplasena',
    nome: 'Dupla Sena',
    concurso: '2940',
    data: '23/03/2026',
    dias: 'Seg · Qua · Sex',
    premio: 'R$ 6.500.000',
    acumulado: true,
    ultimoResultado: [7, 18, 25, 33, 41, 48],
    aposta: 'R$ 3,00',
    descricao: '6 de 50 — dois sorteios',
    regras: 'Acerte 3 a 6 em qualquer sorteio',
    guruNums: [5, 18, 33, 41, 49, 53],
    guruConf: 15,
    guruAnalise: 'Conc. 2939 sem ganhadores em ambos os sorteios. Análise ponderada dos últimos 200 concursos.',
  },
  {
    id: 'diadesorte',
    nome: 'Dia de Sorte',
    concurso: '1212',
    data: '22/03/2026',
    dias: 'Ter · Qui · Sáb',
    premio: 'R$ 73.000.000',
    acumulado: true,
    ultimoResultado: [4, 7, 13, 18, 22, 24, 29],
    aposta: 'R$ 3,50',
    descricao: '7 de 31 + Mês da Sorte',
    regras: 'Acerte 4 a 7',
    guruNums: [7, 13, 18, 22, 24, 28, 29],
    guruConf: 14,
    guruAnalise: 'R$ 73 milhões acumulados. Atraso estratégico favorece as dezenas 7, 13 e 18.',
  },
]

const ESPORTES = {
  futebol: {
    label: 'Futebol',
    items: [
      { id:'f1', status:'live', statusLabel:'Hoje · 21h30 · Morumbis',     competition:'Brasileirão · 8ª Rodada', title:'São Paulo × Palmeiras',   subtitle:'Choque-Rei pela liderança',          guruPick:'Palmeiras',    guruConf:62, guruReason:'Palmeiras líder com saldo +11. São Paulo sem Lucas Moura por lesão.', home:{name:'São Paulo',    sub:'2º · 16 pts', pct:31}, away:{name:'Palmeiras',    sub:'1º · 16 pts', pct:48}, draw:21, vol:'R$ 18,4M' },
      { id:'f2', status:'live', statusLabel:'Hoje · 20h30 · Neo Química',  competition:'Brasileirão · 8ª Rodada', title:'Corinthians × Flamengo',  subtitle:'Clássico nacional em São Paulo',      guruPick:'Empate',       guruConf:38, guruReason:'Corinthians 5 jogos sem vencer, mas joga em casa. Flamengo em 4 vitórias seguidas.', home:{name:'Corinthians',  sub:'9º · 8 pts',  pct:26}, away:{name:'Flamengo',     sub:'4º · 13 pts', pct:44}, draw:30, vol:'R$ 14,2M' },
      { id:'f3', status:'upcoming', statusLabel:'22/03 · 18h30 · Maracanã', competition:'Brasileirão · 8ª Rodada', title:'Fluminense × Atlético-MG', subtitle:'Duelo direto na zona da tabela',    guruPick:'Fluminense',   guruConf:48, guruReason:'Fluminense em casa, 5º com 13 pts. Atlético-MG oscila fora de seus domínios.', home:{name:'Fluminense',   sub:'5º · 13 pts', pct:44}, away:{name:'Atlético-MG',  sub:'8º · 10 pts', pct:32}, draw:24, vol:'R$ 7,1M'  },
      { id:'f4', status:'upcoming', statusLabel:'22/03 · 16h00 · Nilton Santos', competition:'Brasileirão · 8ª Rodada', title:'Vasco × Grêmio', subtitle:'Gigante da Colina recebe o Tricolor', guruPick:'Vasco',        guruConf:52, guruReason:'Vasco em casa após vencer Fluminense por 3×2. Grêmio com viagem longa.', home:{name:'Vasco',        sub:'10º · 9 pts', pct:45}, away:{name:'Grêmio',       sub:'7º · 11 pts', pct:31}, draw:24, vol:'R$ 6,8M'  },
    ],
  },
  basquete: {
    label: 'Basquete',
    items: [
      { id:'b1', status:'live', statusLabel:'Hoje · 19h · Ibirapuera', competition:'NBB 2025/26 · 30ª Rodada', title:'Flamengo × Pinheiros', subtitle:'Líder recebe o Mengão em ascensão', guruPick:'Flamengo', guruConf:61, guruReason:'Flamengo virou desvantagem de 15 pts recentemente. Pinheiros é líder mas Fla em alta.', home:{name:'Flamengo',   sub:'3º · 21V', pct:58}, away:{name:'Pinheiros',  sub:'1º · 26V', pct:30}, draw:12, vol:'R$ 2,1M' },
      { id:'b2', status:'upcoming', statusLabel:'21/03 · 20h · Arena Caixa', competition:'NBB 2025/26 · 30ª Rodada', title:'Sesi Franca × Fortaleza BC', subtitle:'Tetracampeão busca mais uma vitória', guruPick:'Sesi Franca', guruConf:78, guruReason:'31 pts de Lucas Dias na última rodada. Franca venceu 8 dos últimos 10 jogos.', home:{name:'Sesi Franca', sub:'2º · 24V', pct:72}, away:{name:'Fortaleza BC', sub:'9º · 14V', pct:16}, draw:12, vol:'R$ 1,4M' },
    ],
  },
  volei: {
    label: 'Vôlei',
    items: [
      { id:'v1', status:'live', statusLabel:'Hoje · 21h · Arena Paulo Skaf', competition:'Superliga Masc. · Rodada 10', title:'Joinville × Sada Cruzeiro', subtitle:'Decacampeão visita Joinville', guruPick:'Sada Cruzeiro', guruConf:67, guruReason:'Sada Cruzeiro tem a melhor defesa da liga. Wallace e Douglas Souza são dominantes.', home:{name:'Joinville',     sub:'6º lugar', pct:25}, away:{name:'Sada Cruzeiro', sub:'1º lugar', pct:65}, draw:10, vol:'R$ 1,2M' },
      { id:'v2', status:'upcoming', statusLabel:'22/03 · 20h · Ginásio Mineirinho', competition:'Superliga Fem. · Rodada 10', title:'Praia Clube × Sesc Flamengo', subtitle:'Duelo de gigantes pelo topo', guruPick:'Sesc Flamengo', guruConf:60, guruReason:'Sesc Flamengo dirigido por Bernardinho é mais consistente na temporada atual.', home:{name:'Praia Clube',    sub:'3º lugar', pct:31}, away:{name:'Sesc Flamengo',  sub:'1º lugar', pct:57}, draw:12, vol:'R$ 1,4M' },
    ],
  },
  mma: {
    label: 'MMA / UFC',
    items: [
      { id:'m1', status:'live', statusLabel:'Hoje · UFC FN 270 · Londres', competition:'UFC Fight Night 270', title:'Evloev × Murphy', subtitle:'Dois invictos disputam contrato pelo cinturão', guruPick:'Decisão', guruConf:55, guruReason:'Evloev 19-0 vs Murphy 17-0. Britânico em casa. Luta técnica com desfecho provável na decisão.', home:{name:'Lerone Murphy', sub:'17-0 · Peso-Pena', pct:44}, away:{name:'M. Evloev', sub:'19-0 · Peso-Pena', pct:44}, draw:12, vol:'R$ 8,4M' },
      { id:'m2', status:'upcoming', statusLabel:'28/03 · Las Vegas', competition:'UFC Fight Night', title:'Adesanya × Pyfer', subtitle:'Ex-campeão busca retorno ao top 5', guruPick:'Adesanya', guruConf:58, guruReason:'Melhor alcance, poder de nocaute e experiência de campeonato frente à pressão de Pyfer.', home:{name:'I. Adesanya', sub:'Ex-campeão · 25-4', pct:55}, away:{name:'J. Pyfer', sub:'Top 15 · 13-2', pct:34}, draw:11, vol:'R$ 6,2M' },
    ],
  },
  tenis: {
    label: 'Tênis',
    items: [
      { id:'t1', status:'live', statusLabel:'Hoje · Miami Open', competition:'ATP Masters 1000 · Miami', title:'Sinner × Dzumhur', subtitle:'Campeão de Indian Wells estreia em Miami', guruPick:'Sinner', guruConf:92, guruReason:'Sinner venceu Indian Wells sem perder um set. Dzumhur é Nº74 sem histórico contra top 5.', home:{name:'J. Sinner',  sub:'Nº2 ATP · IW Campeão', pct:89}, away:{name:'D. Dzumhur', sub:'Nº74 ATP', pct:8}, draw:3, vol:'R$ 4,1M' },
      { id:'t2', status:'upcoming', statusLabel:'~27/03 · Miami Open', competition:'ATP Miami 2026 · Projeção Final', title:'Sinner × Alcaraz', subtitle:'Sunshine Double em disputa', guruPick:'Sinner', guruConf:47, guruReason:'Sinner tem 2 finais e 1 título em Miami. Alcaraz segundo favorito nas casas de apostas.', home:{name:'J. Sinner',  sub:'Nº2 · Favorito Miami', pct:44}, away:{name:'C. Alcaraz', sub:'Nº1 · 16-1 em 2026',   pct:38}, draw:18, vol:'R$ 11,2M' },
    ],
  },
  esports: {
    label: 'E-sports',
    items: [
      { id:'e1', status:'upcoming', statusLabel:'28/03 · CBLOL Etapa 1', competition:'CBLOL 2026 · Etapa 1', title:'LOUD × paiN Gaming', subtitle:'Campeã estreia na nova etapa', guruPick:'LOUD', guruConf:66, guruReason:'LOUD campeã da Copa CBLOL 2026. Bull e RedBert dominantes coletivamente.', home:{name:'LOUD',        sub:'Campeã Copa CBLOL', pct:62}, away:{name:'paiN Gaming', sub:'4º Copa CBLOL',     pct:24}, draw:14, vol:'R$ 1,8M' },
      { id:'e2', status:'upcoming', statusLabel:'06/06 · Grande Final', competition:'CBLOL 2026 · Campeão Etapa 1', title:'LOUD vence o campeonato?', subtitle:'Projeção para a Etapa 1 completa', guruPick:'LOUD', guruConf:42, guruReason:'LOUD bicampeã com coesão de equipe. FURIA com bootcamp na Coreia como principal ameaça.', home:{name:'LOUD',             sub:'Bicampeã · Favorita', pct:40}, away:{name:'FURIA / RED / Outro', sub:'Rivais do CBLOL',     pct:60}, draw:0, vol:'R$ 5,6M' },
    ],
  },
}

const TABS = [
  { key: 'loterias',  label: 'Loterias'  },
  { key: 'futebol',   label: 'Futebol'   },
  { key: 'basquete',  label: 'Basquete'  },
  { key: 'volei',     label: 'Vôlei'     },
  { key: 'mma',       label: 'MMA / UFC' },
  { key: 'tenis',     label: 'Tênis'     },
  { key: 'esports',   label: 'E-sports'  },
]


// ─── AUTO-UPDATE HOOK ────────────────────────────────────────────────────────
import { useState, useEffect, useCallback, useRef } from 'react'

const INTERVAL = 2 * 60 * 60 * 1000 // 2 hours

async function callClaude(data, category) {
  const hora = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  const system = `Você é o motor de análise do Guru das Bets. Responda SOMENTE JSON válido, sem markdown nem texto extra. Hora: ${hora}`

  let prompt = ''

  if (category === 'loterias') {
    prompt = `Recalcule previsões estatísticas das loterias da Caixa com base em frequência histórica, ciclo de atraso e distribuição par/ímpar.
Dados atuais: ${JSON.stringify(data.loterias.map(l => ({ id: l.id, nome: l.nome, guruNums: l.guruNums, guruConf: l.guruConf })))}
Retorne exatamente este array JSON (sem texto antes nem depois):
[
  {"id":"mega",      "guruNums":[n,n,n,n,n,n],                    "guruConf":18,"guruAnalise":"análise curta em pt-BR, max 120 caracteres"},
  {"id":"lotofacil", "guruNums":[n,n,n,n,n,n,n,n,n,n,n,n,n,n,n], "guruConf":34,"guruAnalise":"..."},
  {"id":"quina",     "guruNums":[n,n,n,n,n],                      "guruConf":22,"guruAnalise":"..."},
  {"id":"timemania", "guruNums":[n,n,n,n,n,n,n],                  "guruConf":12,"guruAnalise":"..."},
  {"id":"duplasena", "guruNums":[n,n,n,n,n,n],                    "guruConf":15,"guruAnalise":"..."},
  {"id":"diadesorte","guruNums":[n,n,n,n,n,n,n],                  "guruConf":14,"guruAnalise":"..."}
]
Regras dos ranges: mega=1-60, lotofacil=1-25 (15 distintos), quina=1-80, timemania=1-80, duplasena=1-50, diadesorte=1-31`
  } else {
    const esp = data.esportes[category]
    if (!esp) return null
    prompt = `Recalcule as previsões para ${esp.label} com base na forma recente, posição na tabela e contexto atual.
Eventos: ${JSON.stringify(esp.items.map(i => ({ id: i.id, title: i.title, guruPick: i.guruPick, guruConf: i.guruConf, home: i.home.name, homePct: i.home.pct, away: i.away.name, awayPct: i.away.pct, status: i.status })))}
Retorne JSON array com ${esp.items.length} objeto(s):
[{"id":"...","guruPick":"Nome favorito ou Empate","guruConf":0-95,"guruReason":"max 100 chars pt-BR","homePct":0-100,"awayPct":0-100,"draw":0-100}]
IMPORTANTE: homePct + awayPct + draw = 100`
  }

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': API_KEY,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1200,
      system,
      messages: [{ role: 'user', content: prompt }],
    }),
  })

  if (!res.ok) throw new Error(`API ${res.status}`)
  const json = await res.json()
  const txt  = json.content?.find(b => b.type === 'text')?.text || '[]'
  return JSON.parse(txt.replace(/```json|```/g, '').trim())
}

function useAutoUpdate(seed) {
  const [appData,   setAppData]   = useState(seed)
  const [logs,      setLogs]      = useState([])
  const [updating,  setUpdating]  = useState(false)
  const [lastAt,    setLastAt]    = useState(null)
  const [nextAt,    setNextAt]    = useState(null)
  const [queue,     setQueue]     = useState([])
  const [countdown, setCountdown] = useState('')
  const timerRef = useRef(null)
  const cdRef    = useRef(null)

  const addLog = useCallback((msg, t = 'info') => {
    const ts = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    setLogs(p => [{ msg, t, ts }, ...p].slice(0, 50))
  }, [])

  const runCycle = useCallback(async (cur, manual = false) => {
    setUpdating(true)
    const cats = ['loterias', ...Object.keys(ESPORTES)]
    setQueue([...cats])
    addLog(manual ? 'Atualizacao manual iniciada' : 'Ciclo automatico de 2h iniciado', 'start')

    const nd = { loterias: [...cur.loterias], esportes: { ...cur.esportes } }
    let ok = 0

    for (const cat of cats) {
      setQueue(q => q.filter(c => c !== cat))
      addLog(`Analisando: ${cat}`, 'loading')
      try {
        const upd = await callClaude(nd, cat)
        if (!upd || !Array.isArray(upd)) { addLog(`${cat}: resposta invalida`, 'warn'); continue }

        if (cat === 'loterias') {
          nd.loterias = nd.loterias.map(l => {
            const u = upd.find(x => x.id === l.id)
            return u ? { ...l, ...u } : l
          })
        } else {
          if (!nd.esportes[cat]) continue
          nd.esportes[cat] = {
            ...nd.esportes[cat],
            items: nd.esportes[cat].items.map(item => {
              const u = upd.find(x => x.id === item.id)
              if (!u) return item
              return {
                ...item,
                guruPick:   u.guruPick   || item.guruPick,
                guruConf:   u.guruConf   ?? item.guruConf,
                guruReason: u.guruReason || item.guruReason,
                home: { ...item.home, pct: u.homePct ?? item.home.pct },
                away: { ...item.away, pct: u.awayPct ?? item.away.pct },
                draw: u.draw ?? item.draw,
              }
            }),
          }
        }
        setAppData({ ...nd })
        ok++
        addLog(`${cat}: ${upd.length} item(s) atualizados`, 'success')
      } catch (e) {
        addLog(`${cat}: ${e.message}`, 'error')
      }
      await new Promise(r => setTimeout(r, 400))
    }

    const ts = new Date()
    setLastAt(ts)
    setNextAt(new Date(ts.getTime() + INTERVAL))
    setUpdating(false)
    setQueue([])
    addLog(`Concluido — ${ok}/${cats.length} categorias atualizadas`, 'done')
  }, [addLog])

  // countdown ticker
  useEffect(() => {
    cdRef.current = setInterval(() => {
      if (!nextAt) { setCountdown(''); return }
      const d = nextAt - Date.now()
      if (d <= 0) { setCountdown('Agora'); return }
      const h = Math.floor(d / 3600000)
      const m = Math.floor((d % 3600000) / 60000)
      const s = Math.floor((d % 60000) / 1000)
      setCountdown(`${h}h ${String(m).padStart(2, '0')}m ${String(s).padStart(2, '0')}s`)
    }, 1000)
    return () => clearInterval(cdRef.current)
  }, [nextAt])

  // auto cycle
  useEffect(() => {
    runCycle(seed)
    timerRef.current = setInterval(() => {
      setAppData(cur => { runCycle(cur); return cur })
    }, INTERVAL)
    return () => clearInterval(timerRef.current)
  }, []) // eslint-disable-line

  const force = useCallback(() => {
    if (!updating) setAppData(cur => { runCycle(cur, true); return cur })
  }, [updating, runCycle])

  return { appData, logs, updating, lastAt, countdown, queue, force }
}


// ─── COMPONENTS ──────────────────────────────────────────────────────────────
import React, { useEffect } from 'react'

function Splash({ onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 2000)
    return () => clearTimeout(t)
  }, [onDone])

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: T.green,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexDirection: 'column', gap: 8, zIndex: 999,
    }}>
      <div style={{
        fontSize: 42, fontWeight: 900, color: T.black,
        letterSpacing: '-0.04em', lineHeight: 1,
      }}>
        Guru das Bets
      </div>
      <div style={{
        fontSize: 13, fontWeight: 500, color: 'rgba(0,0,0,0.45)',
        letterSpacing: '0.06em',
      }}>
        PREVISOES INTELIGENTES
      </div>
    </div>
  )
}

import React from 'react'

function NumberBall({ n, size = 30, bg = T.gray2, color = T.black, bold = false }) {
  return (
    <div style={{
      width: size, height: size,
      borderRadius: '50%',
      background: bg,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size > 30 ? 13 : 11,
      fontWeight: bold ? 800 : 600,
      color,
      flexShrink: 0,
      letterSpacing: '-0.01em',
    }}>
      {String(n).padStart(2, '0')}
    </div>
  )
}

import React from 'react'

function LotoCard({ lot, onSelect, catUpdating }) {
  return (
    <div
      onClick={() => onSelect(lot)}
      style={{
        background: T.white,
        borderRadius: T.radius.lg,
        border: `1px solid ${T.border}`,
        marginBottom: 12,
        overflow: 'hidden',
        cursor: 'pointer',
      }}
    >
      {/* Thin top accent bar */}
      <div style={{ height: 3, background: lot.acumulado ? '#F59E0B' : T.cat.loterias }} />

      <div style={{ padding: '18px 20px' }}>

        {/* Header row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
              <span style={{ fontSize: 17, fontWeight: 800, color: T.black, letterSpacing: '-0.03em' }}>
                {lot.nome}
              </span>
              {lot.acumulado && (
                <span style={{
                  fontSize: 10, fontWeight: 700,
                  background: '#FFF3E0', color: '#B45309',
                  borderRadius: 6, padding: '2px 8px',
                  letterSpacing: '0.03em',
                }}>
                  ACUMULADO
                </span>
              )}
            </div>
            <div style={{ fontSize: 12, color: T.gray1 }}>
              {lot.descricao} &nbsp;·&nbsp; {lot.dias} &nbsp;·&nbsp; Conc. {lot.concurso}
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 19, fontWeight: 900, color: T.black, letterSpacing: '-0.03em', lineHeight: 1 }}>
              {lot.premio}
            </div>
            <div style={{ fontSize: 11, color: T.gray1, marginTop: 3 }}>Sorteio {lot.data}</div>
          </div>
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: T.border, marginBottom: 16 }} />

        {/* Last result */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: T.gray1, letterSpacing: '0.05em', marginBottom: 8 }}>
            ULTIMO RESULTADO
          </div>
          <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
            {lot.ultimoResultado.map(n => (
              <NumberBall key={n} n={n} />
            ))}
          </div>
        </div>

        {/* Guru suggestion box */}
        <div style={{
          background: T.bg,
          borderRadius: T.radius.md,
          padding: '14px 16px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: T.black, letterSpacing: '0.05em' }}>
              {catUpdating ? 'ATUALIZANDO PREVISAO...' : 'GURU SUGERE'}
            </span>
            <span style={{
              fontSize: 12, fontWeight: 800,
              background: catUpdating ? T.gray3 : T.green,
              color: catUpdating ? T.gray1 : T.black,
              borderRadius: T.radius.pill,
              padding: '3px 10px',
            }}>
              {lot.guruConf}% conf.
            </span>
          </div>

          <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: 10 }}>
            {(lot.guruNums || []).map(n => (
              <NumberBall
                key={n} n={n}
                bg={catUpdating ? T.gray3 : T.black}
                color={T.white}
                bold
              />
            ))}
          </div>

          <p style={{ fontSize: 12, color: T.gray1, lineHeight: 1.55, margin: 0 }}>
            {lot.guruAnalise}
          </p>
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 14 }}>
          <span style={{ fontSize: 12, color: T.gray1 }}>
            Aposta minima: <strong style={{ color: T.black }}>{lot.aposta}</strong>
          </span>
          <span style={{ fontSize: 12, color: T.gray1 }}>{lot.regras}</span>
        </div>

      </div>
    </div>
  )
}

import React from 'react'

function SportCard({ item, accentColor, onSelect, catUpdating }) {
  const live = item.status === 'live'

  return (
    <div
      onClick={() => onSelect(item)}
      style={{
        background: T.white,
        borderRadius: T.radius.lg,
        border: `1px solid ${T.border}`,
        marginBottom: 12,
        overflow: 'hidden',
        cursor: 'pointer',
      }}
    >
      {/* Top accent */}
      <div style={{ height: 3, background: live ? T.red : T.border }} />

      <div style={{ padding: '18px 20px' }}>

        {/* Status + competition */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {live && (
              <>
                <div style={{ width: 7, height: 7, borderRadius: '50%', background: T.red }} />
                <span style={{ fontSize: 11, fontWeight: 700, color: T.red }}>AO VIVO</span>
                <span style={{ fontSize: 11, color: T.gray1 }}>·</span>
              </>
            )}
            <span style={{ fontSize: 11, color: T.gray1 }}>{item.statusLabel}</span>
          </div>
          <span style={{ fontSize: 11, color: T.gray1 }}>{item.competition}</span>
        </div>

        {/* Title */}
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 20, fontWeight: 900, color: T.black, letterSpacing: '-0.04em', lineHeight: 1.15 }}>
            {item.title}
          </div>
          <div style={{ fontSize: 12, color: T.gray1, marginTop: 4 }}>{item.subtitle}</div>
        </div>

        {/* Guru bar */}
        <div style={{
          background: T.bg,
          borderRadius: T.radius.md,
          padding: '11px 14px',
          marginBottom: 16,
          display: 'flex', alignItems: 'flex-start', gap: 10,
        }}>
          <div style={{ flex: 1 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: T.black }}>
              {catUpdating ? 'Atualizando previsao...' : `Guru: ${item.guruPick}`}
            </span>
            {!catUpdating && item.guruReason && (
              <p style={{ fontSize: 11, color: T.gray1, marginTop: 3, lineHeight: 1.5, margin: '3px 0 0' }}>
                {item.guruReason}
              </p>
            )}
          </div>
          <div style={{
            background: catUpdating ? T.gray3 : T.black,
            color: catUpdating ? T.gray1 : T.white,
            borderRadius: T.radius.pill,
            padding: '4px 12px',
            fontSize: 12, fontWeight: 800,
            flexShrink: 0,
          }}>
            {item.guruConf}%
          </div>
        </div>

        {/* Teams */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[item.home, item.away].map((side, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              {/* Color stripe */}
              <div style={{ width: 3, height: 38, borderRadius: 2, background: T.border, flexShrink: 0 }} />
              {/* Name */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: T.black, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {side.name}
                </div>
                <div style={{ fontSize: 11, color: T.gray1, marginTop: 1 }}>{side.sub}</div>
              </div>
              {/* Probability */}
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{ fontSize: 18, fontWeight: 900, color: T.black, letterSpacing: '-0.02em' }}>
                  {side.pct}%
                </div>
                {/* mini bar */}
                <div style={{ width: 56, height: 3, background: T.border, borderRadius: 2, marginTop: 4 }}>
                  <div style={{ width: `${side.pct}%`, height: '100%', background: side.pct > 50 ? T.black : T.gray3, borderRadius: 2, transition: 'width 0.5s' }} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer row */}
        <div style={{
          display: 'flex', justifyContent: 'space-between',
          marginTop: 14, paddingTop: 12,
          borderTop: `1px solid ${T.border}`,
        }}>
          <span style={{ fontSize: 12, color: T.gray1 }}>Empate: {item.draw}%</span>
          <span style={{ fontSize: 12, color: T.gray1 }}>{item.vol} vol.</span>
        </div>

      </div>
    </div>
  )
}

import React, { useState } from 'react'

function Overlay({ onClose }) {
  return (
    <div
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)', zIndex: 200 }}
    />
  )
}

function Sheet({ children }) {
  return (
    <div style={{
      position: 'fixed', bottom: 0,
      left: '50%', transform: 'translateX(-50%)',
      width: '100%', maxWidth: 430,
      background: T.white,
      borderRadius: '22px 22px 0 0',
      zIndex: 201,
      maxHeight: '90vh', overflowY: 'auto',
      animation: 'slideUp 0.28s cubic-bezier(0.32,0.72,0,1)',
    }}>
      {/* drag handle */}
      <div style={{ padding: '14px 0 6px', display: 'flex', justifyContent: 'center' }}>
        <div style={{ width: 36, height: 4, borderRadius: 2, background: T.border }} />
      </div>
      {children}
    </div>
  )
}

// ── Success state ─────────────────────────────────────────────────────────────
function Success({ isLoto, item, amount, choice, onClose }) {
  const na = parseFloat(amount) || 0
  return (
    <>
      <Overlay onClose={onClose} />
      <Sheet>
        <div style={{ padding: '24px 24px 44px', textAlign: 'center' }}>
          <div style={{ width: 56, height: 56, borderRadius: '50%', background: T.green, margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="28" height="28" fill="none" viewBox="0 0 24 24">
              <path d="M5 13l4 4L19 7" stroke={T.black} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div style={{ fontSize: 22, fontWeight: 900, color: T.black, letterSpacing: '-0.04em', marginBottom: 8 }}>
            {isLoto ? 'Boa sorte!' : 'Aposta registrada!'}
          </div>
          <div style={{ fontSize: 14, color: T.gray1, lineHeight: 1.6, marginBottom: 28 }}>
            {isLoto
              ? <>R$ {na.toFixed(2)} apostados na <strong style={{ color: T.black }}>{item.nome}</strong><br />Sorteio em {item.data}</>
              : <>R$ {na.toFixed(2)} em <strong style={{ color: T.black }}>{choice === 'yes' ? item.home?.name : item.away?.name}</strong></>
            }
          </div>
          <div style={{ background: T.bg, borderRadius: T.radius.md, padding: '12px 16px', marginBottom: 20, fontSize: 13, color: T.gray1, textAlign: 'left' }}>
            <strong style={{ color: T.black }}>Previsao do Guru:</strong>{' '}
            {isLoto
              ? (item.guruNums || []).map(n => String(n).padStart(2, '0')).join(' · ')
              : `${item.guruPick} (${item.guruConf}% de confianca)`
            }
          </div>
          <button
            onClick={onClose}
            style={{
              width: '100%', padding: '18px',
              borderRadius: T.radius.md,
              background: T.black, border: 'none',
              color: T.white, fontSize: 16, fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Voltar aos mercados
          </button>
        </div>
      </Sheet>
    </>
  )
}

// ── Main bet sheet ─────────────────────────────────────────────────────────────
function BetSheet({ item, isLoto, onClose }) {
  const [amount,  setAmount]  = useState('')
  const [choice,  setChoice]  = useState('yes')
  const [betType, setBetType] = useState('simples')
  const [done,    setDone]    = useState(false)

  if (!item) return null

  const na  = parseFloat(amount) || 0
  const yp  = isLoto ? 50 : (item.home?.pct || 50)
  const np  = isLoto ? 50 : (item.away?.pct || 50)
  const unit = (choice === 'yes' ? yp : np) / 100
  const ret  = na > 0 ? (na / unit).toFixed(2) : null
  const luc  = na > 0 ? ((na / unit) - na).toFixed(2) : null

  if (done) return <Success isLoto={isLoto} item={item} amount={amount} choice={choice} onClose={onClose} />

  return (
    <>
      <Overlay onClose={onClose} />
      <Sheet>
        <div style={{ padding: '10px 24px 40px' }}>

          {/* Guru insight */}
          <div style={{ background: T.bg, borderRadius: T.radius.md, padding: '14px 16px', marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: T.black, letterSpacing: '0.05em' }}>ANALISE DO GURU</span>
              <span style={{ fontSize: 12, fontWeight: 800, background: T.green, color: T.black, borderRadius: T.radius.pill, padding: '3px 12px' }}>
                {item.guruConf}%
              </span>
            </div>

            {isLoto ? (
              <>
                <p style={{ fontSize: 12, color: T.gray1, lineHeight: 1.6, marginBottom: 12 }}>{item.guruAnalise}</p>
                <div style={{ fontSize: 11, fontWeight: 700, color: T.black, marginBottom: 8 }}>
                  Numeros sugeridos — concurso {item.concurso}
                </div>
                <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                  {(item.guruNums || []).map(n => <NumberBall key={n} n={n} bg={T.black} color={T.white} bold />)}
                </div>
              </>
            ) : (
              <>
                <div style={{ fontSize: 17, fontWeight: 900, color: T.black, letterSpacing: '-0.03em', marginBottom: 4 }}>
                  {item.guruPick}
                </div>
                <p style={{ fontSize: 12, color: T.gray1, lineHeight: 1.5, margin: 0 }}>{item.guruReason}</p>
              </>
            )}
          </div>

          {/* Warning for loterias */}
          {isLoto && (
            <div style={{
              background: '#FFFBEB', border: `1px solid #FDE68A`,
              borderRadius: T.radius.sm, padding: '10px 14px', marginBottom: 16,
              fontSize: 11, color: '#78350F', lineHeight: 1.5,
            }}>
              Loteria e jogo de azar. A sugestao do Guru e baseada em estatistica historica e nao garante resultado. Aposte com responsabilidade.
            </div>
          )}

          {/* Item info */}
          <div style={{ marginBottom: 18 }}>
            <div style={{ fontSize: 12, color: T.gray1, marginBottom: 4 }}>
              {isLoto ? `${item.nome} · Concurso ${item.concurso} · ${item.data}` : item.competition}
            </div>
            <div style={{ fontSize: 20, fontWeight: 900, color: T.black, letterSpacing: '-0.04em' }}>
              {isLoto ? item.nome : item.title}
            </div>
          </div>

          {/* Sport-only: buy/sell + yes/no */}
          {!isLoto && (
            <>
              {/* Buy / Sell segmented */}
              <div style={{ display: 'flex', background: T.bg, borderRadius: T.radius.md, padding: 4, marginBottom: 16 }}>
                {['buy', 'sell'].map(m => (
                  <button key={m} style={{
                    flex: 1, padding: '10px',
                    borderRadius: T.radius.sm, border: 'none',
                    background: m === 'buy' ? T.white : 'transparent',
                    color: m === 'buy' ? T.black : T.gray1,
                    fontWeight: m === 'buy' ? 700 : 500,
                    fontSize: 14, cursor: 'pointer',
                    boxShadow: m === 'buy' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                  }}>
                    {m === 'buy' ? 'Comprar' : 'Vender'}
                  </button>
                ))}
              </div>

              {/* Yes / No */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
                {[
                  { key: 'yes', label: 'Sim', price: yp, name: item.home?.name },
                  { key: 'no',  label: 'Nao', price: np, name: item.away?.name },
                ].map(o => (
                  <button
                    key={o.key}
                    onClick={() => setChoice(o.key)}
                    style={{
                      padding: '14px 10px',
                      borderRadius: T.radius.md,
                      border: `2px solid ${choice === o.key ? T.black : T.border}`,
                      background: choice === o.key ? T.bg : T.white,
                      cursor: 'pointer', textAlign: 'center',
                      transition: 'all 0.15s',
                    }}
                  >
                    <div style={{ fontSize: 18, fontWeight: 900, color: T.black }}>
                      {o.label} &nbsp;{o.price}¢
                    </div>
                    <div style={{ fontSize: 11, color: T.gray1, marginTop: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {o.name}
                    </div>
                  </button>
                ))}
              </div>
            </>
          )}

          {/* Loterias: bet type */}
          {isLoto && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: T.black, marginBottom: 8 }}>Tipo de aposta</div>
              <div style={{ display: 'flex', background: T.bg, borderRadius: T.radius.md, padding: 4 }}>
                {['simples', 'bolao', 'teimosinha'].map(t => (
                  <button key={t} onClick={() => setBetType(t)} style={{
                    flex: 1, padding: '9px 4px', borderRadius: T.radius.sm, border: 'none',
                    background: betType === t ? T.white : 'transparent',
                    color: betType === t ? T.black : T.gray1,
                    fontWeight: betType === t ? 700 : 500,
                    fontSize: 12, cursor: 'pointer', textTransform: 'capitalize',
                    boxShadow: betType === t ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                  }}>
                    {t}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Amount input — Tabby style */}
          <div style={{
            border: `1.5px solid ${T.border}`,
            borderRadius: T.radius.md,
            padding: '16px 18px',
            marginBottom: 12,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: T.black }}>Valor</div>
                <div style={{ fontSize: 11, color: T.cat.loterias, fontWeight: 600, marginTop: 2 }}>
                  Ganhe 3,25% de rendimento
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ fontSize: 20, color: T.gray1, fontWeight: 300 }}>R$</span>
                <input
                  type="number"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  placeholder="0"
                  style={{
                    width: 90, fontSize: 28, fontWeight: 300,
                    color: amount ? T.black : T.gray3,
                    border: 'none', outline: 'none',
                    textAlign: 'right', background: 'transparent',
                    fontFamily: 'inherit',
                  }}
                />
              </div>
            </div>
          </div>

          {/* Quick amounts */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
            {(isLoto ? ['3', '6', '10', '25', '50'] : ['10', '25', '50', '100']).map(v => (
              <button
                key={v}
                onClick={() => setAmount(v)}
                style={{
                  flex: 1, padding: '10px 0',
                  borderRadius: T.radius.sm,
                  border: `1.5px solid ${amount === v ? T.black : T.border}`,
                  background: amount === v ? T.black : T.bg,
                  color: amount === v ? T.white : T.black,
                  fontSize: 13, fontWeight: 700, cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
              >
                R${v}
              </button>
            ))}
          </div>

          {/* Return summary (sports only) */}
          {!isLoto && na > 0 && (
            <div style={{ background: T.bg, borderRadius: T.radius.md, padding: '14px 16px', marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 13, color: T.gray1 }}>Retorno total</span>
                <span style={{ fontSize: 15, fontWeight: 800, color: T.black }}>R$ {ret}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 12, color: T.gray1 }}>Lucro se ganhar</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: T.cat.loterias }}>+R$ {luc}</span>
              </div>
            </div>
          )}

          {/* CTA — Tabby black pill button */}
          <button
            onClick={() => { if (na > 0) setDone(true) }}
            style={{
              width: '100%', padding: '18px',
              borderRadius: T.radius.md,
              background: na > 0 ? T.black : T.gray2,
              border: 'none',
              color: na > 0 ? T.white : T.gray1,
              fontSize: 17, fontWeight: 700,
              cursor: na > 0 ? 'pointer' : 'default',
              transition: 'background 0.2s',
              letterSpacing: '-0.01em',
            }}
          >
            {na > 0
              ? (isLoto ? `Apostar R$ ${na.toFixed(2)} na ${item.nome}` : `Confirmar aposta de R$ ${na.toFixed(2)}`)
              : 'Digite o valor para continuar'
            }
          </button>

        </div>
      </Sheet>
    </>
  )
}

import React from 'react'

const LOG_COLORS = {
  info:    T.gray1,
  start:   '#7C3AED',
  loading: '#D97706',
  success: '#059669',
  warn:    '#D97706',
  error:   '#DC2626',
  done:    '#0369A1',
}

function EngineLog({ logs, updating, lastAt, countdown, queue, force }) {
  return (
    <div style={{ padding: '0 20px 100px', animation: 'fadeUp 0.2s ease' }}>

      {/* Status card */}
      <div style={{ background: T.white, borderRadius: T.radius.lg, border: `1px solid ${T.border}`, padding: '20px', marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: 17, fontWeight: 800, color: T.black, letterSpacing: '-0.03em' }}>
              {updating ? 'Analisando...' : 'Motor ativo'}
            </div>
            <div style={{ fontSize: 12, color: T.gray1, marginTop: 3 }}>
              Ultima: {lastAt ? lastAt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : 'Aguardando'}
            </div>
          </div>
          <button
            onClick={force}
            disabled={updating}
            style={{
              padding: '10px 20px',
              borderRadius: T.radius.pill,
              background: updating ? T.gray2 : T.black,
              border: 'none',
              color: updating ? T.gray1 : T.white,
              fontSize: 13, fontWeight: 700,
              cursor: updating ? 'not-allowed' : 'pointer',
            }}
          >
            {updating ? 'Analisando...' : 'Atualizar agora'}
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <div style={{ background: T.bg, borderRadius: T.radius.sm, padding: '12px 14px' }}>
            <div style={{ fontSize: 10, fontWeight: 600, color: T.gray1, letterSpacing: '0.05em', marginBottom: 4 }}>INTERVALO</div>
            <div style={{ fontSize: 20, fontWeight: 900, color: T.black, letterSpacing: '-0.03em' }}>2 horas</div>
          </div>
          <div style={{ background: T.bg, borderRadius: T.radius.sm, padding: '12px 14px' }}>
            <div style={{ fontSize: 10, fontWeight: 600, color: T.gray1, letterSpacing: '0.05em', marginBottom: 4 }}>PROXIMA EM</div>
            <div style={{ fontSize: 16, fontWeight: 900, color: T.cat.loterias, fontVariantNumeric: 'tabular-nums' }}>
              {countdown || '—'}
            </div>
          </div>
        </div>

        {updating && queue.length > 0 && (
          <div style={{ marginTop: 12 }}>
            <div style={{ fontSize: 11, color: T.gray1, marginBottom: 8 }}>Na fila:</div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {queue.map(c => {
                const meta = TABS.find(t => t.key === c)
                return (
                  <span key={c} style={{ fontSize: 11, background: T.bg, borderRadius: T.radius.pill, padding: '4px 12px', color: T.black, fontWeight: 600, border: `1px solid ${T.border}` }}>
                    {meta?.label || c}
                  </span>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* How it works */}
      <div style={{ background: '#EFF6FF', borderRadius: T.radius.md, border: '1px solid #BFDBFE', padding: '14px 16px', marginBottom: 14 }}>
        <div style={{ fontSize: 13, fontWeight: 800, color: '#1D4ED8', marginBottom: 6 }}>Como funciona</div>
        <div style={{ fontSize: 12, color: '#3B82F6', lineHeight: 1.7 }}>
          A cada <strong>2 horas</strong>, o motor chama a <strong>API do Claude</strong> e reanálisa todas as 7 categorias. Loterias usam frequência histórica e ciclo de atraso. Esportes usam forma recente, posição na tabela e contexto da competição.
        </div>
      </div>

      {/* Terminal log */}
      <div style={{ background: '#0F172A', borderRadius: T.radius.lg, padding: '16px', overflow: 'hidden' }}>
        <div style={{ fontSize: 11, color: T.green, fontWeight: 700, marginBottom: 12, letterSpacing: '0.08em', fontFamily: 'monospace' }}>
          LOG DO MOTOR
        </div>
        {logs.length === 0 && (
          <div style={{ fontSize: 12, color: '#475569', fontFamily: 'monospace' }}>
            Aguardando primeiro ciclo...
          </div>
        )}
        {logs.map((l, i) => (
          <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 5, opacity: Math.max(0.15, 1 - i * 0.03) }}>
            <span style={{ fontSize: 10, color: '#475569', flexShrink: 0, paddingTop: 1, fontFamily: 'monospace', fontVariantNumeric: 'tabular-nums' }}>
              {l.ts}
            </span>
            <span style={{ fontSize: 11, color: LOG_COLORS[l.t] || T.gray1, lineHeight: 1.5, fontFamily: 'monospace' }}>
              {l.msg}
            </span>
          </div>
        ))}
      </div>

    </div>
  )
}

import React from 'react'

function Header({ tab, onTab, updating, countdown, queue }) {
  return (
    <div style={{
      background: T.white,
      borderBottom: `1px solid ${T.border}`,
      position: 'sticky', top: 0, zIndex: 50,
    }}>
      {/* Top bar */}
      <div style={{
        padding: '16px 20px 12px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        {/* Logo */}
        <div>
          <div style={{ fontSize: 22, fontWeight: 900, color: T.black, letterSpacing: '-0.04em', lineHeight: 1 }}>
            Guru das Bets
          </div>
          <div style={{ fontSize: 10, fontWeight: 600, color: T.gray1, letterSpacing: '0.07em', marginTop: 2 }}>
            MOTOR DE IA · ATUALIZACAO A CADA 2H
          </div>
        </div>

        {/* Status pill — like Tabby's notification badge area */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '7px 14px', borderRadius: T.radius.pill,
          background: updating ? '#FFF8E1' : '#F0FFF4',
          border: `1px solid ${updating ? '#FFE082' : '#A7F3D0'}`,
        }}>
          {updating
            ? <div style={{ width: 8, height: 8, borderRadius: '50%', border: `2px solid #F59E0B`, borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite' }} />
            : <div style={{ width: 8, height: 8, borderRadius: '50%', background: T.green, animation: 'pulse 2s infinite' }} />
          }
          <span style={{ fontSize: 11, fontWeight: 700, color: updating ? '#92400E' : '#065F46' }}>
            {updating ? 'ANALISANDO' : 'AO VIVO'}
          </span>
        </div>
      </div>

      {/* Countdown / progress ribbon */}
      {!updating && countdown && (
        <div style={{
          margin: '0 20px 10px',
          background: T.gray2, borderRadius: T.radius.sm,
          padding: '6px 12px',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <span style={{ fontSize: 11, color: T.gray1 }}>Proxima atualizacao automatica</span>
          <span style={{ fontSize: 12, fontWeight: 800, color: T.black, fontVariantNumeric: 'tabular-nums' }}>
            {countdown}
          </span>
        </div>
      )}

      {updating && queue.length > 0 && (
        <div style={{
          margin: '0 20px 10px',
          background: '#FFF8E1', borderRadius: T.radius.sm,
          padding: '6px 12px',
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <div style={{ width: 10, height: 10, borderRadius: '50%', border: '2px solid #F59E0B', borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite', flexShrink: 0 }} />
          <span style={{ fontSize: 11, color: '#78350F' }}>
            Analisando <strong>{queue[0]}</strong> &mdash; {queue.length} categoria(s) restante(s)
          </span>
        </div>
      )}

      {/* Category tabs — Tabby pill row */}
      <div style={{ display: 'flex', gap: 8, overflowX: 'auto', padding: '0 20px 14px' }}>
        {TABS.map(({ key, label }) => {
          const active = key === tab
          return (
            <button
              key={key}
              onClick={() => onTab(key)}
              style={{
                padding: '8px 18px',
                borderRadius: T.radius.pill,
                border: 'none',
                background: active ? T.black : T.gray2,
                color: active ? T.white : T.gray1,
                fontSize: 13, fontWeight: active ? 700 : 500,
                cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0,
                transition: 'all 0.15s',
                letterSpacing: '-0.01em',
              }}
            >
              {label}
            </button>
          )
        })}
      </div>
    </div>
  )
}

import React from 'react'

function IconDiscover({ active }) {
  const c = active ? T.black : T.gray1
  return (
    <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" stroke={c} strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M9 22V12h6v10" stroke={c} strokeWidth="1.8" strokeLinejoin="round" />
    </svg>
  )
}

function IconPlay({ active }) {
  const c = active ? T.black : T.gray1
  return (
    <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="9" stroke={c} strokeWidth="1.8" />
      <path d="M10 8.5l5 3.5-5 3.5V8.5z" stroke={c} strokeWidth="1.8" strokeLinejoin="round" />
    </svg>
  )
}

function IconEngine({ active }) {
  const c = active ? T.black : T.gray1
  return (
    <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
      <rect x="3" y="3" width="18" height="18" rx="4" stroke={c} strokeWidth="1.8" />
      <path d="M7 8h10M7 12h7M7 16h4" stroke={c} strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

function IconProfile({ active }) {
  const c = active ? T.black : T.gray1
  return (
    <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
      <circle cx="12" cy="8" r="4" stroke={c} strokeWidth="1.8" />
      <path d="M4 20c0-3.314 3.582-6 8-6s8 2.686 8 6" stroke={c} strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

const NAV_ITEMS = [
  { key: 'discover', label: 'Descobrir', Icon: IconDiscover },
  { key: 'play',     label: 'Apostar',   Icon: IconPlay     },
  { key: 'engine',   label: 'Motor IA',  Icon: IconEngine   },
  { key: 'profile',  label: 'Perfil',    Icon: IconProfile  },
]

function BottomNav({ navKey, onNav, liveCount, engineUpdating }) {
  return (
    <div style={{
      position: 'fixed', bottom: 0,
      left: '50%', transform: 'translateX(-50%)',
      width: '100%', maxWidth: 430,
      background: T.white,
      borderTop: `1px solid ${T.border}`,
      display: 'flex', justifyContent: 'space-around',
      paddingTop: 10, paddingBottom: 28,
      zIndex: 100,
    }}>
      {NAV_ITEMS.map(({ key, label, Icon }) => {
        const active = navKey === key
        return (
          <button
            key={key}
            onClick={() => onNav(key)}
            style={{
              background: 'none', border: 'none',
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', gap: 4,
              cursor: 'pointer', position: 'relative',
              minWidth: 60,
            }}
          >
            {/* badge for live */}
            {key === 'play' && liveCount > 0 && (
              <span style={{
                position: 'absolute', top: -2, right: 6,
                background: T.red, color: T.white,
                fontSize: 9, fontWeight: 900,
                borderRadius: T.radius.pill,
                padding: '1px 5px', lineHeight: 1.5,
              }}>
                {liveCount}
              </span>
            )}
            {/* engine updating dot */}
            {key === 'engine' && engineUpdating && (
              <span style={{
                position: 'absolute', top: 0, right: 8,
                width: 8, height: 8, borderRadius: '50%',
                background: '#F59E0B',
                border: `2px solid ${T.white}`,
                animation: 'pulse 1s infinite',
              }} />
            )}
            <Icon active={active} />
            <span style={{
              fontSize: 10,
              color: active ? T.black : T.gray1,
              fontWeight: active ? 700 : 400,
            }}>
              {label}
            </span>
          </button>
        )
      })}
    </div>
  )
}


// ─── APP ROOT ─────────────────────────────────────────────────────────────────
import React, { useState } from 'react'


const SEED = { loterias: LOTERIAS, esportes: ESPORTES }

export default function App() {
  const [splash,  setSplash]  = useState(true)
  const [tab,     setTab]     = useState('loterias')
  const [navKey,  setNavKey]  = useState('discover')
  const [selItem, setSelItem] = useState(null)
  const [showLog, setShowLog] = useState(false)

  const { appData, logs, updating, lastAt, countdown, queue, force } = useAutoUpdate(SEED)

  if (splash) return <Splash onDone={() => setSplash(false)} />

  const isLoto      = tab === 'loterias'
  const espData     = appData.esportes[tab]
  const espItems    = espData?.items || []
  const catUpd      = updating && queue.includes(tab)
  const accentColor = T.cat[tab] || T.black

  const totalLive = Object.values(appData.esportes)
    .flatMap(d => d.items)
    .filter(i => i.status === 'live').length

  function handleNav(key) {
    if (key === 'engine') { setShowLog(v => !v); setNavKey('engine') }
    else { setShowLog(false); setNavKey(key) }
  }

  function handleTab(key) {
    setTab(key); setShowLog(false); setNavKey('discover')
  }

  return (
    <div style={{ background: T.bg, minHeight: '100vh', maxWidth: 430, margin: '0 auto' }}>

      <Header tab={tab} onTab={handleTab} updating={updating} countdown={countdown} queue={queue} />

      {showLog ? (
        <EngineLog logs={logs} updating={updating} lastAt={lastAt} countdown={countdown} queue={queue} force={force} />
      ) : (
        <div style={{ padding: '20px 20px 100px', animation: 'fadeUp 0.2s ease' }}>

          {/* Section header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 18 }}>
            <div>
              <div style={{ fontSize: 26, fontWeight: 900, color: T.black, letterSpacing: '-0.04em', lineHeight: 1.1 }}>
                {TABS.find(t => t.key === tab)?.label}
              </div>
              <div style={{ fontSize: 13, color: T.gray1, marginTop: 4 }}>
                {isLoto
                  ? `${appData.loterias.filter(l => l.acumulado).length} acumuladas · Previsoes atualizadas por IA`
                  : `${espItems.length} mercados · ${espItems.filter(i => i.guruConf >= 65).length} picks com alta confianca`
                }
              </div>
            </div>
            {catUpd && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#FFF8E1', borderRadius: T.radius.pill, padding: '6px 12px', flexShrink: 0 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', border: '2px solid #F59E0B', borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite' }} />
                <span style={{ fontSize: 11, fontWeight: 700, color: '#92400E' }}>Atualizando</span>
              </div>
            )}
          </div>

          {/* Loterias responsible gambling notice */}
          {isLoto && (
            <div style={{ background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: T.radius.md, padding: '12px 16px', marginBottom: 16, fontSize: 12, color: '#78350F', lineHeight: 1.6 }}>
              <strong>Jogo responsavel.</strong> As sugestoes sao baseadas em estatistica historica e nao garantem resultado. Aposte somente o que pode perder.
            </div>
          )}

          {/* Sport sub-filters */}
          {!isLoto && (
            <div style={{ display: 'flex', gap: 8, marginBottom: 18, overflowX: 'auto' }}>
              {[`Todos (${espItems.length})`, 'Ao Vivo', 'Hoje', 'Proximos'].map((t, i) => (
                <button key={t} style={{ padding: '8px 16px', borderRadius: T.radius.pill, border: 'none', background: i === 0 ? T.black : T.gray2, color: i === 0 ? T.white : T.gray1, fontSize: 12, fontWeight: i === 0 ? 700 : 500, cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0 }}>
                  {t}
                </button>
              ))}
            </div>
          )}

          {/* Cards */}
          {isLoto
            ? appData.loterias.map(lot =>
                <LotoCard key={lot.id} lot={lot} onSelect={setSelItem} catUpdating={catUpd} />
              )
            : espItems.map(item =>
                <SportCard key={item.id} item={item} accentColor={accentColor} onSelect={setSelItem} catUpdating={catUpd} />
              )
          }

        </div>
      )}

      <BottomNav navKey={showLog ? 'engine' : navKey} onNav={handleNav} liveCount={totalLive} engineUpdating={updating} />

      {selItem && <BetSheet item={selItem} isLoto={isLoto} onClose={() => setSelItem(null)} />}

    </div>
  )
}
