/* =====================================================================
   QLog Pro — Premium Workspace UI/UX Overhaul v1
   UI shell + school whitelabel profile. Existing business logic is reused.
   Fixed product identity: QLog Pro
   Fixed credit: Powered by: Magallanes NHS Team Bitaug C.I. Projects
   ===================================================================== */
(function(){
'use strict';
var BRAND_KEY='qlogSchoolBranding';
var FIXED_PRODUCT='QLog Pro';
var FIXED_CREDIT='Powered by: Magallanes NHS Team Bitaug C.I. Projects';
var PAGE_META={
  live:['Overview & Live Monitor','Real-time facility activity, scanner status and current occupancy.','OPERATIONS'],
  inventory:['Client Registry','Manage learners, personnel and validated client records.','REGISTRY'],
  visitors:['Visitor Management','Guided identity verification, purpose selection and face-confirmed logging.','OPERATIONS'],
  bookinv:['Library Inventory','COA ICS-style semi-expendable books inventory by subject and year level.','LIBRARY'],
  borrow:['Library Circulation','Borrowing, returns and borrower history in one circulation workspace.','LIBRARY'],
  reservationsTab:['Library Reservations','Manage the reservation and waiting queue.','LIBRARY'],
  equipment:['Equipment Management','COA ICS equipment registry, releases, returns and transaction history.','ASSET MANAGEMENT'],
  reports:['Reports Center','A4-ready reporting across attendance, visitors, clients, library and equipment.','ANALYTICS'],
  settings:['Settings','School profile, branding, report identity and application preferences.','SYSTEM']
};
function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
function getBranding(){
  var d={schoolName:'',schoolId:'',address:'',district:'',division:'',region:'',contact:'',email:'',schoolYear:'',logo:'',accent:'#3157d5',preparedBy:'',preparedPosition:'',checkedBy:'',checkedPosition:'',approvedBy:'',approvedPosition:''};
  try{Object.assign(d,JSON.parse(localStorage.getItem(BRAND_KEY)||'{}'));}catch(e){}
  return d;
}
window.getQlogBranding=getBranding;
window.QLOG_FIXED_PRODUCT=FIXED_PRODUCT;
window.QLOG_FIXED_CREDIT=FIXED_CREDIT;
function initials(name){var p=String(name||'QL').trim().split(/\s+/).filter(Boolean);return ((p[0]||'Q')[0]+(p.length>1?p[p.length-1][0]:'')).toUpperCase();}
function activeTabId(){var el=document.querySelector('.tab.active');return el?el.id:'live';}
function visible(el){return !!(el&&getComputedStyle(el).display!=='none');}

function installShell(){
  document.body.classList.add('qlog-app-ready');
  var header=document.querySelector('.header'), nav=document.querySelector('.nav');
  if(!header||!nav||document.getElementById('qlogTopbar')) return;
  var h2=header.querySelector('h2'); if(h2) h2.textContent=FIXED_PRODUCT;
  var schoolMini=document.createElement('div');schoolMini.className='qlog-school-mini';schoolMini.id='qlogSchoolMini';
  var hd=header.querySelector('div'); if(hd) hd.appendChild(schoolMini);
  var logo=document.createElement('img');logo.className='qlog-side-logo';logo.id='qlogSideLogo';logo.alt='School logo';header.insertBefore(logo,header.firstChild);

  // Sidebar labels retain the original buttons and handlers.
  var buttons=[].slice.call(nav.querySelectorAll(':scope > button'));
  var groups={0:'Operations',1:'Registry',2:'Operations',3:'Library',4:'Library',5:'Library',6:'Asset Management',7:'Analytics'};
  var last='';buttons.forEach(function(b,i){var g=groups[i]||'';if(g&&g!==last){var s=document.createElement('div');s.className='qlog-nav-section';s.textContent=g;nav.insertBefore(s,b);last=g;}});
  var settingsBtn=document.createElement('button');settingsBtn.id='qlogSettingsNav';settingsBtn.innerHTML='⚙️ Settings';settingsBtn.onclick=function(){if(window.showTab)window.showTab('settings',settingsBtn);};
  var sys=document.createElement('div');sys.className='qlog-nav-section';sys.textContent='System';nav.appendChild(sys);nav.appendChild(settingsBtn);

  var foot=document.createElement('div');foot.className='qlog-sidebar-footer';foot.innerHTML='<div><b>'+FIXED_PRODUCT+'</b>'+FIXED_CREDIT+'</div>';document.body.appendChild(foot);
  var scrim=document.createElement('div');scrim.className='qlog-mobile-scrim';scrim.onclick=function(){document.body.classList.remove('qlog-sidebar-open');};document.body.appendChild(scrim);

  var top=document.createElement('div');top.className='qlog-topbar';top.id='qlogTopbar';
  top.innerHTML='<button class="qlog-icon-btn" id="qlogSideToggle" aria-label="Toggle navigation">☰</button>'+
    '<div class="qlog-topbar-title"><h1 id="qlogPageTitle">Overview & Live Monitor</h1><p id="qlogPageSubtitle"></p></div>'+
    '<button class="qlog-icon-btn" id="qlogSearchBtn">⌕ <span class="qlog-search-label">Search QLog</span></button>'+
    '<span class="qlog-online-pill" id="qlogOnlinePill">● Offline Ready</span>'+
    '<div class="qlog-user-chip"><div class="qlog-avatar" id="qlogAvatar">QL</div><div class="qlog-user-copy"><b id="qlogUserName">QLog User</b><span id="qlogUserRole">Facility In-Charge</span></div></div>';
  document.body.appendChild(top);
  var logout=document.getElementById('logoutBtn'),pwd=document.getElementById('changePwdBtn');if(pwd){pwd.title='Change Superadmin password';top.appendChild(pwd);}if(logout){logout.title='Logout QLog session';top.appendChild(logout);}
  document.getElementById('qlogSideToggle').onclick=function(){if(innerWidth<=820)document.body.classList.toggle('qlog-sidebar-open');else document.body.classList.toggle('qlog-sidebar-collapsed');};
  document.getElementById('qlogSearchBtn').onclick=openCommand;

  installCommandPalette();installMobileNav();installPageHeads();installReportCatalog();installVisitorStepper();enhanceDenseSections();
  updateShell();applyBranding();
}
function installPageHeads(){
  Object.keys(PAGE_META).forEach(function(id){var tab=document.getElementById(id);if(!tab||tab.querySelector(':scope > .qlog-pagehead'))return;var m=PAGE_META[id];var ph=document.createElement('div');ph.className='qlog-pagehead';ph.innerHTML='<div><div class="qlog-page-kicker">'+esc(m[2])+'</div><h2>'+esc(m[0])+'</h2><p>'+esc(m[1])+'</p></div><span class="qlog-context-badge" data-q-context>● Local-first workspace</span>';tab.insertBefore(ph,tab.firstChild);});
  var live=document.getElementById('live');if(live&&!document.getElementById('qlogKpis')){var k=document.createElement('div');k.id='qlogKpis';k.className='qlog-kpi-grid';var ph=live.querySelector('.qlog-pagehead');ph.insertAdjacentElement('afterend',k);}
}
function installMobileNav(){
  var m=document.createElement('div');m.className='qlog-mobile-nav';m.id='qlogMobileNav';
  m.innerHTML='<button data-target="live"><span class="i">⌂</span>Home</button><button data-target="inventory"><span class="i">👥</span>Clients</button><button id="qlogMobileModule"><span class="i">▦</span>Module</button><button data-target="reports"><span class="i">▥</span>Reports</button><button id="qlogMobileMore"><span class="i">☰</span>More</button>';
  document.body.appendChild(m);
  m.querySelectorAll('[data-target]').forEach(function(b){b.onclick=function(){triggerNav(b.dataset.target);};});
  document.getElementById('qlogMobileModule').onclick=function(){var target=(window.currentSession&&currentSession.role==='librarian')?'bookinv':'equipment';var btn=[].slice.call(document.querySelectorAll('.nav button')).find(function(b){return (b.getAttribute('onclick')||'').indexOf("'"+target+"'")>=0;});if(btn&&visible(btn))triggerNav(target);else document.body.classList.add('qlog-sidebar-open');};
  document.getElementById('qlogMobileMore').onclick=function(){document.body.classList.add('qlog-sidebar-open');};
}
function triggerNav(id){var btn=[].slice.call(document.querySelectorAll('.nav button')).find(function(b){return (b.getAttribute('onclick')||'').indexOf("'"+id+"'")>=0||b.id==='qlogSettingsNav'&&id==='settings';});if(btn){if(visible(btn))btn.click();else if(window.toast)toast('This module is not available for the current QLog role/facility.','yellow');return;}if(window.showTab)window.showTab(id,null);}
function updateMobileNav(){var id=activeTabId();document.querySelectorAll('#qlogMobileNav button').forEach(function(b){b.classList.toggle('active',b.dataset.target===id||(b.id==='qlogMobileModule'&&((currentSession&&currentSession.role==='librarian'&&['bookinv','borrow','reservationsTab'].indexOf(id)>=0)||(!currentSession||currentSession.role!=='librarian')&&id==='equipment')));});var mb=document.getElementById('qlogMobileModule');if(mb)mb.innerHTML=(currentSession&&currentSession.role==='librarian')?'<span class="i">📚</span>Library':'<span class="i">🧰</span>Assets';}
function updateShell(){
  var id=activeTabId(),m=PAGE_META[id]||PAGE_META.live,b=getBranding();
  var t=document.getElementById('qlogPageTitle'),s=document.getElementById('qlogPageSubtitle');if(t)t.textContent=m[0];if(s)s.textContent=m[1];
  var fac=(window.currentSession&&currentSession.facility)||'QLog Workspace',name=(window.currentSession&&currentSession.inCharge)||'QLog User',des=(window.currentSession&&currentSession.designation)||'Facility In-Charge';
  var u=document.getElementById('qlogUserName'),r=document.getElementById('qlogUserRole'),a=document.getElementById('qlogAvatar');if(u)u.textContent=name;if(r)r.textContent=des+' • '+fac;if(a)a.textContent=initials(name);
  document.querySelectorAll('[data-q-context]').forEach(function(e){e.textContent=(b.schoolYear?'SY '+b.schoolYear+' • ':'')+fac;});
  updateMobileNav();refreshKpis();refreshVisitorStepper();refreshNavGroups();
  if(innerWidth<=820)document.body.classList.remove('qlog-sidebar-open');
}
function refreshNavGroups(){var nav=document.querySelector('.nav');if(!nav)return;var children=[].slice.call(nav.children);for(var i=0;i<children.length;i++){var e=children[i];if(!e.classList.contains('qlog-nav-section'))continue;var any=false;for(var j=i+1;j<children.length&&!children[j].classList.contains('qlog-nav-section');j++){if(children[j].tagName==='BUTTON'&&visible(children[j])){any=true;break;}}e.style.display=any?'block':'none';}}
function refreshKpis(){var k=document.getElementById('qlogKpis');if(!k)return;var today=new Date().toLocaleDateString();var inside=0,vis=0,bookOut=0,eqOut=0,attention=0;try{inside=(window.logs||[]).filter(function(x){return !x.out&&!x.timeOut&&!x.o;}).length;}catch(e){}try{vis=(window.logs||[]).filter(function(x){return String(x.category||x.c||'').toUpperCase().indexOf('VISITOR')>=0&&String(x.date||x.d||x.time||'').indexOf(today)>=0;}).length;}catch(e){}try{bookOut=(window.borrowLogs||[]).filter(function(x){return x.s==='BORROWED'||x.s==='OVERDUE';}).length;attention+=(window.borrowLogs||[]).filter(function(x){return x.s==='OVERDUE';}).length;}catch(e){}try{eqOut=(window.equipmentLogs||window.equipLogs||[]).filter(function(x){return x.s==='BORROWED'||x.status==='BORROWED'||x.s==='OVERDUE'||x.status==='OVERDUE';}).length;attention+=(window.equipmentLogs||window.equipLogs||[]).filter(function(x){return x.s==='OVERDUE'||x.status==='OVERDUE';}).length;}catch(e){}
  var data=[['Currently Inside',inside,'Live occupancy',''],['Visitors Today',vis,'Visitor activity',''],['Books Out',bookOut,'Active circulation',''],['Equipment Out',eqOut,'Active releases',''],['Needs Attention',attention,'Overdue records',attention?'attention':'good']];
  k.innerHTML=data.map(function(x){return '<div class="qlog-kpi '+x[3]+'"><div class="label">'+x[0]+'</div><div class="value">'+x[1]+'</div><div class="hint">'+x[2]+'</div></div>';}).join('');
}


function enhanceDenseSections(){
  ['inventory','bookinv'].forEach(function(id){
    var tab=document.getElementById(id),card=tab&&tab.querySelector('.card');if(!card)return;
    var heads=[].slice.call(card.children).filter(function(n){return n.tagName==='H4';});
    heads.forEach(function(h){
      if(h.dataset.qlogDisclosure==='1')return;h.dataset.qlogDisclosure='1';h.classList.add('qlog-disclosure-title');h.setAttribute('role','button');h.tabIndex=0;
      var body=document.createElement('div');body.className='qlog-disclosure-body';
      var n=h.nextSibling;
      while(n){var next=n.nextSibling;if(n.nodeType===1&&n.tagName==='HR')break;body.appendChild(n);n=next;}
      h.insertAdjacentElement('afterend',body);
      var shouldOpen=/search|filter/i.test(h.textContent||'');
      function paint(open){body.classList.toggle('qlog-closed',!open);h.classList.toggle('qlog-closed',!open);h.setAttribute('aria-expanded',open?'true':'false');}
      paint(shouldOpen);
      h.onclick=function(){paint(body.classList.contains('qlog-closed'));};
      h.onkeydown=function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();h.click();}};
    });
  });
}

