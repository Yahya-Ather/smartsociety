import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadsDir = path.join(__dirname, "..", "..", "uploads", "complaints");

// .env.example ships placeholder Cloudinary values — treat those as "not configured"
// rather than trying (and failing) to authenticate with fake credentials.
const PLACEHOLDER_VALUES = new Set([
  "your_cloudinary_cloud_name",
  "your_cloudinary_api_key",
  "your_cloudinary_api_secret",
]);

function isConfigured(value) {
  return Boolean(value) && !PLACEHOLDER_VALUES.has(value);
}

const cloudinaryConfigured =
  isConfigured(process.env.CLOUDINARY_CLOUD_NAME) &&
  isConfigured(process.env.CLOUDINARY_API_KEY) &&
  isConfigured(process.env.CLOUDINARY_API_SECRET);

let storage;

if (cloudinaryConfigured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

  storage = new CloudinaryStorage({
    cloudinary,
    params: {
      folder: "smart_society/complaints",
      allowed_formats: ["jpg", "jpeg", "png", "webp"],
    },
  });

  console.log("Photo uploads: using Cloudinary.");
} else {
  // Fallback so complaint photo uploads work out of the box without a Cloudinary
  // account. Files land in Backend/uploads/complaints and are served statically
  // from /uploads (see app.js). Swap in real CLOUDINARY_* values in .env and
  // restart the server to switch back to Cloudinary — no code changes needed.
  fs.mkdirSync(uploadsDir, { recursive: true });

  storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadsDir),
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname) || ".jpg";
      const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      cb(null, `${unique}${ext}`);
    },
  });

  console.log("Photo uploads: Cloudinary not configured — using local disk storage (Backend/uploads/complaints).");
}

export const upload = multer({ storage });
export { cloudinary, cloudinaryConfigured };
