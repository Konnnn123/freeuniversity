import {it,expect} from 'vitest';
import {courseMenuPosition} from '../src/courseMenuPosition';
it('keeps a bottom-row course menu fully above the fixed campus navigation',()=>{const p=courseMenuPosition(1700,850,1848,945,860);expect(p.x+230).toBeLessThanOrEqual(1848);expect(p.y+132).toBeLessThan(860)});
it('keeps menus inside narrow viewports and handles keyboard positions near the top',()=>{const p=courseMenuPosition(375,750,390,844,760);expect(p.x).toBeGreaterThanOrEqual(8);expect(p.x+230).toBeLessThanOrEqual(390);expect(p.y+132).toBeLessThan(760);expect(courseMenuPosition(0,0,390,844,760)).toEqual({x:8,y:8})});
