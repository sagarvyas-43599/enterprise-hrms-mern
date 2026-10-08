import { Types, FilterQuery } from 'mongoose';
import { DocumentModel, IDocument, DocumentStatus } from '../models/document.model';
import { EmployeeModel } from '../models/employee.model';
import { ApiError } from '../utils/apiResponse';
import { DocumentsQueryParams } from '../validations/document.validation';
import { UserRole } from '../constants/enums';

export class DocumentService {
  async uploadDocument(data: Partial<IDocument>, employeeId: string): Promise<IDocument> {
    const document = new DocumentModel({
      ...data,
      employee: employeeId,
      status: DocumentStatus.PENDING_VERIFICATION
    });
    return await document.save();
  }

  async getMyDocuments(employeeId: string, query: DocumentsQueryParams) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const filter: FilterQuery<IDocument> = { employee: employeeId, isDeleted: false };
    if (query.status) filter.status = query.status;
    if (query.category) filter.category = query.category;

    if (query.search) {
      filter.title = new RegExp(query.search, 'i');
    }

    const [documents, total] = await Promise.all([
      DocumentModel.find(filter)
        .populate('employee', 'empId firstName lastName email department')
        .populate('verifiedBy', 'firstName lastName')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      DocumentModel.countDocuments(filter)
    ]);

    return {
      documents,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async getAllDocuments(query: DocumentsQueryParams, role?: string) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;
    
    const filter: FilterQuery<IDocument> = { isDeleted: false };
    if (query.status) filter.status = query.status;
    if (query.category) filter.category = query.category;
    if (query.employee) filter.employee = query.employee as any;

    if (query.search) {
      const searchRegex = new RegExp(query.search, 'i');
      let matchedEmployeeIds: Types.ObjectId[] = [];
      
      if (role && role !== UserRole.EMPLOYEE) {
        const matchedEmployees = await EmployeeModel.find({
          $or: [
            { firstName: searchRegex },
            { lastName: searchRegex },
            { empId: searchRegex }
          ],
          isDeleted: false
        }).lean();
        matchedEmployeeIds = matchedEmployees.map(e => e._id as Types.ObjectId);
      }

      filter.$or = [
        { title: searchRegex },
        ...(matchedEmployeeIds.length > 0 ? [{ employee: { $in: matchedEmployeeIds } as any }] : [])
      ];
    }

    const [documents, total] = await Promise.all([
      DocumentModel.find(filter)
        .populate('employee', 'empId firstName lastName email department')
        .populate('verifiedBy', 'firstName lastName')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      DocumentModel.countDocuments(filter)
    ]);

    return {
      documents,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async updateDocumentStatus(id: string, status: DocumentStatus, verifierId: string, rejectionReason?: string): Promise<IDocument> {
    const document = await DocumentModel.findOne({ _id: id, isDeleted: false });
    if (!document) {
      throw ApiError.notFound('Document not found');
    }
    
    document.status = status;
    document.verifiedBy = verifierId as any;
    
    if (status === DocumentStatus.REJECTED && rejectionReason) {
      document.rejectionReason = rejectionReason;
    }
    
    return await document.save();
  }

  async deleteDocument(id: string, employeeId: string): Promise<void> {
    const document = await DocumentModel.findOne({ _id: id, employee: employeeId, isDeleted: false });
    if (!document) {
      throw ApiError.notFound('Document not found or unauthorized');
    }
    
    document.isDeleted = true;
    await document.save();
  }
}

export const documentService = new DocumentService();
