import 'fake-indexeddb/auto';
import {expect,it,vi} from 'vitest';
import {createSeed} from '../src/seed';
import {upgradeArchive} from '../src/studioEngine';
import {currentDeletionPlan,removeCourseFromPage} from '../src/courseDeletion';
import {deletionPlan,deleteCourse} from '../src/courseManagement';
import {useStore,flushSave} from '../src/store';
import type {Data} from '../src/model';

const fresh=()=>upgradeArchive(createSeed());
const options={courseId:'course-2',keepRecords:true,removeMaterials:false,removePdf:false};
function setup(){
 let data=fresh();const events:string[]=[];
 const services={change:(edit:(d:Data)=>void)=>{const next=structuredClone(data);edit(next);data=next;events.push('removed')},onRemoved:vi.fn(()=>events.push('list')),flush:vi.fn(async()=>{events.push('saved')}),saveFailed:()=>false,deletePdf:vi.fn(async(_id:string)=>{events.push('pdf')})};
 return {services,events,get data(){return data}};
}

it('treats the still-selected confirmation target as absent immediately after deletion instead of throwing during render',()=>{
 const d=fresh(),selectedId='course-2';expect(currentDeletionPlan(d,selectedId)?.course.id).toBe(selectedId);
 deleteCourse(d,selectedId,true,false);
 expect(()=>deletionPlan(d,selectedId)).toThrow('课程不存在');
 expect(currentDeletionPlan(d,selectedId)).toBeNull();expect(currentDeletionPlan(d,'')).toBeNull();
 expect(d.courses.some(c=>c.id==='course-1')).toBe(true);
});

it('closes the dialog and returns to the list before the pending disk save finishes',async()=>{
 const x=setup();let complete!:()=>void;
 x.services.flush=vi.fn(()=>new Promise<void>(resolve=>{x.events.push('saving');complete=resolve}));
 const pending=removeCourseFromPage(options,x.services);
 expect(x.events).toEqual(['removed','list','saving']);expect(x.services.onRemoved).toHaveBeenCalledOnce();
 expect(currentDeletionPlan(x.data,options.courseId)).toBeNull();expect(x.services.deletePdf).not.toHaveBeenCalled();
 complete();expect(await pending).toBe('deleted');
});

it('never holds the deleted detail page open while optional PDF cleanup runs',async()=>{
 const x=setup();let finishPdf!:()=>void;
 x.services.deletePdf=vi.fn(()=>new Promise<void>(resolve=>{x.events.push('pdf');finishPdf=resolve}));
 const pending=removeCourseFromPage({...options,removeMaterials:true,removePdf:true,bookId:'book'},x.services);
 await Promise.resolve();expect(x.events).toEqual(['removed','list','saved','pdf']);expect(x.services.onRemoved).toHaveBeenCalledOnce();
 finishPdf();expect(await pending).toBe('deleted');
});

it('retains the original PDF when campus persistence fails',async()=>{
 const x=setup();x.services.saveFailed=()=>true;
 expect(await removeCourseFromPage({...options,removeMaterials:true,removePdf:true,bookId:'book'},x.services)).toBe('not-saved');
 expect(x.services.onRemoved).toHaveBeenCalledOnce();expect(x.services.deletePdf).not.toHaveBeenCalled();
});

it('reports failed PDF cleanup while keeping the successfully deleted course out of the list',async()=>{
 const x=setup();x.services.deletePdf=vi.fn(async()=>{throw new Error('PDF busy')});
 expect(await removeCourseFromPage({...options,removeMaterials:true,removePdf:true,bookId:'book'},x.services)).toBe('pdf-retained');
 expect(x.services.onRemoved).toHaveBeenCalledOnce();expect(currentDeletionPlan(x.data,options.courseId)).toBeNull();
});

it('does not run destructive cleanup when saving throws, and rejects an invalid deletion before leaving the current page',async()=>{
 const x=setup();x.services.flush=vi.fn(async()=>{throw new Error('storage unavailable')});
 await expect(removeCourseFromPage({...options,removeMaterials:true,removePdf:true,bookId:'book'},x.services)).rejects.toThrow('storage unavailable');
 expect(x.services.onRemoved).toHaveBeenCalledOnce();expect(x.services.deletePdf).not.toHaveBeenCalled();
 const invalid=setup(),before=JSON.stringify(invalid.data);
 await expect(removeCourseFromPage({...options,courseId:'deleted'},invalid.services)).rejects.toThrow('课程不存在');
 expect(invalid.services.onRemoved).not.toHaveBeenCalled();expect(invalid.services.flush).not.toHaveBeenCalled();expect(JSON.stringify(invalid.data)).toBe(before);
});

it('persists and reloads deletion while every interim store render can still inspect the old target safely',async()=>{
 const d=fresh();d.logs.push({id:'kept-log',courseId:'course-2',activityId:'',milestoneId:'',date:'2026-10-29',summary:'保留的学习记录',notes:'保留笔记',minutes:20,url:'',kind:'理论'});
 useStore.setState({data:d,ready:true});const errors:unknown[]=[];
 const unsubscribe=useStore.subscribe(state=>{try{currentDeletionPlan(state.data,'course-2')}catch(e){errors.push(e)}});
 try{
  await removeCourseFromPage(options,{change:useStore.getState().change,onRemoved:()=>{},flush:flushSave,saveFailed:()=>useStore.getState().saveState.includes('失败'),deletePdf:async()=>{throw new Error('must not delete PDF')}});
  useStore.setState({data:fresh(),ready:false});await useStore.getState().load();
  expect(useStore.getState().ready).toBe(true);expect(useStore.getState().data.courses.some(c=>c.id==='course-2')).toBe(false);
  expect(useStore.getState().data.logs.find(l=>l.id==='kept-log')?.notes).toBe('保留笔记');expect(errors).toEqual([]);
 }finally{unsubscribe()}
});
