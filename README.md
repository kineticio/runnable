<p align="center">
  <a href="https://getrunnable.com" target="_blank" rel="noopener noreferrer">
    <img width="180" src="https://getrunnable.com/logo_transparent.png" alt="Runnable logo">
  </a>
</p>
<h1 align="center">
Runnable
</h1>
<p align="center">
Build internal applications with ease
<p>

<hr/>

- 🛠️ No coding UIs
- 📦 Works with Nest.js and Express
- ⭐️ Looks great out of the box

**Runnable** is a framework for building internal applications. It's built on top of Remix to allow you to build internal facing applications with no UI code and a developer experience that allows you to only write server code.

![Runnable](https://github.com/kineticio/runnable/blob/main/assets/assign_user_to_team.gif)

```ts
// index.ts
import { installRunnable } from '@runnablejs/express';
import { getUsers, getTeams, assignTeam } from './db';

// ... normal express setup

installRunnable(app, {
  assign_user_to_team: {
    title: 'Assign a user to a team',
    execute: async (io) => {
      const users = await getUsers();
      const user = await io.select.dropdown({
        title: 'Select a user',
        data: users,
      });

      const teams = await getTeams();
      const team = await io.select.table({
        title: 'Select team',
        data: teams,
        initialSelection: user.teamId,
      });

      await assignTeam(user.id, team.id);
    },
  },
});

app.listen(3000);
```

[Read the Docs to Learn More](https://getrunnable.com/).

## License

MIT
