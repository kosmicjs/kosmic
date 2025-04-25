export function SignupForm() {
  return (
    <form method="post">
      <div class="modal-body">
        <div class="mb-3">
          <label for="email" class="form-label">
            Email address
          </label>
          <input
            type="email"
            class="form-control"
            name="email"
            aria-describedby="emailHelp"
          />
          <div class="valid-feedback">Looks good!</div>
          <div id="emailHelp" class="form-text">
            We&apos;ll never share your email with anyone else.
          </div>
        </div>

        <div class="mb-3">
          <label for="password" class="form-label">
            Password
          </label>
          <input
            type="password"
            name="password"
            class="form-control"
            minlength={8}
            maxlength={64}
          />
          <div id="validationServerUsernameFeedback" class="invalid-feedback">
            Please choose a username.
          </div>
        </div>

        <div class="mb-3">
          <label for="password_confirm" class="form-label">
            Confirm Password
          </label>
          <input
            type="password"
            name="password_confirm"
            class="form-control"
            minlength={8}
            maxlength={64}
          />
        </div>

        <button type="submit" class="btn btn-primary">
          Submit
        </button>
      </div>
    </form>
  );
}
