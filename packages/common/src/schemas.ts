import {email, z} from "zod" ;
export const CreateUserSchema =  z.object({
    email :  z.string() , 
    password : z.string(), 
    name :  z.string()

})

export const SigninSchema =  z.object({
    email :  z.string() , 
    password : z.string(), 
   

})

export const createRoomSchema =  z.object({
    roomname : z.string().min(3).max(40)
})






