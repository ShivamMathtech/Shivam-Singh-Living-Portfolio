import {githubService} from '../server/github.mjs';
export default async function handler(req,res){
 res.setHeader('Content-Type','application/json');res.setHeader('X-Content-Type-Options','nosniff');
 if(req.method!=='GET'){res.setHeader('Allow','GET');return res.status(405).json({error:'Method not allowed'});}
 try{const data=await githubService.load();res.setHeader('Cache-Control','public, s-maxage=900, stale-while-revalidate=3600');return res.status(200).json(data);}catch{res.setHeader('Cache-Control','no-store');return res.status(503).json({error:'Live GitHub sync is temporarily unavailable. The portfolio will use its saved data.'});}
}
