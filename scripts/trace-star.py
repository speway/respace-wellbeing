from pathlib import Path
p=Path('src/space.ts');s=p.read_text(encoding='utf-8');needle="const value=el.dataset.value??'';\n    switch(action)";assert needle in s;s=s.replace(needle,"const value=el.dataset.value??'';\n    if(import.meta.env.DEV&&action==='star-point')console.debug('respace-star-click',value,e.detail);\n    switch(action)");p.write_text(s,encoding='utf-8')
