// ============================================================
//  RETO DE AHORRO 🐷  ·  Widget para iPhone (app Scriptable)
// ============================================================
//  CÓMO USARLO (una sola vez):
//  1. Instala "Scriptable" desde la App Store (gratis).
//  2. Abre Scriptable, toca "+", borra lo que haya y PEGA todo este código.
//  3. Arriba ponle un nombre, por ej. "Reto Ahorro", y guarda (Listo).
//  4. Ve a tu pantalla de inicio: mantén presionado > "+" > busca Scriptable
//     > elige tamaño Mediano > Agregar.
//  5. Mantén presionado el widget > "Editar widget":
//       - Script: elige "Reto Ahorro"
//       - Parameter: PEGA lo que aparece en el enlace de tu página DESPUÉS del #
//         (se ve así:  DV07|https://reto-xxxx-default-rtdb.firebaseio.com )
//  ¡Listo! El widget se actualizará solo cada cierto tiempo.
//
//  (Opcional) En vez del Parameter, puedes fijar los datos aquí abajo:
const CODIGO_FIJO   = "";   // ej: "DV07"
const FIREBASE_FIJO = "https://reto-ahorro-7bbd-default-rtdb.firebaseio.com";   // ej: "https://reto-xxxx-default-rtdb.firebaseio.com"
const URL_APP       = "https://alejandroparra15.github.io/ahorro-programado/";   // (opcional) link de tu página, para abrirla al tocar el widget
// ============================================================

const VALOR = 1000;
const META = 20000000;
const TABLERO_TOTAL = 20100000;

const AZUL = new Color("#5B7FD4");
const ROSA = new Color("#E0609B");
const TINTA = new Color("#412E3A");

function pesos(n){ return "$" + Math.round(n||0).toLocaleString("es-CO"); }

function diasRest(fechaFin){
  try{
    const hoy = new Date(); hoy.setHours(0,0,0,0);
    const fin = new Date((fechaFin||"2026-12-03") + "T00:00:00");
    return Math.max(0, Math.ceil((fin - hoy) / 86400000));
  }catch(e){ return 0; }
}

function calc(state){
  let sy=0, se=0, ny=0, ne=0;
  const marks = state.marks || {};
  for (const k in marks){
    const v = Number(k)*VALOR, w = marks[k];
    if (w==="yo"){ sy+=v; ny++; } else if (w==="ella"){ se+=v; ne++; }
  }
  return { sumYo:sy, sumElla:se, nYo:ny, nElla:ne, total:sy+se,
           nombres: state.nombres || {yo:"Azul", ella:"Rosa"},
           dias: diasRest(state.fechaFin) };
}

function parseParam(){
  let p = (args.widgetParameter || CODIGO_FIJO || "").trim();
  let db = FIREBASE_FIJO.trim();
  if (p.indexOf("|") !== -1){
    const parts = p.split("|");
    p = parts[0].trim();
    if (parts[1]) { try { db = decodeURIComponent(parts[1].trim()); } catch(e){ db = parts[1].trim(); } }
  }
  return { codigo: p, db: db };
}

async function getState(codigo, db){
  const url = db.replace(/\/+$/,"") + "/retos/" + encodeURIComponent(codigo) + ".json";
  const req = new Request(url);
  req.headers = { "Accept":"application/json" };
  return await req.loadJSON();
}

function fraseDelDia(){
  const f = ["Cada peso cuenta 💪","Hoy ahorras, mañana disfrutas ✨","El que guarda, siempre tiene 🐷",
            "Pequeños ahorros, grandes sueños 🌱","La meta está más cerca 🎯","Constancia hoy, libertad mañana 🔥",
            "Una casilla más, un paso más 👣","Ahorrar también es quererse 💗","Gota a gota se llena la alcancía 💧"];
  return f[Math.floor(Date.now()/86400000) % f.length];
}

// Barra de progreso: azul (uno) + rosa (la otra) sobre un riel claro
function barra(w, anchoYo, anchoElla, parent){
  const H = 13;
  const track = parent.addStack();
  track.size = new Size(w, H);
  track.cornerRadius = H/2;
  track.backgroundColor = new Color("#ffffff", 0.45);
  track.layoutHorizontally();
  if (anchoYo > 0){
    const a = track.addStack(); a.size = new Size(anchoYo, H);
    a.backgroundColor = AZUL; a.cornerRadius = H/2;
  }
  if (anchoElla > 0){
    const b = track.addStack(); b.size = new Size(anchoElla, H);
    b.backgroundColor = ROSA; b.cornerRadius = H/2;
  }
  track.addSpacer();
}

