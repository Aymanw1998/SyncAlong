{/* STEP 1
    Euclidean Distance, Scaling and Transformation 
    bacied Procrustes analysis.
    link-info: https://en.wikipedia.org/wiki/Procrustes_analysis
*/}
const { shapeSimilarity } = require('./step1/shapeSimilarity');
const { filter_poses_curr_action } = require('./filter_poses_curr_action');

const similarityAvarag = (shortestArr, youPoses, mePoses) => {
    let curve_me_elment1, curve_you_elment1;
    let similarityAvarage = 0;
    let sum = 0;
    let similarity;

    for (const i in shortestArr) {
        if (!youPoses || !mePoses) return; //iffff something wrong with passing data

        curve_me_elment1 = mePoses[i];
        curve_you_elment1 = youPoses[i];

        //when one of users part isnt in the praim the the sync bettwn them is none == 0 
        if (mePoses[i].visibility <= 0.6 || youPoses[i].visibility <= 0.6)
            similarity = 0;
        else
            similarity = shapeSimilarity(curve_me_elment1, curve_you_elment1);

        //console.log(i, similarity, ' curve_me_elment1', curve_me_elment1, 'curve_you_elment1:', curve_you_elment1);
        sum = sum + similarity;
        //console.log(i, ' procrustes_analysis', similarity, 'sum:', sum);
    }
    //console.log("similarityAvarage=sum /shortestArr.length", sum, shortestArr.length, "===", sum / shortestArr.length);
    similarityAvarage = sum / shortestArr.length; //avarage for 1 sec of time series
    return similarityAvarage;
}

const procrustes_analysis = (data) => {
    console.log('data1', data);

    if (data.you.poses === undefined || data.me.poses === undefined) return;
    //filter peers by the curr activity and key poits
    data = filter_poses_curr_action(data.activity, data.me.poses, data.you.poses);
    if (!data) return;
    // console.log('data', data);


    let shortestType, shortestArr;
    data.me.poses.length < data.you.poses.length ? shortestType = 'me' : shortestType = 'you'
    shortestType == 'me' ? shortestArr = data.me.poses : shortestArr = data.you.poses

    let similarity = similarityAvarag(shortestArr, data.you.poses, data.me.poses);  //of parts uper or lower

    //whan it isnot all body activity
    if (!data.me_upper || !data.you_upper) return similarity;
    if (!data.me_upper?.poses || !data.you_upper?.poses) return similarity;
    else {
        //console.log('elssseeee   bouttttt    similarity????');
        //whan it is all body activity then do also the uper part , in this case similarity===lower part
        data.me_upper.poses.length < data.you_upper.poses.length ? shortestType = 'me' : shortestType = 'you'
        shortestType == 'me' ? shortestArr = data.me_upper.poses : shortestArr = data.you_upper.poses;

        if (data.me_upper.poses && data.you_upper.poses) {
            let similarity_upper = similarityAvarag(shortestArr, data.me_upper.poses, data.you_upper.poses);
            console.log('all body similarity_upper', similarity_upper, "similarityAvarage_bouttem", similarity);
            return similarity_upper * 0.8 + similarity * 0.2; // upper is 80% and lower 20% of the total value
        }
        else return similarity; //if noting else 
    }
}

module.exports = {
    procrustes_analysis
};
