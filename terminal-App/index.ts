import * as readline from 'readline-sync';
import { Game, Developer, Profiel } from "./interface";
import express, { Express, response, NextFunction } from 'express';
import { MongoClient, Collection, ObjectId } from 'mongodb';
import { secureMiddleware } from "./middleware/secureMiddleware";
import { connect } from "./database";
import path from 'path';
import bcrypt from 'bcrypt';
import session from "./session";
import dotenv from "dotenv";
import { loginRouter } from "./routes/loginRouter";
import { homeRouter } from "./routes/homeRouter";
import {User} from './types'
import { login } from "./database";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;
const uri = process.env.MONGODB_URI!;
const client = new MongoClient(uri);
const saltRounds: number = Number(process.env.SALT_ROUNDS!);

let collection1: Collection<Game>;
let collection2: Collection<Developer>;
let userCollection: Collection<Profiel>;
let developers: Developer[] = [];
let games: Game[] = [];
let profiels: Profiel[] = []; 
let filteredGames: Game[] = [];

app.set("port", process.env.PORT || 3000);
app.set("view engine", "ejs");
app.set('views', path.join(__dirname, 'views'));

app.use(express.static("public"));
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended:true}))
app.use(session);
app.use(loginRouter());
app.use(homeRouter());

app.use((req, res, next) => {
    console.log("Session data:", req.session);
    next();
});



//API games
async function fetchGames() {
    try {
        const respons = await fetch('https://raw.githubusercontent.com/AP-G-1PRO-Webontwikkeling/project-webontwikkeling-benjamin987123/main/terminal-App/game.json', {
            method: "GET"
        });
        if (!respons.ok) {
            throw new Error("API fetch error");
        }
        let data: any = await respons.json();
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
                developer: element.id             
            })           
        }
        return games;
    } catch (error) {
        console.log(error, "internal error")
    }
}
//API developers
async function fetchDevelopers() {
    try {
        const response = await fetch('https://raw.githubusercontent.com/AP-G-1PRO-Webontwikkeling/project-webontwikkeling-benjamin987123/main/terminal-App/developer.json', {
            method: "GET"
        });
        if (!response.ok) {
            throw new Error("API fetch error");
        }
        let data: any = await response.json();
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
        await client.connect();
        const db = client.db("project");
        collection1 = db.collection("games");
        collection2 = db.collection("developers");
        userCollection = db.collection("profiels");
        console.log('Verbinding tot stand gebracht.'); 

        if ((await collection1.countDocuments()) === 0) {
            await fetchGames();
            await collection1.insertMany(games);
        }
        if ((await collection2.countDocuments()) === 0) {
            await fetchDevelopers();
            await collection2.insertMany(developers);    
        }

        await showAllGames();
        await showAllDevelopers(collection2);

    } catch (error) {
        console.log("fout bij main", error);
    }
    finally {
        await client.close();
        console.log('De verbinding met de database is gesloten.');
    }
}
async function showAllGames() {
    games = await collection1.find({}).toArray();
    return games;
}
async function showAllDevelopers(collection2: Collection<Developer>) {
    developers = await collection2.find({}).toArray();
    return developers; 
}



/* <% if (admin === "ADMIN") { %><a href="/edit">Edit</a><% } %> */


