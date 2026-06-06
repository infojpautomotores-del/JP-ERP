import { useState, useMemo, useCallback, useEffect } from "react";
import { supabase } from "./supabase";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell, ComposedChart } from "recharts";

// ─── ESTILOS GLOBALES ─────────────────────────────────────────────────────────
const G = {
  bg: "#080808", card: "#111111", cardBorder: "#1f1f1f",
  sidebar: "#0d0d0d", sidebarBorder: "#1a1a1a",
  input: "#161616", inputBorder: "#2a2a2a",
  gold: "#d4a017", goldLight: "#f0c040", goldDim: "rgba(212,160,23,0.15)",
  goldBorder: "rgba(212,160,23,0.3)",
  text: "#ffffff", textSub: "#888888", textDim: "#444444",
  red: "#ef4444", green: "#22c55e", blue: "#3b82f6", amber: "#f59e0b",
};
const F = "'Inter','Helvetica Neue','Arial',sans-serif";

// ─── PLAN DE CUENTAS ──────────────────────────────────────────────────────────
const PLAN = {
  "1.1":  { codigo:"1.1",  nombre:"Venta vehículos usados",              tipo:"ingreso",  grupo:"Ingresos",                   esFijo:false, esExtraordinario:false, esRetiro:false, esAnticipo:false, esVehiculo:false },
  "1.2":  { codigo:"1.2",  nombre:"Venta vehículos 0km",                 tipo:"ingreso",  grupo:"Ingresos",                   esFijo:false, esExtraordinario:false, esRetiro:false, esAnticipo:false, esVehiculo:false },
  "1.3":  { codigo:"1.3",  nombre:"Otros ingresos",                      tipo:"ingreso",  grupo:"Ingresos",                   esFijo:false, esExtraordinario:false, esRetiro:false, esAnticipo:false, esVehiculo:false },
  "2.1":  { codigo:"2.1",  nombre:"Costo compra — Usados",               tipo:"egreso",   grupo:"Costo de Mercadería",        esFijo:false, esExtraordinario:false, esRetiro:false, esAnticipo:false, esVehiculo:true  },
  "2.2":  { codigo:"2.2",  nombre:"Costo compra — 0km",                  tipo:"egreso",   grupo:"Costo de Mercadería",        esFijo:false, esExtraordinario:false, esRetiro:false, esAnticipo:false, esVehiculo:true  },
  "2.3":  { codigo:"2.3",  nombre:"Acond. — Mecánico / Reparaciones",    tipo:"egreso",   grupo:"Costo de Mercadería",        esFijo:false, esExtraordinario:false, esRetiro:false, esAnticipo:false, esVehiculo:true  },
  "2.4":  { codigo:"2.4",  nombre:"Acond. — Service / ITV",              tipo:"egreso",   grupo:"Costo de Mercadería",        esFijo:false, esExtraordinario:false, esRetiro:false, esAnticipo:false, esVehiculo:true  },
  "2.5":  { codigo:"2.5",  nombre:"Acond. — GNC / Gas",                  tipo:"egreso",   grupo:"Costo de Mercadería",        esFijo:false, esExtraordinario:false, esRetiro:false, esAnticipo:false, esVehiculo:true  },
  "2.6":  { codigo:"2.6",  nombre:"Acond. — Gomería / Cubiertas",        tipo:"egreso",   grupo:"Costo de Mercadería",        esFijo:false, esExtraordinario:false, esRetiro:false, esAnticipo:false, esVehiculo:true  },
  "2.7":  { codigo:"2.7",  nombre:"Acond. — Chapista / Pintura",         tipo:"egreso",   grupo:"Costo de Mercadería",        esFijo:false, esExtraordinario:false, esRetiro:false, esAnticipo:false, esVehiculo:true  },
  "2.8":  { codigo:"2.8",  nombre:"Acond. — Estética / Polarizado",      tipo:"egreso",   grupo:"Costo de Mercadería",        esFijo:false, esExtraordinario:false, esRetiro:false, esAnticipo:false, esVehiculo:true  },
  "2.9":  { codigo:"2.9",  nombre:"Acond. — Repuestos",                  tipo:"egreso",   grupo:"Costo de Mercadería",        esFijo:false, esExtraordinario:false, esRetiro:false, esAnticipo:false, esVehiculo:true  },
  "2.10": { codigo:"2.10", nombre:"Acond. — Lavadero stock",             tipo:"egreso",   grupo:"Costo de Mercadería",        esFijo:false, esExtraordinario:false, esRetiro:false, esAnticipo:false, esVehiculo:true  },
  "2.11": { codigo:"2.11", nombre:"Acond. — Combustible stock",          tipo:"egreso",   grupo:"Costo de Mercadería",        esFijo:false, esExtraordinario:false, esRetiro:false, esAnticipo:false, esVehiculo:true  },
  "2.12": { codigo:"2.12", nombre:"Acond. — Flete / Traslado",           tipo:"egreso",   grupo:"Costo de Mercadería",        esFijo:false, esExtraordinario:false, esRetiro:false, esAnticipo:false, esVehiculo:true  },
  "3.1":  { codigo:"3.1",  nombre:"Comisiones a vendedores",             tipo:"egreso",   grupo:"Gastos de Comercialización", esFijo:false, esExtraordinario:false, esRetiro:false, esAnticipo:false, esVehiculo:false },
  "3.2":  { codigo:"3.2",  nombre:"Publicidad y marketing",              tipo:"egreso",   grupo:"Gastos de Comercialización", esFijo:false, esExtraordinario:false, esRetiro:false, esAnticipo:false, esVehiculo:false },
  "3.3":  { codigo:"3.3",  nombre:"Ads digitales",                       tipo:"egreso",   grupo:"Gastos de Comercialización", esFijo:false, esExtraordinario:false, esRetiro:false, esAnticipo:false, esVehiculo:false },
  "3.4":  { codigo:"3.4",  nombre:"Merchandising / Regalos",             tipo:"egreso",   grupo:"Gastos de Comercialización", esFijo:false, esExtraordinario:false, esRetiro:false, esAnticipo:false, esVehiculo:false },
  "4.1":  { codigo:"4.1",  nombre:"Sueldos fijos",                       tipo:"egreso",   grupo:"Gastos de Administración",   esFijo:true,  esExtraordinario:false, esRetiro:false, esAnticipo:false, esVehiculo:false },
  "4.2":  { codigo:"4.2",  nombre:"Cargas sociales / Aportes",           tipo:"egreso",   grupo:"Gastos de Administración",   esFijo:true,  esExtraordinario:false, esRetiro:false, esAnticipo:false, esVehiculo:false },
  "4.3":  { codigo:"4.3",  nombre:"Honorarios contador",                 tipo:"egreso",   grupo:"Gastos de Administración",   esFijo:true,  esExtraordinario:false, esRetiro:false, esAnticipo:false, esVehiculo:false },
  "4.4":  { codigo:"4.4",  nombre:"Alquileres",                          tipo:"egreso",   grupo:"Gastos de Administración",   esFijo:true,  esExtraordinario:false, esRetiro:false, esAnticipo:false, esVehiculo:false },
  "4.5":  { codigo:"4.5",  nombre:"Electricidad / Luz",                  tipo:"egreso",   grupo:"Gastos de Administración",   esFijo:true,  esExtraordinario:false, esRetiro:false, esAnticipo:false, esVehiculo:false },
  "4.6":  { codigo:"4.6",  nombre:"Agua / Sodero",                       tipo:"egreso",   grupo:"Gastos de Administración",   esFijo:true,  esExtraordinario:false, esRetiro:false, esAnticipo:false, esVehiculo:false },
  "4.7":  { codigo:"4.7",  nombre:"Mantenimiento del local",             tipo:"egreso",   grupo:"Gastos de Administración",   esFijo:true,  esExtraordinario:false, esRetiro:false, esAnticipo:false, esVehiculo:false },
  "4.8":  { codigo:"4.8",  nombre:"Mejoras del local",                   tipo:"egreso",   grupo:"Gastos de Administración",   esFijo:true,  esExtraordinario:false, esRetiro:false, esAnticipo:false, esVehiculo:false },
  "4.9":  { codigo:"4.9",  nombre:"Indumentaria de trabajo",             tipo:"egreso",   grupo:"Gastos de Administración",   esFijo:true,  esExtraordinario:false, esRetiro:false, esAnticipo:false, esVehiculo:false },
  "4.10": { codigo:"4.10", nombre:"Limpieza",                            tipo:"egreso",   grupo:"Gastos de Administración",   esFijo:true,  esExtraordinario:false, esRetiro:false, esAnticipo:false, esVehiculo:false },
  "4.11": { codigo:"4.11", nombre:"Insumos de oficina / Almacén",        tipo:"egreso",   grupo:"Gastos de Administración",   esFijo:true,  esExtraordinario:false, esRetiro:false, esAnticipo:false, esVehiculo:false },
  "4.12": { codigo:"4.12", nombre:"Suscripciones (Infoauto, etc.)",      tipo:"egreso",   grupo:"Gastos de Administración",   esFijo:true,  esExtraordinario:false, esRetiro:false, esAnticipo:false, esVehiculo:false },
  "4.13": { codigo:"4.13", nombre:"Otros gastos de administración",      tipo:"egreso",   grupo:"Gastos de Administración",   esFijo:true,  esExtraordinario:false, esRetiro:false, esAnticipo:false, esVehiculo:false },
  "5.1":  { codigo:"5.1",  nombre:"Ingresos Brutos (IIBB)",              tipo:"egreso",   grupo:"Gastos Impositivos",         esFijo:false, esExtraordinario:false, esRetiro:false, esAnticipo:false, esVehiculo:false },
  "5.2":  { codigo:"5.2",  nombre:"Monotributo / Autónomos Joaquín",     tipo:"egreso",   grupo:"Gastos Impositivos",         esFijo:false, esExtraordinario:false, esRetiro:false, esAnticipo:false, esVehiculo:false },
  "5.3":  { codigo:"5.3",  nombre:"Municipalidad / Tasas",               tipo:"egreso",   grupo:"Gastos Impositivos",         esFijo:false, esExtraordinario:false, esRetiro:false, esAnticipo:false, esVehiculo:false },
  "5.4":  { codigo:"5.4",  nombre:"Otros impuestos",                     tipo:"egreso",   grupo:"Gastos Impositivos",         esFijo:false, esExtraordinario:false, esRetiro:false, esAnticipo:false, esVehiculo:false },
  "6.1":  { codigo:"6.1",  nombre:"Comisiones bancarias",                tipo:"egreso",   grupo:"Gastos Bancarios",           esFijo:false, esExtraordinario:false, esRetiro:false, esAnticipo:false, esVehiculo:false },
  "6.2":  { codigo:"6.2",  nombre:"Impuesto al débito y crédito",        tipo:"egreso",   grupo:"Gastos Bancarios",           esFijo:false, esExtraordinario:false, esRetiro:false, esAnticipo:false, esVehiculo:false },
  "6.3":  { codigo:"6.3",  nombre:"Otros gastos bancarios",              tipo:"egreso",   grupo:"Gastos Bancarios",           esFijo:false, esExtraordinario:false, esRetiro:false, esAnticipo:false, esVehiculo:false },
  "7.1":  { codigo:"7.1",  nombre:"Garantía posventa — Motor / Caja",    tipo:"egreso",   grupo:"Gastos Extraordinarios",     esFijo:false, esExtraordinario:true,  esRetiro:false, esAnticipo:false, esVehiculo:false },
  "7.2":  { codigo:"7.2",  nombre:"Garantía posventa — Mecánica",        tipo:"egreso",   grupo:"Gastos Extraordinarios",     esFijo:false, esExtraordinario:true,  esRetiro:false, esAnticipo:false, esVehiculo:false },
  "7.3":  { codigo:"7.3",  nombre:"Garantía posventa — Eléctrico",       tipo:"egreso",   grupo:"Gastos Extraordinarios",     esFijo:false, esExtraordinario:true,  esRetiro:false, esAnticipo:false, esVehiculo:false },
  "7.4":  { codigo:"7.4",  nombre:"Reposición de cheques",               tipo:"egreso",   grupo:"Gastos Extraordinarios",     esFijo:false, esExtraordinario:true,  esRetiro:false, esAnticipo:false, esVehiculo:false },
  "7.5":  { codigo:"7.5",  nombre:"Otros extraordinarios",               tipo:"egreso",   grupo:"Gastos Extraordinarios",     esFijo:false, esExtraordinario:true,  esRetiro:false, esAnticipo:false, esVehiculo:false },
  "8.1":  { codigo:"8.1",  nombre:"Retiro del socio (Joaquín)",          tipo:"egreso",   grupo:"Retiro del Socio",           esFijo:false, esExtraordinario:false, esRetiro:true,  esAnticipo:false, esVehiculo:false },
  "A.1":  { codigo:"A.1",  nombre:"Anticipo — Combustible empleados",    tipo:"anticipo", grupo:"Anticipos Empleados",        esFijo:false, esExtraordinario:false, esRetiro:false, esAnticipo:true,  esVehiculo:false },
  "A.2":  { codigo:"A.2",  nombre:"Anticipo — Lavadero empleados",       tipo:"anticipo", grupo:"Anticipos Empleados",        esFijo:false, esExtraordinario:false, esRetiro:false, esAnticipo:true,  esVehiculo:false },
  "A.3":  { codigo:"A.3",  nombre:"Anticipo — Otros",                    tipo:"anticipo", grupo:"Anticipos Empleados",        esFijo:false, esExtraordinario:false, esRetiro:false, esAnticipo:true,  esVehiculo:false },
};

