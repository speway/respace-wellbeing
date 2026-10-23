import { createServer } from 'node:http';
import { handle } from '../server/handler.ts';
const server=createServer(async (req,res)=>{
  try {
    const chunks=[];for await(const chunk of req)chunks.push(chunk);
    const request=new Request('http://127.0.0.1:5173'+req.url,{method:req.method,headers:req.headers,...(!['GET','HEAD'].includes(req.method)?{body:Buffer.concat(chunks)}:{})});
    const response=await handle(request);
    const headers=Object.fromEntries([...response.headers.entries()].filter(([key])=>key!=='set-cookie'));
    const cookies=response.headers.getSetCookie();if(cookies.length)headers['set-cookie']=cookies;
    res.writeHead(response.status,headers);
    res.end(Buffer.from(await response.arrayBuffer()));
  }catch{res.writeHead(500,{'Content-Type':'application/json'});res.end(JSON.stringify({error:'Local API error.'}));}
});
server.listen(3001,'127.0.0.1',()=>console.log('Account API listening on 127.0.0.1:3001'));
