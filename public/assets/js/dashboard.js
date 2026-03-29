// ─── DEFAULTS ────────────────────────────────────────────
const getAuthHeader = () => 'Basic ' + btoa((sessionStorage.getItem('lpm-usr')||'') + ':' + (sessionStorage.getItem('lpm-pwd')||''));

// ─── STATE ───────────────────────────────────────────────
const S = {
  leads:[], manualLog:[], visits:[0,0,0,0,0,0,0],
  labels:[], ga4Sessions:[], ga4Sources:[], cfg:{}
};
let CH = {};

// ─── UTILS ───────────────────────────────────────────────
const $  = id => document.getElementById(id);
const td = () => new Date().toISOString().split('T')[0];
const l7 = () => Array.from({length:7},(_,i)=>{ const d=new Date(); d.setDate(d.getDate()-(6-i)); return d.toLocaleDateString('en-GB',{weekday:'short',day:'numeric'}); });
const d7 = () => Array.from({length:7},(_,i)=>{ const d=new Date(); d.setDate(d.getDate()-(6-i)); return d.toISOString().split('T')[0]; });
const ago= n=>{ const d=new Date(); d.setDate(d.getDate()-n); return d.toISOString().split('T')[0]; };

function toast(msg,dur=2800){
  const t=$('toast'); t.textContent=msg; t.className='show';
  clearTimeout(t._t); t._t=setTimeout(()=>t.className='',dur);
}
function ftime(){ return new Date().toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit'}); }

// ─── AUTH ────────────────────────────────────────────────
async function tryLogin(){
  const u = $('usr-input').value.trim();
  const p = $('pwd-input').value;
  if(!u || !p){
    $('pwd-error').textContent='Enter both username and password.';
    return;
  }
  
  sessionStorage.setItem('lpm-usr', u);
  sessionStorage.setItem('lpm-pwd', p);
  
  const btn = $('lock-btn');
  const org = btn.innerHTML;
  btn.innerHTML = '<span class="spinner" style="border-width:2px;width:14px;height:14px;border-top-color:#fff"></span>';
  
  try {
    const r = await fetch('http://127.0.0.1:8000/api/verify', { headers: { 'Authorization': getAuthHeader() } });
    if (r.ok) {
      sessionStorage.setItem('lpm-ok','1');
      $('lock-screen').style.display='none';
      $('app').style.display='block';
      init();
    } else if (r.status === 401) {
      btn.innerHTML = org;
      $('pwd-error').textContent='Incorrect credentials — try again.';
      sessionStorage.removeItem('lpm-usr');
      sessionStorage.removeItem('lpm-pwd');
      $('pwd-input').value=''; $('pwd-input').focus();
    } else {
      btn.innerHTML = org;
      $('pwd-error').textContent=`Error ${r.status}: Backend issue.`;
    }
  } catch(e) {
    btn.innerHTML = org;
    $('pwd-error').textContent='Backend is offline — check your terminal.';
  }
}
function doLock(){
  sessionStorage.removeItem('lpm-ok');
  sessionStorage.removeItem('lpm-usr');
  sessionStorage.removeItem('lpm-pwd');
  $('app').style.display='none';
  $('lock-screen').style.display='flex';
  $('pwd-input').value=''; $('usr-input').value=''; 
  $('pwd-error').textContent='';
  $('lock-btn').innerHTML = 'Unlock';
}

// ─── NAV ─────────────────────────────────────────────────
function go(v,el){
  ['overview','leads','analytics','clarity','manual','settings'].forEach(x=>{
    $('view-'+x).style.display=x===v?'block':'none';
  });
  document.querySelectorAll('.nav-item').forEach(n=>n.classList.remove('active'));
  el.classList.add('active');
  const T={overview:'Overview',leads:'Leads',analytics:'GA4 Analytics',clarity:'Clarity heatmaps',manual:'Manual entry',settings:'Settings'};
  $('ptitle').textContent=T[v];
  if(v==='analytics') setTimeout(buildGA4Charts,60);
}

// ─── CONFIG ──────────────────────────────────────────────
function loadCfg(){
  S.cfg = JSON.parse(localStorage.getItem('lpm-cfg')||'{}');
  if(S.cfg.clid) $('s-clid').value = S.cfg.clid;
  applyClarityID();
  S.manualLog = JSON.parse(localStorage.getItem('lpm-manual')||'[]');
  applyManualLog();
}
function saveCfg(){ localStorage.setItem('lpm-cfg',JSON.stringify(S.cfg)); }

function saveClarity(){
  const clid=$('s-clid').value.trim();
  if(!clid){toast('Enter Clarity Project ID');return;}
  S.cfg.clid=clid; saveCfg(); applyClarityID();
  toast('Clarity config saved');
}

function applyClarityID(){
  const id=S.cfg.clid||'YOUR_PROJECT_ID';
  $('clarity-script-block').textContent=`<!-- Microsoft Clarity -->
<script type="text/javascript">
  (function(c,l,a,r,i,t,y){
    c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
    t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
    y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
  })(window,document,"clarity","script","${id}");
<\/script>`;
  if(S.cfg.clid) $('cl-link').href='https://clarity.microsoft.com/projects/view/'+S.cfg.clid;
}

// ─── FETCH DATA (FastAPI Backend) ────────────────────────
async function fetchLeads(){
  setConn('loading');
  try{
    const r = await fetch('http://127.0.0.1:8000/api/leads', { headers: { 'Authorization': getAuthHeader() } });
    if(r.status === 401){ toast('API auth failed — check backend credentials'); setConn('error'); return; }
    if(!r.ok){ const e = await r.json().catch(()=>({})); toast('API error: '+(e.detail||r.status)); setConn('error'); return; }
    const data = await r.json();
    S.leads = data.leads || [];
    setConn('ok');
  }catch(e){
    toast('Network error — backend unreachable');
    setConn('error');
  }
}

async function fetchAnalytics(){
  try{
    const r = await fetch('http://127.0.0.1:8000/api/analytics', { headers: { 'Authorization': getAuthHeader() } });
    if(!r.ok) return;
    const data = await r.json();
    const stats = data.daily_stats || [];
    if(stats.length > 0){
      S.labels = stats.map(s => {
        const d = new Date(s.date);
        return d.toLocaleDateString('en-GB',{weekday:'short',day:'numeric'});
      });
      S.visits = stats.map(s => s.visitors);
      S.ga4Sessions = stats.map(s => s.sessions);
      
      const totSess = S.ga4Sessions.reduce((a,b)=>a+b,0);
      $('ga-sess').textContent = totSess || '—';
      $('ga-users').textContent = S.visits.reduce((a,b)=>a+b,0) || '—';
    }
  }catch(e){
    console.error('GA4 fetch error:', e);
  }
}

// ─── MANUAL UX LOG (Clarity) ─────────────────────────────
function applyManualLog(){
  const latest = S.manualLog[0];
  if(latest){
    $('cl-rage').textContent = latest.rage || '0';
    $('cl-dead').textContent = latest.dead || '0';
  } else {
    $('cl-rage').textContent = '—';
    $('cl-dead').textContent = '—';
  }
}
function saveManual(){
  const date=$('m-date').value;
  const rage=parseInt($('m-rage').value)||0;
  const dead=parseInt($('m-dead').value)||0;
  if(!date){toast('Enter valid date');return;}
  const i=S.manualLog.findIndex(e=>e.date===date);
  if(i>=0){ S.manualLog[i].rage=rage; S.manualLog[i].dead=dead; }
  else S.manualLog.unshift({date,rage,dead});
  S.manualLog.sort((a,b)=>b.date.localeCompare(a.date));
  localStorage.setItem('lpm-manual',JSON.stringify(S.manualLog));
  applyManualLog(); renderManualLog();
  toast('UX audit entry saved');
}
function renderManualLog(){
  const w=$('manual-log');
  if(!S.manualLog.length){w.innerHTML='<div class="empty">No entries yet.</div>';return;}
  w.innerHTML=S.manualLog.slice(0,30).map(e=>`<div class="mrow"><span>${e.date}</span><span class="mono">${e.rage} rage, ${e.dead} dead clicks</span></div>`).join('');
}



// ─── METRICS ─────────────────────────────────────────────
function updateMetrics(){
  const todayLeads=S.leads.filter(l=>(l.timestamp||'').startsWith(td())||(l.date||'').startsWith(td())).length;
  const todayVis=S.visits[6]||0;
  // Conversion Rate = (Leads from FastAPI / Visitors) × 100
  const cvr=todayVis>0?Math.round((S.leads.length/todayVis)*1000)/10:0;
  const sess7=S.ga4Sessions.reduce((a,b)=>a+b,0)||S.visits.reduce((a,b)=>a+b,0);

  $('m-vis').textContent=todayVis||'—';
  $('m-vis-d').textContent=todayVis>0?'↑ active':'Live via GA4 API';
  $('m-vis-d').className='mdelta '+(todayVis>0?'up':'nu');
  $('m-leads').textContent=S.leads.length;
  $('m-leads-d').textContent=`+${todayLeads} today`;
  $('m-cvr').textContent=cvr>0?cvr+'%':'—';
  const cd=$('m-cvr-d');
  cd.textContent=cvr>0?(cvr>=5?'✓ above 5% target':'Below 5% — needs work'):'Need visit data';
  cd.className='mdelta '+(cvr>=5?'up':cvr>0?'dn':'nu');
  $('m-sess').textContent=sess7||'—';
}

// ─── LEADS TABLE ─────────────────────────────────────────
function renderLeads(){
  const w=$('leads-wrap'),lbl=$('leads-count');
  if(!S.leads.length){w.innerHTML='<div class="empty">No leads yet. Ensure the backend is configured with your Google Sheet.</div>';lbl.textContent='';return;}
  lbl.textContent=S.leads.length+' total';
  
  const keys = Object.keys(S.leads[0]);
  let h='<div style="overflow-x:auto;"><table><thead><tr>';
  keys.forEach(k => { h += `<th>${k.charAt(0).toUpperCase() + k.slice(1)}</th>`; });
  h+='<th></th></tr></thead><tbody>';
  
  S.leads.slice(0,50).forEach((l,i)=>{
    h+='<tr>';
    keys.forEach(k => {
      const val = l[k] || '—';
      const isMuted = ['email','phone','timestamp','source','niche','interest'].includes(k);
      const isMono = ['timestamp'].includes(k);
      const isBold = (k === 'name');
      
      let style = '';
      if(isBold) style += 'font-weight:500;';
      if(isMuted) style += 'color:var(--muted);';
      if(isMono) style += 'font-size:12px;';
      
      h += `<td class="${isMono?'mono':''}" style="${style}">${val}</td>`;
    });
    const isNew = (l.timestamp||'').startsWith(td()) || (l.date||'').startsWith(td());
    h += `<td><span class="badge ${isNew?'bnew':'bold'}">${isNew?'New':'—'}</span></td></tr>`;
  });
  w.innerHTML=h+'</tbody></table></div>';
}

// ─── EXPORT ──────────────────────────────────────────────
function exportCSV(){
  if(!S.leads.length){toast('No leads to export');return;}
  const keys = Object.keys(S.leads[0]);
  const header = keys.map(k => k.charAt(0).toUpperCase() + k.slice(1)).join(',');
  const csv = [header, ...S.leads.map(l=>keys.map(k=>`"${(l[k]||'').toString().replace(/"/g, '""')}"`).join(','))].join('\n');
  const a=document.createElement('a');
  a.href='data:text/csv;charset=utf-8,'+encodeURIComponent(csv);
  a.download='prolaunch-leads-'+td()+'.csv'; a.click();
  toast('CSV downloaded');
}

// ─── COPY SCRIPTS ────────────────────────────────────────
function copyClarity(){
  navigator.clipboard.writeText($('clarity-script-block').textContent).then(()=>toast('Clarity script copied!')).catch(()=>toast('Select and copy manually'));
}

// ─── CHARTS ──────────────────────────────────────────────
const CC={a:'#7bb640',b:'#19a08c',txt:'#6b7a6a',grid:'rgba(255,255,255,0.06)'};
function bOpts(){
  return{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},
    scales:{x:{ticks:{color:CC.txt,font:{size:11}},grid:{color:CC.grid}},y:{ticks:{color:CC.txt,font:{size:11}},grid:{color:CC.grid},beginAtZero:true}}};
}
function lpd(){ return d7().map(d=>S.leads.filter(l=>l.date===d||l.date.startsWith(d)).length); }

