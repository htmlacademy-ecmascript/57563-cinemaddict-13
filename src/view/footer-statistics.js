import AbstractView from "./abstract.js";

const createFooterStatisticsTemplate = (count) => {
  return (
    `<p>${count} movies inside</p>`
  );
};

export default class FooterStatistics extends AbstractView {
  constructor(films) {
    super();

    this.filmsCount = films.length;
  }

  getTemplate() {
    return createFooterStatisticsTemplate(this.filmsCount);
  }
}
