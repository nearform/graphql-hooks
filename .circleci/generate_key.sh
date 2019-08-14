#!/bin/bash
packages_checksum=$(echo $(checksum "package.json") | head -n1 | awk '{print $1;}')
for file in $(find ./packages -maxdepth 2 -name "package.json") ; do
    packages_checksum+=_$(echo $(checksum $file) | head -n1 | awk '{print $1;}')
done
echo $packages_checksum
