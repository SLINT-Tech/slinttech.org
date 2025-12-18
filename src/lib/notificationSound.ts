/**
 * Notification Sound Utility
 * Uses Web Audio API to generate a pleasant notification tone
 * Industry-standard two-tone chime similar to Slack, Discord, etc.
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
 * Play a pleasant two-tone notification chime
 * Similar to Slack/Discord notification sounds
 */
export const playNotificationSound = (): void => {
  const ctx = getAudioContext();
  if (!ctx) return;

  // Resume context if suspended (browser autoplay policy)
  if (ctx.state === "suspended") {
    ctx.resume();
  }

  const now = ctx.currentTime;

  // Create a pleasant two-tone notification (like Slack)
  const frequencies = [830, 1050]; // E5, C6 - pleasant interval
  const duration = 0.12;
  const gap = 0.08;

  frequencies.forEach((freq, index) => {
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    // Use sine wave for a soft, pleasant tone
    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(freq, now);

    // Envelope for smooth attack and decay
    const startTime = now + index * (duration + gap);
    gainNode.gain.setValueAtTime(0, startTime);
    gainNode.gain.linearRampToValueAtTime(0.3, startTime + 0.01); // Quick attack
    gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration); // Smooth decay

    oscillator.start(startTime);
    oscillator.stop(startTime + duration + 0.05);
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
