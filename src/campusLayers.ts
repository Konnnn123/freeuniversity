import type {CampusObject} from './model';
export const groundObject=(o:Partial<CampusObject>)=>o.kind==='path'||o.kind==='grass'||o.kind==='collectible'&&o.rewardId==='rug';
