"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.register = register;
exports.login = login;
exports.getMe = getMe;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_1 = require("../lib/prisma");
function signToken(payload) {
    const secret = process.env.JWT_SECRET;
    if (!secret)
        throw new Error("JWT_SECRET is not configured");
    return jsonwebtoken_1.default.sign(payload, secret, { expiresIn: "7d" });
}
async function register(req, res) {
    const email = typeof req.body?.email === "string" ? req.body.email.trim().toLowerCase() : "";
    const password = typeof req.body?.password === "string" ? req.body.password : "";
    const name = typeof req.body?.name === "string" ? req.body.name.trim() : undefined;
    if (!email || password.length < 6) {
        return res.status(400).json({ error: "Valid email and password (min 6 chars) required" });
    }
    const existing = await prisma_1.prisma.user.findUnique({ where: { email } });
    if (existing) {
        return res.status(409).json({ error: "Email already registered" });
    }
    const passwordHash = await bcryptjs_1.default.hash(password, 10);
    const user = await prisma_1.prisma.user.create({
        data: { email, passwordHash, name },
    });
    const token = signToken({ userId: user.id, email: user.email });
    return res.status(201).json({
        token,
        user: { id: user.id, email: user.email, name: user.name },
    });
}
async function login(req, res) {
    const email = typeof req.body?.email === "string" ? req.body.email.trim().toLowerCase() : "";
    const password = typeof req.body?.password === "string" ? req.body.password : "";
    if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required" });
    }
    const user = await prisma_1.prisma.user.findUnique({ where: { email } });
    if (!user || !(await bcryptjs_1.default.compare(password, user.passwordHash))) {
        return res.status(401).json({ error: "Invalid credentials" });
    }
    const token = signToken({ userId: user.id, email: user.email });
    return res.json({
        token,
        user: { id: user.id, email: user.email, name: user.name },
    });
}
async function getMe(req, res) {
    const userId = req.user?.userId;
    if (!userId)
        return res.status(401).json({ error: "Unauthorized" });
    const user = await prisma_1.prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, email: true, name: true },
    });
    if (!user)
        return res.status(404).json({ error: "User not found" });
    return res.json({ user });
}
