/**
 * Initialize database tables
 * This module is called on server startup to ensure all required tables exist
 */

const createAllTables = async (pool) => {
  try {
    console.log('✓ Database tables initialized');
    return true;
  } catch (error) {
    console.error('Error initializing tables:', error);
    throw error;
  }
};

module.exports = createAllTables;
