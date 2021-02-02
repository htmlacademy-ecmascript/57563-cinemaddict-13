import FooterStatisticsView from "./view/footer-statistics.js";
import StatisticsView from "./view/statistics.js";
import FilterPresenter from "./presenter/filter.js";
import FilmsListPresenter from "./presenter/films-list.js";
import FilmsModel from "./model/films.js";
import FilterModel from "./model/filter.js";
import Api from "./api/api.js";
import Store from "./api/store.js";
import Provider from "./api/provider.js";
import {render, remove, RenderPosition} from "./utils/render.js";
import {END_POINT, AUTHORIZATION, MenuItem} from "./utils/const.js";

const STORE_PREFIX = `cinemaddict-localstorage`;
const STORE_COMMENTS_PREFIX = `cinemaddict-localstorage-comments`;
const STORE_VERSION = `v13`;
const STORE_NAME = `${STORE_PREFIX}-${STORE_VERSION}`;
const STORE_NAME_COMMENTS = `${STORE_COMMENTS_PREFIX}-${STORE_VERSION}`;

const api = new Api(END_POINT, AUTHORIZATION);
const filmsStore = new Store(STORE_NAME, window.localStorage);
const commentsStore = new Store(STORE_NAME_COMMENTS, window.localStorage);
const apiWithProvider = new Provider(api, filmsStore, commentsStore);

const filmsModel = new FilmsModel();
const filterModel = new FilterModel();

let firstLoad = true;
let filmsLocal = [];

let userStatisticsComponent = null;
let filterPresenter = null;
let filmListPresenter = null;


const siteHeaderElement = document.querySelector(`.header`);
const siteFooterStatisticsElement = document.querySelector(`.footer__statistics`);
const siteMainElement = document.querySelector(`.main`);

let oldMenuItem = MenuItem.CHANGE_FILTER;
let newMenuItem = MenuItem.CHANGE_FILTER;

const handleStatsButtonClick = (menuItem) => {
  newMenuItem = menuItem;
  firstLoad = false;

  if (oldMenuItem === newMenuItem) {
    return;
  }

  switch (menuItem) {
    case MenuItem.CHANGE_FILTER:
      filmListPresenter.destroy();

      filmListPresenter = new FilmsListPresenter(
          apiWithProvider,
          siteHeaderElement,
          siteMainElement,
          filmsModel,
          filmsStore,
          commentsStore,
          filterModel,
          firstLoad
      );

      filterPresenter.init();
      filmListPresenter.init();
      remove(userStatisticsComponent);
      break;
    case MenuItem.STATS:
      filmListPresenter.destroy();
      filterPresenter.init();
      userStatisticsComponent = new StatisticsView(filmsModel);
      render(siteMainElement, userStatisticsComponent, RenderPosition.BEFOREEND);
      userStatisticsComponent.getChart();
      userStatisticsComponent.setFormChange();
      break;
  }

  oldMenuItem = newMenuItem;
};

filterPresenter = new FilterPresenter(
    siteMainElement,
    filterModel,
    filmsModel,
    handleStatsButtonClick
);
filmListPresenter = new FilmsListPresenter(
    apiWithProvider,
    siteHeaderElement,
    siteMainElement,
    filmsModel,
    filmsStore,
    commentsStore,
    filterModel,
    firstLoad
);

filterPresenter.init();
filmListPresenter.init();

apiWithProvider.getMovies()
  .then((film) => {
    filmsLocal = film;

    return film;
  })
  .then(() => {
    const commentsLocal = {};

    const filmsLocalForStore = filmsLocal.slice().map(FilmsModel.adaptToServer);

    filmsLocalForStore.map((film) => {
      apiWithProvider.getComments(film.id).then((comments) => {
        commentsLocal[film.id] = comments;
        return commentsLocal;
      }).then((comments) => {
        commentsStore.setItems(comments);
      });
    });

    filmsStore.setItems(filmsLocalForStore);
    filmsModel.setFilms(filmsLocal);
    render(siteFooterStatisticsElement, new FooterStatisticsView(filmsLocal), RenderPosition.BEFOREEND);
  })
  .then(() => {
    filterPresenter.init();
    filmListPresenter.init();
    filmListPresenter.removeLoadingFilms();
  })
  .catch(() => {
    filmsModel.setFilms([]);

    filterPresenter.init();
    filmListPresenter.init();
    filmListPresenter.removeLoadingFilms();
  });

window.addEventListener(`load`, () => {
  navigator.serviceWorker.register(`./sw.js`)
    .then(() => {
    }).catch(() => {
      throw new Error(`service worker doesn't work`);
    });
});

window.addEventListener(`online`, () => {
  document.title = document.title.replace(` [offline]`, ``);
  apiWithProvider.sync();
});

window.addEventListener(`offline`, () => {
  document.title += ` [offline]`;
});
