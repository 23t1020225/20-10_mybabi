const{chromium}=require('C:/Users/tranv/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');const assert=require('node:assert/strict');
const server=require('node:child_process').spawn(process.execPath,['-e',require('node:fs').readFileSync('server.js','utf8').replace('const PORT = 3000','const PORT = 3103')],{windowsHide:true,stdio:'ignore'});
(async()=>{await new Promise(r=>setTimeout(r,800));const b=await chromium.launch({headless:true,channel:'msedge'});try{
const p=await b.newPage({viewport:{width:1180,height:788},hasTouch:true});const errors=[];p.on('pageerror',e=>errors.push(e.message));await p.goto('http://127.0.0.1:3103',{waitUntil:'domcontentloaded'});
await p.evaluate(()=>{const original=HeartTree.prototype.start;HeartTree.prototype.start=function(){window.testTree=this;original.call(this);this.started-=10;};});
let tiles=[8,1,6,0,7,3,5,4,2];for(let i=0;i<9;i++){if(tiles[i]===i)continue;const j=tiles.indexOf(i);await p.locator('.puzzle-tile').nth(i).click();await p.locator('.puzzle-tile').nth(j).click();[tiles[i],tiles[j]]=[tiles[j],tiles[i]];}
const available=()=>{const tree=window.testTree;return tree?.hitHearts.find(h=>h.y>innerHeight*.42&&h.x>innerWidth*.53&&document.elementFromPoint(h.x,h.y)===tree.canvas);};
await p.waitForFunction(available,{},{timeout:15000});let hit=await p.evaluate(available);await p.mouse.click(hit.x,hit.y);await p.waitForFunction(()=>window.testTree.bursts.length>0);assert(await p.evaluate(()=>window.testTree.bursts[0].particles.length===30));
await p.waitForTimeout(400);await p.screenshot({path:'.review/heart-sparkles.png'});await p.waitForTimeout(1300);assert.equal(await p.evaluate(()=>window.testTree.bursts.length),0);
await p.mouse.click(1160,760);assert.equal(await p.evaluate(()=>window.testTree.bursts.length),0);
await p.setViewportSize({width:390,height:844});await p.waitForFunction(available,{},{timeout:10000});hit=await p.evaluate(available);await p.touchscreen.tap(hit.x,hit.y);await p.waitForFunction(()=>window.testTree.bursts.length>0);
await p.evaluate(()=>{ const tree=window.testTree,t=(performance.now()-tree.started)/1000; window.groundLeaf={x:590,y:675,size:12,angle:0,color:'#ef5da8',born:t}; tree.falling.push(window.groundLeaf); });
await p.waitForFunction(()=>window.groundLeaf.landed===true);
assert(await p.evaluate(()=>window.testTree.landings.some(l=>l.particles.length===6)));
await p.waitForTimeout(1000);
assert(await p.evaluate(()=>!window.testTree.falling.includes(window.groundLeaf)));
await p.emulateMedia({reducedMotion:'reduce'});assert(await p.evaluate(()=>window.testTree.reducedMotion.matches));assert.deepEqual(errors,[]);console.log('PASS: real falling heart click and mobile tap create 30 particles; effect expires, empty clicks ignored, reduced motion supported; ground collision creates six particles and removes landed heart; no JS errors.');
}finally{await b.close();server.kill();}})().catch(e=>{server.kill();console.error(e);process.exitCode=1});
