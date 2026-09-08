import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {inflateSync} from 'node:zlib';
const root=path.resolve('public');
const manifest=JSON.parse(fs.readFileSync(path.join(root,'favicon-assets.json')));
function png(bytes,size){
 assert.equal(bytes.subarray(0,8).toString('hex'),'89504e470d0a1a0a');
 assert.equal(bytes.readUInt32BE(16),size);assert.equal(bytes.readUInt32BE(20),size);
 const idat=[];let ended=false;
 for(let p=8;p<bytes.length;){const n=bytes.readUInt32BE(p),type=bytes.toString('ascii',p+4,p+8);assert.ok(p+12+n<=bytes.length);if(type==='IDAT')idat.push(bytes.subarray(p+8,p+8+n));if(type==='IEND')ended=true;p+=12+n;}
 assert.ok(ended);assert.ok(inflateSync(Buffer.concat(idat)).length>0);
}
test('approved favicon bytes, PNG payloads and all ICO entries remain intact',()=>{
 const sizes={'apple-touch-icon.png':180,'favicon-16x16.png':16,'favicon-32x32.png':32,'favicon-48x48.png':48,'icon-192.png':192,'icon-512.png':512,'shulin-studio-favicon-source.png':512};
 for(const [name,meta]of Object.entries(manifest)){const b=fs.readFileSync(path.join(root,name));assert.equal(b.length,meta.bytes);assert.equal(createHash('sha256').update(b).digest('hex'),meta.sha256);if(sizes[name])png(b,sizes[name]);}
 const b=fs.readFileSync(path.join(root,'favicon.ico'));assert.equal(b.readUInt16LE(0),0);assert.equal(b.readUInt16LE(2),1);assert.equal(b.readUInt16LE(4),6);
 const sizesFound=[];for(let i=0;i<6;i++){const p=6+i*16,w=b[p]||256,h=b[p+1]||256,n=b.readUInt32LE(p+8),offset=b.readUInt32LE(p+12);assert.equal(w,h);assert.ok(offset+n<=b.length);png(b.subarray(offset,offset+n),w);sizesFound.push(w);}assert.deepEqual(sizesFound,[16,32,48,64,128,256]);
});
test('all canonical generated pages use only the approved root icon system',()=>{
 const pages=['index.html','work.html','experiments.html','profile.html',...fs.readdirSync('public/site/work').filter(x=>x.endsWith('.html')).map(x=>'work/'+x)];
 for(const page of pages){const html=fs.readFileSync('public/site/'+page,'utf8'),head=html.split('</head>')[0];const refs=[...head.matchAll(/<link\b[^>]*rel="(?:icon|shortcut icon|apple-touch-icon)"[^>]*>/g)].map(x=>x[0].match(/href="([^"]+)"/)[1]);assert.deepEqual(refs,['/favicon.ico','/favicon-32x32.png','/favicon-16x16.png','/apple-touch-icon.png'],page);for(const ref of refs)assert.ok(fs.existsSync(path.join(root,ref)));}
 assert.ok(!fs.existsSync('public/favicon.svg'));assert.ok(!fs.readFileSync('app/layout.tsx','utf8').includes('/favicon.svg'));
 const config=JSON.parse(fs.readFileSync('vercel.json'));assert.equal(config.outputDirectory,'public');assert.ok(!config.rewrites.some(x=>x.source==='/favicon.ico'||x.source==='/(.*)'));
});
