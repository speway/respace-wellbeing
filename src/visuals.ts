export type RiPose = 'calm' | 'think' | 'wave' | 'happy' | 'read' | 'rest';
export function ri(pose: RiPose = 'calm', small = false): string {
  return `<span class="ri ri-${pose}${small ? ' ri-small' : ''}" aria-hidden="true"></span>`;
}
export function art(scene: 'course' | 'room' | 'science' | 'story'): string {
  return `<span class="portal-art portal-${scene}" aria-hidden="true"></span>`;
}
