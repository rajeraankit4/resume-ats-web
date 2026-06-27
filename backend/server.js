import express from "express";
import multer from "multer";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const upload = multer(); // memory storage

const RESUME_MATCH_ENDPOINT = `${process.env.RESUME_SERVER_URL}/match/all-domains`;

app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.originalUrl}`);
  next();
});

/**
 * 1. Resume Analysis (PDF)
 */
app.post("/resume-analysis", upload.single("resume"), async (req, res) => {
  try {
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: "Missing PDF file." });
    }

    const formData = new FormData();
    const blob = new Blob([file.buffer], { type: file.mimetype });

    formData.append("resume", blob, file.originalname);

    const upstreamResponse = await fetch(RESUME_MATCH_ENDPOINT, {
      method: "POST",
      body: formData,
    });

    const responseText = await upstreamResponse.text();
    const contentType =
      upstreamResponse.headers.get("content-type") || "text/plain";

    return res
      .status(upstreamResponse.status)
      .set("Content-Type", contentType)
      .send(responseText);
  } catch (err) {
    console.error("Resume analysis proxy error:", err);
    return res.status(500).json({
      error: err.message || "Failed to forward resume analysis request.",
    });
  }
});

/**
 * 2. ZIP Upload
 */
app.post(
  "/resume-analysis/upload-zip",
  upload.single("zip_file"),
  async (req, res) => {
    try {
      const file = req.file;

      if (!file) {
        return res.status(400).json({ error: "Missing ZIP file." });
      }

      const formData = new FormData();
      const blob = new Blob([file.buffer], {
        type: file.mimetype || "application/zip",
      });

      formData.append("zip_file", blob, file.originalname);

      const upstreamResponse = await fetch(
        `${process.env.RESUME_SERVER_URL}/jds/upload-zip`,
        {
          method: "POST",
          body: formData,
        }
      );

      const responseText = await upstreamResponse.text();
      const contentType =
        upstreamResponse.headers.get("content-type") || "text/plain";

      return res
        .status(upstreamResponse.status)
        .set("Content-Type", contentType)
        .send(responseText);
    } catch (err) {
      console.error("ZIP upload proxy error:", err);
      return res.status(500).json({
        error: err.message || "Failed to forward ZIP upload request.",
      });
    }
  }
);

app.listen(process.env.PORT || 5000, () => {
  console.log(`Server running on port ${process.env.PORT || 5000}`);
});