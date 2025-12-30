import {JwtPayload} from "jsonwebtoken";
declare module "jsonwebtoken" {
    interface JwtPayload {
        userID?:string
    } 
} 