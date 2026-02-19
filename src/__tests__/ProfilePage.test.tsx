import '@testing-library/jest-dom/vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';

vi.mock('../utils/api', () => ({
  getUserProfile: vi.fn(),
  updateUserProfile: vi.fn(),
  getUserUsage: vi.fn(),
}));

import ProfilePage from '../pages/ProfilePage';
import { getUserProfile, updateUserProfile, getUserUsage } from '../utils/api';

const mockGetProfile = vi.mocked(getUserProfile);
const mockUpdateProfile = vi.mocked(updateUserProfile);
const mockGetUsage = vi.mocked(getUserUsage);

const mockProfile = {
  id: '1',
  userId: 'u1',
  email: 'test@test.com',
  displayName: 'Test User',
  isActive: true,
  createdAt: '2026-01-01T00:00:00Z',
  lastLoginAt: '2026-02-19T00:00:00Z',
  tier: 'pro',
};

const mockUsage = {
  presentationsThisMonth: 5,
  monthlyPresentationLimit: 50,
  slidesThisMonth: 30,
  monthlySlideLimit: 500,
};

describe('ProfilePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetProfile.mockResolvedValue({ data: mockProfile, status: 200 });
    mockGetUsage.mockResolvedValue({ data: mockUsage, status: 200 });
  });

  it('shows loading state then profile', async () => {
    render(<ProfilePage />);
    await waitFor(() => expect(screen.getByText('Test User')).toBeInTheDocument());
    expect(screen.getByText('test@test.com')).toBeInTheDocument();
    expect(screen.getByText('✅ Active')).toBeInTheDocument();
    expect(screen.getByText('pro')).toBeInTheDocument();
  });

  it('shows usage data', async () => {
    render(<ProfilePage />);
    await waitFor(() => expect(screen.getByText(/5 \/ 50/)).toBeInTheDocument());
    expect(screen.getByText(/30 \/ 500/)).toBeInTheDocument();
  });

  it('enters edit mode and saves', async () => {
    mockUpdateProfile.mockResolvedValue({ data: { ...mockProfile, displayName: 'New Name' }, status: 200 });
    render(<ProfilePage />);
    await waitFor(() => expect(screen.getByText('Edit Profile')).toBeInTheDocument());

    fireEvent.click(screen.getByText('Edit Profile'));
    const nameInput = screen.getByDisplayValue('Test User');
    fireEvent.change(nameInput, { target: { value: 'New Name' } });
    fireEvent.click(screen.getByText('Save'));

    await waitFor(() => expect(screen.getByText('Saved!')).toBeInTheDocument());
  });

  it('shows error on failed save', async () => {
    mockUpdateProfile.mockResolvedValue({ error: { error: 'Server error', code: 'ERR' }, status: 500 });
    render(<ProfilePage />);
    await waitFor(() => fireEvent.click(screen.getByText('Edit Profile')));
    fireEvent.click(screen.getByText('Save'));
    await waitFor(() => expect(screen.getByText('Server error')).toBeInTheDocument());
  });

  it('shows loading when profile unavailable', async () => {
    mockGetProfile.mockResolvedValue({ error: { error: 'fail', code: 'ERR' }, status: 500 });
    render(<ProfilePage />);
    await waitFor(() => expect(screen.getByText(/loading or unavailable/i)).toBeInTheDocument());
  });

  it('cancel exits edit mode', async () => {
    render(<ProfilePage />);
    await waitFor(() => fireEvent.click(screen.getByText('Edit Profile')));
    expect(screen.getByText('Cancel')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Cancel'));
    expect(screen.queryByText('Cancel')).not.toBeInTheDocument();
  });
});
