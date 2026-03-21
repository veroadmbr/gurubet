import React, { useState } from 'react'
import { LOTERIAS, ESPORTES, TABS } from './data.js'
import { T } from './theme.js'
import { useAutoUpdate } from './useAutoUpdate.js'

import Splash    from './components/Splash.jsx'
import Header    from './components/Header.jsx'
import LotoCard  from './components/LotoCard.jsx'
import SportCard from './components/SportCard.jsx'
import BetSheet  from './components/BetSheet.jsx'
import EngineLog from './components/EngineLog.jsx'
import BottomNav from './components/BottomNav.jsx'

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
