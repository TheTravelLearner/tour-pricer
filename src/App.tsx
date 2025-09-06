import React, { useEffect, useMemo, useState } from "react";

// Types
type Lang = "zh" | "en";
type RoundMode = "perPerson" | "groupThenDivide";
type MarkupType = "percent" | "amount";
type TicketItem = { id: string; name_zh: string; name_en: string; price: number };
type Params = {
  pax: number; guideFee: number; boatIncluded: boolean; boatFee: number;
  drinkIncluded: boolean; drinkFeePerPerson: number; carTier1: number; carTier2: number;
  carTier3: number; carTier4: number; useTicketCatalog: boolean; manualTicketFeePerPerson: number;
  selectedTicketIds: string[]; mealEnabled: boolean; mealMode: "preset" | "custom";
  mealPerPerson: number; vatEnabled: boolean; vatRate: number; markupEnabled: boolean;
  markupType: MarkupType; markupRate: number; markupAmount: number; roundMode: RoundMode;
  itinerary: string;
};
// NEW: Define the structure for a saved quote
type SavedQuote = {
  id: number;
  name: string;
  timestamp: string;
  params: Params;
};

// Defaults & Constants
const DEFAULT_TICKETS: TicketItem[] = [
    { id: "grandPalace", name_zh: "大皇宫", name_en: "Grand Palace", price: 500 },
    { id: "watPho", name_zh: "卧佛寺", name_en: "Wat Pho", price: 200 },
    { id: "watArun", name_zh: "郑王庙", name_en: "Wat Arun", price: 200 },
];
const DEFAULTS: Params = {
  pax: 2, guideFee: 2500, boatIncluded: true, boatFee: 2000, drinkIncluded: true, drinkFeePerPerson: 80,
  carTier1: 2000, carTier2: 2200, carTier3: 2500, carTier4: 5000, useTicketCatalog: true,
  manualTicketFeePerPerson: 1140, selectedTicketIds: ["grandPalace", "watPho"], mealEnabled: false,
  mealMode: "preset", mealPerPerson: 300, vatEnabled: false, vatRate: 7, markupEnabled: false,
  markupType: "percent", markupRate: 20, markupAmount: 0, roundMode: "perPerson",
  itinerary: "",
};
const PARAMS_STORAGE_KEY = "byg_pricing_params_v8";
const TICKETS_STORAGE_KEY = "byg_pricing_tickets_v5";
const QUOTES_STORAGE_KEY = "byg_pricing_saved_quotes_v1"; // NEW storage key

// Utils
const fmtTHB = (n: number) => new Intl.NumberFormat("th-TH", { style: "currency", currency: "THB", maximumFractionDigits: 0 }).format(Math.round(n));

