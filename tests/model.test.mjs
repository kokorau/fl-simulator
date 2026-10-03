import {test} from 'node:test'
import assert from 'node:assert/strict'
import {calculate, cashProjection, defaults, restore} from '../src/model.ts'

test('sample uses full purchased meat cost and caps sales at supply',()=>{
 const r=calculate(defaults)
 assert.equal(r.capacity,70)
 assert.equal(r.revenue,2912000)
 assert.equal(r.meat,364000)
 assert.equal(r.food,742560)
 assert.ok(Math.abs(r.labor-904820)<0.001)
 assert.ok(Math.abs(r.profit-551760)<0.001)
 assert.ok(Math.abs(r.cash-171760)<0.001)
 const high=calculate(defaults,140)
 assert.equal(high.revenue,r.revenue)
 assert.equal(high.lost,70)
 const low=calculate(defaults,40)
 assert.equal(low.meat,r.meat)
 assert.ok(low.waste>r.waste)
})
test('break even actually zeros profit or spendable cash when capacity allows',()=>{
 const p={...defaults,meatKg:100,price:5000}
 const r=calculate(p)
 assert.ok(r.breakEven<r.capacity)
 assert.ok(Math.abs(calculate(p,r.breakEven).profit)<0.00001)
 assert.ok(Math.abs(calculate(p,r.cashBreakEven).cash)<0.00001)
})
test('zero demand, zero capacity and unprofitable unit sales stay finite',()=>{
 const zero=calculate({...defaults,customers:0})
 assert.equal(zero.fRate,null)
 assert.equal(zero.revenue,0)
 assert.equal(calculate({...defaults,yield:0}).sold,0)
 const bad=calculate({...defaults,price:0})
 assert.equal(bad.breakEven,null)
 assert.equal(bad.cashBreakEven,null)
 assert.ok(Number.isFinite(bad.profit))
})
test('cash ramp and startup outlay reconcile month by month',()=>{
 const p={...defaults,startRate:50,rampMonths:6}
 const months=cashProjection(p)
 let balance=2800000
 assert.equal(months[0].customers,35)
 assert.equal(months[5].customers,70)
 for(const m of months){balance+=m.cash;assert.equal(m.balance,balance)}
 assert.equal(cashProjection({...p,rampMonths:1})[0].customers,70)
})
test('cash does not double count depreciation, opening funding or owner draw',()=>{
 const r=calculate(defaults)
 const changed=calculate({...defaults,depreciation:80000})
 assert.ok(Math.abs(changed.profit-r.profit+50000)<0.001)
 assert.ok(Math.abs(changed.cash-r.cash)<0.001)
 assert.equal(calculate({...defaults,ownerDraw:0}).labor,r.labor)
 assert.ok(Math.abs(calculate({...defaults,ownerDraw:0}).cash-r.cash-300000)<0.001)
})
test('stored data validates finite numeric values and bounds',()=>{
 const p=restore({portion:0,days:99,customers:'bad',price:Infinity,meatKg:-5})
 assert.equal(p.portion,1);assert.equal(p.days,31);assert.equal(p.customers,70);assert.equal(p.price,1600);assert.equal(p.meatKg,0)
 assert.deepEqual(restore(null),defaults)
})
