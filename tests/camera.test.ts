import {it,expect} from 'vitest';
import {campusCamera,screenToWorld} from '../src/campusCamera';
import {project} from '../src/art';

it.each([[980,500],[510,370],[350,260],[340,150]])('默认视角完整容纳 %s × %s 的校园视口',(width,height)=>{
 const camera=campusCamera(width,height,{zoom:1,panX:0,panY:0});
 for(const [x,y] of [[-500,-65],[660,585]]){
  expect(camera.x+x*camera.scale).toBeGreaterThanOrEqual(13);
  expect(camera.x+x*camera.scale).toBeLessThanOrEqual(width-13);
  expect(camera.y+y*camera.scale).toBeGreaterThanOrEqual(13);
  expect(camera.y+y*camera.scale).toBeLessThanOrEqual(height-13);
 }
});
it.each([.6,1,2.4])('缩放 %s 后点击坐标与绘制坐标一致',zoom=>{
 const view={zoom,panX:87,panY:-45},camera=campusCamera(700,400,view),p=project(8.4,12.4);
 const result=screenToWorld(camera.x+p.x*camera.scale,camera.y+p.y*camera.scale,700,400,view);
 expect(result.x).toBe(8);expect(result.y).toBe(12);
});
