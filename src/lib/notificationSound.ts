/**
 * Notification Sound Utility
 * Uses Web Audio API to generate a pleasant notification chime
 * Industry-standard alert tone - balanced duration, smooth and attention-getting
 */

let audioContext: AudioContext | null = null;

// Initialize AudioContext on first user interaction (required by browsers)
const getAudioContext = (): AudioContext | null => {
  if (!audioContext) {
    try {
      audioContext = new (window.AudioContext ||
        (window as any).webkitAudioContext)();
    } catch (e) {
      console.warn("[NOTIFICATION_SOUND] Web Audio API not supported");
      return null;
    }
  }
  return audioContext;
};

/**
 * Play a pleasant notification chime
 * Three-note ascending tone - smooth, alerting, ~350ms total
 * Similar to Slack, Teams, and email notification sounds
 */
export const playNotificationSound = (): void => {
  const ctx = getAudioContext();
  if (!ctx) return;

  // Resume context if suspended (browser autoplay policy)
  if (ctx.state === "suspended") {
    ctx.resume();
  }

  const now = ctx.currentTime;

  // Three-note ascending chime (C5, E5, G5 - major triad)
  // Pleasant, recognizable, and alerting
  const notes = [
    { freq: 523, start: 0, duration: 0.12 }, // C5
    { freq: 659, start: 0.1, duration: 0.12 }, // E5
    { freq: 784, start: 0.2, duration: 0.18 }, // G5 (slightly longer for resolution)
  ];

  notes.forEach((note) => {
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    // Connect: oscillator -> filter -> gain -> output
    oscillator.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(ctx.destination);

    // Sine wave for a clean, bell-like tone
    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(note.freq, now + note.start);

    // Low-pass filter for smoothness
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(3000, now);
    filter.Q.setValueAtTime(0.5, now);

    // Smooth envelope - quick attack, gentle decay
    const startTime = now + note.start;
    gainNode.gain.setValueAtTime(0, startTime);
    gainNode.gain.linearRampToValueAtTime(0.2, startTime + 0.015); // Quick but smooth attack
    gainNode.gain.setValueAtTime(0.2, startTime + 0.03); // Brief sustain
    gainNode.gain.exponentialRampToValueAtTime(
      0.001,
      startTime + note.duration
    ); // Smooth decay

    oscillator.start(startTime);
    oscillator.stop(startTime + note.duration + 0.05);

    // Add subtle overtone for richness (bell-like quality)
    const overtone = ctx.createOscillator();
    const overtoneGain = ctx.createGain();

    overtone.connect(overtoneGain);
    overtoneGain.connect(ctx.destination);

    overtone.type = "sine";
    overtone.frequency.setValueAtTime(note.freq * 2, startTime); // Octave above

    overtoneGain.gain.setValueAtTime(0, startTime);
    overtoneGain.gain.linearRampToValueAtTime(0.05, startTime + 0.01);
    overtoneGain.gain.exponentialRampToValueAtTime(
      0.001,
      startTime + note.duration * 0.7
    );

    overtone.start(startTime);
    overtone.stop(startTime + note.duration);
  });
};

/**
 * Request permission and prepare audio context
 * Call this on user interaction to enable sounds
 */
export const initNotificationSound = (): void => {
  const ctx = getAudioContext();
  if (ctx && ctx.state === "suspended") {
    ctx.resume();
  }
};

/**
 * Check if notification sounds are supported
 */
export const isNotificationSoundSupported = (): boolean => {
  return !!(window.AudioContext || (window as any).webkitAudioContext);
};
