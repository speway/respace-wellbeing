const MOTION_KEY = 'respace-motion';

export function createMotion() {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  let enabled = true;
  try { enabled = localStorage.getItem(MOTION_KEY) !== 'off'; } catch {}
  let dialogObserver: MutationObserver | undefined;
  let dialogWasOpen = false;
  const running = new Set<Animation>();

  const allowed = () => enabled && !reduced.matches;
  function applyPreference() {
    document.documentElement.dataset.motion = allowed() ? 'on' : 'off';
    if (!allowed()) for (const animation of running) animation.cancel();
    document.querySelectorAll<HTMLElement>('[data-action="motion-toggle"]').forEach(button => {
      button.setAttribute('aria-pressed', String(enabled));
      button.textContent = enabled ? 'Включено' : 'Выключено';
    });
    document.querySelectorAll<HTMLElement>('[data-motion-note]').forEach(note => {
      note.textContent = reduced.matches ? ' На устройстве включено уменьшение движения.' : '';
    });
  }
  function enter(element: HTMLElement | null, distance = 8, duration = 190) {
    if (!element || !allowed() || typeof element.animate !== 'function') return;
    const animation = element.animate(
      [{ opacity: 0.4, transform: `translateY(${distance}px)` }, { opacity: 1, transform: 'translateY(0)' }],
      { duration, easing: 'cubic-bezier(.2,.7,.2,1)' },
    );
    running.add(animation);
    animation.finished.catch(() => {}).finally(() => running.delete(animation));
  }
  function feedback(element: HTMLElement) {
    if (!allowed() || typeof element.animate !== 'function') return;
    const animation = element.animate(
      [{ opacity: 0.55, transform: 'translateY(3px)' }, { opacity: 1, transform: 'translateY(0)' }],
      { duration: 175, easing: 'cubic-bezier(.2,.7,.2,1)' },
    );
    running.add(animation);
    animation.finished.catch(() => {}).finally(() => running.delete(animation));
  }
  function arrival(root: HTMLElement) {
    const image = root.querySelector<HTMLImageElement>('.station-art > img');
    if (!image || image.complete) return;
    const cover = document.createElement('div');
    cover.className = 'station-arrival';
    cover.setAttribute('role', 'status');
    cover.innerHTML = '<span class="ri ri-wave" aria-hidden="true"></span><strong>респейс</strong><span>Открываем станцию</span>';
    image.parentElement?.append(cover);
    const reveal = () => {
      image.removeEventListener('load', reveal);
      image.removeEventListener('error', reveal);
      if (!cover.isConnected || !allowed() || typeof cover.animate !== 'function') { cover.remove(); return; }
      const animation = cover.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 140 });
      running.add(animation);
      animation.finished.catch(() => {}).finally(() => { running.delete(animation); cover.remove(); });
    };
    image.addEventListener('load', reveal, { once: true });
    image.addEventListener('error', reveal, { once: true });
    if (image.complete) reveal();
  }
  const feedbackObserver = new MutationObserver(records => {
    if (!allowed()) return;
    for (const record of records) for (const node of record.addedNodes) {
      if (!(node instanceof HTMLElement)) continue;
      if (node.matches('[data-motion-feedback]')) feedback(node);
      node.querySelectorAll<HTMLElement>('[data-motion-feedback]').forEach(feedback);
    }
  });
  feedbackObserver.observe(document.body, { childList: true, subtree: true });
  applyPreference();
  reduced.addEventListener('change', applyPreference);
  window.addEventListener('storage', event => {
    if (event.key !== MOTION_KEY) return;
    enabled = event.newValue !== 'off';
    applyPreference();
  });

  return {
    enabled: () => enabled,
    systemReduced: () => reduced.matches,
    setEnabled(value: boolean): boolean {
      try { localStorage.setItem(MOTION_KEY, value ? 'on' : 'off'); } catch { return false; }
      enabled = value;
      applyPreference();
      return true;
    },
    rendered(root: HTMLElement, pageChanged: boolean) {
      if (pageChanged) enter(root.querySelector<HTMLElement>('#main'));
      dialogObserver?.disconnect();
      const dialog = root.querySelector<HTMLDialogElement>('#modal');
      dialogWasOpen = false;
      if (dialog) {
        dialogObserver = new MutationObserver(() => {
          if (dialog.open && !dialogWasOpen) {
            dialogWasOpen = true;
            enter(dialog, 6, 170);
          }
        });
        dialogObserver.observe(dialog, { childList: true });
        dialog.addEventListener('close', () => { dialogWasOpen = false; });
      }
      arrival(root);
    },
  };
}
