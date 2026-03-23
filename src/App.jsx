import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react'

const API_KEY = import.meta.env.VITE_ANTHROPIC_API_KEY || ''

const T = {
  green:'#00D672', black:'#111111', white:'#FFFFFF',
  bg:'#F7F7F5', border:'#E8E8E4', gray1:'#737373',
  gray2:'#F0F0ED', gray3:'#D4D4CC', red:'#E53935',
  cat:{ loterias:'#1A7A4A', futebol:'#1A7A4A', basquete:'#B45309', mma:'#B91C1C', tenis:'#0369A1', esports:'#6D28D9', crypto:'#D97706', moedas:'#0891B2' },
  catBg:{ loterias:'#D1FAE5', futebol:'#DCFCE7', basquete:'#FEF3C7', mma:'#FEE2E2', tenis:'#DBEAFE', esports:'#F3E8FF', crypto:'#FEF3C7', moedas:'#CFFAFE' },
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
const IcoMMA       = ({size=16,color='currentColor'}) => <svg width={size} height={size} viewBox="0 0 2048 2048" fill={color} style={{display:'block',flexShrink:0}}><path d="M 834.356 0 L 1262.73 0 C 1271.63 4.58795 1298.22 4.17905 1309.72 6.78096 C 1339.96 13.6203 1370.2 20.4658 1399.79 29.9129 C 1567.16 83.8556 1709.07 219.514 1775.06 381.856 C 1799.92 443.026 1815.08 507.701 1819.99 573.546 C 1822.23 603.599 1820.59 638.02 1819.17 668.273 C 1811.73 826.351 1776.34 1014.13 1714.56 1160.4 C 1684.43 1232.17 1648.1 1301.19 1605.99 1366.66 C 1580.93 1405.35 1551.01 1440.01 1525.5 1477.71 C 1522.9 1481.56 1524.18 1549.91 1524.18 1558.46 L 1524.23 1746.96 L 1524.32 1817.56 C 1524.35 1831.69 1524.81 1849.23 1523.68 1863.1 C 1520.29 1909.07 1500.45 1952.29 1467.81 1984.84 C 1447.46 2005.52 1421.92 2023.44 1394.92 2034.25 C 1386.43 2037.62 1377.65 2040.2 1368.69 2041.96 C 1361.16 2043.44 1345.77 2044.94 1339.83 2048 L 706.274 2048 C 701.191 2045.75 691.215 2044.15 685.46 2042.98 C 671.641 2040.16 656.436 2037.07 643.746 2030.49 C 590.06 2002.62 552.477 1959.46 536.326 1900.97 C 526.467 1865.26 528.525 1842.89 528.715 1807.33 L 528.871 1744.63 L 528.851 1564.07 C 528.882 1541 530.341 1504.56 527.179 1482.25 C 521.46 1470.05 510.97 1459.8 502.898 1449.01 C 355.508 1251.94 261.774 1014.18 230.766 770.319 C 222.255 703.39 229.035 646.987 265.44 587.851 C 272.408 576.533 284.056 563.285 288.84 550.8 C 292.358 533.113 294.236 514.161 297.884 496.216 C 307.879 444.865 324.167 394.942 346.381 347.578 C 418.757 195.592 550.037 79.7347 709.843 26.816 C 734.141 18.923 758.97 12.7638 784.14 8.3847 C 795.959 6.35373 824.597 3.95549 834.356 0 z M 447.545 473.267 C 505.828 471.052 545.439 472.001 599.353 500.974 C 651.825 528.491 687.475 571.029 710.213 625.18 C 729.759 671.729 723.689 704.713 729.729 751.641 C 740.905 838.471 769.433 924.854 814.154 1000.17 C 827.889 1023.3 853.384 1047.26 854.476 1074.85 C 855.425 1094.08 848.572 1112.87 835.471 1126.97 C 822.777 1140.44 805.143 1148.17 786.631 1148.36 C 736.793 1149.29 714.085 1104.4 691.966 1067.66 C 637.984 977.996 607.975 878.079 591.921 775.257 C 586.836 742.69 590.147 700.961 576.528 672.042 C 531.355 576.123 386.612 598.638 370.493 702.879 C 366.067 731.026 372.181 764.016 376.347 792.184 C 394.966 910.795 429.578 1026.33 479.237 1135.65 C 514.921 1210.76 552.751 1278.72 603.079 1345.63 C 610.968 1356.12 623.341 1372.8 632.242 1381.27 C 645.559 1382.4 661.579 1381.95 675.203 1381.94 L 746.169 1381.91 L 970.014 1381.88 L 1265.93 1381.79 L 1363.26 1381.77 C 1382.08 1381.76 1403.81 1382.18 1422.42 1381.19 C 1432.31 1365.22 1447.7 1348.37 1458.89 1332.81 C 1592.84 1146.62 1654.36 922.087 1672.7 695.784 C 1677.65 634.589 1684.05 574.263 1669.16 513.572 C 1641.87 393.1 1567.93 283.208 1463.54 216.349 C 1402.32 177.14 1328.4 150.255 1256.04 143.453 C 1225.07 140.542 1194.13 141.095 1163.1 141.04 L 1058.98 140.849 L 939.399 140.79 C 920.208 140.823 892.933 140.12 874.332 141.436 C 857.721 142.217 840.973 143.087 824.662 145.277 C 668.821 166.197 532.382 273.486 468.536 416.169 C 460.254 434.679 455.088 454.551 447.545 473.267 z M 1351.52 1900.77 C 1388.92 1879.05 1384.42 1846.27 1384.47 1808.7 L 1384.5 1748.3 C 1384.5 1673 1385.02 1594.24 1383.57 1519.01 L 928.789 1518.26 C 874.553 1517.87 820.315 1517.82 766.078 1518.1 C 742.71 1518.19 717.661 1517.6 694.446 1518.55 C 689.364 1518.62 672.739 1518.44 671.803 1520.71 C 667.507 1531.13 668.963 1572.97 668.935 1582.81 C 668.793 1617.18 668.825 1651.55 669.031 1685.92 C 669.136 1738.87 668.859 1792.08 669.228 1845 C 669.351 1862.67 673.977 1880.77 687.299 1892.89 C 696.219 1901 708.496 1908.42 720.682 1909.32 C 742.775 1910.95 767.045 1909.95 789.304 1909.99 L 936.299 1910.31 L 1186.75 1910.28 C 1223.75 1910.27 1260.76 1910.37 1297.77 1910.28 C 1316.74 1910.23 1334.75 1911.18 1351.52 1900.77 z"/><path d="M 829.152 1643.39 C 921.785 1641.83 1019.32 1642.55 1112.26 1643.03 C 1134.24 1643.2 1156.22 1643.25 1178.2 1643.18 C 1193.38 1643.16 1214.15 1642.05 1229.22 1645.01 C 1281.72 1655.3 1294.93 1725.22 1262.52 1761.93 C 1248.4 1777.93 1231.31 1782.14 1210.05 1782.58 C 1124.29 1781.62 1036.08 1782.06 950.287 1782.52 C 923.006 1782.92 895.722 1783.12 868.439 1783.13 C 853.218 1783.11 834.86 1783.89 820.079 1781.4 C 735.046 1767.04 740.967 1649.91 829.152 1643.39 z"/></svg>
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

const IcoAll       = ({size=16,color='currentColor'}) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{display:'block',flexShrink:0}}><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
const IcoSocial    = ({size=16,color='currentColor'}) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{display:'block',flexShrink:0}}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
const IcoSend      = ({size=16,color='currentColor'}) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{display:'block',flexShrink:0}}><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
const IcoThumb     = ({size=14,color='currentColor'}) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{display:'block',flexShrink:0}}><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z"/><path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/></svg>

const IcoCrypto    = ({size=16,color='currentColor'}) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{display:'block',flexShrink:0}}><path d="M11.767 19.089c4.924.868 6.14-6.025 1.216-6.894m-1.216 6.894L5.86 18.047m5.908 1.042-.347 1.97m1.563-8.864c4.924.869 6.14-6.025 1.215-6.893m-1.215 6.893-3.94-.694m5.155-6.2L8.29 4.26m5.908 1.042.348-1.97M7.48 20.364l3.126-17.727"/></svg>
const IcoMoedas    = ({size=16,color='currentColor'}) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{display:'block',flexShrink:0}}><circle cx="12" cy="12" r="10"/><path d="M12 6v2m0 8v2M8 12h8"/><path d="M9 9h.01M15 15h.01"/></svg>

const IcoGolf = ({size=16,color='currentColor'}) => <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 -960 960 960" fill={color} style={{display:'block',flexShrink:0}}><path d="M780-120q-25 0-42.5-17.5T720-180q0-25 17.5-42.5T780-240q25 0 42.5 17.5T840-180q0 25-17.5 42.5T780-120ZM400-80q-100 0-170-23.5T160-160q0-23 33-41t87-29v70h80v-720l320 156-240 124v362q86 5 143 26.5t57 51.5q0 33-70 56.5T400-80Z"/></svg>

const IcoEleicoes = ({size=16,color='currentColor'}) => <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 -960 960 960" fill={color} style={{display:'block',flexShrink:0}}><path d="M200-80q-33 0-56.5-23.5T120-160v-182l110-125 57 57-80 90h546l-78-88 57-57 108 123v182q0 33-23.5 56.5T760-80H200Zm0-80h560v-80H200v80Zm225-225L284-526q-23-23-22.5-56.5T285-639l196-196q23-23 57-24t57 22l141 141q23 23 24 56t-22 56L538-384q-23 23-56.5 22.5T425-385Zm255-254L539-780 341-582l141 141 198-198ZM200-160v-80 80Z"/></svg>

const TAB_ICON = {
  todos: IcoAll, loterias: IcoLottery, futebol: IcoSoccer, basquete: IcoBasket, mma: IcoMMA, tenis: IcoTennis, esports: IcoEsports,
  golf: IcoGolf, eleicoes: IcoEleicoes, crypto: IcoCrypto, moedas: IcoMoedas,
}

