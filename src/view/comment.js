import SmartView from "./smart.js";
import {UserAction, UpdateType} from "../utils/const.js";
import he from "he";
import moment from "moment";

const createCommentTemplate = (comment) => {
  const date = comment.date;
  const timeAddComment = moment(date).fromNow();

  return `<li class="film-details__comment">
              <span class="film-details__comment-emoji">
                <img
                src="./images/emoji/${comment.emoji.replace(`emoji-`, ``)}.png"
                width="55"
                height="55"
                alt="emoji-${comment.emoji}"
                >
              </span>
              <div>
                <p class="film-details__comment-text">${he.encode(comment.text)}</p>
                <p class="film-details__comment-info">
                  <span class="film-details__comment-author">${comment.author}</span>
                  <span class="film-details__comment-day">${timeAddComment}</span>
                  <button class="film-details__comment-delete">Delete</button>
                </p>
              </div>
            </li>`;
};

export default class Comment extends SmartView {
  constructor(comment) {
    super();
    this._comment = comment;
    this._deleteClickHandler = this._deleteClickHandler.bind(this);
  }

  getTemplate() {
    return createCommentTemplate(this._comment);
  }

  setDeleteHandler(callback) {
    this._callback.deleteClick = callback;
    this.getElement()
      .querySelector(`.film-details__comment-delete`)
      .addEventListener(`click`, this._deleteClickHandler);
  }

  showProblem() {
    const element = this.getElement();
    const deleteButton = element.querySelector(`.film-details__comment-delete`);


    this.getElement()
      .querySelector(`.film-details__comment-delete`)
      .removeEventListener(`click`, this._deleteClickHandler);
    element.classList.add(`shake`);

    setTimeout(() => {
      element.classList.remove(`shake`);
      deleteButton.disabled = false;
      this.getElement()
        .querySelector(`.film-details__comment-delete`)
        .addEventListener(`click`, this._deleteClickHandler);
      deleteButton.textContent = `Delete`;
    }, 700);
  }

  _deleteClickHandler(evt) {
    evt.preventDefault();
    evt.stopPropagation();
    this.getElement()
      .querySelector(`.film-details__comment-delete`)
      .removeEventListener(`click`, this._deleteClickHandler);

    const deleteButton = this.getElement()
      .querySelector(`.film-details__comment-delete`);

    deleteButton.disabled = true;
    deleteButton.textContent = `Deleting…`;
    this._callback.deleteClick(UserAction.DELETE_COMMENT, UpdateType.MINOR, this._comment);
  }
}