function buildOverviewCharts(){
  const ld=lpd();
  if(CH.main)   CH.main.destroy();
  if(CH.funnel) CH.funnel.destroy();
  if(CH.cvr)    CH.cvr.destroy();
  CH.main=new Chart($('c-main'),{type:'bar',data:{labels:S.labels,datasets:[
    {label:'Visits',data:S.visits,backgroundColor:'rgba(25,160,140,0.18)',borderColor:CC.b,borderWidth:1.5,borderRadius:4},
    {label:'Leads', data:ld,     backgroundColor:'rgba(123,182,64,0.22)', borderColor:CC.a,borderWidth:1.5,borderRadius:4}
  ]},options:bOpts()});
  const tot=S.visits.reduce((a,b)=>a+b,0)||100;
  CH.funnel=new Chart($('c-funnel'),{type:'bar',data:{labels:['Visits','Engaged','Form views','Submitted'],datasets:[{
    data:[tot,Math.round(tot*.6),Math.round(tot*.18),S.leads.length],
    backgroundColor:['rgba(25,160,140,0.18)','rgba(25,160,140,0.28)','rgba(123,182,64,0.18)',CC.a+'cc'],
    borderColor:[CC.b,CC.b,CC.a,CC.a],borderWidth:1.5,borderRadius:4
  }]},options:{...bOpts(),indexAxis:'y'}});
  const cvrData=S.visits.map((v,i)=>v>0?+((ld[i]/v)*100).toFixed(1):0);
  CH.cvr=new Chart($('c-cvr'),{type:'line',data:{labels:S.labels,datasets:[{
    data:cvrData,borderColor:CC.a,backgroundColor:'rgba(123,182,64,0.07)',fill:true,tension:.4,pointRadius:3,pointBackgroundColor:CC.a
  }]},options:{...bOpts(),scales:{x:{ticks:{color:CC.txt,font:{size:11}},grid:{color:CC.grid}},y:{ticks:{color:CC.txt,font:{size:11},callback:v=>v+'%'},grid:{color:CC.grid},beginAtZero:true}}}});
}