function installVisitorStepper(){var tab=document.getElementById('visitors');if(!tab||document.getElementById('qlogVisitorStepper'))return;var st=document.createElement('div');st.id='qlogVisitorStepper';st.className='qlog-stepper';st.innerHTML=['Identity','Information','Purpose','Face verify'].map(function(x,i){return '<div class="qlog-step" data-step="'+(i+1)+'"><span class="n">'+(i+1)+'</span><span>'+x+'</span></div>';}).join('');var ph=tab.querySelector('.qlog-pagehead');ph.insertAdjacentElement('afterend',st);var obs=new MutationObserver(refreshVisitorStepper);['visitorFlowStatus','visitorVideoWrap','visitorNameSource'].forEach(function(id){var e=document.getElementById(id);if(e)obs.observe(e,{attributes:true,childList:true,subtree:true,characterData:true});});}
function refreshVisitorStepper(){var st=document.getElementById('qlogVisitorStepper');if(!st)return;var n=(document.getElementById('visitorName')||{}).value||'',reason=(document.getElementById('visitorReason')||{}).value||'',video=document.getElementById('visitorVideoWrap');var step=n?2:1;if(n&&reason)step=3;if(video&&getComputedStyle(video).display!=='none')step=4;st.querySelectorAll('.qlog-step').forEach(function(e){var x=+e.dataset.step;e.classList.toggle('done',x<step);e.classList.toggle('active',x===step);});}

