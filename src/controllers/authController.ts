import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma";
import { AuthPayload, AuthRequest } from "../middleware/auth";

function signToken(payload: AuthPayload): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET is not configured");
  return jwt.sign(payload, secret, { expiresIn: "7d" });
}

export async function register(req: Request, res: Response) {
  const email = typeof req.body?.email === "string" ? req.body.email.trim().toLowerCase() : "";
  const password = typeof req.body?.password === "string" ? req.body.password : "";
  const name = typeof req.body?.name === "string" ? req.body.name.trim() : undefined;

  if (!email || password.length < 6) {
    return res.status(400).json({ error: "Valid email and password (min 6 chars) required" });
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return res.status(409).json({ error: "Email already registered" });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { email, passwordHash, name },
  });

  const token = signToken({ userId: user.id, email: user.email });

  return res.status(201).json({
    token,
    user: { id: user.id, email: user.email, name: user.name },
  });
}

export async function login(req: Request, res: Response) {
  const email = typeof req.body?.email === "string" ? req.body.email.trim().toLowerCase() : "";
  const password = typeof req.body?.password === "string" ? req.body.password : "";

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const token = signToken({ userId: user.id, email: user.email });

  return res.json({
    token,
    user: { id: user.id, email: user.email, name: user.name },
  });
}

export async function getMe(req: AuthRequest, res: Response) {
  const userId = req.user?.userId;
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, name: true },
  });

  if (!user) return res.status(404).json({ error: "User not found" });
  return res.json({ user });
}
