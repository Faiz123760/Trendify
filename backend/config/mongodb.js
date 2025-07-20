import mongoose from "mongoose";

const connectDB = async () => {
  mongoose.connection.on("connected", () => {
    console.log("MongoDB connected");
  });

  await mongoose.connect(`mongodb+srv://alamfaiz98765:nFDb8AZuzupeJF6G@cluster0.clo3ms7.mongodb.net/trendify`);
};

export default connectDB;