var REPORTS=[['ATTENDANCE','📊','Attendance Logbook'],['VISITOR','🧑','Visitor Logs'],['CLIENT','👥','Client Inventory'],['LIBRARY_INVENTORY','📚','Library ICS Inventory'],['LIBRARY_BORROW','↔','Library Borrow / Return'],['LIBRARY_RESERVATION','⏳','Reservation Queue'],['LIBRARY_AUDIT','🛡','Audit Trail'],['EQUIPMENT_INVENTORY','🧰','Equipment ICS Registry'],['EQUIPMENT_BORROW','↔','Equipment Borrow / Return']];
function installReportCatalog(){var tab=document.getElementById('reports'),card=tab&&tab.querySelector('.card');if(!card||document.getElementById('qlogReportCatalog'))return;var cat=document.createElement('div');cat.id='qlogReportCatalog';cat.className='qlog-report-catalog';cat.innerHTML=REPORTS.map(function(r){return '<button class="qlog-report-tile" data-report="'+r[0]+'"><span class="qlog-report-icon">'+r[1]+'</span><span>'+r[2]+'</span></button>';}).join('');var controls=card.querySelector('.report-hub-controls');card.insertBefore(cat,controls);cat.querySelectorAll('button').forEach(function(b){b.onclick=function(){var sel=document.getElementById('reportType');if(sel){sel.value=b.dataset.report;if(window.updateReportControls)updateReportControls();if(window.renderReports)renderReports();markReportCatalog();}};});markReportCatalog();}
function markReportCatalog(){var v=(document.getElementById('reportType')||{}).value;document.querySelectorAll('.qlog-report-tile').forEach(function(b){b.classList.toggle('active',b.dataset.report===v);});}

