/**
 * Script for deleting merged git branches
 *
 * Usage:
 *  - npm run del:merged
 */

import { exec } from 'child_process';

const neverDelete = ['develop', 'master'];

exec('git branch --merged', (error, output) => {
  if (error) {
    throw error;
  }

  const branches = output
    .split('\n')
    .map((branch) => branch.trim())
    .filter((branch) => branch)
    .filter((branch) => !neverDelete.includes(branch))
    .filter((branch) => !branch.startsWith('*'));

  let deletedBranches = 0;

  for (const branch of branches) {
    exec(`git branch -d ${branch}`, (error, branchDeleteOutput) => {
      if (error) {
        throw error;
      }

      deletedBranches++;

      console.log(branchDeleteOutput);

      if (deletedBranches === branches.length) {
        console.log(
          `Removed ${deletedBranches} merged branches: \r\n\t ${branches.join('\r\n\t')}`,
        );
      }
    });
  }
});
