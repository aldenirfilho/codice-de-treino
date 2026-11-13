/* ================= ARMAZENAMENTO ================= */
const KEY="codice-treino-360x-v1";
const MODELOS_BASE=[
 {n:"🔥 Treino 04/11",t:"Supino reto 3x10\nRosca direta 3x10\nElevação lateral 3x10\nPuxador costas 4x10\nAbdominal 6x50 | Prancha 6x45s\nEsteira 20min\nPolichinelos 4x15"},
 {n:"🅰️ Retomada A",t:"Supino reto com barra 3x10\nPuxada alta 3x12\nCadeira extensora 3x15\nStiff com barra 3x10\nDesenvolvimento com halteres 2x12\nPrancha 3x45s\nEsteira 20min"},
 {n:"🅱️ Retomada B",t:"Remada unilateral 3x10\nVoador 3x12\nFlexora unilateral 3x12\nElevação pélvica 3x12\nElevação lateral 2x15\nRosca direta 2x12 | Tríceps na polia 2x12\nBike 20min"},
 {n:"🆘 Dia Difícil 15'",t:"Flexão nos apoios 3x10 | Remada com halter 3x12 | Cadeira extensora 3x15 | Prancha 3x30s"},
 {n:"🏃 Só cardio",t:"Esteira 30min\nPolichinelos 4x20\nPrancha 3x45s"},
 {n:"🛡️ Upper Força",t:"Supino reto com barra 4x6\nRemada curvada com barra 4x8\nDesenvolvimento com halteres 3x8\nPuxada alta 3x10\nTríceps testa 2x10 | Rosca martelo 2x10"},
 {n:"🦵 Lower sem agachamento",t:"Levantamento terra romeno 4x8\nCadeira extensora 4x12\nFlexora unilateral 3x12\nElevação pélvica com barra 4x10\nPanturrilha em pé 4x15\nPrancha 3x45s"},
 {n:"🔥 Full Body Queima (circuito)",t:"Flexão nos apoios 4x12 | Remada unilateral 4x12 | Cadeira extensora 4x15 | Elevação pélvica 4x15 | Prancha 4x30s\nEsteira 15min"},
 {n:"⚡ HIIT Bike 20'",t:"Bike aquecimento 5min\nBike tiro forte 8x30s | Bike leve 8x90s\nBike volta à calma 5min"},
 {n:"🏃 Zona 2 + Core",t:"Esteira Zona 2 30min\nPrancha 3x45s | Prancha lateral 3x30s\nAbdominal na polia 3x15\nPerdigueiro 3x10"},
 {n:"🦾 Braços & Ombros",t:"Desenvolvimento militar com barra 3x8\nElevação lateral 3x15 | Crucifixo inverso 3x15\nRosca direta 3x10 | Tríceps na polia 3x12\nRosca martelo 2x12 | Tríceps testa 2x12"},
 {n:"🪽 Costas & Postura",t:"Puxada alta 4x10\nRemada unilateral 3x10\nFace pull na polia 3x15\nPullover na polia 3x12\nSuperman 3x15"},
 {n:"🏛️ Peito & Tríceps",t:"Supino reto com barra 4x8\nSupino inclinado com halteres 3x10\nVoador 3x12\nFlexão nos apoios 2x12\nTríceps na polia 3x12"},
 {n:"⏱️ Express 30' pós-plantão",t:"Esteira leve 8min\nSupino com halteres 2x12 | Puxada alta 2x12\nCadeira extensora 2x15 | Flexora unilateral 2x15\nPrancha 2x30s"},
 {n:"🧘 Mobilidade & Recuperação",t:"Bike leve 10min\nMobilidade de quadril 2x10\nMobilidade torácica 2x10\nPonte de glúteo 2x15\nAlongamento posterior 3x30s\nRespiração diafragmática 5min"}
];
const configPadrao={view:"auto",desc:90,autoDesc:true,hmMeses:6,tema:"escuro"};
const vazio=()=>({treinos:[],corpo:[],modelos:[],metas:[],ativo:null,cfg:{...configPadrao}});
const medidas=["peso","altura","cintura","quadril","abdome","peito","braco","coxa","panturrilha","pescoco","gordura"];
const registro=v=>v!==null&&typeof v==="object"&&!Array.isArray(v);
const texto=v=>typeof v==="string";
const numero=v=>typeof v==="number"&&Number.isFinite(v);
const numeroOpcional=v=>v==null||numero(v);
const idValido=v=>texto(v)&&/^[a-z0-9_-]{1,100}$/i.test(v);
const dataValida=v=>{
  if(!texto(v)||!/^\d{4}-\d{2}-\d{2}$/.test(v))return false;
  const d=new Date(v+"T12:00:00Z");
  return Number.isFinite(+d)&&d.toISOString().slice(0,10)===v;
};
const booleanos=v=>Array.isArray(v)&&v.every(x=>typeof x==="boolean");
const itemValido=i=>registro(i)&&texto(i.nome)&&["","reps","s","min"].includes(i.un)
  &&[i.alvo,i.carga,i.real,i.alvoBase].every(numeroOpcional)
  &&booleanos(i.feito)&&i.feito.length>0&&i.feito.length<=50&&(i.extra==null||booleanos(i.extra));
const blocoValido=b=>registro(b)&&Array.isArray(b.itens)&&b.itens.length>0&&b.itens.every(itemValido);
const treinoValido=w=>registro(w)&&idValido(w.id)&&texto(w.nome)&&dataValida(w.data)
  &&["ativo","concluido"].includes(w.status)&&numero(w.criado)&&numeroOpcional(w.concluido)
  &&(w.texto==null||texto(w.texto))&&Array.isArray(w.blocos)&&w.blocos.length>0&&w.blocos.every(blocoValido);

function validarDados(d, backup=false){
  if(!registro(d)||!Array.isArray(d.treinos)||!d.treinos.every(treinoValido)){
    throw new Error("Formato de treino incompatível");
  }
  if(backup&&(d.app!=="codice-do-treino-360x"||!Number.isInteger(d.versao)||d.versao<1||d.versao>18
      ||!Array.isArray(d.corpo)||!Array.isArray(d.modelos)
      ||(d.versao>=16&&(!Array.isArray(d.metas)||!registro(d.cfg)||!Object.hasOwn(d,"ativo"))))){
    throw new Error("Backup incompleto ou incompatível");
  }
  const {treinos,corpo=[],modelos=[],metas=[]}=d;
  const corpoValido=r=>registro(r)&&idValido(r.id)&&dataValida(r.data)&&medidas.every(k=>numeroOpcional(r[k]));
  const metaValida=m=>registro(m)&&idValido(m.id)&&["peso","cintura"].includes(m.tipo)
    &&dataValida(m.prazo)&&dataValida(m.criado)&&numero(m.inicio)&&numero(m.alvo);
  if(!Array.isArray(corpo)||!corpo.every(corpoValido)||!Array.isArray(modelos)
      ||!modelos.every(m=>registro(m)&&texto(m.n)&&texto(m.t))||!Array.isArray(metas)||!metas.every(metaValida)){
    throw new Error("Registros incompatíveis");
  }
  const c=registro(d.cfg)?d.cfg:{};
  const cfg={
    view:["auto","mob","desk"].includes(c.view)?c.view:configPadrao.view,
    desc:[45,60,90,120,180].includes(c.desc)?c.desc:configPadrao.desc,
    autoDesc:typeof c.autoDesc==="boolean"?c.autoDesc:configPadrao.autoDesc,
    hmMeses:[3,6,12].includes(c.hmMeses)?c.hmMeses:configPadrao.hmMeses,
    tema:["escuro","claro"].includes(c.tema)?c.tema:configPadrao.tema
  };
  if(registro(c.esteira))cfg.esteira=esteiraCfgValida(c.esteira);
  return {treinos,corpo,modelos,metas,ativo:treinos.some(w=>w.id===d.ativo)?d.ativo:null,cfg};
}

let DB=vazio(),ultimaGravacao=null,leituraFalhou=false;
function avisoDados(m=""){
  const aviso=document.getElementById("storageNotice");
  aviso.textContent=m;
  aviso.hidden=!m;
}
function load(){
  try{
    ultimaGravacao=localStorage.getItem(KEY);
    if(ultimaGravacao!==null)DB=validarDados(JSON.parse(ultimaGravacao));
  }catch(e){
    leituraFalhou=true;
    avisoDados("⚠️ Não foi possível abrir os dados locais. Se tiver um backup, use Dados para restaurá-lo.");
  }
}
function save(proximo=DB, substituir=false){
  try{
    if(leituraFalhou&&!substituir)return false;
    if(localStorage.getItem(KEY)!==ultimaGravacao){
      avisoDados("⚠️ Outra janela alterou os registros. Se fez alterações aqui, exporte um backup desta janela antes de fechá-la.");
      return false;
    }
    const raw=JSON.stringify(proximo);
    localStorage.setItem(KEY,raw);
    ultimaGravacao=raw;
    DB=proximo;
    leituraFalhou=false;
    avisoDados();
    return true;
  }catch(e){
    avisoDados("⚠️ As alterações desta janela não foram salvas. Faça um backup em Dados antes de sair.");
    return false;
  }
}
load();

const $=s=>document.querySelector(s);
const isoL=d=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
const hoje=()=>isoL(new Date());
const diaUTC=iso=>new Date(iso+"T00:00:00Z");
const diasEntre=(a,b)=>(diaUTC(b)-diaUTC(a))/864e5;
function somarDias(iso,n){const d=diaUTC(iso);d.setUTCDate(d.getUTCDate()+n);return d.toISOString().slice(0,10)}
function recente(d,janela){const n=diasEntre(d,hoje());return n>=0&&n<janela}
const fmtD=iso=>{if(!iso)return"";const[y,m,d]=iso.split("-");return`${d}/${m}/${y}`};
const uid=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,6);
const esc=s=>String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const num=v=>{const n=parseFloat(String(v).replace(",","."));return isFinite(n)?n:null};
function toast(m,gold){const t=$("#toast");t.textContent=m;t.classList.toggle("gold",!!gold);t.style.display="block";clearTimeout(t._h);t._h=setTimeout(()=>t.style.display="none",gold?4200:2200)}

/* ================= PARSER ================= */
function parseItem(raw){
  let s=raw.trim().replace(/\s+/g," ");if(!s)return null;
  let carga=null;
  const mk=s.match(/(?:@\s*)?(\d+(?:[.,]\d+)?)\s*kg\b/i);
  if(mk){carga=num(mk[1]);s=(s.slice(0,mk.index)+s.slice(mk.index+mk[0].length)).trim()}
  let m=s.match(/^(.*?)\s*[-–:]?\s*(\d+)\s*[x×*]\s*(\d+(?:[.,]\d+)?)\s*(s|seg|segundos?|min|minutos?|reps?|repetições)?$/i);
  if(m)return{nome:m[1].trim()||"Exercício",series:+m[2],alvo:num(m[3]),un:unid(m[4]),carga};
  m=s.match(/^(.*?)\s*[-–:]?\s*(\d+(?:[.,]\d+)?)\s*(s|seg|segundos?|min|minutos?)$/i);
  if(m)return{nome:m[1].trim()||"Exercício",series:1,alvo:num(m[2]),un:unid(m[3]),carga};
  return{nome:s,series:1,alvo:null,un:"",carga};
}
function unid(u){u=(u||"").toLowerCase();if(u.startsWith("min"))return"min";if(u.startsWith("s"))return"s";return"reps"}
function parseTreino(txt){
  const blocos=[];
  txt.split(/\n/).forEach(l=>{
    const partes=l.split("|").map(parseItem).filter(Boolean);
    if(!partes.length)return;
    blocos.push({id:uid(),itens:partes.map(p=>Object.assign(p,{feito:Array(Math.max(1,Math.min(p.series,50))).fill(false),extra:[]}))});
  });
  return blocos;
}
function alvoTxt(it){if(it.alvo==null)return"";return it.un==="reps"?`${it.alvo} reps`:`${it.alvo} ${it.un}`}
/* reescreve o texto do treino a partir dos blocos (usado quando a meta é editada) */
function blocosTexto(w){
  return w.blocos.map(b=>b.itens.map(it=>{
    const n=it.feito.length;let s=it.nome;
    if(it.alvo!=null)s+=it.un==="min"&&n===1?` ${it.alvo}min`:` ${n}x${it.alvo}${it.un==="s"?"s":it.un==="min"?"min":""}`;
    if(it.carga)s+=` ${it.carga}kg`;return s;
  }).join(" | ")).join("\n");
}

/* ================= VISÃO CELULAR / DESKTOP ================= */
let charts={};
function aplicarVisao(){
  const m=DB.cfg.view||"auto";
  const desk=m==="desk"||(m==="auto"&&window.innerWidth>=900);
  document.body.classList.toggle("desk",desk);
  document.querySelectorAll("#viewsw button").forEach(b=>b.classList.toggle("on",b.dataset.vm===m));
  Object.values(charts).forEach(c=>{try{c.resize()}catch(e){}});
}
document.querySelectorAll("#viewsw button").forEach(b=>b.onclick=()=>{
  DB.cfg.view=b.dataset.vm;const gravado=save();aplicarVisao();
  if(gravado)toast(b.dataset.vm==="desk"?"🖥️ Modo desktop":b.dataset.vm==="mob"?"📱 Modo celular":"🔄 Automático pelo tamanho da tela");
});
window.addEventListener("resize",()=>{if((DB.cfg.view||"auto")==="auto")aplicarVisao()});

