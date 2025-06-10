// Tests/LoginForm.test.js
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import LoginForm from '../components/LoginForm';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { useSession } from 'next-auth/react';

// Mock the next-auth/react module
jest.mock('next-auth/react', () => ({
  signIn: jest.fn(),
  useSession: jest.fn(() => ({ data: null })),
}));

// Mock the next/navigation module
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({ push: jest.fn() })),
}));

describe('LoginForm', () => {
  const mockPush = jest.fn();
  const mockSignIn = signIn;

  beforeEach(() => {
    useRouter.mockReturnValue({ push: mockPush });
    mockSignIn.mockReset();
    mockPush.mockReset();
  });


  it('shows error when fields are empty', async () => {
    render(<LoginForm />);
    
    fireEvent.click(screen.getByRole('button', { name: 'Login' }));
    
    expect(await screen.findByText('All fields are required')).toBeInTheDocument();
    expect(mockSignIn).not.toHaveBeenCalled();
  });

  it('calls signIn with correct credentials', async () => {
    mockSignIn.mockResolvedValueOnce({ error: null });
    
    render(<LoginForm />);
    
    fireEvent.change(screen.getByPlaceholderText('Email'), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('Password'), {
      target: { value: 'password123' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Login' }));
    
    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith('credentials', {
        email: 'test@example.com',
        password: 'password123',
        redirect: false,
      });
    });
  });

  it('redirects to dashboard on successful login', async () => {
    mockSignIn.mockResolvedValueOnce({ error: null });
    
    render(<LoginForm />);
    
    fireEvent.change(screen.getByPlaceholderText('Email'), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('Password'), {
      target: { value: 'password123' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Login' }));
    
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/dashboard');
    });
  });

  it('shows error when credentials are invalid', async () => {
    mockSignIn.mockResolvedValueOnce({ error: 'Invalid credentials' });
    
    render(<LoginForm />);
    
    fireEvent.change(screen.getByPlaceholderText('Email'), {
      target: { value: 'wrong@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('Password'), {
      target: { value: 'wrongpassword' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Login' }));
    
    expect(await screen.findByText('Invalid credentials')).toBeInTheDocument();
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('does not redirect if user is already logged in', () => {
    // Mock that user is already logged in
    useSession.mockImplementation(() => ({ data: { user: { name: 'Test User' } }}));
    
    render(<LoginForm />);
    
    expect(mockPush).toHaveBeenCalledTimes(0);
  });
});