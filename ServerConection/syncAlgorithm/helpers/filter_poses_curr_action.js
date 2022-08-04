{/*  using in step 1
    1.Points come in a particular activity
    2.It is required to know the type of activity
    3.In order to filter by the points relevant to the type of operation
    e.g : Hand action will only take upper-points
*/}
const { bottom_part, upper_part, bottom_activities, upper_activities } = require('./points_parts');

const filterByKeyPoints = (pose_peer, parts) => {
    let is_null_arr = pose_peer.find(el => el === null);
    if (is_null_arr) {
        console.log(`pose_peer-nulls, ${pose_peer}`.red.bold);
        return null;
    }
    let result = [];
    result = [];

    for (const i in pose_peer) { //  case to handel : [ [],[],[], null ] // [ [] ]
        if (pose_peer[i] === null) {
            console.log(`pose_peer-nulls, ${pose_peer}`.red.bold);
            return null;
        }
        if (parts.find(el => el.toString() === i)) {
            result.push(pose_peer[i]);
        }
    }
    return result;
}

const filter_poses_curr_action = (curr_activity, pose_peer1, pose_peer2) => {
    let in_upper, in_bottom = null;
    in_upper = upper_activities.find(activity => activity === curr_activity);
    in_bottom = bottom_activities.find(activity => activity === curr_activity);

    //For Case: Both hands/Both legs 
    let filtered_left_1 = [];
    let filtered_right_1 = [];
    let filtered_left_2 = [];
    let filtered_right_2 = [];

    //For Case:  all body : buttom+upeer
    let filtered_left_1_bottom = [];
    let filtered_right_1_bottom = [];
    let filtered_left_2_bottom = [];
    let filtered_right_2_bottom = [];

    let is_all_body = false;

    // console.log('22', in_upper, in_bottom, curr_activity, curr_activity.includes("right"));
    // console.log('pose_peer1[11]', pose_peer1[11]); //aray of arrys 0:[{}{}{}{}].len=33
    // console.log('pose_peer1[0]', pose_peer1[0]);


    if ((in_upper && in_bottom) || (!in_upper && !in_bottom)) { //activity in all body parts 
        is_all_body = true;
        //bottom: 
        filtered_left_1_bottom = filterByKeyPoints(pose_peer1, bottom_part.left_leg);
        filtered_right_1_bottom = filterByKeyPoints(pose_peer1, bottom_part.right_leg);
        filtered_left_2_bottom = filterByKeyPoints(pose_peer2, bottom_part.left_leg);
        filtered_right_2_bottom = filterByKeyPoints(pose_peer2, bottom_part.right_leg);

        //Upper:
        filtered_left_1 = filterByKeyPoints(pose_peer1, upper_part.left_hand);
        filtered_right_1 = filterByKeyPoints(pose_peer1, upper_part.right_hand);
        filtered_left_2 = filterByKeyPoints(pose_peer2, upper_part.left_hand);
        filtered_right_2 = filterByKeyPoints(pose_peer2, upper_part.right_hand);
    }
    else if (in_upper && curr_activity.includes("left")) {
        console.log('left in_upper', upper_part.left_hand);
        filtered_left_1 = filterByKeyPoints(pose_peer1, upper_part.left_hand);
        filtered_left_2 = filterByKeyPoints(pose_peer2, upper_part.left_hand);
    }
    else if (in_upper && curr_activity.includes("right")) {
        console.log('here right......', upper_part.right_hand);
        filtered_right_1 = filterByKeyPoints(pose_peer1, upper_part.right_hand);
        filtered_right_2 = filterByKeyPoints(pose_peer2, upper_part.right_hand);
    }
    else if (in_upper && !curr_activity.includes("right") && !curr_activity.includes("left")) {
        filtered_left_1 = filterByKeyPoints(pose_peer1, upper_part.left_hand);
        filtered_right_1 = filterByKeyPoints(pose_peer1, upper_part.right_hand);
        filtered_left_2 = filterByKeyPoints(pose_peer2, upper_part.left_hand);
        filtered_right_2 = filterByKeyPoints(pose_peer2, upper_part.right_hand);
    }
    else if (bottom_part && curr_activity.includes("left")) {
        console.log('left bottom_part', bottom_part.left_leg);
        filtered_left_1 = filterByKeyPoints(pose_peer1, bottom_part.left_leg);
        filtered_left_2 = filterByKeyPoints(pose_peer2, bottom_part.left_leg);
    }
    else if (bottom_part && curr_activity.includes("right")) {
        console.log('right', bottom_part);
        filtered_right_1 = filterByKeyPoints(pose_peer1, bottom_part.right_leg);
        filtered_right_2 = filterByKeyPoints(pose_peer2, bottom_part.right_leg);
    }
    else if (bottom_part && !curr_activity.includes("right") && !curr_activity.includes("left")) {
        console.log('allllllll', bottom_part);
        filtered_left_1 = filterByKeyPoints(pose_peer1, bottom_part.left_leg);
        filtered_right_1 = filterByKeyPoints(pose_peer1, bottom_part.right_leg);
        filtered_left_2 = filterByKeyPoints(pose_peer2, bottom_part.left_leg);
        filtered_right_2 = filterByKeyPoints(pose_peer2, bottom_part.right_leg);
    }

    let me = null;
    let you = null;
    let me_bottom = null;
    let you_bottom = null;

    //for me:
    if (filtered_left_1.length !== 0) {
        me = { side1: { poses: filtered_left_1 } };
        if (filtered_right_1.length !== 0) { me.side2 = { poses: filtered_right_1 } }
    }
    else if (!me && filtered_left_1.length === 0 && filtered_right_1.length !== 0) {
        me = { side1: { poses: filtered_right_1 } }
    }

    //for you:
    if (filtered_left_2.length !== 0) {
        you = { side1: { poses: filtered_left_2 } };
        if (filtered_right_2.length !== 0) { you.side2 = { poses: filtered_right_2 } }
    }
    else if (!you && filtered_left_2.length === 0 && filtered_right_2.length !== 0) {
        you = { side1: { poses: filtered_right_2 } }
    }

    //Case all body:
    //me:
    if (filtered_left_1_bottom.length !== 0) {
        me_bottom = { side1: { poses: filtered_left_1_bottom } };
        if (filtered_right_1_bottom.length !== 0) { me_bottom.side2 = { poses: filtered_right_1_bottom } }
    }
    //you:
    if (filtered_left_2_bottom.length !== 0) {
        you_bottom = { side1: { poses: filtered_left_2_bottom } };
        if (filtered_right_2_bottom.length !== 0) { you_bottom.side2 = { poses: filtered_right_2_bottom } }
    }

    // console.log('me', me);
    // console.log('you', you);
    // console.log('me_bottom', me_bottom);
    // console.log('you_bottom', you_bottom);

    if (!me || !you) return null;
    if (is_all_body) {
        if (!me_bottom || !you_bottom) return null;
        return { me, you, me_bottom, you_bottom };
    }
    return { me, you }; //return filtered poses 
}

module.exports = {
    filter_poses_curr_action,
    filterByKeyPoints
};