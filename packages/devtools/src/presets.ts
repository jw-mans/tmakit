import type { MockUser } from '@tmakit/core';

export interface UserPreset {
  id: string;
  label: string;
  user: MockUser;
  startParam?: string;
}

/** Starter presets covering the cases easy to forget to test (premium, referral, RTL). */
export const USER_PRESETS: readonly UserPreset[] = [
  {
    id: 'premium',
    label: 'Premium',
    user: {
      id: 99281932,
      first_name: 'Premium',
      last_name: 'User',
      username: 'premium_user',
      language_code: 'en',
      is_premium: true,
    },
  },
  {
    id: 'referral',
    label: 'New + referral',
    user: {
      id: 500123,
      first_name: 'Newcomer',
      username: 'newbie',
      language_code: 'en',
      is_premium: false,
    },
    startParam: 'ref_ABC123',
  },
  {
    id: 'rtl',
    label: 'RTL (ar)',
    user: {
      id: 777001,
      first_name: 'مستخدم',
      username: 'rtl_user',
      language_code: 'ar',
      is_premium: false,
    },
  },
];
