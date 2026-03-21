import React, { useState, useEffect, useCallback, useRef } from 'react'

const API_KEY = import.meta.env.VITE_ANTHROPIC_API_KEY || ''

// ─── THEME ────────────────────────────────────────────────────────────────────
const T = {
  green:  '#00D672', black:  '#111111', white:  '#FFFFFF',
  bg:     '#F7F7F5', border: '#E8E8E4', gray1:  '#737373',
  gray2:  '#F0F0ED', gray3:  '#D4D4CC', red:    '#E53935',
  // Kalshi-style category colors
  cat:{ loterias:'#1A7A4A', futebol:'#1A7A4A', basquete:'#B45309', volei:'#5B21B6', mma:'#B91C1C', tenis:'#0369A1', esports:'#6D28D9' },
  // Kalshi category icon bg
  catBg:{ loterias:'#D1FAE5', futebol:'#DCFCE7', basquete:'#FEF3C7', volei:'#EDE9FE', mma:'#FEE2E2', tenis:'#DBEAFE', esports:'#F3E8FF' },
  r:{ sm:8, md:12, lg:16, pill:999 },
}

// ─── BREAKPOINT ───────────────────────────────────────────────────────────────
function useBreakpoint() {
  const [w, setW] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200)
  useEffect(() => {
    const fn = () => setW(window.innerWidth)
    window.addEventListener('resize', fn); return () => window.removeEventListener('resize', fn)
  }, [])
  return { isMobile: w < 768, isTablet: w >= 768 && w < 1100, isDesktop: w >= 1100, w }
}

// ─── DATA ─────────────────────────────────────────────────────────────────────
const LOTERIAS = [
  { id:'mega',      nome:'Mega-Sena',    dias:'Ter · Qui · Sáb', concurso:'2987', data:'21/03/2026', premio:'R$ 8.000.000',  acumulado:false, ultimoResultado:[1,5,13,26,41,53],                        aposta:'R$ 6,00',  descricao:'6 de 60 números',        regras:'Acerte 4, 5 ou 6', guruNums:[10,53,37,5,34,33],                           guruConf:18, guruAnalise:'Baseado em 2.986 sorteios. Dezenas 10 (352×), 53 (339×) e 37 (324×) lideram o histórico.' },
  { id:'lotofacil', nome:'Lotofácil',    dias:'Seg a Sáb',       concurso:'3642', data:'21/03/2026', premio:'R$ 3.000.000',  acumulado:false, ultimoResultado:[1,2,3,5,6,9,10,13,14,16,19,20,21,22,25],  aposta:'R$ 3,00',  descricao:'15 de 25 números',       regras:'Acerte 11 a 15',   guruNums:[20,25,10,11,13,2,5,3,7,8,14,17,19,21,23],    guruConf:34, guruAnalise:'Top 5: 20, 25, 10, 11, 13. Conc. 3641: 7 pares/8 ímpares — padrão mais frequente (65%).' },
  { id:'quina',     nome:'Quina',        dias:'Seg a Sáb',       concurso:'6982', data:'21/03/2026', premio:'R$ 2.500.000',  acumulado:false, ultimoResultado:[14,22,31,44,57],                          aposta:'R$ 3,00',  descricao:'5 de 80 números',        regras:'Acerte 2 a 5',     guruNums:[4,13,47,55,25],                              guruConf:22, guruAnalise:'Mais de 6.800 concursos. Dezenas frequentes: 04, 13, 47, 55, 25.' },
  { id:'timemania', nome:'Timemania',    dias:'Ter · Qui · Sáb', concurso:'2371', data:'22/03/2026', premio:'R$ 12.500.000', acumulado:true,  ultimoResultado:[8,14,27,33,42,51,68],                     aposta:'R$ 3,50',  descricao:'7 de 80 + Time',         regras:'Acerte 3 a 7',     guruNums:[14,27,38,42,55,61,70],                       guruConf:12, guruAnalise:'Acumulado. Conc. 2369 sem ganhador. Ciclo de atraso favorece extremos.' },
  { id:'duplasena', nome:'Dupla Sena',   dias:'Seg · Qua · Sex', concurso:'2940', data:'23/03/2026', premio:'R$ 6.500.000',  acumulado:true,  ultimoResultado:[7,18,25,33,41,48],                        aposta:'R$ 3,00',  descricao:'6 de 50 — 2 sorteios',   regras:'Acerte 3 a 6',     guruNums:[5,18,33,41,49,53],                            guruConf:15, guruAnalise:'Conc. 2939 sem ganhadores. Análise ponderada dos últimos 200 concursos.' },
  { id:'diadesorte',nome:'Dia de Sorte', dias:'Ter · Qui · Sáb', concurso:'1212', data:'22/03/2026', premio:'R$ 73.000.000', acumulado:true,  ultimoResultado:[4,7,13,18,22,24,29],                      aposta:'R$ 3,50',  descricao:'7 de 31 + Mês da Sorte', regras:'Acerte 4 a 7',     guruNums:[7,13,18,22,24,28,29],                        guruConf:14, guruAnalise:'R$ 73M acumulados. Atraso estratégico favorece dezenas 7, 13 e 18.' },
]

