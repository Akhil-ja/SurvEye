import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";

dotenv.config();

const port: string | undefined = process.env.PORT;

const app: Express = express();

app.get("/", (req: Request, res: Response) => {
  res.send("hello");
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
