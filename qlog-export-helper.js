/* =====================================================================
   QLog Pro - Premium Offline Export / Print Helper
   ---------------------------------------------------------------------
   Pure client-side helper. Requires the locally bundled SheetJS + JSZip.
   - A4 print-ready HTML with automatic portrait / landscape selection
   - Premium XLSX report layout with print setup, margins and table styling
   - Workbook styling hook used by import templates without moving headers
   - No CDN / network dependency
   ===================================================================== */
(function(global){
  'use strict';

  var BRAND = 'QLog Pro';
  var CREDIT = 'Powered by: Magallanes NHS Team Bitaug C.I. Projects';
  var VERSION = '1.1.0';

  function esc(v){
    return String(v === undefined || v === null ? '' : v)
      .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
      .replace(/"/g,'&quot;').replace(/'/g,'&#39;');
  }

  function colLabel(n){
    var s='';
    while(n>=0){ s=String.fromCharCode((n%26)+65)+s; n=Math.floor(n/26)-1; }
    return s;
  }

  function normalizeColumns(columns, rows){
    if(columns && columns.length){
      return columns.map(function(c){
        if(typeof c === 'string') return {key:c,label:c,width:18,align:'left'};
        return {
          key:c.key,
          label:c.label || c.key || '',
          width:Number(c.width)||18,
          align:c.align || (c.type === 'number' || c.type === 'money' ? 'right' : 'left'),
          type:c.type || 'text'
        };
      });
    }
    var first=(rows&&rows[0])||{};
    return Object.keys(first).map(function(k){return {key:k,label:k,width:18,align:'left',type:'text'};});
  }

  function autoOrientation(columns, requested){
    if(requested && requested !== 'auto') return requested;
    var cols=normalizeColumns(columns,[]);
    var weight=cols.reduce(function(sum,c){return sum + Math.min(40,Math.max(8,Number(c.width)||18));},0);
    return (cols.length >= 8 || weight > 125) ? 'landscape' : 'portrait';
  }

  function brandingMeta(){
    var b={schoolName:'',schoolId:'',address:'',district:'',division:'',region:'',contact:'',email:'',schoolYear:'',logo:'',preparedBy:'',preparedPosition:'',checkedBy:'',checkedPosition:'',approvedBy:'',approvedPosition:''};
    try { Object.assign(b, JSON.parse(global.localStorage.getItem('qlogSchoolBranding') || '{}')); } catch(e) {}
    return b;
  }

  function sessionMeta(){
    var s=global.currentSession || {};
    var b=brandingMeta();
    return {
      facility:s.facility || '',
      preparedBy:b.preparedBy || s.inCharge || 'Designated Personnel',
      designation:b.preparedPosition || s.designation || 'Facility In-Charge',
      checkedBy:b.checkedBy || '',
      checkedPosition:b.checkedPosition || '',
      approvedBy:b.approvedBy || '',
      approvedPosition:b.approvedPosition || '',
      branding:b
    };
  }

  function displayValue(v, type){
    if(v === undefined || v === null) return '';
    if(type === 'money'){
      var n=Number(v)||0;
      return '₱' + n.toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2});
    }
    return String(v);
  }

  function printTable(opts){
    opts=opts||{};
    var rows=opts.rows||[];
    var cols=normalizeColumns(opts.columns,rows);
    var orientation=autoOrientation(cols,opts.orientation||'auto');
    var meta=sessionMeta();
    var title=opts.title||'QLog Report';
    var subtitle=opts.subtitle||'';
    var generated=opts.generatedLabel || new Date().toLocaleString();
    var facility=opts.facility !== undefined ? opts.facility : meta.facility;
    var preparedBy=opts.preparedBy || meta.preparedBy;
    var designation=opts.designation || meta.designation;
    var branding=meta.branding || {};
    var summary=opts.summary||[];
    var w=global.open('','','width=1280,height=900');
    if(!w) throw new Error('Print window was blocked by the browser.');

    var css='@page{size:A4 '+orientation+';margin:10mm 9mm 12mm 9mm;}'+
      '*{box-sizing:border-box}body{font-family:Arial,"Segoe UI",sans-serif;color:#0f172a;margin:0;background:#fff;font-size:'+(orientation==='landscape'?'9px':'10px')+';}'+
      '.brand{border-bottom:3px solid #1d4ed8;padding-bottom:8px;margin-bottom:8px;display:flex;justify-content:space-between;gap:16px;align-items:center}.brand-left{display:flex;align-items:center;gap:10px;min-width:0}.brand img{width:46px;height:46px;object-fit:contain}.brand h1{font-size:17px;margin:0;color:#0f172a;letter-spacing:.2px}.brand .school-sub{font-size:8.5px;color:#64748b;margin-top:2px}.brand .sys{font-size:9px;color:#475569;text-align:right;white-space:nowrap}'+
      'h2{font-size:15px;margin:6px 0 2px;text-align:center;color:#1e3a8a}h3{font-size:10px;margin:0 0 10px;text-align:center;color:#64748b;font-weight:600}'+
      '.meta{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:4px 8px;margin:8px 0 10px;padding:7px 9px;background:#f8fafc;border:1px solid #cbd5e1;border-radius:6px}.meta div{min-width:0}.meta b{color:#334155}.summary{display:flex;gap:6px;flex-wrap:wrap;margin:6px 0 10px}.pill{border:1px solid #bfdbfe;background:#eff6ff;color:#1e3a8a;border-radius:999px;padding:4px 8px;font-weight:700}'+
      'table{width:100%;border-collapse:collapse;table-layout:auto}thead{display:table-header-group}tr{page-break-inside:avoid}th{background:#1e3a8a;color:#fff;border:1px solid #1e40af;padding:5px 4px;text-align:center;font-weight:700}td{border:1px solid #cbd5e1;padding:4px 4px;vertical-align:top;word-break:break-word}tbody tr:nth-child(even) td{background:#f8fafc}.num{text-align:right}.center{text-align:center}.empty{text-align:center;color:#64748b;padding:20px}'+
      '.signatures{display:flex;justify-content:space-between;gap:22px;margin-top:30px;page-break-inside:avoid}.sig{text-align:center;min-width:180px;flex:1;border-top:1px solid #334155;padding-top:5px}.sig b{font-size:10px}.sig span{font-size:9px;color:#475569}.footer{margin-top:12px;color:#64748b;font-size:8px;text-align:center}'+
      '@media screen{body{padding:18px;background:#e2e8f0}.sheet{background:#fff;max-width:'+(orientation==='landscape'?'1120px':'800px')+';margin:auto;padding:24px;box-shadow:0 8px 30px rgba(15,23,42,.15)}}@media print{.sheet{padding:0}.no-print{display:none!important}}';

    var html='<!doctype html><html><head><meta charset="utf-8"><title>'+esc(title)+'</title><style>'+css+'</style></head><body><div class="sheet">';
    var schoolTitle=branding.schoolName || BRAND;
    var schoolSub=[branding.address,branding.schoolId?('School ID: '+branding.schoolId):'',branding.schoolYear?('SY '+branding.schoolYear):''].filter(Boolean).join(' • ');
    html+='<div class="brand"><div class="brand-left">'+(branding.logo?'<img src="'+esc(branding.logo)+'" alt="School logo">':'')+'<div><h1>'+esc(schoolTitle)+'</h1>'+(schoolSub?'<div class="school-sub">'+esc(schoolSub)+'</div>':'')+'</div></div><div class="sys"><b>'+esc(BRAND)+'</b><br>Official System-Generated Report<br>A4 '+esc(orientation.charAt(0).toUpperCase()+orientation.slice(1))+'</div></div>';
    html+='<h2>'+esc(title)+'</h2>'+(subtitle?'<h3>'+esc(subtitle)+'</h3>':'');
    html+='<div class="meta"><div><b>Facility/Unit:</b> '+esc(facility||'All / Not specified')+'</div><div><b>Prepared by:</b> '+esc(preparedBy)+'</div><div><b>Designation:</b> '+esc(designation)+'</div><div><b>Generated:</b> '+esc(generated)+'</div></div>';
    if(summary.length){ html+='<div class="summary">'+summary.map(function(x){return '<span class="pill">'+esc(x.label)+': '+esc(x.value)+'</span>';}).join('')+'</div>'; }
    html+='<table><thead><tr>'+cols.map(function(c){return '<th>'+esc(c.label)+'</th>';}).join('')+'</tr></thead><tbody>';
    if(!rows.length) html+='<tr><td class="empty" colspan="'+Math.max(1,cols.length)+'">No records found for the selected report/filter.</td></tr>';
    rows.forEach(function(r){
      html+='<tr>'+cols.map(function(c){
        var value=Array.isArray(r)?r[cols.indexOf(c)]:r[c.key];
        var cls=(c.align==='center'?'center':((c.align==='right'||c.type==='number'||c.type==='money')?'num':''));
        return '<td class="'+cls+'">'+esc(displayValue(value,c.type))+'</td>';
      }).join('')+'</tr>';
    });
    html+='</tbody></table>';
    if(opts.signature !== false){
      var sigs=[{n:preparedBy,p:designation},{n:meta.checkedBy,p:meta.checkedPosition},{n:meta.approvedBy,p:meta.approvedPosition}].filter(function(x){return x.n;});
      html+='<div class="signatures">'+sigs.map(function(x){return '<div class="sig"><b>'+esc(String(x.n).toUpperCase())+'</b><br><span>'+esc(x.p||'')+'</span></div>';}).join('')+'</div>';
    }
    html+='<div class="footer">'+esc(BRAND)+' • '+esc(CREDIT)+' • Offline-ready PWA</div></div></body></html>';
    w.document.open(); w.document.write(html); w.document.close(); w.focus();
    setTimeout(function(){w.print();w.close();},350);
    return orientation;
  }

  function stylesXml(){
    return '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'+
      '<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">'+
      '<numFmts count="1"><numFmt numFmtId="164" formatCode="₱#,##0.00;[Red]-₱#,##0.00"/></numFmts>'+
      '<fonts count="6">'+
        '<font><sz val="10"/><name val="Arial"/><family val="2"/></font>'+
        '<font><b/><sz val="16"/><color rgb="FFFFFFFF"/><name val="Arial"/></font>'+
        '<font><b/><sz val="12"/><color rgb="FF1E3A8A"/><name val="Arial"/></font>'+
        '<font><i/><sz val="9"/><color rgb="FF64748B"/><name val="Arial"/></font>'+
        '<font><b/><sz val="10"/><color rgb="FFFFFFFF"/><name val="Arial"/></font>'+
        '<font><b/><sz val="10"/><color rgb="FF0F172A"/><name val="Arial"/></font>'+
      '</fonts>'+
      '<fills count="5"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill><fill><patternFill patternType="solid"><fgColor rgb="FF1E3A8A"/><bgColor indexed="64"/></patternFill></fill><fill><patternFill patternType="solid"><fgColor rgb="FFEFF6FF"/><bgColor indexed="64"/></patternFill></fill><fill><patternFill patternType="solid"><fgColor rgb="FFF8FAFC"/><bgColor indexed="64"/></patternFill></fill></fills>'+
      '<borders count="2"><border><left/><right/><top/><bottom/><diagonal/></border><border><left style="thin"><color rgb="FFCBD5E1"/></left><right style="thin"><color rgb="FFCBD5E1"/></right><top style="thin"><color rgb="FFCBD5E1"/></top><bottom style="thin"><color rgb="FFCBD5E1"/></bottom><diagonal/></border></borders>'+
      '<cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>'+
      '<cellXfs count="11">'+
        '<xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/>'+
        '<xf numFmtId="0" fontId="1" fillId="2" borderId="0" xfId="0" applyFont="1" applyFill="1" applyAlignment="1"><alignment horizontal="center" vertical="center"/></xf>'+
        '<xf numFmtId="0" fontId="2" fillId="3" borderId="0" xfId="0" applyFont="1" applyFill="1" applyAlignment="1"><alignment horizontal="center" vertical="center"/></xf>'+
        '<xf numFmtId="0" fontId="3" fillId="0" borderId="0" xfId="0" applyFont="1" applyAlignment="1"><alignment horizontal="center" vertical="center"/></xf>'+
        '<xf numFmtId="0" fontId="4" fillId="2" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="center" vertical="center" wrapText="1"/></xf>'+
        '<xf numFmtId="0" fontId="0" fillId="0" borderId="1" xfId="0" applyBorder="1" applyAlignment="1"><alignment vertical="top" wrapText="1"/></xf>'+
        '<xf numFmtId="0" fontId="0" fillId="4" borderId="1" xfId="0" applyFill="1" applyBorder="1" applyAlignment="1"><alignment vertical="top" wrapText="1"/></xf>'+
        '<xf numFmtId="0" fontId="0" fillId="0" borderId="1" xfId="0" applyBorder="1" applyAlignment="1"><alignment horizontal="center" vertical="top" wrapText="1"/></xf>'+
        '<xf numFmtId="164" fontId="0" fillId="0" borderId="1" xfId="0" applyNumberFormat="1" applyBorder="1" applyAlignment="1"><alignment horizontal="right" vertical="top"/></xf>'+
        '<xf numFmtId="0" fontId="5" fillId="3" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment vertical="top" wrapText="1"/></xf>'+
        '<xf numFmtId="0" fontId="5" fillId="0" borderId="0" xfId="0" applyFont="1" applyAlignment="1"><alignment horizontal="center"/></xf>'+
      '</cellXfs><cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles><dxfs count="0"/><tableStyles count="0" defaultTableStyle="TableStyleMedium2" defaultPivotStyle="PivotStyleLight16"/></styleSheet>';
  }

  function setStyleOnRow(xml,rowNum,style,byColumn){
    var rowRe=new RegExp('(<row\\b[^>]*\\br="'+rowNum+'"[^>]*>)([\\s\\S]*?)(</row>)');
    return xml.replace(rowRe,function(all,start,body,end){
      body=body.replace(/<c\b([^>]*)>/g,function(tag,attrs){
        var refMatch=attrs.match(/\br="([A-Z]+)\d+"/);
        var st=style;
        if(refMatch && byColumn && byColumn[refMatch[1]] !== undefined) st=byColumn[refMatch[1]];
        if(/\bs="\d+"/.test(attrs)) attrs=attrs.replace(/\bs="\d+"/,' s="'+st+'"');
        else attrs+=' s="'+st+'"';
        return '<c'+attrs+'>';
      });
      return start+body+end;
    });
  }

  function addOrReplaceWorksheetPrintXml(xml,orientation){
    xml=xml.replace(/<printOptions\b[^>]*\/>/g,'').replace(/<pageMargins\b[^>]*\/>/g,'').replace(/<pageSetup\b[^>]*\/>/g,'').replace(/<headerFooter>[\s\S]*?<\/headerFooter>/g,'');
    var ins='<printOptions horizontalCentered="1"/><pageMargins left="0.35" right="0.35" top="0.55" bottom="0.55" header="0.2" footer="0.25"/><pageSetup paperSize="9" orientation="'+orientation+'" fitToWidth="1" fitToHeight="0"/><headerFooter><oddFooter>&amp;CPage &amp;P of &amp;N</oddFooter></headerFooter>';
    var anchors=['<rowBreaks','<colBreaks','<customProperties','<cellWatches','<ignoredErrors','<smartTags','<drawing','<legacyDrawing','<picture','<oleObjects','<controls','<webPublishItems','<tableParts','<extLst','</worksheet>'];
    var pos=-1;
    anchors.forEach(function(a){var i=xml.indexOf(a);if(i!==-1&&(pos===-1||i<pos))pos=i;});
    if(pos<0) return xml;
    return xml.slice(0,pos)+ins+xml.slice(pos);
  }

  function sheetConfigFor(name,ws,opts){
    opts=opts||{};
    var explicit=(opts.sheetConfigs&&opts.sheetConfigs[name])||{};
    var ref=(ws&&ws['!ref'])||'A1:A1';
    var range=(global.XLSX&&global.XLSX.utils)?global.XLSX.utils.decode_range(ref):{s:{c:0,r:0},e:{c:0,r:0}};
    var count=range.e.c-range.s.c+1;
    var widths=(ws&&ws['!cols'])||[];
    var cols=[]; for(var i=0;i<count;i++) cols.push({width:(widths[i]&&widths[i].wch)||18});
    var kind=explicit.kind || (/^__QLogValidation/.test(name)?'validation':(/instructions/i.test(name)?'instructions':(opts.defaultMode||'template')));
    return {
      kind:kind,
      orientation:autoOrientation(cols,explicit.orientation||opts.orientation||'auto'),
      titleRow:explicit.titleRow,
      subtitleRow:explicit.subtitleRow,
      metaRow:explicit.metaRow,
      headerRow:explicit.headerRow || (kind==='report'?6:1),
      dataStartRow:explicit.dataStartRow || (kind==='report'?7:2),
      dataEndRow:explicit.dataEndRow || (range.e.r+1),
      columns:explicit.columns||[],
      range:range
    };
  }

  async function styleWorkbookZip(zip,wb,opts){
    if(!zip || !wb) return zip;
    zip.file('xl/styles.xml',stylesXml());
    for(var i=0;i<wb.SheetNames.length;i++){
      var name=wb.SheetNames[i], ws=wb.Sheets[name];
      var cfg=sheetConfigFor(name,ws,opts||{});
      if(cfg.kind==='validation') continue;
      var path='xl/worksheets/sheet'+(i+1)+'.xml';
      var entry=zip.file(path); if(!entry) continue;
      var xml=await entry.async('string');
      xml=addOrReplaceWorksheetPrintXml(xml,cfg.orientation);
      var end=cfg.range.e.r+1;
      if(cfg.kind==='report'){
        if(cfg.titleRow) xml=setStyleOnRow(xml,cfg.titleRow,1);
        if(cfg.subtitleRow) xml=setStyleOnRow(xml,cfg.subtitleRow,2);
        if(cfg.metaRow) xml=setStyleOnRow(xml,cfg.metaRow,3);
        xml=setStyleOnRow(xml,cfg.headerRow,4);
        var byCol={};
        (cfg.columns||[]).forEach(function(c,idx){
          if(c.type==='money') byCol[colLabel(idx)]=8;
          else if(c.align==='center') byCol[colLabel(idx)]=7;
        });
        for(var r=cfg.dataStartRow;r<=Math.min(cfg.dataEndRow,end);r++) xml=setStyleOnRow(xml,r,(r%2===0?6:5),byCol);
      } else if(cfg.kind==='instructions'){
        xml=setStyleOnRow(xml,1,1);
        for(var ir=2;ir<=end;ir++) xml=setStyleOnRow(xml,ir,(ir%2===0?6:5),{'A':9});
      } else {
        xml=setStyleOnRow(xml,cfg.headerRow,4);
        for(var tr=cfg.dataStartRow;tr<=end;tr++) xml=setStyleOnRow(xml,tr,(tr%2===0?6:5));
      }
      zip.file(path,xml);
    }
    return zip;
  }

  function saveBlob(blob,filename){
    var a=document.createElement('a');
    var href=URL.createObjectURL(blob); a.href=href; a.download=filename;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function(){URL.revokeObjectURL(href);},1800);
  }

  async function downloadWorkbook(wb,filename,opts){
    if(!global.XLSX) throw new Error('Local Excel library not loaded.');
    var data=global.XLSX.write(wb,{bookType:'xlsx',type:'array'});
    if(!global.JSZip){ saveBlob(new Blob([data],{type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'}),filename); return; }
    var zip=await global.JSZip.loadAsync(data);
    await styleWorkbookZip(zip,wb,opts||{});
    var blob=await zip.generateAsync({type:'blob',compression:'DEFLATE',compressionOptions:{level:6}});
    saveBlob(blob,filename);
  }

  async function downloadTableXlsx(opts){
    opts=opts||{};
    if(!global.XLSX) throw new Error('Local Excel library not loaded.');
    var rows=opts.rows||[];
    var cols=normalizeColumns(opts.columns,rows);
    var meta=sessionMeta();
    var title=opts.title||'QLog Report';
    var subtitle=opts.subtitle||'';
    var orientation=autoOrientation(cols,opts.orientation||'auto');
    var generated=new Date().toLocaleString();
    var facility=opts.facility !== undefined ? opts.facility : meta.facility;
    var preparedBy=opts.preparedBy||meta.preparedBy;
    var designation=opts.designation||meta.designation;
    var branding=meta.branding||{};
    var aoa=[];
    aoa.push([(branding.schoolName||BRAND) + (branding.schoolName ? '  |  '+BRAND : '')]);
    aoa.push([title]);
    aoa.push([[subtitle || 'Official system-generated report', branding.schoolYear?('SY '+branding.schoolYear):'', branding.address||''].filter(Boolean).join(' • ')]);
    aoa.push([['Facility/Unit: '+(facility||'All / Not specified'),'Prepared by: '+preparedBy,'Generated: '+generated].join('   |   ')]);
    aoa.push([]);
    aoa.push(cols.map(function(c){return c.label;}));
    rows.forEach(function(r){
      aoa.push(cols.map(function(c){
        var v=Array.isArray(r)?r[cols.indexOf(c)]:r[c.key];
        if(c.type==='money') return Number(v)||0;
        if(c.type==='number') return (v===''||v===null||v===undefined)?'':Number(v);
        return v===undefined||v===null?'':v;
      }));
    });
    aoa.push([]); aoa.push([]);
    aoa.push(['','','Prepared By:']);
    aoa.push(['','',String(preparedBy).toUpperCase()]);
    aoa.push(['','',designation]);
    var ws=global.XLSX.utils.aoa_to_sheet(aoa);
    var last=Math.max(0,cols.length-1);
    ws['!merges']=[
      {s:{r:0,c:0},e:{r:0,c:last}},
      {s:{r:1,c:0},e:{r:1,c:last}},
      {s:{r:2,c:0},e:{r:2,c:last}},
      {s:{r:3,c:0},e:{r:3,c:last}}
    ];
    ws['!cols']=cols.map(function(c){return {wch:Math.max(9,Math.min(42,Number(c.width)||18))};});
    ws['!autofilter']={ref:'A6:'+colLabel(last)+'6'};
    ws['!rows']=[{hpt:25},{hpt:22},{hpt:18},{hpt:18},{hpt:8},{hpt:28}];
    var wb=global.XLSX.utils.book_new();
    var sheetName=(opts.sheetName||'Report').slice(0,31);
    global.XLSX.utils.book_append_sheet(wb,ws,sheetName);
    await downloadWorkbook(wb,opts.filename||'QLog_Report.xlsx',{
      sheetConfigs:(function(){var o={};o[sheetName]={kind:'report',orientation:orientation,titleRow:1,subtitleRow:2,metaRow:4,headerRow:6,dataStartRow:7,dataEndRow:6+rows.length,columns:cols};return o;})()
    });
    return orientation;
  }

  function reportHtml(opts){
    opts=opts||{};
    var rows=opts.rows||[]; var cols=normalizeColumns(opts.columns,rows);
    var orientation=autoOrientation(cols,opts.orientation||'auto');
    var meta=sessionMeta();
    var branding=meta.branding||{};
    var style='@page{size:A4 '+orientation+';margin:10mm;}*{box-sizing:border-box}body{font-family:Arial,sans-serif;color:#0f172a;font-size:'+(orientation==='landscape'?'9px':'10px')+'}.head{border-bottom:3px solid #1d4ed8;padding-bottom:7px;margin-bottom:8px}.brand{font-size:18px;font-weight:800}.title{text-align:center;color:#1e3a8a;font-size:15px;font-weight:800;margin:7px 0 2px}.sub{text-align:center;color:#64748b;margin-bottom:10px}.meta{padding:7px;background:#f8fafc;border:1px solid #cbd5e1;margin-bottom:10px}table{width:100%;border-collapse:collapse}thead{display:table-header-group}tr{page-break-inside:avoid}th{background:#1e3a8a;color:white;border:1px solid #1e40af;padding:5px}td{border:1px solid #cbd5e1;padding:4px;vertical-align:top}tbody tr:nth-child(even) td{background:#f8fafc}.sig{margin:28px 0 0 auto;width:250px;text-align:center;border-top:1px solid #334155;padding-top:5px}';
    var html='<div class="head"><div class="brand">'+esc(branding.schoolName||BRAND)+(branding.schoolName?' <span style="font-size:11px;color:#64748b">• '+esc(BRAND)+'</span>':'')+'</div>'+(branding.address?'<div style="font-size:9px;color:#64748b;margin-top:2px">'+esc(branding.address)+(branding.schoolYear?' • SY '+esc(branding.schoolYear):'')+'</div>':'')+'</div><div class="title">'+esc(opts.title||'QLog Report')+'</div><div class="sub">'+esc(opts.subtitle||'')+'</div>';
    html+='<div class="meta"><b>Facility/Unit:</b> '+esc(opts.facility!==undefined?opts.facility:(meta.facility||'All / Not specified'))+' &nbsp; • &nbsp; <b>Generated:</b> '+esc(new Date().toLocaleString())+'</div>';
    html+='<table><thead><tr>'+cols.map(function(c){return '<th>'+esc(c.label)+'</th>';}).join('')+'</tr></thead><tbody>';
    rows.forEach(function(r){html+='<tr>'+cols.map(function(c){var v=Array.isArray(r)?r[cols.indexOf(c)]:r[c.key];return '<td>'+esc(displayValue(v,c.type))+'</td>';}).join('')+'</tr>';});
    if(!rows.length) html+='<tr><td colspan="'+cols.length+'" style="text-align:center;padding:18px;color:#64748b">No records found.</td></tr>';
    html+='</tbody></table>';
    if(opts.signature!==false) html+='<div class="sig"><b>'+esc(String(meta.preparedBy).toUpperCase())+'</b><br>'+esc(meta.designation)+'</div>';
    html+='<div style="margin-top:12px;text-align:center;font-size:8px;color:#64748b">'+esc(BRAND)+' • '+esc(CREDIT)+'</div>';
    return {html:html,css:style,orientation:orientation};
  }

  global.QLogExport={
    version:VERSION,
    brand:BRAND,
    credit:CREDIT,
    brandingMeta:brandingMeta,
    esc:esc,
    autoOrientation:autoOrientation,
    printTable:printTable,
    downloadTableXlsx:downloadTableXlsx,
    downloadWorkbook:downloadWorkbook,
    styleWorkbookZip:styleWorkbookZip,
    reportHtml:reportHtml,
    sessionMeta:sessionMeta
  };
})(window);
