"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.predictAdmission = predictAdmission;
const prisma_1 = require("../lib/prisma");
const collegeMapper_1 = require("../utils/collegeMapper");
const normalize_1 = require("../utils/normalize");
function categorize(closingRank, userRank) {
    if (closingRank >= userRank)
        return "target";
    if (closingRank >= userRank * 0.9)
        return "dream";
    return "reach";
}
async function predictAdmission(req, res) {
    const examType = (0, normalize_1.normalizeString)(req.body?.examType);
    const branch = typeof req.body?.branch === "string" ? req.body.branch.trim() : "";
    const rank = Number.parseInt(String(req.body?.rank ?? ""), 10);
    if (!examType || !branch || !Number.isFinite(rank) || rank < 1) {
        return res.status(400).json({
            error: "examType, branch, and a positive rank are required",
        });
    }
    const cutoffs = await prisma_1.prisma.cutoff.findMany({
        where: {
            examType: { equals: req.body.examType.trim(), mode: "insensitive" },
            branch: { equals: branch, mode: "insensitive" },
        },
        include: { college: true },
        orderBy: { closingRank: "asc" },
    });
    const grouped = new Map();
    for (const cutoff of cutoffs) {
        const category = categorize(cutoff.closingRank, rank);
        const existing = grouped.get(cutoff.collegeId);
        if (!existing || cutoff.closingRank < existing.closingRank) {
            grouped.set(cutoff.collegeId, {
                college: (0, collegeMapper_1.mapCollege)(cutoff.college),
                category,
                closingRank: cutoff.closingRank,
            });
        }
    }
    const results = Array.from(grouped.values()).sort((a, b) => {
        const order = { target: 0, dream: 1, reach: 2 };
        if (order[a.category] !== order[b.category]) {
            return order[a.category] - order[b.category];
        }
        return a.closingRank - b.closingRank;
    });
    return res.json({
        examType: req.body.examType.trim(),
        branch,
        rank,
        results,
        meta: { totalMatches: results.length },
    });
}
