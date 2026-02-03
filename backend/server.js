const express = require("express");
const cors = require("cors");
const multer = require("multer");
const fs = require("fs");
const path = require("path");

const app = express();

// Enable CORS for all origins (especially for localhost:3001)
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// 🏥 Health Check Route
app.get("/", (req, res) => {
    res.send("FlowShare API is running 🚀");
});

// 🔐 Helper: create room folder if not exists
function ensureRoomFolder(roomId) {
    // Sanitize roomId to prevent directory traversal
    const safeRoomId = roomId.replace(/[^a-zA-Z0-9]/g, "");
    const roomPath = path.join(process.cwd(), "uploads", safeRoomId);
    if (!fs.existsSync(roomPath)) {
        fs.mkdirSync(roomPath, { recursive: true });
    }
    return roomPath;
}

// 📦 Multer storage (ROOM BASED)
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const roomId = req.body.roomId;
        if (!roomId) {
            return cb(new Error("Room ID required"));
        }
        const roomPath = ensureRoomFolder(roomId);
        cb(null, roomPath);
    },
    filename: (req, file, cb) => {
        // Keep underscores, hyphens, dots, and alphanumeric characters
        const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, "_");
        cb(null, Date.now() + "-" + safeName);
    },
});

const upload = multer({ storage });

/* ==========================
   📤 UPLOAD FILE
========================== */
// Wrap upload in a try-catch block within the handler isn't enough for multer middleware errors.
// We handle multer errors in the global error handler or by wrapping the middleware.
app.post("/upload", (req, res, next) => {
    upload.single("file")(req, res, (err) => {
        if (err) {
            return next(err); // Pass error to global handler
        }
        if (!req.file) {
            return res.status(400).json({ success: false, message: "No file uploaded" });
        }
        res.json({
            success: true,
            filename: req.file.filename,
            message: "File uploaded successfully"
        });
    });
});

/* ==========================
   📥 LIST FILES IN ROOM
========================== */
app.get("/files/:roomId", (req, res) => {
    const roomId = req.params.roomId.replace(/[^a-zA-Z0-9]/g, "");
    const roomPath = path.join(process.cwd(), "uploads", roomId);

    if (!fs.existsSync(roomPath)) return res.json([]);

    try {
        const files = fs.readdirSync(roomPath);
        res.json(files);
    } catch (err) {
        res.status(500).json({ error: "Failed to list files" });
    }
});

/* ==========================
   ⬇️ DOWNLOAD FILE (ROOM ONLY)
========================== */
app.get("/download/:roomId/:filename", (req, res) => {
    const roomId = req.params.roomId.replace(/[^a-zA-Z0-9]/g, "");
    const filename = req.params.filename; // Don't sanitize - use exact filename from URL

    const filePath = path.join(
        process.cwd(),
        "uploads",
        roomId,
        filename
    );

    console.log("DOWNLOAD PATH:", filePath);

    if (!fs.existsSync(filePath)) {
        console.error("File missing at:", filePath);
        return res.status(404).json({
            success: false,
            message: "File not found",
            path: filePath
        });
    }

    res.download(filePath, filename);
});

// 404 Handler
app.use((req, res) => {
    res.status(404).json({ success: false, message: "Not Found" });
});

// 🚨 Global Error Handler
app.use((err, req, res, next) => {
    console.error("Server Error:", err.message);

    // Always return JSON for errors
    res.status(500).json({
        success: false,
        message: err.message || "Internal Server Error"
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🔥 FlowShare server running on port ${PORT}`);
    // Create uploads dir if it doesn't exist
    if (!fs.existsSync(path.join(process.cwd(), "uploads"))) {
        fs.mkdirSync(path.join(process.cwd(), "uploads"));
    }
});
