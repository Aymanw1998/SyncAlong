const angleCalculation = (a, b, c) => {
    //Calculates the angle ABC (in radians) 
    let AB = Math.sqrt(Math.pow(b.x - a.x, 2) + Math.pow(b.y - a.y, 2));
    let BC = Math.sqrt(Math.pow(b.x - c.x, 2) + Math.pow(b.y - c.y, 2));
    let AC = Math.sqrt(Math.pow(c.x - a.x, 2) + Math.pow(c.y - a.y, 2));
    let radians = Math.acos((BC * BC + AB * AB - AC * AC) / (2 * BC * AB));
    //convert to degree 
    let angle = radians * (180 / Math.PI) // * calculating the angle from the radian

    if (angle > 180) { // * if the angle is greater than 180, then it is negative so changing it back to positive or an actual angle possible for a human being, lol..
        angle = 360 - angle
    }
    return angle;
}
// * calculating the angles in the user pose
const calculatePoseAngle = (poses) => {
    //i know each poses has a length of 3 points 
    console.log('0', poses[0]);
    console.log('1', poses[1]);
    console.log('2', poses[2]);

    let angle = angleCalculation(poses[0], poses[1], poses[2]);
    console.log('angle', angle);
    return angle;
}

module.exports = {
    calculatePoseAngle
};