+      1: // ===== TAB SWITCHING =====
+      2: document.querySelectorAll('.tab-btn').forEach(btn => {
+      3:   btn.addEventListener('click', () => {
+      4:     document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
+      5:     document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
+      6:     btn.classList.add('active');
+      7:     document.getElementById(btn.dataset.tab).classList.add('active');
+      8:     if (btn.dataset.tab === 'daily-wash') updateDailyWash();
+      9:     if (btn.dataset.tab === 'handoff') renderHistory();
+     10:   });
+     11: });
+     12: 
+     13: // ===== SHIFT PLANNER SAVE/EDIT =====
+     14: document.getElementById('save-planner-btn').addEventListener('click', function() {
+     15:   document.querySelectorAll('#shift-planner input').forEach(inp => { inp.disabled = true; inp.classList.add('locked'); });
+     16:   this.textContent = '✓ Saved'; this.classList.add('saved'); this.disabled = true;
+     17:   document.getElementById('edit-planner-btn').style.display = 'inline-block';
+     18: });
+     19: document.getElementById('edit-planner-btn').addEventListener('click', function() {
+     20:   document.querySelectorAll('#shift-planner input').forEach(inp => { inp.disabled = false; inp.classList.remove('locked'); });
+     21:   var s = document.getElementById('save-planner-btn');
+     22:   s.textContent = 'Save Planner'; s.classList.remove('saved'); s.disabled = false;
+     23:   this.style.display = 'none';
+     24: });
+     25: 
+     26: // ===== PLANNER CALCULATION =====
+     27: function val(id) { return parseFloat(document.getElementById(id).value) || 0; }
+     28: function excess(v, t) { return Math.max(0, v - t); }
+     29: function fmt(n) { return Math.round(n).toLocaleString(); }
+     30: 
+     31: ['crets','ar-pickable','ar-tech-pickable','grading-wip','ps-wip','shoes-wip','tech-wip','refurb-wip','blancco-wip','goal-rate',
+     32:  'rate-grading','rate-tech','rate-ps','rate-shoes','rate-refurb','rate-blancco','rate-ns-path','rate-spar-path',
+     33:  'ns-wip','ns-rate','spar-wip','spar-rate'].forEach(id => {
+     34:   document.getElementById(id).addEventListener('input', calculate);
+     35: });
+     36: 
+     37: function calculate() {
+     38:   var crets = val('crets'), arPickable = val('ar-pickable'), arTech = val('ar-tech-pickable');
+     39:   var rCrets = crets * 0.035;
+     40:   var rArPickable = excess(arPickable, 500), rArTech = excess(arTech, 500);
+     41:   var rGrading = excess(val('grading-wip'), 3) * 100;
+     42:   var rPs = excess(val('ps-wip'), 0.5) * 100;
+     43:   var rShoes = excess(val('shoes-wip'), 1) * 100;
+     44:   var rTech = excess(val('tech-wip'), 2) * 485;
+     45:   var rRefurb = excess(val('refurb-wip'), 1) * 100;
+     46:   var rBlancco = excess(val('blancco-wip'), 1) * 100;
+     47:   var total = rCrets + rArPickable + rArTech + rGrading + rPs + rShoes + rTech + rRefurb + rBlancco;
+     48: 
+     49:   document.getElementById('result-crets').textContent = fmt(rCrets);
+     50:   document.getElementById('result-ar-pickable').textContent = fmt(rArPickable);
+     51:   document.getElementById('result-ar-tech-pickable').textContent = fmt(rArTech);
+     52:   document.getElementById('result-grading').textContent = fmt(rGrading);
+     53:   document.getElementById('result-ps').textContent = fmt(rPs);
+     54:   document.getElementById('result-shoes').textContent = fmt(rShoes);
+     55:   document.getElementById('result-tech').textContent = fmt(rTech);
+     56:   document.getElementById('result-refurb').textContent = fmt(rRefurb);
+     57:   document.getElementById('result-blancco').textContent = fmt(rBlancco);
+     58:   document.getElementById('total').textContent = fmt(total);
+     59: 
+     60:   // Path staffing
+     61:   var pathDepts = [
+     62:     {key:'grading',pct:0.03159,wipUnits:rGrading},{key:'tech',pct:0.00646,wipUnits:rTech},
+     63:     {key:'ps',pct:0.00048,wipUnits:rPs},{key:'shoes',pct:0.0018,wipUnits:rShoes},
+     64:     {key:'refurb',pct:0.00273,wipUnits:rRefurb},{key:'blancco',pct:0.00067,wipUnits:rBlancco}
+     65:   ];
+     66:   var pathTotalHC = 0;
+     67:   pathDepts.forEach(function(d) {
+     68:     var cv = crets * d.pct, dv = cv + d.wipUnits;
+     69:     var rate = parseFloat(document.getElementById('rate-' + d.key).value) || 1;
+     70:     var hc = Math.ceil(dv / rate / 10); pathTotalHC += hc;
+     71:     document.getElementById('path-crets-' + d.key).textContent = fmt(cv);
+     72:     document.getElementById('path-wip-' + d.key).textContent = fmt(d.wipUnits);
+     73:     document.getElementById('path-vol-' + d.key).textContent = fmt(dv);
+     74:     document.getElementById('path-hc-' + d.key).textContent = hc;
+     75:   });
+     76:   document.getElementById('path-hc-total').textContent = pathTotalHC;
+     77: 
+     78:   // NS path row
+     79:   var nsCV = crets * 0.037, nsWV = excess(val('ns-wip'), 4) * 100, nsT = nsCV + nsWV;
+     80:   var nsR = parseFloat(document.getElementById('rate-ns-path').value) || 175;
+     81:   document.getElementById('path-crets-ns').textContent = fmt(nsCV);
+     82:   document.getElementById('path-wip-ns').textContent = fmt(nsWV);
+     83:   document.getElementById('path-vol-ns').textContent = fmt(nsT);
+     84:   document.getElementById('path-hc-ns').textContent = nsT > 0 ? Math.ceil(nsT / nsR / 10) : 0;
+     85: 
+     86:   // SPAR path row
+     87:   var spCV = crets * 0.002, spWV = excess(val('spar-wip'), 2) * 375, spT = spCV + spWV;
+     88:   var spR = parseFloat(document.getElementById('rate-spar-path').value) || 2;
+     89:   document.getElementById('path-crets-spar').textContent = fmt(spCV);
+     90:   document.getElementById('path-wip-spar').textContent = fmt(spWV);
+     91:   document.getElementById('path-vol-spar').textContent = fmt(spT);
+     92:   document.getElementById('path-hc-spar').textContent = spT > 0 ? Math.ceil(spT / spR / 10) : 0;
+     93: 
+     94:   // Staffing plan
+     95:   var goalRate = val('goal-rate');
+     96:   if (goalRate > 0 && total > 0) {
+     97:     var tsh = total / goalRate;
+     98:     var roles = [{key:'lead-pa',pct:0.17},{key:'5s',pct:0.01},{key:'ps',pct:0.12},{key:'qa',pct:0.02},{key:'wd-tl',pct:0.21},{key:'waterspider',pct:0.47}];
+     99:     document.getElementById('total-support-hours').textContent = tsh.toFixed(1);
+    100:     var totalHC = 0;
+    101:     roles.forEach(function(r) {
+    102:       var h = tsh * r.pct, hc = Math.ceil(h / 10); totalHC += hc;
+    103:       document.getElementById('hours-' + r.key).textContent = h.toFixed(1);
+    104:       document.getElementById('hc-' + r.key).textContent = hc;
+    105:     });
+    106:     document.getElementById('hc-total').textContent = totalHC;
+    107:   } else {
+    108:     ['total-support-hours','hc-total'].forEach(function(id) { document.getElementById(id).textContent = '—'; });
+    109:     ['lead-pa','5s','ps','qa','wd-tl','waterspider'].forEach(function(k) {
+    110:       document.getElementById('hours-' + k).textContent = '—';
+    111:       document.getElementById('hc-' + k).textContent = '—';
+    112:     });
+    113:   }
+    114: 
+    115:   // NS / SPAR standalone cards
+    116:   var nsCretsVol = crets * 0.037, nsWipVol = excess(val('ns-wip'), 4) * 100, nsTotal = nsCretsVol + nsWipVol;
+    117:   document.getElementById('ns-crets-vol').textContent = fmt(nsCretsVol);
+    118:   document.getElementById('ns-wip-vol').textContent = fmt(nsWipVol);
+    119:   document.getElementById('ns-total').textContent = fmt(nsTotal);
+    120:   document.getElementById('ns-hc').textContent = nsTotal > 0 ? Math.ceil(nsTotal / (parseFloat(document.getElementById('ns-rate').value) || 175) / 10) : 0;
+    121: 
+    122:   var sparCretsVol = crets * 0.002, sparWipVol = excess(val('spar-wip'), 2) * 375, sparTotal = sparCretsVol + sparWipVol;
+    123:   document.getElementById('spar-crets-vol').textContent = fmt(sparCretsVol);
+    124:   document.getElementById('spar-wip-vol').textContent = fmt(sparWipVol);
+    125:   document.getElementById('spar-total').textContent = fmt(sparTotal);
+    126:   document.getElementById('spar-hc').textContent = sparTotal > 0 ? Math.ceil(sparTotal / (parseFloat(document.getElementById('spar-rate').value) || 2) / 10) : 0;
+    127: 
+    128:   updateChart();
+    129: }
+    130: 
+    131: // ===== SHIFT TRACKER =====
+    132: var HOURS = ['06:00','07:00','08:00','09:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00','18:00'];
+    133: var trackerContainer = document.getElementById('tracker-rows');
+    134: 
+    135: HOURS.forEach(function(h) {
+    136:   var slug = h.replace(':', '');
+    137:   var row = document.createElement('div');
+    138:   row.className = 'tracker-row';
+    139:   row.innerHTML =
+    140:     '<span class="hour-label">' + h + '</span>' +
+    141:     '<span><input type="number" min="0" id="tr-whd-vol-' + slug + '" placeholder="0" /></span>' +
+    142:     '<span><input type="number" min="0" step="0.1" id="tr-whd-hrs-' + slug + '" placeholder="0" /></span>' +
+    143:     '<span><input type="number" min="0" id="tr-spar-vol-' + slug + '" placeholder="0" /></span>' +
+    144:     '<span><input type="number" min="0" step="0.1" id="tr-spar-hrs-' + slug + '" placeholder="0" /></span>' +
+    145:     '<span><input type="number" min="0" step="0.1" id="tr-sup-hrs-' + slug + '" placeholder="0" /></span>' +
+    146:     '<span><button class="save-row-btn" id="save-row-btn-' + slug + '" data-slug="' + slug + '">Save</button>' +
+    147:     '<button class="edit-row-btn" id="edit-row-btn-' + slug + '" data-slug="' + slug + '" style="display:none">Edit</button></span>';
+    148:   trackerContainer.appendChild(row);
+    149: });
+    150: 
+    151: trackerContainer.addEventListener('click', function(e) {
+    152:   var slug = e.target.dataset.slug;
+    153:   if (e.target.classList.contains('save-row-btn')) {
+    154:     ['tr-whd-vol','tr-whd-hrs','tr-spar-vol','tr-spar-hrs','tr-sup-hrs'].forEach(function(p) {
+    155:       var inp = document.getElementById(p + '-' + slug); inp.disabled = true; inp.classList.add('locked');
+    156:     });
+    157:     e.target.textContent = '✓ Saved'; e.target.classList.add('saved'); e.target.disabled = true;
+    158:     document.getElementById('edit-row-btn-' + slug).style.display = 'inline-block';
+    159:     updateTracker();
+    160:   } else if (e.target.classList.contains('edit-row-btn')) {
+    161:     ['tr-whd-vol','tr-whd-hrs','tr-spar-vol','tr-spar-hrs','tr-sup-hrs'].forEach(function(p) {
+    162:       var inp = document.getElementById(p + '-' + slug); inp.disabled = false; inp.classList.remove('locked');
+    163:     });
+    164:     var sb = document.getElementById('save-row-btn-' + slug);
+    165:     sb.textContent = 'Save'; sb.classList.remove('saved'); sb.disabled = false;
+    166:     e.target.style.display = 'none';
+    167:   }
+    168: });
+    169: 
+    170: function updateTracker() {
+    171:   var tWV = 0, tWH = 0, tSV = 0, tSH = 0, tSup = 0;
+    172:   HOURS.forEach(function(h) {
+    173:     var s = h.replace(':', '');
+    174:     tWV += parseFloat(document.getElementById('tr-whd-vol-' + s).value) || 0;
+    175:     tWH += parseFloat(document.getElementById('tr-whd-hrs-' + s).value) || 0;
+    176:     tSV += parseFloat(document.getElementById('tr-spar-vol-' + s).value) || 0;
+    177:     tSH += parseFloat(document.getElementById('tr-spar-hrs-' + s).value) || 0;
+    178:     tSup += parseFloat(document.getElementById('tr-sup-hrs-' + s).value) || 0;
+    179:   });
+    180:   var totalVol = tWV + tSV, totalAllHrs = tWH + tSH;
+    181:   document.getElementById('kpi-whd-rate').textContent = tWH > 0 ? (tWV / tWH).toFixed(1) : '—';
+    182:   document.getElementById('kpi-spar-rate').textContent = tSH > 0 ? (tSV / tSH).toFixed(1) : '—';
+    183:   document.getElementById('kpi-support-rate').textContent = tSup > 0 ? (totalVol / tSup).toFixed(1) : '—';
+    184:   document.getElementById('kpi-tph').textContent = totalAllHrs > 0 ? (totalVol / totalAllHrs).toFixed(1) : '—';
+    185:   document.getElementById('kpi-vol-actual').textContent = Math.round(totalVol).toLocaleString();
+    186:   var planned = parseFloat(document.getElementById('total').textContent.replace(/,/g, '')) || 0;
+    187:   document.getElementById('kpi-vol-plan').textContent = planned > 0 ? Math.round(planned).toLocaleString() : '—';
+    188:   document.getElementById('progress-fill').style.width = (planned > 0 ? Math.min(100, (totalVol / planned) * 100) : 0) + '%';
+    189:   updateChart();
+    190: }
+    191: 
+    192: // ===== HOURLY CHART =====
+    193: var HOUR_PCTS = [0, 5.99, 11.49, 11.43, 12.70, 8.94, 9.12, 11.11, 9.10, 8.10, 7.71, 4.30, 0];
+    194: var CUMULATIVE_PCTS = HOUR_PCTS.reduce(function(acc, p, i) { acc.push((acc[i - 1] || 0) + p); return acc; }, []);
+    195: 
+    196: (function buildChart() {
+    197:   var wrap = document.getElementById('hourly-chart');
+    198:   var markers = '';
+    199:   CUMULATIVE_PCTS.forEach(function(cp, i) {
+    200:     var label = HOURS[i + 1] || HOURS[i];
+    201:     markers += '<div class="hbar-marker" style="left:' + Math.min(cp, 100) + '%"><div class="hbar-marker-line"></div><div class="hbar-marker-label">' + label + '<br><span id="hbar-target-' + i + '"></span></div></div>';
+    202:   });
+    203:   wrap.innerHTML = '<div class="hbar-track"><div class="hbar-fill" id="hbar-fill"></div>' + markers + '</div>';
+    204: })();
+    205: 
+    206: function updateChart() {
+    207:   var planned = parseFloat(document.getElementById('total').textContent.replace(/,/g, '')) || 0;
+    208:   var cumActual = 0, lastIdx = -1;
+    209:   HOURS.forEach(function(h, i) {
+    210:     var s = h.replace(':', '');
+    211:     var v = (parseFloat(document.getElementById('tr-whd-vol-' + s).value) || 0) + (parseFloat(document.getElementById('tr-spar-vol-' + s).value) || 0);
+    212:     cumActual += v; if (v > 0) lastIdx = i;
+    213:   });
+    214:   var pct = planned > 0 ? Math.min((cumActual / planned) * 100, 100) : 0;
+    215:   var tgt = lastIdx >= 0 ? CUMULATIVE_PCTS[lastIdx] : 0;
+    216:   var fill = document.getElementById('hbar-fill');
+    217:   if (fill) { fill.style.width = pct + '%'; fill.style.background = lastIdx >= 0 ? (pct >= tgt ? '#22c55e' : '#ef4444') : '#2563eb'; }
+    218:   CUMULATIVE_PCTS.forEach(function(cp, i) {
+    219:     var el = document.getElementById('hbar-target-' + i);
+    220:     if (el) el.textContent = planned > 0 ? Math.round(planned * cp / 100).toLocaleString() : '';
+    221:   });
+    222: }
+    223: 
+    224: // ===== DAILY WASH =====
+    225: function updateDailyWash() {
+    226:   var planTotal = parseFloat(document.getElementById('total').textContent.replace(/,/g, '')) || 0;
+    227:   var planGoalRate = val('goal-rate');
+    228:   var tWV = 0, tWH = 0, tSV = 0, tSH = 0, tSup = 0;
+    229:   HOURS.forEach(function(h) {
+    230:     var s = h.replace(':', '');
+    231:     tWV += parseFloat(document.getElementById('tr-whd-vol-' + s).value) || 0;
+    232:     tWH += parseFloat(document.getElementById('tr-whd-hrs-' + s).value) || 0;
+    233:     tSV += parseFloat(document.getElementById('tr-spar-vol-' + s).value) || 0;
+    234:     tSH += parseFloat(document.getElementById('tr-spar-hrs-' + s).value) || 0;
+    235:     tSup += parseFloat(document.getElementById('tr-sup-hrs-' + s).value) || 0;
+    236:   });
+    237:   var aTotal = tWV + tSV, aAllHrs = tWH + tSH;
+    238:   var rows = [
+    239:     {pv: planTotal, av: aTotal, pid: 'dw-plan-total', aid: 'dw-actual-total', vid: 'dw-var-total', r: false},
+    240:     {pv: null, av: tWV, pid: 'dw-plan-whd', aid: 'dw-actual-whd', vid: 'dw-var-whd', r: false},
+    241:     {pv: null, av: tSV, pid: 'dw-plan-spar', aid: 'dw-actual-spar', vid: 'dw-var-spar', r: false},
+    242:     {pv: null, av: tWH > 0 ? tWV / tWH : null, pid: 'dw-plan-whd-rate', aid: 'dw-actual-whd-rate', vid: 'dw-var-whd-rate', r: true},
+    243:     {pv: null, av: tSH > 0 ? tSV / tSH : null, pid: 'dw-plan-spar-rate', aid: 'dw-actual-spar-rate', vid: 'dw-var-spar-rate', r: true},
+    244:     {pv: planGoalRate, av: tSup > 0 ? aTotal / tSup : null, pid: 'dw-plan-support-rate', aid: 'dw-actual-support-rate', vid: 'dw-var-support-rate', r: true},
+    245:     {pv: null, av: aAllHrs > 0 ? aTotal / aAllHrs : null, pid: 'dw-plan-tph', aid: 'dw-actual-tph', vid: 'dw-var-tph', r: true}
+    246:   ];
+    247:   rows.forEach(function(r) {
+    248:     document.getElementById(r.pid).textContent = r.pv != null ? (r.r ? r.pv.toFixed(1) : Math.round(r.pv).toLocaleString()) : 'N/A';
+    249:     document.getElementById(r.aid).textContent = r.av != null ? (r.r ? r.av.toFixed(1) : Math.round(r.av).toLocaleString()) : '—';
+    250:     var ve = document.getElementById(r.vid);
+    251:     if (r.pv != null && r.av != null) {
+    252:       var d = r.av - r.pv; ve.textContent = (d >= 0 ? '+' : '') + (r.r ? d.toFixed(1) : Math.round(d).toLocaleString());
+    253:       ve.className = 'variance ' + (d >= 0 ? 'var-pos' : 'var-neg');
+    254:     } else { ve.textContent = '—'; ve.className = 'variance'; }
+    255:   });
+    256: }
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
