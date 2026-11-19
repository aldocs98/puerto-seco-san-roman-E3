"use strict";
// Actualización focalizada sobre el WebGIS v2 original. Los módulos y la cartografía E1 no se alteran.
(function(){
  const fmt=(n,d=0)=>Number(n||0).toLocaleString('es-ES',{minimumFractionDigits:d,maximumFractionDigits:d});
  const safe=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const panel=()=>document.querySelector('#content');
  const mainMap=()=>window.map||((typeof map!=='undefined')?map:null);
  const report={market:3004877,potential:2647266,available:2382539,capture:247141,revenue:5237980,
    p10:113586,p50:246367,p90:423559,low:113.6,high:423.6,
    exportBrasAsia:26055857,totalBrasAsia:30182091};
  const labels={C01:'Bolivia → Perú · destino Juliaca/Puno',C02:'Perú → Bolivia · origen Juliaca/Puno',
    C03:'Tránsito boliviano · en paso por Juliaca',C04:'Brasil ↔ Perú · destino Juliaca/Puno',
    C05:'Matarani → Juliaca/Puno · destino',C06:'Diésel ferroviario Mollendo–Juliaca',
    C07:'Bolivia → Perú · en paso por Juliaca',C08:'Perú → Bolivia · en paso por Juliaca',
    C09:'Brasil ↔ Perú · en paso por Juliaca',C10:'Matarani → Puno · en paso por Juliaca',
    C11:'Bolivia → Perú · sin paso por Juliaca',C12:'Perú → Bolivia · sin paso por Juliaca',
    C13:'Tránsito boliviano · sin paso por Juliaca',C14:'Brasil ↔ Perú · sin paso por Juliaca'};
  const regimes={IMPORTACION:'Importación',EXPORTACION:'Exportación',TRANSITO:'Tránsito boliviano',BRASIL_PERU:'Brasil–Perú'};
  let cache={},overlays=[];
  const top=(title,intro)=>'<div class="eyebrow">PERFIL DE DEMANDA · ENTREGABLE 2</div><h1>'+safe(title)+'</h1><p class="intro">'+intro+'</p>';
  const source='<p class="e2small">Fuente: Informe Entregable N.º 2, 05/11/2026. Referencia 2028 · 14 cadenas · 41 perfiles. La estimación es exploratoria y condicionada a los supuestos documentados.</p>';
  function clear(){const m=mainMap();if(!m)return;overlays.forEach(l=>{if(m.hasLayer(l))m.removeLayer(l)});overlays=[];}
  async function get(name){if(!(name in cache)){cache[name]=await window.E2_LEER_JSON('e2/data/'+name+'.json');}return cache[name]}
  function evaluate(){const D=window.E2_MOTOR_DATA,E=window.E2_ENGINE_CALC;
    return D&&E?E.evaluate({...D.central,...(window.E2_ECONOMIC_UI?.getParams?.()||{})}):null;}
  function reference(){const D=window.E2_MOTOR_DATA,E=window.E2_ENGINE_CALC;
    return D&&E?E.evaluate({...D.central}):null;}
  async function mapGeo(path,style,popup,doFit=true){const m=mainMap();if(!m)return;
    const geo=await window.E2_LEER_JSON(path);if(!geo.features?.length)return;
    let layer=L.geoJSON(geo,{style,onEachFeature:(f,l)=>{if(popup)l.bindPopup(popup(f.properties||{}))}}).addTo(m);
    overlays.push(layer);if(doFit&&layer.getBounds?.().isValid())m.fitBounds(layer.getBounds(),{padding:[35,35]});return layer;}
  function aggr(records){const d={};for(const r of records||[]){let x=d[r.id]||(d[r.id]={id:r.id,market:0,q:0,revenue:0});x.market+=r.Q2028_t||0;x.q+=r.captacion_t||0;x.revenue+=r.ingresos_usd||0;}return Object.values(d).sort((a,b)=>a.id.localeCompare(b.id));}
  function statbox(label,value,small){return '<div class="e2stat"><span>'+label+'</span><strong>'+value+'</strong><small>'+small+'</small></div>'}
  function e2stats(){return '<div class="e2stats">'+statbox('Mercado de referencia',fmt(report.market)+' t','14 cadenas · 2028')+statbox('Carga compatible',fmt(report.potential)+' t','88% del mercado')+statbox('Captación central',fmt(report.capture)+' t/año','247,1 kt · año de plena operación')+statbox('Ingresos brutos', 'US$ '+fmt(report.revenue/1e6,2)+' M','Ticket medio US$ 21,19/t')+'</div>'}
  function tableChains(data){return '<div class="e2-scroll"><table class="e2-chain-table"><thead><tr><th>Cadena</th><th>Flujo</th><th>Mercado (t)</th><th>Captación (t)</th><th>Ticket (US$/t)</th></tr></thead><tbody>'+data.map(r=>'<tr><td>'+r.id+'</td><td>'+safe(labels[r.id]||'')+'</td><td>'+fmt(r.market)+'</td><td>'+fmt(r.q)+'</td><td>'+(r.q?fmt(r.revenue/r.q,2):'—')+'</td></tr>').join('')+'</tbody></table></div>'}
  function showProfile(){let a=reference(),scenario=evaluate();if(!a)throw Error('El motor de 41 perfiles no está disponible');let chains=aggr(a.records);
    let changed=scenario&&Math.abs(scenario.out.toneladas-a.out.toneladas)>0.05;
    panel().innerHTML=top('Mercado y perfil de demanda','Del universo reconstruido en el E1 a la captación del E2. Se mantienen las 14 cadenas y la subdivisión en 41 perfiles, sin añadir toneladas al mercado original.')+
      e2stats()+'<div class="e2well"><b>Estimación central de planificación:</b> '+fmt(report.capture)+' t/año y US$ '+fmt(report.revenue/1e6,2)+' M de ingresos brutos. '+
      '<b>P50 de sensibilidad:</b> '+fmt(report.p50)+' t/año; no reemplaza a la estimación central.</div>'+
      (changed?'<div class="e2well"><b>Simulación modificada en el laboratorio:</b> '+fmt(scenario.out.toneladas)+' t/año. Los cuadros de referencia siguientes mantienen los parámetros centrales del informe.</div>':'')+
      '<h3>14 cadenas logísticas · año 2028</h3>'+tableChains(chains)+source+
      '<p class="e2small">Las capas del E1 siguen disponibles en el mapa. La quinua es información territorial de contexto, no un flujo OD ni demanda atribuida al puerto seco.</p>';
    mapGeo('e2/capas/quinua_provincial_poligonos.geojson',f=>({color:'#aa783b',weight:1,fillColor:(f.properties?.quinua_t||0)>3000?'#be7d00':'#f4dd9a',fillOpacity:.54}),p=>'<b>'+safe(p.provincia)+'</b><br>Quinua, referencia territorial 2025: '+fmt(p.quinua_t)+' t<br>Contexto, no OD de carga.').catch(console.warn);
  }
  function showSummary(){const a=reference();if(!a)throw Error('Falta el motor E2');
    panel().innerHTML=top('Resultados del Entregable 2','Síntesis del informe final. Los escenarios son sensibilidades de un mismo modelo y no versiones diferentes de la demanda.')+e2stats()+
      '<div class="e2well"><b>Referencia oficial:</b> 247.141 t/año (2028). El P50 = 246.367 t/año corresponde únicamente a la mediana del barrido de sensibilidad.</div>'+
      '<h3>Escenarios de la misma formulación</h3><div class="e2-scroll"><table class="e2-chain-table"><thead><tr><th>Escenario</th><th>Captación (t/año)</th><th>Ingreso bruto</th></tr></thead><tbody>'+
      '<tr><td>Central · canasta 100%</td><td>247.141</td><td>US$ 5,238 M</td></tr>'+
      '<tr><td>Máximo ingreso bruto · canasta 68,16%</td><td>397.203</td><td>US$ 5,808 M</td></tr>'+
      '<tr><td>Tarifa competitiva · canasta 45%, limitada por capacidad</td><td>450.000</td><td>US$ 4,38 M</td></tr>'+
      '<tr><td>Base sin tránsito boliviano · contraste</td><td>≈199.000</td><td>US$ 4,28 M</td></tr>'+
      '</tbody></table></div><h3>Sensibilidad de parámetros · 16.384 combinaciones</h3><div id="e2-sensitivity-chart" style="height:220px"></div>'+
      '<p class="e2small">P10 = 113.586 t/año; P50 = 246.367 t/año; P90 = 423.559 t/año. No son intervalos de confianza estadísticos ni una segunda estimación base.</p>'+
      '<div class="e2well"><b>Integración regional:</b> el mercado incremental Bolivia–Chile se estudia por separado (captación condicionada ≈9–160 kt/año). Brasil–Asia es una oportunidad estratégica de largo plazo sin captación atribuida a la referencia central.</div>'+source;
    if(typeof Plotly!=='undefined')Plotly.newPlot('e2-sensitivity-chart',[{type:'bar',orientation:'h',x:[report.p10,report.p50,report.p90],y:['P10','P50','P90'],marker:{color:['#777','#e0b029','#777']},text:[fmt(report.p10),fmt(report.p50),fmt(report.p90)],textposition:'auto'}],{margin:{t:18,b:30,l:40,r:20},paper_bgcolor:'#202020',plot_bgcolor:'#202020',font:{color:'#eee'},xaxis:{title:'Toneladas anuales'}},{displayModeBar:false,responsive:true});
    // Se utiliza la misma red logística del visor E1, sin inventar enlaces nuevos.
    mapGeo('capas/corredores.geojson',{color:'#d7a300',weight:3,opacity:.8},p=>'<b>Corredor logístico</b><br>'+safe(p.nombre||p.id||p.CORREDOR||'Red PNSILT')).catch(console.warn);
  }
  async function showRoutes(){const rows=await get('RUTAS_CG_UNIFICADO_V6');
    const label=r=>{if(r.origen&&r.destino)return r.origen+' → '+r.destino;return r.id.replaceAll('_',' → ').replaceAll('Inapari','Iñapari')};
    panel().innerHTML=top('Rutas y costos generalizados','Recorridos dirigidos y costos de la red de corredores. El costo generalizado ya incorpora peajes: no se adicionan nuevamente al comparar alternativas.')+
      '<div class="e2well"><b>Iñapari → Juliaca:</b> 789,367 km · R$ 5.482,72/camión de cinco ejes · US$ 42,17/t (25 t, TC R$ 5,2/US$).</div>'+
      '<label for="e2route">Recorrido dirigido</label><select class="e2select" id="e2route">'+rows.map(r=>'<option value="'+safe(r.id)+'">'+safe(label(r))+'</option>').join('')+'</select><div id="e2routeinfo"></div>'+source;
    const draw=async()=>{clear();const r=rows.find(x=>x.id===document.getElementById('e2route').value);if(!r)return;
      document.getElementById('e2routeinfo').innerHTML='<div class="e2row"><b>'+safe(label(r))+'</b><br>Distancia: '+fmt(r.km,3)+' km<br>Costo generalizado: R$ '+fmt(r.cg_brl_camion_5e,2)+'/camión · US$ '+fmt(r.cg_usd_t_5e_25t_tc5_2,2)+'/t<br>Peaje incluido dentro del costo: R$ '+fmt(r.peaje_incluido_brl_5e,2)+'/camión</div>';
      const geo=await window.E2_LEER_JSON('e2/capas/rutas_modelo_v6.geojson');const sel=geo.features.filter(f=>f.properties?.id===r.id);const m=mainMap();if(sel.length&&m){const line=L.geoJSON({type:'FeatureCollection',features:sel},{style:{color:'#d8a111',weight:5}}).addTo(m);overlays.push(line);if(line.getBounds().isValid())m.fitBounds(line.getBounds(),{padding:[35,35]});}};
    document.getElementById('e2route').onchange=()=>draw().catch(console.warn);await draw();
  }
  async function showBrasilAsia(){panel().innerHTML=top('Brasil–Asia · oportunidad estratégica','Comercio con China y Japón en 2025. Es un universo externo y no representa por sí mismo carga desviada a puertos peruanos ni captación del Puerto Seco de Juliaca.')+
      '<div class="e2well"><b>Mercado observado:</b> '+fmt(report.totalBrasAsia)+' t (26.055.857 t de exportaciones brasileñas). <b>Demanda capturable del E2:</b> no se atribuyen toneladas adicionales de este mercado al escenario central.</div>';
    if(window.E2_ASIA_UI)await window.E2_ASIA_UI.mountMarket();
    await mapGeo('e2/capas/BR_ESTADOS_AREA_ESTUDIO.geojson',{color:'#9f8c64',weight:1,fillColor:'#eab844',fillOpacity:.42},p=>'<b>'+safe(p.NomeUF||p.nome||'Estado brasileño')+'</b><br>Área de mercado de referencia, 2025');
  }
  async function dispatch(tab){clear();if(tab==='e2_perfil')showProfile();else if(tab==='e2_rutas')await showRoutes();else if(tab==='e2_mercados')await showBrasilAsia();else if(tab==='e2_resumen')showSummary();}
  document.querySelectorAll('nav button').forEach(b=>b.addEventListener('click',()=>{if(['e2_perfil','e2_rutas','e2_mercados','e2_resumen'].includes(b.dataset.tab))dispatch(b.dataset.tab).catch(e=>{console.error(e);panel().innerHTML='<p>No se pudo cargar el módulo E2: '+safe(e.message)+'</p>'});else clear()}));
})();
