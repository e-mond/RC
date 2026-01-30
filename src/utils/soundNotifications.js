/**
 * soundNotifications.js - Sound Notification Utilities
 * 
 * Provides sound notification functionality for messages and notifications.
 * Uses Web Audio API for cross-browser compatibility.
 * 
 * Features:
 * - Play notification sounds
 * - Configurable volume
 * - Multiple sound types (message, notification, alert)
 * - Respects user preferences (can be disabled)
 * 
 * @module soundNotifications
 */

/**
 * Play a notification sound
 * @param {string} type - Sound type ('message', 'notification', 'alert')
 * @param {number} volume - Volume (0.0 to 1.0, default: 0.3)
 */
export function playNotificationSound(type = "message", volume = 0.3) {
  try {
    // Check if sounds are enabled (from localStorage or user preferences)
    const soundsEnabled = localStorage.getItem("soundsEnabled") !== "false";
    if (!soundsEnabled) return;

    // Create audio context
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    
    // Generate sound based on type
    let frequency = 800; // Default frequency
    let duration = 0.1; // Default duration
    
    switch (type) {
      case "message":
        frequency = 800;
        duration = 0.15;
        break;
      case "notification":
        frequency = 600;
        duration = 0.2;
        break;
      case "alert":
        frequency = 1000;
        duration = 0.3;
        break;
      default:
        frequency = 800;
        duration = 0.15;
    }
    
    // Create oscillator
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = frequency;
    oscillator.type = "sine";
    
    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(volume, audioContext.currentTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + duration);
  } catch (err) {
    // Silent fail - sound notifications are optional
    console.warn("Failed to play notification sound:", err);
  }
}

/**
 * Enable or disable sound notifications
 * @param {boolean} enabled - Whether sounds are enabled
 */
export function setSoundsEnabled(enabled) {
  localStorage.setItem("soundsEnabled", enabled ? "true" : "false");
}

/**
 * Check if sounds are enabled
 * @returns {boolean} Whether sounds are enabled
 */
export function areSoundsEnabled() {
  return localStorage.getItem("soundsEnabled") !== "false";
}

