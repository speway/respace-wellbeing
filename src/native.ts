import { Capacitor } from '@capacitor/core';

let initialization: Promise<void> | undefined;
let handleBack = () => false;

/** Call after rendering the first local screen; account loading must not delay it. */
export function initNative(onBack: () => boolean): Promise<void> {
  if (!Capacitor.isNativePlatform()) return Promise.resolve();
  handleBack = onBack;
  if (initialization) return initialization;

  initialization = (async () => {
    const platform = Capacitor.getPlatform();
    document.documentElement.dataset.native = platform;
    const [{ App }, { SplashScreen }] = await Promise.all([
      import('@capacitor/app'),
      import('@capacitor/splash-screen'),
    ]);

    try {
      if (platform === 'android') {
        await App.addListener('backButton', () => {
          if (!handleBack()) {
            void App.exitApp().catch(() => console.warn('Не удалось закрыть приложение.'));
          }
        });
      }
    } finally {
      // Let the existing, synchronous guest UI paint beneath the native launch screen.
      await new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
      if (platform === 'android') {
        await SplashScreen.hide();
      } else {
        await SplashScreen.hide({
          fadeOutDuration: matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 180,
        });
      }
    }
  })();
  return initialization;
}
