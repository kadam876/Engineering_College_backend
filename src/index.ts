import "dotenv/config";
import express from "express";
import cors from "cors";
import routes from "./routes";

const app = express();
const port = Number.parseInt(process.env.PORT ?? "5000", 10);

app.use(
  cors({
    origin: process.env.CORS_ORIGIN?.split(",") ?? true,
    credentials: true,
  })
);
app.use(express.json());

app.use("/api", routes);
app.use("/", routes);

app.use((req, res) => {
  res.status(404).json({
    error: "Route not found",
    method: req.method,
    url: req.url,
    path: req.path,
    originalUrl: req.originalUrl
  });
});

app.listen(port, () => {
  console.log(`API listening on http://localhost:${port}`);
});
