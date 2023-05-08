import { Injectable } from '@nestjs/common';

@Injectable()
export class UserService {
  private users = [
    { id: 1, name: 'John Doe' },
    { id: 2, name: 'Richard Roe' }
  ];

  findById(id: number) {
    return this.users.find((user) => user.id === Number(id));
  }

  findAll() {
    return this.users;
  }

  update(id: number, data: any) {
    const user = this.findById(id);
    if (!user) {
      return null;
    }
    Object.assign(user, data);
    return user;
  }
}
