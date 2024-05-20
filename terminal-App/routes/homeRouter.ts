import express from "express";
import bcrypt from "bcrypt";
import { User } from "../types";
import { client, userCollection } from '../database';

export function homeRouter() {
    const router = express.Router();

    router.get("/", async(req, res) => {
        res.render("register");
    });

    router.post("register", async(req, res) => {
        try {
            const name = req.body.name;
            const pasw = req.body.password;
            await client.connect();        
            await userCollection.findOne(name);
            if (!name) {
                const hash = await bcrypt.hash(pasw, 10)
                await userCollection.insertOne({name: name, password: hash, role: "USER"})
                res.redirect("../views/login")
            } else {
                res.redirect("../views/register")
            }
        } catch (error) {
            res.status(500).send("Internal Server Error");
        } finally {
            await client.close();
        }
    })

    return router;
}