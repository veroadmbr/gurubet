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

const TAB_ICON = {
  todos: IcoAll, loterias: IcoLottery, futebol: IcoSoccer, basquete: IcoBasket,
  volei: IcoVolley, mma: IcoMMA, tenis: IcoTennis, esports: IcoEsports,
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

// ─── AI IMAGE CACHE — busca URLs de imagens via Claude ───────────────────────
const imageCache = {}
const pendingFetches = new Set()

async function fetchImageUrl(name) {
  if (!name || imageCache[name] !== undefined || pendingFetches.has(name)) return
  if (!API_KEY) { imageCache[name] = null; return }
  pendingFetches.add(name)
  try {
    const prompt = `Para o time/atleta "${name}", retorne SOMENTE uma URL direta de imagem PNG ou JPG (logo oficial ou foto profissional). Prefira Wikipedia Commons, sites oficiais de ligas, ATP/WTA, UFC. Se não souber uma URL válida, responda NONE.`
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method:'POST',
      headers:{'Content-Type':'application/json','x-api-key':API_KEY,'anthropic-version':'2023-06-01','anthropic-dangerous-direct-browser-access':'true'},
      body:JSON.stringify({model:'claude-sonnet-4-20250514',max_tokens:200,messages:[{role:'user',content:prompt}]})
    })
    if (!res.ok) throw new Error(res.status)
    const json = await res.json()
    const url = json.content?.find(b=>b.type==='text')?.text?.trim()||''
    imageCache[name] = (url && url!=='NONE' && url.startsWith('http')) ? url : null
  } catch { imageCache[name] = null }
  finally { pendingFetches.delete(name) }
}

