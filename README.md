# TypeScript Library Template

Template for bootstrapping typescript libraries. It is based on [typescript-starter](https://github.com/bitjson/typescript-starter) and the modifications done for [`@eturino/ts-key-set`](https://github.com/eturino/ts-key-set). It is quite quick-and-dirty, should be eventually replaced by a proper fork of `typescript-starter`.

## How to use it

1. Get the contents of this repo into an empty repository. You can do it by forking this repo, cloning it and remove `.git` or by cloning this in a local folder and copying all files (include the hidden files).
2. `cd` into the folder with the new contents.
3. `yarn`. This will install dependencies, included the dependencies needed for `prepare-lib`. You can also check with `yarn outdated` to see if there are updates that you could perform at this point.
4. Run `./prepare-lib.js` (executable node file)
5. Enter all the info requested and confirm the modifications of the files. This will modify the files and replace this README with the README for the lib.
6. Make an initial commit with all these changes.
7. Replace `src/my-lib` with your lib files, and replace `src/index.ts` to call your new lib files.
8. Make a commit using `commitizen` (see https://github.com/bitjson/typescript-starter#bump-version-update-changelog-commit--tag-release)
