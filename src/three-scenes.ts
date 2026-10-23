import * as THREE from 'three';

export interface StarSceneOptions {
  points: readonly (readonly [number, number])[];
  edges: readonly (readonly [number, number])[];
  color: string;
}

export interface RouteSceneOptions {
  total: number;
  completed: readonly number[];
  current: number;
}

export interface RoomSceneOptions {
  theme: number;
  palette: number;
  items: readonly { kind: string; slot: number; rotation: number }[];
  activityPose?: 'calm' | 'read' | 'rest';
  activitySlot?: number;
}

export interface SceneHandle {
  dispose(): void;
  rotate(direction: -1 | 1): void;
}

function mountCanvas(host: HTMLElement, scene: THREE.Scene, camera: THREE.PerspectiveCamera, orbit: THREE.Group): SceneHandle {
  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'low-power', precision: 'mediump' });
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.08;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.6));
  renderer.setSize(1, 1, false);
  renderer.domElement.setAttribute('aria-hidden', 'true');
  renderer.domElement.setAttribute('role', 'presentation');
  renderer.domElement.tabIndex = 0;
  renderer.domElement.className = 'three-scene-canvas';
  host.replaceChildren(renderer.domElement);
  host.dataset.threeState = 'ready';

  const render = () => renderer.render(scene, camera);
  const resize = () => {
    const { width, height } = host.getBoundingClientRect();
    const w = Math.max(1, Math.round(width));
    const h = Math.max(1, Math.round(height));
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h, false);
    render();
  };
  const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(resize);
  observer?.observe(host);
  if (!observer) window.addEventListener('resize', resize);

  let dragging = false;
  let lastX = 0;
  let lastY = 0;
  const pointerDown = (event: PointerEvent) => {
    dragging = true;
    lastX = event.clientX;
    lastY = event.clientY;
    renderer.domElement.setPointerCapture(event.pointerId);
  };
  const pointerMove = (event: PointerEvent) => {
    if (!dragging) return;
    orbit.rotation.y += (event.clientX - lastX) * 0.009;
    orbit.rotation.x = THREE.MathUtils.clamp(orbit.rotation.x + (event.clientY - lastY) * 0.009, -0.9, 0.9);
    lastX = event.clientX;
    lastY = event.clientY;
    render();
  };
  const pointerUp = () => { dragging = false; };
  const keyDown = (event: KeyboardEvent) => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    orbit.rotation.y += event.key === 'ArrowLeft' ? -0.55 : 0.55;
    render();
  };
  renderer.domElement.addEventListener('pointerdown', pointerDown);
  renderer.domElement.addEventListener('pointermove', pointerMove);
  renderer.domElement.addEventListener('pointerup', pointerUp);
  renderer.domElement.addEventListener('pointercancel', pointerUp);
  renderer.domElement.addEventListener('keydown', keyDown);
  resize();

  let disposed = false;
  return {
    dispose() {
      if (disposed) return;
      disposed = true;
      observer?.disconnect();
      if (!observer) window.removeEventListener('resize', resize);
      renderer.domElement.removeEventListener('pointerdown', pointerDown);
      renderer.domElement.removeEventListener('pointermove', pointerMove);
      renderer.domElement.removeEventListener('pointerup', pointerUp);
      renderer.domElement.removeEventListener('pointercancel', pointerUp);
      renderer.domElement.removeEventListener('keydown', keyDown);
      const geometries = new Set<THREE.BufferGeometry>();
      const materials = new Set<THREE.Material>();
      const textures = new Set<THREE.Texture>();
      scene.traverse(object => {
        if (object instanceof THREE.Mesh || object instanceof THREE.Line || object instanceof THREE.Points) geometries.add(object.geometry);
        const material = (object as THREE.Mesh | THREE.Line | THREE.Points | THREE.Sprite).material;
        if (Array.isArray(material)) material.forEach(item => materials.add(item));
        else if (material) materials.add(material);
      });
      materials.forEach(material => {
        for (const value of Object.values(material)) if (value instanceof THREE.Texture) textures.add(value);
        material.dispose();
      });
      geometries.forEach(geometry => geometry.dispose());
      textures.forEach(texture => texture.dispose());
      renderer.dispose();
      renderer.domElement.remove();
      delete host.dataset.threeState;
      scene.clear();
    },
    rotate(direction) {
      orbit.rotation.y += direction * 0.55;
      render();
    },
  };
}

