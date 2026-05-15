const fs = require('fs');
const path = require('path');

const uploadsDir = path.join(__dirname, 'public/uploads/medical_records');

async function cleanupSmallImages() {
  try {
    console.log('\n=== CLEANING UP INVALID IMAGE FILES ===\n');

    const files = fs.readdirSync(uploadsDir);
    let deletedCount = 0;
    const MIN_FILE_SIZE = 1024; // 1KB minimum

    console.log(`📁 Scanning ${uploadsDir}`);
    console.log(`Files found: ${files.length}`);
    console.log(`Minimum valid file size: ${MIN_FILE_SIZE} bytes\n`);

    for (const file of files) {
      const filePath = path.join(uploadsDir, file);
      const stats = fs.statSync(filePath);
      const fileSizeKB = (stats.size / 1024).toFixed(2);

      if (stats.size < MIN_FILE_SIZE) {
        console.log(`❌ DELETING: ${file} (${stats.size} bytes)`);
        fs.unlinkSync(filePath);
        deletedCount++;
      } else {
        console.log(`✅ KEEP: ${file} (${fileSizeKB} KB)`);
      }
    }

    console.log(`\n📊 Results:`);
    console.log(`   Files deleted: ${deletedCount}`);
    console.log(`   Files remaining: ${files.length - deletedCount}`);

    if (deletedCount > 0) {
      console.log(`\n⚠️ Note: You may need to update medical_records in database`);
      console.log(`   to remove references to deleted image files.`);
    }

    console.log('\n✅ Cleanup completed\n');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

cleanupSmallImages();
