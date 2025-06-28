const fs = require('fs');
const path = require('path');

function listMp3Files(directory) {
  try {
    const files = fs.readdirSync(directory);
    const mp3Files = files.filter(file => 
      path.extname(file).toLowerCase() === '.mp3'
    );
    
    mp3Files.forEach(file => {
      console.log(path.join(directory, file));
    });
    
    return mp3Files;
  } catch (error) {
    console.error(`Error reading directory ${directory}:`, error.message);
    return [];
  }
}

// List MP3 files in public/songs directory
const songsDirectory = 'public/songs';
listMp3Files(songsDirectory);