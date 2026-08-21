import { Router } from "express";
import { 
  getTenants, 
  postTenant, 
  putTenantSubscription, 
  getPlanRequestsList, 
  putPlanRequestStatus 
} from "../controllers/admin.controller.ts";
import { 
  flushGlobalCache, 
  getCacheHealthStats 
} from "../controllers/cache.controller.ts";
import { requireAuth } from "../middleware/auth.ts";
import { requireSuperAdmin } from "../middleware/admin.ts";
import { cacheResponse } from "../middleware/cacheMiddleware.ts";

const router = Router();

router.use(requireAuth);
router.use(requireSuperAdmin);

router.get("/tenants", cacheResponse("admin:tenants", 120), getTenants);
router.post("/tenants", postTenant);
router.put("/tenants/:id/subscription", putTenantSubscription);
router.get("/plan-requests", cacheResponse("admin:plan-requests", 120), getPlanRequestsList);
router.put("/plan-requests/:id", putPlanRequestStatus);

// Admin Cache Management Endpoints
router.post("/cache/flush", flushGlobalCache);
router.get("/cache/stats", getCacheHealthStats);

export default router;