// ─── KNOWN LOGOS — URLs verificadas ──────────────────────────────────────────
const LOGOS = {
  // Futebol BR
  saopaulo:     'https://upload.wikimedia.org/wikipedia/commons/6/67/S%C3%A3o_Paulo_FC.svg',
  palmeiras:    'https://upload.wikimedia.org/wikipedia/commons/1/10/Palmeiras_logo.svg',
  corinthians:  'https://upload.wikimedia.org/wikipedia/commons/b/b6/Logo-Corinthians.svg',
  flamengo:     'https://upload.wikimedia.org/wikipedia/commons/2/2b/Flamengo_escudo.svg',
  bahia:        'https://upload.wikimedia.org/wikipedia/commons/9/9e/EC_Bahia.svg',
  botafogo:     'https://upload.wikimedia.org/wikipedia/commons/9/93/Botafogo_de_Futebol_e_Regatas.svg',
  internacional:'https://upload.wikimedia.org/wikipedia/commons/f/f3/Sport_Club_Internacional.svg',
  gremio:       'https://upload.wikimedia.org/wikipedia/commons/e/eb/Gr%C3%AAmio_FBPA.svg',
  atleticmg:    'https://upload.wikimedia.org/wikipedia/commons/1/1e/Atletico_mineiro_galo.svg',
  fluminense:   'https://upload.wikimedia.org/wikipedia/commons/3/3d/Fluminense_Logo.svg',
  vasco:        'https://upload.wikimedia.org/wikipedia/commons/c/c7/Vasco_da_Gama_Cruz_de_Malta.svg',
  cruzeiro:     'https://upload.wikimedia.org/wikipedia/commons/f/f2/Cruzeiro_Esporte_Clube_-_Escudo.svg',
  sport:        'https://upload.wikimedia.org/wikipedia/commons/7/7d/Sport_Club_do_Recife.svg',
  fortaleza:    'https://upload.wikimedia.org/wikipedia/commons/1/1e/Escudo_do_Fortaleza.svg',
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
  realmadrid:   'https://upload.wikimedia.org/wikipedia/en/5/56/Real_Madrid_CF.svg',
  barcelona:    'https://upload.wikimedia.org/wikipedia/en/4/47/FC_Barcelona_%28crest%29.svg',
  atletimadrid: 'https://upload.wikimedia.org/wikipedia/en/f/f4/Atletico_Madrid_2017_logo.svg',
  psg:          'https://upload.wikimedia.org/wikipedia/en/a/a7/Paris_Saint-Germain_F.C..svg',
  bayernmunich: 'https://upload.wikimedia.org/wikipedia/commons/1/1f/FC_Bayern_M%C3%BCnchen_logo_%282002%E2%80%932017%29.svg',
  dortmund:     'https://upload.wikimedia.org/wikipedia/commons/6/67/Borussia_Dortmund_logo.svg',
  intermilan:   'https://upload.wikimedia.org/wikipedia/commons/0/05/FC_Internazionale_Milano_2021.svg',
  juventus:     'https://upload.wikimedia.org/wikipedia/commons/1/15/Juventus_FC_2017_logo.svg',
  napoli:       'https://upload.wikimedia.org/wikipedia/commons/2/2d/SSC_Napoli.svg',
  okc:          'https://upload.wikimedia.org/wikipedia/en/5/5d/Oklahoma_City_Thunder.svg',
  lakers:       'https://upload.wikimedia.org/wikipedia/commons/3/3c/Los_Angeles_Lakers_logo.svg',
  celtics:      'https://upload.wikimedia.org/wikipedia/en/8/8f/Boston_Celtics.svg',
  warriors:     'https://upload.wikimedia.org/wikipedia/en/0/01/Golden_State_Warriors_logo.svg',
  cavaliers:    'https://upload.wikimedia.org/wikipedia/en/4/4b/Cleveland_Cavaliers_logo.svg',
  rockets:      'https://upload.wikimedia.org/wikipedia/en/2/28/Houston_Rockets.svg',
  nuggets:      'https://upload.wikimedia.org/wikipedia/en/7/76/Denver_Nuggets.svg',
  heat:         'https://upload.wikimedia.org/wikipedia/en/f/fb/Miami_Heat_logo.svg',
  suns:         'https://upload.wikimedia.org/wikipedia/en/d/dc/Phoenix_Suns_logo.svg',
  sinner:       'https://www.atptour.com/-/media/alias/player-headshot/S0AG',
  alcaraz:      'https://www.atptour.com/-/media/alias/player-headshot/A0E2',
  sabalenka:    'https://www.wtatennis.com/-/media/alias/player-headshot/316494',
  gauff:        'https://www.wtatennis.com/-/media/alias/player-headshot/326408',
  fritz:        'https://www.atptour.com/-/media/alias/player-headshot/FA18',
  tsitsipas:    'https://www.atptour.com/-/media/alias/player-headshot/TS29',
  pereira:      'https://dmxg5wxfqgb4u.cloudfront.net/styles/athlete_bio_full_body/s3/2024-10/PEREIRA_ALEX_L_BELT.png',
  makhachev:    'https://dmxg5wxfqgb4u.cloudfront.net/styles/athlete_bio_full_body/s3/2023-10/MAKHACHEV_ISLAM_L_BELT.png',
  pantoja:      'https://dmxg5wxfqgb4u.cloudfront.net/styles/athlete_bio_full_body/s3/2024-09/PANTOJA_ALEXANDRE_L_BELT.png',
  loud:         'https://upload.wikimedia.org/wikipedia/commons/7/7e/LOUD_Esports_logo.png',
  t1:           'https://upload.wikimedia.org/wikipedia/commons/d/db/T1_logo.png',
}

