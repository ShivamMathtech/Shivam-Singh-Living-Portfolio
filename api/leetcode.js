let cache=null,pending=null;
export default async function handler(req,res){
 if(req.method!=='GET'){res.setHeader('Allow','GET');return res.status(405).json({error:'Method not allowed'});}
 if(cache && Date.now()-cache.at<3600000){res.setHeader('Cache-Control','public, s-maxage=3600');return res.status(200).json(cache.data);}
 try{
  if(!pending)pending=(async()=>{
   const response=await fetch('https://leetcode.com/graphql/',{method:'POST',headers:{'Content-Type':'application/json','User-Agent':'Shivam-Portfolio'},body:JSON.stringify({query:'query userProfile($username: String!) { matchedUser(username: $username) { username profile { ranking } submitStatsGlobal { acSubmissionNum { difficulty count } } } }',variables:{username:'Shiva_NSG'}}),signal:AbortSignal.timeout(8000)});
   if(!response.ok)throw new Error('Unavailable');const body=await response.json(),user=body.data?.matchedUser,total=user?.submitStatsGlobal?.acSubmissionNum?.find(x=>x.difficulty==='All')?.count;
   if(!user||!Number.isFinite(total))throw new Error('Unavailable');
   const data={available:true,totalSolved:total,ranking:user.profile?.ranking??null,fetchedAt:new Date().toISOString()};cache={at:Date.now(),data};return data;
  })();
  const data=await pending;res.setHeader('Cache-Control','public, s-maxage=3600');return res.status(200).json(data);
 }catch{res.setHeader('Cache-Control','no-store');return res.status(503).json({available:false,profileUrl:'https://leetcode.com/u/Shiva_NSG/'});}finally{pending=null;}
}