/* ================= TEMA CLARO / ESCURO ================= */
const corVar=n=>{try{return getComputedStyle(document.body).getPropertyValue(n).trim()}catch(e){return""}};
function aplicarTema(){
  const claro=DB.cfg.tema==="claro";
  document.body.classList.toggle("claro",claro);
  document.querySelectorAll("#temasw button").forEach(b=>b.classList.toggle("on",b.dataset.tema===(DB.cfg.tema||"escuro")));
  const m=document.querySelector('meta[name="theme-color"]');if(m&&m.setAttribute)m.setAttribute("content",claro?"#f4efe3":"#0b0d12");
}
document.querySelectorAll("#temasw button").forEach(b=>b.onclick=()=>{
  DB.cfg.tema=b.dataset.tema;const gravado=save();aplicarTema();
  const aberta=document.querySelector(".view.on");if(aberta&&aberta.id)ir(aberta.id.slice(2)); /* redesenha gráficos nas cores do tema */
  if(gravado)toast(b.dataset.tema==="claro"?"☀️ Tema claro (pergaminho)":"🌙 Tema escuro (obsidiana)");
});
aplicarTema();

/* ================= NAVEGAÇÃO ================= */
function ir(v){
  document.querySelectorAll(".view").forEach(x=>x.classList.toggle("on",x.id==="v-"+v));
  document.querySelectorAll("nav button").forEach(b=>b.classList.toggle("on",b.dataset.v===v));
  if(v==="montar")renderEsteira();if(v==="check")renderCheck();if(v==="cat")renderCat();if(v==="corpo")renderCorpo();if(v==="evo")renderEvo();if(v==="xp"){renderXP();honPrev()}
  hdrXP();window.scrollTo(0,0);
}
document.querySelectorAll("nav button").forEach(b=>b.onclick=()=>ir(b.dataset.v));

/* ================= MONTAR ================= */
$("#mData").value=hoje();$("#bData").value=hoje();
function renderModelos(){
  const all=[...MODELOS_BASE.map(m=>({...m,base:true})),...DB.modelos];
  $("#modelos").innerHTML=all.map((m,i)=>`<button class="chip" data-i="${i}">${esc(m.n)}${m.base?"":" ⭐"}</button>`).join("");
  $("#modelos").querySelectorAll(".chip").forEach(c=>c.onclick=()=>{const m=all[+c.dataset.i];$("#mTexto").value=m.t;$("#mNome").value=m.n.replace(/^\S+\s/,"");toast("📜 Modelo carregado")});
}
renderModelos();

/* ================= RODÍZIO ================= */
const ROD_START="2026-11-02";
const DIAS=["Dom","Seg","Ter","Qua","Qui","Sex","Sáb"];
const FASES=[
 {f:"Fase 1 · Adaptação",r:"2 séries · sobram ~4 reps · 60–70% da carga antiga",d:{1:"🅰️ Retomada A",2:"🧘 Mobilidade & Recuperação",4:"🅱️ Retomada B",6:"🅰️ Retomada A"}},
 {f:"Fase 1 · Adaptação",r:"2 séries · sobram ~4 reps",d:{1:"🅱️ Retomada B",2:"🏃 Zona 2 + Core",4:"🅰️ Retomada A",6:"🅱️ Retomada B"}},
 {f:"Fase 2 · Volume",r:"3 séries · sobram 2–3 reps · subir aos poucos",d:{1:"🅰️ Retomada A",2:"🏃 Zona 2 + Core",4:"🅱️ Retomada B",6:"🪽 Costas & Postura"}},
 {f:"Fase 2 · Volume",r:"3 séries · sobram 2–3 reps",d:{1:"🅱️ Retomada B",2:"🧘 Mobilidade & Recuperação",4:"🅰️ Retomada A",6:"🏛️ Peito & Tríceps"}}
];
const CICLO=[
 {f:"Fase 3 · Força + queima (A)",r:"Progressão dupla · sobram ~2 reps",d:{1:"🛡️ Upper Força",2:"⚡ HIIT Bike 20'",4:"🦵 Lower sem agachamento",6:"🔥 Full Body Queima (circuito)"}},
 {f:"Fase 3 · Hipertrofia (B)",r:"Progressão dupla · sobram ~2 reps",d:{1:"🏛️ Peito & Tríceps",2:"🏃 Zona 2 + Core",4:"🪽 Costas & Postura",6:"🦵 Lower sem agachamento"}},
 {f:"Fase 3 · Força + braços (C)",r:"Progressão dupla · sobram ~2 reps",d:{1:"🦾 Braços & Ombros",2:"⚡ HIIT Bike 20'",4:"🦵 Lower sem agachamento",6:"🛡️ Upper Força"}},
 {f:"Fase 3 · Deload 🌙",r:"Mesmas cargas, metade das séries · recuperar",d:{1:"🅰️ Retomada A",2:"🧘 Mobilidade & Recuperação",4:"🅱️ Retomada B",6:"🏃 Zona 2 + Core"}}
];
let rodOff=0;
function semanaAtual(){return Math.max(1,Math.floor(diasEntre(ROD_START,hoje())/7)+1)}
function planoSemana(w){return w<=4?FASES[w-1]:CICLO[(w-5)%4]}
function todosModelos(){return[...MODELOS_BASE,...DB.modelos]}
function renderRodizio(){
  const w=Math.max(1,semanaAtual()+rodOff),pl=planoSemana(w);
  const seg=somarDias(ROD_START,(w-1)*7);
  $("#rodTit").textContent=`Semana ${w} · ${fmtD(seg).slice(0,5)}–${fmtD(somarDias(seg,6)).slice(0,5)}`;
  $("#rodFase").innerHTML=`<b style="color:var(--cyan)">${esc(pl.f)}</b> · ${esc(pl.r)}`;
  const ordem=[1,2,3,4,5,6,0];
  $("#rodLista").innerHTML=ordem.map((wd,i)=>{
    const di=somarDias(seg,i),m=pl.d[wd];
    const cls=di===hoje()?" hoje":"";
    return `<div class="rd${cls}"><span class="dd">${DIAS[wd]} ${fmtD(di).slice(0,5)}</span>`+
      (m?`<span>${esc(m)}</span><button class="btn sm" data-rod="${esc(m)}" data-dt="${di}">Carregar</button>`:`<span class="rest">😴 Descanso / atividade leve</span><span></span>`)+`</div>`;
  }).join("");
  $("#rodLista").querySelectorAll("[data-rod]").forEach(b=>b.onclick=()=>{
    const m=todosModelos().find(x=>x.n===b.dataset.rod);if(!m)return toast("Modelo não encontrado");
    $("#mTexto").value=m.t;$("#mNome").value=m.n.replace(/^\S+\s/,"");$("#mData").value=b.dataset.dt;
    toast("📜 "+m.n+" carregado · toque em Gerar");$("#mTexto").scrollIntoView({behavior:"smooth",block:"center"});
  });
}
$("#rodPrev").onclick=()=>{if(semanaAtual()+rodOff>1){rodOff--;renderRodizio()}};
$("#rodNext").onclick=()=>{rodOff++;renderRodizio()};
renderRodizio();

/* ================= TÉCNICA ================= */
const TEC=[
 ["prancha lateral","Corpo em linha reta da cabeça aos pés; quadril alto, sem cair."],
 ["prancha","Glúteo e abdômen contraídos; quadril alinhado, sem afundar."],
 ["supino inclinado","Banco a 30°; halteres descem até o peito alto, cotovelos a ~45°."],
 ["supino com halteres","Escápulas presas; halteres descem ao lado do peito e sobem juntando no alto."],
 ["supino","Escápulas presas, pés firmes; a barra desce na linha do mamilo, sem quicar."],
 ["remada curvada","Quadril dobrado ~45°, coluna neutra; puxe a barra ao umbigo com cotovelos rentes."],
 ["remada unilateral","Mão e joelho no banco, tronco paralelo; puxe o cotovelo em direção ao quadril."],
 ["remada com halter","Tronco firme; puxe o cotovelo ao quadril, sem girar o tronco."],
 ["desenvolvimento militar","Glúteo e abdômen travados; a barra sobe reta, rente ao rosto."],
 ["desenvolvimento","Costas apoiadas e abdômen firme; empurre sem arquear a lombar."],
 ["puxada","Peito alto; leve os cotovelos para baixo e para trás até a barra passar o queixo."],
 ["puxador","Peito alto; leve os cotovelos para baixo e para trás até a barra passar o queixo."],
 ["tríceps testa","Cotovelos apontados para o teto e parados; desça a barra até a testa devagar."],
 ["tríceps na polia","Cotovelos fixos ao lado do corpo; estenda tudo embaixo."],
 ["rosca martelo","Pegada neutra, cotovelos colados; suba sem balançar o tronco."],
 ["rosca","Cotovelos colados ao tronco; desça em 2–3 s."],
 ["terra romeno","Joelho levemente flexionado, quadril para trás; barra rente à coxa até alongar o posterior."],
 ["stiff","Quadril para trás, barra rente à perna, coluna neutra; suba contraindo o glúteo."],
 ["extensora","Sobe em 1 s, segura 1 s no topo, desce em 3 s."],
 ["flexora","Quadril parado e encostado; dobre o joelho sem dar impulso."],
 ["elevação pélvica","Queixo no peito, canela vertical; trave 1 s no topo contraindo o glúteo."],
 ["ponte de glúteo","Pés perto do glúteo; suba contraindo o glúteo, sem arquear a lombar."],
 ["panturrilha","Amplitude total: desce até alongar, sobe na ponta e segura 1 s."],
 ["elevação lateral","O cotovelo guia; suba até a linha do ombro, sem embalar."],
 ["crucifixo inverso","Tronco inclinado, cotovelos levemente dobrados; abra os braços juntando as escápulas."],
 ["voador","Cotovelos levemente dobrados; aperte 1 s com as mãos juntas."],
 ["flexão","Corpo em prancha, cotovelos a ~45°; o peito desce até perto do chão."],
 ["face pull","Corda na altura do rosto; puxe abrindo as mãos ao lado das orelhas, cotovelos altos."],
 ["pullover","Braços quase estendidos; leve a barra da altura da cabeça até a coxa usando as costas."],
 ["superman","De bruços, eleve braços e pernas por 2–3 s; olhar no chão, pescoço solto."],
 ["abdominal na polia","Ajoelhado, enrole a coluna levando os cotovelos às coxas; o quadril não mexe."],
 ["perdigueiro","Em 4 apoios, estenda braço e perna opostos; lombar sem arquear, 2 s parado."],
 ["tiro forte","30 s no máximo sustentável (esforço 9/10), cadência alta; não prenda a respiração."],
 ["bike leve","Recuperação ativa: ritmo em que dá para conversar."],
 ["zona 2","Ritmo em que ainda consegue conversar."],
 ["mobilidade de quadril","Movimentos lentos e amplos (90/90, círculos), sem dor."],
 ["mobilidade torácica","Rotação em 4 apoios; solte o ar enquanto gira."],
 ["alongamento","30 s parado, tensão leve, sem balançar e sem dor."],
 ["respiração","Inspire pelo nariz enchendo a barriga em 4 s, solte em 6 s."]
];
function tecDe(nome){const n=nome.toLowerCase();const t=TEC.find(([k])=>n.includes(k));return t?t[1]:null}
$("#btnSalvarModelo").onclick=()=>{
  const t=$("#mTexto").value.trim();if(!t)return toast("Escreva os exercícios primeiro");
  const n=$("#mNome").value.trim()||"Meu modelo";DB.modelos.push({n,t});const gravado=save();renderModelos();if(gravado)toast("⭐ Modelo salvo");
};
$("#btnGerar").onclick=()=>{
  const blocos=parseTreino($("#mTexto").value);
  if(!blocos.length)return toast("Escreva ao menos 1 exercício");
  const w={id:uid(),nome:$("#mNome").value.trim()||"Treino",data:$("#mData").value||hoje(),texto:$("#mTexto").value,blocos,status:"ativo",criado:Date.now()};
  DB.treinos.push(w);DB.ativo=w.id;save();toast("✅ Checklist gerado · vale 100 XP");ir("check");
};

