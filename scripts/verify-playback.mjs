/**
 * [INPUT]: video-playback.js 与模拟 HTMLMediaElement 的 EventTarget。
 * [OUTPUT]: 媒体错误回退、手势限制、重试和销毁竞态的回归证据。
 * [POS]: 不模拟解码能力，只验证共享播放控制器的状态契约。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import assert from 'node:assert/strict';
import { createVideoPlayback } from '../src/video-playback.js';
class Video extends EventTarget {
  src='';error=null;plays=0;loads=0;paused=false;result=()=>Promise.resolve();
  load(){this.loads++;this.error=null;}
  play(){this.plays++;return this.result();}
  pause(){this.paused=true;}
  removeAttribute(name){if(name==='src')this.src='';}
  fail(){this.error={code:4};this.dispatchEvent(new Event('error'));}
}
const project={src:'https://example.com/original.mp4',compatSrc:'/playback/film-04.mp4'};
const video=new Video(),states=[];
const control=createVideoPlayback(video,project,(s)=>states.push(s));
video.result=()=>Promise.reject(new DOMException('gesture','NotAllowedError'));
await control.play();
assert.equal(states.at(-1),'tap');assert.equal(video.src,project.src);
video.result=()=>Promise.resolve();video.fail();
assert.equal(video.src,project.compatSrc);assert.equal(video.plays,2);
assert.equal(control.useCompatibility(),false);
video.fail();assert.equal(states.at(-1),'error');assert.equal(video.plays,2);
const loads=video.loads;await control.play();assert.equal(video.loads,loads+1);
control.dispose();const count=states.length,plays=video.plays;
video.fail();await control.play();
assert.equal(states.length,count);assert.equal(video.plays,plays);assert.equal(video.src,'');assert(video.paused);

const race=new Video();let rejectOld;race.result=()=>new Promise((_,reject)=>{rejectOld=reject;});
const updates=[];const raced=createVideoPlayback(race,project,s=>updates.push(s));
const pending=raced.play();race.result=()=>Promise.resolve();raced.useCompatibility();
rejectOld(new DOMException('old failure','NotSupportedError'));await pending;
assert(!updates.includes('error'));assert.equal(race.plays,2);raced.dispose();

const direct=new Video();const errors=[];const only=createVideoPlayback(direct,{src:project.src},s=>errors.push(s));
direct.fail();assert.equal(errors.at(-1),'error');assert.equal(direct.plays,0);only.dispose();
process.stdout.write('PASS: gesture denial, one compatibility attempt, manual retry, stale rejection, disposal and no-fallback error.\n');
