import express, { Express, Request, Response } from "express";
import connectDB from "../src/config/db";
import dotenv from "dotenv";
import routes from "../src/routes/index";
import userRoutes from "./routes/userRoutes";
import creatorRoutes from "./routes/creatorRoutes";

dotenv.config();

connectDB();

const port: string | undefined = process.env.PORT;

const app: Express = express();
app.use(express.json());

app.use("/user", userRoutes);
app.use("/creator", creatorRoutes);
app.use("/", routes);

app.get("/", (req: Request, res: Response) => {
  res.send("hello");
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
