import { Router } from "express";
import { 
  getTenants, 
  postTenant, 
  putTenantSubscription, 
  getPlanRequestsList, 
  putPlanRequestStatus 
} from "../controllers/admin.controller.ts";
import { requireAuth } from "../middleware/auth.ts";
import { requireSuperAdmin } from "../middleware/admin.ts";


const router = Router();

router.use(requireAuth);
router.use(requireSuperAdmin);

router.get("/tenants", getTenants);
router.post("/tenants", postTenant);
router.put("/tenants/:id/subscription", putTenantSubscription);
router.get("/plan-requests", getPlanRequestsList);
router.put("/plan-requests/:id", putPlanRequestStatus);

export default router;

