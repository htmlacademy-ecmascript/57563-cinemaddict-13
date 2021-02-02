export const FILM_CARD_COUNT = 5;
export const FILM_EXTRA_CARD_COUNT = 2;
export const END_POINT = `https://13.ecmascript.pages.academy/cinemaddict`;
export const AUTHORIZATION = `Basic jS7av3dnVwze1sa5p`;

export const Method = {
  GET: `GET`,
  PUT: `PUT`,
  POST: `POST`,
  DELETE: `DELETE`
};

export const SuccessHTTPStatusRange = {
  MIN: 200,
  MAX: 299
};

export const MenuItem = {
  CHANGE_FILTER: `CHANGE_FILTER`,
  STATS: `STATS`
};

export const FilterType = {
  ALL: `ALL`,
  WATCHLIST: `WATCHLIST`,
  HISTORY: `HISTORY`,
  FAVORITES: `FAVORITES`
};

export const SortType = {
  DEFAULT: `default`,
  DATE: `date`,
  RATING: `rating`,
  COMMENTS: `comments`,
};

export const UserRating = {
  NONE: {
    maximumFilms: 0,
    name: ``
  },
  NOVICE: {
    maximumFilms: 10,
    name: `novice`
  },
  FAN: {
    maximumFilms: 20,
    name: `fan`
  },
  MOVIE_BUFF: {
    name: `movie buff`
  }
};

export const Containers = {
  MAIN: `Main`,
  TOP: `Top`,
  COMMENTED: `Commented`,
};

export const UserAction = {
  UPDATE_FILM: `UPDATE_FILM`,
  ADD_COMMENT: `ADD_COMMENT`,
  DELETE_COMMENT: `DELETE_COMMENT`
};

export const UpdateType = {
  PATCH: `PATCH`,
  MINOR: `MINOR`,
  MAJOR: `MAJOR`
};
