export default function createError(message, status = 500, originalError = null) {
  const error = new Error(message);
  error.status = status;
  if (originalError) error.originalError = originalError;
  return error;
}
