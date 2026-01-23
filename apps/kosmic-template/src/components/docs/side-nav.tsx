import clsx from 'clsx';

const pageList = [
  {name: 'About'},
  {name: 'Installation'},
  {name: 'Quick-Start'},
  {name: 'Scripts'},
  {name: 'Db'},
  {name: 'Models'},
  {name: 'Client'},
  {name: 'Development'},
];

type Props = {
  readonly pageName: string;
};

function Nav({pageName}: Props) {
  return (
    <div class="list-group list-group-flush">
      {pageList.map((page) => (
        <a
          role="button"
          class={clsx('list-group-item list-group-item-action ', {
            'list-group-item-dark': pageName === page.name,
          })}
          href={`/docs/${page.name.toLowerCase()}`}
        >
          {page.name.replaceAll('-', ' ')}
        </a>
      ))}
    </div>
  );
}

export default function SideNav({pageName}: Props) {
  return (
    <div>
      <div class="offcanvas offcanvas-start d-md-none" id="offcanvas">
        <div class="offcanvas-header">
          <h5 class="offcanvas-title" id="staticBackdropLabel">
            Offcanvas
          </h5>
          <button
            type="button"
            class="btn-close"
            data-bs-dismiss="offcanvas"
            aria-label="Close"
          ></button>
        </div>
        <div class="offcanvas-body">
          <Nav pageName={pageName} />
        </div>
      </div>
      <div class="d-none d-md-block">
        <Nav pageName={pageName} />
      </div>
    </div>
  );
}
