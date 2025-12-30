import axios from  'axios';
import { ChatRoomClient } from './chatClient';


type  message = {
    id: number;
    message: string;
    userId: string;
    roomID: number;
}
async  function getChats (roomID : string):Promise<message[]> {
 
    const response = await axios.get(`http://localhost:3002/chats/${roomID}`) ;
    return  response.data.messages; 
}
export async  function Chat({id}:{
    id: string
}) {


const  chats = await getChats(id);
console.log(chats)
 return <ChatRoomClient id={id}  messages={chats}/>


}