const ESPORTES = {
  futebol:  { label:'Futebol',   items:[
    { id:'f1', status:'live',     statusLabel:'Hoje · 21h30 · Morumbis',          competition:'Brasileirão · 8ª Rodada', title:'São Paulo × Palmeiras',      subtitle:'Choque-Rei pela liderança',           guruPick:'Palmeiras',     guruConf:62, guruReason:'Palmeiras líder com saldo +11. São Paulo sem Lucas Moura.',               home:{name:'São Paulo',    sub:'2º · 16pts', pct:31}, away:{name:'Palmeiras',     sub:'1º · 16pts', pct:48}, draw:21, vol:'R$ 18,4M' },
    { id:'f2', status:'live',     statusLabel:'Hoje · 20h30 · Neo Química',       competition:'Brasileirão · 8ª Rodada', title:'Corinthians × Flamengo',     subtitle:'Clássico nacional em SP',             guruPick:'Empate',        guruConf:38, guruReason:'Corinthians em casa, 5 sem vencer. Fla em 4 vitórias seguidas.',          home:{name:'Corinthians',  sub:'9º · 8pts',  pct:26}, away:{name:'Flamengo',      sub:'4º · 13pts', pct:44}, draw:30, vol:'R$ 14,2M' },
    { id:'f3', status:'upcoming', statusLabel:'22/03 · 18h30 · Maracanã',         competition:'Brasileirão · 8ª Rodada', title:'Fluminense × Atlético-MG',   subtitle:'Duelo direto na tabela',              guruPick:'Fluminense',    guruConf:48, guruReason:'Fluminense em casa, 5º com 13pts. Atlético oscila fora.',                home:{name:'Fluminense',   sub:'5º · 13pts', pct:44}, away:{name:'Atlético-MG',   sub:'8º · 10pts', pct:32}, draw:24, vol:'R$ 7,1M' },
    { id:'f4', status:'upcoming', statusLabel:'22/03 · 16h00 · Nilton Santos',    competition:'Brasileirão · 8ª Rodada', title:'Vasco × Grêmio',             subtitle:'Gigante da Colina vs Tricolor',       guruPick:'Vasco',         guruConf:52, guruReason:'Vasco em casa após 3×2 vs Flu. Grêmio com viagem longa.',               home:{name:'Vasco',        sub:'10º · 9pts', pct:45}, away:{name:'Grêmio',        sub:'7º · 11pts', pct:31}, draw:24, vol:'R$ 6,8M' },
  ]},
  basquete: { label:'Basquete',  items:[
    { id:'b1', status:'live',     statusLabel:'Hoje · 19h · Ibirapuera',          competition:'NBB 2025/26 · 30ª Rodada',title:'Flamengo × Pinheiros',       subtitle:'Líder recebe o Mengão em ascensão',   guruPick:'Flamengo',      guruConf:61, guruReason:'Fla virou 15pts de desvantagem recentemente. Muito motivado.',            home:{name:'Flamengo',     sub:'3º · 21V',   pct:58}, away:{name:'Pinheiros',     sub:'1º · 26V',   pct:30}, draw:12, vol:'R$ 2,1M' },
    { id:'b2', status:'upcoming', statusLabel:'21/03 · 20h · Arena Caixa',        competition:'NBB 2025/26 · 30ª Rodada',title:'Sesi Franca × Fortaleza BC', subtitle:'Tetracampeão busca mais vitória',      guruPick:'Sesi Franca',   guruConf:78, guruReason:'31pts de Lucas Dias. Franca venceu 8 dos últimos 10 jogos.',             home:{name:'Sesi Franca',  sub:'2º · 24V',   pct:72}, away:{name:'Fortaleza BC',  sub:'9º · 14V',   pct:16}, draw:12, vol:'R$ 1,4M' },
  ]},
  volei:    { label:'Vôlei',     items:[
    { id:'v1', status:'live',     statusLabel:'Hoje · 21h · Arena Paulo Skaf',    competition:'Superliga Masc. · Rd 10', title:'Joinville × Sada Cruzeiro',  subtitle:'Decacampeão visita Joinville',        guruPick:'Sada Cruzeiro', guruConf:67, guruReason:'Sada tem a melhor defesa da liga. Wallace e Douglas dominam.',            home:{name:'Joinville',    sub:'6º lugar',   pct:25}, away:{name:'Sada Cruzeiro', sub:'1º lugar',   pct:65}, draw:10, vol:'R$ 1,2M' },
    { id:'v2', status:'upcoming', statusLabel:'22/03 · 20h · Ginásio Mineirinho', competition:'Superliga Fem. · Rd 10',  title:'Praia Clube × Sesc Flamengo',subtitle:'Duelo de gigantes pelo topo',         guruPick:'Sesc Flamengo', guruConf:60, guruReason:'Sesc com Bernardinho é mais consistente na temporada.',                 home:{name:'Praia Clube',  sub:'3º lugar',   pct:31}, away:{name:'Sesc Flamengo', sub:'1º lugar',   pct:57}, draw:12, vol:'R$ 1,4M' },
  ]},
  mma:      { label:'MMA / UFC', items:[
    { id:'m1', status:'live',     statusLabel:'Hoje · UFC FN 270 · Londres',      competition:'UFC Fight Night 270',     title:'Evloev × Murphy',            subtitle:'Dois invictos pelo cinturão',         guruPick:'Decisão',       guruConf:55, guruReason:'Evloev 19-0 vs Murphy 17-0. Britânico em casa. Decisão técnica.',       home:{name:'L. Murphy',    sub:'17-0 · Pena',pct:44}, away:{name:'M. Evloev',    sub:'19-0 · Pena',pct:44}, draw:12, vol:'R$ 8,4M' },
    { id:'m2', status:'upcoming', statusLabel:'28/03 · Las Vegas',                competition:'UFC Fight Night',         title:'Adesanya × Pyfer',           subtitle:'Ex-campeão busca retorno ao top 5',   guruPick:'Adesanya',      guruConf:58, guruReason:'Melhor alcance, KO power e experiência de campeonato.',                 home:{name:'I. Adesanya',  sub:'25-4 · MW',  pct:55}, away:{name:'J. Pyfer',     sub:'13-2 · Top15',pct:34}, draw:11, vol:'R$ 6,2M' },
  ]},
  tenis:    { label:'Tênis',     items:[
    { id:'t1', status:'live',     statusLabel:'Hoje · Miami Open',                competition:'ATP Masters 1000 · Miami',title:'Sinner × Dzumhur',           subtitle:'Campeão IW estreia em Miami',         guruPick:'Sinner',        guruConf:92, guruReason:'Sinner venceu IW sem perder set. Dzumhur Nº74 sem histórico vs top5.',  home:{name:'J. Sinner',    sub:'Nº2 · IW Camp.',pct:89},away:{name:'D. Dzumhur',sub:'Nº74 ATP',pct:8}, draw:3, vol:'R$ 4,1M' },
    { id:'t2', status:'upcoming', statusLabel:'~27/03 · Miami Open Final',        competition:'ATP Miami 2026 · Projeção',title:'Sinner × Alcaraz',          subtitle:'Sunshine Double em disputa',          guruPick:'Sinner',        guruConf:47, guruReason:'Sinner tem 2 finais e 1 título em Miami. Alcaraz 2º favorito.',         home:{name:'J. Sinner',    sub:'Nº2 · Fav.',pct:44}, away:{name:'C. Alcaraz',   sub:'Nº1 · 16-1',pct:38}, draw:18, vol:'R$ 11,2M' },
  ]},
  esports:  { label:'E-sports',  items:[
    { id:'e1', status:'upcoming', statusLabel:'28/03 · CBLOL Etapa 1',            competition:'CBLOL 2026 · Etapa 1',    title:'LOUD × paiN Gaming',         subtitle:'Campeã estreia na Etapa 1',           guruPick:'LOUD',          guruConf:66, guruReason:'LOUD campeã Copa CBLOL 2026. Bull e RedBert dominantes.',               home:{name:'LOUD',         sub:'Campeã Copa', pct:62}, away:{name:'paiN Gaming',  sub:'4º Copa',    pct:24}, draw:14, vol:'R$ 1,8M' },
    { id:'e2', status:'upcoming', statusLabel:'06/06 · Grande Final',             competition:'CBLOL 2026 · Campeão',    title:'LOUD vence o campeonato?',   subtitle:'Projeção Etapa 1 completa',           guruPick:'LOUD',          guruConf:42, guruReason:'LOUD bicampeã com coesão. FURIA com bootcamp na Coreia é ameaça.',       home:{name:'LOUD',         sub:'Bicampeã',    pct:40}, away:{name:'FURIA/RED/Outro',sub:'Rivais',pct:60}, draw:0, vol:'R$ 5,6M' },
  ]},
}

const TABS = [
  { key:'loterias', label:'Loterias',  icon:'🎰' },
  { key:'futebol',  label:'Futebol',   icon:'⚽' },
  { key:'basquete', label:'Basquete',  icon:'🏀' },
  { key:'volei',    label:'Vôlei',     icon:'🏐' },
  { key:'mma',      label:'MMA / UFC', icon:'🥊' },
  { key:'tenis',    label:'Tênis',     icon:'🎾' },
  { key:'esports',  label:'E-sports',  icon:'🎮' },
]

// ─── AI ENGINE ────────────────────────────────────────────────────────────────
const INTERVAL = 2 * 60 * 60 * 1000

async function callClaude(data, category) {
  const hora = new Date().toLocaleTimeString('pt-BR', { hour:'2-digit', minute:'2-digit' })
  const system = `Você é o motor de análise do Guru das Bets. Responda SOMENTE JSON válido, sem markdown. Hora: ${hora}`
  let prompt = ''
  if (category === 'loterias') {
    prompt = `Recalcule previsões das loterias Caixa com base em frequência histórica e ciclo de atraso.
Dados: ${JSON.stringify(data.loterias.map(l=>({id:l.id,guruNums:l.guruNums,guruConf:l.guruConf})))}
Retorne JSON array:
[{"id":"mega","guruNums":[n,n,n,n,n,n],"guruConf":18,"guruAnalise":"max 120 chars"},
 {"id":"lotofacil","guruNums":[15 distintos 1-25],"guruConf":34,"guruAnalise":"..."},
 {"id":"quina","guruNums":[5 de 1-80],"guruConf":22,"guruAnalise":"..."},
 {"id":"timemania","guruNums":[7 de 1-80],"guruConf":12,"guruAnalise":"..."},
 {"id":"duplasena","guruNums":[6 de 1-50],"guruConf":15,"guruAnalise":"..."},
 {"id":"diadesorte","guruNums":[7 de 1-31],"guruConf":14,"guruAnalise":"..."}]`
  } else {
    const esp = data.esportes[category]; if (!esp) return null
    prompt = `Recalcule previsões para ${esp.label}.
Dados: ${JSON.stringify(esp.items.map(i=>({id:i.id,title:i.title,guruPick:i.guruPick,guruConf:i.guruConf})))}
Retorne JSON array (${esp.items.length} itens):
[{"id":"...","guruPick":"...","guruConf":0-95,"guruReason":"max 100 chars","homePct":0-100,"awayPct":0-100,"draw":0-100}]
homePct+awayPct+draw=100`
  }
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method:'POST',
    headers:{'Content-Type':'application/json','x-api-key':API_KEY,'anthropic-version':'2023-06-01','anthropic-dangerous-direct-browser-access':'true'},
    body:JSON.stringify({model:'claude-sonnet-4-20250514',max_tokens:1200,system,messages:[{role:'user',content:prompt}]}),
  })
  if (!res.ok) throw new Error(`API ${res.status}`)
  const json = await res.json()
  const txt = json.content?.find(b=>b.type==='text')?.text||'[]'
  return JSON.parse(txt.replace(/```json|```/g,'').trim())
}

