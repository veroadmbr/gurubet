import React, { useState, useEffect, useCallback, useRef } from 'react'

const API_KEY = import.meta.env.VITE_ANTHROPIC_API_KEY || ''

// ─── THEME ────────────────────────────────────────────────────────────────────
const T = {
  green:  '#00D672', black:  '#111111', white:  '#FFFFFF',
  bg:     '#F7F7F5', border: '#E8E8E4', gray1:  '#737373',
  gray2:  '#F0F0ED', gray3:  '#D4D4CC', red:    '#E53935',
  cat:{ loterias:'#1A7A4A', futebol:'#1A7A4A', basquete:'#B45309', volei:'#5B21B6', mma:'#B91C1C', tenis:'#0369A1', esports:'#6D28D9' },
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

// ─── MATERIAL ICONS (inline SVG, no emoji) ───────────────────────────────────
// All SVGs use explicit width/height + display:block to prevent layout stretching
const Icon = {
  lottery:    (c='currentColor',s=16) => <svg width={s} height={s} viewBox="0 0 24 24" fill={c} style={{display:'block',flexShrink:0}}><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 3c1.93 0 3.5 1.57 3.5 3.5S13.93 13 12 13s-3.5-1.57-3.5-3.5S10.07 6 12 6zm7 13H5v-.23c0-.62.28-1.2.76-1.58C7.47 15.82 9.64 15 12 15s4.53.82 6.24 2.19c.48.38.76.97.76 1.58V19z"/></svg>,
  soccer:     (c='currentColor',s=16) => <svg width={s} height={s} viewBox="0 0 24 24" fill={c} style={{display:'block',flexShrink:0}}><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14.93V15h2v1.93c-1.33.24-2.67.24-4 0zm5.36-.97l-.94-1.63 1.73-1 .94 1.64c-.53.4-1.1.73-1.73.99zM6.91 16.6l.94-1.64 1.73 1-.94 1.63c-.63-.26-1.2-.59-1.73-.99zm9.15-5.6H16v-2h.06c.06.32.1.65.1.99 0 .34-.04.67-.1 1.01zm-3.56-6.87V6h-2v-.87C11.56 5.04 11.77 5 12 5s.44.04.5.13zM8.06 9H8V7h.06C8.7 7.28 9.28 7.7 9.75 8.23L8.35 9h-.29zm6.65 0l-1.4-.77A5.04 5.04 0 0 1 15.94 7H16v2h-.29z"/></svg>,
  basketball: (c='currentColor',s=16) => <svg width={s} height={s} viewBox="0 0 24 24" fill={c} style={{display:'block',flexShrink:0}}><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zM4.27 14H2.05c.28-2.11 1.28-3.99 2.76-5.41L6.22 10 4.27 14zm1.44 3.44C4.23 16.05 3.38 14.12 3.1 12h2.17l1.6 3.78-1.16 1.66zm2.26 2.17l1.03-1.49 1.76.98c-.89.37-1.84.59-2.79.51zm5.03.36l-2.71-1.52.97-1.39 2.76 1.54-.95.97-.07-.6zm2.08-1.74l-2.76-1.54.74-1.07 2.49 1.39-.47 1.22zm1.44-2.65l-2.49-1.39L15 12l2.34 1.31-.82 1.27zm2.3-4.14l1.06.59c.26.7.4 1.46.4 2.24 0 .59-.09 1.16-.23 1.71l-1.59-.89.36-3.65zM12 4c2.1 0 4.03.78 5.52 2.06l-1.39.78-4.63-2.59c.17-.17.33-.13.5-.25zm-1 .35v-.04c-.35.05-.69.12-1.02.22l1.02 1.56V4.35zm-3.14 1.6L5.79 5c.59-.59 1.27-1.09 2.02-1.49L9.28 5.7l-.42.25zM5.26 5.58l1.89.93-1.28.72C5.54 6.73 5.38 6.16 5.26 5.58z"/></svg>,
  volleyball: (c='currentColor',s=16) => <svg width={s} height={s} viewBox="0 0 24 24" fill={c} style={{display:'block',flexShrink:0}}><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 2c.86 0 1.68.13 2.46.36-1.02 1.54-1.47 3.38-1.33 5.22L7.9 12.34C7.02 9.47 8.1 6.29 10.53 4.53 11.01 4.18 11.5 4 12 4zm-8 8c0-.53.06-1.04.16-1.54l4.3 4.3-.73 2.15C5.08 15.2 4 13.73 4 12zm8 8c-2.35 0-4.44-1.01-5.9-2.62l.81-2.42 5.22-1.74c1.08 1.49 2.66 2.5 4.45 2.72C15.44 18.78 13.83 20 12 20zm6.24-4.42c-1.49-.45-2.74-1.44-3.53-2.75l4.93-1.64c.23.86.36 1.76.36 2.7 0 .41-.04.81-.1 1.2-.52.17-1.09.49-1.66.49z"/></svg>,
  mma:        (c='currentColor',s=16) => <svg width={s} height={s} viewBox="0 0 24 24" fill={c} style={{display:'block',flexShrink:0}}><path d="M13 1l-2 4h3l-2 4h3l-4 8 1-5h-3l2-4H9l4-7zm-9 14l-2 7h16l-2-7H4z"/></svg>,
  tennis:     (c='currentColor',s=16) => <svg width={s} height={s} viewBox="0 0 24 24" fill={c} style={{display:'block',flexShrink:0}}><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 2c1.85 0 3.54.63 4.9 1.68-1.54 1.43-2.49 3.44-2.49 5.65 0 2.21.95 4.22 2.49 5.65C15.54 18.37 13.85 19 12 19c-3.87 0-7-3.13-7-7s3.13-7 7-7zm4.9 1.68c1.05 1.36 1.68 3.05 1.68 4.9s-.63 3.54-1.68 4.9C15.5 12 15.5 12 16.9 5.68z"/></svg>,
  esports:    (c='currentColor',s=16) => <svg width={s} height={s} viewBox="0 0 24 24" fill={c} style={{display:'block',flexShrink:0}}><path d="M21 6H3c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-10 7H8v3H6v-3H3v-2h3V8h2v3h3v2zm4.5 2c-.83 0-1.5-.67-1.5-1.5S14.67 12 15.5 12s1.5.67 1.5 1.5S16.33 15 15.5 15zm3-3c-.83 0-1.5-.67-1.5-1.5S17.67 9 18.5 9s1.5.67 1.5 1.5S19.33 12 18.5 12z"/></svg>,
  refresh:    (c='currentColor',s=16) => <svg width={s} height={s} viewBox="0 0 24 24" fill={c} style={{display:'block',flexShrink:0}}><path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/></svg>,
  home:       (c='currentColor',s=22) => <svg width={s} height={s} viewBox="0 0 24 24" fill={c} style={{display:'block',flexShrink:0}}><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>,
  play:       (c='currentColor',s=22) => <svg width={s} height={s} viewBox="0 0 24 24" fill={c} style={{display:'block',flexShrink:0}}><path d="M8 5v14l11-7z"/></svg>,
  settings:   (c='currentColor',s=22) => <svg width={s} height={s} viewBox="0 0 24 24" fill={c} style={{display:'block',flexShrink:0}}><path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/></svg>,
  person:     (c='currentColor',s=22) => <svg width={s} height={s} viewBox="0 0 24 24" fill={c} style={{display:'block',flexShrink:0}}><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>,
  check:      (c='currentColor',s=24) => <svg width={s} height={s} viewBox="0 0 24 24" fill={c} style={{display:'block',flexShrink:0}}><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>,
  close:      (c='currentColor',s=18) => <svg width={s} height={s} viewBox="0 0 24 24" fill={c} style={{display:'block',flexShrink:0}}><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>,
  live:       () => <span style={{display:'inline-block',width:7,height:7,borderRadius:'50%',background:T.red,flexShrink:0}}/>,
}

// Map tab key → icon render function
const TAB_ICON = {
  loterias: Icon.lottery, futebol: Icon.soccer, basquete: Icon.basketball,
  volei: Icon.volleyball, mma: Icon.mma, tenis: Icon.tennis, esports: Icon.esports,
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
    { id:'t1', status:'live',     statusLabel:'Hoje · Miami Open',                competition:'ATP Masters 1000 · Miami',title:'Sinner × Dzumhur',           subtitle:'Campeão IW estreia em Miami',         guruPick:'Sinner',        guruConf:92, guruReason:'Sinner venceu IW sem perder set. Dzumhur Nº74 sem histórico vs top5.',  home:{name:'J. Sinner',    sub:'Nº2 · IW Camp.',pct:89},away:{name:'D. Dzumhur',sub:'Nº74 ATP',pct:8},  draw:3,  vol:'R$ 4,1M' },
    { id:'t2', status:'upcoming', statusLabel:'~27/03 · Miami Open Final',        competition:'ATP Miami 2026 · Projeção',title:'Sinner × Alcaraz',          subtitle:'Sunshine Double em disputa',          guruPick:'Sinner',        guruConf:47, guruReason:'Sinner tem 2 finais e 1 título em Miami. Alcaraz 2º favorito.',         home:{name:'J. Sinner',    sub:'Nº2 · Fav.',pct:44}, away:{name:'C. Alcaraz',   sub:'Nº1 · 16-1',pct:38}, draw:18, vol:'R$ 11,2M' },
  ]},
  esports:  { label:'E-sports',  items:[
    { id:'e1', status:'upcoming', statusLabel:'28/03 · CBLOL Etapa 1',            competition:'CBLOL 2026 · Etapa 1',    title:'LOUD × paiN Gaming',         subtitle:'Campeã estreia na Etapa 1',           guruPick:'LOUD',          guruConf:66, guruReason:'LOUD campeã Copa CBLOL 2026. Bull e RedBert dominantes.',               home:{name:'LOUD',         sub:'Campeã Copa', pct:62}, away:{name:'paiN Gaming',  sub:'4º Copa',    pct:24}, draw:14, vol:'R$ 1,8M' },
    { id:'e2', status:'upcoming', statusLabel:'06/06 · Grande Final',             competition:'CBLOL 2026 · Campeão',    title:'LOUD vence o campeonato?',   subtitle:'Projeção Etapa 1 completa',           guruPick:'LOUD',          guruConf:42, guruReason:'LOUD bicampeã com coesão. FURIA com bootcamp na Coreia é ameaça.',       home:{name:'LOUD',         sub:'Bicampeã',    pct:40}, away:{name:'FURIA/RED/Outro',sub:'Rivais',pct:60}, draw:0,  vol:'R$ 5,6M' },
  ]},
}

