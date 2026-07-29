### Jason Porta - 7/28/2026
# NOTES.md 

## Production Readiness
- Native drag and drop won't work with a touchscreen.
- Drag and drop alone is not accessible. It would need keyboard controls or maybe a simple dropdown menu.
- The `saveBoard` function in storage.ts doesn't do anything with its caught error. If localStorage fails there's no feedback.
- The date picker is kind of beefy. It could be lazy loaded or swapped for the native date picker.
- The current list of tasks is fine for a demo but using a virtualized window (maybe with Virtuoso) would be better for rendering a lot of tasks.
- I added a functionality to add columns. The columns would also need to support rearranging.
- Since this is using localStorage and there is no storage event listener. If you make changes from two different tabs, weird things happen, like when editing a task in one tab after deleting it in another tab. 

## Scale
- Use i18n to handle all strings for localization.
- Consider time zones when adding time stamps by using UTC with dayjs.
- Reduce bundle size as much as possible (notably by using a different date picker).
- Pub sub or polling can be used to check for changes if this was a collaborative board.

## Debugging
- If it was reported that an endpoint was being called too many times, I'd search the codebase for the function name if I know it (if not, I'd search for the endpoint and work my way up). Then I'd navigate to that part of the app and watch the network tab. Causes could be from a call being performed when a component mounts. I would check if there are any useEffects, if there's a search function that doesn't have a debounce, if a library like Tanstack is being used it could be that refetchOnWindowFocus is enabled or maybe the staleTime needs to be set.

## Design Decisions
- I went with a kanban style board because it's what I'm used to. I would have preferred to allow dragging the whole card instead of using an anchor, I'd like for the columns to be rearrangeable, I would clean up the card layout a bit so it just looks tighter and more professional, I would show some kind of indication if a task has past its due date, and I would just improve on the overall design using colors and nicer fonts.