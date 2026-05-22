"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getShortlist = getShortlist;
exports.addToShortlist = addToShortlist;
exports.removeFromShortlist = removeFromShortlist;
const prisma_1 = require("../lib/prisma");
const collegeMapper_1 = require("../utils/collegeMapper");
async function getShortlist(req, res) {
    const userId = req.user.userId;
    const entries = await prisma_1.prisma.shortlist.findMany({
        where: { userId },
        include: { college: true },
        orderBy: { id: "desc" },
    });
    return res.json({
        shortlist: entries.map((entry) => ({
            id: entry.id,
            college: (0, collegeMapper_1.mapCollege)(entry.college),
        })),
    });
}
async function addToShortlist(req, res) {
    const userId = req.user.userId;
    const collegeId = Number.parseInt(String(req.body?.collegeId ?? ""), 10);
    if (!Number.isFinite(collegeId) || collegeId < 1) {
        return res.status(400).json({ error: "Valid collegeId is required" });
    }
    const college = await prisma_1.prisma.college.findUnique({ where: { id: collegeId } });
    if (!college) {
        return res.status(404).json({ error: "College not found" });
    }
    const entry = await prisma_1.prisma.shortlist.upsert({
        where: { userId_collegeId: { userId, collegeId } },
        create: { userId, collegeId },
        update: {},
        include: { college: true },
    });
    return res.status(201).json({ shortlist: { id: entry.id, college: (0, collegeMapper_1.mapCollege)(entry.college) } });
}
async function removeFromShortlist(req, res) {
    const userId = req.user.userId;
    const collegeId = Number.parseInt(String(req.params.collegeId ?? ""), 10);
    if (!Number.isFinite(collegeId) || collegeId < 1) {
        return res.status(400).json({ error: "Valid collegeId is required" });
    }
    await prisma_1.prisma.shortlist.deleteMany({ where: { userId, collegeId } });
    return res.json({ success: true });
}
