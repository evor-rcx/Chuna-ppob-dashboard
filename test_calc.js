let y = 60;
y += 40;
y += 50;
y += 80;
y += 50;
const lines = [[1,2],[1,2],[1,2],[1,2],[1,2],[1,2]];
for (const [label, val] of lines) {
    y += 45;
}
y += 20; y += 140; // nota token
y += 20; y += 110; // total
y += 150; // nota footer
y += 40; y += 30; y += 25; y += 25;
console.log(y + 50);
