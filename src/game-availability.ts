/**
 * A deliberately local, reversible product gate.
 *
 * Existing `space` data continues to be validated, exported and optionally
 * synchronized. The gate controls access to the interaction surfaces only.
 */
export const GAMES_ENABLED = false;

export const GAMES_PAUSED_MESSAGE = 'Игровые пространства сейчас на переработке. Сохранённые результаты останутся в твоих данных и будут доступны после новой проверки сценариев.';

const gameActions = new Set([
  'room', 'room-activity', 'room-export', 'room-item', 'room-orbit-close', 'room-orbit-open', 'room-page', 'room-place', 'room-remove', 'room-rotate', 'room-save', 'room-tea', 'room-undo',
  'stars', 'star-add', 'star-clear', 'star-export', 'star-hint', 'star-line-remove', 'star-move', 'star-orbit-close', 'star-orbit-open', 'star-point', 'star-redo', 'star-remove', 'star-save', 'star-undo',
  'sky-next', 'sky-route', 'nori', 'nori-start',
  'mail', 'mail-check', 'mail-save', 'mail-slot', 'mail-start', 'mail-task', 'mail-undo',
  'story', 'story-back', 'story-choice', 'story-restart',
  'museum', 'museum-back', 'museum-explain', 'museum-more', 'museum-postcard', 'museum-resume', 'museum-rule', 'museum-save', 'museum-shape', 'museum-start', 'museum-word',
  'artifact-discard', 'artifact-return', 'artifact-save-close',
]);

export function isPausedGameAction(action: string | undefined): boolean {
  return !GAMES_ENABLED && !!action && gameActions.has(action);
}
