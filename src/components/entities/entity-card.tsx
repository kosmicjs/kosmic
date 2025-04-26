import {type SelectableEntity} from '#models/entites.js';

export function EntityCard({entity}: {readonly entity: SelectableEntity}) {
  return (
    <div class="col-12 p-5" id={`entity${entity.id}`}>
      <div class="card">
        <div class="card-body">
          <h5 class="card-title">{entity.name}</h5>
          <p class="card-text">{entity.description}</p>
          <div class="d-flex justify-content-between">
            <button
              type="button"
              hx-get={`/admin/entities/${entity.id}`}
              hx-target={`#entity${entity.id}`}
              hx-swap="outerHTML"
              class="btn btn-outline-primary"
            >
              Edit
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
        </div>
      </div>
    </div>
  );
}
