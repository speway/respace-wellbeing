import React from 'react';
import {Composition} from 'remotion';
import {RiIntro} from './Composition';

export const RemotionRoot: React.FC = () => <>
  <Composition id="RiIntroPortrait" component={RiIntro} durationInFrames={360} fps={30} width={1080} height={1920}/>
  <Composition id="RiIntroLandscape" component={RiIntro} durationInFrames={360} fps={30} width={1920} height={1080}/>
</>;
