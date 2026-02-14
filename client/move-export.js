const fs = require('fs');
const path = require('path');

const source = path.join(__dirname, 'out');
const dest = path.join(__dirname, 'dist');

console.log(`Moving build artifact from ${source} to ${dest}...`);

try {
    // 1. Clean old dist
    if (fs.existsSync(dest)) {
        fs.rmSync(dest, { recursive: true, force: true });
    }

    // 2. Move out to dist
    if (fs.existsSync(source)) {
        fs.renameSync(source, dest);
        console.log('✅ Successfully renamed "out" folder to "dist"');
    } else {
        console.error('❌ Error: "out" directory not found. Did the build finish successfully?');
        process.exit(1);
    }
} catch (err) {
    console.error('❌ Failed to move build artifact:', err);
    process.exit(1);
}
