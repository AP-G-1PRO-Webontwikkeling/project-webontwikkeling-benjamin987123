import express from 'express';
import { User } from "../types";
import { login } from "../database";
import { secureMiddleware } from "../middleware/secureMiddleware";


const app = express();


import path from 'path';
app.set("port", process.env.PORT || 3000);
app.set("view engine", "ejs");
app.set('views', path.join(__dirname, 'views'));

app.use(express.static("public"));
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended:true}))
app.use(loginRouter());

app.use(secureMiddleware);








export function loginRouter() {
    const router = express.Router();

    router.get("/login", async (req, res) => {
        if (req.session.user) {
            console.log("render games");
            res.redirect("/games");
        } else {
            res.render("login");
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