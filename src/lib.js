export function safeUrl(value) {
  try { const u = new URL(value); return ['https:', 'http:'].includes(u.protocol) && !u.username && !u.password ? u.href : ''; } catch { return ''; }
}
export function safePreviewUrl(value) {
  const result = safeUrl(value); if (!result) return '';
  const u = new URL(result);
  if(u.protocol !== 'https:' || /^(localhost|127\.|0\.|10\.|192\.168\.|169\.254\.|\[)/i.test(u.hostname) || /^172\.(1[6-9]|2\d|3[01])\./.test(u.hostname) || u.hostname.endsWith('.local')) return '';
  return result;
}
export function cleanRepository(r) {
  if (!r || r.private !== false || typeof r.name !== 'string' || typeof r.html_url !== 'string') return null;
  const u = safeUrl(r.html_url);
  if (!u || new URL(u).hostname !== 'github.com' || !new URL(u).pathname.toLowerCase().startsWith('/shivammathtech/')) return null;
  return {id:r.id,name:r.name.slice(0,200),full_name:r.full_name,html_url:u,description:typeof r.description==='string'?r.description.slice(0,2500):'',homepage:safePreviewUrl(r.homepage),language:r.language||'Code',stargazers_count:Math.max(0,Number(r.stargazers_count)||0),forks_count:Math.max(0,Number(r.forks_count)||0),pushed_at:r.pushed_at,updated_at:r.updated_at,created_at:r.created_at,topics:Array.isArray(r.topics)?r.topics.filter(t=>typeof t==='string'):[],fork:!!r.fork,archived:!!r.archived,private:false};
}
export function categoryFor(repo, overrides={}) {
  if(overrides[repo.name]?.category) return overrides[repo.name].category;
  const s=`${repo.name} ${repo.description} ${(repo.topics||[]).join(' ')}`.toLowerCase();
  if (/math|calculus|algebra|fourier|laplace|numerical|integral|graph plot|probability/.test(s)) return 'Mathematics';
  if (/vision|machine.learning|neural|\bai\b|yolo|detection|tracking|robot|drone|pose|opencv|deep.learning|\bml\b/.test(s)) return 'AI & Vision';
  return 'Full Stack';
}
export function projectTitle(repo, overrides={}) {return overrides[repo.name]?.title || repo.name.replace(/[-_]+/g,' ').trim();}
export function selectProjects(repos, {search='',filter='All',sort='featured',featured=[],overrides={}}={}) {
  const q=search.toLowerCase().trim();
  return repos.filter(r=>!r.archived && !r.fork).filter(r=>filter==='All'||categoryFor(r,overrides)===filter).filter(r=>`${r.name} ${r.description} ${r.language} ${(r.topics||[]).join(' ')} ${projectTitle(r,overrides)}`.toLowerCase().includes(q)).sort((a,b)=>{
    if(sort==='featured'){const ai=featured.indexOf(a.name),bi=featured.indexOf(b.name);if(ai!==bi && (ai!==-1||bi!==-1))return (ai===-1?Infinity:ai)-(bi===-1?Infinity:bi);}
    if(sort==='stars' && a.stargazers_count!==b.stargazers_count)return b.stargazers_count-a.stargazers_count;
    return (Date.parse(b.pushed_at)||0)-(Date.parse(a.pushed_at)||0);
  });
}
export function validSnapshot(data) {return data && Array.isArray(data.repositories) && data.repositories.length>0 && Number.isFinite(Date.parse(data.fetchedAt));}
export const dateLabel=value=>Number.isFinite(Date.parse(value))?new Date(value).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'}):'Date unavailable';
export const escapeHTML=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export async function fetchJson(url,options={}) {
  const response=await fetch(url,{...options,signal:options.signal||AbortSignal.timeout(10000)});
  if(!response.ok)throw new Error(`Request failed (${response.status})`);
  const contentType=response.headers.get('content-type')||'';
  if(!contentType.includes('json'))throw new Error('Expected JSON');
  return response.json();
}
export async function fetchPublicGithub(fetcher=fetchJson) {
  const root='https://api.github.com';
  const headers={Accept:'application/vnd.github+json'};
  const profile=await fetcher(`${root}/users/ShivamMathtech`,{headers});
  const repositories=[];let complete=false;
  for(let page=1;page<=30;page++) {
    const items=await fetcher(`${root}/users/ShivamMathtech/repos?per_page=100&page=${page}&sort=pushed&type=owner`,{headers});
    if(!Array.isArray(items))throw new Error('Invalid GitHub response');
    repositories.push(...items.map(cleanRepository).filter(Boolean));
    if(items.length<100){complete=true;break;}
  }
  if(!complete)throw new Error('Repository pagination did not finish');
  return {fetchedAt:new Date().toISOString(),source:'GitHub API',complete:true,profile:{login:profile.login,public_repos:profile.public_repos,followers:profile.followers,html_url:safeUrl(profile.html_url)},repositories:[...new Map(repositories.map(r=>[r.name,r])).values()]};
}