/* ================= XP ================= */
const XP_COMPLETO=20,XP_PR=15,XP_SEMANA=30,XP_CORPO=10,XP_NIVEL=500;
const RANKS=["🪵 Recruta","🛡️ Escudeiro","⚔️ Cavaleiro","🦁 Paladino","🏰 Guardião","👑 Lorde","🐉 Lenda 360X"];
function ordemTreinos(){return[...DB.treinos].sort((a,b)=>(a.data+String(a.criado)).localeCompare(b.data+String(b.criado)))}
/* XP de um treino: 100 XP divididos igualmente entre os exercícios */
function xpTreino(w){
  const n=w.blocos.reduce((a,b)=>a+b.itens.length,0),per=n?100/n:0;
  let base=0,meta=0,serie=0;const blocos=[],itens={};
  w.blocos.forEach((b,bi)=>{let bb=0,bp=0,bx=0;
    b.itens.forEach((it,ii)=>{
      const tot=it.feito.length||1,f=it.feito.filter(Boolean).length;
      const xb=per*f/tot;
      const ab=it.alvoBase??it.alvo; /* meta original da sessão: subir a meta não apaga o bônus já ganho */
      let xm=0;if(it.real!=null&&ab&&it.real>ab&&f>0)xm=Math.min(per,per*(it.real-ab)/ab);
      const xs=(it.extra||[]).filter(Boolean).length*per/tot;
      base+=xb;meta+=xm;serie+=xs;bb+=xb;bp+=per;bx+=xm+xs;itens[bi+"_"+ii]={xb,xm,xs};
    });blocos.push({bb,bp,bx})});
  const s=stats(w),completo=s.t&&s.d===s.t?XP_COMPLETO:0;
  const r={base:Math.round(base),meta:Math.round(meta),serie:Math.round(serie),completo,blocos,itens};
  r.total=r.base+r.meta+r.serie+r.completo;return r;
}
/* recordes de carga: +15 por exercício que superou a maior carga anterior */
function prMap(){
  const mx=Object.create(null),res=Object.create(null);
  ordemTreinos().forEach(w=>{let n=0;
    w.blocos.forEach(b=>b.itens.forEach(it=>{
      if(!it.carga||!it.feito.some(Boolean))return;const k=it.nome.toLowerCase().trim();
      if(mx[k]!=null&&it.carga>mx[k])n++;mx[k]=Math.max(mx[k]??0,it.carga);
    }));res[w.id]=n*XP_PR});
  return res;
}
function xpEventos(){
  const ev=[],pr=prMap(),sem={};
  ordemTreinos().forEach(w=>{const x=xpTreino(w),d=w.data;
    if(x.base)ev.push({d,t:"base",xp:x.base,s:`✅ ${w.nome}`});
    if(x.completo)ev.push({d,t:"completo",xp:x.completo,s:`🏆 ${w.nome} — 100%`});
    if(x.meta)ev.push({d,t:"meta",xp:x.meta,s:`🎯 Meta superada — ${w.nome}`});
    if(x.serie)ev.push({d,t:"serie",xp:x.serie,s:`➕ Séries extras — ${w.nome}`});
    if(pr[w.id])ev.push({d,t:"pr",xp:pr[w.id],s:`🥇 Recorde de carga — ${w.nome}`});
    if(stats(w).pct>=80){const k=semanaISO(d);(sem[k]=sem[k]||[]).push(d)}
  });
  Object.values(sem).forEach(ds=>{if(ds.length>=3){ds.sort();ev.push({d:ds[2],t:"semana",xp:XP_SEMANA,s:"🔥 Semana com 3+ treinos"})}});
  [...new Set(DB.corpo.map(r=>r.data))].forEach(d=>ev.push({d,t:"corpo",xp:XP_CORPO,s:"📏 Medidas registradas"}));
  const cq=conquistas();
  cq.unlocks.forEach(u=>ev.push({d:u.d,t:"conq",xp:TIERS[u.t].xp,s:`${TIERS[u.t].i} ${u.a.n} — ${TIERS[u.t].n}`}));
  cq.brasoes.forEach(b=>ev.push({d:b.d,t:"brasao",xp:XP_BRASAO,s:`🛡️ Brasão de Honra ao Mérito — ${b.c.n}`}));
  if(cq.supremo)ev.push({d:cq.supremo,t:"brasao",xp:XP_SUPREMO,s:"🐉 Brasão Supremo 360X"});
  DB.metas.forEach(m=>{const i=metaInfo(m);if(i.hit)ev.push({d:i.hit.data,t:"brasao",xp:i.status==="ok"?XP_META_PRAZO:XP_META_TARDE,s:i.status==="ok"?`🎯 Brasão do Alvo — ${MT[m.tipo].n} ${m.alvo} ${MT[m.tipo].u}`:`🎖️ Medalha da Persistência — ${MT[m.tipo].n} ${m.alvo} ${MT[m.tipo].u}`})});
  return ev.sort((a,b)=>a.d.localeCompare(b.d));
}

/* ================= SALA DE HONRA (selo para o Códice do Estudo) ================= */
function honSelo(){
  const ok=d=>/^\d{4}-\d\d-\d\d$/.test(d||""),dias={},dia=d=>dias[d]=dias[d]||{d,xp:0,s:[]};
  xpEventos().forEach(e=>{if(ok(e.d))dia(e.d).xp+=e.xp});
  DB.treinos.forEach(w=>{const st=stats(w);if(st.d&&ok(w.data))dia(w.data).s.push({n:String(w.nome||"Treino").slice(0,60),p:st.pct,s:st.d,v:st.vol})});
  const arr=Object.values(dias).filter(o=>o.xp>0||o.s.length).sort((a,b)=>a.d.localeCompare(b.d));
  const json=JSON.stringify({app:"treino360x",v:2,gerado:hoje(),dias:arr});
  return{code:"TREINO360X:"+btoa(unescape(encodeURIComponent(json))),dias:arr.length,treinos:arr.reduce((a,o)=>a+o.s.length,0),xp:arr.reduce((a,o)=>a+o.xp,0)};
}
function honPrev(){const el=$("#honPrev");if(!el)return;const h=honSelo();el.innerHTML=h.treinos||h.xp?`🏋️ <b>${h.treinos}</b> treinos · ✨ <b>${h.xp.toLocaleString("pt-BR")}</b> XP prontos para a Sala de Honra`:"Marque as séries de um treino para gerar XP."}
$("#btnHonra").onclick=async()=>{
  const h=honSelo();honPrev();
  if(!h.treinos&&!h.xp){toast("Marque as séries de um treino primeiro");return}
  const ta=$("#honCode");ta.value=h.code;ta.style.display="block";
  try{await navigator.clipboard.writeText(h.code);toast("🏆 Selo copiado · cole no Códice do Estudo",true)}
  catch(e){ta.focus();ta.select();toast("Copie o selo da caixa abaixo")}
};

/* ================= CONQUISTAS ================= */
const TIERS=[{n:"Bronze",i:"🥉",xp:25},{n:"Prata",i:"🥈",xp:50},{n:"Ouro",i:"🥇",xp:100},{n:"Troféu",i:"🏆",xp:200}];
const XP_BRASAO=300,XP_SUPREMO=1000;
const CATS=[
 {id:"assid",n:"Assiduidade",i:"📅"},{id:"rend",n:"Rendimento",i:"⚔️"},{id:"pers",n:"Perseverança",i:"🛡️"},
 {id:"super",n:"Superação",i:"🔥"},{id:"xp",n:"Soma de XP",i:"⭐"}];
const ACH=[
 {id:"presenca",c:"assid",n:"Presença no Campo",m:"treinos",t:[1,10,30,100],u:"treinos",d:"Treinos com pelo menos 1 série marcada"},
 {id:"semferro",c:"assid",n:"Semana de Ferro",m:"semanas3",t:[1,4,12,26],u:"semanas",d:"Semanas com 3+ treinos (≥80%)"},
 {id:"constancia",c:"assid",n:"Constância",m:"constancia",t:[2,4,8,16],u:"semanas seguidas",d:"Semanas seguidas com 2+ treinos"},
 {id:"missao",c:"rend",n:"Missão Cumprida",m:"completos",t:[1,10,30,75],u:"treinos 100%",d:"Treinos com todas as séries marcadas"},
 {id:"forja",c:"rend",n:"Forja do Volume",m:"volume",t:[1000,10000,50000,150000],u:"kg",d:"Volume total levantado (séries × reps × kg)"},
 {id:"golpes",c:"rend",n:"Mil Golpes",m:"series",t:[50,300,1000,3000],u:"séries",d:"Séries marcadas no total"},
 {id:"fenix",c:"pers",n:"Fênix",m:"fenix",t:[1,3,6,10],u:"retornos",d:"Voltou a treinar após 7+ dias parado"},
 {id:"dificil",c:"pers",n:"Dia Difícil Vencido",m:"dificil",t:[1,5,15,40],u:"treinos",d:"Dia Difícil, Express ou Mobilidade feitos (≥80%)"},
 {id:"guardiao",c:"pers",n:"Guardião do Corpo",m:"medidas",t:[1,4,12,30],u:"registros",d:"Dias com medidas corporais registradas"},
 {id:"alem",c:"super",n:"Além da Meta",m:"metas",t:[1,10,30,80],u:"metas",d:"Exercícios com Feito acima da Meta"},
 {id:"seriemais",c:"super",n:"Série a Mais",m:"extras",t:[1,10,40,100],u:"séries extras",d:"Séries extras marcadas"},
 {id:"recordista",c:"super",n:"Recordista",m:"prs",t:[1,5,15,40],u:"recordes",d:"Recordes de carga batidos"},
 {id:"lapida",c:"super",n:"Forma em Lapidação",m:"peso",t:[1,3,6,10],u:"kg perdidos",d:"Peso perdido desde o 1º registro"},
 {id:"cintura",c:"super",n:"Cintura de Aço",m:"cintura",t:[1,3,6,10],u:"cm a menos",d:"Cintura reduzida desde o 1º registro"},
 {id:"tesouro",c:"xp",n:"Tesouro de XP",m:"xp",t:[500,2500,7500,20000],u:"XP",d:"XP somado (sem contar as medalhas)"},
 {id:"semlenda",c:"xp",n:"Semana Lendária",m:"xpSemana",t:[150,300,500,800],u:"XP numa semana",d:"Melhor XP numa única semana"}
];
const semAnterior=k=>somarDias(k,-7);
let _cqCache=null,_cqSig="";
/* reproduz a história dia a dia para saber quando cada medalha foi conquistada */
function conquistas(){
  const sig=JSON.stringify([DB.treinos,DB.corpo,DB.metas]);if(sig===_cqSig&&_cqCache)return _cqCache;
  const ws=ordemTreinos().filter(w=>stats(w).d>0),corpo=corpoOrd(),pr=prMap();
  const dias=[...new Set([...ws.map(w=>w.data),...corpo.map(r=>r.data)])].sort();
  const C={treinos:0,semanas3:0,constancia:0,completos:0,volume:0,series:0,fenix:0,dificil:0,medidas:0,metas:0,extras:0,prs:0,peso:0,cintura:0,xp:0,xpSemana:0};
  const s50={},s80={},xpSem={},got={},unlocks=[],brasoes=[],gotB={};let ult=null,supremo=null;
  const p0=(corpo.find(r=>r.peso)||{}).peso,c0=(corpo.find(r=>r.cintura)||{}).cintura;
  dias.forEach(d=>{
    const k=semanaISO(d);let xpDia=0;
    ws.filter(w=>w.data===d).forEach(w=>{
      const s=stats(w),x=xpTreino(w);
      C.treinos++;if(ult&&diasEntre(ult,d)>=7)C.fenix++;ult=d;
      if(s.t&&s.d===s.t)C.completos++;C.volume+=s.vol;C.series+=s.d;
      if(/dif[ií]cil|express|mobilidade/i.test(w.nome)&&s.pct>=80)C.dificil++;
      Object.values(x.itens).forEach(v=>{if(v.xm>0)C.metas++});
      w.blocos.forEach(b=>b.itens.forEach(it=>C.extras+=(it.extra||[]).filter(Boolean).length));
      C.prs+=(pr[w.id]||0)/XP_PR;xpDia+=x.total+(pr[w.id]||0);
      if(s.pct>=50)s50[k]=(s50[k]||0)+1;
      if(s.pct>=80){s80[k]=(s80[k]||0)+1;if(s80[k]===3){C.semanas3++;xpDia+=XP_SEMANA}}
    });
    if(corpo.some(r=>r.data===d)){C.medidas++;xpDia+=XP_CORPO;
      corpo.filter(r=>r.data===d).forEach(r=>{if(p0&&r.peso)C.peso=Math.max(C.peso,+(p0-r.peso).toFixed(1));if(c0&&r.cintura)C.cintura=Math.max(C.cintura,+(c0-r.cintura).toFixed(1))})}
    C.xp+=xpDia;xpSem[k]=(xpSem[k]||0)+xpDia;C.xpSemana=Math.max(C.xpSemana,xpSem[k]);
    let st=0,kk=k;if(!(s50[kk]>=2))kk=semAnterior(kk);while(s50[kk]>=2){st++;kk=semAnterior(kk)}C.constancia=Math.max(C.constancia,st);
    ACH.forEach(a=>a.t.forEach((lim,t)=>{if(C[a.m]>=lim&&!got[a.id+t]){got[a.id+t]=d;unlocks.push({key:a.id+t,a,t,d})}}));
    CATS.forEach(c=>{if(!gotB[c.id]&&ACH.filter(a=>a.c===c.id).every(a=>got[a.id+2])){gotB[c.id]=d;brasoes.push({c,d})}});
    if(!supremo&&CATS.every(c=>gotB[c.id]))supremo=d;
  });
  const nivelDe=a=>{let n=-1;a.t.forEach((lim,t)=>{if(got[a.id+t])n=t});return n};
  _cqSig=sig;_cqCache={C,unlocks,brasoes,gotB,supremo,nivelDe};return _cqCache;
}
/* fotografa XP e medalhas antes de uma ação para comemorar o que mudou depois */
function snap(){return{xp:xpTotal(),k:new Set(conquistas().unlocks.map(u=>u.key).concat(conquistas().brasoes.map(b=>"B"+b.c.id),DB.metas.filter(m=>metaInfo(m).hit).map(m=>"M"+m.id)))}}
function comemorar(s0,msgPadrao){
  const cq=conquistas(),xp=xpTotal();
  const novas=cq.unlocks.filter(u=>!s0.k.has(u.key)),novB=cq.brasoes.filter(b=>!s0.k.has("B"+b.c.id));
  const novM=DB.metas.filter(m=>metaInfo(m).hit&&!s0.k.has("M"+m.id));
  if(novM.length){const m=novM[0],i=metaInfo(m);toast(i.status==="ok"?`🎯 BRASÃO DO ALVO — ${MT[m.tipo].n} ${m.alvo} ${MT[m.tipo].u} no prazo! +${XP_META_PRAZO} XP`:`🎖️ MEDALHA DA PERSISTÊNCIA — ${MT[m.tipo].n} ${m.alvo} ${MT[m.tipo].u}! +${XP_META_TARDE} XP`,true)}
  else if(novB.length)toast(`🛡️ BRASÃO DE HONRA AO MÉRITO — ${novB[0].c.n}! +${XP_BRASAO} XP`,true);
  else if(novas.length){const u=novas[novas.length-1];toast(`${TIERS[u.t].i} Nova conquista: ${u.a.n} (${TIERS[u.t].n}) · +${TIERS[u.t].xp} XP`,true)}
  else if(xp>s0.xp)toast(`⭐ +${xp-s0.xp} XP`);
  else if(msgPadrao)toast(msgPadrao);
  if(nivel(xp).lv>nivel(s0.xp).lv)setTimeout(()=>toast(`🎖️ NÍVEL ${nivel(xp).lv} — ${nivel(xp).rank}!`,true),novas.length||novB.length?4300:300);
}
const RANK_LV=[1,3,6,10,15,20,30]; /* nível em que cada patente começa */
function nivel(xp){const lv=Math.floor(xp/XP_NIVEL)+1;let r=0;RANK_LV.forEach((l,i)=>{if(lv>=l)r=i});return{lv,rank:RANKS[r],ini:(lv-1)*XP_NIVEL}}
function xpTotal(){return xpEventos().reduce((a,e)=>a+e.xp,0)}
function hdrXP(){const t=xpTotal(),n=nivel(t),cq=conquistas();
  $("#hdrXp").textContent=`${n.rank} · Nível ${n.lv} · ⭐ ${t.toLocaleString("pt-BR")} XP · 🏅 ${cq.unlocks.length}${cq.brasoes.length+metasBatidas()?` · 🛡️ ${cq.brasoes.length+metasBatidas()}`:""}`}
