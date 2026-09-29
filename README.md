# Stardew Valley Almanac

**Live site:** [https://sv-almanac.vercel.app/](https://sv-almanac.vercel.app/)

Stardew Valley Almanac is a retrieval-augmented generation (RAG) chatbot that answers questions about *Stardew Valley*. Instead of relying only on what a language model happens to remember about the game, it looks up relevant passages from the Stardew Valley Wiki first and grounds its answer in that content.

Ask it things like "What happens at the Flower Dance?", "Where can I find iridium?", or "Should I use sprinklers or water by hand?"

> This is a fan-made, non-commercial project. It is not affiliated with or endorsed by ConcernedApe or the Stardew Valley Wiki.

---

## How it works

The app has two halves: an offline ingestion pipeline that builds the knowledge base, and an online request pipeline that answers questions.

**Ingestion (run once, or whenever the wiki data is refreshed)**

1. Wiki pages are fetched through the MediaWiki Action API.
2. The page HTML is parsed and cleaned with Cheerio so only meaningful article text remains.
3. The text is split into overlapping chunks with LangChain's `RecursiveCharacterTextSplitter`, so each chunk is small enough to embed but still carries its surrounding context.
4. Each chunk is embedded with OpenAI's `text-embedding-3-small` model.
5. Chunks and their embeddings are stored in Supabase (PostgreSQL with the pgvector extension).

**Answering a question**

1. The user's question is embedded with the same embedding model used during ingestion.
2. A custom `get_relevant_chunks` database function performs a cosine-similarity search against an HNSW index to find the most relevant wiki chunks.
3. Those chunks are passed as context, along with a system prompt, to the generation model.
4. The model writes an answer grounded in the retrieved wiki content, which is returned to the chat interface.

---

## Tech stack

| Layer | Technology |
| --- | --- |
| Language | TypeScript / Node.js throughout |
| Frontend | Next.js (App Router), React, Tailwind CSS v4 |
| Backend | Next.js API routes |
| Embeddings | OpenAI `text-embedding-3-small` |
| Generation | OpenAI gpt-5.4-mini |
| Vector store | Supabase (PostgreSQL + pgvector, HNSW index, cosine distance) |
| Ingestion | MediaWiki Action API, Cheerio, LangChain text splitters, postgres.js |
| Hosting | Vercel |

---

## Project structure

| Path | Purpose |
| --- | --- |
| `src/frontend/` | The Next.js app: chat UI and API routes. This is the Root Directory used for the Vercel deployment. |
| `src/backend/data/` | Ingestion pipeline that fetches, cleans, chunks, embeds, and stores wiki content. |
| `src/backend/scripts/` | Utility scripts, including a command-line way to generate a single response for testing. |
| `test_reports/` | Saved outputs from evaluation runs. |
| `EVALUATION.md` | Write-up of how the chatbot was evaluated and what the results showed. |

---

## Running it locally

You will need Node.js, an OpenAI API key, and a Supabase project with the pgvector extension enabled.

1. **Clone the repo and install dependencies** in both the project root (for the ingestion scripts) and `src/frontend/` (for the web app).
2. **Create a `.env` file in the project root** containing your OpenAI API key, your Supabase project URL and key, and your Postgres connection string. `.env` files are git-ignored, so they will never be committed.
3. **Set up the database** by creating the chunks table, the HNSW vector index, and the `get_relevant_chunks` function in Supabase.
4. **Seed the knowledge base** by running the `seed` script from the project root. This pulls the wiki, chunks and embeds it, and writes it to Supabase.
5. **Start the app** by running the `dev` script from `src/frontend/`, then open the local URL it prints.

The `response` script in the root is handy for testing the retrieval-and-generation pipeline from the terminal without the UI.

### Deploying

The live app is deployed on Vercel with the Root Directory set to `src/frontend`. Environment variables are configured in the Vercel dashboard rather than committed to the repo.

---

## Evaluation

The chatbot was evaluated by running the same set of questions through three configurations and comparing the answers:

- **No-RAG baseline:** the model answers from its own knowledge alone.
- **RAG v1:** retrieval plus the original system prompt.
- **RAG v2:** retrieval plus a revised system prompt.

The v2 prompt produced a significant accuracy improvement. It introduced explicit, numbered response branches (a direct answer, a subjective or tradeoff answer, and a clarification path) along with a rule making those branches mutually exclusive. See [`EVALUATION.md`](./EVALUATION.md) for the full breakdown.

---

## Credits and licensing

Game knowledge comes from the [Stardew Valley Wiki](https://stardewvalleywiki.com/), whose content is licensed under [CC BY-NC-SA 3.0](https://creativecommons.org/licenses/by-nc-sa/3.0/). Wiki-derived content used by this project is shared under the same terms.

*Stardew Valley* is created by ConcernedApe. All game names and related trademarks belong to their respective owners.

Built by Abby.
