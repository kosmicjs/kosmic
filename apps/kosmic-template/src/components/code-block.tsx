import clsx from 'clsx';
import hljs from 'highlight.js';
import dedent from 'dedent';

type Props = {
  readonly code: string;
  readonly filename?: string;
  readonly language?: string;
  readonly isMultiline?: boolean;
  readonly class?: string;
};

export default function CodeBlock({
  code,
  filename,
  isMultiline = false,
  language = 'javascript',
  class: customClass = '',
}: Props) {
  return (
    <>
      {isMultiline && filename ? (
        <div class="py-1 m-0 text-bg-secondary rounded-top text-center">
          {filename}
        </div>
      ) : null}
      <pre>
        <code
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{
            __html: dedent`${isMultiline ? '' : '$ '}${hljs.highlight(code.trim(), {language}).value.trim()}`,
          }}
          class={
            clsx('p-2 mt-0 d-block cursor-pointer border overflow-x-scroll', {
              rounded: !isMultiline || !filename,
              'rounded-bottom': isMultiline && filename,
            }) + ` ${customClass}`
          }
          data-bs-toggle="tooltip"
          data-bs-placement="right"
          title="Copy to clipboard"
          data-code={dedent(code)}
        />
      </pre>
    </>
  );
}