const kpi=(v,l)=>`<div class="kpi"><b>${isNaN(+v)?v:(+v).toLocaleString("pt-BR")}</b><small>${l}</small></div>`;
const TIPOS={base:["✅ Exercícios","#c4b5fd"],completo:["🏆 Treino 100%","#d4af37"],meta:["🎯 Meta superada","#34d399"],serie:["➕ Série extra","#22d3ee"],pr:["🥇 Recorde","#fb923c"],semana:["🔥 Semana 3+","#f472b6"],corpo:["📏 Medidas","#93c5fd"],conq:["🏅 Medalhas/troféus","#facc15"],brasao:["🛡️ Brasões","#f7e08a"]};
let conqFiltro="todas";
function renderGloria(){
  const cq=conquistas();
  $("#brasoes").innerHTML=CATS.map(c=>{const on=cq.gotB[c.id],achs=ACH.filter(a=>a.c===c.id),ouro=achs.filter(a=>cq.nivelDe(a)>=2).length;
    return`<div class="bra${on?" on":""}"><div class="sh">${c.i}</div><b>${c.n}</b><small>${on?"🛡️ "+fmtD(on):`${ouro}/${achs.length} no 🥇`}</small></div>`}).join("")+
    `<div class="bra sup${cq.supremo?" on":""}"><div class="sh">🐉</div><b>Brasão Supremo 360X</b><small>${cq.supremo?"Conquistado em "+fmtD(cq.supremo):`${cq.brasoes.length}/5 brasões`}</small></div>`+
    DB.metas.map(m=>({m,i:metaInfo(m)})).filter(o=>o.i.hit).map(({m,i})=>`<div class="bra on"><div class="sh">${i.status==="ok"?"🎯":"🎖️"}</div><b>${i.status==="ok"?"Brasão do Alvo":"Persistência"}</b><small>${MT[m.tipo].n} ${m.alvo} ${MT[m.tipo].u} · ${fmtD(i.hit.data)}</small></div>`).join("");
  const tot=ACH.length*4,cnt=t=>cq.unlocks.filter(u=>u.t===t).length;
  $("#conqKpis").innerHTML=kpi(cq.unlocks.length,`de ${tot} conquistas`)+kpi(cnt(0)+cnt(1)+cnt(2),"🥉🥈🥇 medalhas")+kpi(cnt(3),"🏆 troféus")+kpi(cq.brasoes.length,"🛡️ brasões")+
    kpi(cq.unlocks.reduce((a,u)=>a+TIERS[u.t].xp,0)+cq.brasoes.length*XP_BRASAO+(cq.supremo?XP_SUPREMO:0),"XP de glória")+kpi(Math.round(cq.unlocks.length/tot*100),"% da coleção");
  $("#conqFilt").innerHTML=[{id:"todas",n:"Todas",i:"🏅"},...CATS].map(c=>`<button class="chip${conqFiltro===c.id?" on":""}" data-cf="${c.id}" style="${conqFiltro===c.id?"border-color:var(--gold);color:var(--gold2)":""}">${c.i} ${c.n}</button>`).join("");
  $("#conqFilt").querySelectorAll("[data-cf]").forEach(b=>b.onclick=()=>{conqFiltro=b.dataset.cf;renderGloria()});
  $("#conqs").innerHTML=ACH.filter(a=>conqFiltro==="todas"||a.c===conqFiltro).map(a=>{
    const nv=cq.nivelDe(a),v=cq.C[a.m],prox=a.t[nv+1],ant=nv>=0?a.t[nv]:0;
    const pct=prox?Math.min(100,Math.max(0,v/prox*100)):100,fmt=x=>(+x).toLocaleString("pt-BR");
    const cat=CATS.find(c=>c.id===a.c);
    return`<div class="cq${nv<0?" lock":""}${nv===3?" max":""}"><div class="md">${nv<0?"🔒":TIERS[nv].i}</div><div>
      <div class="nm">${a.n} <small style="color:var(--mut);font-weight:400">${cat.i}</small></div>
      <div class="ds">${a.d}</div>
      <div class="tiers">${TIERS.map((t,i)=>`<span class="${i<=nv?"on":""}" title="${t.n}: ${fmt(a.t[i])} ${a.u}">${t.i}</span>`).join("")}</div>
      <div class="pb"><div style="width:${pct}%"></div></div>
      <div class="pt">${prox?`${fmt(v)} / ${fmt(prox)} ${a.u} → ${TIERS[nv+1].i} +${TIERS[nv+1].xp} XP`:`🏆 Completa! ${fmt(v)} ${a.u}`}</div></div></div>`}).join("");
}
function renderXP(){
  const ev=xpEventos(),tot=ev.reduce((a,e)=>a+e.xp,0),n=nivel(tot);
  $("#xpRank").textContent=`${n.rank} · Nível ${n.lv}`;
  $("#xpLvlBar").style.width=((tot-n.ini)/XP_NIVEL*100)+"%";
  $("#xpLvlTxt").textContent=`${tot-n.ini} / ${XP_NIVEL} XP para o nível ${n.lv+1}`;
  const sa=semanaISO(hoje()),xs=ev.filter(e=>semanaISO(e.d)===sa).reduce((a,e)=>a+e.xp,0);
  const d30=ev.filter(e=>recente(e.d,30)).reduce((a,e)=>a+e.xp,0);
  const ws=ordemTreinos().filter(w=>stats(w).d>0),pr=prMap();
  const media=ws.length?Math.round(ws.reduce((a,w)=>a+xpTreino(w).total+(pr[w.id]||0),0)/ws.length):0;
  const extra=ev.filter(e=>e.t!=="base"&&e.t!=="conq"&&e.t!=="brasao").reduce((a,e)=>a+e.xp,0);
  $("#xpKpis").innerHTML=kpi(tot,"XP total")+kpi(xs,"XP nesta semana")+kpi(d30,"XP em 30 dias")+kpi(media,"XP médio/treino")+kpi(extra,"XP extra total")+kpi(ws.length,"treinos com XP");
  const porDia={};ev.forEach(e=>porDia[e.d]=(porDia[e.d]||0)+e.xp);
  const dias=Object.keys(porDia).sort();let ac=0;
  mkChart("chXpAcum",{type:"line",data:{labels:dias.map(d=>fmtD(d).slice(0,5)),datasets:[{label:"XP acumulado",data:dias.map(d=>ac+=porDia[d]),borderColor:"#c4b5fd",backgroundColor:"rgba(196,181,253,.15)",fill:true,tension:.3,pointRadius:4}]},options:{scales:{y:{beginAtZero:true}}}});
  renderGloria();
  const wl=ws.slice(-20);
  mkChart("chXpTreino",{type:"bar",data:{labels:wl.map(w=>fmtD(w.data).slice(0,5)),datasets:[
    {label:"Base (máx. 100)",data:wl.map(w=>xpTreino(w).base),backgroundColor:"#c4b5fd",stack:"x"},
    {label:"Extras",data:wl.map(w=>{const x=xpTreino(w);return x.meta+x.serie+x.completo+(pr[w.id]||0)}),backgroundColor:"#34d399",stack:"x"}]},
    options:{scales:{x:{stacked:true},y:{stacked:true,beginAtZero:true}}}});
  const sem={};ev.forEach(e=>{const k=semanaISO(e.d);sem[k]=(sem[k]||0)+e.xp});
  const ks=Object.keys(sem).sort().slice(-12);
  mkChart("chXpSemana",{type:"bar",data:{labels:ks.map(k=>fmtD(k).slice(0,5)),datasets:[{label:"XP na semana",data:ks.map(k=>sem[k]),backgroundColor:"#d4af37"}]},options:{scales:{y:{beginAtZero:true}}}});
  const fonte={};ev.forEach(e=>fonte[e.t]=(fonte[e.t]||0)+e.xp);const ft=Object.keys(fonte);
  mkChart("chXpFonte",{type:"doughnut",data:{labels:ft.map(t=>TIPOS[t][0]),datasets:[{data:ft.map(t=>fonte[t]),backgroundColor:ft.map(t=>TIPOS[t][1]),borderColor:corVar("--card")||"#12161f"}]},options:{plugins:{legend:{position:"right",labels:{boxWidth:12}}}}});
  $("#xpLog").innerHTML=ev.length?[...ev].reverse().slice(0,15).map(e=>`<div class="lg"><span>${esc(e.s)}<br><small>${fmtD(e.d)}</small></span><b>+${e.xp} XP</b></div>`).join(""):`<div class="empty">Marque séries no checklist para ganhar XP ⭐</div>`;
}

