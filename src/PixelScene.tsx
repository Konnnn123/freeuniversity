import {useEffect,useRef} from 'react';
import {drawCourseScene} from './pixelScenes';
export function PixelScene({theme}:{theme:string}){const ref=useRef<HTMLCanvasElement>(null);useEffect(()=>{drawCourseScene(ref.current!.getContext('2d')!,theme)},[theme]);return <canvas ref={ref} width={160} height={96} className="pixel-scene" aria-hidden="true"/>}
