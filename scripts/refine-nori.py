from pathlib import Path
p=Path('src/space.ts');s=p.read_text(encoding='utf-8').replace('let skyGuest=false;','let skyGuest=false;let skyGuestBaseline=\'\';',1)
s=s.replace("skyFrom=0;skyTo=3;skyRoute=null;", "skyGuestBaseline=JSON.stringify(stars);skyFrom=0;skyTo=3;skyRoute=null;",1)
s=s.replace("if(JSON.stringify(stars)!==JSON.stringify(getSpace().stars))return 'stars';", "if(JSON.stringify(stars)!==JSON.stringify(getSpace().stars)&&(!skyGuest||JSON.stringify(stars)!==skyGuestBaseline))return 'stars';",1)
s=s.replace("${skyGuest?'<button class=\"text-button guest-return\" data-space=\"stars\">Открыть своё небо</button>':''}","")
p.write_text(s,encoding='utf-8')
p=Path('src/mail-model.ts');s=p.read_text(encoding='utf-8').replace('Адреса сходятся. Можно отправлять.','Готово. Забираю посылки.');p.write_text(s,encoding='utf-8')
p=Path('src/mail-view.ts');s=p.read_text(encoding='utf-8').replace('Проверить расстановку','Проверить').replace('Закончить отправку','Закончить');p.write_text(s,encoding='utf-8')
