import type { RunnableWorkflows } from '@runnablejs/hono';

// Simple in-memory storage for the example
const users: Array<{ id: string; name: string; email: string; team?: string }> = [
  { id: '1', name: 'Michael Scott', email: 'michael@dundermifflin.com', team: 'Management' },
  { id: '2', name: 'Dwight Schrute', email: 'dwight@dundermifflin.com', team: 'Sales' },
  { id: '3', name: 'Jim Halpert', email: 'jim@dundermifflin.com', team: 'Sales' },
];

export const workflows: RunnableWorkflows = {
  create_user: {
    title: 'Create User',
    description: 'Create a new user in the system',
    icon: 'fa6-solid:user-plus',
    category: 'Users',
    execute: async (io) => {
      const { name, email } = await io.form({
        name: io.input.text({
          label: 'Full Name',
          helperText: 'Enter the full name of the user',
          type: 'text',
          validation: (value) => {
            if (value.length < 3) {
              return 'Name must be at least 3 characters';
            }
            return true;
          },
        }),
        email: io.input.text({
          label: 'Email Address',
          helperText: 'Enter the email address',
          type: 'email',
          validation: (value) => {
            if (!value.includes('@')) {
              return 'Please enter a valid email address';
            }
            return true;
          },
        }),
      });

      const roles = await io.multiSelect.dropdown({
        label: 'Roles',
        helperText: 'Select one or more roles for this user',
        data: ['Admin', 'Designer', 'Engineer', 'Manager', 'Sales'],
        getLabel: (r) => r,
        getValue: (r) => r,
      });

      const team = await io.select.dropdown({
        label: 'Team',
        helperText: 'Select the primary team',
        data: ['Engineering', 'Sales', 'Marketing', 'HR', 'Management'],
        getLabel: (t) => t,
        getValue: (t) => t,
      });

      // Create the user
      const newUser = {
        id: String(users.length + 1),
        name,
        email,
        team,
      };
      users.push(newUser);

      await io.message.success({
        title: 'User Created',
        message: `Successfully created user ${name} with roles: ${roles.join(', ')}`,
      });
    },
  },

  view_users: {
    title: 'View All Users',
    description: 'View a list of all users in the system',
    icon: 'fa6-solid:users',
    category: 'Users',
    execute: async (io) => {
      if (users.length === 0) {
        await io.message.warning({
          title: 'No Users',
          message: 'There are no users in the system yet.',
        });
        return;
      }

      await io.message.table({
        title: 'All Users',
        headers: ['ID', 'Name', 'Email', 'Team'],
        rows: users.map((u) => [u.id, u.name, u.email, u.team || 'N/A']),
      });
    },
  },

  delete_user: {
    title: 'Delete User',
    description: 'Remove a user from the system',
    icon: 'fa6-solid:user-minus',
    category: 'Users',
    execute: async (io) => {
      if (users.length === 0) {
        await io.message.warning({
          title: 'No Users',
          message: 'There are no users to delete.',
        });
        return;
      }

      const selectedUser = await io.select.table({
        label: 'Select a user to delete',
        data: users,
        headers: ['Name', 'Email', 'Team'],
        getColumns: (u) => [u.name, u.email, u.team || 'N/A'],
        getValue: (u) => u.id,
      });

      const confirm = await io.input.boolean({
        label: `Are you sure you want to delete ${selectedUser.name}?`,
        defaultValue: false,
      });

      if (!confirm) {
        await io.message.info({
          title: 'Cancelled',
          message: 'User deletion was cancelled.',
        });
        return;
      }

      // Delete the user
      const index = users.findIndex((u) => u.id === selectedUser.id);
      if (index !== -1) {
        users.splice(index, 1);
      }

      await io.message.success({
        title: 'User Deleted',
        message: `Successfully deleted ${selectedUser.name}`,
      });
    },
  },

  assign_team: {
    title: 'Assign User to Team',
    description: 'Reassign a user to a different team',
    icon: 'fa6-solid:people-arrows',
    category: 'Teams',
    execute: async (io) => {
      if (users.length === 0) {
        await io.message.warning({
          title: 'No Users',
          message: 'There are no users in the system.',
        });
        return;
      }

      const user = await io.select.dropdown({
        label: 'Select User',
        data: users,
        getLabel: (u) => `${u.name} (${u.email})`,
        getValue: (u) => u.id,
      });

      const newTeam = await io.select.radio({
        label: 'Select New Team',
        data: ['Engineering', 'Sales', 'Marketing', 'HR', 'Management'],
        getLabel: (t) => t,
        getValue: (t) => t,
      });

      // Update the user's team
      const userToUpdate = users.find((u) => u.id === user.id);
      if (userToUpdate) {
        const oldTeam = userToUpdate.team || 'N/A';
        userToUpdate.team = newTeam;

        await io.message.success({
          title: 'Team Assignment Updated',
          message: `${user.name} has been moved from ${oldTeam} to ${newTeam}`,
        });
      }
    },
  },

  input_showcase: {
    title: 'Input Components Showcase',
    description: 'Demonstrates all available input components',
    icon: 'fa6-solid:palette',
    category: 'Examples',
    execute: async (io) => {
      const data = await io.form({
        text: io.input.text({
          label: 'Text Input',
          helperText: 'This is a text input',
          optional: true,
        }),
        number: io.input.number({
          label: 'Number Input',
          helperText: 'Enter a number',
        }),
        boolean: io.input.boolean({
          label: 'Boolean Checkbox',
          defaultValue: false,
        }),
        color: io.input.color({
          label: 'Color Picker',
        }),
        radio: io.select.radio({
          label: 'Radio Select',
          data: ['Option 1', 'Option 2', 'Option 3'],
          getLabel: (o) => o,
          getValue: (o) => o,
        }),
        dropdown: io.select.dropdown({
          label: 'Dropdown Select',
          data: ['Red', 'Green', 'Blue'],
          getLabel: (c) => c,
          getValue: (c) => c,
        }),
        multiSelect: io.multiSelect.dropdown({
          label: 'Multi-Select Dropdown',
          data: ['Apple', 'Banana', 'Cherry', 'Date'],
          getLabel: (f) => f,
          getValue: (f) => f,
        }),
      });

      await io.message.html({
        dangerouslySetInnerHTML: `
          <div style="text-align: left;">
            <h3>Form Data Submitted:</h3>
            <pre>${JSON.stringify(data, null, 2)}</pre>
          </div>
        `,
      });
    },
  },
};
