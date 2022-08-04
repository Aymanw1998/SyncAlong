{/* 
    Euclidean Distance, Scaling and Transformation 
    bacied Procrustes analysis.
    link-info: https://en.wikipedia.org/wiki/Procrustes_analysis
*/}
const { shapeSimilarity } = require('./shapeSimilarity');
const { filter_poses_curr_action } = require('./helpers/filter_poses_curr_action');
const { getActivityBottom } = require('./helpers/points_parts');


const syncSimilarity = (data) => {
    let is_bottom = getActivityBottom(data.activity);
    if (data.you.poses === undefined || data.me.poses === undefined) return;
    //filter peers by the curr activity and key poits
    data = filter_poses_curr_action(data.activity, data.me.poses, data.you.poses);
    if (!data) return;

    // console.log('data', is_bottom, data.me.side1.poses);
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
        if (is_bottom) similarity_side2 = shapeSimilarity(data.you.side2.poses, data.me.side2.poses, Math.PI / 12); //smaler routation :: (Math.PI / 12)*(180/Math.PI) =15 digri
        else similarity_side2 = shapeSimilarity(data.you.side2.poses, data.me.side2.poses, Math.PI / 6); //Rotates up to a third of its axis ::(Math.PI /6)*(180/Math.PI) =30 digri
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
            similarity_bottom_side1 = shapeSimilarity(data.you_bottom.side1.poses, data.me_bottom.side1.poses, Math.PI / 12); // similarityAvarag(shortestArr, data.me_upper.poses, data.you_upper.poses);
            similarity_bottom_side2 = shapeSimilarity(data.you_bottom.side2.poses, data.me_bottom.side2.poses, Math.PI / 12); // similarityAvarag(shortestArr, data.me_upper.poses, data.you_upper.poses);

            let similarity_bottom_avg = similarity_bottom_side1;
            if (similarity_bottom_side1 && similarity_bottom_side1 >= 0
                && similarity_bottom_side2 && similarity_bottom_side2 >= 0) {
                similarity_bottom_avg = (similarity_bottom_side1 + similarity_bottom_side2) / 2;
            }

            console.log('similarity_bottom_side1', similarity_bottom_side1, "similarity_bottom_side2", similarity_bottom_side2, 'similarity_bottom_avg', similarity_bottom_avg);

            return total_similarity_avg * 0.7 + similarity_bottom_avg * 0.3; // upper is 70% and lower 30% of the total value
        }
        else return total_similarity_avg; //if noting  
    }
}

module.exports = {
    syncSimilarity
};
