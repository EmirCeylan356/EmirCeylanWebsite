# `src/data/content.json` — field reference

Every editable PUBLIC text on the home page (`/`), the `/now` page and the site
footer lives in this one file. The pages read it through `src/data/profile.ts`
(`CONTENT`, `PUBLIC_*`, `NOW`, `NOW_UPDATED`) — no code change is needed to
edit copy. The TypeScript shape is `SiteContent` in `profile.ts`; the CMS config
(`public/admin/config.yml`) is written against the keys below.

Private facts (employers, projects, CV) are NOT here — they stay in the
`PRIVATE_*` section of `profile.ts` and only feed the unlisted recruiter pages.

Plain strings render as text (HTML is escaped). Keep the `&`, `'`, `—` characters
as-is; they are shown verbatim.

## `hero` — top of the home page
| key | what it is |
|---|---|
| `status` | Mono "status pill" above the name, e.g. `SYS_ID: EC_2027 — ISTANBUL / TR — ONLINE`. Also the target of the typewriter animation. |
| `subtitle` | One line under the name, e.g. `Machine learning — Medical AI — CS '27`. |
| `ctaPrimary` | Label of the red button (scrolls to Work). |
| `ctaSecondary` | Label of the outlined button (scrolls to Contact). |

## `marquee` — scrolling ticker under the hero
A list of short strings (currently 7). The **last item is rendered in the accent
colour**. On small screens only the first 7 are shown.

## `about` — section 01
| key | what it is |
|---|---|
| `lede` | Large first sentence. Two placeholders are supported: `{university}` (replaced by the university name from `src/lib/site.ts`, shown in the accent colour) and `{gradYear}` (replaced by the graduation year). |
| `paragraphs` | List of body paragraphs, rendered in order, one `<p>` each. |
| `stats` | List of `{ value, label, counter? }` shown in the left panel. `value` is the big text (string, e.g. `"2027"` or `"ML"`), `label` the small caption. `counter` is an optional number: when set, the value counts up on scroll. The "ML / FOR HEALTHCARE" stat has no counter. The **"07+ ROLES & RESEARCH PROJECTS" stat is not in this file** — it is computed from `roleCount` in `profile.ts` and always inserted as the second stat. |

## `work` — section 02
| key | what it is |
|---|---|
| `eyebrow` | Small mono label above the intro (`WHAT I ACTUALLY DO`). |
| `lede` | Large intro sentence. |
| `body` | Paragraph under the lede. |
| `domains` | List of domain tags (chips) under the intro. Also exported as `PUBLIC_DOMAINS`. |
| `capabilities` | List of result tiles, each `{ label, metric, unit, description, stack }`. `metric` is the big number as a string (`"0.898"`), `unit` the text next to it (`AUROC`), `stack` a `·`-separated tool list. Also exported as `PUBLIC_CAPABILITIES`. Keep these anonymised — no employer / dataset / project names. |
| `ctaEyebrow` | Small label in the "full history" box. |
| `ctaText` | Paragraph in that box. |
| `ctaPrimary` | Label of the red mailto button. |
| `ctaSubject` | Subject line of that mailto (` — Emir Ceylan` is appended automatically). |
| `ctaSecondary` | Label of the outlined button (scrolls to Contact). |

## `skills` — section 03
`primary` and `secondary` are lists of groups `{ title, note, items }`.
`primary` groups are the main grid; `secondary` groups are the smaller "ALSO"
block. `note` is an optional sentence under the group title (leave `""` for
none; only shown for primary groups). `items` are the chips. The section counter
(`/07`) is the total number of groups. Also exported as `PUBLIC_SKILLS`, which
the recruiter/CV pages reuse (they pick the `Spoken` group by title, so keep
that title if you rename groups).

## `contact` — footer (shown on every page)
| key | what it is |
|---|---|
| `eyebrow` | Small label (`04 / CONTACT`). |
| `title` | Big heading. Written as `LET'S_TALK`: the text is split on the first `_`, and the underscore is rendered in the accent colour. Without an underscore it renders plainly. |
| `copy` | Paragraph under the heading. |
| `cta` | Label of the red "Email me" button. |
| `mailSubject` | Subject of that mailto (` — Emir Ceylan` is appended). |
| `mailBody` | Pre-filled body of the email. Use `\n` for line breaks. |

## `now` — the `/now` page
| key | what it is |
|---|---|
| `updated` | ISO date `YYYY-MM-DD`. Shown in the "LAST UPDATED" pill and used in the page description. Bump it whenever anything in `now` changes. Exported as `NOW_UPDATED`. |
| `location` | City. Rendered as `"<location>, Türkiye."` as the first line of the Where panel. |
| `intro` | Paragraph under the heading. |
| `status` | Flat list of sentences, split **positionally** into panels: `status[0]` = Where (after the location line), `status[1]` = Work, `status[2]` = Learning, `status[3…]` = Research (any number of lines). Keep at least 4 entries. |
| `offScreen` | List of hobbies; rendered joined with `, ` plus a trailing `.` in the Off-screen panel. |
| `outro` | Closing line. The phrase `email me` inside it becomes the mailto link (subject `Work — Emir Ceylan`). |

The whole `now` object is exported as `NOW`.
