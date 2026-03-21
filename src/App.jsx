import React, { useState, useEffect, useCallback, useRef } from 'react'

const API_KEY = import.meta.env.VITE_ANTHROPIC_API_KEY || ''

const T = {
  green:'#00D672', black:'#111111', white:'#FFFFFF',
  bg:'#F7F7F5', border:'#E8E8E4', gray1:'#737373',
  gray2:'#F0F0ED', gray3:'#D4D4CC', red:'#E53935',
  cat:{ loterias:'#1A7A4A', futebol:'#1A7A4A', basquete:'#B45309', volei:'#5B21B6', mma:'#B91C1C', tenis:'#0369A1', esports:'#6D28D9' },
  catBg:{ loterias:'#D1FAE5', futebol:'#DCFCE7', basquete:'#FEF3C7', volei:'#EDE9FE', mma:'#FEE2E2', tenis:'#DBEAFE', esports:'#F3E8FF' },
  r:{ sm:8, md:12, lg:16, pill:999 },
}

function useBreakpoint() {
  const [w,setW]=useState(typeof window!=='undefined'?window.innerWidth:1200)
  useEffect(()=>{const fn=()=>setW(window.innerWidth);window.addEventListener('resize',fn);return()=>window.removeEventListener('resize',fn)},[])
  return{isMobile:w<768,isTablet:w>=768&&w<1100,isDesktop:w>=1100,w}
}

// ─── ICONS — proper React components with {size,color} props ─────────────────
// Using simple, clean paths that render clearly at small sizes
const IcoLottery   = ({size=16,color='currentColor'}) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{display:'block',flexShrink:0}}><rect x="2" y="3" width="20" height="18" rx="2"/><circle cx="8.5" cy="9.5" r="1.5"/><circle cx="15.5" cy="9.5" r="1.5"/><circle cx="8.5" cy="14.5" r="1.5"/><circle cx="15.5" cy="14.5" r="1.5"/></svg>
const IcoSoccer    = ({size=16,color='currentColor'}) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{display:'block',flexShrink:0}}><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20A14.5 14.5 0 0 0 12 2"/><path d="M2 12h20"/></svg>
const IcoBasket    = ({size=16,color='currentColor'}) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{display:'block',flexShrink:0}}><circle cx="12" cy="12" r="10"/><path d="M4.9 4.9c3.1 3.1 3.1 8.1 0 11.2M19.1 4.9c-3.1 3.1-3.1 8.1 0 11.2M2 12h20"/></svg>
const IcoVolley    = ({size=16,color='currentColor'}) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{display:'block',flexShrink:0}}><circle cx="12" cy="12" r="10"/><path d="M12 2c-2 4-2 8 0 12M12 2c2 4 2 8 0 12M2 8h20M2 16h20"/></svg>
const IcoMMA       = ({size=16,color='currentColor'}) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{display:'block',flexShrink:0}}><path d="M6.5 6.5C6.5 4.01 8.51 2 11 2s4.5 2.01 4.5 4.5c0 1.74-.99 3.26-2.44 4.03L14 14H9l.94-3.47A4.49 4.49 0 0 1 6.5 6.5z"/><path d="M9 14v2a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2v-2"/></svg>
const IcoTennis    = ({size=16,color='currentColor'}) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{display:'block',flexShrink:0}}><circle cx="12" cy="12" r="10"/><path d="M18.6 6.4c-1.6 3.5-1.6 7.7 0 11.2M5.4 6.4c1.6 3.5 1.6 7.7 0 11.2"/></svg>
const IcoEsports   = ({size=16,color='currentColor'}) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{display:'block',flexShrink:0}}><rect x="2" y="6" width="20" height="12" rx="2"/><path d="M12 12h.01"/><path d="M7 12h2"/><path d="M8 11v2"/><path d="M15.5 11.5l1 1 1-1"/></svg>
const IcoRefresh   = ({size=16,color='currentColor'}) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{display:'block',flexShrink:0}}><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/></svg>
const IcoHome      = ({size=22,color='currentColor'}) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{display:'block',flexShrink:0}}><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
const IcoPlay      = ({size=22,color='currentColor'}) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{display:'block',flexShrink:0}}><circle cx="12" cy="12" r="10"/><polygon points="10 8 16 12 10 16 10 8"/></svg>
const IcoSettings  = ({size=22,color='currentColor'}) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{display:'block',flexShrink:0}}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
const IcoPerson    = ({size=22,color='currentColor'}) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{display:'block',flexShrink:0}}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
const IcoCheck     = ({size=24,color='currentColor'}) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{display:'block',flexShrink:0}}><polyline points="20 6 9 17 4 12"/></svg>
const IcoClose     = ({size=18,color='currentColor'}) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{display:'block',flexShrink:0}}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
const IcoLiveDot   = () => <span style={{display:'inline-block',width:7,height:7,borderRadius:'50%',background:T.red,flexShrink:0}}/>

const TAB_ICON = {
  loterias: IcoLottery, futebol: IcoSoccer, basquete: IcoBasket,
  volei: IcoVolley, mma: IcoMMA, tenis: IcoTennis, esports: IcoEsports,
}

