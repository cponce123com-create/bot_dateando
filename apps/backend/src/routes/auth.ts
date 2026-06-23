import { Router } from "express";
import bcrypt from "bcryptjs";
import { db } from "../db/index.js";
import { usuarios } from "../db/schema.js";
import { signToken } from "../middleware/auth.js";
import { eq } from "drizzle-orm";

export const authRouter = Router();

authRouter.post("/login", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    res.status(400).json({ error: "Usuario y password requeridos" });
    return;
  }

  const [user] = await db.select().from(usuarios).where(eq(usuarios.username, username));
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    res.status(401).json({ error: "Credenciales invalidas" });
    return;
  }

  res.json({ token: signToken(user.id), username: user.username });
});
