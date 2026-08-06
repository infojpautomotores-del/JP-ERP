import { useState, useMemo, useCallback, useEffect, Fragment } from "react";
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
  "3.2":  { codigo:"3.2",  nombre:"Publicidad y Marketing",              tipo:"egreso",   grupo:"Gastos de Comercialización", esFijo:false, esExtraordinario:false, esRetiro:false, esAnticipo:false, esVehiculo:false },
  "3.3":  { codigo:"3.3",  nombre:"Ads digitales",                       tipo:"egreso",   grupo:"Gastos de Comercialización", esFijo:false, esExtraordinario:false, esRetiro:false, esAnticipo:false, esVehiculo:false },
  "3.5":  { codigo:"3.5",  nombre:"Gastos de comercialización general",  tipo:"egreso",   grupo:"Gastos de Comercialización", esFijo:false, esExtraordinario:false, esRetiro:false, esAnticipo:false, esVehiculo:false },
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
  "4.14": { codigo:"4.14", nombre:"Movilidad / Uber / Fletes generales", tipo:"egreso",   grupo:"Gastos de Administración",   esFijo:false, esExtraordinario:false, esRetiro:false, esAnticipo:false, esVehiculo:false },
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

const COLORES_VEH = ["Blanco","Negro","Gris","Plata","Rojo","Azul","Verde","Bordó","Naranja","Beige","Otro"];

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


// ─── CREDENCIALES ─────────────────────────────────────────────────────────────
const USUARIOS = [
  { usuario: "joaquin", password: "jp2024", nombre: "Joaquín" },
  { usuario: "admin", password: "jpauto123", nombre: "Admin" },
];

function LoginScreen({onLogin}){
  const [user,setUser]=useState("");
  const [pass,setPass]=useState("");
  const [error,setError]=useState("");
  const intentar=()=>{
    const found=USUARIOS.find(u=>u.usuario===user.toLowerCase()&&u.password===pass);
    if(found){onLogin(found);}else{setError("Usuario o contraseña incorrectos");}
  };
  return(
    <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:G.bg,fontFamily:F}}>
      <div style={{width:380,background:G.card,border:`1px solid ${G.cardBorder}`,borderRadius:24,padding:40,boxShadow:"0 40px 80px rgba(0,0,0,0.8)"}}>
        <div style={{textAlign:"center",marginBottom:32}}>
          <div style={{width:60,height:60,borderRadius:"50%",background:`linear-gradient(135deg,${G.gold},${G.goldLight})`,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 16px",fontSize:20,fontWeight:900,color:"#000",fontStyle:"italic"}}>JP</div>
          <div style={{color:G.text,fontWeight:900,fontSize:20,fontStyle:"italic"}}>JP AUTOMOTORES</div>
          <div style={{color:G.textSub,fontSize:13,fontWeight:600,marginTop:4}}>Sistema de gestión</div>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:16}}>
          <Inp label="Usuario" placeholder="usuario" value={user} onChange={e=>{setUser(e.target.value);setError("");}} onKeyDown={e=>e.key==="Enter"&&intentar()}/>
          <Inp label="Contraseña" type="password" placeholder="••••••••" value={pass} onChange={e=>{setPass(e.target.value);setError("");}} onKeyDown={e=>e.key==="Enter"&&intentar()}/>
          {error&&<div style={{background:"rgba(239,68,68,0.1)",border:"1px solid rgba(239,68,68,0.3)",borderRadius:8,padding:"8px 12px",color:G.red,fontSize:12,fontWeight:600}}>{error}</div>}
          <button onClick={intentar} style={{...s.btnPrimary,width:"100%",padding:"12px",fontSize:14,marginTop:8}}>Ingresar</button>
        </div>
      </div>
    </div>
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
              <input style={s.inp} placeholder="Importe" inputMode="numeric" value={f.importe?parseInt(String(f.importe).replace(/[^0-9]/g,""),10).toLocaleString("es-AR"):""} onChange={e=>upd(f.id,"importe",e.target.value.replace(/[^0-9]/g,""))}/>
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
              <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:8,padding:"10px",background:"rgba(245,197,24,0.05)",border:`1px solid ${G.goldBorder}`,borderRadius:8}}>
                <div style={{fontSize:11,fontWeight:800,color:G.gold,textTransform:"uppercase",letterSpacing:"0.05em"}}>Datos del auto recibido</div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                  <input style={s.inp} placeholder="Patente *" value={f.patente} onChange={e=>upd(f.id,"patente",e.target.value.toUpperCase())}/>
                  <input style={s.inp} placeholder="Marca" value={f.marca||""} onChange={e=>upd(f.id,"marca",e.target.value)}/>
                </div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                  <input style={s.inp} placeholder="Modelo" value={f.modelo||""} onChange={e=>upd(f.id,"modelo",e.target.value)}/>
                  <input style={s.inp} placeholder="Año" inputMode="numeric" value={f.anio||""} onChange={e=>upd(f.id,"anio",e.target.value.replace(/[^0-9]/g,""))}/>
                </div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                  <input style={s.inp} placeholder="Color" value={f.color||""} onChange={e=>upd(f.id,"color",e.target.value)}/>
                  <div style={{fontSize:11,color:G.textDim,alignSelf:"center"}}>Valor: usá el campo "Importe" de arriba</div>
                </div>
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


// Formateador de números para inputs

function NumInp({label,value,onChange,style={},placeholder="0"}){
  const toDisplay=v=>{
    const n=String(v||"").replace(/[^0-9]/g,"");
    return n?parseInt(n,10).toLocaleString("es-AR"):"";
  };
  const [display,setDisplay]=useState(toDisplay(value));
  useEffect(()=>{setDisplay(toDisplay(value));},[value]);
  const handleChange=e=>{
    const raw=e.target.value.replace(/[^0-9]/g,"");
    setDisplay(raw?parseInt(raw,10).toLocaleString("es-AR"):"");
    onChange(raw);
  };
  return<div style={{display:"flex",flexDirection:"column",gap:4}}>
    {label&&<label style={s.lbl}>{label}</label>}
    <input style={{...s.inp,...style}} value={display} onChange={handleChange} placeholder={placeholder} inputMode="numeric"/>
  </div>;
}

// ─── MODAL REGISTRO ───────────────────────────────────────────────────────────
function ModalRegistro({open, onClose, onSave, vehiculos, registroEditar=null}) {
  const TIPOS = ["Venta de vehículo","Compra de vehículo","Gasto por vehículo","Gasto general"];
  const [tipo,setTipo] = useState("Venta de vehículo");
  const [esConsignacion,setEsConsignacion] = useState(false);
  const [fecha,setFecha] = useState(hoy());
  const [desc,setDesc] = useState("");
  const [cuenta,setCuenta] = useState("1.1");
  const [vendedor,setVendedor] = useState("");
  const [importe,setImporte] = useState("");
  const [formas,setFormas] = useState([]);
  const [notas,setNotas] = useState("");
  const [patente,setPatente] = useState("");
  const [estadoPat,setEstadoPat] = useState("idle");
  const [mostrarLista,setMostrarLista] = useState(false);
  const [formVeh,setFormVeh] = useState({descripcion:"",marca:"",modelo:"",anio:"",costo:"",tipoEntrada:"Compra directa"});

  useEffect(()=>{
    if(registroEditar){
      setTipo(registroEditar.tipo||"Gasto general");
      setEsConsignacion(!!registroEditar.esConsignacion);
      setFecha(registroEditar.fecha||hoy());
      setDesc(registroEditar.descripcion||"");
      setCuenta(registroEditar.cuenta||"4.1");
      setVendedor(registroEditar.vendedor||"");
      setImporte(registroEditar.importe?.toString()||"");
      setFormas(registroEditar.formas||[]);
      setNotas(registroEditar.notas||"");
      setPatente("");
      setEstadoPat("idle");
    }
  },[registroEditar]);

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
    setMostrarLista(true);
    setFormVeh({descripcion:"",marca:"",modelo:"",anio:"",costo:"",tipoEntrada:"Compra directa"});
    if(up.length>=5) setEstadoPat(vehiculos.find(v=>v.patente===up)?"encontrado":"no_encontrado");
  };

  const seleccionarVehiculo = v => {
    setPatente(v.patente);
    setEstadoPat("encontrado");
    setMostrarLista(false);
  };

  const vehiculosDisponibles = vehiculos.filter(v=>{
    // Se muestran los que están en stock y también los vendidos, para poder cargar
    // gastos que llegan después de la venta (ej: factura del mecánico a los días)
    if(v.estado!=="En stock"&&v.estado!=="Vendido")return false;
    if(!patente)return true;
    const q=patente.toLowerCase();
    return (v.patente||"").toLowerCase().includes(q)||(v.marca||"").toLowerCase().includes(q)||(v.modelo||"").toLowerCase().includes(q)||(v.descripcion||"").toLowerCase().includes(q);
  }).sort((a,b)=>{
    // Primero los que están en stock, después los vendidos
    if(a.estado!==b.estado)return a.estado==="En stock"?-1:1;
    return 0;
  });

  const reset = () => {
    setTipo("Venta de vehículo");setFecha(hoy());setDesc("");setCuenta("1.1");
    setVendedor("");setImporte("");setFormas([]);setNotas("");
    setPatente("");setEstadoPat("idle");
    setFormVeh({descripcion:"",marca:"",modelo:"",anio:"",costo:"",tipoEntrada:"Compra directa"});
  };

  const getVehId = () => {
    if(estadoPat==="encontrado"&&vehEnStock) return vehEnStock.id;
    if(registroEditar) return registroEditar.vehiculoId||"__na__";
    return "__na__";
  };

  const getVehNuevo = () => {
    if(estadoPat!=="confirmado") return null;
    return {id:uid(),patente,descripcion:formVeh.descripcion,marca:formVeh.marca,modelo:formVeh.modelo,anio:formVeh.anio,costo:formVeh.costo,tipo:formVeh.tipoEntrada,fecha,estado:"En stock",operacionOrigenId:null,fechaVenta:null,precioVenta:null};
  };

  const guardar = () => {
    const r = {id:registroEditar?.id||uid(),tipo,fecha,descripcion:desc,cuenta,vendedor,vehiculoId:getVehId(),notas,importe:imp,formas,esIngreso:esVenta,esAnticipo:PLAN[cuenta]?.esAnticipo||false,empleadoAnticipo:vendedor,esConsignacion:esCompra&&esConsignacion,_vehNuevo:getVehNuevo(),_esEdicion:!!registroEditar};
    onSave(r); if(!registroEditar)reset(); onClose();
  };

  const canSave = fecha&&desc&&cuenta&&((esVenta&&imp>0&&cobrosOk)||(esCompra&&imp>0)||(esGastoVeh&&imp>0)||(esGastoGen&&imp>0));

  const tipoBtn = (t) => ({
    padding:"8px 4px", borderRadius:10, fontSize:12, fontWeight:700, cursor:"pointer", border:"none", fontFamily:F,
    background: tipo===t ? G.gold : G.input,
    color: tipo===t ? "#000" : G.textSub,
  });

  return (
    <Modal open={open} onClose={()=>{if(!registroEditar)reset();onClose();}} title={registroEditar?"Editar Registro":"Nuevo Registro"} size="xl">
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
            <div style={{display:"flex",flexDirection:"column",gap:8,position:"relative"}}>
              <Inp label={esVenta?"Patente vehículo vendido":esCompra?"Patente vehículo comprado":"Patente vehículo asociado"}
                placeholder="Buscá por patente o marca (ej: Ford)" value={patente} maxLength={20}
                style={{textTransform:"uppercase",letterSpacing:"0.1em",fontWeight:700}}
                onChange={e=>handlePatente(e.target.value)}
                onFocus={()=>setMostrarLista(true)}
                onBlur={()=>setTimeout(()=>setMostrarLista(false),150)}/>

              {mostrarLista&&estadoPat!=="encontrado"&&(!esCompra)&&vehiculosDisponibles.length>0&&(
                <div style={{position:"absolute",top:"100%",left:0,right:0,zIndex:20,background:G.card,border:`1px solid ${G.gold}`,borderRadius:10,marginTop:4,maxHeight:220,overflowY:"auto",boxShadow:"0 12px 30px rgba(0,0,0,0.6)"}}>
                  <div style={{padding:"6px 12px",fontSize:10,color:G.textDim,fontWeight:700,textTransform:"uppercase",borderBottom:`1px solid ${G.cardBorder}`}}>Vehículos en stock y vendidos</div>
                  {vehiculosDisponibles.map(v=>(
                    <div key={v.id} onClick={()=>seleccionarVehiculo(v)} style={{padding:"10px 12px",cursor:"pointer",borderBottom:`1px solid ${G.cardBorder}`,display:"flex",justifyContent:"space-between",alignItems:"center",opacity:v.estado==="Vendido"?0.75:1}}
                      onMouseDown={e=>e.preventDefault()}>
                      <div>
                        <span style={{fontFamily:"monospace",fontWeight:800,color:G.gold,marginRight:8}}>{v.patente}</span>
                        <span style={{color:G.text,fontSize:13,fontWeight:600}}>{v.descripcion}</span>
                      </div>
                      <div style={{display:"flex",gap:6,alignItems:"center"}}>
                        {v.tipo==="Consignación"&&<Badge color="blue">Consig.</Badge>}
                        {v.estado==="Vendido"&&<Badge color="gray">Vendido</Badge>}
                      </div>
                    </div>
                  ))}
                </div>
              )}

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
                    <NumInp label="Costo de entrada ($) *" placeholder="0" value={formVeh.costo} onChange={v=>setFormVeh(p=>({...p,costo:v}))}/>
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

        <NumInp label="Importe ($) *" value={importe} onChange={v=>setImporte(v)} placeholder="0"/>
        {esCompra&&<div style={{display:"flex",alignItems:"center",gap:10,padding:"10px 14px",background:"rgba(212,160,23,0.08)",border:"1px solid rgba(212,160,23,0.3)",borderRadius:10}}><input type="checkbox" id="consig" checked={esConsignacion} onChange={e=>setEsConsignacion(e.target.checked)} style={{width:16,height:16,cursor:"pointer",accentColor:G.gold}}/><label htmlFor="consig" style={{color:G.gold,fontWeight:700,fontSize:13,cursor:"pointer"}}>Consignación — recibido para vender, no comprado</label></div>}

        {esVenta&&<FormasPagoForm formas={formas} setFormas={setFormas} total={imp} allowEspecie={true}/>}
        {!esVenta&&<FormasPagoForm formas={formas} setFormas={setFormas} total={imp} allowEspecie={false}/>}

        <Inp label="Notas" placeholder="Observaciones..." value={notas} onChange={e=>setNotas(e.target.value)}/>

        <div style={{display:"flex",gap:12,paddingTop:12,borderTop:`1px solid ${G.cardBorder}`,alignItems:"center",flexWrap:"wrap"}}>
          <Btn onClick={guardar} disabled={!canSave} size="lg">{registroEditar?"Guardar cambios":"Guardar"}</Btn>
          <Btn variant="ghost" onClick={()=>{if(!registroEditar)reset();onClose();}}>Cancelar</Btn>
          {esVenta&&!cobrosOk&&imp>0&&<span style={{fontSize:12,color:G.red,fontWeight:600}}>El total de formas de cobro no cierra</span>}
        </div>
      </div>
    </Modal>
  );
}

