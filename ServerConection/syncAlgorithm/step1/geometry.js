const { arrLast } = require('./utils');

//object of nymbers 
let x, y;
let Point = { x, y }

//array of Points
let Curve = [];

const subtract = (v1, v2) => ({
  x: v1.x - v2.x,
  y: v1.y - v2.y
});

const magnitude = ({ x, y }) => Math.sqrt(x * x + y * y);

/**
 * Calculate the distance between 2 points
 * param point1
 * param point2
 */
const pointDistance = (point1, point2) =>
  magnitude(subtract(point1, point2));

/**
 * calculate the length of the curve
 * param points
 * d= squer( (x_first-x_last)^2 + (y_first-y_last)^2)
 */
const curveLength = (points) => {
  let lastPoint = points[0];
  const pointsSansFirst = points.slice(1);
  return pointsSansFirst.reduce((acc, point) => {
    const dist = pointDistance(point, lastPoint);
    // console.log('dist', point, lastPoint, '=', dist);
    lastPoint = point;
    return acc + dist;
  }, 0);
};

/**
 * return a new point, p3, which is on the same line as p1 and p2, but <dist> away from p2
 * p1, p2, p3 will always lie on the line in that order (as long as dist is positive)
 * param p1
 * param p2
 * param dist
 */
const extendPointOnLine = (p1, p2, dist) => {
  const vect = subtract(p2, p1);
  const norm = dist / magnitude(vect);
  return { x: p2.x + norm * vect.x, y: p2.y + norm * vect.y };
};

/**
 * Redraw the curve using `numPoints` points equally spaced along the length of the curve
 * This may result in a slightly different shape than the original if `numPoints` is low
 * @param curve
 * @param options
 */
const rebalanceCurve = (
  curve,
  options
) => {
  const { numPoints = 50 } = options;
  const curveLen = curveLength(curve);
  const segmentLen = curveLen / (numPoints - 1);
  const outlinePoints = [curve[0]];
  //console.log('curveLen', curveLen);
  const endPoint = arrLast(curve);
  const remainingCurvePoints = curve.slice(1);
  for (let i = 0; i < numPoints - 2; i++) {
    let lastPoint = arrLast(outlinePoints);
    let remainingDist = segmentLen;
    let outlinePointFound = false;
    while (!outlinePointFound) {
      const nextPointDist = pointDistance(lastPoint, remainingCurvePoints[0]);
      if (nextPointDist < remainingDist) {
        remainingDist -= nextPointDist;
        lastPoint = remainingCurvePoints.shift();
      } else {
        const nextPoint = extendPointOnLine(
          lastPoint,
          remainingCurvePoints[0],
          remainingDist - nextPointDist
        );
        outlinePoints.push(nextPoint);
        outlinePointFound = true;
      }
    }
  }
  outlinePoints.push(endPoint);
  return outlinePoints;
};

/**
 * Rotate the curve around the origin
 * @param curve
 * @param theta the angle to rotate by, in radians
 */
const rotateCurve = (curve, theta) => {
  return curve.map(point => ({
    x: Math.cos(-1 * theta) * point.x - Math.sin(-1 * theta) * point.y,
    y: Math.sin(-1 * theta) * point.x + Math.cos(-1 * theta) * point.y
  }));
};

module.exports = {
  curveLength,
  pointDistance,
  extendPointOnLine,
  rebalanceCurve,
  rotateCurve,
  Point,
  Curve,
  subtract
};