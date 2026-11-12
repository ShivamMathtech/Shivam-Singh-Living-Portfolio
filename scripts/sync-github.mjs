import {existsSync} from 'node:fs';
const envPath=new URL('../.env.local',import.meta.url);if(existsSync(envPath))process.loadEnvFile(envPath);
import {writeFile} from 'node:fs/promises';import {githubService} from '../server/github.mjs';
try{const data=await githubService.load();await writeFile(new URL('../src/data/github-snapshot.json',import.meta.url),JSON.stringify(data,null,2)+'\n');console.log(`Saved ${data.repositories.length} public repositories.`);}catch(error){console.error('Sync failed; existing snapshot was preserved.',error.message);process.exitCode=1;}
