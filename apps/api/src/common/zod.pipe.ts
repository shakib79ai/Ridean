import { BadRequestException, PipeTransform } from '@nestjs/common';
import type { ZodType } from 'zod';

/** Validates and parses a request body / query with a zod schema. */
export class ZodPipe<T> implements PipeTransform<unknown, T> {
  constructor(private readonly schema: ZodType<T>) {}
  transform(value: unknown): T {
    const r = this.schema.safeParse(value);
    if (!r.success) {
      throw new BadRequestException({
        message: r.error.issues.map((i) => `${i.path.join('.') || 'body'}: ${i.message}`),
        error: 'Validation failed',
      });
    }
    return r.data;
  }
}
