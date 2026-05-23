"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.predictAdmission = predictAdmission;
const prisma_1 = require("../lib/prisma");
const collegeMapper_1 = require("../utils/collegeMapper");
const normalize_1 = require("../utils/normalize");
function computeStatus(closingRank, userRank) {
    if (userRank <= closingRank * 0.8)
        return "SAFE"; // comfortably inside
    if (userRank <= closingRank)
        return "TARGET"; // within cutoff
    return "REACH"; // above cutoff
}
async function predictAdmission(req, res) {
    const examType = (0, normalize_1.normalizeString)(req.body?.examType);
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
    const cutoffs = await prisma_1.prisma.cutoff.findMany({
        where: {
            examType: { equals: req.body.examType.trim(), mode: "insensitive" },
            branch: { equals: branch, mode: "insensitive" },
            category: { equals: category, mode: "insensitive" },
        },
        include: { college: true },
        orderBy: { closingRank: "asc" },
    });
    const results = cutoffs.map((cutoff) => ({
        college: (0, collegeMapper_1.mapCollege)(cutoff.college),
        closingRank: cutoff.closingRank,
        category: cutoff.category,
        status: computeStatus(cutoff.closingRank, rank),
    }));
    // Sort: SAFE first, then TARGET, then REACH, then by closingRank
    const order = { SAFE: 0, TARGET: 1, REACH: 2 };
    results.sort((a, b) => {
        if (order[a.status] !== order[b.status])
            return order[a.status] - order[b.status];
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
