import { useState, useMemo, useCallback, useEffect } from "react";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell, ComposedChart } from "recharts";
import { supabase } from "./supabase";

// ─── COLORES Y ESTILOS ────────────────────────────────────────────────────────
const G = {
  bg:"#080808",card:"#111111",cardBorder:"#1f1f1f",
  sidebar:"#0d0d0d",sidebarBorder:"#1a1a1a",
  input:"#161616",inputBorder:"#2a2a2a",
  gold:"#d4a017",goldLight:"#f0c040",goldDim:"rgba(212,160,23,0.15)",goldBorder:"rgba(212,160,23,0.3)",
  text:"#ffffff",textSub:"#888888",textDim:"#444444",
  red:"#ef4444",green:"#22c55e",blue:"#3b82f6",amber:"#f59e0b",
};
const F = "'Inter','Helvetica Neue','Arial',sans-serif";

// ─── PLAN DE CUENTAS ──────────────────────────────────────────────────────────
const PLAN = {
  "1.1":  {codigo:"1.1",  nombre:"Venta vehículos usados",             tipo:"ingreso",  grupo:"Ingresos",                   esFijo:false,esExtraordinario:false,esRetiro:false,esAnticipo:false,esVehiculo:false},
  "1.2":  {codigo:"1.2",  nombre:"Venta vehículos 0km",                tipo:"ingreso",  grupo:"Ingresos",                   esFijo:false,esExtraordinario:false,esRetiro:false,esAnticipo:false,esVehiculo:false},
  "1.3":  {codigo:"1.3",  nombre:"Otros ingresos",                     tipo:"ingreso",  grupo:"Ingresos",                   esFijo:false,esExtraordinario:false,esRetiro:false,esAnticipo:false,esVehiculo:false},
  "2.1":  {codigo:"2.1",  nombre:"Costo compra — Usados",              tipo:"egreso",   grupo:"Costo de Mercadería",        esFijo:false,esExtraordinario:false,esRetiro:false,esAnticipo:false,esVehiculo:true},
  "2.2":  {codigo:"2.2",  nombre:"Costo compra — 0km",                 tipo:"egreso",   grupo:"Costo de Mercadería",        esFijo:false,esExtraordinario:false,esRetiro:false,esAnticipo:false,esVehiculo:true},
  "2.3":  {codigo:"2.3",  nombre:"Acond. — Mecánico / Reparaciones",   tipo:"egreso",   grupo:"Costo de Mercadería",        esFijo:false,esExtraordinario:false,esRetiro:false,esAnticipo:false,esVehiculo:true},
  "2.4":  {codigo:"2.4",  nombre:"Acond. — Service / ITV",             tipo:"egreso",   grupo:"Costo de Mercadería",        esFijo:false,esExtraordinario:false,esRetiro:false,esAnticipo:false,esVehiculo:true},
  "2.5":  {codigo:"2.5",  nombre:"Acond. — GNC / Gas",                 tipo:"egreso",   grupo:"Costo de Mercadería",        esFijo:false,esExtraordinario:false,esRetiro:false,esAnticipo:false,esVehiculo:true},
  "2.6":  {codigo:"2.6",  nombre:"Acond. — Gomería / Cubiertas",       tipo:"egreso",   grupo:"Costo de Mercadería",        esFijo:false,esExtraordinario:false,esRetiro:false,esAnticipo:false,esVehiculo:true},
  "2.7":  {codigo:"2.7",  nombre:"Acond. — Chapista / Pintura",        tipo:"egreso",   grupo:"Costo de Mercadería",        esFijo:false,esExtraordinario:false,esRetiro:false,esAnticipo:false,esVehiculo:true},
  "2.8":  {codigo:"2.8",  nombre:"Acond. — Estética / Polarizado",     tipo:"egreso",   grupo:"Costo de Mercadería",        esFijo:false,esExtraordinario:false,esRetiro:false,esAnticipo:false,esVehiculo:true},
  "2.9":  {codigo:"2.9",  nombre:"Acond. — Repuestos",                 tipo:"egreso",   grupo:"Costo de Mercadería",        esFijo:false,esExtraordinario:false,esRetiro:false,esAnticipo:false,esVehiculo:true},
  "2.10": {codigo:"2.10", nombre:"Acond. — Lavadero stock",            tipo:"egreso",   grupo:"Costo de Mercadería",        esFijo:false,esExtraordinario:false,esRetiro:false,esAnticipo:false,esVehiculo:true},
  "2.11": {codigo:"2.11", nombre:"Acond. — Combustible stock",         tipo:"egreso",   grupo:"Costo de Mercadería",        esFijo:false,esExtraordinario:false,esRetiro:false,esAnticipo:false,esVehiculo:true},
  "2.12": {codigo:"2.12", nombre:"Acond. — Flete / Traslado",          tipo:"egreso",   grupo:"Costo de Mercadería",        esFijo:false,esExtraordinario:false,esRetiro:false,esAnticipo:false,esVehiculo:true},
  "3.1":  {codigo:"3.1",  nombre:"Comisiones a vendedores",            tipo:"egreso",   grupo:"Gastos de Comercialización", esFijo:false,esExtraordinario:false,esRetiro:false,esAnticipo:false,esVehiculo:false},
  "3.2":  {codigo:"3.2",  nombre:"Publicidad y marketing",             tipo:"egreso",   grupo:"Gastos de Comercialización", esFijo:false,esExtraordinario:false,esRetiro:false,esAnticipo:false,esVehiculo:false},
  "3.3":  {codigo:"3.3",  nombre:"Ads digitales",                      tipo:"egreso",   grupo:"Gastos de Comercialización", esFijo:false,esExtraordinario:false,esRetiro:false,esAnticipo:false,esVehiculo:false},
  "3.4":  {codigo:"3.4",  nombre:"Merchandising / Regalos",            tipo:"egreso",   grupo:"Gastos de Comercialización", esFijo:false,esExtraordinario:false,esRetiro:false,esAnticipo:false,esVehiculo:false},
  "4.1":  {codigo:"4.1",  nombre:"Sueldos fijos",                      tipo:"egreso",   grupo:"Gastos de Administración",   esFijo:true, esExtraordinario:false,esRetiro:false,esAnticipo:false,esVehiculo:false},
  "4.2":  {codigo:"4.2",  nombre:"Cargas sociales / Aportes",          tipo:"egreso",   grupo:"Gastos de Administración",   esFijo:true, esExtraordinario:false,esRetiro:false,esAnticipo:false,esVehiculo:false},
  "4.3":  {codigo:"4.3",  nombre:"Honorarios contador",                tipo:"egreso",   grupo:"Gastos de Administración",   esFijo:true, esExtraordinario:false,esRetiro:false,esAnticipo:false,esVehiculo:false},
  "4.4":  {codigo:"4.4",  nombre:"Alquileres",                         tipo:"egreso",   grupo:"Gastos de Administración",   esFijo:true, esExtraordinario:false,esRetiro:false,esAnticipo:false,esVehiculo:false},
  "4.5":  {codigo:"4.5",  nombre:"Electricidad / Luz",                 tipo:"egreso",   grupo:"Gastos de Administración",   esFijo:true, esExtraordinario:false,esRetiro:false,esAnticipo:false,esVehiculo:false},
  "4.6":  {codigo:"4.6",  nombre:"Agua / Sodero",                      tipo:"egreso",   grupo:"Gastos de Administración",   esFijo:true, esExtraordinario:false,esRetiro:false,esAnticipo:false,esVehiculo:false},
  "4.7":  {codigo:"4.7",  nombre:"Mantenimiento del local",            tipo:"egreso",   grupo:"Gastos de Administración",   esFijo:true, esExtraordinario:false,esRetiro:false,esAnticipo:false,esVehiculo:false},
  "4.8":  {codigo:"4.8",  nombre:"Mejoras del local",                  tipo:"egreso",   grupo:"Gastos de Administración",   esFijo:true, esExtraordinario:false,esRetiro:false,esAnticipo:false,esVehiculo:false},
  "4.9":  {codigo:"4.9",  nombre:"Indumentaria de trabajo",            tipo:"egreso",   grupo:"Gastos de Administración",   esFijo:true, esExtraordinario:false,esRetiro:false,esAnticipo:false,esVehiculo:false},
  "4.10": {codigo:"4.10", nombre:"Limpieza",                           tipo:"egreso",   grupo:"Gastos de Administración",   esFijo:true, esExtraordinario:false,esRetiro:false,esAnticipo:false,esVehiculo:false},
  "4.11": {codigo:"4.11", nombre:"Insumos de oficina / Almacén",       tipo:"egreso",   grupo:"Gastos de Administración",   esFijo:true, esExtraordinario:false,esRetiro:false,esAnticipo:false,esVehiculo:false},
  "4.12": {codigo:"4.12", nombre:"Suscripciones (Infoauto, etc.)",     tipo:"egreso",   grupo:"Gastos de Administración",   esFijo:true, esExtraordinario:false,esRetiro:false,esAnticipo:false,esVehiculo:false},
  "4.13": {codigo:"4.13", nombre:"Otros gastos de administración",     tipo:"egreso",   grupo:"Gastos de Administración",   esFijo:true, esExtraordinario:false,esRetiro:false,esAnticipo:false,esVehiculo:false},
  "5.1":  {codigo:"5.1",  nombre:"Ingresos Brutos (IIBB)",             tipo:"egreso",   grupo:"Gastos Impositivos",         esFijo:false,esExtraordinario:false,esRetiro:false,esAnticipo:false,esVehiculo:false},
  "5.2":  {codigo:"5.2",  nombre:"Monotributo / Autónomos Joaquín",    tipo:"egreso",   grupo:"Gastos Impositivos",         esFijo:false,esExtraordinario:false,esRetiro:false,esAnticipo:false,esVehiculo:false},
  "5.3":  {codigo:"5.3",  nombre:"Municipalidad / Tasas",              tipo:"egreso",   grupo:"Gastos Impositivos",         esFijo:false,esExtraordinario:false,esRetiro:false,esAnticipo:false,esVehiculo:false},
  "5.4":  {codigo:"5.4",  nombre:"Otros impuestos",                    tipo:"egreso",   grupo:"Gastos Impositivos",         esFijo:false,esExtraordinario:false,esRetiro:false,esAnticipo:false,esVehiculo:false},
  "6.1":  {codigo:"6.1",  nombre:"Comisiones bancarias",               tipo:"egreso",   grupo:"Gastos Bancarios",           esFijo:false,esExtraordinario:false,esRetiro:false,esAnticipo:false,esVehiculo:false},
  "6.2":  {codigo:"6.2",  nombre:"Impuesto al débito y crédito",       tipo:"egreso",   grupo:"Gastos Bancarios",           esFijo:false,esExtraordinario:false,esRetiro:false,esAnticipo:false,esVehiculo:false},
  "6.3":  {codigo:"6.3",  nombre:"Otros gastos bancarios",             tipo:"egreso",   grupo:"Gastos Bancarios",           esFijo:false,esExtraordinario:false,esRetiro:false,esAnticipo:false,esVehiculo:false},
  "7.1":  {codigo:"7.1",  nombre:"Garantía posventa — Motor / Caja",   tipo:"egreso",   grupo:"Gastos Extraordinarios",     esFijo:false,esExtraordinario:true, esRetiro:false,esAnticipo:false,esVehiculo:false},
  "7.2":  {codigo:"7.2",  nombre:"Garantía posventa — Mecánica",       tipo:"egreso",   grupo:"Gastos Extraordinarios",     esFijo:false,esExtraordinario:true, esRetiro:false,esAnticipo:false,esVehiculo:false},
  "7.3":  {codigo:"7.3",  nombre:"Garantía posventa — Eléctrico",      tipo:"egreso",   grupo:"Gastos Extraordinarios",     esFijo:false,esExtraordinario:true, esRetiro:false,esAnticipo:false,esVehiculo:false},
  "7.4":  {codigo:"7.4",  nombre:"Reposición de cheques",              tipo:"egreso",   grupo:"Gastos Extraordinarios",     esFijo:false,esExtraordinario:true, esRetiro:false,esAnticipo:false,esVehiculo:false},
  "7.5":  {codigo:"7.5",  nombre:"Otros extraordinarios",              tipo:"egreso",   grupo:"Gastos Extraordinarios",     esFijo:false,esExtraordinario:true, esRetiro:false,esAnticipo:false,esVehiculo:false},
  "8.1":  {codigo:"8.1",  nombre:"Retiro del socio (Joaquín)",         tipo:"egreso",   grupo:"Retiro del Socio",           esFijo:false,esExtraordinario:false,esRetiro:true, esAnticipo:false,esVehiculo:false},
  "A.1":  {codigo:"A.1",  nombre:"Anticipo — Combustible empleados",   tipo:"anticipo", grupo:"Anticipos Empleados",        esFijo:false,esExtraordinario:false,esRetiro:false,esAnticipo:true, esVehiculo:false},
  "A.2":  {codigo:"A.2",  nombre:"Anticipo — Lavadero empleados",      tipo:"anticipo", grupo:"Anticipos Empleados",        esFijo:false,esExtraordinario:false,esRetiro:false,esAnticipo:true, esVehiculo:false},
  "A.3":  {codigo:"A.3",  nombre:"Anticipo — Otros",                   tipo:"anticipo", grupo:"Anticipos Empleados",        esFijo:false,esExtraordinario:false,esRetiro:false,esAnticipo:true, esVehiculo:false},
};

