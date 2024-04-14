import * as readline from 'readline-sync';
import data from "./game.json";
import { Game } from "./interface";
import express, { Express } from 'express';

const games = data;
const app = express();
const port = 3002;
const path = require('path');

app.set("view engine", "ejs");
app.set('views', path.join(__dirname, 'views'));
app.use(express.static("public"));

app.get('/', (req, res) => {      
    res.render('index', { games });
});

app.get('/detail.ejs/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const game = games.find(game => game.id === id);
    res.render('detail', { game: game });  
});

app.get('/search', (req, res) => {
    const searchTerm = req.query.query;
    let filteredGames = games;
    if (searchTerm && typeof searchTerm === 'string') {
        filteredGames = games.filter(game =>
            game.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }
    res.render('index', { games: filteredGames, searchTerm });
});

app.get('/nameSort', (req, res) => {
    let sortDirection = req.query.sortDirection || 'asc';

    if (sortDirection === 'asc') {
        games.sort((a, b) => a.name.localeCompare(b.name));
    } else {
        games.sort((a, b) => b.name.localeCompare(a.name));
    }
   
    const nextSortDirection = sortDirection === 'asc' ? 'desc' : 'asc';

    res.render('index', { games, sortDirection, nextSortDirection });
});

app.get('/dateSort', (req, res) => {
    let sortDirection = req.query.sortDirection || 'asc';

    if (sortDirection === 'asc') {
        games.sort((a, b) => a.releaseDate.localeCompare(b.releaseDate));
    } else {
        games.sort((a, b) => b.releaseDate.localeCompare(a.releaseDate));
    }
   
    const nextSortDirection = sortDirection === 'asc' ? 'desc' : 'asc';

    res.render('index', { games, sortDirection, nextSortDirection });
});

app.get('/metascoreSort', (req, res) => {
    let sortDirection = req.query.sortDirection || 'asc';

    if (sortDirection === 'asc') {
        games.sort((a, b) => a.metascore - b.metascore);
    } else {
        games.sort((a, b) => b.metascore - a.metascore);
    }
   
    const nextSortDirection = sortDirection === 'asc' ? 'desc' : 'asc';

    res.render('index', { games, sortDirection, nextSortDirection });
});

app.get('/genreSort', (req, res) => {
    let sortDirection = req.query.sortDirection || 'asc';

    if (sortDirection === 'asc') {
        games.sort((a, b) => a.genre.localeCompare(b.genre));
    } else {
        games.sort((a, b) => b.genre.localeCompare(a.genre));
    }
   
    const nextSortDirection = sortDirection === 'asc' ? 'desc' : 'asc';

    res.render('index', { games, sortDirection, nextSortDirection });
});

app.get('/worldSort', (req, res) => {
    let sortDirection = req.query.sortDirection || 'asc';

    if (sortDirection === 'asc') {
        games.sort((a, b) => a.gameWorld.localeCompare(b.gameWorld));
    } else {
        games.sort((a, b) => b.gameWorld.localeCompare(a.gameWorld));
    }
   
    const nextSortDirection = sortDirection === 'asc' ? 'desc' : 'asc';

    res.render('index', { games, sortDirection, nextSortDirection });
});

app.get('/thingsSort', (req, res) => {
    let sortDirection = req.query.sortDirection || 'asc';

    if (sortDirection === 'asc') {
        games.sort((a, b) => a.thingsToDo[0].localeCompare(b.thingsToDo[0]));
    } else {
        games.sort((a, b) => b.thingsToDo[0].localeCompare(a.thingsToDo[0]));
    }
   
    const nextSortDirection = sortDirection === 'asc' ? 'desc' : 'asc';

    res.render('index', { games, sortDirection, nextSortDirection });
});

app.get('/developerSort', (req, res) => {
    let sortDirection = req.query.sortDirection || 'asc';

    if (sortDirection === 'asc') {
        games.sort((a, b) => a.developer.name.toString().localeCompare(b.developer.name.toString()));
    } else {
        games.sort((a, b) => b.developer.name.toString().localeCompare(a.developer.name.toString()));
    }
   
    const nextSortDirection = sortDirection === 'asc' ? 'desc' : 'asc';

    res.render('index', { games, sortDirection, nextSortDirection });
});

app.get('/relatedGenre', (req, res) => {
    const searchTerm = req.query.genre;
    let filteredGames = games;
    if (searchTerm && typeof searchTerm === 'string') {
        filteredGames = games.filter(game =>
            game.genre.includes(searchTerm)
        );
    }
    res.render('index', { games: filteredGames, searchTerm });
});

app.get('/relatedWorld', (req, res) => {
    const searchTerm = req.query.gameWorld;
    let filteredGames = games;
    if (searchTerm && typeof searchTerm === 'string') {
        filteredGames = games.filter(game =>
            game.gameWorld.includes(searchTerm)
        );
    }
    res.render('index', { games: filteredGames, searchTerm });
});

app.get('/developer/:id', (req, res) => {
    const developerId = parseInt(req.params.id);
    const game = games.find(game => game.developer.id === developerId);
        res.render('developer', { game });
});

app.get('/developers', (req, res) => { 
    const devs = games.map(game => game.developer);
    res.render('developers', { devs });
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});