function useAutoUpdate(seed) {
  const [appData,  setAppData]  = useState(seed)
  const [logs,     setLogs]     = useState([])
  const [updating, setUpdating] = useState(false)
  const [lastAt,   setLastAt]   = useState(null)
  const [nextAt,   setNextAt]   = useState(null)
  const [queue,    setQueue]    = useState([])
  const [countdown,setCountdown]= useState('')
  const timerRef = useRef(null); const cdRef = useRef(null)

  const addLog = useCallback((msg,t='info') => {
    const ts = new Date().toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit',second:'2-digit'})
    setLogs(p=>[{msg,t,ts},...p].slice(0,50))
  },[])

  const runCycle = useCallback(async(cur,manual=false) => {
    setUpdating(true); const cats=['loterias',...Object.keys(ESPORTES)]; setQueue([...cats])
    addLog(manual?'Atualização manual':'Ciclo automático de 2h','start')
    const nd={loterias:[...cur.loterias],esportes:{...cur.esportes}}; let ok=0
    for (const cat of cats) {
      setQueue(q=>q.filter(c=>c!==cat)); addLog(`Analisando: ${cat}`,'loading')
      try {
        const upd=await callClaude(nd,cat)
        if (!upd||!Array.isArray(upd)){addLog(`${cat}: inválido`,'warn');continue}
        if (cat==='loterias') { nd.loterias=nd.loterias.map(l=>{const u=upd.find(x=>x.id===l.id);return u?{...l,...u}:l}) }
        else {
          if (!nd.esportes[cat]) continue
          nd.esportes[cat]={...nd.esportes[cat],items:nd.esportes[cat].items.map(item=>{
            const u=upd.find(x=>x.id===item.id); if (!u) return item
            return{...item,guruPick:u.guruPick||item.guruPick,guruConf:u.guruConf??item.guruConf,guruReason:u.guruReason||item.guruReason,home:{...item.home,pct:u.homePct??item.home.pct},away:{...item.away,pct:u.awayPct??item.away.pct},draw:u.draw??item.draw}
          })}
        }
        setAppData({...nd}); ok++; addLog(`${cat}: ${upd.length} itens`,'success')
      } catch(e){addLog(`${cat}: ${e.message}`,'error')}
      await new Promise(r=>setTimeout(r,400))
    }
    const ts=new Date(); setLastAt(ts); setNextAt(new Date(ts.getTime()+INTERVAL))
    setUpdating(false); setQueue([]); addLog(`Concluído — ${ok}/${cats.length}`,'done')
  },[addLog])

  useEffect(()=>{
    cdRef.current=setInterval(()=>{
      if (!nextAt){setCountdown('');return}
      const d=nextAt-Date.now(); if(d<=0){setCountdown('Agora');return}
      const h=Math.floor(d/3600000),m=Math.floor((d%3600000)/60000),s=Math.floor((d%60000)/1000)
      setCountdown(`${h}h ${String(m).padStart(2,'0')}m ${String(s).padStart(2,'0')}s`)
    },1000); return()=>clearInterval(cdRef.current)
  },[nextAt])

  useEffect(()=>{
    runCycle(seed)
    timerRef.current=setInterval(()=>{setAppData(cur=>{runCycle(cur);return cur})},INTERVAL)
    return()=>clearInterval(timerRef.current)
  },[]) // eslint-disable-line

  const force=useCallback(()=>{if(!updating)setAppData(cur=>{runCycle(cur,true);return cur})},[updating,runCycle])
  return{appData,logs,updating,lastAt,countdown,queue,force}
}

// ─── BALL (loterias) ──────────────────────────────────────────────────────────
function Ball({n,size=26,bg=T.gray2,color=T.black}) {
  return <div style={{width:size,height:size,borderRadius:'50%',background:bg,display:'flex',alignItems:'center',justifyContent:'center',fontSize:10,fontWeight:700,color,flexShrink:0}}>{String(n).padStart(2,'0')}</div>
}

// ─── KALSHI SPORT CARD (desktop) ──────────────────────────────────────────────
function KalshiSportCard({item,catKey,onSelect,catUpdating}) {
  const [hov,setHov]=useState(false)
  const live=item.status==='live'
  const catColor=T.cat[catKey]||T.black
  const catBg=T.catBg[catKey]||T.gray2
  const label=TABS.find(t=>t.key===catKey)?.label||catKey
  const icon=TABS.find(t=>t.key===catKey)?.icon||'🏅'

  return (
    <div onClick={()=>onSelect(item)} onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      style={{background:T.white,borderRadius:T.r.lg,border:`1px solid ${hov?'#C8C8C0':T.border}`,cursor:'pointer',overflow:'hidden',transition:'box-shadow 0.15s,border-color 0.15s',boxShadow:hov?'0 2px 16px rgba(0,0,0,0.1)':'0 1px 3px rgba(0,0,0,0.04)',display:'flex',flexDirection:'column'}}>

      {/* Category header row */}
      <div style={{padding:'12px 14px 10px',display:'flex',justifyContent:'space-between',alignItems:'center',borderBottom:`1px solid ${T.border}`}}>
        <div style={{display:'flex',alignItems:'center',gap:8}}>
          <div style={{width:28,height:28,borderRadius:8,background:catBg,display:'flex',alignItems:'center',justifyContent:'center',fontSize:14,flexShrink:0}}>
            {icon}
          </div>
          <span style={{fontSize:11,fontWeight:700,color:catColor,letterSpacing:'0.03em',textTransform:'uppercase'}}>{label}</span>
        </div>
        <span style={{fontSize:11,color:T.gray1,fontWeight:400}}>{item.competition}</span>
      </div>

      {/* Title + status */}
      <div style={{padding:'12px 14px 10px'}}>
        <div style={{fontSize:15,fontWeight:700,color:T.black,lineHeight:1.3,marginBottom:6,letterSpacing:'-0.02em'}}>{item.title}</div>
        <div style={{display:'flex',alignItems:'center',gap:5}}>
          {live && <><span style={{width:7,height:7,borderRadius:'50%',background:T.red,flexShrink:0,display:'inline-block'}}/>
            <span style={{fontSize:11,fontWeight:700,color:T.red}}>AO VIVO</span>
            <span style={{color:T.gray1,fontSize:11}}> · </span></>}
          <span style={{fontSize:11,color:T.gray1}}>{item.statusLabel}</span>
        </div>
      </div>

      {/* Teams rows — Kalshi style */}
      <div style={{padding:'0 14px',flex:1}}>
        {[item.home, item.away].map((side,i)=>{
          const isWinner = side.pct > (i===0 ? item.away.pct : item.home.pct)
          const conf = catUpdating ? null : side.pct
          return (
            <div key={i} style={{display:'flex',alignItems:'center',gap:10,padding:'7px 0',borderBottom:i===0?`1px solid ${T.border}`:'none'}}>
              {/* name + underline bar */}
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:14,fontWeight:isWinner?700:500,color:T.black,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',marginBottom:3}}>{side.name}</div>
                <div style={{height:2,borderRadius:1,background:isWinner?catColor:T.gray3,width:`${Math.max(20,side.pct)}%`,transition:'width 0.5s'}}/>
              </div>
              {/* Probability pill — Kalshi green outlined */}
              <div style={{
                minWidth:52,textAlign:'center',
                padding:'4px 10px',
                borderRadius:T.r.pill,
                border:`1.5px solid ${catUpdating?T.gray3:'#16A34A'}`,
                color:catUpdating?T.gray1:'#15803D',
                fontSize:13,fontWeight:800,
                background:catUpdating?T.gray2:'#F0FDF4',
                flexShrink:0,
              }}>
                {catUpdating?'—':`${conf}%`}
              </div>
            </div>
          )
        })}
      </div>

      {/* Guru insight strip */}
      {!catUpdating && (
        <div style={{margin:'10px 14px 0',background:'#F8F8F5',borderRadius:T.r.sm,padding:'8px 10px',display:'flex',alignItems:'flex-start',gap:8}}>
          <span style={{fontSize:10,fontWeight:700,color:catColor,whiteSpace:'nowrap',paddingTop:1}}>GURU</span>
          <span style={{fontSize:11,color:T.gray1,lineHeight:1.4,flex:1}}>{item.guruPick} · {item.guruReason}</span>
          <span style={{fontSize:11,fontWeight:800,color:T.black,flexShrink:0}}>{item.guruConf}%</span>
        </div>
      )}

      {/* Footer */}
      <div style={{padding:'10px 14px 12px',display:'flex',justifyContent:'space-between',alignItems:'center',marginTop:4}}>
        <span style={{fontSize:12,color:T.gray1}}>{item.vol} vol.</span>
        <span style={{fontSize:12,color:T.gray1}}>Empate {item.draw}%</span>
      </div>
    </div>
  )
}

