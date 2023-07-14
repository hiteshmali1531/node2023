const mongoose = require('mongoose');

mongoose.connect(process.env.DB_PATH)
.then(() =>{
    console.log("conn successfully");
}).catch((err) =>{
    console.log(err);
})

