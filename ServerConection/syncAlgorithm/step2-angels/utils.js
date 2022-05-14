const angle = (a, b) => {
    const results = a > b ? a - b : b - a;
    return (results > 180 ? 360 - results : results) / 180;
}

// Midway between two angles as on a circle
const direction = (a, b) => {
    const large = (a > b ? a - b : b - a) > 180;
    const results = (a + b) / 2;
    return (results + (large ? (results >= 180 ? -180 : 180) : 0)) / 180;
};

// Cartesian distance score
// range [0, 1)
// x is angle, y is direction
const distance = (x0, y0, x1, y1) => {
    // direction wraps around so account for that
    if ((y0 > y1 ? y0 - y1 : y1 - y0) > 0.5) y0 += 1;

    // the `*2` is because the wrap-around distance is never more than half the interval. 
    return Math.sqrt((x0 - x1) ** 2 + ((y0 - y1) * 2) ** 2) / Math.SQRT2;
}

// Difference score for two angles, a and b
const diff = (a, b) => angle(a, b);

// Difference score for two pairs of angles [[a0, b0], [a1, b1]]
const diff2 = (a0, b0, a1, b1) => distance(
    angle(a0, b0), direction(a0, b0),
    angle(a1, b1), direction(a1, b1)
);


const is_positiv = (x) => {
    if (x >= 0) return true;
    return false;
}

module.exports = {
    is_positiv,
};