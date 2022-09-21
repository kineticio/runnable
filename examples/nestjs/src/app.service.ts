import { Injectable } from '@nestjs/common';

interface User {
  email: string;
  name: string;
}

@Injectable()
export class AppService {
  public users: User[] = [];

  getHello(): string {
    return 'Hello World!';
  }

  async createUser(payload: { name: string; email: string; password: string }): Promise<void> {
    console.log('Creating user...');
    // Create user...
    this.users.push({ email: payload.email, name: payload.name });
    console.log(`User created: ${payload.name}`);
  }

  async deleteUser(payload: { email: string }): Promise<void> {
    const hasUser = this.users.some((user) => user.email === payload.email);
    if (!hasUser) {
      throw new Error(`User with email ${payload.email} not found`);
    }

    console.log('Deleting user...');
    // Delete user...
    this.users = this.users.filter((user) => user.email !== payload.email);
    console.log(`User deleted: ${payload.email}`);
  }
}
