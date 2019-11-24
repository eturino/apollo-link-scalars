#!/usr/bin/env node

"use strict";

const inquirer = require("inquirer");
const path = require("path");
const replace = require("replace-in-file");
const fs = require("fs");

const commonQuestionParts = {
  type: "input",
  filter: input => `${input}`.trim().replace(/[\s]+/, " ")
};

const requiredQuestionParts = {
  ...commonQuestionParts,
  validate: input => !!`${input}`.trim()
};

/**
 * @type {inquirer.QuestionCollection}
 */
const questions = [
  {
    name: "authorName",
    message: "Enter your name:",
    ...requiredQuestionParts
  },
  {
    name: "authorEmail",
    message: "Enter your email:",
    ...requiredQuestionParts
  },
  {
    name: "githubAccount",
    message: "Enter your github account (e.g. 'somewhere'):",
    ...requiredQuestionParts
  },
  {
    name: "githubRepoName",
    message: "Enter your github repo name (e.g. 'some-lib'):",
    ...requiredQuestionParts
  },
  {
    name: "packageName",
    default: answers => `@${answers.githubAccount}/${answers.githubRepoName}`,
    message: "Enter the package name:",
    ...commonQuestionParts
  },
  {
    name: "packageDescription",
    message: "Enter the package description:",
    ...commonQuestionParts
  },
  {
    name: "codeClimateKey",
    default: "CODE_CLIMATE_KEY",
    message: "Enter your Code Climate key:",
    ...commonQuestionParts
  },
  {
    name: "codeClimateTestReporterId",
    default: "CODE_CLIMATE_TEST_REPORTER_ID",
    message: "Enter your Code Climate TestReporterId:",
    ...commonQuestionParts
  }
];

function getFilesMap() {
  const dir = path.resolve(__dirname);
  return {
    travis: path.join(dir, ".travis.yml"),
    license: path.join(dir, "LICENSE"),
    package: path.join(dir, "package.json"),
    readmeLib: path.join(dir, "README-lib.md"),
    readme: path.join(dir, "README.md")
  };
}

function replaceInFile(files, original, replacement) {
  const options = {
    files,
    from: new RegExp(original, "g"),
    to: replacement
  };
  try {
    replace.sync(options);
  } catch (error) {
    console.error("Error occurred:", error);
  }
}

function executeChanges({
  authorName,
  authorEmail,
  githubAccount,
  githubRepoName,
  packageName,
  packageNameEncoded,
  packageDescription,
  codeClimateKey,
  codeClimateTestReporterId,
  author,
  repoName,
  repoURL,
  repoURLIssues
}) {
  const filesMap = getFilesMap();
  const files = [
    filesMap.travis,
    filesMap.license,
    filesMap.package,
    filesMap.readmeLib
  ];

  const replacements = {
    __REPLACE_ME_WITH_AUTHOR_EMAIL__: authorEmail,
    __REPLACE_ME_WITH_AUTHOR_NAME__: authorName,
    __REPLACE_ME_WITH_CODE_CLIMATE_TEST_REPORTER_ID__: codeClimateTestReporterId,
    __REPLACE_ME_WITH_CODECLIMATE_KEY__: codeClimateKey,
    __REPLACE_ME_WITH_PACKAGE_DESCRIPTION__: packageDescription,
    __REPLACE_ME_WITH_PACKAGE_NAME__: packageName,
    __REPLACE_ME_WITH_PACKAGE_NAME_URL_ENCODED__: packageNameEncoded,
    __REPLACE_ME_WITH_REPO_ACCOUNT__: githubAccount,
    __REPLACE_ME_WITH_REPO_NAME__: repoName,
    __REPLACE_ME_WITH_REPO_NAME_BASE__: githubRepoName,
    __REPLACE_ME_WITH_REPO_URL__: repoURL,
    __REPLACE_ME_WITH_REPO_URL_ISSUES__: repoURLIssues
  };

  for (const original in replacements) {
    replaceInFile(files, original, replacements[original]);
  }

  console.log("Files changed: ", JSON.stringify(files, null, 2));
  fs.renameSync(filesMap.readmeLib, filesMap.readme);
  console.log(
    `${filesMap.readmeLib} renamed to ${filesMap.readme}, removing the old one`
  );
}

function runInquirer() {
  inquirer
    .prompt(questions)
    .then(
      ({
        authorName,
        authorEmail,
        githubAccount,
        githubRepoName,
        packageName,
        packageDescription,
        codeClimateKey,
        codeClimateTestReporterId
      }) => {
        const author = `${authorName} <${authorEmail}>`;
        const repoName = `${githubAccount}/${githubRepoName}`;
        const repoURL = `https://github.com/${repoName}`;
        const repoURLIssues = `${repoURL}/issues`;
        const packageNameEncoded = encodeURIComponent(packageName);

        const data = {
          authorName,
          authorEmail,
          githubAccount,
          githubRepoName,
          packageName,
          packageNameEncoded,
          packageDescription,
          codeClimateKey,
          codeClimateTestReporterId,
          author,
          repoName,
          repoURL,
          repoURLIssues
        };

        console.log("data:", JSON.stringify(data, null, 2));

        inquirer
          .prompt([
            {
              type: "confirm",
              name: "ready",
              message:
                "Are you sure that you want to continue? This will replace the file contents with the data that you supplied"
            }
          ])
          .then(({ ready }) => {
            if (ready) {
              executeChanges(data);

              console.log(
                "You can check the files and if everything is ok you can remove the `prepare-lib.js` file and make a commit."
              );
            }
          });
      }
    );
}

// RUN!
runInquirer();
