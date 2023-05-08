// import { UseGuards } from '@nestjs/common';
import { ID, Args, Query, ResolveReference, Resolver } from '@nestjs/graphql';

import { UserService } from './services/user';

// import { GqlAuthGuard } from '../auth/gql.auth.guard';

@Resolver('User')
export class UsersResolver {
  constructor(private usersService: UserService) {}

  @Query('getUser')
  getUser(@Args({ name: 'id', type: () => ID }) id: number) {
    return this.usersService.findById(id);
  }

  @Query('getUsers')
  users() {
    return this.usersService.findAll();
  }

  @ResolveReference()
  resolveReference(reference: { __typename: string; id: number }) {
    return this.usersService.findById(reference.id);
  }
}
