import {useState} from 'preact/hooks';
import {clsx} from 'clsx';
import CodeBlock from '#components/code-block.js';

export type Props = {
  readonly html: string;
};

export default function EmailPreview({html}: Props) {
  const [tab, setTab] = useState<'source' | 'preview'>('preview');

  return (
    <div class="container mt-5">
      <ul class="nav nav-tabs">
        <li class="nav-item">
          <a
            class={clsx('nav-link cursor-pointer', {active: tab === 'preview'})}
            onClick={async () => {
              setTab('preview');
            }}
          >
            Email Preview
          </a>
        </li>
        <li class="nav-item">
          <a
            class={clsx('nav-link cursor-pointer', {active: tab === 'source'})}
            onClick={() => {
              setTab('source');
            }}
          >
            HTML
          </a>
        </li>
      </ul>
      <div class="d-flex justify-content-center align-items-center mt-5">
        <iframe
          seamless
          sandbox="allow-scripts allow-popups"
          referrerpolicy="no-referrer"
          srcdoc={html}
          class={clsx('border', {'visually-hidden': tab !== 'preview'})}
          style={{
            height: '100%',
            width: '100%',
            minHeight: '800px',
            maxWidth: '600px',
            display: 'block',
          }}
        ></iframe>
        <CodeBlock
          isMultiline
          class={clsx({'visually-hidden': tab !== 'source'})}
          code={html}
          language="html"
        />
      </div>
    </div>
  );
}

export function EmailPreviewIsland(props: Props) {
  return (
    <div
      class="p-2"
      data-island="email-preview"
      data-props={JSON.stringify(props)}
    >
      <EmailPreview {...props} />
    </div>
  );
}
