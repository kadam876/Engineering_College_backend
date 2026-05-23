"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listColleges = listColleges;
exports.compareColleges = compareColleges;
exports.getCollegeReviews = getCollegeReviews;
exports.addCollegeReview = addCollegeReview;
const prisma_1 = require("../lib/prisma");
const collegeMapper_1 = require("../utils/collegeMapper");
const normalize_1 = require("../utils/normalize");
// ─── Fee Multipliers ─────────────────────────────────────────────────────────
const FEE_MULTIPLIERS = {
    OPEN: 1.0,
    OBC: 0.5,
    EBC: 0.5,
    TFWS: 0.15,
    SC: 0.10,
    ST: 0.10,
};
// ─── List Colleges ────────────────────────────────────────────────────────────
async function listColleges(req, res) {
    const search = (0, normalize_1.normalizeString)(req.query.search);
    const location = (0, normalize_1.normalizeString)(req.query.location);
    const maxFee = (0, normalize_1.parseOptionalFloat)(req.query.maxFee);
    const page = (0, normalize_1.parsePositiveInt)(req.query.page, 1);
    const limit = (0, normalize_1.parsePositiveInt)(req.query.limit, 12, 50);
    const skip = (page - 1) * limit;
    const rawCategory = (0, normalize_1.normalizeString)(req.query.category) ?? "OPEN";
    const category = rawCategory.toUpperCase();
    const multiplier = FEE_MULTIPLIERS[category] ?? 1.0;
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
    // Reverse-scale maxFee so the DB filter compares against base fees
    if (maxFee !== undefined) {
        const adjustedMaxBaseFee = maxFee / multiplier;
        and.push({ feesPerYear: { lte: adjustedMaxBaseFee } });
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
        colleges: colleges.map((c) => ({
            ...(0, collegeMapper_1.mapCollege)(c),
            calculatedFee: Math.round(c.feesPerYear * multiplier),
            appliedCategory: category,
        })),
        meta: { totalCount, totalPages, currentPage: page },
    });
}
// ─── Compare Colleges ─────────────────────────────────────────────────────────
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
// ─── Get College Reviews ──────────────────────────────────────────────────────
async function getCollegeReviews(req, res) {
    const collegeId = Number.parseInt(String(req.params.id), 10);
    if (!Number.isFinite(collegeId) || collegeId < 1) {
        return res.status(400).json({ error: "Invalid college id" });
    }
    const reviews = await prisma_1.prisma.review.findMany({
        where: { collegeId },
        orderBy: { createdAt: "desc" },
        include: {
            user: { select: { name: true, email: true } },
        },
    });
    return res.json({ reviews });
}
// ─── Add College Review ───────────────────────────────────────────────────────
async function addCollegeReview(req, res) {
    const collegeId = Number.parseInt(String(req.params.id), 10);
    if (!Number.isFinite(collegeId) || collegeId < 1) {
        return res.status(400).json({ error: "Invalid college id" });
    }
    // @ts-expect-error user is injected by requireAuth middleware
    const userId = req.user.id;
    const rating = Number.parseInt(String(req.body?.rating ?? ""), 10);
    const comment = typeof req.body?.comment === "string" ? req.body.comment.trim() : "";
    if (!Number.isFinite(rating) || rating < 1 || rating > 5) {
        return res.status(400).json({ error: "rating must be an integer between 1 and 5" });
    }
    if (!comment) {
        return res.status(400).json({ error: "comment is required" });
    }
    // Upsert — one review per user per college
    const review = await prisma_1.prisma.review.upsert({
        where: { userId_collegeId: { userId, collegeId } },
        update: { rating, comment },
        create: { userId, collegeId, rating, comment },
        include: { user: { select: { name: true, email: true } } },
    });
    // Recalculate college aggregate rating from all reviews
    const agg = await prisma_1.prisma.review.aggregate({
        where: { collegeId },
        _avg: { rating: true },
        _count: true,
    });
    const newRating = agg._avg.rating ?? rating;
    await prisma_1.prisma.college.update({
        where: { id: collegeId },
        data: { rating: Math.round(newRating * 10) / 10 },
    });
    return res.status(201).json({ review, averageRating: newRating });
}
