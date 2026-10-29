import {upgradeArchive} from './studioEngine';
import Dexie from 'dexie';
import {create} from 'zustand';
import {createSeed} from './seed';
import type {Data} from './model';
const db=new Dexie('free-university-v1');db.version(1).stores({archive:'id'});
let queue=Promise.resolve();
interface State {data:Data;ready:boolean;loadError:string;saveState:string;toast:string;change:(f:(d:Data)=>void)=>void;replace:(d:Data)=>void;notify:(s:string)=>void;load:()=>Promise<void>}
const persist=(data:Data)=>{useStore.setState({saveState:'正在存档…'});queue=queue.catch(()=>{}).then(async()=>{try{await db.table('archive').put({id:'main',data});useStore.setState({saveState:'已保存到此设备'})}catch{useStore.setState({saveState:'存档失败，请导出备份'});useStore.getState().notify('设备存储不可用，请到设置导出备份')}})};
export const useStore=create<State>((set,get)=>({data:upgradeArchive(createSeed()),ready:false,loadError:'',saveState:'正在打开存档',toast:'',
 change:f=>{if(!get().ready)return;const d=structuredClone(get().data);f(d);set({data:d});persist(d)},
 replace:d=>{if(!get().ready)return;set({data:d});persist(d)},
 notify:toast=>{set({toast});setTimeout(()=>set(s=>s.toast===toast?{toast:''}:{}),3500)},
 load:async()=>{set({loadError:''});try{
  await queue;const row=await db.table('archive').get('main');
  if(row){const upgraded=upgradeArchive(row.data);if(row.data.version!==3||row.data.contentVersion!==4){await db.transaction('rw',db.table('archive'),async()=>{if(row.data.version===1&&!await db.table('archive').get('backup-before-v03'))await db.table('archive').put({id:'backup-before-v03',data:row.data});if(!await db.table('archive').get('backup-before-v04'))await db.table('archive').put({id:'backup-before-v04',data:row.data});await db.table('archive').put({id:'main',data:upgraded})})}set({data:upgraded,ready:true,saveState:'已保存到此设备'})}
  else {const initial=upgradeArchive(createSeed());await db.table('archive').put({id:'main',data:initial});set({data:initial,ready:true,saveState:'已保存到此设备'})}
 }catch(error){set({ready:false,loadError:error instanceof Error?error.message:'无法读取本地存档',saveState:'存档未打开'});get().notify('为保护原数据，已停止写入。请导出原始存档后重试。')}}
}));
export const flushSave=()=>queue;
export async function exportStoredArchive(backup:boolean|'v04'=false){const row=await db.table('archive').get(backup==='v04'?'backup-before-v04':backup?'backup-before-v03':'main');if(!row)throw new Error('此设备没有这份存档');const url=URL.createObjectURL(new Blob([JSON.stringify(row.data,null,2)],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download=backup==='v04'?'free-university-before-v04.json':backup?'free-university-before-v03.json':'free-university-recovery.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)}
