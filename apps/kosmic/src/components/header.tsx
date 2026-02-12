import Nav from './nav.tsx';

export type Props = {
  readonly title?: string;
};

export default function Header() {
  return (
    <header className="w-100 mb-5">
      <Nav />
    </header>
  );
}
