import { 
  getClientsByUserId, 
  createClient, 
  updateClient, 
  deleteClient,
  toggleClientActive 
} from "../db/clients.ts";
import { BadRequestError, NotFoundError } from "../utils/apiResponse.ts";

export async function getClientsService(userId: number) {
  return await getClientsByUserId(userId);
}

export async function createClientService(userId: number, data: any) {
  if (!data.name || !data.name.trim()) {
    throw new BadRequestError("Client party name is required.");
  }
  if (!data.phone || !data.phone.trim()) {
    throw new BadRequestError("Client WhatsApp phone number is required.");
  }

  return await createClient(userId, {
    name: data.name.trim(),
    phone: data.phone.trim(),
    email: data.email?.trim() || '',
    companyName: data.companyName?.trim() || '',
    address: data.address?.trim() || '',
    gstin: data.gstin?.trim() || '',
    industryType: data.industryType || 'general',
    paymentTermDays: data.paymentTermDays ? Number(data.paymentTermDays) : 7,
    notes: data.notes || '',
    isActive: data.isActive !== undefined ? Boolean(data.isActive) : true,
  });
}

export async function updateClientService(userId: number, clientId: number, data: any) {
  const updated = await updateClient(userId, clientId, data);
  if (!updated) {
    throw new NotFoundError("Client not found in your directory.");
  }
  return updated;
}

export async function toggleClientStatusService(userId: number, clientId: number, isActive?: boolean) {
  const updated = await toggleClientActive(userId, clientId, isActive);
  if (!updated) {
    throw new NotFoundError("Client not found.");
  }
  return updated;
}

export async function deleteClientService(userId: number, clientId: number) {
  const deleted = await deleteClient(userId, clientId);
  if (!deleted) {
    throw new NotFoundError("Client not found or already deleted.");
  }
  return deleted;
}
