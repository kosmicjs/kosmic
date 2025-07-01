import type {Middleware} from 'koa';
// import clsx from 'clsx';
// import Layout from '../../src/components/layout.js';

// function Card({
//   title = '',
//   text = '',
//   linkText = '',
// }: {
//   readonly title?: string;
//   readonly text?: string;
//   readonly linkText?: string;
// }) {
//   return (
//     <div
//       class={clsx('card m-2 text-center border-primary rounded-0')}
//       style="width: 18rem;height:30rem;"
//     >
//       <img src="/favicon-32x32.png" class="card-img-top" alt="..." />
//       <div class="card-body">
//         <h5 class="card-title text-center">{title}</h5>
//         <p class="card-text h1">{text}</p>
//         <a hx-boost="false" href="/checkout/standard" class="btn btn-primary">
//           {linkText}
//         </a>
//       </div>
//     </div>
//   );
// }

export const get: Middleware = async (ctx, next) => {
  await next();
  // await ctx.render(
  //   <Layout>
  //     <div class="d-flex flex-column justify-content-center">
  //       <h1 class="mb-5 align-self-center">Pricing</h1>

  //       <div class="row">
  //         <div class="col-12 col-md-4 d-flex justify-content-center align-items-center">
  //           <Card title="Free" text="$10" linkText="Go somewhere" />
  //         </div>
  //         <div class="col-12 col-md-4 d-flex justify-content-center align-items-center">
  //           <Card title="Pro" text="$10" linkText="Go somewhere" />
  //         </div>
  //         <div class="col-12 col-md-4 d-flex justify-content-center align-items-center">
  //           <Card title="Enterprise" text="$10" linkText="Go somewhere" />
  //         </div>
  //       </div>
  //     </div>
  //   </Layout>,
  // );
};
