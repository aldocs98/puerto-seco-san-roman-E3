/* IFP0298 | E3 Rev2: visualización descriptiva. NO recalibra ni altera E2. */
(()=>{
'use strict';
const DATA='e3/rev2_data/';
const fmt=(x,d=0)=>x===null||x===undefined?'—':Number(x).toLocaleString('es-PE',{minimumFractionDigits:d,maximumFractionDigits:d});
const esc=s=>String(s??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const htmlTable=(heads,rows,numberIndices=[])=>`<div class="tbl-wrap"><table><thead><tr>${heads.map((h,i)=>`<th class="${numberIndices.includes(i)?'right':''}">${esc(h)}</th>`).join('')}</tr></thead><tbody>${rows.map(r=>`<tr>${r.map((v,i)=>`<td class="${numberIndices.includes(i)?'right':''}">${typeof v==='number'?fmt(v,i===5?1:0):esc(v)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
const kpi=(value,label,source='')=>`<article class="kpi"><div class="value">${esc(value)}</div><div class="label">${esc(label)}</div><div class="source">${esc(source)}</div></article>`;
const intro=(num,title,sub)=>`<div class="section-intro"><div class="eyebrow">E3 REV2 / ${num}</div><h2>${title}</h2><p>${sub}</p></div>`;
const panel=(title,content,cls='',desc='')=>`<section class="panel ${cls}"><h3>${title}</h3>${desc?`<p class="panel-sub">${desc}</p>`:''}${content}</section>`;
const chart=id=>`<div id="${id}" class="plot"></div>`;
const notice=(text,kind='')=>`<div class="notice ${kind}">${text}</div>`;
const sourceNote='Fuente: Informe E3 rev2, tablas 3, 10, 13 y anexos IV–V.';
let D=null,A=null,G=null,map=null,view='resumen',capYear=2032,sim3d=false;
const screen=document.getElementById('screen');
const layout=(title='',yTitle='')=>({margin:{l:60,r:18,t:32,b:50},paper_bgcolor:'#ffffff',plot_bgcolor:'#ffffff',font:{family:'Arial, Helvetica, sans-serif',size:11,color:'#4b4b4b'},title:{text:title,font:{size:13}},yaxis:{title:yTitle,gridcolor:'#eeeeee',zerolinecolor:'#d8d8d8'},xaxis:{showgrid:false},legend:{orientation:'h',y:-.22},hovermode:'closest',autosize:true});
const plot=(id,traces,opt={})=>{if(!document.getElementById(id))return;const lo={...layout(),...opt};Plotly.newPlot(id,traces,lo,{responsive:true,displayModeBar:false,displaylogo:false});};
const series=()=>D.horizonte;
function showResumen(){
 const fam=D.demanda_familias;
 screen.innerHTML=intro('01','Panorama de la demanda y el recinto','De las cadenas del E2 a las familias operativas, las capacidades del quinto año y el terreno de referencia. Información de carácter conceptual.')+
 `<div class="kpis">${kpi('267 kt','Demanda de diseño en el año 5 (2032)','Informe, sección 2.2')}${kpi('11.195 t','Capacidad estática P50, 2032','Tabla 10')}${kpi('24.928 m²','Área útil de referencia, 2032','Tabla 13')}${kpi('≈5 ha','Terreno conceptual con reserva','Sección 8.4')}</div>`+
 `<div class="grid">${panel('Evolución de la demanda capturable',chart('chart-demand'),'','Primer año con maduración del 50%; quinto año usado para dimensionar.')}${panel('Distribución por familia · plena operación 2028',chart('chart-family'),'','Solo el escenario central E2; frío y combustibles no capturados.')}${panel('Modelo operacional propuesto',`<div class="flow"><div class="flow-box"><b>Ingreso</b>Registro, gate y pesaje</div><div class="flow-arrow">→</div><div class="flow-box"><b>Control</b>Documentación e inspección</div><div class="flow-arrow">→</div><div class="flow-box"><b>Operación</b>Almacenaje, descarga o transferencia</div><div class="flow-arrow">→</div><div class="flow-box"><b>Salida</b>Despacho y distribución regional</div></div><p class="unit">Un núcleo compartido soporta plataforma internacional y distribución regional; la separación física y aduanera requiere ingeniería y autorización SUNAT.</p>`,'span2')}
 </div>`+notice('<b>Alcance:</b> este WebGIS reproduce las cifras del informe E3 rev2. Los percentiles P10/P50/P90 provienen de 2.048 combinaciones LHS; no representan intervalos de confianza. La reserva de 5 ha no corresponde a un predio definido.');
 plot('chart-demand',[{x:series().map(x=>x.anio),y:series().map(x=>x.demanda_kt),type:'scatter',mode:'lines+markers',line:{color:'#FFC000',width:3},marker:{size:9,color:'#333333'},name:'Demanda (kt/año)',fill:'tozeroy',fillcolor:'#FFC00018'}],{...layout('','kt/año'),xaxis:{tickmode:'array',tickvals:series().map(x=>x.anio)}});
 plot('chart-family',[{labels:fam.filter(f=>f.captacion_t>0).map(f=>f.familia),values:fam.filter(f=>f.captacion_t>0).map(f=>f.captacion_t),type:'pie',hole:.54,marker:{colors:['#FFC000','#4a4a4a','#a6a6a6']},textinfo:'percent',hovertemplate:'%{label}<br>%{value:,.0f} t/año (%{percent})<extra></extra>'}],{...layout(),margin:{t:15,b:15,l:12,r:12},showlegend:true});
}
function showDemanda(){
 const family=D.demanda_familias,rows=D.cadenas;
 screen.innerHTML=intro('02','Demanda y 14 cadenas','Las 41 fichas de producto del E2 se agrupan por manipulación en familias para definir la infraestructura. Las cadenas representan conjuntos logísticos, no recorridos dibujados de manera artificial.')+
 `<div class="kpis">${kpi('247.141 t','Captación central a plena operación, base 2028','Tabla 3')}${kpi('14','Cadenas logísticas','Anexo III')}${kpi('41','Perfiles E2 de entrada','Modelo reproducible')}${kpi('≈98%','Granel y carga general','Tabla 3')}</div>`+
 `<div class="grid">${panel('Captación por cadena',chart('chains'),'span2')}${panel('Captación por familia',htmlTable(['Familia','Captación t/año','Participación','Tratamiento'],family.map(f=>[f.familia,f.captacion_t,f.participacion,f.tratamiento]),[1]),'span2')}${panel('14 cadenas · mercado y captación',htmlTable(['Cadena','Mercado 2028 (t)','Captación (t)','Familias / régimen'],rows.map(r=>[r.cadena,r.mercado_t,r.captacion_t,r.familias_regimen]),[1,2]),'span2')}</div>`+
 notice('La Tabla 24 suma <b>247.143 t</b>, mientras la Tabla 3 publica <b>247.141 t</b>. El archivo conserva ambas series tal como aparecen en la rev2; la diferencia es de 2 t y debe documentarse, no redistribuirse silenciosamente.');
 const sorted=[...rows].sort((a,b)=>b.captacion_t-a.captacion_t);
 plot('chains',[{x:sorted.map(r=>r.captacion_t),y:sorted.map(r=>r.id),type:'bar',orientation:'h',marker:{color:'#FFC000'},hovertext:sorted.map(r=>r.cadena),hovertemplate:'%{hovertext}: %{x:,.0f} t<extra></extra>'}],{...layout('Captación E2 · referencia 2028',''),margin:{l:55,b:35,r:18,t:35},height:460,yaxis:{autorange:'reversed',gridcolor:'#eeeeee'},xaxis:{title:'t/año',showgrid:true,gridcolor:'#eeeeee'}});
}
function showBenchmark(){
 const b=D.benchmark;
 screen.innerHTML=intro('03','Benchmarking nacional e internacional','Se distingue demanda de diseño EVTE, movimiento observado y proyecciones del proyecto. Para comparar superficies se usan las versiones originales compatibles entre sí.')+
 `<div class="grid">${panel('Demanda de diseño',chart('bench-demand'))}${panel('Área útil',chart('bench-area'))}${panel('Indicadores documentados',htmlTable(['Referencia','Demanda (t/año)','Almacén (m²)','Área útil (m²)','m²/kt'],b.map(r=>[r.nombre,r.demanda_t,r.almacen_m2,r.area_util_m2,r.ratio_m2_por_kt]),[1,2,3,4]),'span2')}</div>`+
 notice('<b>Comparabilidad:</b> Cuiabá, Boa Vista y Ponta Porã son valores de EVTE, San Román es una estimación conceptual. Ponta Porã utiliza conjuntamente la demanda de 471.089 t y 32.352 m² del expediente de 2018. ZOFRATACNA y ZEEDEPUNO se analizan funcionalmente, sin mezclarlas en el cociente m²/kt.')+
 panel('Otras referencias de la rev2',htmlTable(['Referencia','Clasificación','Dato de referencia'],[['AGESA · Corumbá','Operacional','250.000 m² de terreno; capacidad publicada para 550 camiones'],['Anápolis','Operacional','Movimiento informado ≈688 kt/año (referencia del E2)'],['Aurora EADI · Manaus','Operacional','Movimiento informado 278 kt en 2025 (sección 3.3)'],['ZOFRATACNA','Zona franca','390 ha totales; 180 ha habilitadas (sección 3.1)'],['ZEEDEPUNO','Zona económica en proyecto','134 ha en fuente de 2022; otras secciones emplean 130 ha']]),'');
 plot('bench-demand',[{type:'bar',x:b.map(a=>a.nombre),y:b.map(a=>a.demanda_t/1000),marker:{color:['#747474','#999','#565656','#FFC000']},text:b.map(a=>`${fmt(a.demanda_t/1000,1)} kt`),textposition:'outside'}],{...layout('','kt/año'),margin:{l:60,b:60,r:15,t:30}});
 plot('bench-area',[{type:'bar',x:b.map(a=>a.nombre),y:b.map(a=>a.area_util_m2),marker:{color:['#747474','#999','#565656','#FFC000']},text:b.map(a=>fmt(a.area_util_m2)),textposition:'outside'}],{...layout('','m²'),margin:{l:70,b:60,r:15,t:30}});
}
function showMapa(){
 screen.innerHTML=intro('04','Mapa de los puertos secos operacionales','Los marcadores azules representan recintos operacionales de referencia. Los casos EVTE de Boa Vista y Ponta Porã no se etiquetan como recintos operacionales y no se georreferencian mediante coordenadas inventadas.')+
 `<div class="kpis">${kpi('4','Puertos secos operacionales mapeados','Brasil')}${kpi('1','Localizador de contexto Juliaca','Predio no seleccionado')}${kpi('OSM','Mapa base','OpenStreetMap')}${kpi('E1','Capas de corredores','GeoJSON local')}</div>`+
 `${panel('Localización de los casos con respaldo espacial',`<div id="rev2map" class="map"></div><div class="map-source">Fuente espacial: operador / Receita Federal / georreferenciación de dirección indicada por punto. Las etiquetas permanecen visibles; haciendo clic se abre la ficha de precisión y fuente.</div>`,'span2')}`;
 setTimeout(buildMap,60);
}
async function buildMap(){
 const e=document.getElementById('rev2map');if(!e)return;
 if(map){map.remove();map=null}
 map=L.map(e,{zoomControl:true});
 const osm=L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'© OpenStreetMap contributors'}).addTo(map);
 const carto=L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',{maxZoom:20,attribution:'© OpenStreetMap contributors © CARTO'});
 const on=L.layerGroup().addTo(map),proj=L.layerGroup().addTo(map);
 const group=[];
 G.features.forEach(f=>{
  const p=f.properties;const la=f.geometry.coordinates[1],lo=f.geometry.coordinates[0];group.push([la,lo]);
  const color=p.clase==='proyecto'?'#ffb900':'#237abb';
  const marker=L.circleMarker([la,lo],{radius:9,color:'#fff',weight:2,fillColor:color,fillOpacity:1});
  marker.bindTooltip(esc(p.nombre),{permanent:true,opacity:1,direction:'right',offset:[9,0],className:'map-label'});
  const url=p.fuente_url?`<a href="${esc(p.fuente_url)}" target="_blank" rel="noopener noreferrer">Abrir fuente</a>`:'Fuente: informe E3';
  marker.bindPopup(`<b>${esc(p.nombre)}</b><br><b>Ubicación:</b> ${esc(p.ciudad)}<br><b>Precisión:</b> ${esc(p.precision)}<br><b>Nota:</b> ${esc(p.nota)}<br>${url}`);
  marker.addTo(p.clase==='proyecto'?proj:on);
 });
 const overlays={'Puertos secos operacionales':on,'San Román (referencia urbana)':proj};
 try{
  const r=await fetch('capas/corredores.geojson');if(r.ok){const c=await r.json();const layer=L.geoJSON(c,{style:()=>({color:'#c67b09',opacity:.76,weight:2})});overlays['Corredores logísticos E1']=layer;layer.addTo(map);}
 }catch(err){console.warn('Capa de corredores no disponible',err)}
 L.control.layers({'OpenStreetMap':osm,'Carto Light':carto},overlays,{collapsed:false}).addTo(map);
 map.fitBounds(group,{padding:[55,75]});
 setTimeout(()=>{if(map)map.invalidateSize()},250);
}
function showCapacidad(){
 const c=D.capacidades_2032;
 const st=c.find(x=>x.servicio.startsWith('Capacidad estática'));
 screen.innerHTML=intro('05','Capacidades y sensibilidad operacional','Modelo operacional reproducible con 2.048 combinaciones LHS, semilla 20261110. Los percentiles caracterizan un conjunto de escenarios exploratorios; las variables no están calibradas con observaciones locales.')+
 `<div class="kpis">${kpi(fmt(st.p50)+' t','Capacidad estática P50','2032, Tabla 10')}${kpi(fmt(st.p10)+'–'+fmt(st.p90)+' t','Intervalo de escenarios P10–P90','2032, Tabla 10')}${kpi('3 carriles','Gate recomendado P50','Tabla 10')}${kpi('6 docas','Configuración de diseño','Sección 7 y Tabla 12')}</div>`+
 `<div class="grid">${panel('Inventario estático P10 – P50 – P90, 2028–2055',chart('stock-line'),'span2')}${panel('Principales servicios · escenario 2032',htmlTable(['Servicio','P10','P50','P90','Unidad'],c.map(r=>[r.servicio,r.p10,r.p50,r.p90,r.unidad]),[1,2,3]),'span2')}${panel('Influencia de parámetros sobre capacidad estática',chart('spearman'),'span2','Correlación de Spearman reportada por la simulación auditada.')}${panel('Escenarios LHS de 2032 · dispersión',`<div class="action-row"><button class="pill active" id="sim2">2D</button><button class="pill" id="sim3">3D (PCA)</button></div>${chart('scatter')}`,'span2','Visualización directa de las 2.048 corridas, no una nueva simulación.')}</div>`+
 notice('<b>Parámetro verificado:</b> permanencia Brasil–Perú triangular de 5 a 25 días, con <b>moda de 15 días</b>. Las decisiones de diseño incluyen 6 docas, aunque el modelo estime 3 posiciones centrales para descarga, por separación física y holgura.') ;
 const years=D.horizonte.map(x=>x.anio);
 plot('stock-line',[
 {x:years,y:D.horizonte.map(x=>x.capacidad_p90_t),type:'scatter',mode:'lines',line:{width:0},showlegend:false,hoverinfo:'skip'},
 {x:years,y:D.horizonte.map(x=>x.capacidad_p10_t),type:'scatter',mode:'lines',fill:'tonexty',fillcolor:'#FFC00050',line:{width:0},name:'P10–P90',hoverinfo:'skip'},
 {x:years,y:D.horizonte.map(x=>x.capacidad_p50_t),type:'scatter',mode:'lines+markers',name:'P50',line:{width:3,color:'#303030'},marker:{size:8,color:'#FFC000'}}
 ],{...layout('','Inventario estático (t)'),xaxis:{tickvals:years}});
 const sensitivity=A.sensitivity.slice(0,10).reverse();
 plot('spearman',[{x:sensitivity.map(s=>s.rho_stock),y:sensitivity.map(s=>s.param),type:'bar',orientation:'h',marker:{color:sensitivity.map(s=>s.rho_stock>=0?'#ffc000':'#606060')}}],{...layout('',''),height:410,margin:{l:175,r:20,t:30,b:40},xaxis:{title:'ρ de Spearman',range:[-.48,.86],zeroline:true,zerolinecolor:'#8a8a8a'}});
 document.getElementById('sim2').addEventListener('click',()=>{sim3d=false;drawSim()});
 document.getElementById('sim3').addEventListener('click',()=>{sim3d=true;drawSim()});
 drawSim();
}
async function drawSim(){
 const dest=document.getElementById('scatter');if(!dest)return;
 const b2=document.getElementById('sim2'),b3=document.getElementById('sim3');
 if(b2)b2.classList.toggle('active',!sim3d);
 if(b3)b3.classList.toggle('active',sim3d);
 try{
 const r=await fetch(DATA+'escenarios_2048_2032.json');const s=await r.json();
 if(!document.getElementById('scatter'))return;
 if(!sim3d){
  plot('scatter',[{x:s.map(x=>x.dias_import),y:s.map(x=>x.capacidad),mode:'markers',type:'scattergl',name:'Ensayos',marker:{size:5,opacity:.55,color:s.map(x=>x.ocupacion),colorscale:'Viridis',colorbar:{title:'Ocup.'}},text:s.map(x=>'Ensayo '+x.n),hovertemplate:'Días importación %{x:.1f}<br>Capacidad %{y:,.0f} t<br>%{text}<extra></extra>'}],{...layout('','Capacidad estática (t)'),xaxis:{title:'Permanencia de importación (días)',showgrid:true,gridcolor:'#eee'},height:450});
 }else{
  plot('scatter',[{x:s.map(x=>x.pc1),y:s.map(x=>x.pc2),z:s.map(x=>x.capacidad),type:'scatter3d',mode:'markers',marker:{size:2.4,opacity:.7,color:s.map(x=>x.capacidad),colorscale:'Viridis',colorbar:{title:'t'}},hovertemplate:'PC1 %{x:.2f}<br>PC2 %{y:.2f}<br>Inventario %{z:,.0f} t<extra></extra>'}],{...layout(),scene:{xaxis:{title:'PC1'},yaxis:{title:'PC2'},zaxis:{title:'Inventario estático (t)'}},height:590,margin:{t:15,b:0,l:0,r:0}});
 }
 }catch(e){dest.innerHTML='<p>No se pudo cargar el archivo local de simulación. Inicia el servidor con el BAT suministrado.</p>'}
}
function showAreas(){
 const arr=D.areas_2032,mod=arr.filter(a=>!a.es_subtotal&&!a.es_total);
 screen.innerHTML=intro('06','Infraestructura y dimensionamiento de áreas','Se reproduce la memoria de la rev2 sobre capacidad estática P50 de 2032 y reglas de almacenamiento. Las superficies son conceptos de referencia que deberán refinarse en la ingeniería.')+
 `<div class="kpis">${kpi('24.928 m²','Área útil 2032','Tabla 13')}${kpi('12.019 m²','Subtotal cubierto','Tabla 13')}${kpi('2.494 m²','Patio contenedores','Tabla 13')}${kpi('≈5 ha','Terreno y reserva a 2055','Sección 8.4')}</div>`+
 `<div class="grid">${panel('Composición del área útil 2032',chart('area-composition'))}${panel('Efecto de alturas de apilamiento',chart('stack-areas'))}${panel('Módulos de superficie',htmlTable(['Componente','Área (m²)','Criterio'],arr.map(a=>[a.componente,a.area_m2,a.criterio]),[1]),'span2')}${panel('Zonificación conceptual por función',`<div class="flow"><div class="flow-box"><b>Frente</b>Gate, balanzas y oficinas</div><div class="flow-arrow">→</div><div class="flow-box"><b>Central</b>Granel y carga general</div><div class="flow-arrow">→</div><div class="flow-box"><b>Laterales</b>Contenedores, acero y patio</div><div class="flow-arrow">→</div><div class="flow-box"><b>Fondo</b>Inspección, seguridad y frío futuro</div></div><p class="unit">No representa un layout georreferenciado ni un levantamiento topográfico.</p>`,'span2')}</div>`+
 notice('<b>Carácter preliminar:</b> la demanda para 2055 llega a 439 kt/año y el informe estima alrededor de 3,5 ha útiles, más retiros, drenaje y reserva. Se requiere seleccionar predio y validar operación, SUNAT e ingeniería antes de definir superficie definitiva.');
 plot('area-composition',[{type:'pie',hole:.54,labels:mod.map(x=>x.componente),values:mod.map(x=>x.area_m2),textinfo:'none',marker:{colors:['#FFC000','#f0b121','#d9991f','#bb8b27','#757575','#454545','#9c9c9c','#656565','#ffd55b','#ad7c28','#969696','#c3c3c3','#333','#efca8c','#a9a9a9']}}],{...layout(),margin:{t:15,b:0,l:0,r:0},legend:{orientation:'v',x:1.04,y:1,font:{size:9}}});
 plot('stack-areas',[{x:['2 alturas','3 alturas','4 alturas','5 alturas'],y:[2494,1663,1247,998],type:'bar',name:'Contenedores',marker:{color:'#FFC000'}},{x:['2 alturas','3 alturas','4 alturas','5 alturas'],y:[4616,3077,2308,1846],type:'bar',name:'Carga general',marker:{color:'#4a4a4a'}}],{...layout('','m²'),barmode:'group'});
}
function showFases(){
 const f=D.fases;
 screen.innerHTML=intro('07','Estrategia de desarrollo por fases','La secuencia está condicionada por validación comercial, autorizaciones y utilización operativa. Las fechas son referenciales, no compromisos de construcción.')+
 `<div class="phasegrid">${f.map(o=>`<article class="phase"><h3>Fase ${esc(o.fase)} · ${esc(o.nombre)}</h3><div class="period">${esc(o.periodo)}</div><div class="area">${o.area_ha===null?'Por definir':fmt(o.area_ha,1)+' ha'}</div><p>${esc(o.descripcion)}</p></article>`).join('')}</div>`+
 panel('Condiciones previas a la inversión',htmlTable(['Condición','Validación necesaria'],[['Mercado','Compromisos de carga, permanencias reales y presentación física'],['Terreno','Acceso vial, geometría, topografía y reserva de crecimiento'],['Aduana','Depósito temporal y/o aduanero, condiciones SUNAT y tránsito por Juliaca'],['Equipamiento','Demanda de TEU, operaciones sobre camión, frío condicionado a SENASA'],['Viabilidad','Estudios de ingeniería y presupuesto de inversión']]))+
 notice('La Fase 0 antecede a una hipotética entrada en operación en 2028. No constituye cronograma contractual ni certificación de viabilidad de un predio concreto.');
}
function showTraza(){
 const p=D.par_sensibilidad;
 const files=[
 ['Demanda de 14 cadenas','e3/rev2_data/demanda_cadenas_e3_rev2.csv'],
 ['Demanda por familia','e3/rev2_data/demanda_familias_e3_rev2.csv'],
 ['Capacidades 2032','e3/rev2_data/capacidades_2032_e3_rev2.csv'],
 ['Horizonte 2028-2055','e3/rev2_data/serie_horizonte_e3_rev2.csv'],
 ['Areas 2032','e3/rev2_data/areas_2032_e3_rev2.csv'],
 ['Benchmark de diseño','e3/rev2_data/benchmark_comparativo_e3_rev2.csv'],
 ['Archivo GeoJSON de puertos secos','e3/rev2_data/puertos_secos_referencia_rev2.geojson'],
 ['Resumen auditado 2048 ensayos','e3/rev2_data/resultados_auditoria.json']];
 screen.innerHTML=intro('08','Fuentes, metodología y control de calidad','Las tablas y fórmulas se conservan con su procedencia. La memoria de simulación reproduce los cuantiles de la rev2; los archivos completos también están incluidos en el paquete de respaldo.')+
 panel('Modelo de servicios y capacidades',`<div class="files"><div class="file-row"><b>Carga por servicio</b><code>${esc(D.metodo.servicio)}</code></div><div class="file-row"><b>Capacidad estática</b><code>${esc(D.metodo.capacidad)}</code></div><div class="file-row"><b>Superficie</b><code>${esc(D.metodo.area)}</code></div></div>`)+
 `<div class="grid" style="margin-top:16px">${panel('Parámetros LHS reales',htmlTable(['Variable','Mínimo','Moda','Máximo','Unidad'],p.map(r=>[r.parametro,Number(r.min),Number(r.moda),Number(r.max),r.unidad]),[1,2,3]))}${panel('Descargas directas',`<div class="files">${files.map(([name,path])=>`<div class="file-row"><code>${esc(name)}</code><a href="${esc(path)}" download>Descargar ↗</a></div>`).join('')}</div>`)}</div>`+
 notice('<b>Controles pendientes documentados:</b> diferencia de 2 t entre Tablas 3 y 24, 130/134 ha para ZEEDEPUNO según sección y fuente, y la expresión de que 267 kt está “entre” 302 y 471 kt (en realidad, 267 es menor que ambas). Se conservan las cifras de la versión recibida para revisión editorial; no se cambiaron los datos.', 'bare')+
 notice('El visor no sustituye el informe firmado ni el archivo del modelo. Las fuentes originales E1/E2, las 28 tablas, el código, las 2.048 realizaciones y el archivo de auditoría están disponibles en el ZIP completo.');
}
function exportCurrent(){
 if(!D)return;
 let data=[],name='E3_rev2';
 if(view==='demanda'){data=D.cadenas;name='E3_rev2_14_cadenas'}
 else if(view==='benchmark'){data=D.benchmark;name='E3_rev2_benchmark'}
 else if(view==='capacidad'){data=D.capacidades_2032;name='E3_rev2_capacidades'}
 else if(view==='areas'){data=D.areas_2032;name='E3_rev2_areas'}
 else if(view==='fases'){data=D.fases;name='E3_rev2_fases'}
 else if(view==='traza'){data=D.par_sensibilidad;name='E3_rev2_parametros'}
 else{data=D.horizonte;name='E3_rev2_horizonte'}
 if(!data.length)return;
 const keys=Object.keys(data[0]);const val=x=>'"'+String(x??'').replace(/"/g,'""')+'"';
 const txt='\ufeff'+[keys.map(val).join(';'),...data.map(x=>keys.map(k=>val(x[k])).join(';'))].join('\r\n');
 const url=URL.createObjectURL(new Blob([txt],{type:'text/csv;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download=name+'.csv';a.click();URL.revokeObjectURL(url);
}
function render(v){view=v;document.querySelectorAll('#nav button').forEach(b=>b.classList.toggle('selected',b.dataset.view===v));if(map){map.remove();map=null}
 if(v==='resumen')showResumen();if(v==='demanda')showDemanda();if(v==='benchmark')showBenchmark();if(v==='mapa')showMapa();if(v==='capacidad')showCapacidad();if(v==='areas')showAreas();if(v==='fases')showFases();if(v==='traza')showTraza();
}
async function init(){
 try{
 const out=await Promise.all([fetch(DATA+'e3_rev2_dashboard.json'),fetch(DATA+'resultados_auditoria.json'),fetch(DATA+'puertos_secos_referencia_rev2.geojson')]);
 for(const r of out)if(!r.ok)throw new Error('Archivo faltante: '+r.url);
 [D,A,G]=await Promise.all(out.map(r=>r.json()));
 document.querySelectorAll('#nav button').forEach(b=>b.addEventListener('click',()=>render(b.dataset.view)));
 document.getElementById('csv').addEventListener('click',exportCurrent);
 render('resumen');
 }catch(err){console.error(err);screen.innerHTML=`${intro('ERROR','No se pudieron leer los datos locales','Ejecuta el BAT suministrado para iniciar el servidor Python en la carpeta WEBGIS.')}<div class="notice">${esc(err.message)}</div>`}
}
init();
})();
