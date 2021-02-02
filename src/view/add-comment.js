import Abstract from "./abstract.js";
import {render} from "../utils/render.js";
import {createElement, RenderPosition} from "../utils/render";
import {UserAction, UpdateType} from "../utils/const.js";
import moment from "moment";

const createCommentTemplate = () => {
  return `<div class="film-details__new-comment">
            <div for="add-emoji" class="film-details__add-emoji-label"></div>

            <label class="film-details__comment-label">
              <textarea class="film-details__comment-input" placeholder="Select reaction below and write comment here" name="comment"></textarea>
            </label>

              <div class="film-details__emoji-list">
                <input class="film-details__emoji-item visually-hidden" name="comment-emoji" type="radio" id="emoji-smile" value="smile">
                <label class="film-details__emoji-label" for="emoji-smile">
                  <img src="./images/emoji/smile.png" width="30" height="30" alt="emoji">
                </label>

                <input class="film-details__emoji-item visually-hidden" name="comment-emoji" type="radio" id="emoji-sleeping" value="sleeping">
                <label class="film-details__emoji-label" for="emoji-sleeping">
                  <img src="./images/emoji/sleeping.png" width="30" height="30" alt="emoji">
                </label>

                <input class="film-details__emoji-item visually-hidden" name="comment-emoji" type="radio" id="emoji-puke" value="puke">
                <label class="film-details__emoji-label" for="emoji-puke">
                  <img src="./images/emoji/puke.png" width="30" height="30" alt="emoji">
                </label>

                <input class="film-details__emoji-item visually-hidden" name="comment-emoji" type="radio" id="emoji-angry" value="angry">
                <label class="film-details__emoji-label" for="emoji-angry">
                  <img src="./images/emoji/angry.png" width="30" height="30" alt="emoji">
                </label>
             </div>
           </div>`;
};

const newCommentEmojiTemplate = (emoji) => {
  const nameEmoji = emoji.replace(`emoji-`, ``);
  return `<img class="film-details__emoji-preview" src="./images/emoji/${nameEmoji}.png" width="55" height="55" alt="${emoji}">`;
};

export default class AddComment extends Abstract {
  constructor(action) {
    super();
    this._action = action;
    this._comment = {};
    this._emojiClickHandler = this._emojiClickHandler.bind(this);
    this._sendMessageKeydownHandler = this._sendMessageKeydownHandler.bind(this);
  }

  getTemplate() {
    return createCommentTemplate();
  }

  setEmojiClickHandler() {
    [...this.getElement().querySelectorAll(`.film-details__emoji-label`)]
      .map((element) => element.addEventListener(`click`, this._emojiClickHandler));
  }

  setSendMessageKeydownHandler(callback) {
    this._callback.addCommentKeydown = callback;
    this.getElement()
      .querySelector(`.film-details__comment-input`)
      .addEventListener(`keydown`, this._sendMessageKeydownHandler);
  }

  showProblem() {
    const element = this.getElement();
    element.classList.add(`shake`);

    this.getElement()
      .querySelector(`.film-details__comment-input`)
      .removeEventListener(`keydown`, this._sendMessageKeydownHandler);

    setTimeout(() => {
      element.classList.remove(`shake`);

      this.getElement()
        .querySelector(`.film-details__comment-input`)
        .addEventListener(`keydown`, this._sendMessageKeydownHandler);
    }, 700);
  }

  lock() {
    const element = this.getElement();
    const textarea = element.querySelector(`.film-details__comment-input`);
    const emojiInputs = element.querySelectorAll(`.film-details__emoji-item`);

    textarea.disabled = true;

    Array.from(emojiInputs).map((input) => {
      input.disabled = true;
    });
  }

  unlock() {
    const element = this.getElement();
    const textarea = element.querySelector(`.film-details__comment-input`);
    const emojiInputs = element.querySelectorAll(`.film-details__emoji-item`);

    textarea.disabled = false;
    Array.from(emojiInputs).map((input) => {
      input.disabled = false;
    });
  }

  _emojiClickHandler(evt) {
    const emoji = evt.target.closest(`.film-details__emoji-label`).getAttribute(`for`);
    const container = this.getElement().querySelector(`.film-details__add-emoji-label`);
    const prevElement = this.getElement().querySelector(`.film-details__emoji-preview`);

    const newCommentEmojiElement = createElement(newCommentEmojiTemplate(emoji));

    if (prevElement) {
      prevElement.remove();
      render(container, newCommentEmojiElement, RenderPosition.BEFOREEND);
    } else {
      render(container, newCommentEmojiElement, RenderPosition.BEFOREEND);
    }
  }

  _sendMessageKeydownHandler(evt) {
    if (evt.ctrlKey && evt.key === `Enter`) {
      const element = this.getElement();


      if (
        !element.querySelector(`.film-details__comment-input`).value ||
        !element.querySelector(`.film-details__emoji-preview`)
      ) {
        this.showProblem();
        return;
      }

      const textLocal = element.querySelector(`.film-details__comment-input`).value;

      const emojiLocal = element.querySelector(`.film-details__emoji-preview`).alt;

      const comment = {
        text: textLocal,
        emoji: emojiLocal,
        date: moment().toISOString()
      };

      element.querySelector(`.film-details__comment-input`)
        .removeEventListener(`keydown`, this._sendMessageKeydownHandler);
      element.querySelector(`.film-details__comment-input`).disabled = true;

      this._action(UserAction.ADD_COMMENT, UpdateType.MAJOR, comment);
    }
  }
}
