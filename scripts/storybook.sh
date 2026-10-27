#!/bin/sh
# Runs Storybook (npm run storybook / build-storybook) with a Node it supports: 20.19+ or 22.12+.
# On an older Node, it uses the project's .nvmrc version through nvm.
node -e '
  const [major, minor] = process.versions.node.split(".").map(Number);
  process.exit((major === 20 && minor >= 19) || (major === 22 && minor >= 12) || major > 22 ? 0 : 1);
' && exec npx storybook "$@"

NVM_SCRIPT="${NVM_DIR:-$HOME/.nvm}/nvm.sh"
if [ -s "$NVM_SCRIPT" ]; then
  echo "Storybook needs Node 20.19+ or 22.12+ (this is $(node -v)): using Node $(cat .nvmrc) from nvm."
  . "$NVM_SCRIPT"
  nvm exec --silent "$(cat .nvmrc)" npx storybook "$@"
  exit $?
fi

echo "Storybook needs Node 20.19+ or 22.12+, but this is $(node -v). Install Node $(cat .nvmrc) and try again." >&2
exit 1
