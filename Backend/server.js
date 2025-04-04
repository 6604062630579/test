import express from "express";
import cors from "cors";
import "dotenv/config";
import connectDB from "./config/mongodb.js";
import connectCloudinary from "./config/cloudinary.js";
import userRouter from "./routes/employeeRoute.js";
import productRouter from "./routes/productRoute.js";
import orderRouter from "./routes/orderRoute.js";
import employeeRouter from "./routes/employeeRoute.js";
import analyticsRouter from "./routes/analyticsRoute.js";
import tableRouter from "./routes/tableRoute.js";
import http from "http";
import { Server } from "socket.io";

const app = express();
// ใช้ค่าจาก environment variable PORT ถ้ามี, ถ้าไม่มีก็ใช้ 4000
const port = process.env.PORT || 4000;

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: [
      "https://quickbites-dashboard.vercel.app",
      "https://quickbites-website.vercel.app",
      "http://localhost:3001",
      "http://localhost:3002",
    ],
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
    credentials: true,
  },
  transports: ["websocket", "polling"],
  debug: true,
});

// เชื่อมต่อ MongoDB และ Cloudinary
connectDB(io);
connectCloudinary();

app.use(express.json());
app.use(cors());

// กำหนด routes
app.use("/api/user", userRouter);
app.use("/api/product", productRouter);
app.use("/api/order", orderRouter);
app.use("/api/employee", employeeRouter);
app.use("/api/analytics", analyticsRouter);
app.use("/api/table", tableRouter);

io.on("connection", (socket) => {
  console.log(`A user connected: ${socket.id}`);
  socket.on("message", (data) => {
    console.log("Message received:", data);
    socket.emit("messageResponse", "Message received");
  });
  socket.on("disconnect", () => {
    console.log("A user disconnected");
  });
});

app.get("/", (req, res) => {
  res.send("API IS WORKING");
});

server.listen(port, "0.0.0.0", () => {
  console.log(`Server is running on port ${port}`);
});
