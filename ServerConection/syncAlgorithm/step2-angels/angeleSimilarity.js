const { is_positiv } = require('./utils');

const angelesSimilarity = (angleMe, angleYou) => {
    if (!angleMe.angle1 && !angleYou.angle1) return 0;
    if (is_positiv(angleMe.angle1) && !is_positiv(angleYou.angle1)) return 0; //non similarity 

    let difference;

    if (is_positiv(angle1) && is_positiv(angle2)) difference = angle1 - angle2;
    else difference = angle1 - angle2;

    if (difference => 0 || difference <= 30) return 1 //similar
    else return 0; //non similar
}

module.exports = {
    angelesSimilarity
};
