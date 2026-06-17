import clsx from 'clsx';

export type FormIssue = {
  readonly path: PropertyKey[];
  readonly message: string;
};

export type SignupFormProps = {
  readonly email?: string | undefined;
  readonly password?: string | undefined;
  readonly password_confirm?: string | undefined;
  readonly errors?: FormIssue[] | undefined;
};

/**
 * Render the minimal signup form.
 */
export function SignupForm({
  email,
  password,
  password_confirm,
  errors,
}: SignupFormProps) {
  const emailErrors = errors?.filter((error) => error.path.includes('email'));
  const passwordErrors = errors?.filter((error) =>
    error.path.includes('password'),
  );
  const passwordConfirmErrors = errors?.filter((error) =>
    error.path.includes('password_confirm'),
  );

  return (
    <form className="auth-form" method="post" action="/signup">
      <label className="field">
        <span>Email</span>
        <input
          required
          className={clsx({
            invalid: Number(emailErrors?.length) > 0,
            valid: Array.isArray(errors) && emailErrors?.length === 0,
          })}
          type="email"
          name="email"
          autoComplete="email"
          value={email ?? ''}
        />
      </label>
      {emailErrors?.map((error) => (
        <p key={error.path.join('.')} className="form-error">
          {error.message}
        </p>
      ))}

      <label className="field">
        <span>Password</span>
        <input
          required
          className={clsx({
            invalid: Number(passwordErrors?.length) > 0,
            valid: Array.isArray(errors) && passwordErrors?.length === 0,
          })}
          type="password"
          name="password"
          autoComplete="new-password"
          value={password ?? ''}
        />
      </label>
      {passwordErrors?.map((error) => (
        <p key={error.path.join('.')} className="form-error">
          {error.message}
        </p>
      ))}

      <label className="field">
        <span>Confirm Password</span>
        <input
          required
          className={clsx({
            invalid: Number(passwordConfirmErrors?.length) > 0,
            valid: Array.isArray(errors) && passwordConfirmErrors?.length === 0,
          })}
          type="password"
          name="password_confirm"
          autoComplete="new-password"
          value={password_confirm ?? ''}
        />
      </label>
      {passwordConfirmErrors?.map((error) => (
        <p key={error.path.join('.')} className="form-error">
          {error.message}
        </p>
      ))}

      <button className="primary-button" type="submit">
        Create account
      </button>
    </form>
  );
}
