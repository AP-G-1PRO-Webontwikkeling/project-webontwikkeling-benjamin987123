import * as readline from 'readline-sync';
import data from "./game.json";
import { Game } from "./interface";

const games: Game[] = data;
let option:number = 0;

function select() {
    do {
        let options: string[] = ["View all data", "Filter by ID", "Exit"];
        option = readline.keyInSelect(options, "Please enter your choice:")+1;
        if (option > 3 || option < 1 ) {
            console.log("Verkeerde keuze kies 1,2 of 3");
        } 
    } while (option > 3 || option < 1);
}

console.log("Welcom to the JSON data viewer");
select();

do {
    if (option === 1) {
        for (let i = 0; i < games.length; i++) {
            console.log(`
            ID: ${games[i].id}, 
            GAME: ${games[i].name}, 
            beschrijving ${games[i].description}, 
            metascore: ${games[i].metascore}, 
            meest populairste: ${games[i].mostePopular}, 
            release jaar: ${games[i].releaseDate}, 
            afbeelding url:  ${games[i].imageUrl}, 
            genre: ${games[i].genre}, 
            dingen die je kan doen: ${games[i].thingsToDo}, 
            situering game wereld: ${games[i].gameWorld}, 
            het jaar waar in het spel zich afspeeld: ${games[i].gameYear}, 
            developer id: ${games[i].developer.id}, 
            developer naam: ${games[i].developer.name}, 
            land waar het spel is developt: ${games[i].developer.country}, 
            jaar waarin developer team is opgericht: ${games[i].developer.foundingYear}`);
        }
    }
    select();
    if (option === 2) {
        let idFilter: number = readline.questionInt("Pleas enter the ID you want to filter by: ");
        console.log(`
        ID: ${games[idFilter].id}, 
        GAME: ${games[idFilter].name}, 
        beschrijving ${games[idFilter].description}, 
        metascore: ${games[idFilter].metascore}, 
        meest populairste: ${games[idFilter].mostePopular}, 
        release jaar: ${games[idFilter].releaseDate}, 
        afbeelding url:  ${games[idFilter].imageUrl}, 
        genre: ${games[idFilter].genre}, 
        dingen die je kan doen: ${games[idFilter].thingsToDo}, 
        situering game wereld: ${games[idFilter].gameWorld}, 
        het jaar waar in het spel zich afspeeld: ${games[idFilter].gameYear}, 
        developer id: ${games[idFilter].developer.id}, 
        developer naam: ${games[idFilter].developer.name}, 
        land waar het spel is developt: ${games[idFilter].developer.country}, 
        jaar waarin developer team is opgericht: ${games[idFilter].developer.foundingYear}`);
    }
    select();
} while (option !== 3)