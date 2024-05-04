import Stripe from 'stripe';
import {config} from '../../config/index.js';
import {type Use} from '../../../packages/fs-router/types.js';

const stripe = new Stripe(config.stripe.secretKey);

declare module 'koa' {
  interface State {
    session?: Stripe.Checkout.Session;
  }
}

const YOUR_DOMAIN = 'http://localhost:3000';

export const use: Use = [
  // eslint-disable-next-line func-names
  async function getStripeSession(ctx, next) {
    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          // Provide the exact Price ID (for example, pr_1234) of the product you want to sell
          price: 'price_1NYuYcJJzeeflZ62zQNVGKop',
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${YOUR_DOMAIN}/success`,
      cancel_url: `${YOUR_DOMAIN}/cancel`,
    });

    ctx.state.session = session;

    await next();
  },
];
