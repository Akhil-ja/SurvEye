import { Router } from "express";
import { createCreator, signIn } from "../controllers/creatorController";

const router = Router();

router.post("/create", createCreator);
router.post("/signIn", signIn);

export default router;
