import {useState} from 'preact/hooks';

export type Props = {
  readonly initialCount?: number;
};

export default function Counter({initialCount = 0}: Props) {
  const [count, setCount] = useState(initialCount);

  return (
    <button
      type="button"
      class="btn btn-secondary"
      onClick={() => {
        setCount(count + 1);
      }}
    >
      {count}
    </button>
  );
}

export function CounterIsland(props: Props) {
  return (
    <div class="p-2" data-island="counter" data-props={JSON.stringify(props)}>
      <Counter {...props} />
    </div>
  );
}