const GRUPOS_ER = [
  { key:"Ingresos",                   signo:1  },
  { key:"Costo de Mercadería",        signo:-1 },
  { key:"Gastos de Comercialización", signo:-1 },
  { key:"Gastos de Administración",   signo:-1 },
  { key:"Gastos Impositivos",         signo:-1 },
  { key:"Gastos Bancarios",           signo:-1 },
  { key:"Gastos Extraordinarios",     signo:-1 },
  { key:"Retiro del Socio",           signo:-1 },
];

const SUBTOTALES = {
  "Costo de Mercadería":        "GANANCIA BRUTA",
  "Gastos de Comercialización": "RESULTADO COMERCIAL",
  "Gastos de Administración":   "EBITDA / RESULTADO OPERATIVO",
  "Gastos Bancarios":           "RESULTADO ANTES DE EXTRAORDINARIOS",
  "Gastos Extraordinarios":     "RESULTADO NETO",
  "Retiro del Socio":           "RESULTADO DESPUÉS DE RETIRO",
};

const VENDEDORES = ["Lucho","Wilson","Guille","Federico","Gastón","Joaquín","Otro"];
const BANCOS = ["Galicia","ICBC","Bancor","Nación","Mercado Pago","Otro"];
const COLORES = ["#d4a017","#3b82f6","#ef4444","#8b5cf6","#22c55e","#ec4899","#06b6d4","#f97316"];
const MESES_L = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"];

const fmt = n => new Intl.NumberFormat("es-AR",{style:"currency",currency:"ARS",maximumFractionDigits:0}).format(n||0);
const fmtM = n => { const a=Math.abs(n||0); if(a>=1e9) return (n/1e9).toFixed(1)+"B"; if(a>=1e6) return (n/1e6).toFixed(1)+"M"; if(a>=1e3) return (n/1e3).toFixed(0)+"K"; return fmt(n); };
const fmtF = f => { if(!f) return "—"; const[y,m,d]=f.split("-"); return `${d}/${m}/${y}`; };
const hoy = () => new Date().toISOString().split("T")[0];
const uid = () => Date.now().toString(36)+Math.random().toString(36).slice(2);
const pct = (a,b) => b===0?"0.0%":((a/b)*100).toFixed(1)+"%";
const mesL = m => { if(!m) return ""; const[y,mo]=m.split("-"); return MESES_L[parseInt(mo)-1]+" "+y.slice(2); };

// ─── UI BASE ─────────────────────────────────────────────────────────────────
const s = {
  card: { background:G.card, border:`1px solid ${G.cardBorder}`, borderRadius:16 },
  inp: { background:G.input, border:`1px solid ${G.inputBorder}`, borderRadius:8, padding:"8px 12px", fontSize:13, color:G.text, fontFamily:F, fontWeight:600, outline:"none", width:"100%", boxSizing:"border-box" },
  lbl: { fontSize:11, color:G.textSub, fontWeight:700, display:"block", marginBottom:4, textTransform:"uppercase", letterSpacing:"0.05em" },
  btnPrimary: { background:G.gold, color:"#000", fontWeight:800, border:"none", borderRadius:10, padding:"10px 20px", fontSize:13, cursor:"pointer", fontFamily:F },
  btnGhost: { background:"transparent", color:G.textSub, fontWeight:600, border:`1px solid ${G.inputBorder}`, borderRadius:10, padding:"10px 20px", fontSize:13, cursor:"pointer", fontFamily:F },
  btnDanger: { background:"rgba(239,68,68,0.1)", color:G.red, fontWeight:600, border:"1px solid rgba(239,68,68,0.3)", borderRadius:8, padding:"4px 10px", fontSize:11, cursor:"pointer", fontFamily:F },
};

function Card({children, style={}, className=""}) {
  return <div style={{...s.card,...style}} className={className}>{children}</div>;
}

function Lbl({children}) {
  return <label style={s.lbl}>{children}</label>;
}

function Inp({label, style={}, ...p}) {
  return (
    <div style={{display:"flex",flexDirection:"column",gap:4}}>
      {label && <Lbl>{label}</Lbl>}
      <input style={{...s.inp,...style}} {...p}/>
    </div>
  );
}

function Sel({label, options, style={}, ...p}) {
  return (
    <div style={{display:"flex",flexDirection:"column",gap:4}}>
      {label && <Lbl>{label}</Lbl>}
      <select style={{...s.inp,...style}} {...p}>
        {options.map(o => <option key={o.v??o} value={o.v??o}>{o.l??o}</option>)}
      </select>
    </div>
  );
}

function Btn({children, variant="primary", size="md", style={}, disabled, onClick}) {
  const base = variant==="primary" ? s.btnPrimary : variant==="danger" ? s.btnDanger : s.btnGhost;
  const sz = size==="sm" ? {padding:"4px 12px",fontSize:11} : size==="lg" ? {padding:"12px 28px",fontSize:14} : {};
  return (
    <button onClick={onClick} disabled={disabled} style={{...base,...sz,...style, opacity:disabled?0.4:1, cursor:disabled?"not-allowed":"pointer"}}>
      {children}
    </button>
  );
}

function Badge({children, color="gold"}) {
  const cols = {
    gold: {background:"rgba(212,160,23,0.15)",color:G.gold,border:"1px solid rgba(212,160,23,0.3)"},
    red:  {background:"rgba(239,68,68,0.1)",color:G.red,border:"1px solid rgba(239,68,68,0.3)"},
    green:{background:"rgba(34,197,94,0.1)",color:G.green,border:"1px solid rgba(34,197,94,0.3)"},
    blue: {background:"rgba(59,130,246,0.1)",color:G.blue,border:"1px solid rgba(59,130,246,0.3)"},
    gray: {background:"rgba(255,255,255,0.05)",color:G.textSub,border:`1px solid ${G.inputBorder}`},
    amber:{background:"rgba(245,158,11,0.1)",color:G.amber,border:"1px solid rgba(245,158,11,0.3)"},
  };
  return <span style={{...cols[color]||cols.gray, fontSize:11, fontWeight:700, padding:"2px 8px", borderRadius:20}}>{children}</span>;
}

function Modal({open, onClose, title, children, size="md"}) {
  if(!open) return null;
  const widths = {sm:480, md:560, lg:720, xl:900};
  return (
    <div style={{position:"fixed",inset:0,zIndex:50,display:"flex",alignItems:"center",justifyContent:"center",background:"rgba(0,0,0,0.85)",backdropFilter:"blur(4px)",padding:16}} onClick={onClose}>
      <div style={{background:G.card,border:`1px solid ${G.cardBorder}`,borderRadius:20,width:"100%",maxWidth:widths[size],maxHeight:"90vh",display:"flex",flexDirection:"column",boxShadow:"0 25px 60px rgba(0,0,0,0.8)"}} onClick={e=>e.stopPropagation()}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"20px 24px",borderBottom:`1px solid ${G.cardBorder}`}}>
          <h3 style={{margin:0,color:G.text,fontWeight:800,fontSize:16,fontFamily:F}}>{title}</h3>
          <button onClick={onClose} style={{background:"none",border:"none",color:G.textSub,fontSize:22,cursor:"pointer",lineHeight:1}}>×</button>
        </div>
        <div style={{padding:24,overflowY:"auto"}}>{children}</div>
      </div>
    </div>
  );
}

function KPI({label, value, sub, varAbs, varPct, color=G.gold}) {
  const pos = varAbs>=0;
  return (
    <Card style={{padding:16}}>
      <div style={{fontSize:11,color:G.textSub,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:6}}>{label}</div>
      <div style={{fontSize:20,fontWeight:900,color,fontFamily:F,marginBottom:2}}>{value}</div>
      {varAbs!==undefined && varAbs!==null && (
        <div style={{fontSize:11,fontWeight:700,color:pos?G.green:G.red}}>
          {pos?"▲":"▼"} {pos?"+":""}{fmtM(varAbs)} ({pos?"+":""}{varPct?.toFixed(1)}%)
        </div>
      )}
      {sub && <div style={{fontSize:11,color:G.textDim,marginTop:2,fontWeight:600}}>{sub}</div>}
    </Card>
  );
}

// ─── FORMAS DE PAGO ───────────────────────────────────────────────────────────
const TIPOS_PAGO = ["Efectivo","Transferencia","Cheque recibido","Cheque emitido","Crédito / Financiera","Especie (vehículo)"];

function FormasPagoForm({formas, setFormas, total, allowEspecie=false}) {
  const totalF = formas.reduce((s,f)=>s+(parseFloat(f.importe)||0),0);
  const ok = total>0 && Math.abs(total-totalF)<1;
  const tipos = TIPOS_PAGO.filter(t=>allowEspecie||t!=="Especie (vehículo)");
  const add = () => setFormas(f=>[...f,{id:uid(),tipo:"Efectivo",importe:"",banco:"",nroCheque:"",fechaCobro:"",patente:"",descVeh:""}]);
  const rem = id => setFormas(f=>f.filter(x=>x.id!==id));
  const upd = (id,k,v) => setFormas(f=>f.map(x=>x.id===id?{...x,[k]:v}:x));
  return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
        <Lbl>Formas de cobro / pago</Lbl>
        <Btn variant="ghost" size="sm" onClick={add}>+ Agregar</Btn>
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:8}}>
        {formas.map(f=>(
          <div key={f.id} style={{background:G.input,border:`1px solid ${G.inputBorder}`,borderRadius:12,padding:12}}>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:8}}>
              <select style={s.inp} value={f.tipo} onChange={e=>upd(f.id,"tipo",e.target.value)}>
                {tipos.map(t=><option key={t}>{t}</option>)}
              </select>
              <input type="number" style={s.inp} placeholder="Importe" value={f.importe} onChange={e=>upd(f.id,"importe",e.target.value)}/>
            </div>
            {(f.tipo==="Cheque recibido"||f.tipo==="Cheque emitido") && (
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:8}}>
                <select style={s.inp} value={f.banco} onChange={e=>upd(f.id,"banco",e.target.value)}><option value="">Banco</option>{BANCOS.map(b=><option key={b}>{b}</option>)}</select>
                <input style={s.inp} placeholder="Nro. Cheque" value={f.nroCheque} onChange={e=>upd(f.id,"nroCheque",e.target.value)}/>
                <input type="date" style={s.inp} value={f.fechaCobro} onChange={e=>upd(f.id,"fechaCobro",e.target.value)}/>
              </div>
            )}
            {f.tipo==="Crédito / Financiera" && (
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:8}}>
                <input style={s.inp} placeholder="Financiera" value={f.banco} onChange={e=>upd(f.id,"banco",e.target.value)}/>
                <input type="date" style={s.inp} value={f.fechaCobro} onChange={e=>upd(f.id,"fechaCobro",e.target.value)}/>
              </div>
            )}
            {f.tipo==="Transferencia" && (
              <select style={{...s.inp,marginBottom:8}} value={f.banco} onChange={e=>upd(f.id,"banco",e.target.value)}><option value="">Banco</option>{BANCOS.map(b=><option key={b}>{b}</option>)}</select>
            )}
            {f.tipo==="Especie (vehículo)" && (
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:8}}>
                <input style={s.inp} placeholder="Patente" value={f.patente} onChange={e=>upd(f.id,"patente",e.target.value.toUpperCase())}/>
                <input style={s.inp} placeholder="Marca / Modelo / Año" value={f.descVeh} onChange={e=>upd(f.id,"descVeh",e.target.value)}/>
              </div>
            )}
            <div style={{display:"flex",justifyContent:"flex-end"}}>
              <Btn variant="danger" size="sm" onClick={()=>rem(f.id)}>✕ Quitar</Btn>
            </div>
          </div>
        ))}
      </div>
      {formas.length>0 && (
        <div style={{marginTop:8,padding:"8px 12px",borderRadius:8,fontWeight:700,fontSize:13,display:"flex",justifyContent:"space-between",background:ok?"rgba(34,197,94,0.1)":"rgba(239,68,68,0.1)",color:ok?G.green:G.red}}>
          <span>Total cargado</span>
          <span>{fmt(totalF)} {ok?"✓":`— faltan ${fmt(total-totalF)}`}</span>
        </div>
      )}
    </div>
  );
}

