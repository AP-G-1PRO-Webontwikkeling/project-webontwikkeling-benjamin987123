import { NextFunction, Request, Response } from "express";
import { User } from "../types";

export function secureMiddleware(req: Request, res: Response, next: NextFunction) {
    if (req.session.user) {
        res.locals.user = req.session.user;
        next();
    } else {
        res.redirect("../login");
    }
};