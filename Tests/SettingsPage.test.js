// Tests/SettingsPage.test.js
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import SettingsPage from '../components/SettingPage';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';

// Mock the next-auth/react module
jest.mock('next-auth/react', () => ({
  useSession: jest.fn(),
  signOut: jest.fn(),
}));

// Mock the next/navigation module
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

jest.mock('@/Home/Navbar/Nav', () => {
    return function MockNav() {
      return <div>Mock Navigation</div>;
    };
  });

// Mock fetch
global.fetch = jest.fn();

describe('SettingsPage', () => {
  const mockPush = jest.fn();
  const mockSession = {
    user: {
      name: 'Test User',
      email: 'test@example.com',
      photo: 'https://example.com/profile.jpg',
      role: 'user'
    }
  };

  beforeEach(() => {
    useSession.mockReturnValue({ 
      data: mockSession,
      update: jest.fn().mockResolvedValue(true)
    });
    useRouter.mockReturnValue({ push: mockPush });
    fetch.mockClear();
    signOut.mockClear();
    mockPush.mockClear();
    // Mock localStorage
    Storage.prototype.setItem = jest.fn();
    Storage.prototype.getItem = jest.fn();
  });

  it('renders the settings page correctly', () => {
    render(<SettingsPage />);
    
    expect(screen.getByText('Settings & Preferences')).toBeInTheDocument();
    expect(screen.getByText('Profile Picture')).toBeInTheDocument();
    expect(screen.getByText('Basic Information')).toBeInTheDocument();
    expect(screen.getByText('Change Password')).toBeInTheDocument();
    expect(screen.getByText('Language & Theme')).toBeInTheDocument();
    expect(screen.getByText('Account Controls')).toBeInTheDocument();
    expect(screen.getByText('Save Changes')).toBeInTheDocument();
  });

  it('pre-fills form with user data from session', () => {
    render(<SettingsPage />);
    
    const nameInput = screen.getByPlaceholderText('Full Name');
    const emailInput = screen.getByPlaceholderText('Email');
    
    expect(nameInput.value).toBe(mockSession.user.name);
    expect(emailInput.value).toBe(mockSession.user.email);
  });

  it('handles form field changes', () => {
    render(<SettingsPage />);
    
    const nameInput = screen.getByPlaceholderText('Full Name');
    fireEvent.change(nameInput, { target: { value: 'New Name' } });
    expect(nameInput.value).toBe('New Name');
    
    const themeSelect = screen.getByDisplayValue('Normal Mode');
    fireEvent.change(themeSelect, { target: { value: 'dark' } });
    expect(themeSelect.value).toBe('dark');
  });

  it('shows error when required fields are empty on save', async () => {
    render(<SettingsPage />);
    
    const nameInput = screen.getByPlaceholderText('Full Name');
    fireEvent.change(nameInput, { target: { value: '' } });
    
    fireEvent.click(screen.getByText('Save Changes'));
    
    expect(await screen.findByText('Name and email are required')).toBeInTheDocument();
  });

  it('handles successful profile update', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({}),
    });
    
    render(<SettingsPage />);
    
    const nameInput = screen.getByPlaceholderText('Full Name');
    fireEvent.change(nameInput, { target: { value: 'Updated Name' } });
    
    fireEvent.click(screen.getByText('Save Changes'));
    
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/update-profile', expect.any(Object));
      expect(screen.getByText('Profile updated successfully!')).toBeInTheDocument();
    });
  });

  it('handles profile image upload', async () => {
    const mockFile = new File(['test'], 'test.png', { type: 'image/png' });
    const mockResponse = { photo: 'https://example.com/new-profile.jpg' };
    
    fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    });
    
    render(<SettingsPage />);
    
    const fileInput = screen.getByLabelText('Upload Photo');
    Object.defineProperty(fileInput, 'files', { value: [mockFile] });
    fireEvent.change(fileInput);
    
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/upload-profile-image', expect.any(Object));
    });
  });

  it('handles password mismatch error', async () => {
    render(<SettingsPage />);
    
    const newPasswordInput = screen.getByPlaceholderText('New Password');
    const confirmPasswordInput = screen.getByPlaceholderText('Confirm Password');
    
    fireEvent.change(newPasswordInput, { target: { value: 'newpass123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'differentpass' } });
    
    fireEvent.click(screen.getByText('Save Changes'));
    
    expect(await screen.findByText("New passwords don't match")).toBeInTheDocument();
  });

  it('handles account deletion', async () => {
    window.confirm = jest.fn().mockReturnValue(true);
    fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({}),
    });
    
    render(<SettingsPage />);
    
    fireEvent.click(screen.getByText('Delete Account'));
    
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/delete-account', expect.any(Object));
      expect(signOut).toHaveBeenCalled();
    });
  });

  it('handles sign out', () => {
    render(<SettingsPage />);
    
    fireEvent.click(screen.getByText('Sign Out'));
    expect(signOut).toHaveBeenCalled();
  });

  it('shows teacher application button for regular users', () => {
    render(<SettingsPage />);
    
    expect(screen.getByText('Become a Teacher')).toBeInTheDocument();
  });

  it('does not show teacher application button for non-users', () => {
    useSession.mockReturnValue({ 
      data: {
        ...mockSession,
        user: {
          ...mockSession.user,
          role: 'teacher'
        }
      }
    });
    
    render(<SettingsPage />);
    
    expect(screen.queryByText('Become a Teacher')).not.toBeInTheDocument();
  });
});