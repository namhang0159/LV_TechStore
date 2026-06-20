const inventoryService = require("./src/services/inventoryService");
async function test() {
  try {
    const res = await inventoryService.getTransactionByIdService(1);
    console.log("Success:", JSON.stringify(res, null, 2));
  } catch (error) {
    console.error("Failed:", error);
  }
}
test();
