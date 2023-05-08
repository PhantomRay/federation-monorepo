import { Query, Resolver, Parent, ResolveField, Args, ID } from '@nestjs/graphql';

import { PostService } from './post.service';
import { Post } from './posts.interfaces';

@Resolver('Post')
export class PostsResolver {
  constructor(private postsService: PostService) {}

  @Query('findPost')
  findPost(@Args({ name: 'id', type: () => ID }) id: number) {
    return this.postsService.findOne(id);
  }

  @Query('getPosts')
  getPosts() {
    return this.postsService.findAll();
  }

  @ResolveField('user')
  getUser(@Parent() post: Post) {
    return { __typename: 'User', id: post.authorId };
  }
}
