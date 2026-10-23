const SOUND_KEY = 'respace-sound';
type SoundCue = 'tap' | 'saved';

type AudioWindow = Window & { webkitAudioContext?: typeof AudioContext };

export function createSound() {
  let enabled = false;
  let context: AudioContext | undefined;
  const AudioContextClass = window.AudioContext ?? (window as AudioWindow).webkitAudioContext;

  try { enabled = localStorage.getItem(SOUND_KEY) === 'on'; } catch {}

  function applyPreference() {
    document.documentElement.dataset.sound = enabled ? 'on' : 'off';
    document.querySelectorAll<HTMLButtonElement>('[data-action="sound-toggle"]').forEach(button => {
      button.setAttribute('aria-pressed', String(enabled));
      button.textContent = enabled ? 'Включён' : 'Выключен';
      button.disabled = !AudioContextClass;
    });
    document.querySelectorAll<HTMLElement>('[data-sound-note]').forEach(note => {
      note.textContent = AudioContextClass
        ? enabled ? 'Короткие сигналы звучат при выборе и сохранении.' : 'По умолчанию звук выключен. Его можно включить здесь.'
        : 'В этом браузере звуковые сигналы недоступны.';
    });
  }

  function tone(frequency: number, start: number, duration: number, volume: number, endFrequency: number) {
    if (!context) return;
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(frequency, start);
    oscillator.frequency.exponentialRampToValueAtTime(endFrequency, start + duration);
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(volume, start + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start(start);
    oscillator.stop(start + duration + 0.01);
  }

  function play(cue: SoundCue) {
    if (!enabled || !AudioContextClass) return;
    try {
      context ??= new AudioContextClass();
      if (context.state === 'suspended') void context.resume().catch(() => {});
      const now = context.currentTime + 0.005;
      if (cue === 'saved') {
        tone(523.25, now, 0.09, 0.017, 493.88);
        tone(659.25, now + 0.075, 0.105, 0.015, 622.25);
      } else {
        tone(554.37, now, 0.055, 0.012, 493.88);
      }
    } catch {
      // Audio is optional; an unavailable output never interrupts the action.
    }
  }

  applyPreference();
  window.addEventListener('storage', event => {
    if (event.key !== SOUND_KEY) return;
    enabled = event.newValue === 'on';
    applyPreference();
  });

  return {
    enabled: () => enabled,
    supported: () => !!AudioContextClass,
    setEnabled(value: boolean): boolean {
      if (value && !AudioContextClass) return false;
      try { localStorage.setItem(SOUND_KEY, value ? 'on' : 'off'); } catch { return false; }
      enabled = value;
      applyPreference();
      return true;
    },
    play,
  };
}
