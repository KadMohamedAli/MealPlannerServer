module.exports = (sequelize) => {
    const RecipeIngredient = sequelize.define('RecipeIngredient', {}, { timestamps: false });
  
    return RecipeIngredient;
  };
  