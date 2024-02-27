import { Request, Response } from "express";
import UserServices from "../services/user.services";

namespace UserControllers {
    export const CreateUser = (req:Request,res:Response)=>{
        UserServices.CreateUser()
        res.send({message:"OK"})
    }
}

export default UserControllers