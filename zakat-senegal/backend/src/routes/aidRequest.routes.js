import { Router } from 'express';
import * as c from '../controllers/aidRequest.controller.js';
import { protect } from '../middlewares/auth.js';
import { uploadDocuments } from '../middlewares/upload.js';
import { sensitiveLimiter } from '../middlewares/rateLimit.js';

const r = Router();
r.use(protect);
r.post('/', sensitiveLimiter, uploadDocuments, c.create);
r.get('/me', c.mine);
r.patch('/:id/resubmit', sensitiveLimiter, uploadDocuments, c.resubmit);
r.get('/:id/documents/:docId', c.downloadDocument);
export default r;