const VENDEDORES = ["Lucho","Wilson","Guille","Federico","Gastón","Joaquín","Otro"];
const BANCOS = ["Galicia","ICBC","Bancor","Nación","Mercado Pago","Otro"];
const COLORES = ["#d4a017","#3b82f6","#ef4444","#8b5cf6","#22c55e","#ec4899","#06b6d4","#f97316"];
const MESES_L = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"];

const fmt = n => new Intl.NumberFormat("es-AR",{style:"currency",currency:"ARS",maximumFractionDigits:0}).format(n||0);
const fmtM = n => {const a=Math.abs(n||0);if(a>=1e9)return(n/1e9).toFixed(1)+"B";if(a>=1e6)return(n/1e6).toFixed(1)+"M";if(a>=1e3)return(n/1e3).toFixed(0)+"K";return fmt(n);};
const fmtF = f => {if(!f)return"—";const[y,m,d]=f.split("-");return`${d}/${m}/${y}`;};
const hoy = () => new Date().toISOString().split("T")[0];
const uid = () => Date.now().toString(36)+Math.random().toString(36).slice(2);
const pct = (a,b) => b===0?"0.0%":((a/b)*100).toFixed(1)+"%";
const mesL = m => {if(!m)return"";const[y,mo]=m.split("-");return MESES_L[parseInt(mo)-1]+" "+y.slice(2);};

