const { promisePool } = require('../config/database');

class Admin {
  static async findByEmail(email) {
    const [rows] = await promisePool.query(
      'SELECT id, username, email, password, full_name, role, status FROM admin_users WHERE email = ?',
      [email]
    );
    return rows;
  }
}

module.exports = Admin;