#!/bin/bash
packages_checksum=$(echo $(md5sum "package.json") | head -n1 | awk '{print $1;}')
for file in $(find ./packages -maxdepth 2 -name "package.json") ; do
    packages_checksum+=_$(echo $(md5sum $file) | head -n1 | awk '{print $1;}')
done
export GRAPHQL_HOOKS_CHECKSUM=$packages_checksum
echo $packages_checksum
