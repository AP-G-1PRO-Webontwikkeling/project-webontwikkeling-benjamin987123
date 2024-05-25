import express from 'express';
import { User } from "../types";
import { login } from "../database";
import { secureMiddleware } from "../middleware/secureMiddleware";

export function loginRouter() {
    const router = express.Router();

    router.get("/login", async (req, res) => {
        if (req.session) {
            console.log("render games");
            res.redirect("../games");
        } else {
            res.render("../login");
        }
    });

    router.post("/login", async (req, res) => {
        const name: string = req.body.name;
        const password: string = req.body.password;
        try {
            let user: User = await login(name, password);
            delete user.password;
            req.session.user = user;
            res.redirect("../games")
        } catch (e: any) {
            res.redirect("../login");
        }
    });

    router.post("/logout", secureMiddleware, async (req, res) => {
        req.session.destroy((err) => {
            res.redirect("../login");
        });
    });

    return router;
}