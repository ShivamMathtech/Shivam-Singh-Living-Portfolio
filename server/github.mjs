import {fetchPublicGithub} from '../src/lib.js';
export function createGitHubService({fetcher=fetch,token=()=>process.env.GITHUB_TOKEN||'',ttl=900000,now=()=>Date.now()}={}){
 let cache=null,inflight=null;
 async function load(){
  if(cache && now()-cache.at<ttl)return cache.data;
  if(inflight)return inflight;
  inflight=(async()=>{
    const secret=token();
    const data=await fetchPublicGithub(async(url,options)=>{
      const response=await fetcher(url,{...options,headers:{...options.headers,'User-Agent':'Shivam-Portfolio',...(secret?{Authorization:`Bearer ${secret}`}:{})},signal:AbortSignal.timeout(8000)});
      if(!response.ok)throw new Error('GitHub is temporarily unavailable');
      return response.json();
    });
    cache={at:now(),data};return data;
  })();
  try{return await inflight;}finally{inflight=null;}
 }
 return {load};
}
export const githubService=createGitHubService();
