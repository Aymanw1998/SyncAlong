{/* STEP 2
    Radial Vectors from the center of the torso
	Angles between joints of the body
*/}

const {
    procrustesNormalizeCurve,
    procrustesNormalizeRotation,
    rebalanceCurve
} = require('./step1/shapeSimilarity');
// const {
//     procrustesNormalizeCurve,
//     procrustesNormalizeRotation,
//     rebalanceCurve
// } = require('curve-matcher');

const { filter_poses_curr_action, filterByKeyPoints } = require('./filter_poses_curr_action');
const { center_part, joints_keys } = require('./points_parts');

const diagonalEquation = (end_point1, end_point2) => {
    return { m, c }
}

const meetingPointDiagonals = (line1, line2) => {
    return { x, y };
}

const centerTorso = (center_points_arr) => {
    //center_points_arr= [0:[{4}], 2:[{4}], 3:....]
    let result = [];
    let right_diagonal, left_diagonal, center_point;
    for (const i in center_points_arr) {
        // Finding a diagonal by two points
        right_diagonal = diagonalEquation(center_points_arr[0], center_points_arr[2]);  //y = {m: ,c:,}
        left_diagonal = diagonalEquation(center_points_arr[1], center_points_arr[3]);

        // After I have two diagonals// Finding their meeting point
        center_point = meeting_point_diagonals(right_diagonal, left_diagonal); //{x,y}

        result.push([center_point]);
    }
    return result; //[0:[{x,y}], 1:[{x,y}], 2...] 
}

const activityDirection = (activity) => {
    let side;
    if (activity.includes("left")) side == 'left';
    else if (activity.includes("right")) side == 'right';
    else side == 'both';

    return side;
}

const angleCalculation = (angleIndex, partsIndexs, all_poses) => {
    let filter_points = filterByKeyPoints(all_poses, partsIndexs);
    //Straight length in front of the angles
    let dis = dis(partsIndexs[0], partsIndexs[2]) //ths middle in the arry is allways the needed angle 
    let angle = dis / Math.sin()
}

const angelsInJoints = (all_poses, activity) => {
    let body_part_activity = activityBodyArea(activity); //'upper','bottom,both
    let side = activityDirection(activity);
    if (body_part_activity == 'upper') {
        if (side == 'left') {
            angel = angleCalculation(joints_keys[0], upper_part.left_hand, all_poses)
            joints_keys[0] //...
        }
        if (side == 'right') joints_keys[1] //...
        if (side == 'both') joints_keys[0] && joints_keys[1] //...
    }
    if (body_part_activity == 'bottom') {
        if (side == 'left') joints_keys[2] //...
        if (side == 'right') joints_keys[3] //...
        if (side == 'both') joints_keys[2] && joints_keys[3] //...
    }
    if (body_part_activity == 'both') {
        joints_keys[0] && joints_keys[1] && joints_keys[2] && joints_keys[3] //...
    }

    for (const i in all_poses) {
        result = [];
        for (const j in parts) {
            let index = parts[j];
            result.push(pose_peer[i][index]);
        }
        poses.push(result);
    }
}
const is_positiv = (x) => {
    if (x >= 0) return true;
    return false;
}

const angeleSimilarity = (angle1, angle2) => {
    if (is_positiv(angle1) && !is_positiv(angle2)) return 0; //non similarity 
    let difference;

    if (is_positiv(angle1) && is_positiv(angle2)) difference = angle1 - angle2;
    else difference = angle1 - angle2;

    if (difference => 0 || difference <= 30) return 1 //similar
    else return 0; //non similar
}

const angles_between_joints = (data) => {
    if (data.you.poses === undefined || data.me.poses === undefined) return; //iffff something wrong with passing data
    //filter peers by the curr activity and key poits
    data = filter_poses_curr_action(data.activity, data.me.poses, data.you.poses);
    if (!data) return; //doest chacks this minit

    console.log('data angles_between_joints', data);
    //step1 - Euclidean Distance, Scaling and Transformation
    const curve1 = data.me.poses;
    const curve2 = data.you.poses;
    // first rebalance and normalize scale and translation of the curves
    const normalizedCurve1 = procrustesNormalizeCurve(curve1, { numPoints: 50 });
    const normalizedCurve2 = procrustesNormalizeCurve(curve2, { numPoints: 50 });

    console.log('normalizedCurve1', normalizedCurve1, "normalizedCurve2", normalizedCurve2);
    // rotate normalizedCurve1 to match normalizedCurve2
    const rotatedCurve1 = procrustesNormalizeRotation(
        normalizedCurve1,
        normalizedCurve2
    );
    console.log('rotatedCurve1', rotatedCurve1);

    let angles1 = angelsInJoints(data.me.poses, data.activity);
    let angles2 = angelsInJoints(data.you.poses, data.activity);

    let angeleSimilarity = angeleSimilarity(angles1, angles2);
    return angeleSimilarity;
}

module.exports = {
    angles_between_joints
};
