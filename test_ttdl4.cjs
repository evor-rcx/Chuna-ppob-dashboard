const result = {
  "video": [
    "https://dl.tiktokio.com/download?token=atHsRx0cccHM6Ly92MTYudG9rY2RuLmNvbS84MmM3YzY5YWU0ZDY5M2Y1NDRmYzcxMWNkM2U2NmU1Ny82YTUwMzYwMC83NjYwODgxNTI0ODA3NjE3ODEyX29yaWdpbmFsLm1wNDE3ODQ4MTYwODUO0O0O&p=dtGslxrcacW8uY29tMTc4NDgxNjA4NQO0O0OO0O0O"
  ]
};
const u = "https://dl.tiktokio.com/download?token=atHsRx0cccHM6Ly92MTYudG9rY2RuLmNvbS84MmM3YzY5YWU0ZDY5M2Y1NDRmYzcxMWNkM2U2NmU1Ny82YTUwMzYwMC83NjYwODgxNTI0ODA3NjE3ODEyX29yaWdpbmFsLm1wNDE3ODQ4MTYwODUO0O0O&p=dtGslxrcacW8uY29tMTc4NDgxNjA4NQO0O0OO0O0O";
const lu = u.toLowerCase();
const isVideo = true;

const res = isVideo && (lu.includes('.mp4') || lu.includes('video') || result?.mp4 === u || (result?.video && JSON.stringify(result.video).includes(u)));
console.log(res);

