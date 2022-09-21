import type { Actions } from '~/api/actions';

export const DEFAULT_ACTIONS: Actions = {
  create_user: {
    title: 'Create User',
    description: 'Create a new user',
    icon: 'fa:user-plus',
    execute: async (io, context) => {
      const name = await io.input.text({
        label: 'Name',
        helperText: 'Enter the name of the user',
        type: 'text',
        validation: (value) => {
          if (value.length < 3) {
            return 'Name must be at least 3 characters';
          }
          return true;
        },
      });
      const email = await io.input.text({
        label: 'Email',
        helperText: 'Enter the email of the user',
        type: 'email',
        validation: (value) => {
          if (value.length < 3) {
            return 'Email must be at least 3 characters';
          }
          return true;
        },
      });
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

      console.log('Create user', {
        name,
        email,
        password,
      });
    },
  },
};
