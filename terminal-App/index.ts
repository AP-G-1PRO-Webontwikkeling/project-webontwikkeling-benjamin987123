import * as readline from 'readline-sync';
import { Game, Developer } from "./interface";
import express, { Express, response } from 'express';
import { MongoClient, Collection, ObjectId } from 'mongodb';
import path from 'path';

const uri = "mongodb+srv://Benjamin-Brys:qolonUHPpb123456@webontwikkeling.ubmujui.mongodb.net/"
const client = new MongoClient(uri);
const app = express();
const port = 3002;
let collection: Collection<Game>;
let collection2: Collection<Developer>;
let games: Game[] = [];
let developers: Developer[] = [];

app.set("view engine", "ejs");
app.set('views', path.join(__dirname, 'views'));
app.use(express.static("public"));

main();
main2();
export {};

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
        let developers = []; // Maak een nieuwe array om de ontwikkelaarsgegevens op te slaan
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
        collection = db.collection("games");
        console.log('Verbinding is gelukt.');  
        if (((await collection.find({}).toArray()).length === 0)) {
            await fetchGames();         
            await collection.insertMany(games);        
            console.log("Gegevens zijn verplaatst naar MongoDB");
        } else {
            await showAllGames();
        }
    } catch (error) {
        console.log("fout bij main", error);
    }
    finally {
        await client.close();
        console.log('De verbinding met de database is gesloten.');
    }
}

async function main2() {
    try {
        await client.connect();
        console.log('Verbinding is gelukt.');     
        const db = client.db("project");

        collection2 = db.collection<Developer>("developers");
 
        if (((await collection2.find({}).toArray()).length === 0)) {
            await fetchDevelopers();
            await collection2.insertMany(developers)
        } else {
            await showAllDevelopers();
        }
        console.log(developers)
    } catch (error) {
        console.log("fout bij main", error);
    }
    finally {
        await client.close();
        console.log('De verbinding met de database is gesloten.');
    }
}

async function showAllGames() {
    games = await collection.find({}).toArray();
    return games;
}
async function showAllDevelopers() {
    developers = await collection2.find({}).toArray();
    return developers;
}





//index
app.get('/', async (req, res) => {
    try {  
        res.render('index', { games });
    } catch (error) {
        console.log('main page niet gelukt');
        res.status(500).send('main page niet gelukt');
    }
});
//zoekbalk
app.get('/search', async (req, res) => {
    try {
        await client.connect();
        console.log('Verbinding is gelukt.');     
        const db = client.db("project");
        const searchTerm = typeof req.query.query === 'string' ? req.query.query : '';
        let filteredGames = [];
        if (searchTerm) {
            const regex = new RegExp(searchTerm, 'i');
            const collection = client.db("project").collection<Game>("games");
            filteredGames = await collection.find({ name: { $regex: regex } }).toArray();
        } else {
            const collection = client.db("project").collection<Game>("games");
            filteredGames = await collection.find({}).toArray();
        }
        res.render('index', { games: filteredGames, searchTerm });
    } catch (error) {
        console.log('Niet gevonden.', error);
        res.status(500).send('Niet gevonden.');
    }
    finally {
        await client.close();
        console.log('De verbinding met de database is gesloten.');
    }
});


app.get('/developers', async (req, res) => { 
    try {
        const collection2 = client.db("project").collection<Developer>("developers");
        const developer = await collection2.distinct('developer.name');
        res.render('developers', { developer });
    } catch (error) {
        console.log('Ontwikkelaars niet gevonden.', error);
        res.status(500).send('Ontwikkelaars niet gevonden.');
    } finally {
        await client.close();
        console.log('De verbinding met de database is gesloten.');
    }
});




app.get('/detail/:id', async (req, res) => {
    try {
        await client.connect();        
        const db = client.db("project");
        const collection = db.collection<Game>("games");
        console.log('Verbinding is gelukt.'); 
        const id = parseInt(req.params.id);
        const game = await collection.findOne({ id: id });
        res.render('detail', { game: game });
    } catch (error) {
        console.log('Details weergeven niet gelukt.', error);
        res.status(500).send('Details weergeven niet gelukt.');
    } finally {
        await client.close();
        console.log('De verbinding met de database is gesloten.');
    }
});



