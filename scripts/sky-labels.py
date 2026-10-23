from pathlib import Path
p=Path('src/space.ts');s=p.read_text(encoding='utf-8');old="${showHint?`<small>${i+1}</small>`:''}";assert old in s;s=s.replace(old,'<small>${i+1}</small>',1);p.write_text(s,encoding='utf-8')
p=Path('src/world.css');s=p.read_text(encoding='utf-8');s+='\n.star-dot small{font-size:11px;color:#e2e9f5;top:30px;font-weight:700}\n';p.write_text(s,encoding='utf-8')
