import "dotenv/config";
import cors from "cors";
import express from "express";
import multer from "multer";
import mongoose from "mongoose";

const app = express();
const port = Number(process.env.PORT || 4000);
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024 },
  fileFilter: (_req, file, callback) => {
    const allowed = ["image/jpeg", "image/png", "image/webp"];
    callback(null, allowed.includes(file.mimetype));
  }
});
const rewards = { Smartphones: 150, Laptops: 850, Earphones: 100, Accessories: 75 };
const classifyByName = (fileName = "", selectedCategory = "") => {
  const name = fileName.toLowerCase();
  let key = selectedCategory;
  if (!key) {
    if (/(earphone|earbud|headphone|headset|audio)/.test(name)) key = "Earphones";
    else if (/(laptop|notebook|computer|macbook)/.test(name)) key = "Laptops";
    else if (/(mobile|phone|smartphone|iphone|android|samsung)/.test(name)) key = "Smartphones";
    else key = "Accessories";
  }
  return {
    key,
    category: key === "Smartphones" ? "Smartphone" : key === "Laptops" ? "Laptop" : key === "Earphones" ? "Earphones" : "Accessory",
    productType: key === "Smartphones" ? "Mobile electronic device" : key === "Laptops" ? "Portable computer" : key === "Earphones" ? "Wired audio accessory" : "Charger or cable",
    conditionGrade: key === "Laptops" ? "A" : key === "Accessories" ? "C" : "B",
    confidence: key === "Laptops" ? 96 : key === "Smartphones" ? 94 : key === "Earphones" ? 91 : 88
  };
};
const submissionSchema = new mongoose.Schema({
  category: String, grade: String, quantity: Number, estimatedMinimumReward: Number, createdAt: { type: Date, default: Date.now }
});
const Submission = mongoose.model("WasteSubmission", submissionSchema);

const allowedOrigins = new Set([
  process.env.FRONTEND_ORIGIN || "http://localhost:5173",
  "http://127.0.0.1:5173"
]);
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.has(origin)) return callback(null, true);
    return callback(new Error("Origin is not allowed by the ReLoop API."));
  }
}));
app.get("/api/health", (_req, res) => res.json({ status: "ok", service: "reloop-api", demoMode: true }));
app.post("/api/waste/classify", upload.single("image"), async (req, res) => {
  if (!req.file && !req.body.demoCategory) return res.status(400).json({ error: "Upload an image or choose a demo category." });
  const classification = classifyByName(req.file?.originalname, rewards[req.body.demoCategory] ? req.body.demoCategory : "");
  const data = {
    category: classification.category,
    productType: classification.productType,
    conditionGrade: classification.conditionGrade,
    confidence: classification.confidence,
    estimatedMinimumReward: rewards[classification.key],
    mode: "LOCAL DEMO"
  };
  if (mongoose.connection.readyState !== 1) return res.json({ result: data, persistence: { saved: false, message: "MongoDB is not connected; result was not saved." } });
  try {
    await Submission.create({ category: data.category, grade: data.conditionGrade, quantity: 1, estimatedMinimumReward: data.estimatedMinimumReward });
    return res.json({ result: data, persistence: { saved: true } });
  } catch (error) {
    console.error("Unable to save waste submission:", error.message);
    return res.status(503).json({ error: "Classification succeeded, but the submission could not be saved. Please try again." });
  }
});
app.use((error, _req, res, _next) => {
  if (error instanceof multer.MulterError || error.message === "Unexpected field") return res.status(400).json({ error: "Please upload a JPG, PNG, or WEBP image under 8 MB." });
  res.status(500).json({ error: "Unexpected server error." });
});
if (process.env.MONGODB_URI) mongoose.connect(process.env.MONGODB_URI).then(() => console.log("MongoDB connected")).catch(() => console.warn("MongoDB unavailable; demo results will not be saved."));
app.listen(port, () => console.log(`ReLoop API listening on http://localhost:${port}`));
