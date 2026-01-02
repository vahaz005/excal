import "dotenv/config";
import express, { Request, Response } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import cors from "cors";

import { JWT_SECRET } from "./config"
import { middelware } from "./middleware";
import {
  CreateUserSchema,
  SigninSchema,
  createRoomSchema,
} from "./schema";
import { dbClient } from "@repo/db/prismaClient";

const app = express();

app.use(cors({
  origin: true,
  credentials: true,
}));

app.options("*", cors({
  origin: true,
  credentials: true,
}));

app.use(express.json());

/* ======================
   ROOT
====================== */
app.get("/", (req, res) => {
  return res.send("hii");
});

/* ======================
   SIGN IN
====================== */
app.post("/sign-in", async (req: Request, res: Response) => {
  const parsed = SigninSchema.safeParse(req.body);
  console.log(req.body)
  if (!parsed.success) {
    return res.status(403).json({ message: "invalid inputs" });
  }

  try {
    console.log('putting into db')
  const user = await dbClient.user.findFirst({
      where: { email: req.body.email },
    });

    console.log(user)

    if (!user) {
      return res.status(403).json("user does not exist");
    }

    const isPasswordCorrect = bcrypt.compareSync(
      req.body.password,
      user.password
    );

    if (!isPasswordCorrect) {
      return res.status(403).json("password incorrect");
    }

    const token = jwt.sign(
      { userID: user.id },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

     res.cookie("auth-token" , token ,  {
      httpOnly:true , 
      secure:false , 
      sameSite:'lax' , 
      path:"/"
    });
   
    return  res.json({
      "token" :  token
    });

  } catch (error: any) {
    return res.status(500).json({ error: error });
  }
});

/* ======================
   SIGN UP
====================== */
app.post("/sign-up", async (req: Request, res: Response) => {
  const parsed = CreateUserSchema.safeParse(req.body);

  console.log(req.body)
  if (!parsed.success) {
    return res.status(403).json("invalid inputs");
  }

  try {

    const existingUser = await dbClient.user.findFirst({
      where: { email: req.body.email },
    });

    if (existingUser) {
      return res.status(403).json("user already exists");
    }

    const hash = bcrypt.hashSync(req.body.password, 10);

    const newUser   = await dbClient.user.create({
      data: {
        email: req.body.email,
        name: req.body.name,
        password: hash,
      },
    });

    console.log("newUser" ,newUser)

    return res.status(201).json({
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

/* ======================
   CREATE ROOM
====================== */
app.post("/room", middelware, async (req: Request, res: Response) => {
  const parsed =   createRoomSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(403).json({ message: "invalid inputs" });
  }

  try {
    const room = await dbClient.room.create({
      data: {
        slug: req.body.roomname,
        adminId: req.userID as string,
      },
    });

    return res.json({ room });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

/* ======================
   GET CHATS
====================== */
app.get("/chats/:roomId", async (req: Request, res: Response) => {
  try {
    const roomId = Number(req.params.roomId);

    const message =  await dbClient.chat.findMany({
  where: { roomID :  roomId },
  select: {
    id: true,
    message: true,
    userId: true,
    roomID: true,
    Shape: true,
  }  ,
  orderBy : {
     id:'desc'
  } , 
  take:50
});


    return res.status(200).json({
      messages: message,
    });
  } catch (error: any) {
    return res.status(500).json(error.message);
  }
});

/* ======================
   GET ROOM BY SLUG
====================== */
app.get("/room/:slug", async (req: Request, res: Response) => {
  const slug = req.params.slug;

  try {
    const room = await dbClient.room.findFirst({
      where: { 
        slug:slug
       },
    });

    if (!room) {
      return res.status(403).json("room invalid");
    }

    return res.status(200).json({
      roomID: room.id.toString(),
    });
  } catch (error: any) {
    return res.status(500).json({
      error: error.message,
    });
  }
});

/* ======================
   LISTEN
====================== */
app.listen(3002, () => {
  console.log("Server running on port 3002");
});
