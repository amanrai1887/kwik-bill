import { Router } from "express";
import { 
  getClients, 
  postClient, 
  putClient, 
  removeClient,
  toggleClient
} from "../controllers/clients.controller.ts";
import { requireAuth } from "../middleware/auth.ts";
import { cacheResponse } from "../middleware/cacheMiddleware.ts";
import { validateBody } from "../middleware/validate.ts";
import { createClientSchema, updateClientSchema } from "../lib/validators/index.ts";

const router = Router();

router.use(requireAuth);

router.get("/", cacheResponse("clients", 180), getClients);
router.post("/", validateBody(createClientSchema), postClient);
router.put("/:id", validateBody(updateClientSchema), putClient);
router.patch("/:id/toggle-status", toggleClient);
router.post("/:id/toggle-status", toggleClient);
router.delete("/:id", removeClient);

export default router;

