module.exports =(sequelize, DataTypes)=>{
    const RefreshToken = sequelize.define('RefreshToken', {
        token: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        expires_at: {
          type: DataTypes.DATE,
          allowNull: false,
        },
        user_id: {
          type: DataTypes.INTEGER,
          allowNull: false,
        },
        device_id: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        ip_address: {
          type: DataTypes.STRING,
          allowNull: false,
        },
      });

      RefreshToken.associate = (models) => {
        // User belongs to many groups, with additional isAdmin field
        RefreshToken.belongsTo(models.User, {foreignKey: 'user_id'});
    };
      

    return RefreshToken;
};