/* ================= CHECKLIST ================= */
const TAGS=["tagA","tagB","tagC","tagD"];
function getW(id){return DB.treinos.find(w=>w.id===id)}
function stats(w){
  let t=0,d=0,vol=0;
  w.blocos.forEach(b=>b.itens.forEach(it=>{t+=it.feito.length;const f=it.feito.filter(Boolean).length;d+=f;
    const fx=(it.extra||[]).filter(Boolean).length;const reps=it.real!=null&&it.real>0?it.real:it.alvo;
    if(it.un==="reps"&&reps&&it.carga)vol+=(f+fx)*reps*it.carga}));
  return{t,d,pct:t?Math.round(d/t*100):0,vol:Math.round(vol)};
}
function renderCheck(){
  const w=getW(DB.ativo);const body=$("#cBody");
  if(!w){$("#cTitulo").textContent="✅ Checklist";body.innerHTML=`<div class="card empty">Nenhum treino aberto.<br><br>Monte um em <b>🛠️ Montar</b> ou abra um do <b>📚 Catálogo</b>.</div>`;return}
  $("#cTitulo").textContent="✅ "+w.nome;
  let h=`<div class="card"><div class="wk"><div><div class="t">📅 ${fmtD(w.data)}</div><div class="d">${w.status==="concluido"?"Concluído e catalogado":"Em andamento — fez, marcou ✔"}</div></div>
    <span class="pill ${w.status==="concluido"?"ok":"go"}">${w.status==="concluido"?"🏆 concluído":"⏳ ativo"}</span></div>
    <div class="prog"><div class="bar" id="cBar"></div></div><div class="ptxt" id="cPtxt"></div>
    <div class="xphead"><span>⭐ XP do treino</span><span><span class="big" id="cXp"></span> <span class="ext" id="cXpExt"></span></span></div>
    <div class="hint" style="margin-top:4px">🎯 Fez mais que a meta? Preencha <b>Feito</b> (ganha XP extra) ou ajuste a <b>Meta</b>. ➕ série = série extra.</div>
    ${w.tipo==="esteira"?`<button class="btn" id="eSessao">▶ Iniciar sessão (segmentos em sequência)</button>`:`<div class="rest-cfg">⏱️ Descanso: ${[45,60,90,120,180].map(x=>`<button data-desc="${x}" class="${DB.cfg.desc===x?"on":""}">${x<120?x+"s":(x/60)+" min"}</button>`).join("")}
      <label><input type="checkbox" id="autoDesc" ${DB.cfg.autoDesc?"checked":""}> automático</label><button id="descAgora">▶ agora</button></div>`}</div>`;
  w.blocos.forEach((b,bi)=>{
    b.itens.forEach(it=>{if(!it.extra)it.extra=[]});
    const multi=b.itens.length>1;
    const titulo=multi?"🔁 "+b.itens.map(i=>esc(i.nome)).join(" ↔ "):esc(b.itens[0].nome);
    const meta=b.itens.map(i=>`${i.feito.length}×${alvoTxt(i)||"✓"}`.replace(/×(\d+(?:\.\d+)?) reps/,"×$1")).join(" · ");
    h+=`<div class="group" data-b="${bi}"><div class="gh"><span>${titulo}</span><span class="r"><span class="m">${esc(meta)}</span><br><span class="xpbadge" id="xpb${bi}"></span></span></div>`;
    b.itens.forEach(it=>{const tp=tecDe(it.nome);if(tp)h+=`<div class="tec">💡 ${multi?`<b>${esc(it.nome)}:</b> `:""}${esc(tp)}</div>`});
    b.itens.forEach((it,ii)=>{if(it.un==="reps")h+=`<div class="load">🏋️ Carga ${multi?`<b class="${TAGS[ii%4]}">${esc(it.nome)}</b>`:""} <input type="number" step="0.5" inputmode="decimal" placeholder="kg" value="${it.carga??""}" data-b="${bi}" data-i="${ii}"> kg</div>`});
    const max=Math.max(...b.itens.map(i=>i.feito.length));
    for(let s=0;s<max;s++)b.itens.forEach((it,ii)=>{
      if(s>=it.feito.length)return;
      const lbl=multi?`<b class="${TAGS[ii%4]}">${esc(it.nome)} ${s+1}</b>`:`Série ${s+1}`;
      const alvo=alvoTxt(it);
      h+=`<label class="item"><input type="checkbox" data-b="${bi}" data-i="${ii}" data-s="${s}" ${it.feito[s]?"checked":""}><span>${lbl}${alvo?" — "+alvo:""}${!multi&&it.carga&&it.un==="reps"?` · ${it.carga} kg`:""}</span>${(it.un==="s"||it.un==="min")&&it.alvo?`<button class="tmr" data-tmr="1" data-b="${bi}" data-i="${ii}" data-s="${s}">▶ ${alvoTxt(it)}</button>`:""}</label>`;
    });
    b.itens.forEach((it,ii)=>it.extra.forEach((v,ei)=>{
      h+=`<label class="item extra"><input type="checkbox" data-b="${bi}" data-i="${ii}" data-x="${ei}" ${v?"checked":""}><span>➕ ${multi?`<b class="${TAGS[ii%4]}">${esc(it.nome)}</b> · `:""}Série extra ${ei+1}${alvoTxt(it)?" — "+alvoTxt(it):""}</span></label>`;
    }));
    b.itens.forEach((it,ii)=>{
      const un=it.un==="reps"?"reps":it.un||"";
      h+=`<div class="xprow">${multi?`<div class="nm"><b class="${TAGS[ii%4]}">${esc(it.nome)}</b></div>`:""}
        <div class="fl">
          <label>🎯 Meta ${un?`(${un})`:""}<input type="number" step="0.5" inputmode="decimal" value="${it.alvo??""}" data-meta="1" data-b="${bi}" data-i="${ii}"></label>
          <label>✅ Feito ${un?`(${un})`:""}<input type="number" step="0.5" inputmode="decimal" placeholder="—" value="${it.real??""}" data-real="1" data-b="${bi}" data-i="${ii}"></label>
          <span class="bt"><button class="btn xs sec" data-addx="1" data-b="${bi}" data-i="${ii}">➕ série</button>${it.extra.length?`<button class="btn xs del" data-delx="1" data-b="${bi}" data-i="${ii}">−</button>`:""}</span>
        </div>
        <span class="plus" id="xr${bi}_${ii}"></span></div>`;
    });
    h+=`</div>`;
  });
  h+=`<button class="btn ok" id="btnConcluir">🏆 Concluir e catalogar</button>
      <button class="btn sec" id="btnEditar">✏️ Usar como base para novo treino</button>`;
  body.innerHTML=h;
  body.querySelectorAll("input[type=checkbox]").forEach(c=>c.onchange=()=>{
    const it=w.blocos[c.dataset.b].itens[c.dataset.i];
    const s0=snap();
    if(c.dataset.x!=null)it.extra[+c.dataset.x]=c.checked;else it.feito[+c.dataset.s]=c.checked;
    save();updCheck(w);if(c.checked){comemorar(s0);const st=stats(w);if(DB.cfg.autoDesc&&w.tipo!=="esteira"&&st.d<st.t&&!(TM.h&&TM.tipo==="ex"))timerIniciar(DB.cfg.desc,"⏱️ Descanso","desc")}
  });
  body.querySelectorAll(".load input").forEach(inp=>inp.onchange=()=>{
    w.blocos[inp.dataset.b].itens[inp.dataset.i].carga=num(inp.value);w.texto=blocosTexto(w);const gravado=save();updCheck(w);if(gravado)toast("💾 Carga salva");
  });
  body.querySelectorAll("[data-meta]").forEach(inp=>inp.onchange=()=>{
    const it=w.blocos[inp.dataset.b].itens[inp.dataset.i],v=num(inp.value);
    if(v==null||v<=0){inp.value=it.alvo??"";return toast("Meta inválida")}
    if(it.alvoBase==null&&it.alvo!=null)it.alvoBase=it.alvo; /* guarda a meta original desta sessão */
    it.alvo=v;if(!it.un)it.un="reps";w.texto=blocosTexto(w);const gravado=save();renderCheck();if(gravado)toast("🎯 Nova meta salva · vale no próximo Repetir");
  });
  body.querySelectorAll("[data-real]").forEach(inp=>inp.onchange=()=>{
    const it=w.blocos[inp.dataset.b].itens[inp.dataset.i],s0=snap();it.real=num(inp.value);
    const gravado=save();updCheck(w);const ab=it.alvoBase??it.alvo;
    if(it.real!=null&&ab&&it.real>ab){if(!it.feito.some(Boolean))toast("🔥 Meta superada! Marque a série para pontuar");else comemorar(s0,"🔥 Meta superada!")}
    else if(gravado)toast("💾 Registrado");
  });
  body.querySelectorAll("[data-addx]").forEach(bt=>bt.onclick=()=>{
    w.blocos[bt.dataset.b].itens[bt.dataset.i].extra.push(false);save();renderCheck();toast("➕ Série extra adicionada");
  });
  body.querySelectorAll("[data-delx]").forEach(bt=>bt.onclick=()=>{
    w.blocos[bt.dataset.b].itens[bt.dataset.i].extra.pop();save();renderCheck();
  });
  body.querySelectorAll("[data-tmr]").forEach(bt=>bt.onclick=e=>{
    e.preventDefault();e.stopPropagation();audioUnlock();
    const bi=+bt.dataset.b,ii=+bt.dataset.i,si=+bt.dataset.s,it=w.blocos[bi].itens[ii],wid=w.id;
    const seg=it.un==="min"?it.alvo*60:it.alvo;
    timerIniciar(seg,w.tipo==="esteira"?`🏃 ${it.nome}`:`🔥 ${it.nome} · série ${si+1}`,"ex",()=>{
      const cb=document.querySelector(`#cBody input[data-b="${bi}"][data-i="${ii}"][data-s="${si}"]`);
      if(cb&&DB.ativo===wid&&$("#v-check").classList.contains("on")){if(!cb.checked){cb.checked=true;cb.dispatchEvent(new Event("change"))}else setTimeout(()=>{if(!TM.h)timerFechar()},3000)
        if(w.tipo==="esteira")setTimeout(()=>{if(!TM.h)proximoSegmento(wid)},1200)}
      else{const ww=getW(wid);if(ww){const s0=snap();ww.blocos[bi].itens[ii].feito[si]=true;save();comemorar(s0)}setTimeout(()=>{if(!TM.h)timerFechar()},3000)}
    });
  });
  if(w.tipo==="esteira"){$("#eSessao").onclick=()=>{audioUnlock();proximoSegmento(w.id)}}
  else{
  body.querySelectorAll("[data-desc]").forEach(bt=>bt.onclick=()=>{DB.cfg.desc=+bt.dataset.desc;save();body.querySelectorAll("[data-desc]").forEach(x=>x.classList.toggle("on",x===bt));toast(`⏱️ Descanso: ${bt.textContent}`)});
  $("#autoDesc").onchange=e=>{DB.cfg.autoDesc=e.target.checked;save();toast(e.target.checked?"⏱️ Descanso automático ligado":"Descanso automático desligado")};
  $("#descAgora").onclick=()=>{audioUnlock();timerIniciar(DB.cfg.desc,"⏱️ Descanso","desc")};
  }
  $("#btnConcluir").onclick=()=>{
    w.status="concluido";w.concluido=Date.now();save();renderCheck();
    const x=xpTreino(w),p=prMap()[w.id]||0;toast(`🏆 Catalogado: ${stats(w).pct}% · ⭐ ${x.total+p} XP neste treino`,true);
  };
  $("#btnEditar").onclick=()=>{
    $("#mNome").value=w.nome;$("#mData").value=w.data;$("#mTexto").value=w.texto||blocosTexto(w);
    toast("✏️ Ajuste e toque em Gerar checklist");ir("montar");
  };
  updCheck(w);
}
function updCheck(w){
  const s=stats(w);$("#cBar").style.width=s.pct+"%";$("#cPtxt").textContent=`${s.d} / ${s.t} feitos · ${s.pct}%`;
  document.querySelectorAll("#cBody .group").forEach(g=>{const bs=[...g.querySelectorAll("input[data-s]")];g.classList.toggle("done",bs.length&&bs.every(b=>b.checked))});
  const x=xpTreino(w),pr=prMap()[w.id]||0,ext=x.meta+x.serie+x.completo+pr;
  $("#cXp").textContent=`${x.base} / 100 XP`;
  $("#cXpExt").textContent=ext?`+${ext} extra`:"";
  x.blocos.forEach((b,bi)=>{const e=$("#xpb"+bi);if(e)e.textContent=`⭐ ${Math.round(b.bb)}/${Math.round(b.bp)} XP${b.bx>=0.5?` · +${Math.round(b.bx)}`:""}`});
  Object.entries(x.itens).forEach(([k,v])=>{const e=$("#xr"+k);if(e)e.textContent=v.xm>=0.5?`🔥 +${Math.round(v.xm)} XP`:""});
  hdrXP();
}

/* ================= CATÁLOGO ================= */
$("#catBusca").oninput=renderCat;
function renderCat(){
  const q=($("#catBusca").value||"").toLowerCase(),pr=prMap();
  const ws=[...DB.treinos].sort((a,b)=>(b.data+b.criado).localeCompare(a.data+a.criado))
    .filter(w=>!q||w.nome.toLowerCase().includes(q)||(w.texto||"").toLowerCase().includes(q));
  const conc=DB.treinos.filter(w=>w.status==="concluido").length;
  const d30=DB.treinos.filter(w=>w.status==="concluido"&&recente(w.data,30)).length;
  $("#catKpis").innerHTML=kpi(DB.treinos.length,"treinos")+kpi(conc,"concluídos")+kpi(d30,"últimos 30 dias");
  if(!ws.length){$("#catLista").innerHTML=`<div class="card empty">📭 Nenhum treino catalogado ainda.</div>`;return}
  $("#catLista").innerHTML=ws.map(w=>{const s=stats(w),xp=xpTreino(w).total+(pr[w.id]||0);const ex=w.blocos.flatMap(b=>b.itens.map(i=>i.nome));
    return`<div class="card"><div class="wk"><div><div class="t">${esc(w.nome)}</div><div class="d">📅 ${fmtD(w.data)} · ${ex.length} exercícios · ${s.d}/${s.t} séries${s.vol?` · ${s.vol.toLocaleString("pt-BR")} kg`:""}</div></div>
      <span><span class="pill ${w.status==="concluido"?"ok":"go"}">${w.status==="concluido"?"🏆 "+s.pct+"%":"⏳ "+s.pct+"%"}</span> <span class="pill xp">⭐ ${xp}</span></span></div>
      <div class="d" style="margin-top:6px;font-size:12px;color:var(--mut)">${esc(ex.slice(0,6).join(" · "))}${ex.length>6?" …":""}</div>
      <div class="acts"><button class="btn sm sec" data-a="abrir" data-id="${w.id}">📂 Abrir</button>
      <button class="btn sm sec" data-a="repetir" data-id="${w.id}">🔁 Repetir hoje</button>
      <button class="btn sm del" data-a="apagar" data-id="${w.id}">🗑️</button></div></div>`}).join("");
  $("#catLista").querySelectorAll("button").forEach(b=>b.onclick=()=>{
    const w=getW(b.dataset.id);if(!w)return;
    if(b.dataset.a==="abrir"){DB.ativo=w.id;save();ir("check")}
    if(b.dataset.a==="repetir"){
      const n=JSON.parse(JSON.stringify(w));n.id=uid();n.data=hoje();n.status="ativo";n.criado=Date.now();delete n.concluido;
      n.blocos.forEach(bl=>{bl.id=uid();bl.itens.forEach(i=>{i.feito=i.feito.map(()=>false);i.extra=[];delete i.real;delete i.alvoBase})});
      n.texto=blocosTexto(n);DB.treinos.push(n);DB.ativo=n.id;save();toast("🔁 Novo checklist com as mesmas metas e cargas");ir("check");
    }
    if(b.dataset.a==="apagar"){if(b.dataset.c){DB.treinos=DB.treinos.filter(x=>x.id!==w.id);if(DB.ativo===w.id)DB.ativo=null;save();renderCat();hdrXP();toast("🗑️ Apagado")}
      else{b.dataset.c="1";b.textContent="Confirmar?";setTimeout(()=>{b.dataset.c="";b.textContent="🗑️"},3000)}}
  });
}

