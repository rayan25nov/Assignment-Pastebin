import { Router, Request, Response } from "express";
import mongoose from "mongoose";

const router = Router();

router.get("/health", async (_req: Request, res: Response) => {
  try {
    // Check if MongoDB is connected
    const isConnected = mongoose.connection.readyState === 1;

    res.status(200).json({
      ok: isConnected,
    });
  } catch (error) {
    res.status(200).json({
      ok: false,
    });
  }
});

export default router;
