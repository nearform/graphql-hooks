export function createMockResponse(options: Partial<Response> = {}): Response {
  const response = new Response()
  return {
    ...response,
    ...options
  }
}
