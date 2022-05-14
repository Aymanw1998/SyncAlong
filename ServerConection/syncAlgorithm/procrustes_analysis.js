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
    if (data.you.poses === undefined || data.me.poses === undefined) return;
    //filter peers by the curr activity and key poits
    data = filter_poses_curr_action(data.activity, data.me.poses, data.you.poses);
    if (!data) return;

    // let shortestType, shortestArr;
    // data.me.poses.length < data.you.poses.length ? shortestType = 'me' : shortestType = 'you'
    // shortestType == 'me' ? shortestArr = data.me.poses : shortestArr = data.you.poses


    //when bout side1 and sid2 
    //then side1 ==left side
    //side2 == right side 
    //if only side1 then it can be ethr one 
    let similarity = shapeSimilarity(data.you.side1.poses, data.me.side1.poses, Math.PI / 6); //Rotates up to a third of its axis //https://he.wikipedia.org/wiki/%D7%A8%D7%93%D7%99%D7%90%D7%9F
    let similarity_side2 = null;
    if (data.you.side2 && data.me.side2) {
        similarity_side2 = shapeSimilarity(data.you.side2.poses, data.me.side2.poses, Math.PI / 6); //Rotates up to a third of its axis
    }
    let total_similarity_avg = similarity;
    if (similarity >= 0 && similarity_side2 !== null && similarity_side2 >= 0) {
        total_similarity_avg = (similarity + similarity_side2) / 2
    }
    console.log('similarity', similarity, 'similarity_side2', similarity_side2, 'total_similarity_avg', total_similarity_avg);

    //whan it isnot all body activity
    // me_bottom, you_bottom 
    if (!data.me_bottom || !data.you_bottom) return total_similarity_avg;
    if (!data.me_bottom?.side1.poses || !data.you_bottom?.side1.poses) return total_similarity_avg;

    else {
        //whan it is all body activity then do also the uper part , in this case similarity===lower part
        // data.me_upper.poses.length < data.you_upper.poses.length ? shortestType = 'me' : shortestType = 'you'
        // shortestType == 'me' ? shortestArr = data.me_upper.poses : shortestArr = data.you_upper.poses;
        let similarity_bottom_side1 = null;
        let similarity_bottom_side2 = null;

        if (data.me_bottom?.side1.poses && data.you_bottom?.side1.poses && data.me_bottom?.side2.poses && data.you_bottom?.side2.poses) {
            similarity_bottom_side1 = shapeSimilarity(data.you_bottom.side1.poses, data.me_bottom.side1.poses, Math.PI / 6); // similarityAvarag(shortestArr, data.me_upper.poses, data.you_upper.poses);
            similarity_bottom_side2 = shapeSimilarity(data.you_bottom.side2.poses, data.me_bottom.side2.poses, Math.PI / 6); // similarityAvarag(shortestArr, data.me_upper.poses, data.you_upper.poses);

            let similarity_bottom_avg = similarity_bottom_side1;
            if (similarity_bottom_side1 && similarity_bottom_side1 >= 0
                && similarity_bottom_side2 && similarity_bottom_side2 >= 0) {
                similarity_bottom_avg = (similarity_bottom_side1 + similarity_bottom_side2) / 2;
            }

            console.log('similarity_bottom_side1', similarity_bottom_side1, "similarity_bottom_side2", similarity_bottom_side2, 'similarity_bottom_avg', similarity_bottom_avg);

            return total_similarity_avg * 0.8 + similarity_bottom_avg * 0.2; // upper is 80% and lower 20% of the total value
        }
        else return total_similarity_avg; //if noting else 
    }
}

module.exports = {
    procrustes_analysis
};