const LogoSVG = ({height=32}) => (
  <svg height={height} viewBox="0 0 233 76" fill="none" xmlns="http://www.w3.org/2000/svg" style={{display:'block',flexShrink:0,width:'auto'}}>
    <path d="M74.0854 30.0513C74.5746 32.4655 74.8316 34.964 74.8316 37.5226C74.8316 58.1867 58.08 74.9384 37.4158 74.9384C27.5148 74.9384 18.5122 71.0925 11.8199 64.8134C13.8065 63.3352 15.5965 61.679 17.2008 59.9022C23.4708 52.9586 26.9499 44.1486 28.5939 36.5012C29.9553 36.9719 31.3287 37.4012 32.7114 37.7837C41.1238 40.1109 50.1259 40.7732 58.8892 38.2633C64.2528 36.7272 69.3671 34.0472 74.0854 30.0513ZM3.09997 22.5871C7.83786 26.125 13.1993 29.5564 18.9355 32.4158C17.7741 39.1517 14.8788 47.1598 9.58355 53.024C8.31379 54.4302 6.91008 55.7102 5.35733 56.8254C1.95671 51.1897 4.63052e-06 44.5847 0 37.5226C0 32.2132 1.10598 27.1621 3.09997 22.5871ZM37.4158 0.10675C51.5788 0.10675 63.9038 7.97605 70.2571 19.5807C65.7536 24.2672 60.9364 27.0011 56.0633 28.3968C49.5876 30.2515 42.5777 29.8644 35.4478 27.892C25.6984 25.1949 16.1937 19.6597 8.48481 13.7946C15.3468 5.43772 25.7587 0.10675 37.4158 0.10675Z" fill="black"/>
    <path d="M224.8 39.78C221.64 42.54 217.52 43.92 212.44 43.92C207.36 43.92 203.24 42.54 200.08 39.78C196.92 37.02 195.34 33.4 195.34 28.92V0.959961H207.34V27.6C207.34 30.72 209.04 32.28 212.44 32.28C215.84 32.28 217.54 30.72 217.54 27.6V0.959961H229.54V28.92C229.54 33.4 227.96 37.02 224.8 39.78Z" fill="black"/>
    <path d="M182.793 42.9L176.133 29.7H173.133V42.9H161.133V0.899963H177.933C182.533 0.899963 186.333 2.25996 189.333 4.97997C192.333 7.65996 193.833 11.22 193.833 15.66C193.833 18.14 193.253 20.38 192.093 22.38C190.973 24.38 189.393 26 187.353 27.24L195.633 42.9H182.793ZM173.133 11.94V19.74H177.693C178.973 19.78 179.973 19.46 180.693 18.78C181.453 18.1 181.833 17.14 181.833 15.9C181.833 14.66 181.453 13.7 180.693 13.02C179.973 12.3 178.973 11.94 177.693 11.94H173.133Z" fill="black"/>
    <path d="M153.37 39.78C150.21 42.54 146.09 43.92 141.01 43.92C135.93 43.92 131.81 42.54 128.65 39.78C125.49 37.02 123.91 33.4 123.91 28.92V0.959961H135.91V27.6C135.91 30.72 137.61 32.28 141.01 32.28C144.41 32.28 146.11 30.72 146.11 27.6V0.959961H158.11V28.92C158.11 33.4 156.53 37.02 153.37 39.78Z" fill="black"/>
    <path d="M122.382 18.18V23.16C122.382 29.16 120.443 34.12 116.563 38.04C112.723 41.96 107.662 43.92 101.382 43.92C94.8225 43.92 89.4625 41.84 85.3025 37.68C81.1425 33.48 79.0625 28.26 79.0625 22.02C79.0625 15.78 81.1425 10.56 85.3025 6.36C89.4625 2.12 94.6625 0 100.903 0C104.823 0 108.402 0.88 111.642 2.64C114.923 4.4 117.502 6.78 119.382 9.78L109.182 15.6C107.502 13.04 104.822 11.76 101.142 11.76C98.1425 11.76 95.7025 12.72 93.8225 14.64C91.9825 16.56 91.0625 19.04 91.0625 22.08C91.0625 24.96 91.9225 27.48 93.6425 29.64C95.3625 31.76 98.0225 32.82 101.622 32.82C105.782 32.82 108.562 31.34 109.962 28.38H101.023V18.18H122.382Z" fill="black"/>
    <path d="M221.317 75.0451C218.917 75.0451 216.921 74.5019 215.33 73.4156C213.763 72.3039 212.765 70.7628 212.336 68.7922L214.117 67.8827C214.42 69.4996 215.191 70.7754 216.429 71.7102C217.667 72.645 219.322 73.1124 221.393 73.1124C223.44 73.1124 225.12 72.6829 226.434 71.8239C227.773 70.9397 228.594 69.7522 228.897 68.2616C229.074 67.3774 229.036 66.6068 228.783 65.9499C228.556 65.293 228.076 64.7246 227.343 64.2446C226.61 63.7393 225.953 63.3603 225.372 63.1077C224.817 62.8298 223.983 62.4887 222.871 62.0845C222.012 61.7813 221.292 61.516 220.711 61.2886C220.13 61.036 219.461 60.6823 218.703 60.2275C217.97 59.7475 217.389 59.2548 216.959 58.7496C216.555 58.219 216.239 57.5495 216.012 56.741C215.81 55.9326 215.797 55.0483 215.974 54.0883C216.378 52.0418 217.414 50.4628 219.082 49.3512C220.774 48.2395 222.669 47.6837 224.766 47.6837C226.914 47.6837 228.657 48.2016 229.996 49.2375C231.335 50.2481 232.257 51.5744 232.762 53.2166L230.981 54.1262C230.046 51.1197 227.937 49.6164 224.652 49.6164C223.035 49.6164 221.595 50.0333 220.332 50.867C219.094 51.7008 218.324 52.8377 218.02 54.2777C217.844 55.162 217.869 55.9326 218.096 56.5894C218.349 57.2463 218.829 57.8274 219.536 58.3327C220.269 58.8127 220.926 59.1917 221.507 59.4696C222.088 59.7222 222.922 60.0507 224.008 60.4549C224.918 60.7833 225.638 61.0612 226.168 61.2886C226.724 61.516 227.394 61.8697 228.177 62.3497C228.96 62.8298 229.541 63.3224 229.92 63.8277C230.324 64.333 230.627 65.0025 230.83 65.8362C231.057 66.6447 231.082 67.529 230.905 68.489C230.476 70.6112 229.389 72.2408 227.646 73.3777C225.903 74.4893 223.793 75.0451 221.317 75.0451Z" fill="black"/>
    <path d="M215.841 48.1006L215.499 49.9954H207.162L202.842 74.6283H200.796L205.116 49.9954H196.816L197.12 48.1006H215.841Z" fill="black"/>
    <path d="M195.636 49.9954H182.524L180.705 60.3033H192.87L192.529 62.1982H180.402L178.545 72.7334H191.809L191.468 74.6283H176.195L180.857 48.1006H195.939L195.636 49.9954Z" fill="black"/>
    <path d="M175.055 55.2252C174.852 56.4631 174.36 57.5874 173.577 58.598C172.793 59.6086 171.821 60.3917 170.659 60.9476C171.896 61.4781 172.819 62.3371 173.425 63.5245C174.057 64.712 174.259 66.051 174.031 67.5416C173.728 69.5122 172.781 71.1923 171.189 72.5819C169.597 73.9461 167.69 74.6283 165.467 74.6283H154.098L158.759 48.1006H168.802C170.823 48.1006 172.44 48.808 173.652 50.2228C174.89 51.6123 175.358 53.2798 175.055 55.2252ZM167.21 60.1517C168.574 60.1517 169.825 59.6591 170.962 58.6738C172.099 57.6632 172.793 56.4631 173.046 55.0736C173.299 53.6588 173.008 52.4587 172.174 51.4734C171.341 50.4881 170.191 49.9954 168.726 49.9954H160.426L158.645 60.1517H167.21ZM169.825 71.1797C171.037 70.1438 171.77 68.8806 172.023 67.39C172.275 65.8994 171.985 64.6362 171.151 63.6003C170.317 62.5645 169.181 62.0466 167.74 62.0466H158.304L156.447 72.7334H165.656C167.223 72.7334 168.612 72.2155 169.825 71.1797Z" fill="black"/>
    <path d="M133.524 75.0451C131.124 75.0451 129.128 74.5019 127.537 73.4156C125.97 72.3039 124.972 70.7628 124.543 68.7922L126.324 67.8827C126.627 69.4996 127.398 70.7754 128.636 71.7102C129.874 72.645 131.529 73.1124 133.6 73.1124C135.647 73.1124 137.327 72.6829 138.641 71.8239C139.98 70.9397 140.801 69.7522 141.104 68.2616C141.281 67.3774 141.243 66.6068 140.99 65.9499C140.763 65.293 140.283 64.7246 139.55 64.2446C138.817 63.7393 138.161 63.3603 137.579 63.1077C137.024 62.8298 136.19 62.4887 135.078 62.0845C134.219 61.7813 133.499 61.516 132.918 61.2886C132.337 61.036 131.668 60.6823 130.91 60.2275C130.177 59.7475 129.596 59.2548 129.166 58.7496C128.762 58.219 128.446 57.5495 128.219 56.741C128.017 55.9326 128.004 55.0483 128.181 54.0883C128.585 52.0418 129.621 50.4628 131.289 49.3512C132.981 48.2395 134.876 47.6837 136.973 47.6837C139.121 47.6837 140.864 48.2016 142.203 49.2375C143.542 50.2481 144.464 51.5744 144.969 53.2166L143.188 54.1262C142.253 51.1197 140.144 49.6164 136.859 49.6164C135.242 49.6164 133.802 50.0333 132.539 50.867C131.301 51.7008 130.531 52.8377 130.227 54.2777C130.051 55.162 130.076 55.9326 130.303 56.5894C130.556 57.2463 131.036 57.8274 131.743 58.3327C132.476 58.8127 133.133 59.1917 133.714 59.4696C134.295 59.7222 135.129 60.0507 136.215 60.4549C137.125 60.7833 137.845 61.0612 138.375 61.2886C138.931 61.516 139.601 61.8697 140.384 62.3497C141.167 62.8298 141.748 63.3224 142.127 63.8277C142.531 64.333 142.834 65.0025 143.037 65.8362C143.264 66.6447 143.289 67.529 143.112 68.489C142.683 70.6112 141.596 72.2408 139.853 73.3777C138.11 74.4893 136 75.0451 133.524 75.0451Z" fill="black"/>
    <path d="M121.65 74.6283L120.286 67.8827H106.984L103.194 74.6283H100.996L115.965 48.1006H118.088L123.696 74.6283H121.65ZM108.045 65.9878H119.869L116.723 50.5639L108.045 65.9878Z" fill="black"/>
    <path d="M93.2609 48.1006C96.7727 48.1006 99.5139 49.4396 101.485 52.1176C103.455 54.7957 104.112 57.979 103.455 61.6676C102.798 65.3815 101.08 68.4764 98.3012 70.9523C95.5474 73.4029 92.3135 74.6283 88.5996 74.6283H78.6328L83.2941 48.1006H93.2609ZM101.485 61.3644C102.015 58.1811 101.485 55.4904 99.8929 53.2924C98.3265 51.0944 96.0148 49.9954 92.9578 49.9954H84.9616L80.9824 72.7334H88.9407C92.023 72.7334 94.7389 71.6471 97.0885 69.4743C99.4634 67.2763 100.929 64.573 101.485 61.3644Z" fill="black"/>
  </svg>
)


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
    { id:'f1', status:'live',     statusLabel:'Hoje · 21h30 · Morumbis',          competition:'Brasileirão · 8ª Rodada', title:'São Paulo × Palmeiras',      subtitle:'Choque-Rei pela liderança',          guruPick:'Palmeiras',    guruConf:62, guruReason:'Palmeiras líder com saldo +11. São Paulo sem Lucas Moura.',              home:{name:'São Paulo',    sub:'2º · 16pts',pct:31}, away:{name:'Palmeiras',    sub:'1º · 16pts',pct:48}, draw:21, vol:'R$ 18,4M' },
    { id:'f2', status:'live',     statusLabel:'Hoje · 20h30 · Neo Química',       competition:'Brasileirão · 8ª Rodada', title:'Corinthians × Flamengo',     subtitle:'Clássico nacional em SP',            guruPick:'Empate',       guruConf:38, guruReason:'Corinthians em casa, 5 sem vencer. Fla em 4 vitórias seguidas.',         home:{name:'Corinthians',  sub:'9º · 8pts', pct:26}, away:{name:'Flamengo',     sub:'4º · 13pts',pct:44}, draw:30, vol:'R$ 14,2M' },
    { id:'f3', status:'upcoming', statusLabel:'22/03 · 18h30 · Maracanã',         competition:'Brasileirão · 8ª Rodada', title:'Fluminense × Atlético-MG',   subtitle:'Duelo direto na tabela',             guruPick:'Fluminense',   guruConf:48, guruReason:'Fluminense em casa, 5º com 13pts. Atlético oscila fora.',               home:{name:'Fluminense',   sub:'5º · 13pts',pct:44}, away:{name:'Atlético-MG',  sub:'8º · 10pts',pct:32}, draw:24, vol:'R$ 7,1M' },
    { id:'f4', status:'upcoming', statusLabel:'22/03 · 16h00 · Nilton Santos',    competition:'Brasileirão · 8ª Rodada', title:'Vasco × Grêmio',             subtitle:'Gigante da Colina vs Tricolor',      guruPick:'Vasco',        guruConf:52, guruReason:'Vasco em casa após 3×2 vs Flu. Grêmio com viagem longa.',              home:{name:'Vasco',        sub:'10º · 9pts',pct:45}, away:{name:'Grêmio',       sub:'7º · 11pts',pct:31}, draw:24, vol:'R$ 6,8M' },
  ]},
  basquete: { label:'Basquete',  items:[
    { id:'b1', status:'live',     statusLabel:'Hoje · 19h · Ibirapuera',          competition:'NBB 2025/26 · 30ª Rodada',title:'Flamengo × Pinheiros',       subtitle:'Líder recebe o Mengão em ascensão',  guruPick:'Flamengo',     guruConf:61, guruReason:'Fla virou 15pts de desvantagem. Muito motivado.',                       home:{name:'Flamengo',    sub:'3º · 21V',  pct:58}, away:{name:'Pinheiros',   sub:'1º · 26V',  pct:30}, draw:12, vol:'R$ 2,1M' },
    { id:'b2', status:'upcoming', statusLabel:'21/03 · 20h · Arena Caixa',        competition:'NBB 2025/26 · 30ª Rodada',title:'Sesi Franca × Fortaleza BC', subtitle:'Tetracampeão busca mais vitória',     guruPick:'Sesi Franca',  guruConf:78, guruReason:'31pts de Lucas Dias. Franca venceu 8 dos últimos 10 jogos.',            home:{name:'Sesi Franca', sub:'2º · 24V',  pct:72}, away:{name:'Fortaleza BC',sub:'9º · 14V',  pct:16}, draw:12, vol:'R$ 1,4M' },
  ]},
  volei:    { label:'Vôlei',     items:[
    { id:'v1', status:'live',     statusLabel:'Hoje · 21h · Arena Paulo Skaf',    competition:'Superliga Masc. · Rd 10', title:'Joinville × Sada Cruzeiro',  subtitle:'Decacampeão visita Joinville',       guruPick:'Sada Cruzeiro',guruConf:67, guruReason:'Sada tem a melhor defesa. Wallace e Douglas dominam.',                  home:{name:'Joinville',   sub:'6º lugar',  pct:25}, away:{name:'Sada Cruzeiro',sub:'1º lugar',  pct:65}, draw:10, vol:'R$ 1,2M' },
    { id:'v2', status:'upcoming', statusLabel:'22/03 · 20h · Ginásio Mineirinho', competition:'Superliga Fem. · Rd 10',  title:'Praia Clube × Sesc Flamengo',subtitle:'Duelo de gigantes pelo topo',        guruPick:'Sesc Flamengo',guruConf:60, guruReason:'Sesc com Bernardinho é mais consistente na temporada.',                home:{name:'Praia Clube', sub:'3º lugar',  pct:31}, away:{name:'Sesc Flamengo',sub:'1º lugar',  pct:57}, draw:12, vol:'R$ 1,4M' },
  ]},
  mma:      { label:'MMA / UFC', items:[
    { id:'m1', status:'live',     statusLabel:'Hoje · UFC FN 270 · Londres',      competition:'UFC Fight Night 270',     title:'Evloev × Murphy',            subtitle:'Dois invictos pelo cinturão',        guruPick:'Decisão',      guruConf:55, guruReason:'Evloev 19-0 vs Murphy 17-0. Britânico em casa. Decisão técnica.',      home:{name:'L. Murphy',   sub:'17-0 · Pena',pct:44},away:{name:'M. Evloev',  sub:'19-0 · Pena',pct:44},draw:12,vol:'R$ 8,4M' },
    { id:'m2', status:'upcoming', statusLabel:'28/03 · Las Vegas',                competition:'UFC Fight Night',         title:'Adesanya × Pyfer',           subtitle:'Ex-campeão busca retorno ao top 5',  guruPick:'Adesanya',     guruConf:58, guruReason:'Melhor alcance, KO power e experiência de campeonato.',                home:{name:'I. Adesanya', sub:'25-4 · MW', pct:55}, away:{name:'J. Pyfer',   sub:'13-2 · Top15',pct:34},draw:11,vol:'R$ 6,2M' },
  ]},
  tenis:    { label:'Tênis',     items:[
    { id:'t1', status:'live',     statusLabel:'Hoje · Miami Open',                competition:'ATP Masters 1000 · Miami',title:'Sinner × Dzumhur',           subtitle:'Campeão IW estreia em Miami',        guruPick:'Sinner',       guruConf:92, guruReason:'Sinner venceu IW sem perder set. Dzumhur Nº74 sem histórico vs top5.',home:{name:'J. Sinner',   sub:'Nº2 · IW Camp.',pct:89},away:{name:'D. Dzumhur',sub:'Nº74 ATP',pct:8},  draw:3,  vol:'R$ 4,1M' },
    { id:'t2', status:'upcoming', statusLabel:'~27/03 · Miami Open Final',        competition:'ATP Miami 2026 · Projeção',title:'Sinner × Alcaraz',          subtitle:'Sunshine Double em disputa',         guruPick:'Sinner',       guruConf:47, guruReason:'Sinner tem 2 finais e 1 título em Miami. Alcaraz 2º favorito.',        home:{name:'J. Sinner',   sub:'Nº2 · Fav.',pct:44}, away:{name:'C. Alcaraz', sub:'Nº1 · 16-1',pct:38}, draw:18, vol:'R$ 11,2M' },
  ]},
  esports:  { label:'E-sports',  items:[
    { id:'e1', status:'upcoming', statusLabel:'28/03 · CBLOL Etapa 1',            competition:'CBLOL 2026 · Etapa 1',    title:'LOUD × paiN Gaming',         subtitle:'Campeã estreia na Etapa 1',          guruPick:'LOUD',         guruConf:66, guruReason:'LOUD campeã Copa CBLOL 2026. Bull e RedBert dominantes.',              home:{name:'LOUD',        sub:'Campeã Copa',pct:62}, away:{name:'paiN Gaming', sub:'4º Copa',   pct:24}, draw:14, vol:'R$ 1,8M' },
    { id:'e2', status:'upcoming', statusLabel:'06/06 · Grande Final',             competition:'CBLOL 2026 · Campeão',    title:'LOUD vence o campeonato?',   subtitle:'Projeção Etapa 1 completa',          guruPick:'LOUD',         guruConf:42, guruReason:'LOUD bicampeã com coesão. FURIA com bootcamp na Coreia é ameaça.',     home:{name:'LOUD',        sub:'Bicampeã',   pct:40}, away:{name:'FURIA/RED',   sub:'Rivais',    pct:60}, draw:0,  vol:'R$ 5,6M' },
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
const INTERVAL = 2*60*60*1000

async function callClaude(data, category) {
  const hora = new Date().toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'})
  const system = `Você é o motor de análise do Guru das Bets. Responda SOMENTE JSON válido, sem markdown. Hora: ${hora}`
  let prompt = ''
  if (category==='loterias') {
    prompt=`Recalcule previsões das loterias Caixa com base em frequência histórica e ciclo de atraso.
Dados: ${JSON.stringify(data.loterias.map(l=>({id:l.id,guruNums:l.guruNums,guruConf:l.guruConf})))}
Retorne JSON array:
[{"id":"mega","guruNums":[n,n,n,n,n,n],"guruConf":18,"guruAnalise":"max 120 chars"},
 {"id":"lotofacil","guruNums":[15 distintos 1-25],"guruConf":34,"guruAnalise":"..."},
 {"id":"quina","guruNums":[5 de 1-80],"guruConf":22,"guruAnalise":"..."},
 {"id":"timemania","guruNums":[7 de 1-80],"guruConf":12,"guruAnalise":"..."},
 {"id":"duplasena","guruNums":[6 de 1-50],"guruConf":15,"guruAnalise":"..."},
 {"id":"diadesorte","guruNums":[7 de 1-31],"guruConf":14,"guruAnalise":"..."}]`
  } else {
    const esp=data.esportes[category]; if (!esp) return null
    prompt=`Recalcule previsões para ${esp.label}.
Dados: ${JSON.stringify(esp.items.map(i=>({id:i.id,title:i.title,guruPick:i.guruPick,guruConf:i.guruConf})))}
Retorne JSON array (${esp.items.length} itens):
[{"id":"...","guruPick":"...","guruConf":0-95,"guruReason":"max 100 chars","homePct":0-100,"awayPct":0-100,"draw":0-100}]`
  }
  const res=await fetch('https://api.anthropic.com/v1/messages',{method:'POST',headers:{'Content-Type':'application/json','x-api-key':API_KEY,'anthropic-version':'2023-06-01','anthropic-dangerous-direct-browser-access':'true'},body:JSON.stringify({model:'claude-sonnet-4-20250514',max_tokens:1200,system,messages:[{role:'user',content:prompt}]})})
  if (!res.ok) throw new Error(`API ${res.status}`)
  const json=await res.json()
  const txt=json.content?.find(b=>b.type==='text')?.text||'[]'
  return JSON.parse(txt.replace(/```json|```/g,'').trim())
}

function useAutoUpdate(seed) {
  const [appData,setAppData]=useState(seed)
  const [logs,setLogs]=useState([])
  const [updating,setUpdating]=useState(false)
  const [lastAt,setLastAt]=useState(null)
  const [nextAt,setNextAt]=useState(null)
  const [queue,setQueue]=useState([])
  const [countdown,setCountdown]=useState('')
  const timerRef=useRef(null); const cdRef=useRef(null)

  const addLog=useCallback((msg,t='info')=>{
    const ts=new Date().toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit',second:'2-digit'})
    setLogs(p=>[{msg,t,ts},...p].slice(0,50))
  },[])

  const runCycle=useCallback(async(cur,manual=false)=>{
    setUpdating(true); const cats=['loterias',...Object.keys(ESPORTES)]; setQueue([...cats])
    addLog(manual?'Atualização manual':'Ciclo automático de 2h','start')
    const nd={loterias:[...cur.loterias],esportes:{...cur.esportes}}; let ok=0
    for (const cat of cats) {
      setQueue(q=>q.filter(c=>c!==cat)); addLog(`Analisando: ${cat}`,'loading')
      try {
        const upd=await callClaude(nd,cat)
        if (!upd||!Array.isArray(upd)){addLog(`${cat}: inválido`,'warn');continue}
        if (cat==='loterias'){nd.loterias=nd.loterias.map(l=>{const u=upd.find(x=>x.id===l.id);return u?{...l,...u}:l})}
        else{if(!nd.esportes[cat])continue;nd.esportes[cat]={...nd.esportes[cat],items:nd.esportes[cat].items.map(item=>{const u=upd.find(x=>x.id===item.id);if(!u)return item;return{...item,guruPick:u.guruPick||item.guruPick,guruConf:u.guruConf??item.guruConf,guruReason:u.guruReason||item.guruReason,home:{...item.home,pct:u.homePct??item.home.pct},away:{...item.away,pct:u.awayPct??item.away.pct},draw:u.draw??item.draw}})}}
        setAppData({...nd}); ok++; addLog(`${cat}: ${upd.length} itens`,'success')
      } catch(e){addLog(`${cat}: ${e.message}`,'error')}
      await new Promise(r=>setTimeout(r,400))
    }
    const ts=new Date(); setLastAt(ts); setNextAt(new Date(ts.getTime()+INTERVAL))
    setUpdating(false); setQueue([]); addLog(`Concluído — ${ok}/${cats.length}`,'done')
  },[addLog])

  useEffect(()=>{cdRef.current=setInterval(()=>{if(!nextAt){setCountdown('');return}const d=nextAt-Date.now();if(d<=0){setCountdown('Agora');return}const h=Math.floor(d/3600000),m=Math.floor((d%3600000)/60000),s=Math.floor((d%60000)/1000);setCountdown(`${h}h ${String(m).padStart(2,'0')}m ${String(s).padStart(2,'0')}s`)},1000);return()=>clearInterval(cdRef.current)},[nextAt])
  useEffect(()=>{runCycle(seed);timerRef.current=setInterval(()=>{setAppData(cur=>{runCycle(cur);return cur})},INTERVAL);return()=>clearInterval(timerRef.current)},[]) // eslint-disable-line
  const force=useCallback(()=>{if(!updating)setAppData(cur=>{runCycle(cur,true);return cur})},[updating,runCycle])
  return{appData,logs,updating,lastAt,countdown,queue,force}
}

// ─── BALL ─────────────────────────────────────────────────────────────────────
function Ball({n, size=24, bg=T.gray2, color=T.black}) {
  return (
    <div style={{width:size,height:size,minWidth:size,borderRadius:'50%',background:bg,display:'flex',alignItems:'center',justifyContent:'center',fontSize:Math.max(8,size*0.38),fontWeight:700,color,flexShrink:0,lineHeight:1}}>
      {String(n).padStart(2,'0')}
    </div>
  )
}

// ─── CARD ICON BOX — consistent 28×28 container ───────────────────────────────
function CatIconBox({catKey}) {
  const Ico = TAB_ICON[catKey] || IcoLottery
  const color = T.cat[catKey] || T.black
  const bg = T.catBg[catKey] || T.gray2
  return (
    <div style={{width:28,height:28,minWidth:28,borderRadius:8,background:bg,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
      <Ico size={15} color={color}/>
    </div>
  )
}

// ─── DESKTOP KALSHI CARD — sport ──────────────────────────────────────────────
const CARD_H = 316

function KalshiSportCard({item, catKey, onSelect, catUpdating}) {
  const [hov,setHov]=useState(false)
  const live=item.status==='live'
  const catColor=T.cat[catKey]||T.black
  const label=TABS.find(t=>t.key===catKey)?.label||catKey

  return (
    <div onClick={()=>onSelect(item)} onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      style={{height:CARD_H,background:T.white,borderRadius:T.r.lg,border:`1px solid ${hov?'#C0C0BB':T.border}`,cursor:'pointer',boxShadow:hov?'0 4px 20px rgba(0,0,0,0.1)':'0 1px 3px rgba(0,0,0,0.04)',transition:'box-shadow 0.15s,border-color 0.15s',display:'flex',flexDirection:'column',overflow:'hidden'}}>

      {/* Header */}
      <div style={{padding:'11px 14px 9px',display:'flex',justifyContent:'space-between',alignItems:'center',borderBottom:`1px solid ${T.border}`,flexShrink:0}}>
        <div style={{display:'flex',alignItems:'center',gap:8,minWidth:0}}>
          <CatIconBox catKey={catKey}/>
          <span style={{fontSize:11,fontWeight:700,color:catColor,letterSpacing:'0.04em',textTransform:'uppercase',whiteSpace:'nowrap'}}>{label}</span>
        </div>
        <span style={{fontSize:11,color:T.gray1,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',marginLeft:8,flexShrink:1}}>{item.competition}</span>
      </div>

      {/* Title */}
      <div style={{padding:'10px 14px 8px',flexShrink:0}}>
        <div style={{fontSize:14,fontWeight:700,color:T.black,lineHeight:1.3,letterSpacing:'-0.02em',overflow:'hidden',display:'-webkit-box',WebkitLineClamp:2,WebkitBoxOrient:'vertical',marginBottom:4}}>{item.title}</div>
        <div style={{display:'flex',alignItems:'center',gap:4}}>
          {live&&<><IcoLiveDot/><span style={{fontSize:11,fontWeight:700,color:T.red,marginLeft:3}}>AO VIVO</span><span style={{fontSize:11,color:T.gray1,margin:'0 2px'}}> · </span></>}
          <span style={{fontSize:11,color:T.gray1,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{item.statusLabel}</span>
        </div>
      </div>

      {/* Teams */}
      <div style={{padding:'0 14px',flex:1,minHeight:0}}>
        {[item.home,item.away].map((side,i)=>{
          const winner=side.pct>(i===0?item.away.pct:item.home.pct)
          return (
            <div key={i} style={{display:'flex',alignItems:'center',gap:10,padding:'7px 0',borderBottom:i===0?`1px solid ${T.border}`:'none'}}>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:13,fontWeight:winner?700:500,color:T.black,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',marginBottom:3}}>{side.name}</div>
                <div style={{height:2,borderRadius:1,background:winner?catColor:T.gray3,width:`${Math.max(12,side.pct)}%`,transition:'width 0.5s'}}/>
              </div>
              <div style={{minWidth:50,textAlign:'center',padding:'4px 9px',borderRadius:T.r.pill,border:`1.5px solid ${catUpdating?T.gray3:'#16A34A'}`,color:catUpdating?T.gray1:'#15803D',fontSize:13,fontWeight:800,background:catUpdating?T.gray2:'#F0FDF4',flexShrink:0}}>
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
          <span style={{fontSize:11,color:T.gray1,lineHeight:1.4,flex:1,overflow:'hidden',display:'-webkit-box',WebkitLineClamp:2,WebkitBoxOrient:'vertical'}}>{catUpdating?'Atualizando...':`${item.guruPick} · ${item.guruReason}`}</span>
          <span style={{fontSize:11,fontWeight:800,color:T.black,flexShrink:0,paddingLeft:4}}>{item.guruConf}%</span>
        </div>
      </div>

      {/* Footer */}
      <div style={{padding:'8px 14px 11px',display:'flex',justifyContent:'space-between',flexShrink:0}}>
        <span style={{fontSize:11,color:T.gray1}}>{item.vol} vol.</span>
        <span style={{fontSize:11,color:T.gray1}}>Empate {item.draw}%</span>
      </div>
    </div>
  )
}

// ─── DESKTOP KALSHI CARD — loteria ────────────────────────────────────────────
function KalshiLotoCard({lot, onSelect, catUpdating}) {
  const [hov,setHov]=useState(false)
  return (
    <div onClick={()=>onSelect(lot)} onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      style={{height:CARD_H,background:T.white,borderRadius:T.r.lg,border:`1px solid ${hov?'#C0C0BB':T.border}`,cursor:'pointer',boxShadow:hov?'0 4px 20px rgba(0,0,0,0.1)':'0 1px 3px rgba(0,0,0,0.04)',transition:'box-shadow 0.15s,border-color 0.15s',display:'flex',flexDirection:'column',overflow:'hidden'}}>

      {/* Header */}
      <div style={{padding:'11px 14px 9px',display:'flex',justifyContent:'space-between',alignItems:'center',borderBottom:`1px solid ${T.border}`,flexShrink:0}}>
        <div style={{display:'flex',alignItems:'center',gap:8}}>
          <CatIconBox catKey="loterias"/>
          <span style={{fontSize:11,fontWeight:700,color:T.cat.loterias,letterSpacing:'0.04em',textTransform:'uppercase'}}>LOTERIA</span>
        </div>
        <div style={{display:'flex',gap:6,alignItems:'center',flexShrink:0}}>
          {lot.acumulado&&<span style={{fontSize:10,fontWeight:700,background:'#FEF3C7',color:'#B45309',borderRadius:4,padding:'2px 7px',whiteSpace:'nowrap'}}>ACUMULADO</span>}
          <span style={{fontSize:11,color:T.gray1,whiteSpace:'nowrap'}}>{lot.dias}</span>
        </div>
      </div>

      {/* Title + prize */}
      <div style={{padding:'10px 14px 7px',flexShrink:0}}>
        <div style={{fontSize:15,fontWeight:800,color:T.black,letterSpacing:'-0.03em',marginBottom:2}}>{lot.nome}</div>
        <div style={{display:'flex',alignItems:'baseline',gap:8,flexWrap:'wrap'}}>
          <span style={{fontSize:17,fontWeight:900,color:T.black,letterSpacing:'-0.04em'}}>{lot.premio}</span>
          <span style={{fontSize:11,color:T.gray1}}>Sorteio {lot.data}</span>
        </div>
      </div>

      {/* Last result */}
      <div style={{padding:'0 14px 7px',flexShrink:0}}>
        <div style={{fontSize:10,fontWeight:700,color:T.gray1,letterSpacing:'0.05em',marginBottom:5}}>ÚLTIMO RESULTADO</div>
        <div style={{display:'flex',gap:3,flexWrap:'wrap'}}>
          {lot.ultimoResultado.slice(0,8).map(n=><Ball key={n} n={n} size={22}/>)}
          {lot.ultimoResultado.length>8&&<span style={{fontSize:10,color:T.gray1,alignSelf:'center',marginLeft:2}}>+{lot.ultimoResultado.length-8}</span>}
        </div>
      </div>

      {/* Guru */}
      <div style={{padding:'0 14px',flex:1,borderTop:`1px solid ${T.border}`,minHeight:0}}>
        <div style={{paddingTop:8}}>
          <div style={{display:'flex',alignItems:'flex-start',gap:10,marginBottom:6}}>
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontSize:12,fontWeight:700,color:T.black,marginBottom:5}}>{catUpdating?'Atualizando...':'Guru sugere'}</div>
              <div style={{display:'flex',gap:3,flexWrap:'wrap'}}>
                {(lot.guruNums||[]).slice(0,8).map(n=><Ball key={n} n={n} size={22} bg={catUpdating?T.gray3:T.black} color={T.white}/>)}
                {(lot.guruNums||[]).length>8&&<span style={{fontSize:10,color:T.gray1,alignSelf:'center',marginLeft:2}}>+{lot.guruNums.length-8}</span>}
              </div>
            </div>
            <div style={{minWidth:50,textAlign:'center',padding:'4px 9px',borderRadius:T.r.pill,border:`1.5px solid ${catUpdating?T.gray3:'#16A34A'}`,color:catUpdating?T.gray1:'#15803D',fontSize:13,fontWeight:800,background:catUpdating?T.gray2:'#F0FDF4',flexShrink:0,marginTop:2}}>
              {catUpdating?'—':`${lot.guruConf}%`}
            </div>
          </div>
          {!catUpdating&&<p style={{fontSize:10,color:T.gray1,lineHeight:1.45,margin:0,overflow:'hidden',display:'-webkit-box',WebkitLineClamp:2,WebkitBoxOrient:'vertical'}}>{lot.guruAnalise}</p>}
        </div>
      </div>

      {/* Footer */}
      <div style={{padding:'8px 14px 11px',display:'flex',justifyContent:'space-between',flexShrink:0}}>
        <span style={{fontSize:11,color:T.gray1}}>Conc. {lot.concurso}</span>
        <span style={{fontSize:11,color:T.gray1}}>Min {lot.aposta}</span>
      </div>
    </div>
  )
}

// ─── MOBILE CARDS ─────────────────────────────────────────────────────────────
function LotoCard({lot, onSelect, catUpdating}) {
  const [hov,setHov]=useState(false)
  return (
    <div onClick={()=>onSelect(lot)} onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      style={{background:T.white,borderRadius:T.r.lg,border:`1px solid ${T.border}`,marginBottom:12,overflow:'hidden',cursor:'pointer',boxShadow:hov?'0 4px 20px rgba(0,0,0,0.08)':'none',transition:'box-shadow 0.15s'}}>
      <div style={{height:3,background:lot.acumulado?'#F59E0B':T.cat.loterias}}/>
      <div style={{padding:'16px 18px'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:12}}>
          <div>
            <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:2}}>
              <span style={{fontSize:16,fontWeight:800,color:T.black,letterSpacing:'-0.03em'}}>{lot.nome}</span>
              {lot.acumulado&&<span style={{fontSize:10,fontWeight:700,background:'#FFF3E0',color:'#B45309',borderRadius:5,padding:'2px 7px'}}>ACUM.</span>}
            </div>
            <div style={{fontSize:11,color:T.gray1}}>{lot.descricao} · {lot.dias} · Conc. {lot.concurso}</div>
          </div>
          <div style={{textAlign:'right',flexShrink:0,marginLeft:10}}>
            <div style={{fontSize:16,fontWeight:900,color:T.black,letterSpacing:'-0.03em',lineHeight:1}}>{lot.premio}</div>
            <div style={{fontSize:11,color:T.gray1,marginTop:2}}>Sorteio {lot.data}</div>
          </div>
        </div>
        <div style={{height:1,background:T.border,marginBottom:12}}/>
        <div style={{marginBottom:12}}>
          <div style={{fontSize:10,fontWeight:700,color:T.gray1,letterSpacing:'0.05em',marginBottom:6}}>ÚLTIMO RESULTADO</div>
          <div style={{display:'flex',gap:4,flexWrap:'wrap'}}>{lot.ultimoResultado.map(n=><Ball key={n} n={n} size={24}/>)}</div>
        </div>
        <div style={{background:T.bg,borderRadius:T.r.md,padding:'11px 13px'}}>
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:8}}>
            <span style={{fontSize:10,fontWeight:700,color:T.black,letterSpacing:'0.05em'}}>{catUpdating?'ATUALIZANDO...':'GURU SUGERE'}</span>
            <span style={{fontSize:11,fontWeight:800,background:catUpdating?T.gray3:T.green,color:T.white,borderRadius:T.r.pill,padding:'2px 9px'}}>{lot.guruConf}%</span>
          </div>
          <div style={{display:'flex',gap:4,flexWrap:'wrap',marginBottom:8}}>{(lot.guruNums||[]).map(n=><Ball key={n} n={n} size={24} bg={catUpdating?T.gray3:T.black} color={T.white}/>)}</div>
          <p style={{fontSize:11,color:T.gray1,lineHeight:1.5,margin:0}}>{lot.guruAnalise}</p>
        </div>
        <div style={{display:'flex',justifyContent:'space-between',marginTop:10}}>
          <span style={{fontSize:11,color:T.gray1}}>Min: <strong style={{color:T.black}}>{lot.aposta}</strong></span>
          <span style={{fontSize:11,color:T.gray1}}>{lot.regras}</span>
        </div>
      </div>
    </div>
  )
}

function SportCard({item, catKey, onSelect, catUpdating}) {
  const live=item.status==='live'; const [hov,setHov]=useState(false)
  const catColor=T.cat[catKey]||T.black
  return (
    <div onClick={()=>onSelect(item)} onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      style={{background:T.white,borderRadius:T.r.lg,border:`1px solid ${T.border}`,marginBottom:12,overflow:'hidden',cursor:'pointer',boxShadow:hov?'0 4px 20px rgba(0,0,0,0.08)':'none',transition:'box-shadow 0.15s'}}>
      <div style={{height:3,background:live?T.red:T.border}}/>
      <div style={{padding:'14px 18px'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:9}}>
          <div style={{display:'flex',alignItems:'center',gap:5}}>
            {live&&<><IcoLiveDot/><span style={{fontSize:11,fontWeight:700,color:T.red,marginLeft:3}}>AO VIVO</span><span style={{color:T.gray1,fontSize:11,margin:'0 3px'}}> · </span></>}
            <span style={{fontSize:11,color:T.gray1}}>{item.statusLabel}</span>
          </div>
          <span style={{fontSize:11,color:T.gray1}}>{item.competition}</span>
        </div>
        <div style={{marginBottom:11}}>
          <div style={{fontSize:17,fontWeight:900,color:T.black,letterSpacing:'-0.04em',lineHeight:1.2}}>{item.title}</div>
          <div style={{fontSize:11,color:T.gray1,marginTop:2}}>{item.subtitle}</div>
        </div>
        <div style={{background:T.bg,borderRadius:T.r.md,padding:'9px 11px',marginBottom:12,display:'flex',alignItems:'flex-start',gap:8}}>
          <div style={{flex:1}}>
            <span style={{fontSize:11,fontWeight:700,color:T.black}}>{catUpdating?'Atualizando...':`Guru: ${item.guruPick}`}</span>
            {!catUpdating&&item.guruReason&&<p style={{fontSize:11,color:T.gray1,margin:'2px 0 0',lineHeight:1.5}}>{item.guruReason}</p>}
          </div>
          <div style={{background:catUpdating?T.gray3:T.black,color:T.white,borderRadius:T.r.pill,padding:'3px 9px',fontSize:11,fontWeight:800,flexShrink:0}}>{item.guruConf}%</div>
        </div>
        <div style={{display:'flex',flexDirection:'column',gap:9}}>
          {[item.home,item.away].map((side,i)=>(
            <div key={i} style={{display:'flex',alignItems:'center',gap:9}}>
              <div style={{width:3,height:34,borderRadius:2,background:T.border,flexShrink:0}}/>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:13,fontWeight:700,color:T.black,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{side.name}</div>
                <div style={{fontSize:11,color:T.gray1}}>{side.sub}</div>
              </div>
              <div style={{textAlign:'right',flexShrink:0}}>
                <div style={{fontSize:16,fontWeight:900,color:T.black}}>{side.pct}%</div>
                <div style={{width:48,height:3,background:T.border,borderRadius:2,marginTop:2}}>
                  <div style={{width:`${side.pct}%`,height:'100%',background:side.pct>50?catColor:T.gray3,borderRadius:2}}/>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div style={{display:'flex',justifyContent:'space-between',marginTop:11,paddingTop:9,borderTop:`1px solid ${T.border}`}}>
          <span style={{fontSize:11,color:T.gray1}}>Empate: {item.draw}%</span>
          <span style={{fontSize:11,color:T.gray1}}>{item.vol} vol.</span>
        </div>
      </div>
    </div>
  )
}

// ─── BET SHEET ────────────────────────────────────────────────────────────────
function BetSheet({item, isLoto, onClose}) {
  const [amount,setAmount]=useState(''); const [choice,setChoice]=useState('yes')
  const [betType,setBetType]=useState('simples'); const [done,setDone]=useState(false)
  const {isMobile}=useBreakpoint(); if (!item) return null
  const na=parseFloat(amount)||0
  const yp=isLoto?50:(item.home?.pct||50); const np=isLoto?50:(item.away?.pct||50)
  const unit=(choice==='yes'?yp:np)/100
  const ret=na>0?(na/unit).toFixed(2):null; const luc=na>0?((na/unit)-na).toFixed(2):null
  const panelStyle=isMobile
    ?{width:'100%',maxWidth:520,background:T.white,borderRadius:'20px 20px 0 0',maxHeight:'92vh',overflowY:'auto',animation:'slideUp 0.28s cubic-bezier(0.32,0.72,0,1)'}
    :{width:'100%',maxWidth:540,background:T.white,borderRadius:T.r.lg,maxHeight:'88vh',overflowY:'auto',boxShadow:'0 24px 64px rgba(0,0,0,0.18)',animation:'fadeIn 0.2s ease'}

  return (
    <div onClick={onClose} style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.45)',zIndex:300,display:'flex',alignItems:isMobile?'flex-end':'center',justifyContent:'center'}}>
      <div onClick={e=>e.stopPropagation()} style={panelStyle}>
        {isMobile&&<div style={{display:'flex',justifyContent:'center',padding:'12px 0 4px'}}><div style={{width:36,height:4,borderRadius:2,background:T.border}}/></div>}
        {!isMobile&&(
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'22px 26px 0'}}>
            <span style={{fontSize:16,fontWeight:800,color:T.black}}>{isLoto?item.nome:item.title}</span>
            <button onClick={onClose} style={{width:30,height:30,borderRadius:'50%',border:'none',background:T.gray2,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}}>
              <IcoClose size={16} color={T.gray1}/>
            </button>
          </div>
        )}
        {done?(
          <div style={{padding:'28px 26px 44px',textAlign:'center'}}>
            <div style={{width:54,height:54,borderRadius:'50%',background:T.green,margin:'0 auto 14px',display:'flex',alignItems:'center',justifyContent:'center'}}>
              <IcoCheck size={26} color={T.white}/>
            </div>
            <div style={{fontSize:21,fontWeight:900,color:T.black,letterSpacing:'-0.04em',marginBottom:8}}>{isLoto?'Boa sorte!':'Aposta registrada!'}</div>
            <div style={{fontSize:13,color:T.gray1,lineHeight:1.6,marginBottom:22}}>{isLoto?<>R$ {na.toFixed(2)} na <strong style={{color:T.black}}>{item.nome}</strong><br/>Sorteio em {item.data}</>:<>R$ {na.toFixed(2)} em <strong style={{color:T.black}}>{choice==='yes'?item.home?.name:item.away?.name}</strong></>}</div>
            <button onClick={onClose} style={{width:'100%',padding:'15px',borderRadius:T.r.md,background:T.black,border:'none',color:T.white,fontSize:15,fontWeight:700,cursor:'pointer'}}>Voltar aos mercados</button>
          </div>
        ):(
          <div style={{padding:isMobile?'8px 22px 40px':'18px 26px 30px'}}>
            <div style={{background:T.bg,borderRadius:T.r.md,padding:'13px 15px',marginBottom:14}}>
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:9}}>
                <span style={{fontSize:10,fontWeight:700,color:T.black,letterSpacing:'0.06em'}}>ANÁLISE DO GURU</span>
                <span style={{fontSize:12,fontWeight:800,background:T.green,color:T.white,borderRadius:T.r.pill,padding:'3px 11px'}}>{item.guruConf}%</span>
              </div>
              {isLoto?(<><p style={{fontSize:12,color:T.gray1,lineHeight:1.6,marginBottom:10}}>{item.guruAnalise}</p><div style={{fontSize:11,fontWeight:700,color:T.black,marginBottom:7}}>Números sugeridos — concurso {item.concurso}</div><div style={{display:'flex',gap:4,flexWrap:'wrap'}}>{(item.guruNums||[]).map(n=><Ball key={n} n={n} size={26} bg={T.black} color={T.white}/>)}</div></>)
              :(<><div style={{fontSize:16,fontWeight:900,color:T.black,letterSpacing:'-0.03em',marginBottom:3}}>{item.guruPick}</div><p style={{fontSize:12,color:T.gray1,lineHeight:1.5,margin:0}}>{item.guruReason}</p></>)}
            </div>
            {isLoto&&<div style={{background:'#FFFBEB',border:'1px solid #FDE68A',borderRadius:T.r.sm,padding:'9px 13px',marginBottom:12,fontSize:11,color:'#78350F',lineHeight:1.5}}>Loteria é jogo de azar. Sugestão estatística sem garantia de resultado.</div>}
            {!isLoto&&(<>
              <div style={{display:'flex',background:T.bg,borderRadius:T.r.md,padding:3,marginBottom:12}}>
                {['buy','sell'].map(m=><button key={m} style={{flex:1,padding:'9px',borderRadius:T.r.sm,border:'none',background:m==='buy'?T.white:'transparent',color:m==='buy'?T.black:T.gray1,fontWeight:m==='buy'?700:500,fontSize:13,cursor:'pointer'}}>{m==='buy'?'Comprar':'Vender'}</button>)}
              </div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:9,marginBottom:12}}>
                {[{key:'yes',label:'Sim',price:yp,name:item.home?.name},{key:'no',label:'Não',price:np,name:item.away?.name}].map(o=>(
                  <button key={o.key} onClick={()=>setChoice(o.key)} style={{padding:'12px 9px',borderRadius:T.r.md,border:`2px solid ${choice===o.key?T.black:T.border}`,background:choice===o.key?T.bg:T.white,cursor:'pointer',textAlign:'center',transition:'all 0.15s'}}>
                    <div style={{fontSize:16,fontWeight:900,color:T.black}}>{o.label} {o.price}¢</div>
                    <div style={{fontSize:11,color:T.gray1,marginTop:2,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{o.name}</div>
                  </button>
                ))}
              </div>
            </>)}
            {isLoto&&<div style={{marginBottom:12}}><div style={{fontSize:12,fontWeight:700,color:T.black,marginBottom:7}}>Tipo de aposta</div><div style={{display:'flex',background:T.bg,borderRadius:T.r.md,padding:3}}>{['simples','bolão','teimosinha'].map(t=><button key={t} onClick={()=>setBetType(t)} style={{flex:1,padding:'8px 4px',borderRadius:T.r.sm,border:'none',background:betType===t?T.white:'transparent',color:betType===t?T.black:T.gray1,fontWeight:betType===t?700:500,fontSize:12,cursor:'pointer',textTransform:'capitalize'}}>{t}</button>)}</div></div>}
            <div style={{border:`1.5px solid ${T.border}`,borderRadius:T.r.md,padding:'14px 16px',marginBottom:10}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                <div><div style={{fontSize:13,fontWeight:700,color:T.black}}>Valor</div><div style={{fontSize:11,color:T.cat.loterias,fontWeight:600,marginTop:2}}>+3,25% de rendimento</div></div>
                <div style={{display:'flex',alignItems:'center',gap:3}}><span style={{fontSize:18,color:T.gray1,fontWeight:300}}>R$</span><input type="number" value={amount} onChange={e=>setAmount(e.target.value)} placeholder="0" style={{width:88,fontSize:24,fontWeight:300,color:amount?T.black:T.gray3,border:'none',outline:'none',textAlign:'right',background:'transparent',fontFamily:'inherit'}}/></div>
              </div>
            </div>
            <div style={{display:'flex',gap:7,marginBottom:12}}>
              {(isLoto?['3','6','10','25']:['10','25','50','100']).map(v=>(
                <button key={v} onClick={()=>setAmount(v)} style={{flex:1,padding:'9px 0',borderRadius:T.r.sm,border:`1.5px solid ${amount===v?T.black:T.border}`,background:amount===v?T.black:T.bg,color:amount===v?T.white:T.black,fontSize:12,fontWeight:700,cursor:'pointer',transition:'all 0.15s'}}>R${v}</button>
              ))}
            </div>
            {!isLoto&&na>0&&<div style={{background:T.bg,borderRadius:T.r.md,padding:'11px 13px',marginBottom:12}}><div style={{display:'flex',justifyContent:'space-between',marginBottom:3}}><span style={{fontSize:12,color:T.gray1}}>Retorno total</span><span style={{fontSize:13,fontWeight:800,color:T.black}}>R$ {ret}</span></div><div style={{display:'flex',justifyContent:'space-between'}}><span style={{fontSize:11,color:T.gray1}}>Lucro se ganhar</span><span style={{fontSize:12,fontWeight:700,color:T.cat.loterias}}>+R$ {luc}</span></div></div>}
            <button onClick={()=>{if(na>0)setDone(true)}} style={{width:'100%',padding:'16px',borderRadius:T.r.md,background:na>0?T.black:T.gray2,border:'none',color:na>0?T.white:T.gray1,fontSize:15,fontWeight:700,cursor:na>0?'pointer':'default',transition:'background 0.2s'}}>
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
      <div style={{background:T.white,borderRadius:T.r.lg,border:`1px solid ${T.border}`,padding:'18px',marginBottom:12}}>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:14}}>
          <div>
            <div style={{fontSize:15,fontWeight:800,color:T.black}}>{updating?'Analisando...':'Motor ativo'}</div>
            <div style={{fontSize:12,color:T.gray1,marginTop:2}}>Última: {lastAt?lastAt.toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit',second:'2-digit'}):'Aguardando'}</div>
          </div>
          <button onClick={force} disabled={updating} style={{display:'flex',alignItems:'center',gap:7,padding:'9px 18px',borderRadius:T.r.pill,background:updating?T.gray2:T.black,border:'none',color:updating?T.gray1:T.white,fontSize:13,fontWeight:700,cursor:updating?'not-allowed':'pointer'}}>
            <IcoRefresh size={14} color={updating?T.gray1:T.white}/>{updating?'Analisando...':'Atualizar agora'}
          </button>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
          <div style={{background:T.bg,borderRadius:T.r.sm,padding:'11px 13px'}}><div style={{fontSize:10,fontWeight:600,color:T.gray1,letterSpacing:'0.05em',marginBottom:3}}>INTERVALO</div><div style={{fontSize:18,fontWeight:900,color:T.black}}>2 horas</div></div>
          <div style={{background:T.bg,borderRadius:T.r.sm,padding:'11px 13px'}}><div style={{fontSize:10,fontWeight:600,color:T.gray1,letterSpacing:'0.05em',marginBottom:3}}>PRÓXIMA EM</div><div style={{fontSize:15,fontWeight:900,color:T.cat.loterias,fontVariantNumeric:'tabular-nums'}}>{countdown||'—'}</div></div>
        </div>
      </div>
      <div style={{background:'#EFF6FF',borderRadius:T.r.md,border:'1px solid #BFDBFE',padding:'13px 15px',marginBottom:12}}>
        <div style={{fontSize:13,fontWeight:800,color:'#1D4ED8',marginBottom:5}}>Como funciona</div>
        <div style={{fontSize:12,color:'#3B82F6',lineHeight:1.7}}>A cada <strong>2 horas</strong>, o motor chama a <strong>API do Claude</strong> e reanálisa todas as 7 categorias.</div>
      </div>
      <div style={{background:'#0F172A',borderRadius:T.r.lg,padding:'14px',overflow:'hidden'}}>
        <div style={{fontSize:11,color:T.green,fontWeight:700,marginBottom:10,letterSpacing:'0.08em',fontFamily:'monospace'}}>LOG DO MOTOR</div>
        {logs.length===0&&<div style={{fontSize:12,color:'#475569',fontFamily:'monospace'}}>Aguardando primeiro ciclo...</div>}
        {logs.map((l,i)=>(
          <div key={i} style={{display:'flex',gap:10,marginBottom:4,opacity:Math.max(0.15,1-i*0.03)}}>
            <span style={{fontSize:10,color:'#475569',flexShrink:0,fontFamily:'monospace'}}>{l.ts}</span>
            <span style={{fontSize:11,color:LOG_C[l.t]||T.gray1,lineHeight:1.5,fontFamily:'monospace'}}>{l.msg}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── DESKTOP NAV ──────────────────────────────────────────────────────────────
function DesktopNav({tab, onTab, updating, countdown, queue, showLog, force}) {
  return (
    <div style={{background:T.white,borderBottom:`1px solid ${T.border}`,position:'sticky',top:0,zIndex:50}}>
      {/* Top bar */}
      <div style={{maxWidth:1280,margin:'0 auto',padding:'0 40px',display:'flex',alignItems:'center',justifyContent:'space-between',height:54}}>
        <div style={{display:'flex',alignItems:'center',gap:28}}>
          <div style={{display:'flex',alignItems:'center'}}>
            <LogoSVG height={30}/>
          </div>
          <nav>
            <button style={{padding:'5px 12px',borderRadius:T.r.sm,border:'none',background:'transparent',color:T.black,fontSize:13,fontWeight:700,cursor:'pointer',letterSpacing:'0.01em',position:'relative'}}>
              MERCADOS
              <div style={{position:'absolute',bottom:-1,left:0,right:0,height:2,background:T.black,borderRadius:1}}/>
            </button>
          </nav>
        </div>
        <div style={{display:'flex',alignItems:'center',gap:10}}>
          {updating?(
            <div style={{display:'flex',alignItems:'center',gap:6,background:'#FFF8E1',borderRadius:T.r.pill,padding:'6px 13px',border:'1px solid #FFE082'}}>
              <div style={{width:7,height:7,borderRadius:'50%',border:'2px solid #F59E0B',borderTopColor:'transparent',animation:'spin 0.8s linear infinite',flexShrink:0}}/>
              <span style={{fontSize:12,fontWeight:600,color:'#92400E'}}>{queue.length>0?`Analisando ${queue[0]}...`:'Analisando...'}</span>
            </div>
          ):countdown?(
            <div style={{display:'flex',alignItems:'center',gap:6,background:'#F0FFF4',borderRadius:T.r.pill,padding:'6px 13px',border:'1px solid #A7F3D0'}}>
              <div style={{width:7,height:7,borderRadius:'50%',background:T.green,flexShrink:0}}/>
              <span style={{fontSize:12,fontWeight:600,color:'#065F46',fontVariantNumeric:'tabular-nums'}}>Próxima atualização: {countdown}</span>
            </div>
          ):null}
          <button onClick={force} disabled={updating}
            style={{display:'flex',alignItems:'center',gap:7,background:updating?T.gray2:T.green,color:updating?T.gray1:T.white,border:'none',borderRadius:T.r.pill,padding:'8px 17px',fontSize:13,fontWeight:700,cursor:updating?'not-allowed':'pointer',transition:'background 0.15s'}}>
            <IcoRefresh size={14} color={updating?T.gray1:T.white}/>
            {updating?'Atualizando...':'Resetar previsões'}
          </button>
        </div>
      </div>

      {/* Category tabs */}
      <div style={{maxWidth:1280,margin:'0 auto',padding:'0 40px',display:'flex',alignItems:'center',borderTop:`1px solid ${T.border}`,overflowX:'auto'}}>
        {TABS.map(({key,label})=>{
          const active=key===tab
          const Ico=TAB_ICON[key]||IcoLottery
          const catColor=T.cat[key]||T.black
          return (
            <button key={key} onClick={()=>onTab(key)}
              style={{display:'flex',alignItems:'center',gap:7,padding:'11px 15px',border:'none',background:'transparent',color:active?T.black:T.gray1,fontSize:13,fontWeight:active?700:500,cursor:'pointer',whiteSpace:'nowrap',flexShrink:0,position:'relative',borderBottom:`2px solid ${active?T.black:'transparent'}`,transition:'color 0.15s',marginBottom:-1}}>
              <Ico size={14} color={active?catColor:T.gray3}/>
              {label}
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ─── MOBILE HEADER ────────────────────────────────────────────────────────────
function MobileHeader({tab, onTab, updating, countdown, queue, showLog, onToggleLog, force}) {
  return (
    <div style={{background:T.white,borderBottom:`1px solid ${T.border}`,position:'sticky',top:0,zIndex:50}}>
      <div style={{padding:'12px 16px 9px',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <div>
          <LogoSVG height={26}/>
        </div>
        <button onClick={force} disabled={updating} style={{display:'flex',alignItems:'center',gap:5,padding:'6px 11px',borderRadius:T.r.pill,background:updating?T.gray2:T.green,border:'none',color:updating?T.gray1:T.white,fontSize:12,fontWeight:700,cursor:updating?'not-allowed':'pointer'}}>
          <IcoRefresh size={13} color={updating?T.gray1:T.white}/>
          {updating?'Analisando...':'Atualizar'}
        </button>
      </div>
      {!updating&&countdown&&(
        <div style={{margin:'0 16px 7px',background:T.gray2,borderRadius:T.r.sm,padding:'4px 11px',display:'flex',justifyContent:'space-between'}}>
          <span style={{fontSize:11,color:T.gray1}}>Próxima atualização</span>
          <span style={{fontSize:11,fontWeight:800,color:T.black,fontVariantNumeric:'tabular-nums'}}>{countdown}</span>
        </div>
      )}
      {updating&&queue.length>0&&(
        <div style={{margin:'0 16px 7px',background:'#FFF8E1',borderRadius:T.r.sm,padding:'4px 11px',display:'flex',alignItems:'center',gap:7}}>
          <div style={{width:7,height:7,borderRadius:'50%',border:'2px solid #F59E0B',borderTopColor:'transparent',animation:'spin 0.8s linear infinite',flexShrink:0}}/>
          <span style={{fontSize:11,color:'#78350F'}}>Analisando <strong>{queue[0]}</strong> — {queue.length} restante(s)</span>
        </div>
      )}
      {/* Tab bar */}
      <div style={{display:'flex',overflowX:'auto',borderTop:`1px solid ${T.border}`,scrollbarWidth:'none'}}>
        {TABS.map(({key,label})=>{
          const active=key===tab&&!showLog
          const Ico=TAB_ICON[key]||IcoLottery
          const catColor=T.cat[key]||T.black
          return (
            <button key={key} onClick={()=>onTab(key)}
              style={{display:'flex',alignItems:'center',gap:5,padding:'10px 13px',border:'none',borderBottom:`2px solid ${active?T.black:'transparent'}`,background:'transparent',color:active?T.black:T.gray1,fontSize:12,fontWeight:active?700:500,cursor:'pointer',whiteSpace:'nowrap',flexShrink:0,transition:'all 0.12s',marginBottom:-1}}>
              <Ico size={13} color={active?catColor:T.gray3}/>
              {label}
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ─── GLOBAL CSS ───────────────────────────────────────────────────────────────
const CSS=`
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
  html,body{height:100%;}
  body{font-family:-apple-system,BlinkMacSystemFont,'SF Pro Display','Segoe UI',sans-serif;}
  svg{display:block;overflow:visible;}
  button{font-family:inherit;}
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
    const filtered=isLoto
      ?appData.loterias.filter(l=>activeFilter==='all'||(activeFilter==='acumulado'&&l.acumulado))
      :espItems.filter(i=>activeFilter==='all'||(activeFilter==='live'&&i.status==='live')||(activeFilter==='upcoming'&&i.status==='upcoming'))

    return (
      <div style={{display:'flex',flexDirection:'column',height:'100vh',background:T.bg}}>
        <style>{CSS}</style>
        <DesktopNav tab={tab} onTab={handleTab} updating={updating} countdown={countdown} queue={queue} showLog={showLog} force={force}/>
        <div style={{flex:1,overflowY:'auto'}}>
          <div style={{maxWidth:1280,margin:'0 auto',padding:'28px 40px 56px'}}>
            {showLog?(
              <EngineLog logs={logs} updating={updating} lastAt={lastAt} countdown={countdown} queue={queue} force={force}/>
            ):(
              <>
                <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:22}}>
                  <h1 style={{fontSize:24,fontWeight:800,color:T.black,letterSpacing:'-0.04em'}}>{isLoto?'Loterias':TABS.find(t=>t.key===tab)?.label}</h1>
                  <div style={{display:'flex',gap:7,alignItems:'center'}}>
                    {(!isLoto?['all','live','upcoming']:['all','acumulado']).map(f=>(
                      <button key={f} onClick={()=>setActiveFilter(f)} style={{padding:'6px 15px',borderRadius:T.r.pill,border:`1px solid ${activeFilter===f?T.black:T.border}`,background:activeFilter===f?T.black:T.white,color:activeFilter===f?T.white:T.black,fontSize:12,fontWeight:activeFilter===f?700:500,cursor:'pointer',transition:'all 0.15s'}}>
                        {f==='all'?'Todos':f==='live'?'Ao Vivo':f==='upcoming'?'Próximos':'Acumulados'}
                      </button>
                    ))}
                  </div>
                </div>
                {isLoto&&<div style={{background:'#FFFBEB',border:'1px solid #FDE68A',borderRadius:T.r.md,padding:'10px 16px',marginBottom:18,fontSize:12,color:'#78350F',lineHeight:1.6}}><strong>Jogo responsável.</strong> Sugestões baseadas em estatística histórica — não garantem resultado.</div>}
                <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:14,alignItems:'start'}}>
                  {isLoto
                    ?filtered.map(lot=><KalshiLotoCard key={lot.id} lot={lot} onSelect={setSelItem} catUpdating={catUpd}/>)
                    :filtered.map(item=><KalshiSportCard key={item.id} item={item} catKey={tab} onSelect={setSelItem} catUpdating={catUpd}/>)
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
      <div style={{padding:isTablet?'22px 26px 100px':'14px 14px 100px',maxWidth:isTablet?880:'100%',margin:'0 auto'}}>
        {showLog?(
          <EngineLog logs={logs} updating={updating} lastAt={lastAt} countdown={countdown} queue={queue} force={force}/>
        ):(
          <>
            {isLoto&&<div style={{background:'#FFFBEB',border:'1px solid #FDE68A',borderRadius:T.r.md,padding:'10px 14px',marginBottom:14,fontSize:12,color:'#78350F',lineHeight:1.6}}><strong>Jogo responsável.</strong> Sugestões baseadas em estatística — não garantem resultado.</div>}
            {!isLoto&&(
              <div style={{display:'flex',overflowX:'auto',borderBottom:`1px solid ${T.border}`,marginLeft:-14,marginRight:-14,paddingLeft:14,marginBottom:14,scrollbarWidth:'none'}}>
                {['all','live','upcoming'].map(f=>(
                  <button key={f} style={{padding:'9px 13px',border:'none',borderBottom:`2px solid ${activeFilter===f?T.black:'transparent'}`,background:'transparent',color:activeFilter===f?T.black:T.gray1,fontSize:12,fontWeight:activeFilter===f?700:500,cursor:'pointer',whiteSpace:'nowrap',flexShrink:0,marginBottom:-1}} onClick={()=>setActiveFilter(f)}>
                    {f==='all'?`Todos (${espItems.length})`:f==='live'?'Ao Vivo':'Próximos'}
                  </button>
                ))}
              </div>
            )}
            <div style={{display:'grid',gridTemplateColumns:isTablet?'repeat(2,1fr)':'1fr',gap:isTablet?14:0}}>
              {isLoto
                ?appData.loterias.map(lot=><LotoCard key={lot.id} lot={lot} onSelect={setSelItem} catUpdating={catUpd}/>)
                :espItems.filter(i=>activeFilter==='all'||(activeFilter==='live'&&i.status==='live')||(activeFilter==='upcoming'&&i.status==='upcoming')).map(item=><SportCard key={item.id} item={item} catKey={tab} onSelect={setSelItem} catUpdating={catUpd}/>)
              }
            </div>
          </>
        )}
      </div>

      {isMobile&&(
        <div style={{position:'fixed',bottom:0,left:0,right:0,background:T.white,borderTop:`1px solid ${T.border}`,display:'flex',justifyContent:'space-around',paddingTop:9,paddingBottom:'env(safe-area-inset-bottom,18px)',zIndex:100}}>
          {[
            {key:'home',    label:'Início',  Ico:IcoHome,     badge:0,         dot:false},
            {key:'play',    label:'Apostar', Ico:IcoPlay,     badge:totalLive, dot:false},
            {key:'settings',label:'Motor',   Ico:IcoSettings, badge:0,         dot:updating},
            {key:'profile', label:'Perfil',  Ico:IcoPerson,   badge:0,         dot:false},
          ].map(({key,label,Ico,badge,dot})=>{
            const active=key==='settings'?showLog:false
            const col=active?T.black:T.gray1
            return (
              <button key={key} onClick={()=>{if(key==='settings')setShowLog(v=>!v)}}
                style={{background:'none',border:'none',display:'flex',flexDirection:'column',alignItems:'center',gap:3,cursor:'pointer',position:'relative',minWidth:56,padding:'3px 0',color:col}}>
                {badge>0&&<span style={{position:'absolute',top:-1,right:5,background:T.red,color:T.white,fontSize:9,fontWeight:900,borderRadius:T.r.pill,padding:'1px 4px',lineHeight:1.5}}>{badge}</span>}
                {dot&&!showLog&&<span style={{position:'absolute',top:0,right:7,width:7,height:7,borderRadius:'50%',background:'#F59E0B',border:`2px solid ${T.white}`,animation:'pulse 1.5s infinite'}}/>}
                <Ico size={22} color={col}/>
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
