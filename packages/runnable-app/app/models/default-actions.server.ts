import type { Actions } from '~/api/actions';

export const DEFAULT_ACTIONS: Actions = {
  create_user: {
    title: 'Create User',
    description: 'Create a new user',
    icon: 'fa6-solid:user-plus',
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
        getColumns: (r) => [r, level[r.length % level.length]],
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

      console.log('Created user', {
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
    title: 'Kitchen Sink Inputs',
    description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed euismod, nisl vel ultricies',
    icon: 'fa6-solid:utensils',
    execute: async (io, context) => {
      const data = await io.form({
        text: io.input.text({ label: 'Text' }),
        number: io.input.number({ label: 'Number' }),
        select: io.select.radio({
          label: 'Select',
          data: ['One', 'Two', 'Three'],
          getLabel: (r) => r,
          getValue: (r) => r,
        }),
        checkbox: io.input.boolean({ label: 'Checkbox' }),
        color: io.input.color({ label: 'Color' }),
        multiCheckbox: io.multiSelect.checkbox({
          label: 'Multi Checkbox',
          data: ['Red', 'Green', 'Blue'],
          getLabel: (r) => r,
          getValue: (r) => r,
        }),
      });

      await io.message.info({
        title: 'Data',
        description: JSON.stringify(data, null, 2),
      });

      await io.message.info({
        title: 'User',
        description: JSON.stringify(context.user, null, 2),
      });

      await io.message.html({
        dangerouslySetInnerHTML: `<pre style="text-align: left;">${JSON.stringify(data, null, 2)}</pre>`,
      });

      await io.message.table({
        title: 'Data',
        rows: Object.entries(data).map(([key, value]) => [key, JSON.stringify(value)]),
        headers: ['Key', 'Value'],
      });

      console.log('data', data);
    },
  },
};

function sleep(ms = 10) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
