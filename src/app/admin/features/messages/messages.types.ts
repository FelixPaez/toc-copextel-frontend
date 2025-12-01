/**
 * Message interface
 */
export interface Message {
  id: string;
  vendorId?: string;
  clientId?: number;
  userId?: number;
  name: string;
  email: string;
  phone: string;
  subject: string;
  content: string;
  category: string;
  read: boolean;
  sent?: boolean;
  starred?: boolean;
  important?: boolean;
  attachments?: string[];
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Messages Folder interface
 */
export interface MessagesFolder {
  id: string;
  title: string;
  slug: string;
  icon: string;
  count?: number;
}

