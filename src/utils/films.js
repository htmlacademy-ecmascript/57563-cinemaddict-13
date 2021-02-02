import moment from "moment";

export const sortElements = (films, element) => {
  films.sort(function (a, b) {
    if (a[element] < b[element]) {
      return 1;
    }
    if (a[element] > b[element]) {
      return -1;
    }
    return 0;
  });

  return films;
};


export const sortByDate = (a, b) => {
  return moment(b.date).format(`YYYYMMDD`) - moment(a.date).format(`YYYYMMDD`);
};

export const sortByRating = (a, b) => {
  return b.rating - a.rating;
};
