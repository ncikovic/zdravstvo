import type { UserStatus } from '@zdravstvo/contracts';

import type { DatabaseExecutor } from '../shared/db/index.js';
import { bufferToUuid, uuidToBuffer } from '../shared/utils/index.js';
import type { UserRecord } from '../types/entities/index.js';

interface UserRow {
  id: Buffer;
  email: string | null;
  phone: string | null;
  password_hash: string | null;
  status: UserStatus;
}

const mapUserRecord = (row: UserRow): UserRecord => {
  return {
    id: bufferToUuid(row.id),
    email: row.email,
    phone: row.phone,
    passwordHash: row.password_hash,
    status: row.status,
  };
};

export class UsersRepository {
  public constructor(private readonly executor: DatabaseExecutor) {}

  public async findById(userId: string): Promise<UserRecord | null> {
    const row = await this.executor<UserRow>('users')
      .select('id', 'email', 'phone', 'password_hash', 'status')
      .where({ id: uuidToBuffer(userId) })
      .first();

    return row ? mapUserRecord(row) : null;
  }

  public async findByEmailOrPhone(identifier: string): Promise<UserRecord | null> {
    const row = await this.executor<UserRow>('users')
      .select('id', 'email', 'phone', 'password_hash', 'status')
      .where({ email: identifier })
      .orWhere({ phone: identifier })
      .first();

    return row ? mapUserRecord(row) : null;
  }
}
