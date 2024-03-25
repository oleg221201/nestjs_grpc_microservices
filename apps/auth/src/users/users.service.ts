import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import {
  User,
  CreateUserDto,
  UpdateUserDto,
  Users,
  PaginationDto,
} from '@app/common';
import { randomUUID } from 'crypto';
import { Observable, Subject } from 'rxjs';

@Injectable()
export class UsersService implements OnModuleInit {
  onModuleInit() {
    for (let i = 0; i <= 100; i++) {
      this.create({
        username: `user_${i}`,
        password: randomUUID(),
        age: 0,
      });
    }
  }
  private readonly users: User[] = [];

  create(createUserDto: CreateUserDto): User {
    const user: User = {
      ...createUserDto,
      subscribed: false,
      socialMedia: {},
      id: randomUUID(),
    };

    this.users.push(user);

    return user;
  }

  findAll(): Users {
    return { users: this.users };
  }

  findOne(id: string): User {
    return this.users.find((user) => user.id === id);
  }

  update(id: string, updateUserDto: UpdateUserDto): User {
    const index = this.users.findIndex((user) => user.id === id);

    if (index !== -1) {
      this.users[index] = {
        ...this.users[index],
        ...updateUserDto,
      };

      return this.users[index];
    }

    throw new NotFoundException('User not found by this id');
  }

  remove(id: string) {
    const index = this.users.findIndex((user) => user.id === id);

    if (index !== -1) {
      return this.users.splice(index, 1)[0];

      return this.users[index];
    }
  }

  queryUsers(
    paginationDtoStream: Observable<PaginationDto>,
  ): Observable<Users> {
    const subject = new Subject<Users>();

    const onNext = (paginationDto: PaginationDto) => {
      const start = paginationDto.page * paginationDto.skip;

      subject.next({
        users: this.users.slice(start, start + paginationDto.skip),
      });
    };

    const onComplete = () => subject.complete();

    paginationDtoStream.subscribe({
      next: onNext,
      complete: onComplete,
    });

    return subject.asObservable();
  }
}
