// The environment where the application is running, e.g. 'local', 'staging', 'production'.
export const ENVIRONMENT = process.env.ENVIRONMENT

// The issuer URL for the OpenID Connect provider used by the chat instance.
export const CHAT_OIDC_ISSUER = process.env.CHAT_OIDC_ISSUER

// The secret for generating the hmac hash to register a Matrix admin user.
export const MATRIX_ADMIN_SECRET = process.env.MATRIX_ADMIN_SECRET
