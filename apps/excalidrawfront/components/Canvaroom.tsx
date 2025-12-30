"use client";

import { useEffect, useState } from "react";
import Canvas from "./canva";
import IconButton from "./IconButton";
import { Circle, Eraser, Pencil, Square } from "lucide-react";
import { WS_URL } from "@/app/config/url";

export type Shape = "circle" | "rect" | "pencil" | "delete";

export default function CanvaRoom({
  roomID,
  formated_shapes_rect, 
  formated_shapes_pencil , 
  formated_shapes_circle , 
  token
}: {
  roomID: string;
  formated_shapes_rect: any[];
  formated_shapes_pencil: any[];

  formated_shapes_circle: any[];
  token: string 

}) {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [activated, setActivated] = useState<Shape>("rect");

  useEffect(() => {
    const ws = new WebSocket(
      `${WS_URL}/?token=${token}`
    );

    ws.onopen = () => {
      ws.send(
        JSON.stringify({
          type: "join_room",
          roomId: roomID,
        })
      );
      setSocket(ws);
    };

    return () => ws.close();
  }, [roomID]);

  if (!socket) {
    return <div>Connecting...</div>;
  }

  return (
    <div className="relative w-screen h-screen overflow-hidden">
      
      {/* 🔥 TOOLBAR */}
      <div
        className="
          fixed 
          top-4 
          left-1/2 
          -translate-x-1/2
          z-50
          flex 
          gap-1 
          bg-purple-900 
          px-2 
          py-1 
          rounded-md
          shadow-lg
        "
      >
        <IconButton
          Icon={Pencil}
          onClick={() => setActivated("pencil")}
          activated={activated === "pencil"}
        />
        <IconButton
    Icon={Circle}
          onClick={() => setActivated("circle")}
          activated={activated === "circle"}
        />
        <IconButton
          Icon={Square}
          onClick={() => setActivated("rect")}
          activated={activated === "rect"}
        />
        <IconButton
        Icon={Eraser}
        onClick={() =>setActivated("delete")}
        activated={activated === "pencil"}/>
      </div>

      {/* 🔥 CANVAS */}
      <Canvas
        socket={socket}
        roomID={roomID}
        formated_shapes_rect={formated_shapes_rect} 
        formated_shapes_circle={formated_shapes_circle} 
        formated_shapes_pencil={formated_shapes_pencil}
     
        activated={activated}
        
      />
    </div>
  );
}
