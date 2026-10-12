import AuditLog from '../models/AuditLog.js';

// Journalise une action sensible. N'interrompt jamais la requête en cas d'échec.
export async function audit(req, action, resource, result = 'success', meta = {}) {
  try {
    await AuditLog.create({
      actor: req?.user?._id,
      actorRole: req?.user?.role,
      action,
      resource,
      result,
      ip: req?.ip,
      meta,
    });
  } catch (err) {
    console.error('Audit log impossible :', err.message);
  }
}
