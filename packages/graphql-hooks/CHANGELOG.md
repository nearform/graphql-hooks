# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [4.5.0](https://github.com/nearform/graphql-hooks/compare/graphql-hooks@4.4.4...graphql-hooks@4.5.0) (2020-06-19)


### Bug Fixes

* correct types for useSubscription ([#513](https://github.com/nearform/graphql-hooks/issues/513)) ([7bfb996](https://github.com/nearform/graphql-hooks/commit/7bfb9967ff3fea4a9388a7354ec609981ca34a11))


### Features

* **persisted:** Add support for persisted queries. ([#493](https://github.com/nearform/graphql-hooks/issues/493)) ([099c937](https://github.com/nearform/graphql-hooks/commit/099c937df648ae9478780b913fc19d35f3d044db))
* adding reset function after useMutation ([#503](https://github.com/nearform/graphql-hooks/issues/503)) ([1b51571](https://github.com/nearform/graphql-hooks/commit/1b515718e3ae17ea5b2576aee5ef5c5e8ba29c6b))





## [4.4.4](https://github.com/nearform/graphql-hooks/compare/graphql-hooks@4.4.3...graphql-hooks@4.4.4) (2020-04-02)


### Bug Fixes

* **deps:** update dependency extract-files to v8 ([#481](https://github.com/nearform/graphql-hooks/issues/481)) ([b58c51a](https://github.com/nearform/graphql-hooks/commit/b58c51a3590a2960fb0270b88150c73d2f2abc23))
* clear errors on refetch via loading action ([#469](https://github.com/nearform/graphql-hooks/issues/469)) ([1caece3](https://github.com/nearform/graphql-hooks/commit/1caece33d5aabdf320433263d0a95f23a212e559))





## [4.4.3](https://github.com/nearform/graphql-hooks/compare/graphql-hooks@4.4.2...graphql-hooks@4.4.3) (2020-02-25)

**Note:** Version bump only for package graphql-hooks





## [4.4.2](https://github.com/nearform/graphql-hooks/compare/graphql-hooks@4.4.1...graphql-hooks@4.4.2) (2020-01-28)


### Bug Fixes

* **TS:** Add useGETForQueries to TS typings for client constructor ([#449](https://github.com/nearform/graphql-hooks/issues/449)) ([7ce5685](https://github.com/nearform/graphql-hooks/commit/7ce568564d0623cc6f8f20299db759017a066f78)), closes [#450](https://github.com/nearform/graphql-hooks/issues/450)





## [4.4.1](https://github.com/nearform/graphql-hooks/compare/graphql-hooks@4.4.0...graphql-hooks@4.4.1) (2020-01-22)


### Bug Fixes

* **TS:** Make TGraphQLError default to "object" ([#448](https://github.com/nearform/graphql-hooks/issues/448)) ([f4cdb6d](https://github.com/nearform/graphql-hooks/commit/f4cdb6dc1d5ed623c67a5633ee24f70db670a7e6))





# [4.4.0](https://github.com/nearform/graphql-hooks/compare/graphql-hooks@4.3.0...graphql-hooks@4.4.0) (2020-01-21)


### Bug Fixes

* **deps:** update dependency extract-files to v7 ([#435](https://github.com/nearform/graphql-hooks/issues/435)) ([b5de6df](https://github.com/nearform/graphql-hooks/commit/b5de6dfe1d6bc5baf5e19cd6f1407426919319d2))


### Features

* **TS:** Improve Typescript definition to allow custom type for 'GraphQLErrors' result ([#425](https://github.com/nearform/graphql-hooks/issues/425)) ([4352e63](https://github.com/nearform/graphql-hooks/commit/4352e63481ab907ac14f1215a734d94de970a6ae))





# [4.3.0](https://github.com/nearform/graphql-hooks/compare/graphql-hooks@4.2.0...graphql-hooks@4.3.0) (2019-12-12)


### Features

* separate onError and logErrors config options ([#419](https://github.com/nearform/graphql-hooks/issues/419)) ([b125275](https://github.com/nearform/graphql-hooks/commit/b125275de6a5804b73907c53152d20d97207a94e))
* support file upload in NodeJS ([#422](https://github.com/nearform/graphql-hooks/issues/422)) ([5f1174e](https://github.com/nearform/graphql-hooks/commit/5f1174e08526ca10d4d3acaff20c73674e7c4a2d))





# [4.2.0](https://github.com/nearform/graphql-hooks/compare/graphql-hooks@4.1.2...graphql-hooks@4.2.0) (2019-12-02)


### Features

* Subscription support ([#415](https://github.com/nearform/graphql-hooks/issues/415)) ([5f49945](https://github.com/nearform/graphql-hooks/commit/5f499457f39043afef2f4730402d5eea1070c44f))





## [4.1.2](https://github.com/nearform/graphql-hooks/compare/graphql-hooks@4.1.1...graphql-hooks@4.1.2) (2019-11-28)


### Bug Fixes

* FetchData and UseQueryOptions typings ([#413](https://github.com/nearform/graphql-hooks/issues/413)) ([d7798cf](https://github.com/nearform/graphql-hooks/commit/d7798cfb7245cc562a30b01f706c34241f069384))
* Update tests ([#412](https://github.com/nearform/graphql-hooks/issues/412)) ([67d4981](https://github.com/nearform/graphql-hooks/commit/67d4981ebc3bbf6364747599b58088074e733e48))





## [4.1.1](https://github.com/nearform/graphql-hooks/compare/graphql-hooks@4.1.0...graphql-hooks@4.1.1) (2019-11-28)


### Bug Fixes

* SSR infinite loop when skipCache=true ([#411](https://github.com/nearform/graphql-hooks/issues/411)) ([f3d0a2d](https://github.com/nearform/graphql-hooks/commit/f3d0a2d0447fe67dd3ec99dd6b962b1a2906fc10)), closes [#396](https://github.com/nearform/graphql-hooks/issues/396) [#396](https://github.com/nearform/graphql-hooks/issues/396)





# [4.1.0](https://github.com/nearform/graphql-hooks/compare/graphql-hooks@4.0.2...graphql-hooks@4.1.0) (2019-11-27)


### Bug Fixes

* request options param is optional ([#329](https://github.com/nearform/graphql-hooks/issues/329)) ([5de13b1](https://github.com/nearform/graphql-hooks/commit/5de13b18e26d7615da134c41f84864213a00f94d))
* Use generics in GraphQLClient.request method to allow developers to specify the type of response data ([#397](https://github.com/nearform/graphql-hooks/issues/397)) ([2df05b4](https://github.com/nearform/graphql-hooks/commit/2df05b4d479c4a0798b96bb548d0288deb00b93d))


### Features

* HTTP GET Support ([#410](https://github.com/nearform/graphql-hooks/issues/410)) ([0703076](https://github.com/nearform/graphql-hooks/commit/0703076f3408dc522c7f16fca52f09d37e0a79b6))





## [4.0.2](https://github.com/nearform/graphql-hooks/compare/graphql-hooks@4.0.1...graphql-hooks@4.0.2) (2019-10-24)


### Bug Fixes

* publishing issues ([#389](https://github.com/nearform/graphql-hooks/issues/389)) ([7e1c4a2](https://github.com/nearform/graphql-hooks/commit/7e1c4a2ba8a6c08d09139733b2b897b81374fbac))
* Server-side rendering ([#382](https://github.com/nearform/graphql-hooks/issues/382)) ([7256bde](https://github.com/nearform/graphql-hooks/commit/7256bde4e52fc78479c887c7671eb7fb82cbd0d0)), closes [#371](https://github.com/nearform/graphql-hooks/issues/371)





## [4.0.1](https://github.com/nearform/graphql-hooks/compare/graphql-hooks@4.0.0...graphql-hooks@4.0.1) (2019-10-04)


### Bug Fixes

* Add support for generic Variables TS type fixes [#348](https://github.com/nearform/graphql-hooks/issues/348) ([#353](https://github.com/nearform/graphql-hooks/issues/353)) ([4c91939](https://github.com/nearform/graphql-hooks/commit/4c91939))





# [4.0.0](https://github.com/nearform/graphql-hooks/compare/graphql-hooks@3.6.1...graphql-hooks@4.0.0) (2019-08-20)

**Note:** Version bump only for package graphql-hooks





## [3.6.1](https://github.com/nearform/graphql-hooks/compare/graphql-hooks@3.6.0...graphql-hooks@3.6.1) (2019-08-05)

**Note:** Version bump only for package graphql-hooks





# [3.6.0](https://github.com/nearform/graphql-hooks/compare/graphql-hooks@3.5.1...graphql-hooks@3.6.0) (2019-06-21)


### Features

* Add support for GraphQL multipart requests ([#266](https://github.com/nearform/graphql-hooks/issues/266)) ([09ef420](https://github.com/nearform/graphql-hooks/commit/09ef420))





## [3.5.1](https://github.com/nearform/graphql-hooks/compare/graphql-hooks@3.5.0...graphql-hooks@3.5.1) (2019-06-08)

**Note:** Version bump only for package graphql-hooks





# [3.5.0](https://github.com/nearform/graphql-hooks/compare/graphql-hooks@3.4.2...graphql-hooks@3.5.0) (2019-04-12)


### Features

* add optional type annotations ([#202](https://github.com/nearform/graphql-hooks/issues/202)) ([6e50e04](https://github.com/nearform/graphql-hooks/commit/6e50e04))





## [3.4.2](https://github.com/nearform/graphql-hooks/compare/graphql-hooks@3.4.1...graphql-hooks@3.4.2) (2019-04-08)


### Bug Fixes

* Fix type declarations for logErrorResult & onError ([#175](https://github.com/nearform/graphql-hooks/issues/175)) ([8a37061](https://github.com/nearform/graphql-hooks/commit/8a37061))
* query must be a string error ([#199](https://github.com/nearform/graphql-hooks/issues/199)) ([d58b1af](https://github.com/nearform/graphql-hooks/commit/d58b1af))





## [3.4.1](https://github.com/nearform/graphql-hooks/compare/graphql-hooks@3.4.0...graphql-hooks@3.4.1) (2019-03-22)


### Bug Fixes

* race condition bug ([#153](https://github.com/nearform/graphql-hooks/issues/153)) ([fdff313](https://github.com/nearform/graphql-hooks/commit/fdff313))





# [3.4.0](https://github.com/nearform/graphql-hooks/compare/graphql-hooks@3.3.3...graphql-hooks@3.4.0) (2019-03-18)


### Features

* add a TypeScript declaration file for graphql-hooks ([#135](https://github.com/nearform/graphql-hooks/issues/135)) ([49787fc](https://github.com/nearform/graphql-hooks/commit/49787fc))





## [3.3.3](https://github.com/nearform/graphql-hooks/compare/graphql-hooks@3.3.2...graphql-hooks@3.3.3) (2019-03-13)

**Note:** Version bump only for package graphql-hooks





## [3.3.2](https://github.com/nearform/graphql-hooks/compare/graphql-hooks@3.3.1...graphql-hooks@3.3.2) (2019-03-13)


### Bug Fixes

* default loading state for useManualQuery ([#132](https://github.com/nearform/graphql-hooks/issues/132)) ([c18fc15](https://github.com/nearform/graphql-hooks/commit/c18fc15))





## [3.3.1](https://github.com/nearform/graphql-hooks/compare/graphql-hooks@3.3.0...graphql-hooks@3.3.1) (2019-03-12)


### Bug Fixes

* throw an error if client.cache isn't provided in ssrMode ([#124](https://github.com/nearform/graphql-hooks/issues/124)) ([ece277d](https://github.com/nearform/graphql-hooks/commit/ece277d))





# [3.3.0](https://github.com/nearform/graphql-hooks/compare/graphql-hooks@3.2.5...graphql-hooks@3.3.0) (2019-03-07)


### Features

* cjs, es & umd bundles for graphql-hooks-memcache ([#109](https://github.com/nearform/graphql-hooks/issues/109)) ([9dd1004](https://github.com/nearform/graphql-hooks/commit/9dd1004))





## [3.2.5](https://github.com/nearform/graphql-hooks/compare/graphql-hooks@3.2.4...graphql-hooks@3.2.5) (2019-03-06)


### Bug Fixes

* Handle unmounting whilst request is in flight ([#96](https://github.com/nearform/graphql-hooks/issues/96)) ([dbb8954](https://github.com/nearform/graphql-hooks/commit/dbb8954)), closes [#54](https://github.com/nearform/graphql-hooks/issues/54)
