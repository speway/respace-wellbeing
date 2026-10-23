export interface MailState {task:number;order:number[];}

export const MAIL_TASKS = [
  {title:'Утренняя почта',clues:['Поставь письмо первым.','Кружка должна быть раньше книги.']},
  {title:'Полка у окна',clues:['Книга стоит посередине.','Кружка должна быть раньше книги.']},
  {title:'Вечерняя почта',clues:['Книга должна идти первой.','Письмо поставь раньше кружки.']},
] as const;

const initialOrders=[[0,2,1],[2,1,0],[2,0,1]];
const isIndex=(value:unknown):value is number=>typeof value==='number'&&Number.isInteger(value)&&value>=0&&value<3;

export function validateMail(value:unknown):MailState {
  if(!value||typeof value!=='object')throw new Error('Некорректное сохранение почты.');
  const state=value as MailState;
  if(!isIndex(state.task)||!Array.isArray(state.order)||state.order.length!==3||!Array.from(state.order).every(isIndex)||new Set(state.order).size!==3)throw new Error('Некорректное сохранение почты.');
  return {task:state.task,order:[...state.order]};
}

export function initialMail(task=0):MailState {
  if(!isIndex(task))throw new Error('Некорректное задание почты.');
  return {task,order:[...initialOrders[task]]};
}

export function swapMail(state:MailState,a:number,b:number):MailState {
  const next=validateMail(state);
  if(!isIndex(a)||!isIndex(b))throw new Error('Такой полки на почте нет.');
  [next.order[a],next.order[b]]=[next.order[b],next.order[a]];
  return next;
}

export function getMailFeedback(state:MailState):{done:boolean;text:string} {
  const clean=validateMail(state);
  const cup=clean.order.indexOf(0),book=clean.order.indexOf(1),leaf=clean.order.indexOf(2);
  if(clean.task===0){
    if(leaf!==0)return {done:false,text:'Письмо просится на первую полку.'};
    if(cup>book)return {done:false,text:'Поставь кружку раньше книги.'};
  }else if(clean.task===1){
    if(book!==1)return {done:false,text:'Книге нужна средняя полка.'};
    if(cup>book)return {done:false,text:'Кружка должна быть раньше книги.'};
  }else{
    if(book>cup||book>leaf)return {done:false,text:'Сначала поставь книгу.'};
    if(leaf>cup)return {done:false,text:'Письмо должно быть раньше кружки.'};
  }
  return {done:true,text:'Все на месте. Бип забирает почту.'};
}
