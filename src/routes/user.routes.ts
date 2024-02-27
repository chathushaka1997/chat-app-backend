import {Router} from "express";
import UserControllers from "../controllers/user.controllers";


const router = Router()


//define routes
router.get('/example',UserControllers.CreateUser)

export default router