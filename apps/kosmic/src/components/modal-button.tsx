export function ModalButton({
  name,
  children,
  ...props
}: {
  readonly name: string;
  readonly children: preact.ComponentChildren;
}) {
  return (
    <button
      class="btn btn-outline-primary mx-2"
      type="button"
      {...props}
      hx-get={`/modals/${name}`}
      hx-target="#modal-content"
      hx-indicator="#modal-content"
      data-bs-toggle="modal"
      data-bs-target="#modal"
    >
      {children}
    </button>
  );
}
