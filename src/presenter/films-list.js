import ProfileRatingView from "../view/profile-rating.js";
import SortMenuView from "../view/sort-menu.js";
import SectionFilmsView from "../view/films.js";
import NoDataView from "../view/no-data.js";
import ButtonView from "../view/button.js";
import LoadingFilmsView from "../view/loading-films.js";
import FilmPresenter from "../presenter/film.js";
import PopupPresenter from "../presenter/popup.js";
import {sortElements, sortByDate, sortByRating} from "../utils/films.js";
import {filter} from "../utils/filter.js";
import {render, remove, RenderPosition} from "../utils/render.js";
import {
  FILM_CARD_COUNT,
  FILM_EXTRA_CARD_COUNT,
  Containers,
  SortType,
  FilterType,
  UserAction,
  UpdateType
} from "../utils/const.js";


export default class FilmList {
  constructor(
      api,
      headContainer,
      mainContainer,
      filmsModel,
      filmsStore,
      commentsStore,
      filterModel,
      firstLoad
  ) {
    this._api = api;
    this._filmsModel = filmsModel;
    this._filterModel = filterModel;
    this._commentsStore = commentsStore;
    this._container = mainContainer;
    this._firstLoad = firstLoad;

    this._renderedFilmCount = FILM_CARD_COUNT;
    this._mainFilmPresenters = {};
    this._topFilmPresenters = {};
    this._commentedFilmPresenters = {};

    this._isPopupOpen = false;
    this._currentFilmPopup = null;

    this._loadMoreButtonComponent = null;
    this._noDataComponent = null;
    this._sortMenuComponent = null;
    this._filmPopupComponent = null;

    this._sectionFilmsComponent = new SectionFilmsView();
    this._profileRatingComponent = new ProfileRatingView();
    this._loadingFilmsComponent = new LoadingFilmsView();

    this._head = document.querySelector(`header`);
    this._body = document.querySelector(`body`);

    this._loadMoreButtonClickHandler = this._loadMoreButtonClickHandler.bind(this);
    this._sortTypeChangeHandler = this._sortTypeChangeHandler.bind(this);
    this._cardFilmClickHandler = this._cardFilmClickHandler.bind(this);
    this._filmUpdateHandler = this._filmUpdateHandler.bind(this);
    this._setPopupFlagHandler = this._setPopupFlagHandler.bind(this);
    this._viewActionHandler = this._viewActionHandler.bind(this);
    this._modelEventHandler = this._modelEventHandler.bind(this);
  }

  init() {
    this._activeFilterFilms = FilterType.ALL;
    this._currentSortType = SortType.DEFAULT;

    this._sectionFilmsComponent.setCardClickHandler(this._cardFilmClickHandler);

    this._renderProfileRating();

    this._filmsModel.addObserver(this._modelEventHandler);
    this._filterModel.addObserver(this._modelEventHandler);

    this._renderMain();
  }

  removeLoadingFilms() {
    remove(this._loadingFilmsComponent);
  }

  destroy() {
    if (this._noDataComponent) {
      this._removeNoData();
    }

    if (this._sortMenuComponent) {
      remove(this._sortMenuComponent);
    }

    this._clearFilmsList(true, true);
    this._filmsModel.removeObserver(this._modelEventHandler);
  }

  closePopup() {
    if (!this._filmPopupComponent) {
      return;
    }
    this._filmPopupComponent.removePopup();
    this._filmPopupComponent = null;

    this._isPopupOpen = false;
  }

  _getFilms() {
    const filterType = this._filterModel.getFilter();
    const films = this._filmsModel.getFilms().slice();
    const filteredFilms = filter[filterType](films);

    switch (this._currentSortType) {
      case SortType.DATE:
        return filteredFilms.sort(sortByDate);
      case SortType.RATING:
        return filteredFilms.sort(sortByRating);
    }

    this._activeFilterFilms = filterType;

    return filteredFilms;
  }

  _filmUpdateHandler(updatedFilm) {
    if (this._mainFilmPresenters[updatedFilm.id]) {
      this._mainFilmPresenters[updatedFilm.id].init(updatedFilm);
    }

    if (this._topFilmPresenters[updatedFilm.id]) {
      this._topFilmPresenters[updatedFilm.id].init(updatedFilm);
    }

    if (this._commentedFilmPresenters[updatedFilm.id]) {
      this._commentedFilmPresenters[updatedFilm.id].init(updatedFilm);
    }
  }