const LogoSVG = ({height=32}) => (
  <svg height={height} viewBox="0 0 911 172" fill="none" xmlns="http://www.w3.org/2000/svg" style={{display:'block',flexShrink:0,width:'auto'}}>
    <path d="M329.137 90.2399L324.578 116.16C323.618 122.08 324.737 125.68 327.937 126.96C331.137 128.24 337.697 128.64 347.618 128.16L340.657 168C316.657 171.68 299.617 169.44 289.537 161.28C279.457 153.12 276.178 138.88 279.698 118.56L284.737 90.2399H267.938L275.378 47.9999H292.178L295.778 27.5999L342.337 14.3999L336.578 47.9999H361.778L354.337 90.2399H329.137Z" fill="black"/>
    <path d="M215.146 44.6401C233.706 44.6401 247.946 50.8001 257.866 63.1201C267.946 75.4401 271.466 90.2401 268.426 107.52C267.626 112.64 266.106 117.84 263.866 123.12H185.626C188.186 131.12 195.306 135.12 206.986 135.12C216.106 135.12 223.466 132.56 229.066 127.44L254.746 153.36C240.826 165.36 223.546 171.36 202.906 171.36C181.306 171.36 165.306 165.04 154.906 152.4C144.506 139.76 140.906 124.16 144.106 105.6C146.986 88.0001 155.066 73.4401 168.346 61.9201C181.626 50.4001 197.226 44.6401 215.146 44.6401ZM189.946 94.5601H229.546C228.906 84.9601 223.546 80.1601 213.466 80.1601C202.746 80.1601 194.906 84.9601 189.946 94.5601Z" fill="black"/>
    <path d="M96 44.64C111.68 44.64 124 51.12 132.96 64.08C141.92 76.88 144.8 92.32 141.6 110.4C138.4 128.64 131.12 143.36 119.76 154.56C108.56 165.76 95.2 171.36 79.68 171.36C64.32 171.36 53.36 165.76 46.8 154.56L44.4 168H0L29.52 0H73.92L63.84 57.36C72.32 48.88 83.04 44.64 96 44.64ZM97.68 108C98.96 101.12 98 95.68 94.8 91.68C91.6 87.52 86.8 85.44 80.4 85.44C73.84 85.44 68.24 87.52 63.6 91.68C58.96 95.68 56.08 101.12 54.96 108C53.68 114.88 54.64 120.4 57.84 124.56C61.04 128.56 65.84 130.56 72.24 130.56C78.8 130.56 84.4 128.56 89.04 124.56C93.68 120.4 96.56 114.88 97.68 108Z" fill="black"/>
    <path d="M549.271 48.2002H562.951L495.031 168.2H480.391L454.711 48.2002H467.191L489.271 155.24L549.271 48.2002Z" fill="black"/>
    <path d="M410.562 59.9601L396.642 137.96C395.042 147.72 396.642 153.72 401.442 155.96C406.402 158.2 415.602 158.68 429.042 157.4L427.362 168.2C411.202 170.76 399.442 169.64 392.082 164.84C384.722 160.04 382.242 151.08 384.642 137.96L398.322 59.9601H371.922L374.082 48.2001H400.482L405.762 18.2001L418.482 14.6001L412.482 48.2001H448.482L446.322 59.9601H410.562Z" fill="black"/>
    <path d="M888.072 118.4C893.512 110.64 900.872 106.96 910.152 107.36L909.072 113.12C903.392 113.12 898.312 114.96 893.832 118.64C889.352 122.24 886.472 127.64 885.192 134.84L879.312 168.2H873.312L883.872 108.2H889.872L888.072 118.4Z" fill="black"/>
    <path d="M841.81 106.88C850.21 106.88 857.01 110.04 862.21 116.36C867.41 122.6 869.25 130.12 867.73 138.92C866.13 147.8 861.97 155.12 855.25 160.88C848.53 166.64 840.65 169.52 831.61 169.52C826.09 169.52 821.25 168.04 817.09 165.08C812.93 162.12 809.97 158.16 808.21 153.2L805.57 168.2H799.57L814.33 84.2002H820.33L813.85 120.92C817.05 116.52 821.05 113.08 825.85 110.6C830.73 108.12 836.05 106.88 841.81 106.88ZM861.61 138.2C862.89 131.08 861.45 125.04 857.29 120.08C853.13 115.12 847.49 112.64 840.37 112.64C833.25 112.64 826.89 115.04 821.29 119.84C815.69 124.64 812.25 130.64 810.97 137.84C809.69 144.96 811.13 151.08 815.29 156.2C819.45 161.24 825.09 163.76 832.21 163.76C839.41 163.76 845.77 161.32 851.29 156.44C856.89 151.48 860.33 145.4 861.61 138.2Z" fill="black"/>
    <path d="M780.984 169.4C779.464 169.4 778.264 168.88 777.384 167.84C776.584 166.72 776.304 165.4 776.544 163.88C776.784 162.36 777.464 161.12 778.584 160.16C779.784 159.12 781.184 158.6 782.784 158.6C784.304 158.6 785.504 159.16 786.384 160.28C787.344 161.32 787.664 162.6 787.344 164.12C787.024 165.72 786.304 167 785.184 167.96C784.064 168.92 782.664 169.4 780.984 169.4Z" fill="black"/>
    <path d="M753.216 106.88C759.376 106.88 764.176 108.96 767.616 113.12C771.136 117.2 772.256 122.88 770.976 130.16L764.256 168.2H758.256L764.856 130.16C765.816 124.56 765.136 120.24 762.816 117.2C760.496 114.16 756.896 112.64 752.016 112.64C746.976 112.64 742.536 114.28 738.696 117.56C734.856 120.84 732.176 125.8 730.656 132.44L724.296 168.2H718.296L724.896 130.16C725.936 124.56 725.336 120.24 723.096 117.2C720.856 114.16 717.376 112.64 712.656 112.64C707.376 112.64 702.656 114.48 698.496 118.16C694.336 121.84 691.616 127.28 690.336 134.48L684.336 168.2H678.336L688.896 108.2H694.896L693.216 117.44C698.656 110.4 705.616 106.88 714.096 106.88C718.336 106.88 721.936 107.92 724.896 110C727.936 112.08 729.936 115.12 730.896 119.12C733.696 115.04 737.056 112 740.976 110C744.976 107.92 749.056 106.88 753.216 106.88Z" fill="black"/>
    <path d="M636.178 169.52C627.698 169.52 620.778 166.56 615.418 160.64C610.058 154.72 608.178 147.04 609.778 137.6C611.458 128.24 615.898 120.8 623.098 115.28C630.298 109.68 638.218 106.88 646.858 106.88C655.258 106.88 662.058 109.88 667.258 115.88C672.458 121.8 674.258 129.4 672.658 138.68C670.978 148.2 666.618 155.72 659.578 161.24C652.538 166.76 644.738 169.52 636.178 169.52ZM636.778 163.76C643.738 163.76 650.098 161.44 655.858 156.8C661.698 152.08 665.298 145.8 666.658 137.96C668.018 130.36 666.578 124.24 662.338 119.6C658.178 114.96 652.658 112.64 645.778 112.64C638.818 112.72 632.418 115.08 626.578 119.72C620.818 124.36 617.258 130.52 615.898 138.2C614.538 145.88 615.938 152.08 620.098 156.8C624.338 161.44 629.898 163.76 636.778 163.76Z" fill="black"/>
    <path d="M572.503 169.52C563.703 169.52 556.783 166.36 551.743 160.04C546.783 153.72 545.103 146.12 546.703 137.24C548.223 128.36 552.423 121.08 559.303 115.4C566.263 109.72 574.223 106.88 583.183 106.88C588.943 106.88 593.983 108.28 598.303 111.08C602.703 113.8 605.703 117.48 607.303 122.12L602.143 124.88C600.783 121.04 598.423 118.04 595.063 115.88C591.703 113.72 587.543 112.64 582.583 112.64C575.303 112.64 568.823 115.04 563.143 119.84C557.543 124.64 554.103 130.64 552.823 137.84C551.543 145.12 552.863 151.28 556.783 156.32C560.703 161.28 566.303 163.76 573.583 163.76C578.383 163.76 582.863 162.64 587.023 160.4C591.263 158.08 594.623 155 597.103 151.16L601.903 154.4C598.863 159.12 594.743 162.84 589.543 165.56C584.423 168.2 578.743 169.52 572.503 169.52Z" fill="black"/>
    <path d="M531.476 169.4C529.956 169.4 528.756 168.88 527.876 167.84C527.076 166.72 526.796 165.4 527.036 163.88C527.276 162.36 527.956 161.12 529.076 160.16C530.276 159.12 531.676 158.6 533.276 158.6C534.796 158.6 535.996 159.16 536.876 160.28C537.836 161.32 538.156 162.6 537.836 164.12C537.516 165.72 536.796 167 535.676 167.96C534.556 168.92 533.156 169.4 531.476 169.4Z" fill="black"/>
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
  futebol: { label:'Futebol', items:[

    // ══════════════════════════════════════════════════════
    // 🇧🇷  BRASIL — Brasileirão Série A 2026
    // ══════════════════════════════════════════════════════
    // Rodada 8 — em andamento esta semana (21/03)
    { id:'br-r8-spxpal', startTime:'2026-03-22T19:00:00-03:00', statusLabel:'22/03 · 16h BRT · MorumBIS',    competition:'Brasileirão Série A · Rodada 8',  title:'São Paulo × Palmeiras',         bettvPick:'Palmeiras',   bettvConf:48, bettvReason:'Choque-Rei com ambos em 16pts. Palmeiras 1º em gols (16). São Paulo irregular em casa nesta rodada.', home:{name:'São Paulo',        logo:'saopaulo',    sub:'16pts · atacante',pct:33}, away:{name:'Palmeiras',      logo:'palmeiras',   sub:'16pts · 16 gols', pct:48}, draw:19},
    { id:'br-r8-corxfla', startTime:'2026-03-22T16:00:00-03:00', statusLabel:'22/03 · 13h BRT · Neo Química', competition:'Brasileirão Série A · Rodada 8',  title:'Corinthians × Flamengo',        bettvPick:'Flamengo',    bettvConf:52, bettvReason:'Flamengo campeão defensor com Gabigol. Corinthians irregular mas perigoso em casa.', home:{name:'Corinthians',     logo:'corinthians', sub:'Série A 2026',   pct:29}, away:{name:'Flamengo',       logo:'flamengo',    sub:'Campeão 2025',   pct:48}, draw:23},
    { id:'br-r8-fluatm',  startTime:'2026-03-22T18:30:00-03:00', statusLabel:'22/03 · 15h30 BRT · Maracanã',  competition:'Brasileirão Série A · Rodada 8',  title:'Fluminense × Atlético-MG',      bettvPick:'Fluminense',  bettvConf:47, bettvReason:'Fluminense em casa no Maracanã. Atlético-MG com Palmeiras no H2H recente.', home:{name:'Fluminense',      logo:'fluminense',  sub:'Série A 2026',   pct:46}, away:{name:'Atlético-MG',   logo:'atleticmg',   sub:'Série A 2026',   pct:32}, draw:22},

    // Rodada 9 — 01-02/04 (volta da Data FIFA — CBF confirmado)
    { id:'br-r9-intxsp',  startTime:'2026-04-01T21:30:00-03:00', statusLabel:'01/04 · 21h30 BRT · Beira-Rio', competition:'Brasileirão Série A · Rodada 9',  title:'Internacional × São Paulo',     bettvPick:'Internacional',bettvConf:50, bettvReason:'Inter em casa no Beira-Rio forte. São Paulo tenta sequência após pausa.', home:{name:'Internacional',  logo:'internacional',sub:'Série A 2026',   pct:50}, away:{name:'São Paulo',        logo:'saopaulo',    sub:'Série A 2026',   pct:28}, draw:22},
    { id:'br-r9-fluxcor', startTime:'2026-04-01T19:00:00-03:00', statusLabel:'01/04 · 19h BRT · Maracanã',    competition:'Brasileirão Série A · Rodada 9',  title:'Fluminense × Corinthians',      bettvPick:'Fluminense',  bettvConf:52, bettvReason:'Fluminense em casa. Corinthians oscilante. Maracanã apoia o Tricolor.', home:{name:'Fluminense',      logo:'fluminense',  sub:'Série A 2026',   pct:51}, away:{name:'Corinthians',     logo:'corinthians', sub:'Série A 2026',   pct:25}, draw:24},
    { id:'br-r9-botxcru', startTime:'2026-04-02T20:00:00-03:00', statusLabel:'02/04 · 20h BRT · Nilton Santos',competition:'Brasileirão Série A · Rodada 9',  title:'Botafogo × Cruzeiro',           bettvPick:'Botafogo',    bettvConf:53, bettvReason:'Botafogo vice-campeão 2025 em casa. Cruzeiro equilibrado mas fora de casa oscila.', home:{name:'Botafogo',        logo:'botafogo',    sub:'Série A 2026',   pct:52}, away:{name:'Cruzeiro',        logo:'cruzeiro',    sub:'Série A 2026',   pct:26}, draw:22},

    // Rodada 10 — 04-06/04 (CBF confirmado)
    { id:'br-r10-vaxbot', startTime:'2026-04-05T16:00:00-03:00', statusLabel:'05/04 · 16h BRT · São Januário', competition:'Brasileirão Série A · Rodada 10', title:'Vasco × Botafogo',              bettvPick:'Empate',      bettvConf:38, bettvReason:'Clássico carioca em São Januário. H2H equilibrado. Vasco em casa tem força.', home:{name:'Vasco',           logo:'vasco',       sub:'Série A 2026',   pct:35}, away:{name:'Botafogo',        logo:'botafogo',    sub:'Série A 2026',   pct:35}, draw:30},
    { id:'br-r10-flaxsan',startTime:'2026-04-05T18:30:00-03:00', statusLabel:'05/04 · 18h30 BRT · Maracanã',  competition:'Brasileirão Série A · Rodada 10', title:'Flamengo × Santos',             bettvPick:'Flamengo',    bettvConf:60, bettvReason:'Flamengo líder histórico em casa no Maracanã. Santos em crise no 16º lugar.', home:{name:'Flamengo',        logo:'flamengo',    sub:'Campeão 2025',   pct:60}, away:{name:'Santos',          logo:null,          sub:'16º Série A',    pct:18}, draw:22},
    { id:'br-r10-palxgre',startTime:'2026-04-04T20:30:00-03:00', statusLabel:'04/04 · 20h30 BRT · Allianz Pq',competition:'Brasileirão Série A · Rodada 10', title:'Palmeiras × Grêmio',            bettvPick:'Palmeiras',   bettvConf:65, bettvReason:'Palmeiras melhor ataque (16 gols em 7 jogos). Grêmio visitante difícil.', home:{name:'Palmeiras',       logo:'palmeiras',   sub:'Série A 2026',   pct:64}, away:{name:'Grêmio',          logo:'gremio',      sub:'Série A 2026',   pct:15}, draw:21},

    // ══════════════════════════════════════════════════════
    // 🏴󠁧󠁢󠁥󠁮󠁧󠁿  EUROPA — Premier League
    // ══════════════════════════════════════════════════════
    { id:'pl-newxsun', startTime:'2026-03-25T12:00:00Z', statusLabel:'Amanhã · 09h BRT · St James Park',   competition:'Premier League · Rodada 31',  title:'Newcastle United × Sunderland AFC',    bettvPick:'Newcastle United', bettvConf:57, bettvReason:'Newcastle 57.1% SportRadar. Sunderland promovido 18.8%. Qualidade superior dos Magpies.', home:{name:'Newcastle United',  logo:'newcastle',   sub:'5º · 57.1%',     pct:57}, away:{name:'Sunderland AFC',     logo:'sunderland',  sub:'19º · 18.8%',    pct:19}, draw:24},
    { id:'pl-avlxwhu', startTime:'2026-03-25T14:15:00Z', statusLabel:'Amanhã · 11h15 BRT · Villa Park',   competition:'Premier League · Rodada 31',  title:'Aston Villa × West Ham United',         bettvPick:'Aston Villa',      bettvConf:52, bettvReason:'Villa 7º (48pts) 51.5% SportRadar. West Ham 15º (28pts) 23.3%. Watkins artilheiro.', home:{name:'Aston Villa',        logo:'astonvilla',  sub:'7º · 51.5%',     pct:52}, away:{name:'West Ham United',    logo:'westham',     sub:'15º · 23.3%',    pct:23}, draw:25},
    { id:'pl-totxnfo', startTime:'2026-03-25T14:15:00Z', statusLabel:'Amanhã · 11h15 BRT · Tottenham Std', competition:'Premier League · Rodada 31',  title:'Tottenham Hotspur × Nottingham Forest',  bettvPick:'Tottenham Hotspur',bettvConf:41, bettvReason:'Tottenham 8º (46pts) 40.8% SportRadar. Forest 11º (40pts) 31%. Equilíbrio real.', home:{name:'Tottenham Hotspur',  logo:'tottenham',   sub:'8º · 40.8%',     pct:41}, away:{name:'Nottingham Forest',  logo:'nottmforest', sub:'11º · 31%',      pct:31}, draw:28},
    { id:'pl-arsbou',  startTime:'2026-04-11T11:30:00Z', statusLabel:'11/04 · 08h30 BRT · Emirates',       competition:'Premier League · Rodada 32',  title:'Arsenal FC × AFC Bournemouth',          bettvPick:'Arsenal FC',       bettvConf:71, bettvReason:'Arsenal FC lidera PL. 70.8% SportRadar. Bournemouth 11.5%.', home:{name:'Arsenal FC',          logo:'arsenal',     sub:'1º · 70.8%',     pct:71}, away:{name:'AFC Bournemouth',    logo:null,          sub:'12º · 11.5%',    pct:12}, draw:17},
    { id:'pl-lfcful',  startTime:'2026-04-11T16:30:00Z', statusLabel:'11/04 · 13h30 BRT · Anfield',         competition:'Premier League · Rodada 32',  title:'Liverpool FC × Fulham FC',              bettvPick:'Liverpool FC',     bettvConf:63, bettvReason:'Liverpool 3º (66pts) 63.3% SportRadar. Fulham 8º (43pts) 16.8%.', home:{name:'Liverpool FC',        logo:'liverpool',   sub:'3º · 63.3%',     pct:63}, away:{name:'Fulham FC',          logo:null,          sub:'8º · 16.8%',     pct:17}, draw:20},

    // ══════════════════════════════════════════════════════
    // 🇪🇸  EUROPA — La Liga
    // ══════════════════════════════════════════════════════
    { id:'ll-barxrvc', startTime:'2026-03-25T13:00:00Z', statusLabel:'Amanhã · 10h BRT · Camp Nou',         competition:'La Liga · Rodada 29',         title:'FC Barcelona × Rayo Vallecano',         bettvPick:'FC Barcelona',     bettvConf:78, bettvReason:'Barcelona lidera La Liga 78% SportRadar. Rayo Vallecano 8.9% — diferença enorme.', home:{name:'FC Barcelona',       logo:'barcelona',   sub:'1º · 78%',       pct:78}, away:{name:'Rayo Vallecano',     logo:null,          sub:'9º · 8.9%',      pct:9},  draw:13},
    { id:'ll-rmaxatm', startTime:'2026-03-22T20:00:00Z', statusLabel:'Amanhã · 17h BRT · Bernabéu',          competition:'La Liga · Rodada 29',         title:'Real Madrid × Atletico Madrid',         bettvPick:'Real Madrid',      bettvConf:51, bettvReason:'Derby Madrileno. Real 51.3% SportRadar. Atletico 24.7%. Mbappé favorito.', home:{name:'Real Madrid',         logo:'realmadrid',  sub:'2º · 51.3%',     pct:51}, away:{name:'Atletico Madrid',    logo:'atletimadrid',sub:'3º · 24.7%',     pct:25}, draw:24},
    { id:'ll-malmra',  startTime:'2026-04-04T14:15:00Z', statusLabel:'04/04 · 11h15 BRT · Visit Mallorca',   competition:'La Liga · Rodada 30',         title:'RCD Mallorca × Real Madrid',            bettvPick:'Real Madrid',      bettvConf:60, bettvReason:'Real Madrid 60.3% SportRadar. Mallorca 17.5% em casa. Mbappé em sequência.', home:{name:'RCD Mallorca',        logo:null,          sub:'7º · 17.5%',     pct:18}, away:{name:'Real Madrid',         logo:'realmadrid',  sub:'2º · 60.3%',     pct:60}, draw:22},
    { id:'ll-atmxbar', startTime:'2026-04-04T19:00:00Z', statusLabel:'04/04 · 16h BRT · Metropolitano',      competition:'La Liga · Rodada 30',         title:'Atletico Madrid × FC Barcelona',        bettvPick:'FC Barcelona',     bettvConf:41, bettvReason:'Barcelona 40.8% SportRadar. Atletico em casa 34.6%. Barça lidera mas Metropolitano é difícil.', home:{name:'Atletico Madrid',    logo:'atletimadrid',sub:'3º · 34.6%',     pct:35}, away:{name:'FC Barcelona',       logo:'barcelona',   sub:'1º · 40.8%',     pct:41}, draw:24},

    // ══════════════════════════════════════════════════════
    // 🏆  EUROPA — Champions League QF
    // ══════════════════════════════════════════════════════
    { id:'ucl-rmabmu', startTime:'2026-04-07T19:00:00Z', statusLabel:'07/04 · 16h BRT · Bernabéu',           competition:'Champions League · QF 1ª Mão', title:'Real Madrid × Bayern Munich',          bettvPick:'Bayern Munich',    bettvConf:45, bettvReason:'Bayern Munich 44.5% SportRadar favorito. Real 31%. Bayern venceu Real na fase de grupos 2-1.', home:{name:'Real Madrid',         logo:'realmadrid',  sub:'QF · ESP · 31%', pct:31}, away:{name:'Bayern Munich',      logo:'bayernmunich',sub:'QF · ALE · 44.5%',pct:45}, draw:24},
    { id:'ucl-spoars', startTime:'2026-04-07T19:00:00Z', statusLabel:'07/04 · 16h BRT · José Alvalade',       competition:'Champions League · QF 1ª Mão', title:'Sporting CP × Arsenal FC',             bettvPick:'Arsenal FC',       bettvConf:54, bettvReason:'Arsenal 53.7% SportRadar. Venceu Leverkusen 2-0 nas oitavas. Sporting 21.3%.', home:{name:'Sporting CP',         logo:null,          sub:'QF · POR · 21.3%',pct:21}, away:{name:'Arsenal FC',          logo:'arsenal',     sub:'QF · ING · 53.7%',pct:54}, draw:25},
    { id:'ucl-psglfc', startTime:'2026-04-08T19:00:00Z', statusLabel:'08/04 · 16h BRT · Parc des Princes',    competition:'Champions League · QF 1ª Mão', title:'PSG × Liverpool FC',                   bettvPick:'PSG',              bettvConf:50, bettvReason:'PSG 49.6% SportRadar em casa. Devastou Chelsea 5-2 e 3-0 nas oitavas. Liverpool 26.3%.', home:{name:'Paris Saint-Germain', logo:'psg',         sub:'QF · FRA · 49.6%',pct:50}, away:{name:'Liverpool FC',        logo:'liverpool',   sub:'QF · ING · 26.3%',pct:26}, draw:24},
    { id:'ucl-baratm', startTime:'2026-04-08T19:00:00Z', statusLabel:'08/04 · 16h BRT · Camp Nou',            competition:'Champions League · QF 1ª Mão', title:'FC Barcelona × Atletico Madrid',       bettvPick:'FC Barcelona',     bettvConf:61, bettvReason:'Barcelona 61.1% SportRadar. Goleou Newcastle 7-2. Atletico 18.5%.', home:{name:'FC Barcelona',       logo:'barcelona',   sub:'QF · ESP · 61.1%',pct:61}, away:{name:'Atletico Madrid',    logo:'atletimadrid',sub:'QF · ESP · 18.5%',pct:19}, draw:20},
    { id:'ucl-lfcpsg', startTime:'2026-04-14T19:00:00Z', statusLabel:'14/04 · 16h BRT · Anfield',             competition:'Champions League · QF 2ª Mão', title:'Liverpool FC × PSG',                   bettvPick:'PSG',              bettvConf:53, bettvReason:'PSG 52.5% SportRadar. Favorito após domínio no 1º jogo. Liverpool precisa virar.', home:{name:'Liverpool FC',        logo:'liverpool',   sub:'QF · ING · 24.5%',pct:25}, away:{name:'Paris Saint-Germain', logo:'psg',         sub:'QF · FRA · 52.5%',pct:53}, draw:22},
    { id:'ucl-atmbar', startTime:'2026-04-14T19:00:00Z', statusLabel:'14/04 · 16h BRT · Metropolitano',       competition:'Champions League · QF 2ª Mão', title:'Atletico Madrid × FC Barcelona',       bettvPick:'FC Barcelona',     bettvConf:61, bettvReason:'Barcelona 61.2% SportRadar. Atletico 19.2% — Barça domina H2H desta temporada.', home:{name:'Atletico Madrid',    logo:'atletimadrid',sub:'QF · ESP · 19.2%',pct:19}, away:{name:'FC Barcelona',       logo:'barcelona',   sub:'QF · ESP · 61.2%',pct:61}, draw:20},
    { id:'ucl-bmurma', startTime:'2026-04-15T19:00:00Z', statusLabel:'15/04 · 16h BRT · Allianz Arena',       competition:'Champions League · QF 2ª Mão', title:'Bayern Munich × Real Madrid',          bettvPick:'Bayern Munich',    bettvConf:50, bettvReason:'2º jogo após Bayern vencer 1º. Bayern em casa 50/50. Real precisa reagir.', home:{name:'Bayern Munich',      logo:'bayernmunich',sub:'QF · ALE',        pct:45}, away:{name:'Real Madrid',         logo:'realmadrid',  sub:'QF · ESP',       pct:35}, draw:20},
    { id:'ucl-arsspo', startTime:'2026-04-15T19:00:00Z', statusLabel:'15/04 · 16h BRT · Emirates',            competition:'Champions League · QF 2ª Mão', title:'Arsenal FC × Sporting CP',             bettvPick:'Arsenal FC',       bettvConf:65, bettvReason:'Arsenal favorito para avançar. Vantagem no 1º jogo. Sporting precisa de grande feito.', home:{name:'Arsenal FC',          logo:'arsenal',     sub:'QF · ING',       pct:65}, away:{name:'Sporting CP',         logo:null,          sub:'QF · POR',       pct:20}, draw:15},

    // ══════════════════════════════════════════════════════
    // 🇺🇸  EUA — MLS
    // ══════════════════════════════════════════════════════
    { id:'mls-nshxorl', startTime:'2026-03-24T22:15:00Z', statusLabel:'AO VIVO · Nashville · MLS',            competition:'MLS · Rodada 5',              title:'Nashville SC × Orlando City SC',        bettvPick:'Nashville SC',     bettvConf:70, bettvReason:'Nashville lidera 3-0 ao intervalo. Resultado quase definido. Orlando em colapso.', home:{name:'Nashville SC',        logo:null,          sub:'MLS · Leste',    pct:70}, away:{name:'Orlando City SC',    logo:null,          sub:'MLS · Leste',    pct:18}, draw:12},
    { id:'mls-dalxhou', startTime:'2026-03-25T00:30:00Z', statusLabel:'Hoje · 21h30 BRT · Toyota Stadium',    competition:'MLS · Rodada 5',              title:'FC Dallas × Houston Dynamo',            bettvPick:'FC Dallas',        bettvConf:40, bettvReason:'FC Dallas 40.1% SportRadar. Houston Dynamo 32.8%. Texas Derby equilibrado.', home:{name:'FC Dallas',           logo:null,          sub:'MLS · Oeste · 40.1%',pct:40}, away:{name:'Houston Dynamo',     logo:null,          sub:'MLS · Oeste · 32.8%',pct:33}, draw:27},
    { id:'mls-nycxmia', startTime:'2026-03-22T17:00:00Z', statusLabel:'Amanhã · 14h BRT · Yankee Stadium',    competition:'MLS · Rodada 5',              title:'New York City FC × Inter Miami CF',     bettvPick:'NYCFC',            bettvConf:41, bettvReason:'NYCFC 41.1% SportRadar em casa. Inter Miami 32.7%. Miami sem grande forma no MLS.', home:{name:'New York City FC',    logo:null,          sub:'MLS · Leste · 41.1%',pct:41}, away:{name:'Inter Miami CF',     logo:null,          sub:'MLS · Leste · 32.7%',pct:33}, draw:26},
    { id:'mls-porxlag', startTime:'2026-03-22T20:45:00Z', statusLabel:'Amanhã · 17h45 BRT · Providence Park', competition:'MLS · Rodada 5',              title:'Portland Timbers × LA Galaxy',          bettvPick:'Portland Timbers', bettvConf:43, bettvReason:'Portland 42.6% SportRadar em casa. LA Galaxy 31.9%. Clássico Oeste MLS.', home:{name:'Portland Timbers',    logo:null,          sub:'MLS · Oeste · 42.6%',pct:43}, away:{name:'LA Galaxy',          logo:null,          sub:'MLS · Oeste · 31.9%',pct:32}, draw:25},
    { id:'mls-minxsea', startTime:'2026-03-22T18:30:00Z', statusLabel:'Amanhã · 15h30 BRT · Allianz Field',   competition:'MLS · Rodada 5',              title:'Minnesota United × Seattle Sounders',   bettvPick:'Seattle Sounders', bettvConf:37, bettvReason:'Seattle 37.4% vs Minnesota 34.4% SportRadar. Equilíbrio total no Oeste MLS.', home:{name:'Minnesota United FC', logo:null,          sub:'MLS · Oeste · 34.4%',pct:34}, away:{name:'Seattle Sounders',   logo:null,          sub:'MLS · Oeste · 37.4%',pct:37}, draw:29},
  ]},

  basquete: { label:'Basquete', items:[
    // NBA AO VIVO agora (21/03 ~22:30 BRT)
    { id:'b-orl', startTime:'2026-03-24T23:00:00Z', statusLabel:'AO VIVO · Q2 6:31 · Kaseya Ctr',      competition:'NBA · Temp. Regular', title:'Orlando Magic × LA Lakers',             bettvPick:'Orlando Magic',        bettvConf:52, bettvReason:'Orlando lidera Q2 45-41 SportRadar. Magic jogando bem em casa contra Lakers fora.', home:{name:'Orlando Magic',       logo:'magic',    sub:'Q2 · 45pts',    pct:52}, away:{name:'LA Lakers',            logo:'lakers',   sub:'Q2 · 41pts',    pct:44}, draw:4 },
    { id:'b-cha', startTime:'2026-03-24T23:00:00Z', statusLabel:'AO VIVO · Q2 5:22 · Spectrum Ctr',    competition:'NBA · Temp. Regular', title:'Charlotte Hornets × Memphis Grizzlies',  bettvPick:'Charlotte Hornets',    bettvConf:55, bettvReason:'Charlotte lidera Q2 45-41. Memphis em colapso — pior sequência da temporada.', home:{name:'Charlotte Hornets',    logo:'hornets',  sub:'Q2 · 45pts',    pct:55}, away:{name:'Memphis Grizzlies',    logo:'grizzlies',sub:'Q2 · 41pts',    pct:36}, draw:9 },
    { id:'b-nop', startTime:'2026-03-24T23:00:00Z', statusLabel:'AO VIVO · Q2 4:54 · Smoothie King',   competition:'NBA · Temp. Regular', title:'New Orleans Pelicans × Cleveland Cavaliers',bettvPick:'Cleveland Cavaliers',bettvConf:58, bettvReason:'Cleveland lidera Q2 48-42. Mitchell e Garland dominam. Pelicans sob pressão.', home:{name:'New Orleans Pelicans',  logo:'pelicans', sub:'Q2 · 42pts',    pct:36}, away:{name:'Cleveland Cavaliers',  logo:'cavaliers',sub:'Q2 · 48pts',    pct:58}, draw:6 },
    // NBA esta noite (scheduled)
    { id:'b-hou', startTime:'2026-03-25T00:00:00Z', statusLabel:'Hoje · 21h BRT · Toyota Center',      competition:'NBA · Temp. Regular', title:'Houston Rockets × Miami Heat',           bettvPick:'Houston Rockets',      bettvConf:57, bettvReason:'Houston 57.3% SportRadar. 5V seguidas em casa. Miami sem Tyler Herro lesionado.', home:{name:'Houston Rockets',      logo:'rockets',  sub:'Conf. Oeste · 57.3%',pct:57}, away:{name:'Miami Heat',            logo:'heat',     sub:'Conf. Leste · 42.7%',pct:43}, draw:0 },
    { id:'b-sas', startTime:'2026-03-25T00:00:00Z', statusLabel:'Hoje · 21h BRT · AT&T Center',        competition:'NBA · Temp. Regular', title:'San Antonio Spurs × Indiana Pacers',     bettvPick:'San Antonio Spurs',    bettvConf:89, bettvReason:'Spurs 92.8% SportRadar. Wembanyama 24pts/12reb por jogo. Pacers sem Haliburton.', home:{name:'San Antonio Spurs',    logo:'spurs',    sub:'Conf. Oeste · 92.8%',pct:89}, away:{name:'Indiana Pacers',        logo:'pacers',   sub:'Conf. Leste · 7.2%', pct:7},  draw:4 },
    { id:'b-atl', startTime:'2026-03-25T00:00:00Z', statusLabel:'Hoje · 21h BRT · State Farm Arena',   competition:'NBA · Temp. Regular', title:'Atlanta Hawks × Golden State Warriors',   bettvPick:'Atlanta Hawks',        bettvConf:75, bettvReason:'Hawks 74.8% SportRadar. Warriors sem Curry — 10ª pior defesa da temporada.', home:{name:'Atlanta Hawks',         logo:'hawks',    sub:'Conf. Leste · 74.8%',pct:75}, away:{name:'Golden State Warriors', logo:'warriors', sub:'Conf. Oeste · 25.2%',pct:25}, draw:0 },
    { id:'b-dal', startTime:'2026-03-25T00:30:00Z', statusLabel:'Hoje · 21h30 BRT · Am. Airlines Ctr', competition:'NBA · Temp. Regular', title:'Dallas Mavericks × LA Clippers',         bettvPick:'LA Clippers',          bettvConf:68, bettvReason:'Clippers 71.7% SportRadar. Dallas rebuilding pós-troca de Luka Doncic.', home:{name:'Dallas Mavericks',     logo:'mavericks',sub:'Conf. Oeste · 28.3%',pct:28}, away:{name:'LA Clippers',           logo:'clippers', sub:'Conf. Oeste · 71.7%',pct:68}, draw:4 },
    { id:'b-uta', startTime:'2026-03-25T01:30:00Z', statusLabel:'Hoje · 22h30 BRT · Delta Center',     competition:'NBA · Temp. Regular', title:'Utah Jazz × Philadelphia 76ers',         bettvPick:'Philadelphia 76ers',   bettvConf:62, bettvReason:'76ers 66.5% SportRadar. Embiid dominante desde retorno de lesão no quadril.', home:{name:'Utah Jazz',             logo:'jazz',     sub:'Conf. Oeste · 33.5%',pct:34}, away:{name:'Philadelphia 76ers',   logo:'sixers',   sub:'Conf. Leste · 66.5%',pct:62}, draw:4 },
    { id:'b-phx', startTime:'2026-03-26T02:00:00Z', statusLabel:'Hoje · 23h BRT · Footprint Center',   competition:'NBA · Temp. Regular', title:'Phoenix Suns × Milwaukee Bucks',         bettvPick:'Phoenix Suns',         bettvConf:79, bettvReason:'Suns 82.9% SportRadar. Bucks sem Giannis — lesão no joelho encerra temporada.', home:{name:'Phoenix Suns',          logo:'suns',     sub:'Conf. Oeste · 82.9%',pct:80}, away:{name:'Milwaukee Bucks',       logo:'bucks',    sub:'Conf. Leste · 17.1%',pct:17}, draw:3 },
    // NBA amanhã 22/03 e próximos dias
    { id:'b-den', startTime:'2026-03-26T21:00:00Z', statusLabel:'Amanhã · 18h BRT · Ball Arena',       competition:'NBA · Temp. Regular', title:'Denver Nuggets × Portland Trail Blazers', bettvPick:'Denver Nuggets',       bettvConf:72, bettvReason:'Nuggets 76.1% SportRadar. Jokic triplo-duplo machine. Portland em rebuilding.', home:{name:'Denver Nuggets',       logo:'nuggets',  sub:'Conf. Oeste · 76.1%',pct:73}, away:{name:'Portland Trail Blazers',logo:'blazers',  sub:'Conf. Oeste · 23.9%',pct:19}, draw:8 },
    { id:'b-bos', startTime:'2026-03-27T00:00:00Z', statusLabel:'Dom · 21h BRT · TD Garden',           competition:'NBA · Temp. Regular', title:'Boston Celtics × Minnesota Timberwolves', bettvPick:'Boston Celtics',       bettvConf:72, bettvReason:'Celtics 76.7% SportRadar. 1º do Leste em casa. Timberwolves fortes mas viajando.', home:{name:'Boston Celtics',        logo:'celtics',  sub:'1º Leste · 76.7%',   pct:73}, away:{name:'Minnesota Timberwolves',logo:'timberwolves',sub:'Conf. Oeste · 23.3%',pct:23}, draw:4 },
    { id:'b-phi', startTime:'2026-03-23T23:00:00Z', statusLabel:'Seg · 20h BRT · Wells Fargo Center',  competition:'NBA · Temp. Regular', title:'Philadelphia 76ers × OKC Thunder',       bettvPick:'OKC Thunder',          bettvConf:55, bettvReason:'OKC Thunder lideres do Oeste — SGA vs Embiid, duelo épico dos MVPs da temporada.', home:{name:'Philadelphia 76ers',   logo:'sixers',   sub:'Conf. Leste',         pct:45}, away:{name:'OKC Thunder',          logo:'okc',      sub:'1º Oeste',            pct:52}, draw:3 },
  ]},

  mma: { label:'MMA / UFC', items:[
    // UFC FN 270 London — ENCERRADO hoje (dados reais Sportradar)
    // Evloev venceu Murphy por decisão majoritária (5 rounds)
    // UFC FN 271 — Seattle 28/03 (PRÓXIMO — card verificado Sportradar)
    { id:'m-ade',  startTime:'2026-03-29T02:00:00Z', statusLabel:'28/03 · 23h BRT · Climate Pledge · Seattle', competition:'UFC FN 271 · Main Event',    title:'Adesanya × Pyfer',         bettvPick:'Adesanya', bettvConf:62, bettvReason:'Adesanya Nº4 MW (24-5). Pyfer Nº14 (15-3) resistente mas Izzy tem alcance e técnica superiores.', home:{name:'I. Adesanya',  logo:'adesanya',  sub:'Nº4 MW · 24-5',  pct:60}, away:{name:'J. Pyfer',    logo:null,sub:'Nº14 MW · 15-3',pct:30}, draw:10},
    { id:'m-hoo',  startTime:'2026-03-28T22:40:00Z', statusLabel:'28/03 · 19h40 BRT · Co-main · Seattle',      competition:'UFC FN 271 · Co-main',       title:'Hooper × Gibson Jr',       bettvPick:'Hooper',   bettvConf:65, bettvReason:'Chase Hooper mais experiente e técnico. Gibson Jr estreante. Decisão provável.', home:{name:'C. Hooper',    logo:null,sub:'LW · UFC',        pct:65}, away:{name:'L. Gibson Jr',logo:null,sub:'LW · estreante',pct:25}, draw:10},
    // UFC FN 272 — Las Vegas 04/04 (card verificado Sportradar/CBS Sports)
    { id:'m-moi',  startTime:'2026-04-05T03:00:00Z', statusLabel:'04/04 · 00h BRT · UFC Apex · Vegas',         competition:'UFC FN 272 · Main Event',    title:'Moicano × Duncan',         bettvPick:'Moicano',  bettvConf:60, bettvReason:'Renato Moicano Nº11 LW (20-7) mais completo. Chris Duncan 15-2 surpresa mas falta elite.', home:{name:'R. Moicano',   logo:null,sub:'Nº11 LW · 20-7',pct:58}, away:{name:'C. Duncan', logo:null,sub:'LW · 15-2',       pct:30}, draw:12},
    // UFC 327 — Miami 11/04 (CBS Sports verificado)
    { id:'m-pro',  startTime:'2026-04-12T02:00:00Z', statusLabel:'11/04 · 23h BRT · Kaseya · Miami',           competition:'UFC 327 · Main Event',       title:'Prochazka × Ulberg',       bettvPick:'Prochazka',bettvConf:55, bettvReason:'Prochazka ex-campeão LHW (32-5-1). Ulberg 1º title shot (14-1). Experiência decide.', home:{name:'J. Prochazka', logo:'prochazka',sub:'32-5 · Ex-camp',  pct:54}, away:{name:'C. Ulberg', logo:null,sub:'14-1 · Nº3 LHW',pct:36}, draw:10},
    { id:'m-van',  startTime:'2026-04-12T00:00:00Z', statusLabel:'11/04 · 21h BRT · Kaseya · Miami',           competition:'UFC 327 · Co-main',          title:'Van × Taira',              bettvPick:'Van',      bettvConf:55, bettvReason:'Joshua Van campeão Flyweight defende cinturão contra Tatsuro Taira — duelo de elite.', home:{name:'J. Van',       logo:null,sub:'Camp. FLY · UFC', pct:53}, away:{name:'T. Taira',  logo:null,sub:'Top 5 FLY',       pct:37}, draw:10},
    // UFC FN 273 — 18/04
    { id:'m-bur',  startTime:'2026-04-19T03:00:00Z', statusLabel:'18/04 · 00h BRT · Vegas',                    competition:'UFC FN 273 · Main Event',    title:'Burns × Malott',           bettvPick:'Burns',    bettvConf:57, bettvReason:'Gilbert Burns top 10 WW veterano. Malott em momento forte mas Burns mais completo.', home:{name:'G. Burns',    logo:null,sub:'Top 10 WW',       pct:56}, away:{name:'M. Malott', logo:null,sub:'WW contender',    pct:33}, draw:11},
    // UFC FN Brasil São Paulo Maio
    { id:'m-pan',  startTime:'2026-05-10T00:00:00Z', statusLabel:'09/05 · 21h BRT · São Paulo',                competition:'UFC FN Brasil · Main Event', title:'Pantoja × Royval II',       bettvPick:'Pantoja',  bettvConf:67, bettvReason:'Alexandre Pantoja campeão peso-mosca. Defende cinturão em casa. Venceu Royval em 2023.', home:{name:'A. Pantoja',  logo:'pantoja',  sub:'Camp. FLY · BR', pct:66}, away:{name:'B. Royval', logo:null,sub:'Top 5 FLY',       pct:23}, draw:11},
  ]},

  tenis: { label:'Tênis', items:[
    // Miami Open AO VIVO (21/03) — dados Sportradar
    { id:'t-orl', startTime:'2026-03-24T23:05:00Z', statusLabel:'AO VIVO · Miami Open R32 · WTA',     competition:'WTA Miami Open · R32',  title:'Parks × Gauff',             bettvPick:'Gauff',    bettvConf:68, bettvReason:'Coco Gauff Nº3 WTA em Miami. Parks WC joga bem em casa mas nível abaixo de Gauff.', home:{name:'A. Parks',    logo:null,sub:'WC WTA',        pct:25}, away:{name:'C. Gauff',    logo:'gauff',  sub:'Nº3 WTA',    pct:68}, draw:7 },
    { id:'t-daz', startTime:'2026-03-25T00:30:00Z', statusLabel:'Hoje · 21h30 BRT · Miami ATP R32',   competition:'ATP Miami Open · R32',  title:'Damm Jr × Zverev',          bettvPick:'Zverev',   bettvConf:88, bettvReason:'Alexander Zverev Nº3 ATP. Damm Jr wildcard local. Diferença técnica enorme.', home:{name:'M. Damm Jr',  logo:null,sub:'WC ATP',        pct:8},  away:{name:'A. Zverev',   logo:'zverev', sub:'Nº3 ATP',    pct:88}, draw:4 },
    // Miami Open próximos rounds — schedule oficial ATP/WTA
    { id:'t-sin', startTime:'2026-03-23T17:00:00Z', statusLabel:'23/03 · 14h BRT · Miami ATP R32',   competition:'ATP Miami Open · R32',  title:'Sinner × Dzumhur',          bettvPick:'Sinner',   bettvConf:88, bettvReason:'Jannik Sinner Nº2 ATP campeão IW 2026. Dzumhur Nº76 tático mas sem poder para Sinner.', home:{name:'J. Sinner',   logo:'sinner', sub:'Nº2 · IW Campeão',pct:88}, away:{name:'D. Dzumhur',  logo:null, sub:'Nº76 ATP',   pct:8},  draw:4 },
    { id:'t-alc', startTime:'2026-03-23T20:00:00Z', statusLabel:'23/03 · 17h BRT · Miami ATP R32',   competition:'ATP Miami Open · R32',  title:'Alcaraz × R32',             bettvPick:'Alcaraz',  bettvConf:82, bettvReason:'Carlos Alcaraz Nº1 ATP. 17-1 na temporada. Invicto desde Indian Wells.', home:{name:'C. Alcaraz',  logo:'alcaraz',sub:'Nº1 ATP',      pct:82}, away:{name:'Oponente R32',logo:null, sub:'ATP',        pct:13}, draw:5 },
    { id:'t-qf1', startTime:'2026-03-25T17:00:00Z', statusLabel:'25/03 · 14h BRT · Miami QF ATP',    competition:'ATP Miami Open · QF',   title:'QF Miami Alcaraz × Zverev', bettvPick:'Alcaraz',  bettvConf:58, bettvReason:'Alcaraz Nº1 vs Zverev Nº3. H2H 7-4 Alcaraz. Miami favorece jogadores agressivos.', home:{name:'C. Alcaraz',  logo:'alcaraz',sub:'Nº1 ATP · QF',  pct:55}, away:{name:'A. Zverev',   logo:'zverev', sub:'Nº3 ATP · QF',pct:35}, draw:10},
    { id:'t-qf2', startTime:'2026-03-25T20:00:00Z', statusLabel:'25/03 · 17h BRT · Miami QF WTA',    competition:'WTA Miami Open · QF',   title:'QF Miami Sabalenka × Gauff', bettvPick:'Sabalenka',bettvConf:57, bettvReason:'Sabalenka Nº1 WTA campeã Miami 2025. H2H 5-2 vs Gauff. Favoritíssima.', home:{name:'A. Sabalenka',logo:'sabalenka',sub:'Nº1 WTA · QF', pct:57}, away:{name:'C. Gauff',    logo:'gauff',  sub:'Nº3 WTA · QF',pct:32}, draw:11},
    { id:'t-sf',  startTime:'2026-03-27T17:00:00Z', statusLabel:'27/03 · 14h BRT · Miami SF ATP',    competition:'ATP Miami Open · SF',   title:'SF Miami Sinner × Alcaraz', bettvPick:'Sinner',   bettvConf:47, bettvReason:'H2H histórico 6-6. Sinner bicampeão Miami (2024+2025). Alcaraz venceu IW. Equilíbrio total.', home:{name:'J. Sinner',   logo:'sinner', sub:'Nº2 ATP · SF',  pct:44}, away:{name:'C. Alcaraz',  logo:'alcaraz',sub:'Nº1 ATP · SF', pct:38}, draw:18},
    { id:'t-fin', startTime:'2026-03-29T17:00:00Z', statusLabel:'29/03 · 14h BRT · Final Miami ATP', competition:'ATP Miami Open · Final', title:'Final Miami Open 2026',      bettvPick:'Alcaraz',  bettvConf:43, bettvReason:'Alcaraz busca Sunshine Double. Sinner favorito por histórico Miami. Equilíbrio máximo.', home:{name:'C. Alcaraz',  logo:'alcaraz',sub:'Nº1 ATP · Final',pct:48}, away:{name:'J. Sinner',   logo:'sinner', sub:'Nº2 ATP · Final',pct:38}, draw:14},
    // Roland Garros
    { id:'t-rg',  startTime:'2026-05-25T09:00:00Z', statusLabel:'25/05 · 06h BRT · Paris',          competition:'Roland Garros 2026',    title:'Roland Garros 2026',         bettvPick:'Alcaraz',  bettvConf:41, bettvReason:'Alcaraz bicampeão RG (2023-24). Saibro é sua superfície. Sinner e Zverev ameaças.', home:{name:'C. Alcaraz',  logo:'alcaraz',sub:'Bicampeão RG',   pct:38}, away:{name:'J. Sinner',   logo:'sinner', sub:'Finalista 2025',pct:22}, draw:40},
  ]},

  esports: { label:'E-sports', items:[
    // CBLOL 2026 Etapa 1 — 28/03 (Riot Brasil confirmado)
    { id:'e-l1', startTime:'2026-03-28T16:00:00Z', statusLabel:'28/03 · 13h BRT · Riot Arena SP',   competition:'CBLOL 2026 · Etapa 1 · Rd 1', title:'LOUD × paiN Gaming', bettvPick:'LOUD',  bettvConf:66, bettvReason:'LOUD campeã Copa CBLOL 2026. Bull e RedBert dominantes. paiN sem título relevante desde 2023.', home:{name:'LOUD',          logo:'loud', sub:'Campeã Copa 2026',pct:62}, away:{name:'paiN Gaming',  logo:null,sub:'4º Copa',     pct:24}, draw:14},
    { id:'e-f1', startTime:'2026-03-28T18:00:00Z', statusLabel:'28/03 · 15h BRT · Riot Arena SP',   competition:'CBLOL 2026 · Etapa 1 · Rd 1', title:'FURIA × RED Canids',bettvPick:'FURIA', bettvConf:54, bettvReason:'FURIA bootcampou na Coreia pré-temporada. RED Canids inconstante com Grevthar diferencial.', home:{name:'FURIA',         logo:'furia',sub:'Americas Cup',  pct:52}, away:{name:'RED Canids',  logo:null,sub:'5º Copa',     pct:32}, draw:16},
    { id:'e-l2', startTime:'2026-04-04T16:00:00Z', statusLabel:'04/04 · 13h BRT · Riot Arena SP',   competition:'CBLOL 2026 · Etapa 1 · Rd 2', title:'LOUD × FURIA',     bettvPick:'LOUD',  bettvConf:55, bettvReason:'LOUD lidera H2H histórico vs FURIA 12V-8D. FURIA motivada pós-bootcamp Korea.', home:{name:'LOUD',          logo:'loud', sub:'Campeã Copa',     pct:53}, away:{name:'FURIA',       logo:'furia',sub:'Americas',    pct:35}, draw:12},
    // LCK Spring 2026 Playoffs — 05/04 (lolesports confirmado)
    { id:'e-t1', startTime:'2026-04-05T08:00:00Z', statusLabel:'05/04 · 05h BRT · LoL Park · Seoul',competition:'LCK Spring 2026 · Playoffs SF', title:'T1 × Gen.G',        bettvPick:'T1',    bettvConf:58, bettvReason:'T1 e Faker históricos em playoffs LCK. Gen.G com Chovy mas T1 mais experiente nas finais.', home:{name:'T1',            logo:'t1',   sub:'1º LCK',         pct:56}, away:{name:'Gen.G',       logo:null,sub:'2º LCK',     pct:32}, draw:12},
    // MSI 2026 — Maio
    { id:'e-msi', startTime:'2026-05-08T09:00:00Z', statusLabel:'08/05 · 06h BRT · MSI 2026',       competition:'MSI 2026 · Fase de Grupos',     title:'T1 × Cloud9',        bettvPick:'T1',    bettvConf:72, bettvReason:'T1 domina H2H internacional. Cloud9 representante NA com pouco histórico vs elite KR.', home:{name:'T1',            logo:'t1',   sub:'KR · MSI 2026',  pct:71}, away:{name:'Cloud9',       logo:null,sub:'NA · MSI 2026',pct:18}, draw:11},
    // CS2 Major 2026
    { id:'e-cs', startTime:'2026-05-01T12:00:00Z', statusLabel:'01/05 · 09h BRT · CS2 Major 2026',  competition:'CS2 Major 2026 · Quartas',       title:'NaVi × FaZe Clan',  bettvPick:'NaVi',  bettvConf:53, bettvReason:'s1mple ao melhor nível em 2026. FaZe forte mas NaVi lidera H2H em Majors com 3 títulos.', home:{name:'Natus Vincere', logo:null,sub:'Top 5 CS2',    pct:52}, away:{name:'FaZe Clan',   logo:null,sub:'Top 5 CS2',  pct:35}, draw:13},
  ]},

  golf: { label:'Golf', items:[
    // Valspar Championship — EM ANDAMENTO R4 (21-22/03) — PGA Tour API confirmado
    { multiDay:true, id:'g-val', startTime:'2026-03-24T13:00:00Z', statusLabel:'AO VIVO · R4 · Innisbrook · Flórida',competition:'PGA Tour · Valspar Championship', title:'Valspar Championship 2026',  bettvPick:'Scheffler',bettvConf:45, bettvReason:'Scottie Scheffler Nº1 mundial favorito. Innisbrook favorece drives precisos. Rory e Rahm ameaças.', home:{name:'S. Scheffler',logo:null,sub:'Nº1 Mundo · Fav.',pct:35}, away:{name:'R. McIlroy',  logo:null,sub:'Nº3 Mundo',      pct:25}, draw:40},
    // Texas Children Houston Open — 26/03 (PGA Tour API: status created)
    { multiDay:true, id:'g-hou', startTime:'2026-03-26T13:00:00Z', statusLabel:'26/03 · 10h BRT · Memorial Park · Houston',competition:'PGA Tour · Houston Open',        title:'Houston Open 2026',          bettvPick:'Scheffler',bettvConf:40, bettvReason:'Scheffler Nº1 Houston favorito histórico. Koepka e Cantlay ameaças em campo aberto.', home:{name:'S. Scheffler',logo:null,sub:'Nº1 Mundo',       pct:30}, away:{name:'B. Koepka',   logo:null,sub:'Nº6 Mundo',       pct:20}, draw:50},
    // Valero Texas Open — 02/04 (PGA Tour API: scheduled)
    { multiDay:true, id:'g-tex', startTime:'2026-04-02T13:00:00Z', statusLabel:'02/04 · 10h BRT · TPC San Antonio',  competition:'PGA Tour · Valero Texas Open',    title:'Valero Texas Open 2026',     bettvPick:'Rory McIlroy',bettvConf:38,bettvReason:'Valero TX Open tradicional warm-up para o Masters. McIlroy e Spieth favoritos históricos.', home:{name:'R. McIlroy',  logo:null,sub:'Nº3 Mundo',       pct:28}, away:{name:'J. Spieth',   logo:null,sub:'Nº11 Mundo',      pct:20}, draw:52},
    // THE MASTERS — 09/04 (PGA Tour API: created — Augusta National)
    { multiDay:true, id:'g-mas', startTime:'2026-04-09T13:00:00Z', statusLabel:'09/04 · 10h BRT · Augusta National', competition:'PGA Tour · The Masters 2026',     title:'The Masters Tournament 2026',bettvPick:'Scheffler',bettvConf:42, bettvReason:'Scheffler Nº1 mundo e bicampeão do Masters. Augusta favorece drives longos e putting preciso.', home:{name:'S. Scheffler',logo:null,sub:'Nº1 · 2× campeão', pct:30}, away:{name:'R. McIlroy',  logo:null,sub:'Nº3 · Sonho carreira',pct:22}, draw:48},
    // RBC Heritage — 16/04 (PGA Tour API: scheduled)
    { multiDay:true, id:'g-rbc', startTime:'2026-04-16T13:00:00Z', statusLabel:'16/04 · 10h BRT · Harbour Town · SC',competition:'PGA Tour · RBC Heritage',         title:'RBC Heritage 2026',          bettvPick:'Rory McIlroy',bettvConf:40,bettvReason:'McIlroy campeão RBC Heritage 2024. Harbour Town favorece precisão sobre distância.', home:{name:'R. McIlroy',  logo:null,sub:'Nº3 Mundo',       pct:28}, away:{name:'X. Schauffele',logo:null,sub:'Nº5 Mundo',       pct:22}, draw:50},
    // Cadillac Championship — 30/04 (PGA Tour API: scheduled)
    { multiDay:true, id:'g-cad', startTime:'2026-04-30T13:00:00Z', statusLabel:'30/04 · 10h BRT · Doral · Miami',    competition:'PGA Tour · Cadillac Championship',title:'Cadillac Championship 2026',  bettvPick:'Scheffler',bettvConf:38, bettvReason:'Scottie Scheffler domina campo aberto. Doral favorece potência. Rory e Cantlay competitivos.', home:{name:'S. Scheffler',logo:null,sub:'Nº1 Mundo',       pct:28}, away:{name:'R. McIlroy',  logo:null,sub:'Nº3 Mundo',       pct:20}, draw:52},
    // Truist Championship — 07/05
    { multiDay:true, id:'g-tru', startTime:'2026-05-07T13:00:00Z', statusLabel:'07/05 · 10h BRT · Truist Championship',competition:'PGA Tour · Truist Championship',title:'Truist Championship 2026',    bettvPick:'Scheffler',bettvConf:38, bettvReason:'Scheffler em grande forma. Torneio favorece precisão e gestão de campo.', home:{name:'S. Scheffler',logo:null,sub:'Nº1 Mundo',       pct:27}, away:{name:'C. Morikawa', logo:null,sub:'Nº7 Mundo',       pct:20}, draw:53},
  ]},
}

