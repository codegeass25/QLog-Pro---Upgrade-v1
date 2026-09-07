/* =====================================================================
   QLog Pro — Classic Features Bridge v1.0
   Restores the ORIGINAL QLog UI/UX while retaining the latest feature
   layer: whitelabel school profile, fixed QLog identity, report scope,
   facility capability filtering, legacy-scope assignment, and report
   branding. No sidebar, overview shell, command palette, drawers, or
   master-designer page restructuring is installed here.
   ===================================================================== */
(function(){
'use strict';

var BRAND_KEY='qlogSchoolBranding';
var FIXED_PRODUCT='QLog Pro';
var FIXED_CREDIT='Powered by: Magallanes NHS Team Bitaug C.I. Projects';

function esc(v){return String(v==null?'':v).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
function getBranding(){
  var d={schoolName:'',schoolId:'',address:'',district:'',division:'',region:'',contact:'',email:'',schoolYear:'',logo:'',accent:'#2563eb',preparedBy:'',preparedPosition:'',checkedBy:'',checkedPosition:'',approvedBy:'',approvedPosition:''};
  try{Object.assign(d,JSON.parse(localStorage.getItem(BRAND_KEY)||'{}'));}catch(e){}
  return d;
}
window.getQlogBranding=getBranding;
window.QLOG_FIXED_PRODUCT=FIXED_PRODUCT;
window.QLOG_FIXED_CREDIT=FIXED_CREDIT;

function field(id,label,cls,type){
  return '<div class="'+(cls||'')+'"><label for="'+id+'">'+esc(label)+'</label><input type="'+(type||'text')+'" id="'+id+'" autocomplete="off"></div>';
}
function ensureSettings(){
  if(document.getElementById('settings')) return;
  var reports=document.getElementById('reports'), nav=document.querySelector('.nav');
  if(!reports||!nav) return;

  var btn=document.createElement('button');
  btn.id='qlogSettingsNav';
  btn.textContent='⚙️ Settings';
  btn.onclick=function(){ if(window.showTab) window.showTab('settings',btn); };
  nav.appendChild(btn);

  var tab=document.createElement('div');
  tab.id='settings'; tab.className='tab';
  tab.innerHTML='\
    <div class="card">\
      <h3>⚙️ Settings</h3>\
      <div class="qlog-classic-settings-menu">\
        <button class="active" data-panel="school">School & Branding</button>\
        <button data-panel="reports">Report Signatories</button>\
        <button data-panel="scope">Data & Scope</button>\
        <button data-panel="about">About</button>\
      </div>\
    </div>\
    <div class="qlog-classic-settings-panel active" data-panel="school">\
      <div class="card">\
        <h3>🏫 School Profile / Whitelabel</h3>\
        <div class="qlog-classic-brand-preview" id="qClassicPreview">\
          <img id="qClassicLogoPreview" alt="School logo">\
          <div><h4 id="qClassicSchoolPreview">Your School / Institution</h4><p id="qClassicAddressPreview">School profile appears here.</p><p><b>'+FIXED_PRODUCT+'</b></p></div>\
        </div>\
        <div class="qlog-classic-form-grid">\
          '+field('qBrandSchoolName','School Name','full')+field('qBrandSchoolId','School ID / Institution ID')+field('qBrandSchoolYear','Current School Year')+field('qBrandAddress','School Address','full')+field('qBrandDistrict','District')+field('qBrandDivision','Division')+field('qBrandRegion','Region')+field('qBrandContact','Contact Number')+field('qBrandEmail','Official Email')+'\
          <div><label>Report Accent</label><select id="qBrandAccent"><option value="#2563eb">Professional Blue</option><option value="#176b62">Teal</option><option value="#4f46b8">Indigo</option><option value="#7a4f18">Warm Bronze</option><option value="#384152">Slate</option></select></div>\
        </div>\
        <hr><h4>School Logo</h4>\
        <input id="qBrandLogoFile" type="file" accept="image/png,image/jpeg,image/webp">\
        <button id="qBrandRemoveLogo" type="button" style="background:#64748b;">Remove Logo</button>\
        <div class="qlog-classic-fixed-brand" style="margin-top:14px;"><b>Fixed product identity</b><br>'+FIXED_PRODUCT+'<br>'+FIXED_CREDIT+'<br><small>These labels cannot be changed through whitelabel settings.</small></div>\
        <button id="qBrandSave" style="margin-top:14px;">💾 Save School Profile</button>\
      </div>\
    </div>\
    <div class="qlog-classic-settings-panel" data-panel="reports">\
      <div class="card"><h3>🖨 Report Signatories</h3><div class="qlog-classic-form-grid">\
        '+field('qBrandPreparedBy','Prepared By')+field('qBrandPreparedPos','Prepared By — Position')+field('qBrandCheckedBy','Checked By')+field('qBrandCheckedPos','Checked By — Position')+field('qBrandApprovedBy','Approved By')+field('qBrandApprovedPos','Approved By — Position')+'\
      </div><button class="qBrandSaveAny" style="margin-top:14px;">💾 Save Report Signatories</button></div>\
    </div>\
    <div class="qlog-classic-settings-panel" data-panel="scope">\
      <div class="card"><h3>🏢 Current Unit / Report Scope</h3><p style="font-size:13px;color:#64748b;">Normal users only see report types and report records allowed for their assigned facility. Old records without facility ownership remain isolated until explicitly assigned.</p><div id="qClassicScopeGrid" class="qlog-classic-scope-grid"></div>\
      <hr><h4>Legacy Unscoped Records</h4><div id="qClassicLegacyGrid" class="qlog-classic-scope-grid"></div><button id="qClassicAssignLegacy" style="background:#d97706;">Assign All Unscoped Logs to Current Unit</button></div>\
    </div>\
    <div class="qlog-classic-settings-panel" data-panel="about">\
      <div class="card"><h3>'+FIXED_PRODUCT+'</h3><p>Offline-first school logging, visitor verification, library circulation, COA ICS inventory, equipment custody, and unit-scoped reporting.</p><div class="qlog-classic-fixed-brand"><b>Product:</b> '+FIXED_PRODUCT+'<br><b>Credit:</b> '+FIXED_CREDIT+'<br><b>Deployment:</b> Pure PWA / local-first<br><b>UI Mode:</b> Original QLog Classic</div></div>\
    </div>';
  reports.insertAdjacentElement('afterend',tab);

  document.querySelectorAll('.qlog-classic-settings-menu button').forEach(function(b){
    b.onclick=function(){
      document.querySelectorAll('.qlog-classic-settings-menu button').forEach(function(x){x.classList.toggle('active',x===b);});
      document.querySelectorAll('.qlog-classic-settings-panel').forEach(function(x){x.classList.toggle('active',x.dataset.panel===b.dataset.panel);});
      if(b.dataset.panel==='scope') renderScope();
    };
  });
  var f=document.getElementById('qBrandLogoFile'); if(f)f.onchange=handleLogo;
  var rm=document.getElementById('qBrandRemoveLogo'); if(rm)rm.onclick=function(){var b=getBranding();b.logo='';saveBranding(b);loadBrandFields();};
  var save=document.getElementById('qBrandSave'); if(save)save.onclick=function(){saveBranding(readBrandFields());};
  document.querySelectorAll('.qBrandSaveAny').forEach(function(x){x.onclick=function(){saveBranding(readBrandFields());};});
  ['qBrandSchoolName','qBrandAddress','qBrandSchoolYear'].forEach(function(id){var e=document.getElementById(id);if(e)e.oninput=updatePreview;});
  var as=document.getElementById('qClassicAssignLegacy'); if(as)as.onclick=assignLegacy;
  loadBrandFields(); renderScope();
}

function mapFields(){return {qBrandSchoolName:'schoolName',qBrandSchoolId:'schoolId',qBrandSchoolYear:'schoolYear',qBrandAddress:'address',qBrandDistrict:'district',qBrandDivision:'division',qBrandRegion:'region',qBrandContact:'contact',qBrandEmail:'email',qBrandPreparedBy:'preparedBy',qBrandPreparedPos:'preparedPosition',qBrandCheckedBy:'checkedBy',qBrandCheckedPos:'checkedPosition',qBrandApprovedBy:'approvedBy',qBrandApprovedPos:'approvedPosition',qBrandAccent:'accent'};}
function loadBrandFields(){var b=getBranding(),m=mapFields();Object.keys(m).forEach(function(id){var e=document.getElementById(id);if(e)e.value=b[m[id]]||'';});updatePreview();applyBranding();}
function readBrandFields(){var b=getBranding(),m=mapFields();Object.keys(m).forEach(function(id){var e=document.getElementById(id);if(e)b[m[id]]=String(e.value||'').trim();});return b;}
function saveBranding(b){try{localStorage.setItem(BRAND_KEY,JSON.stringify(b));}catch(e){}applyBranding();updatePreview();if(window.toast)toast('✅ School profile / report settings saved.','green');}
function handleLogo(ev){var file=ev.target.files&&ev.target.files[0];if(!file)return;if(!/^image\/(png|jpeg|webp)$/.test(file.type)){if(window.toast)toast('Please select a PNG, JPG or WebP school logo.','red');return;}var fr=new FileReader();fr.onload=function(){var im=new Image();im.onload=function(){var c=document.createElement('canvas'),max=320,scale=Math.min(1,max/Math.max(im.width,im.height));c.width=Math.max(1,Math.round(im.width*scale));c.height=Math.max(1,Math.round(im.height*scale));c.getContext('2d').drawImage(im,0,0,c.width,c.height);var b=getBranding();b.logo=c.toDataURL('image/png',.9);saveBranding(b);loadBrandFields();};im.src=fr.result;};fr.readAsDataURL(file);}
function updatePreview(){var b=readBrandFields(),box=document.getElementById('qClassicPreview'),img=document.getElementById('qClassicLogoPreview'),nm=document.getElementById('qClassicSchoolPreview'),ad=document.getElementById('qClassicAddressPreview');if(nm)nm.textContent=b.schoolName||'Your School / Institution';if(ad)ad.textContent=[b.address,b.schoolYear?'SY '+b.schoolYear:''].filter(Boolean).join(' • ')||'School profile appears here.';if(img&&box){if(b.logo){img.src=b.logo;box.classList.add('has-logo');}else{img.removeAttribute('src');box.classList.remove('has-logo');}}}
function applyBranding(){var b=getBranding();document.title=FIXED_PRODUCT+(b.schoolName?' — '+b.schoolName:'');var tc=document.querySelector('meta[name="theme-color"]');if(tc)tc.setAttribute('content',b.accent||'#2563eb');var h=document.querySelector('.header h2');if(h)h.textContent=FIXED_PRODUCT;var ft=document.getElementById('facilityTitle');if(ft&&window.currentSession&&currentSession.facility){ft.textContent=((b.schoolName?b.schoolName+' • ':'')+currentSession.facility).toUpperCase();}}
window.applyQlogBranding=applyBranding;

function applyVisibility(){
  if(!window.QLogScope)return;
  if(!window.currentSession || !currentSession.facility){ filterReportOptions(); return; }
  var c=QLogScope.capabilities();
  var set=function(id,on){var e=document.getElementById(id);if(e)e.style.display=on?'inline-block':'none';};
  set('bookInvBtn',!!c.library);set('borrowBtn',!!c.library);set('reservationTabBtn',!!c.library);set('equipBtn',!!c.equipment);
  var v=document.getElementById('visitorTabBtn');if(v&&c.visitors)v.style.display='inline-block';
  filterReportOptions();
  var a=document.querySelector('.tab.active');if(a){var bad=(!c.library&&['bookinv','borrow','reservationsTab'].indexOf(a.id)>=0)||(!c.equipment&&a.id==='equipment');if(bad&&window.showTab){var b=document.querySelector('.nav button');showTab('live',b);}}
}
function filterReportOptions(){
  var sel=document.getElementById('reportType');if(!sel||!window.QLogScope)return;
  var allowed=QLogScope.reportTypes();
  Array.prototype.forEach.call(sel.options,function(o){var ok=allowed.indexOf(o.value)>=0;o.hidden=!ok;o.disabled=!ok;});
  if(allowed.indexOf(sel.value)<0){sel.value=allowed[0]||'ATTENDANCE';if(window.updateReportControls)updateReportControls();}
  var note=document.getElementById('reportContextNote');if(note){note.textContent='Showing only report types and records allowed for '+QLogScope.unitLabel()+'.';}
}
function renderScope(){
  if(!window.QLogScope)return;var c=QLogScope.capabilities(),unit=QLogScope.unitLabel();
  var grid=document.getElementById('qClassicScopeGrid');if(grid)grid.innerHTML=[['Active Unit',unit],['Attendance',c.attendance?'Enabled':'Not available'],['Visitors',c.visitors?'Enabled':'Not available'],['Library',c.library?'Enabled':'Not available'],['Equipment',c.equipment?'Enabled':'Not available'],['Cross-unit Reports',c.allUnits?'Enabled':'Not available']].map(function(x){return '<div class="qlog-classic-scope-item"><span>'+esc(x[0])+'</span><b>'+esc(x[1])+'</b></div>';}).join('');
  var l=QLogScope.legacyCounts(),lg=document.getElementById('qClassicLegacyGrid');if(lg)lg.innerHTML=[['Total Unscoped',l.total],['Attendance',l.attendance],['Visitors',l.visitors],['Audit',l.audit]].map(function(x){return '<div class="qlog-classic-scope-item"><span>'+esc(x[0])+'</span><b>'+esc(x[1])+'</b></div>';}).join('');
}
function assignLegacy(){if(!window.QLogScope)return;var l=QLogScope.legacyCounts();if(!l.total){if(window.toast)toast('No legacy unscoped records found.','blue');return;}if(!confirm('Assign ALL '+l.total+' unscoped historical log(s) to '+QLogScope.unitLabel()+'? This changes their reporting ownership.'))return;try{var n=QLogScope.assignLegacyToCurrent();renderScope();if(window.renderReports)renderReports();if(window.toast)toast('✅ '+n+' historical record(s) assigned to '+QLogScope.unitLabel()+'.','green');}catch(e){if(window.toast)toast('Unable to assign legacy records: '+e.message,'red');}}

function patchLifecycle(){
  if(window.finalizeStartup&&!window.finalizeStartup.__qclassic){var oldF=window.finalizeStartup;var f=function(){var r=oldF.apply(this,arguments);setTimeout(function(){applyVisibility();applyBranding();renderScope();},20);return r;};f.__qclassic=true;window.finalizeStartup=f;}
  if(window.showTab&&!window.showTab.__qclassic){var oldS=window.showTab;var s=function(id,btn){if(window.QLogScope){var c=QLogScope.capabilities();if((['bookinv','borrow','reservationsTab'].indexOf(id)>=0&&!c.library)||(id==='equipment'&&!c.equipment)){if(window.toast)toast('⛔ This module is not available for your assigned unit.','red');return;}}var r=oldS.apply(this,arguments);if(id==='reports'){filterReportOptions();if(window.renderReports)renderReports();}if(id==='settings')renderScope();return r;};s.__qclassic=true;window.showTab=s;}
}
function boot(){ensureSettings();patchLifecycle();applyVisibility();applyBranding();renderScope();setTimeout(function(){applyVisibility();applyBranding();},300);}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
