import { Response } from "express";
import { AuthRequest } from "../middleware/auth.ts";
import { 
  getClientsByUserId, 
  createClient, 
  updateClient, 
  deleteClient,
  toggleClientActive
} from "../db/clients.ts";

export async function getClients(req: AuthRequest, res: Response) {
  try {
    const userId = req.dbUser.id;
    const clientsList = await getClientsByUserId(userId);
    res.json({ success: true, clients: clientsList });
  } catch (error: any) {
    console.error("Failed to get clients:", error);
    res.status(500).json({ error: error.message || "Failed to get clients" });
  }
}

export async function postClient(req: AuthRequest, res: Response) {
  try {
    const userId = req.dbUser.id;
    const created = await createClient(userId, req.body);
    res.json({ success: true, client: created });
  } catch (error: any) {
    console.error("Failed to create client:", error);
    res.status(500).json({ error: error.message || "Failed to create client" });
  }
}

export async function putClient(req: AuthRequest, res: Response) {
  try {
    const userId = req.dbUser.id;
    const clientId = parseInt(req.params.id);
    if (isNaN(clientId)) {
      return res.status(400).json({ error: "Invalid client ID" });
    }
    const updated = await updateClient(userId, clientId, req.body);
    res.json({ success: true, client: updated });
  } catch (error: any) {
    console.error("Failed to update client:", error);
    res.status(500).json({ error: error.message || "Failed to update client" });
  }
}

export async function toggleClient(req: AuthRequest, res: Response) {
  try {
    const userId = req.dbUser.id;
    const clientId = parseInt(req.params.id);
    if (isNaN(clientId)) {
      return res.status(400).json({ error: "Invalid client ID" });
    }
    const { isActive } = req.body || {};
    const updated = await toggleClientActive(userId, clientId, typeof isActive === 'boolean' ? isActive : undefined);
    res.json({ success: true, client: updated });
  } catch (error: any) {
    console.error("Failed to toggle client:", error);
    res.status(500).json({ error: error.message || "Failed to toggle client status" });
  }
}

export async function removeClient(req: AuthRequest, res: Response) {
  try {
    const userId = req.dbUser.id;
    const clientId = parseInt(req.params.id);
    if (isNaN(clientId)) {
      return res.status(400).json({ error: "Invalid client ID" });
    }
    await deleteClient(userId, clientId);
    res.json({ success: true });
  } catch (error: any) {
    console.error("Failed to delete client:", error);
    res.status(500).json({ error: error.message || "Failed to delete client" });
  }
}

