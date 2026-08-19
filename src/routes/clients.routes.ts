import { Router } from "express";
import { 
  getClients, 
  postClient, 
  putClient, 
  removeClient 
} from "../controllers/clients.controller.ts";
import { requireAuth } from "../middleware/auth.ts";

const router = Router();

router.use(requireAuth);

router.get("/", getClients);
router.post("/", postClient);
router.put("/:id", putClient);
router.delete("/:id", removeClient);

export default router;
