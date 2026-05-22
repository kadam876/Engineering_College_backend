import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const colleges = [
  {
    name: "College of Engineering Pune",
    slug: "coep-pune",
    location: "Pune",
    feesPerYear: 135000,
    averagePlacement: 1200000,
    highestPlacement: 4500000,
    rating: 4.5,
    cutoffs: [
      { examType: "MHT-CET", branch: "Computer Science Engineering", category: "OPEN", closingRank: 4500, year: 2025 },
      { examType: "MHT-CET", branch: "Computer Science Engineering", category: "OBC",  closingRank: 6200, year: 2025 },
      { examType: "MHT-CET", branch: "Computer Science Engineering", category: "SC",   closingRank: 13000, year: 2025 },
      { examType: "MHT-CET", branch: "Computer Science Engineering", category: "ST",   closingRank: 18000, year: 2025 },
      { examType: "MHT-CET", branch: "Computer Science Engineering", category: "TFWS", closingRank: 2200, year: 2025 },
      { examType: "MHT-CET", branch: "Information Technology",       category: "OPEN", closingRank: 6800, year: 2025 },
      { examType: "MHT-CET", branch: "Information Technology",       category: "OBC",  closingRank: 9100, year: 2025 },
      { examType: "MHT-CET", branch: "Information Technology",       category: "SC",   closingRank: 17500, year: 2025 },
      { examType: "MHT-CET", branch: "Information Technology",       category: "TFWS", closingRank: 3500, year: 2025 },
      { examType: "JEE", branch: "Computer Science Engineering",     category: "OPEN", closingRank: 3200, year: 2025 },
      { examType: "JEE", branch: "Computer Science Engineering",     category: "OBC",  closingRank: 4800, year: 2025 },
      { examType: "JEE", branch: "Computer Science Engineering",     category: "SC",   closingRank: 9500, year: 2025 },
      { examType: "JEE", branch: "Information Technology",           category: "OPEN", closingRank: 5000, year: 2025 },
      { examType: "JEE", branch: "Information Technology",           category: "OBC",  closingRank: 7200, year: 2025 },
    ],
  },
  {
    name: "Veermata Jijabai Technological Institute",
    slug: "vjti-mumbai",
    location: "Mumbai",
    feesPerYear: 89000,
    averagePlacement: 1100000,
    highestPlacement: 3800000,
    rating: 4.4,
    cutoffs: [
      { examType: "MHT-CET", branch: "Computer Science Engineering", category: "OPEN", closingRank: 9200, year: 2025 },
      { examType: "MHT-CET", branch: "Computer Science Engineering", category: "OBC",  closingRank: 12500, year: 2025 },
      { examType: "MHT-CET", branch: "Computer Science Engineering", category: "SC",   closingRank: 22000, year: 2025 },
      { examType: "MHT-CET", branch: "Computer Science Engineering", category: "TFWS", closingRank: 4800, year: 2025 },
      { examType: "MHT-CET", branch: "Information Technology",       category: "OPEN", closingRank: 11000, year: 2025 },
      { examType: "MHT-CET", branch: "Information Technology",       category: "OBC",  closingRank: 15000, year: 2025 },
      { examType: "JEE", branch: "Computer Science Engineering",     category: "OPEN", closingRank: 8500, year: 2025 },
      { examType: "JEE", branch: "Computer Science Engineering",     category: "OBC",  closingRank: 11000, year: 2025 },
      { examType: "JEE", branch: "Information Technology",           category: "OPEN", closingRank: 10500, year: 2025 },
    ],
  },
  {
    name: "Sardar Patel Institute of Technology",
    slug: "spit-mumbai",
    location: "Mumbai",
    feesPerYear: 245000,
    averagePlacement: 950000,
    highestPlacement: 2200000,
    rating: 4.1,
    cutoffs: [
      { examType: "MHT-CET", branch: "Computer Science Engineering", category: "OPEN", closingRank: 11000, year: 2025 },
      { examType: "MHT-CET", branch: "Computer Science Engineering", category: "OBC",  closingRank: 15000, year: 2025 },
      { examType: "MHT-CET", branch: "Computer Science Engineering", category: "SC",   closingRank: 28000, year: 2025 },
      { examType: "MHT-CET", branch: "Computer Science Engineering", category: "TFWS", closingRank: 5500, year: 2025 },
      { examType: "MHT-CET", branch: "Information Technology",       category: "OPEN", closingRank: 14000, year: 2025 },
      { examType: "MHT-CET", branch: "Information Technology",       category: "OBC",  closingRank: 18500, year: 2025 },
      { examType: "JEE", branch: "Computer Science Engineering",     category: "OPEN", closingRank: 12000, year: 2025 },
      { examType: "JEE", branch: "Computer Science Engineering",     category: "OBC",  closingRank: 16000, year: 2025 },
    ],
  },
  {
    name: "Pune Institute of Computer Technology",
    slug: "pict-pune",
    location: "Pune",
    feesPerYear: 198000,
    averagePlacement: 1050000,
    highestPlacement: 3100000,
    rating: 4.2,
    cutoffs: [
      { examType: "MHT-CET", branch: "Computer Science Engineering", category: "OPEN", closingRank: 7800, year: 2025 },
      { examType: "MHT-CET", branch: "Computer Science Engineering", category: "OBC",  closingRank: 10500, year: 2025 },
      { examType: "MHT-CET", branch: "Computer Science Engineering", category: "SC",   closingRank: 20000, year: 2025 },
      { examType: "MHT-CET", branch: "Computer Science Engineering", category: "TFWS", closingRank: 3800, year: 2025 },
      { examType: "MHT-CET", branch: "Information Technology",       category: "OPEN", closingRank: 10000, year: 2025 },
      { examType: "MHT-CET", branch: "Information Technology",       category: "OBC",  closingRank: 13000, year: 2025 },
      { examType: "JEE", branch: "Computer Science Engineering",     category: "OPEN", closingRank: 6500, year: 2025 },
      { examType: "JEE", branch: "Computer Science Engineering",     category: "OBC",  closingRank: 9000, year: 2025 },
    ],
  },
  {
    name: "Walchand College of Engineering",
    slug: "wce-sangli",
    location: "Sangli",
    feesPerYear: 112000,
    averagePlacement: 780000,
    highestPlacement: 1800000,
    rating: 4.0,
    cutoffs: [
      { examType: "MHT-CET", branch: "Computer Science Engineering", category: "OPEN", closingRank: 15000, year: 2025 },
      { examType: "MHT-CET", branch: "Computer Science Engineering", category: "OBC",  closingRank: 20000, year: 2025 },
      { examType: "MHT-CET", branch: "Computer Science Engineering", category: "SC",   closingRank: 35000, year: 2025 },
      { examType: "MHT-CET", branch: "Computer Science Engineering", category: "TFWS", closingRank: 7500, year: 2025 },
      { examType: "MHT-CET", branch: "Information Technology",       category: "OPEN", closingRank: 18000, year: 2025 },
      { examType: "MHT-CET", branch: "Information Technology",       category: "OBC",  closingRank: 24000, year: 2025 },
      { examType: "JEE", branch: "Computer Science Engineering",     category: "OPEN", closingRank: 18000, year: 2025 },
    ],
  },
  {
    name: "Vishwakarma Institute of Technology",
    slug: "vit-pune",
    location: "Pune",
    feesPerYear: 210000,
    averagePlacement: 980000,
    highestPlacement: 2600000,
    rating: 4.0,
    cutoffs: [
      { examType: "MHT-CET", branch: "Computer Science Engineering", category: "OPEN", closingRank: 12500, year: 2025 },
      { examType: "MHT-CET", branch: "Computer Science Engineering", category: "OBC",  closingRank: 17000, year: 2025 },
      { examType: "MHT-CET", branch: "Computer Science Engineering", category: "SC",   closingRank: 30000, year: 2025 },
      { examType: "MHT-CET", branch: "Computer Science Engineering", category: "TFWS", closingRank: 6000, year: 2025 },
      { examType: "MHT-CET", branch: "Information Technology",       category: "OPEN", closingRank: 15500, year: 2025 },
      { examType: "MHT-CET", branch: "Information Technology",       category: "OBC",  closingRank: 21000, year: 2025 },
      { examType: "JEE", branch: "Computer Science Engineering",     category: "OPEN", closingRank: 14000, year: 2025 },
      { examType: "JEE", branch: "Computer Science Engineering",     category: "OBC",  closingRank: 19000, year: 2025 },
    ],
  },
];

