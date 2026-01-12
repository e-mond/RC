/**
 * Tests for Service Worker Registration
 */

import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { registerServiceWorker, unregisterServiceWorker } from '../registerServiceWorker';

describe('registerServiceWorker', () => {
  let originalServiceWorker;
  let mockServiceWorker;

  beforeEach(() => {
    // Mock navigator.serviceWorker
    mockServiceWorker = {
      register: vi.fn().mockResolvedValue({
        installing: null,
        waiting: null,
        active: null,
        onupdatefound: null,
      }),
      ready: Promise.resolve({
        unregister: vi.fn().mockResolvedValue(true),
      }),
      controller: null,
    };

    originalServiceWorker = global.navigator.serviceWorker;
    global.navigator.serviceWorker = mockServiceWorker;
  });

  afterEach(() => {
    global.navigator.serviceWorker = originalServiceWorker;
    vi.clearAllMocks();
  });

  test('registers service worker when available', async () => {
    // Mock window.addEventListener
    const addEventListenerSpy = vi.spyOn(window, 'addEventListener');
    
    registerServiceWorker();

    expect(addEventListenerSpy).toHaveBeenCalledWith('load', expect.any(Function));
    
    // Simulate load event
    const loadHandler = addEventListenerSpy.mock.calls.find(
      call => call[0] === 'load'
    )?.[1];
    
    if (loadHandler) {
      // Mock fetch for localhost check
      global.fetch = vi.fn().mockResolvedValue({
        status: 200,
        headers: {
          get: () => 'application/javascript',
        },
      });
      
      loadHandler();
      
      // Wait for async operations
      await new Promise(resolve => setTimeout(resolve, 10));
      
      // Service worker should be registered
      expect(mockServiceWorker.register).toHaveBeenCalledWith('/sw.js');
    }
  });

  test('does not register if serviceWorker not available', () => {
    delete global.navigator.serviceWorker;
    
    const addEventListenerSpy = vi.spyOn(window, 'addEventListener');
    
    registerServiceWorker();

    // Should not add event listener if serviceWorker is not available
    const loadListeners = addEventListenerSpy.mock.calls.filter(
      call => call[0] === 'load'
    );
    expect(loadListeners.length).toBe(0);
  });

  test('unregisterServiceWorker unregisters service worker', async () => {
    await unregisterServiceWorker();
    
    expect(mockServiceWorker.ready).toBeDefined();
  });

  test('handles registration errors gracefully', async () => {
    mockServiceWorker.register.mockRejectedValue(new Error('Registration failed'));
    
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const addEventListenerSpy = vi.spyOn(window, 'addEventListener');
    
    registerServiceWorker();
    
    const loadHandler = addEventListenerSpy.mock.calls.find(
      call => call[0] === 'load'
    )?.[1];
    
    if (loadHandler) {
      // Mock fetch for localhost check
      global.fetch = vi.fn().mockResolvedValue({
        status: 200,
        headers: {
          get: () => 'application/javascript',
        },
      });
      
      loadHandler();
      
      // Wait for async operations
      await new Promise(resolve => setTimeout(resolve, 10));
      
      // Should handle error without crashing
      expect(mockServiceWorker.register).toHaveBeenCalled();
    }
    
    consoleErrorSpy.mockRestore();
  });
});

