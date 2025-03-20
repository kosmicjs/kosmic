export type Props = {
  readonly isSignup: boolean;
};

export function LoginForm() {
  return (
    <form action="/login" method="post">
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
            aria-describedby="emailHelp"
          />
          <div id="emailHelp" class="form-text">
            {`We'll never share your email with anyone else.`}
          </div>
        </div>
        <div class="mb-3">
          <label for="modal-password" class="form-label">
            Password
          </label>
          <input
            type="password"
            name="password"
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