function buildGA4Charts(){
  const sess=S.ga4Sessions.length?S.ga4Sessions:S.visits;
  if(CH.ga) CH.ga.destroy();
  CH.ga=new Chart($('c-ga'),{type:'line',data:{labels:S.labels,datasets:[{
    data:sess,borderColor:CC.b,backgroundColor:'rgba(25,160,140,0.08)',fill:true,tension:.4,pointRadius:3,pointBackgroundColor:CC.b
  }]},options:bOpts()});
  if(!S.ga4Sources.length) return;
  if(CH.src) CH.src.destroy();
  CH.src=new Chart($('c-src'),{type:'doughnut',data:{
    labels:S.ga4Sources.map(s=>s.label),
    datasets:[{data:S.ga4Sources.map(s=>s.val),backgroundColor:S.ga4Sources.map(s=>s.color+'99'),borderColor:S.ga4Sources.map(s=>s.color),borderWidth:1.5}]
  },options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},cutout:'65%'}});
  $('src-legend').innerHTML=S.ga4Sources.map(s=>`<div style="display:flex;align-items:center;gap:8px"><span style="width:10px;height:10px;border-radius:2px;background:${s.color};flex-shrink:0"></span><span style="color:var(--muted)">${s.label}</span><span style="margin-left:auto;font-family:'DM Mono',monospace;font-size:12px">${s.val}%</span></div>`).join('');
}

