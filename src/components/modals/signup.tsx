import SignupForm from '#components/islands/signup-form.js';

export default function SignupModalBody() {
  return (
    <>
      <div class="modal-header">
        <h5 class="modal-title">Signup</h5>
        <button
          class="btn-close"
          type="button"
          data-bs-dismiss="modal"
          aria-label="Close"
        />
      </div>

      <div data-island="signup-form">
        <SignupForm />
      </div>
    </>
  );
}
