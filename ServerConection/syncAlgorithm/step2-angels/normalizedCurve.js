const { Curve, curveLength, rotateCurve } = require('./geometry');
const { findProcrustesRotationAngle, procrustesNormalizeCurve } = require('./procrustesAnalysis');

let estimationPoints = 50;
let rotations = 10;
let restrictRotationAngle = Math.PI;
let checkRotations = true;

const normalizedCurve = (data) => {
    console.log('data angles_between_joints', data);
    //step1 - Euclidean Distance, Scaling and Transformation
    const curve1 = data.me.poses;
    const curve2 = data.you.poses;
    // first rebalance and normalize scale and translation of the curves
    const normalizedCurve1 = procrustesNormalizeCurve(curve1, { numPoints: 50 });
    const normalizedCurve2 = procrustesNormalizeCurve(curve2, { numPoints: 50 });

    const geoAvgCurveLen = Math.sqrt(
        curveLength(normalizedCurve1) * curveLength(normalizedCurve2)
    );

    const thetasToCheck = [0];

    if (checkRotations) {
        let procrustesTheta = findProcrustesRotationAngle(
            normalizedCurve1,
            normalizedCurve2
        );
        // use a negative rotation rather than a large positive rotation
        if (procrustesTheta > Math.PI) {
            procrustesTheta = procrustesTheta - 2 * Math.PI;
        }
        if (
            procrustesTheta !== 0 &&
            Math.abs(procrustesTheta) < restrictRotationAngle
        ) {
            thetasToCheck.push(procrustesTheta);
        }
        for (let i = 0; i < rotations; i++) {
            const theta =
                -1 * restrictRotationAngle +
                (2 * i * restrictRotationAngle) / (rotations - 1);
            // 0 and Math.PI are already being checked, no need to check twice
            if (theta !== 0 && theta !== Math.PI) {
                thetasToCheck.push(theta);
            }
        }
    }

    let minFrechetDist = Infinity;
    let rotatedCurve1 = [];
    // check some other thetas here just in case the procrustes theta isn't the best rotation
    thetasToCheck.forEach(theta => {
        rotatedCurve1.push(rotateCurve(normalizedCurve1, theta));
    });
    return 0;
}

module.exports = {
    normalizedCurve
};