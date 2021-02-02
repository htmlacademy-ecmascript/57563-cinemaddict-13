import Observer from "../utils/observer.js";

export default class Comments extends Observer {
  constructor() {
    super();

    this._comments = [];
  }

  setComments(comments) {
    this._comments = comments.slice();
  }

  getComments() {
    return this._comments;
  }

  deleteComment(updateType, update) {
    const index = this._comments.findIndex((comment) => comment === update);

    if (index === -1) {
      throw new Error(`Cannot update non-existent comment`);
    }

    this._comments = [
      ...this._comments.slice(0, index),
      ...this._comments.slice(index + 1)
    ];
  }

  addComment(updateType, update) {
    this._comments = [
      ...this._comments,
      update
    ];
  }

  static adaptToClient(comment) {
    const adaptedComment = Object.assign(
        {},
        comment,
        {
          text: comment.comment,
          emoji: comment.emotion,
        }
    );

    delete adaptedComment.emotion;
    delete adaptedComment.comment;

    return adaptedComment;
  }

  static adaptToServer(comment) {


    const adaptedComment = Object.assign(
        {},
        comment,
        {
          "comment": comment.text,
          "emotion": comment.emoji.split(`-`).pop(),
          "date": comment.date,
        }
    );

    delete adaptedComment.author;
    delete adaptedComment.emoji;
    delete adaptedComment.text;

    return adaptedComment;
  }
}
