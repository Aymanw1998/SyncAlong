const { arrAverage, arrSum } = require('../geometry/utils');
const { rebalanceCurve, subtract } = require('../geometry/geometry');

/**
 * Translate and scale curve by Procrustes Analysis
 * Optionally runs [[rebalanceCurve]] first (default true)
 * from https://en.wikipedia.org/wiki/Procrustes_analysis
 */
const procrustesNormalizeLandmarks = (
  curve,
  options
) => {

  //1.Translation
  const { rebalance = true, estimationPoints = 50 } = options;
  const balancedCurve = rebalance
    ? rebalanceCurve(curve, { numPoints: estimationPoints })
    : curve;
  // console.log('balancedCurve', balancedCurve, balancedCurve.length);
  const meanX = arrAverage(balancedCurve.map(point => point.x));
  const meanY = arrAverage(balancedCurve.map(point => point.y));
  const mean = { x: meanX, y: meanY };

  //2.Uniform scaling // RMSD 
  //* d= squer( (x-x_avg)^2 + (y-y_avg)^2)
  const translatedCurve = balancedCurve.map(point => subtract(point, mean));
  //avg of distances
  const scale = Math.sqrt(
    arrAverage(translatedCurve.map(({ x, y }) => x * x + y * y))
  );
  //console.log('scale', scale);

  // each pount transform  to => ( (x1-(~x))/scale, (y1-(~y))/scale )
  return translatedCurve.map(point => ({
    x: point.x / scale,
    y: point.y / scale
  }));
};

/**
 * Find the angle to rotate `curve` to match the rotation of `relativeCurve` using procrustes analysis
 *
 * from https://en.wikipedia.org/wiki/Procrustes_analysis
 * `curve` and `relativeCurve` must have the same number of points
 * `curve` and `relativeCurve` should both be run through [[procrustesNormalizeCurve]] first
 */
const findProcrustesRotationAngle = (
  curve,
  relativeCurve
) => {
  if (curve.length !== relativeCurve.length) {
    throw new Error('curve and relativeCurve must have the same length');
  }

  // curve.map(({ x, y }, i) => { console.log(i, ": ", x, y) });
  const numerator = arrSum(
    curve.map(({ x, y }, i) => y * relativeCurve[i].x - x * relativeCurve[i].y)
  );
  const denominator = arrSum(
    curve.map(({ x, y }, i) => x * relativeCurve[i].x + y * relativeCurve[i].y)
  );
  return Math.atan2(numerator, denominator);
};

module.exports = {
  // procrustesNormalizeRotation,
  procrustesNormalizeLandmarks,
  findProcrustesRotationAngle
};