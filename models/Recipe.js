module.exports = (sequelize, DataTypes) => {
    const Recipe = sequelize.define("Recipe", {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      MealId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'Meals',
          key: 'id',
        },
      },
    });
  
    Recipe.associate = (models) => {
      Recipe.belongsTo(models.Meal, {
        foreignKey: 'MealId',
        as: 'meal',
      });
      Recipe.belongsToMany(models.Ingredient, {
        through: 'RecipeIngredient',
        as: 'ingredients',
        foreignKey: 'RecipeId',
      });
    };
  
    return Recipe;
  };
  