const bcrypt = require('bcryptjs');

const password = 'admin123';

bcrypt.hash(password, 10, (err, hash) => {
  if (err) {
    console.error('Error hashing password:', err);
    return;
  }
  
  console.log('Password:', password);
  console.log('Hash:', hash);
  console.log('\nGunakan hash di atas untuk update password di database:');
  console.log(`UPDATE admin_users SET password = '${hash}' WHERE email = 'admin@mochint.com';`);
});