// ─── KALSHI LOTO CARD (desktop) ───────────────────────────────────────────────
function KalshiLotoCard({lot,onSelect,catUpdating}) {
  const [hov,setHov]=useState(false)
  return (
    <div onClick={()=>onSelect(lot)} onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      style={{background:T.white,borderRadius:T.r.lg,border:`1px solid ${hov?'#C8C8C0':T.border}`,cursor:'pointer',overflow:'hidden',transition:'box-shadow 0.15s,border-color 0.15s',boxShadow:hov?'0 2px 16px rgba(0,0,0,0.1)':'0 1px 3px rgba(0,0,0,0.04)',display:'flex',flexDirection:'column'}}>

      {/* Category header */}
      <div style={{padding:'12px 14px 10px',display:'flex',justifyContent:'space-between',alignItems:'center',borderBottom:`1px solid ${T.border}`}}>
        <div style={{display:'flex',alignItems:'center',gap:8}}>
          <div style={{width:28,height:28,borderRadius:8,background:T.catBg.loterias,display:'flex',alignItems:'center',justifyContent:'center',fontSize:14}}>🎰</div>
          <span style={{fontSize:11,fontWeight:700,color:T.cat.loterias,letterSpacing:'0.03em',textTransform:'uppercase'}}>LOTERIA</span>
        </div>
        <div style={{display:'flex',gap:6,alignItems:'center'}}>
          {lot.acumulado && <span style={{fontSize:10,fontWeight:700,background:'#FEF3C7',color:'#B45309',borderRadius:4,padding:'2px 7px'}}>ACUMULADO</span>}
          <span style={{fontSize:11,color:T.gray1}}>{lot.dias}</span>
        </div>
      </div>

      {/* Title + prize */}
      <div style={{padding:'12px 14px 10px'}}>
        <div style={{fontSize:16,fontWeight:800,color:T.black,letterSpacing:'-0.03em',marginBottom:3}}>{lot.nome}</div>
        <div style={{display:'flex',alignItems:'baseline',gap:8}}>
          <span style={{fontSize:20,fontWeight:900,color:T.black,letterSpacing:'-0.04em'}}>{lot.premio}</span>
          <span style={{fontSize:11,color:T.gray1}}>Sorteio {lot.data}</span>
        </div>
      </div>

      {/* Last result row */}
      <div style={{padding:'0 14px 10px'}}>
        <div style={{fontSize:10,fontWeight:700,color:T.gray1,letterSpacing:'0.05em',marginBottom:6}}>ÚLTIMO RESULTADO</div>
        <div style={{display:'flex',gap:4,flexWrap:'wrap'}}>
          {lot.ultimoResultado.map(n=><Ball key={n} n={n} size={24}/>)}
        </div>
      </div>

      {/* Guru row — like Kalshi probability rows */}
      <div style={{padding:'0 14px',flex:1}}>
        <div style={{borderTop:`1px solid ${T.border}`,paddingTop:10,paddingBottom:8}}>
          <div style={{display:'flex',alignItems:'flex-start',gap:10,marginBottom:10}}>
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontSize:13,fontWeight:700,color:T.black,marginBottom:3}}>
                {catUpdating?'Atualizando previsão...':'Guru sugere'}
              </div>
              <div style={{display:'flex',gap:3,flexWrap:'wrap'}}>
                {(lot.guruNums||[]).map(n=><Ball key={n} n={n} size={24} bg={catUpdating?T.gray3:T.black} color={T.white}/>)}
              </div>
            </div>
            <div style={{
              minWidth:52,textAlign:'center',
              padding:'4px 10px',borderRadius:T.r.pill,
              border:`1.5px solid ${catUpdating?T.gray3:'#16A34A'}`,
              color:catUpdating?T.gray1:'#15803D',
              fontSize:13,fontWeight:800,
              background:catUpdating?T.gray2:'#F0FDF4',
              flexShrink:0,marginTop:2,
            }}>
              {catUpdating?'—':`${lot.guruConf}%`}
            </div>
          </div>
          {!catUpdating && <p style={{fontSize:11,color:T.gray1,lineHeight:1.5,margin:0}}>{lot.guruAnalise}</p>}
        </div>
      </div>

      {/* Footer */}
      <div style={{padding:'8px 14px 12px',display:'flex',justifyContent:'space-between'}}>
        <span style={{fontSize:12,color:T.gray1}}>Conc. {lot.concurso}</span>
        <span style={{fontSize:12,color:T.gray1}}>Min {lot.aposta}</span>
      </div>
    </div>
  )
}

// ─── MOBILE CARDS (original style) ────────────────────────────────────────────
function Ball2({n,size=28,bg=T.gray2,color=T.black}) {
  return <div style={{width:size,height:size,borderRadius:'50%',background:bg,display:'flex',alignItems:'center',justifyContent:'center',fontSize:10,fontWeight:700,color,flexShrink:0}}>{String(n).padStart(2,'0')}</div>
}

function LotoCard({lot,onSelect,catUpdating}) {
  const [hov,setHov]=useState(false)
  return (
    <div onClick={()=>onSelect(lot)} onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      style={{background:T.white,borderRadius:T.r.lg,border:`1px solid ${T.border}`,marginBottom:12,overflow:'hidden',cursor:'pointer',boxShadow:hov?'0 4px 24px rgba(0,0,0,0.09)':'none',transition:'box-shadow 0.15s'}}>
      <div style={{height:3,background:lot.acumulado?'#F59E0B':T.cat.loterias}}/>
      <div style={{padding:'18px 20px'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:14}}>
          <div>
            <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:3}}>
              <span style={{fontSize:17,fontWeight:800,color:T.black,letterSpacing:'-0.03em'}}>{lot.nome}</span>
              {lot.acumulado&&<span style={{fontSize:10,fontWeight:700,background:'#FFF3E0',color:'#B45309',borderRadius:6,padding:'2px 8px'}}>ACUMULADO</span>}
            </div>
            <div style={{fontSize:12,color:T.gray1}}>{lot.descricao} · {lot.dias} · Conc. {lot.concurso}</div>
          </div>
          <div style={{textAlign:'right',flexShrink:0,marginLeft:12}}>
            <div style={{fontSize:18,fontWeight:900,color:T.black,letterSpacing:'-0.03em',lineHeight:1}}>{lot.premio}</div>
            <div style={{fontSize:11,color:T.gray1,marginTop:3}}>Sorteio {lot.data}</div>
          </div>
        </div>
        <div style={{height:1,background:T.border,marginBottom:14}}/>
        <div style={{marginBottom:14}}>
          <div style={{fontSize:10,fontWeight:700,color:T.gray1,letterSpacing:'0.06em',marginBottom:8}}>ÚLTIMO RESULTADO</div>
          <div style={{display:'flex',gap:5,flexWrap:'wrap'}}>{lot.ultimoResultado.map(n=><Ball2 key={n} n={n}/>)}</div>
        </div>
        <div style={{background:T.bg,borderRadius:T.r.md,padding:'12px 14px'}}>
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:10}}>
            <span style={{fontSize:10,fontWeight:700,color:T.black,letterSpacing:'0.06em'}}>{catUpdating?'ATUALIZANDO...':'GURU SUGERE'}</span>
            <span style={{fontSize:11,fontWeight:800,background:catUpdating?T.gray3:T.green,color:catUpdating?T.gray1:T.black,borderRadius:T.r.pill,padding:'2px 10px'}}>{lot.guruConf}% conf.</span>
          </div>
          <div style={{display:'flex',gap:5,flexWrap:'wrap',marginBottom:10}}>{(lot.guruNums||[]).map(n=><Ball2 key={n} n={n} bg={catUpdating?T.gray3:T.black} color={T.white}/>)}</div>
          <p style={{fontSize:11,color:T.gray1,lineHeight:1.55,margin:0}}>{lot.guruAnalise}</p>
        </div>
        <div style={{display:'flex',justifyContent:'space-between',marginTop:12}}>
          <span style={{fontSize:11,color:T.gray1}}>Min: <strong style={{color:T.black}}>{lot.aposta}</strong></span>
          <span style={{fontSize:11,color:T.gray1}}>{lot.regras}</span>
        </div>
      </div>
    </div>
  )
}

