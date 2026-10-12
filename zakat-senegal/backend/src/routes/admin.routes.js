import { Router } from 'express';
import * as admin from '../controllers/admin.controller.js';
import * as review from '../controllers/review.controller.js';
import * as dist from '../controllers/distribution.controller.js';
import { protect, authorize } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import { ROLES } from '../config/constants.js';
import { statusSchema } from '../validators/aid.validator.js';
import { roleSchema, activeSchema, planSchema, distributionSchema, deliverSchema } from '../validators/admin.validator.js';

const { AGENT, DISTRIBUTION, ADMIN, SUPER } = ROLES;
const r = Router();
r.use(protect); // toutes les routes admin exigent une authentification ET un rôle (le rôle est relu en base)

r.get('/dashboard', authorize(ADMIN, DISTRIBUTION), admin.dashboard);

// Vérification des dossiers
r.get('/aid-requests', authorize(AGENT, ADMIN, DISTRIBUTION), review.list);
r.get('/aid-requests/:id', authorize(AGENT, ADMIN, DISTRIBUTION), review.detail);
r.patch('/aid-requests/:id/status', authorize(AGENT, ADMIN), validate(statusSchema), review.changeStatus);

// Paiements
r.get('/transactions', authorize(ADMIN, DISTRIBUTION), admin.listTransactions);
r.get('/transactions/export', authorize(ADMIN), admin.exportTransactions);

// Distribution
r.get('/balances', authorize(ADMIN, DISTRIBUTION), dist.balances);
r.get('/distribution-plans', authorize(ADMIN, DISTRIBUTION), dist.listPlans);
r.post('/distribution-plans', authorize(ADMIN, DISTRIBUTION), validate(planSchema), dist.createPlan);
r.get('/distributions', authorize(ADMIN, DISTRIBUTION), dist.list);
r.post('/distributions', authorize(ADMIN, DISTRIBUTION), validate(distributionSchema), dist.create);
r.patch('/distributions/:id/approve', authorize(ADMIN, DISTRIBUTION), dist.approve);
r.patch('/distributions/:id/deliver', authorize(ADMIN, DISTRIBUTION), validate(deliverSchema), dist.deliver);
r.patch('/distributions/:id/cancel', authorize(ADMIN, DISTRIBUTION), dist.cancel);

// Utilisateurs, messages, journaux
r.get('/users', authorize(ADMIN), admin.listUsers);
r.patch('/users/:id/role', authorize(ADMIN), validate(roleSchema), admin.updateRole);
r.patch('/users/:id/active', authorize(ADMIN), validate(activeSchema), admin.updateActive);
r.get('/messages', authorize(ADMIN), admin.listMessages);
r.get('/audit-logs', authorize(SUPER), admin.listAudit);

export default r;