// ─── TEAM / PLAYER LOGO ───────────────────────────────────────────────────────
// 1. Tenta URL do mapa LOGOS estático
// 2. Se falhar → busca via IA (Claude) e cacheia
// 3. Fallback → avatar com iniciais coloridas
function TeamLogo({logo, name, size=26}) {
  const [staticErr, setStaticErr] = useState(false)
  const [aiUrl, setAiUrl] = useState(undefined) // undefined=buscando, null=falhou, string=ok
  const [aiErr, setAiErr] = useState(false)

  const staticUrl = logo ? LOGOS[logo] : null
  const useStatic = staticUrl && !staticErr

  useEffect(() => {
    if (useStatic) return
    if (!name) { setAiUrl(null); return }
    if (imageCache[name] !== undefined) { setAiUrl(imageCache[name]); return }
    setAiUrl(undefined)
    fetchImageUrl(name).then(() => setAiUrl(imageCache[name] ?? null))
  }, [name, useStatic])

  // Avatar cores por inicial
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
  const isActuallyLive = (() => {
    if (item.status !== 'live' && item.status !== 'inprogress') return false
    if (!item.startTime) return item.status === 'live'
    const now = Date.now()
    const start = new Date(item.startTime).getTime()
    return now >= start - 10*60*1000 && now <= start + 150*60*1000
  })()
  const live = isActuallyLive
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
  const isActuallyLive = (() => {
    if (item.status !== 'live' && item.status !== 'inprogress') return false
    if (!item.startTime) return item.status === 'live'
    const now = Date.now()
    const start = new Date(item.startTime).getTime()
    return now >= start - 10*60*1000 && now <= start + 150*60*1000
  })()
  const live = isActuallyLive; const [hov,setHov]=useState(false)
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
    `A previsão é gerada analisando ${item.concurso ? `os ${item.concurso} sorteios históricos` : 'o histórico completo'} da ${item.nome}: frequência absoluta de cada dezena, ciclo de atraso (dezenas que estão atrasadas em relação à média), distribuição par/ímpar ideal (tipicamente 7-8 pares para Lotofácil, 3 pares para Mega-Sena), e padrão de soma das dezenas sorteadas. O algoritmo pondera esses quatro fatores para sugerir a combinação estatisticamente mais coerente com o perfil histórico do concurso — sem garantia de resultado, pois loteria é jogo de azar.`,

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

  const catColor = T.cat[catKey||'loterias'] || T.black
  const catLabel = TABS.find(t=>t.key===catKey)?.label || 'Loteria'
  const methodText = isLoto
    ? METHODOLOGY.loterias(item)
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
            <div style={{fontSize:18,fontWeight:800,color:T.black,letterSpacing:'-0.03em',lineHeight:1.2}}>{isLoto?item.nome:item.title}</div>
            {!isLoto&&<div style={{fontSize:12,color:T.gray1,marginTop:3}}>{item.competition} · {item.statusLabel}</div>}
            {isLoto&&<div style={{fontSize:12,color:T.gray1,marginTop:3}}>Concurso {item.concurso} · Sorteio {item.data}</div>}
          </div>
          <button onClick={onClose} style={{width:30,height:30,minWidth:30,borderRadius:'50%',border:'none',background:T.gray2,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',marginTop:2}}>
            <IcoClose size={16} color={T.gray1}/>
          </button>
        </div>

        <div style={{padding:'16px 24px 28px',display:'flex',flexDirection:'column',gap:12}}>

          {/* ── LOTERIAS ── */}
          {isLoto && <>
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

          {/* ── ESPORTES ── */}
          {!isLoto && <>
            {/* Teams probabilities */}
            <div style={{display:'flex',flexDirection:'column',gap:0,borderRadius:T.r.md,overflow:'hidden',border:`1px solid ${T.border}`}}>
              {[item.home, item.away].map((side,i)=>{
                const winner=side.pct>(i===0?item.away.pct:item.home.pct)
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

            {/* Volume info */}
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
              {[
                {label:'STATUS', value:item.status==='live'?'Ao Vivo':'Próximo'},
              ].map(({label,value})=>(
                <div key={label} style={{background:T.bg,borderRadius:T.r.sm,padding:'10px 12px'}}>
                  <div style={{fontSize:9,fontWeight:700,color:T.gray1,letterSpacing:'0.06em',marginBottom:4}}>{label}</div>
                  <div style={{fontSize:13,fontWeight:700,color:T.black}}>{value}</div>
                </div>
              ))}
            </div>
          </>}

          {/* ── METHODOLOGY — always 1 paragraph ── */}
          <div style={{borderTop:`1px solid ${T.border}`,paddingTop:14}}>
            <div style={{fontSize:11,fontWeight:700,color:T.black,letterSpacing:'0.06em',marginBottom:8}}>COMO A PREVISÃO É FEITA</div>
            <p style={{fontSize:12,color:T.gray1,lineHeight:1.7,margin:0}}>{methodText}</p>
          </div>

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
    <div style={{display:'flex',gap:0,height:'100%',minHeight:'calc(100vh - 110px)'}}>
      {/* Left panel — category + card selector */}
      <div style={{width:280,flexShrink:0,borderRight:`1px solid ${T.border}`,overflowY:'auto',background:T.white}}>
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
                  <div style={{fontSize:10,color:T.gray1,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{item.statusLabel||item.dias}</div>
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
              <div style={{fontSize:12,color:T.gray1,marginTop:2}}>{card?.competition||card?.descricao} · {card?.statusLabel||card?.dias}</div>
              {/* Mini odds strip */}
              {card?.home && (
                <div style={{display:'flex',gap:8,marginTop:10}}>
                  {[{n:card.home.name,p:card.home.pct,c:T.cat[selectedCat]||T.black},{n:'Empate',p:card.draw,c:T.gray1},{n:card.away.name,p:card.away.pct,c:T.gray1}].map(({n,p,c},i)=>(
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
function DesktopNav({tab, onTab, page, onPage, updating, countdown, queue, force}) {
  return (
    <div style={{background:T.white,borderBottom:`1px solid ${T.border}`,position:'sticky',top:0,zIndex:50}}>
      {/* Top bar */}
      <div style={{maxWidth:1280,margin:'0 auto',padding:'0 40px',display:'flex',alignItems:'center',justifyContent:'space-between',height:54}}>
        <div style={{display:'flex',alignItems:'center',gap:28}}>
          <div style={{display:'flex',alignItems:'center'}}>
            <LogoSVG height={30}/>
          </div>
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

      {/* Category tabs — only when on categorias page */}
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
function MobileHeader({tab, onTab, page, onPage, updating, countdown, queue, force}) {
  return (
    <div style={{background:T.white,borderBottom:`1px solid ${T.border}`,position:'sticky',top:0,zIndex:50}}>
      {/* Top bar — logo + botão atualizar */}
      <div style={{padding:'10px 16px 8px',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <LogoSVG height={24}/>
        <button onClick={force} disabled={updating}
          style={{display:'flex',alignItems:'center',gap:5,padding:'7px 14px',borderRadius:T.r.pill,background:updating?T.gray2:T.green,border:'none',color:updating?T.gray1:T.white,fontSize:12,fontWeight:700,cursor:updating?'not-allowed':'pointer',flexShrink:0}}>
          <IcoRefresh size={13} color={updating?T.gray1:T.white}/>
          {updating?'Analisando...':'Atualizar'}
        </button>
      </div>

      {/* Status bar */}
      {!updating&&countdown&&(
        <div style={{margin:'0 16px 6px',background:T.gray2,borderRadius:T.r.sm,padding:'4px 12px',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
          <span style={{fontSize:11,color:T.gray1}}>Próxima atualização</span>
          <span style={{fontSize:11,fontWeight:800,color:T.black,fontVariantNumeric:'tabular-nums'}}>{countdown}</span>
        </div>
      )}
      {updating&&queue.length>0&&(
        <div style={{margin:'0 16px 6px',background:'#FFF8E1',borderRadius:T.r.sm,padding:'4px 12px',display:'flex',alignItems:'center',gap:7}}>
          <div style={{width:7,height:7,borderRadius:'50%',border:'2px solid #F59E0B',borderTopColor:'transparent',animation:'spin 0.8s linear infinite',flexShrink:0}}/>
          <span style={{fontSize:11,color:'#78350F'}}>Analisando <strong>{queue[0]}</strong></span>
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
              style={{display:'flex',alignItems:'center',gap:4,padding:'9px 12px',border:'none',
                borderBottom:`2px solid ${active?catColor:'transparent'}`,
                background:'transparent',color:active?catColor:T.gray1,
                fontSize:12,fontWeight:active?700:500,cursor:'pointer',
                whiteSpace:'nowrap',flexShrink:0,marginBottom:-1,transition:'all 0.12s'}}>
              <Ico size={13} color={active?catColor:T.gray3}/>
              {label}
            </button>
          )
        })}
        <button onClick={()=>onPage('social')}
          style={{display:'flex',alignItems:'center',gap:4,padding:'9px 12px',border:'none',
            borderBottom:`2px solid ${page==='social'?T.black:'transparent'}`,
            background:'transparent',color:page==='social'?T.black:T.gray1,
            fontSize:12,fontWeight:page==='social'?700:500,cursor:'pointer',
            whiteSpace:'nowrap',flexShrink:0,marginBottom:-1}}>
          <IcoSocial size={13} color={page==='social'?T.black:T.gray3}/>
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
    if (item.status!=='live'&&item.status!=='inprogress') return false
    if (!item.startTime) return item.status==='live'
    const now=Date.now(), start=new Date(item.startTime).getTime()
    return now>=start-10*60*1000 && now<=start+150*60*1000
  })()

  return (
    <div onClick={()=>onSelect(item)}
      style={{background:T.white,borderRadius:T.r.lg,border:`1px solid ${T.border}`,
        marginBottom:10,overflow:'hidden',cursor:'pointer',
        boxShadow:'0 1px 4px rgba(0,0,0,0.05)'}}>

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
          {isActuallyLive&&<><IcoLiveDot/><span style={{fontSize:10,fontWeight:700,color:T.red,marginLeft:2}}>AO VIVO</span><span style={{fontSize:10,color:T.gray1,margin:'0 3px'}}>·</span></>}
          <span style={{fontSize:11,color:T.gray1,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{item.statusLabel}</span>
        </div>
      </div>

      {/* Times com logos + probabilidades */}
      <div style={{padding:'0 14px',borderTop:`1px solid ${T.border}`}}>
        {[item.home,item.away].map((side,i)=>{
          const winner=side.pct>(i===0?item.away.pct:item.home.pct)
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

// ─── GLOBAL CSS ───────────────────────────────────────────────────────────────
const CSS=`
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
  html,body{height:100%;}
  body{font-family:-apple-system,BlinkMacSystemFont,'SF Pro Display','Segoe UI',sans-serif;}
  svg{display:block;overflow:visible;}
  button{font-family:inherit;}
  ::-webkit-scrollbar{width:0;height:0;}
  input[type=number]::-webkit-inner-spin-button{-webkit-appearance:none;}
  @keyframes spin{to{transform:rotate(360deg)}}
  @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}
  @keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
  @keyframes slideUp{from{transform:translateY(100%)}to{transform:translateY(0)}}
`

// ─── APP ROOT ─────────────────────────────────────────────────────────────────
const SEED={loterias:LOTERIAS,esportes:ESPORTES}

export default function App() {
  const [tab,setTab]=useState('todos')
  const [page,setPage]=useState('categorias')
  const [selItem,setSelItem]=useState(null)
  const [activeFilter,setActiveFilter]=useState('all')
  const [showLog,setShowLog]=useState(false)

  const {appData,logs,updating,lastAt,countdown,queue,force}=useAutoUpdate(SEED)
  const {isMobile,isTablet,isDesktop}=useBreakpoint()

  const isLoto  = tab==='loterias'
  const isTodos = tab==='todos'
  const espData = appData.esportes[tab]
  const espItems= espData?.items||[]
  const catUpd  = updating&&queue.includes(tab)
  const totalLive=Object.values(appData.esportes).flatMap(d=>d.items).filter(i=>i.status==='live').length

  const allEvents = Object.entries(appData.esportes).flatMap(([catKey,cat])=>
    cat.items.map(item=>({...item,_catKey:catKey}))
  ).sort((a,b)=>new Date(a.startTime||'2099')-new Date(b.startTime||'2099'))

  const currentItems = isLoto
    ? appData.loterias.filter(l=>activeFilter==='all'||(activeFilter==='acumulado'&&l.acumulado))
    : isTodos
      ? allEvents.filter(i=>activeFilter==='all'||(activeFilter==='live'&&i.status==='live')||(activeFilter==='upcoming'&&i.status==='upcoming'))
      : espItems.filter(i=>activeFilter==='all'||(activeFilter==='live'&&i.status==='live')||(activeFilter==='upcoming'&&i.status==='upcoming'))

  function handleTab(k){setTab(k);setActiveFilter('all')}
  function handlePage(p){setPage(p)}

  // ── DESKTOP ──
  if (isDesktop) {
    return (
      <div style={{display:'flex',flexDirection:'column',height:'100vh',background:T.bg}}>
        <style>{CSS}</style>
        <DesktopNav tab={tab} onTab={handleTab} page={page} onPage={handlePage} updating={updating} countdown={countdown} queue={queue} force={force}/>
        <div style={{flex:1,overflowY:page==='social'?'hidden':'auto'}}>
          {page==='social'?<SocialPage appData={appData}/>:(
            <div style={{maxWidth:1280,margin:'0 auto',padding:'28px 40px 56px'}}>
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:22}}>
                <h1 style={{fontSize:24,fontWeight:800,color:T.black,letterSpacing:'-0.04em'}}>
                  {isLoto?'Loterias':isTodos?'Todos os Eventos':TABS.find(t=>t.key===tab)?.label}
                </h1>
                <div style={{display:'flex',gap:7}}>
                  {(isLoto?['all','acumulado']:['all','live','upcoming']).map(f=>(
                    <button key={f} onClick={()=>setActiveFilter(f)} style={{padding:'6px 15px',borderRadius:T.r.pill,border:`1px solid ${activeFilter===f?T.black:T.border}`,background:activeFilter===f?T.black:T.white,color:activeFilter===f?T.white:T.black,fontSize:12,fontWeight:activeFilter===f?700:500,cursor:'pointer',transition:'all 0.15s'}}>
                      {f==='all'?'Todos':f==='live'?'Ao Vivo':f==='upcoming'?'Próximos':'Acumulados'}
                    </button>
                  ))}
                </div>
              </div>
              {isLoto&&<div style={{background:'#FFFBEB',border:'1px solid #FDE68A',borderRadius:T.r.md,padding:'10px 16px',marginBottom:18,fontSize:12,color:'#78350F',lineHeight:1.6}}><strong>Jogo responsável.</strong> Sugestões baseadas em estatística histórica.</div>}
              <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:14,alignItems:'start'}}>
                {isLoto
                  ?currentItems.map(lot=><KalshiLotoCard key={lot.id} lot={lot} onSelect={setSelItem} catUpdating={catUpd}/>)
                  :currentItems.map(item=><KalshiSportCard key={item.id} item={item} catKey={item._catKey||tab} onSelect={setSelItem} catUpdating={isTodos?false:catUpd}/>)
                }
              </div>
            </div>
          )}
        </div>
        {selItem&&<InfoModal item={selItem} isLoto={isLoto} catKey={selItem._catKey||tab} onClose={()=>setSelItem(null)}/>}
      </div>
    )
  }

  // ── MOBILE / TABLET ──
  return (
    <div style={{background:T.bg,minHeight:'100vh',paddingBottom:80}}>
      <style>{CSS}</style>
      <MobileHeader tab={tab} onTab={handleTab} page={page} onPage={handlePage} updating={updating} countdown={countdown} queue={queue} force={force}/>

      {page==='social'?<SocialPage appData={appData}/>:(
        <div style={{padding:isTablet?'20px 24px':'12px 14px',maxWidth:isTablet?860:'100%',margin:'0 auto'}}>

          {!isLoto&&(
            <div style={{display:'flex',gap:6,marginBottom:14,overflowX:'auto',scrollbarWidth:'none',paddingBottom:2}}>
              {['all','live','upcoming'].map(f=>{
                const active=activeFilter===f
                const liveCount=allEvents.filter(i=>i.status==='live').length
                return (
                  <button key={f} onClick={()=>setActiveFilter(f)}
                    style={{padding:'7px 16px',borderRadius:T.r.pill,border:`1.5px solid ${active?T.black:T.border}`,background:active?T.black:T.white,color:active?T.white:T.black,fontSize:13,fontWeight:active?700:500,cursor:'pointer',whiteSpace:'nowrap',flexShrink:0,transition:'all 0.15s',display:'flex',alignItems:'center',gap:6}}>
                    {f==='all'?`Todos · ${isTodos?allEvents.length:espItems.length}`:
                     f==='live'?<><IcoLiveDot/><span style={{marginLeft:4}}>{`Ao Vivo${liveCount>0?' · '+liveCount:''}`}</span></>:
                     'Próximos'}
                  </button>
                )
              })}
            </div>
          )}

          {isLoto&&<div style={{background:'#FFFBEB',border:'1px solid #FDE68A',borderRadius:T.r.md,padding:'10px 14px',marginBottom:14,fontSize:12,color:'#78350F',lineHeight:1.6}}><strong>Jogo responsável.</strong> Sugestões baseadas em estatística.</div>}

          {isLoto?(
            <div style={{display:'grid',gridTemplateColumns:isTablet?'repeat(2,1fr)':'1fr',gap:12}}>
              {currentItems.map(lot=><LotoCard key={lot.id} lot={lot} onSelect={setSelItem} catUpdating={catUpd}/>)}
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
      )}

      {/* Bottom nav */}
      <div style={{position:'fixed',bottom:0,left:0,right:0,background:T.white,borderTop:`1px solid ${T.border}`,display:'flex',paddingTop:8,paddingBottom:'env(safe-area-inset-bottom,16px)',zIndex:100,boxShadow:'0 -2px 12px rgba(0,0,0,0.06)'}}>
        {[
          {key:'home',   label:'Início', Ico:IcoHome,  action:()=>{handlePage('categorias');handleTab('todos');setActiveFilter('all')}},
          {key:'social', label:'Social', Ico:IcoSocial,action:()=>handlePage('social')},
          {key:'live',   label:'Ao Vivo',Ico:IcoPlay,  badge:totalLive,action:()=>{handlePage('categorias');setActiveFilter('live');if(isTodos||!tab||tab==='loterias')handleTab('todos')}},
          {key:'profile',label:'Perfil', Ico:IcoPerson,action:null},
        ].map(({key,label,Ico,badge,action})=>{
          const active=key==='home'?(page==='categorias'&&tab==='todos'&&activeFilter==='all'):key==='social'?page==='social':key==='live'?activeFilter==='live':false
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

      {selItem&&<InfoModal item={selItem} isLoto={isLoto} catKey={selItem._catKey||tab} onClose={()=>setSelItem(null)}/>}
    </div>
  )
}
