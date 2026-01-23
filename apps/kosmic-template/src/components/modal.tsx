export default function Modal() {
  return (
    <div class="modal fade" id="modal" tabindex={-1}>
      <div class="modal-dialog modal-lg">
        <div class="modal-content" id="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              <div
                class="htmx-indicator spinner-border text-secondary"
                role="status"
              >
                <span class="visually-hidden">Loading...</span>
              </div>
            </h5>
            <button
              class="btn-close"
              type="button"
              data-bs-dismiss="modal"
              aria-label="Close"
            />
          </div>
          <div class="modal-body">
            <div
              class="htmx-indicator spinner-border text-secondary"
              role="status"
            />
          </div>
          <div class="modal-footer">
            <button
              class="btn btn-secondary"
              type="button"
              data-bs-dismiss="modal"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
