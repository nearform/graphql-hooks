#!/bin/bash
new_packages_checksum=$(echo $(md5sum "package.json") | head -n1 | awk '{print $1;}')
for file in $(find ./packages -maxdepth 2 -name "package.json") ; do
    new_packages_checksum+=-$(echo $(md5sum $file) | head -n1 | awk '{print $1;}')
done
export GRAPHQL_HOOKS_CHECKSUM=$new_packages_checksum

# all_packages_checksum=$(<.all_packages_checksum)
# if [ $all_packages_checksum != $new_packages_checksum ]
# then
#     echo "Generating new key: $new_packages_checksum"
#     echo $new_packages_checksum > .all_packages_checksum
# else
#     echo "Using existing key: $all_packages_checksum"
# fi