  _viewActionHandler(actionType, updateType, update) {
    switch (actionType) {
      case UserAction.UPDATE_FILM:
        this._api.updateMovies(update)
          .then((response) => {
            this._filmsModel.updateFilm(updateType, response);
            this._profileRatingComponent.update(this._filmsModel.getFilms());
            if (this._isPopupOpen && this._currentFilmPopup.id === response.id) {
              this._renderPopupFilm(response);
            }
          });
        break;
      default:
        return;
    }
  }

  _modelEventHandler(updateType, data) {
    switch (updateType) {
      case UpdateType.PATCH:
        this._filmUpdateHandler(data);
        break;
      case UpdateType.MINOR:
        this._filmUpdateHandler(data);
        this._clearFilmsList();
        this._renderMain();
        break;
      case UpdateType.MAJOR:
        this._clearFilmsList(true, true);
        this._renderMain();
        break;
    }
  }

  _setPopupFlagHandler(value) {
    this._isPopupOpen = value;
  }

  _renderPopupFilm(currentFilm) {
    this.closePopup();

    this._filmPopupComponent = new PopupPresenter(
        this._api,
        this._viewActionHandler,
        this._setPopupFlagHandler,
        this._commentsStore,
        this._activeFilterFilms
    );
    this._filmPopupComponent.init(currentFilm);
    this._body.classList.add(`hide-overflow`);

    this._isPopupOpen = true;
  }

  _findElement(id) {
    const filmsList = this._getFilms().slice();
    this._currentFilmPopup = filmsList.find((film) => film.id === id);

    return this._currentFilmPopup;
  }

  _cardFilmClickHandler(evt) {
    if (
      evt.target.classList.contains(`film-card__poster`) ||
      evt.target.classList.contains(`film-card__title`) ||
      evt.target.classList.contains(`film-card__comments`)
    ) {
      const popupId = evt.target.parentNode.dataset.id;
      const currentFilm = this._findElement(popupId);
      this._renderPopupFilm(currentFilm);
    }
  }

  _loadMoreButtonClickHandler() {

    const mainFilmContainer = this._sectionFilmsComponent
      .getElement()
      .querySelector(`[data-type-container="${Containers.MAIN}"]`);

    const filmCount = this._getFilms().length;
    const newRenderedFilmCount = Math.min(filmCount, this._renderedFilmCount + FILM_CARD_COUNT);

    this._renderCards(mainFilmContainer, this._renderedFilmCount, newRenderedFilmCount, Containers.MAIN);
    this._renderedFilmCount = newRenderedFilmCount;

    if (this._renderedFilmCount >= filmCount) {
      remove(this._loadMoreButtonComponent);
    }
  }

  _sortTypeChangeHandler(sortType) {
    if (this._currentSortType === sortType) {
      return;
    }

    this._currentSortType = sortType;

    this._clearFilmsList(true);
    this._renderMain();
  }

  _renderLoadingFilms() {
    render(this._container, this._loadingFilmsComponent, RenderPosition.BEFOREEND);
  }

  _renderNoData() {
    this._noDataComponent = new NoDataView();
    render(this._container, this._noDataComponent, RenderPosition.BEFOREEND);
  }

  _removeNoData() {
    remove(this._noDataComponent);

    this._noDataComponent = null;
  }

  _renderLoadMoreButton() {
    if (this._loadMoreButtonComponent !== null) {
      this._loadMoreButtonComponent = null;
    }

    const siteFilmListElement = this._sectionFilmsComponent
      .getElement()
      .querySelector(`.films-list`);

    this._loadMoreButtonComponent = new ButtonView();

    render(siteFilmListElement, this._loadMoreButtonComponent, RenderPosition.BEFOREEND);

    this._loadMoreButtonComponent.setClickHandler(this._loadMoreButtonClickHandler);
  }

  _renderProfileRating() {
    this._profileRatingComponent.update(this._getFilms().slice());
    const profile = this._head.querySelector(`.header__profile`);

    if (profile) {
      profile.remove();
    }
    render(this._head, this._profileRatingComponent, RenderPosition.BEFOREEND);
  }

  _renderSort() {
    if (this._sortMenuComponent !== null) {
      remove(this._sortMenuComponent);
      this._sortMenuComponent = null;
    }

    this._sortMenuComponent = new SortMenuView(this._currentSortType);
    this._sortMenuComponent.setSortTypeChangeHandler(this._sortTypeChangeHandler);

    render(this._container, this._sortMenuComponent, RenderPosition.BEFOREEND);
  }

  _renderSectionFilms() {
    this._sectionFilmsComponent = new SectionFilmsView();
    render(this._container, this._sectionFilmsComponent, RenderPosition.BEFOREEND);
  }

