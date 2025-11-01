export interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  role: string;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}