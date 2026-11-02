import { createContext, useContext } from 'react';

/** Who is signed in and which child is studying. "local" mode = no Supabase configured (single device). */
export interface Account {
  mode: 'cloud' | 'local';
  email?: string;
  childId: string;
  childNickname?: string;
  isAdmin: boolean;
  switchChild(): void;
  signOut(): void;
  openAdmin(): void;
  childRemoved(): void;
}

export const AccountContext = createContext<Account | null>(null);

export function useAccount(): Account {
  const a = useContext(AccountContext);
  if (!a) throw new Error('AccountContext missing');
  return a;
}
