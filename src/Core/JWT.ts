import * as jwt from "jsonwebtoken";
import { JWTKey } from './Config';

export function encode(): string {
    const timestamp = new Date().getTime().toString(10);

    return jwt.sign(timestamp, JWTKey);
}