// ─── CRYPTO DATA ─────────────────────────────────────────────────────────────
const CRYPTO_DATA = [
  {id:'btc', symbol:'BTC', name:'Bitcoin',           price:70370,  change24h:-0.42, bettvPick:'NEUTRO',   bettvConf:48, bettvReason:'Mercado lateral. Correção saudável após rally. BTC segura $70k.', logo:'https://cryptologos.cc/logos/bitcoin-btc-logo.png',yearPick:'ALTA',yearConf:78,yearReason:'Pós-halving 2024 + ETFs institucionais. Ciclo histórico aponta $120k–$150k. Consenso forte.'},
  {id:'eth', symbol:'ETH', name:'Ethereum',           price:2147,   change24h:-0.4, bettvPick:'QUEDA', bettvConf:45, bettvReason:'ETH abaixo de suporte $2.200. Volume fraco. Correção em curso.', logo:'https://cryptologos.cc/logos/ethereum-eth-logo.png',yearPick:'ALTA',yearConf:64,yearReason:'Pectra upgrade + staking crescendo. L2s ganham TVL. Meta $3k–$5k em 2026.'},
  {id:'sol', symbol:'SOL', name:'Solana',             price:89.6,  change24h:-1.49, bettvPick:'QUEDA',   bettvConf:52, bettvReason:'SOL -1.5% no dia. Saída de liquidez DeFi. Suporte $85 testado.', logo:'https://cryptologos.cc/logos/solana-sol-logo.png',yearPick:'ALTA',yearConf:68,yearReason:'DeFi líder em volume DEX. Maior ganhador em TVL. Meta $180–$300 em 2026.'},
  {id:'bnb', symbol:'BNB', name:'BNB',                price:638.56,    change24h:-2.04, bettvPick:'QUEDA',   bettvConf:55, bettvReason:'BNB -2% com saída de capitais de altcoins. Suporte $620.', logo:'https://cryptologos.cc/logos/bnb-bnb-logo.png',yearPick:'ALTA',yearConf:60,yearReason:'BNB Chain queima deflacionária trimestral. Ecossistema CZ resiliente. Meta $900–$1.400.'},
  {id:'xrp', symbol:'XRP', name:'XRP',                price:1.44,  change24h:-0.85, bettvPick:'QUEDA',  bettvConf:52, bettvReason:'Perde momentum após alta de 40% em fevereiro. Correção provável.', logo:'https://cryptologos.cc/logos/xrp-xrp-logo.png',yearPick:'ALTA',yearConf:58,yearReason:'Caso SEC encerrado. Pagamentos institucionais crescem. Meta $3–$5 em bull.'},
  {id:'usdc',symbol:'USDC',name:'USD Coin',           price:1.0,   change24h:0.0,  bettvPick:'NEUTRO', bettvConf:99, bettvReason:'Stablecoin atrelada ao dólar. Sem variação esperada.', logo:'https://cryptologos.cc/logos/usd-coin-usdc-logo.png',yearPick:'NEUTRO',yearConf:99,yearReason:'Stablecoin USD. Sem variação por design. Confiança máxima.'},
  {id:'ada', symbol:'ADA', name:'Cardano',            price:0.27,  change24h:-2.81, bettvPick:'QUEDA',   bettvConf:60, bettvReason:'ADA -2.81%. Mercado risk-off. Suporte $0.25 em risco.', logo:'https://cryptologos.cc/logos/cardano-ada-logo.png',yearPick:'ALTA',yearConf:48,yearReason:'Chang 2 ativo mas ecossistema DeFi ainda nascente. Meta $0,80–$1,50.'},
  {id:'avax',symbol:'AVAX',name:'Avalanche',          price:19.8,   change24h:-1.2, bettvPick:'ALTA',   bettvConf:57, bettvReason:'Subnet Teleporter ganha adoção. TVL em recuperação.', logo:'https://cryptologos.cc/logos/avalanche-avax-logo.png',yearPick:'ALTA',yearConf:56,yearReason:'Subnets empresariais. Teleporter. TVL em recuperação. Meta $60–$120.'},
  {id:'doge',symbol:'DOGE',name:'Dogecoin',           price:0.092,  change24h:-1.86, bettvPick:'QUEDA',   bettvConf:58, bettvReason:'DOGE -1.86%. Sem catalisador meme. Correção técnica.', logo:'https://cryptologos.cc/logos/dogecoin-doge-logo.png',yearPick:'ALTA',yearConf:42,yearReason:'Narrativa meme+utilidade Tesla. Volátil. Meta especulativa $0,50–$1. Baixa confiança.'},
  {id:'dot', symbol:'DOT', name:'Polkadot',           price:4.82,   change24h:-1.5, bettvPick:'NEUTRO', bettvConf:44, bettvReason:'Polkadot 2.0 em implementação. Consolidação lateral.', logo:'https://cryptologos.cc/logos/polkadot-new-dot-logo.png',yearPick:'ALTA',yearConf:46,yearReason:'JAM protocol. Polkadot 2.0 entregue. Meta $15–$25 com bull market.'},
  {id:'link',symbol:'LINK',name:'Chainlink',          price:9.06,   change24h:-0.31, bettvPick:'ALTA',   bettvConf:59, bettvReason:'CCIP adotado por grandes bancos. Oráculos em alta demanda.', logo:'https://cryptologos.cc/logos/chainlink-link-logo.png',yearPick:'ALTA',yearConf:65,yearReason:'Oráculos indispensáveis para DeFi. CCIP bancário crescendo. Meta $30–$55.'},
  {id:'matic',symbol:'POL',name:'Polygon',            price:0.295,  change24h:-2.1, bettvPick:'QUEDA',  bettvConf:53, bettvReason:'Migração POL completa mas L2 perdendo para ARB.', logo:'https://cryptologos.cc/logos/polygon-matic-logo.png',yearPick:'NEUTRO',yearConf:44,yearReason:'POL migração concluída mas L2 perde para ARB. Incerto. Meta $0,40–$0,80.'},
  {id:'uni', symbol:'UNI', name:'Uniswap',            price:6.42,   change24h:-1.8, bettvPick:'ALTA',   bettvConf:50, bettvReason:'Uniswap v4 no ar. Volume DEX recorde.', logo:'https://cryptologos.cc/logos/uniswap-uni-logo.png',yearPick:'ALTA',yearConf:54,yearReason:'Uniswap v4 + fee switch aprovado. Volume DEX recorde. Meta $20–$40.'},
  {id:'near',symbol:'NEAR',name:'NEAR Protocol',      price:2.41,   change24h:-1.6, bettvPick:'ALTA',   bettvConf:61, bettvReason:'AI integrations ganhando tração. Sharding fase 3 entregue.', logo:'https://cryptologos.cc/logos/near-protocol-near-logo.png',yearPick:'ALTA',yearConf:60,yearReason:'AI+blockchain líder. Sharding fase 3 entregue. Meta $8–$18.'},
  {id:'arb', symbol:'ARB', name:'Arbitrum',           price:0.362,  change24h:-2.3, bettvPick:'ALTA',   bettvConf:55, bettvReason:'Lidera L2 em TVL ($18B). Stylus VM atrai devs.', logo:'https://cryptologos.cc/logos/arbitrum-arb-logo.png',yearPick:'ALTA',yearConf:58,yearReason:'Líder L2 em TVL ($18B). Stylus VM atrai devs. Meta $1,50–$3.'},
  {id:'op',  symbol:'OP',  name:'Optimism',           price:0.748,   change24h:-1.9, bettvPick:'ALTA',   bettvConf:51, bettvReason:'Superchain crescendo. Base usa OP Stack.', logo:'https://cryptologos.cc/logos/optimism-ethereum-op-logo.png',yearPick:'ALTA',yearConf:54,yearReason:'Superchain crescendo. Base usa OP Stack. Meta $3–$6.'},
  {id:'sui', symbol:'SUI', name:'Sui',                price:2.14,   change24h:-3.2, bettvPick:'QUEDA',   bettvConf:55, bettvReason:'SUI -3.2%. Correção após rally. Suporte $2 testado.', logo:'https://cryptologos.cc/logos/sui-sui-logo.png',yearPick:'ALTA',yearConf:66,yearReason:'Maior ganhador 2026 em TVL. L1 mais rápido para DeFi. Meta $8–$18.'},
  {id:'ton', symbol:'TON', name:'Toncoin',            price:2.82,   change24h:-1.1, bettvPick:'ALTA',   bettvConf:60, bettvReason:'Integração Telegram 900M usuários. Mini-apps em explosão.', logo:'https://cryptologos.cc/logos/toncoin-ton-logo.png',yearPick:'ALTA',yearConf:64,yearReason:'Telegram 900M users. Mini-apps em explosão. Meta $10–$20.'},
  {id:'apt', symbol:'APT', name:'Aptos',              price:4.28,   change24h:-2.4, bettvPick:'ALTA',   bettvConf:54, bettvReason:'DeFi TVL em máxima histórica. Integração Google Cloud.', logo:'https://cryptologos.cc/logos/aptos-apt-logo.png',yearPick:'ALTA',yearConf:56,yearReason:'DeFi TVL máxima histórica. Google Cloud parceiro. Meta $15–$28.'},
  {id:'tia', symbol:'TIA', name:'Celestia',           price:2.91,   change24h:-3.5, bettvPick:'QUEDA',   bettvConf:56, bettvReason:'TIA -3.5%. Correção modular após semanas de alta.', logo:'https://cryptologos.cc/logos/celestia-tia-logo.png',yearPick:'ALTA',yearConf:58,yearReason:'Modular blockchain liderança. Rollups migrando para Celestia. Meta $12–$22.'},
  {id:'sei', symbol:'SEI', name:'Sei',                price:0.186,  change24h:-4.2, bettvPick:'QUEDA',   bettvConf:58, bettvReason:'SEI -4.2% pior altcoin do dia. Venda técnica.', logo:'https://cryptologos.cc/logos/sei-sei-logo.png',yearPick:'ALTA',yearConf:60,yearReason:'L1 mais rápido para trading. v2 paralelização. Meta $0,80–$1,80.'},
  {id:'inj', symbol:'INJ', name:'Injective',          price:13.85,   change24h:-3.8, bettvPick:'ALTA',   bettvConf:59, bettvReason:'Lidera DeFi em trading perpétuo. Cosmos integrado.', logo:'https://cryptologos.cc/logos/injective-inj-logo.png',yearPick:'ALTA',yearConf:58,yearReason:'Perp DeFi líder no Cosmos. Institutional DeFi crescendo. Meta $45–$80.'},
  {id:'rndr',symbol:'RNDR',name:'Render',             price:3.71,   change24h:-2.6, bettvPick:'ALTA',   bettvConf:60, bettvReason:'GPU computing para IA em boom. Parceria Nvidia.', logo:'https://cryptologos.cc/logos/render-token-rndr-logo.png',yearPick:'ALTA',yearConf:64,yearReason:'GPU computing para IA em boom. Nvidia parceiro. Meta $12–$22.'},
  {id:'fet', symbol:'FET', name:'Fetch.ai',           price:0.853,   change24h:-3.1, bettvPick:'ALTA',   bettvConf:63, bettvReason:'Narrativa AI+crypto forte. ASI Alliance em expansão.', logo:'https://cryptologos.cc/logos/fetch-ai-fet-logo.png',yearPick:'ALTA',yearConf:66,yearReason:'ASI Alliance+narrativa AI forte. Meta $3–$7 em 2026.'},
  {id:'jup', symbol:'JUP', name:'Jupiter',            price:0.438,  change24h:-2.9, bettvPick:'ALTA',   bettvConf:57, bettvReason:'Maior DEX aggregator da Solana. Volume $1B/dia.', logo:'https://cryptologos.cc/logos/jupiter-jup-logo.png',yearPick:'ALTA',yearConf:56,yearReason:'DEX aggregator líder Solana. Volume $1B+/dia. Meta $1,50–$3,50.'},
  {id:'aave',symbol:'AAVE',name:'Aave',               price:122.4,    change24h:-1.4, bettvPick:'ALTA',   bettvConf:58, bettvReason:'$15B TVL líder DeFi lending. GHO stablecoin crescendo.', logo:'https://cryptologos.cc/logos/aave-aave-logo.png',yearPick:'ALTA',yearConf:60,yearReason:'$15B TVL líder DeFi lending. GHO crescendo. Meta $400–$700.'},
  {id:'mkr', symbol:'MKR', name:'MakerDAO',           price:940,   change24h:-1.2, bettvPick:'ALTA',   bettvConf:52, bettvReason:'DAI $8B circulação. Sky Protocol expansão ativa.', logo:'https://cryptologos.cc/logos/maker-mkr-logo.png',yearPick:'ALTA',yearConf:52,yearReason:'DAI $8B circulação. Sky Protocol. Meta $2.500–$4.500.'},
  {id:'stx', symbol:'STX', name:'Stacks',             price:0.638,  change24h:-2.1, bettvPick:'ALTA',   bettvConf:56, bettvReason:'Bitcoin DeFi ganha tração. sBTC lançado.', logo:'https://cryptologos.cc/logos/stacks-stx-logo.png',yearPick:'ALTA',yearConf:54,yearReason:'Bitcoin DeFi. sBTC lançado. Meta $2–$4.'},
  {id:'kas', symbol:'KAS', name:'Kaspa',              price:0.062,  change24h:-3.4, bettvPick:'ALTA',   bettvConf:55, bettvReason:'PoW mais rápido do mundo. Mineradores migrando do ETC.', logo:'https://cryptologos.cc/logos/kaspa-kas-logo.png',yearPick:'ALTA',yearConf:52,yearReason:'PoW mais rápido do mundo. Mineradores migrando. Meta $0,20–$0,45.'},
  {id:'blur',symbol:'BLUR',name:'Blur',               price:0.112,  change24h:-4.8, bettvPick:'QUEDA',   bettvConf:60, bettvReason:'BLUR -4.8%. Fraco volume NFT. Sem catalisador próximo.', logo:'https://cryptologos.cc/logos/blur-blur-logo.png',yearPick:'ALTA',yearConf:44,yearReason:'NFT marketplace em recuperação com bull. Meta $0,40–$1. Baixa confiança.'},
  {id:'wld', symbol:'WLD', name:'Worldcoin',          price:1.07,   change24h:-3.9, bettvPick:'QUEDA',  bettvConf:62, bettvReason:'WLD -3.9%. Pressão regulatória Europa continua.', logo:'https://cryptologos.cc/logos/worldcoin-wld-logo.png',yearPick:'QUEDA',yearConf:54,yearReason:'Risco regulatório Europa persistente. Pressão insiders. Meta $1–$2.'},
  {id:'atom',symbol:'ATOM',name:'Cosmos',             price:3.11,   change24h:-2.2, bettvPick:'NEUTRO', bettvConf:42, bettvReason:'IBC crescendo mas inflacionário. Sem catalisador.', logo:'https://cryptologos.cc/logos/cosmos-atom-logo.png',yearPick:'NEUTRO',yearConf:44,yearReason:'IBC crescendo mas inflação alta. Cosmos sem catalisador claro. Meta $4–$10.'},
  {id:'ltc', symbol:'LTC', name:'Litecoin',           price:57.8,   change24h:-1.6, bettvPick:'NEUTRO', bettvConf:41, bettvReason:'Segue BTC. Halving 2027 no radar.', logo:'https://cryptologos.cc/logos/litecoin-ltc-logo.png',yearPick:'ALTA',yearConf:46,yearReason:'Segue BTC no ciclo. Halving 2027 no radar. Meta $120–$220.'},
  {id:'fil', symbol:'FIL', name:'Filecoin',           price:2.38,   change24h:-2.4, bettvPick:'NEUTRO', bettvConf:43, bettvReason:'Armazenamento descentralizado sem catalisador. Lateral.', logo:'https://cryptologos.cc/logos/filecoin-fil-logo.png',yearPick:'NEUTRO',yearConf:42,yearReason:'Armazenamento descentralizado sem catalisador bull. Meta $3–$7.'},
  {id:'grt', symbol:'GRT', name:'The Graph',          price:0.101,  change24h:-2.9, bettvPick:'ALTA',   bettvConf:52, bettvReason:'Infraestrutura web3 crescendo com DeFi bull.', logo:'https://cryptologos.cc/logos/the-graph-grt-logo.png',yearPick:'ALTA',yearConf:52,yearReason:'Infraestrutura web3 essencial. Cresce com DeFi bull. Meta $0,35–$0,65.'},
  {id:'icp', symbol:'ICP', name:'Internet Computer',  price:6.21,   change24h:-2.7, bettvPick:'ALTA',   bettvConf:48, bettvReason:'Computação on-chain. Novos dApps lançados.', logo:'https://cryptologos.cc/logos/internet-computer-icp-logo.png',yearPick:'ALTA',yearConf:48,yearReason:'Computação on-chain. Novos dApps. Meta $15–$35.'},
  {id:'hbar',symbol:'HBAR',name:'Hedera',             price:0.0475,  change24h:-3.2, bettvPick:'ALTA',   bettvConf:47, bettvReason:'Governança enterprise IBM/Google. Tokenização RWA.', logo:'https://cryptologos.cc/logos/hedera-hbar-logo.png',yearPick:'ALTA',yearConf:50,yearReason:'RWA tokenização enterprise. IBM/Google. Meta $0,15–$0,35.'},
  {id:'egld',symbol:'EGLD',name:'MultiversX',         price:20.65,   change24h:-2.8, bettvPick:'ALTA',   bettvConf:50, bettvReason:'DeFi crescendo. xPortal app com 2M usuários.', logo:'https://cryptologos.cc/logos/elrond-egld-logo.png',yearPick:'ALTA',yearConf:50,yearReason:'xPortal 2M usuários. DeFi crescendo. Meta $60–$110.'},
  {id:'algo',symbol:'ALGO',name:'Algorand',           price:0.122,  change24h:-3.1, bettvPick:'NEUTRO', bettvConf:39, bettvReason:'Sem catalisador. Parcerias governamentais não movem preço.', logo:'https://cryptologos.cc/logos/algorand-algo-logo.png',yearPick:'NEUTRO',yearConf:40,yearReason:'Sem catalisador relevante. Parcerias gov não movem preço. Meta $0,15–$0,35.'},
  {id:'sand',symbol:'SAND',name:'The Sandbox',        price:0.216,  change24h:-3.6, bettvPick:'NEUTRO', bettvConf:38, bettvReason:'Metaverse perdeu hype. Gaming parceria aquece levemente.', logo:'https://cryptologos.cc/logos/the-sandbox-sand-logo.png',yearPick:'NEUTRO',yearConf:38,yearReason:'Metaverse hype baixo. Gaming parcerias fracas. Meta $0,30–$0,70.'},
  {id:'xlm', symbol:'XLM', name:'Stellar',            price:0.071,  change24h:-2.4, bettvPick:'NEUTRO', bettvConf:42, bettvReason:'Pagamentos internacionais estáveis. Sem catalisador.', logo:'https://cryptologos.cc/logos/stellar-xlm-logo.png',yearPick:'NEUTRO',yearConf:42,yearReason:'Pagamentos cross-border estáveis. Sem catalisador 2026. Meta $0,10–$0,22.'},
  {id:'crv', symbol:'CRV', name:'Curve',              price:0.258,  change24h:-2.2, bettvPick:'NEUTRO', bettvConf:44, bettvReason:'TVL estável $2.1B. Governança afasta especuladores.', logo:'https://cryptologos.cc/logos/curve-dao-token-crv-logo.png',yearPick:'NEUTRO',yearConf:44,yearReason:'TVL estável $2B+. Governança complexa afasta especuladores. Lateral.'},
  {id:'w',   symbol:'W',   name:'Wormhole',           price:0.145,  change24h:-4.1, bettvPick:'ALTA',   bettvConf:51, bettvReason:'Bridge: $50B+ volume. Adoção cross-chain crescendo.', logo:'https://cryptologos.cc/logos/wormhole-w-logo.png',yearPick:'ALTA',yearConf:52,yearReason:'Bridge cross-chain essencial. $50B+ volume. Meta $0,40–$1.'},
  {id:'zk',  symbol:'ZK',  name:'ZKsync',             price:0.071,  change24h:-3.8, bettvPick:'NEUTRO', bettvConf:45, bettvReason:'L2 promissor mas concorrência com Starknet.', logo:'https://cryptologos.cc/logos/zksync-zk-logo.png',yearPick:'ALTA',yearConf:48,yearReason:'L2 ZK promissor mas concorrência Starknet. Meta $0,20–$0,50.'},
  {id:'bch', symbol:'BCH', name:'Bitcoin Cash',       price:253.5,    change24h:-2.1, bettvPick:'ALTA',   bettvConf:48, bettvReason:'Segue BTC. Momentum pós-halving ainda presente.', logo:'https://cryptologos.cc/logos/bitcoin-cash-bch-logo.png',yearPick:'ALTA',yearConf:46,yearReason:'Segue BTC pós-halving. Meta $500–$900.'},
  {id:'etc', symbol:'ETC', name:'Ethereum Classic',   price:14.05,   change24h:-2.6, bettvPick:'NEUTRO', bettvConf:38, bettvReason:'Estável. Movimentos seguem ETH.', logo:'https://cryptologos.cc/logos/ethereum-classic-etc-logo.png',yearPick:'NEUTRO',yearConf:40,yearReason:'Segue ETH lateral. Sem catalisador. Meta $20–$40.'},
  {id:'pyth',symbol:'PYTH',name:'Pyth Network',       price:0.0428,  change24h:-1.04, bettvPick:'ALTA',   bettvConf:53, bettvReason:'Oráculo líder Solana. 200+ novos feeds adicionados.', logo:'https://cryptologos.cc/logos/pyth-network-pyth-logo.png',yearPick:'ALTA',yearConf:54,yearReason:'Oráculos Sol essenciais. 200+ feeds. Meta $0,70–$1,50.'},
  {id:'snx', symbol:'SNX', name:'Synthetix',          price:0.965,   change24h:-2.3, bettvPick:'NEUTRO', bettvConf:42, bettvReason:'Perp trading v3 no ar mas concorrência com GMX.', logo:'https://cryptologos.cc/logos/synthetix-network-token-snx-logo.png',yearPick:'NEUTRO',yearConf:44,yearReason:'Perp v3 ativo mas concorrência GMX/dYdX. Meta $1,50–$3.'},
  {id:'vet', symbol:'VET', name:'VeChain',            price:0.0212,  change24h:-1.9, bettvPick:'NEUTRO', bettvConf:40, bettvReason:'Supply chain blockchain com adoção empresarial.', logo:'https://cryptologos.cc/logos/vechain-vet-logo.png',yearPick:'NEUTRO',yearConf:42,yearReason:'Supply chain enterprise estável. Sem catalisador especulativo. Meta $0,04–$0,10.'},
  {id:'imx', symbol:'IMX', name:'Immutable X',        price:0.86,   change24h:-3.4, bettvPick:'ALTA',   bettvConf:51, bettvReason:'Gaming blockchain líder. Parceiros AAA crescendo.', logo:'https://cryptologos.cc/logos/immutable-x-imx-logo.png',yearPick:'ALTA',yearConf:54,yearReason:'Gaming blockchain líder. Parceiros AAA crescendo. Meta $2,50–$5.'},
]

// ─── MOEDAS DATA ──────────────────────────────────────────────────────────────
const MOEDAS_DATA = [
  {id:'usd', symbol:'USD', name:'Dólar Americano',    flag:'🇺🇸', priceBRL:5.3134,   change24h:1.85, bettvPick:'QUEDA',  bettvConf:55, bettvReason:'Fed mantém juros. Dados de emprego abaixo do esperado.',yearPick:'NEUTRO',yearConf:55,yearReason:'Consenso: USD/BRL entre R$5,10–R$5,60 em 2026. Fed em pausa; eleições BR criam volatilidade. Carry real atrativo.'},
  {id:'eur', symbol:'EUR', name:'Euro',               flag:'🇪🇺', priceBRL:6.163,   change24h:1.2, bettvPick:'ALTA',   bettvConf:52, bettvReason:'BCE sinalizou pausa nos cortes. Zona do euro cresce.',yearPick:'QUEDA',yearConf:62,yearReason:'SocGen: real supera euro em 2026. BRL subvalorizado, EUR sobrevalorizado. Meta R$5,74–R$6,10 (LongForecast -6%).'},
  {id:'gbp', symbol:'GBP', name:'Libra Esterlina',    flag:'🇬🇧', priceBRL:7.09,   change24h:0.8, bettvPick:'ALTA',   bettvConf:50, bettvReason:'BOE conservador. Inflação UK em queda.',yearPick:'NEUTRO',yearConf:48,yearReason:'GBP/BRL depende de BOE e fiscal BR. Volatilidade moderada. Meta R$6,60–R$7,30 no ano.'},
  {id:'jpy', symbol:'JPY', name:'Iene Japonês',       flag:'🇯🇵', priceBRL:0.03542,  change24h:-0.4, bettvPick:'QUEDA',  bettvConf:57, bettvReason:'BOJ ainda dovish. Diferencial de juros EUA-Japão.',yearPick:'QUEDA',yearConf:58,yearReason:'BOJ hawkish gradual mas diferencial juros ainda favorece queda do iene vs BRL. Meta 0,033–0,036.'},
  {id:'cny', symbol:'CNY', name:'Yuan Chinês',        flag:'🇨🇳', priceBRL:0.7311,  change24h:0.1, bettvPick:'NEUTRO', bettvConf:48, bettvReason:'PBOC gerencia valorização. Estímulos fiscais ativos.',yearPick:'NEUTRO',yearConf:52,yearReason:'PBOC gerencia banda. Tensão EUA-China e Copa do Mundo. CNY/BRL lateral R$0,70–0,76.'},
  {id:'chf', symbol:'CHF', name:'Franco Suíço',       flag:'🇨🇭', priceBRL:5.958,   change24h:0.3, bettvPick:'ALTA',   bettvConf:54, bettvReason:'SNB comprador de ouro. Franco seguro em risco global.',yearPick:'ALTA',yearConf:54,yearReason:'Franco suíço como porto seguro global. Geopolítica Oriente Médio apoia CHF. Meta R$5,80–R$6,20.'},
  {id:'cad', symbol:'CAD', name:'Dólar Canadense',    flag:'🇨🇦', priceBRL:3.905,   change24h:-0.2, bettvPick:'NEUTRO', bettvConf:46, bettvReason:'Petróleo WTI estável. BOC em pausa. CAD lateral.',yearPick:'QUEDA',yearConf:50,yearReason:'BOC corta juros. Petróleo volátil. Eleições EUA e tarifas afetam CAD. Meta R$3,60–R$4,00.'},
  {id:'aud', symbol:'AUD', name:'Dólar Australiano',  flag:'🇦🇺', priceBRL:3.337,   change24h:0.44, bettvPick:'ALTA',   bettvConf:53, bettvReason:'Commodities em alta. RBA corta menos que esperado.',yearPick:'ALTA',yearConf:52,yearReason:'Commodities altas (ferro, cobre) sustentam AUD. RBA menos dovish. Meta R$3,30–R$3,60.'},
  {id:'brl', symbol:'BRL', name:'Real Brasileiro',    flag:'🇧🇷', priceBRL:1.0,   change24h:-1.85, bettvPick:'QUEDA',  bettvConf:56, bettvReason:'Fiscal preocupa. Copom mantém Selic 14.75%.',yearPick:'QUEDA',yearConf:60,yearReason:'BRL perde vs moedas duras apesar do carry. Fiscal e eleições 2026 pesam. Selic cai gradualmente.'},
  {id:'mxn', symbol:'MXN', name:'Peso Mexicano',      flag:'🇲🇽', priceBRL:0.2688,  change24h:-0.8, bettvPick:'QUEDA',  bettvConf:55, bettvReason:'Nearshoring desacelera. Banxico corta juros.',yearPick:'QUEDA',yearConf:58,yearReason:'Nearshoring desacelera; Banxico corta juros; pressão tarifária EUA. MXN fraco vs BRL.'},
  {id:'ars', symbol:'ARS', name:'Peso Argentino',     flag:'🇦🇷', priceBRL:0.00541,  change24h:-1.2, bettvPick:'QUEDA',  bettvConf:72, bettvReason:'Argentina: inflação 180% a.a. Desvalorização estrutural.',yearPick:'QUEDA',yearConf:78,yearReason:'Milei: inflação cede mas dívida pesa. ARS perde valor estruturalmente em 2026. Alto risco.'},
  {id:'clp', symbol:'CLP', name:'Peso Chileno',       flag:'🇨🇱', priceBRL:0.00576,  change24h:-0.3, bettvPick:'NEUTRO', bettvConf:44, bettvReason:'Cobre estável. BCCh em corte gradual.',yearPick:'NEUTRO',yearConf:48,yearReason:'Cobre sustenta CLP mas incerteza política Chile. Meta R$0,0055–0,0062.'},
  {id:'krw', symbol:'KRW', name:'Won Coreano',        flag:'🇰🇷', priceBRL:0.003673,  change24h:-0.4, bettvPick:'NEUTRO', bettvConf:45, bettvReason:'Samsung e SK Hynix em recuperação. BOK cauteloso.',yearPick:'NEUTRO',yearConf:46,yearReason:'Samsung/SK Hynix em alta mas BOK cauteloso. KRW lateral vs BRL.'},
  {id:'inr', symbol:'INR', name:'Rúpia Indiana',      flag:'🇮🇳', priceBRL:0.06175,  change24h:-0.2, bettvPick:'QUEDA',  bettvConf:50, bettvReason:'RBI intervém mas pressão estrutural no déficit.',yearPick:'QUEDA',yearConf:52,yearReason:'RBI intervém mas déficit estrutural pressiona INR. Perde gradualmente vs BRL.'},
  {id:'sgd', symbol:'SGD', name:'Dólar de Singapura', flag:'🇸🇬', priceBRL:3.992,   change24h:0.2, bettvPick:'ALTA',   bettvConf:51, bettvReason:'MAS aprecia SGD. Economia de Singapura resiliente.',yearPick:'ALTA',yearConf:56,yearReason:'MAS aprecia SGD. Singapura resiliente. SGD é porto seguro asiático. Meta R$3,90–R$4,20.'},
  {id:'hkd', symbol:'HKD', name:'Dólar de Hong Kong', flag:'🇭🇰', priceBRL:0.6848,  change24h:1.85,  bettvPick:'NEUTRO', bettvConf:95, bettvReason:'HKD atrelado ao USD. Sem variação esperada.',yearPick:'NEUTRO',yearConf:95,yearReason:'HKD atrelado ao USD por currency board. Sem variação possível. Confiança máxima.'},
  {id:'sek', symbol:'SEK', name:'Coroa Sueca',        flag:'🇸🇪', priceBRL:0.5016,  change24h:0.4, bettvPick:'ALTA',   bettvConf:49, bettvReason:'Riksbank pausou cortes. Exportações em recuperação.',yearPick:'NEUTRO',yearConf:48,yearReason:'Riksbank em pausa. Exportações suecas razoáveis. SEK lateral vs BRL.'},
  {id:'nok', symbol:'NOK', name:'Coroa Norueguesa',   flag:'🇳🇴', priceBRL:0.4881,  change24h:0.3, bettvPick:'ALTA',   bettvConf:51, bettvReason:'Petróleo Brent apoia NOK. Norges Bank hawkish.',yearPick:'ALTA',yearConf:52,yearReason:'Petróleo Brent alto (conflito OM) apoia NOK. Norges Bank hawkish. Meta R$0,47–0,52.'},
  {id:'pln', symbol:'PLN', name:'Zloty Polonês',      flag:'🇵🇱', priceBRL:1.317,  change24h:0.5, bettvPick:'ALTA',   bettvConf:53, bettvReason:'Polônia cresce 3.1% no 1T26. NBP conservador.',yearPick:'ALTA',yearConf:54,yearReason:'Polônia cresce 3%+. NBP conservador. Entrada na UE favorece PLN. Meta R$1,25–R$1,40.'},
  {id:'try', symbol:'TRY', name:'Lira Turca',         flag:'🇹🇷', priceBRL:0.1429,  change24h:-1.3, bettvPick:'QUEDA',  bettvConf:70, bettvReason:'Turquia: inflação 40%+. TRY em desvalorização.',yearPick:'QUEDA',yearConf:74,yearReason:'Inflação 40%+. TCMB corta juros prematuramente. TRY desvaloriza estruturalmente. Alto risco.'},
  {id:'rub', symbol:'RUB', name:'Rublo Russo',        flag:'🇷🇺', priceBRL:0.058,  change24h:-0.9, bettvPick:'QUEDA',  bettvConf:66, bettvReason:'Sanções ocidentais e inflação persistente.',yearPick:'QUEDA',yearConf:70,yearReason:'Sanções + guerra. Risco de corte SWIFT ampliado. RUB em queda estrutural. Incerteza alta.'},
  {id:'zar', symbol:'ZAR', name:'Rand Sul-Africano',  flag:'🇿🇦', priceBRL:0.2906,  change24h:0.7, bettvPick:'ALTA',   bettvConf:50, bettvReason:'Ouro e platina valorizam. Estabilidade política.',yearPick:'ALTA',yearConf:50,yearReason:'Ouro e platina em máximas. Estabilidade política relativa. ZAR recupera vs BRL.'},
  {id:'thb', symbol:'THB', name:'Baht Tailandês',     flag:'🇹🇭', priceBRL:0.1579,  change24h:0.2, bettvPick:'NEUTRO', bettvConf:44, bettvReason:'BOT estável. Turismo tailandês em recuperação.',yearPick:'NEUTRO',yearConf:45,yearReason:'BOT estável. Turismo tailandês cresce. THB lateral sem catalisador forte.'},
  {id:'myr', symbol:'MYR', name:'Ringgit Malaio',     flag:'🇲🇾', priceBRL:1.206,  change24h:0.5, bettvPick:'ALTA',   bettvConf:51, bettvReason:'BNM hawkish. Exportações semicondutores em alta.',yearPick:'ALTA',yearConf:52,yearReason:'Semicondutores em boom. BNM hawkish. MYR ganha vs moedas EM. Meta R$1,18–R$1,28.'},
  {id:'aed', symbol:'AED', name:'Dirham dos EAU',     flag:'🇦🇪', priceBRL:1.447,  change24h:1.85, bettvPick:'NEUTRO', bettvConf:90, bettvReason:'AED atrelado ao USD. Dubai estável.',yearPick:'NEUTRO',yearConf:92,yearReason:'AED atrelado ao USD (peg fixo). Sem variação estrutural. Alta confiança.'},
  {id:'sar', symbol:'SAR', name:'Riyal Saudita',      flag:'🇸🇦', priceBRL:1.416,  change24h:1.85, bettvPick:'NEUTRO', bettvConf:88, bettvReason:'SAR atrelado ao USD. ARAMCO apoia reservas.',yearPick:'NEUTRO',yearConf:90,yearReason:'SAR atrelado ao USD. ARAMCO sustenta reservas. Alta confiança.'},
  {id:'ils', symbol:'ILS', name:'Shekel Israelense',  flag:'🇮🇱', priceBRL:1.447,   change24h:-0.4, bettvPick:'NEUTRO', bettvConf:46, bettvReason:'BOI intervém. Risco geopolítico mantém volatilidade.',yearPick:'NEUTRO',yearConf:44,yearReason:'BOI intervém. Conflito Oriente Médio cria volatilidade. ILS incerto em 2026.'},
  {id:'cop', symbol:'COP', name:'Peso Colombiano',    flag:'🇨🇴', priceBRL:0.001276,  change24h:-0.5, bettvPick:'QUEDA',  bettvConf:51, bettvReason:'Petróleo recua. BanRep corta juros.',yearPick:'QUEDA',yearConf:52,yearReason:'BanRep corta juros. Petróleo volátil. COP perde vs BRL ao longo do ano.'},
  {id:'pen', symbol:'PEN', name:'Sol Peruano',        flag:'🇵🇪', priceBRL:1.418,   change24h:0.1, bettvPick:'NEUTRO', bettvConf:43, bettvReason:'Peru: mineração estável. BCRP mantém juros.',yearPick:'NEUTRO',yearConf:46,yearReason:'Mineração sustenta PEN. BCRP estável. Sol lateral vs BRL.'},
  {id:'nzd', symbol:'NZD', name:'Dólar Neozelandês',  flag:'🇳🇿', priceBRL:3.072,   change24h:0.3, bettvPick:'ALTA',   bettvConf:48, bettvReason:'RBNZ pausou cortes. Exportações agro em recuperação.',yearPick:'ALTA',yearConf:50,yearReason:'RBNZ em pausa. Agro em alta. NZD ganha com China recuperando. Meta R$3,00–R$3,20.'},
  {id:'czk', symbol:'CZK', name:'Coroa Tcheca',       flag:'🇨🇿', priceBRL:0.2285,  change24h:0.3, bettvPick:'ALTA',   bettvConf:48, bettvReason:'CNB em pausa. Economia tcheca resiliente.',yearPick:'ALTA',yearConf:50,yearReason:'CNB em pausa. Tchéquia resiliente. CZK se valoriza vs EUR e BRL.'},
  {id:'huf', symbol:'HUF', name:'Forint Húngaro',     flag:'🇭🇺', priceBRL:0.01458,  change24h:-0.6, bettvPick:'QUEDA',  bettvConf:52, bettvReason:'MNB corta juros agressivamente. HUF volátil.',yearPick:'QUEDA',yearConf:54,yearReason:'MNB corta juros agressivo. HUF volátil. Pressão fiscal húngara.'},
  {id:'dkk', symbol:'DKK', name:'Coroa Dinamarquesa', flag:'🇩🇰', priceBRL:0.7758,  change24h:0.4, bettvPick:'ALTA',   bettvConf:50, bettvReason:'DKK atrelado ao EUR. Segue movimento europeu.',yearPick:'NEUTRO',yearConf:65,yearReason:'DKK atrelado ao EUR por peg. Segue EUR com pequena banda. Confiança alta.'},
  {id:'uah', symbol:'UAH', name:'Hryvnia Ucraniana',  flag:'🇺🇦', priceBRL:0.1284,  change24h:-0.6, bettvPick:'QUEDA',  bettvConf:65, bettvReason:'Ucrânia: guerra e instabilidade. UAH em queda.',yearPick:'QUEDA',yearConf:68,yearReason:'Guerra Ucrânia: NBU mantém câmbio mas reservas sob pressão. Queda estrutural.'},
  {id:'qar', symbol:'QAR', name:'Riyal Catarí',       flag:'🇶🇦', priceBRL:1.46,  change24h:1.85,  bettvPick:'NEUTRO', bettvConf:92, bettvReason:'QAR atrelado ao USD. Qatar apoia com fundo soberano.',yearPick:'NEUTRO',yearConf:92,yearReason:'QAR atrelado ao USD. Fundo soberano Qatar protege paridade. Alta confiança.'},
  {id:'idr', symbol:'IDR', name:'Rupia Indonésia',    flag:'🇮🇩', priceBRL:0.000327, change24h:-0.4, bettvPick:'NEUTRO', bettvConf:43, bettvReason:'BI intervém para estabilizar. Comodities sustentam.',yearPick:'NEUTRO',yearConf:46,yearReason:'BI intervém para estabilizar. Commodities sustentam. IDR lateral.'},
  {id:'php', symbol:'PHP', name:'Peso Filipino',      flag:'🇵🇭', priceBRL:0.09274,  change24h:-0.3, bettvPick:'NEUTRO', bettvConf:44, bettvReason:'BSP cortou juros. Remessas sustentam PHP.',yearPick:'NEUTRO',yearConf:46,yearReason:'BSP cortou juros. Remessas sustentam PHP. Lateral vs BRL.'},
  {id:'pkr', symbol:'PKR', name:'Rupia Paquistanesa', flag:'🇵🇰', priceBRL:0.01908,  change24h:-0.7, bettvPick:'QUEDA',  bettvConf:64, bettvReason:'Crise de dívida. FMI empresta mas PKR fraco.',yearPick:'QUEDA',yearConf:66,yearReason:'Crise dívida paquistanesa. FMI emprestando. PKR fraco estruturalmente.'},
  {id:'egp', symbol:'EGP', name:'Libra Egípcia',      flag:'🇪🇬', priceBRL:0.10624,  change24h:-0.5, bettvPick:'QUEDA',  bettvConf:60, bettvReason:'CBE corta juros mas inflação persiste.',yearPick:'QUEDA',yearConf:62,yearReason:'CBE corta juros mas inflação persiste. EGP perde valor. Incerteza política.'},
  {id:'ngn', symbol:'NGN', name:'Naira Nigeriana',    flag:'🇳🇬', priceBRL:0.003396,  change24h:-1.0, bettvPick:'QUEDA',  bettvConf:68, bettvReason:'Nigéria: escassez de dólares. Inflação 28%.',yearPick:'QUEDA',yearConf:72,yearReason:'Nigéria: escassez dólares + inflação 28%. CBN intervenções insuficientes.'},
  {id:'kwd', symbol:'KWD', name:'Dinar Kuwaitiano',   flag:'🇰🇼', priceBRL:17.32,  change24h:1.85, bettvPick:'NEUTRO', bettvConf:85, bettvReason:'KWD mais valorizada do mundo. Atrelada ao cesto.',yearPick:'NEUTRO',yearConf:88,yearReason:'KWD mais valorizada do mundo. Cesto controlado. Petróleo sustenta. Alta confiança.'},
  {id:'twd', symbol:'TWD', name:'Dólar de Taiwan',    flag:'🇹🇼', priceBRL:0.16464,  change24h:0.3, bettvPick:'ALTA',   bettvConf:52, bettvReason:'TSMC exportações recordes. Tensão China monitorada.',yearPick:'ALTA',yearConf:54,yearReason:'TSMC exportações recordes. Tensão China-Taiwan monitorada mas TWD ganha.'},
  {id:'bdt', symbol:'BDT', name:'Taka Bangladeshi',   flag:'🇧🇩', priceBRL:0.04845,  change24h:-0.4, bettvPick:'NEUTRO', bettvConf:42, bettvReason:'Bangladesh: exportações têxteis estáveis.',yearPick:'NEUTRO',yearConf:44,yearReason:'Bangladesh: têxteis estáveis. BDT lateral sem catalisador relevante.'},
  {id:'kes', symbol:'KES', name:'Shilling Queniano',  flag:'🇰🇪', priceBRL:0.04121,  change24h:0.3, bettvPick:'NEUTRO', bettvConf:45, bettvReason:'Quênia: inflação em queda. KES em recuperação.',yearPick:'NEUTRO',yearConf:46,yearReason:'Inflação Quênia caindo. KES em leve recuperação vs BRL.'},
  {id:'jod', symbol:'JOD', name:'Dinar Jordaniano',   flag:'🇯🇴', priceBRL:7.506,   change24h:1.85,  bettvPick:'NEUTRO', bettvConf:88, bettvReason:'JOD atrelado ao USD. CBJ defende paridade.',yearPick:'NEUTRO',yearConf:88,yearReason:'JOD atrelado ao USD. CBJ defende paridade há décadas. Alta confiança.'},
  {id:'omr', symbol:'OMR', name:'Rial Omanense',      flag:'🇴🇲', priceBRL:13.816,  change24h:1.85, bettvPick:'NEUTRO', bettvConf:85, bettvReason:'OMR atrelado ao USD. Petróleo sustenta reservas.',yearPick:'NEUTRO',yearConf:88,yearReason:'OMR atrelado ao USD. Petróleo sustenta reservas Omã. Alta confiança.'},
  {id:'bam', symbol:'BAM', name:'Marco Bósnio',       flag:'🇧🇦', priceBRL:3.153,   change24h:0.4, bettvPick:'ALTA',   bettvConf:49, bettvReason:'BAM atrelado ao EUR. Segue valorização europeia.',yearPick:'NEUTRO',yearConf:62,yearReason:'BAM atrelado ao EUR por currency board. Segue EUR. Confiança moderada-alta.'},
  {id:'vnd', symbol:'VND', name:'Dong Vietnamita',    flag:'🇻🇳', priceBRL:0.0002113, change24h:0.0,  bettvPick:'NEUTRO', bettvConf:80, bettvReason:'SBV gerencia câmbio. VND quasi-fixo ao USD.',yearPick:'NEUTRO',yearConf:80,yearReason:'SBV gerencia câmbio. VND quasi-fixo ao USD. Sem variação esperada.'},
  {id:'myr2',symbol:'SGD', name:'Dólar de Singapura 2',flag:'🇸🇬',priceBRL:3.992,   change24h:0.2, bettvPick:'ALTA',   bettvConf:51, bettvReason:'MAS aprecia SGD. Economia resiliente.',yearPick:'ALTA',yearConf:56,yearReason:'SGD (2): MAS aprecia. Economia Singapura resiliente. Meta R$3,90–R$4,20.'},
]