app.get('/developer/:id', (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const game = collection.findOne({id: id})
        res.render('developer', { game: game });
    } catch (error) {
        console.log('Developer weergeven niet gelukt.');
        res.status(500).send('Developer weergeven niet gelukt.');
    }
    
    
    
});


//related
app.get('/relatedGenre', async (req, res) => {
    try {
        const searchTerm = req.query.genre;
        let filteredGames = [];
        if (searchTerm && typeof searchTerm === 'string') {
            filteredGames = await collection.find({ genre: searchTerm }).toArray();
        } else {
            filteredGames = await collection.find({}).toArray();
        }
        res.render('index', { games: filteredGames, searchTerm });
    } catch (error) {
        console.log('Er is een fout bij het filteren op genre.');
        res.status(500).send('Er is een fout bij het filteren op genre.');
    }
});

app.get('/relatedWorld', async (req, res) => {
    try {
        await client.connect(); // Verbinding maken met de MongoDB-client
        const db = client.db("project");
        const collection = db.collection<Game>("games");
        
        const searchTerm = req.query.gameWorld;
        let filteredGames = [];
        if (searchTerm && typeof searchTerm === 'string') {
            filteredGames = await collection.find({ gameWorld: searchTerm }).toArray();
        } else {
            filteredGames = await collection.find({}).toArray();
        }
        res.render('index', { games: filteredGames, searchTerm });
    } catch (error) {
        console.log('Er is een fout bij het filteren op spelwereld.', error);
        res.status(500).send('Er is een fout bij het filteren op spelwereld.');
    } finally {
        await client.close(); // Verbinding sluiten
        console.log('De verbinding met de database is gesloten.');
    }
});



//sorted
app.get('/nameSort', async (req, res) => {
    try {
        await client.connect(); // Verbinding maken met de MongoDB-client
        const db = client.db("project");
        const collection = db.collection<Game>("games");
        
        const games = await collection.find({}).sort({ name: 1 }).toArray();
        res.render('index', { games });
    } catch (error) {
        console.log('Fout bij het sorteren op naam.', error);
        res.status(500).send('Fout bij het sorteren op naam.');
    } finally {
        await client.close(); // Verbinding sluiten
        console.log('De verbinding met de database is gesloten.');
    }
});


app.get('/dateSort', async (req, res) => {
    try {       
        const games = await collection.find({}).sort({date: 1}).toArray();
        res.render('index', { games });
    } catch (error) {
        console.log('Fout bij het sorteren op date.');
        res.status(500).send('Fout bij het sorteren op date.');
    }
});

app.get('/metascoreSort', async (req, res) => {
    try {       
        const games = await collection.find({}).sort({metascore: 1}).toArray();
        res.render('index', { games });
    } catch (error) {
        console.log('Fout bij het sorteeren op metascore.');
        res.status(500).send('Fout bij het sorteren op metascore.');
    }
});

app.get('/genreSort', async (req, res) => {
    try {
        const games = await collection.find({}).sort({genre: 1}).toArray();
        res.render('index', {games});
    } catch (error) {
        console.log('Fout bij het sorteeren op genre.');
        res.status(500).send('Fout bij het sorteeren op genre.');
    }
});

app.get('/worldSort', async(req, res) => {
    try {
        const game = await collection.find({}).sort({world: 1}).toArray();
        res.render('index', { games});
    } catch (error) {
        console.log('Fout bij het sorteeren op world.')
        res.status(500).send('Fout bij het sorteeren op world.')
    } 
});

app.get('/thingsSort', async(req, res) => {
    try {
        const game = await collection.find({}).sort({things: 1}).toArray();
        res.render('index', {games});
    } catch (error) {
        console.log('Fout bij het sorteeren op things.');
        res.status(500).send('Fout bij het sorteeren op things.');
    }
})

app.get('/developerSort', async (req, res) => {
    try {
        const games = await collection.find({}).sort({developer: 1}).toArray;
        res.render('index', {games});
    } catch (error) {
        console.log('Fout bij het sorteeren op developer.');
        res.status(500).send('Fout bij het sorteeren op developer.');
    }
})


app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});

