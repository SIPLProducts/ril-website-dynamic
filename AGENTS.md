<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Website architecture
- Keep the target TanStack bootstrap and pinned dependencies; import site pages, shared site components, and static content modules from the supplied website to preserve its experience without replacing runtime infrastructure.
- Store imported binary media as Lovable asset pointers; keep the favicon as a real public file so browser icons resolve.
