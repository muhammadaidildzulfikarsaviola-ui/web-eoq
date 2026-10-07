const DEFAULTS = { demand: 120000, orderingCost: 250000, holdingCost: 1000 };

const $ = (id) => document.getElementById(id);
const els = {
  demand: $("demand"),
  orderingCost: $("orderingCost"),
  holdingCost: $("holdingCost"),
  eoq: $("eoqValue"),
  frequency: $("frequencyValue"),
  interval: $("intervalValue"),
  totalCost: $("totalCostValue"),
  costTotal: $("costTotal"),
  orderCost: $("orderCostValue"),
  holdingCost: $("holdingCostValue"),
  orderBar: $("orderBar"),
  holdingBar: $("holdingBar"),
  tableEoq: $("tableEoq"),
  tableFrequency: $("tableFrequency"),
  tableInterval: $("tableInterval"),
  tableTotal: $("tableTotal"),
  validation: $("validation"),
  inventoryLine: $("inventoryLine")
};

const rupiah = (value) => new Intl.NumberFormat("id-ID", {
  style: "currency", currency: "IDR", maximumFractionDigits: 0
}).format(value);

const numberID = (value, digits = 2) => new Intl.NumberFormat("id-ID", {
  minimumFractionDigits: digits, maximumFractionDigits: digits
}).format(value);

function calculate() {
  const D = Number(els.demand.value);
  const S = Number(els.orderingCost.value);
  const H = Number(els.holdingCost.value);

  const valid = D > 0 && S > 0 && H > 0;
  if (!valid) {
    els.validation.textContent = "⚠ Isi semua parameter dengan nilai > 0";
    els.validation.style.color = "#a14c3c";
    els.validation.style.background = "#f7ebe7";
    updateBlank();
    return;
  }

  els.validation.textContent = "✓ Parameter valid";
  els.validation.style.color = "";
  els.validation.style.background = "";

  const Q = Math.sqrt((2 * D * S) / H);
  const frequency = D / Q;
  const interval = 365 / frequency;
  const ordering = frequency * S;
  const holding = (Q / 2) * H;
  const total = ordering + holding;

  els.eoq.textContent = Math.round(Q).toLocaleString("id-ID");
  els.frequency.textContent = numberID(frequency);
  els.interval.textContent = numberID(interval);
  els.totalCost.textContent = total >= 1e9 ? rupiah(total / 1e9) + " M" : total >= 1e6 ? rupiah(total / 1e6) + " jt" : rupiah(total / 1e3) + " rb";

  els.costTotal.textContent = rupiah(total);
  els.orderCost.textContent = rupiah(ordering);
  els.holdingCost.textContent = rupiah(holding);

  const totalParts = ordering + holding;
  els.orderBar.style.width = (ordering / totalParts * 100) + "%";
  els.holdingBar.style.width = (holding / totalParts * 100) + "%";

  els.tableEoq.textContent = Math.round(Q).toLocaleString("id-ID") + " unit";
  els.tableFrequency.textContent = numberID(frequency) + " kali/tahun";
  els.tableInterval.textContent = numberID(interval) + " hari";
  els.tableTotal.textContent = rupiah(total) + "/tahun";

  renderChart(Q);
}

function updateBlank() {
  ["eoq","frequency","interval","totalCost"].forEach((key) => els[key].textContent = "—");
  [els.costTotal, els.orderCost, els.holdingCost, els.tableEoq, els.tableFrequency, els.tableInterval, els.tableTotal]
    .forEach((el) => el.textContent = "—");
  els.orderBar.style.width = "50%";
  els.holdingBar.style.width = "50%";
  els.inventoryLine.setAttribute("points", "");
}

function renderChart(Q) {
  const max = Q * 1.05;
  const left = 40, right = 740, top = 36, bottom = 264;
  const points = [];
  const cycles = 5;
  for (let i = 0; i <= 80; i++) {
    const x = left + (right - left) * (i / 80);
    const cycle = (i / 80) * cycles;
    const frac = cycle % 1;
    const stock = max - frac * Q;
    const y = bottom - ((stock / max) * (bottom - top));
    points.push(x.toFixed(1) + "," + y.toFixed(1));
  }
  els.inventoryLine.setAttribute("points", points.join(" "));
}

function reset() {
  els.demand.value = DEFAULTS.demand;
  els.orderingCost.value = DEFAULTS.orderingCost;
  els.holdingCost.value = DEFAULTS.holdingCost;
  calculate();
}

["demand","orderingCost","holdingCost"].forEach((key) => {
  els[key].addEventListener("input", calculate);
});

$("resetBtn").addEventListener("click", reset);
calculate();
