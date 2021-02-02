import AbstractView from "./abstract.js";
import {MenuItem} from "../utils/const.js";

const createFilterItemTemplate = (filter, currentFilterType) => {
  const {type, name, count} = filter;

  const checked = type === currentFilterType ? `main-navigation__item--active` : ``;
  const counter = name !== `All movies` ? `<span class="main-navigation__item-count">${count}</span></a>` : ``;

  return `<a href="#${name}" class="main-navigation__item ${checked}" data-type="${type}">${name} ${counter}</a>`;
};

export const createFilterMenuTemplate = (filterItems, currentFilterType) => {
  const filterItemsTemplate = filterItems
    .map((filter) => createFilterItemTemplate(filter, currentFilterType))
    .join(``);

  return (
    `<nav class="main-navigation">
       <div class="main-navigation__items">
          ${filterItemsTemplate}
       </div>
       <a href="#stats" class="main-navigation__additional">Stats</a>
    </nav>`
  );
};

export default class FilterMenu extends AbstractView {
  constructor(filters, currentFilterType) {
    super();
    this._filters = filters;
    this._currentFilter = currentFilterType;

    this._filterTypeChangeHandler = this._filterTypeChangeHandler.bind(this);
    this._statsClickHandler = this._statsClickHandler.bind(this);
  }

  getTemplate() {
    return createFilterMenuTemplate(this._filters, this._currentFilter);
  }

  setFilterTypeChangeHandler(callback) {
    this._callback.filterTypeChange = callback;
    this.getElement()
      .querySelectorAll(`.main-navigation__item`)
      .forEach((element) => element
        .addEventListener(`click`, this._filterTypeChangeHandler));
  }

  setStatsButtonClickHandler(callback) {
    this._callback.statsButtonClick = callback;
    this.getElement()
      .querySelector(`.main-navigation__additional`)
      .addEventListener(`click`, this._statsClickHandler);
  }

  _filterTypeChangeHandler(evt) {
    evt.preventDefault();
    const type = evt.target.closest(`.main-navigation__item`).dataset.type;
    this._callback.filterTypeChange(type);

    if (this._callback.statsButtonClick) {
      this._callback.statsButtonClick(MenuItem.CHANGE_FILTER);
    }
  }

  _statsClickHandler(evt) {
    evt.preventDefault();
    this._callback.statsButtonClick(MenuItem.STATS);
  }
}
