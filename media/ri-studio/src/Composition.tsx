import React from 'react';
import {AbsoluteFill, Img, Interactive, interpolate, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';

export const RiIntro: React.FC = () => {
  const frame = useCurrentFrame();
  const {width, height} = useVideoConfig();
  const portrait = height > width;
  const scene = frame < 110 ? 0 : frame < 230 ? 1 : 2;
  const pose = scene === 0 ? 2 : scene === 1 ? 4 : 5;
  const size = portrait ? 620 : 560;
  return <AbsoluteFill style={{backgroundColor: '#e4f9fc', fontFamily: 'Nunito, sans-serif', color: '#151b46'}}>
    <style>{`@font-face{font-family:Nunito;src:url(${staticFile('nunito-cyrillic.woff2')});font-weight:900;font-display:block}`}</style>
    <Interactive.Div name="Мятная орбита" style={{position: 'absolute', width: 1600, height: 1600, borderRadius: '50%', backgroundColor: '#d2f2eb', left: portrait ? -260 : 1050, top: portrait ? 1170 : 470}}/>
    <Interactive.Div name="Название Респейс" style={{position: 'absolute', left: 90, top: 105, fontSize: 50, fontWeight: 900}}>респейс</Interactive.Div>
    <Interactive.Div name="Главная фраза" style={{position: 'absolute', left: 90, right: 90, top: portrait ? 260 : 230, fontSize: portrait ? 94 : 86, fontWeight: 900, lineHeight: 1.12, maxWidth: portrait ? 900 : 930, opacity: interpolate(frame, [0, 18], [0, 1], {extrapolateRight: 'clamp'}), translate: interpolate(frame, [0, 22], ['0px 25px', '0px 0px'], {extrapolateRight: 'clamp'})}}>
      {scene === 0 ? 'После игры есть ты.' : scene === 1 ? 'Можно разобраться.' : 'Или просто отдохнуть.'}
    </Interactive.Div>
    <Interactive.Div name="Персонаж Ри" style={{position: 'absolute', left: portrait ? 230 : 1220, top: portrait ? 700 : 270, width: size, height: size, overflow: 'hidden', rotate: interpolate(frame % 100, [0, 50, 99], ['-2deg', '2deg', '-2deg']), translate: interpolate(frame % 90, [0, 45, 89], ['0px 0px', '0px -15px', '0px 0px'])}}>
      <Img src={staticFile('ri-poses.png')} style={{position: 'absolute', width: size * 3, height: size * 2, maxWidth: 'none', left: -(pose % 3) * size, top: -Math.floor(pose / 3) * size}}/>
    </Interactive.Div>
    <Interactive.Div name="Подпись" style={{position: 'absolute', left: 90, right: 90, bottom: portrait ? 345 : 235, fontSize: 46, fontWeight: 900, lineHeight: 1.4, maxWidth: portrait ? 900 : 1000}}>
      {scene === 0 ? 'Пространство для себя после игры' : scene === 1 ? 'Короткие темы. Свой выбор.' : 'Без заданий и ежедневных серий.'}
    </Interactive.Div>
    <Interactive.Div name="Адрес сайта" style={{position: 'absolute', left: 90, bottom: 120, fontSize: portrait ? 36 : 40, fontWeight: 900, color: '#246f73'}}>respace-wellbeing.vercel.app</Interactive.Div>
  </AbsoluteFill>;
};
