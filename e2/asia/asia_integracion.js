"use strict";
// Brasil–Asia: mercado de referencia E2; no se calcula ni agrega captación no sustentada.
(function(){
  const fmt=(v,d=0)=>Number(v||0).toLocaleString('es-ES',{minimumFractionDigits:d,maximumFractionDigits:d});
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  let data=null;
  async function load(){if(!data){data=await window.E2_LEER_JSON('e2/asia/brasil_asia_v2_referencia.json');}return data;}
  function markup(prefix,lab){return `<div class="e2asia-panel${lab?' e2asia-lab':''}" id="${prefix}Root">
    <h3>Brasil–Asia · comercio de referencia</h3>
    <p>Comercio exterior de Mato Grosso, Rondônia, Amazonas y Acre con China y Japón, año 2025. El corredor bioceánico Brasil–Bolivia–Chile es una alternativa logística existente, no una prueba de desvío por Juliaca.</p>
    <div class="e2asia-metrics"><div class="e2asia-metric"><small>Comercio total 2025</small><strong id="${prefix}Total">—</strong></div>
    <div class="e2asia-metric"><small>Exportaciones BR hacia Asia</small><strong id="${prefix}Exp">—</strong></div>
    <div class="e2asia-metric"><small>Importaciones BR desde Asia</small><strong id="${prefix}Imp">—</strong></div>
    <div class="e2asia-metric"><small>Captación atribuida a Juliaca</small><strong>Sin atribución</strong></div></div>
    <label for="${prefix}State">Estado brasileño</label><select id="${prefix}State"><option value="">Todos los estados</option><option>Mato Grosso</option><option>Rondônia</option><option>Amazonas</option><option>Acre</option></select>
    <div id="${prefix}Graph" style="height:245px"></div><div id="${prefix}Rows"></div>
    <button type="button" id="${prefix}Export">Descargar comercio 2025 (CSV)</button>
    <p class="e2asia-note">Las 30,2 Mt de comercio constituyen una oportunidad estratégica de largo plazo (capítulo 8 del informe). No se agregan a las 247.141 t/año de captación del escenario central, ni se asignan a puertos del Perú sin evidencia de cambio de corredor. Fuente: comercio Brasil–Asia, E2.</p></div>`}
  function current(root){const st=root.querySelector('select').value;return data.filas.filter(x=>!st||x.estado===st)}
  function render(prefix){let root=document.getElementById(prefix+'Root');if(!root||!data)return;const rows=current(root);
    const exports=rows.filter(x=>x.sentido.startsWith('Exportacion')).reduce((s,r)=>s+r.comercio_2025_t,0);
    const imports=rows.filter(x=>x.sentido.startsWith('Importacion')).reduce((s,r)=>s+r.comercio_2025_t,0);
    root.querySelector('#'+prefix+'Total').textContent=fmt(exports+imports)+' t';root.querySelector('#'+prefix+'Exp').textContent=fmt(exports)+' t';root.querySelector('#'+prefix+'Imp').textContent=fmt(imports)+' t';
    root.querySelector('#'+prefix+'Rows').innerHTML='<table class="e2asia-table"><thead><tr><th>Estado</th><th>Sentido</th><th>Comercio 2025 (t)</th></tr></thead><tbody>'+rows.map(r=>'<tr><td>'+esc(r.estado)+'</td><td>'+(r.sentido.startsWith('Exportacion')?'Exportación BR':'Importación BR')+'</td><td>'+fmt(r.comercio_2025_t)+'</td></tr>').join('')+'</tbody></table>';
    if(typeof Plotly!=='undefined'){
      const states=[...new Set(rows.map(r=>r.estado))];const x=states,ex=states.map(st=>rows.filter(r=>r.estado===st&&r.sentido.startsWith('Exportacion')).reduce((s,r)=>s+r.comercio_2025_t,0)/1e6),im=states.map(st=>rows.filter(r=>r.estado===st&&r.sentido.startsWith('Importacion')).reduce((s,r)=>s+r.comercio_2025_t,0)/1e6);
      const light=root.classList.contains('e2asia-lab');Plotly.react(prefix+'Graph',[{type:'bar',name:'Exportaciones',x,y:ex,marker:{color:'#e2b326'}},{type:'bar',name:'Importaciones',x,y:im,marker:{color:'#327f9b'}}],{barmode:'group',height:245,margin:{t:15,b:64,l:50,r:10},xaxis:{tickangle:-18},yaxis:{title:'Millones de t'},legend:{orientation:'h',y:1.2},font:{size:10,color:light?'#234':'#ddd'},paper_bgcolor:light?'#f6f8fa':'#24282b',plot_bgcolor:light?'#f6f8fa':'#24282b'},{displayModeBar:false,responsive:true});
    }
  }
  function wire(prefix){const root=document.getElementById(prefix+'Root');if(!root)return;root.querySelector('select').onchange=()=>render(prefix);
    root.querySelector('button').onclick=()=>{const rs=current(root),hd=['estado','sentido','comercio_2025_t'];const csv=[hd.join(';'),...rs.map(r=>hd.map(k=>String(r[k])).join(';'))].join('\r\n');const b=new Blob(['\ufeff'+csv],{type:'text/csv;charset=utf-8'});const url=URL.createObjectURL(b);const a=document.createElement('a');a.href=url;a.download='E2_brasil_asia_comercio_2025.csv';a.click();setTimeout(()=>URL.revokeObjectURL(url),3000);};render(prefix);}
  async function mountMarket(){await load();const host=document.getElementById('content');if(!host)return;host.querySelector('#e2asiaMarketRoot')?.remove();host.insertAdjacentHTML('beforeend',markup('e2asiaMarket',false));wire('e2asiaMarket');}
  async function mountLab(){await load();const grid=document.querySelector('#e2labStage .lab-grid');if(!grid)return;grid.querySelector('#e2asiaLabWrapper')?.remove();const w=document.createElement('div');w.id='e2asiaLabWrapper';w.className='lab-panel lab-wide';w.innerHTML=markup('e2asiaLab',true);grid.appendChild(w);wire('e2asiaLab');}
  document.addEventListener('e2:mounted',()=>mountLab().catch(console.warn));
  window.E2_ASIA_UI={mountMarket,mountLab};
})();
