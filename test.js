const productFees = {
    "0": { "biasa": 0, "vip": 0, "owner": 0 },
    "TEST1": { "biasa": 1000, "vip": 500, "owner": 1500 },
    "ML1136": { "biasa": 286487, "vip": 286487 },
    "ML716": { "biasa": 179356, "vip": 179356 },
    "ML790": { "biasa": 200900, "vip": 200900 }
};
console.log(Object.keys(productFees).filter(k => k !== '0' && k !== 'TEST1'));
