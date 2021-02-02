import AbstractView from "./abstract.js";
import {UserRating} from "../utils/const.js";
import {getRank} from "../utils/common.js";

const createProfileRatingTemplate = (rating) => {
  return (
    `<section class="header__profile profile">
       <p class="profile__rating">${rating}</p>
       <img class="profile__avatar" src="images/bitmap@2x.png" alt="Avatar" width="35" height="35">
     </section>`
  );
};

export default class ProfileRating extends AbstractView {
  constructor() {
    super();

    this._films = null;
    this._profileRating = UserRating.NONE.name;
  }

  getTemplate() {
    return createProfileRatingTemplate(this._profileRating);
  }

  update(film) {
    this._films = film;
    const profileRatingElement = this.getElement().querySelector(`.profile__rating`);
    const historyFilmsCount = this._films.filter((movie) => movie.history).length;

    this._profileRating = getRank(historyFilmsCount);

    profileRatingElement.textContent = this._profileRating;
  }
}
