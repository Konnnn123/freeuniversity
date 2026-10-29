import {Link} from 'react-router-dom';
import {useStore} from './store';
import {classroomLessons} from './courseOrganization';
export function LearningRoute({courseId,activeId}:{courseId:string;activeId?:string}){const {data}=useStore();return <details className="learning-route-fold"><summary>学习路线 · 需要时展开</summary><nav aria-label="学习路线">{classroomLessons(data,courseId).map(l=><Link key={l.id} aria-current={l.id===activeId?'page':undefined} className={l.id===activeId?'selected':''} to={'/lessons/'+l.id}><span>{l.status==='已完成'?'✓':'◇'}</span>{l.title}</Link>)}</nav><Link to={'/courses/'+courseId}>查看完整课程大纲 →</Link></details>}
