# Git hooks

Managed by [husky](https://typicode.github.io/husky/). They install themselves when you run
`npm install` — the `prepare` script in `package.json` does it.

| Hook | What it does |
| --- | --- |
| `commit-msg` | Strips AI attribution — `Co-Authored-By: Claude …`, `Generated with Claude Code`, and any anthropic.com co-author trailer — from the commit message before the commit is written. |

The hook edits the message rather than rejecting it, so a commit never fails because of this.

Local hooks can be bypassed with `--no-verify`, so the same rules are also enforced in CI by
[`no-ai-attribution.yml`](../.github/workflows/no-ai-attribution.yml), which checks every commit
in a pull request plus the pull request title and description.

## Testing the hook

```bash
echo "test: a commit

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>" > /tmp/msg
.husky/commit-msg /tmp/msg
cat /tmp/msg    # the trailer is gone
```
