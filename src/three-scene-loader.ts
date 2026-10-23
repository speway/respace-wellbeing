import type { RoomSceneOptions, RouteSceneOptions, StarSceneOptions } from './three-scenes';
import type { SceneHandle } from './three-scenes';

let generation = 0;
let disposeCurrent: (() => void) | null = null;
let rotateCurrent: ((direction: -1 | 1) => void) | null = null;

async function openScene(host: HTMLElement, mount: (module: typeof import('./three-scenes')) => Promise<SceneHandle>): Promise<boolean> {
  disposeThreeView();
  const request = ++generation;
  host.dataset.threeState = 'loading';
  host.replaceChildren();
  try {
    const module = await import('./three-scenes');
    if (request !== generation || !host.isConnected) return false;
    const handle = await mount(module);
    if (request !== generation || !host.isConnected) {
      handle.dispose();
      return false;
    }
    disposeCurrent = handle.dispose;
    rotateCurrent = handle.rotate;
    return true;
  } catch {
    if (request === generation && host.isConnected) {
      host.dataset.threeState = 'fallback';
      host.innerHTML = '<p class="three-scene-fallback">Объёмный вид сейчас недоступен. Обычная комната и игра работают как обычно.</p>';
    }
    return false;
  }
}

export function openStarView(host: HTMLElement, options: StarSceneOptions): Promise<boolean> {
  return openScene(host, module => Promise.resolve(module.mountStarScene(host, options)));
}

export function openRouteView(host: HTMLElement, options: RouteSceneOptions): Promise<boolean> {
  return openScene(host, module => Promise.resolve(module.mountRouteScene(host, options)));
}

export function openRoomView(host: HTMLElement, options: RoomSceneOptions): Promise<boolean> {
  return openScene(host, module => module.mountRoomScene(host, options));
}

export function rotateThreeView(direction: -1 | 1): void {
  rotateCurrent?.(direction);
}

export function disposeThreeView(): void {
  generation++;
  disposeCurrent?.();
  disposeCurrent = null;
  rotateCurrent = null;
}
