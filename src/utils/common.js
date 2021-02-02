import {UserRating} from "./const.js";
import moment from "moment";

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
