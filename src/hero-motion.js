/**
 * [INPUT]: 滚动目标、帧间隔、作品索引。
 * [OUTPUT]: 与刷新率无关的阻尼、吸附和实测圆柱标题几何。
 * [POS]: 首页共享纯计算层；DOM 标题与画布消费同一连续位置。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
export const REEL = Object.freeze({ radius:125, step:23, perspective:680, width:360, height:230, bottom:8 });
export const clamp = (value,min,max) => Math.max(min,Math.min(max,value));
export function damp(current,target,milliseconds) {
  const next=current+(target-current)*(1-Math.exp(-Math.min(milliseconds,50)/110));
  return Math.abs(next-target)<.0001 ? target : next;
}
export function projectedTarget(position,velocity,count) {
  return clamp(Math.round(position+clamp(velocity*120,-.7,.7)),0,count-1);
}
export function titleGeometry(index,position) {
  const distance=position-index, angle=distance*REEL.step;
  const opacity=Math.abs(angle)>=90 ? 0 : Math.exp(-.846*Math.abs(distance));
  return {angle,opacity,transform:`translateY(-50%) rotateX(${angle.toFixed(4)}deg) translateZ(${REEL.radius}px)`};
}