// ─── ELEIÇÕES 2026 ───────────────────────────────────────────────────────────
// Fontes: Datafolha 07/03, Quaest 11/03, Meio/Ideia 11/03, Futura 11/03
// Todos registrados no TSE — margem de erro ±2pp, nível confiança 95%

const ELEICOES_DATA = [

  // ── CARD 1: CENÁRIO GERAL — Quem vai ao 2º turno ──
  {
    id:'el-cenario',
    tipo:'cenario',
    titulo:'Cenário Geral — 1º Turno',
    subtitulo:'Consenso Datafolha + Quaest + Meio/Ideia · Mar/2026',
    bettvPick:'2º Turno: Lula × Flávio',
    bettvConf:62,
    bettvReason:'Todas as pesquisas apontam disputa entre Lula (PT) e Flávio Bolsonaro (PL). Campo da direita fragmentado favorece chegada dos dois ao 2º turno.',
    candidatos:[
      {nome:'Lula (PT)',          pct:39, tendencia:'queda',  cor:'#E53935', partido:'PT',          cargo:'Presidente — candidato à reeleição'},
      {nome:'Flávio Bolsonaro',   pct:34, tendencia:'alta',   cor:'#1565C0', partido:'PL',          cargo:'Senador-RJ — filho de Jair Bolsonaro'},
      {nome:'Tarcísio de Freitas',pct:21, tendencia:'estavel',cor:'#2E7D32', partido:'Republicanos',cargo:'Gov. São Paulo'},
      {nome:'Ratinho Junior',     pct:7,  tendencia:'estavel',cor:'#F57F17', partido:'PSD',         cargo:'Gov. Paraná'},
      {nome:'Romeu Zema',         pct:3,  tendencia:'estavel',cor:'#37474F', partido:'Novo',        cargo:'Gov. Minas Gerais'},
      {nome:'Outros/Indecisos',   pct:16, tendencia:'estavel',cor:'#9E9E9E', partido:'—',           cargo:'Brancos, nulos, indecisos'},
    ],
    fonte:'Datafolha (07/03) + Quaest (11/03) · ±2pp · 95% confiança',
  },

  // ── CARD 2: DISPUTA PRINCIPAL — Lula vs Flávio ──
  {
    id:'el-lula-flavio',
    tipo:'duelo',
    titulo:'Lula × Flávio — 1º Turno',
    subtitulo:'Cenário principal consolidado em todas as pesquisas',
    bettvPick:'2º Turno garantido',
    bettvConf:75,
    bettvReason:'Lula 39% × Flávio 34% no Datafolha. Quaest mostra empate técnico 35% × 32%. Campo da direita unificado em Flávio após inelegibilidade de Jair.',
    c1:{nome:'Lula (PT)',        pct:39, cor:'#E53935', desc:'Reeleição · Presidente em exercício'},
    c2:{nome:'Flávio Bolsonaro', pct:34, cor:'#1565C0', desc:'Principal rival · Senador-RJ'},
    rejeicao1:44, rejeicao2:35,
    obs:'Jair Bolsonaro inelegível até 2030 — TSE BR-03715/2026',
    fonte:'Datafolha 07/03/2026 — 2.004 entrevistados, 137 municípios',
  },

  // ── CARD 3: SEGUNDO TURNO — Simulação Lula × Flávio ──
  {
    id:'el-2turno',
    tipo:'duelo',
    titulo:'2º Turno — Lula × Flávio',
    subtitulo:'Empate técnico histórico · Disputa mais acirrada desde 2022',
    bettvPick:'Empate técnico — Lula leve favorito',
    bettvConf:52,
    bettvReason:'Quaest: 41% × 41% — empate exato. Datafolha: 46% × 43%. Lula em queda (era 45%→41%), Flávio em alta (era 38%→41%). Tendência favorece Flávio.',
    c1:{nome:'Lula (PT)',        pct:46, cor:'#E53935', desc:'Em queda: era 51% (dez/25) → 46%'},
    c2:{nome:'Flávio Bolsonaro', pct:43, cor:'#1565C0', desc:'Em alta: era 36% (dez/25) → 43%'},
    rejeicao1:44, rejeicao2:35,
    obs:'Quaest (11/03): empate em 41%×41%. Datafolha (07/03): 46%×43%. ±2pp.',
    fonte:'Quaest 11/03 + Datafolha 07/03/2026',
  },

  // ── CARD 4: TARCÍSIO — o nome do centro-direita ──
  {
    id:'el-tarcisio',
    tipo:'candidato',
    titulo:'Tarcísio de Freitas',
    subtitulo:'Gov. São Paulo · Republicanos — Candidatura incerta',
    bettvPick:'Não candidato em 2026',
    bettvConf:58,
    bettvReason:'Tarcísio declarou apoio a Flávio Bolsonaro. Se candidato: 1º turno 21% (Datafolha), empataria 2º turno com Lula (Quaest 43%×43%). Forte em SP e Sul.',
    pct1turno:21,
    pct2turno:43,
    tendencia:'estavel',
    rejeicao:11,
    pontos:['Gov. SP com aprovação acima de 55%','Forte no Sul e interior paulista','Apoio à candidatura de Flávio no momento','Poderia mudar estratégia até mai/2026'],
    fonte:'Datafolha 07/03 + Quaest dez/2025',
  },

  // ── CARD 5: APROVAÇÃO LULA ──
  {
    id:'el-aprovacao',
    tipo:'aprovacao',
    titulo:'Aprovação do Governo Lula',
    subtitulo:'Barómetro mensal — Quaest/Datafolha · Mar/2026',
    bettvPick:'Aprovação em queda',
    bettvConf:68,
    bettvReason:'57% dos brasileiros consideram que Lula não deveria se candidatar à reeleição (Ipsos dez/25). Aprovação pressionada por fiscal e Selic alta.',
    aprovacao:42,
    reprovacao:38,
    regular:20,
    naoDeveCandidatar:57,
    obs:'44% rejeição total (não votaria de jeito nenhum) — maior que qualquer adversário',
    fonte:'Quaest + Ipsos · Mar/2026',
  },

  // ── CARD 6: CALENDÁRIO ELEITORAL ──
  {
    id:'el-calendario',
    tipo:'calendario',
    titulo:'Calendário Eleitoral 2026',
    subtitulo:'TSE — Datas oficiais confirmadas',
    bettvPick:'1º Turno: 04/out/2026',
    bettvConf:99,
    bettvReason:'Datas definidas pelo TSE. 1º turno em 4 de outubro, 2º turno (se necessário) em 25 de outubro de 2026.',
    eventos:[
      {data:'Abr/2026', evento:'Prazo final para filiação partidária', tipo:'prazo'},
      {data:'Mai/2026', evento:'Definição de candidaturas pelos partidos', tipo:'prazo'},
      {data:'Jun/2026', evento:'Início do período eleitoral oficial (TSE)', tipo:'marco'},
      {data:'Ago/2026', evento:'Início da propaganda eleitoral gratuita', tipo:'marco'},
      {data:'04 Out 2026', evento:'1º Turno — Eleição Presidencial', tipo:'eleicao'},
      {data:'25 Out 2026', evento:'2º Turno (se necessário)', tipo:'eleicao'},
      {data:'01 Jan 2027', evento:'Posse do novo presidente', tipo:'posse'},
    ],
    fonte:'TSE — Calendário oficial 2026',
  },,

  // ── CARD 7: Lula × Tarcísio — 2º Turno ──
  {
    id:'el-tarcisio-2t',
    tipo:'duelo',
    titulo:'2º Turno — Lula × Tarcísio',
    subtitulo:'Empate técnico — AtlasIntel/Paraná Pesquisas',
    bettvPick:'Empate técnico — alta incerteza',
    bettvConf:46,
    bettvReason:'AtlasIntel jan/26: 49% × 45%. Paraná Pesquisas dez/25: empate técnico. Tendência: distância caindo. Tarcísio apoiou Flávio mas pode mudar.',
    c1:{nome:'Lula (PT)',           pct:49, cor:'#E53935', desc:'Em queda de aprovação. Rejeição 44%.'},
    c2:{nome:'Tarcísio de Freitas', pct:45, cor:'#2E7D32', desc:'Gov. SP · Forte no Sul/SE. Candidatura incerta.'},
    rejeicao1:44, rejeicao2:11,
    obs:'Tarcísio declarou apoio a Flávio, mas pode reverter até mai/2026',
    fonte:'AtlasIntel jan/26 + Paraná Pesquisas dez/25 · ±2pp',
  },

  // ── CARD 8: Lula × Michelle — 2º Turno ──
  {
    id:'el-michelle-2t',
    tipo:'duelo',
    titulo:'2º Turno — Lula × Michelle',
    subtitulo:'Lula favorito — AtlasIntel/Quaest',
    bettvPick:'Lula vence',
    bettvConf:55,
    bettvReason:'AtlasIntel jan/26: 49% × 45%. Quaest dez/25: Lula 47% × Michelle 34%. Maior margem que vs Flávio. Michelle não declarou candidatura.',
    c1:{nome:'Lula (PT)',         pct:49, cor:'#E53935', desc:'Favorito. Margem maior que vs Flávio.'},
    c2:{nome:'Michelle Bolsonaro',pct:45, cor:'#9C27B0', desc:'PL · Ex-primeira dama. Não declarou candidatura.'},
    rejeicao1:44, rejeicao2:30,
    obs:'Quaest dez/25: Lula 47% × Michelle 34% (+13pp). Mais folgado que 2º turno vs Flávio.',
    fonte:'AtlasIntel jan/26 + Quaest dez/25 · ±1-2pp',
  },

  // ── CARD 9: Lula × Ratinho Junior — 2º Turno ──
  {
    id:'el-ratinho-2t',
    tipo:'duelo',
    titulo:'2º Turno — Lula × Ratinho Jr.',
    subtitulo:'Empate técnico — Real Time Big Data mar/2026',
    bettvPick:'Empate técnico',
    bettvConf:48,
    bettvReason:'Real Time Big Data mar/26: Lula 42% × Ratinho 41% — empate na margem. Quaest: Lula 44% × Ratinho 34%. PSD ainda avalia candidatura.',
    c1:{nome:'Lula (PT)',      pct:42, cor:'#E53935', desc:'Caiu de 45% vs Ratinho em jan/26.'},
    c2:{nome:'Ratinho Junior', pct:41, cor:'#FF6F00', desc:'PSD · Gov. Paraná. Entre os mais competitivos.'},
    rejeicao1:44, rejeicao2:13,
    obs:'Quaest mar/26: 1º turno — Lula 37% × Flávio 30% × Ratinho 7% (Lula líder fora da margem)',
    fonte:'Real Time Big Data 03/03/2026 — TSE BR-09353/2026',
  },

  // ── CARD 10: Cenário alternativo — PSD fragmenta direita ──
  {
    id:'el-caiado',
    tipo:'duelo',
    titulo:'1º Turno — Cenário com PSD (Caiado)',
    subtitulo:'Quaest mar/2026 — único cenário em que Lula lidera fora da margem',
    bettvPick:'Lula lidera com folga',
    bettvConf:66,
    bettvReason:'Quaest mar/26: Lula 39% × Flávio 32% × Caiado 4% × Zema 2%. Quando PSD lança candidato próprio, campo da direita fragmenta e Lula abre vantagem.',
    c1:{nome:'Lula (PT)',            pct:39, cor:'#E53935', desc:'Único cenário fora da margem de erro.'},
    c2:{nome:'Flávio Bolsonaro (PL)', pct:32, cor:'#1565C0', desc:'Perde 2pp com entrada do PSD no páreo.'},
    rejeicao1:44, rejeicao2:35,
    obs:'Caiado 4% + Zema 2% fragmentam direita — beneficia Lula no 1º turno',
    fonte:'Quaest Genial 11/03/2026 — TSE BR-05809/2026',
  }
]


const TABS = [
  { key:'todos',    label:'Todos'     },
  { key:'loterias', label:'Loterias'  },
  { key:'futebol',  label:'Futebol'   },
  { key:'basquete', label:'Basquete'  },
  { key:'mma',      label:'MMA / UFC' },
  { key:'tenis',    label:'Tênis'     },
  { key:'golf',     label:'Golf'      },
  { key:'crypto',   label:'Crypto'    },
  { key:'moedas',   label:'Câmbio'    },
]

const INTERVAL = 2*60*60*1000

// ─── TOP REFERENCE SITES BY CATEGORY ─────────────────────────────────────────
const TOP_SITES = {
  futebol:  'ESPN.com, BBC Sport, Sky Sports, FlashScore, SofaScore, LiveScore, 90min, Goal.com, GE.Globo.com, UOL Esporte, Transfermarkt, FBref, WhoScored, Premier League oficial, La Liga oficial, UEFA Champions League oficial, CBF.com.br, Gazeta Esportiva, Lance.com.br, Trivela.com.br',
  basquete: 'NBA.com, ESPN.com, CBS Sports, Basketball Reference, HoopsHype, RealGM, Bleacher Report NBA, SportRadar, Rotowire NBA, Yahoo Sports NBA, NBAStats.com, ClutchPoints, The Athletic NBA, HoopsRumors, EuroLeague oficial, NBB oficial, BasqueteComPaixao',
  mma:      'UFC.com, ESPN MMA, CBS Sports MMA, MMAJunkie, Sherdog, BloodyElbow, MMAFighting, MMAWeekly, Tapology, BestFightOdds, Sherdog Forums, MMA Mania, FightMatrix, MMA Decisions, MMANytt',
  tenis:    'ATPTour.com, WTATennis.com, TennisAbstract, Ultimate Tennis Statistics, TennisTemple, FlashScore Tennis, ESPN Tennis, Tennis Now, TENNIS.com, TennisWorld, Ubitennis, TennisMajors, TennisHead, LiveTennis, Tennis365',
  esports:  'Liquipedia.net, HLTV.org, Vlr.gg, LoLEsports oficial, ESL Gaming, FACEIT, Gosugamers, Dot Esports, The Esports Observer, SportBible Esports, RedBull Gaming, Esports Charts, CBLoL oficial (placar.lol), Abios, PandaScore',
  golf:     'PGATour.com, OWGR.com (ranking mundial), GolfChannel, Golf Digest, Golf Magazine, ESPN Golf, CBSSports Golf, Masters.com, Golfweek, GolfDataTech, DataGolf, European Tour (DPWT), R&A Golf, USGA.org, GolfStats',
  crypto:   'CoinGecko, CoinMarketCap, TradingView, CryptoCompare, Messari, Glassnode, IntoTheBlock, Santiment, DeFiLlama, The Block, CoinDesk, Decrypt, Cointelegraph, CryptoPanic, Kaiko',
  moedas:   'Investing.com, XE.com, Forex Factory, DailyFX, Bloomberg FX, Reuters FX, TradingView Forex, OANDA, FXStreet, Banco Central do Brasil (bcb.gov.br), CMC Markets, IG Forex, Myfxbook, ForexLive, Exness',
  loterias: 'Caixa.gov.br (loterias.caixa.gov.br), LotoClic, LottoNumbers.com, Loteria Online, Resultado.net, Loterias e Apostas, DiaDesorte.com, LotoFacil.net, Quina.org, MegaSena.com',
}

// ─── PROMPTS DE BUSCA (top sites + instruções precisas) ──────────────────────
const CATEGORY_SEARCH_PROMPTS = {
  futebol: (now) => `Data/hora UTC: ${now}.
Consulte os seguintes sites de referência: ${TOP_SITES.futebol}
PASSO 1: Pesquise "Brasileirão Série A rodada jogos" para obter jogos do Brasileirão desta rodada e próxima.
PASSO 2: Pesquise "Premier League fixtures this week" para obter jogos da PL.
PASSO 3: Pesquise "La Liga fixtures this week" e "Champions League fixtures" para mais jogos.
PASSO 4: Pesquise "MLS schedule this week" para jogos da MLS.
Retorne o MÁXIMO de partidas (mínimo 10, máximo 14, ao vivo primeiro).
Retorne SOMENTE JSON array:
[{"id":"f-SLUG","title":"Time A × Time B","competition":"Competição · Rodada/Fase","startTime":"ISO8601_EXATO","statusLabel":"DD/MM · HHhBRT · Estádio","bettvPick":"Time A|Time B|Empate","bettvConf":55,"bettvReason":"odds/prob real. máx 110 chars","home":{"name":"Time A","logo":null,"sub":"pos · pts · prob%","pct":55},"away":{"name":"Time B","logo":null,"sub":"pos · pts · prob%","pct":25},"draw":20}]`,

  basquete: (now) => `Data/hora UTC: ${now}.
Consulte: ${TOP_SITES.basquete}
PASSO 1: Pesquise "NBA schedule today" e "NBA schedule this week" para obter TODOS os jogos de hoje e desta semana.
PASSO 2: Pesquise "NBA scores today" para jogos ao vivo e resultados recentes.
PASSO 3: Para cada jogo encontrado, busque as probabilidades de vitória reais.
Retorne o MÁXIMO de jogos possível (mínimo 8, máximo 12). NÃO pare no primeiro resultado.
Retorne SOMENTE JSON array:
[{"id":"b-SLUG","title":"Time A × Time B","competition":"NBA · Temp. Regular","startTime":"ISO8601","statusLabel":"AO VIVO·Q2·Arena|DD/MM·HHhBRT·Arena","bettvPick":"Time","bettvConf":65,"bettvReason":"prob%+contexto real. máx 110 chars","home":{"name":"Time A","logo":null,"sub":"conf·pos·record","pct":65},"away":{"name":"Time B","logo":null,"sub":"conf·pos·record","pct":30},"draw":5}]`,

  mma: (now) => `Data/hora UTC: ${now}.
Consulte: ${TOP_SITES.mma}
Pesquise todos os próximos eventos UFC confirmados (próximos 90 dias).
Para cada evento, obtenha: local, card completo (main + co-main + card principal), records dos lutadores, rankings oficiais UFC.
Retorne SOMENTE JSON array (máximo 8 lutas, main events + co-mains):
[{"id":"m-SLUG","title":"Lutador A × Lutador B","competition":"UFC Evento · Tipo de Luta","startTime":"ISO8601","statusLabel":"DD/MM·HHhBRT·Local","bettvPick":"Lutador","bettvConf":58,"bettvReason":"record real+ranking+análise. máx 110 chars","home":{"name":"Lutador A","logo":null,"sub":"record·ranking","pct":58},"away":{"name":"Lutador B","logo":null,"sub":"record·ranking","pct":32},"draw":10}]`,

  tenis: (now) => `Data/hora UTC: ${now}.
Consulte: ${TOP_SITES.tenis}
Pesquise partidas de tênis AO VIVO agora (score atual + set) e FUTURAS (próximos 45 dias):
Miami Open ATP/WTA (schedule oficial atptour.com), Madrid Open (se iniciado), Roland Garros.
Obtenha rankings oficiais ATP/WTA, H2H recente, superfície.
Retorne SOMENTE JSON array (máximo 10 partidas):
[{"id":"t-SLUG","title":"Jogador A × Jogador B","competition":"Torneio·Rodada","startTime":"ISO8601","statusLabel":"AO VIVO·Set 2·2-1|DD/MM·HHhBRT","bettvPick":"Jogador","bettvConf":68,"bettvReason":"ranking+h2h+superfície. máx 110 chars","home":{"name":"Jogador A","logo":null,"sub":"Nº ranking ATP/WTA","pct":68},"away":{"name":"Jogador B","logo":null,"sub":"Nº ranking","pct":25},"draw":7}]`,

  esports: (now) => `Data/hora UTC: ${now}.
Consulte: ${TOP_SITES.esports}
Pesquise partidas de e-sports AO VIVO e FUTURAS (próximos 60 dias):
CBLOL 2026 (placar.lol, liquipedia), LCK Spring 2026 (lolesports.com), CS2 Major/RMR, VCT Americas.
Obtenha: schedules oficiais, resultados recentes, posição na tabela.
Retorne SOMENTE JSON array (máximo 8 partidas verificadas):
[{"id":"e-SLUG","title":"Time A × Time B","competition":"Liga·Fase·Rodada","startTime":"ISO8601","statusLabel":"DD/MM·HHhBRT·Local","bettvPick":"Time","bettvConf":58,"bettvReason":"posição+h2h+contexto. máx 110 chars","home":{"name":"Time A","logo":null,"sub":"posição·record","pct":58},"away":{"name":"Time B","logo":null,"sub":"posição·record","pct":32},"draw":10}]`,

  golf: (now) => `Data/hora UTC: ${now}.
Consulte: ${TOP_SITES.golf}
Pesquise torneios PGA Tour EM ANDAMENTO agora (leaderboard ao vivo + líder + score) e FUTUROS (próximos 60 dias).
Obtenha: leaderboard atual para torneios em andamento, datas confirmadas PGA Tour, ranking mundial OWGR dos jogadores.
Retorne SOMENTE JSON array (máximo 8 torneios):
[{"id":"g-SLUG","multiDay":true,"title":"Nome do Torneio Ano","competition":"PGA Tour · Torneio","startTime":"ISO8601_R1","statusLabel":"EM ANDAMENTO·R3·Local|DD/MM·Local","bettvPick":"Jogador favorito","bettvConf":38,"bettvReason":"ranking mundial+histórico+campo. máx 110 chars","home":{"name":"Favorito 1","logo":null,"sub":"Nº mundial·motivo","pct":30},"away":{"name":"Favorito 2","logo":null,"sub":"Nº mundial","pct":22},"draw":48}]`,

  loterias: (now) => `Data/hora UTC: ${now}.
Consulte: ${TOP_SITES.loterias}
Busque os últimos resultados de cada loteria da Caixa e analise frequência histórica dos números.
Retorne SOMENTE JSON array (6 loterias):
[{"id":"mega","guruNums":[6 nums 1-60],"guruConf":18,"guruAnalise":"análise de frequência máx 120 chars"},{"id":"lotofacil","guruNums":[15 nums 1-25],"guruConf":34,"guruAnalise":"..."},{"id":"quina","guruNums":[5 nums 1-80],"guruConf":22,"guruAnalise":"..."},{"id":"timemania","guruNums":[7 nums 1-80],"guruConf":12,"guruAnalise":"..."},{"id":"duplasena","guruNums":[6 nums 1-50],"guruConf":15,"guruAnalise":"..."},{"id":"diadesorte","guruNums":[7 nums 1-31],"guruConf":14,"guruAnalise":"..."}]`,

  crypto: (now) => `Data/hora UTC: ${now}.
Consulte: ${TOP_SITES.crypto}
Busque preços, variação 24h, volume, dominância e sentimento de mercado atuais para as principais criptomoedas.
Analise tendências de curto prazo (fear/greed index, on-chain data, notícias relevantes).
Retorne SOMENTE JSON array (todos os 50 itens com dados atualizados):
[{"id":"btc","bettvPick":"ALTA|QUEDA|NEUTRO","bettvConf":65,"bettvReason":"tendência 24h. máx 110 chars","change24h":2.3,"price":87000,"yearPick":"ALTA|QUEDA|NEUTRO","yearConf":60,"yearReason":"análise anual 2026: ciclos, halvings, adoção. máx 110 chars"}]`,

  moedas: (now) => `Data/hora UTC: ${now}.
Consulte: ${TOP_SITES.moedas}
Busque taxas de câmbio atuais e análise de curto prazo para as principais moedas vs BRL/USD.
Considere: decisões de bancos centrais, dados econômicos recentes, fluxo de capitais.
Retorne SOMENTE JSON array (todos os 50 itens com dados atualizados):
[{"id":"usd","bettvPick":"ALTA|QUEDA|NEUTRO","bettvConf":55,"bettvReason":"tendência 24h vs BRL. máx 110 chars","change24h":-0.3,"priceBRL":5.12,"yearPick":"ALTA|QUEDA|NEUTRO","yearConf":55,"yearReason":"análise anual 2026: política monetária, macro, balanço. máx 110 chars"}]`,
}

// ═══════════════════════════════════════════════════════════════════════════════
// BETTV INTELLIGENCE ENGINE v3 — Multi-search, real-time, self-validating
// ═══════════════════════════════════════════════════════════════════════════════

// ─── CORE API CALL — handles full tool_use loop ───────────────────────────────
async function apiCall(system, messages, maxTurns=8) {
  const tools = [{type:'web_search_20250305', name:'web_search'}]
  let msgs = [...messages]

  for (let turn=0; turn<maxTurns; turn++) {
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
        max_tokens: 16000,
        system,
        tools,
        messages: msgs,
      }),
    })

    if (!res.ok) {
      const err = await res.text().catch(()=>'')
      throw new Error(`API ${res.status}: ${err.slice(0,120)}`)
    }

    const json = await res.json()

    // Collect ALL text blocks — web_search server-side produces multiple
    const textBlocks = (json.content||[]).filter(b => b.type === 'text').map(b => b.text).filter(Boolean)

    // Server-side web_search: stop_reason is 'end_turn', JSON is in the LAST text block
    if (json.stop_reason === 'end_turn' && textBlocks.length) {
      return textBlocks[textBlocks.length - 1]
    }

    // Client-side tool_use — feed results back and continue
    if (json.stop_reason === 'tool_use') {
      const toolUses = (json.content||[]).filter(b => b.type === 'tool_use')
      if (!toolUses.length) break

      const toolResults = toolUses.map(tu => ({
        type: 'tool_result',
        tool_use_id: tu.id,
        content: 'Resultados obtidos com sucesso. Continue pesquisando se necessário, ou compile o JSON final.',
      }))

      msgs = [
        ...msgs,
        { role: 'assistant', content: json.content },
        { role: 'user',      content: toolResults  },
      ]
    } else {
      if (textBlocks.length) return textBlocks[textBlocks.length - 1]
      break
    }
  }
  return null
}

// ─── FETCH CATEGORY DATA — busca dados reais com múltiplas pesquisas ──────────
async function fetchCategory(category) {
  const nowISO = new Date().toISOString()
  const nowBRT = new Date().toLocaleString('pt-BR', {timeZone:'America/Sao_Paulo'})
  const year   = new Date().getFullYear()

  const system = [
    `Você é o motor de dados em tempo real do BetTv. Hoje: ${nowBRT} (UTC: ${nowISO}).`,
    `Sites de referência para ${category}: ${TOP_SITES[category]||'fontes confiáveis da internet'}`,
    'REGRAS ABSOLUTAS:',
    '1. Faça MÚLTIPLAS buscas para encontrar o MÁXIMO de eventos possível.',
    '2. NUNCA invente preços, resultados, datas ou estatísticas.',
    '3. Responda SOMENTE com JSON array válido — zero markdown, zero texto extra, zero explicações.',
    '4. Se um dado não for confirmado por fonte confiável, não o inclua.',
    '5. Retorne o MÁXIMO de eventos que encontrar, não pare no primeiro resultado.',
  ].join('\n')

  const prompt = CATEGORY_SEARCH_PROMPTS[category]?.(nowISO, year)
  if (!prompt) return null

  const txt = await apiCall(system, [{role:'user', content:prompt}])
  if (!txt) return null

  // Robust JSON extraction: find JSON array/object anywhere in text
  let clean = txt.replace(/```json\s*/gi,'').replace(/```\s*/g,'').trim()
  const arrStart = clean.indexOf('[')
  const objStart = clean.indexOf('{')
  if (arrStart === -1 && objStart === -1) return null
  const start = arrStart !== -1 && (objStart === -1 || arrStart < objStart) ? arrStart : objStart
  clean = clean.slice(start)
  const openChar = clean[0], closeChar = openChar === '[' ? ']' : '}'
  let depth = 0, end = -1
  for (let i = 0; i < clean.length; i++) {
    if (clean[i] === openChar) depth++
    else if (clean[i] === closeChar) { depth--; if (depth === 0) { end = i; break } }
  }
  if (end === -1) return null
  clean = clean.slice(0, end + 1)

  try {
    const parsed = JSON.parse(clean)
    return Array.isArray(parsed) ? parsed : (parsed ? [parsed] : null)
  } catch(e) {
    console.warn(`[BetTv] JSON parse failed for ${category}:`, e.message)
    return null
  }
}

// ─── VALIDATE PREDICTIONS — verifica resultados passados ──────────────────────
async function validatePredictions(items, category) {
  const now = Date.now()
  const toValidate = items.filter(item => {
    if (!item.startTime || item.predResult) return false
    const start = new Date(item.startTime).getTime()
    if (isNaN(start)) return false
    if (item.multiDay) return start < now - 4*24*60*60*1000  // golf: após 4 dias
    return start < now - 30*60*1000                          // esportes: 30min após início
  })
  if (!toValidate.length) return items

  const nowBRT = new Date().toLocaleString('pt-BR', {timeZone:'America/Sao_Paulo'})
  const system = [
    `Validador de previsões BetTv. Agora: ${nowBRT}.`,
    `Busque nos sites: ${TOP_SITES[category]||'ESPN, FlashScore, SofaScore'}`,
    'Responda SOMENTE com JSON array. Nunca invente resultados.',
  ].join('\n')

  const prompt = [
    `Pesquise o resultado REAL de cada evento abaixo (categoria: ${category}).`,
    `Compare com a previsão BetTv e classifique.`,
    '',
    'Eventos:',
    JSON.stringify(toValidate.map(i=>({
      id: i.id, title: i.title,
      startTime: i.startTime, bettvPick: i.bettvPick,
    }))),
    '',
    'Retorne JSON array (apenas eventos com resultado confirmado):',
    '[{"id":"...","predResult":"correct|incorrect|partial",',
    '"realResult":"ex: Palmeiras 2×1 Flamengo","predNote":"ex: BetTv acertou — Palmeiras venceu"}]',
    '',
    '- correct: previsão acertou exatamente',
    '- incorrect: previsão errou',
    '- partial: empate não previsto, ou evento ainda em andamento',
  ].join('\n')

  try {
    const txt = await apiCall(system, [{role:'user', content:prompt}])
    if (!txt) return items
    let clean = txt.replace(/```json\s*/gi,'').replace(/```\s*/g,'').trim()
    const idx = clean.indexOf('[')
    if (idx === -1) return items
    clean = clean.slice(idx)
    let depth=0, end=-1
    for(let i=0;i<clean.length;i++){if(clean[i]==='[')depth++;else if(clean[i]===']'){depth--;if(depth===0){end=i;break}}}
    if(end===-1) return items
    const validations = JSON.parse(clean.slice(0,end+1))
    if (!Array.isArray(validations)) return items

    return items.map(item => {
      const v = validations.find(x => x.id === item.id)
      return v ? {...item, predResult:v.predResult, realResult:v.realResult, predNote:v.predNote} : item
    })
  } catch(e) { return items }
}

// ─── MERGE HELPERS ────────────────────────────────────────────────────────────
function mergeLoterias(current, updates) {
  return current.map(lot => {
    const u = updates.find(x => x.id === lot.id)
    return u ? {...lot, ...u} : lot
  })
}

function mergeCrypto(current, updates) {
  return current.map(item => {
    const u = updates.find(x => x.id === item.id)
    if (!u) return item
    // Preserve yearPick/yearConf/yearReason if not in update
    return {
      ...item, ...u,
      yearPick:    u.yearPick    ?? item.yearPick,
      yearConf:    u.yearConf    ?? item.yearConf,
      yearReason:  u.yearReason  ?? item.yearReason,
    }
  })
}

function mergeSport(current, updates, now) {
  const safeCurrents = current||[]
  const valid = (updates||[]).filter(item => {
    if (!item.startTime || !item.title || !item.home || !item.away) return false
    const s = new Date(item.startTime).getTime()
    return !isNaN(s) && s > now - 4*60*60*1000
  }).map(item => {
    const prev = safeCurrents.find(e => e.id === item.id)
    return {
      ...item,
      predResult: prev?.predResult ?? null,
      realResult: prev?.realResult ?? null,
      predNote:   prev?.predNote   ?? null,
      multiDay:   item.multiDay    ?? prev?.multiDay ?? false,
    }
  })
  if (valid.length === 0) return safeCurrents
  // MERGE: keep existing items that aren't in the update set + add all new valid items
  const newIds = new Set(valid.map(i => i.id))
  const kept = safeCurrents.filter(i => !newIds.has(i.id))
  return [...valid, ...kept].sort((a,b) => {
    const aLive = (a.status==='live'||a.status==='inprogress') ? 0 : 1
    const bLive = (b.status==='live'||b.status==='inprogress') ? 0 : 1
    if (aLive !== bLive) return aLive - bLive
    return new Date(a.startTime||'2099') - new Date(b.startTime||'2099')
  })
}

