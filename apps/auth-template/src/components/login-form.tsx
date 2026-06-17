export type LoginFormProps = {
  readonly redirect?: string | undefined;
  readonly error?: string | undefined;
  readonly email?: string | undefined;
};

/**
 * Render the minimal login form.
 */
export function LoginForm({redirect, error, email}: LoginFormProps) {
  const query =
    typeof redirect === 'string'
      ? `?redirect=${encodeURIComponent(redirect)}`
      : '';

  return (
    <form className="auth-form" method="post" action={`/login${query}`}>
      <label className="field">
        <span>Email</span>
        <input
          required
          type="email"
          name="email"
          autoComplete="email"
          value={email ?? ''}
        />
      </label>

      <label className="field">
        <span>Password</span>
        <input
          required
          type="password"
          name="password"
          autoComplete="current-password"
        />
      </label>

      {error ? <p className="form-error">{error}</p> : null}

      <button className="primary-button" type="submit">
        Log in
      </button>
    </form>
  );
}
