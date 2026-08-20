import { Response, NextFunction } from "express";
import { AuthRequest } from "./auth.ts";
import { isSuperAdminEmail } from "../config/app.config.ts";

export const requireSuperAdmin = (
  req: AuthRequest, 
  res: Response, 
  next: NextFunction
) => {
  const isSuperAdmin = 
    req.dbUser?.role === 'superadmin' || 
    isSuperAdminEmail(req.user?.email) ||
    isSuperAdminEmail(req.dbUser?.email);

  if (!isSuperAdmin) {
    return res.status(403).json({ 
      success: false, 
      error: {
        code: 'FORBIDDEN',
        message: "Access Denied: SuperAdmin privileges required." 
      }
    });
  }
  next();
};