function installSettings(){
  if(document.getElementById('settings'))return;
  var report=document.getElementById('reports');if(!report)return;
  var tab=document.createElement('div');tab.id='settings';tab.className='tab';
  tab.innerHTML='<div class="qlog-settings-layout">'+
    '<div class="qlog-settings-menu"><button class="active" data-panel="brand">School & Branding</button><button data-panel="reports">Report Identity</button><button data-panel="appearance">Appearance</button><button data-panel="about">About QLog</button></div>'+
    '<div><section class="qlog-settings-panel active" data-panel="brand">'+
      '<div class="qlog-brand-preview" id="qlogBrandPreview"><img id="qlogBrandPreviewLogo" alt="School logo"><div><h3 id="qlogBrandPreviewName">Your School / Institution</h3><p id="qlogBrandPreviewAddress">School profile appears here</p><p><b>'+FIXED_PRODUCT+'</b> • '+FIXED_CREDIT+'</p></div></div>'+
      '<div class="qlog-settings-section"><h3>School Profile</h3><p>This profile is used across the workspace and official report headers. QLog Pro remains the fixed product identity.</p><div class="qlog-form-grid">'+
      fld('qBrandSchoolName','School Name','full')+fld('qBrandSchoolId','School ID / Institution ID')+fld('qBrandSchoolYear','Current School Year')+fld('qBrandAddress','School Address','full')+fld('qBrandDistrict','District')+fld('qBrandDivision','Division')+fld('qBrandRegion','Region')+fld('qBrandContact','Contact Number')+fld('qBrandEmail','Official Email')+'</div></div>'+
      '<div class="qlog-settings-section"><h3>School Logo</h3><p>PNG, JPG or WebP. The image is resized locally and saved only on this device.</p><div class="qlog-logo-actions"><input id="qBrandLogoFile" type="file" accept="image/png,image/jpeg,image/webp"><button type="button" id="qBrandRemoveLogo" style="background:#fff;color:#344054">Remove Logo</button></div></div>'+
      '<div class="qlog-settings-section"><div class="qlog-fixed-brand"><b>Fixed product identity</b><br>'+FIXED_PRODUCT+'<br>'+FIXED_CREDIT+'<br><br>These two labels are intentionally locked and cannot be changed by whitelabel settings.</div><div class="qlog-savebar"><button id="qBrandSave">Save School Profile</button></div></div></section>'+
    '<section class="qlog-settings-panel" data-panel="reports"><div class="qlog-settings-section"><h3>Report Signatories</h3><p>Optional signatories used by compatible A4 reports and exports.</p><div class="qlog-form-grid">'+fld('qBrandPreparedBy','Prepared By')+fld('qBrandPreparedPos','Position / Designation')+fld('qBrandCheckedBy','Checked By')+fld('qBrandCheckedPos','Position / Designation')+fld('qBrandApprovedBy','Approved By')+fld('qBrandApprovedPos','Position / Designation')+'</div><div class="qlog-savebar"><button class="qBrandSaveAny">Save Report Identity</button></div></div></section>'+
    '<section class="qlog-settings-panel" data-panel="appearance"><div class="qlog-settings-section"><h3>Appearance</h3><p>Choose a restrained brand accent. The system automatically preserves readable contrast.</p><div class="qlog-form-grid"><div><label>Accent</label><select id="qBrandAccent"><option value="#3157d5">Professional Blue</option><option value="#4f46b8">Indigo</option><option value="#176b62">Teal</option><option value="#7a4f18">Warm Bronze</option><option value="#384152">Slate</option></select></div></div><div class="qlog-savebar"><button class="qBrandSaveAny">Save Appearance</button></div></div></section>'+
    '<section class="qlog-settings-panel" data-panel="about"><div class="qlog-settings-section"><h3>'+FIXED_PRODUCT+'</h3><p>Offline-first school logging, library circulation, visitor verification, COA ICS inventory and reporting workspace.</p><div class="qlog-fixed-brand"><b>Product:</b> '+FIXED_PRODUCT+'<br><b>Credit:</b> '+FIXED_CREDIT+'<br><b>Deployment:</b> Pure PWA / local-first<br><b>Runtime external dependencies:</b> None</div></div></section></div></div>';
  report.insertAdjacentElement('afterend',tab);installPageHeads();bindSettings();loadSettingsFields();
}
function fld(id,label,cls){return '<div class="'+(cls||'')+'"><label for="'+id+'">'+label+'</label><input id="'+id+'" autocomplete="off"></div>';}
function bindSettings(){document.querySelectorAll('.qlog-settings-menu button').forEach(function(b){b.onclick=function(){document.querySelectorAll('.qlog-settings-menu button').forEach(function(x){x.classList.toggle('active',x===b);});document.querySelectorAll('.qlog-settings-panel').forEach(function(x){x.classList.toggle('active',x.dataset.panel===b.dataset.panel);});};});var f=document.getElementById('qBrandLogoFile');if(f)f.onchange=handleLogo;var rm=document.getElementById('qBrandRemoveLogo');if(rm)rm.onclick=function(){var b=getBranding();b.logo='';saveBranding(b);loadSettingsFields();};var s=document.getElementById('qBrandSave');if(s)s.onclick=saveSettings;document.querySelectorAll('.qBrandSaveAny').forEach(function(x){x.onclick=saveSettings;});['qBrandSchoolName','qBrandAddress','qBrandSchoolYear'].forEach(function(id){var e=document.getElementById(id);if(e)e.oninput=updateSettingsPreview;});}
function loadSettingsFields(){var b=getBranding(),map={qBrandSchoolName:'schoolName',qBrandSchoolId:'schoolId',qBrandSchoolYear:'schoolYear',qBrandAddress:'address',qBrandDistrict:'district',qBrandDivision:'division',qBrandRegion:'region',qBrandContact:'contact',qBrandEmail:'email',qBrandPreparedBy:'preparedBy',qBrandPreparedPos:'preparedPosition',qBrandCheckedBy:'checkedBy',qBrandCheckedPos:'checkedPosition',qBrandApprovedBy:'approvedBy',qBrandApprovedPos:'approvedPosition',qBrandAccent:'accent'};Object.keys(map).forEach(function(id){var e=document.getElementById(id);if(e)e.value=b[map[id]]||'';});updateSettingsPreview();}
function readSettings(){var b=getBranding(),map={qBrandSchoolName:'schoolName',qBrandSchoolId:'schoolId',qBrandSchoolYear:'schoolYear',qBrandAddress:'address',qBrandDistrict:'district',qBrandDivision:'division',qBrandRegion:'region',qBrandContact:'contact',qBrandEmail:'email',qBrandPreparedBy:'preparedBy',qBrandPreparedPos:'preparedPosition',qBrandCheckedBy:'checkedBy',qBrandCheckedPos:'checkedPosition',qBrandApprovedBy:'approvedBy',qBrandApprovedPos:'approvedPosition',qBrandAccent:'accent'};Object.keys(map).forEach(function(id){var e=document.getElementById(id);if(e)b[map[id]]=e.value.trim();});return b;}
function saveBranding(b){localStorage.setItem(BRAND_KEY,JSON.stringify(b));applyBranding();if(window.toast)toast('✅ School profile and QLog presentation settings saved.','green');}
function saveSettings(){saveBranding(readSettings());}
function handleLogo(ev){var file=ev.target.files&&ev.target.files[0];if(!file)return;if(!/^image\/(png|jpeg|webp)$/.test(file.type)){if(window.toast)toast('Please select a PNG, JPG or WebP logo.','red');return;}var fr=new FileReader();fr.onload=function(){var im=new Image();im.onload=function(){var c=document.createElement('canvas'),max=320,scale=Math.min(1,max/Math.max(im.width,im.height));c.width=Math.max(1,Math.round(im.width*scale));c.height=Math.max(1,Math.round(im.height*scale));c.getContext('2d').drawImage(im,0,0,c.width,c.height);var b=getBranding();b.logo=c.toDataURL('image/png',.9);saveBranding(b);loadSettingsFields();};im.src=fr.result;};fr.readAsDataURL(file);}
function updateSettingsPreview(){var b=readSettings(),p=document.getElementById('qlogBrandPreview'),img=document.getElementById('qlogBrandPreviewLogo');if(!p)return;document.getElementById('qlogBrandPreviewName').textContent=b.schoolName||'Your School / Institution';document.getElementById('qlogBrandPreviewAddress').textContent=[b.address,b.schoolYear?'SY '+b.schoolYear:''].filter(Boolean).join(' • ')||'School profile appears here';if(b.logo){img.src=b.logo;p.classList.add('has-logo');}else{img.removeAttribute('src');p.classList.remove('has-logo');}}
function applyBranding(){var b=getBranding();document.documentElement.style.setProperty('--q-brand',b.accent||'#3157d5');var mini=document.getElementById('qlogSchoolMini');if(mini)mini.textContent=b.schoolName||'School / Institution';var logo=document.getElementById('qlogSideLogo'),header=document.querySelector('.header');if(logo&&header){if(b.logo){logo.src=b.logo;header.classList.add('qlog-has-school-logo');}else{logo.removeAttribute('src');header.classList.remove('qlog-has-school-logo');}}document.title=FIXED_PRODUCT+(b.schoolName?' — '+b.schoolName:'');var tc=document.querySelector('meta[name="theme-color"]');if(tc)tc.setAttribute('content',b.accent||'#3157d5');updateSettingsPreview();updateShell();}
window.applyQlogBranding=applyBranding;