// ─── CONN STATUS ─────────────────────────────────────────
function setConn(s){
  const dot=$('cdot'),txt=$('ctxt');
  ({ok:()=>{dot.style.background='var(--success)';txt.textContent='Connected';},
    error:()=>{dot.style.background='var(--danger)';txt.textContent='Connection error';},
    loading:()=>{dot.style.background='var(--warn)';txt.textContent='Loading...';},
    none:()=>{dot.style.background='var(--muted)';txt.textContent='Not connected';}
  })[s]?.();
}

// ─── REFRESH ─────────────────────────────────────────────
async function refreshAll(){
  $('ri').innerHTML='<span class="spinner"></span>';
  await Promise.all([fetchLeads(), fetchAnalytics()]);
  toast(`Fetched backend logs`);
  updateAll(); $('ri').textContent='↻';
}
function updateAll(){
  applyManualLog(); updateMetrics(); renderLeads();
  renderManualLog(); buildOverviewCharts(); buildGA4Charts();
  $('lrefresh').textContent=ftime();
}

// ─── INIT ────────────────────────────────────────────────
function init(){
  $('m-date').value=td();
  loadCfg(); S.labels=l7();
  // Always fetch leads and analytics from the backend
  Promise.all([fetchLeads(), fetchAnalytics()]).then(()=>{
    updateAll();
  });
}

// ─── BOOT ────────────────────────────────────────────────
window.addEventListener('DOMContentLoaded',()=>{
  $('pwd-input').addEventListener('keydown',e=>{ if(e.key==='Enter') tryLogin(); });
  if(sessionStorage.getItem('lpm-ok')==='1'){
    $('lock-screen').style.display='none';
    $('app').style.display='block';
    init();
  }
});