/* ================= CORPO ================= */
const CAMPOS=[["peso","bPeso"],["altura","bAltura"],["cintura","bCintura"],["quadril","bQuadril"],["abdome","bAbdome"],["peito","bPeito"],["braco","bBraco"],["coxa","bCoxa"],["panturrilha","bPant"],["pescoco","bPescoco"],["gordura","bGord"]];
function corpoOrd(){return[...DB.corpo].sort((a,b)=>a.data.localeCompare(b.data))}
function ultimaAltura(){const c=corpoOrd().filter(x=>x.altura);return c.length?c[c.length-1].altura:null}
function imc(r){const h=r.altura||ultimaAltura();return r.peso&&h?r.peso/((h/100)**2):null}
function classIMC(v){if(v==null)return"";if(v<18.5)return"baixo peso";if(v<25)return"eutrofia";if(v<30)return"sobrepeso";if(v<35)return"obesidade I";if(v<40)return"obesidade II";return"obesidade III"}
$("#btnCorpo").onclick=()=>{
  const r={id:uid(),data:$("#bData").value||hoje()};let algum=false;
  if(r.data>hoje())return toast("Use a data em que fez a medição");
  CAMPOS.forEach(([k,id])=>{const v=num($("#"+id).value);if(v!=null){r[k]=v;algum=true}});
  if(!algum)return toast("Preencha ao menos 1 medida");
  if(!r.altura&&ultimaAltura())r.altura=ultimaAltura();
  const s0=snap();
  DB.corpo.push(r);const gravado=save();
  CAMPOS.forEach(([k,id])=>{if(k!=="altura")$("#"+id).value=""});renderCorpo();hdrXP();
  if(gravado)comemorar(s0,"📏 Medidas registradas");
};
function renderCorpo(){
  renderMetas();
  if(!$("#bAltura").value&&ultimaAltura())$("#bAltura").value=ultimaAltura();
  const c=corpoOrd();const u=c[c.length-1];const p=c[0];
  if(u){
    const i=imc(u);const rcq=u.cintura&&u.quadril?(u.cintura/u.quadril):null;const rca=u.cintura&&(u.altura||ultimaAltura())?u.cintura/(u.altura||ultimaAltura()):null;
    const dp=u.peso&&p&&p.peso&&p!==u?(u.peso-p.peso):null;
    $("#corpoKpis").innerHTML=`<div class="kpi"><b>${u.peso??"—"}</b><small>kg ${dp!=null?`(${dp>0?"+":""}${dp.toFixed(1)})`:""}</small></div>
      <div class="kpi"><b>${i?i.toFixed(1):"—"}</b><small>IMC · ${classIMC(i)}</small></div>
      <div class="kpi"><b>${rca?rca.toFixed(2):(rcq?rcq.toFixed(2):"—")}</b><small>${rca?"cintura/altura (alvo <0,5)":"cintura/quadril"}</small></div>`;
  }else $("#corpoKpis").innerHTML="";
  if(!c.length){$("#corpoTab").innerHTML=`<tr><td class="empty">Nenhuma medida ainda.</td></tr>`;return}
  const cols=CAMPOS.filter(([k])=>c.some(r=>r[k]!=null&&k!=="altura"));
  $("#corpoTab").innerHTML=`<tr><th>Data</th>${cols.map(([k])=>`<th>${k==="braco"?"braço":k==="pescoco"?"pescoço":k==="gordura"?"%G":k}</th>`).join("")}<th>IMC</th><th></th></tr>`+
    [...c].reverse().map(r=>`<tr><td>${fmtD(r.data)}</td>${cols.map(([k])=>`<td>${r[k]??"–"}</td>`).join("")}<td>${imc(r)?imc(r).toFixed(1):"–"}</td><td><button class="btn sm del" data-id="${r.id}">✕</button></td></tr>`).join("");
  $("#corpoTab").querySelectorAll("button").forEach(b=>b.onclick=()=>{if(b.dataset.c){DB.corpo=DB.corpo.filter(x=>x.id!==b.dataset.id);save();renderCorpo();hdrXP()}else{b.dataset.c="1";b.textContent="?"}});
}

/* ================= EVOLUÇÃO ================= */
function mkChart(id,cfg){
  if(typeof Chart==="undefined"){const el=$("#"+id);if(el)el.parentNode.innerHTML=`<div class="empty">Gráficos indisponíveis offline.</div>`;return}
  if(charts[id])charts[id].destroy();
  Chart.defaults.color=corVar("--mut")||"#8b90a0";Chart.defaults.borderColor=corVar("--line")||"#2a2f3c";Chart.defaults.font.family="-apple-system,Segoe UI,Roboto,sans-serif";
  cfg.options=Object.assign({responsive:true,maintainAspectRatio:false,plugins:{legend:{labels:{boxWidth:12}}}},cfg.options||{});
  charts[id]=new Chart($("#"+id),cfg);
}
const PAL=["#d4af37","#22d3ee","#34d399","#f472b6","#a78bfa","#fb923c","#93c5fd","#facc15"];
function semanaISO(iso){return somarDias(iso,-((diaUTC(iso).getUTCDay()+6)%7))}
function renderEvo(){
  renderHeat();
  const c=corpoOrd();const ws=DB.treinos.filter(w=>w.status==="concluido").sort((a,b)=>a.data.localeCompare(b.data));
  const totS=ws.reduce((a,w)=>a+stats(w).d,0);const totV=ws.reduce((a,w)=>a+stats(w).vol,0);
  $("#evoKpis").innerHTML=kpi(ws.length,"treinos concluídos")+kpi(totS,"séries feitas")+`<div class="kpi"><b>${(totV/1000).toFixed(1)}t</b><small>volume total</small></div>`;
  const cp=c.filter(r=>r.peso);
  mkChart("chPeso",{type:"line",data:{labels:cp.map(r=>fmtD(r.data).slice(0,5)),datasets:[
    {label:"Peso (kg)",data:cp.map(r=>r.peso),borderColor:PAL[0],backgroundColor:PAL[0],tension:.3,yAxisID:"y"},
    {label:"IMC",data:cp.map(r=>imc(r)?+imc(r).toFixed(1):null),borderColor:PAL[1],backgroundColor:PAL[1],tension:.3,yAxisID:"y1"}].concat(linhaMeta("peso",cp.length,"y"))},
    options:{scales:{y:{position:"left"},y1:{position:"right",grid:{drawOnChartArea:false}}}}});
  const med=["cintura","abdome","quadril","peito","braco","coxa","panturrilha","pescoco"].filter(k=>c.some(r=>r[k]!=null));
  const cm=c.filter(r=>med.some(k=>r[k]!=null));
  mkChart("chMedidas",{type:"line",data:{labels:cm.map(r=>fmtD(r.data).slice(0,5)),datasets:med.map((k,i)=>({label:k==="braco"?"braço":k==="pescoco"?"pescoço":k,data:cm.map(r=>r[k]??null),borderColor:PAL[i%8],backgroundColor:PAL[i%8],tension:.3,spanGaps:true})).concat(linhaMeta("cintura",cm.length))}});
  const sem={};ws.forEach(w=>{const k=semanaISO(w.data);sem[k]=(sem[k]||0)+1});
  const ks=Object.keys(sem).sort().slice(-12);
  mkChart("chSemana",{type:"bar",data:{labels:ks.map(k=>fmtD(k).slice(0,5)),datasets:[{label:"Treinos",data:ks.map(k=>sem[k]),backgroundColor:PAL[2]}]},options:{scales:{y:{beginAtZero:true,ticks:{stepSize:1}}}}});
  const wl=ws.slice(-20);
  mkChart("chVolume",{type:"bar",data:{labels:wl.map(w=>fmtD(w.data).slice(0,5)),datasets:[{label:"Volume (kg)",data:wl.map(w=>stats(w).vol),backgroundColor:PAL[0]},{label:"Séries feitas",data:wl.map(w=>stats(w).d),type:"line",borderColor:PAL[1],backgroundColor:PAL[1],yAxisID:"y1"}]},
    options:{scales:{y:{beginAtZero:true},y1:{position:"right",beginAtZero:true,grid:{drawOnChartArea:false}}}}});
  const nomes=[...new Set(ws.flatMap(w=>w.blocos.flatMap(b=>b.itens.filter(i=>i.carga).map(i=>i.nome))))].sort();
  const sel=$("#evoEx");const atual=sel.value;
  sel.innerHTML=nomes.length?nomes.map(n=>`<option ${n===atual?"selected":""}>${esc(n)}</option>`).join(""):`<option>— registre cargas no checklist —</option>`;
  sel.onchange=()=>cargaChart(ws);cargaChart(ws);
}
function cargaChart(ws){
  const n=$("#evoEx").value;const pts=[];
  ws.forEach(w=>w.blocos.forEach(b=>b.itens.forEach(i=>{if(i.nome===n&&i.carga)pts.push({x:fmtD(w.data).slice(0,5),y:i.carga})})));
  mkChart("chCarga",{type:"line",data:{labels:pts.map(p=>p.x),datasets:[{label:n+" (kg)",data:pts.map(p=>p.y),borderColor:PAL[0],backgroundColor:PAL[0],tension:.3}]}});
}

/* ================= DADOS ================= */
function backupTxt(){return JSON.stringify({app:"codice-do-treino-360x",versao:18,exportado:new Date().toISOString(),...DB},null,2)}
$("#btnExport").onclick=async()=>{
  const nome=`codice-treino-backup-${hoje()}.json`,txt=backupTxt();
  const arquivo=new File([txt],nome,{type:"application/json"});
  if(navigator.share&&navigator.canShare?.({files:[arquivo]})){
    try{await navigator.share({files:[arquivo]});return}
    catch(e){if(e.name==="AbortError")return}
  }
  try{
    const a=document.createElement("a");
    const url=URL.createObjectURL(arquivo);
    a.href=url;a.download=nome;
    document.body.appendChild(a);a.click();a.remove();
    setTimeout(()=>URL.revokeObjectURL(url),30000);
    toast("⬇️ Download solicitado");
  }catch(e){
    toast("Use 📋 Copiar backup");
  }
};
$("#btnCopy").onclick=async()=>{try{await navigator.clipboard.writeText(backupTxt());toast("📋 Backup copiado")}catch(e){toast("Não foi possível copiar")}};
let importacao=null;
$("#fImport").onchange=async e=>{
  const input=e.target,f=input.files[0];
  importacao=null;
  $("#importPreview").hidden=true;
  if(!f)return;
  try{
    const dados=validarDados(JSON.parse(await f.text()),true);
    if(input.files[0]!==f)return;
    importacao=dados;
    $("#importSummary").textContent=`O arquivo contém ${dados.treinos.length} treino(s), ${dados.corpo.length} registro(s) de medidas, ${dados.modelos.length} modelo(s) e ${dados.metas.length} meta(s). A restauração substitui os dados atuais deste app.`;
    $("#importPreview").hidden=false;
  }catch(x){
    if(input.files[0]!==f)return;
    input.value="";
    toast("❌ Backup inválido ou incompatível. Seus dados atuais foram preservados.");
  }
};
$("#btnImport").onclick=()=>{
  if(!importacao||!save(importacao,true))return;
  importacao=null;
  $("#importPreview").hidden=true;
  $("#fImport").value="";
  hmMeses=DB.cfg.hmMeses;
  timerFechar();
  renderModelos();aplicarVisao();hdrXP();toast("✅ Backup restaurado");
};
$("#btnApagar").onclick=function(){
  if(this.dataset.c){if(!save({...vazio(),cfg:DB.cfg},true))return;timerFechar();renderModelos();hdrXP();toast("🗑️ Tudo apagado");this.dataset.c="";this.textContent="🗑️ Apagar todos os dados"}
  else{this.dataset.c="1";this.textContent="⚠️ Toque de novo para apagar TUDO";setTimeout(()=>{this.dataset.c="";this.textContent="🗑️ Apagar todos os dados"},4000)}
};

/* ================= TIMER (descanso e exercício) ================= */
const TM={fim:0,total:0,lbl:"",tipo:"",pausa:null,onEnd:null,h:null};
let actx=null;
function audioUnlock(){try{if(!actx){const A=window.AudioContext||window.webkitAudioContext;if(A)actx=new A()}if(actx&&actx.state==="suspended")actx.resume()}catch(e){}}
document.addEventListener("pointerdown",audioUnlock,{capture:true,passive:true});
function bip(n){n=n||3;try{if(actx){for(let i=0;i<n;i++){const o=actx.createOscillator(),g=actx.createGain(),t=actx.currentTime+i*.28;
  o.frequency.value=i===n-1?1320:880;o.connect(g);g.connect(actx.destination);g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(.35,t+.02);g.gain.exponentialRampToValueAtTime(.0001,t+.22);o.start(t);o.stop(t+.24)}}}catch(e){}
  try{navigator.vibrate&&navigator.vibrate([200,100,200,100,320])}catch(e){}}
