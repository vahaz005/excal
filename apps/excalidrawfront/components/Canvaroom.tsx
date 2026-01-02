"use client";

import { useEffect, useState } from "react";
import Canvas from "./canva";
import IconButton from "./IconButton";
import { Circle, Pencil, Square, MoveRight, Eraser } from "lucide-react";
import { WS_URL } from "@/app/config/url";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "./ui/dialog";

export type Shape =
  | "circle"
  | "rect"
  | "pencil"
  | "line"
  | "arrow"
  | "clear";

export default function CanvaRoom({
  roomID,
  formated_shapes_rect,
  formated_shapes_circle,
  formated_shapes_pencil,
  formated_shapes_line,
  formated_shapes_arrow,
  token,
}: {
  roomID: string;
  formated_shapes_rect: any[];
  formated_shapes_circle: any[];
  formated_shapes_pencil: any[];
  formated_shapes_line: any[];
  formated_shapes_arrow: any[];
  token: string;
}) {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [activated, setActivated] = useState<Shape>("rect");

  useEffect(() => {
    const ws = new WebSocket(`${WS_URL}/?token=${token}`);

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

  if (!socket) return <div>Connecting...</div>;

  return (
    <div className="relative w-screen h-screen overflow-hidden">
      {/* 🔥 TOP TOOLBAR */}
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
          Icon={MoveRight}
          onClick={() => setActivated("line")}
          activated={activated === "line"}
        />
      </div>

      {/* 🔥 CANVAS */}
      <Canvas
        socket={socket}
        roomID={roomID}
        formated_shapes_rect={formated_shapes_rect}
        formated_shapes_circle={formated_shapes_circle}
        formated_shapes_pencil={formated_shapes_pencil}
        formated_shapes_line={formated_shapes_line}
        formated_shapes_arrow={formated_shapes_arrow}
        activated={activated}
      />

      {/* 🔥 BOTTOM CLEAR BUTTON (AS-IT-IS) */}
      <div
        className="
          fixed 
          bottom-4 
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
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Eraser />
            </Button>
          </DialogTrigger>

          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Are you sure?</DialogTitle>
              <DialogDescription>
                Clearing the canvas will erase everything from the database.
                Think twice!
              </DialogDescription>
            </DialogHeader>

            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>

              <DialogClose asChild>
                <Button
                  onClick={() => {
                    setActivated("clear");
                  }}
                >
                  Confirm Delete
                </Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
