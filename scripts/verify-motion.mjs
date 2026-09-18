/**
 * [INPUT]: hero-motion.js 的纯计算接口。
 * [OUTPUT]: 几何、刷新率一致性、惯性端点与收敛断言。
 * [POS]: 首页动效回归入口；浏览器中间帧验证另外记录。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import assert from 'node:assert/strict';
import {REEL,damp,projectedTarget,titleGeometry} from '../src/hero-motion.js';
assert.equal(REEL.perspective,680);
assert.equal(titleGeometry(0,0).transform,'translateY(-50%) rotateX(0.0000deg) translateZ(125px)');
assert.equal(titleGeometry(1,0).angle,-23);
assert.equal(titleGeometry(0,4).opacity,0);
assert.ok(Math.abs(titleGeometry(0,3).opacity-.079)<.001);
assert.equal(projectedTarget(-.8,-.1,5),0);
assert.equal(projectedTarget(4.8,.1,5),4);
assert.equal(projectedTarget(1.3,.003,5),2);
function advance(hz){let value=0;for(let i=0;i<hz;i++)value=damp(value,3,1000/hz);return value;}
assert.ok(Math.abs(advance(60)-advance(120))<.0001,'刷新率变化不应改变一秒后的阻尼结果');
assert.ok(advance(60)>2.999);
let current=0;
for(let i=0;i<120;i++){const next=damp(current,4,16.667);assert.ok(next>=current&&next<=4);current=next;}
assert.equal(current,4);
console.log('PASS: cylinder geometry, opacity, frame-rate independence, inertia bounds and convergence.');
