function test() {
  const quantity = 3;
  const freeCount = Math.floor(quantity / 3);
  const paidCount = quantity - freeCount;
  console.log("Qty:", quantity, "Paid:", paidCount, "Free:", freeCount);
}
test();
