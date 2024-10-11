module.exports = (sequelize, DataTypes) => {
    const Ingredient = sequelize.define("Ingredient", {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      quantity: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    });
  
    Ingredient.associate = (models) => {
      Ingredient.belongsToMany(models.Recipe, {
        through: 'RecipeIngredient',
        as: 'recipes',
        foreignKey: 'IngredientId',
      });
    };
  
    return Ingredient;
  };
  