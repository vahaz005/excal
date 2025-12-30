'use client'
import { useEffect, useState } from "react"

export function useSocket() {
    const [loading, setLoading] = useState(true);
    const [socket, setSocket] = useState<WebSocket>();

    useEffect(() => {
        const ws = new WebSocket(`http://localhost:3001/?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySUQiOiJhYTNlODM5Yi04MGY5LTRhMWMtOGVhNS02ZTljMTc1YmFiMDgiLCJpYXQiOjE3NjY4MzE2ODIsImV4cCI6MTc2NzQzNjQ4Mn0.dR8eRS1TBqZTG1l6hfJ_TL1zey1e-oWrDH6_bPqMxwY`);
        console.log(ws)
        ws.onopen = () => {
            setLoading(false);
            setSocket(ws);
        }
    }, []);

    return {
        socket,
        loading
    }

}