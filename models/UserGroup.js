module.exports = (sequelize, DataTypes) => {
    const UserGroup = sequelize.define('UserGroup', {
        isAdmin: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
    });

    return UserGroup;
};