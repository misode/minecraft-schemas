#!/bin/bash

for version in "$@"
do
  cd "java/$version"
  echo "===== $version ====="
  npm version patch
  npm publish
  cd ../../
done
