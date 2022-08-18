# mercurius example

This is a sample project to demonstrate how [mercurius](https://github.com/mercurius-js/mercurius) uses the output of babel-plugin-extract-gql.

```sh
npm i
node .
```

and hit the /graphql endpoint with the query hash as shown bellow

```sh
curl 'http://localhost:5000/graphql?query=248eb276edb4f22aced0a2848c539810b55f79d89abc531b91145e76838f5602&persisted=true'
```

with variables

```sh
curl 'http://localhost:5000/graphql?query=495ccd73abc8436544cfeedd65f24beee660d2c7be2c32536e3fbf911f935ddf&persisted=true&variables=\{"x":3,"y":6\}'
```
