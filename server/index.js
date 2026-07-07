import dotenv     from "dotenv";
dotenv.config();
import express    from "express";
import cors       from "cors";
import cookieParser from "cookie-parser";

import connectDB  from "./config/db.conn.js";

import authRoutes from "./routes/auth.routes.js";
import workspaceRoutes from "./routes/workspace-routes.js";
import projectRoutes from "./routes/project.route.js";
import taskRoutes from "./routes/task.routes.js";
import userRoutes from "./routes/user.routes.js";
import orgRoutes  from "./routes/organization.routes.js";


const app  = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
  origin: [
    "http://localhost:5173",
    "http://localhost:3001",
    process.env.CLIENT_URL,
  ].filter(Boolean),
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

/* ── Routes ── */
app.use("/api/auth",       authRoutes);
app.use("/api/org",        orgRoutes);
app.use("/api/workspace",  workspaceRoutes);
app.use("/api/project",    projectRoutes);
app.use("/api/task",       taskRoutes);
app.use("/api/users",      userRoutes);

app.get("/health", (_, res) => res.json({ status: "ok", app: "SprintOS API v2" }));

connectDB().then(() =>
  app.listen(PORT, '0.0.0.0', () => console.log(`✅ SprintOS API → http://localhost:${PORT}`))
);
