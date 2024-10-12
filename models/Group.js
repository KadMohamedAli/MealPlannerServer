module.exports = (sequelize, DataTypes) => {
    const Group = sequelize.define('Group', {
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
    });

    // Define associations
    Group.associate = models => {
        // Group belongs to many users, with additional isAdmin field
        Group.belongsToMany(models.User, { through: models.UserGroup ,
            foreignKey : 'groupId',
        });
        
        // Group has many meals
        Group.hasMany(models.Meal);
    };
    
    return Group;
};
