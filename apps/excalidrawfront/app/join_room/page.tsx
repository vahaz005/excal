"use client";

import { useRouter } from "next/navigation";
import React, { useState } from "react";

const Page = () => {
  const [roomID, setRoomId] = useState("");
  const router = useRouter();

  const isDisabled = roomID.trim().length === 0;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        width: "100vw",
      }}
    >
      <div className="flex items-center space-x-5 p-2">
        <input
          className="border border-amber-800 p-1 rounded-sm"
          placeholder="roomId.."
          value={roomID}
          onChange={(e) => setRoomId(e.target.value)}
        />

        <button
          disabled={isDisabled}
          className={`rounded-md text-white p-1 w-16 ${
            isDisabled ? "bg-gray-400" : "bg-black"
          }`}
          onClick={() => router.push(`/canvas/${roomID}`)}
        >
          Join
        </button>
      </div>
    </div>
  );
};

export default Page;
