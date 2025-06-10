// Tests/RegisterForm.test.js
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import RegisterForm from '../components/RegisterForm';
import { useRouter } from 'next/navigation';

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

describe('RegisterForm', () => {
  const pushMock = jest.fn();

  beforeEach(() => {
    useRouter.mockReturnValue({ push: pushMock });
  });

  it('renders form inputs and button', () => {
    render(<RegisterForm />);
    expect(screen.getByPlaceholderText('Full Name')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Register' })).toBeInTheDocument();
  });

  it('shows error if fields are empty', async () => {
    render(<RegisterForm />);
    fireEvent.click(screen.getByRole('button', { name: 'Register' }));
    expect(await screen.findByText('All fields are required')).toBeInTheDocument();
  });

  describe('RegisterForm validation', () => {
    it('shows error for name longer than 40 characters', async () => {
      render(<RegisterForm />);
      
      fireEvent.change(screen.getByPlaceholderText('Full Name'), {
        target: { value: 'nnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnn' }, // 60 chars
      });
      fireEvent.change(screen.getByPlaceholderText('Email'), {
        target: { value: 'valid@email.com' }, // valid email
      });
      fireEvent.change(screen.getByPlaceholderText('Password'), {
        target: { value: 'validpass1' }, // valid password
      });
  
      fireEvent.click(screen.getByRole('button', { name: 'Register' }));
  
      expect(await screen.findByText('Full name must be 40 characters or less')).toBeInTheDocument();
    });
  
    it('shows error for invalid password format', async () => {
      render(<RegisterForm />);
      
      fireEvent.change(screen.getByPlaceholderText('Full Name'), {
        target: { value: 'Valid Name' }, // valid name
      });
      fireEvent.change(screen.getByPlaceholderText('Email'), {
        target: { value: 'valid@email.com' }, // valid email
      });
      fireEvent.change(screen.getByPlaceholderText('Password'), {
        target: { value: '1111' }, // invalid password (too short, no letters)
      });
  
      fireEvent.click(screen.getByRole('button', { name: 'Register' }));
  
      expect(await screen.findByText('Password must be at least 8 characters and include at least one letter')).toBeInTheDocument();
    });
  });
});
