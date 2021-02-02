import PopupView from "../view/popup.js";
import CommentView from "../view/comment.js";
import AddCommentView from "../view/add-comment.js";
import CommentsModel from "../model/comments.js";
import {UserAction, UpdateType, FilterType} from "../utils/const.js";
import {render, remove, replace, RenderPosition} from "../utils/render.js";
import {isOnline} from "../utils/common.js";
import moment from "moment";

export default class Popup {
  constructor(api, changeData, setPopupFlag, commentsStore, activeFilter) {
    this._api = api;
    this._changeData = changeData;
    this._isPopupOpen = setPopupFlag;
    this._commentsStore = commentsStore;
    this._activeFilter = activeFilter;

    this._comments = [];
    this._commentsViews = {};

    this._popupComponent = null;
    this._commentsComponent = null;
    this._newCommentComponent = null;
    this._commentsModel = null;

    this._body = document.querySelector(`body`);
    this._footer = document.querySelector(`.footer`);

    this._removePopupHandler = this._removePopupHandler.bind(this);
    this._escKeyDownHandler = this._escKeyDownHandler.bind(this);

    this._watchlistClickHandler = this._watchlistClickHandler.bind(this);
    this._watchedClickHandler = this._watchedClickHandler.bind(this);
    this._favoriteClickHandler = this._favoriteClickHandler.bind(this);

    this._handleViewAction = this._handleViewAction.bind(this);
  }

  init(film) {
    this._film = film;

    this._currentUpdateType = this._activeFilter === FilterType.ALL ? UpdateType.PATCH : UpdateType.MAJOR;

    this.removePopup();

    const prevPopupComponent = this._popupComponent;

    this._popupComponent = new PopupView(this._film);
    this._commentsModel = new CommentsModel();

    this._api.getComments(this._film.id).then((comments) => {
      this._comments = comments;
      this._commentsModel.setComments(this._comments);
      this._renderComments();
      this._renderAddComment();
    });

    this._setPopupHandlers();
    this._isPopupOpen(true);

    if (prevPopupComponent === null) {
      render(this._footer, this._popupComponent, RenderPosition.BEFOREEND);
      return;
    }

    if (this._footer.contains(prevPopupComponent.getElement())) {
      replace(this._popupComponent, prevPopupComponent);
    }

    remove(prevPopupComponent);
  }

  removePopup() {
    this._popup = document.querySelector(`.film-details`);

    if (this._popup) {
      this._removePopupHandlers();
      remove(this._popupComponent);
      this._popupComponent = null;
      this._body.classList.remove(`hide-overflow`);
      this._isPopupOpen(false);
    }
  }

  _removePopupHandler() {
    this.removePopup();
  }

  _escKeyDownHandler(evt) {
    if (evt.key === `Escape` || evt.key === `Esc`) {
      this._removePopupHandler();
    }
  }

  _setPopupHandlers() {
    this._popupComponent.setMouseDownHandler(this._removePopupHandler);
    document.addEventListener(`keydown`, this._escKeyDownHandler);
    this._popupComponent.setWatchlistClickHandler(this._watchlistClickHandler);
    this._popupComponent.setWatchedClickHandler(this._watchedClickHandler);
    this._popupComponent.setFavoriteClickHandler(this._favoriteClickHandler);
  }

  _removePopupHandlers() {
    this._popupComponent.removeMouseDownHandler(this._removePopupHandler);
    document.removeEventListener(`keydown`, this._escKeyDownHandler);
    this._popupComponent.removeWatchlistClickHandler(this._watchlistClickHandler);
    this._popupComponent.removeWatchedClickHandler(this._watchedClickHandler);
    this._popupComponent.removeFavoriteClickHandler(this._favoriteClickHandler);
  }

  _renderComments() {
    if (!this._popupComponent) {
      return;
    }

    const commentsContainer = this._popupComponent
      .getElement()
      .querySelector(`.film-details__comments-list`);

    this._commentsStore.setItem(this._film.id, this._commentsModel.getComments());

    this._commentsModel.getComments().map((element) => {
      this._commentsComponent = new CommentView(element);

      render(commentsContainer, this._commentsComponent, RenderPosition.BEFOREEND);
      this._commentsComponent.setDeleteHandler(this._handleViewAction);

      this._commentsViews[element.id] = this._commentsComponent;
    });
  }

  _renderAddComment() {
    if (!this._popupComponent) {
      return;
    }

    this._commentsMainContainer = this._popupComponent
      .getElement()
      .querySelector(`.film-details__comments-wrap`);

    this._newCommentComponent = new AddCommentView(this._handleViewAction);
    render(this._commentsMainContainer, this._newCommentComponent, RenderPosition.BEFOREEND);

    if (isOnline()) {
      this._newCommentComponent.unlock();
      this._newCommentComponent.setEmojiClickHandler();
      this._newCommentComponent.setSendMessageKeydownHandler();
    } else {
      this._newCommentComponent.lock();
    }
  }

  _watchlistClickHandler() {
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

  _watchedClickHandler() {
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

  _favoriteClickHandler() {
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

  _handleViewAction(actionType, updateType, update) {
    switch (actionType) {
      case UserAction.DELETE_COMMENT:

        this._api.deleteComment(update).then(() => {
          if (isOnline()) {
            this._changeData(
                UserAction.UPDATE_FILM,
                UpdateType.MINOR,
                Object.assign(
                    {},
                    this._film,
                    {
                      comments: this._commentsModel
                      .getComments()
                      .filter((element) => element.id !== update.id)
                      .reduce((accumulator, element) => {
                        accumulator.push(element.id);
                        return accumulator;
                      }, []),
                    }
                ));

            this._commentsModel.deleteComment(updateType, update);
            this._commentsStore.setItem(this._film.id, this._commentsModel.getComments());
            this._comments = this._commentsModel.getComments();
          } else {
            this._commentsViews[update.id].showProblem();
          }
        }
        ).catch(() => {
          this._commentsViews[update.id].showProblem();
        }
        );
        break;
      case UserAction.ADD_COMMENT:
        this._api.addComment(update, this._film.id).then(() => {
          if (isOnline()) {
            this._changeData(
                UserAction.UPDATE_FILM,
                UpdateType.MINOR,
                Object.assign(
                    {},
                    this._film,
                    {
                      comments: this._commentsModel
                      .getComments()
                      .filter((element) => element.id !== update.id)
                      .reduce((accumulator, element) => {
                        accumulator.push(element.id);
                        return accumulator;
                      }, []),
                    }
                ));
          } else {
            this._newCommentComponent.showProblem();
          }
        }
        )
          .catch(() => {
            this._newCommentComponent.showProblem();
          }
          );
        break;
    }
  }
}
