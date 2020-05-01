# babel-plugin-extract-gql
Extracts all graphql queries into a file

## Usage

#### CLI

```sh
npx babel ./proj-a/ --out-dir ./out --plugins=extract-gql --presets=@babel/env,@babel/react
```

## Output

All input files are analyzed and transformed when a graphql query is found

**Example**

```js
import { useQuery, persist } from 'graphql-hooks'

const SOME_QUERY = persist`
  query Add($x: Int!, $y: Int!) {
    add(x: $x, y: $y)
  }
`

const MyCompA = () => {
  const { data } = useQuery(SOME_QUERY)
}
```

Becomes

```js
import { useQuery, persist } from 'graphql-hooks';
const SOME_QUERY = "d012f1a214f5e2117ec9d9aa16d5b8b5ef95f755252cb8488c3a742eebcc6db9";

const MyCompA = () => {
  const {
    data
  } = useQuery(SOME_QUERY, {
    "persisted": true
  });
};
```

Note there are two changes.

- Query const is set to the hash of the query text
- `useQuery` is added with a second param containing `persisted: true`

All the queries extracted are saved on disk in one file. The file is saved in the project root and looks like following

```js
{
  "d012f1a214f5e2117ec9d9aa16d5b8b5ef95f755252cb8488c3a742eebcc6db9": "query Add($x: Int!, $y: Int!) {\n    add(x: $x, y: $y)\n  }",
  "3384eca8378f1d49f0ccd3d6bb2e394c0dd143c19bb1717138b206cd181c5dd7": "query Sub($x: Int!, $y: Int!) {\n    sub(x: $x, y: $y)\n  }",
  "3f0587e447e0eee76801682a24ce1b44b68c5d298ed24a010ce259b0361b1ef2": "query Div($x: Int!, $y: Int!) {\n    div(x: $x, y: $y)\n  }"
}
```