// ─── MODAL VEHÍCULO ───────────────────────────────────────────────────────────
function ModalVehiculo({open,onClose,onSave,vehEditar=null,vehiculos=[]}){
  const [f,setF]=useState({patente:"",descripcion:"",marca:"",modelo:"",anio:"",color:"",costo:"",tipo:"Compra directa",fecha:hoy(),notas:"",esConsignacion:false});
  useEffect(()=>{if(vehEditar)setF({patente:vehEditar.patente||"",descripcion:vehEditar.descripcion||"",marca:vehEditar.marca||"",modelo:vehEditar.modelo||"",anio:vehEditar.anio||"",color:vehEditar.color||"",costo:vehEditar.costo?.toString()||"",tipo:vehEditar.tipo||"Compra directa",fecha:vehEditar.fecha||hoy(),notas:vehEditar.notas||"",esConsignacion:vehEditar.tipo==="Consignación"});},[vehEditar]);
  const upd=(k,v)=>setF(p=>({...p,[k]:v}));
  const generarPatenteTemp=()=>{
    // Busca el número más alto usado en patentes TMP- y genera el siguiente
    const usados=vehiculos.filter(v=>/^TMP-\d+$/i.test(v.patente||"")).map(v=>parseInt(v.patente.split("-")[1],10)||0);
    const sig=(usados.length>0?Math.max(...usados):0)+1;
    upd("patente","TMP-"+String(sig).padStart(3,"0"));
  };
  const guardar=()=>{
    const tipoFinal=f.esConsignacion?"Consignación":(f.tipo==="Consignación"?"Compra directa":f.tipo);
    const veh={...(vehEditar||{}),id:vehEditar?.id||uid(),...f,tipo:tipoFinal,estado:vehEditar?.estado||"En stock",operacionOrigenId:vehEditar?.operacionOrigenId||null,fechaVenta:vehEditar?.fechaVenta||null,precioVenta:vehEditar?.precioVenta||null,_esEdicion:!!vehEditar};
    onSave(veh);
    if(!vehEditar)setF({patente:"",descripcion:"",marca:"",modelo:"",anio:"",color:"",costo:"",tipo:"Compra directa",fecha:hoy(),notas:"",esConsignacion:false});
    onClose();
  };
  return<Modal open={open}onClose={onClose}title={vehEditar?"Editar Vehículo":"Alta de vehículo"}size="lg"><div style={{display:"flex",flexDirection:"column",gap:12}}>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
      <div>
        <Inp label="Patente *"value={f.patente}style={{textTransform:"uppercase"}}onChange={e=>upd("patente",e.target.value.toUpperCase())}/>
        <button onClick={generarPatenteTemp} type="button" style={{marginTop:6,background:"transparent",border:`1px solid ${G.inputBorder}`,borderRadius:6,color:G.textSub,padding:"4px 10px",fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:F}}>Sin patente — generar temporal</button>
      </div>
      <Inp label="Descripción *"value={f.descripcion}onChange={e=>upd("descripcion",e.target.value)}/>
    </div>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:12}}><Inp label="Marca"value={f.marca}onChange={e=>upd("marca",e.target.value)}/><Inp label="Modelo"value={f.modelo}onChange={e=>upd("modelo",e.target.value)}/><Inp label="Año"value={f.anio}onChange={e=>upd("anio",e.target.value)}/><Sel label="Color"options={COLORES_VEH.map(c=>({v:c,l:c}))}value={f.color}onChange={e=>upd("color",e.target.value)}/></div>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}><NumInp label="Costo / Precio mínimo ($) *" placeholder="0" value={f.costo} onChange={v=>upd("costo",v)}/><Sel label="Tipo de entrada"options={["Compra directa","Parte de pago"].map(x=>({v:x,l:x}))}value={f.tipo==="Consignación"?"Compra directa":f.tipo}onChange={e=>upd("tipo",e.target.value)}/></div>
    <div style={{display:"flex",alignItems:"center",gap:10,padding:"10px 14px",background:"rgba(59,130,246,0.08)",border:"1px solid rgba(59,130,246,0.3)",borderRadius:10}}>
      <input type="checkbox" id="consigStock" checked={f.esConsignacion} onChange={e=>upd("esConsignacion",e.target.checked)} style={{width:16,height:16,cursor:"pointer",accentColor:G.blue}}/>
      <label htmlFor="consigStock" style={{color:G.blue,fontWeight:700,fontSize:13,cursor:"pointer"}}>Consignación — este vehículo no es propio, fue recibido para vender</label>
    </div>
    <Inp label="Fecha ingreso"type="date"value={f.fecha}onChange={e=>upd("fecha",e.target.value)}/>
    <Inp label="Notas"value={f.notas}onChange={e=>upd("notas",e.target.value)}/>
    <div style={{display:"flex",gap:12,paddingTop:12,borderTop:`1px solid ${G.cardBorder}`}}><Btn onClick={guardar}disabled={!f.patente||!f.descripcion||!f.costo}>{vehEditar?"Guardar cambios":"Dar de alta"}</Btn><Btn variant="ghost"onClick={onClose}>Cancelar</Btn></div>
  </div></Modal>;
}
function calcER(registros, mes, vehiculos=[]) {
  // Solo gastos NO vinculados a vehículos cuentan en el mes en que se cargan (administración, comercialización, etc.)
  // El costo de mercadería (CMV) se reconoce recién cuando el vehículo se VENDE — método "costo de venta"
  const regs = registros.filter(r=>r.fecha?.startsWith(mes)&&!r.esAnticipo);
  const sumG = grupo => regs.filter(r=>PLAN[r.cuenta]?.grupo===grupo&&!r.esIngreso&&!PLAN[r.cuenta]?.esVehiculo).reduce((s,r)=>s+r.importe,0);
  const ingresos=regs.filter(r=>r.esIngreso).reduce((s,r)=>s+r.importe,0);

  // CMV: costo total (compra + acondicionamientos) de los vehículos VENDIDOS este mes
  const vendidosEsteMes = vehiculos.filter(v=>v.estado==="Vendido"&&v.fechaVenta?.startsWith(mes));
  const cmv = vendidosEsteMes.reduce((sum,v)=>{
    const costoCompra = parseFloat(v.costo)||0;
    const acond = registros.filter(r=>r.vehiculoId===v.id&&!r.esIngreso&&PLAN[r.cuenta]?.esVehiculo&&r.cuenta!=="2.1"&&r.cuenta!=="2.2").reduce((s,r)=>s+r.importe,0);
    return sum + costoCompra + acond;
  },0);

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
  Object.values(PLAN).forEach(c=>{
    if(c.esVehiculo){
      detalle[c.codigo]=0; // el costo de vehículo se reconoce activado dentro de CMV, no por cuenta individual
    } else {
      detalle[c.codigo]=regs.filter(r=>r.cuenta===c.codigo).reduce((s,r)=>s+r.importe,0);
    }
  });
  // Detalle de CMV: costo de compra + cada subcuenta de acondicionamiento, solo de los vendidos este mes
  const idsVendidos = vendidosEsteMes.map(v=>v.id);
  const cmvCompra = vendidosEsteMes.reduce((s,v)=>s+(parseFloat(v.costo)||0),0);
  detalle["2.1"]=cmvCompra; // costo de compra agregado de los vendidos este mes
  // Cada acondicionamiento (2.3 a 2.12) desglosado, contando solo los gastos de autos vendidos este mes
  Object.values(PLAN).forEach(c=>{
    if(c.esVehiculo&&c.codigo!=="2.1"&&c.codigo!=="2.2"){
      detalle[c.codigo]=registros.filter(r=>idsVendidos.includes(r.vehiculoId)&&!r.esIngreso&&r.cuenta===c.codigo).reduce((s,r)=>s+r.importe,0);
    }
  });
  const cmvAcond = cmv - cmvCompra;
  detalle["__cmv_acond"]=cmvAcond;
  return {ingresos,cmv,gBruta,comercial,resComercial,admin,ebitda,impositivos,bancarios,resAntesExtr,extraordinarios,resNeto,retiro,resDespRetiro,detalle,regs,vendidosEsteMes};
}

// ─── SECCIONES ────────────────────────────────────────────────────────────────
function SecRegistros({registros,vehiculos,onNuevo,onEliminar,onEditar}) {
  const [filtroTipo,setFiltroTipo]=useState("");
  const [filtroMes,setFiltroMes]=useState("");
  const [busqueda,setBusqueda]=useState("");
  const meses=[...new Set(registros.map(r=>r.fecha?.slice(0,7)))].sort().reverse();
  const filtrados=registros.filter(r=>{
    if(filtroTipo&&r.tipo!==filtroTipo)return false;
    if(filtroMes&&!r.fecha?.startsWith(filtroMes))return false;
    if(busqueda){
      const q=busqueda.toLowerCase();
      const veh=vehiculos.find(v=>v.id===r.vehiculoId);
      const c=PLAN[r.cuenta];
      const campos=[r.descripcion,r.tipo,veh?.patente,veh?.marca,veh?.modelo,c?.codigo,c?.nombre,String(Math.round(r.importe||0)),r.fecha].filter(Boolean).join(" ").toLowerCase();
      if(!campos.includes(q))return false;
    }
    return true;
  }).sort((a,b)=>b.fecha?.localeCompare(a.fecha));
  const tcol={"Venta de vehículo":"gold","Compra de vehículo":"blue","Gasto por vehículo":"amber","Gasto general":"gray"};
  return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:24}}>
        <div><h2 style={{margin:0,color:G.text,fontWeight:900,fontSize:20,fontFamily:F}}>Registro Central</h2><p style={{margin:"4px 0 0",color:G.textSub,fontSize:13,fontWeight:600}}>Base maestra de todos los movimientos</p></div>
        <Btn onClick={onNuevo} size="lg">+ Nuevo registro</Btn>
      </div>
      <Card style={{padding:16,marginBottom:16}}>
        <div style={{position:"relative",marginBottom:12}}>
          <span style={{position:"absolute",left:12,top:"50%",transform:"translateY(-50%)",color:G.textDim,fontSize:15,pointerEvents:"none"}}>🔍</span>
          <input value={busqueda} onChange={e=>setBusqueda(e.target.value)} placeholder="Buscar por descripción, patente, cuenta, monto..." style={{...s.inp,width:"100%",paddingLeft:38,boxSizing:"border-box"}}/>
          {busqueda&&<button onClick={()=>setBusqueda("")} style={{position:"absolute",right:10,top:"50%",transform:"translateY(-50%)",background:"transparent",border:"none",color:G.textDim,cursor:"pointer",fontSize:16,fontFamily:F}}>✕</button>}
        </div>
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
                    <td style={{padding:"12px 12px",textAlign:"right"}}>
                      <div style={{display:"flex",gap:6,justifyContent:"flex-end"}}>
                        <button onClick={()=>onEditar&&onEditar(r)} style={{background:"transparent",border:`1px solid ${G.inputBorder}`,borderRadius:6,color:G.textSub,padding:"3px 8px",fontSize:11,cursor:"pointer",fontFamily:F}}>✎</button>
                        <Btn variant="danger" size="sm" onClick={()=>onEliminar(r.id)}>✕</Btn>
                      </div>
                    </td>
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

