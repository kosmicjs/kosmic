import {clsx} from 'clsx';

function Toast({
  children,
  show,
  isSuccess = false,
}: {
  readonly children?: preact.ComponentChildren;
  // eslint-disable-next-line react/boolean-prop-naming
  readonly show: boolean;
  readonly isSuccess?: boolean;
}) {
  return (
    <div class="toast-container text-center d-flex align-items-center justify-content-center margin-bottom-5 w-100 pt-5 px-5 position-relative">
      <div
        id="toast"
        role="alert"
        aria-live="assertive"
        aria-atomic="true"
        class={clsx(
          `toast border-${isSuccess ? 'success' : 'danger'} w-100 w-md-75 position-absolute top-50`,
          {
            show,
          },
        )}
      >
        <div
          class={`toast-header border-${isSuccess ? 'success' : 'danger'}-subtle bg-dark-subtle`}
        >
          <strong class="m-auto">{isSuccess ? 'Success' : 'Oops'}!:</strong>
          <button type="button" class="btn-close" data-bs-dismiss="toast" />
        </div>
        <div id="error-display-swap-el" class="toast-body bg-dark">
          {children}
        </div>
      </div>
    </div>
  );
}

export default Toast;
