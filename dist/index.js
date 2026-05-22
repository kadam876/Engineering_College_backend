"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const routes_1 = __importDefault(require("./routes"));
const app = (0, express_1.default)();
const port = Number.parseInt(process.env.PORT ?? "5000", 10);
app.use((0, cors_1.default)({
    origin: process.env.CORS_ORIGIN?.split(",") ?? true,
    credentials: true,
}));
app.use(express_1.default.json());
app.use("/api", routes_1.default);
app.use((_req, res) => {
    res.status(404).json({ error: "Route not found" });
});
app.listen(port, () => {
    console.log(`API listening on http://localhost:${port}`);
});
