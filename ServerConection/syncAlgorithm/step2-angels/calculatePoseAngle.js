let userPoseAngle = null;
let down;
let repsCounter = 0;

// * calculating the angles in the user pose
const calculatePoseAngle = (a, b, c) => {
    let radians = Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x) // * fetching the radians using the atan2 function 
    let angle = radians * (180 / Math.PI) // * calculating the angle from the radian
    // need to provide dynamic values for angles as per requirement later along with the number of reps.
    if (angle > 180) { // * if the angle is greater than 180, then it is negative so changing it back to positive or an actual angle possible for a human being, lol..
        angle = 360 - angle
    }
    if (angle > 0 && angle < 180) { // * if the angle is positive, then it is a positive angle
        // console.log(angle.toFixed(2), "currentAngle");
    }
    userPoseAngle = angle.toFixed(2);
    calculateReps(userPoseAngle);
}
const calculateReps = (angle) => {
    // console.log(angle);
    if (angle >= 160) {
        down = true;
    }
    if (angle <= 40 && down) {
        down = false;
        // setRepCounter(repCounter + 1);
        repsCounter += 1;
        console.log(repsCounter, "repsCounter");
    }
    // console.log('out');
    // console.log(repsCounter, "repsCounter");
}