import mongoose from "mongoose";

const connectDB = async (io) => {
  try {
    await mongoose.connect(process.env.MONGOBD_URL);
    console.log("DB connected");
  } catch (error) {
    console.error("Error connecting to MongoDB Atlas:", error);
  }

  // ตั้งค่า change streams หากต้องการแจ้ง event ผ่าน Socket.IO
  const changeStreamOrder = mongoose.connection.collection("orders").watch();
  const changeStreamTables = mongoose.connection.collection("tables").watch();

  changeStreamOrder.on("change", () => {
    io.emit("orderUpdated");
  });
  changeStreamTables.on("change", () => {
    io.emit("tableUpdated");
  });
};

export default connectDB;