// ─── AUTO UPDATE HOOK ─────────────────────────────────────────────────────────
function useAutoUpdate(seed) {
  const [appData,  setAppData]  = useState(seed)
  const [logs,     setLogs]     = useState([])
  const [updating, setUpdating] = useState(false)
  const [lastAt,   setLastAt]   = useState(null)
  const [nextAt,   setNextAt]   = useState(null)
  const [progress, setProgress] = useState({current:'',done:0,total:0})
  const [countdown,setCountdown]= useState('')

  const cycleRef   = useRef(false)   // prevents overlapping cycles
  const timerRef   = useRef(null)
  const cdRef      = useRef(null)
  const appDataRef = useRef(seed)    // always-fresh ref for timer callback

  // Keep ref in sync
  useEffect(() => { appDataRef.current = appData }, [appData])

  const addLog = useCallback((msg, t='info') => {
    const ts = new Date().toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit',second:'2-digit'})
    setLogs(prev => [{msg,t,ts}, ...prev].slice(0,60))
  },[])

  // ── MAIN CYCLE ──────────────────────────────────────────────────────────────
  const runCycle = useCallback(async (cur, manual=false) => {
    // Guard: prevent overlapping cycles
    if (cycleRef.current) {
      addLog('⏸ Ciclo já em execução — aguardando', 'warn')
      return
    }
    cycleRef.current = true
    setUpdating(true)

    const now = Date.now()
    const nowBRT = new Date().toLocaleString('pt-BR',{timeZone:'America/Sao_Paulo'})
    addLog(manual
      ? `🔄 Atualização manual — ${nowBRT}`
      : `⏰ Ciclo automático — ${nowBRT}`, 'start')

    // ── STEP 1: Purge expired events ────────────────────────────────────────
    const purgedEsportes = {}
    Object.entries(cur.esportes).forEach(([cat, catData]) => {
      purgedEsportes[cat] = {
        ...catData,
        items: (catData.items||[]).filter(item => {
          if (!item.startTime) return true
          const start = new Date(item.startTime).getTime()
          if (item.predResult)  return start > now - 48*60*60*1000  // keep validated 48h
          if (item.multiDay)    return start > now -  7*24*60*60*1000
          return start > now - 4*60*60*1000
        }),
      }
    })

    // Working copy — mutated in-place during cycle
    const nd = {
      loterias: [...cur.loterias],
      esportes: purgedEsportes,
      crypto:   [...(cur.crypto  || CRYPTO_DATA)],
      moedas:   [...(cur.moedas  || MOEDAS_DATA)],
    }

    const sportCats = Object.keys(ESPORTES).filter(k=>k!=='esports')  // futebol, basquete, …
    const allCats   = ['loterias', ...sportCats, 'crypto', 'moedas']
    const total     = allCats.length
    let   done      = 0, ok = 0

    setProgress({current:'', done:0, total})

    // ── STEP 2: Validate past sport predictions (parallel per category) ─────
    addLog('🔍 Validando previsões passadas…', 'info')
    await Promise.allSettled(
      sportCats.map(async cat => {
        if (!nd.esportes[cat]?.items?.length) return
        try {
          const validated = await validatePredictions(nd.esportes[cat].items||[], cat)
          const newCount  = validated.filter(i =>
            i.predResult && !nd.esportes[cat]?.items?.find(x=>x.id===i.id)?.predResult
          ).length
          if (newCount > 0) {
            nd.esportes[cat] = {...nd.esportes[cat], items: validated}
            addLog(`✅ ${cat}: ${newCount} previsão(ões) validada(s)`, 'success')
            // Emit partial update to UI immediately
            setAppData(prev => ({
              ...prev,
              esportes: {...prev.esportes, [cat]: nd.esportes[cat]},
            }))
          }
        } catch(e) { addLog(`⚠️ Validação ${cat}: ${e.message}`, 'warn') }
      })
    )

    // ── STEP 3: Fetch fresh data for every category sequentially ────────────
    for (const cat of allCats) {
      done++
      setProgress({current:cat, done, total})
      addLog(`🌐 [${done}/${total}] Buscando: ${cat}`, 'loading')

      try {
        const upd = await fetchCategory(cat)

        if (!upd || !Array.isArray(upd) || upd.length === 0) {
          addLog(`⚠️ ${cat}: sem dados — mantendo atuais`, 'warn')
        } else if (cat === 'loterias') {
          nd.loterias = mergeLoterias(nd.loterias, upd)
          addLog(`✅ loterias: ${upd.length} previsões atualizadas`, 'success')
        } else if (cat === 'crypto') {
          nd.crypto = mergeCrypto(nd.crypto, upd)
          addLog(`✅ crypto: ${upd.length} ativos atualizados`, 'success')
        } else if (cat === 'moedas') {
          nd.moedas = mergeCrypto(nd.moedas, upd)   // same merge logic
          addLog(`✅ câmbio: ${upd.length} pares atualizados`, 'success')
        } else {
          // Sport category
          if (!nd.esportes[cat]) {
            addLog(`⚠️ ${cat}: categoria não existe`, 'warn')
          } else {
            const merged = mergeSport(nd.esportes[cat]?.items||[], upd, now)
            nd.esportes[cat] = {...nd.esportes[cat], items: merged}
            addLog(`✅ ${cat}: ${merged.length} eventos`, 'success')
          }
        }

        ok++
      } catch(e) {
        addLog(`❌ ${cat}: ${e.message}`, 'error')
      }

      // Push live update to UI after every category
      setAppData({...nd})

      // Throttle: 500ms gap between categories to avoid rate-limits
      await new Promise(r => setTimeout(r, 500))
    }

    // ── STEP 4: Finalize ────────────────────────────────────────────────────
    const ts = new Date()
    setLastAt(ts)
    setNextAt(new Date(ts.getTime() + INTERVAL))
    setUpdating(false)
    setProgress({current:'', done:total, total})
    cycleRef.current = false
    addLog(`🏁 Concluído ${ok}/${total} categorias — próxima em 2h`, 'done')
  }, [addLog])

  // ── COUNTDOWN TIMER ────────────────────────────────────────────────────────
  useEffect(() => {
    cdRef.current = setInterval(() => {
      if (!nextAt) { setCountdown(''); return }
      const d = nextAt - Date.now()
      if (d <= 0) { setCountdown('Agora'); return }
      const h = Math.floor(d/3600000)
      const m = Math.floor((d%3600000)/60000)
      const s = Math.floor((d%60000)/1000)
      setCountdown(`${h}h ${String(m).padStart(2,'0')}m ${String(s).padStart(2,'0')}s`)
    }, 1000)
    return () => clearInterval(cdRef.current)
  }, [nextAt])

  // ── BOOTSTRAP + INTERVAL ──────────────────────────────────────────────────
  useEffect(() => {
    // Run immediately on mount
    runCycle(appDataRef.current)

    // Every 2h — use ref so we always operate on latest data
    timerRef.current = setInterval(() => {
      runCycle(appDataRef.current)
    }, INTERVAL)

    return () => clearInterval(timerRef.current)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const force = useCallback(() => {
    if (!cycleRef.current) runCycle(appDataRef.current, true)
  }, [runCycle])

  return {appData, logs, updating, lastAt, countdown, progress, force}
}


// ─── SHARE BUTTON ─────────────────────────────────────────────────────────────
function ShareBtn({item, catKey}) {
  const [copied, setCopied] = useState(false)

  function buildText() {
    const site = 'bettv.com.br'
    // Sport
    if (item.home && item.away) {
      return `⚽ BetTv · ${item.title}\n` +
        `📊 Pick: ${item.bettvPick} (${item.bettvConf}% conf.)\n` +
        `💬 ${item.bettvReason||''}\n` +
        `🔗 ${site}`
    }
    // Loteria
    if (item.nome) {
      const nums = (item.guruNums||[]).slice(0,6).join(', ')
      return `🎲 BetTv · ${item.nome} — Conc. ${item.concurso||''}\n` +
        `🔢 Sugestão: ${nums}\n` +
        `🎯 Confiança: ${item.guruConf||item.bettvConf||0}%\n` +
        `🔗 ${site}`
    }
    // Crypto
    if (item.price !== undefined) {
      const chg = item.change24h||0
      return `₿ BetTv · ${item.symbol} — ${item.name}\n` +
        `💰 Preço: $${item.price>=1000?Number(item.price).toLocaleString('en-US',{maximumFractionDigits:0}):Number(item.price).toFixed(2)} (${chg>0?'+':''}${chg.toFixed(2)}%)\n` +
        `📊 Pick 24h: ${item.bettvPick} ${item.bettvConf}% · Anual 2026: ${item.yearPick||''} ${item.yearConf||''}%\n` +
        `🔗 ${site}`
    }
    // Câmbio
    if (item.priceBRL !== undefined) {
      return `💱 BetTv · ${item.symbol} — ${item.name}\n` +
        `💰 R$ ${item.priceBRL>=1?Number(item.priceBRL).toFixed(2):Number(item.priceBRL).toFixed(5)}\n` +
        `📊 Pick: ${item.bettvPick} ${item.bettvConf}% · Anual 2026: ${item.yearPick||''} ${item.yearConf||''}%\n` +
        `🔗 ${site}`
    }
    // Eleições
    if (item.tipo) {
      const pick = item.bettvPick||''
      return `🗳️ BetTv · Eleições 2026\n` +
        `📋 ${item.titulo}\n` +
        `📊 ${pick} (${item.bettvConf}% conf.)\n` +
        `💬 ${item.bettvReason||''}\n` +
        `🔗 ${site}`
    }
    return `BetTv · bettv.com.br`
  }

  async function handleShare(e) {
    e.stopPropagation()
    const text = buildText()
    try {
      if (navigator.share) {
        await navigator.share({title:'BetTv', text})
      } else {
        await navigator.clipboard.writeText(text)
        setCopied(true)
        setTimeout(()=>setCopied(false), 2000)
      }
    } catch(_) {
      try {
        await navigator.clipboard.writeText(text)
        setCopied(true)
        setTimeout(()=>setCopied(false), 2000)
      } catch(__) {}
    }
  }

  return (
    <button onClick={handleShare}
      title={copied?'Copiado!':'Compartilhar'}
      style={{
        position:'absolute', top:6, right:6, zIndex:20,
        width:24, height:24, borderRadius:'50%',
        background:copied?'#16A34A':'rgba(255,255,255,0.85)',
        border:`1px solid ${copied?'#16A34A':'rgba(0,0,0,0.10)'}`,
        cursor:'pointer', display:'flex',
        alignItems:'center', justifyContent:'center',
        transition:'all 0.2s', flexShrink:0,
        backdropFilter:'blur(8px)', boxShadow:'0 1px 4px rgba(0,0,0,0.10)',
      }}
      onMouseEnter={e=>{ if(!copied) e.currentTarget.style.background='rgba(0,0,0,0.14)' }}
      onMouseLeave={e=>{ if(!copied) e.currentTarget.style.background='rgba(0,0,0,0.06)' }}
    >
      {copied
        ? <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><path d="M20 6L9 17l-5-5"/></svg>
        : <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2" strokeLinecap="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
      }
    </button>
  )
}

// ─── BALL ─────────────────────────────────────────────────────────────────────
function Ball({n, size=24, bg=T.gray2, color=T.black}) {
  return (
    <div style={{width:size,height:size,minWidth:size,borderRadius:'50%',background:bg,display:'flex',alignItems:'center',justifyContent:'center',fontSize:Math.max(8,size*0.38),fontWeight:700,color,flexShrink:0,lineHeight:1}}>
      {String(n).padStart(2,'0')}
    </div>
  )
}

// ─── AI IMAGE CACHE — busca URLs de imagens via Claude ───────────────────────
const imageCache = {}
const pendingFetches = new Set()

async function fetchImageUrl(name) {
  if (!name || imageCache[name] !== undefined || pendingFetches.has(name)) return
  if (!API_KEY) { imageCache[name] = null; return }
  pendingFetches.add(name)
  try {
    const prompt = 'Você é especialista em logos esportivos. Para o time/atleta "' + name + '", retorne SOMENTE uma URL direta funcional de PNG/SVG com fundo branco ou transparente. Priorize: Wikipedia Commons, Wikimedia, ESPN CDN. Responda APENAS a URL ou NONE.'
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method:'POST',
      headers:{'Content-Type':'application/json','x-api-key':API_KEY,'anthropic-version':'2023-06-01','anthropic-dangerous-direct-browser-access':'true'},
      body:JSON.stringify({model:'claude-sonnet-4-20250514',max_tokens:300,messages:[{role:'user',content:prompt}]})
    })
    if (!res.ok) { imageCache[name] = null; return }
    const json = await res.json()
    const raw = (json.content?.find(b=>b.type==='text')?.text||'').trim()
    const url = raw.split('\n')[0].trim()
    imageCache[name] = (url && url !== 'NONE' && url.startsWith('http')) ? url : null
  } catch(e) { imageCache[name] = null }
  finally { pendingFetches.delete(name) }
}

// ─── KNOWN LOGOS — URLs verificadas ──────────────────────────────────────────
const LOGOS = {
  // ── NBA ──
  okc:          'https://upload.wikimedia.org/wikipedia/en/5/5d/Oklahoma_City_Thunder.svg',
  lakers:       'https://upload.wikimedia.org/wikipedia/commons/3/3c/Los_Angeles_Lakers_logo.svg',
  celtics:      'https://upload.wikimedia.org/wikipedia/en/8/8f/Boston_Celtics.svg',
  warriors:     'https://upload.wikimedia.org/wikipedia/en/0/01/Golden_State_Warriors_logo.svg',
  cavaliers:    'https://upload.wikimedia.org/wikipedia/en/4/4b/Cleveland_Cavaliers_logo.svg',
  rockets:      'https://upload.wikimedia.org/wikipedia/en/2/28/Houston_Rockets.svg',
  nuggets:      'https://upload.wikimedia.org/wikipedia/en/7/76/Denver_Nuggets.svg',
  heat:         'https://upload.wikimedia.org/wikipedia/en/f/fb/Miami_Heat_logo.svg',
  suns:         'https://upload.wikimedia.org/wikipedia/en/d/dc/Phoenix_Suns_logo.svg',
  hawks:        'https://upload.wikimedia.org/wikipedia/en/2/24/Atlanta_Hawks_logo.svg',
  hornets:      'https://upload.wikimedia.org/wikipedia/en/9/9e/Charlotte_Hornets_%282014%29.svg',
  grizzlies:    'https://upload.wikimedia.org/wikipedia/en/f/f1/Memphis_Grizzlies.svg',
  pelicans:     'https://upload.wikimedia.org/wikipedia/en/0/0d/New_Orleans_Pelicans_logo.svg',
  spurs:        'https://upload.wikimedia.org/wikipedia/en/a/a2/San_Antonio_Spurs.svg',
  mavericks:    'https://upload.wikimedia.org/wikipedia/en/9/97/Dallas_Mavericks_logo.svg',
  jazz:         'https://upload.wikimedia.org/wikipedia/en/0/04/Utah_Jazz_logo_%282022%29.svg',
  bucks:        'https://upload.wikimedia.org/wikipedia/en/4/4a/Milwaukee_Bucks_logo.svg',
  pacers:       'https://upload.wikimedia.org/wikipedia/en/1/1b/Indiana_Pacers.svg',
  wizards:      'https://upload.wikimedia.org/wikipedia/en/0/02/Washington_Wizards_logo.svg',
  magic:        'https://upload.wikimedia.org/wikipedia/en/1/10/Orlando_Magic_logo.svg',
  sixers:       'https://upload.wikimedia.org/wikipedia/en/0/0e/Philadelphia_76ers_logo.svg',
  blazers:      'https://upload.wikimedia.org/wikipedia/en/2/21/Portland_Trail_Blazers_logo.svg',
  timberwolves: 'https://upload.wikimedia.org/wikipedia/en/c/c2/Minnesota_Timberwolves_logo.svg',
  clippers:     'https://upload.wikimedia.org/wikipedia/en/b/bb/LA_Clippers_logo.svg',
  knicks:       'https://upload.wikimedia.org/wikipedia/en/2/25/New_York_Knicks_logo.svg',
  nets:         'https://upload.wikimedia.org/wikipedia/commons/4/44/Brooklyn_Nets_newlogo.svg',
  raptors:      'https://upload.wikimedia.org/wikipedia/en/3/36/Toronto_Raptors_logo.svg',
  kings:        'https://upload.wikimedia.org/wikipedia/en/c/c7/Kings_Sac_Logo_2023.svg',
  // ── Premier League ──
  arsenal:      'https://upload.wikimedia.org/wikipedia/en/5/53/Arsenal_FC.svg',
  manutd:       'https://upload.wikimedia.org/wikipedia/en/7/7a/Manchester_United_FC_crest.svg',
  mancity:      'https://upload.wikimedia.org/wikipedia/en/e/eb/Manchester_City_FC_badge.svg',
  liverpool:    'https://upload.wikimedia.org/wikipedia/en/0/0c/Liverpool_FC.svg',
  chelsea:      'https://upload.wikimedia.org/wikipedia/en/c/cc/Chelsea_FC.svg',
  tottenham:    'https://upload.wikimedia.org/wikipedia/en/b/b4/Tottenham_Hotspur.svg',
  brighton:     'https://upload.wikimedia.org/wikipedia/en/f/fd/Brighton_%26_Hove_Albion_FC_logo.svg',
  everton:      'https://upload.wikimedia.org/wikipedia/en/7/7c/Everton_FC_logo.svg',
  newcastle:    'https://upload.wikimedia.org/wikipedia/en/5/56/Newcastle_United_Logo.svg',
  astonvilla:   'https://upload.wikimedia.org/wikipedia/en/9/9a/Aston_Villa_FC_new_crest.svg',
  brentford:    'https://upload.wikimedia.org/wikipedia/en/2/2a/Brentford_FC_crest.svg',
  nottmforest:  'https://upload.wikimedia.org/wikipedia/en/e/e5/Nottingham_Forest_F.C._logo.svg',
  westham:      'https://upload.wikimedia.org/wikipedia/en/c/c2/West_Ham_United_FC_logo.svg',
  sunderland:   'https://upload.wikimedia.org/wikipedia/en/7/77/Logo_Sunderland.svg',
  leeds:        'https://upload.wikimedia.org/wikipedia/en/5/54/Leeds_United_F.C._logo.svg',
  // ── La Liga ──
  realmadrid:   'https://upload.wikimedia.org/wikipedia/en/5/56/Real_Madrid_CF.svg',
  barcelona:    'https://upload.wikimedia.org/wikipedia/en/4/47/FC_Barcelona_%28crest%29.svg',
  atletimadrid: 'https://upload.wikimedia.org/wikipedia/en/f/f4/Atletico_Madrid_2017_logo.svg',
  // ── Bundesliga ──
  bayernmunich: 'https://upload.wikimedia.org/wikipedia/commons/1/1f/FC_Bayern_M%C3%BCnchen_logo_%282002%E2%80%932017%29.svg',
  dortmund:     'https://upload.wikimedia.org/wikipedia/commons/6/67/Borussia_Dortmund_logo.svg',
  leverkusen:   'https://upload.wikimedia.org/wikipedia/en/5/59/Bayer_04_Leverkusen_logo.svg',
  // ── Ligue 1 ──
  psg:          'https://upload.wikimedia.org/wikipedia/en/a/a7/Paris_Saint-Germain_F.C..svg',
  // ── Serie A ──
  intermilan:   'https://upload.wikimedia.org/wikipedia/commons/0/05/FC_Internazionale_Milano_2021.svg',
  juventus:     'https://upload.wikimedia.org/wikipedia/commons/1/15/Juventus_FC_2017_logo.svg',
  napoli:       'https://upload.wikimedia.org/wikipedia/commons/2/2d/SSC_Napoli.svg',
  // ── Brasileirão ──
  saopaulo:     'https://upload.wikimedia.org/wikipedia/commons/6/67/S%C3%A3o_Paulo_FC.svg',
  palmeiras:    'https://upload.wikimedia.org/wikipedia/commons/1/10/Palmeiras_logo.svg',
  corinthians:  'https://upload.wikimedia.org/wikipedia/commons/b/b6/Logo-Corinthians.svg',
  flamengo:     'https://upload.wikimedia.org/wikipedia/commons/2/2b/Flamengo_escudo.svg',
  fluminense:   'https://upload.wikimedia.org/wikipedia/commons/3/3d/Fluminense_Logo.svg',
  botafogo:     'https://upload.wikimedia.org/wikipedia/commons/9/93/Botafogo_de_Futebol_e_Regatas.svg',
  atleticmg:    'https://upload.wikimedia.org/wikipedia/commons/1/1e/Atletico_mineiro_galo.svg',
  internacional:'https://upload.wikimedia.org/wikipedia/commons/f/f3/Sport_Club_Internacional.svg',
  gremio:       'https://upload.wikimedia.org/wikipedia/commons/e/eb/Gr%C3%AAmio_FBPA.svg',
  cruzeiro:     'https://upload.wikimedia.org/wikipedia/commons/f/f2/Cruzeiro_Esporte_Clube_-_Escudo.svg',
  bahia:        'https://upload.wikimedia.org/wikipedia/commons/9/9e/EC_Bahia.svg',
  vasco:        'https://upload.wikimedia.org/wikipedia/commons/c/c7/Vasco_da_Gama_Cruz_de_Malta.svg',
  fortaleza:    'https://upload.wikimedia.org/wikipedia/commons/1/1e/Escudo_do_Fortaleza.svg',
  sport:        'https://upload.wikimedia.org/wikipedia/commons/7/7d/Sport_Club_do_Recife.svg',
  // ── Tênis (ESPN CDN) ──
  sinner:       'https://a.espncdn.com/i/headshots/tennis/players/full/4741.png',
  alcaraz:      'https://a.espncdn.com/i/headshots/tennis/players/full/4759.png',
  sabalenka:    'https://a.espncdn.com/i/headshots/tennis/players/full/4613.png',
  gauff:        'https://a.espncdn.com/i/headshots/tennis/players/full/4866.png',
  fritz:        'https://a.espncdn.com/i/headshots/tennis/players/full/4321.png',
  tsitsipas:    'https://a.espncdn.com/i/headshots/tennis/players/full/4543.png',
  medvedev:     'https://a.espncdn.com/i/headshots/tennis/players/full/4581.png',
  zverev:       'https://a.espncdn.com/i/headshots/tennis/players/full/4320.png',
  dzumhur:      'https://a.espncdn.com/i/headshots/tennis/players/full/3723.png',
  // ── MMA (UFC CDN) ──
  pereira:      'https://dmxg5wxfqgb4u.cloudfront.net/styles/athlete_bio_full_body/s3/2024-10/PEREIRA_ALEX_L_BELT.png',
  makhachev:    'https://dmxg5wxfqgb4u.cloudfront.net/styles/athlete_bio_full_body/s3/2024-03/MAKHACHEV_ISLAM_L_BELT-new.png',
  pantoja:      'https://dmxg5wxfqgb4u.cloudfront.net/styles/athlete_bio_full_body/s3/2024-09/PANTOJA_ALEXANDRE_L_BELT.png',
  adesanya:     'https://dmxg5wxfqgb4u.cloudfront.net/styles/athlete_bio_full_body/s3/2023-09/ADESANYA_ISRAEL_L_BELT.png',
  prochazka:    'https://dmxg5wxfqgb4u.cloudfront.net/styles/athlete_bio_full_body/s3/2024-03/PROCHAZKA_JIRI_L_BELT.png',
  // ── E-sports ──
  loud:         'https://upload.wikimedia.org/wikipedia/commons/a/a5/LOUD_Esports_logo.png',
  furia:        'https://upload.wikimedia.org/wikipedia/commons/f/f9/Furia_Esports_logo.png',
  t1:           'https://upload.wikimedia.org/wikipedia/commons/1/13/T1_%28esports%29_logo.png',
}


// ─── NAME → LOGO KEY RESOLVER ───────────────────────────────────────────────
const NAME_TO_LOGO = {}
;(function buildNameMap(){
  const m = {
    // NBA
    'oklahoma city thunder':'okc','okc thunder':'okc','thunder':'okc',
    'los angeles lakers':'lakers','la lakers':'lakers',
    'boston celtics':'celtics','golden state warriors':'warriors',
    'cleveland cavaliers':'cavaliers','houston rockets':'rockets',
    'denver nuggets':'nuggets','miami heat':'heat','phoenix suns':'suns',
    'atlanta hawks':'hawks','charlotte hornets':'hornets',
    'memphis grizzlies':'grizzlies','new orleans pelicans':'pelicans',
    'san antonio spurs':'spurs','dallas mavericks':'mavericks',
    'utah jazz':'jazz','milwaukee bucks':'bucks','indiana pacers':'pacers',
    'washington wizards':'wizards','orlando magic':'magic',
    'philadelphia 76ers':'sixers','philadelphia sixers':'sixers','76ers':'sixers',
    'portland trail blazers':'blazers','trail blazers':'blazers',
    'minnesota timberwolves':'timberwolves','la clippers':'clippers',
    'los angeles clippers':'clippers','new york knicks':'knicks',
    'brooklyn nets':'nets','toronto raptors':'raptors','sacramento kings':'kings',
    // Premier League
    'manchester united':'manutd','man united':'manutd','man utd':'manutd',
    'manchester city':'mancity','man city':'mancity',
    'tottenham hotspur':'tottenham','tottenham':'tottenham',
    'brighton & hove albion':'brighton','brighton':'brighton',
    'aston villa':'astonvilla','nottingham forest':'nottmforest',
    'west ham united':'westham','west ham':'westham',
    'leeds united':'leeds','newcastle united':'newcastle',
    // La Liga
    'real madrid':'realmadrid','atletico madrid':'atletimadrid','atlético madrid':'atletimadrid',
    'atletico de madrid':'atletimadrid','atlético de madrid':'atletimadrid',
    // Bundesliga
    'bayern munich':'bayernmunich','bayern münchen':'bayernmunich','fc bayern':'bayernmunich',
    'borussia dortmund':'dortmund','bayer leverkusen':'leverkusen',
    // Serie A (Italy)
    'inter milan':'intermilan','internazionale':'intermilan','inter':'intermilan',
    // Ligue 1
    'paris saint-germain':'psg','paris sg':'psg',
    // Brasileirão
    'são paulo':'saopaulo','sao paulo':'saopaulo','são paulo fc':'saopaulo',
    'palmeiras':'palmeiras','se palmeiras':'palmeiras',
    'corinthians':'corinthians','sc corinthians':'corinthians',
    'flamengo':'flamengo','cr flamengo':'flamengo',
    'fluminense':'fluminense','fluminense fc':'fluminense',
    'botafogo':'botafogo','botafogo fr':'botafogo',
    'atlético-mg':'atleticmg','atletico-mg':'atleticmg','atlético mineiro':'atleticmg','atletico mineiro':'atleticmg',
    'internacional':'internacional','sc internacional':'internacional',
    'grêmio':'gremio','gremio':'gremio','grêmio fbpa':'gremio',
    'cruzeiro':'cruzeiro','cruzeiro ec':'cruzeiro',
    'bahia':'bahia','ec bahia':'bahia',
    'vasco da gama':'vasco','vasco':'vasco',
    'fortaleza':'fortaleza','fortaleza ec':'fortaleza',
    'sport recife':'sport','sport':'sport',
    // Golf
    'scottie scheffler':'sinner','s. scheffler':'sinner',  // reuse tennis headshot style
    'rory mcilroy':'sinner','r. mcilroy':'sinner',
    // Tênis
    'jannik sinner':'sinner','j. sinner':'sinner',
    'carlos alcaraz':'alcaraz','c. alcaraz':'alcaraz',
    'aryna sabalenka':'sabalenka','a. sabalenka':'sabalenka',
    'coco gauff':'gauff','c. gauff':'gauff',
    'taylor fritz':'fritz','t. fritz':'fritz',
    'daniil medvedev':'medvedev','d. medvedev':'medvedev',
    'alexander zverev':'zverev','a. zverev':'zverev',
    // MMA
    'alex pereira':'pereira','a. pereira':'pereira',
    'islam makhachev':'makhachev','i. makhachev':'makhachev',
    'alexandre pantoja':'pantoja','a. pantoja':'pantoja',
    'israel adesanya':'adesanya','i. adesanya':'adesanya',
    // MLS
    'la galaxy':'lagalaxy','los angeles galaxy':'lagalaxy',
    'inter miami':'intermiami','inter miami cf':'intermiami',
    'portland timbers':'portland','seattle sounders':'seattle',
    'atlanta united':'atlanta','new york city fc':'nycfc',
    'columbus crew':'columbus','los angeles fc':'lafc',
  }
  Object.entries(m).forEach(([n,k])=>{NAME_TO_LOGO[n]=k})
  Object.keys(LOGOS).forEach(k=>{NAME_TO_LOGO[k]=k})
})()

function resolveLogoKey(logo, name) {
  if (logo && LOGOS[logo]) return logo
  if (!name) return null
  const norm = name.toLowerCase().trim()
  if (NAME_TO_LOGO[norm]) return NAME_TO_LOGO[norm]
  // Fuzzy: check if name contains a known key
  for (const [n,k] of Object.entries(NAME_TO_LOGO)) {
    if (norm.includes(n) || n.includes(norm)) return k
  }
  return null
}

// ─── TEAM / PLAYER LOGO ───────────────────────────────────────────────────────
function TeamLogo({logo, name, size=26}) {
  const [staticErr, setStaticErr] = useState(false)
  const [aiUrl, setAiUrl] = useState(undefined)
  const [aiErr, setAiErr] = useState(false)

  const resolvedKey = resolveLogoKey(logo, name)
  const staticUrl = resolvedKey ? LOGOS[resolvedKey] : null
  const useStatic = staticUrl && !staticErr

  useEffect(() => {
    if (useStatic) return
    if (!name) { setAiUrl(null); return }
    if (imageCache[name] !== undefined) { setAiUrl(imageCache[name]); return }
    setAiUrl(undefined)
    fetchImageUrl(name).then(() => setAiUrl(imageCache[name] ?? null))
  }, [name, useStatic])

  const initials = name
    ? name.replace(/[×x]/g,'').split(/[\s\-\.]+/).filter(Boolean)
        .map(w => w[0]?.toUpperCase()).filter(Boolean).slice(0,2).join('')
    : '?'
  const pal = ['#DBEAFE','#D1FAE5','#FEF3C7','#EDE9FE','#FEE2E2','#FFEDD5','#E0F2FE']
  const bg = pal[(name||'?').charCodeAt(0) % pal.length]

  const imgSt = {width:size,height:size,minWidth:size,borderRadius:6,objectFit:'contain',background:'transparent',flexShrink:0,display:'block'}
  const avSt  = {width:size,height:size,minWidth:size,borderRadius:6,background:bg,display:'flex',alignItems:'center',justifyContent:'center',fontSize:size*0.33,fontWeight:700,color:'#374151',flexShrink:0,letterSpacing:'-0.02em',userSelect:'none'}
  const spSt  = {width:size*0.4,height:size*0.4,borderRadius:'50%',border:'2px solid #D1D5DB',borderTopColor:'#6B7280',animation:'spin 0.8s linear infinite'}

  if (useStatic)               return <img src={staticUrl} alt={name} onError={()=>setStaticErr(true)} style={imgSt}/>
  if (aiUrl && !aiErr)         return <img src={aiUrl} alt={name} onError={()=>setAiErr(true)} style={imgSt}/>
  if (aiUrl===undefined&&API_KEY) return <div style={avSt}><div style={spSt}/></div>
  return <div style={avSt}>{initials}</div>
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
  // Live only if event is actually happening now (within ±90min of start)
  const {isActuallyLive, isOngoing} = (() => {
    if (!item.startTime) return {isActuallyLive:false, isOngoing:false}
    const now = Date.now()
    const start = new Date(item.startTime).getTime()
    if (isNaN(start)) return {isActuallyLive:false, isOngoing:false}
    // Multi-day events (golf tournaments): show EM ANDAMENTO
    if (item.multiDay) {
      return {isActuallyLive:false, isOngoing: now >= start && now <= start + 7*24*60*60*1000}
    }
    // Single-match events: AO VIVO within duration window
    const durations = {futebol:130, basquete:180, tenis:300, mma:420, esports:240, golf:360}
    const dur = (durations[catKey] || 180) * 60 * 1000
    return {isActuallyLive: now >= start && now <= start + dur, isOngoing:false}
  })()
  const live = isActuallyLive
  const catColor=T.cat[catKey]||T.black
  const label=TABS.find(t=>t.key===catKey)?.label||catKey

      const predBorder = item.predResult==='correct'?'#16A34A':item.predResult==='incorrect'?T.red:item.predResult==='partial'?'#D97706':null
    const predBg = item.predResult==='correct'?'#F0FDF4':item.predResult==='incorrect'?'#FEF2F2':item.predResult==='partial'?'#FFFBEB':T.white

    return (
    <div style={{position:'relative',height:CARD_H,borderRadius:T.r.lg,flexShrink:0}}>
      <ShareBtn item={item} catKey={catKey}/>
      <div onClick={()=>onSelect(item)} onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
        style={{height:'100%',background:predBg,borderRadius:T.r.lg,border:`2px solid ${predBorder||(hov?'#C0C0BB':T.border)}`,cursor:'pointer',boxShadow:hov?'0 4px 20px rgba(0,0,0,0.1)':'0 1px 3px rgba(0,0,0,0.04)',transition:'box-shadow 0.15s,border-color 0.15s',display:'flex',flexDirection:'column',overflow:'hidden'}}>
      {/* Prediction result badge */}
      {item.predResult&&<div style={{position:'absolute',top:8,right:8,zIndex:2,background:predBorder,color:'white',fontSize:9,fontWeight:800,borderRadius:4,padding:'2px 6px',letterSpacing:'0.05em',textTransform:'uppercase'}}>{item.predResult==='correct'?'✓ ACERTOU':item.predResult==='incorrect'?'✗ ERROU':'~ PARCIAL'}</div>}


      {/* Header */}
      <div style={{padding:'11px 14px 9px',paddingRight:38,display:'flex',justifyContent:'space-between',alignItems:'center',borderBottom:`1px solid ${T.border}`,flexShrink:0}}>
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
          {(live||isOngoing)&&<><IcoLiveDot/><span style={{fontSize:11,fontWeight:700,color:live?T.red:'#D97706',marginLeft:3}}>{live?'AO VIVO':'EM ANDAMENTO'}</span><span style={{fontSize:11,color:T.gray1,margin:'0 2px'}}> · </span></>}
          <span style={{fontSize:11,color:T.gray1,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{(item.statusLabel||"").replace(/^(AO VIVO|EM ANDAMENTO)\s*[·\-·]?\s*/i,"")}</span>
        </div>
      </div>

      {/* Teams */}
      <div style={{padding:'0 14px',flex:1,minHeight:0}}>
        {[item.home,item.away].map((side,i)=>{
          const winner=(side.pct||0)>(i===0?(item.away?.pct||0):(item.home?.pct||0))
          return (
            <div key={i} style={{display:'flex',alignItems:'center',gap:8,padding:'7px 0',borderBottom:i===0?`1px solid ${T.border}`:'none'}}>
              <TeamLogo logo={side.logo} name={side.name} size={26}/>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:13,fontWeight:winner?700:500,color:T.black,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',marginBottom:3}}>{side.name}</div>
                <div style={{height:2,borderRadius:1,background:winner?catColor:T.gray3,width:`${Math.max(12,side.pct)}%`,transition:'width 0.5s'}}/>
              </div>
              <div style={{minWidth:48,textAlign:'center',padding:'4px 8px',borderRadius:T.r.pill,border:`1.5px solid ${catUpdating?T.gray3:'#16A34A'}`,color:catUpdating?T.gray1:'#15803D',fontSize:13,fontWeight:800,background:catUpdating?T.gray2:'#F0FDF4',flexShrink:0}}>
                {catUpdating?'—':`${side.pct}%`}
              </div>
            </div>
          )
        })}
      </div>

      {/* Guru strip */}
      <div style={{margin:'8px 14px 0',background:'#F8F8F5',borderRadius:T.r.sm,padding:'7px 10px',flexShrink:0}}>
        <div style={{display:'flex',alignItems:'flex-start',gap:6}}>
          <span style={{fontSize:10,fontWeight:700,color:catColor,whiteSpace:'nowrap',paddingTop:1,flexShrink:0}}>BetTv</span>
          <span style={{fontSize:11,color:T.gray1,lineHeight:1.4,flex:1,overflow:'hidden',display:'-webkit-box',WebkitLineClamp:2,WebkitBoxOrient:'vertical'}}>{catUpdating?'Atualizando...':`${item.bettvPick||item.guruPick||'—'} · ${item.bettvReason||item.guruReason||'—'}`}</span>
          <span style={{fontSize:11,fontWeight:800,color:T.black,flexShrink:0,paddingLeft:4}}>{item.bettvConf||item.guruConf||0}%</span>
        </div>
      </div>

      {/* Footer */}
      <div style={{padding:'8px 14px 11px',display:'flex',justifyContent:'flex-end',flexShrink:0}}>
        <span style={{fontSize:11,color:T.gray1}}>Empate {item.draw}%</span>
      </div>
      </div>
    </div>
  )
}

// ─── DESKTOP KALSHI CARD — loteria ────────────────────────────────────────────
function KalshiLotoCard({lot, onSelect, catUpdating}) {
  const [hov,setHov]=useState(false)
  return (
    <div style={{position:'relative',height:CARD_H,borderRadius:T.r.lg,flexShrink:0}}>
      <ShareBtn item={lot} catKey="loterias"/>
      <div onClick={()=>onSelect(lot)} onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
        style={{height:'100%',background:T.white,borderRadius:T.r.lg,border:`1px solid ${hov?'#C0C0BB':T.border}`,cursor:'pointer',boxShadow:hov?'0 4px 20px rgba(0,0,0,0.1)':'0 1px 3px rgba(0,0,0,0.04)',transition:'box-shadow 0.15s,border-color 0.15s',display:'flex',flexDirection:'column',overflow:'hidden'}}>
      {/* Header */}
      <div style={{padding:'11px 14px 9px',paddingRight:38,display:'flex',justifyContent:'space-between',alignItems:'center',borderBottom:`1px solid ${T.border}`,flexShrink:0}}>
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
          {(lot.ultimoResultado||[]).slice(0,8).map(n=><Ball key={n} n={n} size={22}/>)}
          {(lot.ultimoResultado||[]).length>8&&<span style={{fontSize:10,color:T.gray1,alignSelf:'center',marginLeft:2}}>+{(lot.ultimoResultado||[]).length-8}</span>}
        </div>
      </div>

      {/* Guru */}
      <div style={{padding:'0 14px',flex:1,borderTop:`1px solid ${T.border}`,minHeight:0}}>
        <div style={{paddingTop:8}}>
          <div style={{display:'flex',alignItems:'flex-start',gap:10,marginBottom:6}}>
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontSize:12,fontWeight:700,color:T.black,marginBottom:5}}>{catUpdating?'Atualizando...':'BetTv sugere'}</div>
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
    </div>
  )
}

// ─── MOBILE CARDS ─────────────────────────────────────────────────────────────
function LotoCard({lot, onSelect, catUpdating}) {
  const [hov,setHov]=useState(false)
  return (
    <div onClick={()=>onSelect(lot)} onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      style={{background:T.white,borderRadius:T.r.lg,border:`1px solid ${T.border}`,marginBottom:12,cursor:'pointer',boxShadow:hov?'0 4px 20px rgba(0,0,0,0.08)':'none',transition:'box-shadow 0.15s',position:'relative'}}>
      <ShareBtn item={lot} catKey="loterias"/>
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
          <div style={{display:'flex',gap:4,flexWrap:'wrap'}}>{(lot.ultimoResultado||[]).map(n=><Ball key={n} n={n} size={24}/>)}</div>
        </div>
        <div style={{background:T.bg,borderRadius:T.r.md,padding:'11px 13px'}}>
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:8}}>
            <span style={{fontSize:10,fontWeight:700,color:T.black,letterSpacing:'0.05em'}}>{catUpdating?'ATUALIZANDO...':'BetTv SUGERE'}</span>
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
  const {isActuallyLive, isOngoing} = (() => {
    if (!item.startTime) return {isActuallyLive:false, isOngoing:false}
    const now = Date.now()
    const start = new Date(item.startTime).getTime()
    if (isNaN(start)) return {isActuallyLive:false, isOngoing:false}
    // Multi-day events (golf tournaments): show EM ANDAMENTO
    if (item.multiDay) {
      return {isActuallyLive:false, isOngoing: now >= start && now <= start + 7*24*60*60*1000}
    }
    // Single-match events: AO VIVO within duration window
    const durations = {futebol:130, basquete:180, tenis:300, mma:420, esports:240, golf:360}
    const dur = (durations[catKey] || 180) * 60 * 1000
    return {isActuallyLive: now >= start && now <= start + dur, isOngoing:false}
  })()
  const live = isActuallyLive; const [hov,setHov]=useState(false)
  const catColor=T.cat[catKey]||T.black
  return (
    <div onClick={()=>onSelect(item)} onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      style={{background:T.white,borderRadius:T.r.lg,border:`1px solid ${T.border}`,marginBottom:12,cursor:'pointer',boxShadow:hov?'0 4px 20px rgba(0,0,0,0.08)':'none',transition:'box-shadow 0.15s',position:'relative'}}>
      <div style={{height:3,background:live?T.red:T.border}}/>
      <div style={{padding:'14px 18px'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:9}}>
          <div style={{display:'flex',alignItems:'center',gap:5}}>
            {live&&<><IcoLiveDot/><span style={{fontSize:11,fontWeight:700,color:T.red,marginLeft:3}}>AO VIVO</span><span style={{color:T.gray1,fontSize:11,margin:'0 3px'}}> · </span></>}
            <span style={{fontSize:11,color:T.gray1}}>{(item.statusLabel||"").replace(/^(AO VIVO|EM ANDAMENTO)\s*[·\-·]?\s*/i,"")}</span>
          </div>
          <span style={{fontSize:11,color:T.gray1}}>{item.competition}</span>
        </div>
        <div style={{marginBottom:11}}>
          <div style={{fontSize:17,fontWeight:900,color:T.black,letterSpacing:'-0.04em',lineHeight:1.2}}>{item.title}</div>
          <div style={{fontSize:11,color:T.gray1,marginTop:2}}>{item.subtitle}</div>
        </div>
        <div style={{background:T.bg,borderRadius:T.r.md,padding:'9px 11px',marginBottom:12,display:'flex',alignItems:'flex-start',gap:8}}>
          <div style={{flex:1}}>
            <span style={{fontSize:11,fontWeight:700,color:T.black}}>{catUpdating?'Atualizando...':`BetTv: ${item.bettvPick||item.guruPick||'—'}`}</span>
            {!catUpdating&&( item.bettvReason||item.guruReason)&&<p style={{fontSize:11,color:T.gray1,margin:'2px 0 0',lineHeight:1.5}}>{item.bettvReason||item.guruReason}</p>}
          </div>
          <div style={{background:catUpdating?T.gray3:T.black,color:T.white,borderRadius:T.r.pill,padding:'3px 9px',fontSize:11,fontWeight:800,flexShrink:0}}>{item.bettvConf||item.guruConf||0}%</div>
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
        <div style={{display:'flex',justifyContent:'flex-end',marginTop:11,paddingTop:9,borderTop:`1px solid ${T.border}`}}>
          <span style={{fontSize:11,color:T.gray1}}>Empate: {item.draw}%</span>
        </div>
      </div>
    </div>
  )
}

