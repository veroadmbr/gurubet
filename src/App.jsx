import React, { useState, useEffect, useCallback, useRef } from "react";

// Leia a chave da API do ambiente (configure no Vercel: VITE_ANTHROPIC_API_KEY)
const ANTHROPIC_API_KEY = import.meta.env.VITE_ANTHROPIC_API_KEY || "";

// ─────────────────────────────────────────────────────────────────────────────
//  GURU DAS BETS — Tabby-style UI + Motor IA Claude (auto-update 2h)
// ─────────────────────────────────────────────────────────────────────────────

const UPDATE_INTERVAL_MS = 2 * 60 * 60 * 1000;
const GREEN = "#00D672";
const BLACK = "#111111";
const GRAY_BG = "#F5F5F5";
const GRAY_TEXT = "#8A8A8A";
const BORDER = "#EBEBEB";

// ── SEED DATA ─────────────────────────────────────────────────────────────────
const SEED = {
  loterias: [
    { id:"mega",       nome:"Mega-Sena",   emoji:"🟢", cor:GREEN,     concurso:"2987", data:"21/03", diasSorteio:"Ter · Qui · Sáb", premio:"R$ 8.000.000",  acumulado:false, ultimoResultado:[1,5,13,26,41,53],                     aposta:"R$ 6",  descricao:"6 de 60", regras:"Acerte 4, 5 ou 6",  guruNums:[10,53,37,5,34,33],                          guruConf:18, guruAnalise:"Baseado em 2.986 sorteios. Números 10 (352×), 53 (339×) lideram historicamente." },
    { id:"lotofacil",  nome:"Lotofácil",   emoji:"🔵", cor:"#2563EB",  concurso:"3642", data:"21/03", diasSorteio:"Seg a Sáb",      premio:"R$ 3.000.000",  acumulado:false, ultimoResultado:[1,2,3,5,6,9,10,13,14,16,19,20,21,22,25], aposta:"R$ 3",  descricao:"15 de 25", regras:"Acerte 11 a 15",    guruNums:[20,25,10,11,13,2,5,3,7,8,14,17,19,21,23],   guruConf:34, guruAnalise:"Top 5 históricos: 20, 25, 10, 11, 13. Conc. 3641: 7P/8I — padrão mais comum." },
    { id:"quina",      nome:"Quina",       emoji:"🟣", cor:"#7C3AED",  concurso:"6982", data:"21/03", diasSorteio:"Seg a Sáb",      premio:"R$ 2.500.000",  acumulado:false, ultimoResultado:[14,22,31,44,57],                      aposta:"R$ 3",  descricao:"5 de 80",  regras:"Acerte 2 a 5",      guruNums:[4,13,47,55,25],                             guruConf:22, guruAnalise:"+6.800 concursos. Frequentes: 04, 13, 47, 55, 25." },
    { id:"timemania",  nome:"Timemania",   emoji:"⚽", cor:"#EA580C",  concurso:"2371", data:"22/03", diasSorteio:"Ter · Qui · Sáb", premio:"R$ 12.500.000", acumulado:true,  ultimoResultado:[8,14,27,33,42,51,68],                 aposta:"R$ 3,50",descricao:"7 de 80", regras:"Acerte 3 a 7",      guruNums:[14,27,38,42,55,61,70],                      guruConf:12, guruAnalise:"Acumulado! 5 acertaram 6 nos do conc. 2369. Ciclo de atraso favorece extremos." },
    { id:"duplasena",  nome:"Dupla Sena",  emoji:"🎲", cor:"#DC2626",  concurso:"2940", data:"23/03", diasSorteio:"Seg · Qua · Sex", premio:"R$ 6.500.000",  acumulado:true,  ultimoResultado:[7,18,25,33,41,48],                    aposta:"R$ 3",  descricao:"6 de 50",  regras:"2 sorteios p/ conc.", guruNums:[5,18,33,41,49,53],                           guruConf:15, guruAnalise:"2939: sem ganhadores em ambos sorteios. Análise ponderada 200 conc." },
    { id:"diadesorte", nome:"Dia de Sorte",emoji:"🍀", cor:"#059669",  concurso:"1212", data:"22/03", diasSorteio:"Ter · Qui · Sáb", premio:"R$ 73.000.000", acumulado:true,  ultimoResultado:[4,7,13,18,22,24,29],                  aposta:"R$ 3,50",descricao:"7 de 31", regras:"+ Mês da Sorte",    guruNums:[7,13,18,22,24,28,29],                       guruConf:14, guruAnalise:"R$73M acumulado. Atraso estratégico favorece 7, 13, 18." },
  ],
  esportes: {
    futebol:  { label:"Futebol",  icon:"⚽", color:"#16A34A", items:[
      { id:"f1", status:"live", statusLabel:"Hoje · 21h30 · Morumbis",    competition:"Brasileirão · 8ª Rodada", title:"São Paulo × Palmeiras", subtitle:"Quem vence o Choque-Rei?",  guruPick:"Palmeiras",  guruConf:62, guruReason:"Palmeiras líder, saldo +11. SP sem Lucas Moura (lesão).", home:{name:"São Paulo",  sub:"2º · 16pts",pct:31,color:"#CC0000"}, away:{name:"Palmeiras", sub:"1º · 16pts",pct:48,color:"#006437"}, draw:21, vol:"R$18.4M" },
      { id:"f2", status:"live", statusLabel:"Hoje · 20h30 · Neo Química", competition:"Brasileirão · 8ª Rodada", title:"Corinthians × Flamengo", subtitle:"Clássico nacional em São Paulo", guruPick:"Empate",guruConf:38, guruReason:"Timão 5 sem vencer mas em casa. Fla vem de 4V seguidas.", home:{name:"Corinthians",sub:"9º · 8pts", pct:26,color:"#111827"}, away:{name:"Flamengo",  sub:"4º · 13pts",pct:44,color:"#CC0000"}, draw:30, vol:"R$14.2M" },
      { id:"f3", status:"upcoming",statusLabel:"22/03 · 18h30 · Maracanã",competition:"Brasileirão · 8ª Rodada", title:"Fluminense × Atlético-MG",subtitle:"Duelo no Maracanã",      guruPick:"Fluminense",guruConf:48, guruReason:"Flu em casa, 5º · 13pts. Atlético oscila fora.", home:{name:"Fluminense",sub:"5º · 13pts",pct:44,color:"#6B0F2B"}, away:{name:"Atlético-MG",sub:"8º · 10pts",pct:32,color:"#111827"}, draw:24, vol:"R$7.1M" },
      { id:"f4", status:"upcoming",statusLabel:"22/03 · 16h00 · Nilton Santos",competition:"Brasileirão · 8ª Rodada",title:"Vasco × Grêmio",subtitle:"Gigante da Colina recebe o Tricolor",guruPick:"Vasco",guruConf:52,guruReason:"Vasco em casa (venceu Flu 3×2). Grêmio viagem longa.",home:{name:"Vasco",sub:"10º · 9pts",pct:45,color:"#1a1a1a"},away:{name:"Grêmio",sub:"7º · 11pts",pct:31,color:"#0052A5"},draw:24,vol:"R$6.8M" },
    ]},
    basquete: { label:"Basquete", icon:"🏀", color:"#F59E0B", items:[
      { id:"b1", status:"live", statusLabel:"Hoje · 19h · Ibirapuera", competition:"NBB 2025/26 · 30ª Rodada", title:"Flamengo × Pinheiros", subtitle:"Lider do NBB recebe o Mengão",guruPick:"Flamengo",guruConf:61,guruReason:"Flamengo virou 15pts de vantagem recentemente.",home:{name:"Flamengo",sub:"3º · 21V",pct:58,color:"#CC0000"},away:{name:"Pinheiros",sub:"1º · 26V",pct:30,color:"#1a7431"},draw:12,vol:"R$2.1M" },
      { id:"b2", status:"upcoming",statusLabel:"21/03 · 20h · Arena Caixa",competition:"NBB 2025/26 · 30ª Rodada",title:"Sesi Franca × Fortaleza BC",subtitle:"Tetracampeão busca mais uma",guruPick:"Sesi Franca",guruConf:78,guruReason:"31pts de Lucas Dias. 8V dos últimos 10.",home:{name:"Sesi Franca",sub:"2º · 24V",pct:72,color:"#E65100"},away:{name:"Fortaleza BC",sub:"9º · 14V",pct:16,color:"#003087"},draw:12,vol:"R$1.4M" },
    ]},
    volei:    { label:"Vôlei",   icon:"🏐", color:"#7C3AED", items:[
      { id:"v1", status:"live",statusLabel:"Hoje · 21h · Arena Paulo Skaf",competition:"Superliga Masc. · Rod. 10",title:"Joinville × Sada Cruzeiro",subtitle:"Decacampeão visita o Joinville",guruPick:"Sada Cruzeiro",guruConf:67,guruReason:"Melhor defesa da liga. Wallace e Douglas dominam.",home:{name:"Joinville",sub:"6º",pct:25,color:"#CC0000"},away:{name:"Sada Cruzeiro",sub:"1º",pct:65,color:"#003087"},draw:10,vol:"R$1.2M" },
    ]},
    mma:      { label:"MMA/UFC", icon:"🥊", color:"#EF4444", items:[
      { id:"m1", status:"live",statusLabel:"Hoje · UFC FN 270 · Londres",competition:"UFC Fight Night 270",title:"Evloev × Murphy",subtitle:"Dois invictos pelo título",guruPick:"Decisão",guruConf:55,guruReason:"Evloev 19-0 vs Murphy 17-0. Britânico em casa. Decisão técnica.",home:{name:"Lerone Murphy",sub:"17-0 · Pena",pct:44,color:"#003087"},away:{name:"M. Evloev",sub:"19-0 · Pena",pct:44,color:"#CC0000"},draw:12,vol:"R$8.4M" },
      { id:"m2", status:"upcoming",statusLabel:"28/03 · Las Vegas",competition:"UFC Fight Night",title:"Adesanya × Pyfer",subtitle:"Ex-campeão busca retorno ao top 5",guruPick:"Adesanya",guruConf:58,guruReason:"Melhor reach, KO power e experiência vs pressão de Pyfer.",home:{name:"I. Adesanya",sub:"Ex-camp · 25-4",pct:55,color:"#1a1a1a"},away:{name:"Joe Pyfer",sub:"Top 15 · 13-2",pct:34,color:"#7c3aed"},draw:11,vol:"R$6.2M" },
    ]},
    tenis:    { label:"Tênis",   icon:"🎾", color:"#0284C7", items:[
      { id:"t1", status:"live",statusLabel:"Hoje · Miami Open",competition:"ATP Masters 1000 · Miami",title:"Sinner × Dzumhur",subtitle:"Campeão de IW estreia em Miami",guruPick:"Sinner",guruConf:92,guruReason:"IW sem perder um set. Dzumhur Nº74 sem histórico vs top 5.",home:{name:"J. Sinner",sub:"Nº2 ATP · IW Camp.",pct:89,color:"#003087"},away:{name:"D. Dzumhur",sub:"Nº74 ATP",pct:8,color:"#6b7280"},draw:3,vol:"R$4.1M" },
      { id:"t2", status:"upcoming",statusLabel:"~27/03 · Miami Open",competition:"ATP Miami 2026 · Final",title:"Sinner × Alcaraz",subtitle:"Projeção: Sunshine Double em jogo",guruPick:"Sinner",guruConf:47,guruReason:"2 finais e 1 título em Miami. Alcaraz segundo favorito (+150 odds).",home:{name:"J. Sinner",sub:"Nº2 · Fav Miami",pct:44,color:"#003087"},away:{name:"C. Alcaraz",sub:"Nº1 · 16-1 em 2026",pct:38,color:"#E65100"},draw:18,vol:"R$11.2M" },
    ]},
    esports:  { label:"E-sports",icon:"🎮", color:"#8B5CF6", items:[
      { id:"e1", status:"upcoming",statusLabel:"28/03 · CBLOL Etapa 1",competition:"CBLOL 2026 · Etapa 1",title:"LOUD × paiN Gaming",subtitle:"Campeã estreia na Etapa 1",guruPick:"LOUD",guruConf:66,guruReason:"LOUD campeã Copa CBLOL. Bull e RedBert dominantes.",home:{name:"LOUD",sub:"Campeã Copa CBLOL",pct:62,color:"#FF6600"},away:{name:"paiN Gaming",sub:"4º Copa CBLOL",pct:24,color:"#0F172A"},draw:14,vol:"R$1.8M" },
    ]},
  }
};

