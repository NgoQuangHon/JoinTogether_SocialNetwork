import { Router, Request, Response } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";

const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + "-" + uniqueSuffix + ext);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // Max 10MB
  fileFilter: (_req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error("Chỉ hỗ trợ upload file hình ảnh (jpg, jpeg, png, gif, webp)."));
  },
});

const uploadRouter = Router();

uploadRouter.post("/single", upload.single("file"), (req: Request, res: Response): void => {
  if (!req.file) {
    res.status(400).json({ success: false, message: "Vui lòng chọn file để upload." });
    return;
  }
  const fileUrl = `/uploads/${req.file.filename}`;
  res.status(200).json({
    success: true,
    message: "Upload file thành công.",
    data: {
      url: fileUrl,
      filename: req.file.filename,
      size: req.file.size,
    },
  });
});

export default uploadRouter;
