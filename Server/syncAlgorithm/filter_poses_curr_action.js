{/*  using in step 1
    1.Points come in a particular activity
    2.It is required to know the type of activity
    3.In order to filter by the points relevant to the type of operation
    e.g : Hand action will only take upper-points
*/}
const { bottom_part, upper_part, bottom_activities, upper_activities } = require('./points_parts');

const filterByKeyPoints = (pose_peer, parts) => {
    let result = [];
    let poses = [];
    for (const i in pose_peer) {
        result = [];
        for (const j in parts) {
            let index = parts[j];
            //console.log(index, 'peer', pose_peer[i][index]);
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

    // console.log('22', in_upper, in_bottom, curr_activity, curr_activity.includes("right"));
    // console.log('pose_peer1[11]', pose_peer1[11]); //aray of arrys 0:[{}{}{}{}].len=33
    // console.log('pose_peer1[0]', pose_peer1[0]);


    if (in_upper && in_bottom) { //activity in all body parts 
        let all_parts = [];
        all_parts.push(...upper_part.left_hand)
        all_parts.push(...upper_part.right_hand)
        all_parts.push(...bottom_part.left_leg)
        all_parts.push(...bottom_part.left_leg)

        filtered_pose1 = filterByKeyPoints(pose_peer1, all_parts);
        filtered_pose2 = filterByKeyPoints(pose_peer2, all_parts);
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
        both_legs.push(...bottom_part.left_leg)
        both_legs.push(...bottom_part.right_leg)
        filtered_pose1 = filterByKeyPoints(pose_peer1, both_legs);
        filtered_pose2 = filterByKeyPoints(pose_peer2, both_legs);
    }

    let me = { poses: filtered_pose1 }
    let you = { poses: filtered_pose2 }
    return { me, you }; //return filtered poses 
}

module.exports = {
    filter_poses_curr_action,
    filterByKeyPoints
};