from pathlib import Path
p=Path('src/motion.css');s=p.read_text(encoding='utf-8').replace('html[data-motion=off] button:active','html[data-motion=off] button:not(.star-dot):active');p.write_text(s,encoding='utf-8')
p=Path('src/space.ts');s=p.read_text(encoding='utf-8').replace("    if(import.meta.env.DEV&&action==='star-point')console.debug('respace-star-click',value,e.detail);\n",'');p.write_text(s,encoding='utf-8')