//games
app.get('/games', secureMiddleware, async (req, res) => {
    try {  
        const admin = req.headers.role;
        res.render('games', { games, admin });
    } catch (error) {
        console.log('main page niet gelukt');
        res.status(500).send('main page niet gelukt');
    }
});
//developers
app.get('/developers', secureMiddleware, async (req, res) => { 
    try {
        res.render('developers', { devs: developers });
    } catch (error) {
        console.log('Ontwikkelaars niet gevonden.', error);
        res.status(500).send('Ontwikkelaars niet gevonden.');
}});
//zoekbalk
app.get('/search', secureMiddleware, async (req, res) => {
    try {
        await client.connect();
        console.log('Verbinding is gelukt.');     
        const db = client.db("project");
        const searchTerm = typeof req.query.query === 'string' ? req.query.query : '';
        if (searchTerm) {
            const regex = new RegExp(searchTerm, 'i');
            const collection = client.db("project").collection<Game>("games");
            filteredGames = await collection.find({ name: { $regex: regex } }).toArray();
        } else {
            const collection = client.db("project").collection<Game>("games");
            filteredGames = await collection.find({}).toArray();
        }
        res.render('games', { games: filteredGames, searchTerm });
    } catch (error) {
        console.log('Niet gevonden.', error);
        res.status(500).send('Niet gevonden.');
    }
    finally {
        await client.close();
        console.log('De verbinding met de database is gesloten.');
    }
});


//details
app.get('/game/:id', secureMiddleware, async (req, res) => {
    try {    
        await client.connect();
        let id = parseInt(req.params.id);
        const game = await collection1.findOne({ id: id });
        res.render('game', { game });
    } catch (error) {
        console.log('Details weergeven niet gelukt.', error);
        res.status(500).send('Details weergeven niet gelukt.');
    } finally {
        await client.close();
        console.log('De verbinding met de database is gesloten.');
    }
});
app.get('/developer/:id', secureMiddleware, async (req, res) => {
    try {
        await client.connect();
        const id = parseInt(req.params.id);
        const developer = await collection2.findOne({id: id})
        res.render('developer', { dev: developer });
    } catch (error) {
        console.log('Developer weergeven niet gelukt.');
        res.status(500).send('Developer weergeven niet gelukt.');
    } finally {
        await client.close();
        console.log('De verbinding met de database is gesloten.');
    }
});


//related
app.get('/relatedGenre', secureMiddleware, async (req, res) => {
    try {
        const search = req.query.genre;
        let genreFilter: Game[] = [];
        genreFilter = games.filter(game => game.genre === search)
        res.render('games', { games: genreFilter, search });
    } catch (error) {
        console.log('Er is een fout bij het filteren op genre.', error);
        res.status(500).send('Er is een fout bij het filteren op genre.');
    }
});
app.get('/relatedWorld', secureMiddleware, async (req, res) => {
    try {
        let search = req.query.gameWorld;
        let worldFilter: Game[] = [];
        worldFilter = games.filter(game => game.gameWorld === search)
        res.render('games', { games: worldFilter, search });
    } catch (error) {
        console.log('Er is een fout bij het filteren op spelwereld.', error);
        res.status(500).send('Er is een fout bij het filteren op spelwereld.');
    }
});


