import { useState } from 'react'
import { calculate, cashProjection, defaults, groups, restore } from './model'
import type { Field, Plan } from './model'
import './App.css'

const yen = (n: number) => Math.round(n).toLocaleString('ja-JP')
const man = (n: number) => (n / 10000).toLocaleString('ja-JP', { maximumFractionDigits: 1 })
const percent = (n: number | null) => n === null ? '—' : `${n.toFixed(1)}%`
const storageKey = 'fl-simulator:v1'
function initialPlan() {
  try { return restore(JSON.parse(localStorage.getItem(storageKey) || 'null')) } catch { return {...defaults} }
}
function Input({ field, value, onChange }: {field: Field; value: number; onChange: (n:number)=>void}) {
  const [draft, setDraft] = useState(String(value))
  const [previous, setPrevious] = useState(value)
  if (previous !== value) { setPrevious(value); setDraft(String(value)) }
  return <label className="field" htmlFor={field.key}>
    <span>{field.label}</span>
    <div className="input-wrap"><input id={field.key} type="number" min={field.min} max={field.max} step={field.step} value={draft}
      onChange={e => {const raw=e.target.value; setDraft(raw); const n=Number(raw); if(raw !== '' && Number.isFinite(n) && n >= field.min && n <= field.max) onChange(n)}}
      onBlur={() => {const n=draft === '' ? value : Number(draft); const next=Number.isFinite(n) ? Math.min(field.max,Math.max(field.min,n)) : value; onChange(next); setDraft(String(next))}} />
    <span>{field.unit}</span></div>{field.help && <small>{field.help}</small>}
  </label>
}
function App() {
  const [plan, setPlan] = useState<Plan>(initialPlan)
  const [tab, setTab] = useState(0)
  const [saved, setSaved] = useState(true)
  const [resetOpen,setResetOpen] = useState(false)
  function updatePlan(next: Plan) {
    setPlan(next)
    try {localStorage.setItem(storageKey,JSON.stringify(next)); setSaved(true)} catch {setSaved(false)}
  }
  const r = calculate(plan), base = calculate(defaults), months = cashProjection(plan)
  const opening = plan.savings + plan.borrowing - plan.property - plan.equipment - plan.setup
  const shortage = opening < 0 ? 0 : months.find(m=>m.balance<0)?.month
  const fl = r.fRate === null || r.lRate === null ? null : r.fRate + r.lRate
  const change = r.profit - base.profit
  const chartValues = [opening,...months.map(m=>m.balance)]
  const chartMin = Math.min(0,...chartValues), chartMax = Math.max(10000,...chartValues)
  const y = (v:number) => 160 - (v-chartMin)/(chartMax-chartMin)*135
  const points = chartValues.map((v,i)=>`${48+i*47},${y(v)}`).join(' ')
  const costs = [{label:'食材原価 F',value:r.food,color:'#c48751'},{label:'人件費 L',value:r.labor,color:'#d9b77d'},{label:'家賃・その他',value:r.fixed+r.variable,color:'#c5cdc3'},{label:'営業利益',value:Math.max(0,r.profit),color:'#3c705a'}]
  const scenarios = [40,60,80,100,140]
  return <div className="app-shell">
    <aside className="sidebar"><a className="brand" href="#"><span className="brand-icon">fl<span>↗</span></span><span>FL Simulator<small>飲食店の開業を、数字から。</small></span></a>
      <div className="nav-label">WORKSPACE</div><div className="nav-current"><span>◫</span> 開業シミュレーション</div>
      <div className="sidebar-note"><span className="tiny-dot"/> PLANNING MODE<h3>理想のお店を、<br/>少しずつ具体的に。</h3><p>まだ決まっていない数字も、<br/>仮説から始めてみましょう。</p></div>
      <div className="sidebar-bottom">CARNITAS PROJECT<span>Sample model · v1.0</span></div>
    </aside>
    <main>
      <header><div className="breadcrumb">ワークスペース <span>/</span> 開業計画</div><span className="save-status"><span className="tiny-dot"/>{saved ? 'このブラウザに自動保存' : '保存できません・この画面でのみ保持'}</span></header>
      <div className="page-content"><div className="page-heading"><div><p className="eyebrow">BUILD YOUR RESTAURANT</p><h1>お店の未来を、シミュレーション。</h1><p>条件を変えながら、続けられるお店のかたちを探そう。</p></div><button className="reset" onClick={()=>setResetOpen(true)}>↺ 初期サンプルに戻す</button></div>
      {resetOpen && <div className="reset-confirm" role="alert">入力した条件を初期サンプルに戻しますか？<button onClick={()=>{updatePlan({...defaults});setResetOpen(false)}}>戻す</button><button onClick={()=>setResetOpen(false)}>キャンセル</button></div>}
      <section className="concept"><div className="concept-icon">✳</div><div><div className="concept-title">カルニータスのタケリア <span>初期サンプル</span></div><p>半丸仕入れ / 自家製トルティーヤ / キャッシュオン / 当日売り切り</p></div><div className="concept-tag">すべての数値は調整できます</div></section>
      <div className="workspace"><section className="editor panel"><div className="panel-heading"><div><h2>計画の条件</h2><p>数値の変更をすぐに収支に反映</p></div><span className="section-number">01—04</span></div>
        <div className="editor-tabs" role="tablist" aria-label="入力項目">{['売上','仕入れ','経費','資金'].map((name,i)=><button key={name} role="tab" id={`tab-${i}`} aria-selected={tab===i} aria-controls={`form-${i}`} onClick={()=>setTab(i)}>{name}</button>)}</div>
        <div role="tabpanel" id={`form-${tab}`} aria-labelledby={`tab-${tab}`} className="fields"><h3>{groups[tab].title}</h3><p className="muted intro">{groups[tab].subtitle}</p>{groups[tab].fields.map(field=><Input key={field.key} field={field} value={plan[field.key]} onChange={n=>updatePlan({...plan,[field.key]:n})}/>)}</div>
        <div className="editor-foot">ⓘ 過去の構想をもとにした仮説です。<br/>仕入れ見積もりや試作結果で更新していきましょう。</div>
      </section>
      <div className="results"><div className="results-title"><h2>シミュレーション結果</h2><span>通常月 · 税抜ベース</span></div>
      <section className="metrics" aria-label="月次の主要指標"><div className="metric"><span>月間売上</span><strong>{man(r.revenue)}<small>万円</small></strong><p>1日 {r.sold.toFixed(1).replace('.0','')}人 × {plan.days}日営業</p></div><div className={`metric profit ${r.profit<0?'negative':''}`}><span>営業利益 <em>店主生活費控除前</em></span><strong>{man(r.profit)}<small>万円</small></strong><p>初期サンプル比 {change>=0?'+':''}{man(change)}万円</p></div><div className="metric"><span>FL比率</span><strong>{percent(fl)}</strong><p>F {percent(r.fRate)} <span className="divider">/</span> L {percent(r.lRate)}</p></div></section>
      <section className="panel production"><div className="compact-heading"><h2>仕込みと販売のバランス</h2><span>1日あたり</span></div><div className="production-flow"><div><span>枝肉</span><strong>{plan.meatKg}<small>kg</small></strong></div><b>→</b><div><span>加熱後</span><strong>{r.cookedKg.toFixed(1)}<small>kg</small></strong></div><b>→</b><div><span>作れる食数</span><strong>{r.capacity}<small>食</small></strong></div><b>→</b><div className="sold"><span>売れる食数</span><strong>{r.sold.toFixed(1).replace('.0','')}<small>食</small></strong></div></div>
      <div className="production-details"><span>売れ残りの肉 <b>{r.waste.toFixed(2)} kg</b></span><span>供給不足 <b>{r.lost.toFixed(1).replace('.0','')} 食</b></span><span>全員店内なら <b>{(r.sold/plan.seats).toFixed(1)} 回転/日</b></span></div>
      {r.lost>0 && <p className="notice">仕込み量が不足しています。売上は提供できる {r.capacity} 食/日を上限に計算しています。</p>}{r.waste>0.5 && <p className="notice">売れ残る肉の仕入れ費も原価に含まれています。客数に合わせて仕込み量を調整してみましょう。</p>}</section>
      <div className="two-col"><section className="panel breakdown"><div className="compact-heading"><h2>月次の収支</h2><span>万円 / 月</span></div><div className="cost-bar">{costs.map(c=><div key={c.label} style={{flex:c.value||0.001,background:c.color}} title={`${c.label} ${man(c.value)}万円`}/>)}</div><dl>{costs.slice(0,3).map(c=><div key={c.label}><dt><i style={{background:c.color}}/>{c.label}</dt><dd>{man(c.value)}</dd></div>)}<div className="total"><dt>営業利益</dt><dd className={r.profit<0?'red':''}>{man(r.profit)}</dd></div></dl><small>家賃・その他には光熱費、決済・包材、減価償却費を含みます。</small></section>
      <section className="panel breakeven"><div className="compact-heading"><h2>何人来れば、続けられる？</h2></div><span className="muted">営業損益分岐点</span><div className="big-number">{r.breakEven===null?'—':Math.ceil(r.breakEven)}<small>人 / 日</small></div><p>生活費・返済・積立まで賄うには<br/><b>{r.cashBreakEven===null?'算出不可':`${Math.ceil(r.cashBreakEven)} 人 / 日`}</b></p>{r.cashBreakEven !== null && r.cashBreakEven > r.capacity && <div className="notice">現在の仕込み上限を超えています</div>}{r.breakEven===null && <div className="notice">1食売るごとの収入が追加費用を上回りません</div>}<small>現在の仕込み量・人員・経費を固定して逆算。</small></section></div>
      <section className="panel scenarios"><div className="compact-heading"><h2>客数が変わると、どうなる？</h2><span>同じ仕込み量・人員で比較</span></div><div className="table-scroll"><table><thead><tr><th>想定客数 / 日</th><th>実売 / 日</th><th>月間売上</th><th>営業利益</th><th>資金増減</th></tr></thead><tbody>{scenarios.map(n=>{const s=calculate(plan,n);return <tr key={n}><th>{n}人</th><td>{s.sold}食{s.lost>0 && <span className="cap-label">上限</span>}</td><td>{man(s.revenue)}万</td><td className={s.profit<0?'red':'green'}>{man(s.profit)}万</td><td className={s.cash<0?'red':'green'}>{man(s.cash)}万</td></tr>})}</tbody></table></div></section>
      <section className="panel cash-panel"><div className="compact-heading"><div><h2>開業から12か月の資金計画</h2><p>集客の立ち上がりを含めた、積立控除後の使える資金</p></div><span className={`pill ${shortage!==undefined?'warning':''}`}>{shortage===0?'開業資金が不足':shortage!==undefined?`${shortage}か月目に資金不足`:'12か月の残高はプラス'}</span></div>
      <div className="cash-summary"><div><span>開業直後</span><strong>{man(opening)}<small>万円</small></strong></div><div><span>通常月の資金増減</span><strong className={r.cash<0?'red':'green'}>{r.cash>=0?'+':''}{man(r.cash)}<small>万円</small></strong></div><div><span>12か月後</span><strong className={months[11].balance<0?'red':''}>{man(months[11].balance)}<small>万円</small></strong></div></div>
      <svg className="cash-chart" viewBox="0 0 650 195" role="img" aria-label={`12か月の資金推移。開業直後${yen(opening)}円、12か月後${yen(months[11].balance)}円`}><text x="0" y="18">{man(chartMax)}万</text><text x="0" y="165">{man(chartMin)}万</text><line x1="48" x2="612" y1={y(0)} y2={y(0)} stroke="#c5cdc3" strokeDasharray="4 4"/><polygon points={`48,${y(0)} ${points} 612,${y(0)}`} fill="#edf2e9"/><polyline points={points} fill="none" stroke="#426b50" strokeWidth="2.5"/>{chartValues.map((v,i)=><g key={i}><circle cx={48+i*47} cy={y(v)} r="3" fill={v<0?'#b56045':'#426b50'}/><text x={48+i*47} y="188" textAnchor="middle">{i===0?'開業':`${i}月`}</text></g>)}</svg>
      <details><summary>月別の内訳と計算の前提を見る</summary><p className="muted">初月は想定客数の{plan.startRate}%、{plan.rampMonths}か月目に100%へ。仕込み量・人件費・その他費用は初月から一定です。</p><div className="table-scroll"><table><thead><tr><th>月</th><th>実売 / 日</th><th>資金増減</th><th>月末残高</th></tr></thead><tbody>{months.map(m=><tr key={m.month}><th>{m.month}か月</th><td>{m.customers.toFixed(1)}食</td><td>{man(m.cash)}万</td><td className={m.balance<0?'red':''}>{man(m.balance)}万</td></tr>)}</tbody></table></div><p className="muted">資金増減 = 営業利益 ＋ 減価償却費 − 店主生活費 − 元本返済 − 利息 − 税金などの積立。</p></details></section>
      <section className="assumptions"><h3>このシミュレーションの前提</h3><p>1人1食、金額はすべて税抜。個人事業を想定し、店主生活費は人件費に含めず資金から控除します。食材原価は当日の枝肉使用量の全額と販売数に応じた副材料費。骨・脂などの副産物売上は含みません。トルティーヤなど副材料の売れ残りは未計上です。</p><p>資金計画は概算です。消費税の納付・還付、入出金の時差、仕入在庫、借入完済後の返済終了は未反映。税金は指定の積立額で見込みます。設備能力やピーク時の提供速度は別途検証が必要です。</p></section>
      </div></div><footer>FL SIMULATOR <span>小さな仮説から、あなたのお店へ。</span></footer></div>
    </main>
  </div>
}
export default App