// ─── SUPABASE HELPERS ─────────────────────────────────────────────────────────
const dbVehToLocal = v => ({
  id:v.id, patente:v.patente, descripcion:v.descripcion, marca:v.marca||"",
  modelo:v.modelo||"", anio:v.anio||"", costo:v.costo, tipo:v.tipo,
  fecha:v.fecha, estado:v.estado, operacionOrigenId:v.operacion_origen_id,
  fechaVenta:v.fecha_venta, precioVenta:v.precio_venta, vendedor:v.vendedor||"",
});
const dbRegToLocal = r => ({
  id:r.id, tipo:r.tipo, fecha:r.fecha, descripcion:r.descripcion, cuenta:r.cuenta,
  vendedor:r.vendedor||"", vehiculoId:r.vehiculo_id, notas:r.notas||"",
  importe:r.importe, formas:r.formas||[], esIngreso:r.es_ingreso,
  esAnticipo:r.es_anticipo, empleadoAnticipo:r.empleado_anticipo||"",
});
const localVehToDB = v => ({
  id:v.id, patente:v.patente, descripcion:v.descripcion, marca:v.marca||"",
  modelo:v.modelo||"", anio:v.anio||"", costo:parseFloat(v.costo)||0, tipo:v.tipo,
  fecha:v.fecha, estado:v.estado, operacion_origen_id:v.operacionOrigenId||null,
  fecha_venta:v.fechaVenta||null, precio_venta:v.precioVenta?parseFloat(v.precioVenta):null,
  vendedor:v.vendedor||null,
});
const localRegToDB = r => ({
  id:r.id, tipo:r.tipo, fecha:r.fecha, descripcion:r.descripcion, cuenta:r.cuenta,
  vendedor:r.vendedor||null, vehiculo_id:r.vehiculoId||null, notas:r.notas||null,
  importe:parseFloat(r.importe)||0, formas:r.formas||[],
  es_ingreso:r.esIngreso||false, es_anticipo:r.esAnticipo||false,
  empleado_anticipo:r.empleadoAnticipo||null,
});

// ─── ESTILOS BASE ─────────────────────────────────────────────────────────────
const s = {
  card:{background:G.card,border:`1px solid ${G.cardBorder}`,borderRadius:16},
  inp:{background:G.input,border:`1px solid ${G.inputBorder}`,borderRadius:8,padding:"8px 12px",fontSize:13,color:G.text,fontFamily:F,fontWeight:600,outline:"none",width:"100%",boxSizing:"border-box"},
  lbl:{fontSize:11,color:G.textSub,fontWeight:700,display:"block",marginBottom:4,textTransform:"uppercase",letterSpacing:"0.05em"},
  btnPrimary:{background:G.gold,color:"#000",fontWeight:800,border:"none",borderRadius:10,padding:"10px 20px",fontSize:13,cursor:"pointer",fontFamily:F},
  btnGhost:{background:"transparent",color:G.textSub,fontWeight:600,border:`1px solid ${G.inputBorder}`,borderRadius:10,padding:"10px 20px",fontSize:13,cursor:"pointer",fontFamily:F},
  btnDanger:{background:"rgba(239,68,68,0.1)",color:G.red,fontWeight:600,border:"1px solid rgba(239,68,68,0.3)",borderRadius:8,padding:"4px 10px",fontSize:11,cursor:"pointer",fontFamily:F},
};

function Card({children,style={}}){return<div style={{...s.card,...style}}>{children}</div>;}
function Lbl({children}){return<label style={s.lbl}>{children}</label>;}
function Inp({label,style={},...p}){return<div style={{display:"flex",flexDirection:"column",gap:4}}>{label&&<Lbl>{label}</Lbl>}<input style={{...s.inp,...style}}{...p}/></div>;}
function Sel({label,options,style={},...p}){return<div style={{display:"flex",flexDirection:"column",gap:4}}>{label&&<Lbl>{label}</Lbl>}<select style={{...s.inp,...style}}{...p}>{options.map(o=><option key={o.v??o}value={o.v??o}>{o.l??o}</option>)}</select></div>;}
function Btn({children,variant="primary",size="md",style={},disabled,onClick}){
  const base=variant==="primary"?s.btnPrimary:variant==="danger"?s.btnDanger:s.btnGhost;
  const sz=size==="sm"?{padding:"4px 12px",fontSize:11}:size==="lg"?{padding:"12px 28px",fontSize:14}:{};
  return<button onClick={onClick}disabled={disabled}style={{...base,...sz,...style,opacity:disabled?0.4:1,cursor:disabled?"not-allowed":"pointer"}}>{children}</button>;
}
function Badge({children,color="gold"}){
  const cols={gold:{background:"rgba(212,160,23,0.15)",color:G.gold,border:"1px solid rgba(212,160,23,0.3)"},red:{background:"rgba(239,68,68,0.1)",color:G.red,border:"1px solid rgba(239,68,68,0.3)"},green:{background:"rgba(34,197,94,0.1)",color:G.green,border:"1px solid rgba(34,197,94,0.3)"},blue:{background:"rgba(59,130,246,0.1)",color:G.blue,border:"1px solid rgba(59,130,246,0.3)"},gray:{background:"rgba(255,255,255,0.05)",color:G.textSub,border:`1px solid ${G.inputBorder}`},amber:{background:"rgba(245,158,11,0.1)",color:G.amber,border:"1px solid rgba(245,158,11,0.3)"}};
  return<span style={{...cols[color]||cols.gray,fontSize:11,fontWeight:700,padding:"2px 8px",borderRadius:20}}>{children}</span>;
}
function Modal({open,onClose,title,children,size="md"}){
  if(!open)return null;
  const widths={sm:480,md:560,lg:720,xl:900};
  return<div style={{position:"fixed",inset:0,zIndex:50,display:"flex",alignItems:"center",justifyContent:"center",background:"rgba(0,0,0,0.85)",backdropFilter:"blur(4px)",padding:16}}onClick={onClose}><div style={{background:G.card,border:`1px solid ${G.cardBorder}`,borderRadius:20,width:"100%",maxWidth:widths[size],maxHeight:"90vh",display:"flex",flexDirection:"column",boxShadow:"0 25px 60px rgba(0,0,0,0.8)"}}onClick={e=>e.stopPropagation()}><div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"20px 24px",borderBottom:`1px solid ${G.cardBorder}`}}><h3 style={{margin:0,color:G.text,fontWeight:800,fontSize:16,fontFamily:F}}>{title}</h3><button onClick={onClose}style={{background:"none",border:"none",color:G.textSub,fontSize:22,cursor:"pointer",lineHeight:1}}>×</button></div><div style={{padding:24,overflowY:"auto"}}>{children}</div></div></div>;
}
function KPI({label,value,sub,varAbs,varPct,color=G.gold}){
  const pos=varAbs>=0;
  return<Card style={{padding:16}}><div style={{fontSize:11,color:G.textSub,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:6}}>{label}</div><div style={{fontSize:20,fontWeight:900,color,fontFamily:F,marginBottom:2}}>{value}</div>{varAbs!==undefined&&varAbs!==null&&<div style={{fontSize:11,fontWeight:700,color:pos?G.green:G.red}}>{pos?"▲":"▼"} {pos?"+":""}{fmtM(varAbs)} ({pos?"+":""}{varPct?.toFixed(1)}%)</div>}{sub&&<div style={{fontSize:11,color:G.textDim,marginTop:2,fontWeight:600}}>{sub}</div>}</Card>;
}

