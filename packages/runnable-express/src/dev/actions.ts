import type { RunnableWorkflows } from '@runnablejs/sdk';

const logger = {
  // eslint-disable-next-line no-console
  info: (message: string, ...args: any[]) => console.log(message, ...args),
};

export const DEFAULT_WORKFLOWS: RunnableWorkflows = {
  assign_user_to_team: {
    title: 'Assign a user to a team',
    description: 'Assign a user to a new team',
    icon: 'fa6-solid:users',
    category: 'Users',
    execute: async (io) => {
      const users = await getUsers();
      const user = await io.select.table({
        label: 'Select a user',
        data: users,
        headers: ['Full Name', 'Email'],
        getValue: (user) => user.id,
        getColumns: (user) => [user.name, user.email],
      });

      const teams = await getTeams();
      const team = await io.select.table({
        label: 'Select a team',
        data: teams,
        headers: ['Name', 'Manager'],
        getValue: (team) => team.id,
        getColumns: (team) => [team.name, team.manager],
      });

      await assignTeam(user.id, team.id);

      await io.message.success({
        title: 'Success',
        message: `User ${user.name} was assigned to the ${team.name} team.`,
      });
    },
  },
  create_user: {
    title: 'Create User',
    description: 'Create a new user',
    icon: 'fa6-solid:user-plus',
    category: 'Users',
    execute: async (io) => {
      const { name, email } = await io.form({
        name: io.input.text({
          label: 'Name',
          helperText: 'Enter the name of the user',
          type: 'text',
          validation: (value) => {
            if (value.length < 3) {
              return 'Name must be at least 3 characters. Got: ' + value.length;
            }
            return true;
          },
        }),
        email: io.input.text({
          label: 'Email',
          helperText: 'Enter the email of the user',
          type: 'email',
          validation: (value) => {
            if (value.length < 5) {
              return 'Email must be at least 5 characters. Got: ' + value.length;
            }
            return true;
          },
        }),
      });

      await sleep();

      const roles = await io.multiSelect.dropdown({
        label: 'Roles',
        helperText: 'Select roles to assign to user',
        data: ['Admin', 'Designer', 'Engineer', 'Manager', 'Agent'],
        getLabel: (r) => r,
        getValue: (r) => r,
      });

      await sleep();

      const team = await io.select.table({
        label: 'Select a team',
        helperText: 'Select a team',
        data: ['Product', 'HR', 'Business', 'Sales', 'Marketing'],
        headers: ['Team', 'Employee count'],
        getColumns: (r) => [r, r.length.toString()],
        getValue: (r) => r,
      });

      await sleep();

      const level = ['Junior', 'Mid', 'Senior'];
      const otherTeams = await io.multiSelect.table({
        label: 'Select teammates',
        data: ['Michael', 'Dwight', 'Jim', 'Pam', 'Angela', 'Oscar'],
        headers: ['Name', 'Level'],
        initialSelection: ['Michael'],
        getColumns: (r) => [r, level[r.length % level.length] ?? null],
        getValue: (r) => r,
      });

      await sleep();

      const password = await io.input.text({
        label: 'Password',
        helperText: 'Enter the password of the user',
        type: 'password',
        validation: (value) => {
          if (value.length < 3) {
            return 'Password must be at least 3 characters';
          }
          return true;
        },
      });

      await sleep();

      logger.info('Created user', {
        name,
        email,
        password,
        roles,
        team,
        otherTeams,
      });
    },
  },
  kitchen_sink_inputs: {
    title: 'Kitchen Sink',
    category: 'Inputs',
    description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed euismod, nisl vel ultricies',
    icon: 'fa6-solid:utensils',
    execute: async (io, context) => {
      const data = await io.form({
        text: io.input.text({ label: 'Text', optional: true }),
        number: io.input.number({ label: 'Number' }),
        select: io.select.radio({
          label: 'Select radio',
          data: ['One', 'Two', 'Three'],
          initialSelection: 'Two',
          getLabel: (r) => r,
          getValue: (r) => r,
        }),
        dropdown: io.select.dropdown({
          label: 'Select dropdown',
          data: ['Red', 'Green', 'Blue'],
          initialSelection: 'Green',
          getLabel: (r) => r,
          getValue: (r) => r,
        }),
        multiSelect: io.multiSelect.dropdown({
          label: 'Multi Select dropdown',
          data: ['Red', 'Green', 'Blue'],
          initialSelection: ['Green', 'Blue'],
          getLabel: (r) => r,
          getValue: (r) => r,
        }),
        checkbox: io.input.boolean({ label: 'Checkbox' }),
        color: io.input.color({ label: 'Color' }),
        multiCheckbox: io.multiSelect.checkbox({
          label: 'Multi Checkbox',
          data: ['Red', 'Green', 'Blue'],
          initialSelection: ['Red', 'Blue'],
          getLabel: (r) => r,
          getValue: (r) => r,
        }),
      });

      const data2 = await io.hstack(
        io.vstack(io.input.text({ label: 'Text', optional: true }), io.input.number({ label: 'Number' })),
        io.input.boolean({ label: 'Checkbox' })
      );

      const response = await io.hstack(
        io.message.info({
          title: 'Data 1',
          message: JSON.stringify(data, null, 2),
        }),
        io.message.info({
          title: 'Data 2',
          message: JSON.stringify(data2, null, 2),
        }),
        io.input.boolean({ label: 'Should continue', defaultValue: true })
      );
      const shouldContinue = response[2];
      if (!shouldContinue) {
        return;
      }

      await io.message.success({
        title: 'User',
        message: JSON.stringify(context.user, null, 2),
      });

      await io.message.warning({
        title: 'User',
        message: JSON.stringify(context.user, null, 2),
      });

      await io.message.html({
        dangerouslySetInnerHTML: `<pre style="text-align: left;">${JSON.stringify(data, null, 2)}</pre>`,
      });

      await io.message.table({
        title: 'Data',
        rows: Object.entries(data).map(([key, value]) => [
          key,
          JSON.stringify(value),
          new Date().toString(),
          { $type: 'link', href: 'https://google.com', text: 'Google' },
          { $type: 'image', src: 'https://picsum.photos/200/300', alt: 'Random image' },
          'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed euismod, nisl vel ultricies'.repeat(2),
          123_456_789,
          null,
          true,
          false,
        ]) as any,
        headers: ['Key', 'Value', 'Date', 'Link', 'Image', 'Lorem', 'Number', 'Null', 'True', 'False'],
      });

      logger.info('data', data);
    },
  },
};

function sleep(ms = 10) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getUsers() {
  return [
    {
      id: '1',
      name: 'Michael Scott',
      email: 'michael@dundermifflin.com',
    },
    {
      id: '2',
      name: 'Dwight Schrute',
      email: 'dwight@dundermifflin.com',
    },
    {
      id: '3',
      name: 'Jim Halpert',
      email: 'jim@dundermifflin.com',
    },
  ];
}

function getTeams() {
  return [
    {
      id: '1',
      name: 'Accounting',
      manager: 'Oscar Martinez',
      members: 5,
    },
    {
      id: '2',
      name: 'HR',
      manager: 'Toby Flenderson',
      members: 3,
    },
    {
      id: '3',
      name: 'Sales',
      manager: 'Jim Halpert',
      members: 2,
    },
  ];
}

async function assignTeam(userId: string, teamId: string) {
  logger.info('assignTeam', userId, teamId);
}
