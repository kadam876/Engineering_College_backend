import { Router } from "express";
import {
  compareColleges,
  listColleges,
  getCollegeReviews,
  addCollegeReview,
} from "../controllers/collegeController";
import { predictAdmission } from "../controllers/predictController";
import { getMe, login, register } from "../controllers/authController";
import {
  addToShortlist,
  getShortlist,
  removeFromShortlist,
} from "../controllers/shortlistController";
import { requireAuth } from "../middleware/auth";

const router = Router();

router.get("/", (_req, res) => {
  res.json({
    message: "College Discovery Platform API is running successfully!",
    databaseStatus: "Connected",
    health: "OK"
  });
});

router.get("/colleges", listColleges);
router.get("/colleges/compare", compareColleges);
router.get("/colleges/:id/reviews", getCollegeReviews);
router.post("/colleges/:id/reviews", requireAuth, addCollegeReview);

router.post("/predict", predictAdmission);

router.post("/auth/register", register);
router.post("/auth/login", login);
router.get("/auth/me", requireAuth, getMe);

router.get("/shortlist", requireAuth, getShortlist);
router.post("/shortlist", requireAuth, addToShortlist);
router.delete("/shortlist/:collegeId", requireAuth, removeFromShortlist);

router.get("/health", (_req, res) => res.json({ status: "ok" }));

export default router;
