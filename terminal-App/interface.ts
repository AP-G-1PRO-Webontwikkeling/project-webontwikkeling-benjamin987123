export interface Developer {
    id: number;
    name: string;
    country: string;
    foundingYear: number;
}

export interface Game {
    id: number;
    name: string;
    description: string;
    metascore: number;
    mostePopular: boolean;
    releaseDate: string;
    imageUrl: string;
    genre: string;
    thingsToDo: string[];
    gameWorld: string;
    gameYear: number;
    developer: number;
}