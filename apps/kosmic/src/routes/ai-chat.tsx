import type {Middleware} from '@kosmic/server';
import {z} from 'zod/v4';
// import {GoogleGenAI} from '@google/genai';
import Layout from '#components/layout.js';
// import {config} from '#config/index.js';

// const client = new GoogleGenAI({apiKey: config.google?.geminiApiKey ?? ''});

declare module 'koa-session' {
  interface Session {
    messages: string[];
  }
}

export const get: Middleware = async function (ctx) {
  await ctx.render(
    <Layout>
      <div class="row d-flex justify-content-center align-items-center mb-4">
        <div class="col-12 col-sm-8 col-md-6 col-lg-4">
          <form
            hx-post="/ai-chat"
            hx-trigger="submit"
            hx-target="#chat-response"
            hx-swap="innerHTML"
          >
            <div class="mb-3">
              <label for="ai_chat_input" class="form-label">
                AI Chat Input
              </label>
              <input
                type="text"
                class="form-control"
                name="ai_chat_input"
                aria-describedby="aiChatInputHelp"
              />
              <div class="valid-feedback">Looks good!</div>
              <div id="aiChatInputHelp" class="form-text">
                Ask about kosmic or just abuse the AI chat!
              </div>
            </div>

            <button type="submit" class="btn btn-primary">
              Submit
            </button>
          </form>
        </div>
      </div>
      <div class="row d-flex justify-content-center align-items-center">
        <div class="col-12 col-sm-8 col-md-6 col-lg-4" id="chat-response"></div>
      </div>
    </Layout>,
  );
};

const postBodySchema = z.object({
  ai_chat_input: z.string().min(1).max(255),
});

export const post: Middleware = async function (ctx) {
  const {ai_chat_input: input} = postBodySchema.parse(ctx.request.body);

  ctx.log.debug({input}, 'AI Chat Input');

  // const response = await client.models.generateContent({
  //   model: 'gemini-2.0-flash',
  //   contents: input,
  // });

  // ctx.log.debug({response}, 'AI Chat Response');

  await ctx.render(
    <div class="card">
      <div class="card-header">AI Chat Response</div>
      <div class="card-body">
        <h5 class="card-title">Response</h5>
        <p class="card-text">
          <pre>
            <code>{/* response.text */}</code>
          </pre>
        </p>
      </div>
      <div class="card-footer text-muted">
        <small>Powered by Kosmic AI</small>
      </div>
    </div>,
  );
};
