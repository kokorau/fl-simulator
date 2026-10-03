export const defaults = {
  days: 26, customers: 70, price: 1600, seats: 15,
  meatKg: 20, meatPrice: 700, yield: 62.5, cookYield: 73, portion: 130,
  sides: 180, drinkCost: 70, drinkRate: 40, packaging: 25, fee: 3,
  salary: 350000, hourly: 1400, staffHours: 12, burden: 15,
  rent: 300000, utilities: 150000, other: 100000, depreciation: 30000,
  savings: 4000000, borrowing: 2000000, property: 1000000, equipment: 1800000, setup: 400000,
  ownerDraw: 300000, repayment: 50000, interest: 10000, taxReserve: 50000,
  startRate: 55, rampMonths: 6,
}
export type Plan = typeof defaults
export type Key = keyof Plan
export type Field = { key: Key; label: string; unit: string; min: number; max: number; step: number; help?: string }
export const groups: { title: string; subtitle: string; fields: Field[] }[] = [
  {title: '売上と営業', subtitle: '来てほしいお客さんと、届けたい価格。', fields: [
    {key:'days',label:'月の営業日数',unit:'日',min:1,max:31,step:1},
    {key:'customers',label:'1日の想定客数',unit:'人',min:0,max:500,step:1},
    {key:'price',label:'平均客単価',unit:'円',min:0,max:10000,step:50,help:'ドリンク・サイドを含む、税抜の平均注文額'},
    {key:'seats',label:'席数',unit:'席',min:1,max:100,step:1},
  ]},
  {title:'仕入れと歩留まり', subtitle:'半丸40kgのうち、1日20kgを使う仮説。', fields:[
    {key:'meatKg',label:'1日の枝肉使用量',unit:'kg',min:0,max:200,step:0.5,help:'骨・脂を含む重量。半丸を複数日に分ける想定'},
    {key:'meatPrice',label:'枝肉の仕入単価',unit:'円/kg',min:0,max:5000,step:10},
    {key:'yield',label:'調理に使える割合',unit:'%',min:0,max:100,step:0.5,help:'骨や分離した脂などを除いた、鍋に入れる可食部'},
    {key:'cookYield',label:'加熱後の歩留まり',unit:'%',min:0,max:100,step:1},
    {key:'portion',label:'1人前の調理後の肉',unit:'g',min:1,max:500,step:5},
    {key:'sides',label:'トルティーヤ・薬味など',unit:'円/人',min:0,max:2000,step:10,help:'3枚、サルサ、ライム、調味料など。販売人数分を計上'},
    {key:'drinkCost',label:'ドリンク1杯の原価',unit:'円',min:0,max:2000,step:10},
    {key:'drinkRate',label:'ドリンク注文率',unit:'%',min:0,max:100,step:5},
    {key:'packaging',label:'包材・紙など',unit:'円/人',min:0,max:500,step:5},
    {key:'fee',label:'平均決済手数料率',unit:'%',min:0,max:10,step:0.1},
  ]},
  {title:'人員と毎月の経費', subtitle:'仕込み・営業・片付けの時間を含めます。', fields:[
    {key:'salary',label:'従業員の月給合計',unit:'円/月',min:0,max:3000000,step:10000,help:'店主を除く。店主の生活費は資金計画で設定'},
    {key:'hourly',label:'アルバイト時給',unit:'円',min:0,max:5000,step:50},
    {key:'staffHours',label:'アルバイトの延べ時間',unit:'時間/日',min:0,max:100,step:0.5,help:'例：2人 × 6時間 = 12時間。仕込みも含む'},
    {key:'burden',label:'給与への追加負担率',unit:'%',min:0,max:50,step:1,help:'会社負担分などの概算。給与・時給の合計に加算'},
    {key:'rent',label:'家賃・共益費',unit:'円/月',min:0,max:3000000,step:10000},
    {key:'utilities',label:'水道光熱費',unit:'円/月',min:0,max:1000000,step:10000},
    {key:'other',label:'その他固定費',unit:'円/月',min:0,max:1000000,step:10000,help:'通信、保険、清掃、広告、会計など'},
    {key:'depreciation',label:'減価償却費',unit:'円/月',min:0,max:500000,step:5000,help:'設備費の月次配分。現金支出には重ねて計上しない'},
  ]},
  {title:'開業資金と生活費', subtitle:'開店後に残る現金まで、ひと続きで。', fields:[
    {key:'savings',label:'事業に投入する自己資金',unit:'円',min:0,max:100000000,step:100000},
    {key:'borrowing',label:'開業時の借入金',unit:'円',min:0,max:100000000,step:100000},
    {key:'property',label:'物件取得費',unit:'円',min:0,max:50000000,step:100000,help:'保証金・礼金・仲介料などの開業時支出'},
    {key:'equipment',label:'内装・厨房設備',unit:'円',min:0,max:50000000,step:100000},
    {key:'setup',label:'備品・その他開業費',unit:'円',min:0,max:10000000,step:50000},
    {key:'ownerDraw',label:'店主の生活費',unit:'円/月',min:0,max:2000000,step:10000,help:'個人事業を想定した事業主の引出し。Lには含めない'},
    {key:'repayment',label:'借入元本返済',unit:'円/月',min:0,max:2000000,step:10000},
    {key:'interest',label:'借入利息',unit:'円/月',min:0,max:500000,step:1000},
    {key:'taxReserve',label:'税金などの積立',unit:'円/月',min:0,max:1000000,step:10000,help:'税額の自動計算ではなく、使わない資金として控除'},
    {key:'startRate',label:'開業初月の集客達成率',unit:'%',min:0,max:100,step:5},
    {key:'rampMonths',label:'想定客数に達する月',unit:'か月目',min:1,max:12,step:1},
  ]},
]
export function calculate(p: Plan, demand = p.customers) {
  const cookedKg = p.meatKg * p.yield / 100 * p.cookYield / 100
  const capacity = Math.floor(cookedKg * 1000 / p.portion)
  const sold = Math.min(demand, capacity)
  const revenue = sold * p.days * p.price
  const meat = p.meatKg * p.meatPrice * p.days
  const extraFood = sold * p.days * (p.sides + p.drinkCost * p.drinkRate / 100)
  const food = meat + extraFood
  const labor = (p.salary + p.hourly * p.staffHours * p.days) * (1 + p.burden / 100)
  const variable = sold * p.days * p.packaging + revenue * p.fee / 100
  const fixed = p.rent + p.utilities + p.other + p.depreciation
  const profit = revenue - food - labor - variable - fixed
  const cash = profit + p.depreciation - p.ownerDraw - p.repayment - p.interest - p.taxReserve
  const contribution = p.price * (1 - p.fee / 100) - p.sides - p.drinkCost * p.drinkRate / 100 - p.packaging
  const breakEven = contribution > 0 ? (meat + labor + fixed) / (contribution * p.days) : null
  const cashBreakEven = contribution > 0 ? (meat + labor + fixed - p.depreciation + p.ownerDraw + p.repayment + p.interest + p.taxReserve) / (contribution * p.days) : null
  return { capacity, cookedKg, sold, revenue, meat, food, labor, variable, fixed, profit, cash, breakEven, cashBreakEven,
    waste: Math.max(0, cookedKg - sold * p.portion / 1000), lost: Math.max(0, demand - sold),
    fRate: revenue > 0 ? food / revenue * 100 : null, lRate: revenue > 0 ? labor / revenue * 100 : null,
  }
}
export function cashProjection(p: Plan) {
  let balance = p.savings + p.borrowing - p.property - p.equipment - p.setup
  return Array.from({length:12}, (_,i) => {
    const rate = p.rampMonths === 1 ? 1 : p.startRate / 100 + (1 - p.startRate / 100) * Math.min(i / (p.rampMonths - 1), 1)
    const result = calculate(p, p.customers * rate)
    balance += result.cash
    return {month:i+1, balance, cash:result.cash, customers: result.sold}
  })
}
export function restore(value: unknown): Plan {
  const plan = {...defaults}
  if (typeof value !== 'object' || !value) return plan
  for (const field of groups.flatMap(g => g.fields)) {
    const v = (value as Record<string, unknown>)[field.key]
    if (typeof v === 'number' && Number.isFinite(v)) plan[field.key] = Math.min(field.max, Math.max(field.min, v))
  }
  return plan
}
