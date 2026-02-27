const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth.routes");
const jobRoutes = require("./routes/job.routes");
const resumeRoutes = require("./routes/resume.routes");
const rankingRoutes = require("./routes/ranking.routes");
const dashboardRoutes = require("./routes/dashboard.routes");


const app = express();

app.use(cors());
app.use(express.json({ limit: "10mb" }));

app.get("/", (req, res) => {
  res.json({ message: "Backend running ✅" });
});

app.use("/api/dashboard", dashboardRoutes);
app.use("/api/job", jobRoutes);
app.use("/api/resume", resumeRoutes);
app.use("/api/ranking", rankingRoutes);
app.use("/api/auth", authRoutes);

module.exports = app;
