{/* STEP 1
    Euclidean Distance, Scaling and Transformation 
    bacied Procrustes analysis.
    link-info: https://en.wikipedia.org/wiki/Procrustes_analysis
*/}

//const { shapeSimilarity } = require('curve-matcher');
const { shapeSimilarity } = require('./step1/shapeSimilarity');
const { filter_poses_curr_action } = require('./filter_poses_curr_action');

const procrustes_analysis = (data) => {
    if (data.you.poses === undefined || data.me.poses === undefined) return; //iffff something wrong with passing data
    //filter peers by the curr activity and key poits
    data = filter_poses_curr_action(data.activity, data.me.poses, data.you.poses);
    //case me:[4] you:[6] -> shorterLen in size 4.
    let shortestType, shortestArr;
    let sum = 0;
    let similarityAvarage = 0;
    data.me.poses.length < data.you.poses.length ? shortestType = 'me' : shortestType = 'you'
    shortestType == 'me' ? shortestArr = data.me.poses : shortestArr = data.you.poses

    let curve_me_elment1, curve_you_elment1, similarity;
    for (const i in shortestArr) {
        if (!data.you.poses || !data.me.poses) return; //iffff something wrong with passing data

        curve_me_elment1 = data.me.poses[i];
        curve_you_elment1 = data.you.poses[i];

        similarity = shapeSimilarity(curve_me_elment1, curve_you_elment1);
        sum = sum + similarity;
        console.log(i, ' procrustes_analysis', similarity, 'sum:', sum);
    }

    console.log(sum, shortestArr.length, sum / shortestArr.length);
    similarityAvarage = sum / shortestArr.length; //avarage for 1 sec of time series
    return similarityAvarage; //OPS //Overall Pose Similarity
}


module.exports = {
    procrustes_analysis
};
