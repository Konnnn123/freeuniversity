import {Link} from 'react-router-dom';
import {useStore} from './store';
import {courseBookIds} from './courseSources';
export function BookCourseLinks({bookId}:{bookId:string}){const courses=useStore(s=>s.data.courses).filter(c=>courseBookIds(c).includes(bookId));return courses.length?<div className="source-course-links"><small>已关联 {courses.length} 门课程</small>{courses.map(c=><Link key={c.id} to={'/courses/'+encodeURIComponent(c.id)+'?tab=resources'}>{c.name} →</Link>)}</div>:null}
