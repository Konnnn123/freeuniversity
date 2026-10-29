import 'fake-indexeddb/auto';
import {it,expect} from 'vitest';
import Dexie from 'dexie';
import {useStore,flushSave} from '../src/store';
import {createSeed} from '../src/seed';
import {migrateData} from '../src/lessonEngine';
import {startSession,updateSession,recordExploration,scheduleExploration} from '../src/studioEngine';
it('V0.4 IndexedDB upgrade keeps an exact backup and reloads independent studio data',async()=>{const db=new Dexie('free-university-v1');db.version(1).stores({archive:'id'});const old=migrateData(createSeed());old.lessons![0].notes='保留旧课时';old.objects.push({id:'my-tree',kind:'tree',name:'我的树',x:0,y:0,w:1,h:1});await db.table('archive').put({id:'main',data:old});await useStore.getState().load();expect((await db.table('archive').get('backup-before-v04')).data).toEqual(old);useStore.getState().change(d=>{const id=startSession(d,'studio-original-ja');updateSession(d,id,{paragraph:2,notes:'刷新后继续探索',timestamp:'page 3'});recordExploration(d,id);d.studio!.profiles[1].preferences.creators='My author';scheduleExploration(d,{language:'ja',kind:'素材探索',mediaId:'studio-original-ja',topicId:'',title:'读一段',minutes:15},'2026-10-21')});await flushSave();const saved=structuredClone(useStore.getState().data);useStore.setState({data:createSeed(),ready:false});await useStore.getState().load();expect(useStore.getState().data).toEqual(saved);expect(useStore.getState().data.lessons).toEqual(old.lessons);expect(useStore.getState().data.objects).toEqual(old.objects);expect((await db.table('archive').get('backup-before-v04')).data).toEqual(old);db.close()});
