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

function randomColor() {
  return `hsl(${Math.random() * 360}, 80%, 60%)`;
}

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

  const rectanglesRef = useRef<Rect[]>([...formated_shapes_rect]);
  const circlesRef = useRef<Circle[]>([...formated_shapes_circle]);
  const pencilRef = useRef<PencilPath[]>([...formated_shapes_pencil]);
  const linesRef = useRef<Line[]>([...formated_shapes_line]);
  const arrowsRef = useRef<Arrow[]>([...formated_shapes_arrow]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // CLEAR (unchanged, bas new refs add)
    if (activated === "clear") {
      rectanglesRef.current.length = 0;
      circlesRef.current.length = 0;
      pencilRef.current.length = 0;
      linesRef.current.length = 0;
      arrowsRef.current.length = 0;

      socket.send(
        JSON.stringify({
          type: "chat",
          roomID,
          shape: "clear",
          message: "clear the canvas",
        })
      );
    }

    // FULLSCREEN
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      draw();
    };
    resize();
    window.addEventListener("resize", resize);

    function draw() {

      if(!canvas ||  ! ctx){
        return
      }
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      rectanglesRef.current.forEach((r) => {
        ctx.strokeStyle = r.color;
        ctx.strokeRect(r.x, r.y, r.width, r.height);
      });

      circlesRef.current.forEach((c) => {
        ctx.strokeStyle = c.color;
        ctx.beginPath();
        ctx.arc(c.x, c.y, c.radius, 0, Math.PI * 2);
        ctx.stroke();
      });

      pencilRef.current.forEach((p) => {
        ctx.strokeStyle = p.color;
        ctx.beginPath();
        ctx.moveTo(p.points[0].x, p.points[0].y);
        p.points.forEach((pt) => ctx.lineTo(pt.x, pt.y));
        ctx.stroke();
      });

      linesRef.current.forEach((l) => {
        ctx.strokeStyle = l.color;
        ctx.beginPath();
        ctx.moveTo(l.x1, l.y1);
        ctx.lineTo(l.x2, l.y2);
        ctx.stroke();
      });

      arrowsRef.current.forEach((a) => {
        ctx.strokeStyle = a.color;
        ctx.beginPath();
        ctx.moveTo(a.x1, a.y1);
        ctx.lineTo(a.x2, a.y2);
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

      if (activated === "rect") {
        ctx.strokeRect(
          startX,
          startY,
          currentX - startX,
          currentY - startY
        );
      }

      if (activated === "circle") {
        const radius = Math.hypot(currentX - startX, currentY - startY);
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

      if (activated === "line" || activated === "arrow") {
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(currentX, currentY);
        ctx.stroke();
      }
    };

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
        socket.send(JSON.stringify({ type: "chat", roomID, shape: "rect", message: JSON.stringify(rect) }));
      }

      if (activated === "circle") {
        const circle: Circle = {
          x: startX,
          y: startY,
          radius: Math.hypot(currentX - startX, currentY - startY),
          color: randomColor(),
        };
        circlesRef.current.push(circle);
        socket.send(JSON.stringify({ type: "chat", roomID, shape: "circle", message: JSON.stringify(circle) }));
      }

      if (activated === "pencil" && currentPencil.length > 1) {
        const pencil: PencilPath = { points: currentPencil, color: pencilColor };
        pencilRef.current.push(pencil);
        socket.send(JSON.stringify({ type: "chat", roomID, shape: "pencil", message: JSON.stringify(pencil) }));
      }

      if (activated === "line") {
        const line: Line = { x1: startX, y1: startY, x2: currentX, y2: currentY, color: randomColor() };
        linesRef.current.push(line);
        socket.send(JSON.stringify({ type: "chat", roomID, shape: "line", message: JSON.stringify(line) }));
      }

      if (activated === "arrow") {
        const arrow: Arrow = { x1: startX, y1: startY, x2: currentX, y2: currentY, color: randomColor() };
        arrowsRef.current.push(arrow);
        socket.send(JSON.stringify({ type: "chat", roomID, shape: "arrow", message: JSON.stringify(arrow) }));
      }

      draw();
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type !== "chat") return;

      const shape = data.shape === "clear" ? null : JSON.parse(data.message);

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
