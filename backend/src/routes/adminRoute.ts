import { Router } from "express";
import {
  adminLogout,
  adminSignIn,
  toggleStatus,
} from "../controllers/adminController";

const router = Router();

router.post("/signin", adminSignIn);
router.post("/logout", adminLogout);
router.put("/users/toggleStatus", toggleStatus);

export default router;