// ─── MODAL REGISTRO ───────────────────────────────────────────────────────────
function ModalRegistro({open, onClose, onSave, vehiculos}) {
  const TIPOS = ["Venta de vehículo","Compra de vehículo","Gasto por vehículo","Gasto general"];
  const [tipo,setTipo] = useState("Venta de vehículo");
  const [fecha,setFecha] = useState(hoy());
  const [desc,setDesc] = useState("");
  const [cuenta,setCuenta] = useState("1.1");
  const [vendedor,setVendedor] = useState("");
  const [importe,setImporte] = useState("");
  const [formas,setFormas] = useState([]);
  const [notas,setNotas] = useState("");
  const [patente,setPatente] = useState("");
  const [estadoPat,setEstadoPat] = useState("idle");
  const [formVeh,setFormVeh] = useState({descripcion:"",marca:"",modelo:"",anio:"",costo:"",tipoEntrada:"Compra directa"});

  const esVenta=tipo==="Venta de vehículo", esCompra=tipo==="Compra de vehículo";
  const esGastoVeh=tipo==="Gasto por vehículo", esGastoGen=tipo==="Gasto general";
  const necesitaVeh=esVenta||esCompra||esGastoVeh;

  const vehEnStock = vehiculos.find(v=>v.patente===patente);
  const imp = parseFloat(importe)||0;
  const totalF = formas.reduce((s,f)=>s+(parseFloat(f.importe)||0),0);
  const cobrosOk = esVenta?(imp>0&&Math.abs(imp-totalF)<1):true;

  const cuentasFilt = Object.values(PLAN).filter(c=>{
    if(c.esAnticipo) return esGastoGen;
    if(c.esRetiro) return esGastoGen;
    if(esVenta) return c.grupo==="Ingresos";
    if(esCompra) return ["2.1","2.2"].includes(c.codigo);
    if(esGastoVeh) return c.esVehiculo && !["2.1","2.2"].includes(c.codigo);
    return !c.esVehiculo && c.tipo==="egreso";
  });

  const handlePatente = val => {
    const up = val.toUpperCase().replace(/\s/g,"");
    setPatente(up);
    setEstadoPat("idle");
    setFormVeh({descripcion:"",marca:"",modelo:"",anio:"",costo:"",tipoEntrada:"Compra directa"});
    if(up.length>=5) setEstadoPat(vehiculos.find(v=>v.patente===up)?"encontrado":"no_encontrado");
  };

  const reset = () => {
    setTipo("Venta de vehículo");setFecha(hoy());setDesc("");setCuenta("1.1");
    setVendedor("");setImporte("");setFormas([]);setNotas("");
    setPatente("");setEstadoPat("idle");
    setFormVeh({descripcion:"",marca:"",modelo:"",anio:"",costo:"",tipoEntrada:"Compra directa"});
  };

  const getVehId = () => {
    if(estadoPat==="encontrado"&&vehEnStock) return vehEnStock.id;
    return "__na__";
  };

  const getVehNuevo = () => {
    if(estadoPat!=="confirmado") return null;
    return {id:uid(),patente,descripcion:formVeh.descripcion,marca:formVeh.marca,modelo:formVeh.modelo,anio:formVeh.anio,costo:formVeh.costo,tipo:formVeh.tipoEntrada,fecha,estado:"En stock",operacionOrigenId:null,fechaVenta:null,precioVenta:null};
  };

  const guardar = () => {
    const r = {id:uid(),tipo,fecha,descripcion:desc,cuenta,vendedor,vehiculoId:getVehId(),notas,importe:imp,formas,esIngreso:esVenta,esAnticipo:PLAN[cuenta]?.esAnticipo||false,empleadoAnticipo:vendedor,_vehNuevo:getVehNuevo()};
    onSave(r); reset(); onClose();
  };

  const canSave = fecha&&desc&&cuenta&&((esVenta&&imp>0&&cobrosOk)||(esCompra&&imp>0)||(esGastoVeh&&imp>0)||(esGastoGen&&imp>0));

  const tipoBtn = (t) => ({
    padding:"8px 4px", borderRadius:10, fontSize:12, fontWeight:700, cursor:"pointer", border:"none", fontFamily:F,
    background: tipo===t ? G.gold : G.input,
    color: tipo===t ? "#000" : G.textSub,
  });

  return (
    <Modal open={open} onClose={()=>{reset();onClose();}} title="Nuevo Registro" size="xl">
      <div style={{display:"flex",flexDirection:"column",gap:16}}>
        {/* Tipo */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:8}}>
          {TIPOS.map(t=><button key={t} style={tipoBtn(t)} onClick={()=>{setTipo(t);setCuenta(t==="Venta de vehículo"?"1.1":t==="Compra de vehículo"?"2.1":t==="Gasto por vehículo"?"2.3":"4.1");setFormas([]);setPatente("");setEstadoPat("idle");}}>{t}</button>)}
        </div>

        {/* Fecha + Cuenta */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
          <Inp label="Fecha *" type="date" value={fecha} onChange={e=>setFecha(e.target.value)}/>
          <div>
            <Lbl>Cuenta contable *</Lbl>
            <select style={s.inp} value={cuenta} onChange={e=>setCuenta(e.target.value)}>
              {cuentasFilt.map(c=><option key={c.codigo} value={c.codigo}>{c.codigo} — {c.nombre}</option>)}
            </select>
          </div>
        </div>

        {/* Descripción */}
        <Inp label="Descripción *" placeholder={esVenta?"Venta Amarok 2020":"Detalle del movimiento..."} value={desc} onChange={e=>setDesc(e.target.value)}/>

        {/* Patente inline */}
        {necesitaVeh && (
          <div style={{display:"grid",gridTemplateColumns:esVenta?"1fr 1fr":"1fr",gap:12,alignItems:"start"}}>
            <div style={{display:"flex",flexDirection:"column",gap:8}}>
              <Inp label={esVenta?"Patente vehículo vendido":esCompra?"Patente vehículo comprado":"Patente vehículo asociado"}
                placeholder="Ej: AA123BC" value={patente} maxLength={8}
                style={{textTransform:"uppercase",letterSpacing:"0.1em",fontWeight:700}}
                onChange={e=>handlePatente(e.target.value)}/>

              {estadoPat==="encontrado"&&vehEnStock&&(
                <div style={{background:"rgba(34,197,94,0.08)",border:"1px solid rgba(34,197,94,0.3)",borderRadius:10,padding:"10px 14px"}}>
                  <div style={{color:G.green,fontWeight:800,fontSize:13}}>✓ {vehEnStock.patente} — {vehEnStock.descripcion}</div>
                  <div style={{color:G.textDim,fontSize:11,fontWeight:600,marginTop:2}}>En stock · Costo: {fmt(parseFloat(vehEnStock.costo))}</div>
                </div>
              )}

              {estadoPat==="no_encontrado"&&(
                <div style={{background:"rgba(245,158,11,0.08)",border:"1px solid rgba(245,158,11,0.3)",borderRadius:10,padding:"10px 14px"}}>
                  <div style={{color:G.amber,fontWeight:800,fontSize:12,marginBottom:8}}>⚠ {patente} no está en el stock</div>
                  <div style={{display:"flex",gap:8}}>
                    <button style={{...s.btnPrimary,padding:"6px 14px",fontSize:12}} onClick={()=>setEstadoPat("form")}>+ Cargar datos</button>
                    <button style={{...s.btnGhost,padding:"6px 14px",fontSize:12}} onClick={()=>setEstadoPat("pendiente")}>Dejar pendiente</button>
                  </div>
                </div>
              )}

              {estadoPat==="pendiente"&&(
                <div style={{background:G.input,border:`1px solid ${G.inputBorder}`,borderRadius:10,padding:"8px 14px"}}>
                  <span style={{color:G.textSub,fontSize:12,fontWeight:600}}>⚠ Se guardará como pendiente de asignar</span>
                </div>
              )}

              {estadoPat==="confirmado"&&(
                <div style={{background:"rgba(34,197,94,0.08)",border:"1px solid rgba(34,197,94,0.3)",borderRadius:10,padding:"10px 14px"}}>
                  <div style={{color:G.green,fontWeight:800,fontSize:13}}>✓ {patente} — {formVeh.descripcion}</div>
                  <div style={{color:G.textDim,fontSize:11,fontWeight:600,marginTop:2}}>Entrará al stock al guardar · Costo: {fmt(parseFloat(formVeh.costo))}</div>
                </div>
              )}

              {estadoPat==="form"&&(
                <div style={{background:G.input,border:`1px solid ${G.gold}`,borderRadius:12,padding:16,display:"flex",flexDirection:"column",gap:10}}>
                  <div style={{color:G.gold,fontWeight:800,fontSize:12,textTransform:"uppercase",letterSpacing:"0.05em"}}>Nuevo vehículo — {patente}</div>
                  <Inp label="Descripción *" placeholder="Amarok 2020 Blanca" value={formVeh.descripcion} onChange={e=>setFormVeh(p=>({...p,descripcion:e.target.value}))}/>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
                    <Inp label="Marca" placeholder="VW" value={formVeh.marca} onChange={e=>setFormVeh(p=>({...p,marca:e.target.value}))}/>
                    <Inp label="Modelo" placeholder="Amarok" value={formVeh.modelo} onChange={e=>setFormVeh(p=>({...p,modelo:e.target.value}))}/>
                    <Inp label="Año" placeholder="2020" value={formVeh.anio} onChange={e=>setFormVeh(p=>({...p,anio:e.target.value}))}/>
                  </div>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                    <Inp label="Costo de entrada ($) *" type="number" placeholder="0" value={formVeh.costo} onChange={e=>setFormVeh(p=>({...p,costo:e.target.value}))}/>
                    <Sel label="Tipo" options={["Compra directa","Parte de pago"].map(x=>({v:x,l:x}))} value={formVeh.tipoEntrada} onChange={e=>setFormVeh(p=>({...p,tipoEntrada:e.target.value}))}/>
                  </div>
                  <div style={{display:"flex",gap:8}}>
                    <button style={{...s.btnPrimary,padding:"8px 16px",fontSize:12,opacity:(!formVeh.descripcion||!formVeh.costo)?0.4:1}} disabled={!formVeh.descripcion||!formVeh.costo} onClick={()=>{if(formVeh.descripcion&&formVeh.costo)setEstadoPat("confirmado");}}>✓ Confirmar — entra al stock</button>
                    <button style={{...s.btnGhost,padding:"8px 16px",fontSize:12}} onClick={()=>setEstadoPat("no_encontrado")}>Cancelar</button>
                  </div>
                </div>
              )}
            </div>
            {esVenta&&(
              <Sel label="Vendedor" options={[{v:"",l:"— Vendedor —"},...VENDEDORES.map(v=>({v,l:v}))]} value={vendedor} onChange={e=>setVendedor(e.target.value)}/>
            )}
          </div>
        )}

        {esGastoGen&&PLAN[cuenta]?.esAnticipo&&(
          <Sel label="Empleado *" options={[{v:"",l:"— Empleado —"},...VENDEDORES.map(v=>({v,l:v}))]} value={vendedor} onChange={e=>setVendedor(e.target.value)}/>
        )}

        <Inp label="Importe ($) *" type="number" placeholder="0" value={importe} onChange={e=>setImporte(e.target.value)}/>

        {esVenta&&<FormasPagoForm formas={formas} setFormas={setFormas} total={imp} allowEspecie={true}/>}
        {!esVenta&&<FormasPagoForm formas={formas} setFormas={setFormas} total={imp} allowEspecie={false}/>}

        <Inp label="Notas" placeholder="Observaciones..." value={notas} onChange={e=>setNotas(e.target.value)}/>

        <div style={{display:"flex",gap:12,paddingTop:12,borderTop:`1px solid ${G.cardBorder}`,alignItems:"center",flexWrap:"wrap"}}>
          <Btn onClick={guardar} disabled={!canSave} size="lg">Guardar</Btn>
          <Btn variant="ghost" onClick={()=>{reset();onClose();}}>Cancelar</Btn>
          {esVenta&&!cobrosOk&&imp>0&&<span style={{fontSize:12,color:G.red,fontWeight:600}}>El total de formas de cobro no cierra</span>}
        </div>
      </div>
    </Modal>
  );
}

// ─── MODAL VEHÍCULO ───────────────────────────────────────────────────────────
function ModalVehiculo({open, onClose, onSave}) {
  const [f,setF] = useState({patente:"",descripcion:"",marca:"",modelo:"",anio:"",costo:"",tipo:"Compra directa",fecha:hoy(),notas:""});
  const upd=(k,v)=>setF(p=>({...p,[k]:v}));
  const guardar=()=>{onSave({...f,id:uid(),estado:"En stock",operacionOrigenId:null,fechaVenta:null,precioVenta:null});setF({patente:"",descripcion:"",marca:"",modelo:"",anio:"",costo:"",tipo:"Compra directa",fecha:hoy(),notas:""});onClose();};
  return (
    <Modal open={open} onClose={onClose} title="Alta de vehículo al stock" size="lg">
      <div style={{display:"flex",flexDirection:"column",gap:12}}>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
          <Inp label="Patente *" placeholder="AA123BC" value={f.patente} style={{textTransform:"uppercase"}} onChange={e=>upd("patente",e.target.value.toUpperCase())}/>
          <Inp label="Descripción *" placeholder="Amarok 2020 Blanca" value={f.descripcion} onChange={e=>upd("descripcion",e.target.value)}/>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12}}>
          <Inp label="Marca" placeholder="VW" value={f.marca} onChange={e=>upd("marca",e.target.value)}/>
          <Inp label="Modelo" placeholder="Amarok" value={f.modelo} onChange={e=>upd("modelo",e.target.value)}/>
          <Inp label="Año" placeholder="2020" value={f.anio} onChange={e=>upd("anio",e.target.value)}/>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
          <Inp label="Costo de entrada ($) *" type="number" placeholder="0" value={f.costo} onChange={e=>upd("costo",e.target.value)}/>
          <Sel label="Tipo" options={["Compra directa","Parte de pago"].map(x=>({v:x,l:x}))} value={f.tipo} onChange={e=>upd("tipo",e.target.value)}/>
        </div>
        <Inp label="Fecha ingreso" type="date" value={f.fecha} onChange={e=>upd("fecha",e.target.value)}/>
        <Inp label="Notas" value={f.notas} onChange={e=>upd("notas",e.target.value)}/>
        <div style={{display:"flex",gap:12,paddingTop:12,borderTop:`1px solid ${G.cardBorder}`}}>
          <Btn onClick={guardar} disabled={!f.patente||!f.descripcion||!f.costo}>Dar de alta</Btn>
          <Btn variant="ghost" onClick={onClose}>Cancelar</Btn>
        </div>
      </div>
    </Modal>
  );
}

