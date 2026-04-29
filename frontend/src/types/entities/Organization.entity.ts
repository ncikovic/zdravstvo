export interface Organization {
  id: string;
  name: string;
  address: string | null;
  city: string | null;
  phone: string | null;
  email: string | null;
  timezone: string;
  createdAt: Date;
  updatedAt: Date;
}
