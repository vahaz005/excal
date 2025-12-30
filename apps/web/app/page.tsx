'use client'
import { useRouter } from 'next/navigation';
import React, { useState } from 'react'

const page = () => {

  const [roomID ,  setRoomId] =useState(""); 
  const router =  useRouter();

  const  [buttondisable, setbuttondisable] = useState(true);
 
  
  return (
    <div style={{
      display : "flex" , 
      alignItems :  "center" , 

      justifyContent: "center" ,
      height:"100vh" , 
      width:"100vw"
    }}>

    <div
       style={{
        display:'flex' ,  
        justifyContent:'center'
       }}>


        <input  placeholder='roomUd..'   

        onEmptied={(e) =>  setbuttondisable(true)}
        value={roomID}  onChange={(e)=> {
          setbuttondisable(false)
          setRoomId(e.target.value)
        }}></input>
        <button 
        disabled={buttondisable}
        
        style={{
          
          paddingLeft:'2'
        }}onClick={(e) => {
          router.push(`/room/${roomID}`)
        }}> join</button>
       </div>
    
    </div>
  )
}

export default page
