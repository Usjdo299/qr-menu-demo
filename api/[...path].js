const crypto=require('crypto');
const {neon}=require('@neondatabase/serverless');
const DBURL=process.env.DATABASE_URL||process.env.POSTGRES_URL||process.env.POSTGRES_URL_NON_POOLING;
const sql=DBURL?neon(DBURL):null;
let ready=null;
function init(){
 if(!ready)ready=(async()=>{
  await sql.query('CREATE TABLE IF NOT EXISTS restaurants(slug text PRIMARY KEY,salt text,hash text,tsalt text,data text,rev int DEFAULT 1)');
  await sql.query('CREATE TABLE IF NOT EXISTS orders(id text PRIMARY KEY,slug text,n int,tbl int,items text,note text,total bigint,st text,ts bigint,upd bigint)');
  await sql.query('CREATE INDEX IF NOT EXISTS o_slug_ts ON orders(slug,ts)');
  await sql.query('CREATE INDEX IF NOT EXISTS o_slug_upd ON orders(slug,upd)');
 })().catch(e=>{ready=null;throw e});
 return ready;
}
const hex=n=>crypto.randomBytes(n).toString('hex');
const sha=s=>crypto.createHash('sha256').update(s).digest('hex').slice(0,10);
const okSlug=s=>/^[a-z0-9-]{3,30}$/.test(s||'');
const hashPw=(pw,salt)=>new Promise((res,rej)=>crypto.pbkdf2(pw,salt,20000,32,'sha256',(e,k)=>e?rej(e):res(k.toString('hex'))));
const AC=new Map();
async function auth(slug,pw){
 if(!pw||!okSlug(slug))return null;
 const rs=await sql.query('SELECT salt,hash,tsalt FROM restaurants WHERE slug=$1',[slug]);
 const r=rs[0];if(!r)return null;
 const ck=slug+'|'+sha(pw+r.salt)+r.hash.slice(0,6),c=AC.get(ck);
 if(c&&c>Date.now())return r;
 if((await hashPw(pw,r.salt))!==r.hash)return null;
 if(AC.size>500)AC.clear();AC.set(ck,Date.now()+120000);return r;
}
const RL=new Map();
const tkey=(r,t)=>sha((r.tsalt||'x')+':'+t);
const tcount=d=>Math.max(1,Math.min(100,parseInt(d&&d.shop&&d.shop.tables)||10));
module.exports=async(req,res)=>{
 res.setHeader('cache-control','no-store');res.setHeader('access-control-allow-origin','*');
 res.setHeader('access-control-allow-headers','content-type,authorization');res.setHeader('access-control-allow-methods','GET,POST,PUT,OPTIONS');
 const J=(o,s=200)=>{res.status(s).setHeader('content-type','application/json;charset=utf-8');res.send(JSON.stringify(o))};
 if(req.method==='OPTIONS')return res.status(204).end();
 try{
  if(!sql)return J({error:'no_db'},500);
  await init();
  const u=new URL(req.url,'http://x'),p=u.pathname.replace(/^\/api\/?/,'').split('/').filter(Boolean);
  const bearer=slug=>auth(slug,(req.headers.authorization||'').replace(/^Bearer /,''));
  const body=()=>{let b=req.body;if(typeof b==='string'){try{b=JSON.parse(b)}catch(e){b={}}}return b||{}};
  const m=req.method;
  if(p[0]==='m'&&p[1]&&m==='GET'){
   const rs=await sql.query('SELECT data,rev FROM restaurants WHERE slug=$1',[p[1]]);if(!rs[0])return J({error:'not_found'},404);
   res.status(200).setHeader('content-type','application/json;charset=utf-8');return res.send('{"data":'+rs[0].data+',"rev":'+rs[0].rev+'}')}
  if(p[0]==='m'&&p[1]&&m==='PUT'){
   const r=await bearer(p[1]);if(!r)return J({error:'unauthorized'},401);
   const b=body();if(!b.data||!Array.isArray(b.data.items)||!Array.isArray(b.data.cats))return J({error:'bad'},400);
   const t=JSON.stringify(b.data);if(t.length>4200000)return J({error:'too_big'},413);
   await sql.query('UPDATE restaurants SET data=$2,rev=rev+1 WHERE slug=$1',[p[1],t]);return J({ok:true})}
  if(p[0]==='login'&&m==='POST'){const b=body();const r=await auth(b.slug,b.password);return r?J({ok:true}):J({error:'unauthorized'},401)}
  if(p[0]==='create'&&m==='POST'){
   const b=body();if(!okSlug(b.slug))return J({error:'bad_slug'},400);if(!b.password||b.password.length<6)return J({error:'short_password'},400);
   if((await sql.query('SELECT 1 FROM restaurants WHERE slug=$1',[b.slug]))[0])return J({error:'exists'},409);
   const t=JSON.stringify(b.data||{});if(t.length>4200000)return J({error:'too_big'},413);
   const salt=hex(12);await sql.query('INSERT INTO restaurants(slug,salt,hash,tsalt,data,rev) VALUES($1,$2,$3,$4,$5,1)',[b.slug,salt,await hashPw(b.password,salt),hex(10),t]);return J({ok:true})}
  if(p[0]==='passwd'&&m==='POST'){
   const b=body();const r=await auth(b.slug,b.password);if(!r)return J({error:'unauthorized'},401);
   if(!b.next||b.next.length<6)return J({error:'short_password'},400);
   const salt=hex(12);await sql.query('UPDATE restaurants SET salt=$2,hash=$3 WHERE slug=$1',[b.slug,salt,await hashPw(b.next,salt)]);return J({ok:true})}
  if(p[0]==='keys'&&m==='GET'){
   const r=await bearer(p[1]);if(!r)return J({error:'unauthorized'},401);
   const d=JSON.parse((await sql.query('SELECT data FROM restaurants WHERE slug=$1',[p[1]]))[0].data);
   const n=tcount(d),keys={};for(let i=1;i<=n;i++)keys[i]=tkey(r,i);return J({n,keys})}
  if(p[0]==='order'&&p[1]&&!p[2]&&m==='POST'){
   const slug=p[1],rs=await sql.query('SELECT tsalt,data FROM restaurants WHERE slug=$1',[slug]);const r=rs[0];if(!r)return J({error:'not_found'},404);
   const d=JSON.parse(r.data);if(d.shop&&d.shop.ordering===false)return J({error:'ordering_off'},403);
   const b=body(),t=parseInt(b.t);
   if(!(t>=1&&t<=tcount(d))||!r.tsalt||b.k!==tkey(r,t))return J({error:'bad_table'},403);
   const ip=(req.headers['x-forwarded-for']||'x').split(',')[0].trim(),rk=ip+slug+t,now=Date.now();
   if(RL.has(rk)&&now-RL.get(rk)<20000)return J({error:'slow_down'},429);
   if(RL.size>2000)RL.clear();
   if(!Array.isArray(b.items)||!b.items.length||b.items.length>40)return J({error:'bad_items'},400);
   const menu=new Map(d.items.map(i=>[i.id,i]));let total=0,its=[],qty=0;
   for(const x of b.items){const mi=menu.get(x.id);const q=Math.max(1,Math.min(20,parseInt(x.q)||1));
    if(!mi||!mi.on)return J({error:'unavailable',name:mi?mi.name:''},409);
    total+=mi.price*q;qty+=q;its.push({id:mi.id,name:mi.name,price:mi.price,q,note:String(x.note||'').slice(0,120)})}
   if(qty>80)return J({error:'bad_items'},400);
   const oc=await sql.query("SELECT COUNT(*)::int c FROM orders WHERE slug=$1 AND tbl=$2 AND st='new'",[slug,t]);
   if(oc[0].c>=3)return J({error:'too_many_open'},429);
   const id=hex(6);
   const ins=await sql.query("INSERT INTO orders(id,slug,n,tbl,items,note,total,st,ts,upd) VALUES($1,$2,(SELECT COALESCE(MAX(n),0)+1 FROM orders WHERE slug=$2),$3,$4,$5,$6,'new',$7,$7) RETURNING n",[id,slug,t,JSON.stringify(its),String(b.note||'').slice(0,200),total,now]);
   RL.set(rk,now);
   sql.query('DELETE FROM orders WHERE slug=$1 AND ts<$2',[slug,now-3*864e5]).catch(()=>{});
   return J({ok:true,id,n:ins[0].n,total})}
  if(p[0]==='order'&&p[1]&&p[2]&&m==='GET'){
   const rs=await sql.query('SELECT n,st,tbl FROM orders WHERE slug=$1 AND id=$2',[p[1],p[2]]);if(!rs[0])return J({error:'not_found'},404);return J(rs[0])}
  if(p[0]==='orders'&&p[1]){
   const r=await bearer(p[1]);if(!r)return J({error:'unauthorized'},401);
   const fix=o=>({id:o.id,n:o.n,tbl:o.tbl,items:JSON.parse(o.items),note:o.note,total:Number(o.total),st:o.st,ts:Number(o.ts),upd:Number(o.upd)});
   if(m==='GET'){
    const sc=parseInt(u.searchParams.get('since'))||0;
    const rs=sc?await sql.query('SELECT * FROM orders WHERE slug=$1 AND upd>$2 ORDER BY upd LIMIT 150',[p[1],sc]):await sql.query('SELECT * FROM orders WHERE slug=$1 AND ts>$2 ORDER BY ts DESC LIMIT 150',[p[1],Date.now()-14*3600*1000]);
    return J({now:Date.now(),orders:rs.map(fix)})}
   if(m==='POST'&&p[2]){
    const b=body();if(!['new','prep','ready','done','cancel'].includes(b.st))return J({error:'bad'},400);
    await sql.query('UPDATE orders SET st=$1,upd=$2 WHERE id=$3 AND slug=$4',[b.st,Date.now(),p[2],p[1]]);return J({ok:true})}
  }
  return J({error:'not_found'},404);
 }catch(e){console.error(e);return J({error:'server'},500)}
};
