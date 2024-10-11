module.exports = (sequelize, DataTypes) => {
    const UserMeal = sequelize.define('UserMeal', {
        score: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
    });

    return UserMeal;
};
