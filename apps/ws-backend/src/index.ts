import "dotenv/config";
import jwt, { JwtPayload } from "jsonwebtoken";
import { JWT_SECRET } from "./config";
import { WebSocketServer, WebSocket } from "ws";
import { dbClient } from "@repo/db/prismaClient";

const wss = new WebSocketServer({ port: 3001 });

type User = {
  userID: string;
  rooms: string[];
  socket: WebSocket;
};

const users: User[] = [];

// ================= CONNECTION =================

wss.on("connection", (ws, request) => {
  const url = request.url;
  if (!url) {
    ws.close();
    return;
  }

  const query = url.split("?")[1];
  const params = new URLSearchParams(query);
  const token = params.get("token");

  if (!token) {
    ws.close();
    return;
  }

  let decoded: JwtPayload;

  try {
    decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
  } catch {
    ws.close();
    return;
  }

  if (!decoded || typeof decoded === "string" || !decoded.userID) {
    ws.close();
    return;
  }

  const user: User = {
    userID: decoded.userID,
    rooms: [],
    socket: ws,
  };

  users.push(user);



  console.log("✅ user connected:", user.userID);

  console.log(users)

  // ================= MESSAGE =================

  ws.on("message", async (data) => {
    let parsedData: any;

    try {
      parsedData = JSON.parse(data.toString());
    } catch {
      return;
    }

    // ---------- JOIN ROOM ----------
    if (parsedData.type === "join_room") {
      console.log('joining room')
      const roomID = parsedData.roomId;
      console.log("roomID printing after joining" , roomID)

      if (roomID && !user.rooms.includes(roomID)) {
        user.rooms.push(roomID);
      }
      return;
    }

    // ---------- LEAVE ROOM ----------
    if (parsedData.type === "leave_room") {
      const roomID = parsedData.roomID;
      user.rooms = user.rooms.filter((r) => r !== roomID);
      return;
    }

    // ---------- CHAT / DRAW ----------
    if (parsedData.type === "chat") {
      const roomID = parsedData.roomID;
      const message = parsedData.message;
      const shape = parsedData.shape; // 👈 small s (NETWORK)

      console.log(shape ,  message  , roomID)

      if (!roomID || !shape) return;

      // 🔁 Broadcast to room users
      users.forEach((u) => {
        if (u.rooms.includes(roomID)) {
          u.socket.send(
            JSON.stringify({
              type: "chat",
              roomID,
              message,
              from: user.userID,
              shape, // 👈 small s (CLIENT expects this)
            })
          );
        }
      });

      // 🧹 CLEAR (room scoped)
      if (shape === "clear") {
        await dbClient.chat.deleteMany({
          where: {
            roomID: Number(roomID),
          },
        });
        return;
      }

      // 💾 STORE IN DB
      await dbClient.chat.create({
        data: {
          message,
          userId: user.userID,
          roomID: Number(roomID),
          Shape: shape, // 👈 capital S (DB column)
        },
      });
    }
  });

  // ================= CLEANUP =================

  ws.on("close", () => {
    const index = users.findIndex((u) => u.socket === ws);
    if (index !== -1) {
      users.splice(index, 1);
    }
    console.log("❌ user disconnected:", user.userID);
  });
});

console.log("🚀 WebSocket server running on port 3001");