function softGlowTexture(color: string): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 96;
  canvas.height = 96;
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Не удалось подготовить мягкое свечение.');
  const gradient = context.createRadialGradient(48, 48, 0, 48, 48, 48);
  gradient.addColorStop(0, color);
  gradient.addColorStop(0.3, `${color}bb`);
  gradient.addColorStop(1, `${color}00`);
  context.fillStyle = gradient;
  context.fillRect(0, 0, 96, 96);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function addStarfield(scene: THREE.Scene, count = 42, color = 0xdbe4ff): void {
  const positions = new Float32Array(count * 3);
  let seed = 19;
  const next = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };
  for (let i = 0; i < count; i += 1) {
    positions[i * 3] = (next() - 0.5) * 10;
    positions[i * 3 + 1] = (next() - 0.5) * 5.8;
    positions[i * 3 + 2] = -1.7 - next() * 3.5;
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  scene.add(new THREE.Points(geometry, new THREE.PointsMaterial({ color, size: 0.035, transparent: true, opacity: 0.58, sizeAttenuation: true })));
}

function addSoftLight(scene: THREE.Scene, color: THREE.ColorRepresentation, intensity: number, position: [number, number, number]): void {
  const light = new THREE.PointLight(color, intensity, 14, 2);
  light.position.set(...position);
  scene.add(light);
}

export function mountStarScene(host: HTMLElement, options: StarSceneOptions): SceneHandle {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 30);
  camera.position.set(0, 0, 8.5);
  const sky = new THREE.Group();
  scene.add(sky);
  addStarfield(scene, 58, 0xd9e1fb);
  addSoftLight(scene, 0x9aaeff, 1.8, [-3.6, 2.6, 4]);
  addSoftLight(scene, 0xf5d9a1, 1.1, [3.4, -1.8, 3]);

  sky.add(new THREE.Mesh(
    new THREE.SphereGeometry(2.82, 24, 16),
    new THREE.MeshBasicMaterial({ color: 0x8191b3, transparent: true, opacity: 0.16, side: THREE.BackSide, depthWrite: false }),
  ));
  sky.add(new THREE.Mesh(
    new THREE.TorusGeometry(2.82, 0.018, 5, 72),
    new THREE.MeshBasicMaterial({ color: 0xaab9d7, transparent: true, opacity: 0.45 }),
  ));
  const orbitRing = new THREE.Mesh(
    new THREE.TorusGeometry(3.12, 0.012, 4, 72),
    new THREE.MeshBasicMaterial({ color: 0xc2c9de, transparent: true, opacity: 0.3 }),
  );
  orbitRing.rotation.set(0.82, 0.16, 0.18);
  sky.add(orbitRing);

  const lineColor = /^#[0-9a-f]{6}$/i.test(options.color) ? options.color : '#c6d8ff';
  const lineMaterial = new THREE.MeshBasicMaterial({ color: lineColor, transparent: true, opacity: 0.92 });
  const glowLineMaterial = new THREE.MeshBasicMaterial({ color: lineColor, transparent: true, opacity: 0.17, depthWrite: false, blending: THREE.AdditiveBlending });
  const positions = options.points.map(([x, y]) => new THREE.Vector3(((x - 50) / 50) * 2.15, ((50 - y) / 50) * 1.62, 0.08));
  for (const [from, to] of options.edges) {
    const a = positions[from];
    const b = positions[to];
    if (!a || !b) continue;
    const path = new THREE.QuadraticBezierCurve3(a, new THREE.Vector3((a.x + b.x) / 2, (a.y + b.y) / 2, 0.36), b);
    sky.add(new THREE.Mesh(new THREE.TubeGeometry(path, 20, 0.027, 6, false), lineMaterial));
    sky.add(new THREE.Mesh(new THREE.TubeGeometry(path, 20, 0.095, 6, false), glowLineMaterial));
  }

  const starGeometry = new THREE.SphereGeometry(0.09, 14, 10);
  const starMaterial = new THREE.MeshBasicMaterial({ color: 0xfff3c4 });
  const glowMaterial = new THREE.MeshBasicMaterial({ color: lineColor });
  const glowGeometry = new THREE.SphereGeometry(0.17, 10, 8);
  const starGlow = softGlowTexture('#fff0ba');
  for (const point of positions) {
    const glow = new THREE.Mesh(glowGeometry, glowMaterial);
    glow.position.copy(point);
    sky.add(glow);
    const star = new THREE.Mesh(starGeometry, starMaterial);
    star.position.copy(point);
    sky.add(star);
    const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: starGlow, color: 0xfff0ba, transparent: true, opacity: 0.62, depthWrite: false, blending: THREE.AdditiveBlending }));
    sprite.position.copy(point);
    sprite.scale.setScalar(0.78);
    sky.add(sprite);
  }
  return mountCanvas(host, scene, camera, sky);
}

