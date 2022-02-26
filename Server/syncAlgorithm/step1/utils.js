const arrLast = (arr) => arr[arr.length - 1];

//array of numbers
const arrSum = (arr) =>
  arr.reduce((acc, val) => acc + val, 0);

const arrAverage = (arr) => {
  const sum = arr.reduce((acc, val) => val + acc, 0);
  return sum / arr.length;
};

module.exports = {
  arrAverage,
  arrSum,
  arrLast
};