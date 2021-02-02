import AbstractView from "./abstract.js";
import {Containers} from "../utils/const.js";

const createSectionFilmsTemplate = () => {
  return (
    `<section class="films">
      <section class="films-list">
        <h2 class="films-list__title visually-hidden">All movies. Upcoming</h2>

        <div class="films-list__container"  data-type-container="${Containers.MAIN}">
        </div>
      </section>

      <section class="films-list--extra">
        <h2 class="films-list__title">Top rated</h2>

        <div class="films-list__container"  data-type-container="${Containers.TOP}">
        </div>
      </section>

      <section class="films-list--extra">
        <h2 class="films-list__title">Most commented</h2>

        <div class="films-list__container"  data-type-container="${Containers.COMMENTED}">
        </div>
      </section>
    </section>`
  );
};

export default class Films extends AbstractView {
  constructor() {
    super();

    this._clickHandler = this._clickHandler.bind(this);
    this._cardClickHandler = this._cardClickHandler.bind(this);
  }

  getTemplate() {
    return createSectionFilmsTemplate();
  }

  setClickHandler(callback) {
    this._callback.click = callback;
    this.getElement().addEventListener(`click`, this._clickHandler);
  }

  setCardClickHandler(callback) {
    this._callback.cardClick = callback;
    this.getElement().addEventListener(`click`, this._cardClickHandler);
  }

  removeCardClickHandler() {
    this.getElement().removeEventListener(`click`, this._cardClickHandler);
    this._callback.cardClick = null;
  }

  _clickHandler(evt) {
    evt.preventDefault();
    this._callback.click(evt);
  }

  _cardClickHandler(evt) {
    this._callback.cardClick(evt);
  }
}
