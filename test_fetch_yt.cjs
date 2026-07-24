async function test() {
   const res = await fetch("https://c.ymcdn.org/api/v2/download/59f55c181c1da2f71d4bf6b1a0092271/dQw4w9WgXcQ?_=sMmKi2NxgCbtpTXj6bl3qTylBRyTeQ_8Z16G7Sg-ZGa06VGL28XzMHWjT3xDFRIX_gob10JvP3JnhcjQCzbISA");
   console.log("Status:", res.status);
   console.log("Size:", (await res.arrayBuffer()).byteLength);
}
test();
