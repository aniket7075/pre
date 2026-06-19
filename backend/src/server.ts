import 'dotenv/config';
import app from './app';
import { pool } from './config/database';

const startServer = async () => {
  try {
    // Verify DB Connection
    await pool.query('SELECT 1');
    console.log('✅ Database connected successfully');

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

