// ─── DEFAULTS ────────────────────────────────────────────
const getAuthHeader = () => 'Basic ' + btoa((sessionStorage.getItem('lpm-usr')||'') + ':' + (sessionStorage.getItem('lpm-pwd')||''));

// ─── STATE ───────────────────────────────────────────────
const S = {
  leads:[], visits:[], labels:[], rawDates:[], ga4Sessions:[], ga4Sources:[],
  ga4NewU:[], ga4PV:[], ga4Events:[], ga4Dur:[]
};
let CH = {};

// ─── UTILS ───────────────────────────────────────────────
const $  = id => document.getElementById(id);
const td = () => new Date().toLocaleDateString('en-CA'); 
const l7 = () => Array.from({length:7},(_,i)=>{ const d=new Date(); d.setDate(d.getDate()-(6-i)); return d.toLocaleDateString('en-GB',{weekday:'short',day:'numeric'}); });
const d7 = () => Array.from({length:7},(_,i)=>{ const d=new Date(); d.setDate(d.getDate()-(6-i)); return d.toLocaleDateString('en-CA'); });
const ago= n=>{ const d=new Date(); d.setDate(d.getDate()-n); return d.toLocaleDateString('en-CA'); };

const isSameDay = (ts, dStr) => {
  if(!ts || typeof ts !== 'string') return false;
  if(ts.startsWith(dStr)) return true;
  const [y,m,d] = dStr.split('-');
  const m1 = parseInt(m, 10), d1 = parseInt(d, 10), m2 = m1.toString().padStart(2,'0'), d2 = d1.toString().padStart(2,'0');
  const fmts = [`${d1}/${m1}/${y}`, `${m1}/${d1}/${y}`, `${d2}/${m2}/${y}`, `${m2}/${d2}/${y}`];
  if(fmts.some(f => ts.includes(f))) return true;
  const pd = new Date(ts);
  return !isNaN(pd) && pd.getFullYear()===parseInt(y, 10) && (pd.getMonth()+1)===m1 && pd.getDate()===d1;
};

function toast(msg,dur=2800){
  const t=$('toast'); t.textContent=msg; t.className='show';
  clearTimeout(t._t); t._t=setTimeout(()=>t.className='',dur);
}
function ftime(){ return new Date().toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit'}); }

function animateValue(id, start, end, duration, formatStr = '') {
  const obj = $(id);
  if (!obj) return;
  obj.classList.remove('skeleton-text');
  if (end === 0) {
    obj.innerHTML = end + formatStr;
    return;
  }
  let startTimestamp = null;
  const step = (timestamp) => {
    if (!startTimestamp) startTimestamp = timestamp;
    const progress = Math.min((timestamp - startTimestamp) / duration, 1);
    const easeProgress = 1 - Math.pow(1 - progress, 3); // Ease out cubic
    let currentVal = Math.floor(easeProgress * (end - start) + start);
    obj.innerHTML = currentVal + formatStr;
    if (progress < 1) {
      window.requestAnimationFrame(step);
    } else {
      obj.innerHTML = end + formatStr;
    }
  };
  window.requestAnimationFrame(step);
}

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
    const r = await fetch('/api/verify', { headers: { 'Authorization': getAuthHeader() } });
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
  ['overview','leads','analytics'].forEach(x=>{
    const section = $('view-'+x);
    if(x === v) {
      section.style.display='block';
      section.style.animation = 'none';
      section.offsetHeight; // trigger reflow
      section.style.animation = null; 
    } else {
      section.style.display='none';
    }
  });
  document.querySelectorAll('.nav-item').forEach(n=>n.classList.remove('active'));
  el.classList.add('active');
  const T={overview:'Overview',leads:'Leads',analytics:'GA4 Analytics'};
  $('ptitle').textContent=T[v];
  if(v==='analytics') setTimeout(buildGA4Charts,60);
}

// ─── FETCH DATA (FastAPI Backend) ────────────────────────
function setSkeleton(id) {
  const el = $(id);
  if(el) {
    el.innerHTML = '0';
    el.classList.add('skeleton-text');
  }
}