// ─── INFO MODAL ───────────────────────────────────────────────────────────────
// Detailed preview info only — no betting options

// Methodology text per category
const METHODOLOGY = {
  loterias: (item) =>
    'A previsão é gerada analisando o histórico completo de ' + (item.nome||'loteria') + ': frequência absoluta de cada dezena, ciclo de atraso (dezenas atrasadas em relação à média), distribuição par/ímpar ideal e padrão de soma das dezenas sorteadas. O algoritmo pondera esses quatro fatores para sugerir a combinação estatisticamente mais coerente com o perfil histórico do concurso — sem garantia de resultado, pois loteria é jogo de azar.',

  futebol: (item) =>
    `A previsão combina quatro variáveis ponderadas: forma recente dos times (últimas 5 partidas, peso 40%), histórico de confrontos diretos (H2H dos últimos 3 anos, peso 25%), fator mando de campo calculado pelo aproveitamento histórico em casa vs fora (peso 20%) e contexto da competição — posição na tabela, pressão por resultado e desfalques divulgados (peso 15%). O índice de confiança reflete o grau de convergência entre esses fatores: quanto maior, mais os indicadores apontam na mesma direção.`,

  basquete: (item) =>
    `A previsão analisa o aproveitamento percentual dos times nas últimas 10 rodadas, média de pontos marcados e sofridos (offensive/defensive rating), desempenho em casa vs visitante e sequência atual de vitórias ou derrotas. O modelo atribui peso adicional ao fator psicológico de momentum — times em sequência positiva tendem a manter padrão de desempenho. O índice de confiança sobe quando todos esses indicadores convergem para o mesmo favorito.`,

  volei: (item) =>
    `A análise cruza o aproveitamento por set (não apenas por jogo) das últimas rodadas da Superliga, o desempenho em casa e fora, e os indicadores individuais dos atletas-chave (eficiência de saque e bloqueio). Equipes com melhor defesa por set tendem a ser mais consistentes em jogos equilibrados. O índice de confiança reflete o nível de consistência do favorito nos últimos confrontos diretos e a estabilidade do elenco atual.`,

  mma: (item) =>
    `A previsão considera o estilo de luta de cada atleta (striking vs grappling), aproveitamento nos últimos 5 combates, alcance e vantagens físicas, altitude e tempo de descanso desde o último evento. Em lutas entre invictos ou atletas de nível similar, o modelo tende a apontar "decisão" como resultado mais provável, refletindo o equilíbrio técnico. O índice de confiança é naturalmente menor no MMA por sua imprevisibilidade inerente.`,

  tenis: (item) =>
    `A análise utiliza o ranking ATP/WTA atual, o desempenho recente em superfície equivalente (saibro, grama ou dura), histórico de confrontos diretos e aproveitamento no torneio específico. Tenistas que vêm de títulos recentes na mesma superfície recebem bônus de momentum. O índice de confiança é calibrado pela diferença de ranking e pelo H2H — quanto mais desequilibrado, maior a confiança na previsão.`,

  esports: (item) =>
    `A previsão analisa o winrate recente das equipes nos últimos splits da liga, composição e coesão do lineup (tempo de jogo juntos), desempenho em fases de grupo vs playoffs e picks/bans mais utilizados. Equipes que vêm de títulos recentes com lineup estável recebem bônus de confiança. O modelo considera também o tier dos adversários enfrentados — vitórias contra times top pesam mais que vitórias contra equipes de menor nível.`,
}

function InfoModal({item, isLoto, catKey, onClose}) {
  const {isMobile}=useBreakpoint()
  if (!item) return null

  const isCryptoItem = catKey==='crypto'
  const isMoedasItem = catKey==='moedas'
  const isEleicaoItem = catKey==='eleicoes'
  const isSpecialItem = isCryptoItem||isMoedasItem

  const catColor = T.cat[catKey||'loterias'] || T.black
  const catLabel = TABS.find(t=>t.key===catKey)?.label || 'Loteria'
  const methodText = isLoto
    ? METHODOLOGY.loterias(item)
    : isSpecialItem ? null
    : (METHODOLOGY[catKey] ? METHODOLOGY[catKey](item) : METHODOLOGY.futebol(item))

  const panelStyle = isMobile
    ? {width:'100%',maxWidth:560,background:T.white,borderRadius:'20px 20px 0 0',maxHeight:'92vh',overflowY:'auto',animation:'slideUp 0.28s cubic-bezier(0.32,0.72,0,1)'}
    : {width:'100%',maxWidth:560,background:T.white,borderRadius:T.r.lg,maxHeight:'88vh',overflowY:'auto',boxShadow:'0 24px 64px rgba(0,0,0,0.18)',animation:'fadeIn 0.2s ease'}

  return (
    <div onClick={onClose} style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.5)',zIndex:300,display:'flex',alignItems:isMobile?'flex-end':'center',justifyContent:'center'}}>
      <div onClick={e=>e.stopPropagation()} style={panelStyle}>

        {/* Handle bar (mobile) */}
        {isMobile && <div style={{display:'flex',justifyContent:'center',padding:'12px 0 0'}}><div style={{width:36,height:4,borderRadius:2,background:T.border}}/></div>}

        {/* Header */}
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',padding:'20px 24px 0'}}>
          <div style={{flex:1,minWidth:0,paddingRight:12}}>
            <div style={{fontSize:11,fontWeight:700,color:catColor,letterSpacing:'0.06em',textTransform:'uppercase',marginBottom:4}}>{catLabel}</div>
            <div style={{fontSize:18,fontWeight:800,color:T.black,letterSpacing:'-0.03em',lineHeight:1.2}}>
              {isLoto?item.nome:isEleicaoItem?item.titulo:isSpecialItem?(item.name||item.symbol):item.title}
            </div>
            {!isLoto&&!isSpecialItem&&!isEleicaoItem&&<div style={{fontSize:12,color:T.gray1,marginTop:3}}>{item.competition} · {(item.statusLabel||"").replace(/^(AO VIVO|EM ANDAMENTO)\s*[·\-·]?\s*/i,"")}</div>}
            {isLoto&&<div style={{fontSize:12,color:T.gray1,marginTop:3}}>Concurso {item.concurso} · Sorteio {item.data}</div>}
            {isEleicaoItem&&<div style={{fontSize:12,color:T.gray1,marginTop:3}}>{item.subtitulo}</div>}
            {isSpecialItem&&!isEleicaoItem&&<div style={{fontSize:12,color:T.gray1,marginTop:3}}>{isCryptoItem?item.symbol+' · Mercado Cripto':'Câmbio · vs BRL'}</div>}
          </div>
          <button onClick={onClose} style={{width:30,height:30,minWidth:30,borderRadius:'50%',border:'none',background:T.gray2,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',marginTop:2}}>
            <IcoClose size={16} color={T.gray1}/>
          </button>
        </div>

        <div style={{padding:'16px 24px 28px',display:'flex',flexDirection:'column',gap:12}}>

          {/* ── LOTERIAS ── */}
          {isLoto && !isEleicaoItem && <>
            {/* Prize */}
            <div style={{display:'flex',alignItems:'baseline',gap:10,paddingBottom:12,borderBottom:`1px solid ${T.border}`}}>
              <span style={{fontSize:26,fontWeight:900,color:T.black,letterSpacing:'-0.04em'}}>{item.premio}</span>
              {item.acumulado&&<span style={{fontSize:11,fontWeight:700,background:'#FEF3C7',color:'#B45309',borderRadius:4,padding:'2px 8px'}}>ACUMULADO</span>}
            </div>

            {/* Last result */}
            <div>
              <div style={{fontSize:11,fontWeight:700,color:T.gray1,letterSpacing:'0.06em',marginBottom:8}}>ÚLTIMO RESULTADO — CONC. {parseInt(item.concurso)-1}</div>
              <div style={{display:'flex',gap:5,flexWrap:'wrap'}}>
                {item.ultimoResultado.map(n=><Ball key={n} n={n} size={30}/>)}
              </div>
            </div>

            {/* Guru prediction */}
            <div style={{background:T.bg,borderRadius:T.r.md,padding:'14px 16px'}}>
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:12}}>
                <span style={{fontSize:11,fontWeight:700,color:T.black,letterSpacing:'0.06em'}}>BetTv SUGERE — Conc. {item.concurso}</span>
                <span style={{fontSize:13,fontWeight:800,background:T.green,color:T.white,borderRadius:T.r.pill,padding:'3px 12px'}}>{item.bettvConf||item.guruConf||0}% conf.</span>
              </div>
              <div style={{display:'flex',gap:5,flexWrap:'wrap',marginBottom:12}}>
                {(item.guruNums||[]).map(n=><Ball key={n} n={n} size={30} bg={T.black} color={T.white}/>)}
              </div>
              <p style={{fontSize:12,color:T.gray1,lineHeight:1.6,margin:0}}>{item.guruAnalise}</p>
            </div>

            {/* Stats row */}
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:8}}>
              {[
                {label:'MODALIDADE', value:item.descricao},
                {label:'APOSTA MÍN.', value:item.aposta},
                {label:'COMO GANHAR', value:item.regras},
              ].map(({label,value})=>(
                <div key={label} style={{background:T.bg,borderRadius:T.r.sm,padding:'10px 12px'}}>
                  <div style={{fontSize:9,fontWeight:700,color:T.gray1,letterSpacing:'0.06em',marginBottom:4}}>{label}</div>
                  <div style={{fontSize:12,fontWeight:700,color:T.black,lineHeight:1.3}}>{value}</div>
                </div>
              ))}
            </div>
          </>}

          {/* ── CRYPTO / CÂMBIO ── */}
          {isSpecialItem && <>

            {/* Preço atual */}
            <div style={{display:'flex',alignItems:'baseline',gap:12,paddingBottom:14,borderBottom:`1px solid ${T.border}`}}>
              <span style={{fontSize:32,fontWeight:900,color:T.black,letterSpacing:'-0.04em'}}>
                {isCryptoItem
                  ? (item.price>=1000?'$'+Number(item.price).toLocaleString('en-US',{maximumFractionDigits:0})
                    :item.price>=1?'$'+Number(item.price).toFixed(2)
                    :'$'+Number(item.price).toFixed(5))
                  : (item.priceBRL>=1?'R$ '+Number(item.priceBRL).toFixed(2):'R$ '+Number(item.priceBRL).toFixed(5))
                }
              </span>
              {(()=>{const chg=item.change24h||0; const up=chg>0; return(
                <span style={{fontSize:16,fontWeight:700,color:up?'#16A34A':'#E53935'}}>{up?'+':''}{chg.toFixed(2)}%</span>
              )})()}
            </div>

            {/* Previsão do dia */}
            {(()=>{
              const isUp=item.bettvPick==='ALTA', isDn=item.bettvPick==='QUEDA'
              const pc=isUp?'#16A34A':isDn?'#E53935':T.gray1
              const pb=isUp?'#F0FDF4':isDn?'#FEF2F2':'#F8F8F5'
              return(
                <div style={{background:pb,borderRadius:T.r.md,padding:'14px 16px',border:`1px solid ${isUp?'#BBF7D0':isDn?'#FECACA':'#E8E8E4'}`}}>
                  <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:8}}>
                    <span style={{fontSize:11,fontWeight:700,color:T.black,letterSpacing:'0.06em'}}>PREVISÃO DO DIA (24H)</span>
                    <span style={{fontSize:14,fontWeight:900,color:'white',background:pc,borderRadius:T.r.pill,padding:'3px 14px'}}>{item.bettvPick||'—'}</span>
                  </div>
                  <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:8}}>
                    <span style={{fontSize:12,color:T.gray1}}>Confiança BetTv</span>
                    <span style={{fontSize:16,fontWeight:800,color:pc}}>{item.bettvConf||0}%</span>
                  </div>
                  <p style={{fontSize:13,color:T.black,lineHeight:1.65,margin:0}}>{item.bettvReason||'—'}</p>
                </div>
              )
            })()}

            {/* Previsão anual */}
            {item.yearPick&&(()=>{
              const yUp=item.yearPick==='ALTA', yDn=item.yearPick==='QUEDA'
              const yc=yUp?'#16A34A':yDn?'#E53935':'#6B7280'
              const yb=yUp?'#F0FDF4':yDn?'#FEF2F2':'#F8F8F5'
              const arrow=yUp?'↑':yDn?'↓':'→'
              return(
                <div style={{background:yb,borderRadius:T.r.md,padding:'14px 16px',border:`1px solid ${yUp?'#BBF7D0':yDn?'#FECACA':'#E5E7EB'}`}}>
                  <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:10}}>
                    <span style={{fontSize:11,fontWeight:700,color:T.black,letterSpacing:'0.06em'}}>PREVISÃO ANUAL 2026</span>
                    <span style={{fontSize:14,fontWeight:900,color:yc}}>{arrow} {item.yearPick} de {item.yearConf}%</span>
                  </div>
                  <p style={{fontSize:13,color:T.black,lineHeight:1.65,margin:0,whiteSpace:'pre-wrap'}}>{item.yearReason||'—'}</p>
                </div>
              )
            })()}

          </>}

          {/* ── ELEIÇÕES 2026 ── */}
          {isEleicaoItem && (()=>{
            const pc='#7C3AED'
            return <>
              <div style={{background:'#F5F3FF',borderRadius:T.r.md,padding:'14px 16px',border:'1px solid #DDD6FE'}}>
                <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:8}}>
                  <span style={{fontSize:11,fontWeight:700,color:T.black,letterSpacing:'0.06em'}}>ANÁLISE BetTv</span>
                  <span style={{fontSize:13,fontWeight:900,color:'white',background:pc,borderRadius:T.r.pill,padding:'3px 14px'}}>{item.bettvConf}% conf.</span>
                </div>
                <div style={{fontSize:15,fontWeight:800,color:pc,marginBottom:6}}>{item.bettvPick}</div>
                <p style={{fontSize:13,color:T.black,lineHeight:1.65,margin:0}}>{item.bettvReason}</p>
              </div>

              {item.tipo==='cenario'&&(item.candidatos?.length>0)&&(
                <div style={{borderRadius:T.r.md,border:`1px solid ${T.border}`,overflow:'hidden'}}>
                  <div style={{padding:'10px 14px',borderBottom:`1px solid ${T.border}`,fontSize:11,fontWeight:700,letterSpacing:'0.06em'}}>INTENÇÃO DE VOTO — 1º TURNO</div>
                  {(item.candidatos||[]).map((c,i)=>(
                    <div key={i} style={{display:'flex',alignItems:'center',gap:12,padding:'10px 14px',borderBottom:i<(item.candidatos?.length||0)-1?`1px solid ${T.border}`:'none',background:i<2?'#FAFAFA':T.white}}>
                      <div style={{width:150,flexShrink:0}}>
                        <div style={{fontSize:13,fontWeight:i<2?700:500,color:T.black}}>{c.nome}</div>
                        <div style={{fontSize:11,color:T.gray1}}>{c.partido} · {c.cargo}</div>
                      </div>
                      <div style={{flex:1,height:8,background:T.gray2,borderRadius:4,overflow:'hidden'}}>
                        <div style={{height:'100%',width:`${c.pct}%`,background:c.cor,borderRadius:4}}/>
                      </div>
                      <div style={{width:36,textAlign:'right',fontSize:14,fontWeight:800,color:c.cor}}>{c.pct}%</div>
                    </div>
                  ))}
                </div>
              )}

              {item.tipo==='duelo'&&item.c1&&item.c2&&(
                <div style={{borderRadius:T.r.md,border:`1px solid ${T.border}`,overflow:'hidden'}}>
                  <div style={{display:'flex'}}>
                    {[item.c1||{},item.c2||{}].map((c,i)=>(
                      <div key={i} style={{flex:1,padding:'16px',textAlign:'center',borderRight:i===0?`1px solid ${T.border}`:'none',background:i===0?'#FFF5F5':'#F5F8FF'}}>
                        <div style={{fontSize:36,fontWeight:900,color:c.cor,letterSpacing:'-0.04em'}}>{c.pct}%</div>
                        <div style={{fontSize:14,fontWeight:800,color:T.black,marginBottom:4}}>{c.nome}</div>
                        <div style={{fontSize:11,color:T.gray1,lineHeight:1.4}}>{c.desc}</div>
                      </div>
                    ))}
                  </div>
                  {(item.rejeicao1!==undefined&&item.c1&&item.c2)&&(
                    <div style={{display:'flex',padding:'10px 14px',gap:16,borderTop:`1px solid ${T.border}`,background:'#FEF2F2'}}>
                      <span style={{flex:1,fontSize:11,color:'#991B1B'}}>Rejeição {item.c1?.nome||"".split('(')[0]}: <b>{(item.rejeicao1||0)}%</b></span>
                      <span style={{flex:1,fontSize:11,color:'#991B1B'}}>Rejeição {item.c2?.nome||"".split('(')[0]}: <b>{(item.rejeicao2||0)}%</b></span>
                    </div>
                  )}
                  {item.obs&&<div style={{padding:'10px 14px',background:'#FFFBEB',fontSize:11,color:'#92400E',borderTop:`1px solid ${T.border}`}}>ℹ️ {item.obs}</div>}
                </div>
              )}

              {item.tipo==='candidato'&&(
                <div style={{borderRadius:T.r.md,border:`1px solid ${T.border}`,overflow:'hidden'}}>
                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr'}}>
                    {[{label:'1º Turno',v:item.pct1turno||0,c:pc},{label:'2º Turno vs Lula',v:item.pct2turno||0,c:'#2E7D32'},{label:'Rejeição',v:item.rejeicao||0,c:'#E53935'}].map(({label,v,c})=>(
                      <div key={label} style={{padding:'16px',textAlign:'center',borderRight:'1px solid #eee'}}>
                        <div style={{fontSize:32,fontWeight:900,color:c}}>{v}%</div>
                        <div style={{fontSize:11,color:T.gray1}}>{label}</div>
                      </div>
                    ))}
                  </div>
                  {(item.pontos||[]).map((p,i)=><div key={i} style={{fontSize:12,color:T.black,padding:'8px 14px',borderTop:`1px solid ${T.border}`}}>• {p}</div>)}
                </div>
              )}

              {item.tipo==='aprovacao'&&(
                <div style={{borderRadius:T.r.md,border:`1px solid ${T.border}`,overflow:'hidden',padding:'16px'}}>
                  <div style={{display:'flex',gap:3,height:28,borderRadius:6,overflow:'hidden',marginBottom:12}}>
                    <div style={{width:`${(item.aprovacao||0)}%`,background:'#16A34A',display:'flex',alignItems:'center',justifyContent:'center'}}><span style={{fontSize:12,fontWeight:700,color:'white'}}>{(item.aprovacao||0)}%</span></div>
                    <div style={{width:`${(item.regular||0)}%`,background:'#F59E0B',display:'flex',alignItems:'center',justifyContent:'center'}}><span style={{fontSize:12,fontWeight:700,color:'white'}}>{(item.regular||0)}%</span></div>
                    <div style={{flex:1,background:'#E53935',display:'flex',alignItems:'center',justifyContent:'center'}}><span style={{fontSize:12,fontWeight:700,color:'white'}}>{(item.reprovacao||0)}%</span></div>
                  </div>
                  <div style={{display:'flex',gap:16,fontSize:12,marginBottom:10}}>
                    <span>🟢 Aprova: <b>{(item.aprovacao||0)}%</b></span>
                    <span>🟡 Regular: <b>{(item.regular||0)}%</b></span>
                    <span>🔴 Reprova: <b>{(item.reprovacao||0)}%</b></span>
                  </div>
                  <div style={{background:'#FFFBEB',borderRadius:T.r.sm,padding:'10px 12px',fontSize:12,color:'#92400E'}}>
                    <b>{(item.naoDeveCandidatar||0)}%</b> dos eleitores acham que Lula não deveria se candidatar à reeleição
                  </div>
                </div>
              )}

              {item.tipo==='calendario'&&(item.eventos?.length>0)&&(
                <div style={{borderRadius:T.r.md,border:`1px solid ${T.border}`,overflow:'hidden'}}>
                  {(item.eventos||[]).map((ev,i)=>(
                    <div key={i} style={{display:'flex',gap:14,padding:'12px 14px',borderBottom:i<(item.eventos?.length||0)-1?`1px solid ${T.border}`:'none',alignItems:'center',background:ev.tipo==='eleicao'?'#F5F3FF':ev.tipo==='posse'?'#F0FDF4':T.white}}>
                      <div style={{width:96,flexShrink:0,fontSize:12,fontWeight:700,color:ev.tipo==='eleicao'?pc:ev.tipo==='posse'?'#16A34A':'#6B7280'}}>{ev.data}</div>
                      <div style={{fontSize:13,color:T.black}}>{ev.evento}</div>
                    </div>
                  ))}
                </div>
              )}

              <div style={{fontSize:11,color:T.gray1,textAlign:'right'}}>Fonte: {item.fonte}</div>
            </>
          })()}

          {/* ── ESPORTES ── */}
          {!isLoto&&!isSpecialItem&&!isEleicaoItem && <>
            {/* Teams probabilities */}
            <div style={{display:'flex',flexDirection:'column',gap:0,borderRadius:T.r.md,overflow:'hidden',border:`1px solid ${T.border}`}}>
              {[item.home, item.away].map((side,i)=>{
                const winner=(side.pct||0)>(i===0?(item.away?.pct||0):(item.home?.pct||0))
                return (
                  <div key={i} style={{display:'flex',alignItems:'center',gap:14,padding:'14px 16px',borderBottom:i===0?`1px solid ${T.border}`:'none',background:winner?'#FAFAFA':T.white}}>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontSize:15,fontWeight:winner?800:600,color:T.black,marginBottom:2}}>{side.name}</div>
                      <div style={{fontSize:11,color:T.gray1}}>{side.sub}</div>
                      <div style={{height:3,borderRadius:2,background:winner?catColor:T.gray3,width:`${Math.max(10,side.pct)}%`,marginTop:6,transition:'width 0.6s'}}/>
                    </div>
                    <div style={{textAlign:'right',flexShrink:0}}>
                      <div style={{fontSize:24,fontWeight:900,color:winner?T.black:T.gray1,letterSpacing:'-0.04em'}}>{side.pct}%</div>
                      <div style={{fontSize:11,color:T.gray1}}>probabilidade</div>
                    </div>
                  </div>
                )
              })}
              {/* Draw row */}
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'10px 16px',background:'#F8F8F6'}}>
                <span style={{fontSize:12,color:T.gray1}}>Probabilidade de empate</span>
                <span style={{fontSize:14,fontWeight:700,color:T.black}}>{item.draw}%</span>
              </div>
            </div>

            {/* Guru pick */}
            <div style={{background:T.bg,borderRadius:T.r.md,padding:'14px 16px'}}>
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:10}}>
                <span style={{fontSize:11,fontWeight:700,color:T.black,letterSpacing:'0.06em'}}>PICK BetTv</span>
                <span style={{fontSize:13,fontWeight:800,background:T.green,color:T.white,borderRadius:T.r.pill,padding:'3px 12px'}}>{item.bettvConf||item.guruConf||0}% conf.</span>
              </div>
              <div style={{fontSize:18,fontWeight:900,color:catColor,letterSpacing:'-0.02em',marginBottom:6}}>{item.bettvPick||item.guruPick||"—"}</div>
              <p style={{fontSize:12,color:T.gray1,lineHeight:1.6,margin:0}}>{item.bettvReason||item.guruReason||"—"}</p>
            </div>


          </>}

          {/* ── METHODOLOGY — always 1 paragraph ── */}
          {!isSpecialItem&&!isEleicaoItem&&<div style={{borderTop:`1px solid ${T.border}`,paddingTop:14}}>
            <div style={{fontSize:11,fontWeight:700,color:T.black,letterSpacing:'0.06em',marginBottom:8}}>COMO A PREVISÃO É FEITA</div>
            <p style={{fontSize:12,color:T.gray1,lineHeight:1.7,margin:0}}>{methodText}</p>
          </div>}

          {/* Disclaimer */}
          <div style={{background:'#FFFBEB',border:'1px solid #FDE68A',borderRadius:T.r.sm,padding:'10px 14px',fontSize:11,color:'#92400E',lineHeight:1.5}}>
            <strong>Atenção:</strong> Previsões são baseadas em dados históricos e estatística. Não constituem garantia de resultado. Jogue com responsabilidade.
          </div>

        </div>
      </div>
    </div>
  )
}

// ─── SOCIAL PAGE ──────────────────────────────────────────────────────────────
const INITIAL_COMMENTS = {
  f1: [{id:1,user:'Fabio_SP',time:'2min',text:'Palmeiras tá dominando, 2×0 parece certo',likes:8},
       {id:2,user:'Viviane_Santos',time:'5min',text:'Lucas Moura faz falta demais pro SP',likes:3}],
  f2: [{id:1,user:'Marcos_RJ',time:'1min',text:'Flamengo vai virar, Memphis tá demais',likes:12}],
  t3: [{id:1,user:'AnaTenis',time:'10min',text:'Sinner vs Alcaraz vai ser épico!',likes:19}],
}