function SecStock({vehiculos,registros,onNuevo,onEditar,onEliminar,tiposCambio,guardarTipoCambio}){
  const [filtro,setFiltro]=useState("En stock");
  const [orden,setOrden]=useState("");
  const [mesFoto,setMesFoto]=useState("");
  const [det,setDet]=useState(null);
  const [vistaStock,setVistaStock]=useState("lista");
  const [metricaStock,setMetricaStock]=useState("unidades");
  const [modalTC,setModalTC]=useState(false);
  const [verUSD,setVerUSD]=useState(false);
  const [mesEditTC,setMesEditTC]=useState("");
  const [valorEditTC,setValorEditTC]=useState("");

  const mesActual=hoy().slice(0,7);
  const tcActual=tiposCambio[mesActual]||0;

  // Busca el TC del mes, o el más cercano anterior disponible si no hay uno exacto
  const tcParaMes=(mes)=>{
    if(tiposCambio[mes])return tiposCambio[mes];
    const mesesConTC=Object.keys(tiposCambio).filter(m=>m<=mes).sort();
    if(mesesConTC.length>0)return tiposCambio[mesesConTC[mesesConTC.length-1]];
    return 0;
  };

  const vCC=vehiculos.map(v=>{
    const gs=registros.filter(r=>r.vehiculoId===v.id&&!r.esIngreso&&r.cuenta!=="2.1"&&r.cuenta!=="2.2");
    const acond=gs.reduce((s,r)=>s+r.importe,0);
    const ce=parseFloat(v.costo)||0;
    const costo=ce+acond;
    const gan=v.precioVenta?(parseFloat(v.precioVenta)-costo):null;
    return{...v,acond,costo,gan,gastos:gs};
  });
  const finMesFoto=mesFoto?mesFoto+"-31":null;
  const enStockAFinDe=(v)=>{
    if(!finMesFoto)return true;
    const ing=v.fecha||"";
    if(!ing||ing>finMesFoto)return false;
    const vta=v.fechaVenta||"";
    if(v.estado==="Vendido"&&vta&&vta<=finMesFoto)return false;
    return true;
  };
  const lista=vCC.filter(v=>{
    if(mesFoto){
      if(!enStockAFinDe(v))return false;
      if(filtro==="Consignación")return v.tipo==="Consignación";
      if(filtro==="En stock")return v.tipo!=="Consignación";
      return true;
    }
    if(!filtro)return true;
    if(filtro==="Consignación")return v.estado==="En stock"&&v.tipo==="Consignación";
    if(filtro==="En stock")return v.estado==="En stock"&&v.tipo!=="Consignación";
    return v.estado===filtro;
  }).sort((a,b)=>{
    if(orden==="marca")return (a.marca||a.descripcion||"").localeCompare(b.marca||b.descripcion||"");
    if(orden==="costo")return b.costo-a.costo;
    if(orden==="anio")return (b.anio||"").localeCompare(a.anio||"");
    return 0;
  });
  const valorStock=vCC.filter(v=>v.estado==="En stock").reduce((s,v)=>s+v.costo,0);
  const propios=vCC.filter(v=>v.estado==="En stock"&&v.tipo!=="Consignación");
  const consignados=vCC.filter(v=>v.estado==="En stock"&&v.tipo==="Consignación");
  const valorPropios=propios.reduce((s,v)=>s+v.costo,0);
  const valorConsignados=consignados.reduce((s,v)=>s+v.costo,0);
  const ecol={"En stock":"gold","Reservado":"amber","Vendido":"gray","Consignación":"blue"};
  const fmtUsd=(v,mes=mesActual)=>{const tc=tcParaMes(mes);return tc>0?"US$ "+Math.round(v/tc).toLocaleString("es-AR"):"—";};

  const evolucion=useMemo(()=>{
    const meses=[...new Set([...registros.map(r=>r.fecha?.slice(0,7)),...vehiculos.map(v=>v.fecha?.slice(0,7)),...vehiculos.filter(v=>v.fechaVenta).map(v=>v.fechaVenta?.slice(0,7))])].filter(Boolean).sort();
    return meses.map(mes=>{
      const enStockMes=vehiculos.filter(v=>{const ing=v.fecha?.slice(0,7)<=mes;const vend=v.fechaVenta&&v.fechaVenta?.slice(0,7)<=mes;return ing&&!vend;});
      const propiosMes=enStockMes.filter(v=>v.tipo!=="Consignación");
      const consigMes=enStockMes.filter(v=>v.tipo==="Consignación");
      const impPropios=propiosMes.reduce((s,v)=>s+(parseFloat(v.costo)||0),0);
      const impConsig=consigMes.reduce((s,v)=>s+(parseFloat(v.costo)||0),0);
      const tcMes=tcParaMes(mes);
      return{label:mesL(mes),mes,unidades:enStockMes.length,importe:impPropios+impConsig,propios:propiosMes.length,consignacion:consigMes.length,importePropios:impPropios,importeConsig:impConsig,tcMes,usdPropios:tcMes>0?impPropios/tcMes:0,usdConsig:tcMes>0?impConsig/tcMes:0,usdTotal:tcMes>0?(impPropios+impConsig)/tcMes:0};
    });
  },[vehiculos,registros,tiposCambio]);

  const porModelo=useMemo(()=>{const map={};vehiculos.filter(v=>v.estado==="Vendido").forEach(v=>{const k=v.modelo||"Sin modelo";if(!map[k])map[k]={nombre:k,cantidad:0,ganancia:0};const gs=registros.filter(r=>r.vehiculoId===v.id&&!r.esIngreso&&r.cuenta!=="2.1"&&r.cuenta!=="2.2").reduce((s,r)=>s+r.importe,0);const ct=(parseFloat(v.costo)||0)+gs;map[k].cantidad++;map[k].ganancia+=((parseFloat(v.precioVenta)||0)-ct);});return Object.values(map).sort((a,b)=>b.cantidad-a.cantidad);},[vehiculos,registros]);
  const porColor=useMemo(()=>{const map={};vehiculos.filter(v=>v.estado==="Vendido"&&v.color).forEach(v=>{const k=v.color;if(!map[k])map[k]={nombre:k,cantidad:0};map[k].cantidad++;});return Object.values(map).sort((a,b)=>b.cantidad-a.cantidad);},[vehiculos]);

  const mesesOrdenados=Object.keys(tiposCambio).sort().reverse();
  const guardarTC=()=>{
    if(!mesEditTC||!valorEditTC)return;
    guardarTipoCambio(mesEditTC,valorEditTC);
    setMesEditTC("");setValorEditTC("");
  };

  return<div>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:24,flexWrap:"wrap",gap:12}}>
      <div><h2 style={{margin:0,color:G.text,fontWeight:900,fontSize:20,fontFamily:F}}>Stock de Vehículos</h2></div>
      <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
        {[{v:"lista",l:"Lista"},{v:"evolucion",l:"Evolución"},{v:"metricas",l:"Métricas"}].map(t=><button key={t.v}onClick={()=>setVistaStock(t.v)}style={{padding:"8px 16px",borderRadius:10,fontSize:12,fontWeight:700,border:"none",cursor:"pointer",fontFamily:F,background:vistaStock===t.v?G.gold:G.input,color:vistaStock===t.v?"#000":G.textSub}}>{t.l}</button>)}
        <Btn variant="ghost" onClick={()=>setModalTC(true)}>💵 {tcActual>0?`$${tcActual.toLocaleString("es-AR")}`:"Tipos de cambio"}</Btn>
        <Btn onClick={onNuevo}>+ Alta</Btn>
      </div>
    </div>

    {tcActual>0&&<div style={{marginBottom:16}}>
      <button onClick={()=>setVerUSD(p=>!p)} style={{padding:"6px 14px",borderRadius:8,fontSize:12,fontWeight:700,border:`1px solid ${G.inputBorder}`,cursor:"pointer",fontFamily:F,background:verUSD?G.blue:"transparent",color:verUSD?"#fff":G.textSub}}>{verUSD?"✓ ":""}Mostrar valores en USD (TC del mes actual: {tcActual.toLocaleString("es-AR")})</button>
    </div>}

    <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:12}}>
      <KPI label="Stock total" value={`${vCC.filter(v=>v.estado==="En stock").length} autos`} color={G.text} sub={verUSD&&tcActual>0?fmtUsd(valorStock):fmt(valorStock)}/>
      <KPI label="Propios" value={`${propios.length} autos`} color={G.gold} sub={`Capital ${verUSD&&tcActual>0?fmtUsd(valorPropios):fmt(valorPropios)}`}/>
      <KPI label="Consignación" value={`${consignados.length} autos`} color={G.blue} sub={`Capital ${verUSD&&tcActual>0?fmtUsd(valorConsignados):fmt(valorConsignados)}`}/>
      <KPI label="Vendidos" value={`${vCC.filter(v=>v.estado==="Vendido").length} autos`} color={G.textSub}/>
    </div>

    {(propios.length+consignados.length)>0&&<Card style={{padding:16,marginBottom:16}}>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
        <div>
          <div style={{fontSize:11,color:G.textSub,fontWeight:700,textTransform:"uppercase",marginBottom:8}}>Distribución por tenencia</div>
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:6}}>
            <div style={{flex:1,height:10,borderRadius:5,background:G.input,overflow:"hidden"}}><div style={{height:"100%",background:G.gold,width:`${Math.round(propios.length/(propios.length+consignados.length)*100)}%`}}/></div>
            <span style={{fontSize:12,color:G.gold,fontWeight:700,minWidth:80}}>{propios.length} propios ({Math.round(propios.length/(propios.length+consignados.length)*100)}%)</span>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <div style={{flex:1,height:10,borderRadius:5,background:G.input,overflow:"hidden"}}><div style={{height:"100%",background:G.blue,width:`${Math.round(consignados.length/(propios.length+consignados.length)*100)}%`}}/></div>
            <span style={{fontSize:12,color:G.blue,fontWeight:700,minWidth:80}}>{consignados.length} consignación ({Math.round(consignados.length/(propios.length+consignados.length)*100)}%)</span>
          </div>
        </div>
        <div>
          <div style={{fontSize:11,color:G.textSub,fontWeight:700,textTransform:"uppercase",marginBottom:8}}>Capital comprometido {verUSD&&tcActual>0?"(USD)":"(ARS)"}</div>
          <div style={{display:"flex",justifyContent:"space-between",padding:"4px 0"}}><span style={{color:G.gold,fontSize:12,fontWeight:600}}>Capital propio</span><span style={{fontFamily:"monospace",fontWeight:700,color:G.gold}}>{verUSD&&tcActual>0?fmtUsd(valorPropios):fmt(valorPropios)}</span></div>
          <div style={{display:"flex",justifyContent:"space-between",padding:"4px 0"}}><span style={{color:G.blue,fontSize:12,fontWeight:600}}>En consignación</span><span style={{fontFamily:"monospace",fontWeight:700,color:G.blue}}>{verUSD&&tcActual>0?fmtUsd(valorConsignados):fmt(valorConsignados)}</span></div>
          <div style={{display:"flex",justifyContent:"space-between",padding:"6px 0 0",borderTop:`1px solid ${G.cardBorder}`,marginTop:4}}><span style={{color:G.text,fontSize:12,fontWeight:800}}>Total</span><span style={{fontFamily:"monospace",fontWeight:900,color:G.text}}>{verUSD&&tcActual>0?fmtUsd(valorStock):fmt(valorStock)}</span></div>
        </div>
      </div>
    </Card>}

    {vistaStock==="lista"&&<>
      <Card style={{padding:12,marginBottom:16}}>
        <div style={{display:"flex",gap:8,alignItems:"center",justifyContent:"space-between",flexWrap:"wrap"}}>
          <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>{["","En stock","Consignación","Reservado","Vendido"].map(e=><button key={e}onClick={()=>setFiltro(e)}style={{padding:"6px 16px",borderRadius:8,fontSize:12,fontWeight:700,border:"none",cursor:"pointer",fontFamily:F,background:filtro===e?G.gold:G.input,color:filtro===e?"#000":G.textSub}}>{e||"Todos"}</button>)}</div>
          <div style={{display:"flex",gap:8,alignItems:"center"}}>
            <select value={mesFoto} onChange={e=>setMesFoto(e.target.value)} style={{...s.inp,maxWidth:200}} title="Ver el stock que tenías a fin de un mes">
              <option value="">Stock actual (hoy)</option>
              {[...new Set(vehiculos.map(v=>v.fecha?.slice(0,7)).filter(Boolean))].sort().reverse().map(m=><option key={m} value={m}>Foto a fin de {mesL(m)}</option>)}
            </select>
            <select value={orden} onChange={e=>setOrden(e.target.value)} style={{...s.inp,maxWidth:180}}>
              <option value="">Orden: por defecto</option>
              <option value="marca">Ordenar por marca (A-Z)</option>
              <option value="costo">Ordenar por costo (mayor)</option>
              <option value="anio">Ordenar por año (nuevo)</option>
            </select>
          </div>
        </div>
      </Card>
      {mesFoto&&<div style={{background:"rgba(59,130,246,0.1)",border:`1px solid ${G.blue}`,borderRadius:8,padding:"8px 14px",marginBottom:12,fontSize:12,color:G.blue,fontWeight:600}}>📸 Foto del stock a fin de {mesL(mesFoto)} — {lista.length} vehículo(s), reconstruido según fechas de ingreso y venta.</div>}
      <Card>
        <div style={{overflowX:"auto"}}>
          <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
            <thead><tr style={{borderBottom:`1px solid ${G.cardBorder}`}}>{["Patente","Descripción","Tenencia","Color","Año","Costo",...(tcActual>0?["USD"]:[]),"Acond.","Total","Venta","Ganancia","Estado",""].map(h=><th key={h}style={{padding:"10px",textAlign:["Costo","USD","Acond.","Total","Venta","Ganancia"].includes(h)?"right":"left",color:G.textSub,fontWeight:700,fontSize:10,textTransform:"uppercase"}}>{h}</th>)}</tr></thead>
            <tbody>
              {lista.length===0&&<tr><td colSpan={13}style={{textAlign:"center",padding:40,color:G.textDim,fontWeight:600}}>Sin vehículos</td></tr>}
              {lista.map(v=><tr key={v.id}style={{borderBottom:`1px solid ${G.cardBorder}`,cursor:"pointer"}}onClick={()=>setDet(v)}>
                <td style={{padding:"10px",fontFamily:"monospace",color:G.text,fontWeight:800}}>{v.patente}</td>
                <td style={{padding:"10px",color:G.text,fontWeight:600}}>{v.descripcion}</td>
                <td style={{padding:"10px"}}><Badge color={v.tipo==="Consignación"?"blue":"gold"}>{v.tipo==="Consignación"?"Consig.":"Propio"}</Badge></td>
                <td style={{padding:"10px",color:G.textSub,fontSize:11}}>{v.color||"—"}</td>
                <td style={{padding:"10px",color:G.textSub,fontSize:11}}>{v.anio||"—"}</td>
                <td style={{padding:"10px",textAlign:"right",fontFamily:"monospace",color:G.textSub,fontWeight:600}}>{fmt(parseFloat(v.costo)||0)}</td>
                {tcActual>0&&<td style={{padding:"10px",textAlign:"right",fontFamily:"monospace",color:G.blue,fontWeight:600,fontSize:11}}>{fmtUsd(v.costo,v.fecha?.slice(0,7))}</td>}
                <td style={{padding:"10px",textAlign:"right",fontFamily:"monospace",color:G.amber,fontWeight:700}}>{v.acond>0?fmt(v.acond):"—"}</td>
                <td style={{padding:"10px",textAlign:"right",fontFamily:"monospace",color:G.text,fontWeight:800}}>{fmt(v.costo)}</td>
                <td style={{padding:"10px",textAlign:"right",fontFamily:"monospace",color:G.green,fontWeight:700}}>{v.precioVenta?fmt(v.precioVenta):"—"}</td>
                <td style={{padding:"10px",textAlign:"right",fontFamily:"monospace",fontWeight:800,color:v.gan>0?G.green:v.gan<0?G.red:G.textSub}}>{v.gan!==null?fmt(v.gan):"—"}</td>
                <td style={{padding:"10px"}}><Badge color={ecol[v.estado]}>{v.estado}</Badge></td>
                <td style={{padding:"10px"}}>
                  <div style={{display:"flex",gap:6}}>
                    <button onClick={e=>{e.stopPropagation();onEditar&&onEditar(v);}}style={{...s.btnGhost,padding:"4px 10px",fontSize:11}}>✎</button>
                    <button onClick={e=>{e.stopPropagation();if(window.confirm(`¿Eliminar ${v.patente||"este auto"}?\n\nSe borrará el auto y sus registros asociados (compra, acondicionamientos). Esta acción no se puede deshacer.`))onEliminar&&onEliminar(v);}}style={{background:"transparent",border:`1px solid ${G.red}`,borderRadius:6,color:G.red,padding:"4px 10px",fontSize:11,cursor:"pointer",fontFamily:F}}>✕</button>
                  </div>
                </td>
              </tr>)}
            </tbody>
          </table>
        </div>
      </Card>
    </>}

    {vistaStock==="evolucion"&&<>
      <Card style={{padding:20,marginBottom:16}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16,flexWrap:"wrap",gap:8}}>
          <div style={{fontWeight:800,color:G.text,fontSize:14}}>Evolución del stock — propios vs consignación</div>
          <div style={{display:"flex",gap:8}}>
            {[{v:"unidades",l:"Unidades"},{v:"importe",l:"Importe ARS"},...(mesesOrdenados.length>0?[{v:"usd",l:"Importe USD"}]:[])].map(t=><button key={t.v}onClick={()=>setMetricaStock(t.v)}style={{padding:"6px 14px",borderRadius:8,fontSize:12,fontWeight:700,border:"none",cursor:"pointer",fontFamily:F,background:metricaStock===t.v?G.gold:G.input,color:metricaStock===t.v?"#000":G.textSub}}>{t.l}</button>)}
          </div>
        </div>
        {evolucion.length===0?<div style={{textAlign:"center",padding:40,color:G.textDim}}>Sin datos</div>:(
          <ResponsiveContainer width="100%"height={300}>
            <ComposedChart data={evolucion}>
              <CartesianGrid strokeDasharray="3 3"stroke={G.cardBorder}/>
              <XAxis dataKey="label"tick={{fill:G.textSub,fontSize:11}}/>
              <YAxis tick={{fill:G.textSub,fontSize:10}}tickFormatter={v=>metricaStock==="unidades"?v:(metricaStock==="usd"?"US$"+fmtM(v).replace("$",""):fmtM(v))}/>
              <Tooltip formatter={(v,n,p)=>{
                const d=p&&p.payload?p.payload:{};
                const tot=metricaStock==="importe"?(d.importe||0):metricaStock==="usd"?(d.usdTotal||0):(d.unidades||0);
                const pc=tot>0&&n!=="Total"?` (${Math.round(v/tot*100)}%)`:"";
                if(metricaStock==="unidades")return [`${v} uni${pc}`,n];
                if(metricaStock==="usd")return [`US$ ${Math.round(v).toLocaleString("es-AR")}${pc}`,n];
                return [`${fmt(v)}${pc}`,n];
              }} contentStyle={{background:G.card,border:`1px solid ${G.cardBorder}`,borderRadius:8,fontFamily:F}} labelStyle={{color:G.text,fontWeight:700}}/>
              <Legend wrapperStyle={{fontSize:12,color:G.textSub}}/>
              <Bar dataKey={metricaStock==="importe"?"importePropios":metricaStock==="usd"?"usdPropios":"propios"} name="Propios" fill={G.gold} stackId="a"/>
              <Bar dataKey={metricaStock==="importe"?"importeConsig":metricaStock==="usd"?"usdConsig":"consignacion"} name="Consignación" fill={G.blue} stackId="a"/>
              <Line type="monotone"dataKey={metricaStock==="importe"?"importe":metricaStock==="usd"?"usdTotal":"unidades"} name="Total" stroke={G.goldLight}strokeWidth={2}dot={{fill:G.gold,r:3}}/>
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </Card>
      {mesesOrdenados.length===0&&<Card style={{padding:16,background:"rgba(59,130,246,0.08)",border:"1px solid rgba(59,130,246,0.3)"}}>
        <span style={{color:G.blue,fontSize:12,fontWeight:600}}>💵 Cargá tipos de cambio mensuales (botón arriba) para ver también la evolución en dólares, calculada con el dólar real de cada mes.</span>
      </Card>}
    </>}

    {vistaStock==="metricas"&&<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
      <Card style={{padding:20}}>
        <div style={{fontWeight:800,color:G.text,fontSize:14,marginBottom:16}}>Ventas por modelo</div>
        {porModelo.length===0?<div style={{color:G.textDim,fontSize:13}}>Sin datos</div>:porModelo.map((m,i)=><div key={m.nombre}style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 0",borderBottom:`1px solid ${G.cardBorder}`}}>
          <div style={{display:"flex",alignItems:"center",gap:8}}><div style={{width:8,height:8,borderRadius:"50%",background:COLORES[i%COLORES.length]}}/><span style={{color:G.text,fontWeight:600,fontSize:13}}>{m.nombre}</span></div>
          <div style={{textAlign:"right"}}><div style={{color:G.gold,fontWeight:700,fontSize:13}}>{m.cantidad} vendidos</div><div style={{color:G.green,fontSize:11,fontWeight:600}}>{fmt(m.ganancia)} ganancia</div></div>
        </div>)}
      </Card>
      <Card style={{padding:20}}>
        <div style={{fontWeight:800,color:G.text,fontSize:14,marginBottom:16}}>Ventas por color</div>
        {porColor.length===0?<div style={{color:G.textDim,fontSize:13}}>Sin datos</div>:(
          <ResponsiveContainer width="100%"height={220}>
            <PieChart><Pie data={porColor}cx="50%"cy="50%"outerRadius={80}dataKey="cantidad"label={({name,percent})=>`${name} ${(percent*100).toFixed(0)}%`}labelLine={false}fontSize={11}>{porColor.map((_,i)=><Cell key={i}fill={COLORES[i%COLORES.length]}/>)}</Pie><Tooltip formatter={v=>`${v} vendidos`}contentStyle={{background:G.card,border:`1px solid ${G.cardBorder}`,borderRadius:8,fontFamily:F}}/></PieChart>
          </ResponsiveContainer>
        )}
      </Card>
    </div>}

    <Modal open={modalTC} onClose={()=>setModalTC(false)} title="Tipos de cambio por mes" size="md">
      <div style={{display:"flex",flexDirection:"column",gap:16}}>
        <div style={{color:G.textSub,fontSize:13,fontWeight:600}}>Cargá el valor del dólar de cada mes. El sistema usa el tipo de cambio correspondiente a cada mes histórico para calcular la evolución en USD con precisión.</div>
        <div style={{background:G.input,borderRadius:12,padding:16}}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr auto",gap:8,alignItems:"end"}}>
            <Inp label="Mes" type="month" value={mesEditTC} onChange={e=>setMesEditTC(e.target.value)}/>
            <NumInp label="Tipo de cambio ($ por US$)" value={valorEditTC} onChange={v=>setValorEditTC(v)} placeholder="0"/>
            <Btn onClick={guardarTC} disabled={!mesEditTC||!valorEditTC}>Guardar</Btn>
          </div>
        </div>
        {mesesOrdenados.length>0&&<div>
          <div style={{fontWeight:700,color:G.textSub,fontSize:11,textTransform:"uppercase",marginBottom:8}}>Tipos de cambio cargados</div>
          {mesesOrdenados.map(m=><div key={m} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 12px",background:G.input,borderRadius:8,marginBottom:4}}>
            <span style={{color:G.text,fontWeight:600}}>{mesL(m)}</span>
            <div style={{display:"flex",gap:12,alignItems:"center"}}>
              <span style={{color:G.gold,fontWeight:700,fontFamily:"monospace"}}>${tiposCambio[m].toLocaleString("es-AR")}</span>
              <button onClick={()=>{setMesEditTC(m);setValorEditTC(tiposCambio[m].toString());}} style={{...s.btnGhost,padding:"4px 10px",fontSize:11}}>✎</button>
            </div>
          </div>)}
        </div>}
        <div style={{paddingTop:8,borderTop:`1px solid ${G.cardBorder}`}}><Btn onClick={()=>setModalTC(false)}>Listo</Btn></div>
      </div>
    </Modal>

    <Modal open={!!det}onClose={()=>setDet(null)}title={`${det?.patente} — ${det?.descripcion}`}size="lg">
      {det&&<div style={{display:"flex",flexDirection:"column",gap:12}}>
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8}}>
          {[["Color",det.color||"—",G.textSub],["Año",det.anio||"—",G.textSub],["Modelo",det.modelo||"—",G.textSub],["Tenencia",det.tipo==="Consignación"?"Consignación":"Propio",det.tipo==="Consignación"?G.blue:G.gold]].map(([l,v,c])=><div key={l}style={{background:G.input,borderRadius:10,padding:10}}><div style={{fontSize:10,color:G.textSub,fontWeight:700,marginBottom:2}}>{l}</div><div style={{fontWeight:700,color:c,fontSize:13}}>{v}</div></div>)}
        </div>
        <div style={{display:"grid",gridTemplateColumns:tcParaMes(det.fecha?.slice(0,7))>0?"1fr 1fr 1fr 1fr":"1fr 1fr 1fr",gap:12}}>
          {[["Costo/Precio mínimo",fmt(parseFloat(det.costo)||0),G.textSub],["Acondicionamiento",fmt(det.acond),G.amber],["Costo total",fmt(det.costo),G.text],...(tcParaMes(det.fecha?.slice(0,7))>0?[["Costo total USD",fmtUsd(det.costo,det.fecha?.slice(0,7)),G.blue]]:[])].map(([l,v,c])=><div key={l}style={{background:G.input,borderRadius:10,padding:12}}><div style={{fontSize:11,color:G.textSub,fontWeight:700,marginBottom:4}}>{l}</div><div style={{fontWeight:800,color:c,fontSize:15}}>{v}</div></div>)}
        </div>
        {det.gan!==null&&<div style={{background:det.gan>=0?"rgba(34,197,94,0.08)":"rgba(239,68,68,0.08)",border:`1px solid ${det.gan>=0?"rgba(34,197,94,0.3)":"rgba(239,68,68,0.3)"}`,borderRadius:10,padding:"10px 14px",display:"flex",justifyContent:"space-between"}}>
          <span style={{fontSize:13,color:G.textSub,fontWeight:600}}>Ganancia neta</span>
          <span style={{fontWeight:800,color:det.gan>=0?G.green:G.red}}>{fmt(det.gan)} ({pct(det.gan,parseFloat(det.precioVenta))})</span>
        </div>}
        {det.gastos.length>0&&<div><div style={{fontSize:11,color:G.textSub,fontWeight:700,textTransform:"uppercase",marginBottom:8}}>Gastos de acondicionamiento</div>
          {det.gastos.map(g=><div key={g.id}style={{display:"flex",justifyContent:"space-between",padding:"8px 0",borderBottom:`1px solid ${G.cardBorder}`}}>
            <div><div style={{color:G.text,fontSize:13,fontWeight:600}}>{g.descripcion}</div><div style={{color:G.textDim,fontSize:11}}>{fmtF(g.fecha)} · {PLAN[g.cuenta]?.nombre}</div></div>
            <span style={{fontFamily:"monospace",color:G.amber,fontWeight:700}}>{fmt(g.importe)}</span>
          </div>)}
        </div>}
      </div>}
    </Modal>
  </div>;
}

