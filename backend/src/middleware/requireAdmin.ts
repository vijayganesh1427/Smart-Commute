import type { NextFunction, Request, Response } from "express";

export function requireAdmin(
    req: Request,
    res: Response,
    next: NextFunction
): void {
    const configuredKey = process.env.ADMIN_API_KEY;
    const suppliedKey = req.header("x-admin-key");

    if (!configuredKey) {
        res.status(503).json({
            message: "Admin API is not configured. Set ADMIN_API_KEY on the backend.",
        });
        return;
    }

    if (!suppliedKey || suppliedKey !== configuredKey) {
        res.status(401).json({ message: "Admin authorization required." });
        return;
    }

    next();
}
