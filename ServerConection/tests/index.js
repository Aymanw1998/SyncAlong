const { syncSimilarity } = require('../syncAlgorithm');
const { shapeSimilarity } = require('../syncAlgorithm/shapeSimilarity');

const testLefts = (ar1, ar2) => {
    let curve1 = [ar1[12], ar1[14], ar1[16]]
    let curve2 = [ar2[12], ar2[14], ar2[16]]
    console.log(curve1);
    console.log(curve2);

    const similarity = shapeSimilarity(curve1, curve2);
    console.log('similarity-lefts', similarity);
}

const testRights = (ar1, ar2) => {
    let curve1 = [ar1[11], ar1[13], ar1[15]]
    let curve2 = [ar2[11], ar2[13], ar2[15]]
    const similarity = shapeSimilarity(curve1, curve2);
    console.log('similarity-rights', similarity);
}

const testwithActive = (ar1, ar2, a) => {
    let data = {
        me: { poses: ar1 },
        you: { poses: ar2 },
        activity: a
    }
    const similarity = syncSimilarity(data);
    console.log('syncSimilarity', similarity);
}

module.exports = {
    testLefts, testRights, testwithActive,
};