function ReporteGerencia({er,erMeses,mes,onClose}){
  const fmtR=n=>{const x=Math.round(n||0);return (x<0?"-":"")+"$ "+Math.abs(x).toLocaleString("es-AR");};
  const pctIng=v=>er.ingresos>0?(v/er.ingresos*100).toFixed(1)+"%":"—";
  const lineas=[
    {l:"Ingresos totales",v:er.ingresos,tipo:"ingreso"},
    {l:"Costo de Mercadería (CMV)",v:-er.cmv,tipo:"costo"},
    {l:"GANANCIA BRUTA",v:er.gBruta,tipo:"subtotal"},
    {l:"Gastos de Comercialización",v:-er.comercial,tipo:"costo"},
    {l:"RESULTADO COMERCIAL",v:er.resComercial,tipo:"subtotal"},
    {l:"Gastos de Administración",v:-er.admin,tipo:"costo"},
    {l:"EBITDA / Resultado Operativo",v:er.ebitda,tipo:"subtotal"},
    {l:"Gastos Impositivos",v:-er.impositivos,tipo:"costo"},
    {l:"Gastos Bancarios",v:-er.bancarios,tipo:"costo"},
    {l:"Resultado antes de Extraordinarios",v:er.resAntesExtr,tipo:"subtotal"},
    {l:"Resultados Extraordinarios",v:-er.extraordinarios,tipo:"costo"},
    {l:"RESULTADO NETO",v:er.resNeto,tipo:"final"},
  ];
  const filasComp=[
    {k:"ingresos",l:"Ingresos"},{k:"cmv",l:"CMV",neg:true},{k:"gBruta",l:"Ganancia Bruta",sub:true},
    {k:"comercial",l:"G. Comercialización",neg:true},{k:"admin",l:"G. Administración",neg:true},
    {k:"ebitda",l:"EBITDA",sub:true},{k:"impositivos",l:"G. Impositivos",neg:true},
    {k:"bancarios",l:"G. Bancarios",neg:true},{k:"resNeto",l:"Resultado Neto",sub:true},
  ];
  const hoyStr=new Date().toLocaleDateString("es-AR");
  return (
    <div style={{position:"fixed",inset:0,background:"#fff",zIndex:9999,overflow:"auto"}} id="reporte-print">
      <div className="no-print" style={{position:"sticky",top:0,background:"#1a1a1a",padding:"12px 24px",display:"flex",justifyContent:"space-between",alignItems:"center",zIndex:2}}>
        <span style={{color:"#fff",fontWeight:700,fontFamily:F,fontSize:14}}>Vista previa del reporte</span>
        <div style={{display:"flex",gap:8}}>
          <button onClick={()=>window.print()} style={{padding:"8px 18px",borderRadius:8,fontWeight:700,border:"none",cursor:"pointer",fontFamily:F,background:"#d4a017",color:"#000"}}>🖨 Imprimir / Guardar PDF</button>
          <button onClick={onClose} style={{padding:"8px 18px",borderRadius:8,fontWeight:700,border:"1px solid #555",cursor:"pointer",fontFamily:F,background:"transparent",color:"#fff"}}>Cerrar</button>
        </div>
      </div>
      {/* HOJA 1 - Estado de Resultado */}
      <div style={{maxWidth:800,margin:"0 auto",padding:"40px 48px",fontFamily:F,color:"#1a1a1a",boxSizing:"border-box"}} className="hoja">
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end",borderBottom:"3px solid #d4a017",paddingBottom:16,marginBottom:24}}>
          <div>
            <div style={{fontSize:26,fontWeight:900,letterSpacing:"-0.02em"}}>JP AUTOMOTORES</div>
            <div style={{fontSize:14,color:"#666",fontWeight:600,marginTop:2}}>Estado de Resultado</div>
          </div>
          <div style={{textAlign:"right",fontSize:12,color:"#666"}}>
            <div style={{fontWeight:800,fontSize:15,color:"#1a1a1a"}}>{mesL(mes)}</div>
            <div>Emitido: {hoyStr}</div>
          </div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12,marginBottom:28}}>
          {[["Ganancia Bruta",er.gBruta],["EBITDA",er.ebitda],["Resultado Neto",er.resNeto]].map(([l,v])=>(
            <div key={l} style={{border:"1px solid #ddd",borderRadius:8,padding:"14px 16px",background:"#fafafa"}}>
              <div style={{fontSize:11,color:"#888",fontWeight:700,textTransform:"uppercase",letterSpacing:"0.03em"}}>{l}</div>
              <div style={{fontSize:20,fontWeight:900,marginTop:4,color:v>=0?"#15803d":"#dc2626"}}>{fmtR(v)}</div>
              <div style={{fontSize:11,color:"#999",marginTop:2}}>{pctIng(v)} de ingresos</div>
            </div>
          ))}
        </div>
        <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
          <thead>
            <tr style={{background:"#1a1a1a",color:"#fff"}}>
              <th style={{textAlign:"left",padding:"10px 14px",fontWeight:700}}>Concepto</th>
              <th style={{textAlign:"right",padding:"10px 14px",fontWeight:700}}>Monto</th>
              <th style={{textAlign:"right",padding:"10px 14px",fontWeight:700,width:80}}>% Ing.</th>
            </tr>
          </thead>
          <tbody>
            {lineas.map((ln,i)=>{
              const esSub=ln.tipo==="subtotal",esFinal=ln.tipo==="final";
              return <tr key={i} style={{background:esFinal?"#1a1a1a":esSub?"#f0ede4":"#fff",borderBottom:"1px solid #eee"}}>
                <td style={{padding:esFinal||esSub?"11px 14px":"8px 14px",fontWeight:esFinal||esSub?800:500,color:esFinal?"#fff":"#1a1a1a",fontSize:esFinal?14:13}}>{ln.l}</td>
                <td style={{padding:esFinal||esSub?"11px 14px":"8px 14px",textAlign:"right",fontFamily:"monospace",fontWeight:esFinal||esSub?800:600,color:esFinal?(ln.v>=0?"#4ade80":"#f87171"):ln.tipo==="ingreso"?"#15803d":ln.tipo==="costo"?"#dc2626":ln.v>=0?"#15803d":"#dc2626"}}>{fmtR(ln.v)}</td>
                <td style={{padding:esFinal||esSub?"11px 14px":"8px 14px",textAlign:"right",fontSize:11,color:esFinal?"#ccc":"#888",fontWeight:600}}>{pctIng(Math.abs(ln.v))}</td>
              </tr>;
            })}
          </tbody>
        </table>
        <div style={{marginTop:20,fontSize:10,color:"#aaa",textAlign:"center"}}>JP Automotores — Sistema de gestión · CMV reconocido por costo de venta</div>
      </div>
      {/* HOJA 2 - Comparativo */}
      <div style={{maxWidth:900,margin:"0 auto",padding:"40px 48px",fontFamily:F,color:"#1a1a1a",boxSizing:"border-box"}} className="hoja hoja-nueva">
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end",borderBottom:"3px solid #d4a017",paddingBottom:16,marginBottom:24}}>
          <div>
            <div style={{fontSize:26,fontWeight:900,letterSpacing:"-0.02em"}}>JP AUTOMOTORES</div>
            <div style={{fontSize:14,color:"#666",fontWeight:600,marginTop:2}}>Comparativo mensual</div>
          </div>
          <div style={{textAlign:"right",fontSize:12,color:"#666"}}>
            <div style={{fontWeight:800,fontSize:15,color:"#1a1a1a"}}>Últimos {erMeses.length} meses</div>
            <div>Emitido: {hoyStr}</div>
          </div>
        </div>
        <table style={{width:"100%",borderCollapse:"collapse",fontSize:11}}>
          <thead>
            <tr style={{background:"#1a1a1a",color:"#fff"}}>
              <th style={{textAlign:"left",padding:"8px 10px",fontWeight:700}}>Concepto</th>
              {erMeses.map(m=><th key={m.mes} style={{textAlign:"right",padding:"8px 10px",fontWeight:700}}>{mesL(m.mes)}</th>)}
            </tr>
          </thead>
          <tbody>
            {filasComp.map((f,i)=>(
              <Fragment key={i}>
              <tr style={{background:f.sub?"#f0ede4":"#fff",borderBottom:"none"}}>
                <td style={{padding:"7px 10px 2px",fontWeight:f.sub?800:500}}>{f.l}</td>
                {erMeses.map(m=>{
                  const v=m[f.k]||0;
                  return <td key={m.mes} style={{padding:"7px 10px 2px",textAlign:"right",fontFamily:"monospace",fontWeight:f.sub?800:600,color:f.neg?"#dc2626":v>=0?"#15803d":"#dc2626"}}>{fmtR(f.neg?-Math.abs(v):v)}</td>;
                })}
              </tr>
              <tr style={{background:f.sub?"#f0ede4":"#fff",borderBottom:"1px solid #eee"}}>
                <td style={{padding:"0 10px 6px",fontSize:9,color:"#bbb"}}>vs mes anterior</td>
                {erMeses.map((m,mi)=>{
                  const v=m[f.k]||0;
                  const prev=mi>0?(erMeses[mi-1][f.k]||0):null;
                  if(prev===null||prev===0)return <td key={m.mes} style={{padding:"0 10px 6px",textAlign:"right",fontSize:9,color:"#ccc"}}>—</td>;
                  const varP=(v-prev)/Math.abs(prev)*100;
                  // Para gastos, subir es malo (rojo); para ingresos/subtotales, subir es bueno (verde)
                  const sube=varP>=0;
                  const bueno=f.neg?!sube:sube;
                  return <td key={m.mes} style={{padding:"0 10px 6px",textAlign:"right",fontSize:9,fontWeight:700,color:Math.abs(varP)<0.5?"#bbb":bueno?"#15803d":"#dc2626"}}>{sube?"▲":"▼"} {sube?"+":""}{varP.toFixed(0)}%</td>;
                })}
              </tr>
              </Fragment>
            ))}
          </tbody>
        </table>
        <div style={{marginTop:20,fontSize:10,color:"#aaa",textAlign:"center"}}>JP Automotores — Sistema de gestión</div>
      </div>
      <style>{`
        @media print {
          .no-print { display: none !important; }
          #reporte-print { position: static !important; }
          .hoja-nueva { page-break-before: always; }
          @page { margin: 1cm; size: A4; }
          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
        }
      `}</style>
    </div>
  );
}

