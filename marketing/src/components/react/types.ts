import type { Role } from '../../lib/brand';

export interface ConfirmationData {
  position?: number;
  inviteCode?: string;
  role: Role;
  email: string;
  overflow?: boolean;
  alreadyRegistered?: boolean;
}