  _prepareListFilms(type) {
    const listFilms = this._getFilms().slice();

    switch (type) {
      case SortType.RATING:
        return sortElements(listFilms, type).filter((film) => film[SortType.RATING] !== 0);
      case SortType.COMMENTS:
        return sortElements(listFilms, type).filter((film) => film[SortType.COMMENTS].length !== 0);
      default:
        return listFilms;
    }
  }

  _renderCards(container, from, to, type) {
    const listFilms = this._prepareListFilms(type);
    const fragment = new DocumentFragment();

    listFilms
      .slice(from, to)
      .forEach((film) => {
        const filmPresenter = new FilmPresenter(
            this._viewActionHandler,
            this._activeFilterFilms
        );

        const card = filmPresenter.init(film);
        fragment.append(card);

        switch (type) {
          case SortType.RATING:
            this._topFilmPresenters[film.id] = filmPresenter;
            break;
          case SortType.COMMENTS:
            this._commentedFilmPresenters[film.id] = filmPresenter;
            break;
          default:
            this._mainFilmPresenters[film.id] = filmPresenter;
            break;
        }
      });

    render(container, fragment, RenderPosition.BEFOREEND);
  }

  _createMainCardFilms() {
    const filmCount = this._getFilms().length;

    if (filmCount && this._noDataComponent) {
      this._removeNoData();
    }

    const mainFilmContainer = this._sectionFilmsComponent
      .getElement()
      .querySelector(`[data-type-container="${Containers.MAIN}"]`);

    this._renderCards(mainFilmContainer, 0, Math.min(filmCount, this._renderedFilmCount), SortType.DEFAULT);

    if (filmCount > this._renderedFilmCount) {
      this._renderLoadMoreButton();
    }
  }

  _clearFilmsList(resetRenderedFilmCount = false, resetSortType = false) {
    const filmCount = this._getFilms().length;

    Object
      .values(this._mainFilmPresenters)
      .forEach((presenter) => presenter.destroy());
    this._mainFilmPresenters = {};

    if (this._loadMoreButtonComponent) {
      remove(this._loadMoreButtonComponent);
    }

    Object
      .values(this._topFilmPresenters)
      .forEach((presenter) => presenter.destroy());
    this._topFilmPresenters = {};

    Object
      .values(this._commentedFilmPresenters)
      .forEach((presenter) => presenter.destroy());
    this._commentedFilmPresenters = {};

    if (resetRenderedFilmCount) {
      this._renderedFilmCount = FILM_CARD_COUNT;
    } else {
      this._renderedFilmCount = Math.min(filmCount, this._renderedFilmCount);
    }

    if (resetSortType) {
      this._currentSortType = SortType.DEFAULT;
    }

    if (this._container.querySelector(`.sort`)) {
      this._container.querySelector(`.sort`).remove();
    }

    if (this._container.querySelector(`.films`)) {
      this._container.querySelector(`.films`).remove();
    }

    this._sectionFilmsComponent.removeCardClickHandler(this._cardFilmClickHandler);
  }

  _createTopCardFilms() {
    const countTopFilms = this._getFilms()
      .slice()
      .filter((film) => film[SortType.RATING] !== 0).length;

    if (countTopFilms) {
      const topFilmContainer = this._sectionFilmsComponent
        .getElement()
        .querySelector(`[data-type-container="${Containers.TOP}"]`);

      this._renderCards(topFilmContainer, 0, FILM_EXTRA_CARD_COUNT, SortType.RATING);
    } else {
      this._sectionFilmsComponent
        .getElement()
        .querySelectorAll(`.films-list--extra`)[0]
        .remove();
    }
  }

  _createCommentedCardFilms() {
    const countCommentedFilms = this._getFilms()
      .slice()
      .filter((film) => film[SortType.COMMENTS].length !== 0).length;

    if (countCommentedFilms) {
      const commentedFilmContainer = this._sectionFilmsComponent
        .getElement()
        .querySelector(`[data-type-container="${Containers.COMMENTED}"]`);

      this._renderCards(commentedFilmContainer, 0, FILM_EXTRA_CARD_COUNT, SortType.COMMENTS);
    } else {
      this._sectionFilmsComponent
        .getElement()
        .querySelectorAll(`.films-list--extra`)[1]
        .remove();
    }
  }

  _renderMain() {
    const filmCount = this._getFilms().length;

    this._renderSort();

    if (this._firstLoad) {
      this._renderLoadingFilms();
      this._firstLoad = false;
      return;
    }

    if (!filmCount) {
      this._renderNoData();
      return;
    }

    this._renderSectionFilms();
    this._createMainCardFilms();
    this._createTopCardFilms();
    this._createCommentedCardFilms();

    this._sectionFilmsComponent.setCardClickHandler(this._cardFilmClickHandler);
  }
}
