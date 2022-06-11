const { arrAverage, arrSum } = require('./utils');
const {
  Curve,
  Point,
  rebalanceCurve,
  rotateCurve,
  subtract
} = require('./geometry');

let rebalance, estimationPoints;
let ProcrustesNormalizeCurveOpts = {
  rebalance, //bool
  estimationPoints, //num
}

/**
 * Translate and scale curve by Procrustes Analysis
 *
 * Optionally runs [[rebalanceCurve]] first (default true)
 * from https://en.wikipedia.org/wiki/Procrustes_analysis
 * @param curve
 * @param options
 */
const procrustesNormalizeCurve = (
  curve,
  options
) => {
  const { rebalance = true, estimationPoints = 50 } = options;
  const balancedCurve = rebalance
    ? rebalanceCurve(curve, { numPoints: estimationPoints })
    : curve;
  // console.log('balancedCurve', balancedCurve);
  const meanX = arrAverage(balancedCurve.map(point => point.x));
  const meanY = arrAverage(balancedCurve.map(point => point.y));
  const mean = { x: meanX, y: meanY };

  // Uniform scaling // RMSD 
  //* d= squer( (x-x_avg)^2 + (y-y_avg)^2)
  const translatedCurve = balancedCurve.map(point => subtract(point, mean));
  //avg of distances
  const scale = Math.sqrt(
    arrAverage(translatedCurve.map(({ x, y }) => x * x + y * y))
  );
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
 * @param curve
 * @param relativeCurve
 */
const findProcrustesRotationAngle = (
  curve,
  relativeCurve
) => {
  if (curve.length !== relativeCurve.length) {
    throw new Error('curve and relativeCurve must have the same length');
  }

  const numerator = arrSum(
    curve.map(({ x, y }, i) => y * relativeCurve[i].x - x * relativeCurve[i].y)
  );
  const denominator = arrSum(
    curve.map(({ x, y }, i) => x * relativeCurve[i].x + y * relativeCurve[i].y)
  );
  return Math.atan2(numerator, denominator);
};

/**
 * Rotate `curve` to match the rotation of `relativeCurve` using procrustes analysis
 *
 * from https://en.wikipedia.org/wiki/Procrustes_analysis
 * `curve` and `relativeCurve` must have the same number of points
 * `curve` and `relativeCurve` should both be run through [[procrustesNormalizeCurve]] first
 * @param curve
 * @param relativeCurve
 */
const procrustesNormalizeRotation = (
  curve,
  relativeCurve
) => {
  const angle = findProcrustesRotationAngle(curve, relativeCurve);
  return rotateCurve(curve, angle);
};

module.exports = {
  procrustesNormalizeRotation,
  procrustesNormalizeCurve,
  findProcrustesRotationAngle,
  ProcrustesNormalizeCurveOpts
};