// ─── FORMAS DE PAGO ───────────────────────────────────────────────────────────
const TIPOS_PAGO=["Efectivo","Transferencia","Cheque recibido","Cheque emitido","Crédito / Financiera","Especie (vehículo)"];
function FormasPagoForm({formas,setFormas,total,allowEspecie=false}){
  const totalF=formas.reduce((s,f)=>s+(parseFloat(f.importe)||0),0);
  const ok=total>0&&Math.abs(total-totalF)<1;
  const tipos=TIPOS_PAGO.filter(t=>allowEspecie||t!=="Especie (vehículo)");
  const add=()=>setFormas(f=>[...f,{id:uid(),tipo:"Efectivo",importe:"",banco:"",nroCheque:"",fechaCobro:"",patente:"",descVeh:""}]);
  const rem=id=>setFormas(f=>f.filter(x=>x.id!==id));
  const upd=(id,k,v)=>setFormas(f=>f.map(x=>x.id===id?{...x,[k]:v}:x));
  return<div><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}><Lbl>Formas de cobro / pago</Lbl><Btn variant="ghost"size="sm"onClick={add}>+ Agregar</Btn></div><div style={{display:"flex",flexDirection:"column",gap:8}}>{formas.map(f=><div key={f.id}style={{background:G.input,border:`1px solid ${G.inputBorder}`,borderRadius:12,padding:12}}><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:8}}><select style={s.inp}value={f.tipo}onChange={e=>upd(f.id,"tipo",e.target.value)}>{tipos.map(t=><option key={t}>{t}</option>)}</select><input type="number"style={s.inp}placeholder="Importe"value={f.importe}onChange={e=>upd(f.id,"importe",e.target.value)}/></div>{(f.tipo==="Cheque recibido"||f.tipo==="Cheque emitido")&&<div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:8}}><select style={s.inp}value={f.banco}onChange={e=>upd(f.id,"banco",e.target.value)}><option value="">Banco</option>{BANCOS.map(b=><option key={b}>{b}</option>)}</select><input style={s.inp}placeholder="Nro. Cheque"value={f.nroCheque}onChange={e=>upd(f.id,"nroCheque",e.target.value)}/><input type="date"style={s.inp}value={f.fechaCobro}onChange={e=>upd(f.id,"fechaCobro",e.target.value)}/></div>}{f.tipo==="Crédito / Financiera"&&<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:8}}><input style={s.inp}placeholder="Financiera"value={f.banco}onChange={e=>upd(f.id,"banco",e.target.value)}/><input type="date"style={s.inp}value={f.fechaCobro}onChange={e=>upd(f.id,"fechaCobro",e.target.value)}/></div>}{f.tipo==="Transferencia"&&<select style={{...s.inp,marginBottom:8}}value={f.banco}onChange={e=>upd(f.id,"banco",e.target.value)}><option value="">Banco</option>{BANCOS.map(b=><option key={b}>{b}</option>)}</select>}{f.tipo==="Especie (vehículo)"&&<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:8}}><input style={s.inp}placeholder="Patente"value={f.patente}onChange={e=>upd(f.id,"patente",e.target.value.toUpperCase())}/><input style={s.inp}placeholder="Marca / Modelo / Año"value={f.descVeh}onChange={e=>upd(f.id,"descVeh",e.target.value)}/></div>}<div style={{display:"flex",justifyContent:"flex-end"}}><Btn variant="danger"size="sm"onClick={()=>rem(f.id)}>✕ Quitar</Btn></div></div>)}</div>{formas.length>0&&<div style={{marginTop:8,padding:"8px 12px",borderRadius:8,fontWeight:700,fontSize:13,display:"flex",justifyContent:"space-between",background:ok?"rgba(34,197,94,0.1)":"rgba(239,68,68,0.1)",color:ok?G.green:G.red}}><span>Total cargado</span><span>{fmt(totalF)} {ok?"✓":`— faltan ${fmt(total-totalF)}`}</span></div>}</div>;
}

