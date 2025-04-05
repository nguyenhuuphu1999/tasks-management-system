
// This file will execute the updatePackageJson.js script
import { exec } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const scriptPath = path.join(__dirname, 'updatePackageJson.js');
console.log(`Executing script at: ${scriptPath}`);

exec(`node ${scriptPath}`, (error, stdout, stderr) => {
  if (error) {
    console.error(`Error executing script: ${error.message}`);
    return;
  }
  if (stderr) {
    console.error(`Script error: ${stderr}`);
    return;
  }
  console.log(`Script output: ${stdout}`);
});