export async function mountRouteScene(host: HTMLElement, options: RouteSceneOptions): Promise<SceneHandle> {
  const actorImage = await loadImage('/art/ri-poses.png');
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 30);
  camera.position.set(0, 0.1, 5.3);
  camera.lookAt(0, 0, 0);
  const route = new THREE.Group();
  route.scale.set(1.18, 1.06, 1);
  scene.add(route);
  addStarfield(scene, 44, 0x53658d);
  scene.add(new THREE.AmbientLight(0xdce8ff, 2.2));
  addSoftLight(scene, 0xc5b9ff, 2.5, [-3.4, 2.8, 4]);
  addSoftLight(scene, 0xffd9a9, 1.5, [3.2, -2.1, 3]);

  const glow = new THREE.Mesh(new THREE.SphereGeometry(2.3, 28, 18), new THREE.MeshBasicMaterial({ color: 0x7c95b9, transparent: true, opacity: 0.16, side: THREE.BackSide, depthWrite: false }));
  route.add(glow);
  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(2.35, 0.025, 7, 96),
    new THREE.MeshStandardMaterial({ color: 0xc6d4ee, roughness: 0.36, metalness: 0.1, transparent: true, opacity: 0.58 }),
  );
  ring.rotation.set(0.7, -0.25, 0.15);
  route.add(ring);

  const positions: THREE.Vector3[] = [];
  const total = Math.max(1, options.total);
  for (let index = 0; index < total; index += 1) {
    const angle = -1.25 + (index / Math.max(1, total - 1)) * Math.PI * 2.5;
    positions.push(new THREE.Vector3(Math.cos(angle) * 1.72, Math.sin(angle) * 1.12, (index - (total - 1) / 2) * 0.045));
  }
  const path = new THREE.CatmullRomCurve3(positions);
  if (positions.length > 1) {
    route.add(new THREE.Mesh(new THREE.TubeGeometry(path, Math.max(24, positions.length * 8), 0.035, 6, false), new THREE.MeshStandardMaterial({ color: 0xb8c5e8, roughness: 0.42, metalness: 0.12, transparent: true, opacity: 0.76 })));
    route.add(new THREE.Mesh(new THREE.TubeGeometry(path, Math.max(24, positions.length * 8), 0.11, 6, false), new THREE.MeshBasicMaterial({ color: 0x8797cb, transparent: true, opacity: 0.08, depthWrite: false, blending: THREE.AdditiveBlending })));
  }

  const completed = new Set(options.completed);
  const glowTexture = softGlowTexture('#d4c6ff');
  positions.forEach((position, index) => {
    const isCurrent = index === options.current;
    const isDone = completed.has(index);
    const color = isCurrent ? 0x9b8bf5 : isDone ? 0x5ed4ba : 0xf3c391;
    const node = new THREE.Mesh(new THREE.CylinderGeometry(isCurrent ? 0.2 : 0.145, isCurrent ? 0.2 : 0.145, 0.08, 24), new THREE.MeshStandardMaterial({ color, roughness: 0.3, metalness: 0.12 }));
    node.position.copy(position);
    node.rotation.x = Math.PI / 2;
    route.add(node);
    const haloSprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTexture, color, transparent: true, opacity: isCurrent ? 0.62 : 0.3, depthWrite: false, blending: THREE.AdditiveBlending }));
    haloSprite.position.copy(position);
    haloSprite.scale.setScalar(isCurrent ? 0.72 : 0.46);
    route.add(haloSprite);
    if (isCurrent) {
      const halo = new THREE.Mesh(new THREE.TorusGeometry(0.32, 0.035, 8, 32), new THREE.MeshStandardMaterial({ color: 0xb7a9ff, emissive: 0x5d4cc5, emissiveIntensity: 0.45, roughness: 0.32, metalness: 0.08, transparent: true, opacity: 0.85 }));
      halo.position.copy(position);
      halo.rotation.x = 0.8;
      route.add(halo);
    }
  });
  const actorTexture = spriteTexture(actorImage, 4, 3);
  const actor = new THREE.Sprite(new THREE.SpriteMaterial({ map: actorTexture, transparent: true, depthWrite: false }));
  actor.position.set(0, -0.15, 0.7);
  actor.scale.set(1.6, 1.6, 1);
  route.add(actor);
  return mountCanvas(host, scene, camera, route);
}

