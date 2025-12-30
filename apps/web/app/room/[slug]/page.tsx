import axios from 'axios'
import { Chat } from '../../components/chat';

async function getRommId(slug: string) {

    const response = await axios(`http://localhost:3002/room/${slug}`
    ) ; 

    return (await response.data).roomID;
   
    


}
export default async function Chatroom(
     {params} :   {
        params:{
            slug: string
        }
     }
) { 


     const slug =  (await params).slug; 
     const roomID=  await  getRommId(slug) ;

     return  <Chat id={roomID}/>

}
    
