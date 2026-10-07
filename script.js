const DEFAULTS={demand:120000,orderingCost:250000,holdingCost:1000};
const $=id=>document.getElementById(id);
const els={demand:$("demand"),orderingCost:$("orderingCost"),holdingCost:$("holdingCost"),eoq:$("eoqValue"),frequency:$("frequencyValue"),interval:$("intervalValue"),totalCost:$("totalCostValue"),costTotal:$("costTotal"),orderCost:$("orderCostValue"),holdingCost:$("holdingCostValue"),orderBar:$("orderBar"),holdingBar:$("holdingBar"),tableEoq:$("tableEoq"),tableFrequency:$("tableFrequency"),tableInterval:$("tableInterval"),tableTotal:$("tableTotal"),validation:$("validation"),inventoryLine:$("inventoryLine"),scenarioList:$("scenarioList")};
const rupiah=v=>new Intl.NumberFormat("id-ID",{style:"currency",currency:"IDR",maximumFractionDigits:0}).format(v);
const numberID=(v,d=2)=>new Intl.NumberFormat("id-ID",{minimumFractionDigits:d,maximumFractionDigits:d}).format(v);
function model(D,S,H){const Q=Math.sqrt(2*D*S/H),f=D/Q,i=365/f,o=f*S,h=Q/2*H;return{Q,f,i,o,h,total:o+h}}
function calculate(){
 const D=Number(els.demand.value),S=Number(els.orderingCost.value),H=Number(els.holdingCost.value);
 if(!(D>0&&S>0&&H>0)){els.validation.textContent="⚠ Isi semua parameter dengan nilai > 0";els.validation.style.color="#a14c3c";els.validation.style.background="#f7ebe7";updateBlank();return}
 els.validation.textContent="✓ Parameter valid";els.validation.style.color="";els.validation.style.background="";
 const r=model(D,S,H);
 els.eoq.textContent=Math.round(r.Q).toLocaleString("id-ID");els.frequency.textContent=numberID(r.f);els.interval.textContent=numberID(r.i);
 els.totalCost.textContent=r.total>=1e6?rupiah(r.total/1e6)+" jt":rupiah(r.total/1e3)+" rb";els.costTotal.textContent=rupiah(r.total);els.orderCost.textContent=rupiah(r.o);els.holdingCost.textContent=rupiah(r.h);
 els.orderBar.style.width=r.o/r.total*100+"%";els.holdingBar.style.width=r.h/r.total*100+"%";
 els.tableEoq.textContent=Math.round(r.Q).toLocaleString("id-ID")+" unit";els.tableFrequency.textContent=numberID(r.f)+" kali/tahun";els.tableInterval.textContent=numberID(r.i)+" hari";els.tableTotal.textContent=rupiah(r.total)+"/tahun";
 renderChart(r.Q);renderSensitivity(D,S,H,r.Q)
}
function updateBlank(){["eoq","frequency","interval","totalCost"].forEach(k=>els[k].textContent="—");[els.costTotal,els.orderCost,els.holdingCost,els.tableEoq,els.tableFrequency,els.tableInterval,els.tableTotal].forEach(e=>e.textContent="—");els.orderBar.style.width="50%";els.holdingBar.style.width="50%";els.inventoryLine.setAttribute("points","");els.scenarioList.innerHTML=""}
function renderChart(Q){const max=Q*1.05,left=40,right=740,top=36,bottom=264,points=[];for(let i=0;i<=80;i++){const x=left+(right-left)*i/80,frac=(i/80*5)%1,stock=max-frac*Q,y=bottom-stock/max*(bottom-top);points.push(x.toFixed(1)+","+y.toFixed(1))}els.inventoryLine.setAttribute("points",points.join(" "))}
function renderSensitivity(D,S,H,currentQ){
 const cases=[{label:"Demand −20%",q:model(D*.8,S,H).Q},{label:"Demand +20%",q:model(D*1.2,S,H).Q},{label:"Ordering cost −20%",q:model(D,S*.8,H).Q},{label:"Ordering cost +20%",q:model(D,S*1.2,H).Q},{label:"Holding cost −20%",q:model(D,S,H*.8).Q},{label:"Holding cost +20%",q:model(D,S,H*1.2).Q}];
 els.scenarioList.innerHTML=cases.map(c=>{const diff=(c.q/currentQ-1)*100;return `<div class="scenario"><div class="scenario-head"><span>${c.label}</span><strong>${Math.round(c.q).toLocaleString("id-ID")} unit</strong></div><div class="scenario-bar"><i style="width:${Math.min(100,c.q/currentQ*50)}%"></i></div><small>${diff>=0?"+":""}${numberID(diff)}% dari EOQ saat ini</small></div>`}).join("")
}
function reset(){els.demand.value=DEFAULTS.demand;els.orderingCost.value=DEFAULTS.orderingCost;els.holdingCost.value=DEFAULTS.holdingCost;calculate()}
["demand","orderingCost","holdingCost"].forEach(k=>els[k].addEventListener("input",calculate));$("resetBtn").addEventListener("click",reset);calculate();

function extraModules(){
  const fc=["fc1","fc2","fc3"].map(id=>Number($(id)?.value)||0);
  if($("forecastValue")) $("forecastValue").textContent=Math.round(fc.reduce((a,b)=>a+b,0)/3).toLocaleString("id-ID")+" unit";
  const daily=Number($("dailyDemand")?.value)||0,lead=Number($("leadTime")?.value)||0,ss=Number($("safetyStock")?.value)||0;
  if($("ropValue")) $("ropValue").textContent=Math.round(daily*lead+ss).toLocaleString("id-ID")+" unit";
  if($("cycleStockValue")) $("cycleStockValue").textContent=els.eoq.textContent+" unit";
  const abc=[
    ["Bahan A",120000,18000],["Bahan B",60000,25000],["Bahan C",15000,32000],["Bahan D",8000,12000],["Bahan E",3000,9000]
  ].map(x=>({...x,value:x[1]*x[2]})).sort((a,b)=>b.value-a.value);
  const total=abc.reduce((s,x)=>s+x.value,0); let cum=0;
  if($("abcTable")) $("abcTable").innerHTML=abc.map(x=>{cum+=x.value;const p=cum/total;const cls=p<=.8?"A":p<=.95?"B":"C";return '<tr><td>'+x[0]+'</td><td>'+x[1].toLocaleString("id-ID")+'</td><td>'+rupiah(x[2])+'</td><td>'+rupiah(x.value)+'</td><td><span class="abc-badge abc-'+cls+'">'+cls+'</span></td></tr>'}).join("");
  const D=Number(els.demand.value)||0,S=Number(els.orderingCost.value)||0,H=Number(els.holdingCost.value)||0;
  if(D&&S&&H){const r=model(D,S,H);$("planQty").textContent=Math.round(r.Q).toLocaleString("id-ID")+" unit";$("planFreq").textContent=numberID(r.f)+" kali";$("planInterval").textContent=numberID(r.i)+" hari";$("planCost").textContent=rupiah(r.total);$("decisionText").textContent='Pesan sekitar '+Math.round(r.Q).toLocaleString("id-ID")+' unit setiap siklus.'}
}
["fc1","fc2","fc3","dailyDemand","leadTime","safetyStock"].forEach(id=>$(id)?.addEventListener("input",extraModules));
const originalCalculate=calculate;
calculate=function(){originalCalculate();extraModules()};
extraModules();