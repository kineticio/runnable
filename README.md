<p align="center">
  <a href="https://getrunnable.com" target="_blank" rel="noopener noreferrer">
    <img width="180" src="https://getrunnable.com/logo_transparent.png" alt="Runnable logo">
  </a>
</p>
<h1 align="center">
Runnable
</h1>
<p align="center">
Build internal workflows with ease
<p>

<hr/>

- 💻 Leverage your internal models/db/services without having to expose them via REST/GraphQL
- 🚷 Keep internal operations...internal
- 🛠️ No more coding UIs for admin tools
- 〰️ Build complex workflows with conditionals and loops
- 📦 Works with Nest.js and Express
- ⭐️ Looks great out of the box

**Runnable** is a framework for building user-facing internal workflows and applications. It's built on top of Remix to allow you to build workflows without UI code and a developer experience that allows you to only write server code. Using the `io` object, you can prompt the users at any point in the workflow.

<table border="0">
<tr>
<td>

![Runnable](https://github.com/kineticio/runnable/blob/main/assets/assign_user_to_team.gif)

</td>

<td style="width: 50%">

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

</td>
</tr>
</table>

[Read the Docs to Learn More](https://getrunnable.com/).

## License

MIT
