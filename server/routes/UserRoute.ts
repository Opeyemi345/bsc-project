import { Router } from "express";
import { createAccount, getAllUser, getUserById } from "../controllers/userAccount.ts";

const userRoute = Router();

userRoute.get('', getAllUser)
userRoute.get('/:id', getUserById)
// userRoute.post('register', createAccount)
// userRoute.put('profile')
// userRoute.post(':id')

export default userRoute;