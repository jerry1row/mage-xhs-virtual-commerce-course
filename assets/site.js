const STORE_KEY="mageyc-virtual-commerce-course-v1";
const PHASES=[
  {title:"找准买家与机会",desc:"把大方向收窄为一个人、一个时刻、一项任务。",first:1,last:3},
  {title:"做出可成交商品",desc:"把数据、样品、商品页与规格接起来。",first:4,last:7},
  {title:"内容连接真实交付",desc:"让笔记说清价值，让买家付款后真正用上。",first:8,last:10},
  {title:"复盘并谨慎扩品",desc:"用经营漏斗修掉点，再走向相邻任务。",first:11,last:16}
];
const byId=id=>document.getElementById(id);
const esc=value=>String(value??"").replace(/[&<>"']/g,ch=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));
let persisted={};try{persisted=JSON.parse(localStorage.getItem(STORE_KEY)||"{}")}catch(_){}
const state={view:"home",chapter:Number(document.body.dataset.initialChapter)||1,tab:new URLSearchParams(location.search).get("tab")==="practice"?"practice":"visual",done:new Set(persisted.done||[]),answers:persisted.answers||{},faqCategory:"全部",faqQuery:"",faqLimit:30,metricGroup:"全部",metricQuery:"",metricOpen:""};
const save=()=>{try{localStorage.setItem(STORE_KEY,JSON.stringify({chapter:state.chapter,done:[...state.done],answers:state.answers}))}catch(_){}};
const chapter=id=>SITE_DATA.chapters.find(c=>c.id===Number(id))||SITE_DATA.chapters[0];

function updateProgress(){
  const n=state.done.size;
  byId("header-progress").textContent=n+" / 16 已学";
  byId("workshop-count").textContent=n+" / 16";
}
function updateNavigation(){
  document.querySelectorAll("[data-view]").forEach(el=>{
    if(el.matches(".desktop-nav button,.mobile-nav button"))el.classList.toggle("active",el.dataset.view===state.view);
  });
}
function renderHome(){
  byId("phase-grid").innerHTML=PHASES.map((item,i)=>
    '<article class="phase-card"><span class="phase-number">0'+(i+1)+' / 04</span><h3>'+esc(item.title)+'</h3><p>'+esc(item.desc)+'</p><button type="button" data-view="course" data-chapter="'+item.first+'">从第 '+String(item.first).padStart(2,"0")+' 课开始 →</button></article>'
  ).join("");
}
function renderChapterNav(){
  let current="";
  byId("chapter-nav").innerHTML=SITE_DATA.chapters.map(c=>{
    const phase=PHASES.find(p=>c.id>=p.first&&c.id<=p.last);
    const group=phase.title!==current?('<div class="rail-phase">'+esc(phase.title)+'</div>'):"";
    current=phase.title;
    return group+'<button type="button" class="'+(c.id===state.chapter?"active":"")+'" data-view="course" data-chapter="'+c.id+'"><b>'+String(c.id).padStart(2,"0")+'</b><span>'+esc(c.title)+'</span><i>'+(state.done.has(c.id)?"✓":"")+'</i></button>';
  }).join("");
  byId("chapter-select").innerHTML=SITE_DATA.chapters.map(c=>'<option value="'+c.id+'">'+String(c.id).padStart(2,"0")+' · '+esc(c.title)+'</option>').join("");
  byId("chapter-select").value=String(state.chapter);
}
function renderChapter(){
  const c=chapter(state.chapter);state.chapter=c.id;save();renderChapterNav();
  const images=c.images.map((item,i)=>'<figure class="lesson-image-card"><div class="lesson-image-top"><span>VISUAL '+String(i+1).padStart(2,"0")+' / '+String(c.images.length).padStart(2,"0")+'</span><b>'+esc(item.title)+'</b></div><img src="'+esc(item.src)+'" alt="第 '+c.id+' 课知识图解：'+esc(item.title)+'" loading="'+(i===0?"eager":"lazy")+'"><figcaption>先沿着图里的路径讲给自己听，再回到下面的文字与练习验证理解。</figcaption></figure>').join("");
  const flow=c.flow.map(([label,detail],i)=>'<div class="flow-step"><span>'+String(i+1).padStart(2,"0")+'</span><b>'+esc(label)+'</b><small>'+esc(detail)+'</small></div>').join("");
  const cards=c.cards.map(([title,definition,wrong,action],i)=>
    '<article class="knowledge-card"><span>KEY '+String(i+1).padStart(2,"0")+'</span><h3>'+esc(title)+'</h3><p><b>要点：</b>'+esc(definition)+'</p><p class="wrong"><b>常见误区：</b>'+esc(wrong)+'</p><p><b>下一步：</b>'+esc(action)+'</p></article>'
  ).join("");
  const steps=[["看一遍示范",c.task.worked],["跟着做一小步",c.task.guided],["卡住时看提示",c.task.hint],["独立完成",c.task.independent],["换一个场景",c.task.transfer]];
  byId("chapter-render").innerHTML=
    '<div class="reader-top"><span class="reader-overline">'+esc(c.phase)+' / LESSON '+String(c.id).padStart(2,"0")+' OF 16</span><h1>'+esc(c.title)+'</h1><p>'+esc(c.overview)+'</p><div class="reader-actions"><button type="button" data-mark="'+c.id+'" class="'+(state.done.has(c.id)?"done":"")+'">'+(state.done.has(c.id)?"✓ 已学完":"标记已学")+'</button><button type="button" data-view="workshop">查看全部作业 →</button></div></div>'+
    '<div class="chapter-tabs" role="tablist" aria-label="章节学习模式"><button type="button" role="tab" data-tab="visual" class="'+(state.tab==="visual"?"active":"")+'">先看图解</button><button type="button" role="tab" data-tab="reading" class="'+(state.tab==="reading"?"active":"")+'">详细教程</button><button type="button" role="tab" data-tab="practice" class="'+(state.tab==="practice"?"active":"")+'">动手练习</button></div>'+
    '<div class="lesson-panel" data-panel="visual" '+(state.tab==="visual"?"":"hidden")+'><div class="memory-banner"><div><span>ONE SENTENCE / 一句话记住</span><strong>'+esc(c.memory)+'</strong></div><b>'+String(c.id).padStart(2,"0")+'</b></div><div class="visual-heading"><h2>本课知识图解</h2><p>每张图均可直接看到，不用另开链接</p></div><div class="lesson-image-gallery">'+images+'</div><div class="visual-heading"><h2>这一章怎么走？</h2><p>先看结构，再读细节</p></div><div class="flow-grid">'+flow+'</div><div class="coach-card"><span>马哥提醒</span><p>'+esc(c.coach)+'</p></div><div class="visual-heading"><h2>四张知识卡</h2><p>核心概念、误区和动作</p></div><div class="knowledge-grid">'+cards+'</div></div>'+
    '<div class="lesson-panel" data-panel="reading" '+(state.tab==="reading"?"":"hidden")+'><div class="coach-card"><span>先记住这个判断</span><p>'+esc(c.coach)+'</p></div><article class="reader-article">'+c.html+'</article></div>'+
    '<div class="lesson-panel" data-panel="practice" '+(state.tab==="practice"?"":"hidden")+'><div class="lesson-task"><span>YOUR OUTPUT / 本章产物</span><h2>'+esc(c.task.deliverable)+'</h2><p>先做，再看完整教程。把观察、判断依据和下一步行动都写下来。</p><div class="task-step-list">'+steps.map(([name,detail],i)=>'<div class="task-step"><span>'+String(i+1).padStart(2,"0")+'</span><b>'+esc(name)+'</b><p>'+esc(detail)+'</p></div>').join("")+'</div><label class="answer-label" for="chapter-answer">我的独立答案和证据</label><textarea class="task-answer" id="chapter-answer" placeholder="写你的真实样本、判断和下一步；不填客户隐私。">'+esc(state.answers[c.id]||"")+'</textarea><p class="task-help">答案只保存在你当前的浏览器。这里不自动评分，实际经营请用真实后台数据复核。</p><button class="primary-btn task-save" type="button" data-save-answer="'+c.id+'">保存我的答案 <span>↗</span></button><span class="save-status" id="save-status" role="status"></span></div></div>'+
    '<div class="chapter-bottom"><button type="button" data-move="-1" '+(c.id===1?"disabled":"")+'">← 上一课</button><button type="button" data-move="1" '+(c.id===16?"disabled":"")+'">下一课 →</button></div>';
}
function renderFaq(){
  const categories=["全部",...new Set(SITE_DATA.faq.map(item=>item.category))];
  byId("faq-categories").innerHTML=categories.map((category,i)=>'<button type="button" data-faq-category="'+esc(category)+'" class="'+(category===state.faqCategory?"active":"")+'"><span>'+String(i).padStart(2,"0")+'</span><b>'+esc(category)+'</b><small>'+(i===0?SITE_DATA.faq.length:SITE_DATA.faq.filter(x=>x.category===category).length)+'</small></button>').join("");
  const q=state.faqQuery.trim().toLowerCase();
  const results=SITE_DATA.faq.filter(item=>(state.faqCategory==="全部"||item.category===state.faqCategory)&&(!q||(item.q+" "+item.a+" "+item.category).toLowerCase().includes(q)));
  byId("faq-result-title").textContent=state.faqCategory==="全部"?"全部问题":state.faqCategory;
  byId("faq-count").textContent=results.length+" / 200 个问题";
  byId("faq-results").innerHTML=results.slice(0,state.faqLimit).map(item=>'<details class="faq-item"><summary><span>'+String(item.id).padStart(3,"0")+'</span><b>'+esc(item.q)+'</b><i>＋</i></summary><div class="faq-answer"><p>'+esc(item.a)+'</p><button type="button" data-view="course" data-chapter="'+item.chapter+'">前往第 '+String(item.chapter).padStart(2,"0")+' 课，系统学习 →</button></div></details>').join("");
  byId("faq-more").hidden=results.length<=state.faqLimit;
  byId("faq-empty").hidden=results.length>0;
}
function renderMetrics(){
  const groups=["全部",...new Set(SITE_DATA.metrics.map(item=>item.group))];
  byId("metric-group").innerHTML=groups.map(group=>'<option value="'+esc(group)+'">'+(group==="全部"?"全部 "+SITE_DATA.metrics.length+" 个指标":esc(group)+" · "+SITE_DATA.metrics.filter(item=>item.group===group).length)+"</option>").join("");
  byId("metric-group").value=state.metricGroup;
  byId("metric-boards").innerHTML=SITE_DATA.boards.map((board,i)=>'<article class="metric-board"><span>0'+(i+1)+' / 千帆榜单</span><h3>'+esc(board.name)+'</h3><strong>'+esc(board.question)+'</strong><p><b>重点看</b>'+esc(board.inspect)+'</p><p><b>不能推断</b>'+esc(board.cannot)+'</p><small>'+esc(board.route)+'</small></article>').join("");
  renderMetricTable();
  renderMetricBaseline();
}
function renderMetricBaseline(){
  const values=[...document.querySelectorAll('.baseline-input')].map(input=>Number(input.value)).filter(value=>Number.isFinite(value)&&value>=0&&value<=100);
  const result=byId('metric-baseline-result');
  if(values.length!==4){result.innerHTML='<p>请填写四个 0—100 之间的百分比。</p>';return}
  const sorted=[...values].sort((a,b)=>a-b);
  const median=(sorted[1]+sorted[2])/2;
  const format=value=>Number(value.toFixed(1)).toLocaleString('zh-CN')+'%';
  result.innerHTML='<div><span>四期中位数</span><strong>'+format(median)+'</strong></div><div><span>优先排查线 · 80%</span><b>＜'+format(median*.8)+'</b></div><div><span>值得复测线 · 120%</span><b>＞'+format(median*1.2)+'</b></div><p>中位数更能避免单次波动把基线拉偏；这两条线是教学用复盘触发器。下一期要与前四期保持同口径。</p>';
}
function renderMetricTable(){
  const query=state.metricQuery.trim().toLowerCase();
  const filtered=SITE_DATA.metrics.filter(item=>(state.metricGroup==="全部"||item.group===state.metricGroup)&&(!query||[item.name,item.group,item.meaning,item.signal,item.formula].join(" ").toLowerCase().includes(query)));
  byId("metric-count").textContent=filtered.length+" / "+SITE_DATA.metrics.length;
  byId("metric-empty").hidden=filtered.length>0;
  byId("metric-table-body").innerHTML=filtered.map((item,i)=>{
    const open=state.metricOpen===item.name;
    return '<tr class="metric-main-row"><td><button type="button" class="metric-name" data-metric-toggle="'+esc(item.name)+'" aria-expanded="'+open+'"><span>'+esc(item.group)+' / '+String(i+1).padStart(2,"0")+'</span><strong>'+esc(item.name)+'</strong><small>'+(open?"收起解析 ↑":"展开解析 ↓")+'</small></button></td><td><b>'+esc(item.meaning)+'</b><code>'+esc(item.formula)+'</code></td><td>'+esc(item.where)+'</td><td><span class="metric-ref">'+esc(item.reference)+'</span></td></tr>'+
    (open?'<tr class="metric-detail-row"><td colspan="4"><div class="metric-detail-grid"><div><span>它反映什么</span><p>'+esc(item.signal)+'</p></div><div><span>低于参考时</span><p>'+esc(item.low)+'</p></div><div><span>高于参考时</span><p>'+esc(item.high)+'</p></div><div><span>最容易误读</span><p>'+esc(item.trap)+'</p></div></div>'+(item.example?'<div class="metric-example"><b>代入例子</b><p>'+esc(item.example)+'</p></div>':"")+'</td></tr>':"");
  }).join("");
}
function renderWorkshop(){
  byId("workshop-grid").innerHTML=SITE_DATA.chapters.map(c=>
    '<article class="workshop-item"><span>'+String(c.id).padStart(2,"0")+'</span><h3>'+esc(c.title)+'</h3><p>'+esc(c.task.deliverable)+'</p><button type="button" data-view="course" data-chapter="'+c.id+'" data-open-tab="practice">'+(state.answers[c.id]?"继续写作业":"打开本章练习")+' →</button></article>'
  ).join("");
  byId("quiz-list").innerHTML=SITE_DATA.quiz.map((q,i)=>
    '<details class="quiz-item"><summary><span>'+String(i+1).padStart(2,"0")+'</span>'+esc(q.title)+'</summary><div class="quiz-content">'+q.question+'<button type="button" data-reveal-quiz="'+i+'">查看解析</button><div class="quiz-answer" id="quiz-answer-'+i+'" hidden>'+q.answer+'</div></div></details>'
  ).join("");
  byId("recall-grid").innerHTML=SITE_DATA.flashcards.map(([question,answer],i)=>
    '<details class="recall-item"><summary><span>'+String(i+1).padStart(2,"0")+'</span><b>'+esc(question)+'</b><small>点开核对 ↗</small></summary><p>'+esc(answer)+'</p></details>'
  ).join("");
}
function downloadTemplate(kind){
  const templates={
    selection:["选品采证表.csv","采集日期,买家任务,任务搜索词,商品链接,目标SKU,实付价,近期付款线索,内容提问,交付缺口,权利状态,下一步\r\n"],
    funnel:["经营漏斗记录表.csv","日期,账号,买家任务,笔记ID,商品ID,SKU,流量来源,曝光,阅读,商品点击,支付订单,退款订单,完成使用人数,推广费,服务工时,备注\r\n"]
  };
  const item=templates[kind];if(!item)return;
  const blob=new Blob(["\ufeff",item[1]],{type:"text/csv;charset=utf-8"});
  const url=URL.createObjectURL(blob);const link=document.createElement("a");link.href=url;link.download=item[0];document.body.appendChild(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),1500);
}
function rate(n,d){return d>0?(100*n/d).toFixed(1)+"%":"—"}
function readNum(id){const raw=byId(id).value.trim();return raw===""?null:Math.max(0,Number(raw)||0)}
function renderCalculator(){
  const rows=[
    ["曝光",readNum("metric-impressions")],
    ["阅读",readNum("metric-reads")],
    ["商品点击",readNum("metric-clicks")],
    ["支付",readNum("metric-orders")],
    ["退款",readNum("metric-refunds")],
    ["完成使用",readNum("metric-uses")]
  ];
  const [impressions,reads,clicks,orders,refunds,uses]=rows.map(x=>x[1]);
  const max=Math.max(1,...rows.map(x=>x[1]||0));
  byId("funnel-bars").innerHTML=rows.map(([name,value])=>'<div class="funnel-bar"><span>'+esc(name)+'</span><div class="funnel-bar-track"><i style="width:'+Math.max(value===0?0:2,(value||0)/max*100).toFixed(2)+'%"></i></div><strong>'+(value===null?"缺测":value.toLocaleString("zh-CN"))+'</strong></div>').join("");
  const values=[
    ["阅读率",rate(reads,impressions)],
    ["阅读→点击",rate(clicks,reads)],
    ["点击→支付",rate(orders,clicks)],
    ["订单退款率",rate(refunds,orders)]
  ];
  byId("metric-rates").innerHTML=values.map(([label,value])=>'<div><small>'+esc(label)+'</small><b>'+value+'</b></div>').join("");
  let diagnosis="";
  if(rows.some(x=>x[1]===null))diagnosis="有字段缺测：先补齐同一时间窗的数据。缺测不等于 0，暂不计算完整漏斗结论。";
  else if(reads>impressions||clicks>reads||orders>clicks||refunds>orders||uses>orders)diagnosis="先核数据口径：当前数字不是一条常规漏斗，可能混用了人数与次数、不同窗口或不同商品版本。";
  else if(orders>0&&refunds>0)diagnosis="已有退款：先逐单核适用版本、交付内容和使用阻碍。样本少时不凭单个退款率给商品下结论。";
  else if(clicks>=50&&orders===0)diagnosis="已有商品点击但无支付：先排查目标买家、商品规格、详情首屏和付款路径，再决定是否调整价格。";
  else if(reads>=100&&clicks===0)diagnosis="有人阅读却没人点商品：先看笔记承诺、成品展示、挂接商品是否在解决同一任务。";
  else if(orders>0&&uses<orders)diagnosis="有付款但尚有买家未完成使用：先核送达、打开、说明和首次使用，别急着扩量。";
  else diagnosis="把这组数据与自己同任务、同来源、同价带的下一期数据比较；先改一个主变量，并记录复查日期。";
  byId("metric-diagnosis").textContent=diagnosis;
}
function pageFor(view,chapterId){
  if(view==="course")return "lesson-"+String(Math.min(16,Math.max(1,Number(chapterId)||1))).padStart(2,"0")+".html";
  return ({home:"index.html",faq:"faq.html",workshop:"workshop.html",metrics:"metrics.html",tools:"tools.html",about:"about.html"})[view]||"index.html";
}
function navigateTo(view,chapterId,tab){
  const target=pageFor(view,chapterId||state.chapter)+(view==="course"&&tab==="practice"?"?tab=practice":"");
  if(location.pathname.split("/").pop()+location.search!==target)location.href=target;
  else if(view==="course"&&chapterId){state.tab=tab==="practice"?"practice":"visual";showView("course",chapterId);}
}
function showView(view,chapterId){
  if(!["home","course","faq","workshop","metrics","tools","about"].includes(view))view="home";
  if(chapterId)state.chapter=Math.min(16,Math.max(1,Number(chapterId)||1));
  state.view=view;
  document.querySelectorAll(".view").forEach(el=>el.hidden=el.id!=="view-"+view);
  if(view==="course")renderChapter();
  if(view==="faq")renderFaq();
  if(view==="metrics")renderMetrics();
  if(view==="workshop")renderWorkshop();
  if(view==="tools")renderCalculator();
  updateNavigation();updateProgress();
  byId("mobile-nav").hidden=true;byId("menu-toggle").setAttribute("aria-expanded","false");
}
document.addEventListener("click",event=>{
  const target=event.target.closest("button");if(!target)return;
  if(target.id==="menu-toggle"){const menu=byId("mobile-nav");menu.hidden=!menu.hidden;target.setAttribute("aria-expanded",String(!menu.hidden));return}
  if(target.dataset.metricJump){byId("metric-dictionary").scrollIntoView({behavior:"smooth",block:"start"});return}
  if(target.dataset.metricToggle){state.metricOpen=state.metricOpen===target.dataset.metricToggle?"":target.dataset.metricToggle;renderMetricTable();return}
  if(target.dataset.downloadTemplate){downloadTemplate(target.dataset.downloadTemplate);return}
  if(target.dataset.faqCategory){state.faqCategory=target.dataset.faqCategory;state.faqLimit=30;renderFaq();return}
  if(target.id==="faq-more"){state.faqLimit+=30;renderFaq();return}
  if(target.id==="faq-clear"||target.id==="faq-reset"){state.faqQuery="";state.faqCategory="全部";state.faqLimit=30;byId("faq-search").value="";renderFaq();return}
  if(target.dataset.revealQuiz!==undefined){byId("quiz-answer-"+target.dataset.revealQuiz).hidden=false;target.disabled=true;target.textContent="已显示解析";return}
  if(target.dataset.saveAnswer){state.answers[state.chapter]=byId("chapter-answer").value;save();byId("save-status").textContent="已保存在本机";return}
  if(target.dataset.mark){const id=Number(target.dataset.mark);state.done.has(id)?state.done.delete(id):state.done.add(id);save();renderChapter();updateProgress();return}
  if(target.dataset.tab){state.tab=target.dataset.tab;renderChapter();return}
  if(target.dataset.move){const id=Math.min(16,Math.max(1,state.chapter+Number(target.dataset.move)));state.tab="visual";navigateTo("course",id);return}
  if(target.dataset.view){if(target.dataset.openTab)state.tab=target.dataset.openTab;else if(target.dataset.view==="course")state.tab="visual";navigateTo(target.dataset.view,target.dataset.chapter,target.dataset.openTab);return}
});
byId("chapter-select").addEventListener("change",event=>{state.tab="visual";navigateTo("course",event.target.value)});
byId("faq-search").addEventListener("input",event=>{state.faqQuery=event.target.value;state.faqLimit=30;renderFaq()});
byId("metric-search").addEventListener("input",event=>{state.metricQuery=event.target.value;state.metricOpen="";renderMetricTable()});
byId("metric-group").addEventListener("change",event=>{state.metricGroup=event.target.value;state.metricOpen="";renderMetricTable()});
document.querySelectorAll('.baseline-input').forEach(input=>input.addEventListener('input',renderMetricBaseline));
byId("calculate").addEventListener("click",renderCalculator);
document.querySelectorAll(".field-grid input").forEach(input=>input.addEventListener("input",renderCalculator));
document.querySelectorAll(".mage-photo").forEach(img=>img.src=SITE_DATA.portrait);
renderHome();renderWorkshop();renderCalculator();
showView(document.body.dataset.initialView||"home",document.body.dataset.initialChapter);
