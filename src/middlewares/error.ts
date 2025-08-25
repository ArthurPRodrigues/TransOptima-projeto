import { NextFunction, Request, Response } from "express";

export function errorHandler(err: any, _req: Request, res: Response, _next: NextFunction) {
  if (process.env.NODE_ENV !== "production") {
    console.error(err);
  }
  // Prisma duplicate key
  if (err?.code === "P2002") {
    return res.status(400).json({ error: `Valor duplicado em campo único (${(err.meta?.target || []).join(", ")})` });
  }
  res.status(400).json({ error: err?.message || "Erro inesperado" });
}