export default function App() {
  const [lang, setLang] = useState<Lang>("zh");
  const [p, setP] = useState<Params>(() => {
    try { const raw = localStorage.getItem(PARAMS_STORAGE_KEY); return raw ? { ...DEFAULTS, ...JSON.parse(raw) } : DEFAULTS; } catch { return DEFAULTS; }
  });
  const [ticketCatalog, setTicketCatalog] = useState<TicketItem[]>(() => {
    try { const raw = localStorage.getItem(TICKETS_STORAGE_KEY); return raw ? JSON.parse(raw) : DEFAULT_TICKETS; } catch { return DEFAULT_TICKETS; }
  });
  // NEW: State for saved quotes
  const [savedQuotes, setSavedQuotes] = useState<SavedQuote[]>(() => {
    try { const raw = localStorage.getItem(QUOTES_STORAGE_KEY); return raw ? JSON.parse(raw) : []; } catch { return []; }
  });

  useEffect(() => { localStorage.setItem(PARAMS_STORAGE_KEY, JSON.stringify(p)); }, [p]);
  useEffect(() => { localStorage.setItem(TICKETS_STORAGE_KEY, JSON.stringify(ticketCatalog)); }, [ticketCatalog]);
  // NEW: Effect to save quotes to localStorage whenever they change
  useEffect(() => { localStorage.setItem(QUOTES_STORAGE_KEY, JSON.stringify(savedQuotes)); }, [savedQuotes]);
  
  const t = (key: string) => {
    const dict: Record<string, { zh: string; en: string }> = {
      title: { zh: "BYG 报价管理系统", en: "BYG Quote Management System" },
      subtitle: { zh: "专业版 v2.6 | 保存与读取", en: "Pro Edition v2.6 | Save & Load" },
      saveQuote: { zh: "保存当前报价", en: "Save Current Quote" },
      savedQuotesTitle: { zh: "已保存的报价", en: "Saved Quotes" },
      load: { zh: "读取", en: "Load" },
      delete: { zh: "删除", en: "Delete" },
      lang: { zh: "语言", en: "Language" }, pax: { zh: "人数 (1–15)", en: "Party Size (1–15)" }, guide: { zh: "导游费 (/团)", en: "Guide Fee (/group)" },
      boatInc: { zh: "含长尾船", en: "Include Long-tail Boat" }, boatFee: { zh: "船费 (/艘)", en: "Boat Fee (/boat)" },
      drinkInc: { zh: "含饮品", en: "Include Drinks" }, drinkFee: { zh: "饮品费 (/人)", en: "Drink Fee (/person)" },
      carTiers: { zh: "车辆费阶梯", en: "Vehicle Tiers" }, tier1: { zh: "1–2人", en: "1–2 pax" }, tier2: { zh: "3–4人", en: "3–4 pax" },
      tier3: { zh: "5–12人", en: "5–12 pax" }, tier4: { zh: "13–15人", en: "13–15 pax" }, taxes: { zh: "VAT & 加价", en: "VAT & Markup" },
      vat: { zh: "启用 VAT", en: "Enable VAT" }, vatRate: { zh: "VAT 税率 %", en: "VAT Rate %" }, markup: { zh: "启用加价 (利润)", en: "Enable Markup (Profit)" },
      markupType: { zh: "加价方式", en: "Markup Type" }, markupPercent: { zh: "加价率 %", en: "Markup %" }, markupAmount: { zh: "加价额 (฿/团)", en: "Markup Amount (฿/group)" },
      rounding: { zh: "舍入策略", en: "Rounding Policy" }, modePer: { zh: "每人取整", en: "Round per person" }, modeTotal: { zh: "总价取整再平摊", en: "Round total then divide" },
      result: { zh: "计算结果", en: "Result" }, perPerson: { zh: "人均价", en: "Price / Person" }, total: { zh: "团体总价", en: "Group Total" },
      tableTitle: { zh: "1–15人完整价格表", en: "Full Price Table (1–15 pax)" }, exportCsv: { zh: "导出 CSV", en: "Export CSV" },
      reset: { zh: "重置参数", en: "Reset Params" }, breakdown: { zh: "成本拆分", en: "Cost Breakdown" },
      fixed: { zh: "固定成本", en: "Fixed costs" }, variable: { zh: "可变成本 (/人)", en: "Variable (/person)" }, vehicle: { zh: "车辆费", en: "Vehicle" },
      boat: { zh: "船", en: "Boat" }, drink: { zh: "饮品", en: "Drinks" }, vatLabel: { zh: "VAT", en: "VAT" }, markupLabel: { zh: "加价", en: "Markup" },
      tickets: { zh: "门票/用餐（/人）", en: "Tickets/Meals (/person)" },
      addTicket: { zh: "新增门票/用餐", en: "Add Ticket/Meal" },
      useCatalog: { zh: "使用项目库", en: "Use Item Catalog" },
      manualTicket: { zh: "手动项目合计", en: "Manual Item Total" },
      meal: { zh: "基础餐标 (/人)", en: "Base Meal (/person)" }, mealEnable: { zh: "启用基础餐标", en: "Enable Base Meal" }, mealMode: { zh: "餐标方式", en: "Meal Mode" },
      mealPreset: { zh: "预设", en: "Presets" }, mealCustom: { zh: "自定义", en: "Custom" },
      itineraryLabel: { zh: "一日游行程内容", en: "One-Day Tour Itinerary" },
    };
    return dict[key]?.[lang] ?? key;
  };

  const carFeeFor = (n: number) => { if (n <= 2) return p.carTier1; if (n <= 4) return p.carTier2; if (n <= 12) return p.carTier3; return p.carTier4; };
  const selectedTickets = useMemo(() => ticketCatalog.filter((t) => p.selectedTicketIds.includes(t.id)), [ticketCatalog, p.selectedTicketIds]);
  const ticketSumPerPerson = useMemo(() => p.useTicketCatalog ? selectedTickets.reduce((acc, it) => acc + (Number.isFinite(it.price) ? it.price : 0), 0) : (p.manualTicketFeePerPerson || 0), [p.useTicketCatalog, p.manualTicketFeePerPerson, selectedTickets]);
  const mealPresets = [100, 200, 300, 500, 800, 1000, 1500, 2000, 3000, 4000];
  const effectiveMealPerPerson = p.mealEnabled ? p.mealPerPerson : 0;
  
  const computePrices = (n: number, params: Params) => {
    const car = carFeeFor(n);
    const fixedBase = params.guideFee + car + (params.boatIncluded ? params.boatFee : 0);
    const variableBase = (params.drinkIncluded ? params.drinkFeePerPerson : 0) + ticketSumPerPerson + effectiveMealPerPerson;
    let totalBeforeTax = fixedBase + variableBase * n;
    if (params.markupEnabled) { if (params.markupType === "percent") totalBeforeTax *= 1 + params.markupRate / 100; else totalBeforeTax += params.markupAmount; }
    let totalWithTax = totalBeforeTax;
    if (params.vatEnabled) totalWithTax *= 1 + params.vatRate / 100;
    if (params.roundMode === "groupThenDivide") { const roundedGroup = Math.round(totalWithTax); return { perPerson: roundedGroup / n, groupTotal: roundedGroup, car }; }
    else { const per = Math.round(totalWithTax / n); return { perPerson: per, groupTotal: per * n, car }; }
  };
  
  const current = useMemo(() => computePrices(p.pax, p), [p, ticketSumPerPerson, effectiveMealPerPerson]);
  const table = useMemo(() => Array.from({ length: 15 }, (_, i) => { const n = i + 1; const prices = computePrices(n, p); return { n, per: prices.perPerson, total: prices.groupTotal, car: prices.car }; }), [p, ticketSumPerPerson, effectiveMealPerPerson]);

  const setNum = (key: keyof Params) => (v: number) => setP((old) => ({ ...old, [key]: Number.isFinite(v) ? v : 0 }));
  const setBool = (key: keyof Params) => (v: boolean) => setP((old) => ({ ...old, [key]: v }));
  const setText = (key: keyof Params) => (v: string) => setP((old) => ({ ...old, [key]: v }));
  const toggleTicket = (id: string) => { setP((old) => { const set = new Set(old.selectedTicketIds); if (set.has(id)) set.delete(id); else set.add(id); return { ...old, selectedTicketIds: Array.from(set) }; }); };
  const updateTicketField = (id: string, field: keyof TicketItem, value: string | number) => { setTicketCatalog((list) => list.map((it) => (it.id === id ? { ...it, [field]: field === "price" ? Number(value) || 0 : value } : it))); };
  const addTicketToCatalog = () => { const newId = `t_${Date.now()}`; setTicketCatalog((list) => [...list, { id: newId, name_zh: "新项目", name_en: "New Item", price: 0 }]); };
  const removeTicketFromCatalog = (id: string) => { setTicketCatalog((list) => list.filter((it) => it.id !== id)); setP((old) => ({ ...old, selectedTicketIds: old.selectedTicketIds.filter((x) => x !== id) })); };
  const downloadCsv = () => { /* Logic to be implemented */ };

  // --- NEW: Quote Management Logic ---
  const handleSaveQuote = () => {
    const name = window.prompt(lang === 'zh' ? "为这个报价方案起个名字：" : "Enter a name for this quote:");
    if (name) {
      const newQuote: SavedQuote = {
        id: Date.now(),
        name,
        timestamp: new Date().toLocaleString(),
        params: p, // Save a snapshot of the current parameters `p`
      };
      setSavedQuotes([newQuote, ...savedQuotes]); // Add new quote to the top of the list
    }
  };

  const handleLoadQuote = (quoteId: number) => {
    const quoteToLoad = savedQuotes.find(q => q.id === quoteId);
    if (quoteToLoad && window.confirm(`${lang === 'zh' ? '确定要读取' : 'Are you sure you want to load'} "${quoteToLoad.name}"? ${lang === 'zh' ? '当前参数将被覆盖。' : 'Current parameters will be overwritten.'}`)) {
      setP(quoteToLoad.params);
    }
  };

  const handleDeleteQuote = (quoteId: number) => {
    const quoteToDelete = savedQuotes.find(q => q.id === quoteId);
    if (quoteToDelete && window.confirm(`${lang === 'zh' ? '确定要删除' : 'Are you sure you want to delete'} "${quoteToDelete.name}"?`)) {
        setSavedQuotes(savedQuotes.filter(q => q.id !== quoteId));
    }
  };

  return (
    <div style={{ width: '100%', maxWidth: '1400px' }}>
      <main className="container">
        <header>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div><h2 style={{ marginBottom: 0 }}>{t("title")}</h2><p>{t("subtitle")}</p></div>
            <label>{t("lang")}:<select value={lang} onChange={(e) => setLang(e.target.value as Lang)} style={{ width: 'auto' }}><option value="zh">简体中文</option><option value="en">English</option></select></label>
          </div>
        </header>

        <article>
          <label htmlFor="itinerary">{t("itineraryLabel")}</label>
          <textarea id="itinerary" rows={3} value={p.itinerary} onChange={(e) => setText("itinerary")(e.target.value)}
            placeholder={lang === "zh" ? "例如: 09:00 酒店出发 -> 10:00 大皇宫..." : "e.g., 09:00 Hotel pick-up -> 10:00 Grand Palace..."}
          ></textarea>
        </article>
        
        <div className="grid">
          <article>
            <h4 style={{marginTop: 0}}>{t("pax")}</h4>
            <input type="number" min="1" max="15" value={p.pax} onChange={(e) => setP((o) => ({ ...o, pax: Math.min(15, Math.max(1, Math.round(Number(e.target.value)))) }))} />
            <h4>{t("guide")}</h4>
            <input type="number" value={p.guideFee} onChange={(e) => setNum("guideFee")(Number(e.target.value))} />
            <label><input type="checkbox" role="switch" checked={p.boatIncluded} onChange={(e) => setBool("boatIncluded")(e.target.checked)} /> {t("boatInc")}</label>
            <input type="number" placeholder={t("boatFee")} value={p.boatFee} onChange={(e) => setNum("boatFee")(Number(e.target.value))} disabled={!p.boatIncluded} />
            <label><input type="checkbox" role="switch" checked={p.drinkIncluded} onChange={(e) => setBool("drinkIncluded")(e.target.checked)} /> {t("drinkInc")}</label>
            <input type="number" placeholder={t("drinkFee")} value={p.drinkFeePerPerson} onChange={(e) => setNum("drinkFeePerPerson")(Number(e.target.value))} disabled={!p.drinkIncluded} />
            <article style={{padding: '1rem', marginTop: '1rem'}}>
              <header><label><input type="checkbox" role="switch" checked={p.mealEnabled} onChange={(e) => setBool("mealEnabled")(e.target.checked)} /> {t("mealEnable")}</label></header>
              <div className="grid">
                <select value={p.mealMode} onChange={(e) => setP((o) => ({ ...o, mealMode: e.target.value as "preset" | "custom" }))} disabled={!p.mealEnabled}>
                  <option value="preset">{t("mealPreset")}</option><option value="custom">{t("mealCustom")}</option>
                </select>
                {p.mealMode === "preset" ? (
                  <select value={p.mealPerPerson} onChange={(e) => setP((o) => ({ ...o, mealPerPerson: Number(e.target.value) }))} disabled={!p.mealEnabled}>
                    {mealPresets.map(v => <option key={v} value={v}>{v} THB</option>)}
                  </select>
                ) : ( <input type="number" value={p.mealPerPerson} onChange={(e) => setNum("mealPerPerson")(Number(e.target.value))} disabled={!p.mealEnabled} /> )}
              </div>
            </article>
          </article>
          <article>
            <h4 style={{marginTop: 0}}>{t("carTiers")}</h4>
            <label>{t("tier1")}</label><input type="number" value={p.carTier1} onChange={(e) => setNum("carTier1")(Number(e.target.value))} />
            <label>{t("tier2")}</label><input type="number" value={p.carTier2} onChange={(e) => setNum("carTier2")(Number(e.target.value))} />
            <label>{t("tier3")}</label><input type="number" value={p.carTier3} onChange={(e) => setNum("carTier3")(Number(e.target.value))} />
            <label>{t("tier4")}</label><input type="number" value={p.carTier4} onChange={(e) => setNum("carTier4")(Number(e.target.value))} />
            <h4 style={{marginTop: '2rem'}}>{t("taxes")}</h4>
            <label><input type="checkbox" role="switch" checked={p.vatEnabled} onChange={(e) => setBool("vatEnabled")(e.target.checked)} />{t("vat")}</label>
            <input type="number" value={p.vatRate} onChange={(e) => setNum("vatRate")(Number(e.target.value))} disabled={!p.vatEnabled} />
            <label><input type="checkbox" role="switch" checked={p.markupEnabled} onChange={(e) => setBool("markupEnabled")(e.target.checked)} />{t("markup")}</label>
            <div className="grid">
              <select value={p.markupType} onChange={(e) => setP((o) => ({...o, markupType: e.target.value as MarkupType}))} disabled={!p.markupEnabled}>
                <option value="percent">{lang === "zh" ? "百分比" : "Percent"}</option><option value="amount">{lang === "zh" ? "固定金额" : "Amount"}</option>
              </select>
              {p.markupType === "percent" ? (
                <input type="number" placeholder={t("markupPercent")} value={p.markupRate} onChange={(e) => setNum("markupRate")(Number(e.target.value))} disabled={!p.markupEnabled} />
              ) : ( <input type="number" placeholder={t("markupAmount")} value={p.markupAmount} onChange={(e) => setNum("markupAmount")(Number(e.target.value))} disabled={!p.markupEnabled} /> )}
            </div>
            <fieldset><legend>{t("rounding")}</legend>
              <label><input type="radio" name="roundMode" value="perPerson" checked={p.roundMode === "perPerson"} onChange={() => setP(o => ({...o, roundMode: "perPerson"}))} /> {t("modePer")}</label>
              <label><input type="radio" name="roundMode" value="groupThenDivide" checked={p.roundMode === "groupThenDivide"} onChange={() => setP(o => ({...o, roundMode: "groupThenDivide"}))} /> {t("modeTotal")}</label>
            </fieldset>
          </article>
        </div>
        <article style={{marginTop: '2rem'}}>
          <h4>{t("tickets")}</h4>
          <label><input type="checkbox" role="switch" checked={p.useTicketCatalog} onChange={(e) => setBool("useTicketCatalog")(e.target.checked)} /> {t("useCatalog")}</label>
          {p.useTicketCatalog ? (
            <div>
              {ticketCatalog.map(it => (
                <div key={it.id} style={{display: 'grid', gridTemplateColumns: 'auto 1fr 1fr auto', gap: '1rem', alignItems: 'center', marginBottom: '1rem'}}>
                  <input type="checkbox" checked={p.selectedTicketIds.includes(it.id)} onChange={() => toggleTicket(it.id)} />
                  <input type="text" placeholder={lang === "zh" ? "项目名称" : "Item Name"} value={lang === "zh" ? it.name_zh : it.name_en} onChange={e => updateTicketField(it.id, lang === "zh" ? "name_zh" : "name_en", e.target.value)} />
                  <input type="number" placeholder={lang === "zh" ? "价格" : "Price"} value={it.price} onChange={e => updateTicketField(it.id, "price", Number(e.target.value))} />
                  <button style={{padding: '0 5px', border: 'none', background: 'transparent', color: 'var(--pico-secondary-hover)', cursor: 'pointer', fontWeight: 'bold' }} onClick={() => removeTicketFromCatalog(it.id)} title="Remove">✕</button>
                </div>
              ))}
              <button className="outline" onClick={addTicketToCatalog}>{t("addTicket")}</button>
            </div>
          ) : ( <input type="number" placeholder={t("manualTicket")} value={p.manualTicketFeePerPerson} onChange={(e) => setNum("manualTicketFeePerPerson")(Number(e.target.value))} /> )}
          <h4 style={{marginTop: '2rem'}}>{t("result")}</h4>
          <div className="grid">
            <article style={{padding: '1rem', textAlign: 'center'}}><p style={{marginBottom: '0.5rem'}}>{t("perPerson")}</p><h3 style={{margin:0, color: 'var(--pico-primary)'}}>{fmtTHB(current.perPerson)}</h3></article>
            <article style={{padding: '1rem', textAlign: 'center'}}><p style={{marginBottom: '0.5rem'}}>{t("total")}</p><h3 style={{margin:0, color: 'var(--pico-primary)'}}>{fmtTHB(current.groupTotal)}</h3></article>
          </div>
          {/* NEW Save Button */}
          <button onClick={handleSaveQuote} style={{width: '100%', marginTop: '1rem'}}>{t("saveQuote")}</button>
          <details style={{marginTop: '1rem'}}>
            <summary>{t("breakdown")}</summary>
            <ul>
                <li>{t("fixed")}: {fmtTHB(p.guideFee)} ({t("guide").split(' ')[0]}) + {fmtTHB(carFeeFor(p.pax))} ({t("vehicle")}) {p.boatIncluded && <> + {fmtTHB(p.boatFee)} ({t("boat")})</>}</li>
                <li>{t("variable")}: {fmtTHB(ticketSumPerPerson)} (项目库) {p.drinkIncluded && <> + {fmtTHB(p.drinkFeePerPerson)} ({t("drink")})</>} {effectiveMealPerPerson > 0 && <>+ {fmtTHB(effectiveMealPerPerson)} (基础餐标)</>}</li>
                {(p.markupEnabled || p.vatEnabled) && <li><small>{p.markupEnabled && `${t("markupLabel")}: ${p.markupType === "percent" ? `${p.markupRate}%` : fmtTHB(p.markupAmount)}`}{p.vatEnabled && ` | ${t("vatLabel")}: ${p.vatRate}%`}</small></li>}
            </ul>
          </details>
          <div className="grid">
            <button onClick={downloadCsv}>{t("exportCsv")}</button>
            <button className="secondary" onClick={() => { if(window.confirm('确定要重置所有参数吗? 这将清除所有当前输入。')) { setP(DEFAULTS); setTicketCatalog(DEFAULT_TICKETS); } }}>{t("reset")}</button>
          </div>
        </article>
        
        {/* NEW: Saved Quotes Section */}
        <article style={{ marginTop: '2rem' }}>
          <h4>{t("savedQuotesTitle")}</h4>
          {savedQuotes.length === 0 ? (
            <p><small>{lang === 'zh' ? '还没有保存的报价。' : 'No saved quotes yet.'}</small></p>
          ) : (
            savedQuotes.map(quote => (
              <details key={quote.id}>
                <summary>
                  <strong>{quote.name}</strong> - <small>{quote.timestamp}</small>
                </summary>
                <div className="grid">
                  <button className="outline" onClick={() => handleLoadQuote(quote.id)}>{t("load")}</button>
                  <button className="secondary outline" onClick={() => handleDeleteQuote(quote.id)}>{t("delete")}</button>
                </div>
              </details>
            ))
          )}
        </article>

        <article style={{ marginTop: '2rem' }}>
          <h4>{t("tableTitle")}</h4>
          <div style={{overflowX: 'auto'}}>
            <table>
              <thead><tr><th>#</th><th>{t("perPerson")}</th><th>{t("total")}</th><th>{t("vehicle")}</th><th>{t("boat")}</th><th>{t("drink")}</th></tr></thead>
              <tbody>
                {table.map(row => (
                  <tr key={row.n}>
                    <td>{row.n}</td><td>{fmtTHB(row.per)}</td><td>{fmtTHB(row.total)}</td><td>{fmtTHB(row.car)}</td>
                    <td>{p.boatIncluded ? (lang === 'zh' ? '是' : 'Yes') : (lang === 'zh' ? '否' : 'No')}</td>
                    <td>{p.drinkIncluded ? (lang === 'zh' ? '是' : 'Yes') : (lang === 'zh' ? '否' : 'No')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>
      </main>
    </div>
  );
}