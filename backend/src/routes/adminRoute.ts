import { Router } from "express";
import {
  adminLogout,
  adminSignIn,
  toggleStatus,
  getAllUsers,
} from "../controllers/adminController";

const router = Router();

router.post("/signin", adminSignIn);
router.post("/logout", adminLogout);
router.get("/users", getAllUsers);
router.put("/users/toggleStatus", toggleStatus);

export default router;