const mmss=s=>`${String(Math.floor(s/60)).padStart(2,"0")}:${String(Math.floor(s%60)).padStart(2,"0")}`;
function timerIniciar(seg,lbl,tipo,onEnd){
  Object.assign(TM,{total:seg,fim:Date.now()+seg*1000,lbl,tipo,pausa:null,onEnd:onEnd||null});
  $("#tbar").className="tbar on"+(tipo==="ex"?" ex":"");document.body.classList.add("tbon");$("#tbPause").textContent="⏸";
  clearInterval(TM.h);TM.h=setInterval(timerTick,250);timerTick();
}
function timerResta(){return TM.pausa!=null?TM.pausa:Math.max(0,(TM.fim-Date.now())/1000)}
function timerTick(){
  const r=timerResta();$("#tbLbl").textContent=TM.lbl+(TM.pausa!=null?" · pausado":"");$("#tbTime").textContent=mmss(Math.ceil(r));
  $("#tbProg").style.width=(TM.total?Math.min(100,(1-r/TM.total)*100):0)+"%";
  if(r<=0&&TM.pausa==null&&TM.h){
    clearInterval(TM.h);TM.h=null;bip();$("#tbar").classList.add("fim");
    $("#tbTime").textContent=TM.tipo==="ex"?"✔ FEITO":"✔ VAI!";$("#tbLbl").textContent=TM.tipo==="ex"?TM.lbl:"⏱️ Descanso acabou — próxima série";
    const f=TM.onEnd;TM.onEnd=null;if(f)f();else setTimeout(()=>{if(!TM.h)timerFechar()},4000);
  }
}
function timerFechar(){clearInterval(TM.h);TM.h=null;TM.onEnd=null;$("#tbar").className="tbar";document.body.classList.remove("tbon")}
document.querySelectorAll("#tbar [data-tb]").forEach(b=>b.onclick=()=>{
  const a=b.dataset.tb;if(!TM.h&&a!=="x")return timerFechar();
  if(a==="+15"||a==="-15"){const d=a==="+15"?15:-15;if(TM.pausa!=null)TM.pausa=Math.max(1,TM.pausa+d);else TM.fim=Math.max(Date.now()+1000,TM.fim+d*1000);TM.total=Math.max(TM.total,timerResta());timerTick()}
  if(a==="pause"){if(TM.pausa==null){TM.pausa=timerResta();b.textContent="▶"}else{TM.fim=Date.now()+TM.pausa*1000;TM.pausa=null;b.textContent="⏸"}timerTick()}
  if(a==="skip"||a==="x")timerFechar();
});
document.addEventListener("visibilitychange",()=>{if(!document.hidden&&TM.h)timerTick()});

/* ================= MAPA DE CALOR ================= */
const MESES=["jan","fev","mar","abr","mai","jun","jul","ago","set","out","nov","dez"];
let hmMeses=DB.cfg.hmMeses||6;
function diaMapa(){
  const m={},o=d=>m[d]=m[d]||{xp:0,tr:0,nm:[],corpo:false};
  xpEventos().forEach(e=>{if(e.t!=="conq"&&e.t!=="brasao")o(e.d).xp+=e.xp});
  DB.treinos.forEach(w=>{const s=stats(w);if(s.d>0){const x=o(w.data);x.tr++;x.nm.push(`${w.nome} (${s.pct}%)`)}});
  DB.corpo.forEach(r=>o(r.data).corpo=true);
  return m;
}
function renderHeat(){
  $("#hmRng").innerHTML=[3,6,12].map(n=>`<button data-hm="${n}" class="${hmMeses===n?"on":""}">${n}m</button>`).join("");
  $("#hmRng").querySelectorAll("[data-hm]").forEach(b=>b.onclick=()=>{hmMeses=+b.dataset.hm;DB.cfg.hmMeses=hmMeses;save();renderHeat()});
  const m=diaMapa(),hj=hoje(),sem=Math.round(hmMeses*4.35);
  const ini=new Date(semanaISO(hj)+"T12:00:00");ini.setDate(ini.getDate()-(sem-1)*7);
  let h=`<div class="hm"><span class="dlab"></span>`+["S","","Q","","S","","D"].map(l=>`<span class="dlab">${l}</span>`).join("");
  let mesAnt=-1,dTr=0,dCorpo=0,xpP=0,semAt=0,diasP=0,seqAt=0,seqAtiva=true;const semAtv=[];
  for(let s=0;s<sem;s++){
    const seg=new Date(ini);seg.setDate(ini.getDate()+s*7);const mes=seg.getMonth();
    h+=`<span class="mlab">${mes!==mesAnt?MESES[mes]:""}</span>`;mesAnt=mes;let ativa=false;
    for(let d=0;d<7;d++){
      const dt=new Date(seg);dt.setDate(seg.getDate()+d);const k=isoL(dt);
      if(k>hj){h+=`<span class="c fut"></span>`;continue}
      diasP++;const o=m[k];const lv=!o?0:!o.tr?(o.corpo?1:0):o.xp<60?2:o.xp<110?3:4;
      if(o&&o.tr){dTr++;ativa=true}if(o&&o.corpo)dCorpo++;if(o)xpP+=o.xp;
      h+=`<span class="c${lv?" l"+lv:""}${k===hj?" hj":""}" data-d="${k}" title="${fmtD(k)}${o&&o.tr?` · ${o.tr} treino(s) · ${o.xp} XP`:""}${o&&o.corpo?" · 📏":""}"></span>`;
    }
    semAtv.push(ativa);if(ativa)semAt++;
  }
  for(let i=semAtv.length-1;i>=0;i--){if(semAtv[i])seqAt++;else if(i===semAtv.length-1)continue;else break}
  $("#hmWrap").innerHTML=h+"</div>";
  const wr=$("#hmWrap");wr.scrollLeft=wr.scrollWidth;
  wr.querySelectorAll("[data-d]").forEach(c=>c.onclick=()=>{const o=m[c.dataset.d];
    toast(o&&(o.tr||o.corpo)?`📅 ${fmtD(c.dataset.d)} · ${o.tr?o.nm.join(" · ")+` · ⭐ ${o.xp} XP`:""}${o.corpo?" · 📏 medidas":""}`:`📅 ${fmtD(c.dataset.d)} · descanso`)});
  $("#hmKpis").innerHTML=kpi(dTr,"dias treinados")+kpi(Math.round(dTr/Math.max(1,diasP)*100),"% dos dias")+kpi(`${semAt}/${sem}`.replace(/\./g,""),"semanas ativas")
    +kpi(seqAt,"semanas seguidas (atual)")+kpi(conquistas().C.constancia,"recorde 2+/semana")+kpi(xpP,"XP no período");
}

/* ================= METAS DO CORPO ================= */
const XP_META_PRAZO=500,XP_META_TARDE=250;
const MT={peso:{n:"Peso",u:"kg",i:"⚖️"},cintura:{n:"Cintura",u:"cm",i:"📏"}};
function valorAtual(tipo){const c=corpoOrd().filter(r=>r[tipo]!=null);return c.length?c[c.length-1]:null}
function metaInfo(m){
  const hj=hoje(),regs=corpoOrd().filter(r=>r.data<=hj&&r[m.tipo]!=null),dir=m.alvo<m.inicio?-1:1;
  const hit=regs.find(r=>r.data>=m.criado&&(dir<0?r[m.tipo]<=m.alvo:r[m.tipo]>=m.alvo))||null;
  const atual=regs.length?regs[regs.length-1][m.tipo]:m.inicio;
  const tot=Math.abs(m.alvo-m.inicio)||1,feito=dir<0?m.inicio-atual:atual-m.inicio;
  const pct=hit?100:Math.max(0,Math.min(100,feito/tot*100));
  const diasRest=diasEntre(hj,m.prazo),falta=Math.max(0,dir<0?atual-m.alvo:m.alvo-atual);
  const ritmoNec=!hit&&diasRest>0?falta/(diasRest/7):null;
  const rec=regs.filter(r=>recente(r.data,29));let ritmo=null;
  if(rec.length>=2){const a=rec[0],b=rec[rec.length-1],dd=diasEntre(a.data,b.data);if(dd>=6)ritmo=(dir<0?a[m.tipo]-b[m.tipo]:b[m.tipo]-a[m.tipo])/(dd/7)}
  let status;
  if(hit)status=hit.data<=m.prazo?"ok":"tarde";
  else if(diasRest<0)status="vencida";
  else if(ritmo==null)status="sem";
  else status=ritmo>=ritmoNec*.9?"ritmo":ritmo>0?"lento":"parado";
  const agressivo=m.tipo==="peso"&&dir<0&&ritmoNec!=null&&ritmoNec>atual*.01;
  return{dir,hit,atual,pct,diasRest,falta,ritmoNec,ritmo,status,agressivo};
}
function metasBatidas(){return DB.metas.filter(m=>metaInfo(m).hit).length}
function linhaMeta(tipo,n,eixo){
  const m=[...DB.metas].reverse().find(x=>x.tipo===tipo);if(!m||!n)return[];
  const d={label:`🎯 Meta ${m.alvo} ${MT[tipo].u}`,data:Array(n).fill(m.alvo),borderColor:"#34d399",backgroundColor:"#34d399",borderDash:[6,4],pointRadius:0,tension:0};
  if(eixo)d.yAxisID=eixo;return[d];
}
$("#gPrazo").min=hoje();
$("#btnMeta").onclick=()=>{
  const tipo=$("#gTipo").value,alvo=num($("#gAlvo").value),prazo=$("#gPrazo").value,ult=valorAtual(tipo);
  if(!ult)return toast(`Registre ${tipo==="peso"?"o peso":"a cintura"} atual primeiro 📏`);
  if(alvo==null||alvo<=0)return toast("Informe o alvo");
  if(!prazo||prazo<=hoje())return toast("O prazo precisa ser uma data futura");
  if(alvo===ult[tipo])return toast("O alvo é igual ao valor atual");
  DB.metas=DB.metas.filter(m=>m.tipo!==tipo||metaInfo(m).hit); /* 1 meta ativa por medida */
  const m={id:uid(),tipo,alvo,prazo,criado:hoje(),inicio:ult[tipo]};DB.metas.push(m);save();
  $("#gAlvo").value="";renderCorpo();hdrXP();
  const i=metaInfo(m);toast(i.agressivo?`⚠️ Meta criada, mas o ritmo é agressivo (${i.ritmoNec.toFixed(1)} kg/sem). Considere um prazo maior.`:"🎯 Meta criada · rumo ao Brasão do Alvo!",i.agressivo?false:true);
};
function renderMetas(){
  const L=$("#metasLista");
  if(!DB.metas.length){L.innerHTML=`<div class="card empty">Nenhuma meta ainda. Crie uma acima 🎯</div>`;return}
  const f=v=>(+v).toLocaleString("pt-BR",{maximumFractionDigits:1});
  const ST={ok:["🛡️ Brasão no prazo","ok"],tarde:["🎖️ Alcançada após o prazo","ok"],vencida:["⌛ Prazo vencido","bad"],sem:["📏 Meça de novo p/ ver o ritmo","go"],ritmo:["🟢 No ritmo","ok"],lento:["🟡 Abaixo do ritmo","warn"],parado:["🔴 Sem progresso","bad"]};
  L.innerHTML=[...DB.metas].reverse().map(m=>{const i=metaInfo(m),u=MT[m.tipo].u,st=ST[i.status];
    return`<div class="card meta${i.hit?" done":""}"><div class="wk"><div><div class="t">${MT[m.tipo].i} ${MT[m.tipo].n}: ${f(m.inicio)} → <span style="color:var(--gold2)">${f(m.alvo)} ${u}</span></div>
      <div class="d">📅 Prazo ${fmtD(m.prazo)} · criada ${fmtD(m.criado)}</div></div><span class="pill ${st[1]}">${st[0]}</span></div>
      <div class="prog"><div class="bar" style="width:${i.pct}%"></div></div><div class="ptxt">${Math.round(i.pct)}% do caminho</div>
      <div class="mtg">
        <div><b>${f(i.atual)}</b><small>atual (${u})</small></div>
        <div><b>${i.hit?"✔":f(i.falta)}</b><small>${i.hit?"alvo batido":"faltam ("+u+")"}</small></div>
        <div><b>${i.hit?fmtD(i.hit.data).slice(0,5):i.diasRest>=0?i.diasRest:"—"}</b><small>${i.hit?"dia do alvo":"dias restantes"}</small></div>
        <div><b>${i.ritmoNec!=null?f(i.ritmoNec):"—"}</b><small>${u}/sem necessário</small></div>
        <div><b>${i.ritmo!=null?f(i.ritmo):"—"}</b><small>${u}/sem (últ. 4 sem)</small></div>
        <div><b>${i.hit?"+"+(i.status==="ok"?XP_META_PRAZO:XP_META_TARDE):"🎯"}</b><small>${i.hit?"XP ganho":"brasão em jogo"}</small></div>
      </div>
      ${i.agressivo?`<div class="alert">⚠️ A meta exigiria ${f(i.ritmoNec)} kg/semana até o prazo. Revise o alvo e o prazo antes de usá-los para orientar seu treino.</div>`:""}
      ${!i.hit?`<div class="acts"><input type="date" value="${m.prazo}" min="${hoje()}" data-mp="${m.id}" style="width:auto;flex:1"><button class="btn sm sec" data-msave="${m.id}">📅 Novo prazo</button><button class="btn sm del" data-mdel="${m.id}">🗑️</button></div>`:
        `<div class="acts"><button class="btn sm del" data-mdel="${m.id}">🗑️ Remover do histórico</button></div>`}</div>`}).join("");
  L.querySelectorAll("[data-msave]").forEach(b=>b.onclick=()=>{const m=DB.metas.find(x=>x.id===b.dataset.msave),v=L.querySelector(`[data-mp="${b.dataset.msave}"]`).value;
    if(!v||v<=hoje())return toast("Escolha uma data futura");m.prazo=v;save();renderMetas();toast("📅 Prazo atualizado")});
  L.querySelectorAll("[data-mdel]").forEach(b=>b.onclick=()=>{if(b.dataset.c){DB.metas=DB.metas.filter(x=>x.id!==b.dataset.mdel);save();renderMetas();hdrXP();toast("🗑️ Meta removida")}
    else{b.dataset.c="1";b.textContent="Confirmar?";setTimeout(()=>{b.dataset.c="";b.textContent="🗑️"},3000)}});
}

