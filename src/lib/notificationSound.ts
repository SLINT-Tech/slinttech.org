/**
 * Notification Sound Utility
 * Uses Web Audio API to generate a subtle, modern notification tone
 * Inspired by iMessage/WhatsApp style "bubble pop" sounds
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
 * Play a subtle, modern "bubble pop" notification sound
 * Soft and refreshing - similar to iMessage/modern chat apps
 */
export const playNotificationSound = (): void => {
  const ctx = getAudioContext();
  if (!ctx) return;

  // Resume context if suspended (browser autoplay policy)
  if (ctx.state === "suspended") {
    ctx.resume();
  }

  const now = ctx.currentTime;

  // Create primary tone - soft "pop"
  const oscillator = ctx.createOscillator();
  const gainNode = ctx.createGain();
  const filter = ctx.createBiquadFilter();

  // Connect: oscillator -> filter -> gain -> output
  oscillator.connect(filter);
  filter.connect(gainNode);
  gainNode.connect(ctx.destination);

  // Sine wave for a soft, warm tone
  oscillator.type = "sine";

  // Start at a higher frequency and quickly drop - creates the "pop" effect
  oscillator.frequency.setValueAtTime(1800, now);
  oscillator.frequency.exponentialRampToValueAtTime(400, now + 0.08);

  // Low-pass filter to soften the sound
  filter.type = "lowpass";
  filter.frequency.setValueAtTime(2000, now);
  filter.Q.setValueAtTime(1, now);

  // Gentle volume envelope
  gainNode.gain.setValueAtTime(0, now);
  gainNode.gain.linearRampToValueAtTime(0.15, now + 0.005); // Very quick, soft attack
  gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.15); // Smooth fade out

  oscillator.start(now);
  oscillator.stop(now + 0.2);

  // Add a subtle harmonic for richness
  const harmonic = ctx.createOscillator();
  const harmonicGain = ctx.createGain();

  harmonic.connect(harmonicGain);
  harmonicGain.connect(ctx.destination);

  harmonic.type = "sine";
  harmonic.frequency.setValueAtTime(2400, now);
  harmonic.frequency.exponentialRampToValueAtTime(600, now + 0.06);

  harmonicGain.gain.setValueAtTime(0, now);
  harmonicGain.gain.linearRampToValueAtTime(0.05, now + 0.003); // Even softer
  harmonicGain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

  harmonic.start(now);
  harmonic.stop(now + 0.15);
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
