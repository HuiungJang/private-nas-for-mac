import {fireEvent, render, screen, waitFor} from '@testing-library/react';
import {describe, expect, it, vi} from 'vitest';
import {LoginForm} from './LoginForm';
import {apiClient} from '@/shared/api/axios';
import {MemoryRouter} from 'react-router-dom';

// Mock axios
vi.mock('@/shared/api/axios', () => ({
  apiClient: {
    post: vi.fn(),
  },
}));

// Mock store
const mockLogin = vi.fn();
vi.mock('@/entities/user/model/store', () => ({
  useAuthStore: (selector: any) => {
    const state = {login: mockLogin};
    return selector ? selector(state) : state;
  },
}));

describe('LoginForm', () => {
  it('renders login form correctly', () => {
    render(<MemoryRouter><LoginForm/></MemoryRouter>);

    expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', {name: /sign in/i})).toBeInTheDocument();
  });

  it('calls api and login action on submit', async () => {
    // Setup Mock
    (apiClient.post as any).mockResolvedValueOnce({
      data: {token: 'jwt-token', mustChangePassword: false},
    });

    render(<MemoryRouter><LoginForm/></MemoryRouter>);

    // Fill form
    fireEvent.change(screen.getByLabelText(/username/i), {target: {value: 'admin'}});
    fireEvent.change(screen.getByLabelText(/password/i), {target: {value: 'password'}});

    // Submit
    fireEvent.click(screen.getByRole('button', {name: /sign in/i}));

    // Assert API call
    await waitFor(() => {
      expect(apiClient.post).toHaveBeenCalledWith('/auth/login', {
        username: 'admin',
        password: 'password',
      });
    });

    // Assert Store action
    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('jwt-token', false);
    });
  });

  it('shows error message on failure', async () => {
    // Setup Mock Error
    (apiClient.post as any).mockRejectedValueOnce({
      response: {data: {detail: 'Invalid credentials'}},
    });

    render(<MemoryRouter><LoginForm/></MemoryRouter>);

    // Fill & Submit
    fireEvent.change(screen.getByLabelText(/username/i), {target: {value: 'admin'}});
    fireEvent.change(screen.getByLabelText(/password/i), {target: {value: 'wrong'}});
    fireEvent.click(screen.getByRole('button', {name: /sign in/i}));

    // Assert Error Message
    await waitFor(() => {
      expect(screen.getByText(/login failed/i)).toBeInTheDocument();
    });
  });
});
