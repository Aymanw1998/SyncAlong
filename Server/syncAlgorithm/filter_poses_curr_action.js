{/*  using in step 1
    1.Points come in a particular activity
    2.It is required to know the type of activity
    3.In order to filter by the points relevant to the type of operation
    e.g : Hand action will only take upper-points
*/}
const { bottom_part, upper_part, bottom_activities, upper_activities } = require('./points_parts');

// const filterByKeyPoints = (pose_peer, parts) => {
//     let is_null_arr = pose_peer.find(el => el === null);
//     if (is_null_arr) {
//         console.log(`pose_peer-nulls, ${pose_peer}`.red.bold);
//         return null;
//     }

//     let result = [];
//     let poses = [];
//     for (const i in pose_peer) { // [ [],[],[], null ]
//         result = [];
//         if (pose_peer[i] === null) {
//             console.log(`pose_peer-nulls, ${pose_peer}`.red.bold);
//             return null;
//         }
//         for (const j in parts) {
//             let index = parts[j];
//             //console.log(index, i, 'peer');
//             result.push(pose_peer[i][index]);
//         }
//         poses.push(result);
//     }
//     return poses;
// }

const filterByKeyPoints = (pose_peer, parts) => {
    let is_null_arr = pose_peer.find(el => el === null);
    if (is_null_arr) {
        console.log(`pose_peer-nulls, ${pose_peer}`.red.bold);
        return null;
    }
    let result = [];
    let poses = [];
    for (const i in pose_peer) { // [ [],[],[], null ] // [ [] ]
        result = [];
        if (pose_peer[i] === null) {
            console.log(`pose_peer-nulls, ${pose_peer}`.red.bold);
            return null;
        }
        for (const j in parts) {
            let index = parts[j];
            if (pose_peer.length === 33) {
                result.push(pose_peer[index]);
            }
            else
                result.push(pose_peer[i][index]);
        }
        poses.push(result);
    }
    return poses;
}

const filter_poses_curr_action = (curr_activity, pose_peer1, pose_peer2) => {
    let in_upper, in_bottom = null;
    in_upper = upper_activities.find(activity => activity === curr_activity);
    in_bottom = bottom_activities.find(activity => activity === curr_activity);

    let filtered_pose1 = [];
    let filtered_pose2 = [];
    let filtered_pose_1 = [];
    let filtered_pose_2 = [];
    let is_all_body = false;

    // console.log('22', in_upper, in_bottom, curr_activity, curr_activity.includes("right"));
    // console.log('pose_peer1[11]', pose_peer1[11]); //aray of arrys 0:[{}{}{}{}].len=33
    // console.log('pose_peer1[0]', pose_peer1[0]);


    if ((in_upper && in_bottom) || (!in_upper && !in_bottom)) { //activity in all body parts 
        is_all_body = true;
        let all_parts_bottom = [];
        let all_parts_upper = [];
        all_parts_upper.push(...upper_part.left_hand)
        all_parts_upper.push(...upper_part.right_hand)
        all_parts_bottom.push(...[27]);
        all_parts_bottom.push(...[28])
        // all_parts.push(...[bottom_part.left_leg])
        //  all_parts.push(...bottom_part.right_leg)

        filtered_pose1 = filterByKeyPoints(pose_peer1, all_parts_bottom);
        filtered_pose2 = filterByKeyPoints(pose_peer2, all_parts_bottom);
        filtered_pose_1 = filterByKeyPoints(pose_peer1, all_parts_upper);
        filtered_pose_2 = filterByKeyPoints(pose_peer2, all_parts_upper);
    }
    else if (in_upper && curr_activity.includes("left")) {
        filtered_pose1 = filterByKeyPoints(pose_peer1, upper_part.left_hand);
        filtered_pose2 = filterByKeyPoints(pose_peer2, upper_part.left_hand);
    }
    else if (in_upper && curr_activity.includes("right")) {
        console.log('here right......', upper_part.right_hand);
        filtered_pose1 = filterByKeyPoints(pose_peer1, upper_part.right_hand);
        filtered_pose2 = filterByKeyPoints(pose_peer2, upper_part.right_hand);
    }
    else if (in_upper && !curr_activity.includes("right") && !curr_activity.includes("left")) {
        let both_hands = []
        both_hands.push(...upper_part.left_hand)
        both_hands.push(...upper_part.right_hand)
        filtered_pose1 = filterByKeyPoints(pose_peer1, both_hands);
        filtered_pose2 = filterByKeyPoints(pose_peer2, both_hands);
    }

    else if (bottom_part && curr_activity.includes("left")) {
        filtered_pose1 = filterByKeyPoints(pose_peer1, bottom_part.left_leg);
        filtered_pose2 = filterByKeyPoints(pose_peer2, bottom_part.left_leg);
    }
    else if (bottom_part && curr_activity.includes("right")) {
        filtered_pose1 = filterByKeyPoints(pose_peer1, bottom_part.right_leg);
        filtered_pose2 = filterByKeyPoints(pose_peer2, bottom_part.right_leg);
    }
    else if (bottom_part && !curr_activity.includes("right") && !curr_activity.includes("left")) {
        let both_legs = []
        // both_legs.push(...bottom_part.left_leg)
        // both_legs.push(...bottom_part.right_leg)
        both_legs.push(...[27]);
        both_legs.push(...[28])
        filtered_pose1 = filterByKeyPoints(pose_peer1, both_legs);
        filtered_pose2 = filterByKeyPoints(pose_peer2, both_legs);
    }

    let me = filtered_pose1 ? { poses: filtered_pose1 } : null
    let you = filtered_pose2 ? { poses: filtered_pose2 } : null
    let me_upper = filtered_pose_1 ? { poses: filtered_pose_1 } : null
    let you_upper = filtered_pose_2 ? { poses: filtered_pose_2 } : null

    if (!me || !you) return null;
    if (is_all_body) {
        if (!me_upper || !you_upper) return null;
        return { me, you, me_upper, you_upper };
    }
    return { me, you }; //return filtered poses 
}

module.exports = {
    filter_poses_curr_action,
    filterByKeyPoints
};