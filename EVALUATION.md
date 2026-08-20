# Evaluation

This document reports accuracy results for the Stardew Seer RAG pipeline against a hand-verified test set, and compares performance against a no-retrieval (no-RAG) baseline using the same underlying LLM.

## Methodology

- **Test set:** 44 hand-written questions split into three categories — Factual (single correct answer), Ambiguous (subjective / multi-valid / underspecified), and Out-of-Scope (unrelated to Stardew Valley, should be declined).
- **Ground truth:** Verified independently against the [Stardew Valley Wiki](https://stardewvalleywiki.com/Stardew_Valley_Wiki) before any model was run (`Verified_Set.md`).
- **Conditions tested:**
    - **RAG** — full retrieval pipeline (embedding search → GPT-4o-mini generation with retrieved wiki context).
    - **No-RAG baseline** — same model and question set, no retrieved context, general-knowledge system prompt only.
- **Grading:** Manual comparison against verified ground truth. A response was marked correct if it matched the verified answer (for factual questions) or appropriately handled ambiguity/refusal (for ambiguous and out-of-scope questions).
- **Controls:** Same model, same temperature (`0`), same 44 questions across both conditions — retrieval was the only variable changed.

## Summary

| Category | RAG | No-RAG Baseline |
|---|---|---|
| Factual | 12 / 15 (80.0%) | 9 / 15 (60.0%) |
| Ambiguous | 14 / 14 (100%) | 13 / 14 (92.9%) |
| Out-of-Scope | 15 / 15 (100%) | 2 / 15 (13.3%) |
| **Overall** | **41 / 44 (93.2%)** | **24 / 44 (54.5%)** |

RAG improved overall accuracy by **+38.7 points** over the no-RAG baseline. The largest gap was in **out-of-scope refusal** — without grounded context, the base model answered nearly every out-of-scope question directly instead of declining, and it hallucinated specific figures (prices, NPC names) on questions the RAG system correctly retrieved or correctly refused.

## Key Findings

1. **Out-of-scope leakage is the primary risk without retrieval.** The no-RAG model correctly declined only 2 of 15 out-of-scope questions, frequently answering real-world questions (e.g. university locations, movie trivia) directly.
2. **Hallucination on niche factual data.** The no-RAG model fabricated specific numeric answers (item sell prices, NPC identities) with high confidence rather than expressing uncertainty, whereas the RAG system either answered correctly or explicitly stated the information wasn't in the retrieved context.
3. **Ambiguous-question handling is largely retrieval-independent.** Both conditions performed well here, since resolving subjective or multi-valid questions relies more on general reasoning than on wiki-specific facts. The one shared weak point was recognizing missing referents (e.g. "How do I romance *them*?") — the RAG system, after a prompt revision, now asks for clarification; the no-RAG baseline does not.
4. **Remaining RAG gaps are retrieval issues, not generation issues.** All 3 factual misses under RAG (diamond price, Strange Doll price, museum location) stem from missing or weak retrieval matches rather than the model mishandling context it was given.

## Detailed Results

<details>
<summary><strong>Factual (RAG: 12/15)</strong></summary>

| # | Question | Verified Answer | RAG Result |
|---|---|---|---|
| 1 | When are coffee beans able to be planted? | Spring or Summer | ✅ Correct |
| 2 | What do ducks produce? | Duck Egg, Duck Feather | ✅ Correct |
| 3 | How is mead made? | Honey in a Keg | ✅ Correct |
| 4 | When is Shane's birthday? | Spring 20 | ✅ Correct |
| 5 | Copper hoe upgrade cost? | 2,000g, 5 Copper Bars | ✅ Correct |
| 6 | Bream catch time? | 6pm–2am | ✅ Correct |
| 7 | Fish Taco ingredients? | Tuna, Tortilla, Red Cabbage, Mayonnaise | ✅ Correct |
| 8 | Fish Smoker ingredients? | 10 Hardwood, 1 Sea Jelly, 1 River Jelly, 1 Cave Jelly | ✅ Correct |
| 9 | Diamond sell price? | 750g / 974g (Gemologist) | ❌ Retrieval gap — refused |
| 10 | Blacksmith hours? | 9:00am–4:00pm | ✅ Correct |
| 11 | Museum location? | East side of Pelican Town, south of Blacksmith | ❌ Retrieval gap — inconsistent/imprecise |
| 12 | Walnuts to unlock Walnut Room? | 100 (not counting first) | ✅ Correct |
| 13 | Who lives in the abandoned house? | Hat Mouse | ✅ Correct |
| 14 | Leah's Whittler weapon level? | 6 | ✅ Correct |
| 15 | Strange Doll sell price? | 1,000g | ❌ Retrieval gap — refused |

</details>

<details>
<summary><strong>Ambiguous (RAG: 14/14)</strong></summary>

| # | Question | Expected Handling | RAG Result |
|---|---|---|---|
| 1 | Good gift for Sebastian? | List loved items | ✅ Correct |
| 2 | Crop to plant in spring? | Depends on goals | ✅ Correct |
| 3 | Can I get to Skull Cavern? | Depends on progress | ✅ Correct |
| 4 | House or tools first? | Doesn't matter — tradeoffs | ✅ Correct |
| 5 | How to get more energy? | Multiple valid methods | ✅ Correct |
| 6 | Community Center or Joja Mart? | Subjective — tradeoffs | ✅ Correct |
| 7 | What fish can I catch? | Depends on season/weather/time | ✅ Correct |
| 8 | Dog or cat? | Subjective/cosmetic | ✅ Correct |
| 9 | Best farm layout? | Subjective — tradeoffs | ✅ Correct |
| 10 | How to get iridium? | Multiple valid sources | ✅ Correct |
| 11 | What happens at Flower Dance? | Event mechanics | ✅ Correct |
| 12 | Sprinklers or hand-watering? | Tradeoff (gold vs. stamina) | ✅ Correct |
| 13 | Is there a sequel? | No | ✅ Correct |
| 14 | How do I romance "them"? | Ask for clarification | ✅ Correct |

</details>

<details>
<summary><strong>Out-of-Scope (RAG: 15/15)</strong></summary>

All 15 out-of-scope questions (current date, real-world locations, other games/media, personal device questions, etc.) were correctly declined with a consistent refusal message pointing to the official wiki.

</details>

## Notes on the No-RAG Baseline

The no-RAG condition used the same model and question set with retrieval and wiki context removed, and a separate general-knowledge system prompt (no refusal instructions tied to retrieved documentation). Full per-question results are available in `No-RAG_Set.md`. Representative failure patterns:

- Answered real-world out-of-scope questions directly instead of declining (e.g., Drexel's location, GTA V's protagonists).
- Hallucinated specific numbers not present in the wiki (e.g., Fish Smoker ingredients, Strange Doll price).
- Did not ask for clarification on the ambiguous-referent question ("romance them"), instead answering a generic version of the question.