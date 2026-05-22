"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listColleges = listColleges;
exports.compareColleges = compareColleges;
const prisma_1 = require("../lib/prisma");
const collegeMapper_1 = require("../utils/collegeMapper");
const normalize_1 = require("../utils/normalize");
async function listColleges(req, res) {
    const search = (0, normalize_1.normalizeString)(req.query.search);
    const location = (0, normalize_1.normalizeString)(req.query.location);
    const maxFee = (0, normalize_1.parseOptionalFloat)(req.query.maxFee);
    const page = (0, normalize_1.parsePositiveInt)(req.query.page, 1);
    const limit = (0, normalize_1.parsePositiveInt)(req.query.limit, 12, 50);
    const skip = (page - 1) * limit;
    const and = [];
    if (search) {
        and.push({
            OR: [
                { name: { contains: search, mode: "insensitive" } },
                { location: { contains: search, mode: "insensitive" } },
            ],
        });
    }
    if (location) {
        and.push({ location: { contains: location, mode: "insensitive" } });
    }
    if (maxFee !== undefined) {
        and.push({ feesPerYear: { lte: maxFee } });
    }
    const where = and.length > 0 ? { AND: and } : {};
    const [colleges, totalCount] = await Promise.all([
        prisma_1.prisma.college.findMany({
            where,
            skip,
            take: limit,
            orderBy: { rating: "desc" },
        }),
        prisma_1.prisma.college.count({ where }),
    ]);
    const totalPages = Math.max(1, Math.ceil(totalCount / limit));
    return res.json({
        colleges: colleges.map(collegeMapper_1.mapCollege),
        meta: { totalCount, totalPages, currentPage: page },
    });
}
async function compareColleges(req, res) {
    const idsParam = req.query.ids;
    if (!idsParam || typeof idsParam !== "string") {
        return res.status(400).json({ error: "ids query parameter is required" });
    }
    const ids = idsParam
        .split(",")
        .map((id) => Number.parseInt(id.trim(), 10))
        .filter((id) => Number.isFinite(id) && id > 0);
    if (ids.length === 0) {
        return res.status(400).json({ error: "At least one valid college id is required" });
    }
    if (ids.length > 3) {
        return res.status(400).json({ error: "Maximum 3 colleges can be compared" });
    }
    const colleges = await prisma_1.prisma.college.findMany({
        where: { id: { in: ids } },
    });
    const orderMap = new Map(ids.map((id, index) => [id, index]));
    colleges.sort((a, b) => (orderMap.get(a.id) ?? 0) - (orderMap.get(b.id) ?? 0));
    return res.json({ colleges: colleges.map(collegeMapper_1.mapCollege) });
}