// ─── MODAL REGISTRO ───────────────────────────────────────────────────────────
function ModalRegistro({open,onClose,onSave,vehiculos}){
  const TIPOS=["Venta de vehículo","Compra de vehículo","Gasto por vehículo","Gasto general"];
  const [tipo,setTipo]=useState("Venta de vehículo");
  const [fecha,setFecha]=useState(hoy());
  const [desc,setDesc]=useState("");
  const [cuenta,setCuenta]=useState("1.1");
  const [vendedor,setVendedor]=useState("");
  const [importe,setImporte]=useState("");
  const [formas,setFormas]=useState([]);
  const [notas,setNotas]=useState("");
  const [patente,setPatente]=useState("");
  const [estadoPat,setEstadoPat]=useState("idle");
  const [formVeh,setFormVeh]=useState({descripcion:"",marca:"",modelo:"",anio:"",costo:"",tipoEntrada:"Compra directa"});
  const esVenta=tipo==="Venta de vehículo",esCompra=tipo==="Compra de vehículo",esGastoVeh=tipo==="Gasto por vehículo",esGastoGen=tipo==="Gasto general";
  const necesitaVeh=esVenta||esCompra||esGastoVeh;
  const vehEnStock=vehiculos.find(v=>v.patente===patente);
  const imp=parseFloat(importe)||0;
  const totalF=formas.reduce((s,f)=>s+(parseFloat(f.importe)||0),0);
  const cobrosOk=esVenta?(imp>0&&Math.abs(imp-totalF)<1):true;
  const cuentasFilt=Object.values(PLAN).filter(c=>{if(c.esAnticipo)return esGastoGen;if(c.esRetiro)return esGastoGen;if(esVenta)return c.grupo==="Ingresos";if(esCompra)return["2.1","2.2"].includes(c.codigo);if(esGastoVeh)return c.esVehiculo&&!["2.1","2.2"].includes(c.codigo);return!c.esVehiculo&&c.tipo==="egreso";});
  const handlePatente=val=>{const up=val.toUpperCase().replace(/\s/g,"");setPatente(up);setEstadoPat("idle");setFormVeh({descripcion:"",marca:"",modelo:"",anio:"",costo:"",tipoEntrada:"Compra directa"});if(up.length>=5)setEstadoPat(vehiculos.find(v=>v.patente===up)?"encontrado":"no_encontrado");};
  const reset=()=>{setTipo("Venta de vehículo");setFecha(hoy());setDesc("");setCuenta("1.1");setVendedor("");setImporte("");setFormas([]);setNotas("");setPatente("");setEstadoPat("idle");setFormVeh({descripcion:"",marca:"",modelo:"",anio:"",costo:"",tipoEntrada:"Compra directa"});};
  const getVehId=()=>{if(estadoPat==="encontrado"&&vehEnStock)return vehEnStock.id;return"__na__";};
  const getVehNuevo=()=>{if(estadoPat!=="confirmado")return null;return{id:uid(),patente,descripcion:formVeh.descripcion,marca:formVeh.marca,modelo:formVeh.modelo,anio:formVeh.anio,costo:formVeh.costo,tipo:formVeh.tipoEntrada,fecha,estado:"En stock",operacionOrigenId:null,fechaVenta:null,precioVenta:null};};
  const guardar=()=>{const r={id:uid(),tipo,fecha,descripcion:desc,cuenta,vendedor,vehiculoId:getVehId(),notas,importe:imp,formas,esIngreso:esVenta,esAnticipo:PLAN[cuenta]?.esAnticipo||false,empleadoAnticipo:vendedor,_vehNuevo:getVehNuevo()};onSave(r);reset();onClose();};
  const canSave=fecha&&desc&&cuenta&&((esVenta&&imp>0&&cobrosOk)||(esCompra&&imp>0)||(esGastoVeh&&imp>0)||(esGastoGen&&imp>0));
  const tipoBtn=t=>({padding:"8px 4px",borderRadius:10,fontSize:12,fontWeight:700,cursor:"pointer",border:"none",fontFamily:F,background:tipo===t?G.gold:G.input,color:tipo===t?"#000":G.textSub});
  return(
    <Modal open={open}onClose={()=>{reset();onClose();}}title="Nuevo Registro"size="xl">
      <div style={{display:"flex",flexDirection:"column",gap:16}}>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:8}}>{TIPOS.map(t=><button key={t}style={tipoBtn(t)}onClick={()=>{setTipo(t);setCuenta(t==="Venta de vehículo"?"1.1":t==="Compra de vehículo"?"2.1":t==="Gasto por vehículo"?"2.3":"4.1");setFormas([]);setPatente("");setEstadoPat("idle");}}>{t}</button>)}</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}><Inp label="Fecha *"type="date"value={fecha}onChange={e=>setFecha(e.target.value)}/><div><Lbl>Cuenta contable *</Lbl><select style={s.inp}value={cuenta}onChange={e=>setCuenta(e.target.value)}>{cuentasFilt.map(c=><option key={c.codigo}value={c.codigo}>{c.codigo} — {c.nombre}</option>)}</select></div></div>
        <Inp label="Descripción *"placeholder={esVenta?"Venta Amarok 2020":"Detalle..."}value={desc}onChange={e=>setDesc(e.target.value)}/>
        {necesitaVeh&&<div style={{display:"grid",gridTemplateColumns:esVenta?"1fr 1fr":"1fr",gap:12,alignItems:"start"}}>
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            <Inp label={esVenta?"Patente vehículo vendido":esCompra?"Patente vehículo comprado":"Patente vehículo asociado"}placeholder="Ej: AA123BC"value={patente}maxLength={8}style={{textTransform:"uppercase",letterSpacing:"0.1em",fontWeight:700}}onChange={e=>handlePatente(e.target.value)}/>
            {estadoPat==="encontrado"&&vehEnStock&&<div style={{background:"rgba(34,197,94,0.08)",border:"1px solid rgba(34,197,94,0.3)",borderRadius:10,padding:"10px 14px"}}><div style={{color:G.green,fontWeight:800,fontSize:13}}>✓ {vehEnStock.patente} — {vehEnStock.descripcion}</div><div style={{color:G.textDim,fontSize:11,fontWeight:600,marginTop:2}}>En stock · Costo: {fmt(parseFloat(vehEnStock.costo))}</div></div>}
            {estadoPat==="no_encontrado"&&<div style={{background:"rgba(245,158,11,0.08)",border:"1px solid rgba(245,158,11,0.3)",borderRadius:10,padding:"10px 14px"}}><div style={{color:G.amber,fontWeight:800,fontSize:12,marginBottom:8}}>⚠ {patente} no está en el stock</div><div style={{display:"flex",gap:8}}><button style={{...s.btnPrimary,padding:"6px 14px",fontSize:12}}onClick={()=>setEstadoPat("form")}>+ Cargar datos</button><button style={{...s.btnGhost,padding:"6px 14px",fontSize:12}}onClick={()=>setEstadoPat("pendiente")}>Dejar pendiente</button></div></div>}
            {estadoPat==="pendiente"&&<div style={{background:G.input,border:`1px solid ${G.inputBorder}`,borderRadius:10,padding:"8px 14px"}}><span style={{color:G.textSub,fontSize:12,fontWeight:600}}>⚠ Se guardará como pendiente</span></div>}
            {estadoPat==="confirmado"&&<div style={{background:"rgba(34,197,94,0.08)",border:"1px solid rgba(34,197,94,0.3)",borderRadius:10,padding:"10px 14px"}}><div style={{color:G.green,fontWeight:800,fontSize:13}}>✓ {patente} — {formVeh.descripcion}</div><div style={{color:G.textDim,fontSize:11,fontWeight:600,marginTop:2}}>Entrará al stock · Costo: {fmt(parseFloat(formVeh.costo))}</div></div>}
            {estadoPat==="form"&&<div style={{background:G.input,border:`1px solid ${G.gold}`,borderRadius:12,padding:16,display:"flex",flexDirection:"column",gap:10}}><div style={{color:G.gold,fontWeight:800,fontSize:12,textTransform:"uppercase"}}>Nuevo vehículo — {patente}</div><Inp label="Descripción *"placeholder="Amarok 2020"value={formVeh.descripcion}onChange={e=>setFormVeh(p=>({...p,descripcion:e.target.value}))}/><div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}><Inp label="Marca"placeholder="VW"value={formVeh.marca}onChange={e=>setFormVeh(p=>({...p,marca:e.target.value}))}/><Inp label="Modelo"placeholder="Amarok"value={formVeh.modelo}onChange={e=>setFormVeh(p=>({...p,modelo:e.target.value}))}/><Inp label="Año"placeholder="2020"value={formVeh.anio}onChange={e=>setFormVeh(p=>({...p,anio:e.target.value}))}/></div><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}><Inp label="Costo ($) *"type="number"placeholder="0"value={formVeh.costo}onChange={e=>setFormVeh(p=>({...p,costo:e.target.value}))}/><Sel label="Tipo"options={["Compra directa","Parte de pago"].map(x=>({v:x,l:x}))}value={formVeh.tipoEntrada}onChange={e=>setFormVeh(p=>({...p,tipoEntrada:e.target.value}))}/></div><div style={{display:"flex",gap:8}}><button style={{...s.btnPrimary,padding:"8px 16px",fontSize:12,opacity:(!formVeh.descripcion||!formVeh.costo)?0.4:1}}disabled={!formVeh.descripcion||!formVeh.costo}onClick={()=>{if(formVeh.descripcion&&formVeh.costo)setEstadoPat("confirmado");}}>✓ Confirmar</button><button style={{...s.btnGhost,padding:"8px 16px",fontSize:12}}onClick={()=>setEstadoPat("no_encontrado")}>Cancelar</button></div></div>}
          </div>
          {esVenta&&<Sel label="Vendedor"options={[{v:"",l:"— Vendedor —"},...VENDEDORES.map(v=>({v,l:v}))]}value={vendedor}onChange={e=>setVendedor(e.target.value)}/>}
        </div>}
        {esGastoGen&&PLAN[cuenta]?.esAnticipo&&<Sel label="Empleado *"options={[{v:"",l:"— Empleado —"},...VENDEDORES.map(v=>({v,l:v}))]}value={vendedor}onChange={e=>setVendedor(e.target.value)}/>}
        <Inp label="Importe ($) *"type="number"placeholder="0"value={importe}onChange={e=>setImporte(e.target.value)}/>
        {esVenta&&<FormasPagoForm formas={formas}setFormas={setFormas}total={imp}allowEspecie={true}/>}
        {!esVenta&&<FormasPagoForm formas={formas}setFormas={setFormas}total={imp}allowEspecie={false}/>}
        <Inp label="Notas"placeholder="Observaciones..."value={notas}onChange={e=>setNotas(e.target.value)}/>
        <div style={{display:"flex",gap:12,paddingTop:12,borderTop:`1px solid ${G.cardBorder}`,alignItems:"center",flexWrap:"wrap"}}>
          <Btn onClick={guardar}disabled={!canSave}size="lg">Guardar</Btn>
          <Btn variant="ghost"onClick={()=>{reset();onClose();}}>Cancelar</Btn>
          {esVenta&&!cobrosOk&&imp>0&&<span style={{fontSize:12,color:G.red,fontWeight:600}}>El total de formas de cobro no cierra</span>}
        </div>
      </div>
    </Modal>
  );
}

