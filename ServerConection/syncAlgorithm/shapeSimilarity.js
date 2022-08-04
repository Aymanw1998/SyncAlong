const { frechetDistance } = require('./step2/frechetDistance');
const { curveLength, rotateCurve } = require('./geometry/geometry');
const { findProcrustesRotationAngle, procrustesNormalizeLandmarks } = require('./step1/procrustesAnalysis');

let estimationPoints = 50;
let rotations = 10;
let checkRotations = true;

/**
 * Estimate how similar the shapes of 2 curves are to each
 * accounting for translation, scale, and rotation
 * returns between 1 and 0 depending on how similar the shapes are, where 1 means identical.
 */


const shapeSimilarity = (
  landmarks1,
  landmarks2,
  rotationAngleLimitation
) => {
  if (Math.abs(rotationAngleLimitation) > Math.PI ||
    !landmarks1 || !landmarks2 || landmarks1.length === 0 || landmarks2.length === 0
  ) {
    throw new Error('cannot contiue - requies elements are messing');
  }
  const normalizedLandmarks1 = procrustesNormalizeLandmarks(landmarks1, { estimationPoints });
  const normalizedLandmarks2 = procrustesNormalizeLandmarks(landmarks2, { estimationPoints });

  const getAvgLandmarksLen = Math.sqrt(curveLength(normalizedLandmarks1) * curveLength(normalizedLandmarks2));
  const thetasToCheck = [0];

  if (checkRotations) {
    let procrustesTheta = findProcrustesRotationAngle(
      normalizedLandmarks1,
      normalizedLandmarks2
    );
    // console.log('Math.PI', procrustesTheta, Math.abs(procrustesTheta), rotationAngleLimitation);
    // use a negative rotation rather than a large positive rotation
    if (procrustesTheta > Math.PI) {
      procrustesTheta = procrustesTheta - 2 * Math.PI;
    }
    if (
      procrustesTheta !== 0 &&
      Math.abs(procrustesTheta) < rotationAngleLimitation
    ) {
      thetasToCheck.push(procrustesTheta);
    }
    for (let i = 0; i < rotations; i++) {
      const theta =
        -1 * rotationAngleLimitation +
        (2 * i * rotationAngleLimitation) / (rotations - 1);
      //  console.log('theta', theta);

      // 0 and Math.PI are already being checked, no need to check twice
      if (theta !== 0 && theta !== Math.PI) {
        thetasToCheck.push(theta);
      }
    }
  }
  //console.log('thetasToCheck', thetasToCheck, thetasToCheck.length);

  let minFrechetDist = Infinity;
  // check some other thetas here just in case the procrustes theta isn't the best rotation
  thetasToCheck.forEach(theta => {
    const rotatedLandmarks1 = rotateCurve(normalizedLandmarks1, theta);
    //call step2 of distance calculites
    const dist = frechetDistance(rotatedLandmarks1, normalizedLandmarks2);
    // console.log('dist', dist);
    if (dist < minFrechetDist) minFrechetDist = dist;
  });

  // console.log('minFrechetDist', minFrechetDist, Math.max(1 - minFrechetDist / (getAvgLandmarksLen / Math.sqrt(2)), 0));
  // divide by Math.sqrt(2) to try to get the low results closer to 0
  return Math.max(1 - minFrechetDist / (getAvgLandmarksLen / Math.sqrt(2)), 0);
};

module.exports = {
  shapeSimilarity
};