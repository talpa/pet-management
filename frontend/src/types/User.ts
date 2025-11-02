export interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  address?: string;
  viber?: string;
  whatsapp?: string;
  signal?: string;
  facebook?: string;
  instagram?: string;
  twitter?: string;
  linkedin?: string;
  role: string;
  status: 'active' | 'inactive';
  provider?: string;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}