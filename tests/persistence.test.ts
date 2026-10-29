import 'fake-indexeddb/auto';
import {it,expect} from 'vitest';
import {useStore,flushSave} from '../src/store';
import Dexie from 'dexie';
import {createSeed} from '../src/seed';
import {finishLesson,lessonsFor} from '../src/lessonEngine';
it('IndexedDB 保存课程、周五安排、笔记及新树并重新加载',async()=>{await useStore.getState().load();useStore.getState().change(d=>{d.schedule.push({id:'persistence-test',activityId:d.activities[8].id,date:'2026-10-23'});d.drafts['note']='我的日语学习笔记';d.objects.push({id:'new-tree',kind:'tree',x:0,y:0,w:1,h:1,name:'新种的树'})});await flushSave();const saved=structuredClone(useStore.getState().data);useStore.setState({data:{...saved,schedule:[],drafts:{},objects:[]}});await useStore.getState().load();expect(useStore.getState().data).toEqual(saved);expect(useStore.getState().saveState).toBe('已保存到此设备')});
it('V0.3 migration backs up the old archive atomically and persists lesson edits, logs and campus',async()=>{
 const db=new Dexie('free-university-v1');db.version(1).stores({archive:'id'});
 const old=createSeed();old.courses[0].name='用户自定义日语';old.resources[0].tags='原收藏';old.objects.push({id:'kept-tree',name:'我的树',kind:'tree',x:0,y:0,w:1,h:1});old.drafts['old']='旧笔记';
 await db.table('archive').put({id:'main',data:old});await useStore.getState().load();expect((await db.table('archive').get('backup-before-v03')).data).toEqual(old);
 let d=structuredClone(useStore.getState().data);const l=lessonsFor(d,'course-2')[0];l.notes='刷新后仍在';l.stepState[l.steps[0].id]='完成';l.stepState[l.steps[1].id]='跳过';l.answers[l.exercises[0].id]='放弃休息';l.resourceLinks=[{resourceId:'pack-eco-market',scope:'用户修改教材范围'}];l.completionCriteria.forEach((_,i)=>l.criteriaState[i]=true);
 d=finishLesson(d,l.id,{summary:'真实课时学习',minutes:20,url:'',complete:true,masteredIds:[l.milestoneIds[0]]});d.schedule.push({id:'move-lesson',activityId:l.activityIds[0],date:'2026-10-21'});d.schedule.at(-1)!.date='2026-10-23';
 useStore.getState().replace(d);await flushSave();useStore.setState({data:createSeed(),ready:false});await useStore.getState().load();expect(useStore.getState().data).toEqual(d);expect((await db.table('archive').get('backup-before-v03')).data).toEqual(old);db.close();
});
it('invalid archives never get replaced by fresh seed data',async()=>{const db=new Dexie('free-university-v1');db.version(1).stores({archive:'id'});const invalid={version:1,courses:'damaged-but-preserved'};await db.table('archive').put({id:'main',data:invalid});await useStore.getState().load();expect(useStore.getState().ready).toBe(false);expect(useStore.getState().loadError).not.toBe('');useStore.getState().change(d=>{d.courses=[]});await flushSave();expect((await db.table('archive').get('main')).data).toEqual(invalid);db.close()});
