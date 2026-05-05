const bcrypt = require('bcryptjs');
const { promisePool } = require('./config/database');

const createTestAdmin = async () => {
  try {
    const username = 'testadmin';
    const email = 'testadmin@test.com';
    const plainPassword = 'Admin123';
    const fullName = 'Test Admin';

    // Hash password
    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    // Insert admin user
    const query = 'INSERT INTO admin_users (username, email, password, full_name, role, status) VALUES (?, ?, ?, ?, ?, ?)';
    await promisePool.execute(query, [username, email, hashedPassword, fullName, 'admin', 'active']);

    console.log('✅ Test admin created successfully!');
    console.log('Email:', email);
    console.log('Password:', plainPassword);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating test admin:', error);
    process.exit(1);
  }
};

createTestAdmin();
