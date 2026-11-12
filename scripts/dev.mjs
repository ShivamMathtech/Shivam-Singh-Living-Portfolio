import {existsSync} from 'node:fs';
const envPath=new URL('../.env.local',import.meta.url);if(existsSync(envPath))process.loadEnvFile(envPath);
import http from 'node:http';import {readFile,stat} from 'node:fs/promises';import {resolve,extname,sep} from 'node:path';import {fileURLToPath} from 'node:url';import github from '../api/github.js';import leetcode from '../api/leetcode.js';
await import('./build.mjs');
const root=fileURLToPath(new URL('../dist/',import.meta.url));const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json','.svg':'image/svg+xml','.png':'image/png','.txt':'text/plain','.xml':'application/xml'};
const portIndex=process.argv.indexOf('--port'),port=Number(portIndex>=0?process.argv[portIndex+1]:process.env.PORT||5173);
http.createServer(async(req,res)=>{res.setHeader('X-Content-Type-Options','nosniff');const pathname=new URL(req.url,'http://localhost').pathname;
 if(pathname==='/api/github'||pathname==='/api/leetcode'){res.status=n=>{res.statusCode=n;return res;};res.json=data=>res.end(JSON.stringify(data));res.setHeader('Content-Type','application/json');return (pathname==='/api/github'?github:leetcode)(req,res);}
 if(req.method!=='GET'&&req.method!=='HEAD'){res.writeHead(405);return res.end();}
 try{const file=resolve(root,'.'+decodeURIComponent(pathname==='/'?'/index.html':pathname));if(!file.startsWith(root.endsWith(sep)?root:root+sep)){res.writeHead(403);return res.end('Forbidden');}const info=await stat(file);if(!info.isFile())throw new Error('Not a file');res.setHeader('Content-Type',types[extname(file)]||'application/octet-stream');res.setHeader('Cache-Control','no-cache');res.end(req.method==='HEAD'?'':await readFile(file));}catch{res.writeHead(404,{'Content-Type':'text/plain'});res.end('Not found');}
}).listen(port,'0.0.0.0',()=>console.log(`Portfolio ready at http://localhost:${port}`));