async function fetchLeads(){
  setConn('loading');
  setSkeleton('m-leads');
  setSkeleton('m-cvr');
  try{
    const r = await fetch('/api/leads', { headers: { 'Authorization': getAuthHeader() } });
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
  ['m-vis', 'm-sess', 'ga-sess', 'ga-users', 'ga-newu', 'ga-pv', 'ga-events', 'ga-dur'].forEach(setSkeleton);
  
  try{
    const r = await fetch('/api/analytics', { headers: { 'Authorization': getAuthHeader() } });
    if(!r.ok) throw new Error('Analytics API error status');
    const data = await r.json();
    const stats = data.daily_stats || [];
    if(stats.length > 0){
      S.labels = stats.map(s => {
        const d = new Date(s.date); return d.toLocaleDateString('en-GB',{weekday:'short',day:'numeric'});
      });
      S.rawDates = stats.map(s => s.date);
      S.visits = stats.map(s => s.visitors);
      S.ga4Sessions = stats.map(s => s.sessions);
      S.ga4NewU = stats.map(s => s.new_users);
      S.ga4PV = stats.map(s => s.page_views);
      S.ga4Events = stats.map(s => s.event_count);
      S.ga4Dur = stats.map(s => s.avg_duration);
      
      const totSess = S.ga4Sessions.reduce((a,b)=>a+b,0);
      animateValue('ga-sess', 0, totSess, 1000);
      animateValue('ga-users', 0, S.visits.reduce((a,b)=>a+b,0), 1000);
      animateValue('ga-newu', 0, S.ga4NewU.reduce((a,b)=>a+b,0), 1000);
      animateValue('ga-pv', 0, S.ga4PV.reduce((a,b)=>a+b,0), 1000);
      animateValue('ga-events', 0, S.ga4Events.reduce((a,b)=>a+b,0), 1000);
      
      const avgDur = S.ga4Dur.length ? Math.round(S.ga4Dur.reduce((a,b)=>a+b,0)/S.ga4Dur.length) : 0;
      animateValue('ga-dur', 0, avgDur, 1000, 's');
      
    } else { throw new Error('Empty stats array returned'); }
  }catch(e){
    console.warn('GA4 fetch fallback:', e);
    S.labels = []; S.rawDates = []; S.visits = []; S.ga4Sessions = [];
    S.ga4NewU = []; S.ga4PV = []; S.ga4Events = []; S.ga4Dur = [];
    ['ga-sess','ga-users','ga-newu','ga-pv','ga-events'].forEach(id => { $(id).textContent='0'; $(id).classList.remove('skeleton-text'); });
    $('ga-dur').textContent='0s'; $('ga-dur').classList.remove('skeleton-text');
  }
}

async function fetchEvents(){
  try{
    const r = await fetch('/api/events', { headers: { 'Authorization': getAuthHeader() } });
    if(!r.ok) return;
    const data = await r.json();
    const evs = data.events || [];
    const colors = ['#7bb640','#19a08c','#f0b860','#8a9e89','#5c8680','#c9d8a3'];
    S.ga4Sources = evs.map((e,i) => ({
      label: e.name, val: e.count, sessions: e.sessions, color: colors[i%colors.length]
    }));
  }catch(e){
    console.warn('Events fetch fallback:', e);
    S.ga4Sources = [];
  }
}

// ─── METRICS ─────────────────────────────────────────────
function updateMetrics(){
  const todayLeads=S.leads.filter(l=>isSameDay(l.timestamp||l.date||'', td())).length;
  const todayVis=S.visits.length ? S.visits[S.visits.length-1] : 0;
  const totalVis=S.visits.reduce((a,b)=>a+b,0);
  
  const cvr=totalVis>0 ? Math.round((S.leads.length/totalVis)*100) : 0;
  const sess30=S.ga4Sessions.reduce((a,b)=>a+b,0);

  animateValue('m-vis', 0, todayVis, 1000);
  $('m-vis-d').textContent=todayVis>0?'↑ active':'Live via GA4 API';
  $('m-vis-d').className='mdelta '+(todayVis>0?'up':'nu');
  
  animateValue('m-leads', 0, S.leads.length, 1200);
  $('m-leads-d').textContent=`+${todayLeads} today`;
  
  animateValue('m-cvr', 0, cvr, 1200, '%');
  const cd=$('m-cvr-d');
  cd.textContent=cvr>0?(cvr>=5?'✓ above 5% target':'Below 5% — needs work'):'Need visit data';
  cd.className='mdelta '+(cvr>=5?'up':cvr>0?'dn':'nu');
  
  animateValue('m-sess', 0, sess30, 1000);
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
      if(isBold) style += 'font-weight:600;';
      if(isMuted) style += 'color:var(--muted);';
      if(isMono) style += 'font-size:12px;';
      
      h += `<td class="${isMono?'mono':''}" style="${style}">${val}</td>`;
    });
    const isNew = isSameDay(l.timestamp||l.date||'', td());
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

