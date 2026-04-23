import {CallHandler, ExecutionContext, Injectable, NestInterceptor} from '@nestjs/common';
import {map} from 'rxjs/operators';
import {Observable} from 'rxjs';

function serializeBigIntValue(value: unknown): unknown {
  if (typeof value === 'bigint') {
    return value.toString();
  }

  if (Array.isArray(value)) {
    return value.map(serializeBigIntValue);
  }

  if (value !== null && typeof value === 'object') {
    if (value instanceof Date) {
      return value;
    }

    return Object.fromEntries(
      (Object.entries(value as Record<string, unknown>) as [string, unknown][]).map(
        ([key, val]) => [key, serializeBigIntValue(val)],
      ),
    );
  }

  return value;
}

@Injectable()
export class TransformInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    return next.handle().pipe(
      map((data: unknown) => {
        try {
          console.log('[TransformInterceptor] response data:', data);
          const serialized = serializeBigIntValue(data);
          console.log('[TransformInterceptor] response serialized:', serialized);
          const serializedMeta =
            serialized && typeof serialized === 'object'
              ? (serialized as {meta?: unknown}).meta
              : undefined;
          return {
            success: true,
            statusCode: context.switchToHttp().getResponse().statusCode || 200,
            message: 'Operation successful',
            data: serialized,
            meta: serializedMeta !== undefined ? serializedMeta : undefined,
          };
        } catch (err) {
          console.error('[TransformInterceptor] serialization error:', err);
          throw err;
        }
      }),
    );
  }
}