// ─── CÁLCULO ESTADO DE RESULTADO ─────────────────────────────────────────────
function calcER(registros, mes) {
  const regs = registros.filter(r=>r.fecha?.startsWith(mes)&&!r.esAnticipo);
  const sumG = grupo => regs.filter(r=>PLAN[r.cuenta]?.grupo===grupo&&!r.esIngreso).reduce((s,r)=>s+r.importe,0);
  const ingresos=regs.filter(r=>r.esIngreso).reduce((s,r)=>s+r.importe,0);
  const cmv=sumG("Costo de Mercadería");
  const gBruta=ingresos-cmv;
  const comercial=sumG("Gastos de Comercialización");
  const resComercial=gBruta-comercial;
  const admin=sumG("Gastos de Administración");
  const ebitda=resComercial-admin;
  const impositivos=sumG("Gastos Impositivos");
  const bancarios=sumG("Gastos Bancarios");
  const resAntesExtr=ebitda-impositivos-bancarios;
  const extraordinarios=sumG("Gastos Extraordinarios");
  const resNeto=resAntesExtr-extraordinarios;
  const retiro=sumG("Retiro del Socio");
  const resDespRetiro=resNeto-retiro;
  const detalle={};
  Object.values(PLAN).forEach(c=>{detalle[c.codigo]=regs.filter(r=>r.cuenta===c.codigo).reduce((s,r)=>s+r.importe,0);});
  return {ingresos,cmv,gBruta,comercial,resComercial,admin,ebitda,impositivos,bancarios,resAntesExtr,extraordinarios,resNeto,retiro,resDespRetiro,detalle,regs};
}

