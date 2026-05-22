import { Response } from "express";
import { prisma } from "../lib/prisma";
import { mapCollege } from "../utils/collegeMapper";
import { AuthRequest } from "../middleware/auth";

export async function getShortlist(req: AuthRequest, res: Response) {
  const userId = req.user!.userId;

  const entries = await prisma.shortlist.findMany({
    where: { userId },
    include: { college: true },
    orderBy: { id: "desc" },
  });

  return res.json({
    shortlist: entries.map((entry) => ({
      id: entry.id,
      college: mapCollege(entry.college),
    })),
  });
}

export async function addToShortlist(req: AuthRequest, res: Response) {
  const userId = req.user!.userId;
  const collegeId = Number.parseInt(String(req.body?.collegeId ?? ""), 10);

  if (!Number.isFinite(collegeId) || collegeId < 1) {
    return res.status(400).json({ error: "Valid collegeId is required" });
  }

  const college = await prisma.college.findUnique({ where: { id: collegeId } });
  if (!college) {
    return res.status(404).json({ error: "College not found" });
  }

  const entry = await prisma.shortlist.upsert({
    where: { userId_collegeId: { userId, collegeId } },
    create: { userId, collegeId },
    update: {},
    include: { college: true },
  });

  return res.status(201).json({ shortlist: { id: entry.id, college: mapCollege(entry.college) } });
}

export async function removeFromShortlist(req: AuthRequest, res: Response) {
  const userId = req.user!.userId;
  const collegeId = Number.parseInt(String(req.params.collegeId ?? ""), 10);

  if (!Number.isFinite(collegeId) || collegeId < 1) {
    return res.status(400).json({ error: "Valid collegeId is required" });
  }

  await prisma.shortlist.deleteMany({ where: { userId, collegeId } });
  return res.json({ success: true });
}
