export interface Permission {
  id: number;
  name: string;
  code: string;
  description?: string;
  category: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserPermission {
  id: number;
  userId: number;
  permissionId: number;
  granted: boolean;
  grantedBy?: number;
  grantedAt?: string;
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
  permission?: Permission;
  grantedByUser?: {
    id: number;
    name: string;
    email: string;
  };
}