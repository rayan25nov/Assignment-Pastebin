import { Router, Request, Response } from "express";
import Paste from "../models/paste.model.js";
import { getCurrentTime, isExpired, getExpiresAt } from "../utils/time.js";

const router = Router();

// Create a paste
router.post("/pastes", async (req: Request, res: Response) => {
  try {
    const { content, ttl_seconds, max_views } = req.body;

    // Validation
    if (
      !content ||
      typeof content !== "string" ||
      content.trim().length === 0
    ) {
      res.status(400).json({
        error: "content is required and must be a non-empty string",
      });
      return;
    }

    if (
      ttl_seconds !== undefined &&
      (typeof ttl_seconds !== "number" ||
        ttl_seconds < 1 ||
        !Number.isInteger(ttl_seconds))
    ) {
      res.status(400).json({
        error: "ttl_seconds must be an integer >= 1",
      });
      return;
    }

    if (
      max_views !== undefined &&
      (typeof max_views !== "number" ||
        max_views < 1 ||
        !Number.isInteger(max_views))
    ) {
      res.status(400).json({
        error: "max_views must be an integer >= 1",
      });
      return;
    }

    const currentTime = getCurrentTime(req);

    const paste = new Paste({
      content,
      createdAt: currentTime,
      ttlSeconds: ttl_seconds,
      maxViews: max_views,
      viewCount: 0,
    });

    await paste.save();

    const baseUrl = `${req.protocol}://${req.get("host")}`;

    res.status(201).json({
      id: paste._id.toString(),
      url: `${baseUrl}/p/${paste._id}`,
    });
    return;
  } catch (error) {
    console.error("Error creating paste:", error);
    res.status(500).json({
      error: "Internal server error",
    });
  }
});

// Fetch a paste (API)
router.get("/pastes/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const paste = await Paste.findById(id);

    if (!paste) {
      res.status(404).json({
        error: "Paste not found",
      });
      return;
    }

    const currentTime = getCurrentTime(req);

    // Check if expired
    if (isExpired(paste.createdAt, paste.ttlSeconds, currentTime)) {
      res.status(404).json({
        error: "Paste not found",
      });
      return;
    }

    // Check if view limit exceeded
    if (paste.maxViews !== undefined && paste.viewCount >= paste.maxViews) {
      res.status(404).json({
        error: "Paste not found",
      });
      return;
    }

    // Increment view count atomically
    const updatedPaste = await Paste.findByIdAndUpdate(
      id,
      { $inc: { viewCount: 1 } },
      { new: true }
    );

    if (!updatedPaste) {
      res.status(404).json({
        error: "Paste not found",
      });
      return;
    }

    const remainingViews =
      updatedPaste.maxViews !== undefined
        ? updatedPaste.maxViews - updatedPaste.viewCount
        : null;

    res.status(200).json({
      content: updatedPaste.content,
      remaining_views: remainingViews,
      expires_at: getExpiresAt(updatedPaste.createdAt, updatedPaste.ttlSeconds),
    });
    return;
  } catch (error) {
    console.error("Error fetching paste:", error);
    res.status(404).json({
      error: "Paste not found",
    });
  }
});

export default router;
