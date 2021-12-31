import { expectType } from "tsd"
import { Operation } from ".."

const query = 'query { foobar }'

class TestOperation implements Operation {
  query = query
  variables?: object = { foo: 'bar'}
  operationName? = 'operation'
}
export const operation = new TestOperation()

expectType<string>(operation.query)
expectType<object | undefined>(operation.variables)
expectType<string | undefined>(operation.operationName)
