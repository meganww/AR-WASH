+    257: 
+    258: // ===== SHIFT HANDOFF TRACKER =====
+    259: var PALLETS = [{name:'Refurb',buildRate:1.5},{name:'Shoes',buildRate:1.0},{name:'Problem Solve',buildRate:0.5}];
+    260: var BUFFERS = [{name:'AR WIP',min:3,max:8},{name:'Sort WIP',min:0,max:4},{name:'Tech WIP',min:0,max:4},{name:'Blancco',min:0,max:Infinity}];
+    261: var AA_OPS = {Shoes:6,Refurb:10,'Problem Solve':10,'AR Grading':25,Tech:12,Sort:75};
+    262: 
+    263: document.getElementById('trackDate').valueAsDate = new Date();
+    264: 
+    265: // Build pallet rows
+    266: var palletBody = document.getElementById('palletBody');
+    267: PALLETS.forEach(function(p, i) {
+    268:   var row = document.createElement('div');
+    269:   row.className = 'staffing-row';
+    270:   row.style.cssText = 'grid-template-columns:1.2fr repeat(7,1fr) 1fr;';
+    271:   row.innerHTML =
+    272:     '<span style="font-weight:700;color:#16a34a;">' + p.name + '</span>' +
+    273:     '<span><input type="number" step="0.1" class="handoff-input" id="p-sos-' + i + '" value="0"></span>' +
+    274:     '<span><input type="number" step="0.1" class="handoff-input" id="p-build-' + i + '" value="0"></span>' +
+    275:     '<span><input type="number" step="0.1" class="handoff-input" id="p-proc-' + i + '" value="0"></span>' +
+    276:     '<span id="p-eos-' + i + '">0</span>' +
+    277:     '<span style="color:#9ca3af;">' + p.buildRate + '/shift</span>' +
+    278:     '<span id="p-net-' + i + '">0</span>' +
+    279:     '<span id="p-hand-' + i + '">-</span>' +
+    280:     '<span id="p-stat-' + i + '">-</span>';
+    281:   palletBody.appendChild(row);
+    282: });
+    283: palletBody.addEventListener('input', calcHandoff);
+    284: 
+    285: // Build buffer rows
+    286: var bufferBody = document.getElementById('bufferBody');
+    287: BUFFERS.forEach(function(b, i) {
+    288:   var row = document.createElement('div');
+    289:   row.className = 'staffing-row';
+    290:   row.style.cssText = 'grid-template-columns:1.2fr repeat(4,1fr) 1fr 1fr 0.8fr;';
+    291:   row.innerHTML =
+    292:     '<span style="font-weight:700;color:#16a34a;">' + b.name + '</span>' +
+    293:     '<span><input type="number" step="0.1" class="handoff-input" id="b-sos-' + i + '" value="0"></span>' +
+    294:     '<span><input type="number" step="0.1" class="handoff-input" id="b-eos-' + i + '" value="0"></span>' +
+    295:     '<span style="color:#9ca3af;">' + b.min + '</span>' +
+    296:     '<span style="color:#9ca3af;">' + (b.max === Infinity ? '∞' : b.max) + '</span>' +
+    297:     '<span id="b-sstat-' + i + '">-</span>' +
+    298:     '<span id="b-estat-' + i + '">-</span>' +
+    299:     '<span id="b-chg-' + i + '">0</span>';
+    300:   bufferBody.appendChild(row);
+    301: });
+    302: bufferBody.addEventListener('input', calcHandoff);
+    303: 
+    304: // AA Productivity
+    305: var aaBody = document.getElementById('aaBody');
+    306: var aaCount = 0;
+    307: function addAA() {
+    308:   var id = aaCount++;
+    309:   var row = document.createElement('div');
+    310:   row.className = 'staffing-row'; row.id = 'aa-' + id;
+    311:   row.style.cssText = 'grid-template-columns:1.2fr 1fr 0.8fr 0.8fr 0.8fr 0.8fr 0.8fr;';
+    312:   var opts = Object.keys(AA_OPS).map(function(o) { return '<option>' + o + '</option>'; }).join('');
+    313:   row.innerHTML =
+    314:     '<span><input type="text" class="handoff-input handoff-text-input" id="aa-name-' + id + '" placeholder="Name"></span>' +
+    315:     '<span><select class="handoff-select" id="aa-op-' + id + '">' + opts + '</select></span>' +
+    316:     '<span><input type="number" class="handoff-input" id="aa-hrs-' + id + '" value="10" step="0.5"></span>' +
+    317:     '<span><input type="number" class="handoff-input" id="aa-units-' + id + '" value="0"></span>' +
+    318:     '<span id="aa-uph-' + id + '">0</span>' +
+    319:     '<span id="aa-tgt-' + id + '">' + Object.values(AA_OPS)[0] + '</span>' +
+    320:     '<span id="aa-gap-' + id + '">-</span>';
+    321:   aaBody.appendChild(row);
+    322:   document.getElementById('aa-op-' + id).addEventListener('change', calcHandoff);
+    323: }
+    324: addAA(); addAA();
+    325: aaBody.addEventListener('input', calcHandoff);
+    326: 
+    327: function R(n) { return Math.round(n * 100) / 100; }
+    328: 
+    329: function calcHandoff() {
+    330:   var issues = 0, warnings = 0;
+    331: 
+    332:   PALLETS.forEach(function(p, i) {
+    333:     var sos = val('p-sos-' + i), build = val('p-build-' + i), proc = val('p-proc-' + i);
+    334:     var eos = sos + build - proc, net = eos - sos, expectedMax = sos + p.buildRate;
+    335:     document.getElementById('p-eos-' + i).textContent = R(eos);
+    336:     document.getElementById('p-net-' + i).textContent = R(net);
+    337:     var hEl = document.getElementById('p-hand-' + i), sEl = document.getElementById('p-stat-' + i);
+    338:     if (eos < 0) { hEl.textContent = '✗ Negative EOS'; hEl.className = 'ho-fail'; sEl.textContent = 'Data Error'; sEl.className = 'ho-fail'; issues++; }
+    339:     else if (eos === 0) { hEl.textContent = '✓ Clean Handoff'; hEl.className = 'ho-pass'; sEl.textContent = 'Clean Handoff'; sEl.className = 'ho-pass'; }
+    340:     else if (eos <= sos) { hEl.textContent = '✓ Controlled'; hEl.className = 'ho-pass'; sEl.textContent = 'WIP Controlled'; sEl.className = 'ho-pass'; }
+    341:     else if (eos <= expectedMax) { hEl.textContent = '⚠ Expected Growth'; hEl.className = 'ho-warn'; sEl.textContent = 'Monitor'; sEl.className = 'ho-warn'; warnings++; }
+    342:     else { hEl.textContent = '✗ Over Expected'; hEl.className = 'ho-fail'; sEl.textContent = 'Action Needed'; sEl.className = 'ho-fail'; issues++; }
+    343:   });
+    344: 
+    345:   BUFFERS.forEach(function(b, i) {
+    346:     var sos = val('b-sos-' + i), eos = val('b-eos-' + i);
+    347:     document.getElementById('b-chg-' + i).textContent = R(eos - sos);
+    348:     [['sstat', sos], ['estat', eos]].forEach(function(pair) {
+    349:       var el = document.getElementById('b-' + pair[0] + '-' + i), v = pair[1];
+    350:       if (v < b.min) { el.textContent = '✗ Below Min'; el.className = 'ho-fail'; issues++; }
+    351:       else if (v > b.max) { el.textContent = '✗ Over Max'; el.className = 'ho-fail'; issues++; }
+    352:       else if (b.max !== Infinity && v >= b.max * 0.85) { el.textContent = '⚠ Near Max'; el.className = 'ho-warn'; warnings++; }
+    353:       else { el.textContent = '✓ OK'; el.className = 'ho-pass'; }
+    354:     });
+    355:   });
+    356: 
+    357:   aaBody.querySelectorAll('[id^="aa-"]').forEach(function(row) {
+    358:     if (!row.id.match(/^aa-\d+$/)) return;
+    359:     var id = row.id.split('-')[1];
+    360:     var op = document.getElementById('aa-op-' + id).value;
+    361:     var hrs = val('aa-hrs-' + id) || 10, units = val('aa-units-' + id);
+    362:     var uph = hrs > 0 ? Math.round((units / hrs) * 10) / 10 : 0;
+    363:     var target = AA_OPS[op] || 10, gap = Math.round((uph - target) * 10) / 10;
+    364:     document.getElementById('aa-uph-' + id).textContent = uph;
+    365:     document.getElementById('aa-tgt-' + id).textContent = target;
+    366:     var el = document.getElementById('aa-gap-' + id);
+    367:     if (gap >= 0) { el.textContent = '+' + gap; el.className = 'ho-pass'; }
+    368:     else { el.textContent = gap.toString(); el.className = 'ho-fail'; }
+    369:   });
+    370: 
+    371:   var box = document.getElementById('overallBox');
+    372:   if (issues > 0) { box.textContent = 'NEEDS ATTENTION (' + issues + ' issues)'; box.className = 'handoff-overall handoff-bad'; }
+    373:   else if (warnings > 0) { box.textContent = 'MONITOR (' + warnings + ' warnings)'; box.className = 'handoff-overall handoff-warn'; }
+    374:   else { box.textContent = 'ALL CLEAR – Good Handoff'; box.className = 'handoff-overall handoff-ok'; }
+    375: }
+    376: 
+    377: // ===== HANDOFF SAVE / HISTORY =====
+    378: function getHistory() { return JSON.parse(localStorage.getItem('shiftHist') || '{}'); }
+    379: function putHistory(h) { localStorage.setItem('shiftHist', JSON.stringify(h)); }
+    380: 
+    381: function snapshot() {
+    382:   var pallets = PALLETS.map(function(_, i) {
+    383:     return { sos: val('p-sos-' + i), build: val('p-build-' + i), proc: val('p-proc-' + i),
+    384:       eos: parseFloat(document.getElementById('p-eos-' + i).textContent) || 0,
+    385:       net: parseFloat(document.getElementById('p-net-' + i).textContent) || 0,
+    386:       hand: document.getElementById('p-hand-' + i).textContent,
+    387:       stat: document.getElementById('p-stat-' + i).textContent };
+    388:   });
+    389:   var buffers = BUFFERS.map(function(_, i) {
+    390:     return { sos: val('b-sos-' + i), eos: val('b-eos-' + i),
+    391:       chg: parseFloat(document.getElementById('b-chg-' + i).textContent) || 0,
+    392:       sstat: document.getElementById('b-sstat-' + i).textContent,
+    393:       estat: document.getElementById('b-estat-' + i).textContent };
+    394:   });
+    395:   var aas = [];
+    396:   aaBody.querySelectorAll('[id^="aa-"]').forEach(function(row) {
+    397:     if (!row.id.match(/^aa-\d+$/)) return;
+    398:     var id = row.id.split('-')[1];
+    399:     aas.push({ name: document.getElementById('aa-name-' + id).value,
+    400:       op: document.getElementById('aa-op-' + id).value,
+    401:       hrs: val('aa-hrs-' + id), units: val('aa-units-' + id),
+    402:       uph: document.getElementById('aa-uph-' + id).textContent,
+    403:       gap: document.getElementById('aa-gap-' + id).textContent });
+    404:   });
+    405:   return { date: document.getElementById('trackDate').value, shift: document.getElementById('shiftSelect').value,
+    406:     pallets: pallets, buffers: buffers, aas: aas,
+    407:     overall: document.getElementById('overallBox').textContent, ts: Date.now() };
+    408: }
+    409: 
+    410: function saveShift() {
+    411:   calcHandoff();
+    412:   var snap = snapshot(), key = snap.date + '_' + snap.shift;
+    413:   var h = getHistory(); h[key] = snap; putHistory(h);
+    414:   alert('Saved: ' + snap.date + ' ' + snap.shift);
+    415:   renderHistory();
+    416: }
+    417: 
+    418: function loadSnap(key) {
+    419:   var h = getHistory(), d = h[key]; if (!d) return;
+    420:   document.getElementById('trackDate').value = d.date;
+    421:   document.getElementById('shiftSelect').value = d.shift;
+    422:   d.pallets.forEach(function(p, i) {
+    423:     document.getElementById('p-sos-' + i).value = p.sos;
+    424:     document.getElementById('p-build-' + i).value = p.build;
+    425:     document.getElementById('p-proc-' + i).value = p.proc;
+    426:   });
+    427:   d.buffers.forEach(function(b, i) {
+    428:     document.getElementById('b-sos-' + i).value = b.sos;
+    429:     document.getElementById('b-eos-' + i).value = b.eos;
+    430:   });
+    431:   aaBody.innerHTML = ''; aaCount = 0;
+    432:   (d.aas || []).forEach(function(aa) {
+    433:     addAA(); var id = aaCount - 1;
+    434:     document.getElementById('aa-name-' + id).value = aa.name || '';
+    435:     document.getElementById('aa-op-' + id).value = aa.op || 'Shoes';
+    436:     document.getElementById('aa-hrs-' + id).value = aa.hrs || 10;
+    437:     document.getElementById('aa-units-' + id).value = aa.units || 0;
+    438:   });
+    439:   if (!d.aas || !d.aas.length) { addAA(); addAA(); }
+    440:   calcHandoff();
+    441: }
+    442: 
+    443: function clearHandoffForm() {
+    444:   if (!confirm('Clear form? (History is preserved)')) return;
+    445:   document.querySelectorAll('#palletBody input, #bufferBody input').forEach(function(el) { el.value = 0; });
+    446:   aaBody.innerHTML = ''; aaCount = 0; addAA(); addAA();
+    447:   calcHandoff();
+    448: }
+    449: 
+    450: function delHist(key) {
+    451:   if (!confirm('Delete this entry?')) return;
+    452:   var h = getHistory(); delete h[key]; putHistory(h); renderHistory();
+    453: }
+    454: 
+    455: function renderHistory() {
+    456:   var h = getHistory();
+    457:   var shiftF = document.getElementById('histShift').value;
+    458:   var fromF = document.getElementById('histFrom').value;
+    459:   var toF = document.getElementById('histTo').value;
+    460:   var entries = Object.entries(h).sort(function(a, b) { return b[1].ts - a[1].ts; });
+    461:   if (shiftF) entries = entries.filter(function(e) { return e[1].shift === shiftF; });
+    462:   if (fromF) entries = entries.filter(function(e) { return e[1].date >= fromF; });
+    463:   if (toF) entries = entries.filter(function(e) { return e[1].date <= toF; });
+    464: 
+    465:   var list = document.getElementById('historyList');
+    466:   if (!entries.length) { list.innerHTML = '<p style="color:#9ca3af;">No history found.</p>'; return; }
+    467: 
+    468:   list.innerHTML = entries.map(function(pair) {
+    469:     var key = pair[0], d = pair[1];
+    470:     var cls = d.overall.indexOf('CLEAR') >= 0 ? 'ho-pass' : d.overall.indexOf('MONITOR') >= 0 ? 'ho-warn' : 'ho-fail';
+    471:     var detail = '<table><thead><tr><th>Operation</th><th>SOS</th><th>Build</th><th>Proc</th><th>EOS</th><th>Net</th><th>Status</th></tr></thead><tbody>';
+    472:     d.pallets.forEach(function(p, i) { detail += '<tr><td style="font-weight:700;color:#16a34a;">' + PALLETS[i].name + '</td><td>' + p.sos + '</td><td>' + p.build + '</td><td>' + p.proc + '</td><td>' + p.eos + '</td><td>' + p.net + '</td><td>' + p.stat + '</td></tr>'; });
+    473:     detail += '</tbody></table><table style="margin-top:6px"><thead><tr><th>Buffer</th><th>SOS</th><th>EOS</th><th>Chg</th><th>SOS Status</th><th>EOS Status</th></tr></thead><tbody>';
+    474:     d.buffers.forEach(function(b, i) { detail += '<tr><td style="font-weight:700;color:#16a34a;">' + BUFFERS[i].name + '</td><td>' + b.sos + '</td><td>' + b.eos + '</td><td>' + b.chg + '</td><td>' + b.sstat + '</td><td>' + b.estat + '</td></tr>'; });
+    475:     detail += '</tbody></table>';
+    476:     if (d.aas && d.aas.length) {
+    477:       detail += '<table style="margin-top:6px"><thead><tr><th>AA</th><th>Op</th><th>Hrs</th><th>Units</th><th>UPH</th><th>Gap</th></tr></thead><tbody>';
+    478:       d.aas.forEach(function(a) { detail += '<tr><td>' + (a.name || '-') + '</td><td>' + a.op + '</td><td>' + a.hrs + '</td><td>' + a.units + '</td><td>' + a.uph + '</td><td>' + a.gap + '</td></tr>'; });
+    479:       detail += '</tbody></table>';
+    480:     }
+    481:     return '<div class="hist-entry" onclick="this.classList.toggle(\'expanded\')">' +
+    482:       '<div class="hist-header"><span class="hist-date">' + d.date + ' – ' + d.shift + '</span><span class="' + cls + '">' + d.overall + '</span>' +
+    483:       '<span><button class="save-btn" style="background:#2563eb;font-size:0.7rem;padding:4px 10px;" onclick="event.stopPropagation();loadSnap(\'' + key + '\')">Load</button> ' +
+    484:       '<button class="save-btn" style="background:#dc2626;font-size:0.7rem;padding:4px 10px;" onclick="event.stopPropagation();delHist(\'' + key + '\')">✗</button></span></div>' +
+    485:       '<div class="hist-detail">' + detail + '</div></div>';
+    486:   }).join('');
+    487: }
+    488: 
+    489: function handoffExportCSV() {
+    490:   calcHandoff();
+    491:   var s = snapshot();
+    492:   var csv = 'Shift Handoff Report\nDate,' + s.date + '\nShift,' + s.shift + '\n\n';
+    493:   csv += 'PALLET TRACKING\nOperation,SOS,WIP Build,Processed,EOS,Net Change,Handoff,Status\n';
+    494:   s.pallets.forEach(function(p, i) { csv += PALLETS[i].name + ',' + p.sos + ',' + p.build + ',' + p.proc + ',' + p.eos + ',' + p.net + ',' + p.hand + ',' + p.stat + '\n'; });
+    495:   csv += '\nBUFFER CHECKS\nArea,SOS,EOS,Change,SOS Status,EOS Status\n';
+    496:   s.buffers.forEach(function(b, i) { csv += BUFFERS[i].name + ',' + b.sos + ',' + b.eos + ',' + b.chg + ',' + b.sstat + ',' + b.estat + '\n'; });
+    497:   csv += '\nAA PRODUCTIVITY\nName,Operation,Hours,Units,UPH,Gap\n';
+    498:   s.aas.forEach(function(a) { csv += (a.name || '-') + ',' + a.op + ',' + a.hrs + ',' + a.units + ',' + a.uph + ',' + a.gap + '\n'; });
+    499:   csv += '\nOverall,' + s.overall + '\n';
+    500:   var blob = new Blob([csv], {type: 'text/csv'});
+    501:   var a = document.createElement('a'); a.href = URL.createObjectURL(blob);
+    502:   a.download = 'shift_' + s.date + '_' + s.shift + '.csv'; a.click();
+    503: }
+    504: 
+    505: // Initial calculations
+    506: calcHandoff();