/* ================= ESTEIRA PERSONALIZADA ================= */
const EST_TIPOS={
  leve:{n:"🚶 Caminhada leve",d:"Recuperação ativa e dias pós-plantão. Ritmo de conversa fácil (Z1–Z2)."},
  z2:{n:"🔥 Zona 2 · queima de gordura",d:"Caminhada rápida inclinada: base aeróbica e maior uso de gordura como combustível. Dá para conversar em frases curtas."},
  subida:{n:"⛰️ Subida progressiva",d:"Rampa crescente a cada 3 min (estilo 12-3-30): baixo impacto e alto gasto. Não se segure no corrimão."},
  inter:{n:"⚡ Intervalado caminhada/corrida",d:"Alterna tiros de corrida e caminhada de recuperação. Melhora VO₂máx e condicionamento."},
  corrida:{n:"🏃 Corrida progressiva",d:"Corrida contínua em blocos de 5 min, cada um um pouco mais rápido."}
};
const EST_PADRAO={tipo:"z2",dur:30,nivel:2,vc:5.5,vr:8,incMax:12,idade:37};
const limitar=(v,a,b,p)=>numero(v)&&v>=a&&v<=b?v:p;
function esteiraCfgValida(e){
  return{tipo:Object.hasOwn(EST_TIPOS,e.tipo)?e.tipo:EST_PADRAO.tipo,dur:[20,30,40,45,60].includes(e.dur)?e.dur:EST_PADRAO.dur,
    nivel:[1,2,3].includes(e.nivel)?e.nivel:EST_PADRAO.nivel,vc:limitar(e.vc,2,8,EST_PADRAO.vc),vr:limitar(e.vr,5,20,EST_PADRAO.vr),
    incMax:limitar(e.incMax,0,20,EST_PADRAO.incMax),idade:limitar(e.idade,14,90,EST_PADRAO.idade)};
}
/* monta os segmentos: fase, minutos, km/h, inclinação, modo (caminhada/corrida) e zona */
function planoEsteira(o){
  const S=[],r1=v=>Math.round(v*10)/10,inc=v=>Math.max(0,Math.min(o.incMax,Math.round(v*2)/2));
  const add=(fase,min,kmh,i,modo,zona)=>{if(min>0)S.push({fase,min,kmh:r1(Math.max(1.5,kmh)),inc:inc(i),modo,zona})};
  const T=o.dur,aq=T>=30?5:3,dq=T>=30?5:3,P=T-aq-dq,N=o.nivel,vc=o.vc,vr=Math.max(o.vr,vc+1);
  const blocos=(tam,fn)=>{let t=0,k=0;while(t<P){const m=Math.min(tam,P-t);fn(m,k);t+=m;k++}};
  add("Aquecimento",aq,vc-0.8,1,"caminhada","Z1");
  if(o.tipo==="leve")blocos(5,(m,k)=>add(k%2?"Caminhada solta":"Caminhada firme",m,vc+(k%2?0:0.3),k%2?1:2,"caminhada","Z1–Z2"));
  if(o.tipo==="z2"){const base=[3,5,7][N-1];blocos(5,(m,k)=>add("Zona 2",m,vc+0.3,base+(k%2),"caminhada","Z2"))}
  if(o.tipo==="subida"){const topo=Math.min(o.incMax,[8,11,15][N-1]),v=Math.min(vc,[5,5.5,6][N-1]),passo=[1.5,2,2.5][N-1];
    blocos(3,(m,k)=>{const i=Math.min(3+k*passo,topo);add(i>=topo?"Platô no topo":"Subida",m,v,i,"caminhada","Z2–Z3")})}
  if(o.tipo==="inter"){const[cr,ca]=[[1,2],[2,2],[3,1]][N-1];let t=0,k=1;
    while(t+cr<=P){add(`Tiro ${k}`,cr,vr,1,"corrida","Z3–Z4");t+=cr;if(t>=P)break;const m=Math.min(ca,P-t);add(`Recuperação ${k}`,m,vc,1,"caminhada","Z2");t+=m;k++}
    if(t<P)add("Caminhada",P-t,vc,1,"caminhada","Z2")}
  if(o.tipo==="corrida"){const nb=Math.ceil(P/5),passo=[0.3,0.5,0.7][N-1];
    blocos(5,(m,k)=>add(`Bloco ${k+1}`,m,vr-passo*Math.floor(nb/2)+passo*k,1,"corrida",k<nb-1?"Z2–Z3":"Z3–Z4"))}
  add("Desaquecimento",dq,vc-1,0,"caminhada","Z1");
  return S;
}
/* equações metabólicas do ACSM: VO2 (mL/kg/min) → kcal ≈ VO2 × kg / 1000 × 5 */
function totaisEsteira(S,peso){
  let km=0,kcal=0,elev=0;
  S.forEach(s=>{const v=s.kmh*1000/60,g=s.inc/100,vo2=s.modo==="corrida"?0.2*v+0.9*v*g+3.5:0.1*v+1.8*v*g+3.5,d=s.kmh*s.min/60;
    km+=d;elev+=d*1000*g;if(peso)kcal+=vo2*peso/1000*5*s.min});
  return{min:S.reduce((a,s)=>a+s.min,0),km,kcal:Math.round(kcal),elev:Math.round(elev)};
}
const fmt1=v=>(+v).toLocaleString("pt-BR",{maximumFractionDigits:1});
function linhaEsteira(s){return`${s.fase} — ${fmt1(s.kmh)} km/h · ${fmt1(s.inc)}% ${s.min}min`}
function lerEsteira(){
  const ult=corpoOrd().filter(r=>r.peso).pop();
  return{...esteiraCfgValida({tipo:$("#eTipo").value,dur:+$("#eDur").value,nivel:+$("#eNivel").value,vc:num($("#eVc").value),vr:num($("#eVr").value),incMax:num($("#eIncMax").value),idade:num($("#eIdade").value)}),
    peso:num($("#ePeso").value)||(ult?ult.peso:null)};
}
function renderEsteira(){
  const o=lerEsteira(),S=planoEsteira(o),t=totaisEsteira(S,o.peso);
  $("#eDesc").textContent=EST_TIPOS[o.tipo].d;
  const fcmax=Math.round(208-0.7*o.idade),z=(a,b)=>`${Math.round(fcmax*a)}–${Math.round(fcmax*b)}`;
  $("#eZonas").innerHTML=`❤️ FC máx. estimada <b>${fcmax} bpm</b> (Tanaka: 208 − 0,7 × idade) · Z1 ${z(.5,.6)} · <b>Z2 ${z(.6,.7)}</b> · Z3 ${z(.7,.8)} · Z4 ${z(.8,.9)} bpm`;
  $("#eKpis").innerHTML=kpi(t.min+" min","duração")+kpi(fmt1(t.km)+" km","distância")+kpi(o.peso?"≈ "+t.kcal:"—",o.peso?"kcal estimadas":"informe o peso")
    +kpi(t.elev+" m","subida acumulada")+kpi(fmt1(Math.max(...S.map(s=>s.kmh))),"km/h máx.")+kpi(fmt1(Math.max(...S.map(s=>s.inc)))+"%","inclinação máx.");
  $("#ePlano").innerHTML=`<thead><tr><th>#</th><th>Fase</th><th>min</th><th>km/h</th><th>incl.</th><th>zona</th></tr></thead><tbody>`+
    S.map((s,i)=>`<tr class="${s.modo==="corrida"?"run":""}"><td>${i+1}</td><td>${s.modo==="corrida"?"🏃":"🚶"} ${esc(s.fase)}</td><td>${s.min}</td><td>${fmt1(s.kmh)}</td><td>${fmt1(s.inc)}%</td><td class="z">${s.zona}</td></tr>`).join("")+
    `</tbody><tfoot><tr><td></td><td>Total</td><td>${t.min}</td><td>${fmt1(t.km)} km</td><td>${t.elev} m↑</td><td></td></tr></tfoot>`;
  const alertas=[];
  if((o.tipo==="inter"||o.tipo==="corrida")&&semanaAtual()<5)alertas.push(`⚠️ <b>Retomada (semana ${semanaAtual()}):</b> corrida e intervalado só a partir da semana 5 do rodízio. Até lá, prefira Zona 2 ou Subida.`);
  if(o.tipo==="subida"&&o.incMax<8)alertas.push("ℹ️ Sua esteira vai só até "+fmt1(o.incMax)+"% — a subida fica limitada a esse teto.");
  alertas.push("🩺 Pare se houver dor no peito, falta de ar desproporcional, tontura ou palpitação. Urina escura ou dor muscular intensa nos dias seguintes → dosar CK.");
  $("#eAviso").innerHTML=alertas.map(a=>`<div class="alert">${a}</div>`).join("");
  return{o,S,t};
}
function initEsteira(){
  const c={...EST_PADRAO,...(DB.cfg.esteira||{})};
  $("#eTipo").innerHTML=Object.entries(EST_TIPOS).map(([k,v])=>`<option value="${k}">${v.n}</option>`).join("");
  $("#eTipo").value=c.tipo;$("#eDur").value=String(c.dur);$("#eNivel").value=String(c.nivel);
  $("#eVc").value=c.vc;$("#eVr").value=c.vr;$("#eIncMax").value=c.incMax;$("#eIdade").value=c.idade;
  const ult=corpoOrd().filter(r=>r.peso).pop();if(ult)$("#ePeso").placeholder=`${fmt1(ult.peso)} (última medida)`;
  ["#eTipo","#eDur","#eNivel","#eVc","#eVr","#eIncMax","#ePeso","#eIdade"].forEach(id=>{const el=$(id);el.onchange=renderEsteira;el.oninput=renderEsteira});
  renderEsteira();
}
function guardarEsteira(o){const{peso,...cfg}=o;DB.cfg.esteira=esteiraCfgValida(cfg)}
$("#eGerar").onclick=()=>{
  const{o,S}=renderEsteira(),texto=S.map(linhaEsteira).join("\n");
  const w={id:uid(),nome:`Esteira · ${EST_TIPOS[o.tipo].n.replace(/^\S+\s/,"")} ${o.dur}'`,data:hoje(),texto,blocos:parseTreino(texto),status:"ativo",criado:Date.now(),tipo:"esteira"};
  guardarEsteira(o);DB.treinos.push(w);DB.ativo=w.id;save();toast("🏃 Esteira pronta · toque em ▶ Iniciar sessão");ir("check");
};
$("#eModelo").onclick=()=>{
  const{o,S}=renderEsteira();guardarEsteira(o);
  DB.modelos.push({n:`🏃 Esteira ${EST_TIPOS[o.tipo].n.replace(/^\S+\s/,"")} ${o.dur}'`,t:S.map(linhaEsteira).join("\n")});
  const gravado=save();renderModelos();if(gravado)toast("⭐ Esteira salva nos modelos");
};
/* sequência automática: ao terminar um segmento, já começa o próximo */
function proximoSegmento(wid){
  const w=getW(wid);if(!w||DB.ativo!==wid)return;
  for(let bi=0;bi<w.blocos.length;bi++)for(let ii=0;ii<w.blocos[bi].itens.length;ii++){
    const it=w.blocos[bi].itens[ii],si=it.feito.indexOf(false);
    if(si>=0){const bt=document.querySelector(`#cBody [data-tmr][data-b="${bi}"][data-i="${ii}"][data-s="${si}"]`);
      if(bt){bt.click();bt.scrollIntoView&&bt.scrollIntoView({behavior:"smooth",block:"center"})}return}
  }
  setTimeout(()=>{timerFechar();toast("🏁 Sessão de esteira concluída! Toque em 🏆 Concluir",true)},1500);
}
initEsteira();

/* ================= INÍCIO ================= */
aplicarVisao();hdrXP();
if(DB.ativo&&getW(DB.ativo)&&getW(DB.ativo).status==="ativo")ir("check");
if("serviceWorker" in navigator&&window.isSecureContext&&location.protocol!=="file:"){
  navigator.serviceWorker.register("./sw.js",{updateViaCache:"none"}).catch(e=>console.warn("Modo offline indisponível",e));
}
