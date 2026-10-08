import { Router } from 'express';
import { documentController } from '../controllers/document.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { authorize } from '../middlewares/rbac.middleware';
import { validate } from '../middlewares/validator.middleware';
import { UserRole } from '../constants/enums';
import {
  uploadDocumentSchema,
  updateDocumentStatusSchema,
  getDocumentsQuerySchema,
  documentIdParamSchema,
} from '../validations/document.validation';

const router = Router();

// Apply authentication middleware to all routes
router.use(authenticate);

// Employee routes
router.post('/', validate(uploadDocumentSchema), documentController.uploadDocument);
router.get('/my', validate(getDocumentsQuerySchema), documentController.getMyDocuments);
router.delete('/:id', validate(documentIdParamSchema), documentController.deleteDocument);

// HR/Admin routes
router.get('/', authorize(UserRole.SUPER_ADMIN, UserRole.HR_ADMIN), validate(getDocumentsQuerySchema), documentController.getAllDocuments);
router.patch('/:id/status', authorize(UserRole.SUPER_ADMIN, UserRole.HR_ADMIN), validate(documentIdParamSchema), validate(updateDocumentStatusSchema), documentController.updateDocumentStatus);

export default router;
