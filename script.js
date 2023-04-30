const fs = require('fs');
const csv = require('csv-parser');

function measurePerformance(callback) {
  const startTime = process.hrtime();
  const startMemoryUsage = process.memoryUsage().heapUsed;

  callback();

  const endTime = process.hrtime(startTime);
  const endMemoryUsage = process.memoryUsage().heapUsed;

  const executionTime = endTime[0] * 1000 + endTime[1] / 1000000; // Convert to milliseconds
  const memoryUsage = endMemoryUsage - startMemoryUsage;

  console.log(`Time to process: ${executionTime.toFixed(2)} ms`);
  console.log(`Memory used: ${formatBytes(memoryUsage)}`);
}

function formatBytes(bytes) {
  if (bytes === 0) {
    return '0 Bytes';
  }
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

measurePerformance(() => {

const freq = []
const inputFilePath = './t8.shakespeare.translated.txt';
fs.readFile(inputFilePath, 'utf8', (err, idata) => {
  if (err) { 
    console.error('Error reading file t8.shakespeare.translated.txt:', err); 
    return; 
  } else {
    const dictionaryFilePath = './french_dictionary.csv';

    fs.createReadStream(dictionaryFilePath)
      .pipe(csv())
      .on('data', (row) => {
        const existWord = row.english;
        const replacementWord = row.french;

        // const temp = new RegExp(existWord, 'g');
        // const existWord = 'yourWord';
        const escapedWord = existWord.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(`(?<=^|[^a-zA-Z0-9])${escapedWord}(?=[^a-zA-Z0-9]|$)`, 'gi');

        const count = idata.match(regex) != null ? idata.match(regex).length : 0;
        // console.log(existWord, replacementWord, count)
        // freq.push(String(existWord) + "," + String(replacementWord) + "," + String(count))

        // const updatedContent = idata.replace(new RegExp(existWord, 'g'), replacementWord);
        const updatedContent = idata.replace(regex, replacementWord);
        idata = updatedContent;
      })            
      .on('end', () => {
        fs.writeFileSync(inputFilePath, idata, 'utf8', (err) => {
          if (err) {
            console.error('Error writing to file t8.shakespeare.translated.txt:', err);
            return;
          } else {
            console.log('Word replaced successfully.');
          }
        });
        // console.log('csv file reading is complete.');
        // console.log(freq)
        // const filePath = './frequency.csv';
        // fs.writeFile(filePath, freq.join('\n'), err => {
        //     if (err) {
        //       console.error('Error writing to CSV file:', err);
        //     } else {
        //       console.log(`Data successfully written to ${filePath}`);
        //     }
        //   });
      });
  }
});

});