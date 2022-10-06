import { FactoryProvider, Provider } from '@nestjs/common';
import { Actions, ActionsAppContext } from '@kinetic-io/actions-express';
import { AppService } from './app.service';

export const ActionsProvider: FactoryProvider<Actions> = {
  provide: 'ACTIONS',
  inject: [AppService],
  useFactory: (appService: AppService) => {
    return {
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
                  return 'Name must be at least 3 characters';
                }
                return true;
              },
            }),
            email: io.input.text({
              label: 'Email',
              helperText: 'Enter the email of the user',
              type: 'email',
              validation: (value) => {
                if (value.length < 3) {
                  return 'Email must be at least 3 characters';
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

          await appService.createUser({ name, email, password });
        },
      },
      delete_user: {
        title: 'Delete User',
        description: 'Delete a user',
        icon: 'fa6-solid:user-minus',
        execute: async (io) => {
          const user = await io.select.dropdown({
            label: 'Select a user',
            data: appService.users,
            getLabel: (u) => `${u.name} (${u.email})`,
            getValue: (u) => u.email,
          });

          await appService.deleteUser({ email: user.email });
        },
      },
    };
  },
};

export const ActionsAppContextProvider: Provider<ActionsAppContext> = {
  provide: 'ACTIONS_APP_CONTEXT',
  useValue: {
    auth: {
      verifyLogin: async () => {
        return {
          id: '123',
          email: 'user@kinetic-io.com',
        };
      },
      getUserById: async ({ id }) => {
        return {
          id: '123',
          email: 'user@kinetic-io.com',
        };
      },
    },
  },
};

function sleep(ms = 2000) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