function fila(parent, color, nombre, monto){
  const s = parent.addStack();
  s.centerAlignContent();
  const dot = s.addStack(); dot.size = new Size(9,9); dot.cornerRadius = 5;
  dot.backgroundColor = color;
  s.addSpacer(6);
  const t = s.addText(nombre + ": ");
  t.font = Font.mediumSystemFont(12); t.textColor = TINTA;
  const m = s.addText(pesos(monto));
  m.font = Font.boldSystemFont(12); m.textColor = TINTA;
  s.addSpacer();
}

function fondo(widget){
  const g = new LinearGradient();
  g.colors = [new Color("#FDE7F0"), new Color("#F6CFE2")];
  g.locations = [0,1];
  widget.backgroundGradient = g;
}

async function build(){
  const { codigo, db } = parseParam();
  const family = config.widgetFamily || "medium";
  const w = new ListWidget();
  w.setPadding(14,16,14,16);
  fondo(w);
  if (URL_APP) w.url = URL_APP;

  if (!codigo || !db){
    const t = w.addText("Falta configurar 🐷");
    t.font = Font.boldSystemFont(15); t.textColor = TINTA;
    const s = w.addText("Editar widget → Parameter: pega lo que va después del # en el enlace (código|URL).");
    s.font = Font.systemFont(11); s.textColor = new Color("#8C6B7B");
    return w;
  }

  let state;
  try { state = await getState(codigo, db); }
  catch(e){
    const t = w.addText("Sin conexión 🐷");
    t.font = Font.boldSystemFont(15); t.textColor = TINTA;
    const s = w.addText("Revisa el código, la URL o tu internet.");
    s.font = Font.systemFont(11); s.textColor = new Color("#8C6B7B");
    return w;
  }
  if (!state){
    const t = w.addText("Reto vacío 🐷");
    t.font = Font.boldSystemFont(15); t.textColor = TINTA;
    const s = w.addText("Abre la página y marca al menos una casilla con este código.");
    s.font = Font.systemFont(11); s.textColor = new Color("#8C6B7B");
    return w;
  }

  const c = calc(state);
  const pct = Math.min(100, c.total/META*100);

  // Encabezado
  const head = w.addStack(); head.centerAlignContent();
  const h = head.addText("🐷 Reto de ahorro");
  h.font = Font.semiboldSystemFont(13); h.textColor = TINTA;
  head.addSpacer();
  const p = head.addText(pct.toFixed(1) + "%");
  p.font = Font.boldSystemFont(14); p.textColor = ROSA;
  w.addSpacer(6);

  // Monto grande
  const big = w.addText(pesos(c.total));
  big.font = Font.boldSystemFont(family==="small" ? 22 : 26);
  big.textColor = TINTA;
  const sub = w.addText("de " + pesos(META));
  sub.font = Font.systemFont(11); sub.textColor = new Color("#8C6B7B");
  w.addSpacer(8);

  // Barra (ancho según tamaño)
  const barW = family === "small" ? 118 : (family === "large" ? 300 : 300);
  barra(barW, barW*Math.min(1,c.sumYo/META), barW*Math.min(1,c.sumElla/META), w);
  w.addSpacer(8);

  // Aporte de cada uno (en mediano y grande)
  if (family !== "small"){
    fila(w, AZUL, c.nombres.yo || "Azul", c.sumYo);
    w.addSpacer(2);
    fila(w, ROSA, c.nombres.ella || "Rosa", c.sumElla);
    w.addSpacer(6);
  }

  // Pie: días restantes + frase motivadora destacada
  if (c.dias > 0){
    const dl = w.addText(c.dias + " días para la meta");
    dl.font = Font.systemFont(10.5); dl.textColor = new Color("#A98598");
    w.addSpacer(3);
  }
  if (family !== "small"){
    const frase = w.addText(fraseDelDia());
    frase.font = Font.semiboldSystemFont(13); frase.textColor = new Color("#C24B86");
    frase.lineLimit = 2;
  }

  return w;
}

const widget = await build();
widget.refreshAfterDate = new Date(Date.now() + 30*60*1000); // sugerencia: refrescar ~30 min
if (config.runsInWidget) {
  Script.setWidget(widget);
} else {
  await widget.presentMedium(); // vista previa al correrlo dentro de la app
}
Script.complete();