// ─── MODAL VEHICULO ───────────────────────────────────────────────────────────
function ModalVehiculo({open,onClose,onSave}){
  const [f,setF]=useState({patente:"",descripcion:"",marca:"",modelo:"",anio:"",costo:"",tipo:"Compra directa",fecha:hoy(),notas:""});
  const upd=(k,v)=>setF(p=>({...p,[k]:v}));
  const guardar=()=>{onSave({...f,id:uid(),estado:"En stock",operacionOrigenId:null,fechaVenta:null,precioVenta:null});setF({patente:"",descripcion:"",marca:"",modelo:"",anio:"",costo:"",tipo:"Compra directa",fecha:hoy(),notas:""});onClose();};
  return<Modal open={open}onClose={onClose}title="Alta de vehículo"size="lg"><div style={{display:"flex",flexDirection:"column",gap:12}}><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}><Inp label="Patente *"placeholder="AA123BC"value={f.patente}style={{textTransform:"uppercase"}}onChange={e=>upd("patente",e.target.value.toUpperCase())}/><Inp label="Descripción *"placeholder="Amarok 2020"value={f.descripcion}onChange={e=>upd("descripcion",e.target.value)}/></div><div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12}}><Inp label="Marca"value={f.marca}onChange={e=>upd("marca",e.target.value)}/><Inp label="Modelo"value={f.modelo}onChange={e=>upd("modelo",e.target.value)}/><Inp label="Año"value={f.anio}onChange={e=>upd("anio",e.target.value)}/></div><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}><Inp label="Costo ($) *"type="number"value={f.costo}onChange={e=>upd("costo",e.target.value)}/><Sel label="Tipo"options={["Compra directa","Parte de pago"].map(x=>({v:x,l:x}))}value={f.tipo}onChange={e=>upd("tipo",e.target.value)}/></div><Inp label="Fecha ingreso"type="date"value={f.fecha}onChange={e=>upd("fecha",e.target.value)}/><Inp label="Notas"value={f.notas}onChange={e=>upd("notas",e.target.value)}/><div style={{display:"flex",gap:12,paddingTop:12,borderTop:`1px solid ${G.cardBorder}`}}><Btn onClick={guardar}disabled={!f.patente||!f.descripcion||!f.costo}>Dar de alta</Btn><Btn variant="ghost"onClick={onClose}>Cancelar</Btn></div></div></Modal>;
}

// ─── APP PRINCIPAL ────────────────────────────────────────────────────────────
const TABS=[
  {id:"dashboard",label:"Dashboard",icon:"◎"},
  {id:"registros",label:"Registros",icon:"≡"},
  {id:"stock",label:"Stock",icon:"⊡"},
  {id:"resultado",label:"Est. Resultado",icon:"%"},
  {id:"rentabilidad",label:"Rentabilidad",icon:"★"},
  {id:"flujo",label:"Flujo de Fondos",icon:"∿"},
  {id:"cheques",label:"Cheques",icon:"✓"},
  {id:"anticipos",label:"Anticipos",icon:"👤"},
];

