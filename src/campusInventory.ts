import {buildingKinds} from './campusBuilding';
import type {CampusSpace} from './campusSpaces';
import {catalog,type Data,type ObjectKind} from './model';
import {rewardCatalog} from './rewardCatalog';
import {rewardQuantity,rewardBuildItem} from './rewardEngine';
export interface CampusBuildItem {tool:string;kind:ObjectKind;rewardId?:string;name:string;w:number;h:number;category:string}
export function campusBuildItems(d:Data,space?:CampusSpace):CampusBuildItem[]{return [...catalog.filter(i=>!space?.indoor||!buildingKinds.has(i.kind)&&!['tree','fountain','flowers','path','grass','bench','lamp'].includes(i.kind)).map(i=>({...i,tool:i.kind})),...rewardCatalog.filter(r=>rewardQuantity(d,r.id)>0).map(r=>({...rewardBuildItem(d,'reward:'+r.id)!,tool:'reward:'+r.id}))]}
export const campusBuildItem=(d:Data,tool:string)=>campusBuildItems(d).find(i=>i.tool===tool);