//sorted
app.get('/sortName', secureMiddleware, async (req, res) => {
    try {
        await client.connect(); 
        const db = client.db("project");
        const collection = db.collection<Game>("games");
        if (filteredGames.length === 0) {
            const games = await collection.find({}).sort({ name: 1 }).toArray();
            res.render('games', { games }); 
        } else {
            filteredGames = filteredGames.sort((a, b) => a.name.localeCompare(b.name));
            res.render('games', { games: filteredGames }); 
            
        }
    } catch (error) {
        console.log('Fout bij het sorteren op naam.', error);
        res.status(500).send('Fout bij het sorteren op naam.');
    } finally {
        await client.close();
        console.log('De verbinding met de database is gesloten.');
    }
});
app.get('/sortDate', secureMiddleware, async (req, res) => {
    try {
        await client.connect(); 
        const db = client.db("project");
        const collection = db.collection<Game>("games");
        if (filteredGames.length === 0) {
            const games = await collection.find({}).sort({ releaseDate: 1 }).toArray();
            res.render('games', { games }); 
        } else {
            filteredGames = filteredGames.sort((a, b) => a.releaseDate.localeCompare(b.releaseDate));
            res.render('games', { games: filteredGames }); 
        }
    } catch (error) {
        console.log('Fout bij het sorteren op naam.', error);
        res.status(500).send('Fout bij het sorteren op naam.');
    } finally {
        await client.close();
        console.log('De verbinding met de database is gesloten.');
    }
});
app.get('/sortMeta', secureMiddleware, async (req, res) => {
    try {
        await client.connect(); 
        const db = client.db("project");
        const collection = db.collection<Game>("games");
        if (filteredGames.length === 0) {
            const games = await collection.find({}).sort({ metascore: 1 }).toArray();
            res.render('games', { games }); 
        } else {
            filteredGames = filteredGames.sort((a, b) => a.metascore - (b.metascore));
            res.render('games', { games: filteredGames }); 
        }
    } catch (error) {
        console.log('Fout bij het sorteren op naam.', error);
        res.status(500).send('Fout bij het sorteren op naam.');
    } finally {
        await client.close();
        console.log('De verbinding met de database is gesloten.');
    }
});
app.get('/sortGenre', secureMiddleware, async (req, res) => {
    try {
        await client.connect(); 
        const db = client.db("project");
        const collection = db.collection<Game>("games");
        if (filteredGames.length === 0) {
            const games = await collection.find({}).sort({ genre: 1 }).toArray();
            res.render('games', { games }); 
        } else {
            filteredGames = filteredGames.sort((a, b) => a.genre.localeCompare(b.genre));
            res.render('games', { games: filteredGames }); 
        }
    } catch (error) {
        console.log('Fout bij het sorteren op naam.', error);
        res.status(500).send('Fout bij het sorteren op naam.');
    } finally {
        await client.close();
        console.log('De verbinding met de database is gesloten.');
    }
});
app.get('/sortWorld', secureMiddleware, async (req, res) => {
    try {
        await client.connect(); 
        const db = client.db("project");
        const collection = db.collection<Game>("games");
        if (filteredGames.length === 0) {
            const games = await collection.find({}).sort({ gameworld: 1 }).toArray();
            res.render('games', { games }); 
        } else {
            filteredGames = filteredGames.sort((a, b) => a.gameWorld.localeCompare(b.gameWorld));
            res.render('games', { games: filteredGames }); 
        }
    } catch (error) {
        console.log('Fout bij het sorteren op naam.', error);
        res.status(500).send('Fout bij het sorteren op naam.');
    } finally {
        await client.close();
        console.log('De verbinding met de database is gesloten.');
    }
});
app.get('/sortAct', secureMiddleware, async (req, res) => {
    try {
        await client.connect(); 
        const db = client.db("project");
        const collection = db.collection<Game>("games");
        if (filteredGames.length === 0) {
            const games = await collection.find({}).sort({ thingstodo: 1 }).toArray();
            res.render('games', { games }); 
        } else {
            filteredGames = filteredGames.sort((a, b) => a.thingsToDo.length - (b.thingsToDo.length));
            res.render('games', { games: filteredGames }); 
        }
    } catch (error) {
        console.log('Fout bij het sorteren op naam.', error);
        res.status(500).send('Fout bij het sorteren op naam.');
    } finally {
        await client.close();
        console.log('De verbinding met de database is gesloten.');
    }
});
app.get('/sortDev', secureMiddleware, async (req, res) => {
    try {
        await client.connect(); 
        const db = client.db("project");
        const collection = db.collection<Game>("games");
        if (filteredGames.length === 0) {
            const games = await collection.find({}).sort({ devloper: 1 }).toArray();
            res.render('games', { games }); 
        } else {
            filteredGames = filteredGames.sort((a, b) => a.developer - (b.developer));
            res.render('games', { games: filteredGames }); 
        }
    } catch (error) {
        console.log('Fout bij het sorteren op naam.', error);
        res.status(500).send('Fout bij het sorteren op naam.');
    } finally {
        await client.close();
        console.log('De verbinding met de database is gesloten.');
    }
});


app.listen(app.get("port"), async() => {
    try {
        await connect();
        console.log("Server started on http://localhost:" + app.get('port'));
    } catch (e) {
        console.log(e);
        process.exit(1); 
    }
});

main();
export {}