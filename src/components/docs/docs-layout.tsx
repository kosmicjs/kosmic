import path from 'node:path';
import {type ComponentChildren} from 'preact';
import humanize from 'humanize-string';
import titleize from 'titleize';
import SideNav from '#components/docs/side-nav.js';
import ActiveDevWarning from '#components/active-dev-warning.js';
import Layout from '#components/layout.js';
import {getCtx} from '#server';

type Props = {
  readonly pageName?: string;
  readonly children: ComponentChildren;
};

export default function DocsLayout({pageName, children}: Props) {
  const ctx = getCtx();

  if (!ctx) throw new Error('No context found');

  if (!ctx.path) throw new Error('No req.path');

  const page = path.basename(ctx.path);

  const formattedPageName = titleize(humanize(pageName ?? page));

  return (
    <Layout title={`Docs - ${formattedPageName}`}>
      <div class="row d-md-none">
        <div class="col-12 pb-5 pb-md-0">
          <button
            type="button"
            class="btn btn-primary border-0"
            data-bs-toggle="offcanvas"
            data-bs-target="#offcanvas"
          >
            nav
          </button>
        </div>
      </div>
      <div class="row">
        <div class="col-12 col-md-2 pb-5 pb-md-0">
          <SideNav pageName={page} />
        </div>
        <div class="col-10 ps-5">
          <div class="w-100 ">
            <h1 class="mb-5 w-100">{formattedPageName}</h1>
            <ActiveDevWarning />
            <section>{children}</section>
          </div>
        </div>
      </div>
    </Layout>
  );
}
