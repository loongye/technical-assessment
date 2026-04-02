import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import multer from "multer";
import { PrismaClient } from "@prisma/client";
import { processCsv } from "./csvProcessor";
import { Readable } from "stream";

const prisma = new PrismaClient();
const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
  },
});

app.use(cors());
app.use(express.json());

const upload = multer({ storage: multer.memoryStorage() });

io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);
  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});

app.get("/api/posts", async (req, res) => {
  const { page = "1", limit = "10", search = "" } = req.query;
  const skip = (Number(page) - 1) * Number(limit);
  const take = Number(limit);

  const where = search
    ? {
      OR: [
        { name: { contains: search as string, mode: "insensitive" as const } },
        { email: { contains: search as string, mode: "insensitive" as const } },
        { body: { contains: search as string, mode: "insensitive" as const } },
      ],
    }
    : {};

  try {
    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where,
        skip,
        take,
        orderBy: { id: "asc" },
      }),
      prisma.post.count({ where }),
    ]);

    res.json({
      data: posts,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch posts" });
  }
});

app.post("/api/upload", upload.single("file"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  try {
    const stream = Readable.from(req.file.buffer);
    const existingPosts = await prisma.post.findMany();

    const { conflicts, newPosts } = await processCsv(stream, existingPosts as any);

    if (conflicts.length > 0) {
      // Send conflicts ONLY to the uploader via response
      return res.json({ message: "Conflicts detected", conflicts });
    }

    // If no conflicts, just create new ones
    if (newPosts.length > 0) {
      await prisma.post.createMany({ data: newPosts });
      io.emit("data_updated");
    }

    res.json({ message: "Upload successful", count: newPosts.length });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to process CSV" });
  }
});

app.post("/api/resolve-conflict", async (req, res) => {
  const { id, choice, data } = req.body; // choice: 'new' or 'old'

  try {
    if (choice === "new") {
      await prisma.post.upsert({
        where: { id },
        update: { ...data, version: { increment: 1 } },
        create: { ...data, version: 1 },
      });
    }
    // if 'old', do nothing as it's already in DB

    io.emit("data_updated");
    res.json({ message: "Conflict resolved" });
  } catch (error) {
    res.status(500).json({ error: "Failed to resolve conflict" });
  }
});

const PORT = process.env.PORT || 4000;
httpServer.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});