import Abstract from "./abstract.js";

const createLoadingFilmsTemplate = () => {
  return `
  <h2 class="films-list__title">Loading...</h2>
  `;
};

export default class LoadingFilms extends Abstract {
  getTemplate() {
    return createLoadingFilmsTemplate();
  }
}
