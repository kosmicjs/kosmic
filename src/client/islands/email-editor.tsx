import {useState} from 'preact/hooks';
import {clsx} from 'clsx';
import CodeBlock from '#components/code-block.js';

export type Props = {
  readonly html: string;
};

export default function EmailEditor({html}: Props) {
  const [tab, setTab] = useState<'source' | 'preview'>('preview');

  return (
    <div class="container mt-5">
      <ul class="nav nav-tabs">
        <li class="nav-item">
          <a
            class={clsx('nav-link', {active: tab === 'preview'})}
            onClick={() => {
              setTab('preview');
            }}
          >
            Email Preview
          </a>
        </li>
        <li class="nav-item">
          <a
            class={clsx('nav-link', {active: tab === 'source'})}
            onClick={() => {
              setTab('source');
            }}
          >
            HTML
          </a>
        </li>
      </ul>
      <div class="d-flex justify-content-center align-items-center mt-5">
        {tab === 'preview' ? (
          <iframe
            seamless
            sandbox="allow-scripts allow-popups"
            referrerpolicy="no-referrer"
            srcdoc={html}
            class="border"
            style={{
              height: '100%',
              width: '100%',
              minHeight: '800px',
              maxWidth: '600px',
              display: 'block',
            }}
          ></iframe>
        ) : (
          <CodeBlock isMultiline code={html} language="html" />
        )}
      </div>
    </div>
  );
}

export function EmailEditorIsland(props: Props) {
  return (
    <div
      class="p-2"
      data-island="email-editor"
      data-props={JSON.stringify(props)}
    >
      <EmailEditor {...props} />
    </div>
  );
}
