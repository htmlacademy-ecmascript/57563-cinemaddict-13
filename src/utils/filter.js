import {FilterType} from "./const.js";

export const filter = {
  [FilterType.ALL]: (films) => films,
  [FilterType.WATCHLIST]: (films) => films.filter((film) => film.watchlist),
  [FilterType.HISTORY]: (films) => films.filter((film) => film.history),
  [FilterType.FAVORITES]: (films) => films.filter((film) => film.favorites)
};
