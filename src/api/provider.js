import FilmsModel from "../model/films.js";
import {isOnline} from "../utils/common.js";

const createStoreStructure = (items) => {
  return items.reduce((acc, item) => {
    return Object.assign({}, acc, {
      [item.id]: item,
    });
  }, {});
};

export default class Provider {
  constructor(api, store, commentsStore) {
    this._api = api;
    this._store = store;
    this._commentsStore = commentsStore;
  }

  getMovies() {
    if (isOnline()) {
      return this._api.getMovies()
        .then((movies) => {
          const items = createStoreStructure(movies.map(FilmsModel.adaptToServer));
          this._store.setItems(items);
          return movies;
        });
    }

    const storeMovies = Object.values(this._store.getItems());

    return Promise.resolve(storeMovies.map(FilmsModel.adaptToClient));
  }

  getComments(movieId) {
    if (isOnline()) {
      return this._api.getComments(movieId)
        .then((comments) => {
          return comments;
        });
    }

    const storeComments = Object.values(this._commentsStore.getItems());

    const rightComments = storeComments[movieId];

    return Promise.resolve(rightComments);
  }

  addComment(comment, movieId) {
    if (isOnline()) {
      return this._api.addComment(comment, movieId);
    }

    return Promise.resolve(comment);
  }

  deleteComment(comment) {
    if (isOnline()) {
      return this._api.deleteComment(comment);
    }

    return Promise.resolve(comment);
  }

  updateMovies(movie) {
    if (isOnline()) {
      return this._api.updateMovies(movie)
        .then((updatedMovie) => {
          this._store.setItem(updatedMovie.id, FilmsModel.adaptToServer(updatedMovie));
          return updatedMovie;
        });
    }

    this._store.setItem(movie.id, FilmsModel.adaptToServer(Object.assign({}, movie)));

    return Promise.resolve(movie);
  }

  sync() {
    if (isOnline()) {
      const storeMovies = Object.values(this._store.getItems());

      return this._api.sync(storeMovies)
        .then((response) => {
          const items = createStoreStructure(response.updated);
          this._store.setItems(items);
        });
    }

    return Promise.reject(new Error(`Sync data failed`));
  }
}
