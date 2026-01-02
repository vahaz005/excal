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

export type Line = {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  color: string;
};

export type Arrow = Line;

const COLORS = [
  "#1e1e1e",
  "#e03131",
  "#2f9e44",
  "#1971c2",
  "#f08c00",
  "#6741d9",
];

const randomColor = () =>
  COLORS[Math.floor(Math.random() * COLORS.length)];

export default function Canvas({
  socket,
  roomID,
  formated_shapes_rect,
  formated_shapes_circle,
  formated_shapes_pencil,
  formated_shapes_line,
  formated_shapes_arrow,
  activated,
}: {
  socket: WebSocket;
  roomID: string;
  formated_shapes_rect: Rect[];
  formated_shapes_circle: Circle[];
  formated_shapes_pencil: PencilPath[];
  formated_shapes_line: Line[];
  formated_shapes_arrow: Arrow[];
  activated: Shape;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const rectanglesRef = useRef<Rect[]>([]);
  const circlesRef = useRef<Circle[]>([]);
  const pencilRef = useRef<PencilPath[]>([]);
  const linesRef = useRef<Line[]>([]);
  const arrowsRef = useRef<Arrow[]>([]);

  // 🔹 hydrate initial data once
  useEffect(() => {
    rectanglesRef.current = [...formated_shapes_rect];
    circlesRef.current = [...formated_shapes_circle];
    pencilRef.current = [...formated_shapes_pencil];
    linesRef.current = [...formated_shapes_line];
    arrowsRef.current = [...formated_shapes_arrow];
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

     if (activated === "clear") {
        rectanglesRef.current.length = 0;
        circlesRef.current.length = 0;
        pencilRef.current.length = 0;
        linesRef.current.length = 0; 
        arrowsRef.current.length = 0;
      }

    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineWidth = 2;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      draw();
    };

    resize();
    window.addEventListener("resize", resize);

    function draw() {

      if(!canvas || !ctx) {
        return
      }
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      rectanglesRef.current.forEach(r => {
        ctx.strokeStyle = r.color;
        ctx.strokeRect(r.x, r.y, r.width, r.height);
      });

      circlesRef.current.forEach(c => {
        ctx.strokeStyle = c.color;
        ctx.beginPath();
        ctx.arc(c.x, c.y, c.radius, 0, Math.PI * 2);
        ctx.stroke();
      });

      pencilRef.current.forEach(p => {
        ctx.strokeStyle = p.color;
        ctx.beginPath();
        ctx.moveTo(p.points[0].x, p.points[0].y);
        p.points.forEach(pt => ctx.lineTo(pt.x, pt.y));
        ctx.stroke();
      });

      [...linesRef.current, ...arrowsRef.current].forEach(l => {
        ctx.strokeStyle = l.color;
        ctx.beginPath();
        ctx.moveTo(l.x1, l.y1);
        ctx.lineTo(l.x2, l.y2);
        ctx.stroke();
      });
    }

    let isDragging = false;
    let startX = 0;
    let startY = 0;
    let currentX = 0;
    let currentY = 0;

    let currentPencil: { x: number; y: number }[] = [];
    let pencilColor = randomColor();

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

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;

      const rect = canvas.getBoundingClientRect();
      currentX = e.clientX - rect.left;
      currentY = e.clientY - rect.top;

      draw();
      ctx.setLineDash([6, 4]);

      if (activated === "rect") {
        ctx.strokeRect(startX, startY, currentX - startX, currentY - startY);
      }

      if (activated === "circle") {
        ctx.beginPath();
        ctx.arc(
          startX,
          startY,
          Math.hypot(currentX - startX, currentY - startY),
          0,
          Math.PI * 2
        );
        ctx.stroke();
      }

      if (activated === "pencil") {
        currentPencil.push({ x: currentX, y: currentY });
        ctx.strokeStyle = pencilColor;
        ctx.beginPath();
        ctx.moveTo(currentPencil[0].x, currentPencil[0].y);
        currentPencil.forEach(p => ctx.lineTo(p.x, p.y));
        ctx.stroke();
      }

      if (activated === "line" || activated === "arrow") {
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(currentX, currentY);
        ctx.stroke();
      }

      ctx.setLineDash([]);
    };

    const onMouseUp = () => {
      if (!isDragging) return;
      isDragging = false;

      const send = (shape: string, payload: any) =>
        socket.send(
          JSON.stringify({
            type: "chat",
            roomID,
            shape,
            message: JSON.stringify(payload),
          })
        );

      if (activated === "rect") {
        const r: Rect = {
          x: startX,
          y: startY,
          width: currentX - startX,
          height: currentY - startY,
          color: randomColor(),
        };
        rectanglesRef.current.push(r);
        send("rect", r);
      }

      if (activated === "circle") {
        const c: Circle = {
          x: startX,
          y: startY,
          radius: Math.hypot(currentX - startX, currentY - startY),
          color: randomColor(),
        };
        circlesRef.current.push(c);
        send("circle", c);
      }

      if (activated === "pencil" && currentPencil.length > 1) {
        const p: PencilPath = {
          points: currentPencil,
          color: pencilColor,
        };
        pencilRef.current.push(p);
        send("pencil", p);
      }

      if (activated === "line" || activated === "arrow") {
        const l: Line = {
          x1: startX,
          y1: startY,
          x2: currentX,
          y2: currentY,
          color: randomColor(),
        };
        (activated === "line" ? linesRef : arrowsRef).current.push(l);
        send(activated, l);
      }

      draw();
    };

    const onSocketMessage = (event: MessageEvent) => {
      const data = JSON.parse(event.data);
      if (data.type !== "chat") return;

      const shape =
        data.shape === "clear" ? null : JSON.parse(data.message);

      if (data.shape === "rect") rectanglesRef.current.push(shape);
      if (data.shape === "circle") circlesRef.current.push(shape);
      if (data.shape === "pencil") pencilRef.current.push(shape);
      if (data.shape === "line") linesRef.current.push(shape);
      if (data.shape === "arrow") arrowsRef.current.push(shape);

      if (data.shape === "clear") {
        rectanglesRef.current.length = 0;
        circlesRef.current.length = 0;
        pencilRef.current.length = 0;
        linesRef.current.length = 0; 
        arrowsRef.current.length = 0;
      }

      draw();
    };

    socket.addEventListener("message", onSocketMessage);
    canvas.addEventListener("mousedown", onMouseDown);
    canvas.addEventListener("mousemove", onMouseMove);
    canvas.addEventListener("mouseup", onMouseUp);

    return () => {
      window.removeEventListener("resize", resize);
      socket.removeEventListener("message", onSocketMessage);
      canvas.removeEventListener("mousedown", onMouseDown);
      canvas.removeEventListener("mousemove", onMouseMove);
      canvas.removeEventListener("mouseup", onMouseUp);
    };
  }, [activated, socket, roomID]);

  return (
    <canvas
      ref={canvasRef}
      className="block cursor-crosshair"
      style={{
        backgroundColor: "#f8f9fa",
        backgroundImage:
          "radial-gradient(rgba(0,0,0,0.08) 1px, transparent 1px)",
        backgroundSize: "20px 20px",
      }}
    />
  );
}
