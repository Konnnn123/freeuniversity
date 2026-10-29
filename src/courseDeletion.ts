import type {Data} from './model';
import {deletionPlan,deleteCourse} from './courseManagement';

// A confirmation target can disappear before the next UI state update runs.
// This is a normal deletion transition, not an invalid archive.
export function currentDeletionPlan(data:Data,id:string){return id&&data.courses.some(c=>c.id===id)?deletionPlan(data,id):null}

interface DeletionOptions {courseId:string;keepRecords:boolean;removeMaterials:boolean;removePdf:boolean;bookId?:string}
interface DeletionServices {
 change:(edit:(data:Data)=>void)=>void;
 onRemoved:()=>void;
 flush:()=>Promise<unknown>;
 saveFailed:()=>boolean;
 deletePdf:(id:string)=>Promise<unknown>;
}
export async function removeCourseFromPage(options:DeletionOptions,services:DeletionServices):Promise<'deleted'|'not-saved'|'pdf-retained'>{
 services.change(data=>deleteCourse(data,options.courseId,options.keepRecords,options.removeMaterials));
 // Close the dialog and leave the deleted detail immediately. Disk writes and
 // optional PDF cleanup must not keep the user on a now-missing course.
 services.onRemoved();
 await services.flush();
 if(services.saveFailed())return 'not-saved';
 if(options.removeMaterials&&options.removePdf&&options.bookId){
  try{await services.deletePdf(options.bookId)}catch{return 'pdf-retained'}
 }
 return 'deleted';
}
