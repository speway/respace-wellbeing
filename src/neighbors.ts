import './neighbors.css';
export function neighborSprite(kind:'bip'|'nori',pose:0|1|2=0):string {
  return `<span class="neighbor-sprite neighbor-${kind}" style="background-position:${pose*50}% ${kind==='bip'?0:100}%" aria-hidden="true"></span>`;
}
function neighborCharacter(src:string,alt:string,kind:string):string {
  return `<img class="neighbor-character neighbor-character-${kind}" src="${src}" alt="${alt}" width="176" height="176" loading="lazy"/>`;
}
export function neighbors():string {
  return `<section class="station-neighbors" aria-labelledby="station-neighbors-title"><div class="neighbors-heading"><span class="eyebrow">На станции</span><h2 id="station-neighbors-title">Ри оставил дверь открытой</h2><p>Рядом бывают кот и Папка-курсор. Можно заглянуть к ним или спокойно идти дальше.</p></div><div class="neighbors-grid"><div class="neighbor-visit neighbor-visit-cat">${neighborCharacter('/art/characters/cat-compact-v8.png','Кот','cat')}<div><h3>Кот</h3><p>Пришёл проверить, достаточно ли здесь тихо.</p><a class="text-button" href="#about" data-nav="about">Посмотреть вокруг</a></div></div><div class="neighbor-visit neighbor-visit-folder">${neighborCharacter('/art/characters/folder-cursor-v8.png','Папка-курсор','folder')}<div><h3>Папка-курсор</h3><p>Собирает заметки, к которым захочется вернуться.</p><a class="text-button" href="#path" data-nav="path">Собрать свой след</a></div></div></div></section>`;
}
