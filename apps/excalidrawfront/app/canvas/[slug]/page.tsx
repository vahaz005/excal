import { BACKEND_URL } from "@/app/config/url";
import CanvaRoom from "@/components/Canvaroom";
import axios from "axios";
import { Loader2 } from "lucide-react";
import { cookies } from "next/headers";
enum Shape {
    circle , 
    rect ,  
    pencil
}

type Message = {
  id: number;
  message: string;
  userId: string;
  roomID: number;
  Shape: "circle" | "rect" | "pencil" | "clear" | "line" | "arrow"
};

async function getroomId(slug: string) {
  const response = await axios.get(`${BACKEND_URL}/room/${slug}`);
  return response.data.roomID;
}

async function getALLshapes(roomID: string): Promise<Message[]> {
  const response = await axios.get(`${BACKEND_URL}/chats/${roomID}`);
  return response.data.messages;
}

export default async function canvas_slug({
  params,
}: {
  params: { slug: string };
}) {
  const slug_name =  (await params).slug;
  const roomID = await getroomId(slug_name);
  const token  =  (await cookies()).get("auth-token")?.value
   // this is  must and  important to remember ok 

  console.log(token)

  const shapes = await getALLshapes(roomID);
  console.log(shapes)

  // ✅ RECTANGLES
  const formatted_shapes_rect = shapes
    .filter((m) => m.Shape === "rect")
    .map((m) => JSON.parse(m.message));

  // ✅ CIRCLES
  const formatted_shapes_circle = shapes
    .filter((m) => m.Shape === "circle")
    .map((m) => JSON.parse(m.message));

  // ✅ PENCIL
  const formatted_shapes_pencil = shapes
    .filter((m) => m.Shape === "pencil")
    .map((m) => JSON.parse(m.message));

    const formatted_shapes_line = shapes.filter(s => s.Shape === "line").map(s => JSON.parse(s.message));
  const formatted_shapes_arrow = shapes.filter(s => s.Shape === "arrow").map(s => JSON.parse(s.message));


console.log(formatted_shapes_rect) 
console.log(formatted_shapes_circle)

if(!token) {
   return <>
   <div className="w-screen  max-h-screen mx-auto  justify-center  items-center" >
    <Loader2/>
   </div>
   </>
}
  return (

    
    <CanvaRoom
      roomID={roomID}
      formated_shapes_rect={formatted_shapes_rect}
      formated_shapes_circle={formatted_shapes_circle}
      formated_shapes_pencil={formatted_shapes_pencil}
      formated_shapes_arrow={formatted_shapes_arrow} 
      formated_shapes_line={formatted_shapes_line}
      token= {token}
    />
  );
}