const TABS = [
  { key:'loterias', label:'Loterias'  },
  { key:'futebol',  label:'Futebol'   },
  { key:'basquete', label:'Basquete'  },
  { key:'volei',    label:'Vôlei'     },
  { key:'mma',      label:'MMA / UFC' },
  { key:'tenis',    label:'Tênis'     },
  { key:'esports',  label:'E-sports'  },
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

// ─── BALL (lottery numbers) ───────────────────────────────────────────────────
function Ball({n,size=24,bg=T.gray2,color=T.black}) {
  return <div style={{width:size,height:size,borderRadius:'50%',background:bg,display:'flex',alignItems:'center',justifyContent:'center',fontSize:9,fontWeight:700,color,flexShrink:0}}>{String(n).padStart(2,'0')}</div>
}

// ─── KALSHI SPORT CARD — fixed height ─────────────────────────────────────────
// Card height is driven by a fixed inner structure: every card renders the same sections
const CARD_H = 310 // px — uniform height for all desktop cards

function KalshiSportCard({item,catKey,onSelect,catUpdating}) {
  const [hov,setHov]=useState(false)
  const live=item.status==='live'
  const catColor=T.cat[catKey]||T.black
  const catBg=T.catBg[catKey]||T.gray2
  const label=TABS.find(t=>t.key===catKey)?.label||catKey
  const TabIcon=TAB_ICON[catKey]||Icon.soccer

  return (
    <div onClick={()=>onSelect(item)} onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      style={{background:T.white,borderRadius:T.r.lg,border:`1px solid ${hov?'#C0C0BB':T.border}`,cursor:'pointer',
        boxShadow:hov?'0 4px 20px rgba(0,0,0,0.1)':'0 1px 3px rgba(0,0,0,0.04)',
        transition:'box-shadow 0.15s,border-color 0.15s',
        height:CARD_H, display:'flex', flexDirection:'column', overflow:'hidden'}}>

      {/* Category header */}
      <div style={{padding:'12px 14px 10px',display:'flex',justifyContent:'space-between',alignItems:'center',borderBottom:`1px solid ${T.border}`,flexShrink:0}}>
        <div style={{display:'flex',alignItems:'center',gap:8}}>
          <div style={{width:28,height:28,borderRadius:8,background:catBg,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,overflow:'hidden'}}>
            <TabIcon c={catColor} s={16}/>
          </div>
          <span style={{fontSize:11,fontWeight:700,color:catColor,letterSpacing:'0.04em',textTransform:'uppercase'}}>{label}</span>
        </div>
        <span style={{fontSize:11,color:T.gray1}}>{item.competition}</span>
      </div>

      {/* Title + status */}
      <div style={{padding:'11px 14px 8px',flexShrink:0}}>
        <div style={{fontSize:15,fontWeight:700,color:T.black,lineHeight:1.3,marginBottom:5,letterSpacing:'-0.02em',overflow:'hidden',display:'-webkit-box',WebkitLineClamp:2,WebkitBoxOrient:'vertical'}}>{item.title}</div>
        <div style={{display:'flex',alignItems:'center',gap:5,height:16}}>
          {live&&<><Icon.live/><span style={{fontSize:11,fontWeight:700,color:T.red}}>AO VIVO</span><span style={{color:T.gray1,fontSize:11,margin:'0 2px'}}> · </span></>}
          <span style={{fontSize:11,color:T.gray1,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{item.statusLabel}</span>
        </div>
      </div>

      {/* Teams — fixed 2 rows */}
      <div style={{padding:'0 14px',flex:1}}>
        {[item.home,item.away].map((side,i)=>{
          const isWinner=side.pct>(i===0?item.away.pct:item.home.pct)
          return (
            <div key={i} style={{display:'flex',alignItems:'center',gap:10,padding:'7px 0',borderBottom:i===0?`1px solid ${T.border}`:'none'}}>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:13,fontWeight:isWinner?700:500,color:T.black,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',marginBottom:3}}>{side.name}</div>
                <div style={{height:2,borderRadius:1,background:isWinner?catColor:T.gray3,width:`${Math.max(15,side.pct)}%`,transition:'width 0.5s'}}/>
              </div>
              <div style={{minWidth:52,textAlign:'center',padding:'4px 10px',borderRadius:T.r.pill,border:`1.5px solid ${catUpdating?T.gray3:'#16A34A'}`,color:catUpdating?T.gray1:'#15803D',fontSize:13,fontWeight:800,background:catUpdating?T.gray2:'#F0FDF4',flexShrink:0}}>
                {catUpdating?'—':`${side.pct}%`}
              </div>
            </div>
          )
        })}
      </div>

      {/* Guru strip */}
      <div style={{margin:'8px 14px 0',background:'#F8F8F5',borderRadius:T.r.sm,padding:'7px 10px',flexShrink:0}}>
        <div style={{display:'flex',alignItems:'flex-start',gap:6}}>
          <span style={{fontSize:10,fontWeight:700,color:catColor,whiteSpace:'nowrap',paddingTop:1,flexShrink:0}}>GURU</span>
          <span style={{fontSize:11,color:T.gray1,lineHeight:1.4,flex:1,overflow:'hidden',display:'-webkit-box',WebkitLineClamp:2,WebkitBoxOrient:'vertical'}}>{item.guruPick} · {item.guruReason}</span>
          <span style={{fontSize:11,fontWeight:800,color:T.black,flexShrink:0}}>{item.guruConf}%</span>
        </div>
      </div>

      {/* Footer */}
      <div style={{padding:'8px 14px 12px',display:'flex',justifyContent:'space-between',flexShrink:0}}>
        <span style={{fontSize:11,color:T.gray1}}>{item.vol} vol.</span>
        <span style={{fontSize:11,color:T.gray1}}>Empate {item.draw}%</span>
      </div>
    </div>
  )
}

// ─── KALSHI LOTO CARD — same fixed height ────────────────────────────────────
function KalshiLotoCard({lot,onSelect,catUpdating}) {
  const [hov,setHov]=useState(false)
  return (
    <div onClick={()=>onSelect(lot)} onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      style={{background:T.white,borderRadius:T.r.lg,border:`1px solid ${hov?'#C0C0BB':T.border}`,cursor:'pointer',
        boxShadow:hov?'0 4px 20px rgba(0,0,0,0.1)':'0 1px 3px rgba(0,0,0,0.04)',
        transition:'box-shadow 0.15s,border-color 0.15s',
        height:CARD_H, display:'flex', flexDirection:'column', overflow:'hidden'}}>

      {/* Category header */}
      <div style={{padding:'12px 14px 10px',display:'flex',justifyContent:'space-between',alignItems:'center',borderBottom:`1px solid ${T.border}`,flexShrink:0}}>
        <div style={{display:'flex',alignItems:'center',gap:8}}>
          <div style={{width:28,height:28,borderRadius:8,background:T.catBg.loterias,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,overflow:'hidden'}}>
            <Icon.lottery c={T.cat.loterias} s={16}/>
          </div>
          <span style={{fontSize:11,fontWeight:700,color:T.cat.loterias,letterSpacing:'0.04em',textTransform:'uppercase'}}>LOTERIA</span>
        </div>
        <div style={{display:'flex',gap:6,alignItems:'center'}}>
          {lot.acumulado&&<span style={{fontSize:10,fontWeight:700,background:'#FEF3C7',color:'#B45309',borderRadius:4,padding:'2px 7px',flexShrink:0}}>ACUMULADO</span>}
          <span style={{fontSize:11,color:T.gray1,whiteSpace:'nowrap'}}>{lot.dias}</span>
        </div>
      </div>

      {/* Title + prize */}
      <div style={{padding:'11px 14px 8px',flexShrink:0}}>
        <div style={{fontSize:16,fontWeight:800,color:T.black,letterSpacing:'-0.03em',marginBottom:2}}>{lot.nome}</div>
        <div style={{display:'flex',alignItems:'baseline',gap:8}}>
          <span style={{fontSize:18,fontWeight:900,color:T.black,letterSpacing:'-0.04em'}}>{lot.premio}</span>
          <span style={{fontSize:11,color:T.gray1,whiteSpace:'nowrap'}}>Sorteio {lot.data}</span>
        </div>
      </div>

      {/* Last result */}
      <div style={{padding:'0 14px 8px',flexShrink:0}}>
        <div style={{fontSize:10,fontWeight:700,color:T.gray1,letterSpacing:'0.05em',marginBottom:5}}>ÚLTIMO RESULTADO</div>
        <div style={{display:'flex',gap:3,flexWrap:'wrap'}}>
          {lot.ultimoResultado.slice(0,10).map(n=><Ball key={n} n={n} size={22}/>)}
          {lot.ultimoResultado.length>10&&<span style={{fontSize:10,color:T.gray1,alignSelf:'center'}}>+{lot.ultimoResultado.length-10}</span>}
        </div>
      </div>

      {/* Guru row */}
      <div style={{padding:'0 14px',flex:1,borderTop:`1px solid ${T.border}`}}>
        <div style={{paddingTop:8,paddingBottom:6}}>
          <div style={{display:'flex',alignItems:'flex-start',gap:10,marginBottom:6}}>
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontSize:12,fontWeight:700,color:T.black,marginBottom:4}}>{catUpdating?'Atualizando previsão...':'Guru sugere'}</div>
              <div style={{display:'flex',gap:3,flexWrap:'wrap'}}>
                {(lot.guruNums||[]).slice(0,10).map(n=><Ball key={n} n={n} size={22} bg={catUpdating?T.gray3:T.black} color={T.white}/>)}
                {(lot.guruNums||[]).length>10&&<span style={{fontSize:10,color:T.gray1,alignSelf:'center'}}>+{lot.guruNums.length-10}</span>}
              </div>
            </div>
            <div style={{minWidth:52,textAlign:'center',padding:'4px 10px',borderRadius:T.r.pill,border:`1.5px solid ${catUpdating?T.gray3:'#16A34A'}`,color:catUpdating?T.gray1:'#15803D',fontSize:13,fontWeight:800,background:catUpdating?T.gray2:'#F0FDF4',flexShrink:0,marginTop:2}}>
              {catUpdating?'—':`${lot.guruConf}%`}
            </div>
          </div>
          {!catUpdating&&<p style={{fontSize:10,color:T.gray1,lineHeight:1.45,margin:0,overflow:'hidden',display:'-webkit-box',WebkitLineClamp:2,WebkitBoxOrient:'vertical'}}>{lot.guruAnalise}</p>}
        </div>
      </div>

      {/* Footer */}
      <div style={{padding:'8px 14px 12px',display:'flex',justifyContent:'space-between',flexShrink:0}}>
        <span style={{fontSize:11,color:T.gray1}}>Conc. {lot.concurso}</span>
        <span style={{fontSize:11,color:T.gray1}}>Min {lot.aposta}</span>
      </div>
    </div>
  )
}

// ─── MOBILE CARDS ─────────────────────────────────────────────────────────────
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
          <div style={{display:'flex',gap:4,flexWrap:'wrap'}}>{lot.ultimoResultado.map(n=><Ball key={n} n={n} size={26}/>)}</div>
        </div>
        <div style={{background:T.bg,borderRadius:T.r.md,padding:'12px 14px'}}>
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:10}}>
            <span style={{fontSize:10,fontWeight:700,color:T.black,letterSpacing:'0.06em'}}>{catUpdating?'ATUALIZANDO...':'GURU SUGERE'}</span>
            <span style={{fontSize:11,fontWeight:800,background:catUpdating?T.gray3:T.green,color:T.white,borderRadius:T.r.pill,padding:'2px 10px'}}>{lot.guruConf}% conf.</span>
          </div>
          <div style={{display:'flex',gap:4,flexWrap:'wrap',marginBottom:10}}>{(lot.guruNums||[]).map(n=><Ball key={n} n={n} size={26} bg={catUpdating?T.gray3:T.black} color={T.white}/>)}</div>
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

