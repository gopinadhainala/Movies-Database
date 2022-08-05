const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const instance = express();
instance.use(express.json());

let dbObject = null;

const dbPath = path.join(__dirname, "moviesData.db");
const connectDbAndStartServer = async () => {
  try {
    dbObject = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    instance.listen(3000, (request, response) => {
      console.log("Server Running at http://localhost:3000");
    });
  } catch (error) {
    console.log(`DB Error : ${error.message}`);
  }
};
connectDbAndStartServer();

const convertMovieDbObjToResonseObj = (eachObject) => {
  return {
    movieId: eachObject.movie_id,
    directorId: eachObject.director_id,
    movieName: eachObject.movie_name,
    leadActor: eachObject.lead_actor,
  };
};

const convertDirectorObjToResponseObj = (directorObj) => {
  return {
    directorId: directorObj.director_id,
    directorName: director_name,
  };
};

instance.get("/movies/", async (request, response) => {
  const moviesQuery = `SELECT * FROM movie;`;
  const dbArray = await dbObject.all(moviesQuery);
  response.send(
    dbArray.map((eachObject) => ({
      movieName: eachObject.movie_name;
    }))
  );
});

instance.post("/movies/", async (request, response) => {
  const movieDetails = request.body;
  const { directorId, movieName, leadActor } = movieDetails;
  const movieQuery = `INSERT INTO movie (director_id,movie_name,lead_actor) VALUES 
    (${directorId},"${movieName}","${leadActor}");`;
  const promiseObj = await dbObject.run(movieQuery);
  const moviesId = promiseObj.lastID;
  response.send("Movie Successfully Added");
});

instance.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const getMovieQuery = `
    SELECT 
      *
    FROM 
      movie 
    WHERE 
      movie_id = ${movieId};`;
  const movie = await dbObject.get(getMovieQuery);
  response.send(convertMovieDbObjToResonseObj(movie));
});

instance.put("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const { directorId, movieName, leadActor } = request.body;
  const putMovieQuery = `UPDATE movie SET director_id = ${directorId},
    movie_name = "${movieName}", lead_actor = "${leadActor}" WHERE movie_id = ${movieId};`;
  const updatedMovie = await dbObject.run(putMovieQuery);
  response.send("Movie Details Updated");
});

instance.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const deleteMovie = `DELETE FROM movie WHERE movie_id = ${movieId};`;
  await dbObject.run(deleteMovie);
  response.send("Movie Removed");
});

instance.get("/directors/", async (request, response) => {
  const directorsQuery = `SELECT * FROM director;`;
  const dbArray = await dbObject.all(directorsQuery);
  response.send(dbArray.map(convertDirectorObjToResponseObj(eachObj)));
});

instance.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const directorMovies = `SELECT movie_name FROM movie where director_id = ${directorId};`;
  const directedMoviesArray = await dbObject.all(directorMovies);
  response.send(
    directedMoviesArray.map((eachMovie) => ({
      movieName: eachMovie.movie_name,
    }))
  );
});

module.exports = instance;
