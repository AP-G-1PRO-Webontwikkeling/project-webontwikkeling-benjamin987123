import dotenv from "dotenv";
dotenv.config();
import { Admin, MongoClient } from "mongodb";
import { User } from "./types";
import bcrypt from "bcrypt";


export const MONGODB_URI = process.env.MONGODB_URI ?? "mongodb://localhost:27017";

export const client = new MongoClient(MONGODB_URI);

export const userCollection = client.db("project").collection<User>("profiel");

const saltRounds : number = 10;

async function exit() {
    try {
        await client.close();
        console.log("Disconnected from database");
    } catch (error) {
        console.error(error);
    }
    process.exit(0);
}

export async function connect() {
    await client.connect();
    await createAdmin();
    await createUser();
    console.log("Connected to database");
    process.on("SIGINT", exit);
}

async function createAdmin() {
    if (await userCollection.countDocuments() > 0) {
        return;
    }
    let name : string | undefined = "admin";
    let password : string | undefined = "adminPW"
    if (name === undefined || password === undefined) {
        throw new Error("ADMIN_NAME and ADMIN_PASSWORD must be set in environment");
    }
    await userCollection.insertOne({
        name: name,
        password: await bcrypt.hash(password, saltRounds),
        role: "ADMIN"
    });
}

async function createUser() {
    if (await userCollection.countDocuments() > 1) {
        return;
    }
    let name : string | undefined = "user";
    let password : string | undefined = "userPW"
    if (name === undefined || password === undefined) {
        throw new Error("USER_NAME and USER_PASSWORD must be set in environment");
    }
    await userCollection.insertOne({
        name: name,
        password: await bcrypt.hash(password, saltRounds),
        role: "USER"
    });
}

export async function login(name: string, password: string) {
    if (name === "" || password === "") {
        throw new Error("Name and password required");
    }
    let user : User | null = await userCollection.findOne<User>({name: name});
    if (user) {
        if (await bcrypt.compare(password, user.password!)) {
            return user;
        } else {
            throw new Error("Password incorrect");
        }
    } else {
        throw new Error("User not found");
    }
}