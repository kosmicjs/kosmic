import clsx from 'clsx';
import type z from 'zod/v4';

export function SignupForm({
  errors,
  email,
  password,
  password_confirm,
}: {
  readonly email?: string | undefined;
  readonly password?: string | undefined;
  readonly password_confirm?: string | undefined;
  readonly errors?: z.core.$ZodIssue[];
}) {
  const emailErrors = errors?.filter((error) => error.path.includes('email'));
  const passwordErrors = errors?.filter((error) =>
    error.path.includes('password'),
  );
  const passwordConfirmErrors = errors?.filter((error) =>
    error.path.includes('password_confirm'),
  );

  return (
    <form hx-post="/signup" hx-swap="outerHTML">
      <div class="modal-body">
        <div class="mb-3">
          <label for="email" class="form-label">
            Email address
          </label>
          <input
            type="email"
            class={clsx('form-control', {
              'is-invalid': Number(emailErrors?.length) > 0,
              'is-valid': Array.isArray(errors) && emailErrors?.length === 0,
            })}
            name="email"
            value={email}
            autocomplete="email"
            aria-describedby="emailHelp"
          />
          <div class="valid-feedback">Looks good!</div>
          <div id="emailHelp" class="form-text">
            We&apos;ll never share your email with anyone else.
          </div>
          {emailErrors?.map((error) => (
            <div key={error.path.join('.')} class="invalid-feedback">
              {error.message}
            </div>
          ))}
        </div>

        <div class="mb-3">
          <label for="password" class="form-label">
            Password
          </label>
          <input
            type="password"
            name="password"
            value={password}
            autocomplete="new-password"
            class={clsx('form-control', {
              'is-invalid': Number(passwordErrors?.length) > 0,
              'is-valid': Array.isArray(errors) && passwordErrors?.length === 0,
            })}
          />
          {passwordErrors?.map((error) => (
            <div key={error.path.join('.')} class="invalid-feedback">
              {error.message}
            </div>
          ))}
        </div>

        <div class="mb-3">
          <label for="password_confirm" class="form-label">
            Confirm Password
          </label>
          <input
            type="password"
            name="password_confirm"
            value={password_confirm}
            autocomplete="new-password"
            class={clsx('form-control', {
              'is-invalid': Number(passwordConfirmErrors?.length) > 0,
              'is-valid':
                Array.isArray(errors) && passwordConfirmErrors?.length === 0,
            })}
          />
          {passwordConfirmErrors?.map((error) => (
            <div key={error.path.join('.')} class="invalid-feedback">
              {error.message}
            </div>
          ))}
        </div>

        <button type="submit" class="btn btn-primary">
          Submit
        </button>
      </div>
    </form>
  );
}
