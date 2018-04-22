import * as fs from 'fs';

function process(contents: string): { [key: string]: number } {
  const lines = contents.split('\n');
  const result: { [algo: string]: number } = {};
  const multipliers: { [key: string]: number } = {
    '': 0.001,
    G: 1_000_000,
    M: 1_000,
    k: 1,
  };

  for (const line of lines) {
    const matches = /GPU #[0-9]+: ([A-Za-z0-9]+) hashrate = ([0-9.]+) (k|M|G|)H\/s/.exec(line);
    if (matches) {
      result[matches[1]] = (result[matches[1]] || 0) +
        (Number(matches[2]) * (multipliers[matches[3]] || 0));
    }
  }

  return result;
}

const benchmarkFile = 'benchmark.txt';
const personalRigProfileFile = 'personal-rig-profile.json';

const benchmarkContents = fs.readFileSync(benchmarkFile)
  .toString();
const newValues = process(benchmarkContents);
const personalRigProfile = JSON.parse(fs.readFileSync(personalRigProfileFile).toString());
for (const key in newValues) {
  personalRigProfile.hashrates[key] = newValues[key];
}
fs.writeFileSync(personalRigProfileFile, JSON.stringify(personalRigProfile, null, 2));