const sampleReviewComments = [
  {
    rating: 5,
    comment:
      "Absolutely fantastic college! The faculty are incredibly supportive, placements are top-notch, and the campus vibe is electric. Highly recommend to every aspiring engineer.",
  },
  {
    rating: 4,
    comment:
      "Great institute with excellent academics. The labs are well-equipped and professors are knowledgeable. Lost one star because canteen food could be much better!",
  },
  {
    rating: 4,
    comment:
      "Good college overall. Placement cell is very active and gets students into quality companies. Some bureaucracy in admin processes, but manageable.",
  },
  {
    rating: 3,
    comment:
      "Average experience. Curriculum is decent but outdated in some areas. The extra-curricular opportunities help balance things out.",
  },
  {
    rating: 5,
    comment:
      "Life-changing experience! The peer group here is brilliant and competitive in the best way possible. Projects and hackathons kept us constantly learning.",
  },
];

async function main() {
  // Clean up in correct dependency order
  await prisma.review.deleteMany();
  await prisma.shortlist.deleteMany();
  await prisma.cutoff.deleteMany();
  await prisma.college.deleteMany();
  await prisma.user.deleteMany();

  // Create demo users for reviews
  const passwordHash = await bcrypt.hash("demo1234", 10);
  const demoUsers = await Promise.all([
    prisma.user.create({ data: { email: "rahul.sharma@example.com", name: "Rahul Sharma", passwordHash } }),
    prisma.user.create({ data: { email: "priya.patil@example.com", name: "Priya Patil", passwordHash } }),
    prisma.user.create({ data: { email: "amit.desai@example.com", name: "Amit Desai", passwordHash } }),
    prisma.user.create({ data: { email: "neha.joshi@example.com", name: "Neha Joshi", passwordHash } }),
    prisma.user.create({ data: { email: "rohit.kulkarni@example.com", name: "Rohit Kulkarni", passwordHash } }),
  ]);

  for (let i = 0; i < colleges.length; i++) {
    const { cutoffs, ...collegeData } = colleges[i];

    const college = await prisma.college.create({
      data: {
        ...collegeData,
        cutoffs: {
          create: cutoffs,
        },
      },
    });

    // Seed 2–3 reviews per college from different demo users
    const numReviews = 2 + (i % 2);
    for (let j = 0; j < numReviews; j++) {
      const userIdx = (i + j) % demoUsers.length;
      const commentTemplate = sampleReviewComments[(i + j) % sampleReviewComments.length];
      await prisma.review.create({
        data: {
          collegeId: college.id,
          userId: demoUsers[userIdx].id,
          rating: commentTemplate.rating,
          comment: commentTemplate.comment,
        },
      });
    }
  }

  console.log(`✅ Seeded ${colleges.length} colleges with category-wise cutoffs and student reviews.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
