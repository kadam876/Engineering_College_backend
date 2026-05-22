import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { mapCollege } from "../utils/collegeMapper";
import { normalizeString } from "../utils/normalize";

type PredictStatus = "TARGET" | "REACH" | "SAFE";

function computeStatus(closingRank: number, userRank: number): PredictStatus {
  if (userRank <= closingRank * 0.8) return "SAFE";   // comfortably inside
  if (userRank <= closingRank) return "TARGET";        // within cutoff
  return "REACH";                                       // above cutoff
}

export async function predictAdmission(req: Request, res: Response) {
  const examType = normalizeString(req.body?.examType);
  const branch = typeof req.body?.branch === "string" ? req.body.branch.trim() : "";
  const rank = Number.parseInt(String(req.body?.rank ?? ""), 10);
  const rawCategory = typeof req.body?.category === "string" ? req.body.category.trim() : "OPEN";
  const category = rawCategory.toUpperCase();

  if (!examType || !branch || !Number.isFinite(rank) || rank < 1) {
    return res.status(400).json({
      error: "examType, branch, and a positive rank are required",
    });
  }

  // Fetch cutoffs filtered by examType, branch, AND category
  const cutoffs = await prisma.cutoff.findMany({
    where: {
      examType: { equals: req.body.examType.trim(), mode: "insensitive" },
      branch: { equals: branch, mode: "insensitive" },
      category: { equals: category, mode: "insensitive" },
    },
    include: { college: true },
    orderBy: { closingRank: "asc" },
  });

  const results = cutoffs.map((cutoff) => ({
    college: mapCollege(cutoff.college),
    closingRank: cutoff.closingRank,
    category: cutoff.category,
    status: computeStatus(cutoff.closingRank, rank),
  }));

  // Sort: SAFE first, then TARGET, then REACH, then by closingRank
  const order: Record<PredictStatus, number> = { SAFE: 0, TARGET: 1, REACH: 2 };
  results.sort((a, b) => {
    if (order[a.status] !== order[b.status]) return order[a.status] - order[b.status];
    return a.closingRank - b.closingRank;
  });

  return res.json({
    examType: req.body.examType.trim(),
    branch,
    rank,
    category,
    results,
    meta: { totalMatches: results.length },
  });
}
