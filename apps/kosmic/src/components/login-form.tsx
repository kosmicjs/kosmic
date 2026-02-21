import {getCtx} from '@kosmic/server';

export type Props = {
  readonly isSignup: boolean;
};

export function LoginForm() {
  const ctx = getCtx();

  return (
    <form
      hx-post={`/login${typeof ctx.query.redirect === 'string' ? `?redirect=${ctx.query.redirect}` : ''}`}
      hx-swap="outerHTML"
    >
      <div class="modal-body">
        <div class="mb-3">
          <label for="modal-email" class="form-label">
            Email address
          </label>
          <input
            type="email"
            name="email"
            id="modal-email"
            class="form-control"
            autocomplete="email"
            aria-describedby="emailHelp"
          />
          <div id="emailHelp" class="form-text">
            We&apos;ll never share your email with anyone else.
          </div>
        </div>
        <div class="mb-3">
          <label for="modal-password" class="form-label">
            Password
          </label>
          <input
            type="password"
            name="password"
            autocomplete="current-password"
            class="form-control"
            id="modal-password"
          />
        </div>

        <button type="submit" class="btn btn-primary">
          Submit
        </button>
      </div>
    </form>
  );
}

export default LoginForm;
