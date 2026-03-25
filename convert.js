const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Definisci la cartella dove tieni le immagini (se sono nella root, metti '.')
const directoryPath = path.join(__dirname, '.'); 

fs.readdir(directoryPath, (err, files) => {
    if (err) {
        return console.log('Errore nella lettura della cartella: ' + err);
    }

    files.forEach(file => {
        // Cerca solo file jpg, jpeg o png
        if (file.match(/\.(jpg|jpeg|png)$/i)) {
            const inputFile = path.join(directoryPath, file);
            const outputFile = path.join(directoryPath, `${path.parse(file).name}.webp`);

            // Converte e comprime all'80% di qualità
            sharp(inputFile)
                .webp({ quality: 80 }) 
                .toFile(outputFile)
                .then(() => console.log(`Convertito con successo: ${file} -> ${path.parse(file).name}.webp`))
                .catch(err => console.error(`Errore con ${file}:`, err));
        }
    });
});