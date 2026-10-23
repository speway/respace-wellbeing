from pathlib import Path
p=Path('src/space.ts');s=p.read_text(encoding='utf-8');s=s.replace("  function starSnapshot()", "  function skySaveKey(s:ExperienceData['stars']){return JSON.stringify([s.shape,s.edges,s.title,s.points??null,s.color??null]);}\n  function starSnapshot()",1)
s=s.replace('JSON.stringify(stars)','skySaveKey(stars)').replace('JSON.stringify(getSpace().stars)','skySaveKey(getSpace().stars)')
p.write_text(s,encoding='utf-8')
