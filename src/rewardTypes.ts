export interface ChapterReward {key:string;unitId:string;courseId:string;courseName:string;unitName:string;earnedAt:string}
export interface RewardClaim {id:string;chapterKey:string;itemId:string;claimedAt:string}
export interface RewardCollection {chapters:ChapterReward[];claims:RewardClaim[]}
