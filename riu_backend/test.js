async function test() {
  const res = await fetch('http://localhost:8000/api/products');
  const data = await res.json();
  console.log(Object.keys(data));
  if (data.data && data.data.length > 0) {
     console.log('first product keys:', Object.keys(data.data[0]));
     console.log('ProductVariants:', data.data[0].ProductVariants);
  }
}
test();