function SecEstadoResultado({registros,vehiculos}) {
  const mesesDisp=[...new Set(registros.map(r=>r.fecha?.slice(0,7)))].sort().reverse();
  const [mes,setMes]=useState(mesesDisp[0]||new Date().toISOString().slice(0,7));
  const [vista,setVista]=useState("cascada");
  const [ordenER,setOrdenER]=useState("cuenta");
  const [expandidos,setExpandidos]=useState({});
  const toggleExp=g=>setExpandidos(p=>({...p,[g]:!p[g]}));
  const [ctaExp,setCtaExp]=useState({});
  const toggleCta=c=>setCtaExp(p=>({...p,[c]:!p[c]}));
  const [reporteAbierto,setReporteAbierto]=useState(false);
  const ultimos12=useMemo(()=>[...new Set(registros.map(r=>r.fecha?.slice(0,7)))].filter(Boolean).sort().slice(-12),[registros]);
  const er=useMemo(()=>calcER(registros,mes,vehiculos),[registros,mes,vehiculos]);
  const erMeses=useMemo(()=>ultimos12.map(m=>({mes:m,...calcER(registros,m,vehiculos)})),[registros,ultimos12,vehiculos]);

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
      {reporteAbierto&&<ReporteGerencia er={er} erMeses={erMeses} mes={mes} onClose={()=>setReporteAbierto(false)}/>}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:24,flexWrap:"wrap",gap:12}}>
        <div><h2 style={{margin:0,color:G.text,fontWeight:900,fontSize:20,fontFamily:F}}>Estado de Resultado</h2><p style={{margin:"4px 0 0",color:G.textSub,fontSize:13,fontWeight:600}}>Cascada · Vertical · Horizontal</p></div>
        <div style={{display:"flex",gap:12,alignItems:"center"}}>
          <select style={s.inp} value={mes} onChange={e=>setMes(e.target.value)}>
            {mesesDisp.length===0&&<option value={mes}>{mes}</option>}
            {mesesDisp.map(m=><option key={m} value={m}>{mesL(m)}</option>)}
          </select>
          <select style={s.inp} value={ordenER} onChange={e=>setOrdenER(e.target.value)} title="Orden del desglose de cuentas">
            <option value="cuenta">Orden: por cuenta</option>
            <option value="monto">Orden: por monto (mayor)</option>
          </select>
          <div style={{display:"flex",background:G.input,borderRadius:10,padding:4,gap:2}}>
            {vistaBtns.map(t=><button key={t.v} onClick={()=>setVista(t.v)} style={{padding:"6px 14px",borderRadius:8,fontSize:12,fontWeight:700,border:"none",cursor:"pointer",fontFamily:F,background:vista===t.v?G.gold:"transparent",color:vista===t.v?"#000":G.textSub}}>{t.l}</button>)}
          </div>
          <button onClick={()=>setReporteAbierto(true)} className="no-print" style={{padding:"6px 14px",borderRadius:10,fontSize:12,fontWeight:700,border:`1px solid ${G.inputBorder}`,cursor:"pointer",fontFamily:F,background:G.input,color:G.textSub}}>🖨 Reporte gerencia</button>
        </div>
      </div>

      <div style={{background:"rgba(59,130,246,0.08)",border:"1px solid rgba(59,130,246,0.25)",borderRadius:10,padding:"10px 16px",marginBottom:16,fontSize:12,color:G.blue,fontWeight:600}}>
        ℹ️ CMV calculado por <strong>costo de venta</strong>: el costo de cada vehículo (compra + acondicionamiento) impacta el resultado recién cuando se vende, no cuando se compra. {er.vendidosEsteMes?.length>0&&`${er.vendidosEsteMes.length} vehículo(s) vendido(s) este mes activaron su costo.`}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12,marginBottom:20}}>
        <KPI label="Ganancia Bruta" value={fmt(er.gBruta)} color={er.gBruta>=0?G.green:G.red} sub={`Margen: ${pct(er.gBruta,er.ingresos)}`}/>
        <KPI label="EBITDA" value={fmt(er.ebitda)} color={er.ebitda>=0?G.blue:G.red} sub="Resultado operativo"/>
        <KPI label="Resultado Neto" value={fmt(er.resNeto)} color={er.resNeto>=0?G.gold:G.red} sub={`Margen: ${pct(er.resNeto,er.ingresos)}`}/>
      </div>

      {vista==="cascada"&&(
        <Card style={{padding:24}}>
          {GRUPOS_ER.map(grupo=>{
            const cuentasG=Object.values(PLAN).filter(c=>c.grupo===grupo.key).sort((a,b)=>ordenER==="monto"?(er.detalle[b.codigo]||0)-(er.detalle[a.codigo]||0):0);
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
                  const esVeh=c.esVehiculo;
                  // Movimientos que componen esta cuenta
                  let movs;
                  if(esVeh&&c.codigo==="2.1"){
                    // Compra: costo de cada auto vendido este mes
                    movs=er.vendidosEsteMes.map(v=>({fecha:v.fechaVenta,descripcion:(v.descripcion||v.patente)+" (compra)",importe:parseFloat(v.costo)||0}));
                  } else if(esVeh){
                    // Acondicionamiento: registros de esa cuenta de los autos vendidos este mes
                    const idsVend=er.vendidosEsteMes.map(v=>v.id);
                    movs=registros.filter(r=>idsVend.includes(r.vehiculoId)&&r.cuenta===c.codigo&&!r.esIngreso);
                  } else {
                    movs=(er.regs||[]).filter(r=>r.cuenta===c.codigo);
                  }
                  const ctaAbierta=ctaExp[c.codigo];
                  return <div key={c.codigo}>
                    <div onClick={()=>toggleCta(c.codigo)} style={{display:"flex",justifyContent:"space-between",padding:"6px 8px 6px 24px",borderBottom:`1px solid ${G.cardBorder}`,cursor:"pointer",background:ctaAbierta?"rgba(212,160,23,0.04)":"transparent"}}>
                      <span style={{fontSize:12,color:G.textDim,fontWeight:600}}>{ctaAbierta?"▾ ":"▸ "}{c.codigo} — {c.nombre}</span>
                      <span style={{fontFamily:"monospace",fontSize:12,color:grupo.key==="Ingresos"?G.green+"bb":G.red+"bb",fontWeight:700}}>{fmt(val)}</span>
                    </div>
                    {ctaAbierta&&(movs.length>0?movs.map((r,i)=>(
                      <div key={r.id||i} style={{display:"flex",justifyContent:"space-between",padding:"4px 8px 4px 44px",borderBottom:`1px solid ${G.cardBorder}`,background:"rgba(0,0,0,0.15)"}}>
                        <span style={{fontSize:11,color:G.textDim,fontWeight:500}}>{r.fecha?r.fecha.slice(8,10)+"/"+r.fecha.slice(5,7):""} · {r.descripcion||"(sin descripción)"}</span>
                        <span style={{fontFamily:"monospace",fontSize:11,color:G.textDim,fontWeight:600}}>{fmt(Math.round(parseFloat(r.importe)||0))}</span>
                      </div>
                    )):<div style={{padding:"4px 8px 4px 44px",fontSize:11,color:G.textDim,fontStyle:"italic"}}>Sin movimientos individuales</div>)}
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
                const subCuentasCMV=k==="cmv"?Object.values(PLAN).filter(c=>c.grupo==="Costo de Mercadería"&&(er.detalle[c.codigo]||0)!==0).sort((a,b)=>ordenER==="monto"?(er.detalle[b.codigo]||0)-(er.detalle[a.codigo]||0):0):[];
                return <Fragment key={k}>
                  <tr style={{borderBottom:`1px solid ${G.cardBorder}`,background:sub?G.input:"transparent"}}>
                    <td style={{padding:"10px 16px",paddingLeft:sub?"16px":"32px",color:sub?G.text:G.textSub,fontWeight:sub?800:600,fontSize:sub?13:12}}>{erLabels[k]}</td>
                    <td style={{padding:"10px 16px",textAlign:"right",fontFamily:"monospace",fontWeight:sub?900:700,color,fontSize:sub?15:13}}>{isCosto(k)&&val>0?`(${fmt(val)})`:fmt(val)}</td>
                    <td style={{padding:"10px 16px",textAlign:"right",fontSize:11,fontWeight:700,color:pctVal>20?G.red:pctVal>10?G.amber:G.textSub}}>{pctVal.toFixed(1)}%</td>
                  </tr>
                  {subCuentasCMV.map(c=>{
                    const sv=er.detalle[c.codigo]||0;
                    const sp=er.ingresos>0?(sv/er.ingresos*100):0;
                    return <tr key={c.codigo} style={{borderBottom:`1px solid ${G.cardBorder}`}}>
                      <td style={{padding:"6px 16px 6px 48px",color:G.textDim,fontWeight:600,fontSize:11}}>{c.codigo} — {c.nombre}</td>
                      <td style={{padding:"6px 16px",textAlign:"right",fontFamily:"monospace",fontWeight:600,color:G.red+"bb",fontSize:12}}>{fmt(sv)}</td>
                      <td style={{padding:"6px 16px",textAlign:"right",fontSize:10,fontWeight:600,color:G.textDim}}>{sp.toFixed(1)}%</td>
                    </tr>;
                  })}
                </Fragment>;
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
                {erKeys.map(fila=>{
                  // Mapa de cada línea del ER a su grupo del plan de cuentas
                  const grupoDe={cmv:"Costo de Mercadería",comercial:"Gastos de Comercialización",admin:"Gastos de Administración",impositivos:"Gastos Impositivos",bancarios:"Gastos Bancarios",extraordinarios:"Gastos Extraordinarios"};
                  const gKey=grupoDe[fila];
                  const subCuentas=gKey?Object.values(PLAN).filter(c=>c.grupo===gKey&&erMeses.some(m=>(m.detalle?.[c.codigo]||0)!==0)).sort((a,b)=>ordenER==="monto"?erMeses.reduce((s,m)=>s+(m.detalle?.[b.codigo]||0),0)-erMeses.reduce((s,m)=>s+(m.detalle?.[a.codigo]||0),0):0):[];
                  return <Fragment key={fila}>
                  <tr style={{borderBottom:`1px solid ${G.cardBorder}`,background:isSubtotal(fila)?G.input:"transparent"}}>
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
                  {subCuentas.map(c=>(
                    <tr key={c.codigo} style={{borderBottom:`1px solid ${G.cardBorder}`}}>
                      <td style={{padding:"6px 16px 6px 48px",color:G.textDim,fontWeight:600,fontSize:10}}>{c.codigo} — {c.nombre}</td>
                      {erMeses.map(m=>{
                        const sv=m.detalle?.[c.codigo]||0;
                        return <td key={m.mes} style={{padding:"6px 12px",textAlign:"right",background:m.mes===mes?"rgba(212,160,23,0.04)":"transparent"}}>
                          <div style={{fontFamily:"monospace",fontWeight:600,color:G.red+"bb",fontSize:11}}>{fmt(sv)}</div>
                        </td>;
                      })}
                    </tr>
                  ))}
                  </Fragment>;
                })}
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
  const [filtroMes,setFiltroMes]=useState("");
  const mesesVenta=[...new Set(vehiculos.filter(v=>v.estado==="Vendido"&&v.fechaVenta).map(v=>v.fechaVenta.slice(0,7)))].sort().reverse();
  const vV=vehiculos.filter(v=>v.estado==="Vendido"&&(!filtroMes||v.fechaVenta?.startsWith(filtroMes))).map(v=>{
    const gs=registros.filter(r=>r.vehiculoId===v.id&&!r.esIngreso&&r.cuenta!=="2.1"&&r.cuenta!=="2.2");
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
        <div style={{display:"flex",gap:8,alignItems:"center"}}>
          <select style={{...s.inp,maxWidth:170}} value={filtroMes} onChange={e=>setFiltroMes(e.target.value)}>
            <option value="">Todos los meses</option>
            {mesesVenta.map(m=><option key={m} value={m}>{mesL(m)}</option>)}
          </select>
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
                      <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:12}}>
                        {[["Costo entrada",fmt(parseFloat(v.costo)),G.textSub],["Acondicionamiento",fmt(v.acond),G.amber],["Precio venta",fmt(v.pv),G.green],["Ganancia",fmt(v.gan),v.gan>=0?G.green:G.red],["Margen %",pct(v.gan,v.pv),v.pv>0?(v.gan/v.pv*100>=10?G.green:v.gan/v.pv*100>=5?G.amber:G.red):G.textSub]].map(([l,val,c])=>(
                          <div key={l}><div style={{fontSize:11,color:G.textSub,fontWeight:700,marginBottom:2}}>{l}</div><div style={{fontFamily:"monospace",fontWeight:800,color:c}}>{val}</div></div>
                        ))}
                      </div>
                    </div>
                  ))}
                  <div style={{background:G.card,borderRadius:12,padding:16,display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,textAlign:"center"}}>
                    {[["Ingresos totales",fmt(op.totI),G.green],["Costos totales",fmt(op.totC),G.red],["Ganancia combinada",fmt(op.ganTotal),op.ganTotal>=0?G.green:G.red],["Margen combinado",pct(op.ganTotal,op.totI),op.totI>0?(op.ganTotal/op.totI*100>=10?G.green:op.ganTotal/op.totI*100>=5?G.amber:G.red):G.textSub]].map(([l,v,c])=>(
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

function SecFlujo({registros}){
  const [saldoInicial,setSaldoInicial]=useState(0);
  const [fechaSaldo,setFechaSaldo]=useState(hoy());
  const [sueldosConfig,setSueldosConfig]=useState([]);
  const [comisionesConfig,setComisionesConfig]=useState([]);
  const [modalConfig,setModalConfig]=useState(false);
  const [modalSaldo,setModalSaldo]=useState(false);
  const [formPago,setFormPago]=useState({nombre:"",tipo:"sueldo",importe:""});
  const [saldoTemp,setSaldoTemp]=useState("");

  const agregarPago=()=>{
    if(!formPago.nombre||!formPago.importe)return;
    const nuevo={id:uid(),nombre:formPago.nombre,importe:parseFloat(formPago.importe)};
    if(formPago.tipo==="sueldo")setSueldosConfig(p=>[...p,nuevo]);
    else setComisionesConfig(p=>[...p,nuevo]);
    setFormPago({nombre:"",tipo:"sueldo",importe:""});
  };

  const anticiposPorEmp=useMemo(()=>{
    const map={};
    registros.filter(r=>r.esAnticipo).forEach(r=>{
      const emp=r.empleadoAnticipo||"Sin asignar";
      if(!map[emp])map[emp]=0;
      map[emp]+=r.importe;
    });
    return map;
  },[registros]);

  const hoyStr=hoy();

  const movsFuturos=useMemo(()=>{
    const items=[];
    registros.forEach(r=>{
      if(r.esIngreso&&r.formas?.length>0){
        r.formas.filter(f=>(f.tipo==="Cheque recibido"||f.tipo==="Crédito / Financiera")&&f.fechaCobro&&f.fechaCobro>hoyStr).forEach(f=>{
          items.push({id:uid(),fecha:f.fechaCobro,desc:r.descripcion,tipo:"ingreso",importe:parseFloat(f.importe)||0,formaPago:f.tipo,banco:f.banco});
        });
      }
      if(!r.esIngreso&&r.formas?.length>0){
        r.formas.filter(f=>f.tipo==="Cheque emitido"&&f.fechaCobro&&f.fechaCobro>hoyStr).forEach(f=>{
          items.push({id:uid(),fecha:f.fechaCobro,desc:r.descripcion,tipo:"egreso",importe:parseFloat(f.importe)||0,formaPago:f.tipo,banco:f.banco});
        });
      }
    });
    const mesAct=hoyStr.slice(0,7);
    const finMes=new Date(parseInt(mesAct.split("-")[0]),parseInt(mesAct.split("-")[1]),0).toISOString().split("T")[0];
    sueldosConfig.forEach(s=>{
      const anticipo=anticiposPorEmp[s.nombre]||0;
      const neto=s.importe-anticipo;
      if(neto>0)items.push({id:uid(),fecha:finMes,desc:`Sueldo ${s.nombre}`,tipo:"egreso",importe:neto,formaPago:"Sueldo",banco:"",esProyectado:true,detalle:`Sueldo ${fmtM(s.importe)} - Anticipo ${fmtM(anticipo)}`});
    });
    comisionesConfig.forEach(c=>{
      items.push({id:uid(),fecha:finMes,desc:`Comisión ${c.nombre}`,tipo:"egreso",importe:c.importe,formaPago:"Comisión",banco:"",esProyectado:true});
    });
    return items.sort((a,b)=>a.fecha.localeCompare(b.fecha));
  },[registros,sueldosConfig,comisionesConfig,anticiposPorEmp,hoyStr]);

  const porSemana=useMemo(()=>{
    const semanas={};
    movsFuturos.forEach(m=>{
      const d=new Date(m.fecha+"T00:00:00");
      const dow=d.getDay();
      const lunes=new Date(d);
      lunes.setDate(d.getDate()-(dow===0?6:dow-1));
      const key=lunes.toISOString().split("T")[0];
      if(!semanas[key])semanas[key]={key,inicio:lunes,ingresos:[],egresos:[]};
      if(m.tipo==="ingreso")semanas[key].ingresos.push(m);
      else semanas[key].egresos.push(m);
    });
    return Object.values(semanas).sort((a,b)=>a.key.localeCompare(b.key));
  },[movsFuturos]);

  let acumulado=saldoInicial;
  const semanasConAcum=porSemana.map(s=>{
    const totI=s.ingresos.reduce((sum,m)=>sum+m.importe,0);
    const totE=s.egresos.reduce((sum,m)=>sum+m.importe,0);
    const neto=totI-totE;
    acumulado+=neto;
    return{...s,totI,totE,neto,acumulado};
  });

  const totCobrar=movsFuturos.filter(m=>m.tipo==="ingreso").reduce((s,m)=>s+m.importe,0);
  const totPagar=movsFuturos.filter(m=>m.tipo==="egreso").reduce((s,m)=>s+m.importe,0);
  const saldoProyectado=saldoInicial+totCobrar-totPagar;

  const fmtSemana=d=>{const fin=new Date(d);fin.setDate(d.getDate()+6);return`${d.getDate()}/${d.getMonth()+1} — ${fin.getDate()}/${fin.getMonth()+1}`;};

  return<div>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:24,flexWrap:"wrap",gap:12}}>
      <div><h2 style={{margin:0,color:G.text,fontWeight:900,fontSize:20,fontFamily:F}}>Flujo de Fondos</h2><p style={{margin:"4px 0 0",color:G.textSub,fontSize:13}}>Proyección semanal de entradas y salidas</p></div>
      <div style={{display:"flex",gap:8}}>
        <Btn variant="ghost" onClick={()=>{setSaldoTemp(saldoInicial?saldoInicial.toString():"");setModalSaldo(true);}}>💰 Saldo inicial</Btn>
        <Btn onClick={()=>setModalConfig(true)}>⚙ Configurar sueldos</Btn>
      </div>
    </div>

    <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:20}}>
      <KPI label="Saldo inicial" value={fmt(saldoInicial)} color={G.text} sub={fmtF(fechaSaldo)}/>
      <KPI label="Por cobrar" value={fmt(totCobrar)} color={G.green} sub={`${movsFuturos.filter(m=>m.tipo==="ingreso").length} mov.`}/>
      <KPI label="Por pagar" value={fmt(totPagar)} color={G.red} sub={`${movsFuturos.filter(m=>m.tipo==="egreso").length} mov.`}/>
      <KPI label="Saldo proyectado" value={fmt(saldoProyectado)} color={saldoProyectado>=0?G.blue:G.red}/>
    </div>

    {semanasConAcum.length===0?<Card style={{padding:40,textAlign:"center"}}>
      <div style={{color:G.textDim,fontWeight:600,marginBottom:8}}>Sin movimientos futuros pendientes.</div>
      <div style={{color:G.textDim,fontSize:12}}>Cargá un saldo inicial y/o configurá sueldos para ver la proyección.</div>
    </Card>:(
      <div style={{display:"flex",flexDirection:"column",gap:12}}>
        <Card style={{padding:"12px 20px",background:G.input,border:`1px solid ${G.gold}`}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <span style={{fontWeight:700,color:G.textSub,fontSize:13}}>Saldo disponible hoy</span>
            <span style={{fontWeight:900,fontSize:18,color:G.gold,fontFamily:"monospace"}}>{fmt(saldoInicial)}</span>
          </div>
        </Card>
        {semanasConAcum.map(sem=>(
          <Card key={sem.key}>
            <div style={{padding:"16px 20px",borderBottom:`1px solid ${G.cardBorder}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <div>
                <div style={{fontWeight:800,color:G.text,fontSize:14}}>Semana del {fmtSemana(sem.inicio)}</div>
                <div style={{fontSize:11,color:G.textSub,marginTop:2}}>Saldo acumulado: <span style={{color:sem.acumulado>=0?G.green:G.red,fontWeight:700}}>{fmt(sem.acumulado)}</span></div>
              </div>
              <div style={{display:"flex",gap:16,textAlign:"right"}}>
                <div><div style={{fontSize:11,color:G.textSub}}>Ingresos</div><div style={{fontWeight:800,color:G.green,fontSize:14}}>{fmt(sem.totI)}</div></div>
                <div><div style={{fontSize:11,color:G.textSub}}>Egresos</div><div style={{fontWeight:800,color:G.red,fontSize:14}}>{fmt(sem.totE)}</div></div>
                <div><div style={{fontSize:11,color:G.textSub}}>Neto</div><div style={{fontWeight:900,color:sem.neto>=0?G.green:G.red,fontSize:15}}>{fmt(sem.neto)}</div></div>
              </div>
            </div>
            <div style={{padding:"12px 20px"}}>
              {sem.ingresos.length>0&&<div style={{marginBottom:8}}>
                <div style={{fontSize:11,color:G.green,fontWeight:700,textTransform:"uppercase",marginBottom:4}}>Ingresos</div>
                {sem.ingresos.map(m=><div key={m.id} style={{display:"flex",justifyContent:"space-between",padding:"4px 0",borderBottom:`1px solid ${G.cardBorder}`}}>
                  <div><span style={{color:G.text,fontSize:12,fontWeight:600}}>{m.desc}</span><span style={{color:G.textDim,fontSize:11,marginLeft:8}}>{m.formaPago}{m.banco?` · ${m.banco}`:""} · {fmtF(m.fecha)}</span></div>
                  <span style={{fontFamily:"monospace",color:G.green,fontWeight:700,fontSize:12}}>+{fmt(m.importe)}</span>
                </div>)}
              </div>}
              {sem.egresos.length>0&&<div>
                <div style={{fontSize:11,color:G.red,fontWeight:700,textTransform:"uppercase",marginBottom:4}}>Egresos</div>
                {sem.egresos.map(m=><div key={m.id} style={{display:"flex",justifyContent:"space-between",padding:"4px 0",borderBottom:`1px solid ${G.cardBorder}`}}>
                  <div><span style={{color:G.text,fontSize:12,fontWeight:600}}>{m.desc}</span>{m.esProyectado&&<span style={{color:G.amber,fontSize:10,fontWeight:700,marginLeft:6,background:"rgba(245,158,11,0.15)",padding:"1px 6px",borderRadius:4}}>PROYECTADO</span>}<span style={{color:G.textDim,fontSize:11,marginLeft:8}}>{m.formaPago} · {fmtF(m.fecha)}</span>{m.detalle&&<div style={{color:G.textDim,fontSize:10}}>{m.detalle}</div>}</div>
                  <span style={{fontFamily:"monospace",color:G.red,fontWeight:700,fontSize:12}}>-{fmt(m.importe)}</span>
                </div>)}
              </div>}
            </div>
          </Card>
        ))}
      </div>
    )}

    <Modal open={modalSaldo} onClose={()=>setModalSaldo(false)} title="Saldo inicial de caja" size="sm">
      <div style={{display:"flex",flexDirection:"column",gap:16}}>
        <div style={{color:G.textSub,fontSize:13,fontWeight:600}}>Cargá cuánta plata tenés disponible hoy (efectivo + bancos). El flujo de fondos va a proyectar el saldo acumulado a partir de este número.</div>
        <NumInp label="Saldo disponible hoy ($)" value={saldoTemp} onChange={v=>setSaldoTemp(v)} placeholder="0"/>
        <Inp label="Fecha de este saldo" type="date" value={fechaSaldo} onChange={e=>setFechaSaldo(e.target.value)}/>
        <div style={{display:"flex",gap:12,paddingTop:8}}>
          <Btn onClick={()=>{setSaldoInicial(parseFloat(saldoTemp)||0);setModalSaldo(false);}}>Guardar</Btn>
          <Btn variant="ghost" onClick={()=>setModalSaldo(false)}>Cancelar</Btn>
        </div>
      </div>
    </Modal>

    <Modal open={modalConfig} onClose={()=>setModalConfig(false)} title="Configurar sueldos y comisiones" size="lg">
      <div style={{display:"flex",flexDirection:"column",gap:16}}>
        <div style={{background:G.input,borderRadius:12,padding:16}}>
          <div style={{fontWeight:700,color:G.text,fontSize:13,marginBottom:12}}>Agregar pago mensual</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr auto",gap:8,alignItems:"end"}}>
            <Inp label="Empleado" placeholder="Nombre" value={formPago.nombre} onChange={e=>setFormPago(p=>({...p,nombre:e.target.value}))}/>
            <Sel label="Tipo" options={[{v:"sueldo",l:"Sueldo"},{v:"comision",l:"Comisión"}]} value={formPago.tipo} onChange={e=>setFormPago(p=>({...p,tipo:e.target.value}))}/>
            <NumInp label="Importe ($)" value={formPago.importe} onChange={v=>setFormPago(p=>({...p,importe:v}))} placeholder="0"/>
            <Btn onClick={agregarPago} disabled={!formPago.nombre||!formPago.importe}>+ Agregar</Btn>
          </div>
        </div>
        {sueldosConfig.length>0&&<div>
          <div style={{fontWeight:700,color:G.textSub,fontSize:11,textTransform:"uppercase",marginBottom:8}}>Sueldos configurados</div>
          {sueldosConfig.map(s=><div key={s.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 12px",background:G.input,borderRadius:8,marginBottom:4}}>
            <div><span style={{color:G.text,fontWeight:600}}>{s.nombre}</span><span style={{color:G.textDim,fontSize:11,marginLeft:8}}>Anticipo acumulado: {fmt(anticiposPorEmp[s.nombre]||0)}</span></div>
            <div style={{display:"flex",gap:12,alignItems:"center"}}>
              <span style={{color:G.gold,fontWeight:700}}>{fmt(s.importe)}</span>
              <span style={{color:G.green,fontWeight:700,fontSize:11}}>→ Neto: {fmt(s.importe-(anticiposPorEmp[s.nombre]||0))}</span>
              <Btn variant="danger" size="sm" onClick={()=>setSueldosConfig(p=>p.filter(x=>x.id!==s.id))}>✕</Btn>
            </div>
          </div>)}
        </div>}
        {comisionesConfig.length>0&&<div>
          <div style={{fontWeight:700,color:G.textSub,fontSize:11,textTransform:"uppercase",marginBottom:8}}>Comisiones configuradas</div>
          {comisionesConfig.map(c=><div key={c.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 12px",background:G.input,borderRadius:8,marginBottom:4}}>
            <span style={{color:G.text,fontWeight:600}}>{c.nombre}</span>
            <div style={{display:"flex",gap:12,alignItems:"center"}}><span style={{color:G.amber,fontWeight:700}}>{fmt(c.importe)}</span><Btn variant="danger" size="sm" onClick={()=>setComisionesConfig(p=>p.filter(x=>x.id!==c.id))}>✕</Btn></div>
          </div>)}
        </div>}
        <div style={{paddingTop:12,borderTop:`1px solid ${G.cardBorder}`}}><Btn onClick={()=>setModalConfig(false)}>Listo</Btn></div>
      </div>
    </Modal>
  </div>;
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

function SecDashboard({registros,vehiculos,tiposCambio={}}) {
  const mesesDisp=[...new Set(registros.map(r=>r.fecha?.slice(0,7)))].filter(Boolean).sort().reverse();
  const [mes,setMes]=useState(mesesDisp[0]||new Date().toISOString().slice(0,7));
  const er=useMemo(()=>calcER(registros,mes,vehiculos),[registros,mes,vehiculos]);
  const idx=mesesDisp.indexOf(mes);
  const erPrev=useMemo(()=>mesesDisp[idx+1]?calcER(registros,mesesDisp[idx+1],vehiculos):null,[registros,idx,mesesDisp,vehiculos]);
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
    return ms.map(m=>{const e=calcER(registros,m,vehiculos);return{label:mesL(m),ingresos:e.ingresos,egresos:e.cmv+e.comercial+e.admin+e.impositivos+e.bancarios,neto:e.resNeto};});
  },[registros]);
  const porVendedor=useMemo(()=>{
    const map={};
    registros.filter(r=>r.fecha?.startsWith(mes)&&r.esIngreso&&r.vendedor).forEach(r=>{if(!map[r.vendedor])map[r.vendedor]={nombre:r.vendedor,ventas:0,cant:0};map[r.vendedor].ventas+=r.importe;map[r.vendedor].cant++;});
    return Object.values(map).sort((a,b)=>b.ventas-a.ventas).slice(0,5);
  },[registros,mes]);
  const top5=useMemo(()=>vehiculos.filter(v=>v.estado==="Vendido"&&v.fechaVenta?.startsWith(mes)).map(v=>{
    const gs=registros.filter(r=>r.vehiculoId===v.id&&!r.esIngreso&&r.cuenta!=="2.1"&&r.cuenta!=="2.2").reduce((s,r)=>s+r.importe,0);
    const ct=(parseFloat(v.costo)||0)+gs;
    const pv=parseFloat(v.precioVenta)||0;
    return {...v,gan:pv-ct,pv};
  }).sort((a,b)=>b.gan-a.gan).slice(0,5),[vehiculos,registros,mes]);
  const distGastos=[
    {name:"CMV",value:er.cmv},{name:"Comercialización",value:er.comercial},
    {name:"Administración",value:er.admin},{name:"Impositivos",value:er.impositivos},
    {name:"Bancarios",value:er.bancarios},{name:"Extraordinarios",value:er.extraordinarios},
  ].filter(d=>d.value>0);
  const enStockDash=vehiculos.filter(v=>v.estado==="En stock");
  const propiosDash=enStockDash.filter(v=>v.tipo!=="Consignación").length;
  const consigDash=enStockDash.filter(v=>v.tipo==="Consignación").length;
  const distStock=[{name:"Propios",value:propiosDash},{name:"Consignación",value:consigDash}].filter(d=>d.value>0);
  const dif=(a,b)=>b!==null?a-b:undefined;
  const difP=(a,b)=>b!==null&&b!==0?((a-b)/Math.abs(b)*100):undefined;

  const exportarAnalisis=()=>{
    const esc=v=>{const s=String(v??"");return s.includes(",")||s.includes('"')||s.includes("\n")?'"'+s.replace(/"/g,'""')+'"':s;};
    const fila=arr=>arr.map(esc).join(",");
    const L=[];
    const hoyF=hoy();
    // ===== ENCABEZADO =====
    L.push(fila(["JP AUTOMOTORES — ANALISIS DE NEGOCIO"]));
    L.push(fila(["Generado el",hoyF,"Mes analizado",mesL(mes)]));
    L.push("");
    // ===== RESUMEN EJECUTIVO =====
    L.push(fila(["=== RESUMEN EJECUTIVO (mes "+mesL(mes)+") ==="]));
    L.push(fila(["Indicador","Valor"]));
    L.push(fila(["Autos vendidos en el mes",vMes.length]));
    L.push(fila(["Ingresos",Math.round(er.ingresos)]));
    L.push(fila(["Costo de mercaderia (CMV)",Math.round(er.cmv)]));
    L.push(fila(["Ganancia bruta",Math.round(er.gBruta)]));
    L.push(fila(["Margen bruto %",er.ingresos>0?(er.gBruta/er.ingresos*100).toFixed(1):"0"]));
    L.push(fila(["Resultado neto",Math.round(er.resNeto)]));
    L.push(fila(["Margen neto %",er.ingresos>0?(er.resNeto/er.ingresos*100).toFixed(1):"0"]));
    L.push(fila(["Ticket promedio",Math.round(ticketProm)]));
    L.push(fila(["Gastos fijos",Math.round(gastosFijos)]));
    L.push(fila(["Punto equilibrio (autos)",puntoEqAutos.toFixed(1)]));
    L.push("");
    // ===== SITUACION DE STOCK =====
    L.push(fila(["=== STOCK ACTUAL ==="]));
    L.push(fila(["Indicador","Valor"]));
    L.push(fila(["Autos en stock",enStock.length]));
    L.push(fila(["  - Propios",propiosDash]));
    L.push(fila(["  - Consignacion",consigDash]));
    L.push(fila(["Capital en stock (costo)",Math.round(valorStock)]));
    L.push(fila(["Cheques a cobrar (futuros)",Math.round(totChqProx)]));
    L.push("");
    // ===== DETALLE POR AUTO (todos) =====
    L.push(fila(["=== DETALLE POR AUTO ==="]));
    L.push(fila(["Patente","Descripcion","Marca","Modelo","Anio","Tenencia","Estado","Costo","Acond.","Costo total","Precio venta","Ganancia","Margen %","Fecha ingreso","Fecha venta","Dias en stock"]));
    vehiculos.forEach(v=>{
      const gs=registros.filter(r=>r.vehiculoId===v.id&&!r.esIngreso&&r.cuenta!=="2.1"&&r.cuenta!=="2.2");
      const acond=gs.reduce((s,r)=>s+r.importe,0);
      const ce=parseFloat(v.costo)||0;
      const ct=ce+acond;
      const pv=parseFloat(v.precioVenta)||0;
      const gan=v.estado==="Vendido"?(pv-ct):"";
      const margen=v.estado==="Vendido"&&pv>0?((pv-ct)/pv*100).toFixed(1):"";
      const ten=v.tipo==="Consignación"?"Consignacion":"Propio";
      const fIng=v.fecha||"";
      const fVen=v.fechaVenta||"";
      const dias=fIng?Math.round((new Date(fVen||hoyF)-new Date(fIng))/86400000):"";
      L.push(fila([v.patente,v.descripcion,v.marca,v.modelo,v.anio,ten,v.estado,Math.round(ce),Math.round(acond),Math.round(ct),pv?Math.round(pv):"",gan!==""?Math.round(gan):"",margen,fIng,fVen,dias]));
    });
    L.push("");
    // ===== RENTABILIDAD POR MODELO =====
    L.push(fila(["=== RENTABILIDAD POR MODELO (vendidos) ==="]));
    L.push(fila(["Modelo","Cantidad vendida","Ganancia total","Ganancia promedio"]));
    const mapMod={};
    vehiculos.filter(v=>v.estado==="Vendido").forEach(v=>{
      const k=v.modelo||v.descripcion||"Sin modelo";
      if(!mapMod[k])mapMod[k]={cant:0,gan:0};
      const gs=registros.filter(r=>r.vehiculoId===v.id&&!r.esIngreso&&r.cuenta!=="2.1"&&r.cuenta!=="2.2").reduce((s,r)=>s+r.importe,0);
      const ct=(parseFloat(v.costo)||0)+gs;
      mapMod[k].cant++;mapMod[k].gan+=((parseFloat(v.precioVenta)||0)-ct);
    });
    Object.entries(mapMod).sort((a,b)=>b[1].gan-a[1].gan).forEach(([k,d])=>{
      L.push(fila([k,d.cant,Math.round(d.gan),Math.round(d.gan/d.cant)]));
    });
    L.push("");
    // ===== ESTADO DE RESULTADO DEL MES =====
    L.push(fila(["=== ESTADO DE RESULTADO ("+mesL(mes)+") ==="]));
    L.push(fila(["Concepto","Monto"]));
    L.push(fila(["Ingresos",Math.round(er.ingresos)]));
    L.push(fila(["Costo de Mercaderia",-Math.round(er.cmv)]));
    L.push(fila(["GANANCIA BRUTA",Math.round(er.gBruta)]));
    L.push(fila(["Gastos Comercializacion",-Math.round(er.comercial)]));
    L.push(fila(["Gastos Administracion",-Math.round(er.admin)]));
    L.push(fila(["Gastos Impositivos",-Math.round(er.impositivos)]));
    L.push(fila(["Gastos Bancarios",-Math.round(er.bancarios)]));
    L.push(fila(["Extraordinarios",-Math.round(er.extraordinarios)]));
    L.push(fila(["RESULTADO NETO",Math.round(er.resNeto)]));
    L.push("");
    // ===== TODOS LOS REGISTROS =====
    L.push(fila(["=== REGISTROS (movimientos crudos) ==="]));
    L.push(fila(["Fecha","Tipo","Cuenta","Descripcion","Vehiculo","Vendedor","Importe","Es ingreso"]));
    registros.slice().sort((a,b)=>(a.fecha||"").localeCompare(b.fecha||"")).forEach(r=>{
      L.push(fila([r.fecha,r.tipo,r.cuenta,r.descripcion,r.vehiculoId==="__na__"?"":r.vehiculoId,r.vendedor,Math.round(parseFloat(r.importe)||0),r.esIngreso?"SI":"NO"]));
    });
    // Descargar con BOM para que Excel respete acentos
    const csv="\uFEFF"+L.join("\n");
    const blob=new Blob([csv],{type:"text/csv;charset=utf-8;"});
    const url=URL.createObjectURL(blob);
    const a=document.createElement("a");
    a.href=url;a.download="JP-Automotores-Analisis-"+mes+".csv";
    document.body.appendChild(a);a.click();document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:24}}>
        <div><h2 style={{margin:0,color:G.text,fontWeight:900,fontSize:20,fontFamily:F}}>Dashboard</h2><p style={{margin:"4px 0 0",color:G.textSub,fontSize:13,fontWeight:600}}>Métricas clave del negocio</p></div>
        <div style={{display:"flex",gap:8,alignItems:"center"}}>
          <Btn onClick={exportarAnalisis} variant="ghost" size="md">⬇ Exportar análisis</Btn>
          <select style={s.inp} value={mes} onChange={e=>setMes(e.target.value)}>
            {mesesDisp.length===0&&<option value={mes}>{mes}</option>}
            {mesesDisp.map(m=><option key={m} value={m}>{mesL(m)}</option>)}
          </select>
        </div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:12}}>
        <KPI label="Autos vendidos" value={vMes.length.toString()} color={G.text} varAbs={dif(vMes.length,erPrev?vMesPrev.length:null)} varPct={difP(vMes.length,erPrev?vMesPrev.length:null)} sub="unidades"/>
        <KPI label="Ingresos" value={fmtM(er.ingresos)} color={G.green} varAbs={dif(er.ingresos,erPrev?.ingresos??null)} varPct={difP(er.ingresos,erPrev?.ingresos??null)}/>
        <KPI label="Ganancia bruta" value={fmtM(er.gBruta)} color={er.gBruta>=0?G.gold:G.red} varAbs={dif(er.gBruta,erPrev?.gBruta??null)} varPct={difP(er.gBruta,erPrev?.gBruta??null)} sub={`Margen ${pct(er.gBruta,er.ingresos)}`}/>
        <KPI label="Resultado neto" value={fmtM(er.resNeto)} color={er.resNeto>=0?G.blue:G.red} varAbs={dif(er.resNeto,erPrev?.resNeto??null)} varPct={difP(er.resNeto,erPrev?.resNeto??null)} sub={`Margen ${pct(er.resNeto,er.ingresos)}`}/>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:12}}>
        <KPI label="CMV" value={fmtM(er.cmv)} color={G.red} sub={`${pct(er.cmv,er.ingresos)} de ingresos`}/>
        <KPI label="Autos en stock" value={enStock.length.toString()} color={G.amber} sub={(()=>{const mActual=hoy().slice(0,7);const mesesTC=Object.keys(tiposCambio).filter(m=>m<=mActual).sort();const tc=mesesTC.length>0?tiposCambio[mesesTC[mesesTC.length-1]]:0;return tc>0?`${fmtM(valorStock)} · US$ ${Math.round(valorStock/tc).toLocaleString("es-AR")}`:`Capital ${fmtM(valorStock)}`;})()}/>
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
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:16,marginBottom:16}}>
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
                <YAxis type="category" dataKey="nombre" tick={{fill:G.textSub,fontSize:11,fontWeight:700}} width={90} tickFormatter={(n)=>{const v=porVendedor.find(x=>x.nombre===n);return v?`${n} (${v.cant})`:n;}}/>
                <Tooltip formatter={(v,n,p)=>[`${fmt(v)} · ${p?.payload?.cant||0} auto${(p?.payload?.cant||0)===1?"":"s"}`,"Ventas"]} contentStyle={{background:G.card,border:`1px solid ${G.cardBorder}`,borderRadius:8,fontFamily:F}}/>
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
        <Card style={{padding:20}}>
          <div style={{fontWeight:800,color:G.text,fontSize:14,marginBottom:12}}>Stock por tenencia</div>
          {distStock.length===0?<div style={{textAlign:"center",padding:20,color:G.textDim,fontSize:12}}>Sin stock</div>:<div>
            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}>
              <div style={{flex:1,height:12,borderRadius:6,background:G.input,overflow:"hidden"}}><div style={{height:"100%",background:G.gold,width:propiosDash+consigDash>0?`${Math.round(propiosDash/(propiosDash+consigDash)*100)}%`:"0%"}}/></div>
              <span style={{fontSize:12,color:G.gold,fontWeight:700,minWidth:70}}>{propiosDash} propios</span>
            </div>
            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:16}}>
              <div style={{flex:1,height:12,borderRadius:6,background:G.input,overflow:"hidden"}}><div style={{height:"100%",background:G.blue,width:propiosDash+consigDash>0?`${Math.round(consigDash/(propiosDash+consigDash)*100)}%`:"0%"}}/></div>
              <span style={{fontSize:12,color:G.blue,fontWeight:700,minWidth:70}}>{consigDash} consig.</span>
            </div>
            <div style={{background:G.input,borderRadius:10,padding:12,display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
              <div style={{textAlign:"center"}}><div style={{fontSize:10,color:G.textSub,fontWeight:700,marginBottom:4}}>PROPIOS</div><div style={{fontWeight:900,fontSize:20,color:G.gold}}>{propiosDash}</div><div style={{fontSize:10,color:G.textSub}}>{propiosDash+consigDash>0?Math.round(propiosDash/(propiosDash+consigDash)*100):0}%</div></div>
              <div style={{textAlign:"center"}}><div style={{fontSize:10,color:G.textSub,fontWeight:700,marginBottom:4}}>CONSIGNACIÓN</div><div style={{fontWeight:900,fontSize:20,color:G.blue}}>{consigDash}</div><div style={{fontSize:10,color:G.textSub}}>{propiosDash+consigDash>0?Math.round(consigDash/(propiosDash+consigDash)*100):0}%</div></div>
            </div>
          </div>}
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
  const [usuario,setUsuario]=useState(null);
  const [tab,setTab]=useState("dashboard");
  const [registros,setRegistros]=useState([]);
  const [vehiculos,setVehiculos]=useState([]);
  const [modReg,setModReg]=useState(false);
  const [modVeh,setModVeh]=useState(false);
  const [regEditar,setRegEditar]=useState(null);
  const [vehEditar,setVehEditar]=useState(null);
  const [tiposCambio,setTiposCambio]=useState({}); // {mes: valor}
  const [loading,setLoading]=useState(true);

  const dbVehToLocal=v=>({id:v.id,patente:v.patente,descripcion:v.descripcion,marca:v.marca||"",modelo:v.modelo||"",anio:v.anio||"",color:v.color||"",costo:v.costo,tipo:v.tipo,fecha:v.fecha,estado:v.estado,operacionOrigenId:v.operacion_origen_id,fechaVenta:v.fecha_venta,precioVenta:v.precio_venta,vendedor:v.vendedor||"",notas:v.notas||""});
  const dbRegToLocal=r=>({id:r.id,tipo:r.tipo,fecha:r.fecha,descripcion:r.descripcion,cuenta:r.cuenta,vendedor:r.vendedor||"",vehiculoId:r.vehiculo_id,notas:r.notas||"",importe:r.importe,formas:r.formas||[],esIngreso:r.es_ingreso,esAnticipo:r.es_anticipo,empleadoAnticipo:r.empleado_anticipo||"",esConsignacion:r.es_consignacion||false});
  const localVehToDB=v=>({id:v.id,patente:v.patente,descripcion:v.descripcion,marca:v.marca||"",modelo:v.modelo||"",anio:v.anio||"",color:v.color||"",costo:parseFloat(v.costo)||0,tipo:v.tipo,fecha:v.fecha,estado:v.estado,operacion_origen_id:v.operacionOrigenId||null,fecha_venta:v.fechaVenta||null,precio_venta:v.precioVenta?parseFloat(v.precioVenta):null,vendedor:v.vendedor||null,notas:v.notas||null});
  const localRegToDB=r=>({id:r.id,tipo:r.tipo,fecha:r.fecha,descripcion:r.descripcion,cuenta:r.cuenta,vendedor:r.vendedor||null,vehiculo_id:r.vehiculoId||null,notas:r.notas||null,importe:parseFloat(r.importe)||0,formas:r.formas||[],es_ingreso:r.esIngreso||false,es_anticipo:r.esAnticipo||false,empleado_anticipo:r.empleadoAnticipo||null,es_consignacion:r.esConsignacion||false});

  useEffect(()=>{
    const cargar=async()=>{
      try{
        const[{data:vData},{data:rData},{data:tcData}]=await Promise.all([
          supabase.from("vehiculos").select("*").order("fecha",{ascending:false}),
          supabase.from("registros").select("*").order("fecha",{ascending:false}),
          supabase.from("tipos_cambio").select("*"),
        ]);
        if(vData)setVehiculos(vData.map(dbVehToLocal));
        if(rData)setRegistros(rData.map(dbRegToLocal));
        if(tcData){
          const map={};
          tcData.forEach(t=>{map[t.mes]=t.valor;});
          setTiposCambio(map);
        }
      }catch(e){
        console.error("Error Supabase:",e);
      }finally{
        setLoading(false);
      }
    };
    cargar();
  },[]);

  const guardarTipoCambio=useCallback(async(mes,valor)=>{
    await supabase.from("tipos_cambio").upsert({mes,valor:parseFloat(valor)||0});
    setTiposCambio(p=>({...p,[mes]:parseFloat(valor)||0}));
  },[]);

  const saveRegistro=useCallback(async reg=>{
    if(reg._vehNuevo){
      const vn={...reg._vehNuevo,tipo:reg.esConsignacion?"Consignación":reg._vehNuevo.tipo};
      await supabase.from("vehiculos").insert([localVehToDB(vn)]);
      setVehiculos(p=>p.find(v=>v.id===vn.id)?p:[...p,vn]);
    }
    const{_vehNuevo,_esEdicion,...r}=reg;
    if(_esEdicion){
      await supabase.from("registros").update(localRegToDB(r)).eq("id",r.id);
      setRegistros(p=>p.map(x=>x.id===r.id?r:x));
      // Al editar una venta, crear los autos en especie que todavía no existan en el stock
      if(r.esIngreso){
        const especies=(r.formas||[]).filter(f=>f.tipo==="Especie (vehículo)"&&f.patente);
        for(const f of especies){
          const yaExiste=vehiculos.some(v=>(v.patente||"").toUpperCase()===f.patente.toUpperCase());
          if(!yaExiste){
            const desc=[f.marca,f.modelo,f.anio].filter(Boolean).join(" ")||f.descVeh||f.patente;
            const nv={id:uid(),patente:f.patente,descripcion:desc,costo:f.importe,tipo:"Parte de pago",fecha:r.fecha,estado:"En stock",operacionOrigenId:r.vehiculoId||r.id,fechaVenta:null,precioVenta:null,color:f.color||"",marca:f.marca||"",modelo:f.modelo||"",anio:f.anio||""};
            await supabase.from("vehiculos").insert([localVehToDB(nv)]);
            setVehiculos(p=>[...p,nv]);
          }
        }
      }
      setRegEditar(null);
      return;
    }
    await supabase.from("registros").insert([localRegToDB(r)]);
    setRegistros(p=>[...p,r]);
    // Mark vehicle as consignacion if applicable
    if(r.esConsignacion&&r.vehiculoId&&r.vehiculoId!=="__na__"){
      await supabase.from("vehiculos").update({tipo:"Consignación"}).eq("id",r.vehiculoId);
      setVehiculos(p=>p.map(v=>v.id===r.vehiculoId?{...v,tipo:"Consignación"}:v));
    }
    if(r.esIngreso){
      if(r.vehiculoId&&r.vehiculoId!=="__na__"){
        await supabase.from("vehiculos").update({estado:"Vendido",precio_venta:r.importe,vendedor:r.vendedor,fecha_venta:r.fecha}).eq("id",r.vehiculoId);
        setVehiculos(p=>p.map(v=>v.id===r.vehiculoId?{...v,estado:"Vendido",precioVenta:r.importe,vendedor:r.vendedor,fechaVenta:r.fecha}:v));
      }
      (r.formas||[]).filter(f=>f.tipo==="Especie (vehículo)"&&f.patente).forEach(async f=>{
        const desc=[f.marca,f.modelo,f.anio].filter(Boolean).join(" ")||f.descVeh||f.patente;
        const nv={id:uid(),patente:f.patente,descripcion:desc,costo:f.importe,tipo:"Parte de pago",fecha:r.fecha,estado:"En stock",operacionOrigenId:r.vehiculoId||r.id,fechaVenta:null,precioVenta:null,color:f.color||"",marca:f.marca||"",modelo:f.modelo||"",anio:f.anio||""};
        await supabase.from("vehiculos").insert([localVehToDB(nv)]);
        setVehiculos(p=>[...p,nv]);
      });
    }
  },[vehiculos]);

  const saveVehiculo=useCallback(async veh=>{
    const{_esEdicion,...v}=veh;
    if(_esEdicion){
      await supabase.from("vehiculos").update(localVehToDB(v)).eq("id",v.id);
      setVehiculos(p=>p.map(x=>x.id===v.id?v:x));
    }else{
      await supabase.from("vehiculos").insert([localVehToDB(v)]);
      setVehiculos(p=>[...p,v]);
      if(v.tipo==="Compra directa"&&v.costo){
        const reg={id:uid(),tipo:"Compra de vehículo",fecha:v.fecha,descripcion:`Compra ${v.descripcion} — ${v.patente}`,cuenta:"2.1",vehiculoId:v.id,importe:parseFloat(v.costo),esIngreso:false,formas:[],notas:"",vendedor:"",esAnticipo:false,empleadoAnticipo:""};
        await supabase.from("registros").insert([localRegToDB(reg)]);
        setRegistros(p=>[...p,reg]);
      }
    }
    setVehEditar(null);
  },[]);


  const eliminarRegistro=useCallback(async id=>{
    const reg=registros.find(r=>r.id===id);
    await supabase.from("registros").delete().eq("id",id);
    setRegistros(p=>p.filter(r=>r.id!==id));
    // Si el registro era una venta (ingreso vinculado a un vehículo), revertir el auto a En stock
    if(reg&&reg.esIngreso&&reg.vehiculoId&&reg.vehiculoId!=="__na__"){
      await supabase.from("vehiculos").update({estado:"En stock",precio_venta:null,vendedor:null,fecha_venta:null}).eq("id",reg.vehiculoId);
      setVehiculos(p=>p.map(v=>v.id===reg.vehiculoId?{...v,estado:"En stock",precioVenta:null,vendedor:null,fechaVenta:null}:v));
      // Eliminar los autos que entraron como parte de pago (especie) en esta venta
      const idsOrigen=[reg.vehiculoId,reg.id];
      const especies=vehiculos.filter(v=>v.tipo==="Parte de pago"&&idsOrigen.includes(v.operacionOrigenId));
      for(const e of especies){
        await supabase.from("vehiculos").delete().eq("id",e.id);
      }
      if(especies.length>0){
        const idsEsp=especies.map(e=>e.id);
        setVehiculos(p=>p.filter(v=>!idsEsp.includes(v.id)));
      }
    }
  },[registros,vehiculos]);
  const eliminarVehiculo=useCallback(async v=>{
    // Borrar el vehículo
    await supabase.from("vehiculos").delete().eq("id",v.id);
    setVehiculos(p=>p.filter(x=>x.id!==v.id));
    // Borrar los registros asociados a ese vehículo (compra automática, acondicionamientos, etc.)
    const regsAsoc=registros.filter(r=>r.vehiculoId===v.id);
    for(const r of regsAsoc){
      await supabase.from("registros").delete().eq("id",r.id);
    }
    if(regsAsoc.length>0){
      const ids=regsAsoc.map(r=>r.id);
      setRegistros(p=>p.filter(r=>!ids.includes(r.id)));
    }
  },[registros]);
  const tabActivo={background:G.goldDim,color:G.gold,border:`1px solid ${G.goldBorder}`,fontWeight:800};
  const tabInactivo={background:"transparent",color:G.textDim,border:"1px solid transparent",fontWeight:600};

  if(!usuario)return<LoginScreen onLogin={u=>setUsuario(u)}/>;

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
          <button onClick={()=>setUsuario(null)}style={{marginTop:8,background:"none",border:`1px solid ${G.inputBorder}`,borderRadius:6,color:G.textDim,fontSize:10,padding:"4px 8px",cursor:"pointer",fontFamily:F,width:"100%"}}>Cerrar sesión ({usuario?.nombre})</button>
        </div>
      </aside>
      <main style={{flex:1,overflowY:"auto",background:G.bg}} id="print-area">
        <div style={{maxWidth:1200,margin:"0 auto",padding:"32px"}}>
          {tab==="dashboard"    && <SecDashboard     registros={registros} vehiculos={vehiculos} tiposCambio={tiposCambio}/>}
          {tab==="registros"    && <SecRegistros     registros={registros} vehiculos={vehiculos} onNuevo={()=>setModReg(true)} onEliminar={eliminarRegistro} onEditar={r=>{setRegEditar(r);setModReg(true);}}/> }
          {tab==="stock"        && <SecStock         vehiculos={vehiculos} registros={registros} onNuevo={()=>setModVeh(true)} onEditar={v=>{setVehEditar(v);setModVeh(true);}} onEliminar={eliminarVehiculo} tiposCambio={tiposCambio} guardarTipoCambio={guardarTipoCambio}/>}
          {tab==="resultado"    && <SecEstadoResultado registros={registros} vehiculos={vehiculos}/>}
          {tab==="rentabilidad" && <SecRentabilidad  vehiculos={vehiculos} registros={registros}/>}
          {tab==="flujo"        && <SecFlujo         registros={registros}/>}
          {tab==="cheques"      && <SecCheques       registros={registros}/>}
          {tab==="anticipos"    && <SecAnticipos     registros={registros}/>}
        </div>
      </main>
      <style>{`@media print {
        aside { display: none !important; }
        .no-print { display: none !important; }
        main { overflow: visible !important; background: #fff !important; }
        body, #print-area { background: #fff !important; }
        /* Forzar que el navegador imprima los colores de fondo y texto */
        * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
        /* Texto base oscuro para legibilidad en papel */
        #print-area { color: #1a1a1a !important; }
        /* Tarjetas y contenedores: fondo blanco con borde suave */
        #print-area [style*="background"] { background: #fff !important; }
        /* Encabezados de tabla: banda gris clara */
        #print-area thead th, #print-area th { background: #f0f0f0 !important; color: #1a1a1a !important; border-bottom: 2px solid #ccc !important; }
        /* Filas de subtotales: fondo levemente sombreado */
        #print-area tr[style*="input"], #print-area tr[style*="Input"] { background: #f7f7f7 !important; }
        /* Colores contables: se conservan pero en tonos aptos para papel */
        #print-area [style*="34,197,94"], #print-area [style*="rgb(34"], #print-area [style*="#22c55e"] { color: #15803d !important; }
        #print-area td, #print-area th, #print-area div, #print-area span { border-color: #e0e0e0 !important; }
        h2 { color: #1a1a1a !important; }
        @page { margin: 1.2cm; }
      }`}</style>
      <ModalRegistro open={modReg} onClose={()=>{setModReg(false);setRegEditar(null);}} onSave={saveRegistro} vehiculos={vehiculos} registroEditar={regEditar}/>
      <ModalVehiculo open={modVeh} onClose={()=>{setModVeh(false);setVehEditar(null);}} onSave={saveVehiculo} vehEditar={vehEditar} vehiculos={vehiculos}/>
    </div>
  );
}