const TABS = ["loterias","futebol","basquete","volei","mma","tenis","esports"];
const TAB_META = {
  loterias:{ label:"Loterias", icon:"🎰", color:"#B45309" },
  futebol: { label:"Futebol",  icon:"⚽", color:"#16A34A" },
  basquete:{ label:"Basquete", icon:"🏀", color:"#F59E0B" },
  volei:   { label:"Vôlei",   icon:"🏐", color:"#7C3AED" },
  mma:     { label:"MMA/UFC",  icon:"🥊", color:"#EF4444" },
  tenis:   { label:"Tênis",   icon:"🎾", color:"#0284C7" },
  esports: { label:"E-sports", icon:"🎮", color:"#8B5CF6" },
};

// ── AI ENGINE ─────────────────────────────────────────────────────────────────
async function callClaude(data, category) {
  const now = new Date();
  const hora = now.toLocaleTimeString("pt-BR",{hour:"2-digit",minute:"2-digit"});

  const isLoto = category === "loterias";
  const system = `Você é o motor IA do Guru das Bets. Responda SOMENTE JSON válido, sem markdown. Hora: ${hora} de ${now.toLocaleDateString("pt-BR")}`;

  let prompt = "";
  if (isLoto) {
    prompt = `Recalcule previsões estatísticas das loterias da Caixa.
Dados atuais: ${JSON.stringify(data.loterias.map(l=>({id:l.id,nome:l.nome,guruNums:l.guruNums,guruConf:l.guruConf})))}
Retorne array JSON EXATO:
[{"id":"mega","guruNums":[n,n,n,n,n,n],"guruConf":18,"guruAnalise":"análise pt-BR max 100 chars"},
 {"id":"lotofacil","guruNums":[n,n,n,n,n,n,n,n,n,n,n,n,n,n,n],"guruConf":34,"guruAnalise":"..."},
 {"id":"quina","guruNums":[n,n,n,n,n],"guruConf":22,"guruAnalise":"..."},
 {"id":"timemania","guruNums":[n,n,n,n,n,n,n],"guruConf":12,"guruAnalise":"..."},
 {"id":"duplasena","guruNums":[n,n,n,n,n,n],"guruConf":15,"guruAnalise":"..."},
 {"id":"diadesorte","guruNums":[n,n,n,n,n,n,n],"guruConf":14,"guruAnalise":"..."}]
Regras: mega=6 de 1-60, lotofacil=15 de 1-25, quina=5 de 1-80, timemania=7 de 1-80, duplasena=6 de 1-50, diadesorte=7 de 1-31`;
  } else {
    const esp = data.esportes[category];
    if (!esp) return null;
    prompt = `Recalcule previsões para ${esp.label} baseado em forma atual e contexto do esporte.
Eventos: ${JSON.stringify(esp.items.map(i=>({id:i.id,title:i.title,guruPick:i.guruPick,guruConf:i.guruConf,home:i.home.name,homePct:i.home.pct,away:i.away.name,awayPct:i.away.pct,status:i.status})))}
Retorne JSON array (${esp.items.length} itens):
[{"id":"${esp.items[0].id}","guruPick":"favorito/Empate","guruConf":0-95,"guruReason":"max 90 chars pt-BR","homePct":0-100,"awayPct":0-100,"draw":0-100}]
homePct+awayPct+draw=100`;
  }

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method:"POST",
    headers:{
      "Content-Type":"application/json",
      "x-api-key": ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
      "anthropic-dangerous-direct-browser-access": "true"
    },
    body:JSON.stringify({ model:"claude-sonnet-4-20250514", max_tokens:1000, system, messages:[{role:"user",content:prompt}] })
  });
  if (!res.ok) throw new Error(`API ${res.status}`);
  const json = await res.json();
  const txt = json.content?.find(b=>b.type==="text")?.text||"[]";
  return JSON.parse(txt.replace(/```json|```/g,"").trim());
}

