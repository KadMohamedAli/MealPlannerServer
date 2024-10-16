const express = require('express');
const AuthRoutes = require('./routes/AuthRoutes');
const GroupRoutes = require('./routes/GroupRoutes');
const MealRoutes = require('./routes/MealRoutes');
const UpdateRoutes = require('./routes/UpdateRoutes.js');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

app.use('/auth', AuthRoutes);
app.use('/groups', GroupRoutes);
app.use('/meals', MealRoutes);
app.use('/update',UpdateRoutes);


const PORT = process.env.PORT || 3000;

const db=require("./models");

db.sequelize.sync({alter : false }).then(()=>{
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
      });
    }).catch(err => {
      console.error('Error connecting to the database:', err);
    });




