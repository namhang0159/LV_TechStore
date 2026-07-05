const db = require("c:/hoc/luanvan/riu_backend/src/models");

async function test() {
    console.log(Object.keys(db.Order.associations));
}
test();