function useAutoUpdate(seed) {
  const [appData,  setAppData]  = useState(seed);
  const [logs,     setLogs]     = useState([]);
  const [updating, setUpdating] = useState(false);
  const [lastAt,   setLastAt]   = useState(null);
  const [nextAt,   setNextAt]   = useState(null);
  const [queue,    setQueue]    = useState([]);
  const [countdown,setCountdown]= useState("");
  const timerRef = useRef(null);
  const cdRef    = useRef(null);

  const log = useCallback((msg, t="info")=>{
    setLogs(p=>[{msg,t,ts:new Date().toLocaleTimeString("pt-BR",{hour:"2-digit",minute:"2-digit",second:"2-digit"})},...p].slice(0,40));
  },[]);

  const runCycle = useCallback(async (curData, manual=false)=>{
    setUpdating(true);
    const cats = ["loterias",...Object.keys(SEED.esportes)];
    setQueue([...cats]);
    log(manual?"⚡ Atualização manual":"🔄 Ciclo automático de 2h iniciado","start");
    const nd = {loterias:[...curData.loterias],esportes:{...curData.esportes}};
    let ok=0;
    for (const cat of cats) {
      setQueue(q=>q.filter(c=>c!==cat));
      log(`🔮 Analisando ${TAB_META[cat]?.label}…`,"loading");
      try {
        const upd = await callClaude(nd, cat);
        if (!upd||!Array.isArray(upd)){log(`⚠️ ${cat}: resposta inválida`,"warn");continue;}
        if (cat==="loterias"){
          nd.loterias = nd.loterias.map(l=>{const u=upd.find(x=>x.id===l.id);return u?{...l,...u}:l;});
        } else {
          if (!nd.esportes[cat]) continue;
          nd.esportes[cat]={...nd.esportes[cat],items:nd.esportes[cat].items.map(item=>{
            const u=upd.find(x=>x.id===item.id);
            if(!u)return item;
            return{...item,guruPick:u.guruPick||item.guruPick,guruConf:u.guruConf||item.guruConf,guruReason:u.guruReason||item.guruReason,home:{...item.home,pct:u.homePct??item.home.pct},away:{...item.away,pct:u.awayPct??item.away.pct},draw:u.draw??item.draw};
          })};
        }
        setAppData({...nd}); ok++;
        log(`✅ ${TAB_META[cat]?.label}: ${upd.length} item(s) atualizados`,"success");
      } catch(e){ log(`❌ ${cat}: ${e.message}`,"error"); }
      await new Promise(r=>setTimeout(r,350));
    }
    const ts=new Date();
    setLastAt(ts); setNextAt(new Date(ts.getTime()+UPDATE_INTERVAL_MS));
    setUpdating(false); setQueue([]);
    log(`🏁 Concluído — ${ok}/${cats.length} categorias atualizadas`,"done");
  },[log]);

  useEffect(()=>{
    cdRef.current=setInterval(()=>{
      if(!nextAt){setCountdown("");return;}
      const d=nextAt-Date.now();
      if(d<=0){setCountdown("Agora!");return;}
      const h=Math.floor(d/3600000),m=Math.floor((d%3600000)/60000),s=Math.floor((d%60000)/1000);
      setCountdown(`${h}h ${String(m).padStart(2,"0")}m ${String(s).padStart(2,"0")}s`);
    },1000);
    return()=>clearInterval(cdRef.current);
  },[nextAt]);

  useEffect(()=>{
    runCycle(seed);
    timerRef.current=setInterval(()=>setAppData(cur=>{runCycle(cur);return cur;}),UPDATE_INTERVAL_MS);
    return()=>clearInterval(timerRef.current);
  },[]);

  const force=useCallback(()=>{if(!updating)setAppData(cur=>{runCycle(cur,true);return cur;});},[updating,runCycle]);
  return{appData,logs,updating,lastAt,nextAt,countdown,queue,force};
}

