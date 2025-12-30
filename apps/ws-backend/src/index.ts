import "dotenv/config"
import jwt, { JwtPayload } from "jsonwebtoken";
import { JWT_SECRET } from "@repo/backend_common/config";
import { WebSocketServer, WebSocket } from "ws";
import {dbClient} from "@repo/db/prismaClient"

const wss = new WebSocketServer({ port: 3001 });

type User = {
  userID: string;
  room: string[];
  web: WebSocket;
};

const users: User[] = [];

// ================= CONNECTION =================

wss.on("connection", function connection(ws, request) {
  const url = request.url;
  if (!url) {
    ws.close();
    return;
  }

  const query = url.split("?")[1];
  const queryParams = new URLSearchParams(query);
  const token = queryParams.get("token") || "";

  console.log('token' ,token)

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

  console.log(decoded)

  users.push({
    userID: decoded.userID,
    room: [],
    web: ws,
  });

  // ================= MESSAGE =================

  ws.on("message",  async  function message(data) {
    let parsedData: any;

    try {
      parsedData = JSON.parse(data.toString());
    } catch {
      return;
    }

    const user = users.find((x) => x.web === ws);
    if (!user) return;

    // ---------- JOIN ROOM ----------
    if (parsedData.type === "join_room") {
      if (!user.room.includes(parsedData.roomId)) {
        user.room.push(parsedData.roomId);
      }
    }

    // ---------- LEAVE ROOM ----------
    if (parsedData.type === "leave_room") {
      user.room = user.room.filter(
        (x) => x !== parsedData.roomId // ❗ FIXED
      );
    }

    // ---------- CHAT ----------
    if (parsedData.type === "chat") {
      console.log('sending message')
      const roomID = parsedData.roomID;
      console.log('roomID' , roomID)
      const message = parsedData.message;
      console.log(message)

      users.forEach((x) => {
        if (x.room.includes(roomID)) { // ❗ FIXED SYNTAX
          x.web.send(
            JSON.stringify({
              type: "chat",
              message,
              roomID,
              from: user.userID,
              Shape :  parsedData.shape
            })
          );
        }
      });

      // we need to put it  in  database in rooms message basically 

      console.log('putting into db')
      console.log(parsedData.shape)


      const chat = await dbClient.chat.create({
        data: {
            message:message , 
            userId:decoded.userID as string ,  
            roomID:Number(roomID) ,
            Shape:parsedData.shape
        }
      })
    }
  });

  // ================= CLEANUP =================

  ws.on("close", () => {
    const index = users.findIndex((u) => u.web === ws);
    if (index !== -1) {
      users.splice(index, 1);
    }
  });
});
