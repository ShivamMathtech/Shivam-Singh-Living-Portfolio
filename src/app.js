import {escapeHTML as esc,categoryFor,projectTitle,selectProjects,cleanRepository,validSnapshot,dateLabel,fetchJson,fetchPublicGithub,safePreviewUrl} from './lib.js';
import {projectArt} from './art.js';
import {startHero,startWave} from './canvas.js';
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const TTL=15*60*1000,CACHE_KEY='shivam-github-v1';
let profile,snapshot,repositories=[],filter='All',search='',sort='featured',limit=6,refreshing=false;
const storage={get(k){try{return localStorage.getItem(k);}catch{return null;}},set(k,v){try{localStorage.setItem(k,v);}catch{}}};
let toastTimer;function toast(message){$('#toast').textContent=message;$('#toast').hidden=false;clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('#toast').hidden=true,3500);}
const savedTheme=storage.get('shivam-theme');if(['light','dark'].includes(savedTheme))document.documentElement.dataset.theme=savedTheme;
function reflectTheme(){const light=document.documentElement.dataset.theme==='light';$('#theme-toggle').textContent=light?'☾':'☼';$('#theme-toggle').setAttribute('aria-label',light?'Switch to dark theme':'Switch to light theme');document.querySelector('meta[name="theme-color"]').content=light?'#f5f5ed':'#10110f';}
reflectTheme();$('#theme-toggle').onclick=()=>{document.documentElement.dataset.theme=document.documentElement.dataset.theme==='dark'?'light':'dark';storage.set('shivam-theme',document.documentElement.dataset.theme);reflectTheme();};
$('#menu-toggle').onclick=()=>{const open=$('#mobile-nav').hidden;$('#mobile-nav').hidden=!open;$('#menu-toggle').setAttribute('aria-expanded',String(open));$('#menu-toggle').setAttribute('aria-label',open?'Close navigation':'Open navigation');$('#menu-toggle').textContent=open?'×':'☰';};
$$('#mobile-nav a').forEach(a=>a.onclick=()=>{if(!$('#mobile-nav').hidden)$('#menu-toggle').click();});
addEventListener('scroll',()=>{const total=document.documentElement.scrollHeight-innerHeight;$('.reading-progress').style.transform=`scaleX(${total>0?scrollY/total:0})`;},{passive:true});
$('#year').textContent=new Date().getFullYear();
function closeDialog(id){const d=$('#'+id);d.close();if(id==='project-dialog')$('#preview-container').replaceChildren();}
$$('[data-close]').forEach(b=>b.onclick=()=>closeDialog(b.dataset.close));
$$('dialog').forEach(d=>{d.addEventListener('click',e=>{const r=d.getBoundingClientRect();if(e.target===d&&(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom))closeDialog(d.id);});d.addEventListener('close',()=>{if(d.id==='project-dialog')$('#preview-container').replaceChildren();});});
function renderProfile(){
 $('#about-summary').textContent=profile.summary;
 $('#education-timeline').innerHTML=profile.education.map(e=>`<article><div class="timeline-year">${esc(e.year)}</div><div><h3>${esc(e.degree)}</h3><p>${esc(e.institution)}</p>${e.note?`<p class="education-note">${esc(e.note)}</p>`:''}</div><span class="education-result">${esc(e.result)}</span></article>`).join('');
 const milestone=$('.proof-strip>div>strong');milestone.textContent=profile.projectMilestone;
 $('.proof-strip>div:nth-child(2)>strong').innerHTML=`${esc(profile.education[0].result.split(' ')[0])}<span>/10</span>`;
 $('.email-link').textContent=profile.email+' ↗';$('.email-link').href='mailto:'+profile.email;$('.phone-link').textContent=profile.phoneDisplay;$('.phone-link').href='tel:'+profile.phone;
}
function renderProjects(){
 const selected=selectProjects(repositories,{filter,search,sort,featured:profile.featured,overrides:profile.projectOverrides});
 $('#project-grid').innerHTML=selected.slice(0,limit).map((r,i)=>{
  const category=categoryFor(r,profile.projectOverrides),override=profile.projectOverrides[r.name]||{},art=override.art||(category==='Mathematics'?'math':category==='AI & Vision'?'vision':'code'),name=projectTitle(r,profile.projectOverrides),demo=safePreviewUrl(r.homepage);
  return `<article class="project-card"><button class="project-visual" data-project="${esc(r.name)}" aria-label="Explore ${esc(name)}"><span class="visual-label">PROJECT VISUALIZATION</span>${projectArt(art,i)}<span class="visual-bottom"><span class="project-index">PROJECT / ${String(i+1).padStart(2,'0')}</span><span class="preview-chip">${demo?'<span class="status-dot"></span> Preview website ↗':'Explore source ↗'}</span></span></button><div class="project-info"><div class="project-meta"><span>${esc(category)}</span><span>${esc(r.language)}</span></div><h3><button data-project="${esc(r.name)}">${esc(name)}</button><a href="${esc(r.html_url)}" target="_blank" rel="noopener noreferrer" aria-label="${esc(name)} on GitHub">↗</a></h3><p class="project-description">${esc(override.summary||r.description||'Explore the source, implementation, and documentation on GitHub.')}</p><div class="project-bottom"><span>Updated ${esc(dateLabel(r.pushed_at))} · ☆ ${r.stargazers_count}</span><a href="${esc(r.html_url)}" target="_blank" rel="noopener noreferrer">Source ↗</a></div></div></article>`;
 }).join('')||'<div class="empty-state">No projects match your search. Try a different keyword or category.</div>';
 $('#project-count').textContent=`${Math.min(limit,selected.length)} OF ${selected.length} PROJECTS`;
 $('#load-more').hidden=limit>=selected.length;
 $$('[data-project]').forEach(b=>b.onclick=()=>openProject(b.dataset.project));
}
function renderActivity(){
 $('#repo-total').textContent=snapshot.complete?(snapshot.profile.public_repos??repositories.length):repositories.length;
 $('#repo-total-label').textContent=snapshot.complete?'Public repositories':'Projects in snapshot';
 $('#star-total').textContent=repositories.reduce((n,r)=>n+r.stargazers_count,0);
 $('#star-total-label').textContent=snapshot.complete?'Stars on public repositories':'Stars on listed projects';
 $('#activity-updated').textContent=`${snapshot.complete?'GitHub sync':'Curated snapshot'} · ${dateLabel(snapshot.fetchedAt)}`;
 const recent=[...repositories].sort((a,b)=>(Date.parse(b.pushed_at)||0)-(Date.parse(a.pushed_at)||0)).slice(0,4);
 $('#recent-activity').innerHTML=recent.map(r=>`<a href="${esc(r.html_url)}" target="_blank" rel="noopener noreferrer"><span class="activity-dot"></span><div><strong>${esc(projectTitle(r,profile.projectOverrides))}</strong><small>LATEST PUSH · ${esc(dateLabel(r.pushed_at))}</small></div></a>`).join('');
}
function applyData(data){snapshot=data;repositories=data.repositories.map(cleanRepository).filter(Boolean);renderProjects();renderActivity();}
function status(message){$('#sync-status').textContent=message;}
function openProject(name){const r=repositories.find(x=>x.name===name);if(!r)return;$('#dialog-title').textContent=projectTitle(r,profile.projectOverrides);$('#dialog-description').textContent=r.description||'Browse this project’s source and documentation.';const url=safePreviewUrl(r.homepage);$('#dialog-links').innerHTML=`<a class="button secondary" href="${esc(r.html_url)}" target="_blank" rel="noopener noreferrer">View source ↗</a>${url?`<a class="button primary" href="${esc(url)}" target="_blank" rel="noopener noreferrer">Open website ↗</a><button id="load-preview" class="button secondary">Load live preview</button>`:''}`;
 $('#preview-container').innerHTML=url?'<div class="preview-empty"><strong>Explore the live deployment.</strong>Load this project inside the preview, or open the website in a new tab.</div>':'<div class="preview-empty"><strong>Source available on GitHub.</strong>This repository has no HTTPS deployment URL listed. Its code and setup instructions are available above.</div>';
 $('.preview-note').hidden=!url;
 if(url)$('#load-preview').onclick=()=>{const iframe=document.createElement('iframe');iframe.className='preview-frame';iframe.title=projectTitle(r,profile.projectOverrides)+' live website';iframe.referrerPolicy='no-referrer';iframe.setAttribute('sandbox','allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox');iframe.src=url;$('#preview-container').replaceChildren(iframe);$('#load-preview').textContent='Reload preview';};
 $('#project-dialog').showModal();
}
$$('[data-filter]').forEach(b=>b.onclick=()=>{filter=b.dataset.filter;limit=6;$$('[data-filter]').forEach(x=>{x.classList.toggle('active',x===b);x.setAttribute('aria-pressed',String(x===b));});renderProjects();});
$('#project-search').oninput=e=>{search=e.target.value;limit=6;renderProjects();};$('#project-sort').onchange=e=>{sort=e.target.value;limit=6;renderProjects();};$('#load-more').onclick=()=>{limit+=9;renderProjects();};
async function refreshGitHub(force=false){if(refreshing)return;refreshing=true;$('#refresh-github').disabled=true;status('Syncing public repositories from GitHub…');try{
 let data;try{data=await fetchJson('/api/github');if(!validSnapshot(data)||!data.complete)throw new Error('Invalid server response');}catch{data=await fetchPublicGithub();}
 if(!validSnapshot(data))throw new Error('Invalid data');applyData(data);storage.set(CACHE_KEY,JSON.stringify(data));status(`Synced with GitHub · ${new Date(data.fetchedAt).toLocaleString('en-IN',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'})} · Refreshes every 15 min`);if(force)toast('GitHub projects refreshed');
 }catch{status(`Showing ${snapshot?.complete?'saved GitHub data':'curated snapshot'} · ${dateLabel(snapshot?.fetchedAt)} · Live sync unavailable`);if(force)toast('Live sync unavailable. Your saved projects are still here.');}finally{refreshing=false;$('#refresh-github').disabled=false;}}
