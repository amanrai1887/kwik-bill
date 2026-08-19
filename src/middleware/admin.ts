import { Response, NextFunction } from "express";
import { AuthRequest } from "./auth.ts";

export const requireSuperAdmin = (
  req: AuthRequest, 
  res: Response, 
  next: NextFunction
) => {
  const isSuperAdmin = 
    req.dbUser?.role === 'superadmin' || 
    (req.user?.email && req.user.email.toLowerCase() === 'arai.343531@gmail.com');

  if (!isSuperAdmin) {
    return res.status(403).json({ error: "Access Denied: SuperAdmin privileges required." });
  }
  next();
};
