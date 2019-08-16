#!/bin/bash
all_packages_checksum=$(echo $(checksum "package.json") | head -n1 | awk '{print $1;}')
for file in $(find ./packages -maxdepth 2 -name "package.json") ; do
    all_packages_checksum+=-$(echo $(checksum $file) | head -n1 | awk '{print $1;}')
done
echo $all_packages_checksum