function installCommandPalette(){var ov=document.createElement('div');ov.id='qlogCommandOverlay';ov.className='qlog-command-overlay';ov.innerHTML='<div class="qlog-command"><input id="qlogCommandInput" placeholder="Search clients, books, equipment or run a command…"><div class="qlog-command-list" id="qlogCommandList"></div></div>';document.body.appendChild(ov);ov.onclick=function(e){if(e.target===ov)closeCommand();};var i=document.getElementById('qlogCommandInput');i.oninput=renderCommand;i.onkeydown=function(e){if(e.key==='Escape')closeCommand();};document.addEventListener('keydown',function(e){if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){e.preventDefault();openCommand();}if(e.key==='Escape')closeCommand();});renderCommand();}
function openCommand(){var o=document.getElementById('qlogCommandOverlay');if(!o)return;o.classList.add('open');var i=document.getElementById('qlogCommandInput');i.value='';renderCommand();setTimeout(function(){i.focus();},40);}
function closeCommand(){var o=document.getElementById('qlogCommandOverlay');if(o)o.classList.remove('open');}
function renderCommand(){var q=((document.getElementById('qlogCommandInput')||{}).value||'').trim().toLowerCase(),list=document.getElementById('qlogCommandList');if(!list)return;var out=[];var commands=[['⌂','Open Live Monitor','live'],['👥','Open Client Registry','inventory'],['🧑','Open Visitors','visitors'],['📚','Open Library Inventory','bookinv'],['🧰','Open Equipment','equipment'],['▥','Open Reports','reports'],['⚙','Open Settings','settings']];commands.forEach(function(c){if(!q||c[1].toLowerCase().indexOf(q)>=0)out.push({title:c[1],meta:'Command',go:function(){triggerNav(c[2]);}});});if(q){try{(window.people||[]).slice(0,1000).forEach(function(x){var s=[x.id,x.name,x.category,x.grade,x.section].join(' ').toLowerCase();if(s.indexOf(q)>=0)out.push({title:(x.name||x.id),meta:'Client • '+(x.id||'')+' • '+(x.category||''),go:function(){triggerNav('inventory');var box=document.getElementById('clientSearchBox');if(box){box.value=x.name||x.id;if(window.renderPeople)renderPeople();}}});});}catch(e){}try{(window.books||[]).slice(0,1000).forEach(function(x){var s=[x.id,x.isbn,x.title,x.subject,x.yearLevel].join(' ').toLowerCase();if(s.indexOf(q)>=0)out.push({title:x.title||x.isbn,meta:'Book • '+(x.subject||'')+' • '+(x.yearLevel||''),go:function(){triggerNav('bookinv');var box=document.getElementById('bookSearch');if(box){box.value=x.title||x.isbn;if(window.renderBookInventory)renderBookInventory();}}});});}catch(e){}try{(window.equipment||[]).slice(0,1000).forEach(function(x){var s=[x.id,x.name,x.category,x.unit].join(' ').toLowerCase();if(s.indexOf(q)>=0)out.push({title:x.name||x.id,meta:'Equipment • '+(x.id||'')+' • '+(x.unit||''),go:function(){triggerNav('equipment');}});});}catch(e){}}
  out=out.slice(0,18);if(!out.length){list.innerHTML='<div class="qlog-command-empty">No matching QLog records or commands.</div>';return;}list.innerHTML='';out.forEach(function(x){var d=document.createElement('div');d.className='qlog-command-item';d.innerHTML='<div><b>'+esc(x.title)+'</b><br><span>'+esc(x.meta)+'</span></div><span>↵</span>';d.onclick=function(){closeCommand();x.go();};list.appendChild(d);});}

function patchAppFunctions(){if(window.showTab&&!window.showTab.__qlogWrapped){var old=window.showTab;var wrapped=function(){var r=old.apply(this,arguments);setTimeout(function(){updateShell();markReportCatalog();},0);return r;};wrapped.__qlogWrapped=true;window.showTab=wrapped;}if(window.finalizeStartup&&!window.finalizeStartup.__qlogWrapped){var f=window.finalizeStartup;var fw=function(){var r=f.apply(this,arguments);setTimeout(function(){applyBranding();updateShell();},20);return r;};fw.__qlogWrapped=true;window.finalizeStartup=fw;}}
function onlinePaint(){var e=document.getElementById('qlogOnlinePill');if(!e)return;if(navigator.onLine){e.textContent='● Offline Ready';e.classList.remove('offline');}else{e.textContent='● Offline Mode';e.classList.add('offline');}}
function boot(){installSettings();installShell();patchAppFunctions();onlinePaint();window.addEventListener('online',onlinePaint);window.addEventListener('offline',onlinePaint);setInterval(function(){if(activeTabId()==='live')refreshKpis();},15000);}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();

/* =====================================================================
   QLog Pro — Master Designer UI/UX v2
   Structural information-architecture overhaul layered over the stable
   QLog engine. No business feature IDs/data stores are replaced.
   ===================================================================== */
