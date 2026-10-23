import { initialData, validateData, type AppData } from './domain.ts';
import { initialExperience, validateExperience, type ExperienceData } from './experience-model.ts';

export interface CloudProgress { space: ExperienceData; personal?: AppData; }
export function cloudPayload(data: AppData, includePersonal: boolean): CloudProgress {
  const clean=validateData(data);
  const space=validateExperience(clean.space??initialExperience());
  if(!includePersonal)space.stars.title='';
  return {space,...(includePersonal?{personal:clean}:{})};
}
export function validateCloud(value: unknown): CloudProgress {
  if(!value||typeof value!=='object')throw new Error('Некорректное сохранение.');
  const v=value as CloudProgress;
  return {space:validateExperience(v.space),...(v.personal===undefined?{}:{personal:validateData(v.personal)})};
}
export function fromCloud(cloud: CloudProgress, local?: AppData): AppData {
  const c=validateCloud(cloud);
  const result=c.personal??local??initialData();
  if(!c.personal&&!c.space.stars.title&&local?.space?.stars.title)c.space.stars.title=local.space.stars.title;
  return validateData({...result,space:c.space});
}
export function mergeProgress(cloud: CloudProgress, local: AppData, localArtwork: boolean, includePersonal: boolean): AppData {
  const base=fromCloud(cloud);
  const a=cloud.space,b=local.space??initialExperience();
  const ids=new Set([...a.lessons.map(l=>l.id),...b.lessons.map(l=>l.id)]);
  const lessons=[...ids].map(id=>{
    const x=a.lessons.find(l=>l.id===id),y=b.lessons.find(l=>l.id===id);
    return {id,completed:!!(x?.completed||y?.completed),step:Math.max(x?.step??0,y?.step??0)};
  });
  base.space={lessons,favorites:[...new Set([...a.favorites,...b.favorites])],room:structuredClone(localArtwork?b.room:a.room),stars:structuredClone(localArtwork?b.stars:a.stars),...(b.story||a.story?{story:structuredClone(localArtwork?(b.story??a.story):(a.story??b.story))}:{})};
  const museum=localArtwork?(b.museum??a.museum):(a.museum??b.museum);if(museum)base.space.museum=structuredClone(museum);
  const mail=localArtwork?(b.mail??a.mail):(a.mail??b.mail);if(mail)base.space.mail=structuredClone(mail);
  if(includePersonal){
    const union=<T extends {id:string}>(x:T[],y:T[])=>[...new Map([...x,...y].map(r=>[r.id,r])).values()];
    base.entries=union(base.entries,local.entries);base.practices=union(base.practices,local.practices);
    base.habits=union(base.habits,local.habits);base.goal=local.goal;
  }
  return validateData(base);
}
