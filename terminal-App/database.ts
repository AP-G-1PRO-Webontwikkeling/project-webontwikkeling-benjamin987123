import dotenv from "dotenv";
import { Admin, MongoClient } from "mongodb";
import { User } from "./types";
import bcrypt from "bcrypt";
import { Developer, Game } from "./interface";

dotenv.config();

export const MONGODB_URI = process.env.MONGODB_URI ?? "mongodb://localhost:27017";
export const client = new MongoClient(MONGODB_URI);
export const collection1 = client.db("project").collection<Game>("games");
export const collection2 = client.db("project").collection<Developer>("developers");
export const userCollection = client.db("project").collection<User>("profiels");

const saltRounds : number = 10;

export async function connect() {
    await client.connect();
    await createAdmin();
    await createUser();
    console.log("Connected to database");
    process.on("SIGINT", exit);
}
async function exit() {
    try {
        await client.close();
        console.log("Disconnected from database");
    } catch (error) {
        console.error(error);
    }
    process.exit(0);
}


async function createAdmin() {
    if (await userCollection.countDocuments() > 0) {
        return;
    }
    let name : string | undefined = process.env.ADMIN_NAME;
    let password : string | undefined = process.env.ADMIN_PASSWORD;
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

async function fetchGames() {
    try {
        const respons = await fetch('https://raw.githubusercontent.com/AP-G-1PRO-Webontwikkeling/project-webontwikkeling-benjamin987123/main/terminal-App/game.json', {
            method: "GET"
        });
        if (!respons.ok) {
            throw new Error("API fetch error");
        }
        let data: any = await respons.json();
        let games: Game[] = [];
        for (let i = 0; i < data.length; i++) {
            const element = data[i];
            games.push({
                id: element.id,          
                name: element.name,
                description: element.description,
                metascore: element.metascore,
                mostePopular: element.mostePopular,
                releaseDate: element.releaseDate,
                imageUrl: element.imageUrl,
                genre: element.genre,
                thingsToDo: element.thingsToDo,
                gameWorld: element.gameWorld,
                gameYear: element.gameYear,
                developer: element.developer            
            })           
        }
        return games;
    } catch (error) {
        console.log(error, "internal error")
        return[];
    }
}
async function fetchDevelopers() {
    try {
        const response = await fetch('https://raw.githubusercontent.com/AP-G-1PRO-Webontwikkeling/project-webontwikkeling-benjamin987123/main/terminal-App/developer.json', {
            method: "GET"
        });
        if (!response.ok) {
            throw new Error("API fetch error");
        }
        let data: any = await response.json();
        let developers: Developer[] = [];
        for (let i = 0; i < data.length; i++) {
            const element = data[i];
            developers.push({
                id: element.id,
                name: element.name,
                country: element.country,
                foundingYear: element.foundingYear
            });
        }
        return developers;
    } catch (error) {
        console.log(error, "internal error");
        return [];
    }
}
async function main() {
    try {
        if ((await collection1.countDocuments()) === 0) {
            const games = await fetchGames();
            await collection1.insertMany(games);
        }
        if ((await collection2.countDocuments()) === 0) {
            const developers = await fetchDevelopers();
            await collection2.insertMany(developers);    
        }
    } catch (error) {
        console.log("fout bij main", error);
    }
}

main();