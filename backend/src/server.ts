import express, { Express, Request, Response } from "express";
import connectDB from "../src/config/db";
import dotenv from "dotenv";
import routes from "../src/routes/index";
import userRoutes from "./routes/userRoutes";
import creatorRoutes from "./routes/creatorRoutes";
import cookieParser from "cookie-parser";
import cors from "cors";

dotenv.config();

connectDB();

const port: string | undefined = process.env.PORT;

const app: Express = express();

app.use(
  cors({
    origin: "http://localhost:8000",
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

app.use("/user", userRoutes);
app.use("/creator", creatorRoutes);
app.use("/", routes);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
