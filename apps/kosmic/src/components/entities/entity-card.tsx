import type {SelectableEntity} from '#models/entities.js';

function EntityDeleteButton({entity}: {readonly entity: SelectableEntity}) {
  return (
    <button
      type="button"
      hx-delete={`/account/entities/${entity.id}`}
      hx-target={`#entity${entity.id}`}
      hx-swap="delete"
      class="btn btn-outline-danger btn-sm"
    >
      <i class="bi bi-trash p-0 m-0" />
    </button>
  );
}

function EntityEditButton({entity}: {readonly entity: SelectableEntity}) {
  return (
    <button
      type="button"
      hx-get={`/account/entities/${entity.id}`}
      hx-target={`#entity${entity.id}`}
      hx-swap="outerHTML"
      class="btn btn-outline-primary btn-sm"
    >
      <i class="bi bi-gear p-0 m-0" />
    </button>
  );
}

function EntitySaveButton() {
  return (
    <button type="submit" class="btn btn-outline-primary btn-sm">
      <i class="bi bi-floppy p-0 m-0" />
    </button>
  );
}

export function EntityCard({
  entity,
  isEditable,
}: {
  readonly entity: SelectableEntity;
  readonly isEditable?: boolean;
}) {
  return (
    <div class="col-12 px-5 py-1" id={`entity${entity.id}`}>
      <div class="card">
        {isEditable ? (
          <form
            class="card-body"
            hx-put={`/account/entities/${entity.id}`}
            hx-target={`#entity${entity.id}`}
            hx-swap="outerHTML"
          >
            <input
              type="text"
              class="form-control"
              name="name"
              value={entity.name ?? ''}
            />
            <div class="mb-1"></div>
            <input
              type="text"
              class="form-control"
              name="description"
              value={entity.description ?? ''}
            />
            <div class="mb-1"></div>
            <div class="d-flex justify-content-between">
              <EntitySaveButton />
              <EntityDeleteButton entity={entity} />
            </div>
          </form>
        ) : (
          <div class="card-body">
            <h5 class="card-title">{entity.name}</h5>
            <p class="card-text">{entity.description}</p>
            <div class="d-flex justify-content-between">
              <EntityEditButton entity={entity} />
              <EntityDeleteButton entity={entity} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
