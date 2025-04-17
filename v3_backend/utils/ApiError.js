class ApiError {
  constructor(status = false, message) {
    this.status = status;
    this.message = message;
  }
}

export default ApiError;
