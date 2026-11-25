import { DynamicModule, Module, Provider } from '@nestjs/common';

import { DocumentClientOptions } from '../types';

import { DOCUMENT_CLIENT_OPTIONS } from './document-client.constants';
import { DocumentClientService } from './document-client.service';

export interface DocumentClientModuleOptions extends DocumentClientOptions {
  isGlobal?: boolean;
}

@Module({})
export class DocumentClientModule {
  static forRoot(options: DocumentClientModuleOptions): DynamicModule {
    const { isGlobal, ...clientOptions } = options;
    return this.createDynamicModule(clientOptions, Boolean(isGlobal));
  }

  static forRootAsync(options: {
    isGlobal?: boolean;
    useFactory: (
      ...args: unknown[]
    ) => DocumentClientOptions | Promise<DocumentClientOptions>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    inject?: any[];
  }): DynamicModule {
    const providers: Provider[] = [
      {
        provide: DOCUMENT_CLIENT_OPTIONS,
        useFactory: options.useFactory,
        inject: options.inject ?? [],
      },
      DocumentClientService,
    ];

    const module: DynamicModule = {
      module: DocumentClientModule,
      providers,
      exports: [DocumentClientService, DOCUMENT_CLIENT_OPTIONS],
    };

    if (options.isGlobal) {
      return { ...module, global: true };
    }
    return module;
  }

  private static createDynamicModule(
    clientOptions: DocumentClientOptions,
    isGlobal: boolean,
  ): DynamicModule {
    const module: DynamicModule = {
      module: DocumentClientModule,
      providers: [
        {
          provide: DOCUMENT_CLIENT_OPTIONS,
          useValue: clientOptions,
        },
        DocumentClientService,
      ],
      exports: [DocumentClientService, DOCUMENT_CLIENT_OPTIONS],
    };

    if (isGlobal) {
      return { ...module, global: true };
    }
    return module;
  }
}