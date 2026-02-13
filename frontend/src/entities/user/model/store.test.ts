import {beforeEach, describe, expect, it} from 'vitest';
import {useAuthStore} from './store';

describe('Auth Store', () => {
  beforeEach(() => {
    useAuthStore.setState({token: null, isAuthenticated: false, mustChangePassword: false});
  });

  it('should have initial state', () => {
    const state = useAuthStore.getState();
    expect(state.token).toBeNull();
    expect(state.isAuthenticated).toBe(false);
    expect(state.mustChangePassword).toBe(false);
  });

  it('should set token and authenticate on login', () => {
    useAuthStore.getState().login('fake-token', true);

    const state = useAuthStore.getState();
    expect(state.token).toBe('fake-token');
    expect(state.isAuthenticated).toBe(true);
    expect(state.mustChangePassword).toBe(true);

    // Check persist storage
    const stored = JSON.parse(localStorage.getItem('auth-storage') || '{}');
    expect(stored.state.token).toBe('fake-token');
    expect(stored.state.mustChangePassword).toBe(true);
  });

  it('should clear token on logout', () => {
    // Setup
    useAuthStore.getState().login('fake-token', true);

    // Act
    useAuthStore.getState().logout();

    // Assert
    const state = useAuthStore.getState();
    expect(state.token).toBeNull();
    expect(state.isAuthenticated).toBe(false);
    expect(state.mustChangePassword).toBe(false);

    const stored = JSON.parse(localStorage.getItem('auth-storage') || '{}');
    expect(stored.state.token).toBeNull();
    expect(stored.state.mustChangePassword).toBe(false);
  });
});
