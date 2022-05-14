{/* STEP 2
	Angles between joints of the body
*/}

const { angelesSimilarity } = require('./step2-angels/angeleSimilarity');
const { calculatePoseAngle } = require('./step2-angels/calculatePoseAngle');
const { filter_poses_curr_action } = require('./filter_poses_curr_action');


const angles_between_joints = (data) => {
    if (data.you.poses === undefined || data.me.poses === undefined) return; //iffff something wrong with passing data
    //filter peers by the curr activity and key poits
    data = filter_poses_curr_action(data.activity, data.me.poses, data.you.poses);
    if (!data) return; //doest chacks this minit

    // let shortestType, shortestArr;
    // data.me.poses.length < data.you.poses.length ? shortestType = 'me' : shortestType = 'you'
    // shortestType == 'me' ? shortestArr = data.me.poses : shortestArr = data.you.poses

    // console.log('data angles_between_joints', data);

    let anglesMe = calculatePoseAngle(data.me.side1.poses); //[{}{}{}]
    // let anglesYou = calculatePoseAngle(data.you.side1.poses);

    // let anglesMe_side2 =null;
    // let anglesYou_side2 =null;
    // if(data.me.side2 && data.you.side2){
    //     anglesMe_side2 = calculatePoseAngle(data.me.side2.poses); //[{}{}{}]
    //     anglesYou_side2 = calculatePoseAngle(data.you.side2.poses);
    // }

    // let angeleSimilarity = angelesSimilarity(anglesMe, anglesYou);
    // return angeleSimilarity;
    return;
}

module.exports = {
    angles_between_joints
};
