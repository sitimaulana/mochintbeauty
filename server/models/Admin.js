const { promisePool } = require('../config/database');

class Admin {
  static async findByEmail(email) {
    const [rows] = await promisePool.query(
      'SELECT id, username, email, password, role FROM admin_users WHERE email = ?',
      [email]
    );
    return rows;
  }
}

module.exports = Admin;