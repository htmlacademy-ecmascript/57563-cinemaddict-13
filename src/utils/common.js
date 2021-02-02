import {UserRating} from "./const.js";
import moment from "moment";

export const getRandomInteger = (a = 0, b = 1) => {
  const lower = Math.ceil(Math.min(a, b));
  const upper = Math.floor(Math.max(a, b));

  return Math.floor(lower + Math.random() * (upper - lower + 1));
};

export const getRandomArbitrary = (min, max) => {
  return Math.random() * (max - min) + min;
};

export const humanizeReleaseDate = (date) => {
  return `${moment(date).format(`h`)}h ${moment(date).format(`m`)}m`;
};

export const getRank = (moviesTotal) => {
  switch (true) {
    case (moviesTotal <= UserRating.NOVICE.maximumFilms) && (moviesTotal > UserRating.NONE.maximumFilms):
      return UserRating.NOVICE.name;
    case (moviesTotal <= UserRating.FAN.maximumFilms) && (moviesTotal > UserRating.NOVICE.maximumFilms):
      return UserRating.FAN.name;
    case (moviesTotal > UserRating.FAN.maximumFilms):
      return UserRating.MOVIE_BUFF.name;
    default:
      return UserRating.NONE.name;
  }
};

export const isOnline = () => {
  return window.navigator.onLine;
};
