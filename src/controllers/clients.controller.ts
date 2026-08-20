import { Response } from "express";
import { AuthRequest } from "../middleware/auth.ts";
import { 
  getClientsService, 
  createClientService, 
  updateClientService, 
  deleteClientService,
  toggleClientStatusService 
} from "../services/clients.service.ts";
import { asyncHandler, ApiResponse, parsePositiveInt } from "../utils/apiResponse.ts";

export const getClients = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.dbUser.id;
  const clientsList = await getClientsService(userId);
  return ApiResponse.success(res, { clients: clientsList });
});

export const postClient = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.dbUser.id;
  const created = await createClientService(userId, req.body);
  return ApiResponse.success(res, { client: created }, 201, "Client added successfully");
});

export const putClient = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.dbUser.id;
  const clientId = parsePositiveInt(req.params.id, "client ID");
  const updated = await updateClientService(userId, clientId, req.body);
  return ApiResponse.success(res, { client: updated }, 200, "Client updated successfully");
});

export const toggleClient = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.dbUser.id;
  const clientId = parsePositiveInt(req.params.id, "client ID");
  const { isActive } = req.body || {};
  const updated = await toggleClientStatusService(
    userId, 
    clientId, 
    typeof isActive === 'boolean' ? isActive : undefined
  );
  return ApiResponse.success(res, { client: updated }, 200, "Client status updated");
});

export const removeClient = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.dbUser.id;
  const clientId = parsePositiveInt(req.params.id, "client ID");
  await deleteClientService(userId, clientId);
  return ApiResponse.success(res, { message: "Client deleted successfully" });
});
