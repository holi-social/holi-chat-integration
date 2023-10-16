// The environment where the application is running, e.g. 'local', 'staging', 'production'.
export const ENVIRONMENT = process.env.ENVIRONMENT

// The URL of the oCIS instance being used by the application.
export const OWNCLOUD_BASE_URL = process.env.OWNCLOUD_BASE_URL

// The username of the admin user for the oCIS instance.
export const OCIS_ADMIN_USERNAME = process.env.OCIS_ADMIN_USERNAME

// The password of the admin user for the oCIS instance.
export const OCIS_ADMIN_PASSWORD = process.env.OCIS_ADMIN_PASSWORD

// The issuer URL for the OpenID Connect provider used by the oCIS instance.
export const OCIS_OIDC_ISSUER = process.env.OCIS_OIDC_ISSUER