// ─── CHARTS ──────────────────────────────────────────────
const CC={a:'#7bb640',b:'#19a08c',txt:'#8a9e89',grid:'rgba(255,255,255,0.03)'};
function bOpts(){
  return{
    responsive:true,maintainAspectRatio:false,
    plugins:{
      legend:{display:false},
      tooltip:{
        backgroundColor:'rgba(20,50,48,0.95)',
        titleColor:'#f0ede8', bodyColor:'#8a9e89',
        borderColor:'rgba(255,255,255,0.1)', borderWidth:1,
        padding: 12, cornerRadius: 8, displayColors: false
      }
    },
    scales:{
      x:{ticks:{color:CC.txt,font:{size:11,family:"'Plus Jakarta Sans', sans-serif"}},grid:{color:CC.grid, drawBorder:false}},
      y:{ticks:{color:CC.txt,font:{size:11,family:"'JetBrains Mono', monospace"}},grid:{color:CC.grid, drawBorder:false},beginAtZero:true}
    }
  };
}
function lpd(){ return S.rawDates.map(d=>S.leads.filter(l=>isSameDay(l.timestamp||l.date||'', d)).length); }

function buildOverviewCharts(){
  const ld=lpd();
  if(CH.main)   CH.main.destroy();
  if(CH.funnel) CH.funnel.destroy();
  if(CH.cvr)    CH.cvr.destroy();
  
  CH.main=new Chart($('c-main'),{type:'bar',data:{labels:S.labels,datasets:[
    {label:'Visits',data:S.visits,backgroundColor:'rgba(25,160,140,0.15)',borderColor:CC.b,borderWidth:1.5,borderRadius:4},
    {label:'Leads', data:ld,     backgroundColor:'rgba(123,182,64,0.3)', borderColor:CC.a,borderWidth:1.5,borderRadius:4}
  ]},options:bOpts()});
  
  const tot=S.visits.reduce((a,b)=>a+b,0); // Removed || 100 fallback
  const optIntent = S.ga4Sources.find(s => s.label === "Intent (Opened Form)");
  const engaged = optIntent ? optIntent.sessions : 0;
  
  CH.funnel=new Chart($('c-funnel'),{type:'bar',data:{labels:['Visits(30d)','Engaged','Submitted'],datasets:[{
    data:[tot, engaged, S.leads.length],
    backgroundColor:['rgba(25,160,140,0.1)','rgba(25,160,140,0.2)','rgba(123,182,64,0.3)'],
    borderColor:[CC.b,CC.b,CC.a],borderWidth:1.5,borderRadius:4
  }]},options:{...bOpts(),indexAxis:'y'}});
  
  const cvrData=S.visits.map((v,i)=>v>0?+((ld[i]/v)*100).toFixed(1):0);
  
  // Create gradient
  const ctx = $('c-cvr').getContext('2d');
  const gradient = ctx.createLinearGradient(0, 0, 0, 110);
  gradient.addColorStop(0, 'rgba(123,182,64,0.25)');
  gradient.addColorStop(1, 'rgba(123,182,64,0.01)');
  
  CH.cvr=new Chart($('c-cvr'),{type:'line',data:{labels:S.labels,datasets:[{
    data:cvrData,borderColor:CC.a,backgroundColor:gradient,fill:true,tension:.4,pointRadius:4,pointBackgroundColor:CC.a, pointBorderWidth: 2, pointBorderColor: '#092624'
  }]},options:{...bOpts(),scales:{x:{ticks:{color:CC.txt,font:{size:11}},grid:{color:CC.grid}},y:{ticks:{color:CC.txt,font:{size:11},callback:v=>v+'%'},grid:{color:CC.grid},beginAtZero:true}}}});
}

