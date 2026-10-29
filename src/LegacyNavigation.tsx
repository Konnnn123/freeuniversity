import {Navigate,useParams} from 'react-router-dom';
import {useStore} from './store';
import {courseEditorPath,legacyStudyPath} from './siteNavigation';

// Old bookmarks still reach the same saved work, without exposing a second hub.
export function LegacyStudyLink(){const {data}=useStore(),{courseId,activityId}=useParams();return <Navigate replace to={legacyStudyPath(data,courseId,activityId)}/>}
export function LegacyPrepLink(){const {data}=useStore(),{courseId}=useParams();return <Navigate replace to={data.courses.some(c=>c.id===courseId)?courseEditorPath(courseId!):'/courses'}/>}
