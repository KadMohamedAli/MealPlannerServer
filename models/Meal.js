module.exports = (sequelize, DataTypes) => {
    const Meal = sequelize.define("Meal", {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      mealNumber: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    });
  
    Meal.associate = (models) => {
      Meal.belongsTo(models.Group, {
        foreignKey: {
          allowNull: false,
        },
      });
      Meal.hasOne(models.Recipe, {
        foreignKey: 'MealId',
        as: 'recipe',
      });
    };
  
    return Meal;
  };
  