function SocialPage({appData}) {
  const [selectedCat, setSelectedCat] = useState('futebol')
  const [selectedCard, setSelectedCard] = useState(null)
  const [comments, setComments] = useState(INITIAL_COMMENTS)
  const [newComment, setNewComment] = useState('')
  const [userName, setUserName] = useState('')
  const [likedIds, setLikedIds] = useState([])

  // All items for selected category
  const catItems = selectedCat === 'loterias'
    ? appData.loterias.map(l => ({...l, id:l.id, title:l.nome, subtitle:l.descricao, status:'upcoming'}))
    : selectedCat === 'todos'
      ? (()=>{
          const flat=Object.entries(appData.esportes).filter(([k])=>k!=="esports").flatMap(([catKey,cat])=>
            (cat.items||[]).map(item=>({...item, _catKey:catKey}))
          )
          return flat.sort((a,b)=>{
            const aL=(a.status==='live')?0:1,bL=(b.status==='live')?0:1
            if(aL!==bL) return aL-bL
            return new Date(a.startTime||'2099')-new Date(b.startTime||'2099')
          })
        })()
      : selectedCat === 'crypto' || selectedCat === 'moedas'
        ? [] // crypto/moedas não têm chat
        : (appData.esportes[selectedCat]?.items || [])

  const card = selectedCard ? catItems.find(i=>i.id===selectedCard) : null
  const cardComments = selectedCard ? (comments[selectedCard]||[]) : []

  function postComment() {
    if (!newComment.trim() || !selectedCard) return
    const name = userName.trim() || 'Anônimo'
    const c = {id:Date.now(), user:name, time:'agora', text:newComment.trim(), likes:0}
    setComments(prev=>({...prev, [selectedCard]:[...(prev[selectedCard]||[]), c]}))
    setNewComment('')
  }

  function toggleLike(commentId) {
    const key = `${selectedCard}-${commentId}`
    if (likedIds.includes(key)) return
    setLikedIds(p=>[...p,key])
    setComments(prev=>({...prev, [selectedCard]:prev[selectedCard].map(c=>c.id===commentId?{...c,likes:c.likes+1}:c)}))
  }

  const totalComments = Object.values(comments).reduce((a,b)=>a+b.length,0)

  return (
    <div style={{maxWidth:1280,margin:'0 auto',width:'100%',display:'flex',gap:0,height:'calc(100vh - 54px)',overflow:'hidden',borderLeft:`1px solid ${T.border}`,borderRight:`1px solid ${T.border}`}}>
      {/* Left panel — category + card selector */}
      <div style={{width:260,flexShrink:0,borderRight:`1px solid ${T.border}`,overflowY:'auto',background:T.white}}>
        <div style={{padding:'16px 16px 8px',borderBottom:`1px solid ${T.border}`}}>
          <div style={{fontSize:12,fontWeight:700,color:T.black,letterSpacing:'0.06em',marginBottom:10}}>CATEGORIAS</div>
          <div style={{display:'flex',flexDirection:'column',gap:2}}>
            {TABS.map(({key,label})=>{
              const Ico=TAB_ICON[key]||IcoLottery
              const active=key===selectedCat
              return (
                <button key={key} onClick={()=>{setSelectedCat(key);setSelectedCard(null)}}
                  style={{display:'flex',alignItems:'center',gap:9,padding:'9px 12px',borderRadius:T.r.md,border:'none',background:active?T.bg:'transparent',color:active?T.black:T.gray1,fontSize:13,fontWeight:active?700:500,cursor:'pointer',textAlign:'left',transition:'all 0.12s'}}>
                  <Ico size={14} color={active?T.cat[key]:T.gray3}/>
                  {label}
                  {/* comment count badge */}
                  {(() => {
                    const items = key==='loterias' ? appData.loterias : (appData.esportes[key]?.items||[])
                    const cnt = items.reduce((a,i)=>a+(comments[i.id]?.length||0),0)
                    return cnt>0 ? <span style={{marginLeft:'auto',fontSize:10,fontWeight:700,background:T.green,color:T.white,borderRadius:T.r.pill,padding:'1px 7px'}}>{cnt}</span> : null
                  })()}
                </button>
              )
            })}
          </div>
        </div>
        {/* Event list */}
        <div style={{padding:'10px 10px'}}>
          <div style={{fontSize:11,fontWeight:700,color:T.gray1,letterSpacing:'0.05em',marginBottom:8,paddingLeft:4}}>EVENTOS</div>
          {catItems.map(item=>{
            const cnt=(comments[item.id]||[]).length
            const active=item.id===selectedCard
            const live=item.status==='live'
            return (
              <button key={item.id} onClick={()=>setSelectedCard(item.id)}
                style={{width:'100%',display:'flex',alignItems:'flex-start',gap:8,padding:'10px 10px',borderRadius:T.r.md,border:`1px solid ${active?T.black:T.border}`,background:active?'#F9F9F7':T.white,cursor:'pointer',marginBottom:6,textAlign:'left',transition:'all 0.12s'}}>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{display:'flex',alignItems:'center',gap:5,marginBottom:2}}>
                    {live&&<IcoLiveDot/>}
                    <span style={{fontSize:11,fontWeight:700,color:live?T.red:T.gray1,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{item.title||item.nome}</span>
                  </div>
                  <div style={{fontSize:10,color:T.gray1,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{((item.statusLabel||item.dias||"")).replace(/^(AO VIVO|EM ANDAMENTO)\s*[·\-·]?\s*/i,"")}</div>
                </div>
                {cnt>0&&<span style={{fontSize:10,fontWeight:700,color:T.gray1,flexShrink:0,paddingTop:1}}>{cnt}</span>}
                <IcoSocial size={12} color={cnt>0?T.green:T.gray3}/>
              </button>
            )
          })}
        </div>
      </div>

      {/* Right panel — comments */}
      <div style={{flex:1,display:'flex',flexDirection:'column',overflowY:'auto'}}>
        {!selectedCard ? (
          <div style={{flex:1,display:'flex',alignItems:'center',justifyContent:'center',flexDirection:'column',gap:12,color:T.gray1,padding:40}}>
            <IcoSocial size={40} color={T.gray3}/>
            <div style={{fontSize:14,fontWeight:600,color:T.gray1}}>Selecione um evento para ver e deixar comentários</div>
            <div style={{fontSize:12,color:T.gray3}}>{totalComments} comentários em {Object.keys(comments).length} eventos</div>
          </div>
        ) : (
          <>
            {/* Card header */}
            <div style={{padding:'16px 20px',borderBottom:`1px solid ${T.border}`,background:T.white,flexShrink:0}}>
              <div style={{fontSize:11,fontWeight:700,color:T.cat[selectedCat]||T.black,letterSpacing:'0.05em',marginBottom:4,textTransform:'uppercase'}}>{TABS.find(t=>t.key===selectedCat)?.label}</div>
              <div style={{fontSize:16,fontWeight:800,color:T.black,letterSpacing:'-0.03em'}}>{card?.title||card?.nome}</div>
              <div style={{fontSize:12,color:T.gray1,marginTop:2}}>{card?.competition||card?.descricao} · {((card?.statusLabel||card?.dias||"")).replace(/^(AO VIVO|EM ANDAMENTO)\s*[·\-·]?\s*/i,"")}</div>
              {/* Mini odds strip */}
              {card?.home && (
                <div style={{display:'flex',gap:8,marginTop:10}}>
                  {[{n:card.home?.name||'',p:card.home?.pct||0,c:T.cat[selectedCat]||T.black},{n:'Empate',p:card.draw,c:T.gray1},{n:card.away.name,p:card.away.pct,c:T.gray1}].map(({n,p,c},i)=>(
                    <div key={i} style={{background:T.bg,borderRadius:T.r.sm,padding:'6px 10px',fontSize:11,color:T.gray1}}>
                      <span style={{fontWeight:800,color:c,fontSize:13}}>{p}%</span> <span style={{color:T.gray1}}>{n}</span>
                    </div>
                  ))}
                  <div style={{marginLeft:'auto',background:'#F0FDF4',borderRadius:T.r.sm,padding:'6px 10px',fontSize:11}}>
                    <span style={{fontWeight:800,color:'#15803D'}}>{card.bettvConf||card.guruConf||0}%</span> <span style={{color:T.gray1}}>BetTv: {card.bettvPick||card.guruPick||"—"}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Comments list */}
            <div style={{flex:1,overflowY:'auto',padding:'16px 20px',display:'flex',flexDirection:'column',gap:10}}>
              {cardComments.length===0&&(
                <div style={{textAlign:'center',padding:'32px 0',color:T.gray1}}>
                  <IcoSocial size={28} color={T.gray3}/>
                  <div style={{marginTop:8,fontSize:13}}>Seja o primeiro a comentar!</div>
                </div>
              )}
              {cardComments.map(c=>(
                <div key={c.id} style={{background:T.white,borderRadius:T.r.md,border:`1px solid ${T.border}`,padding:'12px 14px'}}>
                  <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:6}}>
                    <div style={{display:'flex',alignItems:'center',gap:8}}>
                      <div style={{width:28,height:28,borderRadius:'50%',background:T.green,display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,fontWeight:800,color:T.white,flexShrink:0}}>
                        {c.user.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div style={{fontSize:12,fontWeight:700,color:T.black}}>{c.user}</div>
                        <div style={{fontSize:10,color:T.gray1}}>{c.time}</div>
                      </div>
                    </div>
                    <button onClick={()=>toggleLike(c.id)} style={{display:'flex',alignItems:'center',gap:4,background:'none',border:'none',cursor:'pointer',color:likedIds.includes(`${selectedCard}-${c.id}`)?T.green:T.gray1,padding:'4px 8px',borderRadius:T.r.sm}}>
                      <IcoThumb size={13} color={likedIds.includes(`${selectedCard}-${c.id}`)?T.green:T.gray1}/>
                      <span style={{fontSize:11,fontWeight:600}}>{c.likes}</span>
                    </button>
                  </div>
                  <p style={{fontSize:13,color:T.black,lineHeight:1.5,margin:0}}>{c.text}</p>
                </div>
              ))}
            </div>

            {/* Comment input */}
            <div style={{padding:'14px 20px',borderTop:`1px solid ${T.border}`,background:T.white,flexShrink:0}}>
              <div style={{display:'flex',gap:8,marginBottom:8}}>
                <input value={userName} onChange={e=>setUserName(e.target.value)} placeholder="Seu nome (opcional)" style={{flex:'0 0 160px',padding:'9px 12px',borderRadius:T.r.sm,border:`1px solid ${T.border}`,fontSize:12,color:T.black,outline:'none',fontFamily:'inherit',background:T.bg}}/>
              </div>
              <div style={{display:'flex',gap:8}}>
                <textarea value={newComment} onChange={e=>setNewComment(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();postComment()}}} placeholder="Compartilhe sua análise sobre este evento..." rows={2}
                  style={{flex:1,padding:'10px 12px',borderRadius:T.r.sm,border:`1px solid ${T.border}`,fontSize:13,color:T.black,outline:'none',fontFamily:'inherit',resize:'none',background:T.bg,lineHeight:1.5}}/>
                <button onClick={postComment} disabled={!newComment.trim()}
                  style={{width:44,borderRadius:T.r.sm,border:'none',background:newComment.trim()?T.green:T.gray2,cursor:newComment.trim()?'pointer':'default',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                  <IcoSend size={16} color={newComment.trim()?T.white:T.gray1}/>
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

// ─── ENGINE LOG ───────────────────────────────────────────────────────────────
const LOG_C={info:T.gray1,start:'#7C3AED',loading:'#D97706',success:'#059669',warn:'#D97706',error:'#DC2626',done:'#0369A1'}

function EngineLog({logs,updating,lastAt,countdown,progress,force}) {
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
function useGlobalSearch(appData) {
  // Build a flat searchable index from all content
  const index = useMemo(() => {
    const items = []
    // Esportes
    Object.entries(appData.esportes||{}).filter(([k])=>k!=='esports').forEach(([catKey, cat]) => {
      ;(cat.items||[]).forEach(item => {
        items.push({
          type: 'esporte', catKey,
          label: item.title,
          sub: item.competition,
          pick: item.bettvPick,
          conf: item.bettvConf,
          raw: `${item.title} ${item.competition} ${item.home?.name||''} ${item.away?.name||''} ${item.bettvPick||''}`.toLowerCase(),
          item,
        })
      })
    })
    // Loterias
    ;(appData.loterias||[]).forEach(lot => {
      items.push({
        type: 'loteria', catKey: 'loterias',
        label: lot.nome, sub: `Sorteio ${lot.data} · ${lot.premio}`,
        pick: `${lot.guruConf}% conf.`, conf: lot.guruConf,
        raw: `${lot.nome} ${lot.descricao}`.toLowerCase(),
        item: lot,
      })
    })
    // Crypto
    ;(appData.crypto||[]).forEach(c => {
      items.push({
        type: 'crypto', catKey: 'crypto',
        label: `${c.symbol} — ${c.name}`,
        sub: c.price ? `$${c.price>=1000?Number(c.price).toLocaleString('en-US',{maximumFractionDigits:0}):Number(c.price).toFixed(2)}` : '',
        pick: c.bettvPick, conf: c.bettvConf,
        raw: `${c.symbol} ${c.name} ${c.bettvPick||''}`.toLowerCase(),
        item: c,
      })
    })
    // Moedas
    ;(appData.moedas||[]).forEach(m => {
      items.push({
        type: 'moeda', catKey: 'moedas',
        label: `${m.symbol} — ${m.name}`,
        sub: m.priceBRL ? `R$ ${m.priceBRL>=1?Number(m.priceBRL).toFixed(2):Number(m.priceBRL).toFixed(5)}` : '',
        pick: m.bettvPick, conf: m.bettvConf,
        raw: `${m.symbol} ${m.name} ${m.flag||''} ${m.bettvPick||''}`.toLowerCase(),
        item: m,
      })
    })
    return items
  }, [appData])

  const search = useCallback((q) => {
    if (!q || q.trim().length < 2) return []
    const terms = q.trim().toLowerCase().split(/\s+/)
    return index
      .filter(entry => terms.every(t => entry.raw.includes(t)))
      .slice(0, 12)
  }, [index])

  return search
}

function SearchBar({appData, onTab, onPage, onSelectItem}) {
  const [query, setQuery]   = useState('')
  const [open,  setOpen]    = useState(false)
  const [focus, setFocus]   = useState(false)
  const inputRef = useRef(null)
  const search   = useGlobalSearch(appData)

  const results = useMemo(() => search(query), [search, query])
  const show = focus && query.length >= 2

  const CAT_COLOR = {
    esporte:'#1A7A4A', loteria:'#1A7A4A', crypto:'#D97706', moeda:'#0891B2',
  }
  const CAT_LABEL = {
    esporte:'Esporte', loteria:'Loteria', crypto:'Crypto', moeda:'Câmbio',
  }
  const PICK_COLOR = {ALTA:'#16A34A', QUEDA:'#E53935', NEUTRO:'#6B7280'}

  function handleSelect(entry) {
    setQuery('')
    setFocus(false)
    // Navigate to correct tab
    onPage('categorias')
    onTab(entry.catKey)
    // Open item modal
    setTimeout(() => onSelectItem(entry.item, entry.catKey), 80)
  }

  return (
    <div style={{position:'relative', flex:1, maxWidth:440}}>
      {/* Input */}
      <div style={{display:'flex',alignItems:'center',gap:8,background:focus?T.white:T.bg,border:`1.5px solid ${focus?T.black:T.border}`,borderRadius:T.r.pill,padding:'0 14px',height:36,transition:'border-color 0.15s,background 0.15s'}}>
        <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke={focus?T.black:T.gray1} strokeWidth="2.2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
        <input
          ref={inputRef}
          value={query}
          onChange={e=>setQuery(e.target.value)}
          onFocus={()=>setFocus(true)}
          onBlur={()=>setTimeout(()=>setFocus(false),150)}
          placeholder="Buscar times, cryptos, moedas, loterias…"
          style={{flex:1,border:'none',background:'transparent',fontSize:13,color:T.black,outline:'none',fontFamily:'inherit'}}
        />
        {query&&<button onClick={()=>{setQuery('');inputRef.current?.focus()}} style={{background:'none',border:'none',cursor:'pointer',padding:0,display:'flex',color:T.gray1}}>
          <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
        </button>}
      </div>

      {/* Dropdown */}
      {show&&(
        <div style={{position:'absolute',top:'calc(100% + 6px)',left:0,right:0,background:T.white,borderRadius:T.r.lg,border:`1px solid ${T.border}`,boxShadow:'0 12px 40px rgba(0,0,0,0.14)',zIndex:200,overflow:'hidden',maxHeight:420,overflowY:'auto'}}>
          {results.length===0
            ? <div style={{padding:'16px 16px',fontSize:13,color:T.gray1,textAlign:'center'}}>Nenhum resultado para "{query}"</div>
            : <>
                <div style={{padding:'8px 14px 6px',fontSize:10,fontWeight:700,color:T.gray1,letterSpacing:'0.06em',borderBottom:`1px solid ${T.border}`}}>
                  {results.length} resultado{results.length!==1?'s':''} para "{query}"
                </div>
                {results.map((entry, i) => {
                  const cc = CAT_COLOR[entry.type]||T.black
                  const pc = PICK_COLOR[entry.pick]||T.gray1
                  return (
                    <button key={i} onMouseDown={()=>handleSelect(entry)}
                      style={{width:'100%',display:'flex',alignItems:'center',gap:12,padding:'10px 14px',background:'none',border:'none',borderBottom:`1px solid ${T.border}`,cursor:'pointer',textAlign:'left',transition:'background 0.1s'}}
                      onMouseEnter={e=>e.currentTarget.style.background='#F7F7F5'}
                      onMouseLeave={e=>e.currentTarget.style.background='none'}>
                      {/* Type badge */}
                      <div style={{width:44,flexShrink:0,textAlign:'center',background:cc+'18',borderRadius:T.r.sm,padding:'3px 4px'}}>
                        <span style={{fontSize:9,fontWeight:800,color:cc,letterSpacing:'0.04em'}}>{CAT_LABEL[entry.type]}</span>
                      </div>
                      {/* Text */}
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{fontSize:13,fontWeight:700,color:T.black,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{entry.label}</div>
                        {entry.sub&&<div style={{fontSize:11,color:T.gray1,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{entry.sub}</div>}
                      </div>
                      {/* Pick badge */}
                      {entry.pick&&<div style={{flexShrink:0,background:pc,color:'white',borderRadius:T.r.pill,fontSize:10,fontWeight:800,padding:'2px 9px',whiteSpace:'nowrap'}}>{entry.pick}</div>}
                    </button>
                  )
                })}
              </>
          }
        </div>
      )}
    </div>
  )
}

function DesktopNav({tab, onTab, page, onPage, updating, countdown, progress, force, appData, onSelectItem}) {
  return (
    <div style={{background:T.white,borderBottom:`1px solid ${T.border}`,position:'sticky',top:0,zIndex:50}}>
      {/* Top bar */}
      <div style={{maxWidth:1280,margin:'0 auto',padding:'0 40px',display:'flex',alignItems:'center',justifyContent:'space-between',height:54,gap:20,width:'100%'}}>
        {/* Left: logo + nav */}
        <div style={{display:'flex',alignItems:'center',gap:24,flexShrink:0}}>
          <LogoSVG height={30}/>
          <nav style={{display:'flex',gap:2}}>
            {[
              {key:'categorias', label:'CATEGORIAS'},
              {key:'social',     label:'SOCIAL', icon:<IcoSocial size={13} color={page==='social'?T.black:T.gray1}/>},
            ].map(({key,label,icon})=>{
              const active=page===key
              return (
                <button key={key} onClick={()=>onPage(key)} style={{display:'flex',alignItems:'center',gap:6,padding:'5px 14px',borderRadius:T.r.sm,border:'none',background:'transparent',color:active?T.black:T.gray1,fontSize:13,fontWeight:active?700:500,cursor:'pointer',letterSpacing:'0.01em',position:'relative'}}>
                  {icon}{label}
                  {active&&<div style={{position:'absolute',bottom:-1,left:0,right:0,height:2,background:T.black,borderRadius:1}}/>}
                </button>
              )
            })}
          </nav>
        </div>

        {/* Center: search bar */}
        <SearchBar appData={appData} onTab={onTab} onPage={onPage} onSelectItem={onSelectItem}/>

        {/* Right: status + button */}
        <div style={{display:'flex',alignItems:'center',gap:10,flexShrink:0}}>
          {updating&&(
            <div style={{display:'flex',alignItems:'center',gap:6,background:'#FFF8E1',borderRadius:T.r.pill,padding:'6px 13px',border:'1px solid #FFE082'}}>
              <div style={{width:7,height:7,borderRadius:'50%',border:'2px solid #F59E0B',borderTopColor:'transparent',animation:'spin 0.8s linear infinite',flexShrink:0}}/>
              <span style={{fontSize:12,fontWeight:600,color:'#92400E'}}>{progress.current?`${progress.done}/${progress.total} — ${progress.current}...`:'Analisando...'}</span>
            </div>
          )}
          <button onClick={force} disabled={updating}
            style={{display:'flex',alignItems:'center',gap:7,background:updating?T.gray2:T.green,color:updating?T.gray1:T.white,border:'none',borderRadius:T.r.pill,padding:'8px 17px',fontSize:13,fontWeight:700,cursor:updating?'not-allowed':'pointer',transition:'background 0.15s',whiteSpace:'nowrap'}}>
            <IcoRefresh size={14} color={updating?T.gray1:T.white}/>
            {updating?'Atualizando...':'Atualizar previsões'}
          </button>
        </div>
      </div>

      {/* Category tabs */}
      {page==='categorias'&&(
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
      )}
    </div>
  )
}

// ─── MOBILE HEADER ────────────────────────────────────────────────────────────
function MobileHeader({tab, onTab, page, onPage, updating, countdown, progress, force}) {
  return (
    <div style={{background:T.white,borderBottom:`1px solid ${T.border}`,position:'sticky',top:0,zIndex:50}}>
      {/* Top bar — logo + botão atualizar */}
      <div style={{padding:'10px 16px 8px',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <LogoSVG height={29}/>
        <button onClick={force} disabled={updating}
          style={{display:'flex',alignItems:'center',gap:6,padding:'8px 16px',borderRadius:T.r.pill,background:updating?T.gray2:T.green,border:'none',color:updating?T.gray1:T.white,fontSize:14,fontWeight:700,cursor:updating?'not-allowed':'pointer',flexShrink:0}}>
          <IcoRefresh size={15} color={updating?T.gray1:T.white}/>
          {updating?'Analisando...':'Atualizar'}
        </button>
      </div>

      {/* Status bar */}
      {updating&&progress.current&&(
        <div style={{margin:'0 16px 6px',background:'#FFF8E1',borderRadius:T.r.sm,padding:'4px 12px',display:'flex',alignItems:'center',gap:7}}>
          <div style={{width:7,height:7,borderRadius:'50%',border:'2px solid #F59E0B',borderTopColor:'transparent',animation:'spin 0.8s linear infinite',flexShrink:0}}/>
          <span style={{fontSize:13,color:'#78350F'}}>{progress.done}/{progress.total} — <strong>{progress.current}</strong></span>
        </div>
      )}

      {/* Tab bar — scroll horizontal */}
      <div style={{display:'flex',overflowX:'auto',scrollbarWidth:'none',WebkitOverflowScrolling:'touch'}}>
        {TABS.map(({key,label})=>{
          const active = key===tab && page==='categorias'
          const Ico = TAB_ICON[key]||IcoLottery
          const catColor = T.cat[key]||T.black
          return (
            <button key={key} onClick={()=>{onPage('categorias');onTab(key)}}
              style={{display:'flex',alignItems:'center',gap:5,padding:'13px 14px',border:'none',
                borderBottom:`2px solid ${active?catColor:'transparent'}`,
                background:'transparent',color:active?catColor:T.gray1,
                fontSize:14,fontWeight:active?700:500,cursor:'pointer',
                whiteSpace:'nowrap',flexShrink:0,marginBottom:-1,transition:'all 0.12s'}}>
              <Ico size={15} color={active?catColor:T.gray3}/>
              {label}
            </button>
          )
        })}
        <button onClick={()=>onPage('social')}
          style={{display:'flex',alignItems:'center',gap:5,padding:'13px 14px',border:'none',
            borderBottom:`2px solid ${page==='social'?T.black:'transparent'}`,
            background:'transparent',color:page==='social'?T.black:T.gray1,
            fontSize:14,fontWeight:page==='social'?700:500,cursor:'pointer',
            whiteSpace:'nowrap',flexShrink:0,marginBottom:-1}}>
          <IcoSocial size={15} color={page==='social'?T.black:T.gray3}/>
          Social
        </button>
      </div>
    </div>
  )
}

// ─── MOBILE SPORT CARD — redesenhado ─────────────────────────────────────────
function MobileSportCard({item, catKey, onSelect}) {
  const catColor = T.cat[catKey]||T.black
  const catBg    = T.catBg[catKey]||T.gray2
  const label    = TABS.find(t=>t.key===catKey)?.label||catKey

  const isActuallyLive = (() => {
    if (!item.startTime) return false
    const now=Date.now(), start=new Date(item.startTime).getTime()
    if (isNaN(start)) return false
    if (item.multiDay) return now>=start && now<=start+7*24*60*60*1000
    const dur=({futebol:130,basquete:180,tenis:300,mma:420,esports:240,golf:360}[catKey]||180)*60*1000
    return now>=start && now<=start+dur
  })()

  return (
    <div onClick={()=>onSelect(item)}
      style={{background:item.predResult==='correct'?'#F0FDF4':item.predResult==='incorrect'?'#FEF2F2':item.predResult==='partial'?'#FFFBEB':T.white,borderRadius:T.r.lg,border:`2px solid ${item.predResult==='correct'?'#16A34A':item.predResult==='incorrect'?'#E53935':item.predResult==='partial'?'#D97706':T.border}`,
        marginBottom:10,cursor:'pointer',position:'relative',
        boxShadow:'0 1px 4px rgba(0,0,0,0.05)'}}>

      <ShareBtn item={item} catKey={catKey}/>
      {/* Header: categoria + competição */}
      <div style={{padding:'10px 14px 0',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
        <div style={{display:'flex',alignItems:'center',gap:6}}>
          <div style={{width:22,height:22,borderRadius:5,background:catBg,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
            {(() => { const I=TAB_ICON[catKey]||IcoLottery; return <I size={12} color={catColor}/> })()}
          </div>
          <span style={{fontSize:10,fontWeight:700,color:catColor,letterSpacing:'0.04em',textTransform:'uppercase'}}>{label}</span>
        </div>
        <span style={{fontSize:10,color:T.gray1,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',maxWidth:160}}>{item.competition}</span>
      </div>

      {/* Título + status */}
      <div style={{padding:'6px 14px 8px'}}>
        <div style={{fontSize:15,fontWeight:800,color:T.black,letterSpacing:'-0.03em',lineHeight:1.25,marginBottom:3}}>{item.title}</div>
        <div style={{display:'flex',alignItems:'center',gap:4}}>
          {isActuallyLive&&<><IcoLiveDot/><span style={{fontSize:10,fontWeight:700,color:item.multiDay?'#D97706':T.red,marginLeft:2}}>{item.multiDay?'EM ANDAMENTO':'AO VIVO'}</span><span style={{fontSize:10,color:T.gray1,margin:'0 3px'}}>·</span></>}
          <span style={{fontSize:11,color:T.gray1,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{(item.statusLabel||"").replace(/^(AO VIVO|EM ANDAMENTO)\s*[·\-·]?\s*/i,"")}</span>
        </div>
      </div>

      {/* Times com logos + probabilidades */}
      <div style={{padding:'0 14px',borderTop:`1px solid ${T.border}`}}>
        {[item.home,item.away].map((side,i)=>{
          const winner=(side.pct||0)>(i===0?(item.away?.pct||0):(item.home?.pct||0))
          return (
            <div key={i} style={{display:'flex',alignItems:'center',gap:10,padding:'9px 0',borderBottom:i===0?`1px solid ${T.border}`:'none'}}>
              <TeamLogo logo={side.logo} name={side.name} size={28}/>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:14,fontWeight:winner?700:500,color:T.black,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',marginBottom:4}}>{side.name}</div>
                <div style={{height:3,borderRadius:2,background:T.gray2,overflow:'hidden'}}>
                  <div style={{width:`${Math.max(5,side.pct)}%`,height:'100%',background:winner?catColor:T.gray3,borderRadius:2,transition:'width 0.5s'}}/>
                </div>
              </div>
              <div style={{minWidth:52,textAlign:'center',padding:'5px 10px',borderRadius:T.r.pill,
                border:`1.5px solid ${winner?catColor:T.gray3}`,
                color:winner?catColor:T.gray1,fontSize:14,fontWeight:800,
                background:winner?catBg:T.white,flexShrink:0}}>
                {side.pct}%
              </div>
            </div>
          )
        })}
      </div>

      {/* BetTv strip */}
      <div style={{padding:'8px 14px',background:'#F8F8F6',display:'flex',alignItems:'flex-start',gap:7}}>
        <span style={{fontSize:10,fontWeight:700,color:catColor,flexShrink:0,paddingTop:1,letterSpacing:'0.02em'}}>BetTv</span>
        <span style={{fontSize:11,color:T.black,fontWeight:600,flexShrink:0}}>{item.bettvPick||item.guruPick||'—'}</span>
        <span style={{fontSize:11,color:T.gray1,flex:1,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>· {item.bettvReason||item.guruReason||'—'}</span>
        <span style={{fontSize:11,fontWeight:800,color:T.white,background:catColor,borderRadius:T.r.pill,padding:'2px 8px',flexShrink:0}}>{item.bettvConf||item.guruConf||0}%</span>
      </div>

      {/* Footer */}
      <div style={{padding:'6px 14px 10px',display:'flex',justifyContent:'flex-end'}}>
        <span style={{fontSize:11,color:T.gray1}}>Empate {item.draw}%</span>
      </div>
    </div>
  )
}

// ─── MOBILE CHAT PAGE ─────────────────────────────────────────────────────────
// Página dedicada ao chat de um evento — seta para voltar, chat full screen
function MobileChatPage({item, catKey, onBack, appData}) {
  const [comments, setComments] = useState([])
  const [newComment, setNewComment] = useState('')
  const [userName, setUserName] = useState('')
  const [likedIds, setLikedIds] = useState([])
  const inputRef = useRef(null)

  const catColor = T.cat[catKey]||T.black
  const catBg    = T.catBg[catKey]||T.gray2
  const label    = TABS.find(t=>t.key===catKey)?.label||catKey
  const isLotoItem = !item.home && !item.away

  const isActuallyLive = (() => {
    if (!item.startTime) return false
    const now=Date.now(), start=new Date(item.startTime).getTime()
    if (isNaN(start)) return false
    if (item.multiDay) return now>=start && now<=start+7*24*60*60*1000
    const dur=({futebol:130,basquete:180,tenis:300,mma:420,esports:240,golf:360}[catKey]||180)*60*1000
    return now>=start && now<=start+dur
  })()

  function post() {
    if (!newComment.trim()) return
    const c = {id:Date.now(), user:userName.trim()||'Anônimo', time:'agora', text:newComment.trim(), likes:0}
    setComments(p=>[...p, c])
    setNewComment('')
  }

  function toggleLike(id) {
    if (likedIds.includes(id)) return
    setLikedIds(p=>[...p, id])
    setComments(p=>p.map(c=>c.id===id?{...c,likes:c.likes+1}:c))
  }

  return (
    <div style={{position:'fixed',inset:0,background:T.bg,zIndex:200,display:'flex',flexDirection:'column'}}>

      {/* Header com seta voltar */}
      <div style={{background:T.white,borderBottom:`1px solid ${T.border}`,flexShrink:0}}>
        <div style={{display:'flex',alignItems:'center',gap:12,padding:'12px 16px 10px'}}>
          <button onClick={onBack}
            style={{width:36,height:36,borderRadius:'50%',background:T.gray2,border:'none',
              display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',flexShrink:0}}>
            <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={T.black} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5"/><path d="m12 5-7 7 7 7"/></svg>
          </button>
          <div style={{flex:1,minWidth:0}}>
            <div style={{display:'flex',alignItems:'center',gap:6,marginBottom:2}}>
              <div style={{width:18,height:18,borderRadius:4,background:catBg,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                {(() => { const I=TAB_ICON[catKey]||IcoLottery; return <I size={10} color={catColor}/> })()}
              </div>
              <span style={{fontSize:10,fontWeight:700,color:catColor,textTransform:'uppercase',letterSpacing:'0.04em'}}>{label}</span>
              {isActuallyLive&&<><IcoLiveDot/><span style={{fontSize:10,fontWeight:700,color:item.multiDay?'#D97706':T.red}}>{item.multiDay?'EM ANDAMENTO':'AO VIVO'}</span></>}
            </div>
            <div style={{fontSize:15,fontWeight:800,color:T.black,letterSpacing:'-0.03em',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{item.title||item.nome}</div>
            <div style={{fontSize:11,color:T.gray1}}>{((item.statusLabel||item.dias||"")).replace(/^(AO VIVO|EM ANDAMENTO)\s*[·\-·]?\s*/i,"")}</div>
          </div>
        </div>

        {/* Mini probabilidades */}
        {item.home&&(
          <div style={{padding:'0 16px 12px',display:'flex',gap:6}}>
            {[
              {name:item.home?.name, pct:item.home?.pct||0, logo:item.home?.logo, winner:(item.home?.pct||0)>(item.away?.pct||0)},
              {name:'Empate', pct:item.draw, logo:null, winner:false},
              {name:item.away?.name, pct:item.away?.pct||0, logo:item.away?.logo, winner:(item.away?.pct||0)>(item.home?.pct||0)},
            ].map((s,i)=>(
              <div key={i} style={{flex:1,background:s.winner?catBg:T.gray2,borderRadius:T.r.sm,padding:'6px 8px',textAlign:'center'}}>
                <div style={{fontSize:13,fontWeight:800,color:s.winner?catColor:T.black}}>{s.pct}%</div>
                <div style={{fontSize:10,color:T.gray1,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{s.name}</div>
              </div>
            ))}
            <div style={{background:T.green,borderRadius:T.r.sm,padding:'6px 10px',textAlign:'center',flexShrink:0}}>
              <div style={{fontSize:13,fontWeight:800,color:T.white}}>{item.bettvConf||item.guruConf||0}%</div>
              <div style={{fontSize:10,color:'rgba(255,255,255,0.8)'}}>BetTv</div>
            </div>
          </div>
        )}
      </div>

      {/* Lista de comentários */}
      <div style={{flex:1,overflowY:'auto',padding:'12px 16px',display:'flex',flexDirection:'column',gap:10}}>
        {comments.length===0&&(
          <div style={{textAlign:'center',padding:'48px 0 24px',color:T.gray1}}>
            <IcoSocial size={32} color={T.gray3}/>
            <div style={{marginTop:10,fontSize:14,fontWeight:600,color:T.black}}>Nenhum comentário ainda</div>
            <div style={{fontSize:12,marginTop:4}}>Seja o primeiro a comentar!</div>
          </div>
        )}
        {comments.map(c=>(
          <div key={c.id} style={{background:T.white,borderRadius:T.r.lg,border:`1px solid ${T.border}`,padding:'12px 14px'}}>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:7}}>
              <div style={{display:'flex',alignItems:'center',gap:8}}>
                <div style={{width:30,height:30,borderRadius:'50%',background:catColor,display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,fontWeight:800,color:T.white,flexShrink:0}}>
                  {c.user.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div style={{fontSize:13,fontWeight:700,color:T.black}}>{c.user}</div>
                  <div style={{fontSize:10,color:T.gray1}}>{c.time}</div>
                </div>
              </div>
              <button onClick={()=>toggleLike(c.id)}
                style={{display:'flex',alignItems:'center',gap:4,background:'none',border:'none',cursor:'pointer',
                  color:likedIds.includes(c.id)?T.green:T.gray1,padding:'4px 8px',borderRadius:T.r.sm}}>
                <IcoThumb size={14} color={likedIds.includes(c.id)?T.green:T.gray1}/>
                <span style={{fontSize:12,fontWeight:600}}>{c.likes}</span>
              </button>
            </div>
            <p style={{fontSize:14,color:T.black,lineHeight:1.5,margin:0}}>{c.text}</p>
          </div>
        ))}
        <div style={{height:8}}/>
      </div>

      {/* Input de comentário — fixo no bottom */}
      <div style={{background:T.white,borderTop:`1px solid ${T.border}`,padding:'10px 16px',paddingBottom:'env(safe-area-inset-bottom,12px)',flexShrink:0}}>
        <div style={{display:'flex',gap:8,marginBottom:8}}>
          <input value={userName} onChange={e=>setUserName(e.target.value)}
            placeholder="Seu nome (opcional)"
            style={{flex:1,padding:'8px 12px',borderRadius:T.r.sm,border:`1px solid ${T.border}`,fontSize:13,
              color:T.black,outline:'none',fontFamily:'inherit',background:T.bg}}/>
        </div>
        <div style={{display:'flex',gap:8}}>
          <input ref={inputRef} value={newComment} onChange={e=>setNewComment(e.target.value)}
            onKeyDown={e=>e.key==='Enter'&&post()}
            placeholder="Escreva um comentário..."
            style={{flex:1,padding:'10px 14px',borderRadius:T.r.pill,border:`1.5px solid ${T.border}`,
              fontSize:14,color:T.black,outline:'none',fontFamily:'inherit',background:T.bg}}/>
          <button onClick={post} disabled={!newComment.trim()}
            style={{width:44,height:44,borderRadius:'50%',border:'none',
              background:newComment.trim()?T.green:T.gray2,cursor:newComment.trim()?'pointer':'default',
              display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
            <IcoSend size={16} color={newComment.trim()?T.white:T.gray1}/>
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── MOBILE EVENTS LIST ────────────────────────────────────────────────────────
// Lista de eventos para uma categoria — full screen com rows simples
function MobileEventsList({tab, appData, onSelect, onBack, updating, countdown, progress, force}) {
  const [filter, setFilter] = useState('all')

  const isLoto   = tab==='loterias'
  const isTodos  = tab==='todos'
  const isCrypto = tab==='crypto'
  const isMoedas = tab==='moedas'
  const catLabel = TABS.find(t=>t.key===tab)?.label || 'Eventos'
  const catColor = T.cat[tab]||T.black
  const catBg    = T.catBg[tab]||T.gray2

  const allEvents = (()=>{
    const flat = Object.entries(appData.esportes).filter(([k])=>k!=="esports").flatMap(([catKey,cat])=>
      (cat.items||[]).map(item=>({...item,_catKey:catKey}))
    )
    return flat.sort((a,b)=>{
      const aLive=(a.status==='live'||a.status==='inprogress')?0:1
      const bLive=(b.status==='live'||b.status==='inprogress')?0:1
      if(aLive!==bLive) return aLive-bLive
      return new Date(a.startTime||'2099')-new Date(b.startTime||'2099')
    })
  })()

  const espItems = appData.esportes[tab]?.items||[]

  const items = isLoto
    ? appData.loterias.filter(l=>filter==='all'||(filter==='acumulado'&&l.acumulado))
    : isTodos
      ? allEvents.filter(i=>filter==='all'||(filter==='live'&&i.status==='live')||(filter==='upcoming'&&i.status==='upcoming'))
      : espItems.filter(i=>filter==='all'||(filter==='live'&&i.status==='live')||(filter==='upcoming'&&i.status==='upcoming'))

  const liveCount = allEvents.filter(i=>i.status==='live').length

  return (
    <div style={{position:'fixed',inset:0,background:T.bg,zIndex:100,display:'flex',flexDirection:'column'}}>

      {/* Header */}
      <div style={{background:T.white,borderBottom:`1px solid ${T.border}`,flexShrink:0}}>
        <div style={{display:'flex',alignItems:'center',gap:12,padding:'12px 16px 10px'}}>
          <button onClick={onBack}
            style={{width:36,height:36,borderRadius:'50%',background:T.gray2,border:'none',
              display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',flexShrink:0}}>
            <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={T.black} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5"/><path d="m12 5-7 7 7 7"/></svg>
          </button>
          <div style={{flex:1}}>
            <div style={{fontSize:18,fontWeight:800,color:T.black,letterSpacing:'-0.03em'}}>
              {isTodos?'Todos os Eventos':catLabel}
            </div>
            <div style={{fontSize:11,color:T.gray1}}>{items.length} evento{items.length!==1?'s':''}</div>
          </div>
          <button onClick={force} disabled={updating}
            style={{width:36,height:36,borderRadius:'50%',background:updating?T.gray2:T.green,border:'none',
              display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',flexShrink:0}}>
            <IcoRefresh size={15} color={updating?T.gray1:T.white}/>
          </button>
        </div>

        {/* Filter pills */}
        {!isLoto&&!isCrypto&&!isMoedas&&(
          <div style={{display:'flex',gap:6,padding:'0 16px 12px',overflowX:'auto',scrollbarWidth:'none'}}>
            {[
              {f:'all',label:'Todos',count:isTodos?allEvents.length:espItems.length},
              {f:'live',label:'Ao Vivo',count:liveCount},
              {f:'upcoming',label:'Próximos',count:null},
            ].map(({f,label,count})=>{
              const active=filter===f
              return (
                <button key={f} onClick={()=>setFilter(f)}
                  style={{display:'flex',alignItems:'center',gap:5,padding:'6px 14px',borderRadius:T.r.pill,
                    border:'1.5px solid '+(active?catColor:T.border),
                    background:active?catColor:T.white,
                    color:active?T.white:T.black,
                    fontSize:12,fontWeight:active?700:500,cursor:'pointer',whiteSpace:'nowrap',flexShrink:0}}>
                  {f==='live'&&<IcoLiveDot/>}
                  {label}
                  {count!==null&&count>0&&<span style={{fontSize:11,opacity:active?0.8:0.5}}>·{count}</span>}
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* Lista de eventos */}
      <div style={{flex:1,overflowY:'auto',padding:'8px 0'}}>
        {updating&&(
          <div style={{padding:'8px 16px 4px',display:'flex',alignItems:'center',gap:7,background:'#FFF8E1',margin:'0 0 4px'}}>
            <div style={{width:7,height:7,borderRadius:'50%',border:'2px solid #F59E0B',borderTopColor:'transparent',animation:'spin 0.8s linear infinite',flexShrink:0}}/>
            <span style={{fontSize:12,color:'#78350F'}}>Atualizando previsões...</span>
          </div>
        )}

        {items.length===0&&(
          <div style={{textAlign:'center',padding:'64px 24px',color:T.gray1}}>
            <div style={{fontSize:40,marginBottom:12}}>📋</div>
            <div style={{fontSize:16,fontWeight:600,color:T.black}}>Nenhum evento</div>
            <div style={{fontSize:13,marginTop:6}}>Tente outro filtro</div>
          </div>
        )}

        {isLoto?items.map(lot=>(
          <button key={lot.id} onClick={()=>onSelect(lot,'loterias')}
            style={{width:'100%',display:'flex',alignItems:'center',gap:14,padding:'14px 18px',
              background:T.white,border:'none',borderBottom:`1px solid ${T.border}`,cursor:'pointer',textAlign:'left'}}>
            <div style={{width:40,height:40,borderRadius:10,background:lot.acumulado?'#FEF3C7':'#D1FAE5',
              display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
              <IcoLottery size={20} color={lot.acumulado?'#B45309':T.cat.loterias}/>
            </div>
            <div style={{flex:1,minWidth:0}}>
              <div style={{display:'flex',alignItems:'center',gap:6,marginBottom:2}}>
                <span style={{fontSize:15,fontWeight:700,color:T.black}}>{lot.nome}</span>
                {lot.acumulado&&<span style={{fontSize:10,fontWeight:700,background:'#FEF3C7',color:'#B45309',borderRadius:4,padding:'1px 6px'}}>ACUM</span>}
              </div>
              <div style={{fontSize:12,color:T.gray1}}>{lot.dias} · Conc. {lot.concurso}</div>
            </div>
            <div style={{textAlign:'right',flexShrink:0}}>
              <div style={{fontSize:15,fontWeight:900,color:T.black}}>{lot.premio}</div>
              <div style={{fontSize:11,color:T.cat.loterias,fontWeight:600}}>{lot.guruConf}% conf.</div>
            </div>
            <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={T.gray3} strokeWidth="2" strokeLinecap="round"><path d="m9 18 6-6-6-6"/></svg>
          </button>
        )):items.map(item=>{
          const cKey = item._catKey||tab
          const cc = T.cat[cKey]||T.black
          const cb = T.catBg[cKey]||T.gray2
          const cl = TABS.find(t=>t.key===cKey)?.label||cKey
          const live = (() => {
            if (item.status!=='live'&&item.status!=='inprogress') return false
            if (!item.startTime) return item.status==='live'
            const now=Date.now(),start=new Date(item.startTime).getTime()
            return now>=start-10*60*1000&&now<=start+150*60*1000
          })()
          return (
            <button key={item.id} onClick={()=>onSelect(item,cKey)}
              style={{width:'100%',display:'flex',alignItems:'center',gap:12,padding:'13px 18px',
                background:T.white,border:'none',borderBottom:`1px solid ${T.border}`,cursor:'pointer',textAlign:'left'}}>
              {/* Category icon */}
              <div style={{width:40,height:40,borderRadius:10,background:cb,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                {(() => { const I=TAB_ICON[cKey]||IcoLottery; return <I size={20} color={cc}/> })()}
              </div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{display:'flex',alignItems:'center',gap:6,marginBottom:3}}>
                  {live&&<IcoLiveDot/>}
                  <span style={{fontSize:11,color:live?T.red:T.gray1,fontWeight:live?700:400}}>{live?'AO VIVO':cl}</span>
                  {!live&&isTodos&&<span style={{fontSize:10,color:T.gray3}}>· {cl}</span>}
                </div>
                <div style={{fontSize:15,fontWeight:700,color:T.black,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',marginBottom:2}}>{item.title}</div>
                <div style={{fontSize:11,color:T.gray1,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{(item.statusLabel||"").replace(/^(AO VIVO|EM ANDAMENTO)\s*[·\-·]?\s*/i,"")}</div>
              </div>
              <div style={{textAlign:'right',flexShrink:0,minWidth:50}}>
                <div style={{fontSize:13,fontWeight:800,color:T.white,background:cc,borderRadius:T.r.pill,padding:'3px 8px',marginBottom:4}}>
                  {item.bettvConf||item.guruConf||0}%
                </div>
                <div style={{fontSize:11,color:T.gray1,fontWeight:600,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',maxWidth:60}}>{item.bettvPick||item.guruPick||'—'}</div>
              </div>
              <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={T.gray3} strokeWidth="2" strokeLinecap="round"><path d="m9 18 6-6-6-6"/></svg>
            </button>
          )
        })}
        <div style={{height:24}}/>
      </div>
    </div>
  )
}

// ─── CRYPTO CARD ──────────────────────────────────────────────────────────────
// ─── CRYPTO CARD — same style as KalshiSportCard ─────────────────────────────
function CryptoCard({item, onSelect}) {
  const [hov,setHov]=useState(false)
  const [imgErr,setImgErr]=useState(false)
  const catColor = T.cat.crypto||'#D97706'
  const catBg    = T.catBg.crypto||'#FEF3C7'
  const isUp   = item.bettvPick==='ALTA'
  const isDown = item.bettvPick==='QUEDA'
  const pickColor = isUp?'#16A34A':isDown?T.red:T.gray1
  const pickBg    = isUp?'#F0FDF4':isDown?'#FEF2F2':'#F8F8F5'
  const chg = item.change24h||0
  const chgColor = chg>0?'#16A34A':chg<0?T.red:T.gray1
  const fmtPrice = item.price>=1000
    ? '$'+Number(item.price).toLocaleString('en-US',{minimumFractionDigits:0,maximumFractionDigits:0})
    : item.price>=1 ? '$'+Number(item.price).toFixed(2)
    : '$'+Number(item.price).toFixed(5)

  // Bar width: map 0–100% based on 7-day trend signal
  const barW = Math.min(95, Math.max(5, 50 + (chg * 4)))

  return (
    <div onClick={()=>onSelect&&onSelect(item)} onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      style={{height:CARD_H,background:T.white,borderRadius:T.r.lg,border:`1px solid ${hov?'#C0C0BB':T.border}`,
        boxShadow:hov?'0 4px 20px rgba(0,0,0,0.1)':'0 1px 3px rgba(0,0,0,0.04)',
        transition:'box-shadow 0.15s,border-color 0.15s',display:'flex',flexDirection:'column',cursor:'pointer',position:'relative'}}>

      {/* Header */}
      <div style={{padding:'11px 14px 9px',paddingRight:38,display:'flex',justifyContent:'space-between',alignItems:'center',borderBottom:`1px solid ${T.border}`,flexShrink:0}}>
        <div style={{display:'flex',alignItems:'center',gap:8}}>
          <div style={{width:22,height:22,borderRadius:6,background:catBg,display:'flex',alignItems:'center',justifyContent:'center'}}>
            <IcoCrypto size={12} color={catColor}/>
          </div>
          <span style={{fontSize:11,fontWeight:700,color:catColor,letterSpacing:'0.04em',textTransform:'uppercase'}}>CRYPTO</span>
          <ShareBtn item={item} catKey="crypto"/>
        </div>
        <span style={{fontSize:11,color:T.gray1}}>Mercado 24h</span>
      </div>

      {/* Logo + name */}
      <div style={{padding:'10px 14px 8px',flexShrink:0,display:'flex',alignItems:'center',gap:12}}>
        {item.logo&&!imgErr
          ?<img src={item.logo} alt={item.symbol} onError={()=>setImgErr(true)}
              style={{width:40,height:40,objectFit:'contain',flexShrink:0}}/>
          :<div style={{width:40,height:40,borderRadius:'50%',background:catBg,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,fontSize:14,fontWeight:800,color:catColor}}>{(item.symbol||'').slice(0,3)}</div>
        }
        <div style={{flex:1,minWidth:0}}>
          <div style={{fontSize:15,fontWeight:800,color:T.black,letterSpacing:'-0.03em'}}>{item.symbol}</div>
          <div style={{fontSize:12,color:T.gray1,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{item.name}</div>
        </div>
      </div>

      {/* Price block */}
      <div style={{padding:'0 14px',flex:1,minHeight:0}}>
        <div style={{display:'flex',alignItems:'baseline',gap:10,padding:'8px 0',borderBottom:`1px solid ${T.border}`}}>
          <span style={{fontSize:22,fontWeight:900,color:T.black,letterSpacing:'-0.04em'}}>{fmtPrice}</span>
          <span style={{fontSize:14,fontWeight:700,color:chgColor}}>{chg>0?'+':''}{chg.toFixed(2)}%</span>
        </div>
        {/* Trend bar */}
        <div style={{padding:'10px 0 8px'}}>
          <div style={{display:'flex',justifyContent:'space-between',marginBottom:5}}>
            <span style={{fontSize:10,fontWeight:700,color:T.gray1,letterSpacing:'0.05em'}}>HOJE</span>
            <span style={{fontSize:10,color:T.gray1}}>{chg>=0?'Alta':'Queda'}</span>
          </div>
          <div style={{height:4,borderRadius:2,background:T.gray2,overflow:'hidden'}}>
            <div style={{height:'100%',width:`${barW}%`,background:isUp?'#16A34A':isDown?T.red:T.gray3,borderRadius:2,transition:'width 0.5s'}}/>
          </div>
        </div>
      </div>

      {/* BetTv strip */}
      <div style={{margin:'8px 14px 0',background:'#F8F8F5',borderRadius:T.r.sm,padding:'7px 10px',flexShrink:0}}>
        <div style={{display:'flex',alignItems:'flex-start',gap:6}}>
          <span style={{fontSize:10,fontWeight:700,color:catColor,whiteSpace:'nowrap',paddingTop:1,flexShrink:0}}>BetTv</span>
          <span style={{fontSize:11,color:T.gray1,lineHeight:1.4,flex:1,overflow:'hidden',display:'-webkit-box',WebkitLineClamp:2,WebkitBoxOrient:'vertical'}}>{item.bettvReason||'—'}</span>
          <span style={{fontSize:12,fontWeight:900,color:T.white,background:pickColor,borderRadius:T.r.pill,padding:'2px 8px',flexShrink:0,whiteSpace:'nowrap'}}>{item.bettvPick||'—'}</span>
        </div>
      </div>

      {/* Previsão Anual 2026 */}
      {item.yearPick&&(()=>{
        const yUp=item.yearPick==='ALTA', yDn=item.yearPick==='QUEDA'
        const yColor=yUp?'#16A34A':yDn?T.red:'#6B7280'
        const yBg=yUp?'#F0FDF4':yDn?'#FEF2F2':'#F8F8F5'
        const yBorder=yUp?'#BBF7D0':yDn?'#FECACA':'#E5E7EB'
        const arrow=yUp?'↑':yDn?'↓':'→'
        const label=`Previsão anual 2026  ${arrow}  ${item.yearPick} de ${item.yearConf}%`
        return (
          <div style={{margin:'0 14px 8px',background:yBg,borderRadius:T.r.sm,padding:'6px 10px',flexShrink:0,border:`1px solid ${yBorder}`}}>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:8,marginBottom:3}}>
              <span style={{fontSize:10,fontWeight:800,color:yColor,whiteSpace:'nowrap'}}>{label}</span>
            </div>
            <span style={{fontSize:10,color:'#6B7280',lineHeight:1.4,display:'block',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{item.yearReason||'—'}</span>
          </div>
        )
      })()}

      {/* Footer */}
      <div style={{padding:'4px 14px 10px',display:'flex',justifyContent:'space-between',alignItems:'center',flexShrink:0}}>
        <span style={{fontSize:11,color:T.gray1}}>Confiança BetTv</span>
        <span style={{fontSize:13,fontWeight:800,color:pickColor}}>{item.bettvConf||0}%</span>
      </div>
    </div>
  )
}

// ─── MOEDAS CARD — same style as KalshiSportCard ─────────────────────────────
function MoedasCard({item, onSelect}) {
  const [hov,setHov]=useState(false)
  const catColor = T.cat.moedas||'#0891B2'
  const catBg    = T.catBg.moedas||'#CFFAFE'
  const isUp   = item.bettvPick==='ALTA'
  const isDown = item.bettvPick==='QUEDA'
  const pickColor = isUp?'#16A34A':isDown?T.red:T.gray1
  const chg = item.change24h||0
  const chgColor = chg>0?'#16A34A':chg<0?T.red:T.gray1
  const fmtBRL = item.priceBRL>=1
    ? 'R$ '+Number(item.priceBRL).toFixed(2)
    : 'R$ '+Number(item.priceBRL).toFixed(5)
  const barW = Math.min(95, Math.max(5, 50 + (chg * 5)))

  return (
    <div onClick={()=>onSelect&&onSelect(item)} onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      style={{height:CARD_H,background:T.white,borderRadius:T.r.lg,border:`1px solid ${hov?'#C0C0BB':T.border}`,
        boxShadow:hov?'0 4px 20px rgba(0,0,0,0.1)':'0 1px 3px rgba(0,0,0,0.04)',
        transition:'box-shadow 0.15s,border-color 0.15s',display:'flex',flexDirection:'column',cursor:'pointer',position:'relative'}}>

      {/* Header */}
      <div style={{padding:'11px 14px 9px',paddingRight:38,display:'flex',justifyContent:'space-between',alignItems:'center',borderBottom:`1px solid ${T.border}`,flexShrink:0}}>
        <div style={{display:'flex',alignItems:'center',gap:8}}>
          <div style={{width:22,height:22,borderRadius:6,background:catBg,display:'flex',alignItems:'center',justifyContent:'center'}}>
            <IcoMoedas size={12} color={catColor}/>
          </div>
          <span style={{fontSize:11,fontWeight:700,color:catColor,letterSpacing:'0.04em',textTransform:'uppercase'}}>CÂMBIO</span>
          <ShareBtn item={item} catKey="moedas"/>
        </div>
        <span style={{fontSize:11,color:T.gray1}}>vs BRL · Hoje</span>
      </div>

      {/* Flag + name */}
      <div style={{padding:'10px 14px 8px',flexShrink:0,display:'flex',alignItems:'center',gap:12}}>
        <div style={{width:44,height:44,borderRadius:10,background:catBg,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,fontSize:26,lineHeight:1}}>
          {item.flag||'💱'}
        </div>
        <div style={{flex:1,minWidth:0}}>
          <div style={{fontSize:15,fontWeight:800,color:T.black,letterSpacing:'-0.03em'}}>{item.symbol}</div>
          <div style={{fontSize:12,color:T.gray1,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{item.name}</div>
        </div>
      </div>

      {/* Price block */}
      <div style={{padding:'0 14px',flex:1,minHeight:0}}>
        <div style={{display:'flex',alignItems:'baseline',gap:10,padding:'8px 0',borderBottom:`1px solid ${T.border}`}}>
          <span style={{fontSize:22,fontWeight:900,color:T.black,letterSpacing:'-0.04em'}}>{fmtBRL}</span>
          <span style={{fontSize:14,fontWeight:700,color:chgColor}}>{chg>0?'+':''}{chg.toFixed(2)}%</span>
        </div>
        {/* Trend bar */}
        <div style={{padding:'10px 0 8px'}}>
          <div style={{display:'flex',justifyContent:'space-between',marginBottom:5}}>
            <span style={{fontSize:10,fontWeight:700,color:T.gray1,letterSpacing:'0.05em'}}>HOJE</span>
            <span style={{fontSize:10,color:T.gray1}}>{chg>=0?'Valorização':'Desvalorização'}</span>
          </div>
          <div style={{height:4,borderRadius:2,background:T.gray2,overflow:'hidden'}}>
            <div style={{height:'100%',width:`${barW}%`,background:isUp?'#16A34A':isDown?T.red:T.gray3,borderRadius:2,transition:'width 0.5s'}}/>
          </div>
        </div>
      </div>

      {/* BetTv strip */}
      <div style={{margin:'8px 14px 0',background:'#F8F8F5',borderRadius:T.r.sm,padding:'7px 10px',flexShrink:0}}>
        <div style={{display:'flex',alignItems:'flex-start',gap:6}}>
          <span style={{fontSize:10,fontWeight:700,color:catColor,whiteSpace:'nowrap',paddingTop:1,flexShrink:0}}>BetTv</span>
          <span style={{fontSize:11,color:T.gray1,lineHeight:1.4,flex:1,overflow:'hidden',display:'-webkit-box',WebkitLineClamp:2,WebkitBoxOrient:'vertical'}}>{item.bettvReason||'—'}</span>
          <span style={{fontSize:12,fontWeight:900,color:T.white,background:pickColor,borderRadius:T.r.pill,padding:'2px 8px',flexShrink:0,whiteSpace:'nowrap'}}>{item.bettvPick||'—'}</span>
        </div>
      </div>

      {/* Previsão Anual 2026 */}
      {item.yearPick&&(()=>{
        const yUp=item.yearPick==='ALTA', yDn=item.yearPick==='QUEDA'
        const yColor=yUp?'#16A34A':yDn?T.red:'#6B7280'
        const yBg=yUp?'#F0FDF4':yDn?'#FEF2F2':'#F8F8F5'
        const yBorder=yUp?'#BBF7D0':yDn?'#FECACA':'#E5E7EB'
        const arrow=yUp?'↑':yDn?'↓':'→'
        const label=`Previsão anual 2026  ${arrow}  ${item.yearPick} de ${item.yearConf}%`
        return (
          <div style={{margin:'0 14px 8px',background:yBg,borderRadius:T.r.sm,padding:'6px 10px',flexShrink:0,border:`1px solid ${yBorder}`}}>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:8,marginBottom:3}}>
              <span style={{fontSize:10,fontWeight:800,color:yColor,whiteSpace:'nowrap'}}>{label}</span>
            </div>
            <span style={{fontSize:10,color:'#6B7280',lineHeight:1.4,display:'block',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{item.yearReason||'—'}</span>
          </div>
        )
      })()}

      {/* Footer */}
      <div style={{padding:'4px 14px 10px',display:'flex',justifyContent:'space-between',alignItems:'center',flexShrink:0}}>
        <span style={{fontSize:11,color:T.gray1}}>Confiança BetTv</span>
        <span style={{fontSize:13,fontWeight:800,color:pickColor}}>{item.bettvConf||0}%</span>
      </div>
    </div>
  )
}



// ─── ELEIÇÕES CARDS ──────────────────────────────────────────────────────────
function EleicaoCard({item, onSelect}) {
  const [hov,setHov]=useState(false)
  const catColor = T.cat.eleicoes||'#7C3AED'
  const catBg    = T.catBg.eleicoes||'#EDE9FE'

  const TIPO_LABEL = {
    cenario:'Cenário Geral', duelo:'Duelo Direto',
    candidato:'Candidato', aprovacao:'Aprovação', calendario:'Calendário',
  }
  const pickColor = item.bettvConf>=65?'#16A34A':item.bettvConf>=50?'#D97706':'#6B7280'

  return (
    <div onClick={()=>onSelect&&onSelect(item)}
      onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      style={{background:T.white,borderRadius:T.r.lg,border:`1px solid ${hov?'#A78BFA':T.border}`,
        boxShadow:hov?'0 4px 20px rgba(124,58,237,0.12)':'0 1px 3px rgba(0,0,0,0.04)',
        transition:'all 0.15s',cursor:'pointer',display:'flex',flexDirection:'column',position:'relative'}}>

      {/* Header */}
      <div style={{padding:'11px 14px 9px',display:'flex',justifyContent:'space-between',alignItems:'center',borderBottom:`1px solid ${T.border}`}}>
        <div style={{display:'flex',alignItems:'center',gap:8}}>
          <div style={{width:22,height:22,borderRadius:6,background:catBg,display:'flex',alignItems:'center',justifyContent:'center'}}>
            <IcoEleicoes size={12} color={catColor}/>
          </div>
          <span style={{fontSize:11,fontWeight:700,color:catColor,letterSpacing:'0.04em',textTransform:'uppercase'}}>ELEIÇÕES 2026</span>
        </div>
        <span style={{fontSize:10,color:T.gray1,fontWeight:600}}>{TIPO_LABEL[item.tipo]||''}</span>
        <ShareBtn item={item} catKey="eleicoes"/>
      </div>

      {/* Title */}
      <div style={{padding:'12px 14px 8px'}}>
        <div style={{fontSize:16,fontWeight:800,color:T.black,letterSpacing:'-0.03em',marginBottom:3}}>{item.titulo}</div>
        <div style={{fontSize:11,color:T.gray1}}>{item.subtitulo}</div>
      </div>

      {/* Content by type */}
      <div style={{padding:'0 14px',flex:1}}>

        {/* CENÁRIO — barra de candidatos */}
        {item.tipo==='cenario'&&item.candidatos&&(
          <div style={{display:'flex',flexDirection:'column',gap:5,paddingBottom:8}}>
            {item.candidatos.slice(0,4).map((c,i)=>(
              <div key={i} style={{display:'flex',alignItems:'center',gap:8}}>
                <div style={{width:80,fontSize:11,fontWeight:i<2?700:500,color:T.black,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{c.nome.split(' ')[0]}</div>
                <div style={{flex:1,height:6,background:T.gray2,borderRadius:3,overflow:'hidden'}}>
                  <div style={{height:'100%',width:`${c.pct}%`,background:c.cor,borderRadius:3,transition:'width 0.6s'}}/>
                </div>
                <div style={{width:32,textAlign:'right',fontSize:12,fontWeight:700,color:c.cor}}>{c.pct}%</div>
              </div>
            ))}
          </div>
        )}

        {/* DUELO — dois candidatos frente a frente */}
        {item.tipo==='duelo'&&item.c1&&item.c2&&(
          <div style={{display:'flex',alignItems:'center',gap:10,paddingBottom:10}}>
            <div style={{flex:1,textAlign:'center'}}>
              <div style={{fontSize:26,fontWeight:900,color:item.c1.cor}}>{item.c1.pct}%</div>
              <div style={{fontSize:12,fontWeight:700,color:T.black}}>{item.c1.nome.split('(')[0].trim()}</div>
              <div style={{fontSize:10,color:T.gray1}}>{item.c1.desc}</div>
            </div>
            <div style={{flexShrink:0,fontSize:14,fontWeight:800,color:T.gray1}}>VS</div>
            <div style={{flex:1,textAlign:'center'}}>
              <div style={{fontSize:26,fontWeight:900,color:item.c2.cor}}>{item.c2.pct}%</div>
              <div style={{fontSize:12,fontWeight:700,color:T.black}}>{item.c2.nome.split('(')[0].trim()}</div>
              <div style={{fontSize:10,color:T.gray1}}>{item.c2.desc}</div>
            </div>
          </div>
        )}

        {/* CANDIDATO */}
        {item.tipo==='candidato'&&(
          <div style={{paddingBottom:8}}>
            <div style={{display:'flex',gap:16,marginBottom:8}}>
              <div style={{textAlign:'center'}}>
                <div style={{fontSize:22,fontWeight:900,color:'#7C3AED'}}>{item.pct1turno}%</div>
                <div style={{fontSize:10,color:T.gray1}}>1º Turno</div>
              </div>
              <div style={{textAlign:'center'}}>
                <div style={{fontSize:22,fontWeight:900,color:'#2E7D32'}}>{item.pct2turno}%</div>
                <div style={{fontSize:10,color:T.gray1}}>2º Turno vs Lula</div>
              </div>
              <div style={{textAlign:'center'}}>
                <div style={{fontSize:22,fontWeight:900,color:'#E53935'}}>{item.rejeicao}%</div>
                <div style={{fontSize:10,color:T.gray1}}>Rejeição</div>
              </div>
            </div>
          </div>
        )}

        {/* APROVAÇÃO */}
        {item.tipo==='aprovacao'&&(
          <div style={{paddingBottom:8}}>
            <div style={{display:'flex',gap:3,height:20,borderRadius:4,overflow:'hidden',marginBottom:8}}>
              <div style={{width:`${item.aprovacao}%`,background:'#16A34A',display:'flex',alignItems:'center',justifyContent:'center'}}>
                <span style={{fontSize:10,fontWeight:700,color:'white'}}>{item.aprovacao}%</span>
              </div>
              <div style={{width:`${item.regular}%`,background:'#F59E0B',display:'flex',alignItems:'center',justifyContent:'center'}}>
                <span style={{fontSize:10,fontWeight:700,color:'white'}}>{item.regular}%</span>
              </div>
              <div style={{flex:1,background:'#E53935',display:'flex',alignItems:'center',justifyContent:'center'}}>
                <span style={{fontSize:10,fontWeight:700,color:'white'}}>{item.reprovacao}%</span>
              </div>
            </div>
            <div style={{display:'flex',gap:10,fontSize:10,color:T.gray1}}>
              <span>🟢 Aprova</span><span>🟡 Regular</span><span>🔴 Reprova</span>
            </div>
          </div>
        )}

        {/* CALENDÁRIO */}
        {item.tipo==='calendario'&&item.eventos&&(
          <div style={{display:'flex',flexDirection:'column',gap:4,paddingBottom:8}}>
            {item.eventos.slice(0,4).map((ev,i)=>(
              <div key={i} style={{display:'flex',gap:8,alignItems:'flex-start'}}>
                <span style={{fontSize:10,fontWeight:700,color:ev.tipo==='eleicao'?'#7C3AED':ev.tipo==='posse'?'#16A34A':T.gray1,whiteSpace:'nowrap',minWidth:72}}>{ev.data}</span>
                <span style={{fontSize:11,color:T.black}}>{ev.evento}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* BetTv strip */}
      <div style={{margin:'8px 14px',background:'#F5F3FF',borderRadius:T.r.sm,padding:'7px 10px'}}>
        <div style={{display:'flex',alignItems:'flex-start',gap:6}}>
          <span style={{fontSize:10,fontWeight:700,color:catColor,whiteSpace:'nowrap',paddingTop:1,flexShrink:0}}>BetTv</span>
          <span style={{fontSize:11,color:T.gray1,lineHeight:1.4,flex:1,overflow:'hidden',display:'-webkit-box',WebkitLineClamp:2,WebkitBoxOrient:'vertical'}}>{item.bettvReason}</span>
          <span style={{fontSize:11,fontWeight:900,color:'white',background:pickColor,borderRadius:T.r.pill,padding:'2px 8px',flexShrink:0,whiteSpace:'nowrap'}}>{item.bettvConf}%</span>
        </div>
      </div>

      {/* Footer */}
      <div style={{padding:'4px 14px 10px',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <span style={{fontSize:10,color:T.gray1}}>{item.fonte}</span>
        <span style={{fontSize:11,fontWeight:700,color:catColor}}>{item.bettvPick}</span>
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
  ::-webkit-scrollbar{width:0;height:0;}
  input{font-family:inherit;}
  input[type=number]::-webkit-inner-spin-button{-webkit-appearance:none;}
  @keyframes spin{to{transform:rotate(360deg)}}
  @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}
  @keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
  @keyframes slideUp{from{transform:translateY(100%)}to{transform:translateY(0)}}
`

// ─── APP ROOT ─────────────────────────────────────────────────────────────────
const SEED={loterias:LOTERIAS,esportes:ESPORTES,crypto:CRYPTO_DATA,moedas:MOEDAS_DATA}


export default function App() {
  const [tab,setTab]=useState('todos')
  const [page,setPage]=useState('categorias')
  const [selItem,setSelItem]=useState(null)
  const [activeFilter,setActiveFilter]=useState('all')
  // Chat navigation: null | 'tabs' | 'events' | 'chat'
  const [chatScreen,setChatScreen]=useState(null)
  const [chatCat,setChatCat]=useState('futebol')
  const [chatItem,setChatItem]=useState(null)

  const {appData,logs,updating,lastAt,countdown,progress,force}=useAutoUpdate(SEED)
  const {isMobile,isTablet,isDesktop}=useBreakpoint()

  const isLoto   = tab==='loterias'
  const isTodos  = tab==='todos'
  const isCrypto = tab==='crypto'
  const isMoedas = tab==='moedas'
  const isSpecial = isCrypto||isMoedas
  const espData  = (!isSpecial&&!isTodos) ? appData.esportes[tab] : null
  const espItems = espData?.items||[]
  const cryptoItems = appData.crypto||CRYPTO_DATA
  const moedasItems = appData.moedas||MOEDAS_DATA
  const catUpd   = updating&&(progress.current===tab||progress.current==='loterias'&&tab==='loterias')
  const totalLive=Object.values(appData.esportes).flatMap(d=>d.items||[]).filter(i=>{
    if(!i.startTime) return false
    const n=Date.now(), s=new Date(i.startTime).getTime()
    if(i.multiDay) return n>=s && n<=s+7*24*60*60*1000
    return n>=s && n<=s+6*60*60*1000
  }).length

  const allEvents = (()=>{
    const flat = Object.entries(appData.esportes).filter(([k])=>k!=="esports").flatMap(([catKey,cat])=>
      (cat.items||[]).map(item=>({...item,_catKey:catKey}))
    )
    return flat.sort((a,b)=>{
      const aLive=(a.status==='live'||a.status==='inprogress')?0:1
      const bLive=(b.status==='live'||b.status==='inprogress')?0:1
      if(aLive!==bLive) return aLive-bLive
      return new Date(a.startTime||'2099')-new Date(b.startTime||'2099')
    })
  })()

  // Real-time live check
  function isReallyLive(item) {
    if (!item.startTime) return false
    const now = Date.now()
    const start = new Date(item.startTime).getTime()
    return now >= start && now <= start + 6*60*60*1000
  }

  const currentItems = isLoto
    ? appData.loterias.filter(l=>activeFilter==='all'||(activeFilter==='acumulado'&&l.acumulado))
    : isCrypto ? cryptoItems
    : isMoedas ? moedasItems
    : isTodos
      ? allEvents.filter(i=>activeFilter==='all'||(activeFilter==='live'&&isReallyLive(i))||(activeFilter==='upcoming'&&!isReallyLive(i)))
      : espItems.filter(i=>activeFilter==='all'||(activeFilter==='live'&&isReallyLive(i))||(activeFilter==='upcoming'&&!isReallyLive(i)))

  function handleTab(k){setTab(k);setActiveFilter('all')}
  function handlePage(p){setPage(p);if(p!=='social')setChatScreen(null)}

  // ── Chat navigation helpers ──
  function openChatTabs() { setChatScreen('tabs'); setChatCat('futebol') }
  function openChatEvents(cat) { setChatCat(cat); setChatScreen('events') }
  function openChat(item, catKey) { setChatItem(item); setChatCat(catKey); setChatScreen('chat') }

  // ── DESKTOP ──
  if (isDesktop) {
    return (
      <div style={{display:'flex',flexDirection:'column',height:'100vh',background:T.bg}}>
        <style>{CSS}</style>
        <DesktopNav tab={tab} onTab={handleTab} page={page} onPage={handlePage} updating={updating} countdown={countdown} progress={progress} force={force} appData={appData} onSelectItem={setSelItem}/>
        <div style={{flex:1,overflowY:page==='social'?'hidden':'auto'}}>
          {page==='social'?<SocialPage appData={appData}/>:(
            <div style={{maxWidth:1280,margin:'0 auto',padding:'28px 40px 56px'}}>
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:22}}>
                <h1 style={{fontSize:24,fontWeight:800,color:T.black,letterSpacing:'-0.04em'}}>
                  {isLoto?'Loterias':isCrypto?'Crypto · Previsões do Dia':isMoedas?'Câmbio · Taxa do Dia':isTodos?'Todos os Eventos':TABS.find(t=>t.key===tab)?.label}
                </h1>
                {!isCrypto&&!isMoedas&&(
                  <div style={{display:'flex',gap:7}}>
                    {(isLoto?['all','acumulado']:['all','live','upcoming']).map(f=>(
                      <button key={f} onClick={()=>setActiveFilter(f)} style={{padding:'6px 15px',borderRadius:T.r.pill,border:`1px solid ${activeFilter===f?T.black:T.border}`,background:activeFilter===f?T.black:T.white,color:activeFilter===f?T.white:T.black,fontSize:12,fontWeight:activeFilter===f?700:500,cursor:'pointer',transition:'all 0.15s'}}>
                        {f==='all'?'Todos':f==='live'?'Ao Vivo':f==='upcoming'?'Próximos':'Acumulados'}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              
              <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:14,alignItems:'start'}}>
                {isLoto
                  ?currentItems.map(lot=><KalshiLotoCard key={lot.id} lot={lot} onSelect={setSelItem} catUpdating={catUpd}/>)
                  :isCrypto
                    ?currentItems.map(item=><CryptoCard key={item.id} item={item} onSelect={setSelItem}/>)
                  :isMoedas
                      ?currentItems.map(item=><MoedasCard key={item.id} item={item} onSelect={setSelItem}/>)
                      :currentItems.map(item=><KalshiSportCard key={item.id} item={item} catKey={item._catKey||tab} onSelect={setSelItem} catUpdating={isTodos?false:catUpd}/>)
                }
              </div>
            </div>
          )}
        </div>
        {selItem&&<InfoModal item={selItem} isLoto={!selItem.home&&!selItem.away&&!selItem.price&&!selItem.priceBRL&&!selItem.tipo} catKey={selItem.tipo!==undefined?'eleicoes':selItem.price!==undefined?'crypto':selItem.priceBRL!==undefined?'moedas':selItem._catKey||tab} onClose={()=>setSelItem(null)}/>}
      </div>
    )
  }

  // ── MOBILE/TABLET — CHAT SCREENS (Social page only) ──
  if (page==='social') {
    // Screen 3: Event chat
    if (chatScreen==='chat' && chatItem) {
      return (
        <div><style>{CSS}</style>
          <MobileChatPage item={chatItem} catKey={chatCat} onBack={()=>setChatScreen('events')} appData={appData}/>
        </div>
      )
    }
    // Screen 2: Events list
    if (chatScreen==='events') {
      return (
        <div><style>{CSS}</style>
          <MobileEventsList tab={chatCat} appData={appData} onSelect={openChat} onBack={()=>setChatScreen('tabs')} updating={updating} countdown={countdown} force={force}/>
        </div>
      )
    }
    // Screen 1: Category tabs for chat
    if (chatScreen==='tabs' || chatScreen===null) {
      return (
        <div style={{background:T.bg,minHeight:'100vh',paddingBottom:80}}>
          <style>{CSS}</style>
          {/* Header — same as MobileHeader but for Social */}
          <MobileHeader tab={tab} onTab={handleTab} page={page} onPage={handlePage} updating={updating} countdown={countdown} progress={progress} force={force}/>
          <div style={{padding:'16px'}}>
            <div style={{fontSize:12,fontWeight:700,color:T.gray1,letterSpacing:'0.06em',marginBottom:12}}>ESCOLHA UMA CATEGORIA</div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
              {TABS.filter(t=>t.key!=='todos'&&t.key!=='loterias').map(({key,label})=>{
                const Ico=TAB_ICON[key]||IcoLottery
                const cc=T.cat[key]||T.black
                const cb=T.catBg[key]||T.gray2
                const items=appData.esportes[key]?.items||[]
                const liveCount=items.filter(i=>i.status==='live').length
                return (
                  <button key={key} onClick={()=>openChatEvents(key)}
                    style={{background:T.white,borderRadius:T.r.lg,border:`1.5px solid ${T.border}`,padding:'14px 16px',display:'flex',flexDirection:'column',gap:10,cursor:'pointer',textAlign:'left',position:'relative'}}>
                    {liveCount>0&&<div style={{position:'absolute',top:8,right:8,background:T.red,color:T.white,fontSize:9,fontWeight:900,borderRadius:T.r.pill,padding:'1px 6px'}}>{liveCount} AO VIVO</div>}
                    <div style={{width:44,height:44,borderRadius:12,background:cb,display:'flex',alignItems:'center',justifyContent:'center'}}>
                      <Ico size={22} color={cc}/>
                    </div>
                    <div>
                      <div style={{fontSize:15,fontWeight:700,color:T.black,marginBottom:2}}>{label}</div>
                      <div style={{fontSize:11,color:T.gray1}}>{items.length} eventos</div>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
          {/* Bottom nav */}
          <div style={{position:'fixed',bottom:0,left:0,right:0,background:T.white,borderTop:`1px solid ${T.border}`,display:'flex',paddingTop:8,paddingBottom:'env(safe-area-inset-bottom,16px)',zIndex:100,boxShadow:'0 -2px 12px rgba(0,0,0,0.06)'}}>
            {[
              {key:'home',   label:'Início', Ico:IcoHome,  action:()=>handlePage('categorias')},
              {key:'social', label:'Social', Ico:IcoSocial,action:()=>{handlePage('social');setChatScreen('tabs')}},
              {key:'live',   label:'Ao Vivo',Ico:IcoPlay,  badge:totalLive, action:()=>handlePage('categorias')},
              {key:'perfil', label:'Perfil', Ico:IcoPerson,action:null},
            ].map(({key,label,Ico,badge,action})=>{
              const active=key==='social'
              const col=active?T.black:T.gray1
              return (
                <button key={key} onClick={()=>action&&action()}
                  style={{background:'none',border:'none',display:'flex',flexDirection:'column',alignItems:'center',gap:2,cursor:'pointer',position:'relative',flex:1,padding:'3px 0'}}>
                  {badge>0&&<span style={{position:'absolute',top:-2,right:'calc(50% - 18px)',background:T.red,color:T.white,fontSize:9,fontWeight:900,borderRadius:T.r.pill,padding:'1px 5px',lineHeight:1.5}}>{badge}</span>}
                  <Ico size={22} color={col}/>
                  <span style={{fontSize:10,fontWeight:active?700:400,color:col}}>{label}</span>
                  {active&&<div style={{width:4,height:4,borderRadius:'50%',background:T.black,marginTop:1}}/>}
                </button>
              )
            })}
          </div>
        </div>
      )
    }
  }

  // ── MOBILE/TABLET — MAIN PAGE (original responsive layout) ──
  return (
    <div style={{background:T.bg,minHeight:'100vh',paddingBottom:80}}>
      <style>{CSS}</style>
      <MobileHeader tab={tab} onTab={handleTab} page={page} onPage={handlePage} updating={updating} countdown={countdown} progress={progress} force={force}/>

      <div style={{padding:isTablet?'20px 24px':'12px 14px',maxWidth:isTablet?860:'100%',margin:'0 auto'}}>

        {/* Filter pills */}
        {!isLoto&&!isCrypto&&!isMoedas&&(
          <div style={{display:'flex',gap:6,marginBottom:14,overflowX:'auto',scrollbarWidth:'none',paddingBottom:2}}>
            {[
              {f:'all',     label:'Todos'},
              {f:'live',    label:'Ao Vivo'},
              {f:'upcoming',label:'Próximos'},
            ].map(({f,label})=>{
              const active=activeFilter===f
              const liveCount=allEvents.filter(i=>i.status==='live').length
              return (
                <button key={f} onClick={()=>setActiveFilter(f)}
                  style={{display:'flex',alignItems:'center',gap:5,padding:'7px 16px',borderRadius:T.r.pill,
                    border:'1.5px solid '+(active?T.black:T.border),
                    background:active?T.black:T.white,color:active?T.white:T.black,
                    fontSize:13,fontWeight:active?700:500,cursor:'pointer',whiteSpace:'nowrap',flexShrink:0}}>
                  {f==='live'&&<IcoLiveDot/>}
                  {label}
                  {f==='all'&&<span style={{fontSize:11,opacity:0.55}}>
                    {' '}({isTodos?allEvents.length:espItems.length})
                  </span>}
                  {f==='live'&&liveCount>0&&<span style={{fontSize:11,opacity:0.7}}>· {liveCount}</span>}
                </button>
              )
            })}
          </div>
        )}

        

        {/* Cards grid */}
        {isLoto?(
          <div style={{display:'grid',gridTemplateColumns:isTablet?'repeat(2,1fr)':'1fr',gap:12}}>
            {currentItems.map(lot=><LotoCard key={lot.id} lot={lot} onSelect={setSelItem} catUpdating={catUpd}/>)}
          </div>
        ):isCrypto?(
          <div style={{display:'grid',gridTemplateColumns:isTablet?'repeat(2,1fr)':'1fr',gap:12}}>
            {currentItems.map(item=><CryptoCard key={item.id} item={item} onSelect={setSelItem}/>)}
          </div>
        ):isMoedas?(
          <div style={{display:'grid',gridTemplateColumns:isTablet?'repeat(2,1fr)':'1fr',gap:12}}>
            {currentItems.map(item=><MoedasCard key={item.id} item={item} onSelect={setSelItem}/>)}
          </div>
        ):(
          <div style={{display:'flex',flexDirection:'column',gap:0}}>
            {currentItems.length===0?(
              <div style={{textAlign:'center',padding:'56px 0',color:T.gray1}}>
                <div style={{fontSize:36,marginBottom:12}}>📋</div>
                <div style={{fontSize:15,fontWeight:600,color:T.black}}>Nenhum evento</div>
                <div style={{fontSize:13,marginTop:4}}>Tente mudar o filtro acima</div>
              </div>
            ):(
              currentItems.map(item=>(
                <MobileSportCard key={item.id} item={item} catKey={item._catKey||tab} onSelect={setSelItem}/>
              ))
            )}
          </div>
        )}
      </div>

      {/* Bottom nav */}
      <div style={{position:'fixed',bottom:0,left:0,right:0,background:T.white,borderTop:`1px solid ${T.border}`,display:'flex',paddingTop:8,paddingBottom:'env(safe-area-inset-bottom,16px)',zIndex:100,boxShadow:'0 -2px 12px rgba(0,0,0,0.06)'}}>
        {[
          {key:'home',   label:'Início', Ico:IcoHome,  action:()=>{handlePage('categorias');handleTab('todos');setActiveFilter('all')}},
          {key:'social', label:'Social', Ico:IcoSocial,action:()=>{handlePage('social');setChatScreen('tabs')}},
          {key:'live',   label:'Ao Vivo',Ico:IcoPlay,  badge:totalLive,action:()=>{handlePage('categorias');setActiveFilter('live')}},
          {key:'perfil', label:'Perfil', Ico:IcoPerson,action:null},
        ].map(({key,label,Ico,badge,action})=>{
          const active=key==='home'?page==='categorias':key==='social'?page==='social':false
          const col=active?T.black:T.gray1
          return (
            <button key={key} onClick={()=>action&&action()}
              style={{background:'none',border:'none',display:'flex',flexDirection:'column',alignItems:'center',gap:2,cursor:'pointer',position:'relative',flex:1,padding:'3px 0'}}>
              {badge>0&&<span style={{position:'absolute',top:-2,right:'calc(50% - 18px)',background:T.red,color:T.white,fontSize:9,fontWeight:900,borderRadius:T.r.pill,padding:'1px 5px',lineHeight:1.5}}>{badge}</span>}
              <Ico size={22} color={col}/>
              <span style={{fontSize:10,fontWeight:active?700:400,color:col}}>{label}</span>
              {active&&<div style={{width:4,height:4,borderRadius:'50%',background:T.black,marginTop:1}}/>}
            </button>
          )
        })}
      </div>

      {selItem&&<InfoModal item={selItem} isLoto={!selItem.home&&!selItem.away&&!selItem.price&&!selItem.priceBRL&&!selItem.tipo} catKey={selItem.tipo!==undefined?'eleicoes':selItem.price!==undefined?'crypto':selItem.priceBRL!==undefined?'moedas':selItem._catKey||tab} onClose={()=>setSelItem(null)}/>}
    </div>
  )
}