function SportCard({item,onSelect,catUpdating}) {
  const live=item.status==='live'; const [hov,setHov]=useState(false)
  return (
    <div onClick={()=>onSelect(item)} onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      style={{background:T.white,borderRadius:T.r.lg,border:`1px solid ${T.border}`,marginBottom:12,overflow:'hidden',cursor:'pointer',boxShadow:hov?'0 4px 24px rgba(0,0,0,0.09)':'none',transition:'box-shadow 0.15s'}}>
      <div style={{height:3,background:live?T.red:T.border}}/>
      <div style={{padding:'16px 20px'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10}}>
          <div style={{display:'flex',alignItems:'center',gap:6}}>
            {live&&<><div style={{width:7,height:7,borderRadius:'50%',background:T.red}}/><span style={{fontSize:11,fontWeight:700,color:T.red}}>AO VIVO</span><span style={{color:T.gray1}}> · </span></>}
            <span style={{fontSize:11,color:T.gray1}}>{item.statusLabel}</span>
          </div>
          <span style={{fontSize:11,color:T.gray1}}>{item.competition}</span>
        </div>
        <div style={{marginBottom:12}}>
          <div style={{fontSize:19,fontWeight:900,color:T.black,letterSpacing:'-0.04em',lineHeight:1.15}}>{item.title}</div>
          <div style={{fontSize:12,color:T.gray1,marginTop:3}}>{item.subtitle}</div>
        </div>
        <div style={{background:T.bg,borderRadius:T.r.md,padding:'10px 12px',marginBottom:14,display:'flex',alignItems:'flex-start',gap:10}}>
          <div style={{flex:1}}>
            <span style={{fontSize:11,fontWeight:700,color:T.black}}>{catUpdating?'Atualizando...':`Guru: ${item.guruPick}`}</span>
            {!catUpdating&&item.guruReason&&<p style={{fontSize:11,color:T.gray1,margin:'3px 0 0',lineHeight:1.5}}>{item.guruReason}</p>}
          </div>
          <div style={{background:catUpdating?T.gray3:T.black,color:catUpdating?T.gray1:T.white,borderRadius:T.r.pill,padding:'3px 10px',fontSize:11,fontWeight:800,flexShrink:0}}>{item.guruConf}%</div>
        </div>
        <div style={{display:'flex',flexDirection:'column',gap:10}}>
          {[item.home,item.away].map((side,i)=>(
            <div key={i} style={{display:'flex',alignItems:'center',gap:10}}>
              <div style={{width:3,height:36,borderRadius:2,background:T.border,flexShrink:0}}/>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:14,fontWeight:700,color:T.black,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{side.name}</div>
                <div style={{fontSize:11,color:T.gray1}}>{side.sub}</div>
              </div>
              <div style={{textAlign:'right',flexShrink:0}}>
                <div style={{fontSize:17,fontWeight:900,color:T.black}}>{side.pct}%</div>
                <div style={{width:52,height:3,background:T.border,borderRadius:2,marginTop:3}}>
                  <div style={{width:`${side.pct}%`,height:'100%',background:side.pct>50?T.black:T.gray3,borderRadius:2,transition:'width 0.5s'}}/>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div style={{display:'flex',justifyContent:'space-between',marginTop:12,paddingTop:10,borderTop:`1px solid ${T.border}`}}>
          <span style={{fontSize:11,color:T.gray1}}>Empate: {item.draw}%</span>
          <span style={{fontSize:11,color:T.gray1}}>{item.vol} vol.</span>
        </div>
      </div>
    </div>
  )
}

// ─── BET SHEET ────────────────────────────────────────────────────────────────
function BetSheet({item,isLoto,onClose}) {
  const [amount,setAmount]=useState(''); const [choice,setChoice]=useState('yes')
  const [betType,setBetType]=useState('simples'); const [done,setDone]=useState(false)
  const {isMobile}=useBreakpoint(); if (!item) return null
  const na=parseFloat(amount)||0
  const yp=isLoto?50:(item.home?.pct||50); const np=isLoto?50:(item.away?.pct||50)
  const unit=(choice==='yes'?yp:np)/100
  const ret=na>0?(na/unit).toFixed(2):null; const luc=na>0?((na/unit)-na).toFixed(2):null
  const panelStyle=isMobile
    ?{width:'100%',maxWidth:500,background:T.white,borderRadius:'22px 22px 0 0',maxHeight:'90vh',overflowY:'auto',animation:'slideUp 0.28s cubic-bezier(0.32,0.72,0,1)'}
    :{width:'100%',maxWidth:540,background:T.white,borderRadius:T.r.lg,maxHeight:'88vh',overflowY:'auto',boxShadow:'0 24px 64px rgba(0,0,0,0.18)',animation:'fadeIn 0.2s ease'}

  return (
    <div onClick={onClose} style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.45)',zIndex:300,display:'flex',alignItems:isMobile?'flex-end':'center',justifyContent:'center'}}>
      <div onClick={e=>e.stopPropagation()} style={panelStyle}>
        {isMobile&&<div style={{display:'flex',justifyContent:'center',padding:'14px 0 6px'}}><div style={{width:36,height:4,borderRadius:2,background:T.border}}/></div>}
        {!isMobile&&<div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'24px 28px 0'}}><span style={{fontSize:17,fontWeight:800,color:T.black}}>{isLoto?item.nome:item.title}</span><button onClick={onClose} style={{width:32,height:32,borderRadius:'50%',border:'none',background:T.gray2,cursor:'pointer',fontSize:20,color:T.gray1,display:'flex',alignItems:'center',justifyContent:'center',lineHeight:1}}>×</button></div>}
        {done?(
          <div style={{padding:'28px 28px 44px',textAlign:'center'}}>
            <div style={{width:56,height:56,borderRadius:'50%',background:T.green,margin:'0 auto 16px',display:'flex',alignItems:'center',justifyContent:'center'}}>
              <svg width="28" height="28" fill="none" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7" stroke={T.black} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
            <div style={{fontSize:22,fontWeight:900,color:T.black,letterSpacing:'-0.04em',marginBottom:8}}>{isLoto?'Boa sorte!':'Aposta registrada!'}</div>
            <div style={{fontSize:14,color:T.gray1,lineHeight:1.6,marginBottom:24}}>{isLoto?<>R$ {na.toFixed(2)} na <strong style={{color:T.black}}>{item.nome}</strong><br/>Sorteio em {item.data}</>:<>R$ {na.toFixed(2)} em <strong style={{color:T.black}}>{choice==='yes'?item.home?.name:item.away?.name}</strong></>}</div>
            <button onClick={onClose} style={{width:'100%',padding:'16px',borderRadius:T.r.md,background:T.black,border:'none',color:T.white,fontSize:16,fontWeight:700,cursor:'pointer'}}>Voltar aos mercados</button>
          </div>
        ):(
          <div style={{padding:isMobile?'8px 24px 44px':'20px 28px 32px'}}>
            <div style={{background:T.bg,borderRadius:T.r.md,padding:'14px 16px',marginBottom:16}}>
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:10}}>
                <span style={{fontSize:10,fontWeight:700,color:T.black,letterSpacing:'0.06em'}}>ANÁLISE DO GURU</span>
                <span style={{fontSize:12,fontWeight:800,background:T.green,color:T.black,borderRadius:T.r.pill,padding:'3px 12px'}}>{item.guruConf}%</span>
              </div>
              {isLoto?(<><p style={{fontSize:12,color:T.gray1,lineHeight:1.6,marginBottom:10}}>{item.guruAnalise}</p><div style={{fontSize:11,fontWeight:700,color:T.black,marginBottom:8}}>Números — concurso {item.concurso}</div><div style={{display:'flex',gap:5,flexWrap:'wrap'}}>{(item.guruNums||[]).map(n=><Ball2 key={n} n={n} bg={T.black} color={T.white}/>)}</div></>)
              :(<><div style={{fontSize:17,fontWeight:900,color:T.black,letterSpacing:'-0.03em',marginBottom:4}}>{item.guruPick}</div><p style={{fontSize:12,color:T.gray1,lineHeight:1.5,margin:0}}>{item.guruReason}</p></>)}
            </div>
            {isLoto&&<div style={{background:'#FFFBEB',border:'1px solid #FDE68A',borderRadius:T.r.sm,padding:'10px 14px',marginBottom:14,fontSize:11,color:'#78350F',lineHeight:1.5}}>Loteria é jogo de azar. Sugestão estatística sem garantia.</div>}
            {!isLoto&&(<>
              <div style={{display:'flex',background:T.bg,borderRadius:T.r.md,padding:4,marginBottom:14}}>
                {['buy','sell'].map(m=><button key={m} style={{flex:1,padding:'10px',borderRadius:T.r.sm,border:'none',background:m==='buy'?T.white:'transparent',color:m==='buy'?T.black:T.gray1,fontWeight:m==='buy'?700:500,fontSize:14,cursor:'pointer',boxShadow:m==='buy'?'0 1px 3px rgba(0,0,0,0.08)':'none'}}>{m==='buy'?'Comprar':'Vender'}</button>)}
              </div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:14}}>
                {[{key:'yes',label:'Sim',price:yp,name:item.home?.name},{key:'no',label:'Não',price:np,name:item.away?.name}].map(o=>(
                  <button key={o.key} onClick={()=>setChoice(o.key)} style={{padding:'13px 10px',borderRadius:T.r.md,border:`2px solid ${choice===o.key?T.black:T.border}`,background:choice===o.key?T.bg:T.white,cursor:'pointer',textAlign:'center',transition:'all 0.15s'}}>
                    <div style={{fontSize:17,fontWeight:900,color:T.black}}>{o.label} {o.price}¢</div>
                    <div style={{fontSize:11,color:T.gray1,marginTop:3,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{o.name}</div>
                  </button>
                ))}
              </div>
            </>)}
            {isLoto&&<div style={{marginBottom:14}}><div style={{fontSize:12,fontWeight:700,color:T.black,marginBottom:8}}>Tipo de aposta</div><div style={{display:'flex',background:T.bg,borderRadius:T.r.md,padding:4}}>{['simples','bolão','teimosinha'].map(t=><button key={t} onClick={()=>setBetType(t)} style={{flex:1,padding:'9px 4px',borderRadius:T.r.sm,border:'none',background:betType===t?T.white:'transparent',color:betType===t?T.black:T.gray1,fontWeight:betType===t?700:500,fontSize:12,cursor:'pointer',textTransform:'capitalize'}}>{t}</button>)}</div></div>}
            <div style={{border:`1.5px solid ${T.border}`,borderRadius:T.r.md,padding:'16px 18px',marginBottom:12}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                <div><div style={{fontSize:14,fontWeight:700,color:T.black}}>Valor</div><div style={{fontSize:11,color:T.cat.loterias,fontWeight:600,marginTop:2}}>+3,25% de rendimento</div></div>
                <div style={{display:'flex',alignItems:'center',gap:4}}><span style={{fontSize:20,color:T.gray1,fontWeight:300}}>R$</span><input type="number" value={amount} onChange={e=>setAmount(e.target.value)} placeholder="0" style={{width:90,fontSize:26,fontWeight:300,color:amount?T.black:T.gray3,border:'none',outline:'none',textAlign:'right',background:'transparent',fontFamily:'inherit'}}/></div>
              </div>
            </div>
            <div style={{display:'flex',gap:8,marginBottom:14}}>
              {(isLoto?['3','6','10','25']:['10','25','50','100']).map(v=>(
                <button key={v} onClick={()=>setAmount(v)} style={{flex:1,padding:'10px 0',borderRadius:T.r.sm,border:`1.5px solid ${amount===v?T.black:T.border}`,background:amount===v?T.black:T.bg,color:amount===v?T.white:T.black,fontSize:13,fontWeight:700,cursor:'pointer',transition:'all 0.15s'}}>R${v}</button>
              ))}
            </div>
            {!isLoto&&na>0&&<div style={{background:T.bg,borderRadius:T.r.md,padding:'12px 14px',marginBottom:14}}><div style={{display:'flex',justifyContent:'space-between',marginBottom:4}}><span style={{fontSize:13,color:T.gray1}}>Retorno total</span><span style={{fontSize:14,fontWeight:800,color:T.black}}>R$ {ret}</span></div><div style={{display:'flex',justifyContent:'space-between'}}><span style={{fontSize:12,color:T.gray1}}>Lucro se ganhar</span><span style={{fontSize:13,fontWeight:700,color:T.cat.loterias}}>+R$ {luc}</span></div></div>}
            <button onClick={()=>{if(na>0)setDone(true)}} style={{width:'100%',padding:'17px',borderRadius:T.r.md,background:na>0?T.black:T.gray2,border:'none',color:na>0?T.white:T.gray1,fontSize:16,fontWeight:700,cursor:na>0?'pointer':'default',transition:'background 0.2s'}}>
              {na>0?(isLoto?`Apostar R$ ${na.toFixed(2)} na ${item.nome}`:`Confirmar R$ ${na.toFixed(2)}`):'Digite o valor para continuar'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── ENGINE LOG ───────────────────────────────────────────────────────────────
const LOG_C={info:T.gray1,start:'#7C3AED',loading:'#D97706',success:'#059669',warn:'#D97706',error:'#DC2626',done:'#0369A1'}

function EngineLog({logs,updating,lastAt,countdown,queue,force}) {
  return (
    <div>
      <div style={{background:T.white,borderRadius:T.r.lg,border:`1px solid ${T.border}`,padding:'20px',marginBottom:14}}>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:16}}>
          <div>
            <div style={{fontSize:16,fontWeight:800,color:T.black}}>{updating?'Analisando...':'Motor ativo'}</div>
            <div style={{fontSize:12,color:T.gray1,marginTop:3}}>Última: {lastAt?lastAt.toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit',second:'2-digit'}):'Aguardando'}</div>
          </div>
          <button onClick={force} disabled={updating} style={{padding:'10px 20px',borderRadius:T.r.pill,background:updating?T.gray2:T.black,border:'none',color:updating?T.gray1:T.white,fontSize:13,fontWeight:700,cursor:updating?'not-allowed':'pointer'}}>
            {updating?'Analisando...':'Atualizar agora'}
          </button>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
          <div style={{background:T.bg,borderRadius:T.r.sm,padding:'12px 14px'}}>
            <div style={{fontSize:10,fontWeight:600,color:T.gray1,letterSpacing:'0.05em',marginBottom:4}}>INTERVALO</div>
            <div style={{fontSize:20,fontWeight:900,color:T.black}}>2 horas</div>
          </div>
          <div style={{background:T.bg,borderRadius:T.r.sm,padding:'12px 14px'}}>
            <div style={{fontSize:10,fontWeight:600,color:T.gray1,letterSpacing:'0.05em',marginBottom:4}}>PRÓXIMA EM</div>
            <div style={{fontSize:16,fontWeight:900,color:T.cat.loterias,fontVariantNumeric:'tabular-nums'}}>{countdown||'—'}</div>
          </div>
        </div>
        {updating&&queue.length>0&&<div style={{marginTop:12}}><div style={{fontSize:11,color:T.gray1,marginBottom:6}}>Na fila:</div><div style={{display:'flex',gap:6,flexWrap:'wrap'}}>{queue.map(c=>{const m=TABS.find(t=>t.key===c);return<span key={c} style={{fontSize:11,background:T.bg,borderRadius:T.r.pill,padding:'3px 10px',color:T.black,fontWeight:600,border:`1px solid ${T.border}`}}>{m?.label||c}</span>})}</div></div>}
      </div>
      <div style={{background:'#EFF6FF',borderRadius:T.r.md,border:'1px solid #BFDBFE',padding:'14px 16px',marginBottom:14}}>
        <div style={{fontSize:13,fontWeight:800,color:'#1D4ED8',marginBottom:6}}>Como funciona</div>
        <div style={{fontSize:12,color:'#3B82F6',lineHeight:1.7}}>A cada <strong>2 horas</strong>, o motor chama a <strong>API do Claude</strong> e reanálisa todas as 7 categorias.</div>
      </div>
      <div style={{background:'#0F172A',borderRadius:T.r.lg,padding:'16px',overflow:'hidden'}}>
        <div style={{fontSize:11,color:T.green,fontWeight:700,marginBottom:12,letterSpacing:'0.08em',fontFamily:'monospace'}}>LOG DO MOTOR</div>
        {logs.length===0&&<div style={{fontSize:12,color:'#475569',fontFamily:'monospace'}}>Aguardando primeiro ciclo...</div>}
        {logs.map((l,i)=>(
          <div key={i} style={{display:'flex',gap:10,marginBottom:5,opacity:Math.max(0.15,1-i*0.03)}}>
            <span style={{fontSize:10,color:'#475569',flexShrink:0,fontFamily:'monospace',fontVariantNumeric:'tabular-nums'}}>{l.ts}</span>
            <span style={{fontSize:11,color:LOG_C[l.t]||T.gray1,lineHeight:1.5,fontFamily:'monospace'}}>{l.msg}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── DESKTOP NAV (Kalshi-style top bar) ───────────────────────────────────────
function DesktopNav({tab,onTab,updating,countdown,queue,showLog,onToggleLog}) {
  return (
    <div style={{background:T.white,borderBottom:`1px solid ${T.border}`,position:'sticky',top:0,zIndex:50}}>
      {/* Top bar */}
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'0 32px',height:56}}>
        {/* Logo */}
        <div style={{display:'flex',alignItems:'center',gap:32}}>
          <div>
            <span style={{fontSize:20,fontWeight:900,color:T.black,letterSpacing:'-0.04em'}}>Guru</span>
            <span style={{fontSize:20,fontWeight:900,color:T.cat.loterias,letterSpacing:'-0.04em'}}> das Bets</span>
          </div>
          {/* Primary nav links */}
          <nav style={{display:'flex',alignItems:'center',gap:4}}>
            {[
              {key:'markets',label:'MERCADOS',active:!showLog},
              {key:'engine', label:'MOTOR IA', active:showLog, dot:updating},
            ].map(n=>(
              <button key={n.key} onClick={()=>{if(n.key==='engine')onToggleLog()}} style={{padding:'6px 14px',borderRadius:T.r.sm,border:'none',background:'transparent',color:n.active?T.black:T.gray1,fontSize:13,fontWeight:n.active?700:500,cursor:'pointer',letterSpacing:'0.02em',position:'relative',transition:'color 0.15s'}}>
                {n.label}
                {n.dot&&<span style={{position:'absolute',top:4,right:6,width:6,height:6,borderRadius:'50%',background:'#F59E0B'}}/>}
                {n.active&&<div style={{position:'absolute',bottom:-1,left:0,right:0,height:2,background:T.black,borderRadius:1}}/>}
              </button>
            ))}
          </nav>
        </div>
        {/* Right side */}
        <div style={{display:'flex',alignItems:'center',gap:12}}>
          {/* Status */}
          {updating?(
            <div style={{display:'flex',alignItems:'center',gap:6,background:'#FFF8E1',borderRadius:T.r.pill,padding:'6px 14px',border:'1px solid #FFE082'}}>
              <div style={{width:8,height:8,borderRadius:'50%',border:'2px solid #F59E0B',borderTopColor:'transparent',animation:'spin 0.8s linear infinite'}}/>
              <span style={{fontSize:12,fontWeight:700,color:'#92400E'}}>{queue.length>0?`Analisando ${queue[0]}...`:'Analisando...'}</span>
            </div>
          ):countdown?(
            <div style={{display:'flex',alignItems:'center',gap:6,background:'#F0FFF4',borderRadius:T.r.pill,padding:'6px 14px',border:'1px solid #A7F3D0'}}>
              <div style={{width:8,height:8,borderRadius:'50%',background:T.green}}/>
              <span style={{fontSize:12,fontWeight:600,color:'#065F46',fontVariantNumeric:'tabular-nums'}}>Próx. {countdown}</span>
            </div>
          ):null}
          {/* CTA button */}
          <button style={{background:T.green,color:T.black,border:'none',borderRadius:T.r.pill,padding:'8px 20px',fontSize:14,fontWeight:700,cursor:'pointer',letterSpacing:'-0.01em'}}>
            Apostar agora
          </button>
        </div>
      </div>

      {/* Category filter bar — Kalshi sub-nav */}
      {!showLog&&(
        <div style={{display:'flex',alignItems:'center',gap:0,padding:'0 32px',borderTop:`1px solid ${T.border}`,overflowX:'auto'}}>
          {TABS.map(({key,label,icon})=>{
            const active=key===tab
            return (
              <button key={key} onClick={()=>onTab(key)} style={{display:'flex',alignItems:'center',gap:6,padding:'12px 16px',border:'none',background:'transparent',color:active?T.black:T.gray1,fontSize:13,fontWeight:active?700:500,cursor:'pointer',whiteSpace:'nowrap',flexShrink:0,position:'relative',borderBottom:`2px solid ${active?T.black:'transparent'}`,transition:'color 0.15s',marginBottom:-1}}>
                <span style={{fontSize:15}}>{icon}</span>{label}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ─── MOBILE HEADER ────────────────────────────────────────────────────────────
function MobileHeader({tab,onTab,updating,countdown,queue,showLog,onToggleLog}) {
  return (
    <div style={{background:T.white,borderBottom:`1px solid ${T.border}`,position:'sticky',top:0,zIndex:50}}>
      <div style={{padding:'14px 18px 10px',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <div>
          <span style={{fontSize:20,fontWeight:900,color:T.black,letterSpacing:'-0.04em'}}>Guru</span>
          <span style={{fontSize:20,fontWeight:900,color:T.cat.loterias,letterSpacing:'-0.04em'}}> das Bets</span>
        </div>
        <div style={{display:'flex',alignItems:'center',gap:8}}>
          {updating
            ?<div style={{display:'flex',alignItems:'center',gap:6,background:'#FFF8E1',borderRadius:T.r.pill,padding:'5px 10px'}}><div style={{width:8,height:8,borderRadius:'50%',border:'2px solid #F59E0B',borderTopColor:'transparent',animation:'spin 0.8s linear infinite'}}/><span style={{fontSize:11,fontWeight:700,color:'#92400E'}}>IA</span></div>
            :<div style={{display:'flex',alignItems:'center',gap:6,background:'#F0FFF4',borderRadius:T.r.pill,padding:'5px 10px'}}><div style={{width:8,height:8,borderRadius:'50%',background:T.green}}/><span style={{fontSize:11,fontWeight:700,color:'#065F46'}}>AO VIVO</span></div>
          }
        </div>
      </div>
      {!updating&&countdown&&<div style={{margin:'0 18px 8px',background:T.gray2,borderRadius:T.r.sm,padding:'5px 12px',display:'flex',justifyContent:'space-between'}}><span style={{fontSize:11,color:T.gray1}}>Próxima atualização</span><span style={{fontSize:11,fontWeight:800,color:T.black,fontVariantNumeric:'tabular-nums'}}>{countdown}</span></div>}
      {updating&&queue.length>0&&<div style={{margin:'0 18px 8px',background:'#FFF8E1',borderRadius:T.r.sm,padding:'5px 12px',display:'flex',alignItems:'center',gap:8}}><div style={{width:8,height:8,borderRadius:'50%',border:'2px solid #F59E0B',borderTopColor:'transparent',animation:'spin 0.8s linear infinite',flexShrink:0}}/><span style={{fontSize:11,color:'#78350F'}}>Analisando <strong>{queue[0]}</strong> — {queue.length} restante(s)</span></div>}
      <div style={{display:'flex',gap:6,overflowX:'auto',padding:'0 18px 12px',scrollbarWidth:'none'}}>
        {TABS.map(({key,label,icon})=>{
          const active=key===tab&&!showLog
          return <button key={key} onClick={()=>onTab(key)} style={{padding:'7px 13px',borderRadius:T.r.pill,border:'none',background:active?T.black:T.gray2,color:active?T.white:T.gray1,fontSize:12,fontWeight:active?700:500,cursor:'pointer',whiteSpace:'nowrap',flexShrink:0,transition:'all 0.12s'}}>{icon} {label}</button>
        })}
        <button onClick={onToggleLog} style={{padding:'7px 13px',borderRadius:T.r.pill,border:'none',background:showLog?T.black:T.gray2,color:showLog?T.white:T.gray1,fontSize:12,fontWeight:showLog?700:500,cursor:'pointer',whiteSpace:'nowrap',flexShrink:0}}>⚙️ Motor</button>
      </div>
    </div>
  )
}

// ─── SPLASH ───────────────────────────────────────────────────────────────────
function SplashScreen() {
  return (
    <div style={{position:'fixed',inset:0,background:T.green,display:'flex',alignItems:'center',justifyContent:'center',flexDirection:'column',gap:8,zIndex:999}}>
      <div style={{fontSize:48,fontWeight:900,color:T.black,letterSpacing:'-0.04em',lineHeight:1}}>Guru das Bets</div>
      <div style={{fontSize:13,fontWeight:500,color:'rgba(0,0,0,0.45)',letterSpacing:'0.06em'}}>PREVISÕES INTELIGENTES</div>
    </div>
  )
}

// ─── GLOBAL CSS ───────────────────────────────────────────────────────────────
const CSS=`
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
  html,body{height:100%;}
  body{font-family:-apple-system,BlinkMacSystemFont,'SF Pro Display','Segoe UI',sans-serif;}
  ::-webkit-scrollbar{width:6px;height:6px;}
  ::-webkit-scrollbar-track{background:transparent;}
  ::-webkit-scrollbar-thumb{background:#E0E0E0;border-radius:3px;}
  input[type=number]::-webkit-inner-spin-button{-webkit-appearance:none;}
  @keyframes spin{to{transform:rotate(360deg)}}
  @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}
  @keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
  @keyframes slideUp{from{transform:translateY(100%)}to{transform:translateY(0)}}
`

// ─── APP ROOT ─────────────────────────────────────────────────────────────────
const SEED={loterias:LOTERIAS,esportes:ESPORTES}

export default function App() {
  const [splash, setSplash] = useState(true)
  const [tab,    setTab]    = useState('loterias')
  const [selItem,setSelItem]= useState(null)
  const [showLog,setShowLog]= useState(false)
  const [activeFilter,setActiveFilter]=useState('all') // Kalshi sub-filter

  useEffect(()=>{const t=setTimeout(()=>setSplash(false),2000);return()=>clearTimeout(t)},[])

  const {appData,logs,updating,lastAt,countdown,queue,force}=useAutoUpdate(SEED)
  const {isMobile,isTablet,isDesktop}=useBreakpoint()

  if (splash) return <><style>{CSS}</style><SplashScreen/></>

  const isLoto=tab==='loterias'
  const espData=appData.esportes[tab]; const espItems=espData?.items||[]
  const catUpd=updating&&queue.includes(tab)
  const totalLive=Object.values(appData.esportes).flatMap(d=>d.items).filter(i=>i.status==='live').length

  function handleTab(key){setTab(key);setShowLog(false);setActiveFilter('all')}
  function handleToggleLog(){setShowLog(v=>!v)}

  // ── DESKTOP ──
  if (isDesktop) {
    // Collect all items for "Todos" view when on sports tabs
    const allSportItems = isLoto ? [] : espItems

    return (
      <div style={{display:'flex',flexDirection:'column',height:'100vh',background:T.bg}}>
        <style>{CSS}</style>
        <DesktopNav tab={tab} onTab={handleTab} updating={updating} countdown={countdown} queue={queue} showLog={showLog} onToggleLog={handleToggleLog}/>

        <div style={{flex:1,overflowY:'auto'}}>
          <div style={{maxWidth:1400,margin:'0 auto',padding:'28px 32px 48px'}}>

            {showLog ? (
              <EngineLog logs={logs} updating={updating} lastAt={lastAt} countdown={countdown} queue={queue} force={force}/>
            ) : (
              <>
                {/* Page header — Kalshi "Browse Markets" style */}
                <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:24}}>
                  <h1 style={{fontSize:28,fontWeight:800,color:T.black,letterSpacing:'-0.04em'}}>
                    {isLoto ? 'Loterias' : TABS.find(t=>t.key===tab)?.label}
                  </h1>
                  {/* Kalshi-style filter pills */}
                  <div style={{display:'flex',gap:8,alignItems:'center'}}>
                    {(!isLoto?['all','live','upcoming']:['all','acumulado']).map(f=>(
                      <button key={f} onClick={()=>setActiveFilter(f)} style={{padding:'7px 16px',borderRadius:T.r.pill,border:`1px solid ${activeFilter===f?T.black:T.border}`,background:activeFilter===f?T.black:T.white,color:activeFilter===f?T.white:T.black,fontSize:13,fontWeight:activeFilter===f?700:500,cursor:'pointer',transition:'all 0.15s'}}>
                        {f==='all'?'Todos':f==='live'?'Ao Vivo':f==='upcoming'?'Próximos':'Acumulados'}
                      </button>
                    ))}
                    {catUpd&&(
                      <div style={{display:'flex',alignItems:'center',gap:6,background:'#FFF8E1',borderRadius:T.r.pill,padding:'7px 14px',border:'1px solid #FFE082'}}>
                        <div style={{width:8,height:8,borderRadius:'50%',border:'2px solid #F59E0B',borderTopColor:'transparent',animation:'spin 0.8s linear infinite'}}/>
                        <span style={{fontSize:12,fontWeight:700,color:'#92400E'}}>Atualizando IA...</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Responsible gambling notice for loterias */}
                {isLoto&&(
                  <div style={{background:'#FFFBEB',border:'1px solid #FDE68A',borderRadius:T.r.md,padding:'11px 18px',marginBottom:20,fontSize:12,color:'#78350F',lineHeight:1.6}}>
                    <strong>Jogo responsável.</strong> Sugestões baseadas em estatística histórica — não garantem resultado. Aposte somente o que pode perder.
                  </div>
                )}

                {/* KALSHI 3-COLUMN GRID */}
                <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:16,alignItems:'start'}}>
                  {isLoto
                    ? appData.loterias
                        .filter(l=>activeFilter==='all'||(activeFilter==='acumulado'&&l.acumulado))
                        .map(lot=><KalshiLotoCard key={lot.id} lot={lot} onSelect={setSelItem} catUpdating={catUpd}/>)
                    : allSportItems
                        .filter(i=>activeFilter==='all'||(activeFilter==='live'&&i.status==='live')||(activeFilter==='upcoming'&&i.status==='upcoming'))
                        .map(item=><KalshiSportCard key={item.id} item={item} catKey={tab} onSelect={setSelItem} catUpdating={catUpd}/>)
                  }
                </div>
              </>
            )}
          </div>
        </div>

        {selItem&&<BetSheet item={selItem} isLoto={isLoto} onClose={()=>setSelItem(null)}/>}
      </div>
    )
  }

  // ── TABLET / MOBILE ──
  return (
    <div style={{background:T.bg,minHeight:'100vh'}}>
      <style>{CSS}</style>
      <MobileHeader tab={tab} onTab={handleTab} updating={updating} countdown={countdown} queue={queue} showLog={showLog} onToggleLog={handleToggleLog}/>
      <div style={{padding:isTablet?'24px 28px 100px':'16px 16px 100px',maxWidth:isTablet?900:'100%',margin:'0 auto'}}>
        {showLog?(
          <EngineLog logs={logs} updating={updating} lastAt={lastAt} countdown={countdown} queue={queue} force={force}/>
        ):(
          <>
            {isLoto&&<div style={{background:'#FFFBEB',border:'1px solid #FDE68A',borderRadius:T.r.md,padding:'11px 16px',marginBottom:16,fontSize:12,color:'#78350F',lineHeight:1.6}}><strong>Jogo responsável.</strong> Sugestões baseadas em estatística histórica — não garantem resultado.</div>}
            {!isLoto&&<div style={{display:'flex',gap:8,marginBottom:16,overflowX:'auto'}}>{['all','live','upcoming'].map((f,i)=><button key={f} style={{padding:'7px 14px',borderRadius:T.r.pill,border:'none',background:activeFilter===f?T.black:T.gray2,color:activeFilter===f?T.white:T.gray1,fontSize:12,fontWeight:activeFilter===f?700:500,cursor:'pointer',whiteSpace:'nowrap',flexShrink:0}} onClick={()=>setActiveFilter(f)}>{f==='all'?`Todos (${espItems.length})`:f==='live'?'Ao Vivo':'Próximos'}</button>)}</div>}
            <div style={{display:'grid',gridTemplateColumns:isTablet?'repeat(2,1fr)':'1fr',gap:isTablet?16:0}}>
              {isLoto
                ?appData.loterias.map(lot=><LotoCard key={lot.id} lot={lot} onSelect={setSelItem} catUpdating={catUpd}/>)
                :espItems.filter(i=>activeFilter==='all'||(activeFilter==='live'&&i.status==='live')||(activeFilter==='upcoming'&&i.status==='upcoming')).map(item=><SportCard key={item.id} item={item} onSelect={setSelItem} catUpdating={catUpd}/>)
              }
            </div>
          </>
        )}
      </div>

      {isMobile&&(
        <div style={{position:'fixed',bottom:0,left:0,right:0,background:T.white,borderTop:`1px solid ${T.border}`,display:'flex',justifyContent:'space-around',paddingTop:10,paddingBottom:'env(safe-area-inset-bottom,20px)',zIndex:100}}>
          {[
            {key:'discover',label:'Descobrir',svg:<svg width="22" height="22" fill="none" viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/><path d="M9 22V12h6v10" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/></svg>},
            {key:'play',label:'Apostar',badge:totalLive,svg:<svg width="22" height="22" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8"/><path d="M10 8.5l5 3.5-5 3.5V8.5z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/></svg>},
            {key:'engine',label:'Motor',engineDot:updating,svg:<svg width="22" height="22" fill="none" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="4" stroke="currentColor" strokeWidth="1.8"/><path d="M7 8h10M7 12h7M7 16h4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>},
            {key:'profile',label:'Perfil',svg:<svg width="22" height="22" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.8"/><path d="M4 20c0-3.314 3.582-6 8-6s8 2.686 8 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>},
          ].map(({key,label,svg,badge,engineDot})=>{
            const active=key==='engine'?showLog:false
            return (
              <button key={key} onClick={()=>{if(key==='engine')handleToggleLog()}} style={{background:'none',border:'none',display:'flex',flexDirection:'column',alignItems:'center',gap:3,cursor:'pointer',position:'relative',minWidth:60,color:active?T.black:T.gray1,padding:'4px 0'}}>
                {badge>0&&<span style={{position:'absolute',top:-2,right:4,background:T.red,color:T.white,fontSize:9,fontWeight:900,borderRadius:T.r.pill,padding:'1px 5px',lineHeight:1.5}}>{badge}</span>}
                {engineDot&&!showLog&&<span style={{position:'absolute',top:0,right:6,width:8,height:8,borderRadius:'50%',background:'#F59E0B',border:`2px solid ${T.white}`,animation:'pulse 1.5s infinite'}}/>}
                {svg}
                <span style={{fontSize:10,fontWeight:active?700:400}}>{label}</span>
              </button>
            )
          })}
        </div>
      )}

      {selItem&&<BetSheet item={selItem} isLoto={isLoto} onClose={()=>setSelItem(null)}/>}
    </div>
  )
}
