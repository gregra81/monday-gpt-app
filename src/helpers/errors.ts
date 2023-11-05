export class HttpError extends Error {
  constructor(
    public status: number,
    public message: string,
  ) {
    super(message);
  }
}
export class Http401Error extends HttpError {
  constructor(message = 'Not authenticated') {
    super(401, message);
  }
}

export class Http500Error extends HttpError {
  constructor(message = 'Server error') {
    super(500, message);
  }
}
