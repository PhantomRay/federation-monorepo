import { Parent, ResolveField, Resolver } from '@nestjs/graphql';

import { PostService } from './post.service';
import { User } from './users.interfaces';

@Resolver('User')
export class UsersResolver {
  constructor(private readonly postsService: PostService) {}

  @ResolveField('posts')
  public posts(@Parent() user: User) {
    return this.postsService.findOneByAuthorId(user.id);
  }
}
