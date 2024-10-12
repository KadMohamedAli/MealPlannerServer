module.exports = (sequelize, DataTypes) => {
    const User = sequelize.define('User', {
        username: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
    });

    // Define associations
    User.associate = (models) => {
        // User belongs to many groups, with additional isAdmin field
        User.belongsToMany(models.Group, { through: models.UserGroup,
            foreignKey: 'userId',
         });
        
        // User belongs to many meals, with an additional score field
        User.belongsToMany(models.Meal, { through: models.UserMeal });
    };
    
    return User;
};