// ─── SECCIONES ────────────────────────────────────────────────────────────────
function SecRegistros({registros,vehiculos,onNuevo,onEliminar}) {
  const [filtroTipo,setFiltroTipo]=useState("");
  const [filtroMes,setFiltroMes]=useState("");
  const meses=[...new Set(registros.map(r=>r.fecha?.slice(0,7)))].sort().reverse();
  const filtrados=registros.filter(r=>{if(filtroTipo&&r.tipo!==filtroTipo)return false;if(filtroMes&&!r.fecha?.startsWith(filtroMes))return false;return true;}).sort((a,b)=>b.fecha?.localeCompare(a.fecha));
  const tcol={"Venta de vehículo":"gold","Compra de vehículo":"blue","Gasto por vehículo":"amber","Gasto general":"gray"};
  return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:24}}>
        <div><h2 style={{margin:0,color:G.text,fontWeight:900,fontSize:20,fontFamily:F}}>Registro Central</h2><p style={{margin:"4px 0 0",color:G.textSub,fontSize:13,fontWeight:600}}>Base maestra de todos los movimientos</p></div>
        <Btn onClick={onNuevo} size="lg">+ Nuevo registro</Btn>
      </div>
      <Card style={{padding:16,marginBottom:16}}>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr auto",gap:12,alignItems:"end"}}>
          <Sel label="Tipo" options={[{v:"",l:"Todos"},...["Venta de vehículo","Compra de vehículo","Gasto por vehículo","Gasto general"].map(x=>({v:x,l:x}))]} value={filtroTipo} onChange={e=>setFiltroTipo(e.target.value)}/>
          <Sel label="Mes" options={[{v:"",l:"Todos"},...meses.map(m=>({v:m,l:mesL(m)}))]} value={filtroMes} onChange={e=>setFiltroMes(e.target.value)}/>
          <div style={{color:G.textSub,fontSize:12,fontWeight:700,paddingBottom:6}}>{filtrados.length} registros</div>
        </div>
      </Card>
      <Card>
        <div style={{overflowX:"auto"}}>
          <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
            <thead>
              <tr style={{borderBottom:`1px solid ${G.cardBorder}`}}>
                {["Fecha","Tipo","Cuenta","Descripción","Vehículo","Importe",""].map(h=>(
                  <th key={h} style={{padding:"12px 12px",textAlign:h==="Importe"?"right":"left",color:G.textSub,fontWeight:700,fontSize:11,textTransform:"uppercase",letterSpacing:"0.05em"}}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtrados.length===0&&<tr><td colSpan={7} style={{textAlign:"center",padding:"48px 0",color:G.textDim,fontWeight:600}}>Sin registros. Hacé click en "+ Nuevo registro" para empezar.</td></tr>}
              {filtrados.map(r=>{
                const veh=vehiculos.find(v=>v.id===r.vehiculoId);
                const c=PLAN[r.cuenta];
                return (
                  <tr key={r.id} style={{borderBottom:`1px solid ${G.cardBorder}`}}>
                    <td style={{padding:"12px 12px",color:G.textSub,fontWeight:600}}>{fmtF(r.fecha)}</td>
                    <td style={{padding:"12px 12px"}}><Badge color={tcol[r.tipo]}>{r.tipo.replace(" de vehículo","").replace(" general","")}</Badge></td>
                    <td style={{padding:"12px 12px",color:G.textDim,fontSize:11,fontWeight:600}}>{c?.codigo} {c?.nombre}</td>
                    <td style={{padding:"12px 12px",color:G.text,fontWeight:600}}>{r.descripcion}</td>
                    <td style={{padding:"12px 12px",fontSize:11}}>{veh?<span style={{fontFamily:"monospace",color:G.textSub,fontWeight:700}}>{veh.patente}</span>:r.vehiculoId==="__na__"?<span style={{color:G.amber,fontWeight:700}}>⚠ Sin asignar</span>:"—"}</td>
                    <td style={{padding:"12px 12px",textAlign:"right",fontFamily:"monospace",fontWeight:800,color:r.esIngreso?G.green:G.red}}>{r.esIngreso?"+":"-"}{fmt(r.importe)}</td>
                    <td style={{padding:"12px 12px",textAlign:"right"}}><Btn variant="danger" size="sm" onClick={()=>onEliminar(r.id)}>✕</Btn></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

function SecStock({vehiculos,registros,onNuevo}) {
  const [filtro,setFiltro]=useState("En stock");
  const [det,setDet]=useState(null);
  const vCC=vehiculos.map(v=>{
    const gs=registros.filter(r=>r.vehiculoId===v.id&&!r.esIngreso);
    const acond=gs.reduce((s,r)=>s+r.importe,0);
    const ce=parseFloat(v.costo)||0;
    const costo=ce+acond;
    const gan=v.precioVenta?(parseFloat(v.precioVenta)-costo):null;
    return {...v,acond,costo,gan,gastos:gs};
  });
  const lista=vCC.filter(v=>!filtro||v.estado===filtro);
  const valorStock=vCC.filter(v=>v.estado==="En stock").reduce((s,v)=>s+v.costo,0);
  const ecol={"En stock":"gold","Reservado":"amber","Vendido":"gray"};
  const filtBtns=["","En stock","Reservado","Vendido"];
  return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:24}}>
        <div><h2 style={{margin:0,color:G.text,fontWeight:900,fontSize:20,fontFamily:F}}>Stock de Vehículos</h2><p style={{margin:"4px 0 0",color:G.textSub,fontSize:13,fontWeight:600}}>Inventario valorizado</p></div>
        <Btn onClick={onNuevo}>+ Alta vehículo</Btn>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:20}}>
        {["En stock","Reservado","Vendido"].map(est=>{
          const cnt=vCC.filter(v=>v.estado===est).length;
          const val=vCC.filter(v=>v.estado===est).reduce((s,v)=>s+v.costo,0);
          return <KPI key={est} label={est} value={`${cnt} unidades`} sub={fmt(val)} color={est==="En stock"?G.gold:est==="Reservado"?G.amber:G.textSub}/>;
        })}
        <KPI label="Capital en stock" value={fmt(valorStock)} color={G.blue}/>
      </div>
      <Card style={{padding:12,marginBottom:16}}>
        <div style={{display:"flex",gap:8}}>
          {filtBtns.map(e=>(
            <button key={e} onClick={()=>setFiltro(e)} style={{padding:"6px 16px",borderRadius:8,fontSize:12,fontWeight:700,border:"none",cursor:"pointer",fontFamily:F,background:filtro===e?G.gold:G.input,color:filtro===e?"#000":G.textSub}}>{e||"Todos"}</button>
          ))}
        </div>
      </Card>
      <Card>
        <div style={{overflowX:"auto"}}>
          <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
            <thead><tr style={{borderBottom:`1px solid ${G.cardBorder}`}}>
              {["Patente","Descripción","Ingreso","Costo entrada","+ Acond.","Costo total","Precio venta","Ganancia","Estado"].map(h=>(
                <th key={h} style={{padding:"12px",textAlign:["Costo entrada","+ Acond.","Costo total","Precio venta","Ganancia"].includes(h)?"right":"left",color:G.textSub,fontWeight:700,fontSize:11,textTransform:"uppercase"}}>{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {lista.length===0&&<tr><td colSpan={9} style={{textAlign:"center",padding:40,color:G.textDim,fontWeight:600}}>Sin vehículos</td></tr>}
              {lista.map(v=>(
                <tr key={v.id} style={{borderBottom:`1px solid ${G.cardBorder}`,cursor:"pointer"}} onClick={()=>setDet(v)}>
                  <td style={{padding:"12px",fontFamily:"monospace",color:G.text,fontWeight:800}}>{v.patente}</td>
                  <td style={{padding:"12px",color:G.text,fontWeight:600}}>{v.descripcion}</td>
                  <td style={{padding:"12px",color:G.textSub,fontSize:11,fontWeight:600}}>{fmtF(v.fecha)}</td>
                  <td style={{padding:"12px",textAlign:"right",fontFamily:"monospace",color:G.textSub,fontWeight:600}}>{fmt(parseFloat(v.costo)||0)}</td>
                  <td style={{padding:"12px",textAlign:"right",fontFamily:"monospace",color:G.amber,fontWeight:700}}>{v.acond>0?fmt(v.acond):"—"}</td>
                  <td style={{padding:"12px",textAlign:"right",fontFamily:"monospace",color:G.text,fontWeight:800}}>{fmt(v.costo)}</td>
                  <td style={{padding:"12px",textAlign:"right",fontFamily:"monospace",color:G.green,fontWeight:700}}>{v.precioVenta?fmt(v.precioVenta):"—"}</td>
                  <td style={{padding:"12px",textAlign:"right",fontFamily:"monospace",fontWeight:800,color:v.gan>0?G.green:v.gan<0?G.red:G.textSub}}>{v.gan!==null?fmt(v.gan):"—"}</td>
                  <td style={{padding:"12px"}}><Badge color={ecol[v.estado]}>{v.estado}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      <Modal open={!!det} onClose={()=>setDet(null)} title={`${det?.patente} — ${det?.descripcion}`} size="lg">
        {det&&(
          <div style={{display:"flex",flexDirection:"column",gap:12}}>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12}}>
              {[["Costo entrada",fmt(parseFloat(det.costo)||0),G.textSub],["Acondicionamiento",fmt(det.acond),G.amber],["Costo total",fmt(det.costo),G.text]].map(([l,v,c])=>(
                <div key={l} style={{background:G.input,borderRadius:10,padding:12}}><div style={{fontSize:11,color:G.textSub,fontWeight:700,marginBottom:4}}>{l}</div><div style={{fontWeight:800,color:c,fontSize:15}}>{v}</div></div>
              ))}
            </div>
            {det.gan!==null&&<div style={{background:det.gan>=0?"rgba(34,197,94,0.08)":"rgba(239,68,68,0.08)",border:`1px solid ${det.gan>=0?"rgba(34,197,94,0.3)":"rgba(239,68,68,0.3)"}`,borderRadius:10,padding:"10px 14px",display:"flex",justifyContent:"space-between"}}>
              <span style={{fontSize:13,color:G.textSub,fontWeight:600}}>Ganancia neta</span>
              <span style={{fontWeight:800,color:det.gan>=0?G.green:G.red}}>{fmt(det.gan)} ({pct(det.gan,parseFloat(det.precioVenta))})</span>
            </div>}
            <div><div style={{fontSize:11,color:G.textSub,fontWeight:700,textTransform:"uppercase",marginBottom:8}}>Gastos de acondicionamiento</div>
              {det.gastos.length===0?<div style={{color:G.textDim,fontSize:13,fontWeight:600}}>Sin gastos</div>:det.gastos.map(g=>(
                <div key={g.id} style={{display:"flex",justifyContent:"space-between",padding:"8px 0",borderBottom:`1px solid ${G.cardBorder}`}}>
                  <div><div style={{color:G.text,fontSize:13,fontWeight:600}}>{g.descripcion}</div><div style={{color:G.textDim,fontSize:11,fontWeight:600}}>{fmtF(g.fecha)} · {PLAN[g.cuenta]?.nombre}</div></div>
                  <span style={{fontFamily:"monospace",color:G.amber,fontWeight:700}}>{fmt(g.importe)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

function SecEstadoResultado({registros}) {
  const mesesDisp=[...new Set(registros.map(r=>r.fecha?.slice(0,7)))].sort().reverse();
  const [mes,setMes]=useState(mesesDisp[0]||new Date().toISOString().slice(0,7));
  const [vista,setVista]=useState("cascada");
  const [expandidos,setExpandidos]=useState({});
  const toggleExp=g=>setExpandidos(p=>({...p,[g]:!p[g]}));
  const ultimos12=useMemo(()=>[...new Set(registros.map(r=>r.fecha?.slice(0,7)))].filter(Boolean).sort().slice(-12),[registros]);
  const er=useMemo(()=>calcER(registros,mes),[registros,mes]);
  const erMeses=useMemo(()=>ultimos12.map(m=>({mes:m,...calcER(registros,m)})),[registros,ultimos12]);

  const stVal={
    "Costo de Mercadería":er.gBruta,"Gastos de Comercialización":er.resComercial,
    "Gastos de Administración":er.ebitda,"Gastos Bancarios":er.resAntesExtr,
    "Gastos Extraordinarios":er.resNeto,"Retiro del Socio":er.resDespRetiro,
  };
  const erKeys=["ingresos","cmv","gBruta","comercial","resComercial","admin","ebitda","impositivos","bancarios","resAntesExtr","extraordinarios","resNeto","retiro","resDespRetiro"];
  const erLabels={"ingresos":"Ingresos totales","cmv":"CMV","gBruta":"GANANCIA BRUTA","comercial":"Gastos comercialización","resComercial":"RESULTADO COMERCIAL","admin":"Gastos administración","ebitda":"EBITDA","impositivos":"Gastos impositivos","bancarios":"Gastos bancarios","resAntesExtr":"RES. ANTES EXTRAORDINARIOS","extraordinarios":"Extraordinarios","resNeto":"RESULTADO NETO","retiro":"Retiro socio","resDespRetiro":"RES. DESPUÉS DE RETIRO"};
  const isSubtotal=k=>["gBruta","resComercial","ebitda","resAntesExtr","resNeto","resDespRetiro"].includes(k);
  const isCosto=k=>["cmv","comercial","admin","impositivos","bancarios","extraordinarios","retiro"].includes(k);

  const vistaBtns=[{v:"cascada",l:"Cascada"},{v:"vertical",l:"Vertical"},{v:"horizontal",l:"Horizontal"}];

  return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:24,flexWrap:"wrap",gap:12}}>
        <div><h2 style={{margin:0,color:G.text,fontWeight:900,fontSize:20,fontFamily:F}}>Estado de Resultado</h2><p style={{margin:"4px 0 0",color:G.textSub,fontSize:13,fontWeight:600}}>Cascada · Vertical · Horizontal</p></div>
        <div style={{display:"flex",gap:12,alignItems:"center"}}>
          <select style={s.inp} value={mes} onChange={e=>setMes(e.target.value)}>
            {mesesDisp.length===0&&<option value={mes}>{mes}</option>}
            {mesesDisp.map(m=><option key={m} value={m}>{mesL(m)}</option>)}
          </select>
          <div style={{display:"flex",background:G.input,borderRadius:10,padding:4,gap:2}}>
            {vistaBtns.map(t=><button key={t.v} onClick={()=>setVista(t.v)} style={{padding:"6px 14px",borderRadius:8,fontSize:12,fontWeight:700,border:"none",cursor:"pointer",fontFamily:F,background:vista===t.v?G.gold:"transparent",color:vista===t.v?"#000":G.textSub}}>{t.l}</button>)}
          </div>
        </div>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12,marginBottom:20}}>
        <KPI label="Ganancia Bruta" value={fmt(er.gBruta)} color={er.gBruta>=0?G.green:G.red} sub={`Margen: ${pct(er.gBruta,er.ingresos)}`}/>
        <KPI label="EBITDA" value={fmt(er.ebitda)} color={er.ebitda>=0?G.blue:G.red} sub="Resultado operativo"/>
        <KPI label="Resultado Neto" value={fmt(er.resNeto)} color={er.resNeto>=0?G.gold:G.red} sub={`Margen: ${pct(er.resNeto,er.ingresos)}`}/>
      </div>

      {vista==="cascada"&&(
        <Card style={{padding:24}}>
          {GRUPOS_ER.map(grupo=>{
            const cuentasG=Object.values(PLAN).filter(c=>c.grupo===grupo.key);
            const totalG=cuentasG.reduce((s,c)=>s+(er.detalle[c.codigo]||0),0);
            const isExp=expandidos[grupo.key];
            const st=SUBTOTALES[grupo.key];
            const sv=stVal[grupo.key];
            return (
              <div key={grupo.key} style={{marginBottom:4}}>
                <button onClick={()=>toggleExp(grupo.key)} style={{width:"100%",display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 8px",borderRadius:8,border:"none",background:"transparent",cursor:"pointer",fontFamily:F}}>
                  <span style={{fontSize:13,color:G.textSub,fontWeight:700}}>{grupo.key}</span>
                  <div style={{display:"flex",alignItems:"center",gap:12}}>
                    <span style={{fontFamily:"monospace",fontWeight:800,fontSize:13,color:grupo.key==="Ingresos"?G.green:G.red}}>{grupo.key!=="Ingresos"&&totalG>0?"(":""}{fmt(totalG)}{grupo.key!=="Ingresos"&&totalG>0?")":""}</span>
                    <span style={{color:G.textDim,fontSize:11}}>{isExp?"▲":"▼"}</span>
                  </div>
                </button>
                {isExp&&cuentasG.map(c=>{
                  const val=er.detalle[c.codigo]||0;
                  if(val===0) return null;
                  return <div key={c.codigo} style={{display:"flex",justifyContent:"space-between",padding:"6px 8px 6px 24px",borderBottom:`1px solid ${G.cardBorder}`}}>
                    <span style={{fontSize:12,color:G.textDim,fontWeight:600}}>{c.codigo} — {c.nombre}</span>
                    <span style={{fontFamily:"monospace",fontSize:12,color:grupo.key==="Ingresos"?G.green+"bb":G.red+"bb",fontWeight:700}}>{fmt(val)}</span>
                  </div>;
                })}
                {st&&<div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"12px 8px",margin:"8px 0",borderRadius:10,background:sv>=0?"rgba(34,197,94,0.08)":"rgba(239,68,68,0.08)",border:`1px solid ${sv>=0?"rgba(34,197,94,0.2)":"rgba(239,68,68,0.2)"}`}}>
                  <span style={{fontWeight:800,color:G.text,fontSize:13,fontFamily:F}}>{st}</span>
                  <div style={{textAlign:"right"}}>
                    <div style={{fontWeight:900,fontSize:18,fontFamily:"monospace",color:sv>=0?G.green:G.red}}>{fmt(sv)}</div>
                    {er.ingresos>0&&<div style={{fontSize:11,color:G.textDim,fontWeight:600}}>{pct(sv,er.ingresos)} de ingresos</div>}
                  </div>
                </div>}
              </div>
            );
          })}
        </Card>
      )}

      {vista==="vertical"&&(
        <Card>
          <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
            <thead><tr style={{borderBottom:`1px solid ${G.cardBorder}`}}>
              {["Concepto","Importe","% Ingresos"].map(h=><th key={h} style={{padding:"12px 16px",textAlign:h==="Concepto"?"left":"right",color:G.textSub,fontWeight:700,fontSize:11,textTransform:"uppercase"}}>{h}</th>)}
            </tr></thead>
            <tbody>
              {erKeys.map(k=>{
                const val=er[k]||0;
                const pctVal=er.ingresos>0?(val/er.ingresos*100):0;
                const sub=isSubtotal(k);
                const color=k==="ingresos"?G.green:isCosto(k)?G.red:sub?(val>=0?G.green:G.red):G.text;
                return <tr key={k} style={{borderBottom:`1px solid ${G.cardBorder}`,background:sub?G.input:"transparent"}}>
                  <td style={{padding:"10px 16px",paddingLeft:sub?"16px":"32px",color:sub?G.text:G.textSub,fontWeight:sub?800:600,fontSize:sub?13:12}}>{erLabels[k]}</td>
                  <td style={{padding:"10px 16px",textAlign:"right",fontFamily:"monospace",fontWeight:sub?900:700,color,fontSize:sub?15:13}}>{isCosto(k)&&val>0?`(${fmt(val)})`:fmt(val)}</td>
                  <td style={{padding:"10px 16px",textAlign:"right",fontSize:11,fontWeight:700,color:pctVal>20?G.red:pctVal>10?G.amber:G.textSub}}>{pctVal.toFixed(1)}%</td>
                </tr>;
              })}
            </tbody>
          </table>
        </Card>
      )}

      {vista==="horizontal"&&(
        <Card>
          <div style={{overflowX:"auto"}}>
            <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
              <thead><tr style={{borderBottom:`1px solid ${G.cardBorder}`}}>
                <th style={{padding:"12px 16px",textAlign:"left",color:G.textSub,fontWeight:700,fontSize:11,minWidth:180}}>Concepto</th>
                {erMeses.map(m=><th key={m.mes} style={{padding:"12px 12px",textAlign:"right",minWidth:130,color:m.mes===mes?G.gold:G.textSub,fontWeight:m.mes===mes?800:700,fontSize:11}}>{mesL(m.mes)}</th>)}
              </tr></thead>
              <tbody>
                {erKeys.map(fila=>(
                  <tr key={fila} style={{borderBottom:`1px solid ${G.cardBorder}`,background:isSubtotal(fila)?G.input:"transparent"}}>
                    <td style={{padding:"8px 16px",paddingLeft:isSubtotal(fila)?"16px":"32px",color:isSubtotal(fila)?G.text:G.textSub,fontWeight:isSubtotal(fila)?800:600,fontSize:isSubtotal(fila)?12:11}}>{erLabels[fila]}</td>
                    {erMeses.map((m,mi)=>{
                      const val=m[fila]||0;
                      const prev=mi>0?(erMeses[mi-1][fila]||0):null;
                      const varA=prev!==null?val-prev:null;
                      const varP=prev!==null&&prev!==0?((val-prev)/Math.abs(prev)*100):null;
                      const sub=isSubtotal(fila);
                      const color=fila==="ingresos"?G.green:isCosto(fila)?G.red:sub?(val>=0?G.green:G.red):G.text;
                      return <td key={m.mes} style={{padding:"8px 12px",textAlign:"right",background:m.mes===mes?"rgba(212,160,23,0.04)":"transparent"}}>
                        <div style={{fontFamily:"monospace",fontWeight:sub?900:700,color,fontSize:sub?13:12}}>{fmt(val)}</div>
                        {varA!==null&&<div style={{fontSize:10,fontWeight:700,color:varA>=0?G.green:G.red,marginTop:2}}>{varA>=0?"▲":"▼"} {varA>=0?"+":""}{fmtM(varA)} <span style={{opacity:0.7}}>({varA>=0?"+":""}{varP?.toFixed(0)}%)</span></div>}
                      </td>;
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}

function SecRentabilidad({vehiculos,registros}) {
  const [vista,setVista]=useState("vehiculos");
  const [detOp,setDetOp]=useState(null);
  const vV=vehiculos.filter(v=>v.estado==="Vendido").map(v=>{
    const gs=registros.filter(r=>r.vehiculoId===v.id&&!r.esIngreso);
    const acond=gs.reduce((s,r)=>s+r.importe,0);
    const ce=parseFloat(v.costo)||0;
    const ct=ce+acond;
    const pv=parseFloat(v.precioVenta)||0;
    const gan=pv-ct;
    return {...v,acond,ct,pv,gan,margen:pv>0?(gan/pv*100):0,gastos:gs};
  }).sort((a,b)=>b.gan-a.gan);

  const ops=[];const proc=new Set();
  vV.forEach(v=>{
    if(proc.has(v.id))return;proc.add(v.id);
    const hijos=vehiculos.filter(h=>h.operacionOrigenId===v.id&&h.estado==="Vendido").map(h=>{
      const gs=registros.filter(r=>r.vehiculoId===h.id&&!r.esIngreso);
      const ac=gs.reduce((s,r)=>s+r.importe,0);
      const ce=parseFloat(h.costo)||0;
      const ct=ce+ac;
      const pv=parseFloat(h.precioVenta)||0;
      proc.add(h.id);
      return {...h,acond:ac,ct,pv,gan:pv-ct,gastos:gs};
    });
    ops.push({madre:v,hijos,totI:v.pv+hijos.reduce((s,h)=>s+h.pv,0),totC:v.ct+hijos.reduce((s,h)=>s+h.ct,0),ganTotal:0});
    ops[ops.length-1].ganTotal=ops[ops.length-1].totI-ops[ops.length-1].totC;
  });

  return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:24}}>
        <div><h2 style={{margin:0,color:G.text,fontWeight:900,fontSize:20,fontFamily:F}}>Rentabilidad por Vehículo</h2><p style={{margin:"4px 0 0",color:G.textSub,fontSize:13,fontWeight:600}}>Ganancia real por unidad vendida</p></div>
        <div style={{display:"flex",gap:8}}>
          {[{v:"vehiculos",l:"Por vehículo"},{v:"operaciones",l:"Por operación"}].map(t=>(
            <button key={t.v} onClick={()=>setVista(t.v)} style={{padding:"8px 16px",borderRadius:10,fontSize:12,fontWeight:700,border:"none",cursor:"pointer",fontFamily:F,background:vista===t.v?G.gold:G.input,color:vista===t.v?"#000":G.textSub}}>{t.l}</button>
          ))}
        </div>
      </div>
      {vista==="vehiculos"&&(
        <Card>
          <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
            <thead><tr style={{borderBottom:`1px solid ${G.cardBorder}`}}>
              {["Patente","Descripción","Vendedor","Costo","Acond.","Costo total","Venta","Ganancia","Margen"].map(h=>(
                <th key={h} style={{padding:"12px",textAlign:["Costo","Acond.","Costo total","Venta","Ganancia","Margen"].includes(h)?"right":"left",color:G.textSub,fontWeight:700,fontSize:11,textTransform:"uppercase"}}>{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {vV.length===0&&<tr><td colSpan={9} style={{textAlign:"center",padding:40,color:G.textDim,fontWeight:600}}>Sin vehículos vendidos aún</td></tr>}
              {vV.map(v=>(
                <tr key={v.id} style={{borderBottom:`1px solid ${G.cardBorder}`}}>
                  <td style={{padding:"12px",fontFamily:"monospace",color:G.text,fontWeight:800}}>{v.patente}</td>
                  <td style={{padding:"12px",color:G.text,fontWeight:600}}>{v.descripcion}</td>
                  <td style={{padding:"12px",color:G.textSub,fontSize:11,fontWeight:600}}>{v.vendedor||"—"}</td>
                  <td style={{padding:"12px",textAlign:"right",fontFamily:"monospace",color:G.textSub,fontWeight:600}}>{fmt(parseFloat(v.costo))}</td>
                  <td style={{padding:"12px",textAlign:"right",fontFamily:"monospace",color:G.amber,fontWeight:700}}>{fmt(v.acond)}</td>
                  <td style={{padding:"12px",textAlign:"right",fontFamily:"monospace",color:G.text,fontWeight:800}}>{fmt(v.ct)}</td>
                  <td style={{padding:"12px",textAlign:"right",fontFamily:"monospace",color:G.green,fontWeight:700}}>{fmt(v.pv)}</td>
                  <td style={{padding:"12px",textAlign:"right",fontFamily:"monospace",fontWeight:800,color:v.gan>=0?G.green:G.red}}>{fmt(v.gan)}</td>
                  <td style={{padding:"12px",textAlign:"right",fontWeight:700,color:v.margen>=10?G.green:v.margen>=5?G.amber:G.red}}>{v.margen.toFixed(1)}%</td>
                </tr>
              ))}
              {vV.length>0&&<tr style={{background:G.input}}>
                <td colSpan={5} style={{padding:"12px",color:G.text,fontWeight:800,fontSize:12}}>TOTAL</td>
                <td style={{padding:"12px",textAlign:"right",fontFamily:"monospace",color:G.text,fontWeight:800}}>{fmt(vV.reduce((s,v)=>s+v.ct,0))}</td>
                <td style={{padding:"12px",textAlign:"right",fontFamily:"monospace",color:G.green,fontWeight:800}}>{fmt(vV.reduce((s,v)=>s+v.pv,0))}</td>
                <td style={{padding:"12px",textAlign:"right",fontFamily:"monospace",fontWeight:900,color:G.green,fontSize:15}}>{fmt(vV.reduce((s,v)=>s+v.gan,0))}</td>
                <td style={{padding:"12px",textAlign:"right",fontWeight:800,color:G.green}}>{pct(vV.reduce((s,v)=>s+v.gan,0),vV.reduce((s,v)=>s+v.pv,0))}</td>
              </tr>}
            </tbody>
          </table>
        </Card>
      )}
      {vista==="operaciones"&&(
        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          {ops.length===0&&<Card style={{padding:40,textAlign:"center"}}><span style={{color:G.textDim,fontWeight:600}}>Sin operaciones</span></Card>}
          {ops.map((op,i)=>(
            <Card key={op.madre.id} style={{overflow:"hidden"}}>
              <div style={{padding:16,cursor:"pointer"}} onClick={()=>setDetOp(detOp?.madre.id===op.madre.id?null:op)}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <div style={{display:"flex",alignItems:"center",gap:12}}>
                    <div style={{width:10,height:10,borderRadius:"50%",background:COLORES[i%COLORES.length]}}/>
                    <div>
                      <div style={{fontWeight:800,color:G.text,fontSize:14}}>{op.madre.patente} — {op.madre.descripcion}</div>
                      {op.hijos.length>0&&<div style={{color:G.textSub,fontSize:11,fontWeight:600,marginTop:2}}>+ {op.hijos.length} vehículo(s) recibido(s) en parte de pago</div>}
                    </div>
                  </div>
                  <div style={{display:"flex",alignItems:"center",gap:16}}>
                    <div style={{textAlign:"right"}}>
                      <div style={{fontWeight:900,fontSize:16,fontFamily:"monospace",color:op.ganTotal>=0?G.green:G.red}}>{fmt(op.ganTotal)}</div>
                      <div style={{fontSize:11,color:G.textSub,fontWeight:600}}>{pct(op.ganTotal,op.totI)} margen</div>
                    </div>
                    <span style={{color:G.textDim}}>{detOp?.madre.id===op.madre.id?"▲":"▼"}</span>
                  </div>
                </div>
              </div>
              {detOp?.madre.id===op.madre.id&&(
                <div style={{borderTop:`1px solid ${G.cardBorder}`,padding:16,display:"flex",flexDirection:"column",gap:12,background:G.input}}>
                  {[op.madre,...op.hijos].map((v,vi)=>(
                    <div key={v.id} style={{borderRadius:12,padding:16,border:`1px solid ${vi===0?G.cardBorder:"rgba(245,158,11,0.3)"}`,background:vi===0?G.card:"rgba(245,158,11,0.04)"}}>
                      <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:12}}>
                        <Badge color={vi===0?"blue":"amber"}>{vi===0?"Madre":"Parte de pago"}</Badge>
                        <span style={{fontFamily:"monospace",fontWeight:800,color:G.text}}>{v.patente}</span>
                        <span style={{color:G.textSub,fontSize:13,fontWeight:600}}>{v.descripcion}</span>
                      </div>
                      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12}}>
                        {[["Costo entrada",fmt(parseFloat(v.costo)),G.textSub],["Acondicionamiento",fmt(v.acond),G.amber],["Precio venta",fmt(v.pv),G.green],["Ganancia",fmt(v.gan),v.gan>=0?G.green:G.red]].map(([l,val,c])=>(
                          <div key={l}><div style={{fontSize:11,color:G.textSub,fontWeight:700,marginBottom:2}}>{l}</div><div style={{fontFamily:"monospace",fontWeight:800,color:c}}>{val}</div></div>
                        ))}
                      </div>
                    </div>
                  ))}
                  <div style={{background:G.card,borderRadius:12,padding:16,display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12,textAlign:"center"}}>
                    {[["Ingresos totales",fmt(op.totI),G.green],["Costos totales",fmt(op.totC),G.red],["Ganancia combinada",fmt(op.ganTotal),op.ganTotal>=0?G.green:G.red]].map(([l,v,c])=>(
                      <div key={l}><div style={{fontSize:11,color:G.textSub,fontWeight:700,marginBottom:4}}>{l}</div><div style={{fontFamily:"monospace",fontWeight:900,fontSize:18,color:c}}>{v}</div></div>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function SecFlujo({registros}) {
  const movs=useMemo(()=>{
    const items=[];
    registros.forEach(r=>{
      if(r.esIngreso&&r.formas?.length>0){r.formas.filter(f=>f.tipo!=="Especie (vehículo)").forEach(f=>items.push({id:uid(),fecha:f.fechaCobro||r.fecha,desc:r.descripcion,tipo:"ingreso",importe:parseFloat(f.importe)||0,formaPago:f.tipo,banco:f.banco}));}
      else if(!r.esIngreso){
        const fs=r.formas?.length>0?r.formas:[{tipo:"Efectivo",importe:r.importe,banco:"",fechaCobro:""}];
        fs.forEach(f=>items.push({id:uid(),fecha:f.fechaCobro||r.fecha,desc:r.descripcion,tipo:"egreso",importe:parseFloat(f.importe)||r.importe,formaPago:f.tipo,banco:f.banco}));
      }
    });
    return items.sort((a,b)=>(a.fecha||"").localeCompare(b.fecha||""));
  },[registros]);
  const hoyStr=hoy();
  const porMes=useMemo(()=>{
    const map={};
    movs.forEach(m=>{const mes=m.fecha?.slice(0,7);if(!mes)return;if(!map[mes])map[mes]={mes,ingresos:0,egresos:0};if(m.tipo==="ingreso")map[mes].ingresos+=m.importe;else map[mes].egresos+=m.importe;});
    return Object.values(map).sort((a,b)=>a.mes.localeCompare(b.mes)).map(d=>({...d,neto:d.ingresos-d.egresos,label:mesL(d.mes)}));
  },[movs]);
  const pend=movs.filter(m=>m.fecha>hoyStr&&(m.formaPago?.includes("Cheque")||m.formaPago?.includes("Crédito")));
  const totC=pend.filter(m=>m.tipo==="ingreso").reduce((s,m)=>s+m.importe,0);
  const totP=pend.filter(m=>m.tipo==="egreso").reduce((s,m)=>s+m.importe,0);
  return (
    <div>
      <div style={{marginBottom:24}}><h2 style={{margin:0,color:G.text,fontWeight:900,fontSize:20,fontFamily:F}}>Flujo de Fondos</h2><p style={{margin:"4px 0 0",color:G.textSub,fontSize:13,fontWeight:600}}>Proyección de entradas y salidas</p></div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:20}}>
        <KPI label="Por cobrar" value={fmt(totC)} color={G.green} sub={`${pend.filter(m=>m.tipo==="ingreso").length} mov.`}/>
        <KPI label="Por pagar" value={fmt(totP)} color={G.red} sub={`${pend.filter(m=>m.tipo==="egreso").length} mov.`}/>
        <KPI label="Posición neta" value={fmt(totC-totP)} color={totC-totP>=0?G.blue:G.red}/>
        <KPI label="Total en flujo" value={movs.length.toString()} color={G.textSub} sub="movimientos"/>
      </div>
      {porMes.length>0&&<Card style={{padding:20,marginBottom:16}}>
        <div style={{fontWeight:800,color:G.text,fontSize:14,marginBottom:16}}>Ingresos vs Egresos por mes</div>
        <ResponsiveContainer width="100%" height={260}>
          <ComposedChart data={porMes} barGap={4}>
            <CartesianGrid strokeDasharray="3 3" stroke={G.cardBorder}/>
            <XAxis dataKey="label" tick={{fill:G.textSub,fontSize:11,fontWeight:600}}/>
            <YAxis tick={{fill:G.textSub,fontSize:10}} tickFormatter={v=>fmtM(v)}/>
            <Tooltip formatter={(v,n)=>[fmt(v),n]} contentStyle={{background:G.card,border:`1px solid ${G.cardBorder}`,borderRadius:8,fontFamily:F,fontWeight:600}}/>
            <Legend wrapperStyle={{fontSize:12,fontWeight:700}}/>
            <Bar dataKey="ingresos" name="Ingresos" fill={G.green} radius={[4,4,0,0]}/>
            <Bar dataKey="egresos" name="Egresos" fill={G.red} radius={[4,4,0,0]}/>
            <Line type="monotone" dataKey="neto" name="Neto" stroke={G.gold} strokeWidth={2} dot={{fill:G.gold,r:3}}/>
          </ComposedChart>
        </ResponsiveContainer>
      </Card>}
      <Card>
        <div style={{padding:"16px 20px",borderBottom:`1px solid ${G.cardBorder}`,fontWeight:800,color:G.text,fontSize:14}}>Movimientos pendientes futuros</div>
        <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
          <thead><tr style={{borderBottom:`1px solid ${G.cardBorder}`}}>
            {["Fecha","Descripción","Tipo","Forma","Importe"].map(h=><th key={h} style={{padding:"12px 16px",textAlign:h==="Importe"?"right":"left",color:G.textSub,fontWeight:700,fontSize:11,textTransform:"uppercase"}}>{h}</th>)}
          </tr></thead>
          <tbody>
            {pend.length===0&&<tr><td colSpan={5} style={{textAlign:"center",padding:40,color:G.textDim,fontWeight:600}}>Sin movimientos futuros pendientes</td></tr>}
            {pend.sort((a,b)=>a.fecha?.localeCompare(b.fecha)).map(m=>(
              <tr key={m.id} style={{borderBottom:`1px solid ${G.cardBorder}`}}>
                <td style={{padding:"12px 16px",color:G.textSub,fontWeight:600}}>{fmtF(m.fecha)}</td>
                <td style={{padding:"12px 16px",color:G.text,fontWeight:600}}>{m.desc}</td>
                <td style={{padding:"12px 16px"}}><Badge color={m.tipo==="ingreso"?"green":"red"}>{m.tipo}</Badge></td>
                <td style={{padding:"12px 16px",color:G.textSub,fontSize:11,fontWeight:600}}>{m.formaPago}{m.banco?` · ${m.banco}`:""}</td>
                <td style={{padding:"12px 16px",textAlign:"right",fontFamily:"monospace",fontWeight:800,color:m.tipo==="ingreso"?G.green:G.red}}>{m.tipo==="ingreso"?"+":"-"}{fmt(m.importe)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

function SecCheques({registros}) {
  const cheques=useMemo(()=>{
    const items=[];
    registros.forEach(r=>{(r.formas||[]).forEach(f=>{if(f.tipo==="Cheque recibido"||f.tipo==="Cheque emitido")items.push({...f,id:uid(),origen:r.descripcion,tipoCheque:f.tipo==="Cheque recibido"?"recibido":"emitido",importe:parseFloat(f.importe)||0});});});
    return items.sort((a,b)=>(a.fechaCobro||"").localeCompare(b.fechaCobro||""));
  },[registros]);
  const [filtro,setFiltro]=useState("todos");
  const lista=cheques.filter(c=>filtro==="todos"||c.tipoCheque===filtro);
  const totR=cheques.filter(c=>c.tipoCheque==="recibido").reduce((s,c)=>s+c.importe,0);
  const totE=cheques.filter(c=>c.tipoCheque==="emitido").reduce((s,c)=>s+c.importe,0);
  return (
    <div>
      <div style={{marginBottom:24}}><h2 style={{margin:0,color:G.text,fontWeight:900,fontSize:20,fontFamily:F}}>Planilla de Cheques</h2><p style={{margin:"4px 0 0",color:G.textSub,fontSize:13,fontWeight:600}}>Emitidos y recibidos</p></div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12,marginBottom:20}}>
        <KPI label="Cheques recibidos" value={fmt(totR)} color={G.green} sub={`${cheques.filter(c=>c.tipoCheque==="recibido").length} cheques`}/>
        <KPI label="Cheques emitidos" value={fmt(totE)} color={G.red} sub={`${cheques.filter(c=>c.tipoCheque==="emitido").length} cheques`}/>
        <KPI label="Posición neta" value={fmt(totR-totE)} color={totR-totE>=0?G.blue:G.red}/>
      </div>
      <Card style={{padding:12,marginBottom:16}}>
        <div style={{display:"flex",gap:8}}>
          {[{v:"todos",l:"Todos"},{v:"recibido",l:"Recibidos"},{v:"emitido",l:"Emitidos"}].map(t=>(
            <button key={t.v} onClick={()=>setFiltro(t.v)} style={{padding:"6px 16px",borderRadius:8,fontSize:12,fontWeight:700,border:"none",cursor:"pointer",fontFamily:F,background:filtro===t.v?G.gold:G.input,color:filtro===t.v?"#000":G.textSub}}>{t.l}</button>
          ))}
        </div>
      </Card>
      <Card>
        <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
          <thead><tr style={{borderBottom:`1px solid ${G.cardBorder}`}}>
            {["Tipo","Nro. Cheque","Banco","Origen","Vencimiento","Importe"].map(h=><th key={h} style={{padding:"12px 16px",textAlign:h==="Importe"?"right":"left",color:G.textSub,fontWeight:700,fontSize:11,textTransform:"uppercase"}}>{h}</th>)}
          </tr></thead>
          <tbody>
            {lista.length===0&&<tr><td colSpan={6} style={{textAlign:"center",padding:40,color:G.textDim,fontWeight:600}}>Sin cheques</td></tr>}
            {lista.map(c=>(
              <tr key={c.id} style={{borderBottom:`1px solid ${G.cardBorder}`}}>
                <td style={{padding:"12px 16px"}}><Badge color={c.tipoCheque==="recibido"?"green":"red"}>{c.tipoCheque}</Badge></td>
                <td style={{padding:"12px 16px",fontFamily:"monospace",color:G.text,fontWeight:700}}>{c.nroCheque||"—"}</td>
                <td style={{padding:"12px 16px",color:G.textSub,fontWeight:600}}>{c.banco||"—"}</td>
                <td style={{padding:"12px 16px",color:G.text,fontSize:11,fontWeight:600}}>{c.origen}</td>
                <td style={{padding:"12px 16px",color:G.textSub,fontWeight:600}}>{fmtF(c.fechaCobro)}</td>
                <td style={{padding:"12px 16px",textAlign:"right",fontFamily:"monospace",fontWeight:800,color:c.tipoCheque==="recibido"?G.green:G.red}}>{fmt(c.importe)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

function SecAnticipos({registros}) {
  const anticipos=registros.filter(r=>r.esAnticipo);
  const porEmp={};
  anticipos.forEach(a=>{
    const emp=a.empleadoAnticipo||"Sin asignar";
    if(!porEmp[emp])porEmp[emp]={nombre:emp,combustible:0,lavadero:0,otros:0,total:0,items:[]};
    const v=a.importe||0;
    if(a.cuenta==="A.1")porEmp[emp].combustible+=v;
    else if(a.cuenta==="A.2")porEmp[emp].lavadero+=v;
    else porEmp[emp].otros+=v;
    porEmp[emp].total+=v;porEmp[emp].items.push(a);
  });
  const emps=Object.values(porEmp);
  return (
    <div>
      <div style={{marginBottom:24}}><h2 style={{margin:0,color:G.text,fontWeight:900,fontSize:20,fontFamily:F}}>Anticipos de Empleados</h2><p style={{margin:"4px 0 0",color:G.textSub,fontSize:13,fontWeight:600}}>No impactan en el resultado — se descuentan del sueldo</p></div>
      <div style={{background:"rgba(245,158,11,0.08)",border:"1px solid rgba(245,158,11,0.3)",borderRadius:12,padding:"12px 16px",marginBottom:20,fontSize:12,color:G.amber,fontWeight:700}}>⚠ Estos gastos no aparecen en el Estado de Resultado. Se descuentan directamente del sueldo al liquidar.</div>
      {emps.length===0&&<Card style={{padding:40,textAlign:"center"}}><span style={{color:G.textDim,fontWeight:600}}>Sin anticipos registrados</span></Card>}
      <div style={{display:"flex",flexDirection:"column",gap:16}}>
        {emps.map(e=>(
          <Card key={e.nombre} style={{padding:20}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
              <div style={{fontWeight:900,color:G.text,fontSize:16,fontFamily:F}}>{e.nombre}</div>
              <div style={{textAlign:"right"}}><div style={{fontFamily:"monospace",fontWeight:900,fontSize:18,color:G.amber}}>{fmt(e.total)}</div><div style={{fontSize:11,color:G.textSub,fontWeight:600}}>a descontar del sueldo</div></div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12,marginBottom:16}}>
              {[["Combustible",e.combustible],["Lavadero",e.lavadero],["Otros",e.otros]].map(([l,v])=>(
                <div key={l} style={{background:G.input,borderRadius:10,padding:12,textAlign:"center"}}><div style={{fontSize:11,color:G.textSub,fontWeight:700,marginBottom:4}}>{l}</div><div style={{fontWeight:800,color:G.text}}>{fmt(v)}</div></div>
              ))}
            </div>
            {e.items.map(i=>(
              <div key={i.id} style={{display:"flex",justifyContent:"space-between",padding:"8px 0",borderBottom:`1px solid ${G.cardBorder}`}}>
                <span style={{color:G.textSub,fontSize:12,fontWeight:600}}>{fmtF(i.fecha)} — {i.descripcion}</span>
                <span style={{fontFamily:"monospace",color:G.amber,fontWeight:700,fontSize:12}}>{fmt(i.importe)}</span>
              </div>
            ))}
          </Card>
        ))}
      </div>
    </div>
  );
}

function SecDashboard({registros,vehiculos}) {
  const mesesDisp=[...new Set(registros.map(r=>r.fecha?.slice(0,7)))].filter(Boolean).sort().reverse();
  const [mes,setMes]=useState(mesesDisp[0]||new Date().toISOString().slice(0,7));
  const er=useMemo(()=>calcER(registros,mes),[registros,mes]);
  const idx=mesesDisp.indexOf(mes);
  const erPrev=useMemo(()=>mesesDisp[idx+1]?calcER(registros,mesesDisp[idx+1]):null,[registros,idx,mesesDisp]);
  const vMes=vehiculos.filter(v=>v.fechaVenta?.startsWith(mes));
  const vMesPrev=vehiculos.filter(v=>v.fechaVenta?.startsWith(mesesDisp[idx+1]||"____"));
  const enStock=vehiculos.filter(v=>v.estado==="En stock");
  const valorStock=enStock.reduce((s,v)=>s+(parseFloat(v.costo)||0),0);
  const gastosFijos=er.regs.filter(r=>PLAN[r.cuenta]?.esFijo&&!r.esIngreso).reduce((s,r)=>s+r.importe,0);
  const margenProm=er.ingresos>0?(er.gBruta/er.ingresos):0;
  const ticketProm=vMes.length>0?er.ingresos/vMes.length:0;
  const puntoEqPesos=margenProm>0?gastosFijos/margenProm:0;
  const puntoEqAutos=ticketProm>0?puntoEqPesos/ticketProm:0;
  const hoyStr=hoy();
  const chequesProx=registros.flatMap(r=>(r.formas||[]).filter(f=>f.tipo==="Cheque recibido"&&f.fechaCobro&&f.fechaCobro>=hoyStr).map(f=>({...f,importe:parseFloat(f.importe)||0})));
  const totChqProx=chequesProx.reduce((s,c)=>s+c.importe,0);
  const sinPatente=registros.filter(r=>r.vehiculoId==="__na__").length;
  const extrasMes=er.regs.filter(r=>PLAN[r.cuenta]?.esExtraordinario&&!r.esIngreso);
  const totExtras=extrasMes.reduce((s,r)=>s+r.importe,0);
  const ultimos6=useMemo(()=>{
    const ms=[...new Set(registros.map(r=>r.fecha?.slice(0,7)))].filter(Boolean).sort().slice(-6);
    return ms.map(m=>{const e=calcER(registros,m);return{label:mesL(m),ingresos:e.ingresos,egresos:e.cmv+e.comercial+e.admin+e.impositivos+e.bancarios,neto:e.resNeto};});
  },[registros]);
  const porVendedor=useMemo(()=>{
    const map={};
    registros.filter(r=>r.fecha?.startsWith(mes)&&r.esIngreso&&r.vendedor).forEach(r=>{if(!map[r.vendedor])map[r.vendedor]={nombre:r.vendedor,ventas:0,cant:0};map[r.vendedor].ventas+=r.importe;map[r.vendedor].cant++;});
    return Object.values(map).sort((a,b)=>b.ventas-a.ventas).slice(0,5);
  },[registros,mes]);
  const top5=useMemo(()=>vehiculos.filter(v=>v.estado==="Vendido"&&v.fechaVenta?.startsWith(mes)).map(v=>{
    const gs=registros.filter(r=>r.vehiculoId===v.id&&!r.esIngreso).reduce((s,r)=>s+r.importe,0);
    const ct=(parseFloat(v.costo)||0)+gs;
    const pv=parseFloat(v.precioVenta)||0;
    return {...v,gan:pv-ct,pv};
  }).sort((a,b)=>b.gan-a.gan).slice(0,5),[vehiculos,registros,mes]);
  const distGastos=[
    {name:"CMV",value:er.cmv},{name:"Comercialización",value:er.comercial},
    {name:"Administración",value:er.admin},{name:"Impositivos",value:er.impositivos},
    {name:"Bancarios",value:er.bancarios},{name:"Extraordinarios",value:er.extraordinarios},
  ].filter(d=>d.value>0);
  const dif=(a,b)=>b!==null?a-b:undefined;
  const difP=(a,b)=>b!==null&&b!==0?((a-b)/Math.abs(b)*100):undefined;

  return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:24}}>
        <div><h2 style={{margin:0,color:G.text,fontWeight:900,fontSize:20,fontFamily:F}}>Dashboard</h2><p style={{margin:"4px 0 0",color:G.textSub,fontSize:13,fontWeight:600}}>Métricas clave del negocio</p></div>
        <select style={s.inp} value={mes} onChange={e=>setMes(e.target.value)}>
          {mesesDisp.length===0&&<option value={mes}>{mes}</option>}
          {mesesDisp.map(m=><option key={m} value={m}>{mesL(m)}</option>)}
        </select>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:12}}>
        <KPI label="Autos vendidos" value={vMes.length.toString()} color={G.text} varAbs={dif(vMes.length,erPrev?vMesPrev.length:null)} varPct={difP(vMes.length,erPrev?vMesPrev.length:null)} sub="unidades"/>
        <KPI label="Ingresos" value={fmtM(er.ingresos)} color={G.green} varAbs={dif(er.ingresos,erPrev?.ingresos??null)} varPct={difP(er.ingresos,erPrev?.ingresos??null)}/>
        <KPI label="Ganancia bruta" value={fmtM(er.gBruta)} color={er.gBruta>=0?G.gold:G.red} varAbs={dif(er.gBruta,erPrev?.gBruta??null)} varPct={difP(er.gBruta,erPrev?.gBruta??null)} sub={`Margen ${pct(er.gBruta,er.ingresos)}`}/>
        <KPI label="Resultado neto" value={fmtM(er.resNeto)} color={er.resNeto>=0?G.blue:G.red} varAbs={dif(er.resNeto,erPrev?.resNeto??null)} varPct={difP(er.resNeto,erPrev?.resNeto??null)} sub={`Margen ${pct(er.resNeto,er.ingresos)}`}/>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:12}}>
        <KPI label="Autos en stock" value={enStock.length.toString()} color={G.amber} sub={`Capital ${fmtM(valorStock)}`}/>
        <KPI label="Ticket promedio" value={fmtM(ticketProm)} color={G.textSub} sub="por venta"/>
        <KPI label="Punto de equilibrio" value={fmtM(puntoEqPesos)} color={G.amber} sub={`≈ ${puntoEqAutos.toFixed(1)} autos/mes`}/>
        <KPI label="Cheques x cobrar" value={fmtM(totChqProx)} color={G.blue} sub="pendientes"/>
      </div>
      {(sinPatente>0||totExtras>0)&&(
        <Card style={{padding:16,marginBottom:16,border:"1px solid rgba(245,158,11,0.3)"}}>
          <div style={{fontSize:11,color:G.textSub,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:8}}>Alertas</div>
          <div style={{display:"flex",flexDirection:"column",gap:6}}>
            {sinPatente>0&&<div style={{fontSize:13,color:G.amber,fontWeight:700}}>⚠ {sinPatente} gasto(s) sin patente asignada</div>}
            {totExtras>0&&<div style={{fontSize:13,color:G.red,fontWeight:700}}>⚡ {extrasMes.length} gasto(s) extraordinario(s) este mes — {fmt(totExtras)}</div>}
          </div>
        </Card>
      )}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:16}}>
        <Card style={{padding:20}}>
          <div style={{fontWeight:800,color:G.text,fontSize:14,marginBottom:16}}>Últimos 6 meses</div>
          {ultimos6.length===0?<div style={{textAlign:"center",padding:40,color:G.textDim,fontWeight:600}}>Sin datos</div>:(
            <ResponsiveContainer width="100%" height={220}>
              <ComposedChart data={ultimos6} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke={G.cardBorder}/>
                <XAxis dataKey="label" tick={{fill:G.textSub,fontSize:10,fontWeight:600}}/>
                <YAxis tick={{fill:G.textSub,fontSize:9}} tickFormatter={v=>fmtM(v)}/>
                <Tooltip formatter={(v,n)=>[fmt(v),n]} contentStyle={{background:G.card,border:`1px solid ${G.cardBorder}`,borderRadius:8,fontFamily:F,fontWeight:600}}/>
                <Bar dataKey="ingresos" name="Ingresos" fill={G.green} radius={[3,3,0,0]}/>
                <Bar dataKey="egresos" name="Egresos" fill={G.red} radius={[3,3,0,0]}/>
                <Line type="monotone" dataKey="neto" name="Resultado" stroke={G.gold} strokeWidth={2} dot={{fill:G.gold,r:3}}/>
              </ComposedChart>
            </ResponsiveContainer>
          )}
        </Card>
        <Card style={{padding:20}}>
          <div style={{fontWeight:800,color:G.text,fontSize:14,marginBottom:16}}>Ganancia por vendedor — {mesL(mes)}</div>
          {porVendedor.length===0?<div style={{textAlign:"center",padding:40,color:G.textDim,fontWeight:600}}>Sin ventas registradas</div>:(
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={porVendedor} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke={G.cardBorder}/>
                <XAxis type="number" tick={{fill:G.textSub,fontSize:9}} tickFormatter={v=>fmtM(v)}/>
                <YAxis type="category" dataKey="nombre" tick={{fill:G.textSub,fontSize:11,fontWeight:700}} width={60}/>
                <Tooltip formatter={(v)=>[fmt(v),"Ventas"]} contentStyle={{background:G.card,border:`1px solid ${G.cardBorder}`,borderRadius:8,fontFamily:F}}/>
                <Bar dataKey="ventas" fill={G.gold} radius={[0,4,4,0]}/>
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
        <Card style={{padding:20}}>
          <div style={{fontWeight:800,color:G.text,fontSize:14,marginBottom:16}}>Top 5 autos más rentables — {mesL(mes)}</div>
          {top5.length===0?<div style={{textAlign:"center",padding:40,color:G.textDim,fontWeight:600}}>Sin ventas</div>:(
            <div style={{display:"flex",flexDirection:"column",gap:12}}>
              {top5.map((v,i)=>(
                <div key={v.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <div style={{display:"flex",alignItems:"center",gap:12}}>
                    <span style={{color:G.textDim,fontWeight:700,fontSize:11,width:16}}>{i+1}</span>
                    <div><div style={{color:G.text,fontWeight:800,fontSize:13}}>{v.patente}</div><div style={{color:G.textSub,fontSize:11,fontWeight:600}}>{v.descripcion}</div></div>
                  </div>
                  <div style={{textAlign:"right"}}>
                    <div style={{fontFamily:"monospace",fontWeight:800,fontSize:13,color:v.gan>=0?G.green:G.red}}>{fmt(v.gan)}</div>
                    <div style={{fontSize:11,color:G.textSub,fontWeight:600}}>{pct(v.gan,v.pv)} margen</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
        <Card style={{padding:20}}>
          <div style={{fontWeight:800,color:G.text,fontSize:14,marginBottom:16}}>Distribución de gastos — {mesL(mes)}</div>
          {distGastos.length===0?<div style={{textAlign:"center",padding:40,color:G.textDim,fontWeight:600}}>Sin gastos</div>:(
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={distGastos} cx="50%" cy="50%" outerRadius={75} dataKey="value" label={({name,percent})=>`${name} ${(percent*100).toFixed(0)}%`} labelLine={false} fontSize={10}>
                  {distGastos.map((_,i)=><Cell key={i} fill={COLORES[i%COLORES.length]}/>)}
                </Pie>
                <Tooltip formatter={v=>fmt(v)} contentStyle={{background:G.card,border:`1px solid ${G.cardBorder}`,borderRadius:8,fontFamily:F}}/>
              </PieChart>
            </ResponsiveContainer>
          )}
        </Card>
      </div>
    </div>
  );
}

// ─── APP ──────────────────────────────────────────────────────────────────────
const TABS=[
  {id:"dashboard",   label:"Dashboard",      icon:"◎"},
  {id:"registros",   label:"Registros",       icon:"≡"},
  {id:"stock",       label:"Stock",           icon:"⊡"},
  {id:"resultado",   label:"Est. Resultado",  icon:"%"},
  {id:"rentabilidad",label:"Rentabilidad",    icon:"★"},
  {id:"flujo",       label:"Flujo de Fondos", icon:"∿"},
  {id:"cheques",     label:"Cheques",         icon:"✓"},
  {id:"anticipos",   label:"Anticipos",       icon:"👤"},
];

export default function App() {
  const [tab,setTab]=useState("dashboard");
  const [registros,setRegistros]=useState([]);
  const [vehiculos,setVehiculos]=useState([]);
  const [modReg,setModReg]=useState(false);
  const [modVeh,setModVeh]=useState(false);

  const saveRegistro=useCallback(reg=>{
    if(reg._vehNuevo){setVehiculos(p=>p.find(v=>v.id===reg._vehNuevo.id)?p:[...p,reg._vehNuevo]);}
    const {_vehNuevo,...r}=reg;
    setRegistros(p=>[...p,r]);
    if(r.esIngreso){
      if(r.vehiculoId&&r.vehiculoId!=="__na__"){setVehiculos(p=>p.map(v=>v.id===r.vehiculoId?{...v,estado:"Vendido",precioVenta:r.importe,vendedor:r.vendedor,fechaVenta:r.fecha}:v));}
      (r.formas||[]).filter(f=>f.tipo==="Especie (vehículo)"&&f.patente).forEach(f=>{
        setVehiculos(p=>[...p,{id:uid(),patente:f.patente,descripcion:f.descVeh||f.patente,costo:f.importe,tipo:"Parte de pago",fecha:r.fecha,estado:"En stock",operacionOrigenId:r.vehiculoId||r.id,fechaVenta:null,precioVenta:null}]);
      });
    }
  },[]);

  const saveVehiculo=useCallback(async veh=>{
    await supabase.from("vehiculos").insert([localVehToDB(veh)]);
    setVehiculos(p=>[...p,veh]);
    if(veh.tipo==="Compra directa"&&veh.costo){
      const reg={id:uid(),tipo:"Compra de vehículo",fecha:veh.fecha,descripcion:`Compra ${veh.descripcion} — ${veh.patente}`,cuenta:"2.1",vehiculoId:veh.id,importe:parseFloat(veh.costo),esIngreso:false,formas:[],notas:"",vendedor:"",esAnticipo:false,empleadoAnticipo:""};
      await supabase.from("registros").insert([localRegToDB(reg)]);
      setRegistros(p=>[...p,reg]);
    }
  },[]);

  const tabActivo={background:G.goldDim,color:G.gold,border:`1px solid ${G.goldBorder}`,fontWeight:800};
  const tabInactivo={background:"transparent",color:G.textDim,border:"1px solid transparent",fontWeight:600};

  if(loading){return<div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:G.bg,fontFamily:F}}><div style={{textAlign:"center"}}><div style={{width:48,height:48,borderRadius:"50%",border:`3px solid ${G.gold}`,borderTopColor:"transparent",margin:"0 auto 16px",animation:"spin 1s linear infinite"}}/><div style={{color:G.textSub,fontWeight:700,fontSize:14}}>Cargando JP Automotores...</div><style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style></div></div>;}

  return (
    <div style={{minHeight:"100vh",display:"flex",background:G.bg,fontFamily:F,color:G.text}}>
      <aside style={{width:200,background:G.sidebar,borderRight:`1px solid ${G.sidebarBorder}`,display:"flex",flexDirection:"column",minHeight:"100vh",flexShrink:0}}>
        <div style={{padding:"20px 16px",borderBottom:`1px solid ${G.sidebarBorder}`}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <div style={{width:36,height:36,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:900,fontSize:13,color:"#000",fontStyle:"italic",background:`linear-gradient(135deg,${G.gold},${G.goldLight},${G.gold})`,flexShrink:0}}>JP</div>
            <div>
              <div style={{color:G.text,fontWeight:900,fontSize:13,fontStyle:"italic",letterSpacing:"-0.02em",lineHeight:1}}>JP AUTOMOTORES</div>
              <div style={{color:G.textDim,fontSize:10,fontWeight:600,marginTop:2}}>Sistema de gestión</div>
            </div>
          </div>
        </div>
        <nav style={{flex:1,padding:"12px 8px",display:"flex",flexDirection:"column",gap:2}}>
          {TABS.map(t=>(
            <button key={t.id} onClick={()=>setTab(t.id)} style={{width:"100%",textAlign:"left",padding:"9px 12px",borderRadius:8,fontSize:12,cursor:"pointer",display:"flex",alignItems:"center",gap:8,transition:"all 0.15s",fontFamily:F,...(tab===t.id?tabActivo:tabInactivo)}}>
              <span style={{width:16,textAlign:"center"}}>{t.icon}</span>{t.label}
            </button>
          ))}
        </nav>
        <div style={{padding:"12px 16px",borderTop:`1px solid ${G.sidebarBorder}`}}>
          <div style={{fontSize:10,color:G.textDim,fontWeight:600,lineHeight:1.8}}>{registros.length} registros<br/>{vehiculos.filter(v=>v.estado==="En stock").length} en stock<br/>{vehiculos.filter(v=>v.estado==="Vendido").length} vendidos</div>
        </div>
      </aside>
      <main style={{flex:1,overflowY:"auto",background:G.bg}}>
        <div style={{maxWidth:1200,margin:"0 auto",padding:"32px"}}>
          {tab==="dashboard"    && <SecDashboard     registros={registros} vehiculos={vehiculos}/>}
          {tab==="registros"    && <SecRegistros     registros={registros} vehiculos={vehiculos} onNuevo={()=>setModReg(true)} onEliminar={async id=>{await supabase.from('registros').delete().eq('id',id);setRegistros(p=>p.filter(r=>r.id!==id));}}/>}
          {tab==="stock"        && <SecStock         vehiculos={vehiculos} registros={registros} onNuevo={()=>setModVeh(true)}/>}
          {tab==="resultado"    && <SecEstadoResultado registros={registros}/>}
          {tab==="rentabilidad" && <SecRentabilidad  vehiculos={vehiculos} registros={registros}/>}
          {tab==="flujo"        && <SecFlujo         registros={registros}/>}
          {tab==="cheques"      && <SecCheques       registros={registros}/>}
          {tab==="anticipos"    && <SecAnticipos     registros={registros}/>}
        </div>
      </main>
      <ModalRegistro open={modReg} onClose={()=>setModReg(false)} onSave={saveRegistro} vehiculos={vehiculos}/>
      <ModalVehiculo open={modVeh} onClose={()=>setModVeh(false)} onSave={saveVehiculo}/>
    </div>
  );
}
