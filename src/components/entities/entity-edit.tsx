import {type SelectableEntity} from '#models/entites.js';

export function EntityEdit({entity}: {readonly entity: SelectableEntity}) {
  return (
    <div class="col-12 p-5" id={`entity${entity.id}`}>
      <div class="card">
        <form
          class="card-body"
          hx-put={`/admin/entities/${entity.id}`}
          hx-target={`#entity${entity.id}`}
          hx-swap="outerHTML"
        >
          <input
            type="text"
            class="form-control"
            name="name"
            value={entity.name ?? ''}
          />
          <div class="mb-3"></div>
          <div class="d-flex justify-content-between">
            <button type="submit" class="btn btn-primary">
              Save
            </button>
            <button
              type="button"
              hx-delete={`/admin/entities/${entity.id}`}
              hx-target={`#entity${entity.id}`}
              hx-swap="delete"
              class="btn btn-outline-danger"
            >
              x
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