(function(){
'use strict';
var S=window.QLogScope;
var FIXED_CREDIT='Powered by: Magallanes NHS Team Bitaug C.I. Projects';
var REPORT_META={
 ATTENDANCE:['Activity','Attendance Logbook','Daily time-in/time-out activity for the current unit.'],
 VISITOR:['Visitors','Visitor Logs','Visitor check-in/out, purpose and identity verification.'],
 CLIENT:['Registry','Client Registry','Registered QLog clients.'],
 LIBRARY_INVENTORY:['Library','Library COA ICS Inventory','Semi-expendable books inventory by subject and year level.'],
 LIBRARY_BORROW:['Library','Library Circulation','Borrowing and return transactions.'],
 LIBRARY_RESERVATION:['Library','Reservation Queue','Waiting-list reservations and queue activity.'],
 LIBRARY_AUDIT:['Library','Library Audit Trail','Accountability and library activity trail.'],
 EQUIPMENT_INVENTORY:['Assets','Equipment COA ICS Registry','Semi-expendable equipment assigned to the current unit.'],
 EQUIPMENT_BORROW:['Assets','Equipment Transactions','Borrowing, returns and overdue equipment records.']
};
function esc(v){return String(v==null?'':v).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
function qs(s,r){return (r||document).querySelector(s);} function qsa(s,r){return [].slice.call((r||document).querySelectorAll(s));}
function unit(){return S?S.unitLabel():((window.currentSession||{}).facility||'QLog Workspace');}
function allowed(type){return !S||S.reportTypes().indexOf(type)>=0;}
function navButtonFor(id){return qsa('.nav button').find(function(b){return (b.getAttribute('onclick')||'').indexOf("'"+id+"'")>=0 || (id==='settings'&&b.id==='qlogSettingsNav');});}
function go(id){var b=navButtonFor(id);if(b){b.click();return;} if(window.showTab)showTab(id,null);}
function activeId(){var t=qs('.tab.active');return t?t.id:'';}

function installOverview(){
 if(qs('#qlogOverview'))return;
 var live=qs('#live'); if(!live)return;
 var tab=document.createElement('div');tab.id='qlogOverview';tab.className='tab qlog-v2-overview';
 tab.innerHTML='<div class="qlog-v2-hero"><div><div class="qlog-v2-eyebrow">QLOG PRO OPERATIONS</div><h2 id="qlogV2Greeting">Facility Overview</h2><p id="qlogV2Context"></p></div><div class="qlog-v2-hero-actions"><button class="qlog-v2-secondary" data-go="live">Open Live Monitor</button><button class="qlog-v2-primary" id="qlogV2Primary">Open Workspace</button></div></div><div id="qlogV2Kpis" class="qlog-v2-kpis"></div><div class="qlog-v2-dashboard-grid"><section class="qlog-v2-panel"><div class="qlog-v2-panel-head"><div><span class="qlog-v2-label">RECENT ACTIVITY</span><h3>Today at a glance</h3></div><button class="qlog-v2-link" data-go="live">View live monitor →</button></div><div id="qlogV2Activity" class="qlog-v2-activity"></div></section><section class="qlog-v2-panel"><div class="qlog-v2-panel-head"><div><span class="qlog-v2-label">NEEDS ATTENTION</span><h3>Items requiring action</h3></div></div><div id="qlogV2Attention"></div></section></div>';
 live.parentNode.insertBefore(tab,live);
 var nav=qs('.nav'), first=nav&&qs('button',nav);if(nav&&first){var b=document.createElement('button');b.id='qlogOverviewNav';b.className='qlog-v2-overview-nav';b.innerHTML='<span class="qlog-nav-glyph">⌂</span><span>Overview</span>';b.onclick=function(){showTab('qlogOverview',b);paintChrome();renderOverview();};nav.insertBefore(b,first);}
 qsa('[data-go]',tab).forEach(function(b){b.onclick=function(){go(b.dataset.go);};});
 var p=qs('#qlogV2Primary');if(p)p.onclick=function(){go(S&&S.isLibrary()?'bookinv':(S&&S.capabilities().equipment?'equipment':'live'));};
}
function scopedLogs(){var a=window.logs||[];if(!S)return a;return a.filter(function(r){return S.recordBelongs(r,String(r.category||'').toUpperCase()==='VISITOR'?'VISITOR':'ATTENDANCE');});}
function renderOverview(){
 var k=qs('#qlogV2Kpis');if(!k)return;var today=new Date().toLocaleDateString(),logs=scopedLogs(),tod=logs.filter(function(x){return x.date===today;}),inside=tod.filter(function(x){return !x.timeout;}).length,vis=tod.filter(function(x){return String(x.category||'').toUpperCase()==='VISITOR';}).length;
 var lib=S&&S.capabilities().library, eq=S&&S.capabilities().equipment;
 var bookOut=lib?(window.borrowLogs||[]).filter(function(x){return x.s==='BORROWED'||x.s==='OVERDUE';}).length:0;
 var eqRows=eq?(window.equipLogs||[]).filter(function(x){return !S||S.recordBelongs(x,'EQUIPMENT_BORROW');}):[];
 var eqOut=eqRows.filter(function(x){return x.s==='BORROWED'||x.s==='OVERDUE';}).length;
 var overdue=(lib?(window.borrowLogs||[]).filter(function(x){return x.s==='OVERDUE';}).length:0)+(eq?eqRows.filter(function(x){return x.s==='OVERDUE';}).length:0);
 var vals=[['Currently Inside',inside,'Live occupancy'],['Visitors Today',vis,'Current unit'],[lib?'Books Out':'Equipment Out',lib?bookOut:eqOut,lib?'Active circulation':'Active releases'],['Needs Attention',overdue,overdue?'Overdue items':'No overdue items']];
 k.innerHTML=vals.map(function(x,i){return '<div class="qlog-v2-kpi '+(i===3&&x[1]?'warn':'')+'"><span>'+esc(x[0])+'</span><strong>'+esc(x[1])+'</strong><small>'+esc(x[2])+'</small></div>';}).join('');
 var ctx=qs('#qlogV2Context');if(ctx)ctx.textContent=unit()+' • '+new Date().toLocaleDateString(undefined,{weekday:'long',month:'long',day:'numeric',year:'numeric'});
 var greet=qs('#qlogV2Greeting');if(greet){var h=new Date().getHours(),w=h<12?'Good morning':h<18?'Good afternoon':'Good evening';greet.textContent=w+', '+((window.currentSession||{}).inCharge||'QLog User');}
 var activity=qs('#qlogV2Activity'),recent=tod.slice().reverse().slice(0,7);if(activity)activity.innerHTML=recent.length?recent.map(function(r){var status=r.timeout?'TIME OUT':'TIME IN';return '<div class="qlog-v2-activity-row"><span class="dot"></span><div><b>'+esc(r.name||r.id)+'</b><small>'+esc(r.category||'')+(r.reason?' • '+esc(r.reason):'')+'</small></div><div class="qlog-v2-activity-time"><b>'+esc(status)+'</b><small>'+esc(r.timeout||r.timein||'')+'</small></div></div>';}).join(''):'<div class="qlog-v2-empty">No activity recorded for '+esc(unit())+' today.</div>';
 var att=[];if(overdue)att.push([overdue+' overdue item'+(overdue===1?'':'s'),'Review active borrowing records.','warn']);
 if(eq){var inc=(window.equipment||[]).filter(function(e){return S.recordBelongs(e,'EQUIPMENT_INVENTORY')&&!e.icsAligned;}).length;if(inc)att.push([inc+' incomplete equipment ICS record'+(inc===1?'':'s'),'Complete the required COA custody fields.','']);}
 if(lib){var binc=(window.books||[]).filter(function(b){return !b.icsAligned;}).length;if(binc)att.push([binc+' incomplete library ICS record'+(binc===1?'':'s'),'Complete the required COA book fields.','']);}
 var legacy=S?S.legacyCounts().total:0;if(legacy)att.push([legacy+' legacy unscoped record'+(legacy===1?'':'s'),'Assign these from Settings → Data & Scope before using historical unit reports.','']);
 var ae=qs('#qlogV2Attention');if(ae)ae.innerHTML=att.length?att.map(function(x){return '<div class="qlog-v2-attention '+x[2]+'"><span class="mark">'+(x[2]?'!':'i')+'</span><div><b>'+esc(x[0])+'</b><small>'+esc(x[1])+'</small></div></div>';}).join(''):'<div class="qlog-v2-allgood"><span>✓</span><div><b>Everything looks good</b><small>No overdue or incomplete records detected for this workspace.</small></div></div>';
}

function cleanNav(){
 var map={live:['◉','Live Monitor'],inventory:['◎','Clients'],visitors:['◇','Visitors'],bookinv:['▤','Library'],borrow:['',''],reservationsTab:['',''],equipment:['▦','Equipment'],reports:['▥','Reports'],settings:['⚙','Settings']};
 Object.keys(map).forEach(function(id){var b=navButtonFor(id);if(!b)return;if(id==='borrow'||id==='reservationsTab'){b.classList.add('qlog-v2-hidden-nav');return;}b.innerHTML='<span class="qlog-nav-glyph">'+map[id][0]+'</span><span>'+map[id][1]+'</span>';});
 applyCapabilities();
}
function applyCapabilities(){
 if(!S)return;var c=S.capabilities(),lib=navButtonFor('bookinv'),eq=navButtonFor('equipment');if(lib)lib.style.display=c.library?'flex':'none';if(eq)eq.style.display=c.equipment?'flex':'none';
 var vt=navButtonFor('visitors');if(vt)vt.style.display='flex';
 qsa('.qlog-nav-section').forEach(function(sec){var n=sec.nextElementSibling,any=false;while(n&&!n.classList.contains('qlog-nav-section')){if(n.tagName==='BUTTON'&&getComputedStyle(n).display!=='none'&&!n.classList.contains('qlog-v2-hidden-nav'))any=true;n=n.nextElementSibling;}sec.style.display=any?'block':'none';});
}

function installModuleBars(){
 installLibraryBar('bookinv','inventory');installLibraryBar('borrow','circulation');installLibraryBar('reservationsTab','reservations');installEquipmentBar();
}
function installLibraryBar(id,active){var tab=qs('#'+id);if(!tab||qs('.qlog-v2-modulebar',tab))return;var ph=qs('.qlog-pagehead',tab),bar=document.createElement('div');bar.className='qlog-v2-modulebar';bar.innerHTML='<button data-key="inventory">Inventory</button><button data-key="circulation">Circulation</button><button data-key="reservations">Reservations</button><button data-key="history">History</button>';if(ph)ph.insertAdjacentElement('afterend',bar);bar.querySelector('[data-key="'+active+'"]').classList.add('active');bar.onclick=function(e){var b=e.target.closest('button');if(!b)return;var k=b.dataset.key;if(k==='inventory')go('bookinv');else if(k==='circulation')go('borrow');else if(k==='reservations')go('reservationsTab');else{go('borrow');setTimeout(function(){var f=qs('#borrowFilterStatus');if(f)f.value='ALL';var h=qs('#borrowFilterSearch');if(h)h.focus();},50);}};}
function installEquipmentBar(){var tab=qs('#equipment');if(!tab||qs('#qlogEqWorkspaceBar'))return;var ph=qs('.qlog-pagehead',tab),bar=document.createElement('div');bar.id='qlogEqWorkspaceBar';bar.className='qlog-v2-modulebar';bar.innerHTML='<button class="active" data-eq="overview">Overview</button><button data-eq="borrow">Borrow / Return</button><button data-eq="active">Active Releases</button><button data-eq="history">History</button><button data-eq="registry">ICS Registry</button>';if(ph)ph.insertAdjacentElement('afterend',bar);bar.onclick=function(e){var b=e.target.closest('button');if(!b)return;if(b.dataset.eq==='registry'){if(window.openEquipRegistryModal)openEquipRegistryModal();return;}setEquipmentView(b.dataset.eq);};setEquipmentView('overview');}
function setEquipmentView(key){var tab=qs('#equipment'),cards=tab?qsa(':scope > .card',tab):[];cards.forEach(function(c,i){var show=(key==='overview'&&i===0)||(key==='borrow'&&(i===1||i===2))||(key==='active'&&i===3)||(key==='history'&&i===4);c.classList.toggle('qlog-v2-section-hidden',!show);});qsa('#qlogEqWorkspaceBar button').forEach(function(b){b.classList.toggle('active',b.dataset.eq===key);});}

function installActionBars(){
 var inv=qs('#inventory');if(inv&&!qs('#qlogClientActions')){var ph=qs('.qlog-pagehead',inv),bar=document.createElement('div');bar.id='qlogClientActions';bar.className='qlog-v2-actionbar';bar.innerHTML='<div class="qlog-v2-actioncopy"><b>Client Registry</b><span>Search first. Open secondary tools only when needed.</span></div><div><button class="qlog-v2-secondary" data-open="import">Import</button><button class="qlog-v2-secondary" onclick="downloadClientInventoryTemplate()">Template</button><button class="qlog-v2-primary" onclick="exportClientInventoryHTML()">Export QR Registry</button></div>';if(ph)ph.insertAdjacentElement('afterend',bar);var bi=bar.querySelector('[data-open="import"]');bi.onclick=function(){toggleDisclosure(inv,/Import Clients/i);};}
 var lib=qs('#bookinv');if(lib&&!qs('#qlogLibraryActions')){var ph2=qs('.qlog-v2-modulebar',lib)||qs('.qlog-pagehead',lib),b2=document.createElement('div');b2.id='qlogLibraryActions';b2.className='qlog-v2-actionbar';b2.innerHTML='<div class="qlog-v2-actioncopy"><b>Library Inventory</b><span>COA ICS semi-expendable books, organized for daily use.</span></div><div><button class="qlog-v2-secondary" data-l="import">Import / Export</button><button class="qlog-v2-primary" data-l="add">+ Add Book</button></div>';ph2.insertAdjacentElement('afterend',b2);b2.querySelector('[data-l="import"]').onclick=function(){toggleDisclosure(lib,/Bulk Upload/i);};b2.querySelector('[data-l="add"]').onclick=function(){toggleDisclosure(lib,/Add \/ Complete/i,true);};}
}
function toggleDisclosure(tab,re,force){var h=qsa('.qlog-disclosure-title',tab).find(function(x){return re.test(x.textContent||'');});if(!h)return;if(force&&h.classList.contains('qlog-closed'))h.click();else if(!force)h.click();setTimeout(function(){h.scrollIntoView({behavior:'smooth',block:'start'});},30);}

function rebuildReportCatalog(){
 var cat=qs('#qlogReportCatalog'),sel=qs('#reportType');if(!cat||!sel)return;var types=S?S.reportTypes():Object.keys(REPORT_META);var current=types.indexOf(sel.value)>=0?sel.value:types[0];sel.value=current;cat.innerHTML='<div class="qlog-v2-report-intro"><span class="qlog-v2-label">REPORT LIBRARY</span><h3>'+esc(unit())+'</h3><p>Only reports authorized for this assigned unit are available. Report data is filtered again at record level before preview/export.</p></div><div class="qlog-v2-report-grid">'+types.map(function(t){var m=REPORT_META[t]||['Report','QLog Report',''];return '<button class="qlog-v2-report-card" data-report="'+t+'"><span>'+esc(m[0])+'</span><b>'+esc(m[1])+'</b><small>'+esc(m[2])+'</small><em>Open report →</em></button>';}).join('')+'</div>';
 cat.querySelectorAll('[data-report]').forEach(function(b){b.onclick=function(){sel.value=b.dataset.report;if(window.updateReportControls)updateReportControls();if(window.renderReports)renderReports();paintReportCards();qs('.report-hub-controls').scrollIntoView({behavior:'smooth',block:'nearest'});};});
 var typeWrap=sel.closest('div');if(typeWrap)typeWrap.classList.add('qlog-v2-report-type-hidden');paintReportCards();
 var note=qs('#reportContextNote');if(note)note.dataset.unit=unit();
}
function paintReportCards(){var v=(qs('#reportType')||{}).value;qsa('.qlog-v2-report-card').forEach(function(b){b.classList.toggle('active',b.dataset.report===v);});}
function protectReportSelection(){var sel=qs('#reportType');if(!sel||!S)return;if(S.reportTypes().indexOf(sel.value)<0){sel.value=S.reportTypes()[0]||'ATTENDANCE';if(window.updateReportControls)updateReportControls();if(window.renderReports)renderReports();}}

function installDataScopeSettings(){
 var menu=qs('.qlog-settings-menu'),panels=menu&&menu.nextElementSibling;if(!menu||!panels||qs('[data-panel="dataScope"]',menu))return;
 var b=document.createElement('button');b.dataset.panel='dataScope';b.textContent='Data & Scope';menu.insertBefore(b,menu.querySelector('[data-panel="about"]'));
 var sec=document.createElement('section');sec.className='qlog-settings-panel';sec.dataset.panel='dataScope';sec.innerHTML='<div class="qlog-settings-section"><h3>Facility Access</h3><p>QLog limits normal users to the active assigned unit. These permissions also control navigation, report types and report records.</p><div id="qlogV2CapabilitySummary" class="qlog-v2-capability"></div></div><div class="qlog-settings-section"><h3>Legacy Historical Records</h3><p>Older QLog records created before facility ownership was introduced remain unassigned. They are intentionally excluded from unit reports until you explicitly assign them.</p><div id="qlogV2LegacySummary" class="qlog-v2-legacy"></div><button id="qlogV2AssignLegacy" class="qlog-v2-secondary">Assign all unscoped logs to current unit</button></div><div class="qlog-settings-section qlog-v2-danger-zone"><h3>Data Management</h3><p>System-wide destructive actions belong here—not inside Reports.</p><button id="qlogV2ResetDatabase">Reset Database</button></div>';
 panels.insertBefore(sec,panels.querySelector('[data-panel="about"]'));
 b.onclick=function(){qsa('.qlog-settings-menu button').forEach(function(x){x.classList.toggle('active',x===b);});qsa('.qlog-settings-panel').forEach(function(x){x.classList.toggle('active',x===sec);});renderScopeSettings();};
 qs('#qlogV2AssignLegacy').onclick=function(){if(!S)return;var c=S.legacyCounts();if(!c.total){toast('No unscoped legacy records were found.','green');return;}if(!confirm('Assign '+c.total+' legacy attendance/visitor/audit records to '+unit()+'? Use this only when those historical records truly belong to this unit.'))return;var n=S.assignLegacyToCurrent();if(window.renderLogs)renderLogs();renderScopeSettings();renderOverview();toast('Assigned '+n+' legacy records to '+unit()+'.','green');};
 qs('#qlogV2ResetDatabase').onclick=function(){if(window.resetDatabase)resetDatabase();};renderScopeSettings();
}
function renderScopeSettings(){if(!S)return;var c=S.capabilities(),cap=qs('#qlogV2CapabilitySummary');if(cap)cap.innerHTML='<div><span>Active Unit</span><b>'+esc(unit())+'</b></div><div><span>Attendance</span><b>'+yes(c.attendance)+'</b></div><div><span>Visitors</span><b>'+yes(c.visitors)+'</b></div><div><span>Library</span><b>'+yes(c.library)+'</b></div><div><span>Equipment</span><b>'+yes(c.equipment)+'</b></div><div><span>Cross-unit reports</span><b>'+yes(c.allUnits)+'</b></div>';var l=S.legacyCounts(),el=qs('#qlogV2LegacySummary');if(el)el.innerHTML='<div><strong>'+l.total+'</strong><span>Total unscoped</span></div><div><strong>'+l.attendance+'</strong><span>Attendance</span></div><div><strong>'+l.visitors+'</strong><span>Visitors</span></div><div><strong>'+l.audit+'</strong><span>Audit</span></div>';}
function yes(v){return v?'Enabled':'Not available';}

function labelTables(){qsa('table').forEach(function(t){var hs=qsa('thead th',t).map(function(x){return x.textContent.trim();});qsa('tbody tr',t).forEach(function(r){qsa('td',r).forEach(function(td,i){if(!td.dataset.label)td.dataset.label=hs[i]||'';});});});}
function observeTables(){var ob=new MutationObserver(function(m){var need=m.some(function(x){return x.addedNodes&&x.addedNodes.length;});if(need)requestAnimationFrame(labelTables);});qsa('tbody').forEach(function(tb){ob.observe(tb,{childList:true,subtree:false});});labelTables();}
function protectCommandPalette(){var list=qs('#qlogCommandList');if(!list||!S)return;var ob=new MutationObserver(function(){var c=S.capabilities();qsa('.qlog-command-item',list).forEach(function(i){var txt=i.textContent.toLowerCase();if((!c.library&&(txt.indexOf('book')>=0||txt.indexOf('library')>=0))||(!c.equipment&&txt.indexOf('equipment')>=0))i.remove();});});ob.observe(list,{childList:true,subtree:true});}

function restyleLegacyControls(){
 qsa('button').forEach(function(b){if(b.closest('.qlog-settings-menu,.qlog-v2-modulebar,.qlog-mobile-nav,.nav'))return;var txt=(b.textContent||'').trim();if(/delete|remove|reset|clear database/i.test(txt))b.classList.add('qlog-btn-danger');else if(/save|add|record borrowing|confirm|execute bulk/i.test(txt))b.classList.add('qlog-btn-primary');else b.classList.add('qlog-btn-neutral');});
 qsa('.card').forEach(function(c){c.classList.add('qlog-v2-surface');});
}
function paintChrome(){var id=activeId(),title=qs('#qlogPageTitle'),sub=qs('#qlogPageSubtitle');var meta={qlogOverview:['Overview','Operational summary for '+unit()+'.'],live:['Live Monitor','Real-time scanner and current-unit activity.'],inventory:['Client Registry','Search and manage registered QLog clients.'],visitors:['Visitor Check-In','Guided visitor identity, purpose and face verification.'],bookinv:['Library','COA ICS book inventory and library operations.'],borrow:['Library Circulation','Borrow, return and review circulation history.'],reservationsTab:['Library Reservations','Manage the waiting queue.'],equipment:['Equipment','COA ICS registry and equipment custody operations.'],reports:['Reports','Official A4 reports scoped to '+unit()+'.'],settings:['Settings','School identity, facility scope and system preferences.']}[id];if(meta){if(title)title.textContent=meta[0];if(sub)sub.textContent=meta[1];}qsa('.nav button').forEach(function(b){b.classList.toggle('active-nav',(id==='qlogOverview'&&b.id==='qlogOverviewNav')||((b.getAttribute('onclick')||'').indexOf("'"+id+"'")>=0));});}
function observeActive(){var tabs=qsa('.tab'),ob=new MutationObserver(function(){paintChrome();if(activeId()==='qlogOverview')renderOverview();if(activeId()==='reports'){rebuildReportCatalog();protectReportSelection();}labelTables();});tabs.forEach(function(t){ob.observe(t,{attributes:true,attributeFilter:['class']});});}
function makeStartupDefault(){var over=qs('#startupOverlay');if(over&&getComputedStyle(over).display!=='none')return;var live=qs('#live');if(live&&live.classList.contains('active')){live.classList.remove('active');qs('#qlogOverview').classList.add('active');paintChrome();renderOverview();}}
function refreshAll(){applyCapabilities();rebuildReportCatalog();protectReportSelection();renderOverview();paintChrome();renderScopeSettings();labelTables();}
function boot(){
 document.body.classList.add('qlog-master-design-v2');installOverview();cleanNav();installModuleBars();installActionBars();rebuildReportCatalog();installDataScopeSettings();protectCommandPalette();observeTables();observeActive();restyleLegacyControls();setTimeout(makeStartupDefault,40);setTimeout(refreshAll,120);
 if(window.finalizeStartup&&!window.finalizeStartup.__qlogV2){var old=window.finalizeStartup,fn=function(){var r=old.apply(this,arguments);setTimeout(function(){refreshAll();makeStartupDefault();},30);return r;};fn.__qlogV2=true;window.finalizeStartup=fn;}
 setInterval(function(){if(activeId()==='qlogOverview')renderOverview();},12000);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
