import 'fake-indexeddb/auto';
import {it,expect} from 'vitest';
import {useStore,flushSave} from '../src/store';
import {addMaterial,courseFromMaterial,finishMaterialStudy} from '../src/labEngine';
import {sampleAnalysis,sampleText} from '../src/labSample';
import {createSeed} from '../src/seed';
it('material, AI draft, short course notes and choices survive IndexedDB reload without altering campus',async()=>{await useStore.getState().load();const objects=structuredClone(useStore.getState().data.objects);let course='';useStore.getState().change(d=>{const id=addMaterial(d,{title:'验收材料',text:sampleText,url:'',goal:'理解',exampleDomain:'生活'});d.readingLab!.materials[0].analysis=structuredClone(sampleAnalysis);course=courseFromMaterial(d,id);const l=d.lessons!.find(l=>l.courseId===course)!;l.notes='刷新后仍在';l.answers['choice-0']='1'});const d=useStore.getState().data,l=d.lessons!.find(l=>l.courseId===course)!;useStore.getState().replace(finishMaterialStudy(d,l.id,{summary:'短课记录',minutes:3,complete:true,mastered:false}));await flushSave();const saved=structuredClone(useStore.getState().data);useStore.setState({data:createSeed(),ready:false});await useStore.getState().load();expect(useStore.getState().data).toEqual(saved);expect(useStore.getState().data.objects).toEqual(objects);expect(useStore.getState().data.logs[0].notes).toContain('刷新后仍在')});
