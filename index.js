const { readFile } = require('fs');
const program = require('commander');
const { parse, unparse } = require('papaparse');
const { version } = require('./package.json');

const customHelp = () => {
  process.stdout.write('\n');
  process.stdout.write('Examples:\n');
  process.stdout.write(' $ node index myfile.csv 1  # Process the second column in myfile.csv\n');
  process.stdout.write(' $ node index data.csv 4 5  # Process the fourth and fifth columns in data.csv\n');
};

const run = (filename, iCols) => {
  readFile(filename, (err, buffer) => {
    if (err) {
      process.stderr.write(err.toString());
    } else {
      const data = buffer.toString();
      const parsed = parse(data, { header: true });

      if (parsed.errors.length > 0) {
        process.stderr.write(JSON.stringify(parsed.errors));
      } else {
        iCols.forEach((i) => {
          const column = parsed.meta.fields[i];
          const items = parsed.data.reduce((acc, cur) => {
            const split = cur[column].split(', ');

            split.forEach((item) => {
              if (!acc.includes(item)) acc.push(item);
            });

            return acc;
          }, [])
            .filter(item => item !== '')
            .sort();

          parsed.data.forEach((row) => {
            items.forEach((item) => {
              if (row[column].includes(item)) {
                row[item] = 1;
              } else {
                row[item] = 0;
              }
            });
          });
        });
        // console.log(parsed.data);
        process.stdout.write(unparse(parsed.data));
      }
    }
  });
};

program
  .version(version)
  .arguments('<filename> <columns...>')
  .on('--help', customHelp)
  .action(run)
  .parse(process.argv);
