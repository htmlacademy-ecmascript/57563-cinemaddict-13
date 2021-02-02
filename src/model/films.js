import Observer from "../utils/observer.js";

export default class Movies extends Observer {
  constructor() {
    super();

    this._films = [];
  }

  setFilms(films) {
    this._films = films.slice();
  }

  getFilms() {
    return this._films;
  }

  updateFilm(updateType, update) {
    const index = this._films.findIndex((film) => film.id === update.id);

    if (index === -1) {
      throw new Error(`Cannot update non-existent movie`);
    }

    this._films = [
      ...this._films.slice(0, index),
      update,
      ...this._films.slice(index + 1)
    ];

    this._notify(updateType, update);
  }


  static adaptToClient(movie) {
    const {film_info: filmInfo, user_details: userDetails} = movie;
    const adaptedMovie = Object.assign(
        {},
        movie,
        {
          title: filmInfo.title,
          alternativeTitle: filmInfo.alternative_title,
          poster: filmInfo.poster,
          rating: filmInfo.total_rating,
          date: filmInfo.release.date,
          duration: filmInfo.runtime,
          genres: filmInfo.genre,
          description: filmInfo.description,
          country: filmInfo.release.release_country,
          ageRating: filmInfo.age_rating,
          director: filmInfo.director,
          writers: filmInfo.writers,
          actors: filmInfo.actors,
          watchingDate: userDetails.watching_date,
          history: userDetails.already_watched,
          favorites: userDetails.favorite,
          watchlist: userDetails.watchlist,
        }
    );

    delete adaptedMovie.film_info;
    delete adaptedMovie.user_details;

    return adaptedMovie;
  }

  static adaptToServer(movie) {
    const adaptedMovie = Object.assign(
        {},
        movie,
        {
          "film_info": {
            "actors": movie.actors,
            "age_rating": movie.ageRating,
            "alternative_title": movie.alternativeTitle,
            "description": movie.description,
            "director": movie.director,
            "genre": movie.genres,
            "poster": movie.poster,
            "runtime": movie.duration,
            "title": movie.title,
            "total_rating": movie.rating,
            "writers": movie.writers,
            "release": {
              "date": movie.date,
              "release_country": movie.country
            }
          },
          "user_details": {
            "already_watched": movie.history,
            "favorite": movie.favorites,
            "watchlist": movie.watchlist,
            "watching_date": movie.watchingDate,
          },
          "id": movie.id,
          "comments": movie.comments.reduce((accumulator, element) => {
            accumulator.push(element);
            return accumulator;
          }, []),
        }
    );

    delete adaptedMovie.actors;
    delete adaptedMovie.ageRating;
    delete adaptedMovie.alternativeTitle;
    delete adaptedMovie.description;
    delete adaptedMovie.director;
    delete adaptedMovie.genres;
    delete adaptedMovie.poster;
    delete adaptedMovie.duration;
    delete adaptedMovie.title;
    delete adaptedMovie.rating;
    delete adaptedMovie.writers;
    delete adaptedMovie.history;
    delete adaptedMovie.favorites;
    delete adaptedMovie.watchlist;
    delete adaptedMovie.watchingDate;
    delete adaptedMovie.date;
    delete adaptedMovie.country;

    return adaptedMovie;
  }
}
