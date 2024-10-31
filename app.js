require('dotenv').config();
const createServer =require('./utils/server');

const app = createServer();


const PORT = process.env.PORT || 3000;

const db=require("./models");

db.sequelize.sync({force : false,alter:false }).then(()=>{
    app.listen(PORT, () => {
        console.info(`Server running on port ${PORT}`);
      });
    }).catch(err => {
      console.error('Error connecting to the database:', err);
    });

    module.exports = app