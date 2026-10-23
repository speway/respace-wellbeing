import { validateExperience, type ExperienceData } from './experience-model.ts';
export const STORAGE_KEY = 'respace-data-v1';
export type Moment = 'before' | 'after' | 'day';
export type Context = 'gaming' | 'work' | 'rest';
export interface Entry {
  id: string; at: string; day: string; moment: Moment; context: Context;
  mood: number; energy: number; pressure: number; fomo: number;
  note: string; intention: string;
  game?: string;
  experience?: { pleasure: number; meaning: number; effort: number; emptiness: number };
}
export interface Habit { id: string; title: string; days: string[]; }
export interface PracticeRecord { id: string; practiceId: string; at: string; note: string; }
export interface AppData {
  version: 1; accepted: boolean; entries: Entry[]; habits: Habit[];
  practices: PracticeRecord[]; goal: string; space?: ExperienceData;
}
export function dayKey(date = new Date()): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}
export function initialData(): AppData {
  return { version: 1, accepted: false, entries: [], practices: [], goal: 'Находить отдых, который мне подходит', habits: [
    { id: 'h1', title: 'Перед игрой замечать, чего мне хочется', days: [] },
    { id: 'h2', title: 'Оставлять место для отдыха, если он мне нужен', days: [] }
  ] };
}
export function escapeHtml(value: unknown): string {
  return String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));
}
function isText(v: unknown, max: number): v is string { return typeof v === 'string' && v.length <= max; }
function isScale(v: unknown): v is number { return typeof v === 'number' && Number.isInteger(v) && v >= 0 && v <= 10; }
function isDay(v: unknown): v is string {
  if (typeof v !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(v)) return false;
  const d = new Date(v + 'T12:00:00'); return !Number.isNaN(d.getTime()) && dayKey(d) === v;
}
function isDate(v: unknown): v is string { return isText(v, 40) && !Number.isNaN(Date.parse(v)); }
export function validateData(value: unknown): AppData {
  if (!value || typeof value !== 'object') throw new Error('В файле не нашлось сохранения Респейса.');
  const d = value as AppData;
  if (d.version !== 1 || typeof d.accepted !== 'boolean' || !isText(d.goal, 180)) throw new Error('Этот файл не подходит для восстановления.');
  if (!Array.isArray(d.entries) || d.entries.length > 5000 || !Array.isArray(d.habits) || d.habits.length > 30 || !Array.isArray(d.practices) || d.practices.length > 5000) throw new Error('Файл повреждён или превышен лимит записей.');
  const entries = d.entries.map(e => {
    if (!e || !isText(e.id, 100) || !isDate(e.at) || !isDay(e.day) || !['before', 'after', 'day'].includes(e.moment) || !['gaming', 'work', 'rest'].includes(e.context) || ![e.mood, e.energy, e.pressure, e.fomo].every(isScale) || !isText(e.note, 2000) || !isText(e.intention, 300)) throw new Error('Некорректная запись дневника.');
    if (e.game !== undefined && !isText(e.game, 100)) throw new Error('Некорректное название игры.');
    if (e.experience !== undefined && (!e.experience || ![e.experience.pleasure, e.experience.meaning, e.experience.effort, e.experience.emptiness].every(isScale))) throw new Error('Некорректная запись переживаний.');
    return { id: e.id, at: e.at, day: e.day, moment: e.moment, context: e.context, mood: e.mood, energy: e.energy, pressure: e.pressure, fomo: e.fomo, note: e.note, intention: e.intention, ...(e.game === undefined ? {} : {game: e.game}), ...(e.experience === undefined ? {} : {experience: {pleasure:e.experience.pleasure, meaning:e.experience.meaning, effort:e.experience.effort, emptiness:e.experience.emptiness}}) };
  });
  const habits = d.habits.map(h => {
    if (!h || !isText(h.id, 100) || !isText(h.title, 180) || !Array.isArray(h.days) || h.days.length > 5000 || !h.days.every(isDay)) throw new Error('Некорректная привычка.');
    return { id: h.id, title: h.title, days: [...new Set(h.days)] };
  });
  const practices = d.practices.map(p => {
    if (!p || !isText(p.id, 100) || !isText(p.practiceId, 100) || !isDate(p.at) || !isText(p.note, 2000)) throw new Error('Некорректная запись практики.');
    return { id: p.id, practiceId: p.practiceId, at: p.at, note: p.note };
  });
  if ([entries, habits, practices].some(a => new Set(a.map(x => x.id)).size !== a.length)) throw new Error('В файле есть повторяющиеся идентификаторы.');
  return { version: 1, accepted: d.accepted, goal: d.goal, entries, habits, practices, ...(d.space===undefined?{}:{space:validateExperience(d.space)}) };
}
export function toggleHabit(habit: Habit, day: string): Habit {
  return { ...habit, days: habit.days.includes(day) ? habit.days.filter(d => d !== day) : [...habit.days, day] };
}
export function filteredEntries(entries: Entry[], days: number, moment: 'all' | Moment, context: 'all' | Context, now = new Date()): Entry[] {
  const cutoff = new Date(now); cutoff.setDate(cutoff.getDate() - days + 1);
  return entries.filter(e => e.day >= dayKey(cutoff) && e.day <= dayKey(now) && (moment === 'all' || e.moment === moment) && (context === 'all' || e.context === context)).sort((a, b) => a.at.localeCompare(b.at));
}
export function dailyAverages(entries: Entry[]): { day: string; energy: number; pressure: number; fomo: number; count: number }[] {
  const groups = new Map<string, Entry[]>();
  for (const e of entries) groups.set(e.day, [...(groups.get(e.day) || []), e]);
  return [...groups.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([day, es]) => ({ day, energy: es.reduce((s, e) => s + e.energy, 0) / es.length, pressure: es.reduce((s, e) => s + e.pressure, 0) / es.length, fomo: es.reduce((s, e) => s + e.fomo, 0) / es.length, count: es.length }));
}
export function csvExport(entries: Entry[]): string {
  const safe = (value: unknown) => {
    let s = String(value); if (/^[\s]*[=+\-@]/.test(s)) s = "'" + s;
    return '"' + s.replace(/"/g, '""') + '"';
  };
  return '\uFEFF' + [['id', 'date', 'local_day', 'moment', 'context', 'mood_0_10', 'energy_0_10', 'pressure_0_10', 'fomo_0_10', 'game', 'pleasure_0_10', 'meaning_0_10', 'effort_0_10', 'emptiness_0_10', 'intention', 'note'], ...entries.map(e => [e.id, e.at, e.day, e.moment, e.context, e.mood, e.energy, e.pressure, e.fomo, e.game ?? '', e.experience?.pleasure ?? '', e.experience?.meaning ?? '', e.experience?.effort ?? '', e.experience?.emptiness ?? '', e.intention, e.note])].map(row => row.map(safe).join(',')).join('\r\n');
}
export function demoEntries(now = new Date()): Entry[] {
  const values = [[4, 8, 7], [5, 7, 7], [3, 8, 8], [6, 5, 5], [6, 6, 4], [7, 4, 3], [7, 3, 4]];
  return values.map(([energy, pressure, fomo], i) => {
    const date = new Date(now); date.setDate(date.getDate() - 6 + i); date.setHours(18, 0, 0, 0);
    return { id: 'demo-' + i, at: date.toISOString(), day: dayKey(date), moment: 'after', context: 'gaming', mood: energy, energy, pressure, fomo, intention: 'Отдохнуть', note: 'Демонстрационная запись. Это вымышленные данные, а не результат исследования.' };
  });
}
