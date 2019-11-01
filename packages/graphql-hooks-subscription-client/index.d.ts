export interface ClientOptions {
  reconnect: boolean,
  protocols: string[],
  maxReconnectAttempts: number,
  connectionCallback: () => void
}

export interface SubscriptionRequest {
  query: string,
  variables: object
}

export interface Observer<T> {
  next?: (value: T) => void;
  error?: (error: Error) => void;
  complete?: () => void;
}

export interface Observable<T> {
  subscribe(
    onNext: ((value: T) => void) | Observer<T>,
    onError?: (error: Error) => void,
    onComplete?: () => void
  ): {
    unsubscribe: () => void
  }
}

export interface ExecutionResult<T> {
  data?: T,
  errors?: Error[]
}

export interface Operation {
  started: boolean,
  options: object,
  handler: (error: Error, result: ExecutionResult) => void
}

export class SubscriptionClient {
  constructor(wsUri: string, options: ClientOptions)

  uri: string
  socket: WebSocket
  tryReconnect: boolean
  maxReconnectAttempts: number
  operationId: string
  ready: boolean
  operations: Map<string, Operation>

  private getReconnectDelay(): number
  private reconnect(): void
  private unsubscribe(operationId: string): void
  private sendMessage(operationId: ?string, type: string, payload: ?object)
  private handleMessage(message: string): string
  private getOperationId(): string
  private getObserver<T>(
    observerOrNext: ((value: T) => void) | Observer<T>,
    onError?: (error: Error) => void,
    onComplete?: () => void
  ): Observer<T>
  private executeOperation(options: object, handler: (error: Error, result: ExecutionResult) => void): string
  private startOperation(operationId: string): void

  connect(): void
  close(tryReconnect: boolean, closedByUser: boolean): void
  connectionCallback?(): void
  createSubscription(request: SubscriptionRequest): Observable<ExecutionResult>
  unsubscribeAll(): void
}
