import * as readline from 'readline-sync';
import express, { Express, response, NextFunction } from 'express';
import { secureMiddleware } from "./middleware/secureMiddleware";
import { connect } from "./database";
import path from 'path';
import session from "./session";
import dotenv from "dotenv";
import { loginRouter } from "./routes/loginRouter";
import { homeRouter } from "./routes/homeRouter";
import { collection1, collection2 } from "./database";

dotenv.config();

const app = express();

app.set("port", process.env.PORT || 3000);
app.set("view engine", "ejs");
app.set('views', path.join(__dirname, 'views'));

app.use(express.static("public"));
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended:true}))
app.use(session);
app.use(loginRouter());
app.use(homeRouter());
app.use(secureMiddleware);


app.get('/games', secureMiddleware, async (req, res) => {
    try {  
        const search = req.query.search;
        const filterGenre = req.query.genre;
        const filterWorld = req.query.world;     
        const admin = req.session.user?.role
        const sorted: any = req.query.sorted; 
        const order = req.query.order === 'desc' ? -1 : 1;
        let games;

        if (search) {
            const regex = new RegExp(String(search), 'i');
            games = await collection1.find({ name: { $regex: regex } }).toArray();
        } else if (filterGenre) {
            games = await collection1.find({genre: filterGenre}).sort({[sorted]: order}).toArray();
        } else if (filterWorld) {
            games = await collection1.find({gameWorld: filterWorld}).sort({[sorted]: order}).toArray();
        } else if (sorted) {
            games = await collection1.find({}).sort({[sorted]: order}).toArray();   
        } else {
            games = await collection1.find({}).toArray();
        }

        res.render('games', { games, admin });
    } catch (error) {
        console.log('Main page kon niet geladen worden.');
        res.status(500).send('Main page kon niet geladen worden.');
    }
});
app.get('/developers', secureMiddleware, async (req, res) => { 
    try {
        const developers = await collection2.find({}).toArray();
        res.render('developers', { devs: developers });
    } catch (error) {
        console.log('Er was een probleem.', error);
        res.status(500).send('Er was een probleem.');
}});
app.get('/game/:id', secureMiddleware, async (req, res) => {
    try {    
        let id = parseInt(req.params.id);
        const game = await collection1.findOne({ id: id });
        res.render('game', { game });
    } catch (error) {
        console.log('Details game weergeven niet gelukt.', error);
        res.status(500).send('Details game weergeven niet gelukt.');
    }
});
app.get('/developer/:id', secureMiddleware, async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const developer = await collection2.findOne({id: id})
        res.render('developer', { dev: developer });
    } catch (error) {
        console.log('Details developer weergeven niet gelukt.');
        res.status(500).send('Details developer weergeven niet gelukt.');
    }
});
app.post('/search', secureMiddleware, async (req, res) => {
    const search = req.body.query;
    res.redirect(`/games?search=${search}`)
});
app.get('/edit/:name', secureMiddleware, async (req, res) => {
    try {
        const name = req.params.name;
        res.render("edit", {name})
    } catch (error) {
        res.status(500).send('Error displaying edit page for game.');
    }
});
app.post('/edit/:name', secureMiddleware, async (req, res) => {
    const name = req.params.name;
    const { imageUrl, metascore, genre, releaseDate, gameWorld, gameYear, developer } = req.body;
    try {
        if (imageUrl) {
            await collection1.updateOne({name: name}, { $set: {imageUrl: imageUrl}});
        }
        if (metascore) {
            await collection1.updateOne({name: name}, { $set: {metascore: metascore}});
        }
        if (genre) {
            await collection1.updateOne({name: name}, { $set: {genre: genre}});
        }
        if (releaseDate) {
            await collection1.updateOne({name: name}, { $set: {releaseDate: releaseDate}});
        }
        if (gameWorld) {
            await collection1.updateOne({name: name}, { $set: {gameWorld: gameWorld}});
        }
        if (gameYear) {
            await collection1.updateOne({name: name}, { $set: {gameYear: gameYear}});
        }
        if (developer) {
            await collection1.updateOne({name: name}, { $set: {developer: developer}});
        }
        res.redirect('/games')
        console.log(`${name} aangepast.`)
    } catch (error) {
        console.log("Error bij het aanpassen in de database.")
        res.status(500).send('Error bij het aanpassen in de database.');
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


export {}



