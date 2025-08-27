import { AuthenticatedUser } from "./User";


declare global {
    namespace Express {
        export interface Request {
            user: AuthenticatedUser;
        }
    }
}

export { }