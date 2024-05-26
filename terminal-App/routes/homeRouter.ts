import express from "express";
import bcrypt from "bcrypt";
import { User } from "../types";
import { userCollection } from '../database';



const saltRounds: number = Number(process.env.SALT_ROUNDS);

export function homeRouter() {
    const router = express.Router();

    router.get("/", async(req, res) => {
        res.render("register");
    });

    router.post("/register", async(req, res) => {
        try {
            const name = req.body.name;
            const pasw = req.body.password;
            const newUser = await userCollection.findOne({name: name});
            if (!newUser) {
                const hash = await bcrypt.hash(pasw, saltRounds)
                const user: User = { name: name, password: hash, role: "USER" };
                await userCollection.insertOne(user);
                res.redirect("../login")
            } else {
                res.redirect("../register")
            }
        } catch (error) {
            res.status(500).send("Internal Server Error");
        }
    })

    return router;
}