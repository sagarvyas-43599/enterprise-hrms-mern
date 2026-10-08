import { Request, Response, NextFunction } from 'express';
import { documentService } from '../services/document.service';
import { ApiResponse, ApiError } from '../utils/apiResponse';
import { EmployeeModel } from '../models/employee.model';
import { DocumentsQueryParams } from '../validations/document.validation';

export class DocumentController {
  async uploadDocument(req: Request, res: Response, next: NextFunction) {
    try {
      const employee = await EmployeeModel.findOne({ userId: req.user!.userId });
      if (!employee) throw ApiError.notFound('Employee profile not found');
      
      const document = await documentService.uploadDocument(req.body, employee._id.toString());
      res.status(201).json(ApiResponse.created(document, 'Document uploaded successfully'));
    } catch (error) {
      next(error);
    }
  }

  async getMyDocuments(req: Request, res: Response, next: NextFunction) {
    try {
      const employee = await EmployeeModel.findOne({ userId: req.user!.userId });
      if (!employee) throw ApiError.notFound('Employee profile not found');

      const data = await documentService.getMyDocuments(employee._id.toString(), req.query as any as DocumentsQueryParams);
      res.status(200).json(ApiResponse.ok(data, 'My documents retrieved successfully'));
    } catch (error) {
      next(error);
    }
  }

  async getAllDocuments(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await documentService.getAllDocuments(req.query as any as DocumentsQueryParams, req.user!.role);
      res.status(200).json(ApiResponse.ok(data, 'All documents retrieved successfully'));
    } catch (error) {
      next(error);
    }
  }

  async updateDocumentStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { status, rejectionReason } = req.body;
      const employee = await EmployeeModel.findOne({ userId: req.user!.userId });
      if (!employee) throw ApiError.notFound('Employee profile not found');

      const document = await documentService.updateDocumentStatus(req.params.id as string, status, employee._id.toString(), rejectionReason);
      res.status(200).json(ApiResponse.ok(document, `Document ${status.toLowerCase()} successfully`));
    } catch (error) {
      next(error);
    }
  }

  async deleteDocument(req: Request, res: Response, next: NextFunction) {
    try {
      const employee = await EmployeeModel.findOne({ userId: req.user!.userId });
      if (!employee) throw ApiError.notFound('Employee profile not found');

      await documentService.deleteDocument(req.params.id as string, employee._id.toString());
      res.status(200).json(ApiResponse.ok(null, 'Document deleted successfully'));
    } catch (error) {
      next(error);
    }
  }
}

export const documentController = new DocumentController();
