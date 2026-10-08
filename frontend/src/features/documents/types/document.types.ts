export type DocumentCategory = 'IDENTITY' | 'EDUCATION' | 'EMPLOYMENT' | 'FINANCIAL' | 'OTHER';
export type DocumentStatus = 'PENDING_VERIFICATION' | 'VERIFIED' | 'REJECTED';

export interface Document {
  _id: string;
  employee: {
    _id: string;
    empId: string;
    firstName: string;
    lastName: string;
    email: string;
    department: string;
  } | string;
  title: string;
  category: DocumentCategory;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  status: DocumentStatus;
  verifiedBy?: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}
