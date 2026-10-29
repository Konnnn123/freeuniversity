// Client coordinates for a fixed menu; reserve the persistent campus navigation.
export function courseMenuPosition(x:number,y:number,width:number,height:number,navigationTop=height,menuHeight=132){const safeBottom=Math.min(height,navigationTop)-8;return {x:Math.max(8,Math.min(x,width-238)),y:Math.max(8,Math.min(y,safeBottom-menuHeight))}}
