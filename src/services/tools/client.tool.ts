import { getClientsService, createClientService, updateClientService } from '../clients.service.ts';

export const clientToolDeclarations = [
  {
    name: 'search_clients',
    description: 'Search or list clients/parties in the user directory by name, phone, company, or status.',
    parameters: {
      type: 'OBJECT',
      properties: {
        query: {
          type: 'STRING',
          description: 'Search query for client name, phone number, company name, or GSTIN',
        },
      },
    },
  },
  {
    name: 'create_client',
    description: 'Add a new client/party into the directory.',
    parameters: {
      type: 'OBJECT',
      properties: {
        name: {
          type: 'STRING',
          description: 'Contact or party name (Required)',
        },
        phone: {
          type: 'STRING',
          description: 'WhatsApp mobile number (Required)',
        },
        companyName: {
          type: 'STRING',
          description: 'Business or legal company name',
        },
        gstin: {
          type: 'STRING',
          description: '15-character GSTIN number',
        },
        address: {
          type: 'STRING',
          description: 'Billing address',
        },
        email: {
          type: 'STRING',
          description: 'Email address',
        },
        paymentTermDays: {
          type: 'INTEGER',
          description: 'Default payment terms in days (e.g. 7, 15, 30)',
        },
      },
      required: ['name', 'phone'],
    },
  },
];

export async function executeClientTool(userId: number, functionName: string, args: any) {
  switch (functionName) {
    case 'search_clients': {
      const { query } = args;
      const allClients = await getClientsService(userId);
      let filtered = allClients;
      if (query && query.trim()) {
        const q = query.trim().toLowerCase();
        filtered = allClients.filter(
          (c: any) =>
            c.name.toLowerCase().includes(q) ||
            c.phone.includes(q) ||
            (c.companyName && c.companyName.toLowerCase().includes(q)) ||
            (c.gstin && c.gstin.toLowerCase().includes(q))
        );
      }

      return {
        count: filtered.length,
        clients: filtered.map((c: any) => ({
          id: c.id,
          name: c.name,
          companyName: c.companyName || '',
          phone: c.phone,
          gstin: c.gstin || '',
          email: c.email || '',
          paymentTermDays: c.paymentTermDays,
          isActive: c.isActive,
        })),
      };
    }

    case 'create_client': {
      const created = await createClientService(userId, args);
      return {
        success: true,
        client: {
          id: created.id,
          name: created.name,
          companyName: created.companyName,
          phone: created.phone,
          gstin: created.gstin,
        },
        message: `Client "${created.name}" (${created.companyName || created.phone}) was successfully registered.`,
      };
    }

    default:
      throw new Error(`Unknown client tool action: ${functionName}`);
  }
}
