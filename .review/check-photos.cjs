const {chromium}=require('C:/Users/tranv/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict');
const server = require('node:child_process').spawn(process.execPath,['-e',require('node:fs').readFileSync('server.js','utf8').replace('const PORT = 3000','const PORT = 3101')],{cwd:process.cwd(),windowsHide:true,stdio:'ignore'});
(async()=>{await new Promise(r=>setTimeout(r,1000));const browser=await chromium.launch({headless:true,channel:'msedge'});try{
const page=await browser.newPage({viewport:{width:1180,height:788}});const errors=[],missing=[];
page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400&&r.url().includes('127.0.0.1'))missing.push(r.url());});
await page.goto('http://127.0.0.1:3101');
let tiles=[8,1,6,0,7,3,5,4,2];for(let i=0;i<9;i++){if(tiles[i]===i)continue;let j=tiles.indexOf(i);await page.locator('.puzzle-tile').nth(i).click();await page.locator('.puzzle-tile').nth(j).click();[tiles[i],tiles[j]]=[tiles[j],tiles[i]];}
await page.locator('#view-photos-btn.visible').waitFor({timeout:40000});
assert(await page.locator('#letter-float-img').evaluate(e=>e.complete&&e.naturalWidth>0));
const first=await page.locator('#letter-float-img').getAttribute('src');
await page.locator('#view-photos-btn').click();await page.waitForTimeout(4500);
assert.equal(await page.locator('#letter-float-img').getAttribute('src'),first);
await page.keyboard.press('ArrowRight');assert.notEqual(await page.locator('#lightbox-img').getAttribute('src'),'images/anh1.JPG');
await page.keyboard.press('Escape');await page.waitForTimeout(4500);
assert.notEqual(await page.locator('#letter-float-img').getAttribute('src'),first);
await page.screenshot({path:'.review/photos-checked.png'});
// A missing image is skipped rather than stopping the slideshow.
await page.route('**/images/anh3.JPG',route=>route.abort());
await page.waitForTimeout(4200);
assert((await page.locator('#letter-float-img').getAttribute('src')).endsWith('/anh4.JPG'));
assert.deepEqual(errors,[]);assert.deepEqual(missing,[]);
console.log('PASS: photo loads after letter, advances with animation, pauses in modal, arrow keys and Escape work, missing photo is skipped; no JS errors or local HTTP failures.');
}finally{await browser.close();server.kill();}})().catch(e=>{console.error(e);process.exitCode=1});


