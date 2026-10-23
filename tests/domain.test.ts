import { test } from 'node:test';
import assert from 'node:assert/strict';
import { initialData, validateData, dayKey, csvExport, toggleHabit, dailyAverages, filteredEntries, demoEntries, escapeHtml } from '../src/domain.ts';

test('JSON round trip preserves zero ratings and optional experiences', () => {
  const d=initialData();d.entries=demoEntries(new Date(2026,9,13));
  d.entries[0].energy=0;d.entries[0].experience={pleasure:0,meaning:10,effort:5,emptiness:1};
  assert.deepEqual(validateData(JSON.parse(JSON.stringify(d))),d);
});
test('rejects corrupt data, invalid scales, calendar dates and duplicate IDs', () => {
  for(const patch of [{energy:11},{mood:'5'},{fomo:NaN},{day:'2026-02-30'},{context:'medical'},{moment:'nope'},{note:'x'.repeat(2001)},{experience:{pleasure:1,meaning:1,effort:1,emptiness:null}}]){
    const d=initialData();d.entries=[{...demoEntries()[0],...patch} as never];assert.throws(()=>validateData(d));
  }
  const d=initialData();d.entries=[demoEntries()[0],demoEntries()[0]];assert.throws(()=>validateData(d),/повторяющиеся/);
  assert.throws(()=>validateData(null));assert.throws(()=>validateData({version:2}));
});
test('import reconstructs known fields and rejects oversized datasets',()=>{
  const d=initialData();const imported=validateData({...d,secret:'not retained',__proto__:{polluted:true}});
  assert.equal('secret' in imported,false);assert.equal('polluted' in imported,false);
  assert.throws(()=>validateData({...d,entries:Array(5001).fill(demoEntries()[0])}),/лимит/);
});
test('day key uses local calendar and leap date is valid',()=>{
  assert.equal(dayKey(new Date(2024,1,29,23,59)),'2024-02-29');
  const d=initialData();d.entries=[{...demoEntries()[0],day:'2024-02-29'}];assert.equal(validateData(d).entries.length,1);
});
test('habit toggle is reversible and does not erase other days',()=>{
  const h={id:'h',title:'rest',days:['2026-10-11']};const checked=toggleHabit(h,'2026-10-13');
  assert.deepEqual(checked.days,['2026-10-11','2026-10-13']);assert.deepEqual(toggleHabit(checked,'2026-10-13'),h);
  assert.deepEqual(h.days,['2026-10-11']);
});
test('chart means use actual observations, preserve gaps and zero',()=>{
  const es=demoEntries(new Date(2026,9,13));es[0].energy=0;es[1].day=es[0].day;es[1].energy=10;
  const averages=dailyAverages(es);assert.equal(averages[0].energy,5);assert.equal(averages[0].count,2);
  assert.equal(averages.length,6);assert.equal(averages.some(x=>x.day==='2026-10-08'),false);
  assert.deepEqual(dailyAverages([]),[]);
});
test('journal filters combine period, context and moment without including future',()=>{
  const now=new Date(2026,9,13);const es=demoEntries(now);
  const future={...es[0],id:'future',day:'2026-10-14'};
  assert.equal(filteredEntries([...es,future],7,'after','gaming',now).length,7);
  assert.equal(filteredEntries(es,3,'all','all',now).length,3);
  assert.equal(filteredEntries(es,7,'before','gaming',now).length,0);
  assert.equal(filteredEntries(es,7,'after','work',now).length,0);
});
test('CSV quotes text, preserves line breaks and neutralizes spreadsheet formulas',()=>{
  const es=demoEntries();es[0].note='  =HYPERLINK("test")\nnext';es[0].intention='+SUM(1,2)';
  const csv=csvExport(es);assert.ok(csv.startsWith('\uFEFF'));assert.ok(csv.includes('"\'  =HYPERLINK(""test"")\nnext"'));
  assert.ok(csv.includes('"\'+SUM(1,2)"'));assert.ok(csv.includes('pleasure_0_10'));
});
test('user content is escaped before interpolation into HTML',()=>{
  assert.equal(escapeHtml('<script>"&\'</script>'),'&lt;script&gt;&quot;&amp;&#39;&lt;/script&gt;');
});
test('demonstration is separate and generates no stored records',()=>{
  const d=initialData();assert.equal(d.entries.length,0);assert.equal(demoEntries().length,7);assert.equal(d.entries.length,0);
});