// ── SPLASH SCREEN ─────────────────────────────────────────────────────────────
function Splash({onDone}){
  useEffect(()=>{const t=setTimeout(onDone,1800);return()=>clearTimeout(t);},[]);
  return(
    <div style={{position:"fixed",inset:0,background:GREEN,display:"flex",alignItems:"center",justifyContent:"center",zIndex:999,flexDirection:"column",gap:12}}>
      <div style={{fontSize:52}}>🔮</div>
      <div style={{fontSize:32,fontWeight:900,color:BLACK,letterSpacing:"-0.03em"}}>Guru das Bets</div>
      <div style={{fontSize:13,color:"rgba(0,0,0,0.5)",fontWeight:500,letterSpacing:"0.06em"}}>PREVISÕES INTELIGENTES</div>
    </div>
  );
}

// ── NUMBER BALL ───────────────────────────────────────────────────────────────
const Ball=({n,big=false,bg=BLACK,fg="#fff"})=>(
  <div style={{width:big?36:28,height:big?36:28,borderRadius:"50%",background:bg,display:"flex",alignItems:"center",justifyContent:"center",fontSize:big?13:11,fontWeight:800,color:fg,flexShrink:0}}>
    {String(n).padStart(2,"0")}
  </div>
);

// ── LOTERIA CARD (Tabby style) ────────────────────────────────────────────────
function LotoCard({lot,onSelect,catUpdating}){
  return(
    <div onClick={()=>onSelect(lot)} style={{background:"#fff",borderRadius:20,marginBottom:12,overflow:"hidden",cursor:"pointer",border:`1px solid ${BORDER}`}}>
      {/* top color bar */}
      <div style={{height:4,background:lot.cor}}/>
      <div style={{padding:"16px 18px"}}>
        {/* header */}
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:14}}>
          <div>
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}>
              <div style={{width:32,height:32,borderRadius:10,background:lot.cor,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16}}>{lot.emoji}</div>
              <div style={{fontSize:17,fontWeight:800,color:BLACK,letterSpacing:"-0.02em"}}>{lot.nome}</div>
              {lot.acumulado&&<div style={{background:"#FFF3E0",borderRadius:6,padding:"2px 8px",fontSize:10,fontWeight:700,color:"#E65100"}}>🔥 ACUMULADO</div>}
            </div>
            <div style={{fontSize:12,color:GRAY_TEXT}}>{lot.descricao} · {lot.diasSorteio} · Conc. {lot.concurso}</div>
          </div>
          <div style={{textAlign:"right"}}>
            <div style={{fontSize:18,fontWeight:900,color:BLACK,letterSpacing:"-0.02em"}}>{lot.premio}</div>
            <div style={{fontSize:11,color:GRAY_TEXT}}>Sorteio {lot.data}</div>
          </div>
        </div>

        {/* último resultado */}
        <div style={{marginBottom:14}}>
          <div style={{fontSize:11,fontWeight:600,color:GRAY_TEXT,letterSpacing:"0.05em",marginBottom:8}}>ÚLTIMO RESULTADO</div>
          <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>{lot.ultimoResultado.map(n=><Ball key={n} n={n} bg={GRAY_BG} fg={BLACK}/>)}</div>
        </div>

        {/* guru suggestion */}
        <div style={{background:GRAY_BG,borderRadius:14,padding:"12px 14px"}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
            <div style={{display:"flex",alignItems:"center",gap:6}}>
              <span style={{fontSize:14}}>🔮</span>
              <span style={{fontSize:11,fontWeight:800,color:BLACK,letterSpacing:"0.04em"}}>{catUpdating?"GURU ANALISANDO…":"GURU SUGERE"}</span>
            </div>
            <div style={{background:catUpdating?"#E5E7EB":GREEN,borderRadius:20,padding:"3px 10px",fontSize:11,fontWeight:800,color:catUpdating?GRAY_TEXT:BLACK}}>{lot.guruConf}% conf.</div>
          </div>
          <div style={{display:"flex",gap:5,flexWrap:"wrap",marginBottom:8}}>{(lot.guruNums||[]).map(n=><Ball key={n} n={n} bg={catUpdating?"#D1D5DB":BLACK} fg="#fff"/>)}</div>
          <div style={{fontSize:11,color:GRAY_TEXT,lineHeight:1.5}}>{lot.guruAnalise}</div>
        </div>

        {/* aposta mínima */}
        <div style={{marginTop:12,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <span style={{fontSize:12,color:GRAY_TEXT}}>Aposta mínima: <strong style={{color:BLACK}}>{lot.aposta}</strong></span>
          <span style={{fontSize:12,color:GRAY_TEXT}}>{lot.regras}</span>
        </div>
      </div>
    </div>
  );
}

// ── SPORT CARD (Tabby style) ──────────────────────────────────────────────────
function SportCard({item,color,onSelect,catUpdating}){
  const live=item.status==="live";
  return(
    <div onClick={()=>onSelect(item)} style={{background:"#fff",borderRadius:20,marginBottom:12,overflow:"hidden",cursor:"pointer",border:`1px solid ${BORDER}`}}>
      <div style={{height:4,background:live?"#EF4444":BORDER}}/>
      <div style={{padding:"16px 18px"}}>
        {/* status row */}
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
          <div style={{display:"flex",alignItems:"center",gap:6}}>
            {live&&<><div style={{width:7,height:7,borderRadius:"50%",background:"#EF4444"}}/><span style={{fontSize:11,fontWeight:700,color:"#EF4444"}}>AO VIVO</span><span style={{fontSize:11,color:GRAY_TEXT}}>·</span></>}
            <span style={{fontSize:11,color:GRAY_TEXT}}>{item.statusLabel}</span>
          </div>
          <span style={{fontSize:11,color:GRAY_TEXT}}>{item.competition}</span>
        </div>

        {/* title */}
        <div style={{marginBottom:4}}>
          <div style={{fontSize:19,fontWeight:900,color:BLACK,letterSpacing:"-0.03em",lineHeight:1.2}}>{item.title}</div>
          <div style={{fontSize:12,color:GRAY_TEXT,marginTop:3}}>{item.subtitle}</div>
        </div>

        {/* guru bar */}
        <div style={{background:GRAY_BG,borderRadius:12,padding:"10px 12px",margin:"12px 0",display:"flex",alignItems:"center",gap:8}}>
          <span style={{fontSize:13}}>{catUpdating?"⏳":"🔮"}</span>
          <div style={{flex:1,fontSize:12,fontWeight:600,color:BLACK}}>
            {catUpdating?"Guru recalculando…":<>Guru: <span style={{color}}>{item.guruPick}</span> · <span style={{color:GRAY_TEXT,fontWeight:400}}>{(item.guruReason||"").slice(0,60)}{item.guruReason?.length>60?"…":""}</span></>}
          </div>
          <div style={{background:color,borderRadius:20,padding:"3px 10px",fontSize:12,fontWeight:800,color:"#fff",flexShrink:0}}>{item.guruConf}%</div>
        </div>

        {/* teams */}
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          {[item.home,item.away].map((side,i)=>(
            <div key={i} style={{display:"flex",alignItems:"center",gap:10}}>
              <div style={{width:4,height:36,borderRadius:2,background:side.color,flexShrink:0}}/>
              <div style={{flex:1}}>
                <div style={{fontSize:14,fontWeight:700,color:BLACK}}>{side.name}</div>
                <div style={{fontSize:11,color:GRAY_TEXT}}>{side.sub}</div>
              </div>
              {/* prob bar */}
              <div style={{textAlign:"right"}}>
                <div style={{fontSize:16,fontWeight:900,color:BLACK}}>{side.pct}%</div>
                <div style={{width:60,height:4,background:BORDER,borderRadius:2,marginTop:3}}>
                  <div style={{width:`${side.pct}%`,height:"100%",background:side.pct>50?color:BORDER,borderRadius:2,transition:"width 0.5s"}}/>
                </div>
              </div>
            </div>
          ))}
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",paddingTop:4,borderTop:`1px solid ${BORDER}`}}>
            <span style={{fontSize:12,color:GRAY_TEXT}}>Empate: {item.draw}%</span>
            <span style={{fontSize:12,color:GRAY_TEXT}}>{item.vol} vol.</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── BET SHEET (Tabby bottom sheet style) ─────────────────────────────────────
function BetSheet({item,color,isLoto,onClose}){
  const [amount,setAmount]=useState("");
  const [choice,setChoice]=useState("yes");
  const [betType,setBetType]=useState("simples");
  const [done,setDone]=useState(false);
  if(!item)return null;
  const na=parseFloat(amount)||0;
  const yp=isLoto?50:(item.home?.pct||50);
  const np=isLoto?50:(item.away?.pct||50);
  const ret=na>0?(na/((choice==="yes"?yp:np)/100)).toFixed(2):"—";
  const luc=na>0?((na/((choice==="yes"?yp:np)/100))-na).toFixed(2):"—";

  if(done)return(
    <>
      <div onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.4)",zIndex:200}}/>
      <div style={{position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:430,background:"#fff",borderRadius:"24px 24px 0 0",zIndex:201,padding:"28px 24px 44px",textAlign:"center"}}>
        <div style={{fontSize:52,marginBottom:12}}>{isLoto?"🍀":"🎉"}</div>
        <div style={{fontSize:22,fontWeight:900,color:BLACK,marginBottom:6,letterSpacing:"-0.03em"}}>{isLoto?"Boa sorte!":"Aposta feita!"}</div>
        <div style={{fontSize:14,color:GRAY_TEXT,marginBottom:20,lineHeight:1.6}}>
          {isLoto?<>R$ {na.toFixed(2)} na <strong style={{color:BLACK}}>{item.nome}</strong><br/>Sorteio em {item.data}</>:<>R$ {na.toFixed(2)} em <strong style={{color:BLACK}}>{choice==="yes"?item.home?.name:item.away?.name}</strong><br/>Retorno potencial: <strong style={{color:BLACK}}>R$ {ret}</strong></>}
        </div>
        <button onClick={onClose} style={{width:"100%",padding:"18px",borderRadius:16,background:BLACK,border:"none",color:"#fff",fontSize:16,fontWeight:700,cursor:"pointer"}}>Voltar aos mercados</button>
      </div>
    </>
  );

  return(
    <>
      <div onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.4)",zIndex:200}}/>
      <div style={{position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:430,background:"#fff",borderRadius:"24px 24px 0 0",zIndex:201,maxHeight:"90vh",overflowY:"auto"}}>
        {/* drag handle */}
        <div style={{padding:"14px 0 6px",display:"flex",justifyContent:"center"}}><div style={{width:36,height:4,borderRadius:2,background:BORDER}}/></div>
        <button onClick={onClose} style={{position:"absolute",top:14,right:18,width:32,height:32,borderRadius:"50%",border:"none",background:GRAY_BG,cursor:"pointer",fontSize:18,color:GRAY_TEXT,display:"flex",alignItems:"center",justifyContent:"center"}}>×</button>

        <div style={{padding:"10px 24px 40px"}}>
          {/* guru insight */}
          <div style={{background:GRAY_BG,borderRadius:16,padding:"14px 16px",marginBottom:20}}>
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
              <span style={{fontSize:18}}>🔮</span>
              <span style={{fontSize:12,fontWeight:800,color:BLACK,letterSpacing:"0.04em"}}>ANÁLISE DO GURU</span>
              <div style={{marginLeft:"auto",background:color,borderRadius:20,padding:"3px 12px",fontSize:12,fontWeight:800,color:"#fff"}}>{item.guruConf}%</div>
            </div>
            {isLoto?(
              <>
                <div style={{fontSize:12,color:GRAY_TEXT,lineHeight:1.6,marginBottom:10}}>{item.guruAnalise}</div>
                <div style={{fontSize:11,fontWeight:700,color:BLACK,marginBottom:8}}>Números sugeridos para o concurso {item.concurso}:</div>
                <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>{(item.guruNums||[]).map(n=><Ball key={n} n={n} big bg={BLACK}/>)}</div>
              </>
            ):(
              <>
                <div style={{fontSize:16,fontWeight:900,color:BLACK,marginBottom:4}}>→ {item.guruPick}</div>
                <div style={{fontSize:12,color:GRAY_TEXT,lineHeight:1.5}}>{item.guruReason}</div>
              </>
            )}
          </div>

          {isLoto&&<div style={{background:"#FFFBEB",border:"1px solid #FDE68A",borderRadius:12,padding:"10px 14px",marginBottom:16,fontSize:11,color:"#78350F"}}>⚠️ Jogo de azar. Sugestão estatística sem garantia de resultado. Jogue com responsabilidade.</div>}

          {/* item header */}
          <div style={{marginBottom:16}}>
            <div style={{fontSize:13,color:GRAY_TEXT,marginBottom:4}}>{isLoto?`${item.nome} · Concurso ${item.concurso} · ${item.data}`:item.competition}</div>
            <div style={{fontSize:20,fontWeight:900,color:BLACK,letterSpacing:"-0.03em"}}>{isLoto?item.nome:item.title}</div>
          </div>

          {!isLoto&&(
            <>
              {/* buy/sell toggle */}
              <div style={{display:"flex",background:GRAY_BG,borderRadius:12,padding:4,marginBottom:16}}>
                {["buy","sell"].map(m=><button key={m} onClick={()=>{}} style={{flex:1,padding:"10px",borderRadius:10,border:"none",background:m==="buy"?"#fff":GRAY_BG,color:m==="buy"?BLACK:GRAY_TEXT,fontWeight:700,fontSize:14,cursor:"pointer",transition:"all 0.15s"}}>{m==="buy"?"Comprar":"Vender"}</button>)}
              </div>
              {/* yes/no */}
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:16}}>
                {[{key:"yes",l:"Sim",p:yp,name:item.home?.name,bc:GREEN,tc:BLACK},{key:"no",l:"Não",p:np,name:item.away?.name,bc:GRAY_BG,tc:BLACK}].map(o=>(
                  <button key={o.key} onClick={()=>setChoice(o.key)} style={{padding:"14px 10px",borderRadius:16,cursor:"pointer",textAlign:"center",border:choice===o.key?`2px solid ${BLACK}`:`2px solid ${BORDER}`,background:choice===o.key?o.bc:"#fff",transition:"all 0.15s"}}>
                    <div style={{fontSize:18,fontWeight:900,color:o.tc}}>{o.l} {o.p}¢</div>
                    <div style={{fontSize:11,color:GRAY_TEXT,marginTop:4,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{o.name}</div>
                  </button>
                ))}
              </div>
            </>
          )}

          {isLoto&&(
            <div style={{marginBottom:16}}>
              <div style={{fontSize:12,fontWeight:700,color:BLACK,marginBottom:8}}>Tipo de aposta:</div>
              <div style={{display:"flex",background:GRAY_BG,borderRadius:12,padding:4}}>
                {["simples","bolão","teimosinha"].map(t=><button key={t} onClick={()=>setBetType(t)} style={{flex:1,padding:"10px 6px",borderRadius:10,border:"none",background:betType===t?"#fff":GRAY_BG,color:betType===t?BLACK:GRAY_TEXT,fontWeight:betType===t?700:500,fontSize:12,cursor:"pointer",textTransform:"capitalize"}}>{t}</button>)}
              </div>
            </div>
          )}

          {/* amount */}
          <div style={{border:`1.5px solid ${BORDER}`,borderRadius:16,padding:"16px 18px",marginBottom:12}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <div>
                <div style={{fontSize:14,fontWeight:700,color:BLACK}}>Valor</div>
                <div style={{fontSize:11,color:GREEN,marginTop:2,fontWeight:600}}>Ganhe 3,25% de rendimento</div>
              </div>
              <div style={{display:"flex",alignItems:"center",gap:6}}>
                <span style={{fontSize:20,color:GRAY_TEXT,fontWeight:300}}>R$</span>
                <input type="number" value={amount} onChange={e=>setAmount(e.target.value)} placeholder="0" style={{width:90,fontSize:26,fontWeight:300,color:amount?BLACK:GRAY_TEXT,border:"none",outline:"none",textAlign:"right",background:"transparent"}}/>
              </div>
            </div>
          </div>

          {/* quick amounts */}
          <div style={{display:"flex",gap:8,marginBottom:16}}>
            {(isLoto?["3","6","10","25","50"]:["10","25","50","100"]).map(v=>(
              <button key={v} onClick={()=>setAmount(v)} style={{flex:1,padding:"10px 0",borderRadius:12,border:`1.5px solid ${amount===v?BLACK:BORDER}`,background:amount===v?BLACK:GRAY_BG,color:amount===v?"#fff":BLACK,fontSize:13,fontWeight:700,cursor:"pointer"}}>R${v}</button>
            ))}
          </div>

          {/* return summary */}
          {na>0&&!isLoto&&(
            <div style={{background:GRAY_BG,borderRadius:14,padding:"14px 16px",marginBottom:16}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
                <span style={{fontSize:13,color:GRAY_TEXT}}>Retorno total</span>
                <span style={{fontSize:15,fontWeight:800,color:BLACK}}>R$ {ret}</span>
              </div>
              <div style={{display:"flex",justifyContent:"space-between"}}>
                <span style={{fontSize:12,color:GRAY_TEXT}}>Lucro se ganhar</span>
                <span style={{fontSize:13,fontWeight:700,color:"#16A34A"}}>+R$ {luc}</span>
              </div>
            </div>
          )}

          {/* CTA — Tabby black rounded button */}
          <button onClick={()=>{if(na>0)setDone(true);}} style={{width:"100%",padding:"18px",borderRadius:16,background:na>0?BLACK:"#E5E7EB",border:"none",color:na>0?"#fff":GRAY_TEXT,fontSize:17,fontWeight:700,cursor:na>0?"pointer":"default",transition:"background 0.2s"}}>
            {na>0?(isLoto?`Apostar R$ ${na.toFixed(2)} na ${item.nome}`:`Confirmar aposta de R$ ${na.toFixed(2)}`):"Digite o valor para continuar"}
          </button>
        </div>
      </div>
    </>
  );
}

// ── LOG PANEL (Tabby style) ───────────────────────────────────────────────────
function LogPanel({logs,updating,lastAt,countdown,queue,force}){
  const c={info:GRAY_TEXT,start:"#7C3AED",loading:"#F59E0B",success:"#16A34A",warn:"#F97316",error:"#EF4444",done:"#0284C7"};
  return(
    <div style={{padding:"0 16px 100px"}}>
      {/* status card */}
      <div style={{background:"#fff",borderRadius:20,border:`1px solid ${BORDER}`,padding:"18px",marginBottom:14}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14}}>
          <div>
            <div style={{fontSize:16,fontWeight:800,color:BLACK,marginBottom:2}}>{updating?"Atualizando agora…":"Sistema ativo"}</div>
            <div style={{fontSize:12,color:GRAY_TEXT}}>Última: {lastAt?lastAt.toLocaleTimeString("pt-BR",{hour:"2-digit",minute:"2-digit",second:"2-digit"}):"Aguardando"}</div>
          </div>
          <button onClick={force} disabled={updating} style={{padding:"10px 18px",borderRadius:30,background:updating?"#E5E7EB":BLACK,border:"none",color:updating?GRAY_TEXT:"#fff",fontSize:13,fontWeight:700,cursor:updating?"not-allowed":"pointer"}}>
            {updating?"Analisando…":"⚡ Forçar"}
          </button>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
          <div style={{background:GRAY_BG,borderRadius:12,padding:"12px 14px"}}>
            <div style={{fontSize:10,fontWeight:600,color:GRAY_TEXT,letterSpacing:"0.05em",marginBottom:4}}>CICLO A CADA</div>
            <div style={{fontSize:20,fontWeight:900,color:BLACK}}>2 horas</div>
          </div>
          <div style={{background:GRAY_BG,borderRadius:12,padding:"12px 14px"}}>
            <div style={{fontSize:10,fontWeight:600,color:GRAY_TEXT,letterSpacing:"0.05em",marginBottom:4}}>PRÓXIMA EM</div>
            <div style={{fontSize:16,fontWeight:900,color:GREEN,fontVariantNumeric:"tabular-nums"}}>{countdown||"—"}</div>
          </div>
        </div>
        {updating&&queue.length>0&&(
          <div style={{marginTop:12}}>
            <div style={{fontSize:11,color:GRAY_TEXT,marginBottom:6}}>Na fila:</div>
            <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>{queue.map(c=><span key={c} style={{fontSize:11,background:GRAY_BG,borderRadius:20,padding:"4px 10px",color:BLACK,fontWeight:600}}>{TAB_META[c]?.icon} {TAB_META[c]?.label}</span>)}</div>
          </div>
        )}
      </div>

      {/* how it works */}
      <div style={{background:"#EFF6FF",borderRadius:16,border:"1px solid #BFDBFE",padding:"14px 16px",marginBottom:14}}>
        <div style={{fontSize:13,fontWeight:800,color:"#1D4ED8",marginBottom:6}}>🤖 Como funciona o motor de IA</div>
        <div style={{fontSize:12,color:"#3B82F6",lineHeight:1.7}}>A cada <strong>2 horas</strong> o Guru chama a <strong>API do Claude</strong> e reanálisa todas as 7 categorias. Probabilidades, picks e justificativas são recalculados com base nos dados mais recentes de cada competição.</div>
      </div>

      {/* terminal log */}
      <div style={{background:"#111827",borderRadius:18,padding:"16px",overflow:"hidden"}}>
        <div style={{fontSize:11,color:GREEN,fontWeight:700,marginBottom:12,letterSpacing:"0.08em",fontFamily:"monospace"}}>◉ GURU ENGINE LOG</div>
        {logs.length===0&&<div style={{fontSize:12,color:"#4B5563",fontFamily:"monospace"}}>Aguardando primeiro ciclo…</div>}
        {logs.map((l,i)=>(
          <div key={i} style={{display:"flex",gap:8,marginBottom:6,opacity:Math.max(0.2,1-i*0.025)}}>
            <span style={{fontSize:10,color:"#4B5563",flexShrink:0,marginTop:1,fontFamily:"monospace"}}>{l.ts}</span>
            <span style={{fontSize:11,color:c[l.t]||GRAY_TEXT,lineHeight:1.5,fontFamily:"monospace"}}>{l.msg}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── BOTTOM NAV (Tabby style) ──────────────────────────────────────────────────
const NavIcon=({type,active})=>{
  const s=active?BLACK:GRAY_TEXT;
  if(type==="discover")return<svg width="24" height="24" fill="none" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" fill={s}/></svg>;
  if(type==="play")return<svg width="24" height="24" fill="none" viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" fill={s}/></svg>;
  if(type==="engine")return<svg width="24" height="24" fill="none" viewBox="0 0 24 24"><path d="M20 6h-4V4c0-1.1-.9-2-2-2h-4c-1.1 0-2 .9-2 2v2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zM10 4h4v2h-4V4zm2 13c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z" fill={active?"#7C3AED":GRAY_TEXT}/></svg>;
  return<svg width="24" height="24" fill="none" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" fill={s}/></svg>;
};

// ── APP ROOT ─────────────────────────────────────────────────────────────────
export default function App(){
  const [splash,   setSplash]   = useState(true);
  const [tab,      setTab]      = useState("loterias");
  const [navKey,   setNavKey]   = useState("discover");
  const [showLog,  setShowLog]  = useState(false);
  const [selItem,  setSelItem]  = useState(null);
  const {appData,logs,updating,lastAt,nextAt,countdown,queue,force} = useAutoUpdate(SEED);

  if(splash)return<Splash onDone={()=>setSplash(false)}/>;

  const meta   = TAB_META[tab];
  const isLoto = tab==="loterias";
  const espData= appData.esportes[tab];
  const espItems=espData?.items||[];
  const catUpd = updating&&queue.includes(tab);
  const totalLive=Object.values(appData.esportes).flatMap(d=>d.items).filter(i=>i.status==="live").length;

  return(
    <div style={{background:GRAY_BG,minHeight:"100vh",maxWidth:430,margin:"0 auto",fontFamily:"-apple-system,BlinkMacSystemFont,'SF Pro Display','Segoe UI',sans-serif"}}>
      <style>{`*{box-sizing:border-box;margin:0;padding:0;}::-webkit-scrollbar{display:none;}input[type=number]::-webkit-inner-spin-button{-webkit-appearance:none;}@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.3}}@keyframes spin{to{transform:rotate(360deg)}}`}</style>

      {/* ── HEADER ── */}
      <div style={{background:"#fff",paddingTop:16,borderBottom:`1px solid ${BORDER}`,position:"sticky",top:0,zIndex:50}}>
        {/* top bar */}
        <div style={{padding:"0 18px",display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <div style={{width:36,height:36,borderRadius:12,background:GREEN,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20}}>🔮</div>
            <div>
              <div style={{fontSize:20,fontWeight:900,color:BLACK,letterSpacing:"-0.04em",lineHeight:1}}>Guru das Bets</div>
              <div style={{fontSize:10,color:GRAY_TEXT,fontWeight:600,letterSpacing:"0.06em"}}>MOTOR DE IA · 2H</div>
            </div>
          </div>

          {/* live status pill — Tabby style */}
          <button onClick={()=>{setShowLog(v=>!v);setNavKey("engine");}} style={{display:"flex",alignItems:"center",gap:6,padding:"7px 14px",borderRadius:30,background:updating?"#FFF3E0":"#F0FFF4",border:`1px solid ${updating?"#FDE68A":"#BBF7D0"}`,cursor:"pointer"}}>
            {updating
              ?<div style={{width:8,height:8,borderRadius:"50%",border:`1.5px solid #F59E0B`,borderTopColor:"transparent",animation:"spin 0.8s linear infinite"}}/>
              :<div style={{width:8,height:8,borderRadius:"50%",background:GREEN,animation:"pulse 2s infinite"}}/>
            }
            <span style={{fontSize:11,fontWeight:800,color:updating?"#B45309":"#166534"}}>{updating?"ANALISANDO":"AO VIVO"}</span>
          </button>
        </div>

        {/* countdown ribbon */}
        {!updating&&countdown&&(
          <div style={{margin:"0 18px 10px",background:"#F0FFF4",borderRadius:10,padding:"6px 12px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <span style={{fontSize:11,color:"#166534",fontWeight:500}}>⏱ Próxima atualização automática</span>
            <span style={{fontSize:12,fontWeight:900,color:GREEN,fontVariantNumeric:"tabular-nums"}}>{countdown}</span>
          </div>
        )}
        {updating&&queue.length>0&&(
          <div style={{margin:"0 18px 10px",background:"#FFF3E0",borderRadius:10,padding:"6px 12px",display:"flex",alignItems:"center",gap:8}}>
            <div style={{width:10,height:10,borderRadius:"50%",border:"1.5px solid #F59E0B",borderTopColor:"transparent",animation:"spin 0.8s linear infinite",flexShrink:0}}/>
            <span style={{fontSize:11,color:"#92400E",fontWeight:500}}>Analisando <strong>{TAB_META[queue[0]]?.label}</strong>… {queue.length} restantes</span>
          </div>
        )}

        {/* category tabs — Tabby pill style */}
        <div style={{display:"flex",gap:6,overflowX:"auto",padding:"0 18px 14px"}}>
          {TABS.map(k=>{
            const m=TAB_META[k]; const active=k===tab;
            return(
              <button key={k} onClick={()=>{setTab(k);setShowLog(false);setNavKey("discover");}} style={{padding:"8px 16px",borderRadius:30,border:"none",background:active?BLACK:GRAY_BG,color:active?"#fff":GRAY_TEXT,fontSize:12,fontWeight:active?700:500,cursor:"pointer",whiteSpace:"nowrap",flexShrink:0,display:"flex",alignItems:"center",gap:5,transition:"all 0.15s"}}>
                <span style={{fontSize:12}}>{m.icon}</span>{m.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── CONTENT ── */}
      {showLog?(
        <LogPanel logs={logs} updating={updating} lastAt={lastAt} countdown={countdown} queue={queue} force={force}/>
      ):(
        <div style={{padding:"18px 16px 100px"}}>
          {/* section header */}
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
            <div>
              <div style={{fontSize:24,fontWeight:900,color:BLACK,letterSpacing:"-0.04em"}}>{meta.icon} {meta.label}</div>
              <div style={{fontSize:12,color:GRAY_TEXT,marginTop:2}}>
                {isLoto?`${appData.loterias.filter(l=>l.acumulado).length} acumuladas hoje`:`${espItems.length} mercados · ${espItems.filter(i=>i.guruConf>=65).length} picks confiantes`}
              </div>
            </div>
            {catUpd&&(
              <div style={{display:"flex",alignItems:"center",gap:5,background:"#FFF3E0",borderRadius:20,padding:"6px 12px"}}>
                <div style={{width:8,height:8,borderRadius:"50%",border:"1.5px solid #F59E0B",borderTopColor:"transparent",animation:"spin 0.8s linear infinite"}}/>
                <span style={{fontSize:11,fontWeight:700,color:"#B45309"}}>Atualizando</span>
              </div>
            )}
          </div>

          {isLoto?(
            <>
              <div style={{background:"#FFFBEB",borderRadius:14,border:"1px solid #FDE68A",padding:"12px 14px",marginBottom:16,fontSize:12,color:"#78350F",lineHeight:1.6}}>
                ⚠️ <strong>Jogo responsável.</strong> As sugestões do Guru são análise estatística e não garantem resultado. Aposte com responsabilidade.
              </div>
              {appData.loterias.map(l=><LotoCard key={l.id} lot={l} onSelect={setSelItem} catUpdating={catUpd}/>)}
            </>
          ):(
            <>
              {/* sub-filter pills */}
              <div style={{display:"flex",gap:8,marginBottom:16,overflowX:"auto"}}>
                {[`Todos (${espItems.length})`,"Ao Vivo","Hoje","Futuros"].map((t,i)=>(
                  <button key={t} style={{padding:"7px 16px",borderRadius:30,border:"none",background:i===0?BLACK:GRAY_BG,color:i===0?"#fff":GRAY_TEXT,fontSize:12,fontWeight:i===0?700:500,cursor:"pointer",whiteSpace:"nowrap",flexShrink:0}}>{t}</button>
                ))}
              </div>
              {espItems.map(item=><SportCard key={item.id} item={item} color={meta.color} onSelect={setSelItem} catUpdating={catUpd}/>)}
            </>
          )}
        </div>
      )}

      {/* ── BOTTOM NAV — Tabby style ── */}
      <div style={{position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:430,background:"#fff",borderTop:`1px solid ${BORDER}`,display:"flex",justifyContent:"space-around",paddingTop:10,paddingBottom:28,zIndex:100}}>
        {[
          {key:"discover",label:"Descobrir",type:"discover"},
          {key:"play",    label:"Apostar",   type:"play",    badge:totalLive>0?totalLive:null},
          {key:"engine",  label:"Engine",    type:"engine",  engineBadge:updating},
          {key:"profile", label:"Perfil",    type:"profile"},
        ].map(({key,label,type,badge,engineBadge})=>{
          const active=navKey===key||(key==="engine"&&showLog);
          return(
            <button key={key} onClick={()=>{
              if(key==="engine"){setShowLog(v=>!v);setNavKey("engine");}
              else{setNavKey(key);setShowLog(false);}
            }} style={{background:"none",border:"none",display:"flex",flexDirection:"column",alignItems:"center",gap:4,cursor:"pointer",position:"relative",minWidth:60}}>
              {badge&&<span style={{position:"absolute",top:-2,right:4,background:"#EF4444",color:"#fff",fontSize:9,fontWeight:900,borderRadius:20,padding:"1px 5px",lineHeight:1.5}}>{badge}</span>}
              {engineBadge&&!showLog&&<span style={{position:"absolute",top:0,right:8,width:8,height:8,borderRadius:"50%",background:"#F59E0B",border:"2px solid #fff",animation:"pulse 1s infinite"}}/>}
              <NavIcon type={type} active={active}/>
              <span style={{fontSize:10,color:active?(type==="engine"?"#7C3AED":BLACK):GRAY_TEXT,fontWeight:active?700:400}}>{label}</span>
            </button>
          );
        })}
      </div>

      {/* ── BET SHEET ── */}
      {selItem&&<BetSheet item={selItem} color={meta.color} isLoto={isLoto} onClose={()=>setSelItem(null)}/>}
    </div>
  );
}