$('#refresh-github').onclick=()=>refreshGitHub(true);
let lastAttempt=0;function scheduleRefresh(){if(document.hidden)return;const timestamp=Date.parse(snapshot?.fetchedAt);if(Date.now()-timestamp>TTL&&Date.now()-lastAttempt>TTL){lastAttempt=Date.now();refreshGitHub();}}
addEventListener('online',()=>{refreshGitHub();loadLeetCode();});document.addEventListener('visibilitychange',()=>{scheduleRefresh();if(!document.hidden)loadLeetCode();});setInterval(scheduleRefresh,60000);setInterval(()=>{if(!document.hidden)loadLeetCode();},3600000);
function renderLeetCode(data,live){if(!data?.available||!Number.isFinite(data.totalSolved))return;const div=document.createElement('div');div.className='leetcode-metrics';const solved=document.createElement('span');solved.textContent=`${data.totalSolved} solved`;div.append(solved);if(Number.isFinite(data.ranking)){const rank=document.createElement('span');rank.textContent=`Rank ${data.ranking.toLocaleString('en-IN')}`;div.append(rank);}const note=document.createElement('small');note.className='leetcode-updated';note.textContent=`${live?'Synced':'Snapshot'} · ${dateLabel(data.fetchedAt)}`;$('#leetcode-stats').replaceChildren(div,note);}
async function loadLeetCode(){try{const saved=JSON.parse(storage.get('shivam-leetcode-v1'));if(saved?.available){renderLeetCode(saved,false);if(Date.now()-Date.parse(saved.fetchedAt)<3600000)return;}}catch{}try{renderLeetCode(await fetchJson('/data/leetcode-snapshot.json'),false);}catch{}try{const data=await fetchJson('/api/leetcode');if(data.available){renderLeetCode(data,true);storage.set('shivam-leetcode-v1',JSON.stringify(data));}}catch{/* Last verified snapshot or public profile link remains available. */}}
async function copyText(text){try{await navigator.clipboard.writeText(text);return true;}catch{const area=document.createElement('textarea');area.value=text;area.style.position='fixed';area.style.opacity='0';document.body.append(area);area.select();let ok=false;try{ok=document.execCommand('copy');}catch{}area.remove();return ok;}}
$('#copy-email').onclick=async()=>toast(await copyText(profile?.email||'drshivam49@gmail.com')?'Email copied':'Copy the email address shown on the page');
function draft(){return `Hello Shivam,\n\n${$('#contact-message').value.trim()}\n\nFrom: ${$('#contact-name').value.trim()}\nEmail: ${$('#contact-email').value.trim()}`;}
$('#contact-form').onsubmit=e=>{e.preventDefault();if(!e.target.reportValidity())return;const subject=encodeURIComponent(`Portfolio inquiry from ${$('#contact-name').value.trim()}`);location.href=`mailto:${profile.email}?subject=${subject}&body=${encodeURIComponent(draft())}`;$('#form-status').textContent='Your email draft is ready. Send it from your email app, or copy it below.';};
$('#copy-message').onclick=async()=>{if(!$('#contact-form').reportValidity())return;const ok=await copyText(draft());$('#form-status').textContent=ok?'Message copied. Paste it into your email app and send it to '+profile.email+'.':'Copy was unavailable. Select your message and copy it manually.';};
const commands=[['Selected work','#work','Projects, GitHub, code'],['About Shivam','#about','Skills, AI, mathematics, full stack'],['Education & journey','#journey','Degree, college, IIT JAM'],['Interactive playground','#lab','Wave, mathematics, frequency'],['Live progress','#activity','GitHub, LeetCode, stats'],['Start a conversation','#contact','Email, phone, contact']];let commandIndex=0,commandMatches=commands;
function renderCommands(){const q=$('#command-search').value.toLowerCase();commandMatches=commands.filter(c=>c.join(' ').toLowerCase().includes(q));commandIndex=Math.min(commandIndex,Math.max(0,commandMatches.length-1));$('#command-results').innerHTML=commandMatches.map((c,i)=>`<button data-command="${i}" class="${i===commandIndex?'selected':''}"><span>${c[0]}</span><span>↗</span></button>`).join('')||'<p class="form-note">No matching section.</p>';$$('[data-command]').forEach(b=>b.onclick=()=>runCommand(Number(b.dataset.command)));}
function runCommand(i){const c=commandMatches[i];if(!c)return;$('#command-dialog').close();location.hash=c[1];$(c[1]).scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});}
function openCommands(){$('#command-search').value='';commandIndex=0;renderCommands();$('#command-dialog').showModal();$('#command-search').focus();}
$('#command-button').onclick=openCommands;$('#command-search').oninput=()=>{commandIndex=0;renderCommands();};
$('#command-dialog').addEventListener('keydown',e=>{if(e.key==='ArrowDown'||e.key==='ArrowUp'){e.preventDefault();commandIndex=(commandIndex+(e.key==='ArrowDown'?1:-1)+commandMatches.length)%Math.max(commandMatches.length,1);renderCommands();}if(e.key==='Enter'){e.preventDefault();runCommand(commandIndex);}});
addEventListener('keydown',e=>{if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){e.preventDefault();$('#command-dialog').open?$('#command-dialog').close():openCommands();}});
startHero();startWave();
async function init(){try{const [p,seed]=await Promise.all([fetchJson('/data/profile.json'),fetchJson('/data/github-snapshot.json')]);profile=p;renderProfile();let initial=seed;try{const cache=JSON.parse(storage.get(CACHE_KEY));if(validSnapshot(cache)&&Date.parse(cache.fetchedAt)>Date.parse(seed.fetchedAt))initial=cache;}catch{}applyData(initial);status(`${initial.complete?'Saved GitHub data':'Curated GitHub snapshot'} · ${dateLabel(initial.fetchedAt)}`);if(!initial.complete||Date.now()-Date.parse(initial.fetchedAt)>TTL){lastAttempt=Date.now();refreshGitHub();}else status(`Synced with GitHub · ${dateLabel(initial.fetchedAt)} · Refreshes every 15 min`);loadLeetCode();}catch{status('Unable to load project data. Please reload the page.');$('#project-grid').innerHTML='<div class="empty-state">Visit <a href="https://github.com/ShivamMathtech" target="_blank" rel="noopener noreferrer">GitHub</a> to explore Shivam’s projects.</div>';}}
init();
