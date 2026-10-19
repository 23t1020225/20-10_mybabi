const{chromium}=require('C:/Users/tranv/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict');
const server=require('node:child_process').spawn(process.execPath,['-e',require('node:fs').readFileSync('server.js','utf8').replace('const PORT = 3000','const PORT = 3102')],{windowsHide:true,stdio:'ignore'});
(async()=>{await new Promise(r=>setTimeout(r,800));const b=await chromium.launch({headless:true,channel:'msedge'});try{
const p=await b.newPage({viewport:{width:1180,height:788}});const errors=[];p.on('pageerror',e=>errors.push(e.message));
await p.goto('http://127.0.0.1:3102',{waitUntil:'domcontentloaded'});
let tiles=[8,1,6,0,7,3,5,4,2];for(let i=0;i<9;i++){if(tiles[i]===i)continue;const j=tiles.indexOf(i);await p.locator('.puzzle-tile').nth(i).click();await p.locator('.puzzle-tile').nth(j).click();[tiles[i],tiles[j]]=[tiles[j],tiles[i]];}
await p.locator('#roll-letter-btn').waitFor({state:'visible',timeout:40000});
const letter=await p.locator('#letter-body').textContent();assert(letter.endsWith('🐻'));
await p.screenshot({path:'.review/upgraded-letter.png'});
const height=await p.locator('#letter-card').evaluate(e=>e.getBoundingClientRect().height);
await p.locator('#roll-letter-btn').click();await p.waitForTimeout(1200);
const partial=await p.locator('#letter-card').evaluate(e=>e.getBoundingClientRect().height);assert(partial<height&&partial>31);
await p.locator('#keepsake-home').waitFor({state:'visible'});
assert.equal(await p.locator('#letter-photo-float').evaluate(e=>e.classList.contains('visible')),false);
await p.screenshot({path:'.review/upgraded-home.png'});
await p.locator('[data-keepsake="album"]').click();assert.equal(await p.locator('.album-photo').count(),15);
await p.locator('.album-photo').nth(4).click();assert.equal(await p.locator('#lightbox-img').getAttribute('src'),'images/anh5.JPG');await p.keyboard.press('ArrowRight');assert.equal(await p.locator('#lightbox-img').getAttribute('src'),'images/anh6.JPG');await p.keyboard.press('Escape');assert.equal(await p.evaluate(()=>document.activeElement.className),'album-photo');
await p.locator('#keepsake-back').click();await p.locator('[data-keepsake="notes"]').click();assert(await p.locator('.keepsake-note').isVisible());
await p.locator('#keepsake-back').click();await p.locator('[data-keepsake="wishes"]').click();assert.equal(await p.locator('.keepsake-wishes li').count(),4);
await p.locator('#keepsake-back').click();await p.locator('[data-keepsake="letter"]').click();assert.equal(await p.locator('#letter-body').textContent(),letter);await p.locator('#view-photos-btn.visible').waitFor();
await p.setViewportSize({width:390,height:844});await p.locator('#roll-letter-btn').click();await p.locator('#keepsake-home').waitFor({state:'visible'});await p.screenshot({path:'.review/upgraded-mobile.png'});
assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
await p.locator('[data-keepsake="album"]').click();await p.locator('.album-photo').first().click();await p.keyboard.press('Escape');assert.deepEqual(errors,[]);
console.log('PASS: puzzle, completed letter, gradual roll, all folders, 15 album photos, lightbox navigation/focus, reopen without retyping, mobile and repeat roll; no JS errors.');
}finally{await b.close();server.kill();}})().catch(e=>{server.kill();console.error(e);process.exitCode=1});
