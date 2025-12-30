import { NextFunction ,Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken"
import { JWT_SECRET } from "@repo/backend_common/config";

export async function middelware(req :  Request, res  :   Response , next :  NextFunction) {

   console.log('hello')
    const token  = req.headers["authorization"] ?? "" ;
    console.log(token)
 const decoder = jwt.verify(token ,  JWT_SECRET) as JwtPayload; 

 console.log("decoder "  ,decoder)
 if(decoder.userID) {
    req.userID = decoder.userID;
    next();
 } else {
    res.json("unauthorized").status(403); 
 }

    
}