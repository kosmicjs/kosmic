import clsx from 'clsx';

const pageList = [
  {name: 'About'},
  {name: 'Installation'},
  {name: 'Quick-Start'},
  {name: 'scripts'},
  {name: 'db'},
  {name: 'models'},
  {name: 'client'},
  {name: 'development'},
];

type Props = {
  readonly pageName: string;
};

export default function SideNav({pageName}: Props) {
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
