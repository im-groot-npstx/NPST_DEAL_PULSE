import { Inject, Injectable } from '@nestjs/common';

import { DocumentClient } from '../document-client';
import { DocumentClientOptions } from '../types';

import { DOCUMENT_CLIENT_OPTIONS } from './document-client.constants';

@Injectable()
export class DocumentClientService extends DocumentClient {
  constructor(@Inject(DOCUMENT_CLIENT_OPTIONS) options: DocumentClientOptions) {
    super(options);
  }
}