function SportCard({item,catKey,onSelect,catUpdating}) {
  const live=item.status==='live'; const [hov,setHov]=useState(false)
  const catColor=T.cat[catKey]||T.black
  return (
    <div onClick={()=>onSelect(item)} onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      style={{background:T.white,borderRadius:T.r.lg,border:`1px solid ${T.border}`,marginBottom:12,overflow:'hidden',cursor:'pointer',boxShadow:hov?'0 4px 24px rgba(0,0,0,0.09)':'none',transition:'box-shadow 0.15s'}}>
      <div style={{height:3,background:live?T.red:T.border}}/>
      <div style={{padding:'16px 20px'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10}}>
          <div style={{display:'flex',alignItems:'center',gap:6}}>
            {live&&<><Icon.live/><span style={{fontSize:11,fontWeight:700,color:T.red,marginLeft:4}}>AO VIVO</span><span style={{color:T.gray1,margin:'0 3px'}}> · </span></>}
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
          <div style={{background:catUpdating?T.gray3:T.black,color:T.white,borderRadius:T.r.pill,padding:'3px 10px',fontSize:11,fontWeight:800,flexShrink:0}}>{item.guruConf}%</div>
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
                  <div style={{width:`${side.pct}%`,height:'100%',background:side.pct>50?catColor:T.gray3,borderRadius:2,transition:'width 0.5s'}}/>
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
        {!isMobile&&<div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'24px 28px 0'}}><span style={{fontSize:17,fontWeight:800,color:T.black}}>{isLoto?item.nome:item.title}</span><button onClick={onClose} style={{width:32,height:32,borderRadius:'50%',border:'none',background:T.gray2,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}}><Icon.close c={T.gray1}/></button></div>}
        {done?(
          <div style={{padding:'28px 28px 44px',textAlign:'center'}}>
            <div style={{width:56,height:56,borderRadius:'50%',background:T.green,margin:'0 auto 16px',display:'flex',alignItems:'center',justifyContent:'center'}}>
              <Icon.check c={T.white} s={28}/>
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
                <span style={{fontSize:12,fontWeight:800,background:T.green,color:T.white,borderRadius:T.r.pill,padding:'3px 12px'}}>{item.guruConf}%</span>
              </div>
              {isLoto?(<><p style={{fontSize:12,color:T.gray1,lineHeight:1.6,marginBottom:10}}>{item.guruAnalise}</p><div style={{fontSize:11,fontWeight:700,color:T.black,marginBottom:8}}>Números — concurso {item.concurso}</div><div style={{display:'flex',gap:4,flexWrap:'wrap'}}>{(item.guruNums||[]).map(n=><Ball key={n} n={n} size={26} bg={T.black} color={T.white}/>)}</div></>)
              :(<><div style={{fontSize:17,fontWeight:900,color:T.black,letterSpacing:'-0.03em',marginBottom:4}}>{item.guruPick}</div><p style={{fontSize:12,color:T.gray1,lineHeight:1.5,margin:0}}>{item.guruReason}</p></>)}
            </div>
            {isLoto&&<div style={{background:'#FFFBEB',border:'1px solid #FDE68A',borderRadius:T.r.sm,padding:'10px 14px',marginBottom:14,fontSize:11,color:'#78350F',lineHeight:1.5}}>Loteria é jogo de azar. Sugestão estatística sem garantia.</div>}
            {!isLoto&&(<>
              <div style={{display:'flex',background:T.bg,borderRadius:T.r.md,padding:4,marginBottom:14}}>
                {['buy','sell'].map(m=><button key={m} style={{flex:1,padding:'10px',borderRadius:T.r.sm,border:'none',background:m==='buy'?T.white:'transparent',color:m==='buy'?T.black:T.gray1,fontWeight:m==='buy'?700:500,fontSize:14,cursor:'pointer'}}>{m==='buy'?'Comprar':'Vender'}</button>)}
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
          <button onClick={force} disabled={updating} style={{display:'flex',alignItems:'center',gap:8,padding:'10px 20px',borderRadius:T.r.pill,background:updating?T.gray2:T.black,border:'none',color:updating?T.gray1:T.white,fontSize:13,fontWeight:700,cursor:updating?'not-allowed':'pointer'}}>
            <Icon.refresh c={updating?T.gray1:T.white} s={16}/>{updating?'Analisando...':'Atualizar agora'}
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

// ─── DESKTOP NAV (Kalshi style — centered content) ────────────────────────────
function DesktopNav({tab,onTab,updating,countdown,queue,showLog,onToggleLog,force}) {
  return (
    <div style={{background:T.white,borderBottom:`1px solid ${T.border}`,position:'sticky',top:0,zIndex:50}}>
      {/* Top bar — max-width centered like Kalshi */}
      <div style={{maxWidth:1280,margin:'0 auto',padding:'0 40px',display:'flex',alignItems:'center',justifyContent:'space-between',height:56}}>
        {/* Logo + primary nav */}
        <div style={{display:'flex',alignItems:'center',gap:32}}>
          <div style={{display:'flex',alignItems:'center',gap:0}}>
            <span style={{fontSize:20,fontWeight:900,color:T.black,letterSpacing:'-0.04em'}}>Guru</span>
            <span style={{fontSize:20,fontWeight:900,color:T.cat.loterias,letterSpacing:'-0.04em'}}> das Bets</span>
          </div>
          <nav style={{display:'flex',alignItems:'center',gap:2}}>
            <button onClick={()=>{}} style={{padding:'6px 14px',borderRadius:T.r.sm,border:'none',background:'transparent',color:!showLog?T.black:T.gray1,fontSize:13,fontWeight:!showLog?700:500,cursor:'pointer',letterSpacing:'0.01em',position:'relative'}}>
              MERCADOS
              {!showLog&&<div style={{position:'absolute',bottom:-1,left:0,right:0,height:2,background:T.black,borderRadius:1}}/>}
            </button>
          </nav>
        </div>

        {/* Right side — status + reset button */}
        <div style={{display:'flex',alignItems:'center',gap:10}}>
          {/* Status pill */}
          {updating?(
            <div style={{display:'flex',alignItems:'center',gap:6,background:'#FFF8E1',borderRadius:T.r.pill,padding:'6px 14px',border:'1px solid #FFE082'}}>
              <div style={{width:8,height:8,borderRadius:'50%',border:'2px solid #F59E0B',borderTopColor:'transparent',animation:'spin 0.8s linear infinite',flexShrink:0}}/>
              <span style={{fontSize:12,fontWeight:600,color:'#92400E'}}>{queue.length>0?`Analisando ${queue[0]}...`:'Analisando...'}</span>
            </div>
          ):countdown?(
            <div style={{display:'flex',alignItems:'center',gap:6,background:'#F0FFF4',borderRadius:T.r.pill,padding:'6px 14px',border:'1px solid #A7F3D0'}}>
              <div style={{width:8,height:8,borderRadius:'50%',background:T.green,flexShrink:0}}/>
              <span style={{fontSize:12,fontWeight:600,color:'#065F46',fontVariantNumeric:'tabular-nums'}}>Próxima atualização: {countdown}</span>
            </div>
          ):null}

          {/* Reset/refresh button — replaces "Apostar agora" */}
          <button
            onClick={force}
            disabled={updating}
            style={{display:'flex',alignItems:'center',gap:7,background:updating?T.gray2:T.green,color:updating?T.gray1:T.white,border:'none',borderRadius:T.r.pill,padding:'8px 18px',fontSize:13,fontWeight:700,cursor:updating?'not-allowed':'pointer',transition:'background 0.15s',letterSpacing:'-0.01em'}}
          >
            <Icon.refresh c={updating?T.gray1:T.white} s={16}/>
            {updating?'Atualizando...':'Resetar previsões'}
          </button>
        </div>
      </div>

      {/* Category sub-nav — centered */}
      <div style={{maxWidth:1280,margin:'0 auto',padding:'0 40px',display:'flex',alignItems:'center',borderTop:`1px solid ${T.border}`,overflowX:'auto'}}>
        {TABS.map(({key,label})=>{
          const active=key===tab
          const TabIcon=TAB_ICON[key]||Icon.soccer
          const catColor=T.cat[key]||T.black
          return (
            <button key={key} onClick={()=>onTab(key)} style={{display:'flex',alignItems:'center',gap:7,padding:'12px 16px',border:'none',background:'transparent',color:active?T.black:T.gray1,fontSize:13,fontWeight:active?700:500,cursor:'pointer',whiteSpace:'nowrap',flexShrink:0,position:'relative',borderBottom:`2px solid ${active?T.black:'transparent'}`,transition:'color 0.15s',marginBottom:-1}}>
              <TabIcon c={active?catColor:T.gray3} s={15}/>
              {label}
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ─── MOBILE HEADER ────────────────────────────────────────────────────────────
function MobileHeader({tab,onTab,updating,countdown,queue,showLog,onToggleLog,force}) {
  return (
    <div style={{background:T.white,borderBottom:`1px solid ${T.border}`,position:'sticky',top:0,zIndex:50}}>
      <div style={{padding:'14px 18px 10px',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <div>
          <span style={{fontSize:20,fontWeight:900,color:T.black,letterSpacing:'-0.04em'}}>Guru</span>
          <span style={{fontSize:20,fontWeight:900,color:T.cat.loterias,letterSpacing:'-0.04em'}}> das Bets</span>
        </div>
        <div style={{display:'flex',alignItems:'center',gap:8}}>
          <button onClick={force} disabled={updating} style={{display:'flex',alignItems:'center',gap:5,padding:'6px 12px',borderRadius:T.r.pill,background:updating?T.gray2:T.green,border:'none',color:updating?T.gray1:T.white,fontSize:12,fontWeight:700,cursor:updating?'not-allowed':'pointer'}}>
            <Icon.refresh c={updating?T.gray1:T.white} s={14}/>
            {updating?'Analisando...':'Atualizar'}
          </button>
        </div>
      </div>
      {!updating&&countdown&&<div style={{margin:'0 18px 8px',background:T.gray2,borderRadius:T.r.sm,padding:'5px 12px',display:'flex',justifyContent:'space-between'}}><span style={{fontSize:11,color:T.gray1}}>Próxima atualização</span><span style={{fontSize:11,fontWeight:800,color:T.black,fontVariantNumeric:'tabular-nums'}}>{countdown}</span></div>}
      {updating&&queue.length>0&&<div style={{margin:'0 18px 8px',background:'#FFF8E1',borderRadius:T.r.sm,padding:'5px 12px',display:'flex',alignItems:'center',gap:8}}><div style={{width:8,height:8,borderRadius:'50%',border:'2px solid #F59E0B',borderTopColor:'transparent',animation:'spin 0.8s linear infinite',flexShrink:0}}/><span style={{fontSize:11,color:'#78350F'}}>Analisando <strong>{queue[0]}</strong> — {queue.length} restante(s)</span></div>}
      <div style={{display:'flex',gap:0,overflowX:'auto',padding:'0 18px 0',scrollbarWidth:'none',borderTop:`1px solid ${T.border}`}}>
        {TABS.map(({key,label})=>{
          const active=key===tab&&!showLog
          const TabIcon=TAB_ICON[key]||Icon.soccer
          const catColor=T.cat[key]||T.black
          return (
            <button key={key} onClick={()=>onTab(key)} style={{display:'flex',alignItems:'center',gap:6,padding:'11px 14px',border:'none',borderBottom:`2px solid ${active?T.black:'transparent'}`,background:'transparent',color:active?T.black:T.gray1,fontSize:12,fontWeight:active?700:500,cursor:'pointer',whiteSpace:'nowrap',flexShrink:0,transition:'all 0.12s',marginBottom:-1}}>
              <TabIcon c={active?catColor:T.gray3} s={14}/>
              {label}
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ─── SPLASH ───────────────────────────────────────────────────────────────────
function SplashScreen() {
  return (
    <div style={{position:'fixed',inset:0,background:T.green,display:'flex',alignItems:'center',justifyContent:'center',flexDirection:'column',gap:8,zIndex:999}}>
      <div style={{fontSize:48,fontWeight:900,color:T.white,letterSpacing:'-0.04em',lineHeight:1}}>Guru das Bets</div>
      <div style={{fontSize:13,fontWeight:500,color:'rgba(255,255,255,0.7)',letterSpacing:'0.06em'}}>PREVISÕES INTELIGENTES</div>
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
  const [tab,setTab]=useState('loterias')
  const [selItem,setSelItem]=useState(null)
  const [showLog,setShowLog]=useState(false)
  const [activeFilter,setActiveFilter]=useState('all')

  const {appData,logs,updating,lastAt,countdown,queue,force}=useAutoUpdate(SEED)
  const {isMobile,isTablet,isDesktop}=useBreakpoint()

  const isLoto=tab==='loterias'
  const espData=appData.esportes[tab]; const espItems=espData?.items||[]
  const catUpd=updating&&queue.includes(tab)
  const totalLive=Object.values(appData.esportes).flatMap(d=>d.items).filter(i=>i.status==='live').length

  function handleTab(key){setTab(key);setShowLog(false);setActiveFilter('all')}

  // ── DESKTOP ──
  if (isDesktop) {
    const filteredItems=isLoto
      ?appData.loterias.filter(l=>activeFilter==='all'||(activeFilter==='acumulado'&&l.acumulado))
      :espItems.filter(i=>activeFilter==='all'||(activeFilter==='live'&&i.status==='live')||(activeFilter==='upcoming'&&i.status==='upcoming'))

    return (
      <div style={{display:'flex',flexDirection:'column',height:'100vh',background:T.bg}}>
        <style>{CSS}</style>
        <DesktopNav tab={tab} onTab={handleTab} updating={updating} countdown={countdown} queue={queue} showLog={showLog} onToggleLog={()=>setShowLog(v=>!v)} force={force}/>

        <div style={{flex:1,overflowY:'auto'}}>
          {/* Centered content — like Kalshi */}
          <div style={{maxWidth:1280,margin:'0 auto',padding:'32px 40px 56px'}}>

            {showLog?(
              <EngineLog logs={logs} updating={updating} lastAt={lastAt} countdown={countdown} queue={queue} force={force}/>
            ):(
              <>
                {/* Page header */}
                <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:24}}>
                  <h1 style={{fontSize:26,fontWeight:800,color:T.black,letterSpacing:'-0.04em'}}>
                    {isLoto?'Loterias':TABS.find(t=>t.key===tab)?.label}
                  </h1>
                  <div style={{display:'flex',gap:8,alignItems:'center'}}>
                    {(!isLoto?['all','live','upcoming']:['all','acumulado']).map(f=>(
                      <button key={f} onClick={()=>setActiveFilter(f)} style={{padding:'7px 16px',borderRadius:T.r.pill,border:`1px solid ${activeFilter===f?T.black:T.border}`,background:activeFilter===f?T.black:T.white,color:activeFilter===f?T.white:T.black,fontSize:13,fontWeight:activeFilter===f?700:500,cursor:'pointer',transition:'all 0.15s'}}>
                        {f==='all'?'Todos':f==='live'?'Ao Vivo':f==='upcoming'?'Próximos':'Acumulados'}
                      </button>
                    ))}
                  </div>
                </div>

                {isLoto&&(
                  <div style={{background:'#FFFBEB',border:'1px solid #FDE68A',borderRadius:T.r.md,padding:'11px 18px',marginBottom:20,fontSize:12,color:'#78350F',lineHeight:1.6}}>
                    <strong>Jogo responsável.</strong> Sugestões baseadas em estatística histórica — não garantem resultado.
                  </div>
                )}

                {/* 3-col grid — all cards same height via CARD_H */}
                <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:16,alignItems:'start'}}>
                  {isLoto
                    ?filteredItems.map(lot=><KalshiLotoCard key={lot.id} lot={lot} onSelect={setSelItem} catUpdating={catUpd}/>)
                    :filteredItems.map(item=><KalshiSportCard key={item.id} item={item} catKey={tab} onSelect={setSelItem} catUpdating={catUpd}/>)
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
      <MobileHeader tab={tab} onTab={handleTab} updating={updating} countdown={countdown} queue={queue} showLog={showLog} onToggleLog={()=>setShowLog(v=>!v)} force={force}/>
      <div style={{padding:isTablet?'24px 28px 100px':'16px 16px 100px',maxWidth:isTablet?900:'100%',margin:'0 auto'}}>
        {showLog?(
          <EngineLog logs={logs} updating={updating} lastAt={lastAt} countdown={countdown} queue={queue} force={force}/>
        ):(
          <>
            {isLoto&&<div style={{background:'#FFFBEB',border:'1px solid #FDE68A',borderRadius:T.r.md,padding:'11px 16px',marginBottom:16,fontSize:12,color:'#78350F',lineHeight:1.6}}><strong>Jogo responsável.</strong> Sugestões baseadas em estatística — não garantem resultado.</div>}
            {!isLoto&&<div style={{display:'flex',gap:0,marginBottom:0,overflowX:'auto',borderBottom:`1px solid ${T.border}`,marginLeft:-16,marginRight:-16,paddingLeft:16}}>
              {['all','live','upcoming'].map((f)=>(
                <button key={f} style={{padding:'10px 14px',border:'none',borderBottom:`2px solid ${activeFilter===f?T.black:'transparent'}`,background:'transparent',color:activeFilter===f?T.black:T.gray1,fontSize:12,fontWeight:activeFilter===f?700:500,cursor:'pointer',whiteSpace:'nowrap',flexShrink:0,marginBottom:-1}} onClick={()=>setActiveFilter(f)}>
                  {f==='all'?`Todos (${espItems.length})`:f==='live'?'Ao Vivo':'Próximos'}
                </button>
              ))}
            </div>}
            {!isLoto&&<div style={{height:16}}/>}
            <div style={{display:'grid',gridTemplateColumns:isTablet?'repeat(2,1fr)':'1fr',gap:isTablet?16:0}}>
              {isLoto
                ?appData.loterias.map(lot=><LotoCard key={lot.id} lot={lot} onSelect={setSelItem} catUpdating={catUpd}/>)
                :espItems.filter(i=>activeFilter==='all'||(activeFilter==='live'&&i.status==='live')||(activeFilter==='upcoming'&&i.status==='upcoming')).map(item=><SportCard key={item.id} item={item} catKey={tab} onSelect={setSelItem} catUpdating={catUpd}/>)
              }
            </div>
          </>
        )}
      </div>

      {/* Mobile bottom nav */}
      {isMobile&&(
        <div style={{position:'fixed',bottom:0,left:0,right:0,background:T.white,borderTop:`1px solid ${T.border}`,display:'flex',justifyContent:'space-around',paddingTop:10,paddingBottom:'env(safe-area-inset-bottom,20px)',zIndex:100}}>
          {[
            {key:'home',    label:'Início',  Ic:Icon.home},
            {key:'play',    label:'Apostar', badge:totalLive, Ic:Icon.play},
            {key:'settings',label:'Motor',   engineDot:updating, Ic:Icon.settings},
            {key:'profile', label:'Perfil',  Ic:Icon.person},
          ].map(({key,label,Ic,badge,engineDot})=>{
            const active=key==='settings'?showLog:false
            return (
              <button key={key} onClick={()=>{if(key==='settings')setShowLog(v=>!v)}} style={{background:'none',border:'none',display:'flex',flexDirection:'column',alignItems:'center',gap:3,cursor:'pointer',position:'relative',minWidth:60,color:active?T.black:T.gray1,padding:'4px 0'}}>
                {badge>0&&<span style={{position:'absolute',top:-2,right:4,background:T.red,color:T.white,fontSize:9,fontWeight:900,borderRadius:T.r.pill,padding:'1px 5px',lineHeight:1.5}}>{badge}</span>}
                {engineDot&&!showLog&&<span style={{position:'absolute',top:0,right:6,width:8,height:8,borderRadius:'50%',background:'#F59E0B',border:`2px solid ${T.white}`,animation:'pulse 1.5s infinite'}}/>}
                <Ic c={active?T.black:T.gray1} s={22}/>
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
