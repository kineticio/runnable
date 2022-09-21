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
        icon: 'fa:user-plus',
        execute: async (io) => {
          const name = await io.input.text({
            label: 'Name',
            helperText: 'Enter the name of the user',
            type: 'text',
          });
          const email = await io.input.text({
            label: 'Email',
            helperText: 'Enter the email of the user',
            type: 'email',
          });
          const password = await io.input.text({
            label: 'Password',
            helperText: 'Enter the password of the user',
            type: 'password',
          });

          await appService.createUser({ name, email, password });
        },
      },
      delete_user: {
        title: 'Delete User',
        description: 'Delete a user',
        icon: 'fa:user-minus',
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
