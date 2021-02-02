import FilmCardView from "../view/card.js";
import {FilterType, UserAction, UpdateType} from "../utils/const.js";
import {remove, replace} from "../utils/render.js";
import moment from "moment";

export default class Film {
  constructor(changeData, activeFilter) {
    this._changeData = changeData;
    this._activeFilter = activeFilter;

    this._filmCardComponent = null;

    this._handleWatchlistClick = this._handleWatchlistClick.bind(this);
    this._handleWatchedClick = this._handleWatchedClick.bind(this);
    this._handleFavoriteClick = this._handleFavoriteClick.bind(this);
  }

  init(film) {
    this._film = film;
    this._currentUpdateType = this._activeFilter === FilterType.ALL ? UpdateType.PATCH : UpdateType.MINOR;

    const prevFilmCardComponent = this._filmCardComponent;

    this._filmCardComponent = new FilmCardView(this._film);

    if (prevFilmCardComponent !== null) {
      this._removeCardHandlers();
      replace(this._filmCardComponent, prevFilmCardComponent);
      remove(prevFilmCardComponent);
    }

    this._setCardHandlers();

    return this._filmCardComponent.getElement();
  }

  destroy() {
    remove(this._filmCardComponent);
  }

  _handleWatchlistClick() {
    this._changeData(
        UserAction.UPDATE_FILM,
        this._currentUpdateType,
        Object.assign(
            {},
            this._film,
            {
              watchlist: !this._film.watchlist
            }
        )
    );
  }

  _handleWatchedClick() {
    this._changeData(
        UserAction.UPDATE_FILM,
        this._currentUpdateType,
        Object.assign(
            {},
            this._film,
            {
              history: !this._film.history,
              watchingDate: !this._film.history ? moment().format() : null
            }
        )
    );
  }

  _handleFavoriteClick() {
    this._changeData(
        UserAction.UPDATE_FILM,
        this._currentUpdateType,
        Object.assign(
            {},
            this._film,
            {
              favorites: !this._film.favorites
            }
        )
    );
  }

  _setCardHandlers() {
    this._filmCardComponent.setWatchlistClickHandler(this._handleWatchlistClick);
    this._filmCardComponent.setWatchedClickHandler(this._handleWatchedClick);
    this._filmCardComponent.setFavoriteClickHandler(this._handleFavoriteClick);
  }

  _removeCardHandlers() {
    this._filmCardComponent.removeWatchlistClickHandler(this._handleWatchlistClick);
    this._filmCardComponent.removeWatchedClickHandler(this._handleWatchedClick);
    this._filmCardComponent.removeFavoriteClickHandler(this._handleFavoriteClick);
  }
}
