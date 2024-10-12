const User = require('./User');
const Group = require('./Group');

module.exports = (sequelize, DataTypes) => {
    const UserGroup = sequelize.define('UserGroup', {
        isAdmin: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        userId: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: {
            model: 'User',
            key: 'id',
          },
          primaryKey: true,
        },
        groupId: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: {
            model: 'Group',
            key: 'id',
          },
          primaryKey: true,
        },
    });

    return UserGroup;
};