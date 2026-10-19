const { chromium } = require('C:/Users/tranv/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async()=>{
 const browser=await chromium.launch({headless:true,channel:"msedge"});
 const page=await browser.newPage({viewport:{width:1180,height:788}});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://localhost:3000');
 await page.waitForTimeout(1500);
 await page.screenshot({path:'.review/puzzle-after.png'});
 // Solve using the actual rendered pieces and public click interactions.
 let tiles=[8,1,6,0,7,3,5,4,2];
 for(let i=0;i<9;i++){ if(tiles[i]===i)continue; const j=tiles.indexOf(i); await page.locator('.puzzle-tile').nth(i).click(); await page.locator('.puzzle-tile').nth(j).click(); [tiles[i],tiles[j]]=[tiles[j],tiles[i]]; }
 await page.waitForTimeout(21000);
 await page.screenshot({path:'.review/letter-after.png'});
 console.log(JSON.stringify({errors,progress:await page.locator('#pct').textContent(),letterVisible:await page.locator('#letter-card').evaluate(e=>e.classList.contains('visible')),textLength:await page.locator('#letter-body').evaluate(e=>e.textContent.length)}));
 await page.locator('#view-photos-btn').click();
 console.log('Lightbox opens: '+await page.locator('#lightbox-modal').evaluate(e=>e.classList.contains('active')));
 await page.keyboard.press('Escape');
 await page.setViewportSize({width:390,height:844});
 await page.waitForTimeout(1000);await page.screenshot({path:'.review/mobile-after.png'});
 await browser.close();
})();


