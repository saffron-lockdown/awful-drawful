import fs from 'fs';
import path from 'path';

const filename = path.join(__dirname, 'src/client/index.html');
const file = fs.readFileSync(filename, 'utf8');
const fileWithBuildId = file.replace(/__BUILD_ID__/g, new Date().toUTCString());
fs.writeFileSync(filename, fileWithBuildId);
