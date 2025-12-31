"use client";

import { useEffect, useRef } from "react";
import { Shape } from "./Canvaroom";

export type Rect = {
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
};

export type Circle = {
  x: number;
  y: number;
  radius: number;
  color: string;
};

export type PencilPath = {
  points: { x: number; y: number }[];
  color: string;
};

function randomColor() {
  return `hsl(${Math.random() * 360}, 80%, 60%)`;
}

export default function Canvas({
  socket,
  roomID,
  formated_shapes_rect,
  formated_shapes_circle,
  formated_shapes_pencil, 
  activated,
}: {
  socket: WebSocket;
  roomID: string;
  formated_shapes_rect: Rect[];
  formated_shapes_circle: Circle[];
  formated_shapes_pencil:PencilPath[]
  activated: Shape;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const rectanglesRef = useRef<Rect[]>([...formated_shapes_rect]);
  const circlesRef = useRef<Circle[]>([...formated_shapes_circle]);
  const pencilRef = useRef<PencilPath[]>([...formated_shapes_pencil]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    };

    const ctx = canvas.getContext("2d");
    if (!ctx) return;
   

    // ---------- FULLSCREEN ----------
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      draw();
    };
    resize();
    window.addEventListener("resize", resize);

    // ---------- DRAW ----------
    function draw() {

      if(!ctx ||  !canvas) {
        return;
      }

      
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // RECTANGLES
      rectanglesRef.current.forEach((r) => {
        ctx.strokeStyle = r.color;
        ctx.strokeRect(r.x, r.y, r.width, r.height);
      });

      // CIRCLES
      circlesRef.current.forEach((c) => {
        ctx.strokeStyle = c.color;
        ctx.beginPath();
        ctx.arc(c.x, c.y, c.radius, 0, Math.PI * 2);
        ctx.stroke();
      });

      // PENCIL
      pencilRef.current.forEach((path) => {
        ctx.strokeStyle = path.color;
        ctx.beginPath();
        ctx.moveTo(path.points[0].x, path.points[0].y);
        path.points.forEach((p) => ctx.lineTo(p.x, p.y));
        ctx.stroke();
      });
    }

    // ---------- DRAG STATE ----------
    let isDragging = false;
    let startX = 0;
    let startY = 0;
    let currentX = 0;
    let currentY = 0;

    let currentPencil: { x: number; y: number }[] = [];
    let pencilColor = randomColor();

    // ---------- MOUSE DOWN ----------
    const onMouseDown = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      isDragging = true;
      startX = e.clientX - rect.left;
      startY = e.clientY - rect.top;

      if (activated === "pencil") {
        currentPencil = [{ x: startX, y: startY }];
        pencilColor = randomColor();
      }
    };

    // ---------- MOUSE MOVE ----------
    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;

      const rect = canvas.getBoundingClientRect();
      currentX = e.clientX - rect.left;
      currentY = e.clientY - rect.top;

      draw();

      if (activated === "rect") {
        ctx.strokeStyle = "white";
        ctx.strokeRect(
          startX,
          startY,
          currentX - startX,
          currentY - startY
        );
      }

      if (activated === "circle") {
        const radius = Math.hypot(
          currentX - startX,
          currentY - startY
        );
        ctx.beginPath();
        ctx.arc(startX, startY, radius, 0, Math.PI * 2);
        ctx.stroke();
      }

      if (activated === "pencil") {
        currentPencil.push({ x: currentX, y: currentY });
        ctx.strokeStyle = pencilColor;
        ctx.beginPath();
        ctx.moveTo(currentPencil[0].x, currentPencil[0].y);
        currentPencil.forEach((p) => ctx.lineTo(p.x, p.y));
        ctx.stroke();
      }
    };

    // ---------- MOUSE UP ----------
    const onMouseUp = () => {
      if (!isDragging) return;
      isDragging = false;

      if (activated === "rect") {
        const rect: Rect = {
          x: startX,
          y: startY,
          width: currentX - startX,
          height: currentY - startY,
          color: randomColor(),
        };

        rectanglesRef.current.push(rect);

        socket.send(
          JSON.stringify({
            type: "chat",
            roomID,
            shape: "rect",
            message: JSON.stringify(rect),
          })
        );
      }

      if (activated === "circle") {
        const circle: Circle = {
          x: startX,
          y: startY,
          radius: Math.hypot(
            currentX - startX,
            currentY - startY
          ),
          color: randomColor(),
        };

        circlesRef.current.push(circle);

        socket.send(
          JSON.stringify({
            type: "chat",
            roomID,
            shape: "circle",
            message: JSON.stringify(circle),
          })
        );
      }

      if (activated === "pencil" && currentPencil.length > 1) {
        const pencil: PencilPath = {
          points: currentPencil,
          color: pencilColor,
        };

        pencilRef.current.push(pencil);

        socket.send(
          JSON.stringify({
            type: "chat",
            roomID,
            shape: "pencil",
            message: JSON.stringify(pencil),
          })
        );
      }

      draw();
    };

    // ---------- WS RECEIVE ----------
    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type !== "chat") return;

      const shape = JSON.parse(data.message);

      if (data.shape === "rect") rectanglesRef.current.push(shape);
      if (data.shape === "circle") circlesRef.current.push(shape);
      if (data.shape === "pencil") pencilRef.current.push(shape);

      draw();
    };

    canvas.addEventListener("mousedown", onMouseDown);
    canvas.addEventListener("mousemove", onMouseMove);
    canvas.addEventListener("mouseup", onMouseUp);

    return () => {
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("mousedown", onMouseDown);
      canvas.removeEventListener("mousemove", onMouseMove);
      canvas.removeEventListener("mouseup", onMouseUp);
    };
  }, [socket, roomID, activated]);

  return <canvas ref={canvasRef} style={{ background: "black" }} />;
}
