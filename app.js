const express = require('express');

const app = express();

const PORT = process.env.PORT || 3000;

const db=require("./models");

db.sequelize.sync().then(()=>{
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
      });
    }).catch(err => {
      console.error('Error connecting to the database:', err);
    });