function loadImage(source: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error(`Не удалось открыть ${source}`));
    image.src = source;
    if (image.complete && image.naturalWidth) resolve(image);
  });
}

function spriteTexture(image: HTMLImageElement, index: number, columns: number, rowBands?: readonly (readonly [number, number])[]): THREE.CanvasTexture {
  const cellWidth = image.naturalWidth / columns;
  const row = Math.floor(index / columns);
  const [top, bottom] = rowBands?.[row] ?? [row * cellWidth, (row + 1) * cellWidth];
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(cellWidth);
  canvas.height = Math.round(bottom - top);
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Не удалось подготовить иллюстрацию предмета.');
  context.drawImage(image, (index % columns) * cellWidth, top, cellWidth, bottom - top, 0, 0, canvas.width, canvas.height);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

export async function mountRoomScene(host: HTMLElement, options: RoomSceneOptions): Promise<SceneHandle> {
  const [itemsImage, actorImage] = await Promise.all([loadImage('/art/room-items.png'), loadImage('/art/ri-poses.png')]);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 40);
  camera.position.set(5.2, 4.3, 8.8);
  camera.lookAt(0, -0.15, 0.1);
  const room = new THREE.Group();
  scene.add(room);
  scene.add(new THREE.HemisphereLight(0xfff6e8, 0x5e6b83, 2.4));
  const windowLight = new THREE.DirectionalLight(options.palette === 2 ? 0xbac8ff : 0xffefc7, 2.6);
  windowLight.position.set(3.5, 5.4, 4.8);
  scene.add(windowLight);
  addSoftLight(scene, options.palette === 2 ? 0x8d9cf7 : 0xffbc8f, 1.2, [-2.8, -0.2, 2.8]);

  const wallColors = ['#eadbc3', '#eef1d9', '#535672', '#cde8df'];
  const floorColors = ['#cdb99f', '#d3cfb1', '#3c435b', '#a9c6b9'];
  const wall = options.palette === 2 ? '#444967' : wallColors[options.palette] ?? wallColors[0];
  const floor = floorColors[options.palette] ?? floorColors[0];
  const basic = (color: THREE.ColorRepresentation) => new THREE.MeshStandardMaterial({ color, side: THREE.DoubleSide, roughness: 0.78, metalness: 0.02 });
  const addBox = (width: number, height: number, depth: number, color: string, position: [number, number, number]) => {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), basic(color));
    mesh.position.set(...position);
    room.add(mesh);
    return mesh;
  };

  addBox(5.8, 3.55, 0.14, wall, [0, 0, -1.48]);
  addBox(0.14, 3.55, 3.65, options.palette === 2 ? '#474b67' : wallColors[options.palette] ?? wallColors[0], [-2.84, 0, 0.32]);
  addBox(5.8, 0.14, 3.65, floor, [0, -1.79, 0.32]);
  addBox(1.34, 1.06, 0.04, options.palette === 2 ? '#252e4a' : '#93aeb8', [1.58, 0.72, -1.375]);
  addBox(1.42, 0.07, 0.07, options.palette === 2 ? '#e9d6a8' : '#fffaf0', [1.58, 1.28, -1.33]);
  addBox(1.42, 0.07, 0.07, options.palette === 2 ? '#e9d6a8' : '#fffaf0', [1.58, 0.16, -1.33]);
  addBox(0.07, 1.18, 0.07, options.palette === 2 ? '#e9d6a8' : '#fffaf0', [0.87, 0.72, -1.33]);
  addBox(0.07, 1.18, 0.07, options.palette === 2 ? '#e9d6a8' : '#fffaf0', [2.29, 0.72, -1.33]);
  addBox(0.05, 1.02, 0.07, options.palette === 2 ? '#e9d6a8' : '#fffaf0', [1.58, 0.72, -1.31]);
  addBox(1.34, 0.05, 0.07, options.palette === 2 ? '#e9d6a8' : '#fffaf0', [1.58, 0.72, -1.31]);

  const moon = new THREE.Mesh(new THREE.SphereGeometry(0.13, 12, 10), basic(options.palette === 2 ? '#f5e3ac' : '#fff3bc'));
  moon.position.set(1.85, 0.88, -1.28);
  room.add(moon);

  const itemIndices = ['chair', 'desk', 'lamp', 'cup', 'plant', 'books', 'rug', 'picture', 'controller', 'headphones', 'robot', 'blanket'];
  const rowBands = [[0, 420], [420, 740], [740, 1086]] as const;
  const angleToCamera = Math.atan2(camera.position.x, camera.position.z);
  const positions = (slot: number) => [((slot % 3) - 1) * 1.72, -1.3, Math.floor(slot / 3) * 1.02 - 1.0] as const;

  for (const item of options.items) {
    const index = itemIndices.indexOf(item.kind);
    if (index < 0) continue;
    const [x, y, z] = positions(item.slot);
    const texture = spriteTexture(itemsImage, index, 4, rowBands);
    const material = new THREE.MeshBasicMaterial({ map: texture, transparent: true, alphaTest: 0.04, side: THREE.DoubleSide, depthWrite: false });
    const rug = item.kind === 'rug';
    const sprite = new THREE.Mesh(new THREE.PlaneGeometry(rug ? 1.25 : 0.78, rug ? 0.78 : 0.82), material);
    sprite.position.set(x, rug ? -1.705 : y, z);
    if (rug) sprite.rotation.x = -Math.PI / 2;
    else {
      sprite.rotation.y = angleToCamera;
      sprite.rotation.z = item.rotation * Math.PI / 12;
    }
    room.add(sprite);
  }

  if (options.activityPose && options.activitySlot !== undefined) {
    const poseIndex = options.activityPose === 'read' ? 4 : options.activityPose === 'rest' ? 5 : 0;
    const [x, _y, z] = positions(options.activitySlot);
    const actorTexture = spriteTexture(actorImage, poseIndex, 3);
    const actor = new THREE.Mesh(
      new THREE.PlaneGeometry(0.9, 0.96),
      new THREE.MeshBasicMaterial({ map: actorTexture, transparent: true, alphaTest: 0.04, side: THREE.DoubleSide, depthWrite: false }),
    );
    actor.position.set(x + 0.2, -0.95, z + 0.07);
    actor.rotation.y = angleToCamera;
    room.add(actor);
  }

  if (options.theme === 2) {
    const night = new THREE.Mesh(new THREE.SphereGeometry(0.07, 10, 8), basic('#f4edc6'));
    night.position.set(1.95, 0.58, -1.29);
    room.add(night);
  }
  return mountCanvas(host, scene, camera, room);
}