function buildGA4Charts(){
  const sess=S.ga4Sessions.length?S.ga4Sessions:S.visits;
  if(CH.ga) CH.ga.destroy();
  
  const ctx = $('c-ga').getContext('2d');
  const gradient = ctx.createLinearGradient(0, 0, 0, 200);
  gradient.addColorStop(0, 'rgba(25,160,140,0.25)');
  gradient.addColorStop(1, 'rgba(25,160,140,0.01)');
  
  CH.ga=new Chart($('c-ga'),{type:'line',data:{labels:S.labels,datasets:[{
    data:sess,borderColor:CC.b,backgroundColor:gradient,fill:true,tension:.4,pointRadius:4,pointBackgroundColor:CC.b, pointBorderWidth: 2, pointBorderColor: '#092624'
  }]},options:bOpts()});
  
  if(!S.ga4Sources.length) return;
  
  const tMap = {
    "Form Started": { def: "Someone clicked into a text box in the registration form.", insight: "High intent! They started the process but might have gotten stuck." },
    "Intent (Opened Form)": { def: "Someone clicked a \"Join\" button to see the form.", insight: "They liked the pitch enough to see what the next step was." },
    "Form Submitted": { def: "Successful form submissions sent to our Google Sheets.", insight: "The Goal. Needs follow up." },
    "AI CV Tool Usage": { def: "Number of times someone clicked the AI Optimizer.", insight: "Our \"Lead Magnet.\" Shows if the tech is drawing people in." },
    "Page Reads": { def: "Number of people who scrolled to the bottom (90%).", insight: "Tells us if our \"Success Stories\" are actually being read." }
  };

  const container = $('events-card-list');
  if(container) {
    const maxVal = Math.max(...S.ga4Sources.map(s => s.val)) || 1;
    container.innerHTML = S.ga4Sources.map(s => {
      let pct = (s.val / maxVal) * 100;
      return `
        <div class="event-card">
          <div class="ec-header" style="border-left: 4px solid ${s.color};">
            <div class="ec-title metric-title" style="display:flex;align-items:center;">
              ${s.label}
              ${tMap[s.label] ? `
              <div class="tooltip">
                  <i class="fa-solid fa-circle-info"></i>
                  <span class="tooltip-text">
                      <strong>${tMap[s.label].def}</strong><br><br>${tMap[s.label].insight}
                  </span>
              </div>` : ''}
            </div>
          </div>
          <div class="ec-body">
            <div class="ec-stat">
              <span class="ec-val">${s.val}</span>
              <span class="ec-lbl">Total Interactions</span>
            </div>
            <div class="ec-stat" style="text-align: right;">
              <span class="ec-val sm">${s.sessions}</span>
              <span class="ec-lbl">Unique Visitors</span>
            </div>
          </div>
          <div class="ec-progress-bg">
            <div class="ec-progress-fill" style="background: ${s.color}; width: ${pct}%"></div>
          </div>
        </div>
      `;
    }).join('');
  }
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
  try {
    await Promise.all([fetchLeads(), fetchAnalytics(), fetchEvents()]);
    toast(`Fetched backend logs`);
    updateAll(); 
  } finally {
    $('ri').textContent='↻';
  }
}
function updateAll(){
  updateMetrics(); renderLeads();
  buildOverviewCharts(); buildGA4Charts();
  $('lrefresh').textContent=ftime();
}

// ─── INIT ────────────────────────────────────────────────
function init(){
  Promise.all([fetchLeads(), fetchAnalytics(), fetchEvents()]).then(()=>{
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

function toggleMNav(){
  $('m-nav').classList.toggle('active');
}
