module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add password column
    await queryInterface.addColumn('users', 'password', {
      type: Sequelize.STRING,
      allowNull: true,
      after: 'email'
    });

    // Add last_login_at column
    await queryInterface.addColumn('users', 'last_login_at', {
      type: Sequelize.DATE,
      allowNull: true,
      after: 'refresh_token'
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Remove columns
    await queryInterface.removeColumn('users', 'password');
    await queryInterface.removeColumn('users', 'last_login_at');
  }
};