export default function App(){
  const [tab,setTab]=useState("dashboard");
  const [registros,setRegistros]=useState([]);
  const [vehiculos,setVehiculos]=useState([]);
  const [modReg,setModReg]=useState(false);
  const [modVeh,setModVeh]=useState(false);
  const [loading,setLoading]=useState(true);

  // ── Cargar datos desde Supabase al iniciar ──
  useEffect(()=>{
    const cargar=async()=>{
      setLoading(true);
      const[{data:vData},{data:rData}]=await Promise.all([
        supabase.from("vehiculos").select("*").order("fecha",{ascending:false}),
        supabase.from("registros").select("*").order("fecha",{ascending:false}),
      ]);
      if(vData)setVehiculos(vData.map(dbVehToLocal));
      if(rData)setRegistros(rData.map(dbRegToLocal));
      setLoading(false);
    };
    cargar();
  },[]);

  // ── Guardar registro ──
  const saveRegistro=useCallback(async reg=>{
    // Crear vehículo nuevo si corresponde
    if(reg._vehNuevo){
      const{error}=await supabase.from("vehiculos").insert([localVehToDB(reg._vehNuevo)]);
      if(!error)setVehiculos(p=>[reg._vehNuevo,...p]);
    }
    // Guardar registro
    const{_vehNuevo,...r}=reg;
    const{error}=await supabase.from("registros").insert([localRegToDB(r)]);
    if(!error){
      setRegistros(p=>[r,...p]);
      // Marcar vehículo vendido
      if(r.esIngreso&&r.vehiculoId&&r.vehiculoId!=="__na__"){
        const updates={estado:"Vendido",precio_venta:r.importe,vendedor:r.vendedor,fecha_venta:r.fecha};
        await supabase.from("vehiculos").update(updates).eq("id",r.vehiculoId);
        setVehiculos(p=>p.map(v=>v.id===r.vehiculoId?{...v,estado:"Vendido",precioVenta:r.importe,vendedor:r.vendedor,fechaVenta:r.fecha}:v));
      }
      // Vehículos en especie → entran al stock
      (r.formas||[]).filter(f=>f.tipo==="Especie (vehículo)"&&f.patente).forEach(async f=>{
        const nuevoVeh={id:uid(),patente:f.patente,descripcion:f.descVeh||f.patente,costo:f.importe,tipo:"Parte de pago",fecha:r.fecha,estado:"En stock",operacionOrigenId:r.vehiculoId||r.id,fechaVenta:null,precioVenta:null};
        await supabase.from("vehiculos").insert([localVehToDB(nuevoVeh)]);
        setVehiculos(p=>[nuevoVeh,...p]);
      });
    }
  },[]);

  // ── Guardar vehículo ──
  const saveVehiculo=useCallback(async veh=>{
    const{error}=await supabase.from("vehiculos").insert([localVehToDB(veh)]);
    if(!error){
      setVehiculos(p=>[veh,...p]);
      if(veh.tipo==="Compra directa"&&veh.costo){
        const reg={id:uid(),tipo:"Compra de vehículo",fecha:veh.fecha,descripcion:`Compra ${veh.descripcion} — ${veh.patente}`,cuenta:"2.1",vehiculoId:veh.id,importe:parseFloat(veh.costo),esIngreso:false,formas:[],notas:"",vendedor:"",esAnticipo:false,empleadoAnticipo:""};
        await supabase.from("registros").insert([localRegToDB(reg)]);
        setRegistros(p=>[reg,...p]);
      }
    }
  },[]);

  // ── Eliminar registro ──
  const eliminarRegistro=useCallback(async id=>{
    await supabase.from("registros").delete().eq("id",id);
    setRegistros(p=>p.filter(r=>r.id!==id));
  },[]);

  const calcER=(regsArr,mes)=>{
    const regs=regsArr.filter(r=>r.fecha?.startsWith(mes)&&!r.esAnticipo);
    const sumG=grupo=>regs.filter(r=>PLAN[r.cuenta]?.grupo===grupo&&!r.esIngreso).reduce((s,r)=>s+r.importe,0);
    const ingresos=regs.filter(r=>r.esIngreso).reduce((s,r)=>s+r.importe,0);
    const cmv=sumG("Costo de Mercadería"),gBruta=ingresos-cmv;
    const comercial=sumG("Gastos de Comercialización"),resComercial=gBruta-comercial;
    const admin=sumG("Gastos de Administración"),ebitda=resComercial-admin;
    const impositivos=sumG("Gastos Impositivos"),bancarios=sumG("Gastos Bancarios"),resAntesExtr=ebitda-impositivos-bancarios;
    const extraordinarios=sumG("Gastos Extraordinarios"),resNeto=resAntesExtr-extraordinarios;
    const retiro=sumG("Retiro del Socio"),resDespRetiro=resNeto-retiro;
    const detalle={};
    Object.values(PLAN).forEach(c=>{detalle[c.codigo]=regs.filter(r=>r.cuenta===c.codigo).reduce((s,r)=>s+r.importe,0);});
    return{ingresos,cmv,gBruta,comercial,resComercial,admin,ebitda,impositivos,bancarios,resAntesExtr,extraordinarios,resNeto,retiro,resDespRetiro,detalle,regs};
  };

  const tabActivo={background:G.goldDim,color:G.gold,border:`1px solid ${G.goldBorder}`,fontWeight:800};
  const tabInactivo={background:"transparent",color:G.textDim,border:"1px solid transparent",fontWeight:600};

  if(loading){
    return<div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:G.bg,fontFamily:F}}>
      <div style={{textAlign:"center"}}>
        <div style={{width:48,height:48,borderRadius:"50%",border:`3px solid ${G.gold}`,borderTopColor:"transparent",margin:"0 auto 16px",animation:"spin 1s linear infinite"}}/>
        <div style={{color:G.textSub,fontWeight:700,fontSize:14}}>Cargando JP Automotores...</div>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    </div>;
  }

  // ── Secciones simplificadas (dashboard y registros inline, resto importados) ──
  const mesesDisp=[...new Set(registros.map(r=>r.fecha?.slice(0,7)))].filter(Boolean).sort().reverse();

  return(
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
          {TABS.map(t=><button key={t.id}onClick={()=>setTab(t.id)}style={{width:"100%",textAlign:"left",padding:"9px 12px",borderRadius:8,fontSize:12,cursor:"pointer",display:"flex",alignItems:"center",gap:8,transition:"all 0.15s",fontFamily:F,...(tab===t.id?tabActivo:tabInactivo)}}><span style={{width:16,textAlign:"center"}}>{t.icon}</span>{t.label}</button>)}
        </nav>
        <div style={{padding:"12px 16px",borderTop:`1px solid ${G.sidebarBorder}`}}>
          <div style={{fontSize:10,color:G.textDim,fontWeight:600,lineHeight:1.8}}>{registros.length} registros<br/>{vehiculos.filter(v=>v.estado==="En stock").length} en stock<br/>{vehiculos.filter(v=>v.estado==="Vendido").length} vendidos</div>
        </div>
      </aside>
      <main style={{flex:1,overflowY:"auto",background:G.bg}}>
        <div style={{maxWidth:1200,margin:"0 auto",padding:32}}>
          <div style={{color:G.text,fontSize:24,fontWeight:900,marginBottom:24}}>
            {tab==="dashboard"&&"Dashboard"}
            {tab==="registros"&&"Registro Central"}
            {tab==="stock"&&"Stock de Vehículos"}
            {tab==="resultado"&&"Estado de Resultado"}
            {tab==="rentabilidad"&&"Rentabilidad por Vehículo"}
            {tab==="flujo"&&"Flujo de Fondos"}
            {tab==="cheques"&&"Planilla de Cheques"}
            {tab==="anticipos"&&"Anticipos de Empleados"}
          </div>
          
          {/* Botones de acción */}
          {tab==="registros"&&<div style={{marginBottom:16}}><Btn onClick={()=>setModReg(true)}size="lg">+ Nuevo registro</Btn></div>}
          {tab==="stock"&&<div style={{marginBottom:16}}><Btn onClick={()=>setModVeh(true)}>+ Alta vehículo</Btn></div>}

          {/* Tabla de registros */}
          {tab==="registros"&&<Card><div style={{overflowX:"auto"}}><table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}><thead><tr style={{borderBottom:`1px solid ${G.cardBorder}`}}>{["Fecha","Tipo","Descripción","Vehículo","Importe",""].map(h=><th key={h}style={{padding:"12px",textAlign:h==="Importe"?"right":"left",color:G.textSub,fontWeight:700,fontSize:11,textTransform:"uppercase"}}>{h}</th>)}</tr></thead><tbody>{registros.length===0&&<tr><td colSpan={6}style={{textAlign:"center",padding:48,color:G.textDim,fontWeight:600}}>Sin registros. Hacé click en "+ Nuevo registro".</td></tr>}{registros.map(r=>{const veh=vehiculos.find(v=>v.id===r.vehiculoId);const tcol={"Venta de vehículo":"gold","Compra de vehículo":"blue","Gasto por vehículo":"amber","Gasto general":"gray"};return<tr key={r.id}style={{borderBottom:`1px solid ${G.cardBorder}`}}><td style={{padding:"12px",color:G.textSub,fontWeight:600}}>{fmtF(r.fecha)}</td><td style={{padding:"12px"}}><Badge color={tcol[r.tipo]}>{r.tipo.replace(" de vehículo","").replace(" general","")}</Badge></td><td style={{padding:"12px",color:G.text,fontWeight:600}}>{r.descripcion}</td><td style={{padding:"12px",fontSize:11}}>{veh?<span style={{fontFamily:"monospace",color:G.textSub,fontWeight:700}}>{veh.patente}</span>:r.vehiculoId==="__na__"?<span style={{color:G.amber,fontWeight:700}}>⚠ Sin asignar</span>:"—"}</td><td style={{padding:"12px",textAlign:"right",fontFamily:"monospace",fontWeight:800,color:r.esIngreso?G.green:G.red}}>{r.esIngreso?"+":"-"}{fmt(r.importe)}</td><td style={{padding:"12px",textAlign:"right"}}><Btn variant="danger"size="sm"onClick={()=>eliminarRegistro(r.id)}>✕</Btn></td></tr>})}</tbody></table></div></Card>}

          {/* Stock */}
          {tab==="stock"&&<Card><div style={{overflowX:"auto"}}><table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}><thead><tr style={{borderBottom:`1px solid ${G.cardBorder}`}}>{["Patente","Descripción","Costo entrada","Estado"].map(h=><th key={h}style={{padding:"12px",textAlign:["Costo entrada"].includes(h)?"right":"left",color:G.textSub,fontWeight:700,fontSize:11,textTransform:"uppercase"}}>{h}</th>)}</tr></thead><tbody>{vehiculos.length===0&&<tr><td colSpan={4}style={{textAlign:"center",padding:48,color:G.textDim,fontWeight:600}}>Sin vehículos. Cargá uno desde Registros o "+ Alta vehículo".</td></tr>}{vehiculos.map(v=><tr key={v.id}style={{borderBottom:`1px solid ${G.cardBorder}`}}><td style={{padding:"12px",fontFamily:"monospace",color:G.text,fontWeight:800}}>{v.patente}</td><td style={{padding:"12px",color:G.text,fontWeight:600}}>{v.descripcion}</td><td style={{padding:"12px",textAlign:"right",fontFamily:"monospace",color:G.textSub,fontWeight:600}}>{fmt(parseFloat(v.costo)||0)}</td><td style={{padding:"12px"}}><Badge color={v.estado==="En stock"?"gold":v.estado==="Vendido"?"gray":"amber"}>{v.estado}</Badge></td></tr>)}</tbody></table></div></Card>}

          {/* Dashboard básico */}
          {tab==="dashboard"&&(()=>{
            const mesAct=new Date().toISOString().slice(0,7);
            const er=calcER(registros,mesAct);
            const enStock=vehiculos.filter(v=>v.estado==="En stock");
            const vMes=vehiculos.filter(v=>v.fechaVenta?.startsWith(mesAct));
            return<div style={{display:"flex",flexDirection:"column",gap:16}}>
              <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12}}>
                <KPI label="Autos vendidos" value={vMes.length.toString()} color={G.text} sub={mesL(mesAct)}/>
                <KPI label="Ingresos" value={fmtM(er.ingresos)} color={G.green}/>
                <KPI label="Ganancia bruta" value={fmtM(er.gBruta)} color={er.gBruta>=0?G.gold:G.red} sub={`Margen ${pct(er.gBruta,er.ingresos)}`}/>
                <KPI label="En stock" value={enStock.length.toString()} color={G.amber} sub="vehículos"/>
              </div>
              <Card style={{padding:20}}>
                <div style={{fontWeight:800,color:G.text,fontSize:14,marginBottom:8}}>Últimos movimientos</div>
                {registros.slice(0,8).map(r=><div key={r.id}style={{display:"flex",justifyContent:"space-between",padding:"8px 0",borderBottom:`1px solid ${G.cardBorder}`}}><div><div style={{color:G.text,fontSize:13,fontWeight:600}}>{r.descripcion}</div><div style={{color:G.textDim,fontSize:11,fontWeight:600}}>{fmtF(r.fecha)}</div></div><span style={{fontFamily:"monospace",fontWeight:800,color:r.esIngreso?G.green:G.red}}>{r.esIngreso?"+":"-"}{fmt(r.importe)}</span></div>)}
                {registros.length===0&&<div style={{color:G.textDim,fontSize:13,fontWeight:600,textAlign:"center",padding:24}}>Sin movimientos aún</div>}
              </Card>
            </div>;
          })()}

          {/* Placeholder para otras secciones */}
          {["resultado","rentabilidad","flujo","cheques","anticipos"].includes(tab)&&<Card style={{padding:40,textAlign:"center"}}><div style={{color:G.textSub,fontWeight:700,fontSize:14}}>Esta sección estará disponible en la próxima versión del sistema.</div><div style={{color:G.textDim,fontSize:12,marginTop:8}}>Por ahora usá el prototipo de Claude para ver estas métricas.</div></Card>}
        </div>
      </main>
      <ModalRegistro open={modReg}onClose={()=>setModReg(false)}onSave={saveRegistro}vehiculos={vehiculos}/>
      <ModalVehiculo open={modVeh}onClose={()=>setModVeh(false)}onSave={saveVehiculo}/>
    </div>
  );
}
